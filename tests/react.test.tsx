import { afterEach, describe, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";
import { act, StrictMode, useRef, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { closedByFallback, enhance, enhanceTabs, interestForFallback, toast } from "../src/js/enhance.ts";
import { Button } from "../src/react/button.tsx";
import { Card } from "../src/react/card.tsx";
import { Combobox, ComboboxList, ComboboxOption } from "../src/react/combobox.tsx";
import { Input, Select } from "../src/react/field.tsx";
import { Menu, MenuItem } from "../src/react/menu.tsx";
import { useEnhancer } from "../src/react/own.ts";
import { Table, TableSort } from "../src/react/table.tsx";
import { Tabs } from "../src/react/tabs.tsx";
import { Toaster } from "../src/react/toast.tsx";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const repo = fileURLToPath(new URL("..", import.meta.url));

let mounted: Root | undefined;

afterEach(async () => {
  const root = mounted;
  mounted = undefined;
  if (root !== undefined) await act(async () => root.unmount());
  document.body.replaceChildren();
});

async function mountForm(ariaDisabled: "true" | "false" | undefined) {
  const counts = { clicks: 0, submits: 0 };
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  mounted = root;
  await act(async () =>
    root.render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          counts.submits += 1;
        }}
      >
        <input name="card" />
        <Button type="submit" aria-disabled={ariaDisabled} onClick={() => (counts.clicks += 1)}>
          Pay
        </Button>
      </form>,
    ),
  );
  const button = host.querySelector("button");
  const field = host.querySelector("input");
  if (button === null || field === null) throw new Error("the form did not render");
  return { counts, button, field };
}

function pressEnter(field: HTMLInputElement): void {
  if (!field.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }))) return;
  // happy-dom has no implicit submission. The HTML spec fires a click at the form's default button.
  field.form?.querySelector('[type="submit"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
}

