import { Alert, Avatar, AvatarGroup, Badge, Button, Card, CardFooter, CardLink, Disclosure, Input, Meter, Muted, Row, Search, Separator, Skeleton, Slider, Stack, StatValue, Switch, Tabs, Toaster, VisuallyHidden } from "odd-design/react";

export function App() {
  return (
    <>
      <Input label="Email" type="email" required hint="We never share it." />
      <Switch label="Compact grid" />
      <Badge tone="success" solid>
        Legal
      </Badge>
      <Alert tone="warning" icon={<svg />} title="Rotation is coming">
        <p>Three decks lose legality on May 1.</p>
      </Alert>
      <AvatarGroup label="Collaborators">
        <Avatar size="sm" name="Ana Rojas" />
      </AvatarGroup>
      <Separator />
      <Stack aria-busy="true">
        <VisuallyHidden>Loading decks…</VisuallyHidden>
        <Skeleton shape="avatar" />
      </Stack>
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
      <Stack>
        <Row>
          <Muted as="span">Actions</Muted>
          <StatValue>22</StatValue>
        </Row>
        <Meter label="Actions" min={0} max={60} value={22} tone="info" />
      </Stack>
      <Button variant="primary">Save</Button>
      <Toaster label="Notifications" />
    </>
  );
}
