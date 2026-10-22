#!/usr/bin/env bun
// Screen-reader verification: NVDA reading a headed ctl.ts run, with real keys and a record of what it said.
// Usage: bun .agents/skills/verify-odd-design/scripts/sr.ts <command> [args] [--run NAME]
// Run `sr.ts help` for the command list. Windows only (NVDA, user32 SendInput, WASAPI loopback).
import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Pointer } from "bun:ffi";
import { findWindow, focusWindow, isForeground, KEY_NAMES, pressChord, windowRect } from "./win.ts";

const ROOT = resolve(import.meta.dir, "../../../..");
const SCRIPTS = import.meta.dir;
const argv = process.argv.slice(2);
const flag = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const value = argv[i + 1];
  argv.splice(i, 2);
  return value;
};
const RUN = flag("run") ?? process.env.VERIFY_RUN ?? "default";
const RUN_DIR = join(ROOT, ".verify", "runs", RUN);
const EVIDENCE_DIR = join(ROOT, ".verify", "evidence", RUN, "sr");
const SR_FILE = join(RUN_DIR, "sr.json");
const NVDA_EXE = process.env.NVDA_PATH ?? "C:\\Program Files\\NVDA\\nvda.exe";
const FFMPEG = process.env.FFMPEG_PATH ?? "ffmpeg";
const CTL = join(SCRIPTS, "ctl.ts");

type Ev = { t: number; kind: string; text?: string; name?: string; role?: string; states?: string[]; app?: string; hz?: number; ms?: number; file?: string; [k: string]: unknown };
type Sr = { nvdaPid: number; config: string; events: string; settings: Ev };
type Step = string | { keys: string; note?: string; wait?: number } | { focus: string; text?: string; note?: string } | { wait: number };
export type Scenario = { title: string; why: string; story: string; globals?: string; steps: Step[] };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fail = (msg: string): never => {
  console.error(`error: ${msg}`);
  process.exit(1);
};
const log = (line: string) => {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  appendFileSync(join(EVIDENCE_DIR, "sr.log"), `${line}\n`);
};

const ctlState = () => {
  const file = join(RUN_DIR, "state.json");
  if (!existsSync(file)) fail(`no run "${RUN}". Start a headed one: ctl.ts up --headed --run ${RUN}`);
  const s = JSON.parse(readFileSync(file, "utf8"));
  if (!s.chrome.headed) fail(`run "${RUN}" is headless; NVDA needs a window. Use: ctl.ts up --headed --run <name>`);
  return s as { chrome: { pid: number } };
};
const srState = (): Sr => {
  if (!existsSync(SR_FILE)) fail(`NVDA isn't started for run "${RUN}". Run: sr.ts start --run ${RUN}`);
  return JSON.parse(readFileSync(SR_FILE, "utf8"));
};
const events = (sr: Sr, since = 0): Ev[] =>
  existsSync(sr.events)
    ? readFileSync(sr.events, "utf8")
        .split("\n")
        .filter(Boolean)
        .map((l) => JSON.parse(l) as Ev)
        .filter((e) => e.t >= since)
    : [];
const nvdaPids = () =>
  spawnSync("tasklist", ["/FI", "IMAGENAME eq nvda.exe", "/FO", "CSV", "/NH"], { encoding: "utf8" })
    .stdout.split("\n")
    .map((l) => l.match(/^"nvda\.exe","(\d+)"/i)?.[1])
    .filter(Boolean)
    .map(Number);
// process.kill(pid, 0) can't see NVDA: it runs with UIAccess, so the check fails with EPERM.
const nvdaAlive = (pid: number) => nvdaPids().includes(pid);
const ctl = (...args: string[]) => {
  const r = spawnSync("bun", [CTL, ...args, "--run", RUN], { encoding: "utf8" });
  if (r.status !== 0) fail(`ctl.ts ${args.join(" ")} failed:\n${r.stderr || r.stdout}`);
  return r.stdout;
};

/** Waits for NVDA to report focus in Chrome after `since`, so the next step starts from a page NVDA has loaded. */
async function nvdaFocusInChrome(sr: Sr, since: number, ms = 15_000) {
  const deadline = Date.now() + ms;
  while (!events(sr, since / 1000).some((e) => e.kind === "focus" && /chrome/i.test(e.app ?? ""))) {
    if (Date.now() > deadline) fail(`NVDA didn't report focus in Chrome within ${ms / 1000} s`);
    await sleep(100);
  }
}

const nvdaInChrome = (sr: Sr) => /chrome/i.test(events(sr).findLast((e) => e.kind === "focus")?.app ?? "");