describe("Button with aria-disabled", () => {
  test("ignores a click and an Enter, and never sets disabled", async () => {
    const { counts, button, field } = await mountForm("true");
    await act(async () => button.click());
    await act(async () => pressEnter(field));
    expect(counts).toEqual({ clicks: 0, submits: 0 });
    expect(button.disabled).toBe(false);
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  test.each([[undefined], ["false" as const]])("with aria-disabled %p submits once per click and once per Enter", async (ariaDisabled) => {
    const { counts, button, field } = await mountForm(ariaDisabled);
    await act(async () => button.click());
    expect(counts).toEqual({ clicks: 1, submits: 1 });
    await act(async () => pressEnter(field));
    expect(counts).toEqual({ clicks: 2, submits: 2 });
  });
});

function arrowRight(host: HTMLElement) {
  document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
  const selected = [...host.querySelectorAll('[aria-selected="true"]')].map((tab) => tab.id);
  const shown = [...host.querySelectorAll<HTMLElement>('[role="tabpanel"]')].filter((panel) => !panel.hidden).map((panel) => panel.id);
  return { focused: document.activeElement?.id, selected, shown };
}

describe("Tabs", () => {
  test("moves one tab per arrow key under StrictMode, beside an app's enhance(), and after its cleanup", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    mounted = root;
    await act(async () =>
      root.render(
        <StrictMode>
          <Tabs>
            <div role="tablist" aria-label="Deck view">
              <button role="tab" id="tab-cards" aria-controls="panel-cards" aria-selected="true">
                Cards
              </button>
              <button role="tab" id="tab-stats" aria-controls="panel-stats" aria-selected="false">
                Stats
              </button>
              <button role="tab" id="tab-notes" aria-controls="panel-notes" aria-selected="false">
                Notes
              </button>
            </div>
            <div role="tabpanel" id="panel-cards" aria-labelledby="tab-cards">
              Cards
            </div>
            <div role="tabpanel" id="panel-stats" aria-labelledby="tab-stats" hidden>
              Stats
            </div>
            <div role="tabpanel" id="panel-notes" aria-labelledby="tab-notes" hidden>
              Notes
            </div>
          </Tabs>
        </StrictMode>,
      ),
    );
    const unwire = enhance(document);
    document.getElementById("tab-cards")?.focus();
    expect(arrowRight(host)).toEqual({ focused: "tab-stats", selected: ["tab-stats"], shown: ["panel-stats"] });
    unwire();
    expect(arrowRight(host)).toEqual({ focused: "tab-notes", selected: ["tab-notes"], shown: ["panel-notes"] });
  });

  test("enhanceTabs wires a root that gains its tablist after an earlier call", () => {
    const root = document.createElement("div");
    root.className = "odd-tabs";
    document.body.append(root);
    enhanceTabs(root);
    root.innerHTML =
      '<div role="tablist" aria-label="Deck view"><button role="tab" id="tab-cards" aria-controls="panel-cards" aria-selected="true">Cards</button><button role="tab" id="tab-stats" aria-controls="panel-stats" aria-selected="false">Stats</button></div><div role="tabpanel" id="panel-cards">Cards</div><div role="tabpanel" id="panel-stats" hidden>Stats</div>';
    enhanceTabs(root);
    document.getElementById("tab-cards")?.focus();
    expect(arrowRight(root)).toEqual({ focused: "tab-stats", selected: ["tab-stats"], shown: ["panel-stats"] });
  });

  test("enhanceTabs wires a replaced tablist while an earlier call still holds the root", () => {
    const root = document.createElement("div");
    root.className = "odd-tabs";
    document.body.append(root);
    root.innerHTML =
      '<div role="tablist" aria-label="Deck view"><button role="tab" id="tab-cards" aria-controls="panel-cards" aria-selected="true">Cards</button><button role="tab" id="tab-stats" aria-controls="panel-stats" aria-selected="false">Stats</button></div><div role="tabpanel" id="panel-cards">Cards</div><div role="tabpanel" id="panel-stats" hidden>Stats</div>';
    enhanceTabs(root);
    root.innerHTML =
      '<div role="tablist" aria-label="Deck view"><button role="tab" id="tab-deck" aria-controls="panel-deck" aria-selected="true">Deck</button><button role="tab" id="tab-notes" aria-controls="panel-notes" aria-selected="false">Notes</button></div><div role="tabpanel" id="panel-deck">Deck</div><div role="tabpanel" id="panel-notes" hidden>Notes</div>';
    enhanceTabs(root);
    document.getElementById("tab-deck")?.focus();
    expect(arrowRight(root)).toEqual({ focused: "tab-notes", selected: ["tab-notes"], shown: ["panel-notes"] });
  });
});

function arrowDown() {
  document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
  return document.activeElement?.textContent;
}

describe("Menu", () => {
  test("moves one item per arrow key and toggles once per click under StrictMode, beside an app's enhance(), and after its cleanup", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    mounted = root;
    await act(async () =>
      root.render(
        <StrictMode>
          <Menu id="deck-actions" popover="auto" role="menu" aria-label="Deck actions">
            <MenuItem role="menuitem">Rename</MenuItem>
            <MenuItem role="menuitem">Share</MenuItem>
            <MenuItem role="menuitemcheckbox" aria-checked="false">
              Show prices
            </MenuItem>
          </Menu>
        </StrictMode>,
      ),
    );
    const unwire = enhance(document);
    const [rename, , prices] = host.querySelectorAll<HTMLElement>(".odd-menu-item");
    rename!.focus();
    expect([arrowDown(), arrowDown()]).toEqual(["Share", "Show prices"]);
    prices!.click();
    expect(prices!.getAttribute("aria-checked")).toBe("true");
    unwire();
    expect(arrowDown()).toBe("Rename");
    prices!.click();
    expect(prices!.getAttribute("aria-checked")).toBe("false");
  });
});

