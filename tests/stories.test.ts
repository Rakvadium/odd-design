import { globSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { USAGE } from "../src/js/usage/contract.ts";
import { checkRoot } from "../src/js/usage/dom.ts";
import { catalog, renderHtml, STORYBOOKS, type MirroredEntry } from "../stories/catalog.ts";
import { toHtml, type Scene } from "../stories/mirror.ts";
import { toReact } from "../stories/mirror-react.ts";

const repo = fileURLToPath(new URL("..", import.meta.url));

const { html, react } = await catalog();

function asRoot(result: unknown, label: string): ParentNode {
  if (typeof result === "string") {
    const root = document.createElement("div");
    root.innerHTML = result;
    return root;
  }
  if (result instanceof Element) return result;
  throw new Error(`${label} rendered ${result === null ? "null" : typeof result}`);
}

function reactRoot(entry: MirroredEntry, args: Record<string, unknown> = {}): ParentNode {
  const merged = { ...entry.meta.args, ...entry.story.args, ...args };
  return asRoot(renderToStaticMarkup(toReact(entry.mirror.scene(merged))), entry.label);
}

test("the catalog has every story file's stories, and Button, Field, Choice, Badge, Alert, Avatar, Separator, Skeleton, Card, Disclosure, Tabs, Search, Slider, Meter, and Progress are mirrored", () => {
  const storyFiles = globSync(STORYBOOKS.html.stories, { cwd: repo }).map((file) => file.replaceAll("\\", "/"));
  const covered = new Set(html.map((entry) => entry.file));
  const skipped = storyFiles.filter((file) => !covered.has(file));
  expect(skipped).toEqual([]);
  expect(react.map((entry) => entry.id)).toEqual(
    expect.arrayContaining([
      "components-button--playground",
      "components-forms--text-fields",
      "components-forms--select",
      "components-forms--choices",
      "components-forms--switch",
      "components-forms--segmented",
      "components-surfaces--badge",
      "components-surfaces--card",
      "components-surfaces--disclosure",
      "components-feedback--alert",
      "components-data-display--avatar",
      "components-data-display--separator",
      "components-feedback--skeleton",
      "components-interactive--tabs",
      "components-forms--search",
      "components-forms--slider",
      "components-feedback--progress",
      "components-interactive--toast",
    ]),
  );
  expect(react.every((entry) => html.some((item) => item.id === entry.id))).toBe(true);
});

function normalized(markup: string): string {
  const root = document.createElement("div");
  root.innerHTML = markup;
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? "").replace(/\s+/g, " ");
    if (!(node instanceof Element)) return "";
    const attrs = [...node.attributes]
      .filter((attr) => !(node.localName === "button" && attr.name === "type" && attr.value === "button"))
      .map((attr) => `${attr.name}="${attr.value.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}"`)
      .sort()
      .join(" ");
    const inner = [...node.childNodes].map(walk).join("");
    return `<${node.localName}${attrs === "" ? "" : ` ${attrs}`}>${inner}</${node.localName}>`;
  };
  return [...root.childNodes].map(walk).join("").replace(/>\s+</g, "><").trim();
}

function reactWithoutWarnings(scene: Scene, label: string): string {
  const warnings: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => warnings.push(args.join(" "));
  try {
    const markup = renderToStaticMarkup(toReact(scene));
    if (warnings.length > 0) throw new Error(`${label}: React warned\n${warnings.join("\n")}`);
    return markup;
  } finally {
    console.error = original;
  }
}

function expectSameDom(scene: Scene, label: string): void {
  const htmlMarkup = normalized(toHtml(scene));
  const reactMarkup = normalized(reactWithoutWarnings(scene, label));
  if (htmlMarkup !== reactMarkup) throw new Error(`${label}\n${htmlMarkup}\n${reactMarkup}`);
}

for (const entry of react) {
  test(`${entry.label} html matches react`, () => {
    const merged = { ...entry.meta.args, ...entry.story.args };
    expectSameDom(entry.mirror.scene(merged), entry.label);
  });
}

for (const entry of html) {
  test(entry.label, () => {
    checkRoot(asRoot(renderHtml(entry), entry.label));
  });
}

for (const entry of react) {
  test(`React ${entry.label}`, () => {
    checkRoot(reactRoot(entry));
  });
}

function fail(message: string): never {
  throw new Error(message);
}

const playground = react.find((entry) => entry.id === "components-button--playground") ?? fail("Button stories have no Playground");

function enumControl(attribute: "data-variant" | "data-size", arg: "variant" | "size") {
  const rule = USAGE.button.find((item) => item.kind === "enum" && item.attribute === attribute);
  if (rule?.kind !== "enum") throw new Error(`no enum rule for ${attribute}`);
  const options = playground.meta.argTypes?.[arg]?.options;
  if (options === undefined) throw new Error(`Playground argTypes.${arg} has no options`);
  const absent = rule.omit.filter((token) => options.includes(token));
  return { values: rule.values, options, absent, arg, attribute };
}

const variantControl = enumControl("data-variant", "variant");
const sizeControl = enumControl("data-size", "size");

function oneButton(root: ParentNode): HTMLButtonElement {
  const button = root.querySelector("button");
  if (!(button instanceof HTMLButtonElement)) throw new Error("Playground rendered no button");
  return button;
}

function playgroundButtons(args: Record<string, unknown>): { html: HTMLButtonElement; react: HTMLButtonElement } {
  const merged = { ...playground.meta.args, ...playground.story.args, ...args };
  expectSameDom(playground.mirror.scene(merged), `Playground ${JSON.stringify(args)}`);
  const htmlRoot = asRoot(renderHtml(playground, args), playground.label);
  checkRoot(htmlRoot);
  const reactNode = reactRoot(playground, args);
  checkRoot(reactNode);
  return { html: oneButton(htmlRoot), react: oneButton(reactNode) };
}

test("Playground argTypes match the button contract", () => {
  for (const control of [variantControl, sizeControl]) {
    expect(control.absent).toHaveLength(1);
    expect([...control.options].sort()).toEqual([...control.values, control.absent[0]].sort());
  }
});

for (const control of [variantControl, sizeControl]) {
  for (const value of control.options) {
    test(`Playground ${control.arg}=${value}`, () => {
      const buttons = playgroundButtons({ [control.arg]: value });
      const expected = value === control.absent[0] ? null : value;
      expect(buttons.html.getAttribute(control.attribute)).toBe(expected);
      expect(buttons.html.hasAttribute("disabled")).toBe(false);
      expect(buttons.react.getAttribute(control.attribute)).toBe(expected);
      expect(buttons.react.hasAttribute("disabled")).toBe(false);
    });
  }
}

for (const [arg, attribute] of [
  ["disabled", "aria-disabled"],
  ["busy", "aria-busy"],
] as const) {
  const rule = USAGE.button.find((item) => item.kind === "aria-boolean" && item.attribute === attribute);
  if (rule?.kind !== "aria-boolean") throw new Error(`no aria rule for ${attribute}`);
  for (const value of rule.values) {
    test(`Playground ${arg}=${value}`, () => {
      const buttons = playgroundButtons({ [arg]: value === "true" });
      const expected = value === "true" ? "true" : null;
      expect(buttons.html.getAttribute(attribute)).toBe(expected);
      expect(buttons.html.hasAttribute("disabled")).toBe(false);
      expect(buttons.react.getAttribute(attribute)).toBe(expected);
      expect(buttons.react.hasAttribute("disabled")).toBe(false);
    });
  }
}
