import { globSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isExportStory, storyNameFromExport, toId } from "storybook/internal/csf";
import { toHtml, type Mirror } from "./mirror.ts";

export const STORYBOOKS = {
  html: { title: "HTML", configDir: ".storybook", stories: "stories/**/*.stories.ts" },
  react: { title: "React", configDir: ".storybook-react", stories: "stories/mirrored/*.stories.ts" },
} as const;

export type Storybook = keyof typeof STORYBOOKS;

type Args = Record<string, unknown>;
type Render = (args: Args, context: { globals: Record<string, string> }) => unknown;
type StoryDescriptor = string[] | RegExp;

export type Entry = {
  readonly id: string;
  readonly label: string;
  readonly file: string;
  readonly exportName: string;
  readonly meta: {
    readonly title: string;
    readonly args?: Args;
    readonly argTypes?: Readonly<Record<string, { readonly options?: readonly string[] }>>;
    readonly render?: Render;
  };
  readonly story: { readonly args?: Args; readonly render?: Render };
};

export type MirroredEntry = Entry & { readonly mirror: Mirror<Args> };

export type Catalog = {
  readonly html: readonly Entry[];
  readonly react: readonly MirroredEntry[];
};

const repo = fileURLToPath(new URL("..", import.meta.url));
const previewGlobals = { chrome: "calm", palette: "default", mode: "system" };

function files(pattern: string): string[] {
  return globSync(pattern, { cwd: repo })
    .map((file) => file.replaceAll("\\", "/"))
    .sort();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRender(value: unknown): value is Render {
  return typeof value === "function";
}

function readArgs(value: unknown): Args | undefined {
  if (!isRecord(value)) return undefined;
  return value;
}

function readArgTypes(value: unknown): Entry["meta"]["argTypes"] {
  if (!isRecord(value)) return undefined;
  const argTypes: Record<string, { readonly options?: readonly string[] }> = {};
  for (const [name, spec] of Object.entries(value)) {
    if (!isRecord(spec) || !Array.isArray(spec.options)) {
      argTypes[name] = {};
      continue;
    }
    argTypes[name] = { options: spec.options.filter((option): option is string => typeof option === "string") };
  }
  return argTypes;
}

function descriptor(value: unknown): StoryDescriptor | undefined {
  if (value instanceof RegExp) return value;
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) return value;
  return undefined;
}

function isMirror(value: unknown): value is Mirror<Args> {
  return isRecord(value) && typeof value.scene === "function" && typeof value.aria === "string";
}

async function load(file: string): Promise<Record<string, unknown>> {
  return await import(pathToFileURL(resolve(repo, file)).href);
}

export async function catalog(): Promise<Catalog> {
  const mirroredFiles = new Set(files(STORYBOOKS.react.stories));
  const html: Entry[] = [];
  const react: MirroredEntry[] = [];
  const owners = new Map<string, string>();

  for (const file of files(STORYBOOKS.html.stories)) {
    const loaded = await load(file);
    const meta = loaded.default;
    if (!isRecord(meta) || typeof meta.title !== "string") throw new Error(`${file} has no title`);
    const metaRender = isRender(meta.render) ? meta.render : undefined;
    const title = meta.title;

    for (const [name, value] of Object.entries(loaded)) {
      if (name === "default" || !isRecord(value)) continue;
      if (isExportStory(name, { includeStories: descriptor(meta.includeStories), excludeStories: descriptor(meta.excludeStories) }) !== true) continue;

      const id = toId(title, storyNameFromExport(name));
      const owner = `${file} ${name}`;
      const prior = owners.get(id);
      if (prior !== undefined) throw new Error(`${owner}: id ${id} also exported by ${prior}`);
      owners.set(id, owner);

      const mirror = isRecord(value.parameters) ? value.parameters.mirror : undefined;
      const hasMirror = isMirror(mirror);
      if (mirroredFiles.has(file) !== hasMirror) {
        throw new Error(`${owner}: mirrored stories live in stories/mirrored/, and only there`);
      }
      const storyRender = isRender(value.render) ? value.render : undefined;
      if (hasMirror && (storyRender !== undefined || metaRender !== undefined)) {
        throw new Error(`${owner}: a render here would override the React preview's`);
      }

      const entry: Entry = {
        id,
        label: `${title} / ${name}`,
        file,
        exportName: name,
        meta: { title, args: readArgs(meta.args), argTypes: readArgTypes(meta.argTypes), render: metaRender },
        story: { args: readArgs(value.args), render: storyRender },
      };
      if (!hasMirror) {
        html.push(entry);
        continue;
      }
      const mirrored: MirroredEntry = { ...entry, mirror };
      html.push(mirrored);
      react.push(mirrored);
    }
  }

  return { html, react };
}

export function renderHtml(entry: Entry, args: Args = {}): unknown {
  const merged = { ...entry.meta.args, ...entry.story.args, ...args };
  if ("mirror" in entry && isMirror(entry.mirror)) return toHtml(entry.mirror.scene(merged));
  const render = entry.story.render ?? entry.meta.render;
  if (render === undefined) throw new Error(`${entry.label} has no render`);
  return render(merged, { globals: previewGlobals });
}