describe("Combobox", () => {
  function CityField({ onChange }: { onChange: (value: string) => void }) {
    const [value, setValue] = useState("");
    const [renders, setRenders] = useState(0);
    return (
      <>
        <Combobox>
          <Input
            id="city"
            role="combobox"
            aria-controls="city-list"
            aria-expanded="false"
            aria-autocomplete="list"
            aria-label="City"
            value={value}
            onChange={(event) => {
              onChange(event.target.value);
              setValue(event.target.value);
            }}
          />
          <ComboboxList id="city-list" popover="manual" role="listbox" aria-label="Cities">
            <ComboboxOption role="option">Amsterdam</ComboboxOption>
            <ComboboxOption role="option" aria-disabled="true">
              Atlantis
            </ComboboxOption>
            <ComboboxOption role="option">Berlin</ComboboxOption>
          </ComboboxList>
        </Combobox>
        <button type="button" onClick={() => setRenders(renders + 1)}>
          Render {renders}
        </button>
      </>
    );
  }

  const key = (input: HTMLInputElement, name: string) => input.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true }));
  const active = (input: HTMLInputElement) => document.getElementById(input.getAttribute("aria-activedescendant") ?? "")?.textContent ?? null;

  test("steps once per arrow under StrictMode beside an app's enhance(), and after the app's cleanup keeps open through a render, calls a controlled onChange once, and still steps", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    mounted = root;
    const changes: string[] = [];
    await act(async () =>
      root.render(
        <StrictMode>
          <CityField onChange={(value) => changes.push(value)} />
        </StrictMode>,
      ),
    );
    const unwire = enhance(document);
    const input = host.querySelector("input")!;
    key(input, "ArrowDown");
    key(input, "ArrowDown");
    expect(active(input)).toBe("Berlin");
    unwire();
    await act(async () => host.querySelector("button")!.click());
    expect([input.getAttribute("aria-expanded"), active(input)]).toEqual(["true", "Berlin"]);
    await act(async () => key(input, "Enter"));
    expect([input.value, changes, input.getAttribute("aria-expanded")]).toEqual(["Berlin", ["Berlin"], "false"]);
    key(input, "ArrowDown");
    expect(active(input)).toBe("Berlin");
  });

  test("unmounting closes an open list and unwires the root", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    await act(async () => root.render(<CityField onChange={() => {}} />));
    const combobox = host.querySelector<HTMLElement>(".odd-combobox")!;
    const input = combobox.querySelector("input")!;
    key(input, "ArrowDown");
    expect([input.getAttribute("aria-expanded"), active(input)]).toEqual(["true", "Amsterdam"]);
    await act(async () => root.unmount());
    expect([input.getAttribute("aria-expanded"), input.hasAttribute("aria-activedescendant")]).toEqual(["false", false]);
    document.body.append(combobox);
    key(input, "ArrowDown");
    expect([input.getAttribute("aria-expanded"), input.hasAttribute("aria-activedescendant")]).toEqual(["false", false]);
  });

  test("a render that changes the input's aria-expanded prop keeps an open list's state on the input", async () => {
    function Collapsing() {
      const [expanded, setExpanded] = useState<"true" | "false">("true");
      return (
        <>
          <Combobox>
            <Input id="city" role="combobox" aria-controls="city-list" aria-expanded={expanded} aria-autocomplete="list" aria-label="City" />
            <ComboboxList id="city-list" popover="manual" role="listbox" aria-label="Cities">
              <ComboboxOption role="option">Amsterdam</ComboboxOption>
            </ComboboxList>
          </Combobox>
          <button type="button" onClick={() => setExpanded("false")}>
            Collapse
          </button>
        </>
      );
    }
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    mounted = root;
    await act(async () => root.render(<Collapsing />));
    const input = host.querySelector("input")!;
    expect(input.getAttribute("aria-expanded")).toBe("false");
    key(input, "ArrowDown");
    await act(async () => host.querySelector("button")!.click());
    expect([input.getAttribute("aria-expanded"), active(input)]).toEqual(["true", "Amsterdam"]);
  });
});

