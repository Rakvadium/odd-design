// Read-only consistency and tokens audit. Prints the literal table, the token graph, and the module-shape
// matrix that docs/plans/consistency-tokens-audit.md defines.
//   bun scripts/audit-consistency.ts                   all three tables and the stats, as Markdown
//   bun scripts/audit-consistency.ts --write           refresh the generated sections of the report
//   bun scripts/audit-consistency.ts --sample N --seed S
//   bun scripts/audit-consistency.ts --unclassified    literals with no verdict, as TSV
//   bun scripts/audit-consistency.ts --check-cites     fail on a report citation whose line or value is wrong
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { colorsNamed } from "culori";
import { CHROME_TOKENS, PALETTE_TOKENS } from "../src/js/contract.ts";
import { USAGE, WRAPPERS, type UsageRule, type Wrapper } from "../src/js/usage/contract.ts";

const root = join(import.meta.dir, "..");
const REPORT = "docs/audits/consistency-tokens.md";
const VERDICTS = "docs/audits/consistency-tokens.verdicts.tsv";
const SECTIONS = ["matrix", "stats", "literals", "graph"] as const;

const CATEGORIES = [
  "color",
  "spacing",
  "size",
  "radius",
  "border-width",
  "font-size",
  "font-weight",
  "tracking",
  "line-height",
  "z-index",
  "shadow",
  "motion",
  "focus",
  "other",
] as const;
type Category = (typeof CATEGORIES)[number];
type Kind = "color" | "mix" | "length" | "duration" | "easing" | "number";

type Decl = { property: string; value: string; at: number; propertyAt: number; selector: string };
type Literal = { file: string; line: number; offset: number; property: string; value: string; category: Category; token: string; verdict: string };
type Def = { name: string; file: string; line: number; layer: string };
type Ref = { name: string; file: string; line: number; fallback: boolean };

const byText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const read = (path: string) => readFileSync(join(root, path), "utf8");
const exists = (path: string) => existsSync(join(root, path));
const blank = (text: string) => text.replace(/[^\r\n]/g, " ");

function files(dir: string, pattern: RegExp): string[] {
  if (!exists(dir)) return [];
  return readdirSync(join(root, dir))
    .filter((name) => pattern.test(name))
    .sort(byText)
    .map((name) => `${dir}/${name}`);
}

function walk(dir: string, pattern: RegExp): string[] {
  return readdirSync(join(root, dir), { recursive: true, encoding: "utf8" })
    .map((name) => `${dir}/${name.replace(/\\/g, "/")}`)
    .filter((path) => pattern.test(path))
    .sort(byText);
}

function lineIndex(text: string): (offset: number) => number {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") starts.push(i + 1);
  return (offset) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid]! <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

