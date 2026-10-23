import { expect, test } from "bun:test";
import { avatarFallback, closedByFallback, interestForFallback } from "../src/js/enhance.ts";
import { USAGE } from "../src/js/usage/contract.ts";
import { checkRoot } from "../src/js/usage/dom.ts";
import * as buttonStories from "../stories/Button.stories.ts";
import * as customPaletteStories from "../stories/CustomPalette.stories.ts";
import * as dataDisplayStories from "../stories/DataDisplay.stories.ts";
import * as feedbackStories from "../stories/Feedback.stories.ts";
import * as formsStories from "../stories/Forms.stories.ts";
import * as foundationsStories from "../stories/Foundations.stories.ts";
import * as interactiveStories from "../stories/Interactive.stories.ts";
import * as overlaysStories from "../stories/Overlays.stories.ts";
import * as showcaseStories from "../stories/Showcase.stories.ts";
import * as surfacesStories from "../stories/Surfaces.stories.ts";

interestForFallback();
closedByFallback();
avatarFallback();

const globals = { chrome: "calm", palette: "default", mode: "system" } as const;

type Globals = { chrome: string; palette: string; mode: string };

type StoryExport = {
  readonly render?: (args: Record<string, unknown>, context: { globals: Globals }) => unknown;
  readonly args?: Record<string, unknown>;
  readonly argTypes?: Readonly<Record<string, { readonly options?: readonly string[] }>>;
  readonly title?: string;
};

type LoadedStory = {
  readonly label: string;
  readonly meta: StoryExport;
  readonly story: StoryExport;
};

const STORY_LABELS = [
  "Components/Button / Playground",
  "Components/Button / Sizes",
  "Components/Button / States",
  "Components/Button / Variants",
  "Components/Data Display / Avatar",
  "Components/Data Display / Separator",
  "Components/Data Display / Table",
  "Components/Feedback / Alert",
  "Components/Feedback / Progress",
  "Components/Feedback / Skeleton",
  "Components/Forms / Choices",
  "Components/Forms / Search",
  "Components/Forms / Segmented",
  "Components/Forms / Select",
  "Components/Forms / Slider",
  "Components/Forms / Switch",
  "Components/Forms / TextFields",
  "Components/Interactive / Menu",
  "Components/Interactive / Tabs",
  "Components/Interactive / Toast",
  "Components/Overlays / AlertDialog",
  "Components/Overlays / HoverCard",
  "Components/Overlays / Popover",
  "Components/Overlays / Sheet",
  "Components/Overlays / Tooltip",
  "Components/Surfaces / Badge",
  "Components/Surfaces / Card",
  "Components/Surfaces / Dialog",
  "Components/Surfaces / Disclosure",
  "Foundations / Contrast",
  "Foundations / Headings",
  "Foundations / Palette",
  "Foundations / Type",
  "Foundations/Custom Palette / Generator",
  "Showcase / Matrix",
  "Showcase / SampleApp",
] as const;

function readModule(mod: object, file: string): { meta: StoryExport; stories: LoadedStory[] } {
  const record = mod as Record<string, StoryExport>;
  const meta = record.default;
  if (meta === undefined || typeof meta.title !== "string") throw new Error(`${file} has no title`);
  const stories = Object.entries(record)
    .filter(([name, value]) => name !== "default" && value !== null && typeof value === "object")
    .map(([name, story]) => ({ label: `${meta.title} / ${name}`, meta, story }));
  return { meta, stories };
}

const modules = [
  readModule(buttonStories, "Button.stories.ts"),
  readModule(customPaletteStories, "CustomPalette.stories.ts"),
  readModule(dataDisplayStories, "DataDisplay.stories.ts"),
  readModule(feedbackStories, "Feedback.stories.ts"),
  readModule(formsStories, "Forms.stories.ts"),
  readModule(foundationsStories, "Foundations.stories.ts"),
  readModule(interactiveStories, "Interactive.stories.ts"),
  readModule(overlaysStories, "Overlays.stories.ts"),
  readModule(showcaseStories, "Showcase.stories.ts"),
  readModule(surfacesStories, "Surfaces.stories.ts"),
];

