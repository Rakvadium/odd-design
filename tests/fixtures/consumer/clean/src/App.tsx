import { Alert, AlertTitle, Avatar, AvatarGroup, Badge, Button, Card, CardFooter, CardLink, Choice, Disclosure, Field, Hint, Input, Label, Separator, Skeleton, Switch, Tabs } from "odd-design/react";

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
      <Button variant="primary">Save</Button>
    </>
  );
}