const kebab = (name: string) => (name.startsWith("--") ? name : name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`));
const pascalToKebab = (name: string) => name.replace(/[A-Z]/g, (c, i: number) => (i === 0 ? c.toLowerCase() : `-${c.toLowerCase()}`));

function closeParen(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")" && --depth === 0) return i;
  }
  return text.length - 1;
}

// CSS

const stripCssComments = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, blank);

/** Declarations and rule preludes in a stylesheet or a style attribute, with offsets into the original text. */
function parseCss(text: string, base = 0): { decls: Decl[]; preludes: string[] } {
  const decls: Decl[] = [];
  const preludes: string[] = [];
  const stack: string[] = [];
  let start = 0;
  let depth = 0;
  let quote = "";
  const selector = () => stack.findLast((s) => !s.startsWith("@")) ?? "";
  const flush = (end: number) => {
    const segment = text.slice(start, end);
    if (segment.trimStart().startsWith("@")) return;
    const colon = topLevelColon(segment);
    if (colon < 0) return;
    const property = segment.slice(0, colon).trim();
    if (!/^-?-?[A-Za-z_][\w-]*$/.test(property)) return;
    decls.push({
      property: property.startsWith("--") ? property : property.toLowerCase(),
      value: segment.slice(colon + 1),
      at: base + start + colon + 1,
      propertyAt: base + start + segment.length - segment.trimStart().length,
      selector: selector(),
    });
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = "";
    } else if (c === '"' || c === "'") quote = c;
    else if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (depth === 0 && c === "{") {
      const prelude = text.slice(start, i).trim();
      preludes.push(prelude);
      // Container and media query breakpoints are literals too, and var() can't replace them.
      const at = /^@(media|container)\b/.exec(prelude);
      if (at) {
        const lead = text.slice(start, i).search(/\S/);
        decls.push({ property: at[0], value: prelude.slice(at[0].length), at: base + start + lead + at[0].length, propertyAt: base + start + lead, selector: selector() });
      }
      stack.push(prelude);
      start = i + 1;
    } else if (depth === 0 && (c === ";" || c === "}")) {
      flush(i);
      if (c === "}") stack.pop();
      start = i + 1;
    }
  }
  flush(text.length);
  return { decls, preludes };
}

function topLevelColon(segment: string): number {
  let depth = 0;
  let quote = "";
  for (let i = 0; i < segment.length; i++) {
    const c = segment[i];
    if (quote) {
      if (c === quote) quote = "";
    } else if (c === '"' || c === "'") quote = c;
    else if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === ":" && depth === 0) return i;
  }
  return -1;
}

// Values

const COLOR_FUNCTIONS = new Set(["rgb", "rgba", "hsl", "hsla", "hwb", "lab", "lch", "oklab", "oklch", "color"]);
const EASING_FUNCTIONS = new Set(["cubic-bezier", "steps", "linear"]);
const NOT_COLORS = new Set(["transparent", "currentcolor", "inherit", "initial", "unset", "revert"]);
const NAMED_COLORS = new Set(Object.keys(colorsNamed).filter((name) => !NOT_COLORS.has(name)));
const LENGTH_UNITS = new Set(["px", "rem", "em", "ch", "ex", "lh", "rlh", "cap", "ic", "vw", "vh", "vi", "vb", "vmin", "vmax", "dvw", "dvh", "dvi", "dvb", "svw", "svh", "svi", "svb", "lvw", "lvh", "lvi", "lvb", "cqw", "cqh", "cqi", "cqb", "%"]);
const UNITLESS = new Set(["font-weight", "line-height", "z-index", "opacity", "scale"]);
const TOKEN = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(#[0-9a-fA-F]{3,8})(?![\w-])|(-?-?[A-Za-z_][\w-]*)(\()?|([+-]?(?:\d*\.\d+|\d+)(?:[eE][+-]?\d+)?)(%|[A-Za-z]+)?|([()])/g;

type Found = { kind: Kind; text: string; offset: number };

/** Visual literals in one declaration value. A bare 0 is never a literal, except on a unitless property. */
function literalsIn(value: string, property: string): Found[] {
  const found: Found[] = [];
  const frames: string[] = [];
  const unitless = UNITLESS.has(property);
  const re = new RegExp(TOKEN.source, "g");
  for (let m = re.exec(value); m; m = re.exec(value)) {
    const [all, text, hex, ident, call, number, unit, paren] = m;
    if (text !== undefined) continue;
    if (hex !== undefined) {
      found.push({ kind: "color", text: hex, offset: m.index });
    } else if (ident !== undefined) {
      const name = ident.toLowerCase();
      if (call === undefined) {
        if (NAMED_COLORS.has(name)) found.push({ kind: "color", text: ident, offset: m.index });
      } else if (COLOR_FUNCTIONS.has(name) || EASING_FUNCTIONS.has(name) || name === "url") {
        const end = closeParen(value, m.index + ident.length);
        if (name !== "url") found.push({ kind: COLOR_FUNCTIONS.has(name) ? "color" : "easing", text: value.slice(m.index, end + 1), offset: m.index });
        re.lastIndex = end + 1;
      } else frames.push(name);
    } else if (paren === "(") frames.push("");
    else if (paren === ")") frames.pop();
    else if (number !== undefined) {
      const u = unit?.toLowerCase();
      if (u === undefined) {
        if (unitless) found.push({ kind: "number", text: all, offset: m.index });
      } else if (u === "%" && frames.at(-1) === "color-mix") found.push({ kind: "mix", text: all, offset: m.index });
      else if (LENGTH_UNITS.has(u)) found.push({ kind: "length", text: all, offset: m.index });
      else if (u === "ms" || u === "s") found.push({ kind: "duration", text: all, offset: m.index });
    }
  }
  return found;
}

const PROPERTY_CATEGORY: [RegExp, Category][] = [
  [/^font-size$/, "font-size"],
  [/^font-weight$/, "font-weight"],
  [/^letter-spacing$/, "tracking"],
  [/^line-height$/, "line-height"],
  [/^z-index$/, "z-index"],
  [/shadow$/, "shadow"],
  [/^(transition|animation)/, "motion"],
  [/^(scale|rotate|translate|transform)$/, "motion"],
  [/^outline/, "focus"],
  [/radius$/, "radius"],
  [/^border-spacing$/, "spacing"],
  [/^(border|column-rule)(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-width)?$/, "border-width"],
  [/^(margin|padding|gap|row-gap|column-gap|inset|top|right|bottom|left|scroll-margin|scroll-padding|text-indent|text-underline-offset)/, "spacing"],
  [/^(width|height|inline-size|block-size|min-|max-|flex|grid-|background|mask|stroke-width|aspect-ratio|text-decoration|@container|@media)/, "size"],
];

// A custom property's role is only in its name.
const CUSTOM_CATEGORY: [RegExp, Category][] = [
  [/radius/, "radius"],
  [/shadow/, "shadow"],
  [/duration|delay|ease/, "motion"],
  [/weight/, "font-weight"],
  [/tracking|letter/, "tracking"],
  [/leading|line-height/, "line-height"],
  [/font-size|text-size/, "font-size"],
  [/focus|ring|outline/, "focus"],
  [/border|edge|stroke/, "border-width"],
  [/gap|pad|space|inset|offset|margin|indent/, "spacing"],
  [/size|width|height|thumb|track|min|max/, "size"],
  [/z-index|layer/, "z-index"],
  [/color|tone|tint|fill/, "color"],
];

function categorize(property: string, kind: Kind): Category {
  if (kind === "color" || kind === "mix") return /shadow/.test(property) ? "shadow" : "color";
  if (kind === "duration" || kind === "easing") return "motion";
  for (const [pattern, category] of property.startsWith("--") ? CUSTOM_CATEGORY : PROPERTY_CATEGORY) if (pattern.test(property)) return category;
  return "other";
}

// Tokens

type Token = { name: string; value: string; owner: string };

function normalize(value: string): string {
  const v = value.trim().replace(/\s+/g, " ");
  const m = /^([+-]?(?:\d*\.\d+|\d+))([a-z%]*)$/i.exec(v);
  return m ? `${Number(m[1])}${m[2]!.toLowerCase()}` : v.toLowerCase();
}

function tokenDecls(path: string, owner: string): Token[] {
  return parseCss(stripCssComments(read(path))).decls
    .filter((d) => d.property.startsWith("--"))
    .map((d) => ({ name: d.property, value: d.value.trim(), owner }));
}

const FOUNDATIONS = tokenDecls("src/css/foundations.css", "foundations");
const CHROMES = files("src/css/chromes", /\.css$/).flatMap((path) => tokenDecls(path, path.slice(path.lastIndexOf("/") + 1, -4)));
const SCALES = ["--space-", "--text-", "--duration-", "--radius-pill", "--z-", "--leading-"];
const SCALE_FOR: Partial<Record<Category, string[]>> = {
  spacing: ["--space-"],
  size: ["--space-"],
  "font-size": ["--text-"],
  motion: ["--duration-"],
  radius: ["--radius-pill"],
  "z-index": ["--z-"],
  "line-height": ["--leading-"],
  other: SCALES,
};

function chromeFamily(property: string, kind: Kind, category: Category, selector: string): string | undefined {
  if (kind === "easing") return "--ease";
  if (kind === "duration") return "--duration-";
  if (category === "radius") return "--radius-";
  if (category === "shadow") return "--shadow-";
  if (category === "border-width" && kind === "length") return "--border-width";
  if (property === "outline-offset") return "--focus-offset";
  if (/^outline(-width)?$/.test(property) && kind === "length") return "--focus-width";
  if (/^outline(-color)?$/.test(property) && (kind === "color" || kind === "mix")) return "--focus-color";
  if (/^(scale|transform)$/.test(property) && /:active/.test(selector)) return "--press-transform";
  return undefined;
}

function matchToken(value: string, property: string, kind: Kind, category: Category, selector: string): string {
  const v = normalize(value);
  const prefixes = kind === "duration" ? ["--duration-"] : (SCALE_FOR[category] ?? []);
  const exact = FOUNDATIONS.filter((t) => prefixes.some((p) => t.name.startsWith(p)) && normalize(t.value) === v).map((t) => t.name);
  const family = chromeFamily(property, kind, category, selector);
  if (family === undefined || exact.length > 0) return [...new Set(exact)].sort(byText).join("; ");
  const members = [...FOUNDATIONS, ...CHROMES].filter((t) => (family.endsWith("-") ? t.name.startsWith(family) : t.name === family));
  if (members.length === 0) return "";
  const equal = new Map<string, string[]>();
  for (const t of members) if (normalize(t.value) === v) equal.set(t.name, [...(equal.get(t.name) ?? []), t.owner]);
  const label = family.endsWith("-") ? `${family}*` : family;
  if (equal.size === 0) return label;
  return [...equal].map(([name, owners]) => `${name} (= ${[...new Set(owners)].sort(byText).join(", ")})`).sort(byText).join("; ");
}

// Scripts

type Str = { start: number; text: string };
type Lexed = { code: string; strings: Map<number, Str> };

/**
 * Splits TS into code with comments blanked and every string literal keyed by its opening quote.
 * A template's text keeps its length, with each ${…} replaced by NUL, so offsets still map to lines
 * and no interpolation reads as a token name or a number.
 * Templates nested inside ${…} are lexed as strings of their own.
 */
function lex(src: string): Lexed {
  const out = src.split("");
  const strings = new Map<number, Str>();
  const wipe = (from: number, to: number) => {
    for (let k = from; k < to; k++) if (out[k] !== "\n" && out[k] !== "\r") out[k] = " ";
  };
  const quoted = (i: number): number => {
    let j = i + 1;
    while (j < src.length && src[j] !== src[i] && src[j] !== "\n") j += src[j] === "\\" ? 2 : 1;
    strings.set(i, { start: i + 1, text: src.slice(i + 1, j) });
    return j + 1;
  };
  const template = (i: number): number => {
    let j = i + 1;
    let text = "";
    while (j < src.length && src[j] !== "`") {
      if (src[j] === "\\") {
        text += src.slice(j, j + 2);
        j += 2;
      } else if (src[j] === "$" && src[j + 1] === "{") {
        const end = code(j + 2, true);
        text += "\u0000".repeat(end - j);
        j = end;
      } else text += src[j++];
    }
    strings.set(i, { start: i + 1, text });
    return j + 1;
  };
  const regex = (i: number): number => {
    let j = i + 1;
    let inClass = false;
    while (j < src.length && src[j] !== "\n") {
      if (src[j] === "\\") j++;
      else if (src[j] === "[") inClass = true;
      else if (src[j] === "]") inClass = false;
      else if (src[j] === "/" && !inClass) break;
      j++;
    }
    j++;
    while (/[a-z]/i.test(src[j] ?? "")) j++;
    return j;
  };
  const code = (i: number, nested: boolean): number => {
    let depth = 0;
    let prev = "";
    while (i < src.length) {
      const c = src[i]!;
      if (c === "/" && src[i + 1] === "/") {
        const end = src.indexOf("\n", i);
        const stop = end === -1 ? src.length : end;
        wipe(i, stop);
        i = stop;
        continue;
      }
      if (c === "/" && src[i + 1] === "*") {
        const end = src.indexOf("*/", i + 2);
        const stop = end === -1 ? src.length : end + 2;
        wipe(i, stop);
        i = stop;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") {
        i = c === "`" ? template(i) : quoted(i);
        prev = c;
        continue;
      }
      if (c === "/" && (prev === "" || "(,=:[!&|?{};".includes(prev))) {
        i = regex(i);
        prev = "/";
        continue;
      }
      if (c === "{") depth++;
      else if (c === "}") {
        if (nested && depth === 0) return i + 1;
        depth--;
      }
      if (!/\s/.test(c)) prev = c;
      i++;
    }
    return i;
  };
  code(0, false);
  return { code: out.join(""), strings };
}

