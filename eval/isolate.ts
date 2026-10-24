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
const COMMAND_FIELDS = new Set(["command"]);
const DEVICES = new Set(["/dev/null", "/dev/stdin", "/dev/stdout", "/dev/stderr"]);
const WEB_TOOLS = new Set(["WebFetch", "WebSearch"]);
const MCP_ENVELOPES = new Set(["CallMcpTool", "call_mcp_tool", "CallDynamicTool"]);
const T3_SERVER = /t3[-_]code/i;
const T3_CROSS_THREAD = /thread|task|queue/i;
const REPO = /rakvadium|odd-design/i;
const REPO_IN_SHELL = /github\.com[/:]rakvadium|https?:\/\/\S*odd-design|\bgh\s.*odd-design/i;
const repo = join(import.meta.dir, "..");
const SHELL_TOKEN = /"([^"]*)"|'([^']*)'|[^\s"'|;&<>()]+/g;

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

function looksLikePath(token: string): boolean {
  if (/^[a-z]:([\\/]|$)/i.test(token) || token.startsWith("\\\\")) return true;
  if (/^~([\\/]|$)/.test(token) || /^(%\w+%|\$env:\w+|\$\{?\w+\}?)/i.test(token)) return true;
  if (/^\/[a-z]\//i.test(token) || /^\/[^/]+\/./.test(token)) return !DEVICES.has(token);
  return token.split(/[\\/]/).includes("..");
}

function shellPaths(command: string): string[] {
  return [...command.matchAll(SHELL_TOKEN)]
    .map((m) => m[1] ?? m[2] ?? m[0])
    .map((token) => (/^-[^=]*=/.test(token) ? token.slice(token.indexOf("=") + 1) : token))
    .filter(looksLikePath);
}

function rawPaths(event: ToolEvent): string[] {
  const paths: string[] = [];
  for (const [field, value] of Object.entries(event.input)) {
    const values = (Array.isArray(value) ? value : [value]).filter((v): v is string => typeof v === "string");
    if (PATH_FIELDS.has(field) || GLOB_FIELDS.has(field) || (field === "pattern" && event.tool === "Glob")) paths.push(...values);
    if (COMMAND_FIELDS.has(field)) paths.push(...values.flatMap(shellPaths));
  }
  return paths;
}

function outside(folder: string, raw: string): string | null {
  const expanded = expand(raw);
  if (expanded === null) return null;
  if (expanded.startsWith("/")) return expanded;
  const resolved = win32.resolve(folder, expanded);
  const rel = win32.relative(folder, resolved);
  return rel === "" || (!rel.startsWith("..") && !win32.isAbsolute(rel)) ? null : resolved;
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

function eventFindings(folder: string, event: ToolEvent): Finding[] {
  const findings: Finding[] = [];
  const label = event.server ? `${event.server}/${event.tool}` : event.tool;
  for (const raw of rawPaths(event)) {
    const resolved = outside(folder, raw);
    if (resolved !== null) findings.push({ check: "isolation:outside-path", detail: `${label} ${raw} -> ${resolved}`, where: event.where });
  }
  const crossThread = event.server !== null && T3_SERVER.test(event.server) && T3_CROSS_THREAD.test(event.tool);
  if (crossThread || event.tool === "SearchConversations") {
    findings.push({ check: "isolation:t3", detail: label, where: event.where });
  }
  const web = webTarget(event);
  const shell = strings(event.input.command).find((c) => REPO_IN_SHELL.test(c));
  if ((web !== null && REPO.test(web)) || shell !== undefined) {
    findings.push({ check: "isolation:web-repo", detail: `${label} ${web ?? shell}`, where: event.where });
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
  const events = logs.flatMap(toolEvents);
  return {
    findings: [...canaries, ...events.flatMap((e) => eventFindings(run.folder, e))],
    web: events.flatMap((e) => webTarget(e) ?? []),
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
