import { existsSync, globSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { catalog, renderHtml, type Entry } from "../stories/catalog.ts";
import { CLASS_REGISTRY, USAGE, VOCABULARY, WRAPPERS } from "../src/js/usage/contract.ts";

type Family = {
  readonly name: string;
  readonly classes: readonly string[];
  readonly css: string;
  readonly js: readonly string[];
  readonly react: readonly string[];
};

const FAMILIES: readonly Family[] = [
  { name: "Button", classes: ["odd-button"], css: "components/button.css", js: ["button-type.ts"], react: ["Button"] },
  {
    name: "Field",
    classes: ["odd-field", "odd-label", "odd-input", "odd-textarea", "odd-select", "odd-hint", "odd-error"],
    css: "components/field.css",
    js: [],
    react: ["Field", "Label", "Input", "Textarea", "Select", "Hint", "FieldError"],
  },
  { name: "Choice", classes: ["odd-choice", "odd-switch", "odd-segmented"], css: "components/choice.css", js: [], react: ["Choice", "Switch", "Segmented"] },
  { name: "Slider", classes: ["odd-slider"], css: "components/slider.css", js: [], react: ["Slider"] },
  { name: "Search", classes: ["odd-search"], css: "components/search.css", js: [], react: ["Search"] },
  { name: "Badge", classes: ["odd-badge"], css: "components/badge.css", js: [], react: ["Badge"] },
  { name: "Card", classes: ["odd-card", "odd-card-link", "odd-card-footer", "odd-card-title"], css: "components/card.css", js: [], react: ["Card", "CardLink", "CardFooter"] },
  { name: "Disclosure", classes: ["odd-disclosure"], css: "components/disclosure.css", js: [], react: ["Disclosure"] },
  { name: "Alert", classes: ["odd-alert", "odd-alert-title"], css: "components/alert.css", js: [], react: ["Alert", "AlertTitle"] },
  { name: "Meter", classes: ["odd-meter", "odd-progress", "odd-stat", "odd-stat-value"], css: "components/meter.css", js: [], react: ["Meter", "Progress"] },
  { name: "Skeleton", classes: ["odd-skeleton"], css: "components/skeleton.css", js: [], react: ["Skeleton"] },
  { name: "Avatar", classes: ["odd-avatar", "odd-avatar-group"], css: "components/avatar.css", js: ["enhance.ts:18-45"], react: ["Avatar", "AvatarGroup"] },
  { name: "Separator", classes: ["odd-separator"], css: "components/separator.css", js: [], react: ["Separator"] },
  { name: "Table", classes: ["odd-table-wrap", "odd-table", "odd-table-sort"], css: "components/table.css", js: ["enhance.ts:47-100"], react: ["TableWrap", "Table", "TableSort"] },
  { name: "Popover", classes: ["odd-popover", "odd-hover-card", "odd-tooltip"], css: "components/popover.css", js: ["fallbacks.ts:9-81"], react: ["Popover"] },
  {
    name: "Dialog",
    classes: ["odd-dialog", "odd-dialog-title", "odd-dialog-body", "odd-dialog-actions"],
    css: "components/dialog.css",
    js: ["fallbacks.ts:83-97"],
    react: ["Dialog", "DialogActions"],
  },
  { name: "Sheet", classes: ["odd-sheet", "odd-sheet-header", "odd-sheet-body", "odd-sheet-footer"], css: "components/sheet.css", js: [], react: ["Sheet", "SheetHeader", "SheetFooter"] },
  { name: "Menu", classes: ["odd-menu", "odd-menu-item", "odd-menu-label", "odd-menu-shortcut"], css: "components/menu.css", js: ["menu.ts", "roving.ts"], react: ["Menu", "MenuItem"] },
  { name: "Tabs", classes: ["odd-tabs"], css: "components/tabs.css", js: ["tabs.ts", "roving.ts"], react: ["Tabs"] },
  {
    name: "Toast",
    classes: ["odd-toaster", "odd-toast", "odd-toast-title", "odd-toast-body", "odd-toast-description"],
    css: "components/toast.css",
    js: ["toast.ts"],
    react: ["Toaster"],
  },
  { name: "Typography", classes: ["odd-heading", "odd-eyebrow"], css: "components/typography.css", js: [], react: [] },
  {
    name: "Base utilities",
    classes: ["odd-stack", "odd-row", "odd-muted", "odd-visually-hidden", "odd-skip-link", "odd-scope"],
    css: "base.css:70-113",
    js: [],
    react: [],
  },
  { name: "E-stop", classes: ["odd-estop"], css: "components/estop.css", js: [], react: [] },
  { name: "Stepper", classes: ["odd-stepper"], css: "components/stepper.css", js: ["stepper.ts"], react: [] },
  { name: "Range field", classes: ["odd-range-field"], css: "components/range-field.css", js: ["range-field.ts"], react: [] },
  { name: "Log", classes: ["odd-log", "odd-log-line"], css: "components/log.css", js: ["log.ts"], react: [] },
  {
    name: "Shell",
    classes: ["odd-shell", "odd-shell-header", "odd-shell-status", "odd-shell-actions", "odd-shell-main"],
    css: "components/shell.css:1-56",
    js: [],
    react: [],
  },
  { name: "Grid", classes: ["odd-grid"], css: "components/shell.css:58-90", js: [], react: [] },
];

const DOMAIN_WORDS = ["robot", "arm", "machine", "jog", "servo", "gripper", "wrist", "NexArm", "COM3", "baud", "firmware", "deck", "card game", "format", "banned"];

const DOMAIN = new RegExp(`\\b(?:${DOMAIN_WORDS.map((word) => word.replace(" ", "\\s+") + "(?:e?s)?").join("|")})\\b`, "gi");

const STORY_KINDS = ["Playground", "Variants", "Sizes", "States", "Parts"] as const;

type StoryKind = (typeof STORY_KINDS)[number] | "assembled";

const INTERACTION = new Set(["hover", "focus", "focus-visible", "focus-within", "active", "open", "popover-open", "user-invalid"]);

const STRUCTURAL = new Set(["is", "where", "not", "has", "first-child", "last-child", "only-child", "nth-child", "nth-of-type", "first-of-type", "last-of-type", "root", "empty", "defined", "scope"]);

// happy-dom misses these, so each is tested by the markup that turns it on. A checkbox is
// indeterminate only through script, so static markup shows the state on a value-less progress alone.
const STATIC_STATE: Readonly<Record<string, string>> = {
  ":checked": ":is(:checked, option[selected])",
  ":required": "[required]",
  ":indeterminate": "progress:not([value])",
  ":dir(rtl)": ':is([dir="rtl"], [dir="rtl"] *)',
};

const STATE_ATTRIBUTE: Readonly<Record<string, string>> = { ":disabled": "disabled", ":checked": "checked", ":required": "required", ":open": "open" };

const NAMED_COLORS = /\b(?:white|black|red|green|blue|gray|grey|silver|yellow|orange|purple|pink)\b/gi;

const SYSTEM_COLORS =
  /\b(?:Canvas|CanvasText|LinkText|VisitedText|ActiveText|ButtonFace|ButtonText|ButtonBorder|Field|FieldText|Highlight|HighlightText|SelectedItem|SelectedItemText|Mark|MarkText|GrayText|AccentColor|AccentColorText)\b/g;

const CHROMES = globSync("src/css/chromes/*.css").map(normalize).sort();

type Hit = { readonly where: string; readonly text: string; readonly comment?: boolean };
type Decl = { readonly property: string; readonly value: string; readonly line: number };
type Rule = { readonly selector: string | undefined; readonly line: number; readonly decls: readonly Decl[] };
type Axis = { readonly axis: string; readonly kind: "attribute" | "part" | "state" | "interaction" | "forbidden"; readonly renderedBy: readonly string[] };
type Story = { readonly id: string; readonly kind: StoryKind; readonly controls: boolean; readonly mirrored: boolean };
type Rendered = { readonly entry: Entry; readonly host: HTMLElement; readonly classes: ReadonlySet<string> };

function fail(message: string): never {
  throw new Error(message);
}

function normalize(path: string): string {
  return path.replaceAll("\\", "/");
}

function read(path: string): string {
  return readFileSync(path, "utf8");
}

type Source = { readonly file: string; readonly from: number; readonly to: number; readonly whole: boolean };

function source(root: string, spec: string): Source {
  const [path, range] = spec.split(":");
  const file = `${root}/${path}`;
  if (!existsSync(file)) fail(`${file} does not exist`);
  const length = read(file).replace(/\n$/, "").split("\n").length;
  if (range === undefined) return { file, from: 1, to: length, whole: true };
  const [from, to] = range.split("-").map(Number);
  if (from === undefined || to === undefined || !(from >= 1 && to >= from && to <= length)) fail(`${spec}: bad line range for a ${length}-line file`);
  return { file, from, to, whole: false };
}

function label(src: Source): string {
  return src.whole ? src.file : `${src.file}:${src.from}-${src.to}`;
}

function parseCss(css: string): Rule[] {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));
  const rules: Rule[] = [];
  const stack: ("skip" | "group" | "rule")[] = [];
  let line = 1;
  let start = 0;
  let startLine = 1;
  let selector: string | undefined;
  let selectorLine = 1;
  let decls: Decl[] = [];
  const declare = (chunk: string, at: number) => {
    const colon = chunk.indexOf(":");
    if (colon === -1) return;
    const lead = chunk.length - chunk.trimStart().length;
    const declLine = at + (chunk.slice(0, lead).match(/\n/g)?.length ?? 0);
    decls.push({ property: chunk.slice(0, colon).trim(), value: chunk.slice(colon + 1).trim(), line: declLine });
  };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "\n") line++;
    if (char !== "{" && char !== "}" && char !== ";") continue;
    const chunk = text.slice(start, i);
    if (char === ";") {
      if (stack.at(-1) === "rule" || stack.at(-1) === "skip") declare(chunk, startLine);
    } else if (char === "{") {
      const prelude = chunk.trim();
      const lead = chunk.length - chunk.trimStart().length;
      const preludeLine = startLine + (chunk.slice(0, lead).match(/\n/g)?.length ?? 0);
      const parent = stack.at(-1);
      if (prelude.startsWith("@")) stack.push(/^@(keyframes|property)\b/.test(prelude) ? "skip" : "group");
      else {
        stack.push(parent === "skip" ? "skip" : "rule");
        selector = parent === "skip" ? undefined : prelude;
        selectorLine = preludeLine;
        decls = [];
      }
    } else {
      const closing = stack.pop();
      if (closing === "rule" || closing === "skip") declare(chunk, startLine);
      if (closing === "rule" || (closing === "skip" && stack.at(-1) === "skip")) rules.push({ selector, line: selectorLine, decls });
      decls = [];
    }
    start = i + 1;
    startLine = line;
  }
  return rules;
}

