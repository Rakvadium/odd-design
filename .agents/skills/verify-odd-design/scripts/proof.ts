// Owns the verify transcript format and everything proof derives from it. No fs, git, or network.

export type Scheme = "light" | "dark";

/**
 * One transcript line. ctl.ts writes only these, through formatEvent, so every line it writes is
 * one buildProof can read. Paths are relative to the run's evidence dir, with forward slashes.
 */
export type Event =
  | { readonly kind: "up"; readonly storybook: string; readonly head: string }
  | { readonly kind: "down" }
  | { readonly kind: "restart-chrome"; readonly pid: number }
  | { readonly kind: "axe"; readonly appearance: string; readonly stories: number; readonly violations: number; readonly needsReview: number }
  | { readonly kind: "goto"; readonly story: string; readonly url: string; readonly html: Readonly<Record<string, string>> }
  | { readonly kind: "click" | "hover" | "focus"; readonly target: string; readonly text?: string; readonly tag: string }
  | { readonly kind: "press"; readonly key: string; readonly focus: string }
  | { readonly kind: "type"; readonly text: string }
  | { readonly kind: "wait"; readonly ms: number }
  | { readonly kind: "emulate"; readonly features: readonly string[] }
  /** scheme is what the page rendered when the PNG was taken, measured in the page, not inferred. */
  | { readonly kind: "screenshot"; readonly path: string; readonly full: boolean; readonly scheme: Scheme }
  | { readonly kind: "eval"; readonly js: string; readonly result?: unknown }
  | { readonly kind: "aria"; readonly path: string }
  | { readonly kind: "state"; readonly dialogs: readonly string[]; readonly popovers: readonly string[]; readonly focus: string };

/** `[2026-10-31T10:00:00.000Z] press {"key":"Tab","focus":"<button …>"}`. The kind, then the rest as JSON. */
export function formatEvent(event: Event, at: Date): string {
  const { kind, ...rest } = event;
  return `[${at.toISOString()}] ${kind} ${JSON.stringify(rest)}`;
}

/** The default run name. "feat/encode-verify" -> "feat-encode-verify". Detached HEAD (empty) -> "default". */
export function branchSlug(branch: string): string {
  return (
    branch
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "default"
  );
}

export type ProofInput = {
  /** Header only. head and base are short SHAs; base is the merge-base with origin/main. */
  readonly run: string;
  readonly branch: string;
  readonly head: string;
  readonly base: string;
  /** transcript.log as written. Only lines after the last `up` count. */
  readonly transcript: string;
  /** `git diff -U0 --no-renames --no-color` of the working tree against base, with a/ and b/ prefixes, whole repo. Filtered here. */
  readonly diff: string;
  /** `git ls-files --others --exclude-standard`, repo-relative. New story files arrive here. */
  readonly untracked: readonly string[];
  /** The /index.json body as fetched from the run's Storybook. Parsed here. */
  readonly index: unknown;
  /** Current text of a repo-relative file, for locating story exports. Asked only for modified story files. */
  readonly source: (path: string) => string | undefined;
  /** Repo-relative paths the commits from `from` to HEAD touch. Asked only when HEAD moved since the last `up`. */
  readonly changedSince: (from: string) => readonly string[];
};

export type Proof = {
  readonly ok: boolean;
  /** One line per requirement, for the terminal: "ok …", "MISSING …", "STALE …", "BAD …", "note …". */
  readonly report: readonly string[];
  /** Evidence-relative PNG paths the body links, deduplicated, in table order. Empty unless ok. */
  readonly cited: readonly string[];
  /** The PROOF.md body. image maps a cited path to the img src: identity locally, a pinned URL when published. */
  render(image: (path: string) => string): string;
};