function lexFile(path: string, src: string): Lexed {
  // MDX prose is not JS, so an apostrophe would open a bogus string. Scan it as one string instead.
  if (path.endsWith(".mdx")) return { code: blank(src), strings: new Map([[-1, { start: 0, text: src }]]) };
  return lex(src);
}

/**
 * The story heuristic. Inline styles are read from:
 *   1. style="…" or style='…' inside any string or template literal, and <style>…</style> blocks;
 *   2. el.style.cssText = "…";
 *   3. el.style.prop = "…" (camelCase becomes kebab-case);
 *   4. el.style.setProperty("prop", "…");
 *   5. object styles, style: { prop: "…" } and style={{ prop: "…" }}, with string values only.
 * Values built at runtime from variables are invisible, and ${…} reads as nothing.
 */
function inlineDecls(path: string, src: string): Decl[] {
  const { code, strings } = lexFile(path, src);
  const decls: Decl[] = [];
  const add = (property: string, value: Str | undefined) => {
    if (value) decls.push({ property: kebab(property), value: value.text, at: value.start, propertyAt: value.start, selector: "" });
  };
  for (const s of [...strings.values()].sort((a, b) => a.start - b.start)) {
    for (const m of s.text.matchAll(/\bstyle\s*=\s*(["'])([\s\S]*?)\1/g)) decls.push(...parseCss(m[2]!, s.start + m.index + m[0].length - 1 - m[2]!.length).decls);
    for (const m of s.text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) decls.push(...parseCss(m[1]!, s.start + m.index + m[0].indexOf(">") + 1).decls);
  }
  const after = (m: RegExpMatchArray) => m.index! + m[0].length;
  for (const m of code.matchAll(/\.style\.cssText\s*=\s*/g)) {
    const s = strings.get(after(m));
    if (s) decls.push(...parseCss(s.text, s.start).decls);
  }
  for (const m of code.matchAll(/\.style\.(?!cssText\b)([A-Za-z]+)\s*=\s*/g)) add(m[1]!, strings.get(after(m)));
  for (const m of code.matchAll(/\.setProperty\(\s*/g)) {
    const name = strings.get(after(m));
    if (!name) continue;
    const rest = name.start + name.text.length + 1;
    const comma = /^\s*,\s*/.exec(code.slice(rest));
    if (comma) add(name.text, strings.get(rest + comma[0].length));
  }
  for (const m of code.matchAll(/\bstyle\??\s*(?::|=\s*\{)\s*\{/g)) {
    const open = after(m) - 1;
    const close = matchBrace(code, open, strings);
    const body = code.slice(open + 1, close);
    for (const p of body.matchAll(/(?:([A-Za-z_$][\w$]*)|(["'])([\w-]+)\2)\s*:\s*/g)) add(p[1] ?? p[3]!, strings.get(open + 1 + after(p)));
  }
  return decls;
}

function matchBrace(code: string, open: number, strings: Map<number, Str>): number {
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    const s = strings.get(i);
    if (s) {
      i = s.start + s.text.length;
      continue;
    }
    if (code[i] === "{") depth++;
    else if (code[i] === "}" && --depth === 0) return i;
  }
  return code.length;
}

// Literal table

const LITERAL_CSS = [...files("src/css/components", /\.css$/), "src/css/base.css", "src/css/preferences.css"];
const STORYBOOK_PREVIEWS = readdirSync(root)
  .filter((name) => name.startsWith(".storybook"))
  .sort(byText)
  .flatMap((dir) => files(dir, /^preview\.tsx?$/));
const LITERAL_SCRIPTS = [...files("stories", /\.(ts|mdx)$/), ...files("stories/mirrored", /\.ts$/), ...STORYBOOK_PREVIEWS, ...files("src/react", /\.tsx?$/)];

function loadVerdicts(): Map<string, string> {
  const verdicts = new Map<string, string>();
  if (!exists(VERDICTS)) return verdicts;
  for (const line of read(VERDICTS).split(/\r?\n/).slice(1)) {
    const [file, property, value, verdict] = line.split("\t");
    if (file && property && value && verdict) verdicts.set(key(file, property, value), verdict.trim());
  }
  return verdicts;
}

const key = (file: string, property: string, value: string) => `${file}\t${property}\t${value}`;

function literalRows(): Literal[] {
  const verdicts = loadVerdicts();
  const rows: Literal[] = [];
  const collect = (file: string, text: string, decls: Decl[]) => {
    const line = lineIndex(text);
    for (const d of decls) {
      for (const f of literalsIn(d.value, d.property)) {
        const value = f.text.replace(/\s+/g, " ");
        const category = categorize(d.property, f.kind);
        rows.push({
          file,
          line: line(d.at + f.offset),
          offset: d.at + f.offset,
          property: d.property,
          value,
          category,
          token: matchToken(value, d.property, f.kind, category, d.selector),
          verdict: verdicts.get(key(file, d.property, value)) ?? "unclassified",
        });
      }
    }
  };
  for (const file of LITERAL_CSS) {
    const text = read(file);
    collect(file, text, parseCss(stripCssComments(text)).decls);
  }
  for (const file of LITERAL_SCRIPTS) {
    const text = read(file);
    collect(file, text, inlineDecls(file, text));
  }
  return rows.sort(
    (a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || byText(a.file, b.file) || a.offset - b.offset || byText(a.property, b.property),
  );
}

// Token graph

function layers(): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of read("src/css/index.css").matchAll(/@import\s+"\.\/([^"]+)"\s+layer\(([\w-]+)\)/g)) map.set(`src/css/${m[1]}`, m[2]!);
  return map;
}

const GRAPH_CSS = walk("src/css", /\.css$/);
const GRAPH_SCRIPTS = [...walk("src/js", /\.ts$/), ...files("src/react", /\.tsx?$/), ...files("stories", /\.(ts|mdx)$/), ...files("stories/mirrored", /\.ts$/)];
const NAME = "--[A-Za-z_][\\w-]*";

function tokenGraph() {
  const layerOf = layers();
  const defs: Def[] = [];
  const refs: Ref[] = [];
  const dynamic: string[] = [];
  const references = (file: string, code: string, line: (o: number) => number) => {
    for (const m of code.matchAll(new RegExp(`var\\(\\s*(${NAME})\\s*(,)?`, "g"))) refs.push({ name: m[1]!, file, line: line(m.index), fallback: m[2] !== undefined });
    for (const m of code.matchAll(new RegExp(`getPropertyValue\\(\\s*["'\`](${NAME})`, "g"))) refs.push({ name: m[1]!, file, line: line(m.index), fallback: false });
  };
  for (const file of GRAPH_CSS) {
    const text = read(file);
    const masked = stripCssComments(text);
    const line = lineIndex(text);
    const layer = layerOf.get(file) ?? (file === "src/css/index.css" ? "index" : "unimported");
    for (const d of parseCss(masked).decls) if (d.property.startsWith("--")) defs.push({ name: d.property, file, line: line(d.propertyAt), layer });
    references(file, masked, line);
  }
  for (const file of GRAPH_SCRIPTS) {
    const text = read(file);
    const { code, strings } = lexFile(file, text);
    const line = lineIndex(text);
    const layer = file.startsWith("stories/") ? "inline" : "script";
    const define = (name: string, offset: number) => defs.push({ name, file, line: line(offset), layer });
    for (const s of strings.values()) {
      for (const m of s.text.matchAll(new RegExp(`(?<![\\w(-])(${NAME})\\s*:`, "g"))) define(m[1]!, s.start + m.index);
      references(file, s.text, (o) => line(s.start + o));
    }
    for (const m of code.matchAll(new RegExp(`["'](${NAME})["']\\s*:`, "g"))) define(m[1]!, m.index + 1);
    for (const m of code.matchAll(new RegExp(`setProperty\\(\\s*["'](${NAME})`, "g"))) define(m[1]!, m.index);
    if (/var\(--\$\{/.test(text)) dynamic.push(file);
  }
  function unique<T>(items: T[], id: (item: T) => string): T[] {
    return [...new Map(items.map((item) => [id(item), item])).values()];
  }
  const sortDefs = (list: Def[]) => unique(list, (d) => `${d.name}\t${d.file}\t${d.line}`).sort((a, b) => byText(a.name, b.name) || byText(a.file, b.file) || a.line - b.line);
  const defined = new Set(defs.map((d) => d.name));
  const readNames = new Set(refs.map((r) => r.name));
  const palette = new Set<string>(PALETTE_TOKENS.map((t) => `--${t}`));
  const chrome = new Set<string>(CHROME_TOKENS.map((t) => `--${t}`));
  const sortedRefs = unique(refs, (r) => `${r.name}\t${r.file}\t${r.line}\t${r.fallback}`).sort(
    (a, b) => byText(a.name, b.name) || byText(a.file, b.file) || a.line - b.line,
  );
  return {
    defs: sortDefs(defs),
    dynamic: dynamic.sort(byText),
    undefinedRefs: sortedRefs.filter((r) => !defined.has(r.name)),
    unused: sortDefs(defs.filter((d) => ["foundations", "palette", "chrome"].includes(d.layer) && !d.name.startsWith("--_") && !readNames.has(d.name))),
    paletteOutside: sortDefs(defs.filter((d) => palette.has(d.name) && d.layer !== "palette" && d.layer !== "foundations")),
    chromeOutside: sortDefs(defs.filter((d) => chrome.has(d.name) && d.layer !== "chrome")),
    publicInComponents: sortDefs(defs.filter((d) => d.layer === "components" && !d.name.startsWith("--_"))),
  };
}

// Module-shape matrix

const basename = (path: string) => path.slice(path.lastIndexOf("/") + 1).replace(/\.[^.]+$/, "");
const COMPONENT_CSS = files("src/css/components", /\.css$/);
const REACT_MODULES = files("src/react", /\.tsx$/);
const COMPONENTS = [...new Set([...COMPONENT_CSS, ...REACT_MODULES].map(basename))].sort(byText);
const wrappers: Record<string, Wrapper> = WRAPPERS;
const usage: Record<string, readonly UsageRule[]> = USAGE;

const classIndex = COMPONENT_CSS.map((file) => {
  const preludes = parseCss(stripCssComments(read(file))).preludes.flatMap((p) => p.split(","));
  return {
    component: basename(file),
    leading: new Set(preludes.flatMap((p) => /^\s*(?::(?:where|is)\(\s*)?\.(odd-[\w-]+)/.exec(p)?.[1] ?? [])),
    any: new Set(preludes.flatMap((p) => [...p.matchAll(/\.(odd-[\w-]+)/g)].map((m) => m[1]!))),
  };
});

/**
 * The component that owns a class: the longest component name it extends (odd-table-wrap is table),
 * else the stylesheet whose selectors start with it (.odd-label leads in field.css; search.css only nests it).
 */
function owner(className: string): string | undefined {
  const named = classIndex
    .map((c) => c.component)
    .filter((c) => className === `odd-${c}` || className.startsWith(`odd-${c}-`))
    .sort((a, b) => b.length - a.length)[0];
  return named ?? classIndex.find((c) => c.leading.has(className))?.component ?? classIndex.find((c) => c.any.has(className))?.component;
}

const wrapperComponent = (name: string) => owner(wrappers[name]!.className);
const WRAPPERS_BY_TAG = (tag: string) => Object.keys(wrappers).filter((name) => wrappers[name]!.element === tag);

const usageKeys = Object.entries(usage).flatMap(([name, rules]) => {
  const element = rules.find((r) => r.kind === "element");
  const component = element?.kind === "element" ? owner(element.className) : undefined;
  return component ? [{ name, component, rules }] : [];
});
// Sheet spreads the modal rules, so ODD-DIALOG codes also sit under sheet. A family named after a component is that component.
const familyComponent = (family: string) =>
  COMPONENTS.includes(family) ? family : usageKeys.find((k) => k.rules.some((r) => r.code.startsWith(`ODD-${family.toUpperCase()}-`)))?.component;

type Enhancer = { name: string; file: string; components: string[]; called: boolean };

function enhancers(): Enhancer[] {
  const main = read("src/js/enhance.ts");
  const enhanceBody = /export function enhance\([\s\S]*?\n\}/.exec(main)?.[0] ?? "";
  const classesIn = (text: string) => [...new Set([...text.matchAll(/\.(odd-[\w-]+)/g)].flatMap((m) => owner(m[1]!) ?? []))];
  const tagsIn = (text: string) =>
    [...new Set([...text.matchAll(/HTML(\w+)Element/g)].flatMap((m) => WRAPPERS_BY_TAG(m[1]!.toLowerCase()).flatMap((w) => wrapperComponent(w) ?? [])))];
  return files("src/js", /\.ts$/).flatMap((file) =>
    [...read(file).matchAll(/export function (\w+)\([\s\S]*?\n\}/g)].flatMap((m) => {
      const name = m[1]!;
      if (!/^enhance[A-Z]|Fallback$/.test(name)) return [];
      const base = kebab(name.replace(/^enhance/, "").replace(/Fallback$/, "")).replace(/^-/, "");
      const callLine = enhanceBody.split("\n").find((l) => new RegExp(`\\b${name}\\b`).test(l)) ?? "";
      // Tiers, first non-empty wins: the name, classes on its enhance() line, classes in its body, element types.
      const tiers = [
        COMPONENTS.includes(base) ? [base] : [owner(`odd-${base}`) ?? []].flat(),
        classesIn(callLine),
        classesIn(m[0]),
        tagsIn(callLine + m[0]),
      ];
      return [{ name, file, components: tiers.find((t) => t.length > 0) ?? [], called: new RegExp(`\\b${name}\\b`).test(enhanceBody) }];
    }),
  );
}

function matrix() {
  const indexCss = read("src/css/index.css");
  const typeFixtures = files("tests/fixtures/types/fail", /\.tsx$/).map(basename);
  const wrapperPrefixes = Object.keys(wrappers)
    .map((name) => ({ name, prefix: pascalToKebab(name) }))
    .sort((a, b) => b.prefix.length - a.prefix.length);
  const typeRows = typeFixtures.map((fixture) => {
    const w = wrapperPrefixes.find((p) => fixture.startsWith(`${p.prefix}-`));
    return { fixture, prefix: w?.prefix, component: w ? wrapperComponent(w.name) : undefined };
  });
  const usageHtml = files("tests/fixtures/usage", /\.html$/).map((path) => {
    const family = /^odd-([a-z]+)-\d+\./.exec(basename(path) + ".")?.[1];
    return { path, component: family ? familyComponent(family) : undefined };
  });
  const usageJsx = files("tests/fixtures/usage/jsx", /\.tsx$/).map((path) => {
    const name = basename(path);
    const family = /^odd-([a-z]+)-\d+\./.exec(name + ".")?.[1];
    return { name, component: COMPONENTS.includes(name) ? name : family ? familyComponent(family) : undefined };
  });
  const reactTest = read("tests/react.test.tsx");
  const markupBlock = /const markup[\s\S]*?\n\];/.exec(reactTest)?.[0] ?? "";
  const markupRows = [...markupBlock.matchAll(/'(<[^']*)'/g)].map((m) => new Set([...m[1]!.matchAll(/class="([^"]*)"/g)].flatMap((c) => c[1]!.split(/\s+/).flatMap((cls) => owner(cls) ?? []))));
  const describes = [...reactTest.matchAll(/describe\("(\w+)/g)].flatMap((m) => (m[1]! in wrappers ? [wrapperComponent(m[1]!) ?? ""] : []));
  const allEnhancers = enhancers();
  const mirrored = files("stories/mirrored", /\.stories\.ts$/).map((path) => ({ path, name: pascalToKebab(basename(path).replace(/\.stories$/, "")) }));
  // AlertDialog.stories.ts mirrors dialog: a story whose name ends in a component's name belongs to it.
  const storyComponent = (name: string) => (COMPONENTS.includes(name) ? name : COMPONENTS.filter((c) => name.endsWith(`-${c}`)).sort((a, b) => b.length - a.length)[0]);
  const recipes = files(".agents/skills/verify-odd-design/features", /\.md$/).map((path) => ({
    name: basename(path),
    components: new Set([...read(path).matchAll(/\b(odd-[a-z][\w-]*)/g)].flatMap((m) => owner(m[1]!) ?? [])),
  }));
  const list = (items: string[]) => (items.length > 0 ? items.join(", ") : "none");

  const rows = COMPONENTS.map((component) => {
    const css = `src/css/components/${component}.css`;
    const tsx = `src/react/${component}.tsx`;
    const source = exists(tsx) ? read(tsx) : "";
    const hasPart = /\bpart\(/.test(source);
    const hasCreate = /\bcreateElement\(/.test(source);
    const types = typeRows.filter((r) => r.component === component);
    const htmlFixtures = usageHtml.filter((u) => u.component === component).length;
    const jsxFixtures = usageJsx.filter((u) => u.component === component).length;
    const own = allEnhancers.filter((e) => e.components.includes(component));
    return [
      component,
      exists(css) ? css : "none",
      indexCss.includes(`"./components/${component}.css"`) ? "yes" : "no",
      list(Object.keys(wrappers).filter((name) => wrapperComponent(name) === component)),
      list(usageKeys.filter((k) => k.component === component).map((k) => `${k.name} (${k.rules.length})`)),
      exists(tsx) ? tsx : "none",
      !exists(tsx) ? "none" : hasPart && !hasCreate ? "part() only" : hasPart ? "mixed" : "hand-written",
      !exists(tsx) ? "none" : /^\s*["']use client["']/.test(source) ? "yes" : "no",
      exists(`docs/usage/${component}.md`) ? `docs/usage/${component}.md` : "none",
      list(mirrored.filter((s) => storyComponent(s.name) === component).map((s) => basename(s.path).replace(/\.stories$/, ""))),
      types.length === 0 ? "0" : `${types.length} (${[...new Set(types.map((t) => t.prefix!))].sort(byText).join(", ")})`,
      `${htmlFixtures} html, ${jsxFixtures} jsx`,
      `${markupRows.filter((r) => r.has(component)).length} markup, ${describes.filter((d) => d === component).length} describe`,
      list(own.map((e) => e.name)),
      own.length === 0 ? "none" : own.map((e) => (e.called ? "yes" : "no")).join(", "),
      list(recipes.filter((r) => r.components.has(component)).map((r) => r.name)),
    ];
  });
  const unmapped = [
    ...typeRows.filter((r) => r.component === undefined).map((r) => `type fixture \`${r.fixture}\``),
    ...usageHtml.filter((u) => u.component === undefined).map((u) => `usage fixture \`${basename(u.path)}\``),
    ...usageJsx.filter((u) => u.component === undefined).map((u) => `usage JSX fixture \`${u.name}\``),
    ...mirrored.filter((s) => storyComponent(s.name) === undefined).map((s) => `mirrored story \`${basename(s.path)}\``),
    ...allEnhancers.filter((e) => e.components.length === 0).map((e) => `enhancer \`${e.name}\` (${e.file}, ${e.called ? "called" : "not called"} by enhance())`),
  ];
  return { rows, unmapped };
}

// Output

function table(head: string[], rows: string[][]): string {
  if (rows.length === 0) return "None.";
  const cell = (c: string) => c.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
  return [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.map(cell).join(" | ")} |`)].join("\n");
}

const code = (text: string) => (text === "" ? "" : `\`${text}\``);
const LITERAL_HEAD = ["Category", "`file:line`", "Property", "Value", "Matching token", "Verdict"];
const literalCells = (r: Literal) => [r.category, code(`${r.file}:${r.line}`), code(r.property), code(r.value), r.token === "" ? "" : r.token.split("; ").map(code).join(", "), r.verdict];

function literalsMarkdown(rows: Literal[]): string {
  return CATEGORIES.filter((c) => rows.some((r) => r.category === c))
    .map((c) => {
      const group = rows.filter((r) => r.category === c);
      return `### ${c[0]!.toUpperCase()}${c.slice(1)} (${group.length})\n\n${table(LITERAL_HEAD, group.map(literalCells))}`;
    })
    .join("\n\n");
}

function graphMarkdown(graph: ReturnType<typeof tokenGraph>): string {
  const defRows = (list: Def[]) => list.map((d) => [code(d.name), code(`${d.file}:${d.line}`), d.layer]);
  const perFile = new Map<string, { layer: string; count: number }>();
  for (const d of graph.defs) perFile.set(d.file, { layer: d.layer, count: (perFile.get(d.file)?.count ?? 0) + 1 });
  const sections: [string, string][] = [
    ["Definitions by file", table(["File", "Layer", "Definitions"], [...perFile].sort(([a], [b]) => byText(a, b)).map(([file, v]) => [code(file), v.layer, String(v.count)]))],
    ["References with no definition", table(["Token", "`file:line`", "Fallback"], graph.undefinedRefs.map((r) => [code(r.name), code(`${r.file}:${r.line}`), r.fallback ? "yes" : "no"]))],
    [
      "Public tokens nothing reads",
      `${table(["Token", "Defined at", "Layer"], defRows(graph.unused))}\n\nNames built at runtime (\`var(--\${…})\`) are invisible to this count. Files that build them: ${graph.dynamic.map(code).join(", ") || "none"}.`,
    ],
    ["Palette tokens defined outside palettes and foundations", table(["Token", "Defined at", "Layer"], defRows(graph.paletteOutside))],
    ["Chrome tokens defined outside chromes", table(["Token", "Defined at", "Layer"], defRows(graph.chromeOutside))],
    ["Public custom properties in component files", table(["Token", "Defined at", "Layer"], defRows(graph.publicInComponents))],
  ];
  return sections.map(([title, body]) => `### ${title}\n\n${body}`).join("\n\n");
}

const MATRIX_HEAD = [
  "Component",
  "CSS file",
  "`index.css` import",
  "`WRAPPERS` rows",
  "`USAGE` rules",
  "React module",
  "Module kind",
  '`"use client"`',
  "Usage doc",
  "Mirrored story",
  "Type fail fixtures (prefixes)",
  "Usage fixtures",
  "`react.test.tsx` rows",
  "Enhancer",
  "Called by `enhance()`",
  "Verify recipe",
];

function matrixMarkdown(m: ReturnType<typeof matrix>): string {
  const notes = m.unmapped.length === 0 ? "" : `\n\nNot mapped to a component:\n\n${m.unmapped.map((u) => `- ${u}`).join("\n")}`;
  return table(MATRIX_HEAD, m.rows) + notes;
}

function statsMarkdown(rows: Literal[], graph: ReturnType<typeof tokenGraph>, m: ReturnType<typeof matrix>): string {
  function count<T>(items: T[], f: (item: T) => string): Map<string, number> {
    const counts = new Map<string, number>();
    for (const item of items) counts.set(f(item), (counts.get(f(item)) ?? 0) + 1);
    return counts;
  }
  const byCategory = count(rows, (r) => r.category);
  const byVerdict = count(rows, (r) => r.verdict.split(/\s+/)[0]!);
  const keys = new Set(rows.map((r) => key(r.file, r.property, r.value))).size;
  return [
    `${rows.length} literals in ${new Set(rows.map((r) => r.file)).size} files, ${keys} distinct (file, property, value) keys.`,
    table(["Category", "Literals"], CATEGORIES.filter((c) => byCategory.has(c)).map((c) => [c, String(byCategory.get(c))])),
    table(["Verdict", "Literals"], [...byVerdict].sort(([a], [b]) => byText(a, b)).map(([v, n]) => [v, String(n)])),
    table(
      ["Token graph", "Count"],
      [
        ["References with no definition", String(graph.undefinedRefs.length)],
        ["... of which have no fallback", String(graph.undefinedRefs.filter((r) => !r.fallback).length)],
        ["Public tokens nothing reads", String(graph.unused.length)],
        ["Palette tokens defined outside palettes and foundations", String(graph.paletteOutside.length)],
        ["Chrome tokens defined outside chromes", String(graph.chromeOutside.length)],
        ["Public custom properties in component files", String(graph.publicInComponents.length)],
        ["Components in the matrix", String(m.rows.length)],
      ],
    ),
  ].join("\n\n");
}

// Modes

function sample(rows: Literal[], n: number, seed: number): Literal[] {
  let state = seed >>> 0;
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pool = [...rows];
  for (let i = 0; i < Math.min(n, pool.length); i++) {
    const j = i + Math.floor(random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, n);
}

const markerPattern = (name: string) => new RegExp(`(<!-- audit:${name} -->)[\\s\\S]*?(<!-- /audit:${name} -->)`);

function writeReport(content: Record<(typeof SECTIONS)[number], string>): void {
  let report = read(REPORT);
  const eol = report.includes("\r\n") ? "\r\n" : "\n";
  for (const name of SECTIONS) {
    const pattern = markerPattern(name);
    if (!pattern.test(report)) throw new Error(`${REPORT} has no <!-- audit:${name} --> section`);
    const body = content[name].replace(/\r?\n/g, eol);
    report = report.replace(pattern, (_all, open: string, close: string) => `${open}${eol}${eol}${body}${eol}${eol}${close}`);
  }
  writeFileSync(join(root, REPORT), report);
}

function checkCites(): string[] {
  let report = read(REPORT);
  for (const name of SECTIONS) report = report.replace(markerPattern(name), (all) => blank(all));
  const line = lineIndex(report);
  const failures: string[] = [];
  let checked = 0;
  for (const m of report.matchAll(/`([^`\s:]+):(\d+)(?:-(\d+))?`(?:\s*\(`([^`]+)`\))?/g)) {
    checked++;
    const [cite, path, from, to, value] = m;
    const where = `${REPORT}:${line(m.index)} ${cite}`;
    if (!exists(path!)) {
      failures.push(`${where}: no file ${path}`);
      continue;
    }
    const lines = read(path!).split(/\r?\n/);
    const first = Number(from);
    const last = to === undefined ? first : Number(to);
    if (first < 1 || last < first || last > lines.length) {
      failures.push(`${where}: ${path} has ${lines.length} lines`);
      continue;
    }
    if (value !== undefined && !lines.slice(first - 1, last).some((l) => l.includes(value))) failures.push(`${where}: \`${value}\` is not on that line`);
  }
  console.log(`${checked} citations checked, ${failures.length} failed.`);
  return failures;
}

function main(): void {
  const args = process.argv.slice(2);
  const option = (name: string) => {
    const i = args.indexOf(name);
    return i === -1 ? undefined : args[i + 1];
  };
  if (args.includes("--check-cites")) {
    const failures = checkCites();
    for (const f of failures) console.error(f);
    process.exit(failures.length > 0 ? 1 : 0);
  }
  const rows = literalRows();
  if (args.includes("--unclassified")) {
    const open = new Map<string, Literal[]>();
    for (const r of rows.filter((r) => r.verdict === "unclassified")) open.set(key(r.file, r.property, r.value), [...(open.get(key(r.file, r.property, r.value)) ?? []), r]);
    console.log(["file", "property", "value", "line", "category", "token"].join("\t"));
    for (const [k, group] of [...open].sort(([a], [b]) => byText(a, b))) console.log([k, group.map((r) => r.line).join(","), group[0]!.category, group[0]!.token].join("\t"));
    return;
  }
  if (args.includes("--sample")) {
    const n = Number(option("--sample"));
    const seedText = option("--seed");
    if (!Number.isInteger(n) || n < 1 || seedText === undefined) throw new Error("usage: --sample N --seed S");
    const seed = Number.isFinite(Number(seedText)) ? Number(seedText) : [...seedText].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);
    console.log(table(LITERAL_HEAD, sample(rows, n, seed).map(literalCells)));
    return;
  }
  const graph = tokenGraph();
  const shape = matrix();
  const content = { matrix: matrixMarkdown(shape), stats: statsMarkdown(rows, graph, shape), literals: literalsMarkdown(rows), graph: graphMarkdown(graph) };
  if (args.includes("--write")) {
    writeReport(content);
    console.log(`Wrote ${SECTIONS.length} sections to ${REPORT}.`);
    return;
  }
  console.log(
    [
      `## Stats\n\n${content.stats}`,
      `## Module-shape matrix\n\n${content.matrix}`,
      `## Literals\n\n${content.literals}`,
      `## Token graph\n\n${content.graph}`,
    ].join("\n\n"),
  );
}

main();
