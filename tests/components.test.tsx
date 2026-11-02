import { expect, test } from "bun:test";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type * as Odd from "odd-design/react";
import {
  Alert,
  AlertDialog,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Code,
  Combobox,
  ComboboxOption,
  Dialog,
  Disclosure,
  Eyebrow,
  Grid,
  GridItem,
  Heading,
  HoverCard,
  HoverCardLink,
  Input,
  Kbd,
  Log,
  LogLine,
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  Meter,
  Muted,
  Popover,
  Pre,
  Progress,
  RadioGroup,
  Row,
  Scope,
  Search,
  Segmented,
  Select,
  Separator,
  Sheet,
  Shell,
  SkipLink,
  Skeleton,
  Slider,
  Spinner,
  Stack,
  StatValue,
  Switch,
  Table,
  Tabs,
  TextLink,
  Textarea,
  Toaster,
  VisuallyHidden,
} from "odd-design/react";
import { CLASSES, type ClassName, type ExportName } from "../src/js/usage/contract.ts";
import { checkRoot } from "../src/js/usage/dom.ts";
import { hydrationErrors } from "./hydrate.ts";

type Expect<T extends true> = T;

/** Exports that render no odd- class: the provider, and the tuple a control reads its options from. */
type NonRendering = "OddProvider" | "SORT_DIRECTIONS";

type Rendering = Exclude<keyof typeof Odd, NonRendering>;

type ExportNameIsTheBarrel = Expect<[Exclude<Rendering, ExportName> | Exclude<ExportName, Rendering>] extends [never] ? true : false>;

type Fixture = {
  readonly name: string;
  readonly element: ReactElement;
  /** Other exports in the fixture, whose classes it may carry. */
  readonly uses?: readonly ExportName[];
  /** The exact static markup. */
  readonly markup?: string;
};