export function buildProof(input: ProofInput): Proof {
  const diff = parseDiff(input.diff);
  const unreadable = diff.unreadable.map((line) => `BAD diff header does not parse, so its file maps to nothing: ${clip(line)}`);
  const requirement = requiredStories(diff.files, input);
  if (requirement.kind === "none") {
    if (unreadable.length)
      return {
        ok: false,
        report: unreadable,
        cited: [],
        render: () => [header("incomplete", input), "**Missing:**", ...unreadable.map((p) => `- ${p}`), ""].join("\n"),
      };
    return {
      ok: true,
      report: ["ok nothing under src/, stories/, or .storybook/ changed; no proof needed"],
      cited: [],
      render: () => `${header("not needed", input)}\nNo file under \`src/\`, \`stories/\`, or \`.storybook/\` changed, so no story needs proof.\n`,
    };
  }

  const session = lastSession(input.transcript);
  const all = segments(withoutOverwrittenShots(session.events));
  const problems = [
    ...unreadable,
    ...session.bad.map((b) => `BAD transcript line ${b.line} after the last up does not parse: ${clip(b.text)}`),
    ...staleness(session.head, input),
    ...requirement.unindexed.map((u) => `MISSING ${u}: no row in the live index; the story failed to load or Storybook is stale`),
  ];

  const judged = (requirement.kind === "stories" ? requirement.ids : [...new Set(all.map((s) => s.story))]).map((story) => ({
    story,
    pairs: SCHEMES.map((scheme) => judge(story, scheme, all)),
  }));
  const proven = judged.filter((j) => j.pairs.every((p) => p.kind === "proven"));
  const covered = requirement.kind === "stories" ? proven.length === judged.length : proven.length > 0;
  const gaps = judged.flatMap((j) => j.pairs.flatMap((p) => (p.kind === "gap" ? [`MISSING ${p.story} ${p.scheme}: ${MISSING_TEXT[p.missing](p.scheme)}`] : [])));
  if (requirement.kind === "any" && !covered) gaps.push("MISSING one story proven in both light and dark that renders the changed files");

  const shownGaps = requirement.kind === "stories" || !covered ? gaps : [];
  const ok = problems.length === 0 && covered;
  const rows = (requirement.kind === "stories" ? judged : proven).flatMap((j) => j.pairs.flatMap((p) => (p.kind === "proven" ? [p] : [])));
  const notes = requirement.unmapped.map((f) =>
    requirement.kind === "stories"
      ? `note ${f} changed and no story maps to it; PROOF.md names it for the reviewer`
      : `note ${f} changed and no story maps to it; prove at least one story that renders it`,
  );
  const report = [
    ...problems,
    ...proven.map((j) => `ok ${j.story} light dark`),
    ...shownGaps,
    ...notes,
  ];

  return {
    ok,
    report,
    cited: ok ? [...new Set(rows.flatMap((r) => [r.before.path, r.after.path]))] : [],
    render: (image) => renderProof(input, requirement, ok, [...problems, ...shownGaps], rows, image),
  };
}

// Private below: tests and ctl.ts reach none of it except through buildProof.

type Kind = Event["kind"];
type Role = "boundary" | "goto" | "interaction" | "shot" | "read" | "neutral";

/** Adding an Event kind without a role fails the typecheck. focus calls el.focus(), which no user does, so it is neutral. */
const ROLE = {
  up: "boundary",
  down: "boundary",
  "restart-chrome": "boundary",
  axe: "boundary",
  goto: "goto",
  click: "interaction",
  hover: "interaction",
  press: "interaction",
  type: "interaction",
  focus: "neutral",
  wait: "neutral",
  emulate: "neutral",
  screenshot: "shot",
  eval: "read",
  aria: "read",
  state: "read",
} as const satisfies Record<Kind, Role>;

type KindsOf<R extends Role> = { [K in Kind]: (typeof ROLE)[K] extends R ? K : never }[Kind];
type Interaction = Event & { readonly kind: KindsOf<"interaction"> };
type Read = Event & { readonly kind: KindsOf<"read"> };
type Shot = Extract<Event, { kind: "screenshot" }>;
const isInteraction = (e: Event): e is Interaction => ROLE[e.kind] === "interaction";
const isRead = (e: Event): e is Read => ROLE[e.kind] === "read";

type Field = "string" | "string?" | "number" | "boolean" | "strings" | "record" | "scheme" | "any";

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const CHECK: Record<Field, (v: unknown) => boolean> = {
  string: (v) => typeof v === "string",
  "string?": (v) => v === undefined || typeof v === "string",
  number: (v) => typeof v === "number",
  boolean: (v) => typeof v === "boolean",
  strings: (v) => Array.isArray(v) && v.every((x) => typeof x === "string"),
  record: (v) => isRecord(v) && Object.values(v).every((x) => typeof x === "string"),
  scheme: (v) => v === "light" || v === "dark",
  any: () => true,
};

