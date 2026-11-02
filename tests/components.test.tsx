import { expect, test } from "bun:test";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type * as Odd from "odd-design/react";
import {
  Alert,
  AlertTitle,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardFooter,
  CardLink,
  Choice,
  Code,
  Combobox,
  ComboboxList,
  ComboboxOption,
  Dialog,
  DialogActions,
  Disclosure,
  Field,
  FieldError,
  Hint,
  Input,
  Kbd,
  Label,
  Menu,
  MenuItem,
  Meter,
  Popover,
  Pre,
  Progress,
  Search,
  Segmented,
  Select,
  Separator,
  Sheet,
  SheetFooter,
  SheetHeader,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Table,
  TableSort,
  TableWrap,
  Tabs,
  TextLink,
  Textarea,
  Toaster,
} from "odd-design/react";
import { CLASSES, type ClassName, type ExportName } from "../src/js/usage/contract.ts";
import { checkRoot } from "../src/js/usage/dom.ts";
import { hydrationErrors } from "./hydrate.ts";

type Expect<T extends true> = T;

/** Exports that render no odd- class. */
type NonRendering = "OddProvider";

type Rendering = Exclude<keyof typeof Odd, NonRendering>;

type ExportNameIsTheBarrel = Expect<[Exclude<Rendering, ExportName> | Exclude<ExportName, Rendering>] extends [never] ? true : false>;

type Fixture = {
  readonly name: string;
  readonly element: ReactElement;
  /** Other exports in the fixture, whose classes it may carry. */
  readonly uses?: readonly ExportName[];
  /** Classes the fixture writes by hand, because no export renders them yet. */
  readonly writes?: readonly ClassName[];
  /** The exact static markup. */
  readonly markup?: string;
};

