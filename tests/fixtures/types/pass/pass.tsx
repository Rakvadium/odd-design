import { useRef, useState, type FormEvent, type MouseEvent } from "react";
import { Alert, AlertTitle, type AlertTone } from "../../../../src/react/alert.tsx";
import { Avatar, AvatarGroup, type AvatarSize } from "../../../../src/react/avatar.tsx";
import { Badge, type BadgeTone } from "../../../../src/react/badge.tsx";
import { Breadcrumb } from "../../../../src/react/breadcrumb.tsx";
import { Button } from "../../../../src/react/button.tsx";
import { Card, CardFooter, CardLink } from "../../../../src/react/card.tsx";
import { Code, Pre } from "../../../../src/react/code.tsx";
import { Combobox, ComboboxOption, type ComboboxFilter } from "../../../../src/react/combobox.tsx";
import { AlertDialog, Dialog } from "../../../../src/react/dialog.tsx";
import { Disclosure } from "../../../../src/react/disclosure.tsx";
import { Checkbox, Input, RadioGroup, Segmented, Select, Switch, Textarea, type ChoiceOption } from "../../../../src/react/field.tsx";
import { Kbd } from "../../../../src/react/kbd.tsx";
import { Grid, GridItem, Row, Scope, SkipLink, Stack, VisuallyHidden, type GridSpan } from "../../../../src/react/layout.tsx";
import { Menu, MenuCheckboxItem, MenuGroup, MenuItem, MenuRadioGroup, MenuRadioItem, MenuSeparator } from "../../../../src/react/menu.tsx";
import { Table, TableSort, TableWrap } from "../../../../src/react/table.tsx";
import { Meter, Progress, type MeterTone } from "../../../../src/react/meter.tsx";
import { Popover } from "../../../../src/react/popover.tsx";
import { Search } from "../../../../src/react/search.tsx";
import { Separator } from "../../../../src/react/separator.tsx";
import { Sheet, type SheetSide } from "../../../../src/react/sheet.tsx";
import { Skeleton } from "../../../../src/react/skeleton.tsx";
import { Slider } from "../../../../src/react/slider.tsx";
import { Spinner } from "../../../../src/react/spinner.tsx";
import { Tabs } from "../../../../src/react/tabs.tsx";
import { TextLink } from "../../../../src/react/text-link.tsx";
import { Toaster } from "../../../../src/react/toast.tsx";
import { Eyebrow, Heading, Muted, type HeadingSize } from "../../../../src/react/typography.tsx";

function save(event: MouseEvent<HTMLButtonElement>): void {
  event.currentTarget.blur();
}

export function Views() {
  const ref = useRef<HTMLButtonElement>(null);
  const flag: boolean = true;
  return (
    <>
      <Button>Save</Button>
      <Button variant="primary" size="lg" onClick={save} ref={ref}>
        Save
      </Button>
      <Button type="submit" disabled busy={flag}>
        Pay
      </Button>
      <Button type="reset" variant="ghost" size="sm" className="wide">
        Reset
      </Button>
      <Button href="/docs" current={flag} newTab tooltip="The full guide">
        Docs
      </Button>
      <Button iconOnly label="Close" id="close">
        ×
      </Button>
      <Button tooltip="Anyone with the link can view it" aria-describedby="publish-note" aria-expanded={flag}>
        Publish
      </Button>
      <Button command="show-modal" commandfor="settings">
        Settings
      </Button>
      <Button command="--refresh" commandfor="feed">
        Refresh
      </Button>
      <Button data-state="open" data-chrome="bubblegum" data-testid="menu">
        Menu
      </Button>
    </>
  );
}

export function Fields({ error }: { error: string | undefined }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <Input label="Email" ref={ref} type="email" required hint="We never share it." error={error} aria-describedby="email-policy" className="wide" />
      <Input label="Owner" id="owner" value="you" disabled readOnly />
      <Input label="Search cards" hideLabel type="search" />
      <Textarea label="Notes" id="notes" rows={4} disabled hint={<a href="#markdown">Markdown</a>} />
      <Select label="Format" defaultValue="standard" disabled onChange={(event) => event.currentTarget.value}>
        <option value="standard">Standard</option>
      </Select>
    </>
  );
}