describe("Table", () => {
  test("select-all reaches React onChange once per changed row under StrictMode beside an app's enhance(), leaves a row that cancels its click, resyncs after React changes the rows, and finds a header box rendered after mount", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    mounted = root;
    const changed: string[] = [];
    function SelectAll() {
      const [generation, setGeneration] = useState(0);
      return (
        <th>
          <input key={generation} type="checkbox" data-select-all aria-label="Select all decks" />
          <button type="button" onClick={() => setGeneration(1)}>
            Replace
          </button>
        </th>
      );
    }
    function Decks() {
      const [selected, setSelected] = useState<readonly string[]>(["b"]);
      const toggle = (id: string) => {
        changed.push(id);
        setSelected((ids) => (ids.includes(id) ? ids.filter((each) => each !== id) : [...ids, id]));
      };
      return (
        <>
          <button type="button" onClick={() => setSelected([])}>
            Clear
          </button>
          <Table>
            <thead>
              <tr>
                <SelectAll />
              </tr>
            </thead>
            <tbody>
              {["a", "b", "c"].map((id) => (
                <tr key={id}>
                  <td>
                    <input type="checkbox" aria-label={id} checked={selected.includes(id)} onChange={() => toggle(id)} />
                  </td>
                </tr>
              ))}
              <tr onClick={(event) => event.preventDefault()}>
                <td>
                  <input type="checkbox" aria-label="locked" />
                </td>
              </tr>
            </tbody>
          </Table>
        </>
      );
    }
    await act(async () =>
      root.render(
        <StrictMode>
          <Decks />
        </StrictMode>,
      ),
    );
    const unwire = enhance(document);
    const all = () => host.querySelector<HTMLInputElement>("[data-select-all]")!;
    const press = (label: string) => act(async () => [...host.querySelectorAll("button")].find((button) => button.textContent === label)!.click());
    const state = () => [[...host.querySelectorAll<HTMLInputElement>("tbody input")].map((row) => row.checked), all().indeterminate ? "mixed" : all().checked ? "checked" : "unchecked"];
    expect(state()).toEqual([[false, true, false, false], "mixed"]);
    await act(async () => all().click());
    expect([changed, ...state()]).toEqual([["a", "c"], [true, true, true, false], "mixed"]);
    await press("Clear");
    expect(state()).toEqual([[false, false, false, false], "unchecked"]);
    await press("Replace");
    await act(async () => all().click());
    expect([changed, ...state()]).toEqual([["a", "c", "a", "b", "c"], [true, true, true, false], "mixed"]);
    unwire();
  });
});

describe("Toaster", () => {
  test("wires itself once under StrictMode, beside an app's enhance(), and until it unmounts", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    mounted = root;
    await act(async () =>
      root.render(
        <StrictMode>
          <Toaster popover="manual" aria-label="Notifications" />
        </StrictMode>,
      ),
    );
    const unwire = enhance(document);
    const region = host.querySelector("section")!;
    toast({ title: "Deck saved", description: "Midnight Control, version 15.", tone: "success" });
    expect({
      lists: region.querySelectorAll("ol").length,
      live: [...region.querySelectorAll("[aria-live]")].map((node) => node.textContent),
      toasts: region.querySelectorAll(".odd-toast").length,
    }).toEqual({ lists: 1, live: ["Deck saved. Midnight Control, version 15."], toasts: 1 });
    unwire();
    toast({ title: "Card restored", tone: "info" });
    expect(region.querySelectorAll(".odd-toast")).toHaveLength(2);
    await act(async () => root.unmount());
    mounted = undefined;
    expect(() => toast({ title: "Deck saved" })).toThrow("toast() found no toaster");
  });
});

async function mountInForm() {
  const counts = { submits: 0 };
  const host = document.createElement("form");
  host.addEventListener("submit", (event) => {
    event.preventDefault();
    counts.submits += 1;
  });
  document.body.append(host);
  const root = createRoot(host);
  mounted = root;
  return { counts, host, render: (children: ReactNode) => act(async () => root.render(children)) };
}

