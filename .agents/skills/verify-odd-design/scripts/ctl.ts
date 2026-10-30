#!/usr/bin/env bun
// Verification harness for the odd-design Storybook. Zero dependencies: Bun + a local Chromium over CDP.
// Usage: bun .agents/skills/verify-odd-design/scripts/ctl.ts <command> [args] [--run NAME]
// Run `ctl.ts help` for the command list.
import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { A11Y_EXCLUDE, A11Y_OPTIONS, A11Y_TAGS } from "../../../../.storybook/a11y.ts";

const ROOT = resolve(import.meta.dir, "../../../..");
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
const EVIDENCE_DIR = join(ROOT, ".verify", "evidence", RUN);
const STATE_FILE = join(RUN_DIR, "state.json");
const EXPECTED_STORY = "showcase--sample-app";

type State = {
  run: string;
  head: string;
  storybook: { pid: number; port: number; url: string; log: string };
  /** headed: a visible window, for screen readers (sr.ts). Headless Chrome has no window for NVDA to read. */
  chrome: { pid: number; port: number; binary: string; profile: string; headed?: boolean };
  /** CDP media emulation resets when a session closes, so it is stored here and re-applied on every connect. */
  emulate?: { name: string; value: string }[];
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fail = (msg: string): never => {
  console.error(`error: ${msg}`);
  process.exit(1);
};
const readState = (): State => {
  if (!existsSync(STATE_FILE)) fail(`no run "${RUN}" (missing ${STATE_FILE}). Start one with: ctl.ts up --run ${RUN}`);
  return JSON.parse(readFileSync(STATE_FILE, "utf8"));
};
const alive = (pid: number) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};
const freePort = () => {
  const server = Bun.listen({ hostname: "127.0.0.1", port: 0, socket: { data() {} } });
  const port = server.port;
  server.stop(true);
  return port;
};
const transcript = (line: string) => {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  appendFileSync(join(EVIDENCE_DIR, "transcript.log"), `[${new Date().toISOString()}] ${line}\n`);
};
const evidencePath = (name: string) => {
  const path = isAbsolute(name) ? name : join(EVIDENCE_DIR, name);
  mkdirSync(dirname(path), { recursive: true });
  return path;
};

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  return candidates.find((c) => c && existsSync(c)) ?? fail("no Chrome/Edge found; set CHROME_PATH");
}

/** Kills a process and its children. Only ever called with PIDs this harness started. */
function killTree(pid: number) {
  if (!alive(pid)) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
  else {
    try {
      process.kill(-pid, "SIGTERM");
    } catch {
      process.kill(pid, "SIGTERM");
    }
  }
}

/** PIDs of `pid` and all its descendants. */
function processTree(pid: number): Set<number> {
  const tree = new Set([pid]);
  let rows: { ProcessId: number; ParentProcessId: number }[] = [];
  if (process.platform === "win32") {
    const out = spawnSync(
      "powershell",
      ["-NoProfile", "-Command", "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId | ConvertTo-Json -Compress"],
      { encoding: "utf8" },
    ).stdout;
    rows = JSON.parse(out);
  } else {
    const out = spawnSync("ps", ["-eo", "pid=,ppid="], { encoding: "utf8" }).stdout;
    rows = out.trim().split("\n").map((l) => {
      const [p, pp] = l.trim().split(/\s+/).map(Number);
      return { ProcessId: p, ParentProcessId: pp };
    });
  }
  for (let grew = true; grew; ) {
    grew = false;
    for (const r of rows) if (tree.has(r.ParentProcessId) && !tree.has(r.ProcessId)) tree.add(r.ProcessId), (grew = true);
  }
  return tree;
}

function listenerPid(port: number): number | undefined {
  if (process.platform === "win32") {
    const out = spawnSync("netstat", ["-ano", "-p", "TCP"], { encoding: "utf8" }).stdout;
    const row = out.split("\n").find((l) => /LISTENING/.test(l) && new RegExp(`:${port}\\s`).test(l));
    return row ? Number(row.trim().split(/\s+/).at(-1)) : undefined;
  }
  const out = spawnSync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"], { encoding: "utf8" }).stdout;
  return out.trim() ? Number(out.trim().split("\n")[0]) : undefined;
}

async function waitFor<T>(what: string, ms: number, probe: () => Promise<T | undefined>): Promise<T> {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    try {
      const v = await probe();
      if (v !== undefined) return v;
    } catch {}
    await sleep(500);
  }
  return fail(`timed out after ${ms}ms waiting for ${what}`);
}