function splitTopLevel(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] === "(" || list[i] === "[") depth++;
    else if (list[i] === ")" || list[i] === "]") depth--;
    else if (list[i] === "," && depth === 0) {
      parts.push(list.slice(start, i).trim());
      start = i + 1;
    }
  }
  return [...parts, list.slice(start).trim()];
}

function withoutVar(value: string): string {
  let out = "";
  for (let i = 0; i < value.length; i++) {
    if (!value.startsWith("var(", i)) {
      out += value[i];
      continue;
    }
    let depth = 0;
    for (; i < value.length; i++) {
      if (value[i] === "(") depth++;
      else if (value[i] === ")" && --depth === 0) break;
    }
  }
  return out;
}

function refs(value: string): string[] {
  return [...value.matchAll(/var\(\s*(--[\w-]+)/g)].map((match) => match[1]!);
}

function classTokens(selector: string): string[] {
  return [...selector.matchAll(/\.(odd-[\w-]+)/g)].map((match) => match[1]!);
}

function classPattern(className: string): RegExp {
  return new RegExp(`(?<![\\w-])${className}(?![\\w-])`);
}

function domainHits(where: string, text: string): Hit[] {
  return [...text.matchAll(DOMAIN)].map((match) => ({ where, text: match[0] }));
}

function codeHits(src: Source): Hit[] {
  const content = read(src.file);
  const code = content.replace(/\/\*[\s\S]*?\*\/|(?<!:)\/\/[^\n]*/g, (comment) => comment.replace(/[^\n]/g, " ")).split("\n");
  return content
    .split("\n")
    .slice(src.from - 1, src.to)
    .flatMap((text, index) => {
      const line = src.from + index;
      return [...text.matchAll(DOMAIN)].map((match) => ({
        where: `${src.file}:${line}`,
        text: match[0],
        comment: code[line - 1]!.slice(match.index, match.index + match[0].length).trim() === "",
      }));
    });
}

function words(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word !== "");
}