describe("Buttons in a form", () => {
  test.each([
    ["MenuItem", <MenuItem role="menuitem">Rename</MenuItem>, <MenuItem role="menuitem" type="submit">Archive</MenuItem>],
    ["TableSort", <TableSort>Deck</TableSort>, <TableSort type="submit">Deck</TableSort>],
  ])('%s submits its form only when written type="submit"', async (_name, plain, submit) => {
    const { counts, host, render } = await mountInForm();
    await render(
      <>
        {plain}
        {submit}
      </>,
    );
    const [first, second] = host.querySelectorAll("button");
    await act(async () => first!.click());
    expect(counts.submits).toBe(0);
    await act(async () => second!.click());
    expect(counts.submits).toBe(1);
  });

  test('Tabs types every untyped tab, including one mounted later, and keeps a written type="submit"', async () => {
    const { counts, host, render } = await mountInForm();
    const tabs = (later: ReactNode) => (
      <Tabs>
        <div role="tablist" aria-label="Deck view">
          <button role="tab" id="tab-cards" aria-controls="panel-cards" aria-selected="true">
            Cards
          </button>
          <button role="tab" id="tab-stats" aria-controls="panel-stats" aria-selected="false" type="submit">
            Stats
          </button>
          {later}
        </div>
      </Tabs>
    );
    await render(tabs(null));
    await render(
      tabs(
        <button role="tab" id="tab-notes" aria-controls="panel-notes" aria-selected="false">
          Notes
        </button>,
      ),
    );
    expect([...host.querySelectorAll('[role="tab"]')].map((tab) => tab.getAttribute("type"))).toEqual(["button", "submit", "button"]);
    await act(async () => document.getElementById("tab-notes")!.click());
    expect(counts.submits).toBe(0);
    await act(async () => document.getElementById("tab-stats")!.click());
    expect(counts.submits).toBe(1);
  });

  test('enhance() keeps menu items and toast buttons from submitting, and keeps a written type="submit"', () => {
    const form = document.createElement("form");
    let submits = 0;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submits += 1;
    });
    form.innerHTML =
      '<div class="odd-menu" id="row-actions" popover role="menu" aria-label="Row actions"><button class="odd-menu-item" role="menuitem">Rename</button><button class="odd-menu-item" role="menuitem" type="submit">Archive</button></div><section class="odd-toaster" popover="manual" aria-label="Notifications"></section>';
    document.body.append(form);
    const unwire = enhance(document);
    toast({ title: "Deck archived", action: { label: "Undo", onClick() {} } });
    toast({ title: "Link copied" });
    const button = (name: string) => [...form.querySelectorAll("button")].find((each) => each.textContent === name || each.getAttribute("aria-label") === name)!;
    for (const name of ["Rename", "Undo", "Dismiss: Link copied"]) button(name).click();
    expect(submits).toBe(0);
    button("Archive").click();
    expect(submits).toBe(1);
    unwire();
  });
});

function tsc(project: string): { exit: number; output: string } {
  const result = Bun.spawnSync([process.execPath, "x", "tsc", "-p", project], { cwd: repo });
  return { exit: result.exitCode, output: `${result.stdout.toString()}${result.stderr.toString()}` };
}

