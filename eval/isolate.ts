import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { homedir } from "node:os";
import { dirname, join, relative, resolve, win32 } from "node:path";

export type ToolEvent = {
  tool: string;
  server: string | null;
  input: Record<string, unknown>;
  where: string;
};

export type Check =
  | "isolation:canary"
  | "isolation:outside-path"
  | "isolation:t3"
  | "isolation:web-repo"
  | "isolation:no-transcript";

export type Finding = { check: Check; detail: string; where: string };

export type TextFile = { file: string; text: string };

export type Scan = { findings: Finding[]; web: string[] };

type ContentItem = { type?: unknown; id?: unknown; name?: unknown; input?: unknown };

const PATH_FIELDS = new Set(["file_path", "path", "paths", "notebook_path", "target_directory", "directory", "cwd", "working_directory"]);
const GLOB_FIELDS = new Set(["glob_pattern", "glob"]);
const DEVICES = new Set(["/dev/null", "/dev/stdin", "/dev/stdout", "/dev/stderr"]);
const WEB_TOOLS = new Set(["WebFetch", "WebSearch"]);
const MCP_ENVELOPES = new Set(["CallMcpTool", "call_mcp_tool", "CallDynamicTool"]);
const T3_SERVER = /t3[-_]code/i;
const T3_OWN_UI = /^(html_preview|html_render)$|^preview_/;
const REPO = /rakvadium|odd-design/i;
const REPO_IN_SHELL = /github\.com[/:]rakvadium|https?:\/\/\S*odd-design|\bgh\s.*odd-design/i;
const repo = join(import.meta.dir, "..");
const WORD_BREAK = /[\s"'`|;&<>(),=]+/;
const DRIVE = /(?<![a-z])[a-z]:[\\/]/i;
const SEGMENT = /(?:"[^"]*"|'[^']*'|[^"';&|\n])+/g;
const SHELL_WORD = /"([^"]*)"|'([^']*)'|[^\s"']+/g;
const CD = /^(cd|chdir|set-location|sl|pushd|popd)$/i;

type Shell = { cwd: string; stack: string[] };
function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function toEvent(item: ContentItem, where: string): ToolEvent {
  const name = String(item.name);
  const input = record(item.input);
  const claude = /^mcp__(.+?)__(.+)$/.exec(name);
  if (claude) return { tool: claude[2]!, server: claude[1]!, input, where };
  const cursor = /^mcp_(.+?)_(.+)$/.exec(name);
  if (cursor) return { tool: cursor[2]!, server: cursor[1]!, input, where };
  if (MCP_ENVELOPES.has(name)) {
    const server = String(input.server ?? input.namespace ?? "");
    return {
      tool: String(input.toolName ?? input.name ?? ""),
      server: server === "cursor" ? null : server,
      input: record(input.arguments),
      where,
    };
  }
  return { tool: name, server: null, input, where };
}

function toolEvents(transcript: TextFile): ToolEvent[] {
  const events: ToolEvent[] = [];
  const seen = new Set<unknown>();
  transcript.text.split("\n").forEach((line, index) => {
    if (!line.trim()) return;
    const content = record(record(JSON.parse(line)).message).content;
    if (!Array.isArray(content)) return;
    for (const item of content as ContentItem[]) {
      if (item?.type !== "tool_use" || (item.id !== undefined && seen.has(item.id))) continue;
      seen.add(item.id);
      events.push(toEvent(item, `${transcript.file}:${index + 1}`));
    }
  });
  return events;
}

function env(name: string): string | undefined {
  if (/^home$/i.test(name)) return process.env.HOME ?? homedir();
  const key = Object.keys(process.env).find((k) => k.toLowerCase() === name.toLowerCase());
  return key === undefined ? undefined : process.env[key];
}

