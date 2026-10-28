import { useRef, useState, type FormEvent, type MouseEvent } from "react";
import { Alert, AlertTitle, type AlertTone } from "../../../../src/react/alert.tsx";
import { Avatar, AvatarGroup, type AvatarSize } from "../../../../src/react/avatar.tsx";
import { Badge, type BadgeTone } from "../../../../src/react/badge.tsx";
import { Button } from "../../../../src/react/button.tsx";
import { Card, CardFooter, CardLink } from "../../../../src/react/card.tsx";
import { Choice, Segmented, Switch } from "../../../../src/react/choice.tsx";
import { Dialog, DialogActions } from "../../../../src/react/dialog.tsx";
import { Disclosure } from "../../../../src/react/disclosure.tsx";
import { Field, FieldError, Hint, Input, Label, Select, Textarea } from "../../../../src/react/field.tsx";
import { Menu, MenuItem } from "../../../../src/react/menu.tsx";
import { Table, TableSort, TableWrap } from "../../../../src/react/table.tsx";
import { Meter, Progress, type MeterTone } from "../../../../src/react/meter.tsx";
import { Popover } from "../../../../src/react/popover.tsx";
import { Search } from "../../../../src/react/search.tsx";
import { Separator } from "../../../../src/react/separator.tsx";
import { Sheet, SheetFooter, SheetHeader, type SheetProps } from "../../../../src/react/sheet.tsx";
import { Skeleton } from "../../../../src/react/skeleton.tsx";
import { Slider } from "../../../../src/react/slider.tsx";
import { Tabs } from "../../../../src/react/tabs.tsx";
import { Toaster } from "../../../../src/react/toast.tsx";

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
      <Button type="submit" aria-disabled="true" aria-busy="true">
        Pay
      </Button>
      <Button type="reset" variant="ghost" size="sm" className="wide">
        Reset
      </Button>
      <Button href="/docs" aria-current="page" interestfor="docs-card">
        Docs
      </Button>
      <Button iconOnly aria-label="Close">
        ×
      </Button>
      <Button iconOnly={flag} aria-labelledby="close-label">
        ×
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
      <Field className="wide">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          ref={ref}
          type="email"
          required
          aria-invalid={error !== undefined}
          aria-describedby={error === undefined ? "email-hint" : "email-hint email-error"}
        />
        <Hint id="email-hint">We never share it.</Hint>
        {error === undefined ? null : <FieldError id="email-error">{error}</FieldError>}
      </Field>
      <Input id="owner" value="you" disabled readOnly />
      <Textarea id="notes" rows={4} disabled />
      <Select id="format" defaultValue="standard" disabled>
        <option value="standard">Standard</option>
      </Select>
      <Input type="search" aria-label="Search cards" />
    </>
  );
}