type View = "grid" | "list";

const VIEWS: readonly [ChoiceOption<View>, ...ChoiceOption<View>[]] = [
  { value: "grid", label: "Grid" },
  { value: "list", label: "List", disabled: true },
];

export function Choices({ on, toggle, view, setView }: { on: boolean; toggle: () => void; view: View; setView: (view: View) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <Checkbox label="Partner offers" defaultChecked disabled className="wide" />
      <Checkbox label={<>I accept the <a href="#rules">rules</a></>} name="rules" required />
      <Switch label="Compact grid" ref={ref} checked={on} onChange={toggle} disabled />
      <RadioGroup label="Visibility" name="vis" defaultValue="public" required options={[{ value: "public", label: "Public" }, { value: "private", label: "Private" }]} onValueChange={(value) => value === "public"} />
      <Segmented label="View" options={VIEWS} defaultValue={view} onValueChange={setView} disabled />
    </>
  );
}

const statusTone: Record<"draft" | "legal" | "banned", BadgeTone> = { draft: "neutral", legal: "success", banned: "danger" };

const noticeTone: Record<"saved" | "offline", AlertTone> = { saved: "success", offline: "danger" };

export function Notice({ kind }: { kind: keyof typeof noticeTone }) {
  return (
    <Alert tone={noticeTone[kind]}>
      <svg aria-hidden="true" />
      <div>
        <AlertTitle>{kind}</AlertTitle>
        <p>Kept on this device.</p>
      </div>
    </Alert>
  );
}

export function StatusBadge({ status, urgent }: { status: keyof typeof statusTone; urgent: boolean }) {
  return (
    <Badge tone={statusTone[status]} solid={urgent}>
      {status}
    </Badge>
  );
}

export const handled = (
  <Button
    onClick={(event) => {
      event.currentTarget.form?.reset();
    }}
  >
    Clear
  </Button>
);

export const tracked = (
  <Button
    href="/docs"
    onClick={(event) => {
      event.currentTarget.relList.add("visited");
    }}
  >
    Docs
  </Button>
);

type Person = { name: string; initials: string; photo?: string };

const avatarSize: Record<"row" | "profile", AvatarSize> = { row: "sm", profile: "lg" };

export function PersonAvatar({ person, place }: { person: Person; place: keyof typeof avatarSize }) {
  const [failed, setFailed] = useState(false);
  if (person.photo === undefined || failed) {
    return (
      <Avatar size={avatarSize[place]} role="img" aria-label={person.name}>
        {person.initials}
      </Avatar>
    );
  }
  return (
    <Avatar size={avatarSize[place]}>
      <img src={person.photo} alt={person.name} onError={() => setFailed(true)} />
    </Avatar>
  );
}

export function Collaborators({ people }: { people: Person[] }) {
  return (
    <>
      <h3 id="collaborators">Collaborators</h3>
      <AvatarGroup role="group" aria-labelledby="collaborators">
        {people.map((person) => (
          <PersonAvatar key={person.name} person={person} place="row" />
        ))}
      </AvatarGroup>
      <Avatar aria-hidden="true">{people[0]?.initials}</Avatar>
    </>
  );
}

export function DeckActions() {
  return (
    <>
      <Separator />
      <div className="odd-row">
        <a href="/decks/1/edit">Edit</a>
        <Separator aria-orientation="vertical" />
        <a href="/decks/1/export">Export</a>
      </div>
      <Separator role="separator" data-testid="split" />
    </>
  );
}

export function DeckPlaceholder({ loading }: { loading: boolean }) {
  if (!loading) return null;
  return (
    <div aria-busy="true">
      <span className="odd-visually-hidden">Loading decks…</span>
      <Skeleton aria-hidden="true" shape="avatar" />
      <Skeleton aria-hidden="true" className="title" style={{ inlineSize: "60%" }} data-testid="deck-title" />
    </div>
  );
}

