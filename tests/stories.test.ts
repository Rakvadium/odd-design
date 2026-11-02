import { globSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "bun:test";
import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { USAGE } from "../src/js/usage/contract.ts";
import { checkRoot } from "../src/js/usage/dom.ts";
import { catalog, renderHtml, STORYBOOKS, type Entry, type MirroredEntry } from "../stories/catalog.ts";
import { toReact } from "../stories/mirror-react.ts";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

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

function rendered(entry: Entry, args: Record<string, unknown> = {}): ParentNode {
  return asRoot(renderHtml(entry, args), entry.label);
}

test("the catalog has every story file's stories, and the mirrored story ids equal the pinned list", () => {
  const storyFiles = globSync(STORYBOOKS.html.stories, { cwd: repo }).map((file) => file.replaceAll("\\", "/"));
  const covered = new Set(html.map((entry) => entry.file));
  const skipped = storyFiles.filter((file) => !covered.has(file));
  expect(skipped).toEqual([]);
  expect(react.map((entry) => entry.id).sort()).toEqual([
    "components-breadcrumb--parts",
    "components-breadcrumb--playground",
    "components-breadcrumb--wrapping",
    "components-button--link",
    "components-button--playground",
    "components-button--sizes",
    "components-button--states",
    "components-button--variants",
    "components-code--long-lines",
    "components-code--parts",
    "components-code--playground",
    "components-combobox--async",
    "components-combobox--open",
    "components-combobox--parts",
    "components-combobox--playground",
    "components-combobox--states",
    "components-data-display--avatar",
    "components-data-display--separator",
    "components-data-display--table",
    "components-data-display--table-overflow",
    "components-data-display--table-parts",
    "components-data-display--table-states",
    "components-feedback--alert",
    "components-feedback--progress",
    "components-feedback--skeleton",
    "components-forms--choices",
    "components-forms--search",
    "components-forms--segmented",
    "components-forms--select",
    "components-forms--slider",
    "components-forms--switch",
    "components-forms--text-fields",
    "components-interactive--menu",
    "components-interactive--menu-open",
    "components-interactive--tabs",
    "components-interactive--tabs-vertical",
    "components-interactive--toast",
    "components-interactive--toast-parts",
    "components-interactive--toast-states",
    "components-interactive--toast-variants",
    "components-kbd--parts",
    "components-kbd--playground",
    "components-kbd--shortcut-list",
    "components-link--in-text",
    "components-link--playground",
    "components-link--states",
    "components-overlays--alert-dialog",
    "components-overlays--popover",
    "components-overlays--sheet",
    "components-overlays--sheet-bottom",
    "components-overlays--sheet-end",
    "components-overlays--sheet-right-to-left",
    "components-overlays--sheet-start",
    "components-overlays--sheet-top",
    "components-spinner--parts",
    "components-spinner--playground",
    "components-spinner--states",
    "components-surfaces--badge",
    "components-surfaces--card",
    "components-surfaces--dialog",
    "components-surfaces--disclosure",
  ]);
  expect(react.every((entry) => html.some((item) => item.id === entry.id))).toBe(true);
});

function fail(message: string): never {
  throw new Error(message);
}

function mirrored(id: string): MirroredEntry {
  return react.find((item) => item.id === id) ?? fail(`${id} is not mirrored`);
}

function checkedRoot(id: string, args: Record<string, unknown> = {}): ParentNode {
  const root = rendered(mirrored(id), args);
  checkRoot(root);
  return root;
}

test("TableParts puts aria-sort on each sorted column's header", () => {
  const root = checkedRoot("components-data-display--table-parts");
  const sorted = [...root.querySelectorAll("th[aria-sort]")].map((th) => [th.closest("table")?.querySelector("caption")?.textContent, th.textContent?.trim(), th.getAttribute("aria-sort")]);
  expect(sorted).toEqual([
    ["Sorted by deck, A to Z", "Deck", "ascending"],
    ["Sorted by cards, most first", "Cards", "descending"],
    ["Not sorted", "Deck", "none"],
  ]);
});

test("LinkStates marks one link as the current page", () => {
  const links = [...checkedRoot("components-link--states").querySelectorAll("a.odd-link")].map((link) => [link.textContent, link.getAttribute("aria-current")]);
  expect(links).toEqual([
    ["Settings", null],
    ["Roadmap", "page"],
  ]);
});

test("SpinnerStates puts the spinner beside a busy Button's ring", () => {
  const root = checkedRoot("components-spinner--states");
  expect(root.querySelector('[aria-busy="true"] > .odd-spinner[aria-hidden="true"]')).not.toBeNull();
  expect(root.querySelector('.odd-button[aria-busy="true"]')?.textContent).toBe("Saving…");
});

test("ComboboxStates renders a disabled input, an invalid input, a disabled option, and options filtered to the value", () => {
  const root = checkedRoot("components-combobox--states");
  expect(root.querySelector("input.odd-input:disabled")?.id).toBe("states-disabled");
  expect(root.querySelector('input.odd-input[aria-invalid="true"]')?.id).toBe("states-invalid");
  expect(root.querySelector('.odd-combobox-option[aria-disabled="true"]')?.textContent).toBe("Atlantis");
  expect([...root.querySelectorAll("#states-filled-list > .odd-combobox-option:not([hidden])")].map((option) => option.textContent)).toEqual(["Berlin"]);
});

test("ComboboxAsync starts with an empty list that its code filters", () => {
  expect(checkedRoot("components-combobox--async").querySelector('.odd-combobox-list[data-filter="manual"]')?.childElementCount).toBe(0);
});

test("BreadcrumbParts marks each trail's last crumb, and only that crumb, as the current page", () => {
  const trails = [...checkedRoot("components-breadcrumb--parts").querySelectorAll("nav.odd-breadcrumb > ol")].map((list) => {
    const current = [...list.querySelectorAll('[aria-current="page"]')];
    return current.length === 1 && current[0] === list.querySelector(":scope > li:last-child > a.odd-link");
  });
  expect(trails).toEqual([true, true, true]);
});

test("TabsVertical's tablist is vertical", () => {
  expect(checkedRoot("components-interactive--tabs-vertical").querySelector('[role="tablist"]')?.getAttribute("aria-orientation")).toBe("vertical");
});

for (const entry of html) {
  test(entry.label, () => {
    checkRoot(rendered(entry));
  });
}

/** Hydrates the server markup and returns every recoverable error and React warning it raised. */
async function hydrationErrors(entry: MirroredEntry): Promise<string[]> {
  const element = toReact(entry.mirror.scene({ ...entry.meta.args, ...entry.story.args }));
  const container = document.createElement("div");
  container.innerHTML = renderToString(element);
  document.body.append(container);
  const errors: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => errors.push(args.map(String).join(" "));
  let root: Root | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, element, { onRecoverableError: (error) => errors.push(String(error)) });
    });
    await act(async () => root?.unmount());
  } finally {
    console.error = original;
    container.remove();
  }
  return errors;
}

