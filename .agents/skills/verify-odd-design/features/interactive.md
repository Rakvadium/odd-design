# Interactive

Patterns HTML has no element for, enhanced by `src/js/enhance.ts` on top of native markup. `enhanceMenu` gives a `.ds-menu` popover the menu keyboard. `enhanceTabs` runs the ARIA tabs pattern on `.ds-tabs`. `createToaster` manages a live region of `.ds-toast` messages. The same module carries the small helpers proven on other stories: `enhanceSelectAll` on the Table story, and `avatarFallback` on the Avatar story.

## Sub-features

- `menu-keyboard`: ArrowDown or ArrowUp on the trigger opens at the first or last item. Arrows wrap, Home and End jump, and the disabled item is skipped. Typing a letter jumps there, and repeating it cycles through matches.
- `menu-choose`: Enter or a click on a menuitem closes the menu and returns focus to the trigger. Checkbox and radio items toggle and stay open. Tab closes the menu and moves focus to the control after the trigger.
- `tabs-auto`: one tab stop. Arrows, Home, and End move, and the panel follows. Tab moves into the panel.
- `tabs-manual`: arrows move focus without choosing, Enter chooses, the disabled tab is skipped, and the tab stop returns to the chosen tab when focus leaves.
- `toast-lifecycle`: toasts stack in the corner, pause while hovered, leave after six seconds, and the danger toast stays. Undo and Dismiss work.
- `toast-over-modal`: a toast shown while a modal dialog is open is in the accessibility tree and clickable, and the region returns to `<body>` when the dialog closes.
- `select-all`: the header checkbox selects every row, shows a mixed state, and clears all rows.
- `avatar-fallback`: the broken image avatar shows `JP` and keeps the name "Jo Park".

## How to get to it (user POV)

- In Storybook, open **Components → Interactive**, which has Menu, Tabs, and Toast.
- Select-all is on **Components → Data Display → Table**, and the avatar fallback is on **Avatar**.

## Driving it with ctl.ts

Preconditions:

- The baseline from the README.

- **Menu keyboard.** Run `bun $S goto components-interactive--menu "mode:light"`, `bun $S focus 'button[commandfor="deck-actions"]'`, `bun $S press ArrowDown`, and `bun $S wait 200`. Focus is on `Duplicate`. Press ArrowDown twice. Focus skips `Merge` and lands on `Show prices`. Press End (Delete deck), Home (Duplicate), and ArrowUp (Delete deck, which wraps). Press `c` twice. Focus goes to `Compact grid`, then `Card count`. Capture `interactive/menu-open.png`. `aria` shows `button "Deck actions" [expanded]`, `menu "Deck actions"`, and `menuitem "Merge (needs two decks)" [disabled]`.
- **Menu choose.** On `Card count`, press Space. The menu stays open, and the radios read `["false","false","true"]`. Press Home, then Enter. The menu closes, focus is on the trigger, and `#menu-log` reads `Chose “Duplicate”`. Press ArrowUp on the trigger. Focus is on `Delete deck`. Press Tab. The menu closes, and `document.activeElement.id` is `after-menu`.
- **Tabs, automatic.** Run `bun $S goto components-interactive--tabs`, then press Tab and ArrowRight. `Stats` is `aria-selected="true"` with `tabIndex` 0, the other tabs are -1, and the panels' `hidden` values are `[true, false, true]`. Press End, then ArrowRight. Focus is on `Cards`, which wrapped. Press Tab. Focus is on `#panel-cards`, which has `tabindex="0"` because it has nothing focusable inside.
- **Tabs, manual.** Run `bun $S focus '#tab-s7'` and press ArrowRight. Focus is on `Season 6`, but `Season 7` stays selected and `#panel-s6` is hidden. Press ArrowRight. Focus is on `Season 7` (it skipped disabled `Season 5`). Press ArrowLeft, then Enter. `Season 6` is selected and its panel is shown. From a fresh `goto`, focus `#tab-s7`, press ArrowRight, then Tab. The tab indexes read `Season 7:0 Season 6:-1 Season 5:-1`.
- **Toasts.** Run `bun $S goto components-interactive--toast "mode:light"` and click `[data-toast=saved]`, `[data-toast=undo]`, and `[data-toast=error]`. Three `.ds-toast` exist. Capture `interactive/toasts.png`. Run `bun $S hover '.ds-toast'` and wait 7 s (`wait 5000`, then `wait 2000`). All three remain. Then `bun $S hover '[data-toast=saved]'` and wait 7 s again. Only `Couldn’t sync` remains. On a fresh story, click `[data-toast=undo]`, then `.ds-toast .ds-button --text Undo`. Only `Card restored` remains. Click its `button[aria-label^="Dismiss"]`, and no toasts remain.
- **Toast over a modal.** Click `button[commandfor="toast-settings"]`, wait 300, click `#toast-settings [data-toast=saved]`, and wait 600. `aria` shows `region "Notifications"` with `button "Dismiss: Deck saved"` inside the dialog's tree. Click that Dismiss button. The toast is gone, and `#toast-settings` is still open. Press Escape. `.ds-toaster`'s parent is `BODY`, and it is still `:popover-open`.
- **Select-all.** Run `bun $S goto components-data-display--table`. The header checkbox is `indeterminate` (Ember Aggro starts checked). Click `[data-select-all]`. All four rows are checked, and the header is checked and not mixed. Uncheck `Select Tidecaller`. The header is mixed. Click the header twice. All rows are checked, then all are cleared.
- **Avatar fallback.** Run `bun $S goto components-data-display--avatar`. `#broken-avatar` has text `JP`, `role="img"`, `aria-label="Jo Park"`, and no `<img>`.

## Gotchas

- Menu items take focus on the popover's `toggle` event, a moment after it opens. `wait 200` after opening before pressing keys.
- `press` sends real keydowns for single letters. `type` inserts text without key events, so it never triggers typeahead.
- Toast timers use real time. The waits above are the proof. Shorter waits leave toasts that should be gone.
- The interestfor and closedby fallbacks never run here: Chrome has both features natively, and their Blink flags were removed after shipping. They need a browser without the features (see `docs/follow-ups.md`).