export function ProjectLinks({ href }: { href: string }) {
  return (
    <p>
      Read the <TextLink href={href}>setup guide</TextLink>, then open <TextLink href="/projects" aria-current="page">Projects</TextLink> or the{" "}
      <TextLink href="https://example.com/changelog" target="_blank" rel="noopener" className="external" data-testid="changelog">
        changelog (opens in a new tab)
      </TextLink>
      .
    </p>
  );
}

export function ProjectsLoading({ loading }: { loading: boolean }) {
  if (!loading) return null;
  return (
    <div className="odd-row" aria-busy="true">
      <Spinner aria-hidden="true" className="slow" data-testid="projects-spinner" />
      <span className="odd-visually-hidden">Loading projects…</span>
    </div>
  );
}

export function ProjectTrail({ archived }: { archived: boolean }) {
  return (
    <Breadcrumb aria-label="Breadcrumb" className="trail" data-testid="trail">
      <ol>
        <li>
          <TextLink href="/">Home</TextLink>
        </li>
        {archived ? <li>Archived</li> : null}
        <li>
          <TextLink href="/projects/roadmap" aria-current="page">
            Roadmap
          </TextLink>
        </li>
      </ol>
    </Breadcrumb>
  );
}

export function SearchHint() {
  return (
    <>
      <h2 id="trail-heading">You are here</h2>
      <Breadcrumb aria-labelledby="trail-heading">
        <ol>
          <li>Home</li>
        </ol>
      </Breadcrumb>
      <p>
        Press <Kbd>Ctrl</Kbd> <Kbd className="wide" data-testid="search-key">K</Kbd> to search, or set <Code data-testid="token">--primary</Code> on the scope.
      </p>
      <Pre data-language="sh" className="install">
        <code>bun add odd-design</code>
      </Pre>
    </>
  );
}

export function DeckCard({ href, name, selected }: { href: string; name: string; selected: boolean }) {
  return (
    <Card interactive={selected} aria-labelledby="deck-name" className="deck" data-span="4" data-testid="deck">
      <h2 className="odd-card-title" id="deck-name">
        <CardLink href={href}>{name}</CardLink>
      </h2>
      <CardFooter>
        <Badge tone="success">Legal</Badge>
      </CardFooter>
    </Card>
  );
}

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Disclosure name="faq" open={open} onToggle={(event) => setOpen(event.newState === "open")} className="faq" data-testid="faq" data-state="open">
      <summary>{question}</summary>
      <div>{answer}</div>
    </Disclosure>
  );
}

export function SeasonTabs() {
  const tabs = useRef<HTMLDivElement>(null);
  return (
    <Tabs ref={tabs} id="season-tabs" className="seasons" data-testid="seasons" data-state="ready">
      <div role="tablist" aria-label="Season" aria-orientation="vertical" data-activation="manual">
        <button role="tab" id="tab-s7" aria-controls="panel-s7" aria-selected="true">
          Season 7
        </button>
        <button role="tab" id="tab-s5" aria-controls="panel-s5" aria-selected="false" disabled>
          Season 5
        </button>
      </div>
      <div role="tabpanel" id="panel-s7" aria-labelledby="tab-s7">
        Current season.
      </div>
      <div role="tabpanel" id="panel-s5" aria-labelledby="tab-s5" hidden>
        Not imported yet.
      </div>
    </Tabs>
  );
}

export function Toasts() {
  const region = useRef<HTMLElement>(null);
  return <Toaster ref={region} id="toasts" className="toasts" popover="manual" aria-label="Notifications" />;
}

export function CardFilter() {
  const [query, setQuery] = useState("");
  return <Search id="card-filter" label="Filter cards" className="filter" data-testid="card-filter" data-state="idle" value={query} onChange={(event) => setQuery(event.target.value)} />;
}

