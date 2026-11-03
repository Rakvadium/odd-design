import { Button, Dialog as OddDialog } from "odd-design/react";
import { icon, mirrored } from "../story.ts";
import { opened } from "../opened.ts";

const meta = {
  title: "Components/Surfaces",
  parameters: {
    docs: {
      description: {
        component:
          "`Dialog` from `odd-design/react` renders a native `dialog.odd-dialog` and the `trigger` that opens it. It writes the title as `h2.odd-dialog-title` and names the dialog by it, puts the `description` and the children in `div.odd-dialog-body`, and the `actions` in `div.odd-dialog-actions`. The trigger gets `command=\"show-modal\"` and `commandfor`, and a `Button` with `command=\"close\"` in the actions closes the dialog, so no JS is needed. `showModal()` traps focus, closes on Escape, makes the page behind it inert, and returns focus when it closes. `dismissible` adds closing by clicking outside. Focus starts on the first button, so put the safe choice first. It animates with `@starting-style`.",
      },
    },
  },
};

export default meta;

function confirm() {
  return (
    <OddDialog
      id="confirm-delete"
      trigger={
        <Button variant="danger">
          {icon("trash")} Delete deck…
        </Button>
      }
      title="Delete “Midnight Control”?"
      description="This removes the deck and its 14 saved versions. You can’t undo this."
      dismissible
      actions={
        <>
          <Button command="close">Close</Button>
          <Button variant="danger" command="close">
            Delete
          </Button>
        </>
      }
    />
  );
}

export const Dialog = mirrored({
  scene: confirm,
  aria: `
- button "Delete deck…"`,
});

export const DialogOpen = opened("confirm-delete", {
  scene: confirm,
  aria: `
- button "Delete deck…"
- dialog "Delete “Midnight Control”?":
  - heading "Delete “Midnight Control”?" [level=2]
  - paragraph: This removes the deck and its 14 saved versions. You can’t undo this.
  - button "Close"
  - button "Delete"`,
});
