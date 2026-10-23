// expect: ODD-BUTTON-002
import { Button } from "odd-design/react";
export const view = (
  <>
    <Button data-variant="nope">Save</Button>
    <Button data-size="md">Save</Button>
    <Button data-icon-only><svg aria-hidden="true" /></Button>
    <button className="odd-button" data-variant="nope">Save</button>
  </>
);