export function SiteSearch({ onSearch }: { onSearch: (query: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(String(new FormData(event.currentTarget).get("q")));
  };
  return <Search label="Search the docs" name="q" ref={ref} onSubmit={submit} />;
}

export function CopiesField() {
  const [copies, setCopies] = useState(3);
  return (
    <Slider
      label="Copies per card"
      min={1}
      max={4}
      value={copies}
      onChange={(event) => setCopies(event.currentTarget.valueAsNumber)}
      hint="Most formats allow up to 4."
      showValue
      formatValue={(value) => `${value} of 4`}
    />
  );
}

const typeTone: Record<"unit" | "action" | "asset", MeterTone | undefined> = { unit: undefined, action: "info", asset: "success" };

export function DeckMix({ count, syncing }: { count: number; syncing: boolean }) {
  return (
    <>
      <div className="odd-stack">
        <div className="odd-row">
          <label className="odd-muted" htmlFor="actions">
            Actions
          </label>
          <span className="odd-stat-value">{count}</span>
        </div>
        <Meter id="actions" min={0} max={60} value={count} tone={typeTone.action} />
      </div>
      <Meter id="store-high" value={0.93} low={0.6} high={0.85} optimum={0} aria-label="Storage" />
      {syncing ? <Progress id="sync" aria-label="Syncing decks" /> : <Progress id="import" value={40} max={100} tone="success" aria-label="Importing decks" />}
    </>
  );
}

export function DeckFilters({ label }: { label: string }) {
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Popover ref={panel} id="filters" trigger={<Button>{open ? "Hide filters" : "Filters"}</Button>} title="Filter decks" onToggle={(event) => setOpen(event.newState === "open")} className="filters" data-testid="filters" data-state="open">
        <Checkbox label="Legal only" />
        <Button command="close">Apply</Button>
      </Popover>
      <Popover trigger={<Button>Notes</Button>} title={label}>
        Saved with the deck.
      </Popover>
      <Popover trigger={<Button>Rules</Button>}>Banned cards are marked.</Popover>
    </>
  );
}

export function DeleteDeck({ title, onDelete }: { title: string; onDelete: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <Dialog
        ref={dialog}
        id="delete-deck"
        trigger={<Button variant="danger">Delete deck…</Button>}
        title={title}
        headingLevel={3}
        description="This removes its 14 saved versions."
        dismissible
        onClose={() => dialog.current?.returnValue === "delete" && onDelete()}
        onSubmit={(event: FormEvent<HTMLFormElement>) => event.currentTarget.reportValidity()}
        className="wide"
        data-testid="delete"
        data-state="open"
        actions={
          <>
            <Button command="request-close">Close</Button>
            <Button type="submit" value="delete" variant="danger">Delete</Button>
          </>
        }
      />
      <AlertDialog title={title} description="Your edits are lost." onCancel={(event) => event.preventDefault()} actions={<Button command="close">Keep editing</Button>} />
      <Button command="show-modal" commandfor="delete-deck">Delete from the menu</Button>
    </>
  );
}

export function FilterSheet({ side, onApply }: { side: SheetSide | undefined; onApply: () => void }) {
  const sheet = useRef<HTMLDialogElement>(null);
  return (
    <Sheet
      ref={sheet}
      id="filters"
      side={side}
      trigger={<Button>Filters</Button>}
      title="Filters"
      closeLabel="Close filters"
      dismissible
      onClose={() => sheet.current?.returnValue === "apply" && onApply()}
      onSubmit={() => {}}
      className="wide"
      data-testid="filters"
      data-state="open"
      actions={<Button type="submit" value="apply" variant="primary">Show 12 decks</Button>}
    >
      <Input label="Name" />
    </Sheet>
  );
}

export function DeckMenu({ label, onRename, onPrices }: { label: string; onRename: () => void; onPrices: (on: boolean) => void }) {
  const menu = useRef<HTMLDivElement>(null);
  return (
    <>
      <Menu ref={menu} id="deck-actions" label={label} trigger={<Button iconOnly label={label}>⋯</Button>} className="wide" data-testid="actions" data-state="open">
        <MenuItem shortcut="F2" onClick={onRename}>Rename</MenuItem>
        <MenuItem disabled>Merge</MenuItem>
        <MenuSeparator />
        <MenuCheckboxItem defaultChecked onClick={(event) => onPrices(event.currentTarget.getAttribute("aria-checked") === "true")}>Show prices</MenuCheckboxItem>
        <MenuRadioGroup label="Sort by" id="deck-sort">
          <MenuRadioItem defaultChecked data-testid="sort-name">Name</MenuRadioItem>
          <MenuRadioItem>Last edited</MenuRadioItem>
        </MenuRadioGroup>
        <MenuGroup label="Danger zone">
          <MenuItem tone="danger" command="show-modal" commandfor="delete-deck">Delete deck…</MenuItem>
        </MenuGroup>
      </Menu>
      <Menu label="Sort" trigger={<Button>Sort</Button>}>
        <MenuItem onClick={() => menu.current?.hidePopover()}>Close the other menu</MenuItem>
      </Menu>
    </>
  );
}

