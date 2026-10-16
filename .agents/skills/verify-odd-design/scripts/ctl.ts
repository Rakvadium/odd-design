#!/usr/bin/env bun
// Verification harness for the odd-design Storybook. Zero dependencies: Bun + a local Chromium over CDP.
// Usage: bun .agents/skills/verify-odd-design/scripts/ctl.ts <command> [args] [--run NAME]
// Run `ctl.ts help` for the command list.
import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";

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
  chrome: { pid: number; port: number; binary: string; profile: string };
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
};

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
      lines.push(`${"  ".repeat(depth)}- ${role}${name ? ` ${JSON.stringify(name)}` : ""}${value}${props.length ? ` [${props.join(", ")}]` : ""}`);
      next = depth + 1;
    }
    for (const c of node.childIds ?? []) if (byId.has(c)) walk(byId.get(c), next);
  };
  walk(nodes[0], 0);
  return lines.join("\n");
}

// ---------- commands ----------

const commands: Record<string, (args: string[]) => Promise<void>> = {
  async help() {
    console.log(`ctl.ts <command> [--run NAME]   (run defaults to $VERIFY_RUN or "default")
  up                                   start Storybook + headless Chrome on free ports, wait until ready
  doctor                               read-only health check of this run's instances
  goto <storyId> [globals] [args]      open a story iframe; globals like "chrome:glass;palette:aurora;mode:dark"
  state                                print html[data-*] appearance + story-root summary
  eval <js>                            evaluate JS in the page (awaits promises), print JSON
  click <css> [--text T]               real mouse click on the first match (optionally whose text contains T)
  focus <css> [--text T]               focus the first match
  press <Key>                          real key press: ${Object.keys(KEYS).join(", ")}
  type <text>                          insert text at the focused element
  emulate <feature=value>...           media features, e.g. prefers-color-scheme=dark prefers-reduced-motion=reduce
  screenshot <file.png> [--full]       save to .verify/evidence/<run>/ (or an absolute path)
  aria <file.txt>                      save an accessibility-tree snapshot to the evidence dir and print it
  down                                 kill what this run started and delete its scratch dir (evidence is kept)`);
  },

  async up() {
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
    const chrome = spawn(
      binary,
      [`--remote-debugging-port=${cdpPort}`, `--user-data-dir=${profile}`, "--headless=new", "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--window-size=1280,900", "about:blank"],
      { detached: true, stdio: "ignore", windowsHide: true },
    );
    chrome.unref();
    const head = spawnSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT, encoding: "utf8" }).stdout.trim();
    const state: State = {
      run: RUN,
      head,
      storybook: { pid: sb.pid!, port: sbPort, url: `http://127.0.0.1:${sbPort}`, log },
      chrome: { pid: chrome.pid!, port: cdpPort, binary, profile },
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
    // Storybook expects literal ":" and ";" in globals/args, so build the query by hand.
    const url = `${s.storybook.url}/iframe.html?id=${id}&viewMode=story${globals ? `&globals=${globals}` : ""}${args ? `&args=${args}` : ""}`;
    const page = await Page.connect(s);
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
    const html = await page.eval(`({...document.documentElement.dataset})`);
    page.close();
    transcript(`goto ${url} -> rendered, html data=${JSON.stringify(html)}`);
    console.log(`rendered ${id} at ${url}\nhtml data: ${JSON.stringify(html)}`);
  },

  async state() {
    const page = await Page.connect(readState());
    const out = await page.eval(`({
      url: location.href,
      html: {...document.documentElement.dataset},
      scopes: [...document.querySelectorAll(".ds-scope")].slice(0, 20).map((el) => ({...el.dataset})),
      openDialogs: [...document.querySelectorAll("dialog[open]")].map((d) => d.id),
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
    const k = KEYS[name ?? ""] ?? fail(`unknown key ${name}; known: ${Object.keys(KEYS).join(", ")}`);
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