/** Typed over every rendering export, so a new export without a fixture fails to compile. */
const FIXTURES: { readonly [K in ExportName]: readonly [Fixture, ...Fixture[]] } = {
  Alert: [
    {
      name: "tone and title",
      uses: ["AlertTitle"],
      element: (
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
        </>
      ),
      markup:
        '<div class="odd-alert"><p class="odd-alert-title">Drafts are private</p></div><div class="odd-alert wide" data-tone="warning">Rotation is coming</div><div data-testid="notice" class="odd-alert" data-tone="danger"><p class="odd-alert-title">Could not save</p></div>',
    },
  ],
  AlertTitle: [
    {
      name: "inside an alert",
      uses: ["Alert"],
      element: (
        <Alert tone="danger">
          <AlertTitle>Could not save</AlertTitle>
          Try again in a minute.
        </Alert>
      ),
    },
  ],
  Avatar: [
    {
      name: "small, with a name",
      element: (
        <Avatar size="sm" role="img" aria-label="Kai Nakamura">
          KN
        </Avatar>
      ),
    },
  ],
  AvatarGroup: [
    {
      name: "a named group of avatars",
      uses: ["Avatar"],
      element: (
        <AvatarGroup role="group" aria-label="Collaborators" className="wide">
          <Avatar size="lg" role="img" aria-label="Mira Okafor">
            MO
          </Avatar>
          <Avatar role="img" aria-label="and 3 more">
            +3
          </Avatar>
        </AvatarGroup>
      ),
      markup:
        '<div role="group" aria-label="Collaborators" class="odd-avatar-group wide"><span role="img" aria-label="Mira Okafor" class="odd-avatar" data-size="lg">MO</span><span role="img" aria-label="and 3 more" class="odd-avatar">+3</span></div>',
    },
  ],
  Badge: [
    {
      name: "tones and solid",
      element: (
        <>
          <Badge>Draft</Badge>
          <Badge tone="danger" solid className="wide">
            Banned
          </Badge>
          <Badge tone="success" solid={false} data-testid="status">
            Legal
          </Badge>
        </>
      ),
      markup:
        '<span class="odd-badge">Draft</span><span class="odd-badge wide" data-tone="danger" data-solid="">Banned</span><span data-testid="status" class="odd-badge" data-tone="success">Legal</span>',
    },
  ],
  Breadcrumb: [
    {
      name: "a trail with a plain level",
      uses: ["TextLink"],
      element: (
        <Breadcrumb aria-label="Breadcrumb">
          <ol>
            <li>
              <TextLink href="#home">Home</TextLink>
            </li>
            <li>Archived</li>
            <li>
              <TextLink href="#alerts" aria-current="page">
                Alerts
              </TextLink>
            </li>
          </ol>
        </Breadcrumb>
      ),
      markup:
        '<nav aria-label="Breadcrumb" class="odd-breadcrumb"><ol><li><a href="#home" class="odd-link">Home</a></li><li>Archived</li><li><a href="#alerts" aria-current="page" class="odd-link">Alerts</a></li></ol></nav>',
    },
  ],
  Button: [
    { name: "no props", element: <Button>Save</Button>, markup: '<button type="button" class="odd-button">Save</button>' },
    {
      name: "variant and size",
      element: (
        <Button variant="primary" size="sm">
          Save
        </Button>
      ),
      markup: '<button type="button" class="odd-button" data-variant="primary" data-size="sm">Save</button>',
    },
    {
      name: "submit with aria-disabled",
      element: (
        <Button type="submit" aria-disabled="true" aria-busy="true">
          Pay
        </Button>
      ),
      markup: '<button type="submit" aria-disabled="true" aria-busy="true" class="odd-button">Pay</button>',
    },
    {
      name: "className",
      element: (
        <Button className="wide" variant="ghost">
          Reset
        </Button>
      ),
      markup: '<button type="button" class="odd-button wide" data-variant="ghost">Reset</button>',
    },
    {
      name: "link",
      element: (
        <Button href="/docs" aria-current="page" variant="secondary">
          Docs
        </Button>
      ),
      markup: '<a href="/docs" aria-current="page" class="odd-button" data-variant="secondary">Docs</a>',
    },
    {
      name: "icon-only",
      element: (
        <Button iconOnly aria-label="Close" size="lg">
          <svg aria-hidden="true" />
        </Button>
      ),
      markup: '<button aria-label="Close" type="button" class="odd-button" data-size="lg" data-icon-only=""><svg aria-hidden="true"></svg></button>',
    },
    {
      name: "invoker commands and their targets",
      uses: ["Dialog"],
      writes: ["odd-tooltip"],
      element: (
        <>
          <Button command="show-modal" commandfor="settings" interestfor="settings-hint">
            Settings
          </Button>
          <span className="odd-tooltip" id="settings-hint" popover="hint" role="tooltip">
            Opens your settings
          </span>
          <Dialog id="settings" aria-label="Settings" />
        </>
      ),
      markup:
        '<button command="show-modal" commandfor="settings" interestfor="settings-hint" type="button" class="odd-button">Settings</button><span class="odd-tooltip" id="settings-hint" popover="hint" role="tooltip">Opens your settings</span><dialog id="settings" aria-label="Settings" class="odd-dialog"></dialog>',
    },
    {
      name: "headless and app data attributes",
      element: (
        <Button data-state="open" data-chrome="bubblegum" data-testid="menu">
          Menu
        </Button>
      ),
      markup: '<button data-state="open" data-chrome="bubblegum" data-testid="menu" type="button" class="odd-button">Menu</button>',
    },
  ],
  Card: [
    {
      name: "interactive, with one link and a footer",
      uses: ["CardLink", "CardFooter"],
      writes: ["odd-card-title"],
      element: (
        <Card interactive className="deck">
          <h3 className="odd-card-title">
            <CardLink href="/decks/ember">Ember Aggro</CardLink>
          </h3>
          <CardFooter>60 cards</CardFooter>
        </Card>
      ),
      markup:
        '<article class="odd-card deck" data-interactive=""><h3 class="odd-card-title"><a href="/decks/ember" class="odd-card-link">Ember Aggro</a></h3><div class="odd-card-footer">60 cards</div></article>',
    },
  ],
  CardFooter: [
    {
      name: "under a title",
      uses: ["Card"],
      writes: ["odd-card-title"],
      element: (
        <Card>
          <h3 className="odd-card-title">Ember Aggro</h3>
          <CardFooter>60 cards</CardFooter>
        </Card>
      ),
    },
  ],
  CardLink: [
    {
      name: "the one link in an interactive card",
      uses: ["Card"],
      writes: ["odd-card-title"],
      element: (
        <Card interactive>
          <h3 className="odd-card-title">
            <CardLink href="/decks/tide">Tide Control</CardLink>
          </h3>
        </Card>
      ),
    },
  ],
  Choice: [
    {
      name: "a checkbox, a switch, and a segmented control",
      uses: ["Switch", "Segmented"],
      element: (
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
        </>
      ),
      markup:
        '<label class="odd-choice"><input type="checkbox" checked=""/> Weekly digest</label><label class="odd-choice wide"><input type="checkbox" role="switch" disabled="" class="odd-switch"/> Compact grid</label><fieldset class="odd-segmented"><legend>View</legend><label><input type="radio" name="view" checked=""/> Grid</label></fieldset>',
    },
  ],
  Code: [
    {
      name: "inline code beside a block",
      uses: ["Pre"],
      writes: ["odd-stack"],
      element: (
        <div className="odd-stack">
          <p>
            Set <Code>--primary</Code> on the scope.
          </p>
          <Pre data-language="sh">
            <code>bun add odd-design</code>
          </Pre>
        </div>
      ),
      markup:
        '<div class="odd-stack"><p>Set <code class="odd-code">--primary</code> on the scope.</p><pre data-language="sh" class="odd-pre"><code>bun add odd-design</code></pre></div>',
    },
  ],
  Combobox: [
    {
      name: "in a field, before enhancement",
      uses: ["Field", "Label", "Input", "ComboboxList", "ComboboxOption"],
      element: (
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
        </Field>
      ),
      markup:
        '<div class="odd-field"><label for="city" id="city-label" class="odd-label">City</label><div class="odd-combobox"><input id="city" role="combobox" aria-controls="city-list" aria-expanded="false" aria-autocomplete="list" class="odd-input" name="city"/><div id="city-list" popover="manual" role="listbox" aria-labelledby="city-label" class="odd-combobox-list"><div role="option" class="odd-combobox-option">Amsterdam</div><div role="option" aria-disabled="true" class="odd-combobox-option">Atlantis</div><div role="option" class="odd-combobox-option">Berlin</div></div></div></div>',
    },
  ],
  ComboboxList: [
    {
      name: "a list that your code filters",
      element: <ComboboxList id="people" popover="manual" role="listbox" aria-label="People" data-filter="manual" className="wide" />,
      markup: '<div id="people" popover="manual" role="listbox" aria-label="People" data-filter="manual" class="odd-combobox-list wide"></div>',
    },
  ],
  ComboboxOption: [
    {
      name: "in a named list",
      uses: ["ComboboxList"],
      element: (
        <ComboboxList id="players" popover="manual" role="listbox" aria-label="Players">
          <ComboboxOption role="option">Mira Okafor</ComboboxOption>
        </ComboboxList>
      ),
    },
  ],
  Dialog: [
    {
      name: "around its actions",
      uses: ["DialogActions"],
      element: (
        <Dialog id="confirm" aria-labelledby="confirm-title" closedby="any" className="wide">
          <h2 id="confirm-title">Delete deck?</h2>
          <DialogActions className="end" />
        </Dialog>
      ),
      markup:
        '<dialog id="confirm" aria-labelledby="confirm-title" closedby="any" class="odd-dialog wide"><h2 id="confirm-title">Delete deck?</h2><div class="odd-dialog-actions end"></div></dialog>',
    },
  ],
  DialogActions: [
    {
      name: "with a close button",
      uses: ["Dialog", "Button"],
      element: (
        <Dialog id="discard" aria-labelledby="discard-title">
          <h2 id="discard-title">Discard changes?</h2>
          <DialogActions>
            <Button commandfor="discard" command="close">
              Keep editing
            </Button>
          </DialogActions>
        </Dialog>
      ),
    },
  ],
  Disclosure: [
    {
      name: "open, in a named group",
      element: (
        <Disclosure name="faq" open className="faq">
          <summary>Does it need JavaScript?</summary>
          <div>No.</div>
        </Disclosure>
      ),
      markup: '<details name="faq" open="" class="odd-disclosure faq"><summary>Does it need JavaScript?</summary><div>No.</div></details>',
    },
  ],
  Field: [
    {
      name: "with a hint and an error",
      uses: ["Label", "Input", "Hint", "FieldError"],
      element: (
        <Field>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required aria-invalid="true" aria-describedby="email-hint email-error" />
          <Hint id="email-hint">We never share it.</Hint>
          <FieldError id="email-error">Enter an email address.</FieldError>
        </Field>
      ),
      markup:
        '<div class="odd-field"><label for="email" class="odd-label">Email</label><input id="email" type="email" required="" aria-invalid="true" aria-describedby="email-hint email-error" class="odd-input"/><p id="email-hint" class="odd-hint">We never share it.</p><p id="email-error" class="odd-error">Enter an email address.</p></div>',
    },
  ],
  FieldError: [
    {
      name: "described by its input",
      uses: ["Field", "Label", "Input"],
      element: (
        <Field>
          <Label htmlFor="deck-title">Title</Label>
          <Input id="deck-title" required aria-invalid="true" aria-describedby="deck-title-error" />
          <FieldError id="deck-title-error">Enter a title.</FieldError>
        </Field>
      ),
    },
  ],
  Hint: [
    {
      name: "described by its input",
      uses: ["Field", "Label", "Input"],
      element: (
        <Field>
          <Label htmlFor="display-name">Display name</Label>
          <Input id="display-name" aria-describedby="display-name-hint" />
          <Hint id="display-name-hint">Shown on your profile.</Hint>
        </Field>
      ),
    },
  ],
  Input: [{ name: "named, with a starting value", element: <Input aria-label="Deck name" defaultValue="Ember Aggro" /> }],
  Kbd: [
    {
      name: "keys in a sentence",
      element: (
        <p>
          Press <Kbd>Ctrl</Kbd> <Kbd className="wide">K</Kbd> to search.
        </p>
      ),
      markup: '<p>Press <kbd class="odd-kbd">Ctrl</kbd> <kbd class="odd-kbd wide">K</kbd> to search.</p>',
    },
  ],
  Label: [
    {
      name: "for its input",
      uses: ["Field", "Input"],
      element: (
        <Field>
          <Label htmlFor="deck-format">Format</Label>
          <Input id="deck-format" defaultValue="Standard" />
        </Field>
      ),
    },
  ],
  Menu: [
    {
      name: "with a danger item",
      uses: ["MenuItem"],
      element: (
        <Menu id="deck-actions" popover="auto" role="menu" aria-label="Deck actions">
          <MenuItem role="menuitem">Rename</MenuItem>
          <MenuItem role="menuitem" tone="danger" aria-disabled="true">
            Delete
          </MenuItem>
        </Menu>
      ),
      markup:
        '<div id="deck-actions" popover="auto" role="menu" aria-label="Deck actions" class="odd-menu"><button role="menuitem" type="button" class="odd-menu-item">Rename</button><button role="menuitem" aria-disabled="true" type="button" class="odd-menu-item" data-tone="danger">Delete</button></div>',
    },
  ],
  MenuItem: [
    {
      name: "a checked checkbox item",
      uses: ["Menu"],
      element: (
        <Menu id="view-options" popover="auto" role="menu" aria-label="View options">
          <MenuItem role="menuitemcheckbox" aria-checked="true">
            Show card counts
          </MenuItem>
        </Menu>
      ),
    },
  ],
  Meter: [
    {
      name: "with a tone",
      element: <Meter id="actions" min={0} max={60} value={22} tone="info" />,
      markup: '<meter id="actions" min="0" max="60" value="22" class="odd-meter" data-tone="info"></meter>',
    },
  ],
  Popover: [
    {
      name: "a dialog named by its title",
      element: (
        <Popover id="filters" popover="auto" role="dialog" aria-labelledby="filters-title" className="wide">
          <p id="filters-title">Filter decks</p>
        </Popover>
      ),
      markup:
        '<div id="filters" popover="auto" role="dialog" aria-labelledby="filters-title" class="odd-popover wide"><p id="filters-title">Filter decks</p></div>',
    },
  ],
  Pre: [
    {
      name: "a block of code",
      element: (
        <Pre>
          <code>bun add odd-design</code>
        </Pre>
      ),
    },
  ],
  Progress: [
    {
      name: "indeterminate, with no value",
      element: <Progress id="sync" aria-label="Syncing decks" />,
      markup: '<progress id="sync" aria-label="Syncing decks" class="odd-progress"></progress>',
    },
  ],
  Search: [
    {
      name: "with a hidden label and a leading icon",
      uses: ["Input"],
      writes: ["odd-visually-hidden"],
      element: (
        <Search className="deck-search">
          <label className="odd-visually-hidden" htmlFor="card-search">
            Search cards
          </label>
          <svg aria-hidden="true" viewBox="0 0 24 24" />
          <Input type="search" id="card-search" placeholder="Search cards" />
        </Search>
      ),
      markup:
        '<search class="odd-search deck-search"><label class="odd-visually-hidden" for="card-search">Search cards</label><svg aria-hidden="true" viewBox="0 0 24 24"></svg><input type="search" id="card-search" placeholder="Search cards" class="odd-input"/></search>',
    },
  ],
  Segmented: [
    {
      name: "two radios under a legend",
      element: (
        <Segmented>
          <legend>Sort</legend>
          <label>
            <input type="radio" name="sort" defaultChecked /> Newest
          </label>
          <label>
            <input type="radio" name="sort" /> Oldest
          </label>
        </Segmented>
      ),
    },
  ],
  Select: [
    {
      name: "named, with a starting value",
      element: (
        <Select aria-label="Format" defaultValue="Extended">
          <option>Standard</option>
          <option>Extended</option>
        </Select>
      ),
    },
  ],
  Separator: [
    {
      name: "horizontal and vertical",
      element: (
        <>
          <Separator />
          <Separator aria-orientation="vertical" className="tall" />
        </>
      ),
      markup: '<hr class="odd-separator"/><hr aria-orientation="vertical" class="odd-separator tall"/>',
    },
  ],
  Sheet: [
    {
      name: "from the start edge, around its header and footer",
      uses: ["SheetHeader", "SheetFooter"],
      writes: ["odd-dialog-title", "odd-sheet-body"],
      element: (
        <Sheet id="filters" side="start" aria-labelledby="filters-title" closedby="any" className="wide">
          <SheetHeader>
            <h2 className="odd-dialog-title" id="filters-title">
              Filters
            </h2>
          </SheetHeader>
          <div className="odd-sheet-body" />
          <SheetFooter className="end" />
        </Sheet>
      ),
      markup:
        '<dialog id="filters" aria-labelledby="filters-title" closedby="any" class="odd-sheet wide" data-side="start"><div class="odd-sheet-header"><h2 class="odd-dialog-title" id="filters-title">Filters</h2></div><div class="odd-sheet-body"></div><div class="odd-sheet-footer end"></div></dialog>',
    },
  ],
  SheetFooter: [
    {
      name: "with a close button",
      uses: ["Sheet", "SheetHeader", "Button"],
      writes: ["odd-dialog-title", "odd-sheet-body"],
      element: (
        <Sheet id="sort-sheet" aria-labelledby="sort-sheet-title">
          <SheetHeader>
            <h2 className="odd-dialog-title" id="sort-sheet-title">
              Sort
            </h2>
          </SheetHeader>
          <div className="odd-sheet-body" />
          <SheetFooter>
            <Button commandfor="sort-sheet" command="close">
              Done
            </Button>
          </SheetFooter>
        </Sheet>
      ),
    },
  ],
  SheetHeader: [
    {
      name: "with a title and an icon-only close button",
      uses: ["Sheet", "Button"],
      writes: ["odd-dialog-title", "odd-sheet-body"],
      element: (
        <Sheet id="deck-sheet" aria-labelledby="deck-sheet-title">
          <SheetHeader>
            <h2 className="odd-dialog-title" id="deck-sheet-title">
              Deck
            </h2>
            <Button variant="ghost" iconOnly aria-label="Close" commandfor="deck-sheet" command="close">
              <svg aria-hidden="true" />
            </Button>
          </SheetHeader>
          <div className="odd-sheet-body" />
        </Sheet>
      ),
    },
  ],
  Skeleton: [
    {
      name: "blocks in a busy region",
      writes: ["odd-visually-hidden"],
      element: (
        <div aria-busy="true">
          <span className="odd-visually-hidden">Loading decks…</span>
          <Skeleton aria-hidden="true" shape="avatar" />
          <Skeleton aria-hidden="true" className="wide" />
        </div>
      ),
      markup:
        '<div aria-busy="true"><span class="odd-visually-hidden">Loading decks…</span><div aria-hidden="true" class="odd-skeleton" data-shape="avatar"></div><div aria-hidden="true" class="odd-skeleton wide"></div></div>',
    },
  ],
  Slider: [
    {
      name: "a disabled range",
      element: <Slider type="range" id="locked" min={5} max={9} defaultValue={7} disabled className="wide" />,
      markup: '<input type="range" id="locked" min="5" max="9" disabled="" class="odd-slider wide" value="7"/>',
    },
  ],
  Spinner: [
    {
      name: "in a busy region",
      writes: ["odd-row"],
      element: (
        <div className="odd-row" aria-busy="true">
          <Spinner aria-hidden="true" /> Loading projects…
        </div>
      ),
      markup: '<div class="odd-row" aria-busy="true"><span aria-hidden="true" class="odd-spinner"></span> Loading projects…</div>',
    },
  ],
  Switch: [
    {
      name: "inside a choice",
      uses: ["Choice"],
      element: (
        <Choice>
          <Switch type="checkbox" role="switch" defaultChecked /> Show card art
        </Choice>
      ),
    },
  ],
  Table: [
    {
      name: "in its scroll region, with a sortable header",
      uses: ["TableWrap", "TableSort"],
      element: (
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
        </TableWrap>
      ),
      markup:
        '<div tabindex="0" role="region" aria-labelledby="decks-caption" class="odd-table-wrap"><table class="odd-table"><caption id="decks-caption">Your decks</caption><thead><tr><th scope="col" aria-sort="ascending"><button type="button" class="odd-table-sort">Deck</button></th></tr></thead><tbody></tbody></table></div>',
    },
  ],
  TableSort: [
    {
      name: "the only child of a sorted header",
      uses: ["Table"],
      element: (
        <Table>
          <caption>Cards by count</caption>
          <thead>
            <tr>
              <th scope="col" aria-sort="descending">
                <TableSort>Cards</TableSort>
              </th>
            </tr>
          </thead>
          <tbody />
        </Table>
      ),
    },
  ],
  TableWrap: [
    {
      name: "a region named by its label",
      uses: ["Table"],
      element: (
        <TableWrap tabIndex={0} role="region" aria-label="Decks">
          <Table>
            <caption>Decks</caption>
            <thead>
              <tr>
                <th scope="col">Deck</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ember Aggro</td>
              </tr>
            </tbody>
          </Table>
        </TableWrap>
      ),
    },
  ],
  Tabs: [
    {
      name: "a tab set",
      element: (
        <Tabs id="deck-tabs" className="deck">
          <div role="tablist" aria-label="Deck view">
            <button role="tab" id="tab-cards" aria-controls="panel-cards" aria-selected="true">
              Cards
            </button>
          </div>
          <div role="tabpanel" id="panel-cards" aria-labelledby="tab-cards">
            60 cards
          </div>
        </Tabs>
      ),
      markup:
        '<div id="deck-tabs" class="odd-tabs deck"><div role="tablist" aria-label="Deck view"><button role="tab" id="tab-cards" aria-controls="panel-cards" aria-selected="true">Cards</button></div><div role="tabpanel" id="panel-cards" aria-labelledby="tab-cards">60 cards</div></div>',
    },
  ],
  TextLink: [
    {
      name: "a link and the current page",
      element: (
        <p>
          Read the <TextLink href="#guide">setup guide</TextLink> or open{" "}
          <TextLink href="#roadmap" aria-current="page" className="nav">
            Roadmap
          </TextLink>
          .
        </p>
      ),
      markup: '<p>Read the <a href="#guide" class="odd-link">setup guide</a> or open <a href="#roadmap" aria-current="page" class="odd-link nav">Roadmap</a>.</p>',
    },
  ],
  Textarea: [
    {
      name: "disabled, beside a select with className",
      uses: ["Select"],
      element: (
        <>
          <Textarea id="notes" disabled />
          <Select id="format" className="wide">
            <option>Standard</option>
          </Select>
        </>
      ),
      markup: '<textarea id="notes" disabled="" class="odd-textarea"></textarea><select id="format" class="odd-select wide"><option>Standard</option></select>',
    },
  ],
  Toaster: [
    {
      name: "a named region",
      element: <Toaster popover="manual" aria-label="Notifications" />,
      markup: '<section popover="manual" aria-label="Notifications" class="odd-toaster"></section>',
    },
  ],
};

