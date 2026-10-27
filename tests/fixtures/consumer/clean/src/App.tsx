import { Alert, AlertTitle, Badge, Button, Choice, Field, Hint, Input, Label, Switch } from "odd-design/react";

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
      <Button variant="primary">Save</Button>
    </>
  );
}