// ---------- CDP ----------

class Page {
  private id = 0;
  private pending = new Map<number, { resolve: (v: any) => void; reject: (e: Error) => void }>();
  private constructor(private ws: WebSocket) {
    ws.onmessage = (e) => {
      const msg = JSON.parse(String(e.data));
      const p = msg.id && this.pending.get(msg.id);
      if (!p) return;
      this.pending.delete(msg.id);
      msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
    };
  }
  static async connect(state: State) {
    const targets: any[] = await (await fetch(`http://127.0.0.1:${state.chrome.port}/json/list`)).json();
    const target = targets.find((t) => t.type === "page") ?? fail("Chrome has no page target");
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r, j) => ((ws.onopen = r), (ws.onerror = j)));
    const page = new Page(ws);
    if (state.emulate?.length) await page.send("Emulation.setEmulatedMedia", { features: state.emulate });
    return page;
  }
  send(method: string, params: object = {}): Promise<any> {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  async eval(expression: string) {
    const r = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  }
  close() {
    this.ws.close();
  }
}

/** JS that resolves a selector (optionally filtered by visible text) to one element, or throws. */
const locate = (selector: string, text?: string) => `(() => {
  const all = [...document.querySelectorAll(${JSON.stringify(selector)})];
  const want = ${JSON.stringify(text ?? null)};
  const hits = want === null ? all : all.filter((el) => el.textContent.replace(/\\s+/g, " ").trim().includes(want));
  if (hits.length === 0) throw new Error("no element matches " + ${JSON.stringify(selector)} + (want ? " with text " + want : ""));
  return hits[0];
})()`;

const KEYS: Record<string, { key: string; code: string; keyCode: number; text?: string }> = {
  Escape: { key: "Escape", code: "Escape", keyCode: 27 },
  Enter: { key: "Enter", code: "Enter", keyCode: 13, text: "\r" },
  Tab: { key: "Tab", code: "Tab", keyCode: 9 },
  Backspace: { key: "Backspace", code: "Backspace", keyCode: 8 },
  Space: { key: " ", code: "Space", keyCode: 32, text: " " },
  ArrowLeft: { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37 },
  ArrowUp: { key: "ArrowUp", code: "ArrowUp", keyCode: 38 },
  ArrowRight: { key: "ArrowRight", code: "ArrowRight", keyCode: 39 },
  ArrowDown: { key: "ArrowDown", code: "ArrowDown", keyCode: 40 },
  Home: { key: "Home", code: "Home", keyCode: 36 },
  End: { key: "End", code: "End", keyCode: 35 },
};

/** A single letter or digit presses that key, so typeahead sees a real keydown (type does not). */
const keyFor = (name: string) => {
  if (KEYS[name]) return KEYS[name];
  if (/^[a-z0-9]$/i.test(name)) {
    const upper = name.toUpperCase();
    return { key: name, code: /\d/.test(name) ? `Digit${name}` : `Key${upper}`, keyCode: upper.charCodeAt(0), text: name };
  }
  return undefined;
};

/** Opens a story in the iframe and waits until it has rendered and its fonts have loaded. */
async function render(page: Page, s: State, id: string, globals?: string, args?: string) {
  // Storybook expects literal ":" and ";" in globals/args, so build the query by hand.
  const url = `${s.storybook.url}/iframe.html?id=${id}&viewMode=story${globals ? `&globals=${globals}` : ""}${args ? `&args=${args}` : ""}`;
  await page.send("Page.enable");
  await page.send("Page.navigate", { url });
  const result = await waitFor(`story ${id} to render`, 60_000, async () => {
    const r = await page.eval(`(() => {
      if (document.readyState !== "complete") return null;
      if (document.body.classList.contains("sb-show-errordisplay")) return { error: document.querySelector("#error-message")?.textContent || "story error" };
      if (document.body.classList.contains("sb-show-nopreview")) return { error: "no preview (bad story id?)" };
      const root = document.querySelector("#storybook-root");
      return root && root.childElementCount > 0 ? { ok: true } : null;
    })()`);
    return r ?? undefined;
  });
  if (result.error) fail(`story ${id} failed: ${result.error}`);
  await page.eval(`document.fonts.ready.then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))`);
  return { url, html: await page.eval(`({...document.documentElement.dataset})`) };
}