for (const entry of react) {
  test(`${entry.label} hydrates`, async () => {
    expect(await hydrationErrors(entry)).toEqual([]);
  });
}

const playground = mirrored("components-button--playground");

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

function playgroundButton(args: Record<string, unknown>): HTMLButtonElement {
  const button = checkedRoot(playground.id, args).querySelector("button");
  if (!(button instanceof HTMLButtonElement)) throw new Error("Playground rendered no button");
  return button;
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
      const button = playgroundButton({ [control.arg]: value });
      expect(button.getAttribute(control.attribute)).toBe(value === control.absent[0] ? null : value);
      expect(button.hasAttribute("disabled")).toBe(false);
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
      const button = playgroundButton({ [arg]: value === "true" });
      expect(button.getAttribute(attribute)).toBe(value === "true" ? "true" : null);
      expect(button.hasAttribute("disabled")).toBe(false);
    });
  }
}

const linkPlayground = mirrored("components-link--playground");
const currentRule = USAGE.link.find((item) => item.kind === "enum" && item.attribute === "aria-current");
if (currentRule?.kind !== "enum") throw new Error("no enum rule for aria-current");
const currentOptions = linkPlayground.meta.argTypes?.current?.options ?? fail("Link Playground argTypes.current has no options");

test("Link Playground argTypes match the link contract", () => {
  expect([...currentOptions].sort()).toEqual(["none", ...currentRule.values].sort());
});

for (const value of currentOptions) {
  test(`Link Playground current=${value}`, () => {
    const root = checkedRoot(linkPlayground.id, { current: value });
    expect(root.querySelector("a.odd-link")?.getAttribute("aria-current")).toBe(value === "none" ? null : value);
  });
}

const comboboxPlayground = mirrored("components-combobox--playground");
const filterRule = USAGE.comboboxList.find((item) => item.kind === "enum" && item.attribute === "data-filter");
if (filterRule?.kind !== "enum") throw new Error("no enum rule for data-filter");
const filterOptions = comboboxPlayground.meta.argTypes?.filter?.options ?? fail("Combobox Playground argTypes.filter has no options");
const filterAbsent = filterRule.omit.filter((token) => filterOptions.includes(token));

test("Combobox Playground argTypes match the combobox contract", () => {
  expect(filterAbsent).toHaveLength(1);
  expect([...filterOptions].sort()).toEqual([...filterRule.values, filterAbsent[0]].sort());
});

for (const value of filterOptions) {
  test(`Combobox Playground filter=${value}`, () => {
    const root = checkedRoot(comboboxPlayground.id, { filter: value });
    expect(root.querySelector(".odd-combobox-list")?.getAttribute("data-filter")).toBe(value === filterAbsent[0] ? null : value);
  });
}

for (const disabled of [true, false]) {
  test(`Combobox Playground disabled=${disabled}`, () => {
    const input = checkedRoot(comboboxPlayground.id, { disabled }).querySelector("input.odd-input");
    expect([input?.hasAttribute("disabled"), input?.hasAttribute("aria-disabled")]).toEqual([disabled, false]);
  });
}

for (const levels of [1, 2, 3, 4, 5]) {
  test(`Breadcrumb Playground levels=${levels}`, () => {
    const root = checkedRoot("components-breadcrumb--playground", { levels });
    expect(root.querySelectorAll("nav.odd-breadcrumb > ol > li")).toHaveLength(levels);
    expect(root.querySelector('[aria-current="page"]')).toBe(root.querySelector("li:last-child > a.odd-link"));
  });
}

test("Kbd Playground draws one key per word of keys", () => {
  const root = checkedRoot("components-kbd--playground", { keys: "Ctrl Shift P" });
  expect([...root.querySelectorAll("kbd.odd-kbd")].map((key) => key.textContent)).toEqual(["Ctrl", "Shift", "P"]);
});

for (const [kind, selector] of [
  ["inline", "p > code.odd-code"],
  ["block", "pre.odd-pre > code:not([class])"],
] as const) {
  test(`Code Playground kind=${kind}`, () => {
    const root = checkedRoot("components-code--playground", { kind, text: "bun add odd-design" });
    expect(root.querySelector(selector)?.textContent).toBe("bun add odd-design");
  });
}
