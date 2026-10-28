import { Alert, AlertTitle, Avatar, AvatarGroup, Badge, Button, Card, CardFooter, CardLink, Choice, Disclosure, Field, Hint, Input, Label, Meter, Search, Separator, Skeleton, Slider, Switch, Tabs } from "odd-design/react";

export function App() {
  return (
    <>
      <Field>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required aria-describedby="email-hint" />
        <Hint id="email-hint">We never share it.</Hint>
      </Field>
      <Choice>
        <Switch type="checkbox" role="switch" /> Compact grid
      </Choice>
      <Badge tone="success" solid>
        Legal
      </Badge>
      <Alert tone="warning">
        <svg aria-hidden="true" />
        <div>
          <AlertTitle>Rotation is coming</AlertTitle>
          <p>Three decks lose legality on May 1.</p>
        </div>
      </Alert>
      <AvatarGroup role="group" aria-label="Collaborators">
        <Avatar size="sm" role="img" aria-label="Ana Rojas">
          AR
        </Avatar>
      </AvatarGroup>
      <Separator />
      <div aria-busy="true">
        <span className="odd-visually-hidden">Loading decks…</span>
        <Skeleton aria-hidden="true" shape="avatar" />
      </div>
      <Card interactive>
        <h3 className="odd-card-title">
          <CardLink href="/decks/ember">Ember Aggro</CardLink>
        </h3>
        <CardFooter>60 cards</CardFooter>
      </Card>
      <Disclosure name="faq" open>
        <summary>Does it need JavaScript?</summary>
        <div>No.</div>
      </Disclosure>
      <Tabs>
        <div role="tablist" aria-label="Deck view">
          <button role="tab" id="tab-cards" aria-controls="panel-cards" aria-selected="true">
            Cards
          </button>
        </div>
        <div role="tabpanel" id="panel-cards" aria-labelledby="tab-cards">
          60 cards
        </div>
      </Tabs>
      <Search>
        <label className="odd-visually-hidden" htmlFor="card-search">
          Search cards
        </label>
        <svg aria-hidden="true" viewBox="0 0 24 24" />
        <Input type="search" id="card-search" placeholder="Search cards" />
      </Search>
      <Field>
        <Label htmlFor="copies">Copies per card</Label>
        <Slider type="range" id="copies" min={1} max={4} defaultValue={3} />
      </Field>
      <div className="odd-stat">
        <label htmlFor="actions">Actions</label>
        <span className="odd-stat-value">22</span>
        <Meter id="actions" min={0} max={60} value={22} tone="info" />
      </div>
      <Button variant="primary">Save</Button>
    </>
  );
}