/** Every attribute whose value names ids in the same document. */
const ID_REFERENCES = ["for", "aria-labelledby", "aria-describedby", "aria-controls", "commandfor", "interestfor", "form"] as const;

const entries = Object.entries(FIXTURES) as [ExportName, readonly Fixture[]][];

function owned(name: ExportName): string[] {
  return Object.entries(CLASSES).flatMap(([className, owner]) => ((owner.by as readonly ExportName[]).includes(name) ? [className] : []));
}

function rendered(fixture: Fixture): HTMLElement {
  const root = document.createElement("div");
  root.innerHTML = renderToStaticMarkup(fixture.element);
  return root;
}

function oddClasses(root: Element): string[] {
  return [...new Set([...root.querySelectorAll("[class]")].flatMap((element) => [...element.classList].filter((name) => name.startsWith("odd-"))))].sort();
}

function unresolved(root: Element): string[] {
  const ids = new Set([...root.querySelectorAll("[id]")].map((element) => element.id));
  return [...root.querySelectorAll("*")].flatMap((element) =>
    ID_REFERENCES.flatMap((attribute) => (element.getAttribute(attribute) ?? "").split(/\s+/).filter((id) => id !== "" && !ids.has(id)).map((id) => `${attribute}=${id}`)),
  );
}

