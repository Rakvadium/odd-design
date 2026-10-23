// expect: none
import { Button } from "odd-design/react";
export const view = (
  <>
    <Button variant="primary" size="sm">Save</Button>
    <Button href="/home" aria-current="page">Home</Button>
    <Button iconOnly aria-label="Close"><svg aria-hidden="true" /></Button>
    <Button iconOnly={false}>Save</Button>
    <Button aria-disabled="true">Save</Button>
  </>
);
