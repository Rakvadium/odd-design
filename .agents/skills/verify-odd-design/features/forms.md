# Forms

Native form controls styled by `.ds-field`, `.ds-label`, `.ds-input`, `.ds-textarea`, `.ds-select`, `.ds-hint`, and `.ds-error`, plus `.ds-choice` checkboxes and radios, `.ds-switch` (`role="switch"`), the `.ds-segmented` radio fieldset, the `.ds-slider` range input, and the `.ds-search` field in a `<search>` landmark. A field shows its error style only after the user has interacted with it (`:user-invalid`). Arrow keys in radio groups are native browser behavior.

## Sub-features

- `forms-user-invalid`: a required field is not flagged on load. It is flagged after the user edits it, leaves it empty, and moves on.
- `forms-aria-invalid`: a field with `aria-invalid="true"` plus `.ds-error` shows its error text, linked through `aria-describedby`.
- `forms-select`: `.ds-select` keeps the chosen option and upgrades through `appearance: base-select` where the browser supports it.
- `forms-choices`: checkboxes and radios toggle with the mouse and keyboard, and disabled ones do not.
- `forms-switch`: `role="switch"` toggles and exposes the checked state.
- `forms-segmented`: arrow keys move the selection inside `.ds-segmented`.
- `forms-slider`: arrow keys change a `.ds-slider`, and the filled track follows the thumb with no JS.
- `forms-search`: the search field sits in a `search` landmark and is named by its visually hidden label.

## How to get to it (user POV)

- In Storybook, open **Components → Forms**, which has Text Fields, Select, Choices, Switch, Segmented, Slider, and Search.
- The Showcase Sample App's "Deck settings" card uses the same controls.

## Driving it with ctl.ts

Preconditions:

- The baseline from the README.

- **Not flagged on load.** Run `bun $S goto components-forms--text-fields` and then `bun $S eval 'document.querySelector("#name").matches(":user-invalid")'`. It returns `false`.
- **Flagged after interaction.** Run `bun $S focus '#name'`, `bun $S type x`, `bun $S press Backspace`, and `bun $S press Tab`. Then `bun $S eval '({ui: document.querySelector("#name").matches(":user-invalid"), border: getComputedStyle(document.querySelector("#name")).borderColor})'` returns `ui: true` with a red-hue border (seen as `oklch(0.72 0.17 25)` in calm/default/system-light). Capture `forms/user-invalid.png`.
- **aria-invalid error text.** Run `bun $S aria forms/text-fields.aria.txt`. It shows `textbox "Email" value="not-an-email" [invalid=true]` and the paragraph `Enter an email address like name@example.com.`
- **Checkbox and radio.** Run `bun $S goto components-forms--choices`, then `bun $S click 'label.ds-choice' --text 'Weekly digest'` and `bun $S click 'label.ds-choice' --text 'Unlisted'`. `bun $S aria forms/choices.aria.txt` shows `checkbox "Weekly digest" [checked=true]` and `radio "Unlisted" [checked=true]`. Clicking `Partner offers (unavailable)` leaves it unchecked.
- **Switch.** Run `bun $S goto components-forms--switch`, then `bun $S click 'label.ds-choice' --text 'Compact grid'`. The aria tree shows `switch "Compact grid" [checked=true]`.
- **Segmented keyboard.** Run `bun $S goto components-forms--segmented`, `bun $S focus '.ds-segmented input:checked'`, and `bun $S press ArrowRight`. `bun $S eval '[...document.querySelectorAll(".ds-segmented input")].map(i => i.checked)'` returns `[false, true, false]`.

- **Slider fill follows the thumb.** Run `bun $S goto components-forms--slider "mode:light"`. Then `bun $S eval '[...document.querySelectorAll(".ds-slider")].map(s => [s.id, (s.value - s.min) / (s.max - s.min), getComputedStyle(s).getPropertyValue("--_progress")])'` shows each slider's value fraction equal to its `--_progress` (`copies` is `0.6667` and `"0.666667"`). Capture `forms/slider-before.png`. Run `bun $S focus '#copies'` and `bun $S press ArrowLeft` twice. The same eval shows `copies` at `0` and `"0"`, and `#copies-value` reads `1`. In `forms/slider-after.png` the track is empty and the thumb sits at the start.
- **Search landmark.** Run `bun $S goto components-forms--search` and `bun $S aria forms/search.aria.txt`. It shows `search` containing `searchbox "Search cards" value="Ember"`.

## Gotchas

- Do not clear inputs with `eval` (setting `.value`). Script changes do not count as user interaction, so `:user-invalid` stays false and the proof is invalid. Use `type` with `Backspace`.
- The `#email` field is invalid on load because it hardcodes `aria-invalid="true"`, not because of `:user-invalid`. Do not confuse the two sub-features.
- Clicking the `<label>` is the user path for the choice controls. The bare `<input>` may sit visually under custom styling.
- `--_progress` comes from a scroll-driven animation. If it stays at `0` for every slider, the browser lacks `timeline-scope` support (the fill is then plain by design). Report the version from `doctor`.
- `ctl.ts press` has no `PageUp`/`PageDown` keys. Use arrow keys, `Home`, and `End` for slider proofs.
- `appearance: base-select` support depends on the Chrome version. Report the browser version from `doctor` with any select proof.
