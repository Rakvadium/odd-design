import { afterEach, describe, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";
import { act, StrictMode, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { appendLogLine, closedByFallback, enhance, enhanceTabs, interestForFallback, toast } from "../src/js/enhance.ts";
import { Avatar } from "../src/react/avatar.tsx";
import { Button } from "../src/react/button.tsx";
import { Breadcrumb } from "../src/react/breadcrumb.tsx";
import { Card } from "../src/react/card.tsx";
import type { AnchorProps } from "../src/react/context.ts";
import { HoverCard, HoverCardLink } from "../src/react/hover-card.tsx";
import { OddProvider } from "../src/react/provider.tsx";
import { TextLink } from "../src/react/text-link.tsx";
import { Combobox, ComboboxOption } from "../src/react/combobox.tsx";
import { Dialog } from "../src/react/dialog.tsx";
import { Log, LogLine } from "../src/react/log.tsx";
import { hydrationErrors } from "./hydrate.ts";
import { Menu, MenuCheckboxItem, MenuItem, MenuRadioGroup, MenuRadioItem } from "../src/react/menu.tsx";
import { rejectBlank } from "../src/react/own.ts";
import { Table, type Selection } from "../src/react/table.tsx";
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

describe("OddProvider", () => {
  function RouterLink(props: AnchorProps) {
    return <a {...props} data-router="" />;
  }

  const links = (
    <>
      <TextLink href="/guide">Guide</TextLink>
      <Button href="/docs">Docs</Button>
      <Card href="/decks/ember" title="Ember Aggro" />
      <Breadcrumb items={[{ label: "Home", href: "/" }]} />
      <HoverCard preview="Midnight Control, by Mira Okafor">
        <p>
          <HoverCardLink href="/decks/midnight">Midnight Control</HoverCardLink>
        </p>
      </HoverCard>
    </>
  );

  function routed(element: ReactNode): (string | null)[][] {
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(element);
    return [...root.querySelectorAll("a")].map((link) => [link.getAttribute("href"), link.getAttribute("data-router")]);
  }

  test("TextLink, Button href, the card's link, Breadcrumb's links, and HoverCardLink render through the router link", () => {
    expect(routed(<OddProvider link={RouterLink}>{links}</OddProvider>)).toEqual([
      ["/guide", ""],
      ["/docs", ""],
      ["/decks/ember", ""],
      ["/", ""],
      ["/decks/midnight", ""],
    ]);
  });

  test("without a provider every link is a plain a", () => {
    expect(routed(links).map(([, router]) => router)).toEqual([null, null, null, null, null]);
  });

});

function arrowRight(host: HTMLElement) {
  document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
  const selected = [...host.querySelectorAll('[aria-selected="true"]')].map((tab) => tab.id);
  const shown = [...host.querySelectorAll<HTMLElement>('[role="tabpanel"]')].filter((panel) => !panel.hidden).map((panel) => panel.id);
  return { focused: document.activeElement?.id, selected, shown };
}

const DECK_TABS = [
  { value: "cards", label: "Cards", content: "60 cards" },
  { value: "stats", label: "Stats", content: "Average cost 2.4" },
  { value: "notes", label: "Notes", content: "Mulligan for an early unit" },
] as const;

async function mountTabs(element: ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  mounted = root;
  const render = (next: ReactNode) => act(async () => root.render(next));
  await render(element);
  const tab = (name: string) => [...host.querySelectorAll<HTMLElement>('[role="tab"]')].find((each) => each.textContent === name)!;
  const state = () => ({
    selected: [...host.querySelectorAll('[aria-selected="true"]')].map((each) => each.textContent),
    shown: [...host.querySelectorAll<HTMLElement>('[role="tabpanel"]')].filter((panel) => !panel.hidden).map((panel) => panel.textContent),
  });
  return { host, render, tab, state };
}

describe("Tabs", () => {
  test("moves one tab per arrow key under StrictMode, beside an app's enhance(), and after its cleanup", async () => {
    const { host } = await mountTabs(
      <StrictMode>
        <Tabs id="deck" label="Deck view" tabs={DECK_TABS} />
      </StrictMode>,
    );
    const unwire = enhance(document);
    document.getElementById("deck-tab-0")?.focus();
    expect(arrowRight(host)).toEqual({ focused: "deck-tab-1", selected: ["deck-tab-1"], shown: ["deck-panel-1"] });
    unwire();
    expect(arrowRight(host)).toEqual({ focused: "deck-tab-2", selected: ["deck-tab-2"], shown: ["deck-panel-2"] });
  });

  test("a chosen tab stays chosen, with only its panel shown, when the parent renders again with another default", async () => {
    const { render, tab, state } = await mountTabs(<Tabs label="Deck view" tabs={DECK_TABS} defaultValue="cards" />);
    await act(async () => tab("Stats").click());
    await render(<Tabs label="Deck view" tabs={DECK_TABS} defaultValue="cards" />);
    expect(state()).toEqual({ selected: ["Stats"], shown: ["Average cost 2.4"] });
    await render(<Tabs label="Deck view" tabs={DECK_TABS} defaultValue="notes" />);
    expect(state()).toEqual({ selected: ["Stats"], shown: ["Average cost 2.4"] });
    expect(tab("Stats").tabIndex).toBe(0);
  });

  test("a new default moves the choice while the user has not chosen", async () => {
    const { render, state } = await mountTabs(<Tabs label="Deck view" tabs={DECK_TABS} defaultValue="cards" />);
    await render(<Tabs label="Deck view" tabs={DECK_TABS} defaultValue="notes" />);
    expect(state()).toEqual({ selected: ["Notes"], shown: ["Mulligan for an early unit"] });
  });

  test("onValueChange gets the chosen tab's value, and a tab set nested in a panel does not reach it", async () => {
    const values: string[] = [];
    const inner = (
      <Tabs
        label="Stats view"
        tabs={[
          { value: "curve", label: "Curve", content: "Peaks at 3" },
          { value: "colors", label: "Colors", content: "Mostly red" },
        ]}
      />
    );
    const { tab } = await mountTabs(<Tabs label="Deck view" tabs={[...DECK_TABS, { value: "more", label: "More", content: inner }]} onValueChange={(value) => values.push(value)} />);
    await act(async () => tab("Notes").click());
    await act(async () => tab("More").click());
    await act(async () => tab("Colors").click());
    expect(values).toEqual(["notes", "more"]);
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
          <Menu id="deck-actions" label="Deck actions" trigger={<Button>Deck actions</Button>}>
            <MenuItem>Rename</MenuItem>
            <MenuItem>Share</MenuItem>
            <MenuCheckboxItem>Show prices</MenuCheckboxItem>
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

  function ViewMenu({ prices, sort }: { prices: boolean; sort: "name" | "edited" | "count" }) {
    return (
      <Menu id="view" label="View" trigger={<Button>View</Button>}>
        <MenuCheckboxItem defaultChecked={prices}>Show prices</MenuCheckboxItem>
        <MenuRadioGroup label="Sort by">
          <MenuRadioItem defaultChecked={sort === "name"}>Name</MenuRadioItem>
          <MenuRadioItem defaultChecked={sort === "edited"}>Last edited</MenuRadioItem>
          <MenuRadioItem defaultChecked={sort === "count"}>Card count</MenuRadioItem>
        </MenuRadioGroup>
      </Menu>
    );
  }

  async function mountView(props: { prices: boolean; sort: "name" | "edited" | "count" }) {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    mounted = root;
    const render = (next: typeof props) => act(async () => root.render(<ViewMenu {...next} />));
    await render(props);
    const item = (name: string) => [...host.querySelectorAll<HTMLElement>(".odd-menu-item")].find((each) => each.textContent === name)!;
    const checked = () => [...host.querySelectorAll('.odd-menu-item[aria-checked="true"]')].map((each) => each.textContent);
    return { render, item, checked };
  }

  test("a checked item stays checked when the parent renders again, even with a new defaultChecked", async () => {
    const { render, item } = await mountView({ prices: true, sort: "name" });
    await act(async () => item("Show prices").click());
    await act(async () => item("Show prices").click());
    await render({ prices: true, sort: "name" });
    expect(item("Show prices").getAttribute("aria-checked")).toBe("true");
    await render({ prices: false, sort: "name" });
    expect(item("Show prices").getAttribute("aria-checked")).toBe("true");
  });

  test("a chosen radio stays the only checked one when the parent renders again with another default", async () => {
    const { render, item, checked } = await mountView({ prices: false, sort: "name" });
    await act(async () => item("Last edited").click());
    expect(checked()).toEqual(["Last edited"]);
    await render({ prices: false, sort: "count" });
    expect(checked()).toEqual(["Last edited"]);
  });

  test("ArrowDown on the trigger opens a menu whose id React generated, from that trigger", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    mounted = root;
    await act(async () =>
      root.render(
        <Menu label="Deck actions" trigger={<Button>Deck actions</Button>}>
          <MenuItem>Rename</MenuItem>
          <MenuItem>Share</MenuItem>
        </Menu>,
      ),
    );
    const trigger = host.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]')!;
    const menu = host.querySelector<HTMLElement>(".odd-menu")!;
    expect(trigger.getAttribute("commandfor")).toBe(menu.id);
    // happy-dom never matches :popover-open, so the test reads the call enhanceMenu makes.
    const sources: (string | undefined)[] = [];
    menu.showPopover = (options?: ShowPopoverOptions) => void sources.push(options?.source === trigger ? "trigger" : options?.source?.textContent ?? undefined);
    trigger.focus();
    await act(async () => {
      trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    });
    expect(sources).toEqual(["trigger"]);
  });
});

type Line = { readonly id: number; readonly text: string };

function SyncLog({ lines }: { lines: readonly Line[] }) {
  return (
    <Log label="Sync log">
      {lines.map((line) => (
        <LogLine key={line.id}>{line.text}</LogLine>
      ))}
    </Log>
  );
}

const lines = (count: number): Line[] => Array.from({ length: count }, (_, id) => ({ id, text: `Line ${id}` }));

describe("Log", () => {
  test("is wired once under StrictMode beside an app's enhance(), and unwired when it unmounts", async () => {
    const Observer = globalThis.MutationObserver;
    let live = 0;
    globalThis.MutationObserver = class extends Observer {
      #watching = false;
      override observe(target: Node, options?: MutationObserverInit) {
        if (target instanceof Element && target.matches(".odd-log") && !this.#watching) {
          this.#watching = true;
          live += 1;
        }
        super.observe(target, options);
      }
      override disconnect() {
        if (this.#watching) live -= 1;
        this.#watching = false;
        super.disconnect();
      }
    };
    try {
      const host = document.createElement("div");
      document.body.append(host);
      const root = createRoot(host);
      await act(async () =>
        root.render(
          <StrictMode>
            <SyncLog lines={lines(3)} />
          </StrictMode>,
        ),
      );
      const unwire = enhance(document);
      expect(live).toBe(1);
      unwire();
      expect(live).toBe(1);
      await act(async () => root.unmount());
      expect(live).toBe(0);
    } finally {
      globalThis.MutationObserver = Observer;
    }
  });

  test("keeps the newest line in view after the lines change, until the reader scrolls up", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    mounted = root;
    const render = (count: number) => act(async () => root.render(<SyncLog lines={lines(count)} />));
    await render(2);
    const log = host.querySelector<HTMLElement>(".odd-log")!;
    // happy-dom has no layout, so the log reports a fixed 100px window over 40px per line.
    let top = 0;
    Object.defineProperties(log, {
      clientHeight: { get: () => 100 },
      scrollHeight: { get: () => log.childElementCount * 40 },
      scrollTop: { get: () => top, set: (value: number) => (top = value) },
    });
    await render(6);
    expect(top).toBe(240);
    top = 0;
    log.dispatchEvent(new Event("scroll"));
    await render(8);
    expect(top).toBe(0);
  });

  test("appendLogLine refuses a React log and leaves its lines alone, and still adds to a plain one", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    mounted = root;
    await act(async () => root.render(<SyncLog lines={lines(2)} />));
    const log = host.querySelector<HTMLElement>(".odd-log")!;
    expect(() => appendLogLine(log, "Synced")).toThrow("appendLogLine cannot add to a React Log");
    expect(log.childElementCount).toBe(2);
    const plain = document.createElement("div");
    appendLogLine(plain, "Synced", { tone: "success" });
    expect(plain.innerHTML).toBe('<div class="odd-log-line" data-tone="success">Synced</div>');
  });

  test("hydrates when the server and the browser show a Date line's time differently, and only the time may differ", async () => {
    const shown = Date.prototype.toLocaleTimeString;
    let calls = 0;
    Date.prototype.toLocaleTimeString = () => (calls++ === 0 ? "01:14:01" : "09:14:01");
    try {
      const at = new Date("2026-11-02T09:14:01Z");
      expect(await hydrationErrors(<Log label="Sync log"><LogLine time={at}>Synced 60 cards</LogLine></Log>)).toEqual([]);
      let renders = 0;
      const Text = () => (renders++ === 0 ? "Synced on the server" : "Synced in the browser");
      const text = await hydrationErrors(<Log label="Sync log"><LogLine time={at}><Text /></LogLine></Log>);
      expect(text.some((error) => error.includes("Hydration failed") || error.includes("didn't match"))).toBe(true);
    } finally {
      Date.prototype.toLocaleTimeString = shown;
    }
  });
});

describe("Combobox", () => {
  function CityField({ onChange }: { onChange: (value: string) => void }) {
    const [value, setValue] = useState("");
    const [renders, setRenders] = useState(0);
    return (
      <>
        <Combobox
          id="city"
          label="City"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setValue(event.target.value);
          }}
        >
          <ComboboxOption>Amsterdam</ComboboxOption>
          <ComboboxOption disabled>Atlantis</ComboboxOption>
          <ComboboxOption>Berlin</ComboboxOption>
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

  test("no match shows the No results option React rendered, adds no node, and a render that adds an option keeps the list whole", async () => {
    function Cities() {
      const [cities, setCities] = useState(["Amsterdam", "Berlin"]);
      return (
        <>
          <Combobox id="city" label="City">
            {cities.map((city) => (
              <ComboboxOption key={city}>{city}</ComboboxOption>
            ))}
          </Combobox>
          <button type="button" onClick={() => setCities([...cities, "Zagreb"])}>
            More
          </button>
        </>
      );
    }
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    mounted = root;
    await act(async () => root.render(<Cities />));
    const input = host.querySelector("input")!;
    const list = host.querySelector<HTMLElement>('[role="listbox"]')!;
    const type = (value: string) => {
      input.value = value;
      input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
    };
    const shown = () => [...list.querySelectorAll<HTMLElement>('[role="option"]')].filter((option) => !option.hidden).map((option) => option.textContent);
    type("zz");
    expect([shown(), list.childElementCount, list.lastElementChild?.id]).toEqual([["No results"], 3, "city-list-empty"]);
    await act(async () => host.querySelector("button")!.click());
    expect([shown(), list.childElementCount, list.lastElementChild?.id]).toEqual([["No results"], 4, "city-list-empty"]);
    type("z");
    expect(shown()).toEqual(["Zagreb"]);
  });
});

type Deck = { readonly id: string; readonly name: string; readonly cards: number };

const DECKS: readonly Deck[] = [
  { id: "a", name: "Aurora", cards: 60 },
  { id: "b", name: "Bramble", cards: 55 },
  { id: "c", name: "Cinder", cards: 62 },
  { id: "d", name: "Dusk", cards: 40 },
];

function DeckTable({ rows, initial, onChange, disabled }: { rows: readonly Deck[]; initial: readonly string[]; onChange?: (selected: readonly string[]) => void; disabled?: (deck: Deck) => boolean }) {
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set(initial));
  const selection: Selection<Deck> = {
    selected,
    onChange: (next) => {
      onChange?.([...next].sort());
      setSelected(next);
    },
    label: (deck) => `Select ${deck.name}`,
    allLabel: "Select all decks",
    disabled,
  };
  return <Table caption="Decks" rows={rows} rowKey={(deck) => deck.id} columns={[{ key: "name", header: "Deck", rowHeader: true, cell: (deck) => deck.name }]} selection={selection} />;
}