function kebab(name: string): string {
  return words(name).join("-");
}

function storyKind(name: string, controls: boolean): StoryKind {
  const kind = STORY_KINDS.find((candidate) => name.endsWith(candidate));
  if (kind === undefined || (kind === "Playground" && !controls)) return "assembled";
  return kind;
}

function checkFamilies(): void {
  const owners = new Map<string, string>();
  for (const family of FAMILIES) {
    for (const className of family.classes) {
      const prior = owners.get(className);
      if (prior !== undefined) fail(`${className} is in both ${prior} and ${family.name}`);
      owners.set(className, family.name);
    }
  }
  const registry = new Set<string>(CLASS_REGISTRY);
  const unowned = CLASS_REGISTRY.filter((className) => !owners.has(className));
  if (unowned.length > 0) fail(`CLASS_REGISTRY classes with no family in FAMILIES: ${unowned.join(", ")}`);
  const unknown = [...owners].filter(([className]) => !registry.has(className));
  if (unknown.length > 0) fail(`FAMILIES names classes CLASS_REGISTRY lacks: ${unknown.map(([className, family]) => `${className} (${family})`).join(", ")}`);
}

function reactFiles(): Map<string, string> {
  const files = new Map<string, string>();
  for (const file of globSync("src/react/*.tsx").map(normalize)) {
    for (const match of read(file).matchAll(/^export (?:function|const) ([A-Z]\w*)/gm)) files.set(match[1]!, file);
  }
  return files;
}

