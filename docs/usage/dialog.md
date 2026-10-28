# Dialog usage rules

These codes apply to `odd-dialog`, `odd-dialog-body`, `odd-dialog-title`, and `odd-dialog-actions`. ODD-DIALOG-002 to ODD-DIALOG-006 also apply to `odd-sheet`, which is a modal `dialog` too, and its own codes are in [Sheet usage rules](sheet.md). Shared codes are in [General usage rules](general.md).

```html
<button class="odd-button" data-variant="danger" commandfor="confirm-delete" command="show-modal">Delete deck…</button>
<dialog class="odd-dialog" id="confirm-delete" aria-labelledby="confirm-delete-title" closedby="any">
  <div class="odd-dialog-body">
    <h2 class="odd-dialog-title" id="confirm-delete-title">Delete “Midnight Control”?</h2>
    <p class="odd-muted">This removes the deck and its 14 saved versions.</p>
    <div class="odd-dialog-actions">
      <button class="odd-button" commandfor="confirm-delete" command="close">Close</button>
      <button class="odd-button" data-variant="danger" commandfor="confirm-delete" command="close">Delete</button>
    </div>
  </div>
</dialog>
```

The browser does the rest with no JS. `command="show-modal"` opens the dialog in the top layer, traps focus, makes the page behind it inert, and closes it on Escape. Focus returns to the opener when it closes. `closedby="any"` adds a click outside. Focus starts on the first focusable control, so put the safe choice first. For a decision the user must make, add `role="alertdialog"` and leave out `closedby`. To submit from the dialog, make the body a `form` with `method="dialog"`.

In React, `Dialog` renders the `dialog`, and `DialogActions` renders the actions `div`. The body is a `div` or a `form` with `odd-dialog-body`, and the title is a heading with `odd-dialog-title`, because their tags are the caller's. `Button` takes `commandfor` and `command`. The parts hold no state.

```tsx
import { Button, Dialog, DialogActions } from "odd-design/react";

<Button variant="danger" commandfor="confirm-delete" command="show-modal">Delete deck…</Button>
<Dialog id="confirm-delete" aria-labelledby="confirm-delete-title" closedby="any">
  <div className="odd-dialog-body">
    <h2 className="odd-dialog-title" id="confirm-delete-title">Delete “Midnight Control”?</h2>
    <DialogActions>
      <Button commandfor="confirm-delete" command="close">Close</Button>
      <Button variant="danger" commandfor="confirm-delete" command="close">Delete</Button>
    </DialogActions>
  </div>
</Dialog>;
```

React writes no `autofocus` attribute. It calls `focus()` once when the button mounts, while the dialog is still closed, so `autoFocus` inside a `Dialog` does nothing. Put the control that should take focus first. To open the dialog from code, call `showModal()` on a `ref`, and read the close from `onClose`.

## ODD-DIALOG-001

Fails when a dialog class is on the wrong element. `odd-dialog` goes on `dialog`. `odd-dialog-body` goes on `div`, or on `form` to submit. `odd-dialog-title` goes on a heading, `h1` to `h6`. `odd-dialog-actions` goes on `div`.

`odd-dialog` on a `div` is never hidden. It sits in the page at opacity 0, and its buttons still take focus. In HTML, a `p` ends before a heading, so the title inside a `p.odd-dialog-body` is parsed outside the body. React leaves it inside the `p`, where a heading is not allowed. A title that is not a heading drops out of heading navigation. The title rule also covers `odd-sheet` headers, which reuse the class.

Move the class onto its element. In React, use `Dialog` and `DialogActions`.

## ODD-DIALOG-002

Fails when `odd-dialog` or `odd-sheet` on a `dialog` has no non-empty `aria-label` or `aria-labelledby`. A blank name such as `aria-label=" "` fails too.

A screen reader announces only "dialog" when it opens. A heading inside does not name it.

Give the `odd-dialog-title` an `id` and point `aria-labelledby` at it, or set `aria-label`. In React, `Dialog` with neither name is a type error.

## ODD-DIALOG-003

Fails when `odd-dialog` or `odd-sheet` has a `role` other than `alertdialog`. `role="dialog"` fails too, because the element is already a dialog.

Another role announces the dialog as something else, such as a region or a menu.

Remove `role`, or set `role="alertdialog"` for a decision the user must make. In React, `role` on `Dialog` takes only `"alertdialog"`.

## ODD-DIALOG-004

Fails when `odd-dialog` or `odd-sheet` has `open` in its markup.

`open` shows the dialog without `showModal()`. The page behind it stays live, Escape does nothing, and focus is not trapped. In React, `open` sets the attribute and never calls `showModal()`, and the prop goes stale once the browser closes the dialog.

Open it from a button with `commandfor` and `command="show-modal"`, or call `showModal()` on a `ref`. Read the close from `onClose`. In React, `open` on `Dialog` is a type error. In browsers, which match `dialog:modal` after `showModal()`, the runtime checker ignores the `open` that `showModal()` writes. happy-dom does not match `:modal`, so `checkRoot` after `showModal()` there still reports ODD-DIALOG-004.

## ODD-DIALOG-005

Fails when `closedby` on `odd-dialog` or `odd-sheet` is a value other than `any` or `closerequest`, such as `none` or a typo.

`closedby="none"` stops Escape from closing the dialog, so only a button can close it.

Remove `closedby` so Escape and the buttons close the dialog, or write `closedby="any"` so a click outside also closes it. `closedby="closerequest"` is the default for a modal dialog, so writing it changes nothing. In React, `closedby` on `Dialog` takes `"any"` or `"closerequest"`.

## ODD-DIALOG-006

Fails when `odd-dialog` or `odd-sheet` has `closedby="any"` and `role="alertdialog"`.

A stray click outside dismisses the decision the alert dialog asks for.

Remove `closedby` so only Escape and the buttons close it. In React, `closedby="any"` with `role="alertdialog"` on `Dialog` is a type error.

## ODD-DIALOG-007

Fails when `odd-dialog` has a system `data-*` attribute.

`dialog.css` reads no data attributes, so `data-tone="danger"` and `data-size="lg"` change nothing.

Remove the attribute. App data attributes, the appearance axes, and the headless allowlist stay allowed.

## ODD-DIALOG-008

Fails when `odd-dialog-body`, `odd-dialog-title`, or `odd-dialog-actions` has a system `data-*` attribute.

`dialog.css` reads no data attributes on them, so `data-tone` or `data-variant` changes nothing.

Remove the attribute. App data attributes, the appearance axes, and the headless allowlist stay allowed. In React, a system `data-*` on `DialogActions` is a type error.