const TARGET = { target: "string", text: "string?", tag: "string" } as const;
/** The fields each kind must carry for its line to parse. */
const SHAPE = {
  up: { storybook: "string", head: "string" },
  down: {},
  "restart-chrome": { pid: "number" },
  axe: { appearance: "string", stories: "number", violations: "number", needsReview: "number" },
  goto: { story: "string", url: "string", html: "record" },
  click: TARGET,
  hover: TARGET,
  focus: TARGET,
  press: { key: "string", focus: "string" },
  type: { text: "string" },
  wait: { ms: "number" },
  emulate: { features: "strings" },
  screenshot: { path: "string", full: "boolean", scheme: "scheme" },
  eval: { js: "string", result: "any" },
  aria: { path: "string" },
  state: { dialogs: "strings", popovers: "strings", focus: "string" },
} as const satisfies Record<Kind, Record<string, Field>>;

function parseEvent(line: string): Event | undefined {
  const m = /^\[[^\]]+\] (\S+) (\{.*\})$/.exec(line);
  if (!m || !Object.hasOwn(SHAPE, m[1])) return undefined;
  const kind = m[1] as Kind;
  let body: unknown;
  try {
    body = JSON.parse(m[2]);
  } catch {
    return undefined;
  }
  if (!isRecord(body)) return undefined;
  const fields: Record<string, Field> = SHAPE[kind];
  for (const [name, field] of Object.entries(fields)) if (!CHECK[field](body[name])) return undefined;
  return { ...body, kind } as Event;
}

type Session = { readonly head: string | undefined; readonly events: readonly Event[]; readonly bad: readonly { line: number; text: string }[] };

/** The events after the last `up`. Earlier lines, including ones from older transcript formats, are history. */
function lastSession(text: string): Session {
  const lines = text.split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i--) {
    const up = parseEvent(lines[i]);
    if (up?.kind !== "up") continue;
    const events: Event[] = [];
    const bad: { line: number; text: string }[] = [];
    lines.slice(i + 1).forEach((line, j) => {
      if (!line.trim()) return;
      const event = parseEvent(line);
      if (event) events.push(event);
      else bad.push({ line: i + j + 2, text: line });
    });
    return { head: up.head, events, bad };
  }
  return { head: undefined, events: [], bad: [] };
}

function staleness(upHead: string | undefined, input: ProofInput): string[] {
  if (upHead === undefined || upHead === input.head) return [];
  const touched = input.changedSince(upHead).filter(isUiPath);
  if (!touched.length) return [];
  return [`STALE HEAD moved from ${upHead} to ${input.head} since the last up, and those commits touch ${touched.join(", ")}; restart the run (ctl.ts down, ctl.ts up) and drive the stories again`];
}

/**
 * screenshot overwrites its file, so only the last event for a path describes a PNG that still exists.
 * Paths compare case-insensitively because Windows and macOS file systems do.
 */
function withoutOverwrittenShots(events: readonly Event[]): Event[] {
  const last = new Map<string, Event>();
  for (const e of events) if (e.kind === "screenshot") last.set(e.path.toLowerCase(), e);
  return events.filter((e) => e.kind !== "screenshot" || last.get(e.path.toLowerCase()) === e);
}

/** Events from one goto up to the next goto or boundary. A goto reloads the page, so evidence never spans one. */
type Segment = { readonly story: string; readonly html: Readonly<Record<string, string>>; readonly events: Event[] };

function segments(events: readonly Event[]): Segment[] {
  const out: Segment[] = [];
  let current: Segment | undefined;
  for (const e of events) {
    if (e.kind === "goto") out.push((current = { story: e.story, html: e.html, events: [] }));
    else if (ROLE[e.kind] === "boundary") current = undefined;
    else current?.events.push(e);
  }
  return out;
}

const SCHEMES = ["light", "dark"] as const satisfies readonly Scheme[];