export function DeckTable({ decks }: { decks: readonly { id: string; name: string; cards: number }[] }) {
  const table = useRef<HTMLTableElement>(null);
  const [selected, setSelected] = useState<readonly string[]>([]);
  return (
    <>
      <TableWrap tabIndex={0} role="region" aria-labelledby="decks-caption" className="wide" data-testid="decks">
        <Table ref={table} data-testid="table">
          <caption id="decks-caption">Your decks</caption>
          <thead>
            <tr>
              <th scope="col">
                <input type="checkbox" data-select-all aria-label="Select all decks" />
              </th>
              <th scope="col" aria-sort="ascending">
                <TableSort type="button" onClick={() => table.current?.focus()} data-col="name">Deck</TableSort>
              </th>
              <th scope="col" data-numeric>
                <TableSort>Cards</TableSort>
              </th>
            </tr>
          </thead>
          <tbody>
            {decks.map((deck) => (
              <tr key={deck.id}>
                <td>
                  <input type="checkbox" aria-label={`Select ${deck.name}`} checked={selected.includes(deck.id)} onChange={() => setSelected((ids) => (ids.includes(deck.id) ? ids.filter((id) => id !== deck.id) : [...ids, deck.id]))} />
                </td>
                <th scope="row">{deck.name}</th>
                <td data-numeric>{deck.cards}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
      <TableWrap>
        <Table>
          <tbody />
        </Table>
      </TableWrap>
      <TableWrap tabIndex={0} role="region" aria-label="Archived decks" />
    </>
  );
}

export function CityField({ filter }: { filter: ComboboxFilter | undefined }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <Combobox id="city" label="City" name="city" ref={input} filter={filter} className="wide" data-testid="city" hint="Type to filter.">
      <ComboboxOption>Amsterdam</ComboboxOption>
      <ComboboxOption disabled>Atlantis</ComboboxOption>
      <ComboboxOption disabled={false} data-id="ber">
        Berlin
      </ComboboxOption>
    </Combobox>
  );
}

export function AssigneeField({ people, onAssign }: { people: readonly { id: string; name: string }[]; onAssign: (id: string) => void }) {
  const [query, setQuery] = useState("");
  return (
    <Combobox label="Assignee" filter="manual" value={query} onChange={(event) => setQuery(event.target.value)}>
      {people.map((person) => (
        <ComboboxOption key={person.id} onClick={() => onAssign(person.id)}>
          {person.name}
        </ComboboxOption>
      ))}
      {query !== "" && people.length === 0 && <ComboboxOption disabled>No results</ComboboxOption>}
    </Combobox>
  );
}

export function Page({ span, size }: { span: GridSpan; size: HeadingSize }) {
  return (
    <>
      <SkipLink href="#main" className="skip">
        Skip to content
      </SkipLink>
      <Grid as="main" id="main" aria-label="Board">
        <GridItem as="section" span={span} aria-labelledby="queue-title" data-testid="queue">
          <Stack>
            <Eyebrow tone="primary">Today</Eyebrow>
            <Heading level={2} size={size} id="queue-title">
              Queue
            </Heading>
            <Muted as="span">Updated just now</Muted>
          </Stack>
        </GridItem>
        <GridItem>
          <Row as="nav" aria-label="Sections">
            <a href="#queue-title">Queue</a>
          </Row>
        </GridItem>
      </Grid>
      <Scope chrome="glass" palette="aurora" mode="dark" as="aside">
        <VisuallyHidden as="p">4 of 5 stars</VisuallyHidden>
      </Scope>
    </>
  );
}