type ChromeFile = { readonly file: string; readonly declarations: number; readonly oddClasses: readonly string[] };

function chromeTokens(): { readonly varying: ReadonlySet<string>; readonly files: readonly ChromeFile[] } {
  const values = new Map<string, Map<string, string>>();
  const files: ChromeFile[] = [];
  for (const file of CHROMES) {
    const css = read(file);
    const decls = parseCss(css).flatMap((rule) => rule.decls.filter((decl) => decl.property.startsWith("--")));
    files.push({ file, declarations: decls.length, oddClasses: [...new Set(css.match(/odd-[\w-]+/g) ?? [])] });
    for (const decl of decls) {
      const byChrome = values.get(decl.property) ?? new Map<string, string>();
      byChrome.set(file, [byChrome.get(file), decl.value].filter((value) => value !== undefined).join("; "));
      values.set(decl.property, byChrome);
    }
  }
  const varying = new Set<string>();
  for (const [token, byChrome] of values) {
    if (byChrome.size < CHROMES.length || new Set(byChrome.values()).size > 1) varying.add(token);
  }
  return { varying, files };
}

function tokenDefs(rules: readonly Rule[]): Map<string, Set<string>> {
  const defs = new Map<string, Set<string>>();
  for (const decl of rules.flatMap((rule) => rule.decls)) {
    if (!decl.property.startsWith("--")) continue;
    const set = defs.get(decl.property) ?? new Set<string>();
    for (const ref of refs(decl.value)) set.add(ref);
    defs.set(decl.property, set);
  }
  return defs;
}

function closure(seed: ReadonlySet<string>, defs: ReadonlyMap<string, ReadonlySet<string>>): Set<string> {
  const varying = new Set(seed);
  let grew = true;
  while (grew) {
    grew = false;
    for (const [token, uses] of defs) {
      if (varying.has(token) || ![...uses].some((use) => varying.has(use))) continue;
      varying.add(token);
      grew = true;
    }
  }
  return varying;
}

async function renderStories(): Promise<Rendered[]> {
  const { html } = await catalog();
  return html.map((entry) => {
    const host = document.createElement("div");
    document.body.append(host);
    const out = renderHtml(entry);
    if (typeof out === "string") host.innerHTML = out;
    else if (out instanceof Node) host.append(out);
    else fail(`${entry.label} rendered neither markup nor a node`);
    const classes = new Set([...host.querySelectorAll("[class]")].flatMap((element) => [...element.classList]).filter((name) => name.startsWith("odd-")));
    return { entry, host, classes };
  });
}