/** The run's Chrome window, in front and tracked by NVDA. Refuses to go on otherwise, so keys never land elsewhere. */
async function chromeWindow(sr: Sr) {
  const hwnd = findWindow(ctlState().chrome.pid) ?? fail("can't find the run's Chrome window");
  if (!focusWindow(hwnd)) fail("couldn't bring Chrome to the front (another window is holding focus)");
  // NVDA doesn't follow a foreground change made through the API (a click doesn't help either, since
  // focus doesn't change), but it does follow a focus change inside the page. Refocus what has focus,
  // so open popovers and other state survive. If nothing has, focus a throwaway element and keep it
  // until NVDA reports it: Chrome drops the focus event of an element removed in the same task.
  if (!nvdaInChrome(sr)) {
    ctl("eval", `(() => {
      const el = document.activeElement;
      if (el && el !== document.body) { el.blur(); el.focus(); return; }
      const tmp = Object.assign(document.createElement("div"), { id: "sr-sync", tabIndex: -1, ariaLabel: "sr.ts sync" });
      document.body.append(tmp);
      tmp.focus();
    })()`);
    const deadline = Date.now() + 5000;
    while (!nvdaInChrome(sr)) {
      if (Date.now() > deadline) fail("NVDA didn't follow focus into Chrome");
      await sleep(100);
    }
    ctl("eval", `document.getElementById("sr-sync")?.remove()`);
  }
  return hwnd;
}

/** Speech with something to hear. NVDA sometimes sends only U+FFFC (an embedded object) or whitespace. */
const audible = (e: Ev) => e.kind === "speech" && !!e.text?.replace(/[\s\ufffc]/g, "");

/**
 * Waits until NVDA has finished reacting to something done at `since`: nothing new for `quiet` ms and
 * the synth done with the last speech. Waits at least `min` ms, since live regions speak late.
 */
async function settle(sr: Sr, since: number, { min = 1500, quiet = 600, max = 20_000 } = {}) {
  for (;;) {
    const evs = events(sr, since / 1000);
    const now = Date.now();
    const last = evs.length ? evs[evs.length - 1]!.t * 1000 : since;
    const lastSpeech = evs.findLastIndex(audible);
    const lastDone = evs.findLastIndex((e) => e.kind === "done" || e.kind === "cancel");
    // The synth doesn't always report done, so a phrase is assumed over after ~100 ms a character.
    const spoken = evs[lastSpeech];
    const speaking = lastSpeech > lastDone && now < spoken!.t * 1000 + spoken!.text!.length * 100 + 2000;
    if (now - since >= min && now - last >= quiet && !speaking) return { evs, timedOut: false };
    if (now - since >= max) return { evs, timedOut: true };
    await sleep(50);
  }
}

/** Speech that was queued but then cancelled before the synth finished: a sign of focus churn or interruptions. */
function phrases(evs: Ev[]) {
  const out: { t: number; text: string; cutOff: boolean }[] = [];
  evs.forEach((e, i) => {
    if (e.kind === "window") out.push({ t: e.t, text: `[window: ${e.app}${e.name ? `, ${e.name}` : ""}]`, cutOff: false });
    if (e.kind === "focus") out.push({ t: e.t, text: `[focus: ${[e.role, e.name, ...(e.states ?? [])].filter(Boolean).join(", ")}]`, cutOff: false });
    if (audible(e)) {
      const next = evs.slice(i + 1).find((x) => x.kind === "done" || x.kind === "cancel");
      out.push({ t: e.t, text: e.text!, cutOff: next?.kind === "cancel" });
    }
    if (e.kind === "beep") out.push({ t: e.t, text: `[beep ${e.hz} Hz]`, cutOff: false });
    if (e.kind === "sound") out.push({ t: e.t, text: `[sound ${e.file}]`, cutOff: false });
  });
  return out;
}

function describe(label: string, evs: Ev[], timedOut: boolean, expectKey: boolean) {
  const lines = [`> ${label}`];
  if (expectKey && !evs.some((e) => e.kind === "key")) lines.push("  (NVDA did not receive the key)");
  const said = phrases(evs);
  for (const p of said) lines.push(`  ${p.text.startsWith("[") ? p.text : JSON.stringify(p.text)}${p.cutOff ? "  (cut off)" : ""}`);
  if (!said.length) lines.push("  (nothing spoken)");
  if (timedOut) lines.push("  (still speaking after 20 s)");
  return lines.join("\n");
}