/** quick: every story in light and dark. full: also every chrome and every palette, in both modes. */
function appearanceSweep(kind: string): string[] {
  const modes = ["light", "dark"];
  if (kind === "quick") return modes.map((m) => `mode:${m}`);
  if (kind !== "full") fail(`--appearance must be quick or full, not ${kind}`);
  const contract = readFileSync(join(ROOT, "src/js/contract.ts"), "utf8");
  const list = (name: string) => [...contract.match(new RegExp(`export const ${name} = \\[([^\\]]*)\\]`))![1]!.matchAll(/"([^"]+)"/g)].map((m) => m[1]!);
  return [
    ...list("CHROMES").flatMap((c) => modes.map((m) => `chrome:${c};mode:${m}`)),
    ...list("PALETTES").filter((p) => p !== "default").flatMap((p) => modes.map((m) => `palette:${p};mode:${m}`)),
  ];
}

const AXE_DIR = join(ROOT, "node_modules/axe-core");
const RULES_FILE = join(ROOT, ".storybook/a11y-rules.txt");

/**
 * The pinned axe-core with the shared options from .storybook/a11y.ts, as window.__dsAxe(). This is
 * a separate copy from the addon's, and the sweep puts the addon in manual mode, so only this one runs.
 */
function axeInjection(): string {
  const axe = readFileSync(join(AXE_DIR, "axe.min.js"), "utf8");
  return `if (!window.__dsAxe) {
    ${axe}
    const dsAxe = window.axe;
    window.__dsAxe = async () => {
      const r = await dsAxe.run({ include: [document.body], exclude: ${JSON.stringify(A11Y_EXCLUDE.map((s) => [s]))} }, ${JSON.stringify(A11Y_OPTIONS)});
      return {
        version: dsAxe.version,
        ran: [...r.passes, ...r.violations, ...r.incomplete, ...r.inapplicable].map((x) => x.id),
        incomplete: r.incomplete.flatMap((v) => v.nodes.map((n) => ({
          rule: v.id,
          target: n.target.join(" "),
          reason: [...n.any, ...n.all, ...n.none].map((c) => c.message).find(Boolean) ?? "",
        }))),
        violations: r.violations.map((v) => ({ rule: v.id, impact: v.impact, help: v.help, targets: v.nodes.map((n) => n.target.join(" ")) })),
      };
    };
  }`;
}

/** The committed record of which rules the shared tags resolve to, for this axe-core version. */
function rulesRecord(version: string, ids: string[]) {
  return [
    "# Rules the accessibility checks run. Generated by `ctl.ts axe --update-rules`; do not edit by hand.",
    `# axe-core ${version}, tags: ${A11Y_TAGS.join(", ")}`,
    ...[...new Set(ids)].sort(),
    "",
  ].join("\n");
}

async function axTree(page: Page) {
  await page.send("Accessibility.enable");
  const { nodes } = await page.send("Accessibility.getFullAXTree");
  const byId = new Map<string, any>(nodes.map((n: any) => [n.nodeId, n]));
  const lines: string[] = [];
  const walk = (node: any, depth: number) => {
    const role = node.role?.value;
    const name = node.name?.value;
    const ignored = node.ignored || role === "none" || role === "generic" || (role === "StaticText" && !name) || role === "InlineTextBox";
    let next = depth;
    if (!ignored) {
      const props = (node.properties ?? [])
        .filter((p: any) => ["checked", "expanded", "focused", "modal", "disabled", "invalid", "required", "busy", "selected", "pressed"].includes(p.name))
        .filter((p: any) => p.value?.value !== false && p.value?.value !== "false")
        .map((p: any) => (p.value?.value === true || p.value?.value === 1 ? p.name : `${p.name}=${p.value?.value}`));
      const value = node.value?.value ? ` value=${JSON.stringify(node.value.value)}` : "";
      const description = node.description?.value ? ` description=${JSON.stringify(node.description.value)}` : "";
      lines.push(`${"  ".repeat(depth)}- ${role}${name ? ` ${JSON.stringify(name)}` : ""}${value}${description}${props.length ? ` [${props.join(", ")}]` : ""}`);
      next = depth + 1;
    }
    for (const c of node.childIds ?? []) if (byId.has(c)) walk(byId.get(c), next);
  };
  walk(nodes[0], 0);
  return lines.join("\n");
}