function expand(raw: string): string | null {
  if (raw === "~" || /^~[\\/]/.test(raw)) return homedir() + raw.slice(1);
  const variable = /^(?:%(\w+)%|\$env:(\w+)|\$\{(\w+)\}|\$(\w+))/i.exec(raw);
  if (variable) {
    const value = env(variable.slice(1).find(Boolean)!);
    return value === undefined ? null : value + raw.slice(variable[0].length);
  }
  const drive = /^\/([a-z])(\/|$)/i.exec(raw);
  if (drive) return `${drive[1]!.toUpperCase()}:\\${raw.slice(3)}`;
  return raw;
}

function looksLikePath(word: string): boolean {
  if (word.startsWith("\\\\")) return true;
  if (/^~([\\/]|$)/.test(word) || /^(%\w+%|\$env:\w+|\$\{?\w+\}?)/i.test(word)) return true;
  if (/^\/[a-z]\//i.test(word) || /^\/[^/]+\/./.test(word)) return !DEVICES.has(word);
  return word.split(/[\\/]/).includes("..");
}

function shellPaths(command: string): string[] {
  return command.split(WORD_BREAK).flatMap((word) => {
    const drive = DRIVE.exec(word);
    if (drive) return [word.slice(drive.index)];
    return looksLikePath(word) ? [word] : [];
  });
}

function resolvePath(base: string, raw: string): string | null {
  const expanded = expand(raw);
  if (expanded === null) return null;
  return expanded.startsWith("/") ? expanded : win32.resolve(base, expanded);
}

function inside(folder: string, path: string): boolean {
  const rel = win32.relative(folder, path);
  return rel === "" || (!rel.startsWith("..") && !win32.isAbsolute(rel));
}

function fieldPaths(event: ToolEvent): string[] {
  return Object.entries(event.input).flatMap(([field, value]) =>
    PATH_FIELDS.has(field) || GLOB_FIELDS.has(field) || (field === "pattern" && event.tool === "Glob") ? strings(value) : [],
  );
}

function commandPaths(shell: Shell, command: string): [string, string | null][] {
  return [...command.matchAll(SEGMENT)].flatMap(([segment]): [string, string | null][] => {
    const [verb, ...args] = [...segment.matchAll(SHELL_WORD)].map((m) => m[1] ?? m[2] ?? m[0]);
    if (verb === undefined || !CD.test(verb)) return shellPaths(segment).map((raw) => [raw, resolvePath(shell.cwd, raw)]);
    if (/^popd$/i.test(verb)) {
      shell.cwd = shell.stack.pop() ?? shell.cwd;
      return [];
    }
    const target = args.find((arg) => !/^-./.test(arg) && !/^\/d$/i.test(arg)) ?? "~";
    const next = target === "-" ? null : resolvePath(shell.cwd, target);
    if (next === null) return [];
    if (/^pushd$/i.test(verb)) shell.stack.push(shell.cwd);
    shell.cwd = next;
    return [[target, next]];
  });
}

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (typeof value === "object" && value !== null) return Object.values(value).flatMap(strings);
  return [];
}

function webTarget(event: ToolEvent): string | null {
  const url = event.input.url;
  if (typeof url === "string") return url;
  if (!WEB_TOOLS.has(event.tool)) return null;
  return strings(event.input).join(" ");
}

function eventFindings(folder: string, shell: Shell, event: ToolEvent): Finding[] {
  const findings: Finding[] = [];
  const label = event.server ? `${event.server}/${event.tool}` : event.tool;
  const paths = [
    ...fieldPaths(event).map((raw): [string, string | null] => [raw, resolvePath(folder, raw)]),
    ...strings(event.input.command).flatMap((command) => commandPaths(shell, command)),
  ];
  for (const [raw, resolved] of paths) {
    if (resolved !== null && !inside(folder, resolved)) {
      findings.push({ check: "isolation:outside-path", detail: `${label} ${raw} -> ${resolved}`, where: event.where });
    }
  }
  const t3 = event.server !== null && T3_SERVER.test(event.server) && !T3_OWN_UI.test(event.tool);
  if (t3 || event.tool === "SearchConversations") {
    findings.push({ check: "isolation:t3", detail: label, where: event.where });
  }
  const web = webTarget(event);
  const repoCommand = strings(event.input.command).find((c) => REPO_IN_SHELL.test(c));
  if ((web !== null && REPO.test(web)) || repoCommand !== undefined) {
    findings.push({ check: "isolation:web-repo", detail: `${label} ${web ?? repoCommand}`, where: event.where });
  }
  return findings;
}

