# Sample app appearance dialog

**Showcase → Sample App** is a small "Deckhouse" app screen in its own `.ds-scope`. Its `Appearance` button opens a native modal dialog, with no JS for the open and close, that holds three segmented radio groups (Chrome, Palette, Mode). Picking a value re-themes the app's scope immediately. `Done`, Escape, or a click outside closes the dialog and returns focus to the button.

## Sub-features

- `sample-open`: the `Appearance` button opens the `Appearance` modal through `commandfor="appearance" command="show-modal"`.
- `sample-rescope`: choosing a chrome, palette, or mode radio updates the scope's `data-*` live, while the page `<html>` stays unchanged.
- `sample-close`: `Done`, Escape, or a backdrop click (`closedby="any"`) closes the dialog and returns focus to `Appearance`.
- `sample-screen`: the header nav, hero, deck cards, and settings form all render in the chosen appearance.

## How to get to it (user POV)

- In Storybook, open **Showcase → Sample App** and choose the `Appearance` button under the hero.
- Use the keyboard: Tab to `Appearance`, press Enter, move between radios with the arrow keys, and press Escape to close.

## Driving it with ctl.ts

Preconditions:

- The baseline from the README.
- `bun $S goto showcase--sample-app "chrome:calm;palette:default;mode:light"` reports `html data: {"mode":"light","palette":"default","chrome":"calm"}`.

- **Before.** Capture the starting screen with `bun $S screenshot sample-app/before.png`. It shows the light, calm Deckhouse screen.
- **Open.** Choose `Appearance` with `bun $S click 'button[commandfor="appearance"]'`. `bun $S state` shows `openDialogs: ["appearance"]`, and focus is on the checked `chrome` radio (`value="calm"`). `bun $S aria sample-app/dialog.aria.txt` shows a `dialog "Appearance" [modal]` with three radio groups.
- **Re-theme.** Choose a chrome and a mode with `bun $S click '#appearance input[name="chrome"][value="holoterminal"]'` and `bun $S click '#appearance input[name="mode"][value="dark"]'`. `bun $S state` shows `scopes[0]` as `{"chrome":"holoterminal","palette":"default","mode":"dark"}`, while `html` is still `calm/default/light`. Capture this with `bun $S screenshot sample-app/dialog.png`. The dialog and the app behind it are dark, uppercase, and monospace.
- **Keyboard radio move.** Move to the next palette with `bun $S focus '#appearance input[name="palette"]:checked'` followed by `bun $S press ArrowRight`. `state` shows `scopes[0].palette` as `aurora`.
- **Close with Escape.** Run `bun $S press Escape`. The output says focus is now on `<button ... commandfor="appearance" ...>`, and `state` shows `openDialogs: []` while the scope keeps the new values. Capture this with `bun $S screenshot sample-app/after.png`.
- **Close with Done.** Reopen the dialog, then `bun $S click '#appearance .ds-button' --text 'Done'`. `openDialogs` is `[]`.

## Gotchas

- The dialog re-themes only the story's `.ds-scope`, never `<html>`. Assert on `state.scopes[0]`, not `html data`.
- The radios start checked from the globals in the `goto` URL, so pick a target value that differs from the starting global, or the change event never fires.
- Any `goto` resets the scope to the URL globals. Dialog choices are not persisted, and the story does not use `saveAppearance`.
- A click on the dialog's own padding does not close it. Only a click on the backdrop, outside the dialog box, does.
