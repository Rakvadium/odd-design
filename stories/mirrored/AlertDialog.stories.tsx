import { AlertDialog as OddAlertDialog, Button } from "odd-design/react";
import { mirrored } from "../mirror.ts";
import { opened } from "../opened.ts";

const meta = {
  title: "Components/Overlays",
  parameters: {
    docs: {
      description: {
        component:
          "`AlertDialog` from `odd-design/react` is a `Dialog` with `role=\"alertdialog\"`, for a decision the user must make. Its `description` is required and describes the dialog. It takes no `dismissible`, so a click outside doesn't dismiss it, but Escape still cancels. Focus starts on the first button, the safe choice.",
      },
    },
  },
};

export default meta;

function discard() {
  return (
    <OddAlertDialog
      id="discard"
      trigger={<Button variant="danger">Discard changes…</Button>}
      title="Discard unsaved changes?"
      description="You’ve edited 6 cards since your last save. Discarding can’t be undone."
      actions={
        <>
          <Button command="close">Keep editing</Button>
          <Button variant="danger" command="close">
            Discard
          </Button>
        </>
      }
    />
  );
}

export const AlertDialog = mirrored({
  scene: discard,
  aria: `
- button "Discard changes…"`,
});

export const AlertDialogOpen = opened("discard", {
  scene: discard,
  aria: `
- button "Discard changes…"
- alertdialog "Discard unsaved changes?":
  - heading "Discard unsaved changes?" [level=2]
  - paragraph: You’ve edited 6 cards since your last save. Discarding can’t be undone.
  - button "Keep editing"
  - button "Discard"`,
});