/** Typed over every rendering export, so a new export without a fixture fails to compile. */
const FIXTURES: { readonly [K in ExportName]: readonly [Fixture, ...Fixture[]] } = {
  Alert: [
    {
      name: "tone, title, and icon",
      element: (
        <>
          <Alert title="Drafts are private">Only you can see a deck until you publish it.</Alert>
          <Alert tone="warning" className="wide" icon={<svg viewBox="0 0 24 24" />}>
            <p>Rotation is coming</p>
          </Alert>
          <Alert tone="danger" title="Could not save" data-testid="notice" />
        </>
      ),
      markup:
        '<div class="odd-alert"><div><p class="odd-alert-title">Drafts are private</p>Only you can see a deck until you publish it.</div></div><div class="odd-alert wide" data-tone="warning"><svg viewBox="0 0 24 24" aria-hidden="true"></svg><div><p>Rotation is coming</p></div></div><div data-testid="notice" class="odd-alert" data-tone="danger"><div><p class="odd-alert-title">Could not save</p></div></div>',
    },
  ],
  AlertDialog: [
    {
      name: "a decision with a required description",
      uses: ["Button", "Muted"],
      element: (
        <AlertDialog
          id="discard"
          trigger={<Button variant="danger">Discard changes…</Button>}
          title="Discard unsaved changes?"
          description="You’ve edited 6 cards since your last save."
          actions={<Button command="close">Keep editing</Button>}
        />
      ),
      markup:
        '<button class="odd-button" data-variant="danger" type="button" command="show-modal" commandfor="discard">Discard changes…</button><dialog id="discard" aria-labelledby="discard-title" aria-describedby="discard-description" class="odd-dialog" role="alertdialog"><div class="odd-dialog-body"><h2 class="odd-dialog-title" id="discard-title">Discard unsaved changes?</h2><p id="discard-description" class="odd-muted">You’ve edited 6 cards since your last save.</p><div class="odd-dialog-actions"><button class="odd-button" type="button" command="close" commandfor="discard">Keep editing</button></div></div></dialog>',
    },
  ],
  Avatar: [
    {
      name: "initials from the name or given, and a decorative avatar",
      element: (
        <>
          <Avatar size="sm" name="Kai Nakamura" />
          <Avatar name="and 3 more" initials="+3" />
          <Avatar name="Mira Okafor" decorative className="wide" />
        </>
      ),
      markup:
        '<span class="odd-avatar" data-size="sm" role="img" aria-label="Kai Nakamura">KN</span><span class="odd-avatar" role="img" aria-label="and 3 more">+3</span><span class="odd-avatar wide" aria-hidden="true">MO</span>',
    },
    { name: "an image named by its alt", element: <Avatar name="Mira Okafor" src="/mira.png" size="lg" /> },
  ],
  AvatarGroup: [
    {
      name: "a named group of avatars",
      uses: ["Avatar"],
      element: (
        <AvatarGroup label="Collaborators" className="wide">
          <Avatar size="lg" name="Mira Okafor" />
          <Avatar name="and 3 more" initials="+3" />
        </AvatarGroup>
      ),
      markup:
        '<div class="odd-avatar-group wide" role="group" aria-label="Collaborators"><span class="odd-avatar" data-size="lg" role="img" aria-label="Mira Okafor">MO</span><span class="odd-avatar" role="img" aria-label="and 3 more">+3</span></div>',
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
      name: "a trail with a plain level, named by default",
      uses: ["TextLink"],
      element: <Breadcrumb items={[{ label: "Home", href: "#home" }, { label: "Archived" }, { label: "Alerts", href: "#alerts" }]} />,
      markup:
        '<nav class="odd-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#home" class="odd-link">Home</a></li><li>Archived</li><li><a href="#alerts" aria-current="page" class="odd-link">Alerts</a></li></ol></nav>',
    },
    {
      name: "a trail whose current page has no link",
      uses: ["TextLink"],
      element: <Breadcrumb items={[{ label: "Home", href: "#home" }, { label: "Alerts" }]} />,
      markup: '<nav class="odd-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#home" class="odd-link">Home</a></li><li><span aria-current="page">Alerts</span></li></ol></nav>',
    },
    {
      name: "a second trail with its own name",
      uses: ["TextLink"],
      element: <Breadcrumb label="Settings breadcrumb" items={[{ label: "Home", href: "#home" }]} className="wide" />,
    },
  ],
  Button: [
    { name: "no props", element: <Button>Save</Button>, markup: '<button class="odd-button" type="button">Save</button>' },
    {
      name: "variant and size",
      element: (
        <Button variant="primary" size="sm">
          Save
        </Button>
      ),
      markup: '<button class="odd-button" data-variant="primary" data-size="sm" type="button">Save</button>',
    },
    {
      name: "a disabled, busy submit",
      element: (
        <Button type="submit" disabled busy>
          Pay
        </Button>
      ),
      markup: '<button class="odd-button" type="submit" aria-disabled="true" aria-busy="true">Pay</button>',
    },
    {
      name: "className",
      element: (
        <Button className="wide" variant="ghost">
          Reset
        </Button>
      ),
      markup: '<button class="odd-button wide" data-variant="ghost" type="button">Reset</button>',
    },
    {
      name: "the current page's link",
      element: (
        <Button href="/docs" current variant="secondary">
          Docs
        </Button>
      ),
      markup: '<a class="odd-button" data-variant="secondary" href="/docs" aria-current="page">Docs</a>',
    },
    {
      name: "a link that opens a new tab",
      element: (
        <Button href="https://example.com/rules" newTab>
          Rules
        </Button>
      ),
      markup: '<a class="odd-button" href="https://example.com/rules" target="_blank" rel="noopener">Rules<span class="odd-visually-hidden"> (opens in a new tab)</span></a>',
    },
    {
      name: "icon-only, named by its tooltip",
      element: (
        <Button iconOnly label="Close" size="lg" id="close">
          <svg aria-hidden="true" />
        </Button>
      ),
      markup:
        '<button id="close" class="odd-button" data-size="lg" data-icon-only="" aria-labelledby="close-tooltip" interestfor="close-tooltip" type="button"><svg aria-hidden="true"></svg></button><span class="odd-tooltip" id="close-tooltip" popover="hint" role="tooltip">Close</span>',
    },
    {
      name: "icon-only with a generated id",
      element: (
        <Button iconOnly label="Share link" variant="ghost">
          <svg aria-hidden="true" />
        </Button>
      ),
    },
    {
      name: "a tooltip merged into the caller's description",
      element: (
        <>
          <Button tooltip="Anyone with the link can view it" aria-describedby="publish-note" id="publish">
            Publish
          </Button>
          <p id="publish-note">Drafts stay private.</p>
        </>
      ),
      markup:
        '<button aria-describedby="publish-note publish-tooltip" id="publish" class="odd-button" interestfor="publish-tooltip" type="button">Publish</button><span class="odd-tooltip" id="publish-tooltip" popover="hint" role="tooltip">Anyone with the link can view it</span><p id="publish-note">Drafts stay private.</p>',
    },
    {
      name: "a remote command and its target",
      uses: ["Dialog"],
      element: (
        <>
          <Button command="show-modal" commandfor="settings">
            Settings
          </Button>
          <Dialog id="settings" title="Settings" />
        </>
      ),
      markup:
        '<button class="odd-button" type="button" command="show-modal" commandfor="settings">Settings</button><dialog id="settings" aria-labelledby="settings-title" class="odd-dialog"><div class="odd-dialog-body"><h2 class="odd-dialog-title" id="settings-title">Settings</h2></div></dialog>',
    },
    {
      name: "headless and app data attributes",
      element: (
        <Button data-state="open" data-chrome="bubblegum" data-testid="menu">
          Menu
        </Button>
      ),
      markup: '<button data-state="open" data-chrome="bubblegum" data-testid="menu" class="odd-button" type="button">Menu</button>',
    },
  ],
  Card: [
    {
      name: "a link, with an eyebrow, a description, content, and a footer",
      uses: ["Eyebrow", "Muted", "Badge"],
      element: (
        <Card href="/decks/ember" title="Ember Aggro" eyebrow="Interactive" description="Burns out fast." footer={<Badge>60 cards</Badge>} className="deck">
          <p>Rotating soon.</p>
        </Card>
      ),
      markup:
        '<article class="odd-card deck" data-interactive=""><p class="odd-eyebrow">Interactive</p><h3 class="odd-card-title"><a href="/decks/ember" class="odd-card-link">Ember Aggro</a></h3><p class="odd-muted">Burns out fast.</p><p>Rotating soon.</p><div class="odd-card-footer"><span class="odd-badge">60 cards</span></div></article>',
    },
    {
      name: "a static section with a level-2 title, and a plain article",
      element: (
        <>
          <Card as="section" title="Pose" headingLevel={2} />
          <Card>Base 0, shoulder 45.</Card>
        </>
      ),
      markup:
        '<section class="odd-card"><h2 class="odd-card-title">Pose</h2></section><article class="odd-card">Base 0, shoulder 45.</article>',
    },
  ],
  Checkbox: [
    {
      name: "checked, disabled, and with className",
      element: (
        <>
          <Checkbox label="Weekly digest" defaultChecked name="digest" />
          <Checkbox label="Partner offers" disabled className="wide" />
        </>
      ),
      markup:
        '<label class="odd-choice"><input type="checkbox" name="digest" checked=""/>Weekly digest</label><label class="odd-choice wide"><input disabled="" type="checkbox"/>Partner offers</label>',
    },
  ],
  Code: [
    {
      name: "inline code beside a block",
      uses: ["Pre", "Stack"],
      element: (
        <Stack>
          <p>
            Set <Code>--primary</Code> on the scope.
          </p>
          <Pre data-language="sh">bun add odd-design</Pre>
        </Stack>
      ),
      markup:
        '<div class="odd-stack"><p>Set <code class="odd-code">--primary</code> on the scope.</p><pre data-language="sh" class="odd-pre"><code>bun add odd-design</code></pre></div>',
    },
  ],
  Combobox: [
    {
      name: "a field with a disabled option and the hidden No results option",
      uses: ["ComboboxOption"],
      element: (
        <Combobox id="city" label="City" name="city" hint="Type to filter.">
          <ComboboxOption>Amsterdam</ComboboxOption>
          <ComboboxOption disabled>Atlantis</ComboboxOption>
        </Combobox>
      ),
      markup:
        '<div class="odd-field"><label class="odd-label" for="city" id="city-label">City</label><div class="odd-combobox"><input id="city" aria-describedby="city-hint" class="odd-input" role="combobox" aria-controls="city-list" aria-autocomplete="list" aria-expanded="false" name="city"/><div class="odd-combobox-list" id="city-list" popover="manual" role="listbox" aria-labelledby="city-label"><div class="odd-combobox-option" role="option">Amsterdam</div><div class="odd-combobox-option" role="option" aria-disabled="true">Atlantis</div><div class="odd-combobox-option" id="city-list-empty" role="option" aria-disabled="true" hidden="">No results</div></div></div><p class="odd-hint" id="city-hint">Type to filter.</p></div>',
    },
    {
      name: "filtered by your code, with an error, a hidden label, and a generated id",
      element: <Combobox label="Assignee" hideLabel filter="manual" error="Pick someone on the team." className="wide" />,
    },
  ],
  ComboboxOption: [
    {
      name: "with className and an app data attribute",
      uses: ["Combobox"],
      element: (
        <Combobox id="player" label="Player">
          <ComboboxOption className="pinned" data-id="mira">
            Mira Okafor
          </ComboboxOption>
        </Combobox>
      ),
    },
  ],
  Dialog: [
    {
      name: "a trigger, a title, a description, and actions",
      uses: ["Button", "Muted"],
      element: (
        <Dialog
          id="confirm"
          trigger={<Button variant="danger">Delete deck…</Button>}
          title="Delete “Ember Aggro”?"
          description="This removes the deck and its 14 saved versions."
          dismissible
          className="wide"
          actions={
            <>
              <Button command="close">Keep</Button>
              <Button variant="danger" command="close">
                Delete
              </Button>
            </>
          }
        />
      ),
      markup:
        '<button class="odd-button" data-variant="danger" type="button" command="show-modal" commandfor="confirm">Delete deck…</button><dialog id="confirm" aria-labelledby="confirm-title" aria-describedby="confirm-description" closedby="any" class="odd-dialog wide"><div class="odd-dialog-body"><h2 class="odd-dialog-title" id="confirm-title">Delete “Ember Aggro”?</h2><p id="confirm-description" class="odd-muted">This removes the deck and its 14 saved versions.</p><div class="odd-dialog-actions"><button class="odd-button" type="button" command="close" commandfor="confirm">Keep</button><button class="odd-button" data-variant="danger" type="button" command="close" commandfor="confirm">Delete</button></div></div></dialog>',
    },
    {
      name: "a form body whose submit button names it",
      uses: ["Button", "Input"],
      element: (
        <Dialog
          id="rename"
          title="Rename deck"
          headingLevel={3}
          onSubmit={() => {}}
          actions={
            <Button type="submit" variant="primary">
              Save
            </Button>
          }
        >
          <Input id="rename-name" label="Name" name="name" />
        </Dialog>
      ),
      markup:
        '<dialog id="rename" aria-labelledby="rename-title" class="odd-dialog"><form class="odd-dialog-body" id="rename-body" method="dialog"><h3 class="odd-dialog-title" id="rename-title">Rename deck</h3><div class="odd-field"><label class="odd-label" for="rename-name" id="rename-name-label">Name</label><input id="rename-name" class="odd-input" name="name"/></div><div class="odd-dialog-actions"><button class="odd-button" data-variant="primary" type="submit" form="rename-body">Save</button></div></form></dialog>',
    },
    {
      name: "a generated id",
      uses: ["Button"],
      element: (
        <Dialog trigger={<Button>Rename</Button>} title="Rename deck" onSubmit={() => {}} actions={<Button type="submit">Save</Button>}>
          <p>Names show on your profile.</p>
        </Dialog>
      ),
    },
  ],
  Disclosure: [
    {
      name: "open first, in a named group",
      element: (
        <Disclosure name="faq" summary="Does it need JavaScript?" defaultOpen className="faq">
          No.
        </Disclosure>
      ),
      markup: '<details name="faq" class="odd-disclosure faq" open=""><summary>Does it need JavaScript?</summary><div>No.</div></details>',
    },
  ],
  Eyebrow: [
    {
      name: "each tone above a heading",
      uses: ["Heading", "Stack"],
      element: (
        <Stack>
          <Eyebrow>Season 4</Eyebrow>
          <Eyebrow tone="primary" as="span" className="wide">
            New
          </Eyebrow>
          <Eyebrow tone="foreground">Pinned</Eyebrow>
          <Heading level={2}>Your collection</Heading>
        </Stack>
      ),
      markup:
        '<div class="odd-stack"><p class="odd-eyebrow">Season 4</p><span class="odd-eyebrow wide" data-tone="primary">New</span><p class="odd-eyebrow" data-tone="foreground">Pinned</p><h2 class="odd-heading">Your collection</h2></div>',
    },
  ],
  Grid: [
    {
      name: "a main grid of spans",
      uses: ["GridItem"],
      element: (
        <Grid as="main" className="board" aria-label="Board">
          <GridItem span={8}>Queue</GridItem>
          <GridItem span={4}>Notes</GridItem>
          <GridItem>History</GridItem>
        </Grid>
      ),
      markup: '<main aria-label="Board" class="odd-grid board"><div data-span="8">Queue</div><div data-span="4">Notes</div><div>History</div></main>',
    },
  ],
  GridItem: [
    {
      name: "a list item that spans half",
      uses: ["Grid"],
      element: (
        <Grid as="ul">
          <GridItem as="li" span={6} id="first">
            Ember Aggro
          </GridItem>
          <GridItem as="li" span={6}>
            Tide Control
          </GridItem>
        </Grid>
      ),
      markup: '<ul class="odd-grid"><li id="first" data-span="6">Ember Aggro</li><li data-span="6">Tide Control</li></ul>',
    },
  ],
  Heading: [
    {
      name: "a level apart from its size",
      element: (
        <>
          <Heading level={1} size="hero">
            Odd design
          </Heading>
          <Heading level={3} className="wide" id="recent">
            Recent decks
          </Heading>
        </>
      ),
      markup: '<h1 class="odd-heading" data-size="hero">Odd design</h1><h3 id="recent" class="odd-heading wide">Recent decks</h3>',
    },
  ],
  HoverCard: [
    {
      name: "after the paragraph that holds its link",
      uses: ["HoverCardLink", "Heading", "Muted"],
      element: (
        <HoverCard
          id="preview-midnight"
          className="wide"
          preview={
            <>
              <Heading level={2} size="sm">
                Midnight Control
              </Heading>
              <Muted>by Mira Okafor</Muted>
            </>
          }
        >
          <p>
            Last week’s winner was <HoverCardLink href="/decks/midnight">Midnight Control</HoverCardLink>.
          </p>
        </HoverCard>
      ),
      markup:
        '<p>Last week’s winner was <a interestfor="preview-midnight" class="odd-link" href="/decks/midnight">Midnight Control</a>.</p><div class="odd-hover-card wide" id="preview-midnight" popover="hint"><h2 class="odd-heading" data-size="sm">Midnight Control</h2><p class="odd-muted">by Mira Okafor</p></div>',
    },
  ],
  HoverCardLink: [
    {
      name: "two links to one card, with a generated id",
      uses: ["HoverCard"],
      element: (
        <HoverCard preview="Ember Aggro, by Kai Nakamura">
          <ul>
            <li>
              <HoverCardLink href="/decks/ember">Ember Aggro</HoverCardLink>
            </li>
            <li>
              <HoverCardLink href="/decks/ember/versions" data-testid="versions">
                Ember Aggro versions
              </HoverCardLink>
            </li>
          </ul>
        </HoverCard>
      ),
    },
  ],
  Input: [
    {
      name: "a hint and an error, merged with the caller's description",
      uses: ["Stack"],
      element: (
        <Stack>
          <Input id="email" label="Email" type="email" required hint="We never share it." error="Enter an email address." aria-describedby="email-policy" />
          <p id="email-policy">Read the privacy policy.</p>
        </Stack>
      ),
      markup:
        '<div class="odd-stack"><div class="odd-field"><label class="odd-label" for="email" id="email-label">Email</label><input type="email" required="" aria-describedby="email-policy email-hint email-error" id="email" aria-invalid="true" class="odd-input"/><p class="odd-hint" id="email-hint">We never share it.</p><p class="odd-error" id="email-error">Enter an email address.</p></div><p id="email-policy">Read the privacy policy.</p></div>',
    },
    {
      name: "a hidden label, className on the field, and a generated id",
      element: <Input label="Deck name" hideLabel defaultValue="Ember Aggro" className="wide" />,
    },
    {
      name: "valid, with no hint",
      element: <Input id="title" label="Title" />,
      markup: '<div class="odd-field"><label class="odd-label" for="title" id="title-label">Title</label><input id="title" class="odd-input"/></div>',
    },
  ],
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
  Log: [
    {
      name: "a named log with each kind of line",
      uses: ["LogLine"],
      element: (
        <Log label="Sync log" className="sync">
          <LogLine time="09:14:01">Opened Midnight Control</LogLine>
          <LogLine tone="warning">Warning: 2 cards over the limit</LogLine>
        </Log>
      ),
      markup:
        '<div class="odd-log sync" role="log" aria-label="Sync log" tabindex="0" aria-live="polite" data-owner="react"><div class="odd-log-line"><time>09:14:01</time> Opened Midnight Control</div><div class="odd-log-line" data-tone="warning">Warning: 2 cards over the limit</div></div>',
    },
    {
      name: "a fast log that a screen reader does not read line by line",
      uses: ["LogLine"],
      element: (
        <Log label="Debug log" live="off">
          <LogLine tone="info">Info: cache warmed</LogLine>
        </Log>
      ),
    },
  ],
  LogLine: [
    {
      name: "a line stamped with a Date",
      uses: ["Log"],
      element: (
        <Log label="Sync log">
          <LogLine tone="success" time={new Date("2026-11-02T09:14:01Z")}>
            Synced 60 cards
          </LogLine>
        </Log>
      ),
    },
  ],
  Menu: [
    {
      name: "a trigger, items, a shortcut, a checkbox, a radio group, and a separator",
      uses: ["Button", "MenuItem", "MenuCheckboxItem", "MenuRadioGroup", "MenuRadioItem", "MenuSeparator", "Separator"],
      element: (
        <Menu id="deck-actions" label="Deck actions" trigger={<Button>Deck actions</Button>} className="wide">
          <MenuItem shortcut="Control+D">Duplicate</MenuItem>
          <MenuCheckboxItem defaultChecked>Show prices</MenuCheckboxItem>
          <MenuSeparator />
          <MenuRadioGroup label="Sort by" id="deck-sort">
            <MenuRadioItem defaultChecked>Name</MenuRadioItem>
            <MenuRadioItem>Card count</MenuRadioItem>
          </MenuRadioGroup>
        </Menu>
      ),
      markup:
        '<button class="odd-button" type="button" command="toggle-popover" commandfor="deck-actions" aria-haspopup="menu">Deck actions</button><div id="deck-actions" class="odd-menu wide" popover="auto" role="menu" aria-label="Deck actions"><button aria-keyshortcuts="Control+D" class="odd-menu-item" type="button" role="menuitem">Duplicate<kbd class="odd-menu-shortcut" aria-hidden="true">Ctrl D</kbd></button><button aria-checked="true" class="odd-menu-item" type="button" role="menuitemcheckbox">Show prices</button><hr class="odd-separator"/><p class="odd-menu-label" id="deck-sort-label" aria-hidden="true">Sort by</p><div id="deck-sort" role="group" aria-labelledby="deck-sort-label"><button aria-checked="true" class="odd-menu-item" type="button" role="menuitemradio">Name</button><button aria-checked="false" class="odd-menu-item" type="button" role="menuitemradio">Card count</button></div></div>',
    },
    {
      name: "a generated id",
      uses: ["Button", "MenuItem"],
      element: (
        <Menu label="Row actions" trigger={<Button>Actions</Button>}>
          <MenuItem>Rename</MenuItem>
        </Menu>
      ),
    },
  ],
  MenuCheckboxItem: [
    {
      name: "unchecked, and checked and disabled",
      uses: ["Menu", "Button"],
      element: (
        <Menu id="view-options" label="View options" trigger={<Button>View</Button>}>
          <MenuCheckboxItem>Compact grid</MenuCheckboxItem>
          <MenuCheckboxItem defaultChecked disabled>
            Show prices
          </MenuCheckboxItem>
        </Menu>
      ),
    },
  ],
  MenuGroup: [
    {
      name: "a named group of items",
      uses: ["Menu", "Button", "MenuItem"],
      element: (
        <Menu id="share-menu" label="Share" trigger={<Button>Share</Button>}>
          <MenuGroup label="Copy" id="copy-group" className="copy">
            <MenuItem>Link</MenuItem>
            <MenuItem>Embed code</MenuItem>
          </MenuGroup>
        </Menu>
      ),
      markup:
        '<button class="odd-button" type="button" command="toggle-popover" commandfor="share-menu" aria-haspopup="menu">Share</button><div id="share-menu" class="odd-menu" popover="auto" role="menu" aria-label="Share"><p class="odd-menu-label" id="copy-group-label" aria-hidden="true">Copy</p><div class="copy" id="copy-group" role="group" aria-labelledby="copy-group-label"><button class="odd-menu-item" type="button" role="menuitem">Link</button><button class="odd-menu-item" type="button" role="menuitem">Embed code</button></div></div>',
    },
  ],
  MenuItem: [
    {
      name: "danger, disabled, and a remote command",
      uses: ["Menu", "Button", "Dialog"],
      element: (
        <>
          <Menu id="row-actions" label="Row actions" trigger={<Button>Actions</Button>}>
            <MenuItem disabled shortcut="F2" data-testid="rename">
              Rename
            </MenuItem>
            <MenuItem tone="danger" command="show-modal" commandfor="delete-deck">
              Delete…
            </MenuItem>
          </Menu>
          <Dialog id="delete-deck" title="Delete deck?" />
        </>
      ),
      markup:
        '<button class="odd-button" type="button" command="toggle-popover" commandfor="row-actions" aria-haspopup="menu">Actions</button><div id="row-actions" class="odd-menu" popover="auto" role="menu" aria-label="Row actions"><button data-testid="rename" aria-keyshortcuts="F2" class="odd-menu-item" type="button" role="menuitem" aria-disabled="true">Rename<kbd class="odd-menu-shortcut" aria-hidden="true">F2</kbd></button><button data-tone="danger" command="show-modal" commandfor="delete-deck" class="odd-menu-item" type="button" role="menuitem">Delete…</button></div><dialog id="delete-deck" aria-labelledby="delete-deck-title" class="odd-dialog"><div class="odd-dialog-body"><h2 class="odd-dialog-title" id="delete-deck-title">Delete deck?</h2></div></dialog>',
    },
  ],
  MenuRadioGroup: [
    {
      name: "one radio checked",
      uses: ["Menu", "Button", "MenuRadioItem"],
      element: (
        <Menu id="sort-menu" label="Sort" trigger={<Button>Sort</Button>}>
          <MenuRadioGroup label="Sort by">
            <MenuRadioItem>Name</MenuRadioItem>
            <MenuRadioItem defaultChecked>Last edited</MenuRadioItem>
          </MenuRadioGroup>
        </Menu>
      ),
    },
  ],
  MenuRadioItem: [
    {
      name: "in a radio group",
      uses: ["Menu", "Button", "MenuRadioGroup"],
      element: (
        <Menu id="density-menu" label="Density" trigger={<Button>Density</Button>}>
          <MenuRadioGroup label="Density">
            <MenuRadioItem defaultChecked>Comfortable</MenuRadioItem>
            <MenuRadioItem>Compact</MenuRadioItem>
          </MenuRadioGroup>
        </Menu>
      ),
    },
  ],
  MenuSeparator: [
    {
      name: "between two items",
      uses: ["Menu", "Button", "MenuItem", "Separator"],
      element: (
        <Menu id="file-menu" label="File" trigger={<Button>File</Button>}>
          <MenuItem>Save</MenuItem>
          <MenuSeparator />
          <MenuItem>Close</MenuItem>
        </Menu>
      ),
    },
  ],
  Meter: [
    {
      name: "named, with a tone",
      element: <Meter id="actions" label="Actions" min={0} max={60} value={22} tone="info" />,
      markup:
        '<meter id="actions" min="0" max="60" value="22" class="odd-meter" aria-label="Actions" data-tone="info"></meter>',
    },
  ],
  Muted: [
    {
      name: "a paragraph and a span",
      element: (
        <>
          <Muted>Saved 2 minutes ago</Muted>
          <p>
            Upload finished.{" "}
            <Muted as="span" className="time">
              Just now
            </Muted>
          </p>
        </>
      ),
      markup: '<p class="odd-muted">Saved 2 minutes ago</p><p>Upload finished. <span class="odd-muted time">Just now</span></p>',
    },
  ],
  Popover: [
    {
      name: "a dialog named by its title, with a close button",
      uses: ["Button", "Checkbox", "Stack", "Eyebrow"],
      element: (
        <Popover id="filters" trigger={<Button>Filters</Button>} title="Filter decks" className="wide">
          <Checkbox label="Legal only" />
          <Button command="close">Apply</Button>
        </Popover>
      ),
      markup:
        '<button class="odd-button" type="button" command="toggle-popover" commandfor="filters">Filters</button><div id="filters" class="odd-popover wide" popover="auto" role="dialog" aria-labelledby="filters-title"><div class="odd-stack"><p id="filters-title" class="odd-eyebrow">Filter decks</p><label class="odd-choice"><input type="checkbox"/>Legal only</label><button class="odd-button" type="button" command="hide-popover" commandfor="filters">Apply</button></div></div>',
    },
    {
      name: "text only, with a generated id",
      uses: ["Button", "Stack"],
      element: <Popover trigger={<Button>Rules</Button>}>Banned cards are marked in red.</Popover>,
    },
  ],
  Pre: [
    {
      name: "code, and command output",
      element: (
        <>
          <Pre>bun add odd-design</Pre>
          <Pre output className="wide">
            850 pass
          </Pre>
        </>
      ),
      markup:
        '<pre class="odd-pre"><code>bun add odd-design</code></pre><pre class="odd-pre wide">850 pass</pre>',
    },
  ],
  Progress: [
    {
      name: "indeterminate, with no value",
      element: <Progress id="sync" label="Syncing decks" />,
      markup:
        '<progress id="sync" class="odd-progress" aria-label="Syncing decks"></progress>',
    },
  ],
  RadioGroup: [
    {
      name: "a named group with a starting value and a disabled option",
      element: (
        <RadioGroup
          label="Visibility"
          name="visibility"
          defaultValue="unlisted"
          options={[
            { value: "public", label: "Public" },
            { value: "unlisted", label: "Unlisted" },
            { value: "private", label: "Private", disabled: true },
          ]}
        />
      ),
      markup:
        '<fieldset class="odd-stack"><legend class="odd-label">Visibility</legend><label class="odd-choice"><input type="radio" name="visibility" value="public"/>Public</label><label class="odd-choice"><input type="radio" name="visibility" checked="" value="unlisted"/>Unlisted</label><label class="odd-choice"><input type="radio" disabled="" name="visibility" value="private"/>Private</label></fieldset>',
    },
    {
      name: "a generated name, disabled as a whole",
      element: (
        <RadioGroup
          label="Sort"
          disabled
          options={[
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
          ]}
        />
      ),
    },
  ],
  Row: [
    {
      name: "a named navigation row",
      element: (
        <Row as="nav" aria-label="Sections" className="end">
          <a href="#decks">Decks</a>
          <a href="#cards">Cards</a>
        </Row>
      ),
      markup: '<nav aria-label="Sections" class="odd-row end"><a href="#decks">Decks</a><a href="#cards">Cards</a></nav>',
    },
  ],
  Scope: [
    {
      name: "all three appearance axes",
      element: (
        <Scope chrome="glass" palette="aurora" mode="dark" as="section" aria-label="Preview">
          <p>Its own chrome, palette, and mode.</p>
        </Scope>
      ),
      markup:
        '<section aria-label="Preview" class="odd-scope" data-chrome="glass" data-palette="aurora" data-mode="dark"><p>Its own chrome, palette, and mode.</p></section>',
    },
  ],
  Search: [
    {
      name: "a hidden label, the magnifier, and the input",
      element: <Search id="card-search" label="Search cards" placeholder="Search cards" className="deck-search" />,
      markup:
        '<search class="odd-search deck-search"><label class="odd-visually-hidden" for="card-search">Search cards</label><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="m21 21-4.3-4.3"></path></svg><input placeholder="Search cards" id="card-search" type="search" class="odd-input"/></search>',
    },
    {
      name: "in a form that submits",
      element: <Search id="site-search" label="Search the docs" name="q" onSubmit={() => {}} />,
      markup:
        '<search><form class="odd-search"><label class="odd-visually-hidden" for="site-search">Search the docs</label><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="m21 21-4.3-4.3"></path></svg><input id="site-search" type="search" class="odd-input" name="q"/></form></search>',
    },
  ],
  Segmented: [
    {
      name: "two options under a legend",
      element: (
        <Segmented
          label="View"
          name="view"
          defaultValue="grid"
          className="compact"
          options={[
            { value: "grid", label: "Grid" },
            { value: "list", label: "List" },
          ]}
        />
      ),
      markup:
        '<fieldset class="odd-segmented compact"><legend>View</legend><label><input type="radio" name="view" checked="" value="grid"/>Grid</label><label><input type="radio" name="view" value="list"/>List</label></fieldset>',
    },
  ],
  Select: [
    {
      name: "a starting value and an error",
      element: (
        <Select id="format" label="Format" defaultValue="Extended" error="Pick a format this event allows.">
          <option>Standard</option>
          <option>Extended</option>
        </Select>
      ),
      markup:
        '<div class="odd-field"><label class="odd-label" for="format" id="format-label">Format</label><select id="format" aria-describedby="format-error" aria-invalid="true" class="odd-select"><option>Standard</option><option selected="">Extended</option></select><p class="odd-error" id="format-error">Pick a format this event allows.</p></div>',
    },    {
      name: "a hidden label and a hint",
      element: (
        <Select label="Sort by" hideLabel hint="Applies to every list.">
          <option>Newest</option>
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
          <Separator orientation="vertical" className="tall" />
        </>
      ),
      markup:
        '<hr class="odd-separator"/><hr class="odd-separator tall" aria-orientation="vertical"/>',
    },
  ],
  Sheet: [
    {
      name: "from the start edge, with a form body and a footer",
      uses: ["Button", "Input", "Muted"],
      element: (
        <Sheet
          id="filters"
          side="start"
          trigger={<Button>Filters</Button>}
          title="Filters"
          description="Shown decks match every filter."
          dismissible
          className="wide"
          onSubmit={() => {}}
          actions={
            <Button type="submit" variant="primary">
              Show 12 decks
            </Button>
          }
        >
          <Input id="filters-name" label="Name" />
        </Sheet>
      ),
      markup:
        '<button class="odd-button" type="button" command="show-modal" commandfor="filters">Filters</button><dialog id="filters" aria-labelledby="filters-title" aria-describedby="filters-description" closedby="any" class="odd-sheet wide" data-side="start"><div class="odd-sheet-header"><h2 class="odd-dialog-title" id="filters-title">Filters</h2><button id="filters-close" class="odd-button" data-variant="ghost" data-icon-only="" aria-labelledby="filters-close-tooltip" interestfor="filters-close-tooltip" type="button" command="close" commandfor="filters"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"></path></svg></button><span class="odd-tooltip" id="filters-close-tooltip" popover="hint" role="tooltip">Close</span></div><form class="odd-sheet-body" id="filters-body" method="dialog"><p id="filters-description" class="odd-muted">Shown decks match every filter.</p><div class="odd-field"><label class="odd-label" for="filters-name" id="filters-name-label">Name</label><input id="filters-name" class="odd-input"/></div></form><div class="odd-sheet-footer"><button class="odd-button" data-variant="primary" type="submit" form="filters-body">Show 12 decks</button></div></dialog>',
    },
    {
      name: "a generated id and a close label",
      uses: ["Button"],
      element: (
        <Sheet trigger={<Button>Deck</Button>} title="Deck" closeLabel="Close deck">
          <p>60 cards</p>
        </Sheet>
      ),
    },
  ],
  Shell: [
    {
      name: "a page with a title, a status, actions, and a panel",
      uses: ["Heading", "Badge", "Button", "GridItem"],
      element: (
        <Shell title="Orders" status={<Badge tone="success">Synced</Badge>} actions={<Button>Export</Button>} className="app">
          <GridItem span={8}>Panel</GridItem>
        </Shell>
      ),
      markup:
        '<div class="odd-shell app"><header class="odd-shell-header"><h1 class="odd-heading">Orders</h1><div class="odd-shell-status" role="status"><span class="odd-badge" data-tone="success">Synced</span></div><div class="odd-shell-actions"><button class="odd-button" type="button">Export</button></div></header><main class="odd-shell-main odd-grid"><div data-span="8">Panel</div></main></div>',
    },
    { name: "empty slots and no title", element: <Shell /> },
  ],
  Skeleton: [
    {
      name: "blocks in a busy region",
      uses: ["VisuallyHidden"],
      element: (
        <div aria-busy="true">
          <VisuallyHidden>Loading decks…</VisuallyHidden>
          <Skeleton shape="avatar" />
          <Skeleton className="wide" />
        </div>
      ),
      markup:
        '<div aria-busy="true"><span class="odd-visually-hidden">Loading decks…</span><div class="odd-skeleton" aria-hidden="true" data-shape="avatar"></div><div class="odd-skeleton wide" aria-hidden="true"></div></div>',
    },
  ],
  SkipLink: [
    {
      name: "to the main content",
      element: (
        <>
          <SkipLink href="#main">Skip to content</SkipLink>
          <main id="main">Decks</main>
        </>
      ),
      markup: '<a href="#main" class="odd-skip-link">Skip to content</a><main id="main">Decks</main>',
    },
  ],
  Slider: [
    {
      name: "with its value shown and a hint",
      element: <Slider id="copies" label="Copies per card" min={1} max={4} defaultValue={3} hint="Most formats allow up to 4." showValue formatValue={(value) => `${value} of 4`} />,
      markup:
        '<div class="odd-field"><label class="odd-label" for="copies" id="copies-label">Copies per card</label><input min="1" max="4" id="copies" aria-describedby="copies-hint" type="range" class="odd-slider" value="3"/><output class="odd-stat-value" id="copies-value" for="copies">3 of 4</output><p class="odd-hint" id="copies-hint">Most formats allow up to 4.</p></div>',
    },
    {
      name: "disabled, with a hidden label, an error, and the browser's midpoint shown",
      element: <Slider label="Hand size" hideLabel min={5} max={9} disabled error="Your format locks the hand size." showValue className="wide" />,
    },
  ],
  Spinner: [
    {
      name: "in busy regions, with words beside it and with a label",
      uses: ["Row", "VisuallyHidden"],
      element: (
        <>
          <Row aria-busy="true">
            <Spinner /> Loading projects…
          </Row>
          <Row aria-busy="true">
            <Spinner label="Loading reports…" className="wide" />
          </Row>
        </>
      ),
      markup:
        '<div aria-busy="true" class="odd-row"><span class="odd-spinner" aria-hidden="true"></span> Loading projects…</div><div aria-busy="true" class="odd-row"><span class="odd-spinner wide" aria-hidden="true"></span><span class="odd-visually-hidden">Loading reports…</span></div>',
    },
  ],
  Stack: [
    {
      name: "a named section",
      uses: ["Heading"],
      element: (
        <Stack as="section" aria-labelledby="stack-title" className="narrow">
          <Heading level={2} id="stack-title">
            Settings
          </Heading>
          <p>Choose how decks sort.</p>
        </Stack>
      ),
      markup:
        '<section aria-labelledby="stack-title" class="odd-stack narrow"><h2 id="stack-title" class="odd-heading">Settings</h2><p>Choose how decks sort.</p></section>',
    },
  ],
  StatValue: [
    {
      name: "a share in tabular figures",
      uses: ["Muted"],
      element: (
        <StatValue className="wide">
          24 <Muted as="span">(40%)</Muted>
        </StatValue>
      ),
      markup:
        '<span class="odd-stat-value wide">24 <span class="odd-muted">(40%)</span></span>',
    },
  ],
  Switch: [
    {
      name: "on by default",
      element: <Switch label="Show card art" defaultChecked />,
      markup: '<label class="odd-choice"><input type="checkbox" role="switch" class="odd-switch" checked=""/>Show card art</label>',
    },
  ],
  Table: [
    {
      name: "selectable and sorted in its scroll region, with a disabled row and a footer",
      element: (
        <Table
          id="decks"
          className="wide"
          caption="Your decks"
          rows={[
            { id: "ember", name: "Ember Aggro", cards: 60 },
            { id: "faithful", name: "Old Faithful", cards: 55 },
          ]}
          rowKey={(deck) => deck.id}
          columns={[
            { key: "name", header: "Deck", rowHeader: true, cell: (deck) => deck.name, footer: "2 decks" },
            { key: "cards", header: "Cards", numeric: true, cell: (deck) => deck.cards, footer: 115 },
          ]}
          sortable={["name", "cards"]}
          sort={{ column: "cards", direction: "descending" }}
          selection={{ selected: new Set(["ember"]), onChange: () => {}, label: (deck) => `Select ${deck.name}`, allLabel: "Select all decks", disabled: (deck) => deck.id === "faithful" }}
        />
      ),
      markup:
        '<div role="region" tabindex="0" aria-labelledby="decks-caption" class="odd-table-wrap wide"><table id="decks" class="odd-table"><caption id="decks-caption">Your decks</caption><thead><tr><th scope="col"><input type="checkbox" data-select-all="" aria-label="Select all decks"/></th><th scope="col"><button type="button" class="odd-table-sort">Deck</button></th><th scope="col" data-numeric="" aria-sort="descending"><button type="button" class="odd-table-sort">Cards</button></th></tr></thead><tbody><tr><td><input type="checkbox" aria-label="Select Ember Aggro" checked=""/></td><th scope="row">Ember Aggro</th><td data-numeric="">60</td></tr><tr><td><input type="checkbox" aria-label="Select Old Faithful" disabled=""/></td><th scope="row">Old Faithful</th><td data-numeric="">55</td></tr></tbody><tfoot><tr><td></td><th scope="row">2 decks</th><td data-numeric="">115</td></tr></tfoot></table></div>',
    },
    {
      name: "a hidden caption with no region, no rows, and a generated id",
      element: <Table caption="No decks yet" hideCaption scrollable={false} rows={[] as readonly { id: string }[]} rowKey={(deck) => deck.id} columns={[{ key: "id", header: "Deck", cell: (deck) => deck.id }]} />,
    },
  ],
  Tabs: [
    {
      name: "a tab set that starts on its second tab, with a disabled tab",
      element: (
        <Tabs
          id="deck-tabs"
          className="deck"
          label="Deck view"
          defaultValue="stats"
          tabs={[
            { value: "cards", label: "Cards", content: "60 cards" },
            { value: "stats", label: "Stats", content: "Average cost 2.4" },
            { value: "notes", label: "Notes", content: "Mulligan for an early unit", disabled: true },
          ]}
        />
      ),
      markup:
        '<div id="deck-tabs" class="odd-tabs deck"><div role="tablist" aria-label="Deck view"><button type="button" role="tab" id="deck-tabs-tab-0" aria-controls="deck-tabs-panel-0" aria-selected="false" tabindex="-1">Cards</button><button type="button" role="tab" id="deck-tabs-tab-1" aria-controls="deck-tabs-panel-1" aria-selected="true" tabindex="0">Stats</button><button type="button" role="tab" id="deck-tabs-tab-2" aria-controls="deck-tabs-panel-2" aria-selected="false" tabindex="-1" disabled="">Notes</button></div><div role="tabpanel" id="deck-tabs-panel-0" aria-labelledby="deck-tabs-tab-0" hidden="">60 cards</div><div role="tabpanel" id="deck-tabs-panel-1" aria-labelledby="deck-tabs-tab-1">Average cost 2.4</div><div role="tabpanel" id="deck-tabs-panel-2" aria-labelledby="deck-tabs-tab-2" hidden="">Mulligan for an early unit</div></div>',
    },
    {
      name: "manual and vertical, with a generated id",
      element: (
        <Tabs
          label="Season"
          activation="manual"
          orientation="vertical"
          tabs={[
            { value: "s7", label: "Season 7", content: "Rotation on May 1." },
            { value: "s6", label: "Season 6", content: "Archived results." },
          ]}
        />
      ),
    },
  ],
  TextLink: [
    {
      name: "a link and the current page",
      element: (
        <p>
          Read the <TextLink href="#guide">setup guide</TextLink> or open{" "}
          <TextLink href="#roadmap" current className="nav">
            Roadmap
          </TextLink>
          .
        </p>
      ),
      markup: '<p>Read the <a href="#guide" class="odd-link">setup guide</a> or open <a href="#roadmap" aria-current="page" class="odd-link nav">Roadmap</a>.</p>',
    },
    {
      name: "a new tab, and a tooltip merged into the caller's description",
      uses: ["VisuallyHidden"],
      element: (
        <p id="rules-note">
          See the{" "}
          <TextLink href="https://example.com/rules" newTab tooltip="The official rules, updated monthly" aria-describedby="rules-note" id="rules">
            rules
          </TextLink>
          .
        </p>
      ),
      markup:
        '<p id="rules-note">See the <a aria-describedby="rules-note rules-tooltip" id="rules" href="https://example.com/rules" interestfor="rules-tooltip" target="_blank" rel="noopener" class="odd-link">rules<span class="odd-visually-hidden"> (opens in a new tab)</span></a><span class="odd-tooltip" id="rules-tooltip" popover="hint" role="tooltip">The official rules, updated monthly</span>.</p>',
    },
    {
      name: "a tooltip with a generated id",
      element: (
        <p>
          Read the <TextLink href="#guide" tooltip="Ten minutes, start to finish">setup guide</TextLink>.
        </p>
      ),
    },
  ],
  Textarea: [
    {
      name: "disabled, with a hint",
      element: <Textarea id="notes" label="Notes" hint="Only you see these." disabled />,
      markup:
        '<div class="odd-field"><label class="odd-label" for="notes" id="notes-label">Notes</label><textarea disabled="" id="notes" aria-describedby="notes-hint" class="odd-textarea"></textarea><p class="odd-hint" id="notes-hint">Only you see these.</p></div>',
    },    {
      name: "a hidden label and an error",
      element: <Textarea label="Deck description" hideLabel error="Keep it under 200 characters." />,
    },
  ],
  Toaster: [
    {
      name: "a named region",
      element: <Toaster label="Notifications" />,
      markup:
        '<section class="odd-toaster" popover="manual" aria-label="Notifications"></section>',
    },
  ],
  VisuallyHidden: [
    {
      name: "a rating read as words",
      element: (
        <p>
          <span aria-hidden="true">★★★★☆</span>
          <VisuallyHidden>4 of 5 stars</VisuallyHidden>
        </p>
      ),
      markup: '<p><span aria-hidden="true">★★★★☆</span><span class="odd-visually-hidden">4 of 5 stars</span></p>',
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
      const allowed = new Set([...owned(name), ...(fixture.uses ?? []).flatMap(owned)]);
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

test("no fixture's static markup has a style attribute", () => {
  const styled = entries.flatMap(([name, fixtures]) => fixtures.filter((fixture) => rendered(fixture).querySelector("[style]") !== null).map((fixture) => `${name} ${fixture.name}`));
  expect(styled).toEqual([]);
});
