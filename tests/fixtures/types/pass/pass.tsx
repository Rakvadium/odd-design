import { useRef, type MouseEvent } from "react";
import { Button } from "../../../../src/react/button.tsx";

function save(event: MouseEvent<HTMLButtonElement>): void {
  event.currentTarget.blur();
}

export function Views() {
  const ref = useRef<HTMLButtonElement>(null);
  const flag: boolean = true;
  return (
    <>
      <Button>Save</Button>
      <Button variant="primary" size="lg" onClick={save} ref={ref}>
        Save
      </Button>
      <Button type="submit" aria-disabled="true" aria-busy="true">
        Pay
      </Button>
      <Button type="reset" variant="ghost" size="sm" className="wide">
        Reset
      </Button>
      <Button href="/docs" aria-current="page" interestfor="docs-card">
        Docs
      </Button>
      <Button iconOnly aria-label="Close">
        ×
      </Button>
      <Button iconOnly={flag} aria-labelledby="close-label">
        ×
      </Button>
      <Button command="show-modal" commandfor="settings">
        Settings
      </Button>
      <Button command="--refresh" commandfor="feed">
        Refresh
      </Button>
      <Button data-state="open" data-chrome="bubblegum" data-testid="menu">
        Menu
      </Button>
    </>
  );
}

export const handled = (
  <Button
    onClick={(event) => {
      event.currentTarget.form?.reset();
    }}
  >
    Clear
  </Button>
);

export const tracked = (
  <Button
    href="/docs"
    onClick={(event) => {
      event.currentTarget.relList.add("visited");
    }}
  >
    Docs
  </Button>
);
