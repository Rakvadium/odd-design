# Surfaces

The surface components are cards (`.odd-card`, where `data-interactive` plus `.odd-card-link` makes the whole card one link), badges (`.odd-badge` with `data-tone` and `data-solid`), a modal `.odd-dialog` that opens and closes through invoker commands with no JS, and the exclusive `.odd-disclosure` accordion built from `<details name>`.

## Sub-features

- `card-link`: an interactive card is clickable anywhere, and screen readers hear one link named after the title.
- `badge-tones`: each tone, in normal and solid form, is legible in every palette and mode.
- `dialog-modal`: `Delete deck…` opens a modal with focus on `Close`. Escape, `Close`, `Delete`, or a backdrop click closes it, and focus returns to the opener.
- `disclosure-exclusive`: opening one `<details name="faq">` closes the open one.

## How to get to it (user POV)

- In Storybook, open **Components → Surfaces**, which has Card, Badge, Dialog, and Disclosure.

## Driving it with ctl.ts

Preconditions:

- The baseline from the README.

- **Dialog open.** Run `bun $S goto components-surfaces--dialog` and then `bun $S click 'button[commandfor="confirm-delete"][command="show-modal"]'`. `bun $S state` shows `openDialogs: ["confirm-delete"]`, and `activeElement` is the `Close` button (it has `autofocus`). `bun $S aria surfaces/dialog.aria.txt` shows `dialog "Delete “Midnight Control”?" [modal]`. Capture `surfaces/dialog-open.png`.
- **Dialog close.** Run `bun $S press Escape`. Focus returns to the `Delete deck…` button, and `openDialogs` is `[]`. Reopen it and run `bun $S click '#confirm-delete .odd-button' --text 'Delete'`, which also closes it.
- **Disclosure exclusive.** Run `bun $S goto components-surfaces--disclosure` and then `bun $S click 'summary' --text 'Does it need JavaScript?'`. `bun $S eval '[...document.querySelectorAll("details")].map(d => d.open)'` returns `[false, true, false]`.
- **Card link.** Run `bun $S goto components-surfaces--card`. The aria tree shows one `link "Ember Aggro"` inside the interactive card. `bun $S eval 'location.href.endsWith("#")'` returns `false`. Then `bun $S click 'article[data-interactive] .odd-muted'` clicks the body text, not the title, and the same eval returns `true`, which proves the whole card is the link's hit area. For a negative control, `goto` again and click `article:not([data-interactive]) .odd-muted`. The eval stays `false`.
- **Badges.** Run `bun $S goto components-surfaces--badge "palette:sorbet;mode:dark"` and capture `surfaces/badges-sorbet-dark.png`. Read the screenshot. Every badge's text is legible.

## Gotchas

- The dialog's `autofocus` lands on `Close`, not on the first button in DOM order. Assert on the button text, not its position.
- The card links use `href="#"`, and `location.hash` is `""` both before and after navigating to an empty fragment. Assert on `location.href.endsWith("#")` instead.
- Invoker commands (`commandfor`/`command`) need a current Chromium. If the dialog does not open on click, report the browser version from `doctor` before suspecting the CSS.
