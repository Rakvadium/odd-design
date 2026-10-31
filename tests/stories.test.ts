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

test("the catalog has every story file's stories, and Button, Field, Choice, Badge, Alert, Avatar, Separator, Skeleton, Card, Disclosure, Tabs, Search, Slider, Meter, Progress, Popover, Dialog, Alert Dialog, and Sheet are mirrored", () => {
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
      "components-overlays--popover",
      "components-surfaces--dialog",
      "components-overlays--alert-dialog",
      "components-overlays--sheet",
      "components-interactive--menu",
      "components-data-display--table",
      "components-data-display--table-parts",
      "components-data-display--table-states",
      "components-data-display--table-overflow",
      "components-interactive--menu-open",
      "components-interactive--tabs-vertical",
      "components-overlays--sheet-end",
      "components-overlays--sheet-start",
      "components-overlays--sheet-top",
      "components-overlays--sheet-bottom",
      "components-overlays--sheet-right-to-left",
      "components-interactive--toast-variants",
      "components-interactive--toast-parts",
      "components-interactive--toast-states",
      "components-link--playground",
      "components-link--states",
      "components-link--in-text",
      "components-spinner--playground",
      "components-spinner--parts",
      "components-spinner--states",
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

function bothRoots(id: string): ParentNode[] {
  const entry = react.find((item) => item.id === id) ?? fail(`${id} is not mirrored`);
  const htmlEntry = html.find((item) => item.id === id) ?? fail(`${id} has no HTML story`);
  return [asRoot(renderHtml(htmlEntry), htmlEntry.label), reactRoot(entry)];
}

test("TableParts puts aria-sort on each sorted column's header", () => {
  for (const root of bothRoots("components-data-display--table-parts")) {
    const sorted = [...root.querySelectorAll("th[aria-sort]")].map((th) => [th.closest("table")?.querySelector("caption")?.textContent, th.textContent?.trim(), th.getAttribute("aria-sort")]);
    expect(sorted).toEqual([
      ["Sorted by deck, A to Z", "Deck", "ascending"],
      ["Sorted by cards, most first", "Cards", "descending"],
      ["Not sorted", "Deck", "none"],
    ]);
  }
});

test("LinkStates marks one link as the current page", () => {
  for (const root of bothRoots("components-link--states")) {
    const links = [...root.querySelectorAll("a.odd-link")].map((link) => [link.textContent, link.getAttribute("aria-current")]);
    expect(links).toEqual([
      ["Settings", null],
      ["Roadmap", "page"],
    ]);
  }
});

test("SpinnerStates puts the spinner beside a busy Button's ring", () => {
  for (const root of bothRoots("components-spinner--states")) {
    expect(root.querySelector('[aria-busy="true"] > .odd-spinner[aria-hidden="true"]')).not.toBeNull();
    expect(root.querySelector('.odd-button[aria-busy="true"]')?.textContent).toBe("Saving…");
  }
});

test("TabsVertical's tablist is vertical", () => {
  for (const root of bothRoots("components-interactive--tabs-vertical")) {
    expect(root.querySelector('[role="tablist"]')?.getAttribute("aria-orientation")).toBe("vertical");
  }
});

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

const linkPlayground = react.find((entry) => entry.id === "components-link--playground") ?? fail("Link stories have no Playground");
const currentRule = USAGE.link.find((item) => item.kind === "enum" && item.attribute === "aria-current");
if (currentRule?.kind !== "enum") throw new Error("no enum rule for aria-current");
const currentOptions = linkPlayground.meta.argTypes?.current?.options ?? fail("Link Playground argTypes.current has no options");

test("Link Playground argTypes match the link contract", () => {
  expect([...currentOptions].sort()).toEqual(["none", ...currentRule.values].sort());
});

for (const value of currentOptions) {
  test(`Link Playground current=${value}`, () => {
    const args = { current: value };
    expectSameDom(linkPlayground.mirror.scene({ ...linkPlayground.meta.args, ...linkPlayground.story.args, ...args }), `Link Playground ${value}`);
    const expected = value === "none" ? null : value;
    for (const root of [asRoot(renderHtml(linkPlayground, args), linkPlayground.label), reactRoot(linkPlayground, args)]) {
      checkRoot(root);
      expect(root.querySelector("a.odd-link")?.getAttribute("aria-current")).toBe(expected);
    }
  });
}