type Missing = "goto" | "before" | "interaction" | "after" | "read";
const MISSING_TEXT: Record<Missing, (s: Scheme) => string> = {
  goto: () => "no goto",
  before: (s) => `no ${s} screenshot before the first interaction`,
  interaction: () => "no interaction (click, hover, press, or type)",
  after: (s) => `no ${s} screenshot after an interaction`,
  read: () => "no read (eval, aria, or state) after an interaction",
};

type Pair =
  | {
      readonly kind: "proven";
      readonly story: string;
      readonly scheme: Scheme;
      readonly html: Readonly<Record<string, string>>;
      readonly before: Shot;
      readonly actions: readonly Interaction[];
      readonly after: Shot;
      readonly read: Read;
    }
  | { readonly kind: "gap"; readonly story: string; readonly scheme: Scheme; readonly missing: Missing };

const STEPS = ["before", "interaction", "after", "read"] as const satisfies readonly Missing[];

type SegmentVerdict = { readonly pair: Pair; readonly progress: number };

/** A shot of the scheme before the first interaction, an interaction, then a shot of the scheme and a read after it. */
function judgeSegment(segment: Segment, scheme: Scheme): SegmentVerdict {
  const { story, events } = segment;
  const first = events.findIndex(isInteraction);
  const shotOf = (e: Event): e is Shot => e.kind === "screenshot" && e.scheme === scheme;
  const before = (first === -1 ? events : events.slice(0, first)).findLast(shotOf);
  const rest = first === -1 ? [] : events.slice(first + 1);
  const after = rest.findLast(shotOf);
  const read = rest.findLast(isRead);
  if (before && after && read) {
    const actions = events.slice(0, events.indexOf(after)).filter(isInteraction);
    return { pair: { kind: "proven", story, scheme, html: segment.html, before, actions, after, read }, progress: 4 };
  }
  const reached = [before, first !== -1, after, read].map(Boolean).indexOf(false);
  return { pair: { kind: "gap", story, scheme, missing: STEPS[reached] }, progress: reached };
}

/** The latest proven segment wins. Otherwise the gap names the first missing piece of the segment that got furthest. */
function judge(story: string, scheme: Scheme, all: readonly Segment[]): Pair {
  let best: SegmentVerdict = { pair: { kind: "gap", story, scheme, missing: "goto" }, progress: -1 };
  for (const segment of all) {
    if (segment.story !== story) continue;
    const verdict = judgeSegment(segment, scheme);
    if (verdict.progress >= best.progress) best = verdict;
  }
  return best.pair;
}

/** What render-affecting means. AGENTS.md states the same three paths in prose. */
const UI_PATHS = ["src/", "stories/", ".storybook/"] as const;
const STORY_FILE = /^stories\/.+\.stories\.ts$/;
const isUiPath = (path: string) => UI_PATHS.some((p) => path.startsWith(p));

/** 1-based inclusive lines in the new file. A pure deletion touches the line above it (or line 1). */
type LineRange = { readonly start: number; readonly end: number };
type FileChange =
  | { readonly kind: "whole"; readonly path: string }
  | { readonly kind: "lines"; readonly path: string; readonly lines: readonly LineRange[] }
  | { readonly kind: "deleted"; readonly path: string };

const C_ESCAPES: Readonly<Record<string, number>> = { a: 7, b: 8, t: 9, n: 10, v: 11, f: 12, r: 13, '"': 34, "\\": 92 };

