import { useRef, useState, type MouseEvent } from "react";
import { Alert, AlertTitle, type AlertTone } from "../../../../src/react/alert.tsx";
import { Avatar, AvatarGroup, type AvatarSize } from "../../../../src/react/avatar.tsx";
import { Badge, type BadgeTone } from "../../../../src/react/badge.tsx";
import { Button } from "../../../../src/react/button.tsx";
import { Card, CardFooter, CardLink } from "../../../../src/react/card.tsx";
import { Choice, Segmented, Switch } from "../../../../src/react/choice.tsx";
import { Disclosure } from "../../../../src/react/disclosure.tsx";
import { Field, FieldError, Hint, Input, Label, Select, Textarea } from "../../../../src/react/field.tsx";
import { Separator } from "../../../../src/react/separator.tsx";
import { Skeleton } from "../../../../src/react/skeleton.tsx";

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