async function press(sr: Sr, hwnd: Pointer, chord: string, settleOpts = {}) {
  if (!isForeground(hwnd)) fail("Chrome is no longer in front (did someone click elsewhere?). Not sending keys.");
  const since = Date.now();
  pressChord(chord);
  const { evs, timedOut } = await settle(sr, since, settleOpts);
  return { since, evs, timedOut, text: describe(chord, evs, timedOut, true) };
}

// ---------- recording ----------

type Recording = { ffmpeg: ReturnType<typeof spawn>; videoStart: Promise<number>; video: string; wav: string; recorder: ReturnType<typeof spawn> };

function startRecording(hwnd: Pointer, dir: string): Recording {
  const r = windowRect(hwnd);
  const even = (n: number) => n - (n % 2);
  const video = join(dir, "video.mp4");
  const wav = join(dir, "audio.wav");
  const recorder = spawn("bun", [join(SCRIPTS, "loopback.ts"), wav], { stdio: "ignore", windowsHide: true });
  const ffmpeg = spawn(
    FFMPEG,
    ["-hide_banner", "-y", "-f", "gdigrab", "-framerate", "30", "-offset_x", String(r.x), "-offset_y", String(r.y), "-video_size", `${even(r.width)}x${even(r.height)}`, "-draw_mouse", "0", "-i", "desktop", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", video],
    { stdio: ["pipe", "ignore", "pipe"], windowsHide: true },
  );
  // gdigrab stamps frames with the wall clock; the banner's "start:" is the first frame in Unix seconds.
  const videoStart = new Promise<number>((res, rej) => {
    let err = "";
    ffmpeg.stderr!.on("data", (d) => {
      err += d;
      const m = err.match(/start: (\d+\.\d+)/);
      if (m) res(Number(m[1]) * 1000);
    });
    ffmpeg.on("exit", () => rej(new Error(`ffmpeg exited before recording:\n${err.slice(-1500)}`)));
  });
  return { ffmpeg, videoStart, video, wav, recorder };
}

async function stopRecording(rec: Recording) {
  writeFileSync(`${rec.wav}.stop`, "");
  rec.ffmpeg.stdin!.write("q");
  await Promise.all([new Promise((r) => rec.ffmpeg.on("exit", r)), new Promise((r) => rec.recorder.on("exit", r))]);
  return { audioStart: JSON.parse(readFileSync(`${rec.wav}.json`, "utf8")).startedAt as number };
}

const vttTime = (ms: number) => {
  const t = Math.max(0, Math.round(ms));
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(t / 3_600_000))}:${p(Math.floor(t / 60_000) % 60)}:${p(Math.floor(t / 1000) % 60)}.${p(t % 1000, 3)}`;
};
const vttEscape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- commands ----------

const commands: Record<string, (args: string[]) => Promise<void>> = {
  async help() {
    console.log(`sr.ts <command> [--run NAME]   NVDA on a headed run (ctl.ts up --headed --run NAME)
  start                       start NVDA with the pinned settings in scripts/nvda/ and the event plugin
  press <chord>...            bring Chrome to the front, press each chord for real (NVDA hears it), and print
                              what NVDA said after each. Chords: ${KEY_NAMES.join(", ")}, joined with +
                              to modifiers: shift, ctrl, alt, nvda (Insert). e.g. Tab shift+Tab nvda+Space
  log [--since <unixMs>]      print NVDA's events as text: speech, beeps, sounds, cut-offs
  scenario <name>             run scripts/sr-scenarios/<name>.ts recorded: video with NVDA's audio, captions
                              from NVDA's text, and a transcript, in .verify/evidence/<run>/sr/<name>/
  stop                        quit NVDA and keep its events and log in the evidence dir`);
  },

  async start() {
    ctlState();
    if (existsSync(SR_FILE) && nvdaAlive(srState().nvdaPid)) fail(`NVDA is already running for run "${RUN}"`);
    const running = nvdaPids();
    if (running.length) fail(`NVDA is already running (pid ${running.join(", ")}). sr.ts starts its own copy with pinned settings and won't replace yours. Quit it first.`);
    if (!existsSync(NVDA_EXE)) fail(`NVDA not found at ${NVDA_EXE}. Install it, or set NVDA_PATH.`);
    const config = join(RUN_DIR, "nvda");
    rmSync(config, { recursive: true, force: true });
    mkdirSync(join(config, "scratchpad", "globalPlugins"), { recursive: true });
    copyFileSync(join(SCRIPTS, "nvda", "nvda.ini"), join(config, "nvda.ini"));
    copyFileSync(join(SCRIPTS, "nvda", "globalPlugins", "odd_verify.py"), join(config, "scratchpad", "globalPlugins", "odd_verify.py"));
    const sr: Sr = { nvdaPid: 0, config, events: join(config, "events.jsonl"), settings: { t: 0, kind: "" } };
    // nvda.exe asks for UIAccess, which needs ShellExecute, so start it through PowerShell's Start-Process.
    const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
    const args = ["-c", config, "-f", join(config, "nvda.log"), "-l", "12"].map((a) => q(`"${a}"`)).join(",");
    const r = spawnSync("powershell", ["-NoProfile", "-Command", `Start-Process -FilePath ${q(NVDA_EXE)} -ArgumentList ${args}`], { encoding: "utf8" });
    if (r.status !== 0) fail(`couldn't start NVDA: ${r.stderr}`);
    const deadline = Date.now() + 30_000;
    let ready: Ev | undefined;
    while (!(ready = events(sr).find((e) => e.kind === "ready"))) {
      if (Date.now() > deadline) fail(`NVDA didn't load the event plugin within 30 s. See ${join(config, "nvda.log")}`);
      await sleep(200);
    }
    sr.nvdaPid = ready.pid as number;
    sr.settings = ready;
    writeFileSync(SR_FILE, JSON.stringify(sr, null, 2));
    // Chrome only sends accessibility events to a screen reader that was running when it launched.
    ctl("restart-chrome");
    const { t, kind, pid, ...settings } = ready;
    log(`# start ${new Date().toISOString()} NVDA ${JSON.stringify(settings)}`);
    console.log(`NVDA ${ready.nvda} running (pid ${sr.nvdaPid}): ${ready.synth}, ${String(ready.voice).split("\\").pop()}, rate ${ready.rate}`);
  },

  async press(chords) {
    if (!chords.length) fail("usage: press <chord>...");
    const sr = srState();
    const hwnd = await chromeWindow(sr);
    for (const chord of chords) {
      const r = await press(sr, hwnd, chord);
      log(r.text);
      console.log(r.text);
    }
  },

  async log() {
    const since = Number(flag("since") ?? 0) / 1000;
    const evs = events(srState(), since);
    const groups: Ev[][] = [];
    for (const e of evs) if (e.kind === "key" || !groups.length) groups.push([e]); else groups[groups.length - 1]!.push(e);
    for (const g of groups) {
      const key = g[0]!.kind === "key" ? (g[0]!.name as string) : "(before any key)";
      console.log(describe(key, g, false, false));
    }
  },

  async scenario([name]) {
    if (!name) fail("usage: scenario <name>   (files in scripts/sr-scenarios/)");
    const file = join(SCRIPTS, "sr-scenarios", `${name}.ts`);
    if (!existsSync(file)) fail(`no scenario ${file}`);
    const scenario: Scenario = (await import(file)).default;
    const sr = srState();
    const dir = join(EVIDENCE_DIR, name);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });

    const loaded = Date.now();
    ctl("goto", scenario.story, scenario.globals ?? "");
    const hwnd = await chromeWindow(sr);
    await nvdaFocusInChrome(sr, loaded);
    await settle(sr, loaded, { min: 1000 });

    const rec = startRecording(hwnd, dir);
    const videoStart = await rec.videoStart;
    await sleep(600);
    const marks: { t: number; label: string; note?: string; evs: Ev[]; timedOut: boolean }[] = [];
    for (const step of scenario.steps) {
      if (typeof step === "object" && "wait" in step && !("keys" in step)) {
        await sleep(step.wait);
        continue;
      }
      if (typeof step === "object" && "focus" in step) {
        const since = Date.now();
        ctl("focus", step.focus, ...(step.text ? ["--text", step.text] : []));
        const { evs, timedOut } = await settle(sr, since);
        marks.push({ t: since, label: `(setup) focus ${step.focus}${step.text ? ` "${step.text}"` : ""}`, note: step.note, evs, timedOut });
        continue;
      }
      const keys = typeof step === "string" ? step : step.keys;
      const r = await press(sr, hwnd, keys, typeof step === "object" && step.wait ? { min: step.wait } : {});
      marks.push({ t: r.since, label: keys, note: typeof step === "object" ? step.note : undefined, evs: r.evs, timedOut: r.timedOut });
    }
    await sleep(800);
    const end = Date.now();
    const { audioStart } = await stopRecording(rec);

    // Captions: one cue per step, from the step until the next one, labeled with the key that caused it.
    // Only what was heard; focus moves stay in the transcript.
    const cues = marks.map((m, i) => {
      const said = phrases(m.evs)
        .filter((p) => !p.text.startsWith("[focus:") && !p.text.startsWith("[window:"))
        .map((p) => `${p.text.replace(/\s*\n\s*/g, " ")}${p.cutOff ? " (cut off)" : ""}`);
      const until = i + 1 < marks.length ? marks[i + 1]!.t : end;
      return `${vttTime(m.t - videoStart)} --> ${vttTime(until - videoStart)}\n${vttEscape(`[${m.label}]`)}\n${vttEscape(said.join(" · ") || "(nothing spoken)")}`;
    });
    writeFileSync(join(dir, "captions.vtt"), `WEBVTT\n\n${cues.join("\n\n")}\n`);

    // Mux the recorded speakers onto the video, shifted to the video's clock, with the captions as a soft track.
    const out = join(dir, `${name}.mp4`);
    const offset = ((audioStart - videoStart) / 1000).toFixed(3);
    const mux = spawnSync(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", "-i", rec.video, "-itsoffset", offset, "-i", rec.wav, "-i", join(dir, "captions.vtt"), "-map", "0:v", "-map", "1:a", "-map", "2:s", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-c:s", "mov_text", "-metadata:s:s:0", "language=eng", out], { encoding: "utf8" });
    if (mux.status !== 0) fail(`ffmpeg mux failed: ${mux.stderr}`);
    for (const f of [rec.video, rec.wav, `${rec.wav}.json`]) rmSync(f);

    const { t, kind, pid, ...settings } = sr.settings;
    const transcript = [
      `# ${scenario.title}`,
      "",
      scenario.why,
      "",
      `Story \`${scenario.story}\`${scenario.globals ? ` with \`${scenario.globals}\`` : ""}. NVDA ${settings.nvda}, ${settings.synth} ${String(settings.voice).split("\\").pop()}, rate ${settings.rate}, symbol level ${settings.symbolLevel}.`,
      "",
      "```",
      ...marks.map((m) => `${m.note ? `# ${m.note}\n` : ""}${describe(m.label, m.evs, m.timedOut, !m.label.startsWith("(setup)"))}`),
      "```",
      "",
    ].join("\n");
    writeFileSync(join(dir, "transcript.md"), transcript);
    writeFileSync(join(dir, "events.json"), JSON.stringify({ videoStart, audioStart, marks }, null, 2));
    writeFileSync(
      join(dir, "index.html"),
      `<!doctype html><meta charset="utf-8"><title>${scenario.title}</title><style>body{font:16px system-ui;margin:2rem;max-width:80rem}video{width:100%}pre{white-space:pre-wrap}</style>
<h1>${scenario.title}</h1><video controls src="${name}.mp4"><track default kind="captions" srclang="en" label="NVDA" src="captions.vtt"></video>
<pre>${vttEscape(transcript)}</pre>`,
    );
    log(transcript);
    console.log(transcript);
    console.log(`video: ${out}\nreview page: ${join(dir, "index.html")}`);
  },

  async stop() {
    if (!existsSync(SR_FILE)) return console.log(`NVDA isn't running for run "${RUN}"`);
    const sr = srState();
    if (nvdaAlive(sr.nvdaPid)) {
      spawnSync("powershell", ["-NoProfile", "-Command", `Start-Process -FilePath '${NVDA_EXE}' -ArgumentList '-q' -Wait`]);
      for (let i = 0; i < 40 && nvdaAlive(sr.nvdaPid); i++) await sleep(250);
      if (nvdaAlive(sr.nvdaPid)) spawnSync("taskkill", ["/PID", String(sr.nvdaPid), "/T", "/F"]);
      if (nvdaAlive(sr.nvdaPid)) fail(`NVDA (pid ${sr.nvdaPid}) is still running`);
    }
    mkdirSync(EVIDENCE_DIR, { recursive: true });
    for (const f of ["events.jsonl", "nvda.log"]) if (existsSync(join(sr.config, f))) copyFileSync(join(sr.config, f), join(EVIDENCE_DIR, `nvda-${f}`));
    rmSync(SR_FILE);
    log(`# stop ${new Date().toISOString()}`);
    console.log(`NVDA stopped; events and log kept in ${EVIDENCE_DIR}`);
  },
};

const [cmd = "help", ...rest] = argv;
const run = commands[cmd] ?? (() => fail(`unknown command ${cmd}; try 'help'`));
await run(rest).catch((e) => fail(e instanceof Error ? e.message : String(e)));
process.exit(0);