async function mountTable(element: ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  mounted = root;
  const render = (next: ReactNode) => act(async () => root.render(next));
  await render(element);
  const all = () => host.querySelector<HTMLInputElement>("thead input[data-select-all]")!;
  const state = () => [[...host.querySelectorAll<HTMLInputElement>("tbody input")].map((row) => row.checked), all().indeterminate ? "mixed" : all().checked ? "checked" : "unchecked"];
  return { host, render, all, state };
}

describe("Table", () => {
  test("select-all reaches onChange once per changed row with every key so far under StrictMode beside an app's enhance(), skips a disabled row, and clears", async () => {
    const calls: (readonly string[])[] = [];
    const { all, state } = await mountTable(
      <StrictMode>
        <DeckTable rows={DECKS} initial={["b"]} onChange={(keys) => calls.push(keys)} disabled={(deck) => deck.id === "d"} />
      </StrictMode>,
    );
    const unwire = enhance(document);
    expect(state()).toEqual([[false, true, false, false], "mixed"]);
    await act(async () => all().click());
    expect(calls).toEqual([
      ["a", "b"],
      ["a", "b", "c"],
    ]);
    expect(state()).toEqual([[true, true, true, false], "checked"]);
    await act(async () => all().click());
    expect(state()).toEqual([[false, false, false, false], "unchecked"]);
    unwire();
  });

  test("a row added after every row was selected shows the header as mixed", async () => {
    const { render, state } = await mountTable(<DeckTable rows={DECKS.slice(0, 2)} initial={["a", "b"]} />);
    expect(state()).toEqual([[true, true], "checked"]);
    await render(<DeckTable rows={DECKS.slice(0, 3)} initial={["a", "b"]} />);
    expect(state()).toEqual([[true, true, false], "mixed"]);
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
          <Toaster label="Notifications" />
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

describe("Buttons in a form", () => {
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
  "button-data-tone": { codes: ["ODD-REACT-002"], text: [] },
  "button-aria-label": { codes: ["ODD-REACT-001"], text: ["Types of property '\"aria-label\"' are incompatible"] },
  "button-icon-only-unnamed": { codes: [], text: ["Property 'label' is missing"] },
  "input-unnamed": { codes: [], text: ["Property 'label' is missing"] },
  "tabs-unnamed": { codes: [], text: ["Property 'label' is missing"] },
  "dialog-no-title": { codes: [], text: ["Property 'title' is missing"] },
  "alert-dialog-no-description": { codes: [], text: ["Property 'description' is missing"] },
  "menu-name": { codes: [], text: ["Property 'label' is missing"] },
  "log-unnamed": { codes: [], text: ["Property 'label' is missing"] },
  "table-uncaptioned": { codes: [], text: ["Property 'caption' is missing"] },
  "stack-gap": { codes: [], text: ["{ gap: number; children: string; }' is not assignable"] },
  "stack-style": { codes: [], text: ["{ style: { maxInlineSize: string; }; children: string; }' is not assignable"] },
  "combobox-unnamed": { codes: [], text: ["Property 'label' is missing"] },
  "search-unnamed": { codes: [], text: ["Property 'label' is missing"] },
};

describe("Avatar", () => {
  test("an image that fails to load gives way to the initials, named by name", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    mounted = root;
    await act(async () => root.render(<Avatar name="Kai Nakamura" src="https://example.test/kai.png" />));
    const image = host.querySelector("img")!;
    expect(image.alt).toBe("Kai Nakamura");
    await act(async () => image.dispatchEvent(new Event("error")));
    expect(host.innerHTML).toBe('<span class="odd-avatar" role="img" aria-label="Kai Nakamura">KN</span>');
  });
});

describe("platform fallbacks", () => {
  const INTEREST = ["focusin", "focusout", "keydown", "pointerout", "pointerover"];

  test("a dismissible Dialog with no page-level call, two interestForFallback calls, and one enhance() on the document add one set of listeners, which the last cleanup removes", async () => {
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
      const host = document.createElement("div");
      document.body.append(host);
      const root = createRoot(host);
      mounted = root;
      await act(async () => root.render(<Dialog title="Filters" dismissible />));
      expect(added.filter((type) => type === "click")).toEqual(["click"]);
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
      expect(removed.filter((type) => type === "click")).toEqual([]);
      await act(async () => root.unmount());
      mounted = undefined;
      expect(removed.filter((type) => type === "click")).toEqual(["click"]);
      second();
      expect(removed.filter((type) => INTEREST.includes(type)).sort()).toEqual(INTEREST);
    } finally {
      document.addEventListener = add;
      document.removeEventListener = remove;
    }
  });
});

describe("platform fallbacks on a canvas", () => {
  test("a page-level interestForFallback and closedByFallback, then enhance() on an element inside the page, add one set of fallback listeners, all on the document", () => {
    const canvas = document.createElement("div");
    document.body.append(canvas);
    const added: string[] = [];
    const record = <T extends EventTarget>(target: T, name: string) => {
      const add = target.addEventListener;
      target.addEventListener = function (this: T, ...args: Parameters<EventTarget["addEventListener"]>) {
        added.push(`${name} ${args[0]}`);
        add.apply(this, args);
      };
      return () => (target.addEventListener = add);
    };
    const restore = [record(document, "document"), record(canvas, "canvas")];
    try {
      const page = [interestForFallback(), closedByFallback()];
      const story = enhance(canvas);
      const fallback = ["click", "focusin", "focusout", "keydown", "pointerout", "pointerover"];
      expect(added.filter((entry) => fallback.includes(entry.split(" ")[1]!)).sort()).toEqual(fallback.map((type) => `document ${type}`));
      story();
      page.forEach((release) => release());
    } finally {
      restore.forEach((undo) => undo());
    }
  });
});

describe("rejectBlank", () => {
  test("on a page with no process, as an unbundled browser has, a blank name throws its code and a name returns", () => {
    const saved = Object.getOwnPropertyDescriptor(globalThis, "process")!;
    Reflect.deleteProperty(globalThis, "process");
    try {
      expect(typeof (globalThis as { process?: unknown }).process).toBe("undefined");
      expect(() => rejectBlank(" ", "ODD-BUTTON-008")).toThrow("ODD-BUTTON-008");
      expect(rejectBlank("Close", "ODD-BUTTON-008")).toBe("Close");
    } finally {
      Object.defineProperty(globalThis, "process", saved);
    }
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