export function scanLog(run: { folder: string; tokens: string[]; transcripts: TextFile[]; folderFiles: TextFile[] }): Scan {
  const logs = run.transcripts.filter((t) => t.file.endsWith(".jsonl"));
  if (logs.length === 0) {
    return { findings: [{ check: "isolation:no-transcript", detail: "no transcript", where: run.folder }], web: [] };
  }
  const canaries = run.tokens.flatMap((token): Finding[] => {
    const hit = [...run.transcripts, ...run.folderFiles].find((f) => f.text.includes(token));
    return hit ? [{ check: "isolation:canary", detail: token, where: hit.file }] : [];
  });
  const transcripts = logs.map(toolEvents);
  const pathFindings = transcripts.flatMap((events) => {
    const shell: Shell = { cwd: run.folder, stack: [] };
    return events.flatMap((e) => eventFindings(run.folder, shell, e));
  });
  return {
    findings: [...canaries, ...pathFindings],
    web: transcripts.flat().flatMap((e) => webTarget(e) ?? []),
  };
}

function transcriptDirs(folder: string): string[] {
  return [
    join(homedir(), ".claude", "projects", folder.replace(/[^A-Za-z0-9]/g, "-")),
    join(homedir(), ".cursor", "projects", folder.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "")),
  ];
}

function readTree(dir: string, skip: Set<string>): TextFile[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name))
    .filter((file) => !relative(dir, file).split(/[\\/]/).some((part) => skip.has(part)))
    .map((file) => ({ file, text: readFileSync(file, "latin1") }));
}

function tokenFile(checkout: string): string {
  const common = Bun.spawnSync(["git", "rev-parse", "--git-common-dir"], { cwd: checkout }).stdout.toString().trim();
  return join(resolve(checkout, common), "odd-eval", "tokens.txt");
}

export function issueToken(checkout: string, runId: string): string {
  const token = `k${randomBytes(12).toString("hex")}`;
  const file = tokenFile(checkout);
  mkdirSync(dirname(file), { recursive: true });
  appendFileSync(file, `${runId}\t${token}\n`);
  return token;
}

export function readTokens(checkout: string): string[] {
  return readFileSync(tokenFile(checkout), "utf8")
    .split("\n")
    .flatMap((line) => line.split("\t")[1]?.trim() || []);
}

export function scan(runId: string): number {
  const runDir = join(repo, ".verify", "eval", "runs", runId);
  const { folder } = JSON.parse(readFileSync(join(runDir, "launch.json"), "utf8")) as { folder: string };
  const tokens = readTokens(repo);
  const transcripts = transcriptDirs(folder).flatMap((dir) => readTree(dir, new Set()));
  const folderFiles = readTree(folder, new Set(["node_modules", ".git"]));
  const result = scanLog({ folder, tokens, transcripts, folderFiles });
  const report = { runId, folder, transcripts: transcripts.map((t) => t.file), ...result };
  writeFileSync(join(runDir, "isolation.json"), `${JSON.stringify(report, null, 2)}\n`);
  for (const f of result.findings) console.log(`${f.check}  ${f.detail}  (${f.where})`);
  for (const url of result.web) console.log(`web  ${url}`);
  console.log(`isolation: ${result.findings.length} findings`);
  return result.findings.length === 0 ? 0 : 1;
}