function errorsByFixture(output: string): Map<string, string> {
  const blocks = new Map<string, string>();
  let current: string | undefined;
  for (const line of output.split(/\r?\n/)) {
    const header = /^tests\/fixtures\/types\/fail\/([\w-]+)\.tsx\(/.exec(line);
    if (header?.[1] !== undefined) current = header[1];
    if (current !== undefined && line !== "") blocks.set(current, `${blocks.get(current) ?? ""}${line}\n`);
  }
  return blocks;
}

const failures: Record<string, { codes: string[]; text: string[] }> = {
  "button-disabled": { codes: ["ODD-BUTTON-007"], text: [] },
  "button-variant": { codes: [], text: ['"primary"', '"secondary"', '"danger"', '"ghost"'] },
  "button-size": { codes: [], text: ['"sm"', '"lg"'] },
  "button-link-aria-disabled": { codes: ["ODD-BUTTON-013"], text: [] },
  "button-icon-only": { codes: ["ODD-BUTTON-008"], text: [] },
  "button-data-tone": { codes: ["ODD-BUTTON-015"], text: [] },
  "button-aria-current-value": { codes: [], text: ['"page"'] },
  "button-aria-current-button": { codes: ["ODD-BUTTON-012"], text: [] },
  "button-aria-current-icon-only": { codes: ["ODD-BUTTON-012"], text: [] },
  "button-raw-data-variant": { codes: [], text: ['"data-variant"'] },
  "field-error-hidden": { codes: ["ODD-FIELD-002"], text: [] },
  "input-aria-disabled": { codes: ["ODD-FIELD-003"], text: [] },
  "choice-aria-disabled": { codes: ["ODD-CHOICE-003"], text: [] },
  "switch-aria-disabled": { codes: ["ODD-CHOICE-003"], text: [] },
  "switch-type": { codes: [], text: ['"checkbox"', '"switch"'] },
  "badge-tone": { codes: [], text: ['"neutral"', '"primary"', '"success"', '"warning"', '"danger"', '"info"'] },
  "badge-data-variant": { codes: ["ODD-BADGE-004"], text: [] },
  "alert-tone": { codes: [], text: ['"info"', '"success"', '"warning"', '"danger"'] },
  "alert-role": { codes: ["ODD-ALERT-003"], text: [] },
  "alert-aria-live": { codes: ["ODD-ALERT-003"], text: [] },
  "alert-data-variant": { codes: ["ODD-ALERT-004"], text: [] },
  "alert-title-data-tone": { codes: ["ODD-ALERT-005"], text: [] },
  "avatar-size": { codes: [], text: ['"sm"', '"lg"'] },
  "avatar-role": { codes: [], text: ['"img"'] },
  "avatar-name": { codes: ["ODD-AVATAR-004"], text: [] },
  "avatar-data-tone": { codes: ["ODD-AVATAR-005"], text: [] },
  "avatar-data-initials": { codes: [], text: ['"data-initials"'] },
  "avatar-group-name": { codes: ["ODD-AVATAR-004"], text: [] },
  "avatar-group-role": { codes: [], text: ["Property 'role' is missing"] },
  "avatar-group-data-size": { codes: ["ODD-AVATAR-006"], text: [] },
  "separator-orientation": { codes: [], text: ['"horizontal"', '"vertical"'] },
  "separator-role": { codes: [], text: ['"separator"'] },
  "separator-aria-hidden": { codes: ["ODD-SEPARATOR-003"], text: [] },
  "separator-data-orientation": { codes: ["ODD-SEPARATOR-002"], text: [] },
  "separator-data-tone": { codes: ["ODD-SEPARATOR-004"], text: [] },
  "separator-children": { codes: [], text: ["'children' is 'undefined'"] },
  "skeleton-shape": { codes: [], text: ['"avatar"'] },
  "skeleton-aria-hidden": { codes: [], text: ["'\"aria-hidden\"' is missing"] },
  "skeleton-text": { codes: ["ODD-SKELETON-004"], text: [] },
  "skeleton-aria-busy": { codes: ["ODD-SKELETON-004"], text: [] },
  "skeleton-data-size": { codes: ["ODD-SKELETON-005"], text: [] },
  "text-link-href": { codes: [], text: ["Property 'href' is missing"] },
  "text-link-aria-disabled": { codes: ["ODD-LINK-003"], text: [] },
  "text-link-disabled": { codes: ["ODD-LINK-003"], text: [] },
  "text-link-role": { codes: ["ODD-LINK-004"], text: [] },
  "text-link-aria-current-value": { codes: [], text: ['"page"'] },
  "text-link-data-variant": { codes: ["ODD-LINK-006"], text: [] },
  "spinner-aria-hidden": { codes: [], text: ["'\"aria-hidden\"' is missing"] },
  "spinner-text": { codes: ["ODD-SPINNER-002"], text: [] },
  "spinner-role": { codes: ["ODD-SPINNER-002"], text: [] },
  "spinner-aria-label": { codes: ["ODD-SPINNER-002"], text: [] },
  "spinner-data-size": { codes: ["ODD-SPINNER-003"], text: [] },
  "combobox-role": { codes: ["ODD-COMBOBOX-011"], text: [] },
  "combobox-data-filter": { codes: ["ODD-COMBOBOX-007"], text: [] },
  "combobox-data-tone": { codes: ["ODD-COMBOBOX-012"], text: [] },
  "combobox-list-popover": { codes: [], text: ["Property 'popover' is missing"] },
  "combobox-list-popover-auto": { codes: [], text: ["'\"auto\"' is not assignable to type '\"manual\"'"] },
  "combobox-list-role": { codes: [], text: ['"listbox"'] },
  "combobox-list-name": { codes: [], text: ["Property '\"aria-labelledby\"' is missing"] },
  "combobox-list-filter": { codes: [], text: ["'\"auto\"' is not assignable to type '\"manual\"'"] },
  "combobox-option-disabled": { codes: ["ODD-COMBOBOX-009"], text: [] },
  "combobox-option-selected": { codes: ["ODD-COMBOBOX-010"], text: [] },
  "breadcrumb-name": { codes: [], text: ["Property '\"aria-labelledby\"' is missing"] },
  "breadcrumb-data-tone": { codes: ["ODD-BREADCRUMB-004"], text: [] },
  "kbd-aria-hidden": { codes: ["ODD-KBD-002"], text: [] },
  "kbd-data-size": { codes: ["ODD-KBD-003"], text: [] },
  "code-data-tone": { codes: ["ODD-CODE-002"], text: [] },
  "pre-data-size": { codes: ["ODD-CODE-002"], text: [] },
  "card-on-click": { codes: ["ODD-CARD-004"], text: [] },
  "card-link-href": { codes: [], text: ["Property 'href' is missing"] },
  "card-data-tone": { codes: ["ODD-CARD-006"], text: [] },
  "disclosure-data-tone": { codes: ["ODD-DISCLOSURE-003"], text: [] },
  "tabs-aria-orientation": { codes: ["ODD-TABS-003"], text: [] },
  "tabs-data-tone": { codes: ["ODD-TABS-005"], text: [] },
  "tabs-default-value": { codes: [], text: ["not assignable to type 'undefined'"] },
  "search-on-submit": { codes: ["ODD-SEARCH-004"], text: [] },
  "search-data-tone": { codes: ["ODD-SEARCH-005"], text: [] },
  "slider-type": { codes: [], text: ['"range"'] },
  "slider-aria-disabled": { codes: ["ODD-SLIDER-003"], text: [] },
  "slider-data-tone": { codes: ["ODD-SLIDER-004"], text: [] },
  "meter-tone": { codes: [], text: ['"success"', '"warning"', '"danger"', '"info"'] },
  "progress-data-size": { codes: ["ODD-METER-003"], text: [] },
  "toaster-popover": { codes: [], text: ["Property 'popover' is missing"] },
  "toaster-popover-auto": { codes: [], text: ['"manual"'] },
  "toaster-aria-label": { codes: [], text: ["Property '\"aria-label\"' is missing"] },
  "toaster-data-tone": { codes: ["ODD-TOAST-004"], text: [] },
  "toaster-children": { codes: [], text: ["not assignable to type 'undefined'"] },
  "popover-popover": { codes: [], text: ["Property 'popover' is missing"] },
  "popover-popover-manual": { codes: [], text: ['"auto"'] },
  "popover-role": { codes: [], text: ['"dialog"'] },
  "popover-name-without-role": { codes: ["ODD-POPOVER-005"], text: [] },
  "popover-name": { codes: ["ODD-POPOVER-004"], text: [] },
  "popover-data-tone": { codes: ["ODD-POPOVER-006"], text: [] },
  "dialog-name": { codes: [], text: ["Property '\"aria-labelledby\"' is missing"] },
  "dialog-role": { codes: [], text: ['"alertdialog"'] },
  "dialog-open": { codes: ["ODD-DIALOG-004"], text: [] },
  "dialog-closedby": { codes: [], text: ['"any" | "closerequest" | undefined'] },
  "dialog-alert-closedby": { codes: [], text: ["'\"any\"' is not assignable to type '\"closerequest\"'"] },
  "dialog-data-tone": { codes: ["ODD-DIALOG-007"], text: [] },
  "dialog-actions-data-tone": { codes: ["ODD-DIALOG-008"], text: [] },
  "menu-popover": { codes: [], text: ["Property 'popover' is missing"] },
  "menu-role": { codes: [], text: ['"menu"'] },
  "menu-name": { codes: [], text: ["Property '\"aria-labelledby\"' is missing"] },
  "menu-data-tone": { codes: ["ODD-MENU-004"], text: [] },
  "menu-item-role": { codes: [], text: ["Property 'role' is missing"] },
  "menu-item-tone": { codes: [], text: ["'\"info\"' is not assignable to type '\"danger\"'"] },
  "menu-item-disabled": { codes: ["ODD-MENU-007"], text: [] },
  "table-wrap-tabindex": { codes: ["ODD-TABLE-002"], text: [] },
  "table-wrap-name": { codes: ["ODD-TABLE-003"], text: [] },
  "table-wrap-name-undefined": { codes: ["ODD-TABLE-003"], text: [] },
  "table-wrap-role": { codes: [], text: ['"region"'] },
  "table-data-numeric": { codes: ["ODD-TABLE-004"], text: [] },
  "table-sort-aria-sort": { codes: ["ODD-TABLE-005"], text: [] },
  "table-sort-data-numeric": { codes: ["ODD-TABLE-004"], text: [] },
  "sheet-name": { codes: [], text: ["Property '\"aria-labelledby\"' is missing"] },
  "sheet-side": { codes: [], text: ['"bottom" | "start" | "top" | undefined'] },
  "sheet-data-side": { codes: [], text: ["not assignable to type 'undefined'"] },
  "sheet-alert-closedby": { codes: [], text: ["'\"any\"' is not assignable to type '\"closerequest\"'"] },
  "sheet-data-tone": { codes: ["ODD-SHEET-003"], text: [] },
  "sheet-footer-data-variant": { codes: ["ODD-SHEET-003"], text: [] },
};

describe("platform fallbacks", () => {
  const INTEREST = ["focusin", "focusout", "keydown", "pointerout", "pointerover"];

  test("two interestForFallback calls and one enhance() on the document add one set of listeners, which the last cleanup removes", () => {
    const added: string[] = [];
    const removed: string[] = [];
    const add = document.addEventListener;
    const remove = document.removeEventListener;
    document.addEventListener = function (this: Document, ...args: Parameters<Document["addEventListener"]>) {
      added.push(args[0]);
      add.apply(this, args);
    };
    document.removeEventListener = function (this: Document, ...args: Parameters<Document["removeEventListener"]>) {
      removed.push(args[0]);
      remove.apply(this, args);
    };
    try {
      const first = interestForFallback();
      const second = interestForFallback(document);
      const dismiss = closedByFallback();
      const page = enhance(document);
      expect(added.filter((type) => INTEREST.includes(type)).sort()).toEqual(INTEREST);
      expect(added.filter((type) => type === "click")).toEqual(["click"]);
      first();
      page();
      dismiss();
      expect(removed.filter((type) => INTEREST.includes(type))).toEqual([]);
      expect(removed.filter((type) => type === "click")).toEqual(["click"]);
      second();
      expect(removed.filter((type) => INTEREST.includes(type)).sort()).toEqual(INTEREST);
    } finally {
      document.addEventListener = add;
      document.removeEventListener = remove;
    }
  });
});

describe("useEnhancer", () => {
  test("under StrictMode, a re-render shows the holder's value rather than React's, with one live subscription that unmount releases", async () => {
    const holders = new WeakMap<HTMLElement, { count: number; value: string }>();
    let live = 0;
    const enhanceValue = (node: HTMLElement): (() => void) => {
      const holder = holders.get(node) ?? { count: 0, value: node.dataset.value ?? "" };
      holders.set(node, holder);
      if (holder.count++ === 0) live++;
      node.dataset.value = holder.value;
      return () => {
        if (--holder.count > 0) return;
        live--;
        holders.delete(node);
      };
    };
    function Valued({ value }: { value: string }) {
      const ref = useRef<HTMLDivElement>(null);
      useEnhancer(ref, enhanceValue);
      return <div ref={ref} data-value={value} />;
    }
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    mounted = root;
    await act(async () =>
      root.render(
        <StrictMode>
          <Valued value="first" />
        </StrictMode>,
      ),
    );
    const node = host.querySelector("div")!;
    const holder = holders.get(node)!;
    holder.value = "picked";
    node.dataset.value = "picked";
    await act(async () =>
      root.render(
        <StrictMode>
          <Valued value="second" />
        </StrictMode>,
      ),
    );
    expect([node.dataset.value, live]).toEqual(["picked", 1]);
    mounted = undefined;
    await act(async () => root.unmount());
    expect(live).toBe(0);
  });
});

describe("React types", () => {
  test(
    "each fail fixture prints its own code and no other",
    () => {
      const { exit, output } = tsc("tests/fixtures/types/fail");
      expect(exit).not.toBe(0);
      const blocks = errorsByFixture(output);
      expect([...blocks.keys()].sort()).toEqual(Object.keys(failures).sort());
      for (const [fixture, { codes, text }] of Object.entries(failures)) {
        const block = blocks.get(fixture) ?? "";
        expect({ fixture, codes: [...new Set(block.match(/ODD-[A-Z]+-\d{3}/g))] }).toEqual({ fixture, codes });
        for (const part of text) expect({ fixture, found: block.includes(part) }).toEqual({ fixture, found: true });
      }
    },
    { timeout: 60_000 },
  );

  test(
    "the pass fixture compiles with no output",
    () => {
      expect(tsc("tests/fixtures/types/pass")).toEqual({ exit: 0, output: "" });
    },
    { timeout: 60_000 },
  );
});