export function Choices({ on, toggle }: { on: boolean; toggle: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <Choice className="wide">
        <input type="checkbox" defaultChecked disabled /> Partner offers
      </Choice>
      <Choice>
        <input type="radio" name="vis" value="public" /> Public
      </Choice>
      <Choice>
        <Switch type="checkbox" role="switch" ref={ref} checked={on} onChange={toggle} disabled /> Compact grid
      </Choice>
      <Switch type="checkbox" role="switch" defaultChecked aria-label="Public" />
      <Segmented disabled>
        <legend>View</legend>
        <label>
          <input type="radio" name="view" defaultChecked /> Grid
        </label>
      </Segmented>
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
  return (
    <Search id="card-filter" className="filter" data-testid="card-filter" data-state="idle">
      <label className="odd-visually-hidden" htmlFor="card-filter-q">
        Filter cards
      </label>
      <svg aria-hidden="true" viewBox="0 0 24 24" />
      <Input type="search" id="card-filter-q" value={query} onChange={(event) => setQuery(event.target.value)} />
    </Search>
  );
}

export function SiteSearch({ onSearch }: { onSearch: (query: string) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(String(new FormData(event.currentTarget).get("q")));
  };
  return (
    <form action="/search" onSubmit={submit}>
      <Search>
        <label className="odd-visually-hidden" htmlFor="site-search">
          Search the docs
        </label>
        <svg aria-hidden="true" viewBox="0 0 24 24" />
        <Input type="search" id="site-search" name="q" />
      </Search>
    </form>
  );
}

export function CopiesField() {
  const [copies, setCopies] = useState(3);
  return (
    <Field>
      <Label htmlFor="copies">Copies per card</Label>
      <output className="odd-stat-value" htmlFor="copies">
        {copies} of 4
      </output>
      <Slider
        type="range"
        id="copies"
        min={1}
        max={4}
        value={copies}
        onChange={(event) => setCopies(event.currentTarget.valueAsNumber)}
        aria-describedby="copies-hint"
      />
      <Hint id="copies-hint">Most formats allow up to 4.</Hint>
    </Field>
  );
}

const typeTone: Record<"unit" | "action" | "asset", MeterTone | undefined> = { unit: undefined, action: "info", asset: "success" };

export function DeckMix({ count, syncing }: { count: number; syncing: boolean }) {
  return (
    <>
      <div className="odd-stat">
        <label htmlFor="actions">Actions</label>
        <span className="odd-stat-value">{count}</span>
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
      <Button commandfor="filters" command="toggle-popover">{open ? "Hide filters" : "Filters"}</Button>
      <Popover ref={panel} id="filters" popover="auto" role="dialog" aria-labelledby="filters-title" onToggle={(event) => setOpen(event.newState === "open")} className="filters" data-testid="filters" data-state="open">
        <p className="odd-eyebrow" id="filters-title">Filter decks</p>
      </Popover>
      <Popover id="notes" popover="auto" role="dialog" aria-label={label} />
      <Popover id="rules" popover="">Banned cards are marked.</Popover>
    </>
  );
}

export function DeleteDeck({ title, onDelete }: { title: string; onDelete: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <Button variant="danger" commandfor="delete-deck" command="show-modal">Delete deck…</Button>
      <Dialog ref={dialog} id="delete-deck" aria-labelledby="delete-deck-title" closedby="any" onClose={() => dialog.current?.returnValue === "delete" && onDelete()} className="wide" data-testid="delete" data-side="end">
        <form className="odd-dialog-body" method="dialog">
          <h2 className="odd-dialog-title" id="delete-deck-title">{title}</h2>
          <DialogActions>
            <Button commandfor="delete-deck" command="request-close">Close</Button>
            <Button type="submit" value="delete" variant="danger">Delete</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog role="alertdialog" aria-label={title} closedby="closerequest" onCancel={(event) => event.preventDefault()}>
        <div className="odd-dialog-body">
          <DialogActions data-testid="actions" />
        </div>
      </Dialog>
    </>
  );
}

export function FilterSheet({ side, onApply }: { side: SheetProps["side"]; onApply: () => void }) {
  const sheet = useRef<HTMLDialogElement>(null);
  return (
    <>
      <Button commandfor="filters" command="show-modal">Filters</Button>
      <Sheet ref={sheet} id="filters" side={side} aria-labelledby="filters-title" closedby="any" onClose={() => sheet.current?.returnValue === "apply" && onApply()} className="wide" data-testid="filters" data-state="open">
        <SheetHeader>
          <h2 className="odd-dialog-title" id="filters-title">Filters</h2>
          <Button variant="ghost" iconOnly aria-label="Close" commandfor="filters" command="close">×</Button>
        </SheetHeader>
        <form className="odd-sheet-body" id="filters-form" method="dialog" />
        <SheetFooter data-testid="footer">
          <Button type="submit" form="filters-form" value="apply" variant="primary">Show 12 decks</Button>
        </SheetFooter>
      </Sheet>
      <Sheet side="bottom" role="alertdialog" aria-label="Discard changes?" closedby="closerequest" onCancel={(event) => event.preventDefault()} />
    </>
  );
}

export function DeckMenu({ label, onRename }: { label: string; onRename: () => void }) {
  const menu = useRef<HTMLDivElement>(null);
  return (
    <>
      <Button id="deck-actions-trigger" commandfor="deck-actions" command="toggle-popover" aria-haspopup="menu">Deck actions</Button>
      <Menu ref={menu} id="deck-actions" popover="auto" role="menu" aria-labelledby="deck-actions-trigger" className="wide" data-testid="actions">
        <MenuItem role="menuitem" onClick={onRename}>Rename</MenuItem>
        <MenuItem role="menuitem" aria-disabled="true">Merge</MenuItem>
        <Separator />
        <MenuItem role="menuitemcheckbox" aria-checked="true" onClick={(event) => event.currentTarget.getAttribute("aria-checked") === "true"}>Show prices</MenuItem>
        <div role="group" aria-label="Sort by">
          <MenuItem role="menuitemradio" aria-checked="false" data-testid="sort-name">Name</MenuItem>
        </div>
        <MenuItem role="menuitem" tone="danger" onClick={() => menu.current?.hidePopover()}>Delete deck</MenuItem>
      </Menu>
      <Menu popover="" role="menu" aria-label={label} />
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
