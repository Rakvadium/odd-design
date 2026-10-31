import { afterEach, describe, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";
import { act, StrictMode, useState, type ReactElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { enhance, enhanceTabs, toast } from "../src/js/enhance.ts";
import { checkRoot } from "../src/js/usage/dom.ts";
import { Alert, AlertTitle } from "../src/react/alert.tsx";
import { Avatar, AvatarGroup } from "../src/react/avatar.tsx";
import { Badge } from "../src/react/badge.tsx";
import { Button } from "../src/react/button.tsx";
import { Card, CardFooter, CardLink } from "../src/react/card.tsx";
import { Choice, Segmented, Switch } from "../src/react/choice.tsx";
import { Combobox, ComboboxList, ComboboxOption } from "../src/react/combobox.tsx";
import { Dialog, DialogActions } from "../src/react/dialog.tsx";
import { Disclosure } from "../src/react/disclosure.tsx";
import { Field, FieldError, Hint, Input, Label, Select, Textarea } from "../src/react/field.tsx";
import { Menu, MenuItem } from "../src/react/menu.tsx";
import { Meter, Progress } from "../src/react/meter.tsx";
import { Popover } from "../src/react/popover.tsx";
import { Search } from "../src/react/search.tsx";
import { Separator } from "../src/react/separator.tsx";
import { Sheet, SheetFooter, SheetHeader } from "../src/react/sheet.tsx";
import { Skeleton } from "../src/react/skeleton.tsx";
import { Slider } from "../src/react/slider.tsx";
import { Spinner } from "../src/react/spinner.tsx";
import { Table, TableSort, TableWrap } from "../src/react/table.tsx";
import { Tabs } from "../src/react/tabs.tsx";
import { TextLink } from "../src/react/text-link.tsx";
import { Toaster } from "../src/react/toast.tsx";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const repo = fileURLToPath(new URL("..", import.meta.url));

const markup: readonly [string, ReactElement, string][] = [
  ["no props", <Button>Save</Button>, '<button type="button" class="odd-button">Save</button>'],
  [
    "variant and size",
    <Button variant="primary" size="sm">
      Save
    </Button>,
    '<button type="button" class="odd-button" data-variant="primary" data-size="sm">Save</button>',
  ],
  [
    "submit with aria-disabled",
    <Button type="submit" aria-disabled="true" aria-busy="true">
      Pay
    </Button>,
    '<button type="submit" aria-disabled="true" aria-busy="true" class="odd-button">Pay</button>',
  ],
  [
    "className",
    <Button className="wide" variant="ghost">
      Reset
    </Button>,
    '<button type="button" class="odd-button wide" data-variant="ghost">Reset</button>',
  ],
  [
    "link",
    <Button href="/docs" aria-current="page" variant="secondary">
      Docs
    </Button>,
    '<a href="/docs" aria-current="page" class="odd-button" data-variant="secondary">Docs</a>',
  ],
  [
    "icon-only",
    <Button iconOnly aria-label="Close" size="lg">
      <svg aria-hidden="true" />
    </Button>,
    '<button aria-label="Close" type="button" class="odd-button" data-size="lg" data-icon-only=""><svg aria-hidden="true"></svg></button>',
  ],
  [
    "invoker commands",
    <Button command="show-modal" commandfor="settings" interestfor="hint">
      Settings
    </Button>,
    '<button command="show-modal" commandfor="settings" interestfor="hint" type="button" class="odd-button">Settings</button>',
  ],
  [
    "headless and app data attributes",
    <Button data-state="open" data-chrome="bubblegum" data-testid="menu">
      Menu
    </Button>,
    '<button data-state="open" data-chrome="bubblegum" data-testid="menu" type="button" class="odd-button">Menu</button>',
  ],
  [
    "field with an error",
    <Field>
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" required aria-invalid="true" aria-describedby="email-hint email-error" />
      <Hint id="email-hint">We never share it.</Hint>
      <FieldError id="email-error">Enter an email address.</FieldError>
    </Field>,
    '<div class="odd-field"><label for="email" class="odd-label">Email</label><input id="email" type="email" required="" aria-invalid="true" aria-describedby="email-hint email-error" class="odd-input"/><p id="email-hint" class="odd-hint">We never share it.</p><p id="email-error" class="odd-error">Enter an email address.</p></div>',
  ],
  [
    "disabled textarea and select with className",
    <>
      <Textarea id="notes" disabled />
      <Select id="format" className="wide">
        <option>Standard</option>
      </Select>
    </>,
    '<textarea id="notes" disabled="" class="odd-textarea"></textarea><select id="format" class="odd-select wide"><option>Standard</option></select>',
  ],
  [
    "choice, switch, and segmented",
    <>
      <Choice>
        <input type="checkbox" defaultChecked /> Weekly digest
      </Choice>
      <Choice className="wide">
        <Switch type="checkbox" role="switch" disabled /> Compact grid
      </Choice>
      <Segmented>
        <legend>View</legend>
        <label>
          <input type="radio" name="view" defaultChecked /> Grid
        </label>
      </Segmented>
    </>,
    '<label class="odd-choice"><input type="checkbox" checked=""/> Weekly digest</label><label class="odd-choice wide"><input type="checkbox" role="switch" disabled="" class="odd-switch"/> Compact grid</label><fieldset class="odd-segmented"><legend>View</legend><label><input type="radio" name="view" checked=""/> Grid</label></fieldset>',
  ],
  [
    "badge tones and solid",
    <>
      <Badge>Draft</Badge>
      <Badge tone="danger" solid className="wide">
        Banned
      </Badge>
      <Badge tone="success" solid={false} data-testid="status">
        Legal
      </Badge>
    </>,
    '<span class="odd-badge">Draft</span><span class="odd-badge wide" data-tone="danger" data-solid="">Banned</span><span data-testid="status" class="odd-badge" data-tone="success">Legal</span>',
  ],
  [
    "alert tone and title",
    <>
      <Alert>
        <AlertTitle>Drafts are private</AlertTitle>
      </Alert>
      <Alert tone="warning" className="wide">
        Rotation is coming
      </Alert>
      <Alert tone="danger" data-testid="notice">
        <AlertTitle>Could not save</AlertTitle>
      </Alert>
    </>,
    '<div class="odd-alert"><p class="odd-alert-title">Drafts are private</p></div><div class="odd-alert wide" data-tone="warning">Rotation is coming</div><div data-testid="notice" class="odd-alert" data-tone="danger"><p class="odd-alert-title">Could not save</p></div>',
  ],
  [
    "avatar size and group",
    <AvatarGroup role="group" aria-label="Collaborators" className="wide">
      <Avatar size="lg" role="img" aria-label="Mira Okafor">
        MO
      </Avatar>
      <Avatar role="img" aria-label="and 3 more">
        +3
      </Avatar>
    </AvatarGroup>,
    '<div role="group" aria-label="Collaborators" class="odd-avatar-group wide"><span role="img" aria-label="Mira Okafor" class="odd-avatar" data-size="lg">MO</span><span role="img" aria-label="and 3 more" class="odd-avatar">+3</span></div>',
  ],
  [
    "separator horizontal and vertical",
    <>
      <Separator />
      <Separator aria-orientation="vertical" className="tall" />
    </>,
    '<hr class="odd-separator"/><hr aria-orientation="vertical" class="odd-separator tall"/>',
  ],
  [
    "skeleton blocks in a busy region",
    <div aria-busy="true">
      <span className="odd-visually-hidden">Loading decks…</span>
      <Skeleton aria-hidden="true" shape="avatar" />
      <Skeleton aria-hidden="true" className="wide" style={{ inlineSize: "60%" }} />
    </div>,
    '<div aria-busy="true"><span class="odd-visually-hidden">Loading decks…</span><div aria-hidden="true" class="odd-skeleton" data-shape="avatar"></div><div aria-hidden="true" style="inline-size:60%" class="odd-skeleton wide"></div></div>',
  ],
  [
    "interactive card with one link and a footer",
    <Card interactive className="deck">
      <h3 className="odd-card-title">
        <CardLink href="/decks/ember">Ember Aggro</CardLink>
      </h3>
      <CardFooter>60 cards</CardFooter>
    </Card>,
    '<article class="odd-card deck" data-interactive=""><h3 class="odd-card-title"><a href="/decks/ember" class="odd-card-link">Ember Aggro</a></h3><div class="odd-card-footer">60 cards</div></article>',
  ],
  [
    "a text link and the current page",
    <p>
      Read the <TextLink href="#guide">setup guide</TextLink> or open <TextLink href="#roadmap" aria-current="page" className="nav">Roadmap</TextLink>.
    </p>,
    '<p>Read the <a href="#guide" class="odd-link">setup guide</a> or open <a href="#roadmap" aria-current="page" class="odd-link nav">Roadmap</a>.</p>',
  ],
  [
    "a spinner in a busy region",
    <div className="odd-row" aria-busy="true">
      <Spinner aria-hidden="true" /> Loading projects…
    </div>,
    '<div class="odd-row" aria-busy="true"><span aria-hidden="true" class="odd-spinner"></span> Loading projects…</div>',
  ],
  [
    "a combobox in a field, before enhancement",
    <Field>
      <Label htmlFor="city" id="city-label">
        City
      </Label>
      <Combobox>
        <Input id="city" name="city" role="combobox" aria-controls="city-list" aria-expanded="false" aria-autocomplete="list" />
        <ComboboxList id="city-list" popover="manual" role="listbox" aria-labelledby="city-label">
          <ComboboxOption role="option">Amsterdam</ComboboxOption>
          <ComboboxOption role="option" aria-disabled="true">
            Atlantis
          </ComboboxOption>
          <ComboboxOption role="option">Berlin</ComboboxOption>
        </ComboboxList>
      </Combobox>
    </Field>,
    '<div class="odd-field"><label for="city" id="city-label" class="odd-label">City</label><div class="odd-combobox"><input id="city" role="combobox" aria-controls="city-list" aria-expanded="false" aria-autocomplete="list" class="odd-input" name="city"/><div id="city-list" popover="manual" role="listbox" aria-labelledby="city-label" class="odd-combobox-list"><div role="option" class="odd-combobox-option">Amsterdam</div><div role="option" aria-disabled="true" class="odd-combobox-option">Atlantis</div><div role="option" class="odd-combobox-option">Berlin</div></div></div></div>',
  ],
  [
    "a combobox list that your code filters",
    <ComboboxList id="people" popover="manual" role="listbox" aria-label="People" data-filter="manual" className="wide" />,
    '<div id="people" popover="manual" role="listbox" aria-label="People" data-filter="manual" class="odd-combobox-list wide"></div>',
  ],
  [
    "open disclosure in a named group",
    <Disclosure name="faq" open className="faq">
      <summary>Does it need JavaScript?</summary>
      <div>No.</div>
    </Disclosure>,
    '<details name="faq" open="" class="odd-disclosure faq"><summary>Does it need JavaScript?</summary><div>No.</div></details>',
  ],
  [
    "tab set",
    <Tabs id="deck-tabs" className="deck">
      <div role="tablist" aria-label="Deck view">
        <button role="tab" id="tab-cards" aria-controls="panel-cards" aria-selected="true">
          Cards
        </button>
      </div>
      <div role="tabpanel" id="panel-cards" aria-labelledby="tab-cards">
        60 cards
      </div>
    </Tabs>,
    '<div id="deck-tabs" class="odd-tabs deck"><div role="tablist" aria-label="Deck view"><button role="tab" id="tab-cards" aria-controls="panel-cards" aria-selected="true">Cards</button></div><div role="tabpanel" id="panel-cards" aria-labelledby="tab-cards">60 cards</div></div>',
  ],
  [
    "search with a hidden label and a leading icon",
    <Search className="deck-search">
      <label className="odd-visually-hidden" htmlFor="card-search">
        Search cards
      </label>
      <svg aria-hidden="true" viewBox="0 0 24 24" />
      <Input type="search" id="card-search" placeholder="Search cards" />
    </Search>,
    '<search class="odd-search deck-search"><label class="odd-visually-hidden" for="card-search">Search cards</label><svg aria-hidden="true" viewBox="0 0 24 24"></svg><input type="search" id="card-search" placeholder="Search cards" class="odd-input"/></search>',
  ],
  [
    "disabled range slider",
    <Slider type="range" id="locked" min={5} max={9} defaultValue={7} disabled className="wide" />,
    '<input type="range" id="locked" min="5" max="9" disabled="" class="odd-slider wide" value="7"/>',
  ],
  [
    "meter with a tone",
    <Meter id="actions" min={0} max={60} value={22} tone="info" />,
    '<meter id="actions" min="0" max="60" value="22" class="odd-meter" data-tone="info"></meter>',
  ],
  [
    "indeterminate progress with no value",
    <Progress id="sync" aria-label="Syncing decks" />,
    '<progress id="sync" aria-label="Syncing decks" class="odd-progress"></progress>',
  ],
  [
    "toaster",
    <Toaster popover="manual" aria-label="Notifications" />,
    '<section popover="manual" aria-label="Notifications" class="odd-toaster"></section>',
  ],
  [
    "popover dialog named by its title",
    <Popover id="filters" popover="auto" role="dialog" aria-labelledby="filters-title" className="wide">
      <p id="filters-title">Filter decks</p>
    </Popover>,
    '<div id="filters" popover="auto" role="dialog" aria-labelledby="filters-title" class="odd-popover wide"><p id="filters-title">Filter decks</p></div>',
  ],
  [
    "dialog around its actions",
    <Dialog id="confirm" aria-labelledby="confirm-title" closedby="any" className="wide">
      <h2 id="confirm-title">Delete deck?</h2>
      <DialogActions className="end" />
    </Dialog>,
    '<dialog id="confirm" aria-labelledby="confirm-title" closedby="any" class="odd-dialog wide"><h2 id="confirm-title">Delete deck?</h2><div class="odd-dialog-actions end"></div></dialog>',
  ],
  [
    "menu with a danger item",
    <Menu id="deck-actions" popover="auto" role="menu" aria-label="Deck actions">
      <MenuItem role="menuitem">Rename</MenuItem>
      <MenuItem role="menuitem" tone="danger" aria-disabled="true">
        Delete
      </MenuItem>
    </Menu>,
    '<div id="deck-actions" popover="auto" role="menu" aria-label="Deck actions" class="odd-menu"><button role="menuitem" type="button" class="odd-menu-item">Rename</button><button role="menuitem" aria-disabled="true" type="button" class="odd-menu-item" data-tone="danger">Delete</button></div>',
  ],
  [
    "sheet from the start edge around its header and footer",
    <Sheet id="filters" side="start" aria-labelledby="filters-title" closedby="any" className="wide">
      <SheetHeader>
        <h2 className="odd-dialog-title" id="filters-title">Filters</h2>
      </SheetHeader>
      <div className="odd-sheet-body" />
      <SheetFooter className="end" />
    </Sheet>,
    '<dialog id="filters" aria-labelledby="filters-title" closedby="any" class="odd-sheet wide" data-side="start"><div class="odd-sheet-header"><h2 class="odd-dialog-title" id="filters-title">Filters</h2></div><div class="odd-sheet-body"></div><div class="odd-sheet-footer end"></div></dialog>',
  ],
  [
    "table in its scroll region with a sortable header",
    <TableWrap tabIndex={0} role="region" aria-labelledby="decks-caption">
      <Table>
        <caption id="decks-caption">Your decks</caption>
        <thead>
          <tr>
            <th scope="col" aria-sort="ascending">
              <TableSort>Deck</TableSort>
            </th>
          </tr>
        </thead>
        <tbody />
      </Table>
    </TableWrap>,
    '<div tabindex="0" role="region" aria-labelledby="decks-caption" class="odd-table-wrap"><table class="odd-table"><caption id="decks-caption">Your decks</caption><thead><tr><th scope="col" aria-sort="ascending"><button type="button" class="odd-table-sort">Deck</button></th></tr></thead><tbody></tbody></table></div>',
  ],
];

describe("React markup", () => {
  test.each(markup)("%s renders markup the runtime checker accepts", (_name, element, expected) => {
    const html = renderToStaticMarkup(element);
    expect(html).toBe(expected);
    const host = document.createElement("div");
    host.innerHTML = html;
    expect(() => checkRoot(host)).not.toThrow();
  });
});

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

  test("unmounting unwires the root", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    await act(async () => root.render(<CityField onChange={() => {}} />));
    const combobox = host.querySelector<HTMLElement>(".odd-combobox")!;
    await act(async () => root.unmount());
    document.body.append(combobox);
    const input = combobox.querySelector("input")!;
    key(input, "ArrowDown");
    expect([input.getAttribute("aria-expanded"), input.hasAttribute("aria-activedescendant")]).toEqual(["false", false]);
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
