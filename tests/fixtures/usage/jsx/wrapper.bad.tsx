// expect: ODD-BUTTON-007 ODD-BUTTON-007 ODD-BUTTON-008 ODD-BUTTON-013 ODD-BUTTON-002 ODD-BUTTON-003
import { Button } from "odd-design/react";
import { Button as OddButton } from "odd-design/react";
export const view = (
  <>
    <Button disabled>Save</Button>
    <OddButton disabled>Save</OddButton>
    <Button iconOnly><svg aria-hidden="true" /></Button>
    <Button href="#" aria-disabled="true">Home</Button>
    <Button variant="outline">Outline</Button>
    <Button size="md">Medium</Button>
  </>
);
