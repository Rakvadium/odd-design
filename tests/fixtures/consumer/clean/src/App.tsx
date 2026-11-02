import { Alert, AlertTitle, Avatar, AvatarGroup, Badge, Button, Card, CardFooter, CardLink, Disclosure, Input, Meter, Search, Separator, Skeleton, Slider, Switch, Tabs, Toaster } from "odd-design/react";

export function App() {
  return (
    <>
      <Input label="Email" type="email" required hint="We never share it." />
      <Switch label="Compact grid" />
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
      <Disclosure name="faq" summary="Does it need JavaScript?" defaultOpen>
        No.
      </Disclosure>
      <Tabs
        label="Deck view"
        tabs={[
          { value: "cards", label: "Cards", content: "60 cards" },
          { value: "stats", label: "Stats", content: "Average cost 2.4" },
        ]}
      />
      <Search label="Search cards" placeholder="Search cards" />
      <Slider label="Copies per card" min={1} max={4} defaultValue={3} showValue />
      <div className="odd-stack">
        <div className="odd-row">
          <label className="odd-muted" htmlFor="actions">
            Actions
          </label>
          <span className="odd-stat-value">22</span>
        </div>
        <Meter id="actions" min={0} max={60} value={22} tone="info" />
      </div>
      <Button variant="primary">Save</Button>
      <Toaster popover="manual" aria-label="Notifications" />
    </>
  );
}
