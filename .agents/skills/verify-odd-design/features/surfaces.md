# Surfaces

The surface components are cards (`.odd-card`, where `data-interactive` plus `.odd-card-link` makes the whole card one link), badges (`.odd-badge` with `data-tone` and `data-solid`), a modal `.odd-dialog` that opens and closes through invoker commands with no JS, and the exclusive `.odd-disclosure` accordion built from `<details name>`.

## Sub-features

- `card-link`: an interactive card is clickable anywhere, and screen readers hear one link named after the title.
- `badge-tones`: each tone, in normal and solid form, is legible in every palette and mode.
- `dialog-modal`: `Delete deck…` opens a modal with focus on `Close`. Escape, `Close`, `Delete`, or a backdrop click closes it, and focus returns to the opener.
- `disclosure-exclusive`: opening one `<details name="faq">` closes the open one.

## How to get to it (user POV)

- In Storybook, open **Components → Surfaces**, which has Badge, Card, Dialog, and Disclosure in both sections. Every Surfaces story loads from `stories/mirrored/`.

## Driving it with ctl.ts

Preconditions:

- The baseline from the README.

- **Dialog open.** Run `bun $S goto components-surfaces--dialog` and then `bun $S click 'button[commandfor="confirm-delete"][command="show-modal"]'`. `bun $S state` shows `openDialogs: ["confirm-delete"]`, and `activeElement` is the `Close` button, the first button in the dialog. No button has `autofocus`. `bun $S aria surfaces/dialog.aria.txt` shows `dialog "Delete “Midnight Control”?" [modal]`. Capture `surfaces/dialog-open.png`.
- **Dialog close.** Run `bun $S press Escape`. Focus returns to the `Delete deck…` button, and `openDialogs` is `[]`. Reopen it and run `bun $S click '#confirm-delete .odd-button' --text 'Delete'`, which also closes it.
- **Disclosure exclusive.** Run `bun $S goto components-surfaces--disclosure` and then `bun $S click 'summary' --text 'Does it need JavaScript?'`. `bun $S eval '[...document.querySelectorAll("details")].map(d => d.open)'` returns `[false, true, false]`.
- **Card link.** Run `bun $S goto components-surfaces--card`. The aria tree shows one `link "Ember Aggro"` inside the interactive card. `bun $S eval 'location.href.endsWith("#")'` returns `false`. Then `bun $S click 'article[data-interactive] .odd-muted'` clicks the body text, not the title, and the same eval returns `true`, which proves the whole card is the link's hit area. For a negative control, `goto` again and click `article:not([data-interactive]) .odd-muted`. The eval stays `false`.
- **Badges.** Run `bun $S goto components-surfaces--badge "palette:sorbet;mode:dark"` and capture `surfaces/badges-sorbet-dark.png`. Read the screenshot. Every badge's text is legible.

## React Badge

Build the composed Storybook and serve it, as in the React Field section of `forms.md`. Open `http://127.0.0.1:6106/?path=/story/react_components-surfaces--badge`. The preview is the Badge story built from `Badge`. It shows a soft row and a solid row of the six tones, the same as `components-surfaces--badge`.

Run the pair sweep with `bunx playwright test e2e/usage.spec.ts --project firefox`. The Badge pair matches the `aria` literal in `stories/mirrored/Badge.stories.ts`, and the two screenshots are byte-identical.

## React Card

In the same composed Storybook, open `http://127.0.0.1:6106/?path=/story/react_components-surfaces--card`. The preview is the Card story built from `Card`, `CardLink`, `CardFooter`, and `Badge`, the same as `components-surfaces--card`. The pair sweep matches the `aria` literal in `stories/mirrored/Card.stories.ts`, which has one link, "Ember Aggro", inside the interactive card's level-3 heading. The two screenshots are byte-identical. The Card link recipe above works on the React side too.

## React Disclosure

In the same composed Storybook, open `http://127.0.0.1:6106/?path=/story/react_components-surfaces--disclosure`. The preview is the Disclosure story built from `Disclosure` with native `summary` and `div` children, the same as `components-surfaces--disclosure`. The pair sweep matches the `aria` literal in `stories/mirrored/Disclosure.stories.ts`, three groups with the first open, and the two screenshots are byte-identical. The Disclosure exclusive recipe above works on the React side too.

## React Dialog

In the same composed Storybook, open `http://127.0.0.1:6106/?path=/story/react_components-surfaces--dialog`. The preview is the Dialog story built from `Button`, `Dialog`, a `div.odd-dialog-body`, and `DialogActions`, with the same ids and text as `components-surfaces--dialog`. The browser owns the open state on both sides, so the Dialog open and close recipes above work on the React side too. Focus starts on `Close` on both sides, because `showModal()` focuses the first button and neither side writes `autofocus`.

The pair sweep checks the closed story against the `aria` literal in `stories/mirrored/Dialog.stories.ts`, the one `button "Delete deck…"` line, because a closed dialog is `display: none`. The two screenshots are byte-identical. Closed parity cannot see the open state, so `bunx playwright test e2e/behavior.spec.ts --project firefox -g "closedby=any|alert dialog"` runs the backdrop test and the alert-dialog test once per Storybook.

## Gotchas

- Focus lands on the first button in the open dialog, because no button has `autofocus`. React writes no `autofocus` attribute, so a scene that needs another button focused must put it first.
- The card links use `href="#"`, and `location.hash` is `""` both before and after navigating to an empty fragment. Assert on `location.href.endsWith("#")` instead.
- Invoker commands (`commandfor`/`command`) need a current Chromium. If the dialog does not open on click, report the browser version from `doctor` before suspecting the CSS.