const stories = modules.flatMap((mod) => mod.stories);

function asRoot(result: unknown, label: string): ParentNode {
  if (typeof result === "string") {
    const root = document.createElement("div");
    root.innerHTML = result;
    return root;
  }
  if (result instanceof Element) return result;
  throw new Error(`${label} rendered ${result === null ? "null" : typeof result}`);
}

function renderStory(meta: StoryExport, story: StoryExport, label: string, args: Record<string, unknown> = {}): ParentNode {
  const render = story.render ?? meta.render;
  if (render === undefined) throw new Error(`${label} has no render`);
  return asRoot(render({ ...meta.args, ...story.args, ...args }, { globals }), label);
}

test("checks 36 stories", () => {
  expect(stories.map((story) => story.label).sort()).toEqual([...STORY_LABELS].sort());
});

for (const story of stories) {
  test(story.label, () => {
    checkRoot(renderStory(story.meta, story.story, story.label));
  });
}

const button = readModule(buttonStories, "Button.stories.ts");

function findPlayground(list: readonly LoadedStory[]): LoadedStory {
  const found = list.find((story) => story.label.endsWith(" / Playground"));
  if (found === undefined) throw new Error("Button stories have no Playground");
  return found;
}

const playground = findPlayground(button.stories);

function enumControl(attribute: "data-variant" | "data-size", arg: "variant" | "size") {
  const rule = USAGE.button.find((item) => item.kind === "enum" && item.attribute === attribute);
  if (rule === undefined || rule.kind !== "enum") throw new Error(`no enum rule for ${attribute}`);
  const options = button.meta.argTypes?.[arg]?.options;
  if (options === undefined) throw new Error(`Playground argTypes.${arg} has no options`);
  const absent = rule.omit.filter((token) => options.includes(token));
  return { rule, options, absent, arg, attribute };
}

function ariaControl(attribute: "aria-disabled" | "aria-busy", arg: "disabled" | "busy") {
  const rule = USAGE.button.find((item) => item.kind === "aria-boolean" && item.attribute === attribute);
  if (rule === undefined || rule.kind !== "aria-boolean") throw new Error(`no aria rule for ${attribute}`);
  return { rule, arg, attribute };
}

const variantControl = enumControl("data-variant", "variant");
const sizeControl = enumControl("data-size", "size");
const disabledControl = ariaControl("aria-disabled", "disabled");
const busyControl = ariaControl("aria-busy", "busy");

function playgroundButton(args: Record<string, unknown>): HTMLButtonElement {
  const root = renderStory(playground.meta, playground.story, playground.label, args);
  checkRoot(root);
  const button = root.querySelector("button");
  if (!(button instanceof HTMLButtonElement)) throw new Error("Playground rendered no button");
  return button;
}

test("Playground argTypes match the button contract", () => {
  for (const control of [variantControl, sizeControl]) {
    expect(control.absent).toHaveLength(1);
    expect([...control.options].sort()).toEqual([...control.rule.values, control.absent[0]].sort());
  }
});

for (const control of [variantControl, sizeControl]) {
  for (const value of control.options) {
    test(`Playground ${control.arg}=${value}`, () => {
      const button = playgroundButton({ [control.arg]: value });
      expect(button.getAttribute(control.attribute)).toBe(value === control.absent[0] ? null : value);
      expect(button.hasAttribute("disabled")).toBe(false);
    });
  }
}

function pressed(value: "true" | "false"): boolean {
  switch (value) {
    case "true":
      return true;
    case "false":
      return false;
    default: {
      const unreachable: never = value;
      return unreachable;
    }
  }
}

for (const control of [disabledControl, busyControl]) {
  for (const value of control.rule.values) {
    test(`Playground ${control.arg}=${value}`, () => {
      const button = playgroundButton({ [control.arg]: pressed(value) });
      expect(button.getAttribute(control.attribute)).toBe(value === "true" ? "true" : null);
      expect(button.hasAttribute("disabled")).toBe(false);
    });
  }
}