for (const [name, fixtures] of entries) {
  for (const fixture of fixtures) {
    test(`${name} ${fixture.name}: the runtime checker accepts it, its classes are its own, every id reference resolves, and it hydrates`, async () => {
      if (fixture.markup !== undefined) expect(renderToStaticMarkup(fixture.element)).toBe(fixture.markup);
      const root = rendered(fixture);
      checkRoot(root);
      const allowed = new Set([...owned(name), ...(fixture.uses ?? []).flatMap(owned), ...(fixture.writes ?? [])]);
      expect(oddClasses(root).filter((className) => !allowed.has(className))).toEqual([]);
      expect(unresolved(root)).toEqual([]);
      expect(await hydrationErrors(fixture.element)).toEqual([]);
    });
  }

  test(`${name}'s fixtures render every class CLASSES says it renders`, () => {
    const seen = new Set(fixtures.flatMap((fixture) => oddClasses(rendered(fixture))));
    expect(owned(name).filter((className) => !seen.has(className))).toEqual([]);
  });
}

test("a fixture writes by hand only the classes no export renders", () => {
  const written = entries.flatMap(([name, fixtures]) => fixtures.flatMap((fixture) => (fixture.writes ?? []).map((className) => [name, fixture.name, className] as const)));
  expect(written.filter(([, , className]) => CLASSES[className].by.length > 0)).toEqual([]);
});

test("no fixture's static markup has a style attribute", () => {
  const styled = entries.flatMap(([name, fixtures]) => fixtures.filter((fixture) => rendered(fixture).querySelector("[style]") !== null).map((fixture) => `${name} ${fixture.name}`));
  expect(styled).toEqual([]);
});
