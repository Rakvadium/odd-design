# Overlays

Overlays built on the Popover API and `<dialog>`, with no JS. `.ds-popover` opens from `command="toggle-popover"` and anchors to its invoker. `.ds-tooltip` and `.ds-hover-card` are `popover="hint"` elements shown through `interestfor` on hover or keyboard focus. `.ds-sheet` is a modal `<dialog>` that slides in from `data-side`. The alert dialog is a `.ds-dialog` with `role="alertdialog"`. The browser provides the top layer, Escape, light dismiss, focus trapping in modals, and focus return.

## Sub-features

- `popover-anchor`: the popover opens 8px below its invoker, aligned to its start edge. Near the viewport's end edge it flips to align to the invoker's end. The invoker reports `expanded`.
- `popover-dismiss`: Escape (focus returns to the invoker), a click outside, or a `hide-popover` button closes it.
- `tooltip-interest`: hovering or tabbing to an invoker shows its tooltip, centered 8px above it, after the browser's delay. Moving away or pressing Escape hides it. Icon-only buttons are named by their tooltips, and `Publish` is described by its tooltip.
- `hover-card`: hovering the link shows the card under it, and the card stays open while the pointer moves into it.
- `sheet-sides`: each sheet fills its edge (end, start, or bottom), is modal with focus on `Close`, and closes with Escape, the Close button, or a backdrop click.
- `alert-dialog`: `role="alertdialog"` with a name and description. Focus starts on `Keep editing`. A backdrop click does not close it, and Escape does.

## How to get to it (user POV)

- In Storybook, open **Components → Overlays**, which has Popover, Tooltip, Hover Card, Sheet, and Alert Dialog.

## Driving it with ctl.ts

Preconditions:

- The baseline from the README.

- **Popover anchor and flip.** Run `bun $S goto components-overlays--popover "mode:light"` and `bun $S click 'button[commandfor="filters"]'`. `bun $S state` shows `openPopovers: ["filters"]`, and `bun $S aria overlays/popover.aria.txt` shows `button "Filters" [focused, expanded]`. `bun $S eval '(() => { const b = document.querySelector("button[commandfor=filters]").getBoundingClientRect(), p = document.getElementById("filters").getBoundingClientRect(); return [b.left, p.left, p.top - b.bottom]; })()'` returns `[16, 16, 8]`. Capture `overlays/popover-open.png`. Press Escape. `openPopovers` is `[]`, and focus is on the `Filters` button. Click `button[commandfor="filters-end"]`. The popover's `right` equals the button's `right` (within 1px), so it flipped inward. `bun $S click body` closes it.
- **Tooltip by hover.** Run `bun $S goto components-overlays--tooltip "mode:light"`, then `bun $S hover 'button[interestfor="tip-delete"]'` and `bun $S wait 1200`. `document.getElementById("tip-delete").matches(":popover-open")` is `true`. Its center matches the button's center, and the gap is `8`. Capture `overlays/tooltip-hover.png`. Run `bun $S hover body` and `bun $S wait 1200`. It is closed.
- **Tooltip by keyboard.** From a fresh `goto`, press Tab four times to reach `Publish`, then `bun $S wait 1500`. `openPopovers` is `["tip-publish"]`. Press Escape, and it closes.
- **Tooltip names.** `bun $S aria overlays/tooltip.aria.txt` shows `button "Duplicate deck"`, `button "Share link"`, `button "Delete deck"`, and `button "Publish" description="Anyone with the link can view it"`.
- **Hover card.** Run `bun $S goto components-overlays--hover-card`, then `bun $S hover 'a[interestfor="preview-midnight"]'` and `bun $S wait 1200`. The card is open, its left edge equals the link's, and it sits 8px below. Run `bun $S hover '#preview-midnight .ds-badge'` and `bun $S wait 1200`. It is still open. Capture `overlays/hover-card.png`.
- **Sheets.** Run `bun $S goto components-overlays--sheet "mode:light"` and `bun $S click 'button[commandfor="sheet-end"]'`, then `bun $S wait 500`. The open dialog's rect spans `right: innerWidth`, `top: 0`, `bottom: innerHeight`, and focus is on `Close`. `aria` shows `dialog "Filters" [modal]` with no `banner` inside. Escape closes it and returns focus. Repeat with `sheet-start` (`left: 0`) and `sheet-bottom` (`bottom: innerHeight`, full width). Click `body` with a sheet open, and `openDialogs` is `[]` (`closedby="any"`).
- **Alert dialog.** Run `bun $S goto components-overlays--alert-dialog`, click `button[commandfor="discard"][command="show-modal"]`, and `wait 400`. `aria` shows `alertdialog "Discard unsaved changes?" description="You’ve edited 6 cards…" [modal]` and `button "Keep editing" [focused]`. `bun $S click body` leaves `openDialogs: ["discard"]`. `bun $S press Escape` empties it and returns focus to the opener.

## Gotchas

- Interest invokers need Chromium 142+. If no tooltip ever opens, check `"interestForElement" in HTMLButtonElement.prototype` and report the version from `doctor`. In browsers without it, tooltips never show. The JS fallback is still to be written; see `docs/follow-ups.md`.
- A tooltip next to the viewport edge is shifted inward rather than centered. That's intended. Assert centering on `tip-delete`, which has room on both sides.
- `hover` leaves the pointer where it lands. Run `hover body` before a keyboard proof, or the hovered tooltip stays open and confuses the assertion.
- Sheets and dialogs animate over `--duration-slow` and `--duration-base`. `wait 500` before reading their rects.