function subjects(stories: readonly Rendered[], owner: ReadonlyMap<string, string>): Map<string, string[]> {
  const components = stories.filter((story) => story.entry.meta.title.startsWith("Components/"));
  const seen = new Map<string, number>();
  for (const story of components) for (const name of story.classes) seen.set(name, (seen.get(name) ?? 0) + 1);
  const names = new Map<string, string>();
  for (const family of FAMILIES) {
    names.set(kebab(family.name), family.name);
    for (const className of family.classes) names.set(className.slice("odd-".length), family.name);
  }
  const bySubject = new Map<string, string[]>();
  for (const story of components) {
    const rendered = new Set([...story.classes].map((name) => owner.get(name)).filter((name) => name !== undefined));
    const matches: { family: string; start: number; end: number }[] = [];
    for (const source of [story.entry.exportName, story.entry.meta.title.split("/").at(-1)!]) {
      const parts = words(source);
      for (let start = 0; start < parts.length; start++) {
        for (let end = start; end < parts.length; end++) {
          const phrase = parts.slice(start, end + 1).join("-");
          const family = names.get(phrase) ?? names.get(phrase.replace(/s$/, ""));
          if (family !== undefined && rendered.has(family)) matches.push({ family, start, end });
        }
      }
    }
    const longest = matches.filter((m) => !matches.some((n) => n !== m && n.start <= m.start && m.end <= n.end && n.end - n.start > m.end - m.start));
    let families = [...new Set(longest.map((m) => m.family))];
    if (families.length === 0) {
      const rarest = Math.min(...[...story.classes].map((name) => seen.get(name)!));
      families = [...new Set([...story.classes].filter((name) => seen.get(name) === rarest).map((name) => owner.get(name)!))];
    }
    for (const family of families) bySubject.set(family, [...(bySubject.get(family) ?? []), story.entry.id]);
  }
  return bySubject;
}

