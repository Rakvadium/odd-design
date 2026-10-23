// expect: ODD-STATIC-001 ODD-STATIC-001 ODD-BUTTON-013 ODD-STATIC-001 ODD-BUTTON-002 ODD-BUTTON-007 ODD-BUTTON-008 ODD-STATIC-001
import { Button } from "odd-design/react";
export const view = (url: string | undefined) => (
  <>
    <Button href={url} aria-disabled="true">Home</Button>
    <Button href={url} aria-current="page">Home</Button>
    <Button href={undefined} aria-disabled="true">Save</Button>
    <Button href="/home" aria-disabled="true">Home</Button>
    <Button href={url} variant="outline" disabled>Save</Button>
    <Button href={url} iconOnly><svg aria-hidden="true" /></Button>
  </>
);