function launchChrome(c: Omit<State["chrome"], "pid">, storybookUrl: string) {
  const chrome = spawn(
    c.binary,
    [
      `--remote-debugging-port=${c.port}`,
      `--user-data-dir=${c.profile}`,
      ...(c.headed ? ["--window-position=0,0", "--force-renderer-accessibility", "--disable-features=Translate"] : ["--headless=new", "--hide-scrollbars"]),
      "--no-first-run",
      "--no-default-browser-check",
      "--window-size=1280,900",
      // An app window has no toolbar, so Tab and NVDA stay in the page. Chrome ignores --app for
      // about: URLs, so it opens on this run's Storybook (an error page until Storybook is up).
      c.headed ? `--app=${storybookUrl}/` : "about:blank",
    ],
    { detached: true, stdio: "ignore", windowsHide: !c.headed },
  );
  chrome.unref();
  return chrome;
}

// ---------- commands ----------

const commands: Record<string, (args: string[]) => Promise<void>> = {
  async help() {
    console.log(`ctl.ts <command> [--run NAME]   (run defaults to $VERIFY_RUN or "default")
  up [--headed]                        start Storybook + headless Chrome on free ports, wait until ready.
                                       --headed opens a visible window at 0,0 instead (needed by sr.ts)
  restart-chrome                       relaunch this run's Chrome with the same profile and port. sr.ts start uses it:
                                       Chrome only sends accessibility events to a screen reader running at launch
  doctor                               read-only health check of this run's instances
  goto <storyId> [globals] [args]      open a story iframe; globals like "chrome:glass;palette:aurora;mode:dark"
  state                                print html[data-*] appearance + story-root summary
  eval <js>                            evaluate JS in the page (awaits promises), print JSON
  click <css> [--text T]               real mouse click on the first match (optionally whose text contains T)
  hover <css> [--text T]               real mouse move onto the first match (leaves the pointer there)
  focus <css> [--text T]               focus the first match
  wait <ms>                            pause, for delays like interestfor's show delay (max 5000)
  press <Key>                          real key press: ${Object.keys(KEYS).join(", ")}, or one letter/digit
  type <text>                          insert text at the focused element
  emulate <feature=value>...           media features, e.g. prefers-color-scheme=dark prefers-reduced-motion=reduce
  screenshot <file.png> [--full]       save to .verify/evidence/<run>/ (or an absolute path)
  aria <file.txt>                      save an accessibility-tree snapshot to the evidence dir and print it
  axe [storyId...] [--appearance quick|full] [--update-rules]
                                       axe-core with the shared rules in .storybook/a11y.ts on every story (or the named
                                       ones), rendered and with each overlay opened; exits 1 on any violation or if the
                                       rules that ran differ from .storybook/a11y-rules.txt. quick = light+dark,
                                       full = every chrome and palette. --update-rules rewrites that file
  down                                 kill what this run started and delete its scratch dir (evidence is kept)`);
  },

  async up() {
    const headed = argv.includes("--headed");
    if (existsSync(STATE_FILE)) {
      const s: State = JSON.parse(readFileSync(STATE_FILE, "utf8"));
      if (alive(s.storybook.pid) || alive(s.chrome.pid)) fail(`run "${RUN}" is already up. Use it, or 'ctl.ts down --run ${RUN}' first.`);
    }
    rmSync(RUN_DIR, { recursive: true, force: true });
    mkdirSync(RUN_DIR, { recursive: true });
    const sbPort = freePort();
    const cdpPort = freePort();
    const log = join(RUN_DIR, "storybook.log");
    const fd = openSync(log, "a");
    const sb = spawn(
      process.platform === "win32" ? "node.exe" : "node",
      [join(ROOT, "node_modules/storybook/dist/bin/dispatcher.js"), "dev", "-p", String(sbPort), "--host", "127.0.0.1", "--exact-port", "--no-open", "--ci", "--disable-telemetry"],
      { cwd: ROOT, detached: true, stdio: ["ignore", fd, fd], windowsHide: true },
    );
    sb.unref();
    const binary = findChrome();
    const profile = join(RUN_DIR, "chrome-profile");
    const chrome = launchChrome({ binary, profile, port: cdpPort, headed }, `http://127.0.0.1:${sbPort}`);
    const head = spawnSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT, encoding: "utf8" }).stdout.trim();
    const state: State = {
      run: RUN,
      head,
      storybook: { pid: sb.pid!, port: sbPort, url: `http://127.0.0.1:${sbPort}`, log },
      chrome: { pid: chrome.pid!, port: cdpPort, binary, profile, headed },
    };
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    console.log(`starting run "${RUN}": storybook pid ${sb.pid} on ${state.storybook.url}, chrome pid ${chrome.pid} cdp ${cdpPort}`);
    await waitFor("Chrome CDP", 30_000, async () => ((await fetch(`http://127.0.0.1:${cdpPort}/json/version`)).ok ? true : undefined));
    await waitFor(`Storybook index (log: ${log})`, 180_000, async () => {
      if (!alive(sb.pid!)) fail(`Storybook exited during startup. Log:\n${readFileSync(log, "utf8").slice(-3000)}`);
      const r = await fetch(`${state.storybook.url}/index.json`);
      return r.ok && (await r.text()).includes(EXPECTED_STORY) ? true : undefined;
    });
    transcript(`up: storybook ${state.storybook.url} (pid ${sb.pid}), chrome cdp ${cdpPort} (pid ${chrome.pid}), HEAD ${head}`);
    console.log(`READY run="${RUN}" storybook=${state.storybook.url} evidence=${EVIDENCE_DIR}`);
  },

  async "restart-chrome"() {
    const s = readState();
    killTree(s.chrome.pid);
    await waitFor("old Chrome to exit", 10_000, async () => (alive(s.chrome.pid) ? undefined : true));
    const chrome = launchChrome(s.chrome, s.storybook.url);
    s.chrome.pid = chrome.pid!;
    writeFileSync(STATE_FILE, JSON.stringify(s, null, 2));
    await waitFor("Chrome CDP", 30_000, async () => ((await fetch(`http://127.0.0.1:${s.chrome.port}/json/version`).catch(() => null))?.ok ? true : undefined));
    transcript(`restart-chrome: pid ${chrome.pid}`);
    console.log(`chrome restarted: pid ${chrome.pid}`);
  },

  async doctor() {
    const s = readState();
    const checks: [string, boolean, string][] = [];
    const sbTree = processTree(s.storybook.pid);
    const owner = listenerPid(s.storybook.port);
    checks.push(["storybook process alive", alive(s.storybook.pid), `pid ${s.storybook.pid}`]);
    checks.push(["storybook port owned by this run", owner !== undefined && sbTree.has(owner), `port ${s.storybook.port} listener pid ${owner ?? "none"}`]);
    let stories = 0;
    try {
      const index = await (await fetch(`${s.storybook.url}/index.json`)).json();
      stories = Object.keys(index.entries ?? {}).length;
      checks.push(["index serves expected story", EXPECTED_STORY in (index.entries ?? {}), `${stories} entries`]);
    } catch (e) {
      checks.push(["index serves expected story", false, String(e)]);
    }
    checks.push(["chrome process alive", alive(s.chrome.pid), `pid ${s.chrome.pid}`]);
    try {
      const v = await (await fetch(`http://127.0.0.1:${s.chrome.port}/json/version`)).json();
      checks.push(["chrome CDP answers", true, v.Browser]);
    } catch (e) {
      checks.push(["chrome CDP answers", false, String(e)]);
    }
    const head = spawnSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT, encoding: "utf8" }).stdout.trim();
    const dirty = spawnSync("git", ["status", "--porcelain", "--", "src", "stories", ".storybook"], { cwd: ROOT, encoding: "utf8" }).stdout.trim();
    checks.push(["HEAD matches launch", head === s.head, `launched ${s.head}, now ${head}${dirty ? " (+uncommitted src/stories changes, served live by HMR)" : ""}`]);
    for (const [name, ok, detail] of checks) console.log(`${ok ? "ok  " : "FAIL"} ${name}: ${detail}`);
    if (checks.some(([, ok]) => !ok)) process.exit(1);
  },

  async goto([id, globals, args]) {
    if (!id) fail("usage: goto <storyId> [globals] [args]");
    const s = readState();
    const page = await Page.connect(s);
    const { url, html } = await render(page, s, id, globals, args);
    page.close();
    transcript(`goto ${url} -> rendered, html data=${JSON.stringify(html)}`);
    console.log(`rendered ${id} at ${url}
html data: ${JSON.stringify(html)}`);
  },

  async axe(ids) {
    const s = readState();
    const appearance = flag("appearance") ?? "quick";
    const index: any = await (await fetch(`${s.storybook.url}/index.json`)).json();
    const all = Object.values(index.entries).filter((e: any) => e.type === "story").map((e: any) => e.id as string);
    const stories = ids.filter((a) => !a.startsWith("--") && all.includes(a));
    const targets = stories.length ? stories : all;
    const globalsList = appearanceSweep(appearance);
    const inject = axeInjection();
    const page = await Page.connect(s);
    await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 0, y: 0 });

    type Finding = { story: string; globals: string; state: string; rule: string; impact: string; help: string; targets: string[] };
    const findings: Finding[] = [];
    const review: { story: string; globals: string; state: string; rule: string; target: string; reason: string }[] = [];
    const ran = new Set<string>();
    let version = "";
    let runs = 0;

    const check = async (story: string, globals: string, state: string) => {
      const r = await page.eval(`window.__dsAxe()`);
      runs++;
      version = r.version;
      for (const id of r.ran) ran.add(id);
      for (const v of r.violations) findings.push({ story, globals, state, ...v });
      for (const v of r.incomplete) review.push({ story, globals, state, ...v });
    };

    for (const globals of globalsList) {
      for (const story of targets) {
        // Manual mode stops the addon's automatic run, so this sweep's axe is the only one on the page.
        await render(page, s, story, `${globals};a11y.manual:!true`);
        await page.eval(inject);
        await check(story, globals, "rendered");

        // Every overlay a user can open, opened through a real click or hover, then closed again.
        const openers: { kind: string; label: string }[] = await page.eval(`[...document.querySelectorAll(
          '#storybook-root [command="show-modal"], #storybook-root [command="toggle-popover"], #storybook-root [popovertarget], #storybook-root [interestfor]'
        )].map((el, i) => { el.dataset.a11yOpener = i; return { kind: el.hasAttribute("interestfor") ? "hover" : "click", label: (el.textContent.trim() || el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || "").slice(0, 40) }; })`);
        for (const [i, opener] of openers.entries()) {
          const box = await page.eval(`(() => { const el = document.querySelector('[data-a11y-opener="${i}"]'); if (!el || !el.checkVisibility()) return null; const target = document.getElementById(el.getAttribute("commandfor") ?? el.getAttribute("popovertarget") ?? el.getAttribute("interestfor") ?? ""); if (target?.matches("[open], :popover-open")) return null; el.scrollIntoView({ block: "center" }); const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
          if (!box) continue;
          if (opener.kind === "hover") {
            await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: box.x, y: box.y });
            await sleep(1100);
          } else {
            for (const type of ["mouseMoved", "mousePressed", "mouseReleased"])
              await page.send("Input.dispatchMouseEvent", { type, x: box.x, y: box.y, button: "left", clickCount: 1 });
            await sleep(450);
          }
          await check(story, globals, `${opener.kind} "${opener.label}"`);
          const k = KEYS.Escape!;
          const key = { key: k.key, code: k.code, windowsVirtualKeyCode: k.keyCode, nativeVirtualKeyCode: k.keyCode };
          await page.send("Input.dispatchKeyEvent", { type: "rawKeyDown", ...key });
          await page.send("Input.dispatchKeyEvent", { type: "keyUp", ...key });
          await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 0, y: 0 });
          await sleep(400);
        }
      }
      console.log(`${globals || "defaults"}: ${targets.length} stories checked`);
    }
    page.close();

    // One line per rule and element; the appearances and states it failed in are listed together.
    const grouped = new Map<string, Finding & { where: string[] }>();
    for (const f of findings) {
      const key = `${f.story} ${f.rule} ${f.targets.join(",")}`;
      const g = grouped.get(key) ?? { ...f, where: [] };
      g.where.push(`${f.globals || "defaults"} ${f.state}`);
      grouped.set(key, g);
    }
    const report = [...grouped.values()];
    // One line per story, rule, and axe's reason, counting the distinct elements behind it.
    const reviewGroups = new Map<string, Set<string>>();
    for (const r of review) {
      const key = `${r.story}  ${r.rule}: ${r.reason}`;
      reviewGroups.set(key, (reviewGroups.get(key) ?? new Set()).add(r.target));
    }
    const reviewKeys = [...reviewGroups].map(([key, els]) => `${key} (${els.size} element${els.size === 1 ? "" : "s"})`).sort();
    writeFileSync(evidencePath("axe/report.json"), JSON.stringify({ violations: report, needsReview: review }, null, 2));
    transcript(`axe appearance=${appearance} stories=${targets.length} runs=${runs} violations=${report.length} needsReview=${reviewKeys.length}`);
    for (const g of report) {
      console.log(`FAIL ${g.story}  ${g.rule} (${g.impact})  ${g.targets.join(" ")}\n     ${g.help}\n     in: ${[...new Set(g.where)].slice(0, 4).join("; ")}${g.where.length > 4 ? ` (+${g.where.length - 4} more)` : ""}`);
    }
    // axe could not decide these (often contrast over gradients or images): a person has to check them.
    for (const k of reviewKeys) console.log(`REVIEW ${k}`);

    // The rules that actually ran, against the committed record. A change means axe or the tags changed.
    const record = rulesRecord(version, [...ran]);
    const committed = existsSync(RULES_FILE) ? readFileSync(RULES_FILE, "utf8").replace(/\r\n/g, "\n") : "";
    const ruleIds = (text: string) => new Set(text.split("\n").filter((l) => l && !l.startsWith("#")));
    let rulesChanged = false;
    if (argv.includes("--update-rules")) {
      writeFileSync(RULES_FILE, record);
      console.log(`wrote ${RULES_FILE} (${ran.size} rules)`);
    } else if (committed !== record) {
      rulesChanged = true;
      const was = ruleIds(committed);
      const now = ruleIds(record);
      console.log(`RULES CHANGED vs ${RULES_FILE}:`);
      for (const id of now) if (!was.has(id)) console.log(`  + ${id}`);
      for (const id of was) if (!now.has(id)) console.log(`  - ${id}`);
      const [oldHeader, newHeader] = [committed.split("\n")[1], record.split("\n")[1]];
      if (oldHeader !== newHeader) console.log(`  ${oldHeader ?? "(no record yet)"}\n  -> ${newHeader}`);
      console.log("  Review the change, then rerun with --update-rules to accept it.");
    }

    console.log(`${runs} axe runs over ${targets.length} stories, ${globalsList.length} appearance(s), axe-core ${version}, ${ran.size} rules: ${report.length} violations, ${reviewKeys.length} needing manual review. Report: ${evidencePath("axe/report.json")}`);
    if (report.length || rulesChanged) process.exit(1);
  },

  async state() {
    const page = await Page.connect(readState());
    const out = await page.eval(`({
      url: location.href,
      html: {...document.documentElement.dataset},
      scopes: [...document.querySelectorAll(".odd-scope")].slice(0, 20).map((el) => ({...el.dataset})),
      openDialogs: [...document.querySelectorAll("dialog[open]")].map((d) => d.id),
      openPopovers: [...document.querySelectorAll(":popover-open")].map((p) => p.id),
      activeElement: document.activeElement?.outerHTML.slice(0, 160),
    })`);
    page.close();
    console.log(JSON.stringify(out, null, 2));
  },

  async eval([js]) {
    if (!js) fail("usage: eval <js>");
    const page = await Page.connect(readState());
    const value = await page.eval(js);
    page.close();
    transcript(`eval ${js} -> ${JSON.stringify(value)}`);
    console.log(JSON.stringify(value, null, 2));
  },

  async click([selector]) {
    const text = flag("text");
    if (!selector) fail("usage: click <css> [--text T]");
    const page = await Page.connect(readState());
    const box = await page.eval(`(() => {
      const el = ${locate(selector, text)};
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, tag: el.outerHTML.slice(0, 120) };
    })()`);
    for (const type of ["mouseMoved", "mousePressed", "mouseReleased"])
      await page.send("Input.dispatchMouseEvent", { type, x: box.x, y: box.y, button: "left", clickCount: 1 });
    await page.eval(`new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`);
    page.close();
    transcript(`click ${selector}${text ? ` text=${text}` : ""} at (${Math.round(box.x)},${Math.round(box.y)}) -> ${box.tag}`);
    console.log(`clicked ${box.tag}`);
  },

  async hover([selector]) {
    const text = flag("text");
    if (!selector) fail("usage: hover <css> [--text T]");
    const page = await Page.connect(readState());
    const box = await page.eval(`(() => {
      const el = ${locate(selector, text)};
      el.scrollIntoView({ block: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, tag: el.outerHTML.slice(0, 120) };
    })()`);
    await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: box.x, y: box.y });
    await page.eval(`new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`);
    page.close();
    transcript(`hover ${selector}${text ? ` text=${text}` : ""} at (${Math.round(box.x)},${Math.round(box.y)}) -> ${box.tag}`);
    console.log(`hovering ${box.tag}`);
  },

  async wait([ms]) {
    const n = Number(ms);
    if (!Number.isFinite(n) || n < 0 || n > 5000) fail("usage: wait <ms> (0-5000)");
    await Bun.sleep(n);
    transcript(`wait ${n}ms`);
    console.log(`waited ${n}ms`);
  },

  async focus([selector]) {
    const text = flag("text");
    if (!selector) fail("usage: focus <css> [--text T]");
    const page = await Page.connect(readState());
    const tag = await page.eval(`(() => { const el = ${locate(selector, text)}; el.focus(); return document.activeElement === el ? el.outerHTML.slice(0, 120) : null; })()`);
    page.close();
    if (!tag) fail(`${selector} did not take focus`);
    transcript(`focus ${selector} -> ${tag}`);
    console.log(`focused ${tag}`);
  },

  async press([name]) {
    const k = keyFor(name ?? "") ?? fail(`unknown key ${name}; known: ${Object.keys(KEYS).join(", ")}, or one letter/digit`);
    const page = await Page.connect(readState());
    const base = { key: k.key, code: k.code, windowsVirtualKeyCode: k.keyCode, nativeVirtualKeyCode: k.keyCode };
    await page.send("Input.dispatchKeyEvent", { type: k.text ? "keyDown" : "rawKeyDown", ...base, text: k.text });
    await page.send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
    await page.eval(`new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`);
    const active = await page.eval(`document.activeElement?.outerHTML.slice(0, 120)`);
    page.close();
    transcript(`press ${name} -> focus ${active}`);
    console.log(`pressed ${name}; focus now ${active}`);
  },

  async type([text]) {
    if (text === undefined) fail("usage: type <text>");
    const page = await Page.connect(readState());
    await page.send("Input.insertText", { text });
    page.close();
    transcript(`type ${JSON.stringify(text)}`);
    console.log(`typed ${JSON.stringify(text)}`);
  },

  async emulate(pairs) {
    const features = pairs.map((p) => {
      const [name, value] = p.split("=");
      return { name, value };
    });
    const state = readState();
    writeFileSync(STATE_FILE, JSON.stringify({ ...state, emulate: features }, null, 2));
    transcript(`emulate ${pairs.join(" ")}`);
    console.log(`emulating ${pairs.join(" ") || "(cleared)"}`);
  },

  async screenshot([name]) {
    const full = argv.includes("--full");
    if (!name) fail("usage: screenshot <file.png> [--full]");
    const page = await Page.connect(readState());
    const { data } = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: full });
    page.close();
    const path = evidencePath(name);
    writeFileSync(path, Buffer.from(data, "base64"));
    transcript(`screenshot ${path}`);
    console.log(path);
  },

  async aria([name]) {
    if (!name) fail("usage: aria <file.txt>");
    const page = await Page.connect(readState());
    const tree = await axTree(page);
    page.close();
    const path = evidencePath(name);
    writeFileSync(path, tree + "\n");
    transcript(`aria ${path}`);
    console.log(tree);
    console.log(`\nsaved ${path}`);
  },

  async down() {
    if (!existsSync(STATE_FILE)) return console.log(`run "${RUN}" is not up; nothing to stop`);
    const s = readState();
    if (existsSync(join(RUN_DIR, "sr.json"))) spawnSync("bun", [join(import.meta.dir, "sr.ts"), "stop", "--run", RUN], { stdio: "inherit" });
    killTree(s.chrome.pid);
    killTree(s.storybook.pid);
    await sleep(1000);
    const left = [s.chrome.pid, s.storybook.pid].filter(alive);
    if (left.length) fail(`still alive: ${left.join(", ")}; scratch kept at ${RUN_DIR}`);
    if (existsSync(s.storybook.log)) {
      mkdirSync(EVIDENCE_DIR, { recursive: true });
      writeFileSync(join(EVIDENCE_DIR, "storybook.log"), readFileSync(s.storybook.log));
    }
    transcript(`down: killed chrome ${s.chrome.pid} and storybook ${s.storybook.pid}`);
    for (let i = 0; i < 10; i++) {
      try {
        rmSync(RUN_DIR, { recursive: true, force: true });
        break;
      } catch {
        await sleep(500); // Chrome can hold profile files briefly after exit on Windows
      }
    }
    console.log(`stopped run "${RUN}"; evidence kept at ${EVIDENCE_DIR}`);
  },
};

const [cmd = "help", ...rest] = argv;
const run = commands[cmd] ?? (() => fail(`unknown command ${cmd}; try 'help'`));
await run(rest).catch((e) => fail(e instanceof Error ? e.message : String(e)));
process.exit(0);