function axesOf(rules: readonly Rule[], family: Family, stories: readonly Rendered[], forbidden: ReadonlySet<string>): Axis[] {
  const found = new Map<string, Axis["kind"]>();
  for (const rule of rules) {
    if (rule.selector === undefined) continue;
    for (const complex of splitTopLevel(rule.selector)) {
      for (const match of complex.matchAll(/\[\s*([\w-]+)\s*(?:[~|^$*]?=\s*("[^"]*"|'[^']*'|[^\]\s]+))?\s*\]/g)) {
        const value = match[2]?.replace(/^'|'$/g, '"');
        found.set(value === undefined ? `[${match[1]}]` : `[${match[1]}=${value.startsWith('"') ? value : `"${value}"`}]`, "attribute");
      }
      for (const className of classTokens(complex)) if (family.classes.includes(className)) found.set(`.${className}`, "part");
      for (const match of complex.matchAll(/(?<!:):(-?[\w-]+)(?=(\([^()]*\))?)/g)) {
        const name = match[1]!;
        if (STRUCTURAL.has(name) || name.startsWith("-")) continue;
        const attribute = STATE_ATTRIBUTE[`:${name}`];
        found.set(`:${name}${name === "dir" ? (match[2] ?? "") : ""}`, attribute !== undefined && forbidden.has(attribute) ? "forbidden" : INTERACTION.has(name) ? "interaction" : "state");
      }
    }
  }
  const scope = family.classes.map((name) => `.${name}`).join(", ");
  return [...found].map(([axis, kind]) => {
    if (kind === "interaction" || kind === "forbidden") return { axis, kind, renderedBy: [] };
    const test = STATIC_STATE[axis] ?? axis;
    const renderedBy = stories
      .filter((story) => [...story.host.querySelectorAll(test)].some((element) => element.closest(scope) !== null))
      .map((story) => story.entry.id);
    return { axis, kind, renderedBy };
  });
}

function storyText(story: Rendered): string {
  const attributes = [...story.host.querySelectorAll("*")].flatMap((element) => [...element.attributes].filter((attr) => attr.name !== "class").map((attr) => attr.value));
  return [story.host.textContent ?? "", ...attributes].join("\n");
}

const json = process.argv.includes("--json");

checkFamilies();

const owner = new Map(FAMILIES.flatMap((family) => family.classes.map((className) => [className, family.name] as const)));
const reactSource = reactFiles();
for (const family of FAMILIES) {
  for (const name of family.react) if (!reactSource.has(name)) fail(`${family.name} names React export ${name}, which src/react does not export`);
}

const chrome = chromeTokens();
const sharedRules = ["src/css/foundations.css", "src/css/base.css", "src/css/preferences.css"].flatMap((file) => parseCss(read(file)));
const readme = read("README.md").split("\n");
const testFiles = globSync("tests/**/*.{ts,tsx}").map(normalize).filter((file) => !file.startsWith("tests/fixtures/")).sort();
const e2eFiles = globSync("e2e/**/*.ts").map(normalize).sort();
const usagePages = new Set(globSync("docs/usage/*.md").map((file) => basename(file, ".md")));
const allCodes = [...new Set(Object.values(USAGE).flatMap((rules) => rules.map((rule) => rule.code)))].sort();

GlobalRegistrator.register();
const stories = await renderStories();
const bySubject = subjects(stories, owner);

const cssOf = new Map(
  FAMILIES.map((family) => {
    const src = source("src/css", family.css);
    const rules = parseCss(read(src.file)).filter((rule) => rule.line >= src.from && rule.line <= src.to);
    return [family.name, { src, rules }] as const;
  }),
);

const reachedBy = new Map<string, Set<string>>();
for (const family of FAMILIES) {
  for (const rule of cssOf.get(family.name)!.rules) {
    for (const className of classTokens(rule.selector ?? "")) {
      const target = owner.get(className);
      if (target === undefined || target === family.name) continue;
      reachedBy.set(target, (reachedBy.get(target) ?? new Set()).add(family.name));
    }
  }
}

const report = FAMILIES.map((family) => {
  const { src, rules } = cssOf.get(family.name)!;
  const js = family.js.map((spec) => source("src/js", spec));
  const selected = new Set(rules.flatMap((rule) => classTokens(rule.selector ?? "")));
  const reaches = [...selected].filter((name) => !family.classes.includes(name)).sort();
  const subjectIds = bySubject.get(family.name) ?? [];
  const subjectStories = stories.filter((story) => subjectIds.includes(story.entry.id));
  const decls = rules.flatMap((rule) => rule.decls);
  const ownDefs = tokenDefs(rules);
  const varying = closure(chrome.varying, new Map([...tokenDefs(sharedRules), ...ownDefs]));
  const tokensRead = [...new Set(decls.flatMap((decl) => refs(decl.value)))].filter((token) => !ownDefs.has(token)).sort();
  const literal = (pattern: RegExp) =>
    decls.flatMap((decl) => [...withoutVar(decl.value).matchAll(pattern)].map((match) => ({ where: `${src.file}:${decl.line}`, text: match[0] })));
  const fonts = decls
    .filter((decl) => (decl.property === "font-family" || decl.property === "font") && !/^(?:var\(|inherit$)/.test(decl.value))
    .map((decl) => ({ where: `${src.file}:${decl.line}`, text: `${decl.property}: ${decl.value}` }));

  const strong = [
    ...family.classes.flatMap((className) => domainHits(`class ${className}`, className)),
    ...[src, ...js, ...[...new Set(family.react.map((name) => reactSource.get(name)!))].map((file) => source("src/react", basename(file)))].flatMap(codeHits),
    ...readme.flatMap((text, index) => (family.classes.some((name) => classPattern(name).test(text)) ? domainHits(`README.md:${index + 1}`, text) : [])),
  ];
  const usageSlug = [kebab(family.name), basename(src.file, ".css"), ...family.classes.map((name) => name.slice("odd-".length))].find((slug) => usagePages.has(slug));
  const usagePage = usageSlug === undefined ? undefined : `docs/usage/${usageSlug}.md`;
  if (usagePage !== undefined) {
    strong.push(
      ...read(usagePage)
        .split("\n")
        .flatMap((text, index) => domainHits(`${usagePage}:${index + 1}`, text)),
    );
  }
  const weak = subjectStories.flatMap((story) => domainHits(story.entry.id, storyText(story)));

  const groups = Object.values(USAGE).filter((group) => group.some((rule) => rule.kind === "element" && family.classes.includes(rule.className)));
  const prefixes = new Set(groups.flatMap((group) => group.filter((rule) => rule.kind === "element" && family.classes.includes(rule.className)).map((rule) => rule.code.replace(/-\d+$/, ""))));
  const codes = allCodes.filter((code) => prefixes.has(code.replace(/-\d+$/, "")));
  const borrowed = [...new Set(groups.flatMap((group) => group.map((rule) => rule.code)))].filter((code) => !codes.includes(code)).sort();
  const fixture = (code: string, kind: "good" | "bad") => existsSync(`tests/fixtures/usage/${code.toLowerCase()}.${kind}.html`);
  const vocabularyKey = basename(src.file, ".css");

  const familyTests = (files: readonly string[]) =>
    files.filter((file) => {
      const text = read(file);
      return family.classes.some((name) => classPattern(name).test(text)) || subjectIds.some((id) => text.includes(id));
    });

  return {
    family: family.name,
    shape: {
      classes: family.classes,
      css: label(src),
      cssLines: src.to - src.from + 1,
      js: js.map(label),
      react: family.react,
      unselected: family.classes.filter((name) => !selected.has(name)),
      reaches: Object.fromEntries(
        [...new Set(reaches.map((name) => owner.get(name) ?? "unregistered"))].map((target) => [target, reaches.filter((name) => (owner.get(name) ?? "unregistered") === target)]),
      ),
      reachedBy: [...(reachedBy.get(family.name) ?? [])].sort(),
      storyNeighbours: [...new Set(subjectStories.flatMap((story) => [...story.classes].map((name) => owner.get(name)).filter((name) => name !== undefined && name !== family.name)))].sort(),
    },
    tokens: {
      read: tokensRead,
      chromeVarying: tokensRead.filter((token) => varying.has(token)),
      colors: literal(/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color)\(/gi).concat(literal(NAMED_COLORS)),
      systemColors: literal(SYSTEM_COLORS),
      lengths: literal(/(?<![\w.#-])-?\d*\.?\d+(?:px|rem|em|ch|ex|vw|vh|vi|vb|vmin|vmax|dvh|svh|lvh|cqi|cqw|cqh)\b/g),
      fonts,
      forcedColorsBlocks: (read(src.file).split("\n").slice(src.from - 1, src.to).join("\n").match(/@media\s*\(forced-colors/g) ?? []).length,
    },
    domain: { strong, weak },
    stories: {
      subject: subjectStories.map((story): Story => {
        const controls = Object.keys({ ...story.entry.meta.args, ...story.entry.story.args }).length > 0;
        return { id: story.entry.id, kind: storyKind(story.entry.exportName, controls), controls, mirrored: "mirror" in story.entry };
      }),
      alsoIn: stories
        .filter((story) => !subjectIds.includes(story.entry.id) && family.classes.some((name) => story.classes.has(name)))
        .map((story) => story.entry.id),
    },
    axes: axesOf(rules, family, stories, new Set(groups.flat().flatMap((rule) => (rule.kind === "forbidden-attribute" ? [rule.attribute] : [])))).map((axis) => ({ ...axis, own: axis.renderedBy.some((id) => subjectIds.includes(id)) })),
    contract: {
      codes,
      borrowed,
      good: codes.filter((code) => fixture(code, "good")).length,
      bad: codes.filter((code) => fixture(code, "bad")).length,
      missingFixtures: codes.flatMap((code) => (["good", "bad"] as const).filter((kind) => !fixture(code, kind)).map((kind) => `${code}.${kind}`)),
      vocabulary: Object.hasOwn(VOCABULARY, vocabularyKey) ? { key: vocabularyKey, attributes: VOCABULARY[vocabularyKey as keyof typeof VOCABULARY] } : undefined,
      wrappers: Object.entries(WRAPPERS)
        .filter(([, wrapper]) => family.classes.includes(wrapper.className))
        .map(([name]) => name),
      usagePage,
    },
    tests: { unit: familyTests(testFiles), e2e: familyTests(e2eFiles) },
  };
});

await GlobalRegistrator.unregister();

function cell(text: string): string {
  return text.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function code(values: readonly string[]): string {
  return values.map((value) => `\`${value}\``).join(", ");
}

function hits(list: readonly Hit[]): string {
  return list.map((hit) => `${hit.text} @ ${hit.where}${hit.comment ? " (comment)" : ""}`).join("; ");
}

function table(title: string, head: readonly string[], body: readonly (readonly string[])[]): string {
  const row = (cells: readonly string[]) => `| ${cells.map(cell).join(" | ")} |`;
  return [`## ${title}`, "", row(head), row(head.map(() => "---")), ...body.map(row), ""].join("\n");
}

const markdown = [
  table(
    "Shape",
    ["Family", "Classes", "CSS", "CSS lines", "JS", "React", "Selects other families", "Selected by", "Own classes no selector names", "Other families in its stories"],
    report.map((r) => [
      r.family,
      code(r.shape.classes),
      `\`${r.shape.css}\``,
      String(r.shape.cssLines),
      code(r.shape.js),
      r.shape.react.join(", "),
      Object.entries(r.shape.reaches)
        .map(([target, names]) => `${target} (${code(names)})`)
        .join("; "),
      r.shape.reachedBy.join(", "),
      code(r.shape.unselected),
      r.shape.storyNeighbours.join(", "),
    ]),
  ),
  table(
    "Tokens",
    ["Family", "Tokens read", "Chrome-varying tokens read", "Literal colors", "System colors", "Literal lengths", "Literal fonts", "Forced-colors blocks"],
    report.map((r) => [
      r.family,
      String(r.tokens.read.length),
      `${r.tokens.chromeVarying.length}: ${code(r.tokens.chromeVarying)}`,
      hits(r.tokens.colors),
      String(r.tokens.systemColors.length),
      hits(r.tokens.lengths),
      hits(r.tokens.fonts),
      String(r.tokens.forcedColorsBlocks),
    ]),
  ),
  table(
    "Domain words",
    ["Family", "Strong", "Strong hits", "Weak", "Weak hits"],
    report.map((r) => [r.family, String(r.domain.strong.length), hits(r.domain.strong), String(r.domain.weak.length), hits(r.domain.weak)]),
  ),
  table(
    "Story depth",
    ["Family", "Stories", ...STORY_KINDS, "Assembled", "With controls", "Mirrored", "Story ids", "Also rendered in"],
    report.map((r) => [
      r.family,
      String(r.stories.subject.length),
      ...[...STORY_KINDS, "assembled" as const].map((kind) => String(r.stories.subject.filter((story) => story.kind === kind).length)),
      String(r.stories.subject.filter((story) => story.controls).length),
      String(r.stories.subject.filter((story) => story.mirrored).length),
      code(r.stories.subject.map((story) => `${story.id} (${story.kind})`)),
      code(r.stories.alsoIn),
    ]),
  ),
  table(
    "Axes",
    ["Family", "Axes", "Rendered by its stories", "Rendered only by other stories", "No story renders", "Forbidden by its contract", "Needs interaction"],
    report.map((r) => {
      const counted = r.axes.filter((axis) => axis.kind !== "interaction" && axis.kind !== "forbidden");
      return [
        r.family,
        String(counted.length),
        code(counted.filter((axis) => axis.own).map((axis) => axis.axis)),
        code(counted.filter((axis) => !axis.own && axis.renderedBy.length > 0).map((axis) => axis.axis)),
        code(counted.filter((axis) => axis.renderedBy.length === 0).map((axis) => axis.axis)),
        code(r.axes.filter((axis) => axis.kind === "forbidden").map((axis) => axis.axis)),
        code(r.axes.filter((axis) => axis.kind === "interaction").map((axis) => axis.axis)),
      ];
    }),
  ),
  table(
    "Contract",
    ["Family", "Usage codes", "Codes", "Borrowed codes", "Good fixtures", "Bad fixtures", "Missing fixtures", "VOCABULARY", "WRAPPERS", "Usage page"],
    report.map((r) => [
      r.family,
      String(r.contract.codes.length),
      r.contract.codes.join(", "),
      r.contract.borrowed.join(", "),
      String(r.contract.good),
      String(r.contract.bad),
      r.contract.missingFixtures.join(", "),
      r.contract.vocabulary === undefined ? "" : `${r.contract.vocabulary.key}: ${code(r.contract.vocabulary.attributes)}`,
      r.contract.wrappers.join(", "),
      r.contract.usagePage === undefined ? "" : `\`${r.contract.usagePage}\``,
    ]),
  ),
  table(
    "Tests",
    ["Family", "Unit tests", "E2E tests"],
    report.map((r) => [r.family, code(r.tests.unit), code(r.tests.e2e)]),
  ),
  table(
    "Chrome files",
    ["Chrome", "Token declarations", "odd-* classes named"],
    chrome.files.map((c) => [`\`${c.file}\``, String(c.declarations), code(c.oddClasses)]),
  ),
];

console.log(json ? JSON.stringify({ families: report, chromes: chrome.files, chromeVaryingTokens: [...chrome.varying].sort() }, null, 2) : markdown.join("\n"));