/** Undoes git's C-style path quoting. Octal escapes are UTF-8 bytes, so decode the bytes together. */
function unquote(quoted: string): string {
  const bytes: number[] = [];
  for (const [whole, escape] of quoted.matchAll(/\\([0-7]{3}|.)|[^\\]+/gs)) {
    if (escape === undefined) bytes.push(...new TextEncoder().encode(whole));
    else bytes.push(escape.length === 3 ? parseInt(escape, 8) : (C_ESCAPES[escape] ?? escape.charCodeAt(0)));
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

/** The path in a `diff --git` header. With --no-renames both sides name the same path, which splits an unquoted header that contains spaces. */
function headerPath(line: string): string | undefined {
  const quoted = /^diff --git "a\/((?:[^"\\]|\\.)*)" "b\/((?:[^"\\]|\\.)*)"$/.exec(line);
  if (quoted) return quoted[1] === quoted[2] ? unquote(quoted[2]) : undefined;
  return /^diff --git a\/(.+) b\/\1$/.exec(line)?.[1];
}

type Diff = { readonly files: readonly FileChange[]; readonly unreadable: readonly string[] };

function parseDiff(diff: string): Diff {
  const files: FileChange[] = [];
  const unreadable: string[] = [];
  let current: { path: string; kind: FileChange["kind"]; lines: LineRange[] } | undefined;
  const flush = () => {
    if (!current) return;
    const { path, kind, lines } = current;
    // A modified file with no hunks (a mode change) has no line to map, so it counts as a whole-file change.
    files.push(kind === "lines" && lines.length ? { kind, path, lines } : kind === "deleted" ? { kind, path } : { kind: "whole", path });
  };
  for (const line of diff.split(/\r?\n/)) {
    if (line.startsWith("diff --git ")) {
      flush();
      const path = headerPath(line);
      if (path === undefined) unreadable.push(line);
      current = path === undefined ? undefined : { path, kind: "lines", lines: [] };
    } else if (!current) continue;
    else if (line.startsWith("new file mode")) current.kind = "whole";
    else if (line.startsWith("deleted file mode")) current.kind = "deleted";
    else {
      const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line);
      if (!hunk) continue;
      const start = Math.max(Number(hunk[1]), 1);
      const count = hunk[2] === undefined ? 1 : Number(hunk[2]);
      current.lines.push({ start, end: start + Math.max(count, 1) - 1 });
    }
  }
  flush();
  return { files, unreadable };
}

type Span = { readonly name: string | undefined; readonly start: number; readonly end: number };

const STATEMENT = /^(?:export |import |const |let |var |function |async |class |type |interface |enum |declare )/;
const COMMENT = /^\s*(?:\/\/|\/\*|\*)/;

/** Top-level statement spans of a story file. Every top-level statement in stories/ starts at column 0. */
function statementSpans(source: string): Span[] {
  const lines = source.split(/\r?\n/);
  const starts: { name: string | undefined; start: number }[] = [];
  lines.forEach((line, i) => {
    if (!STATEMENT.test(line)) return;
    let start = i;
    while (start > 0 && COMMENT.test(lines[start - 1])) start--;
    starts.push({ name: /^export const (\w+)/.exec(line)?.[1], start: start + 1 });
  });
  if (!starts.length || starts[0].start > 1) starts.unshift({ name: undefined, start: 1 });
  return starts.map((s, i) => ({ ...s, end: (starts[i + 1]?.start ?? lines.length + 1) - 1 }));
}

type StoryEntry = { readonly id: string; readonly file: string; readonly exportName: string };

function parseIndex(index: unknown): StoryEntry[] {
  const entries = isRecord(index) && isRecord(index.entries) ? Object.values(index.entries) : [];
  return entries.flatMap((e) =>
    isRecord(e) && e.type === "story" && typeof e.id === "string" && typeof e.importPath === "string" && typeof e.exportName === "string"
      ? [{ id: e.id, file: e.importPath.replace(/^\.\//, ""), exportName: e.exportName }]
      : [],
  );
}

type Requirement =
  | { readonly kind: "none" }
  | { readonly kind: "stories"; readonly ids: readonly string[]; readonly unmapped: readonly string[]; readonly unindexed: readonly string[] }
  | { readonly kind: "any"; readonly unmapped: readonly string[]; readonly unindexed: readonly string[] };

/**
 * A changed line inside an `export const <Name>` span requires that story. Any other changed line in a
 * story file (imports, meta, helpers) requires every story in the file, so an unsure mapping over-requires.
 */
function requiredStories(files: readonly FileChange[], input: ProofInput): Requirement {
  const changes = [...files, ...input.untracked.map((path): FileChange => ({ kind: "whole", path }))].filter((c) => isUiPath(c.path));
  if (!changes.length) return { kind: "none" };
  const index = parseIndex(input.index);
  const ids = new Set<string>();
  const unmapped: string[] = [];
  const unindexed = new Set<string>();
  for (const change of changes) {
    if (change.kind === "deleted" || !STORY_FILE.test(change.path)) {
      unmapped.push(change.path);
      continue;
    }
    const rows = index.filter((r) => r.file === change.path);
    const wholeFile = () => (rows.length ? rows.forEach((r) => ids.add(r.id)) : unindexed.add(change.path));
    const source = change.kind === "lines" ? input.source(change.path) : undefined;
    if (change.kind === "whole" || source === undefined) {
      wholeFile();
      continue;
    }
    const spans = statementSpans(source);
    for (const span of spans.filter((s) => change.lines.some((l) => l.start <= s.end && l.end >= s.start))) {
      const row = span.name === undefined ? undefined : rows.find((r) => r.exportName === span.name);
      if (span.name === undefined) wholeFile();
      else if (row) ids.add(row.id);
      else unindexed.add(`${change.path} export ${span.name}`);
    }
  }
  return ids.size
    ? { kind: "stories", ids: [...ids], unmapped, unindexed: [...unindexed] }
    : { kind: "any", unmapped, unindexed: [...unindexed] };
}

const clip = (s: string, max = 120) => {
  const flat = s.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
};
/** An inline code span that survives a GFM table cell. */
const code = (s: string) => {
  const text = clip(s).replaceAll("|", "\\|");
  return text.includes("`") ? `\`\` ${text} \`\`` : `\`${text}\``;
};

const header = (status: string, input: ProofInput) =>
  `## Verify proof: ${status}\n\nBranch \`${input.branch}\` at \`${input.head}\`, base \`${input.base}\` (merge-base with \`origin/main\`), run \`${input.run}\`. HTML Storybook in Chrome.\n`;

const describeAction = (a: Interaction) => {
  switch (a.kind) {
    case "press":
      return `press ${code(a.key)}`;
    case "type":
      return `type ${code(JSON.stringify(a.text))}`;
    default:
      return `${a.kind} ${code(a.target)}${a.text === undefined ? "" : ` with text ${code(a.text)}`}`;
  }
};

const describeRead = (r: Read) => {
  switch (r.kind) {
    case "eval":
      return `eval ${code(r.js)} → ${code(JSON.stringify(r.result) ?? "undefined")}`;
    case "aria":
      return `aria ${code(r.path)}`;
    case "state":
      return `state: focus ${code(r.focus)}`;
  }
};

const theme = (html: Readonly<Record<string, string>>, scheme: Scheme) =>
  [html.chrome ?? "?", html.palette ?? "?", html.mode === scheme ? scheme : `${html.mode ?? "?"} (${scheme})`].join(" · ");

function renderProof(
  input: ProofInput,
  requirement: Exclude<Requirement, { kind: "none" }>,
  ok: boolean,
  problems: readonly string[],
  rows: readonly Extract<Pair, { kind: "proven" }>[],
  image: (path: string) => string,
): string {
  const list = (items: readonly string[]) => items.map((i) => `\`${i}\``).join(", ");
  const img = (path: string, alt: string) => `<img src="${image(path)}" width="280" alt="${alt}">`;
  return [
    header(ok ? "passed" : "incomplete", input),
    requirement.kind === "stories"
      ? `**Changed stories:** ${list(requirement.ids)}.`
      : "**Changed stories:** none. One story proven in both light and dark covers the files below.",
    ...(requirement.unmapped.length ? [`**Changed files no story maps to:** ${list(requirement.unmapped)}.`] : []),
    ...(problems.length ? ["", "**Missing:**", ...problems.map((p) => `- ${p}`)] : []),
    ...(rows.length
      ? [
          "",
          "| Story | Theme | Action | Screenshot | Read |",
          "| --- | --- | --- | --- | --- |",
          ...rows.map(
            (r) =>
              `| \`${r.story}\` | ${theme(r.html, r.scheme)} | ${r.actions.map(describeAction).join(", ")} | ${img(r.before.path, "before")} ${img(r.after.path, "after")} | ${describeRead(r.read)} |`,
          ),
          "",
          "Each row is one `goto`. The left image is before the first action, the right is after it, and the read was taken after the action.",
        ]
      : []),
    "",
  ].join("\n");
}
