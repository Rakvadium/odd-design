// expect: ODD-STATIC-001 ODD-STATIC-001 ODD-BUTTON-013
import { Button } from "odd-design/react";
export const view = (url: string | undefined) => (
  <>
    <Button href={url} aria-disabled="true">Home</Button>
    <Button href={url} aria-current="page">Home</Button>
    <Button href={undefined} aria-disabled="true">Save</Button>
    <Button href="/home" aria-disabled="true">Home</Button>
  </>
);
