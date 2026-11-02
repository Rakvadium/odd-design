# Forms

Native form controls styled by `.odd-field`, `.odd-label`, `.odd-input`, `.odd-textarea`, `.odd-select`, `.odd-hint`, and `.odd-error`, plus `.odd-choice` checkboxes and radios, `.odd-switch` (`role="switch"`), the `.odd-segmented` radio fieldset, the `.odd-slider` range input, and the `.odd-search` field in a `<search>` landmark. A field shows its error style only after the user has interacted with it (`:user-invalid`). Arrow keys in radio groups are native browser behavior.

## Sub-features

- `forms-user-invalid`: a required field is not flagged on load. It is flagged after the user edits it, leaves it empty, and moves on.
- `forms-aria-invalid`: a field with `aria-invalid="true"` plus `.odd-error` shows its error text, linked through `aria-describedby`.
- `forms-select`: `.odd-select` keeps the chosen option and upgrades through `appearance: base-select` where the browser supports it.
- `forms-choices`: checkboxes and radios toggle with the mouse and keyboard, and disabled ones do not.
- `forms-switch`: `role="switch"` toggles and exposes the checked state.
- `forms-segmented`: arrow keys move the selection inside `.odd-segmented`.
- `forms-slider`: arrow keys change a `.odd-slider`, and the filled track follows the thumb with no JS.
- `forms-search`: the search field sits in a `search` landmark and is named by its visually hidden label.
- `forms-combobox`: typing filters the `.odd-combobox` options by prefix, the arrows skip disabled options and wrap, Enter or a click chooses with focus kept in the input, a miss shows a disabled No results option, and the list anchors under its input.

## How to get to it (user POV)

- In Storybook, open **Components → Forms**, which has Choices, Switch, Segmented, Text Fields, Select, Search, and Slider. Every Forms story loads from `stories/mirrored/`, so they sort in that file order.
- The Showcase Sample App's "Deck settings" card uses the same controls.

## Driving it with ctl.ts

Preconditions:

- The baseline from the README.

- **Not flagged on load.** Run `bun $S goto components-forms--text-fields` and then `bun $S eval 'document.querySelector("#name").matches(":user-invalid")'`. It returns `false`.
- **Flagged after interaction.** Run `bun $S focus '#name'`, `bun $S type x`, `bun $S press Backspace`, and `bun $S press Tab`. Then `bun $S eval '({ui: document.querySelector("#name").matches(":user-invalid"), border: getComputedStyle(document.querySelector("#name")).borderColor})'` returns `ui: true` with a red-hue border (seen as `oklch(0.72 0.17 25)` in calm/default/system-light). Capture `forms/user-invalid.png`.
- **aria-invalid error text.** Run `bun $S aria forms/text-fields.aria.txt`. It shows `textbox "Email" value="not-an-email" [invalid=true]` and the paragraph `Enter an email address like name@example.com.`
- **Checkbox and radio.** Run `bun $S goto components-forms--choices`, then `bun $S click 'label.odd-choice' --text 'Weekly digest'` and `bun $S click 'label.odd-choice' --text 'Unlisted'`. `bun $S aria forms/choices.aria.txt` shows `checkbox "Weekly digest" [checked=true]` and `radio "Unlisted" [checked=true]`. Clicking `Partner offers (unavailable)` leaves it unchecked.
- **Switch.** Run `bun $S goto components-forms--switch`, then `bun $S click 'label.odd-choice' --text 'Compact grid'`. The aria tree shows `switch "Compact grid" [checked=true]`.
- **Segmented keyboard.** Run `bun $S goto components-forms--segmented`, `bun $S focus '.odd-segmented input:checked'`, and `bun $S press ArrowRight`. `bun $S eval '[...document.querySelectorAll(".odd-segmented input")].map(i => i.checked)'` returns `[false, true, false]`.

- **Slider fill follows the thumb.** Run `bun $S goto components-forms--slider "mode:light"`. Then `bun $S eval '[...document.querySelectorAll(".odd-slider")].map(s => [s.id, (s.value - s.min) / (s.max - s.min), getComputedStyle(s).getPropertyValue("--_progress")])'` shows each slider's value fraction equal to its `--_progress` (`copies` is `0.6667` and `"0.666667"`). Capture `forms/slider-before.png`. The story's `play` wires `#copies-value` just after the story renders, so first run `bun $S eval 'typeof document.querySelector("#copies").oninput'` until it returns `"function"`. Run `bun $S focus '#copies'` and `bun $S press ArrowLeft` twice. The same eval shows `copies` at `0` and `"0"`, and `#copies-value` reads `1 of 4`. In `forms/slider-after.png` the track is empty and the thumb sits at the start.
- **Search landmark.** Run `bun $S goto components-forms--search` and `bun $S aria forms/search.aria.txt`. It shows `search` containing `searchbox "Search cards" value="Ember"`. The `search.odd-search` sits inside a `form method="dialog"`, so Enter in `#card-search` fires the form's `submit` and the page does not navigate. To count it, run `bun $S eval '(window.submits = 0, document.querySelector("#storybook-root form").addEventListener("submit", () => window.submits++), "listening")'`, then `bun $S focus '#card-search'` and `bun $S press Enter`. `bun $S eval '({ href: location.href, submits: window.submits })'` shows the same `href` as before and `submits: 1`.

- **Combobox open.** Run `bun $S goto components-combobox--open` and `bun $S aria forms/combobox-open.aria.txt`. The story's `play` presses ArrowDown, so the tree shows `combobox "City" [expanded]`, `listbox "City"`, `option "Amsterdam" [selected]`, `option "Atlantis" [disabled]`, and `option "Berlin"`. Capture `forms/combobox-open.png`. The ring sits on Amsterdam, and the list is as wide as the input, 4px under it.
- **Combobox keyboard.** Run `bun $S goto components-combobox--playground`, `bun $S focus '#playground-city'`, and `bun $S press ArrowDown` three times. `bun $S eval 'document.getElementById(document.querySelector("#playground-city").getAttribute("aria-activedescendant")).textContent'` returns `"Berlin"`, because the arrows pass disabled Atlantis. `bun $S press Enter` writes `Berlin` into the input and closes the list.
- **Combobox No results.** On the Playground, run `bun $S focus '#playground-city'` and `bun $S type zz`. The list stays open with one option, `No results`, with `aria-disabled="true"`. ArrowDown sets no `aria-activedescendant`. Capture `forms/combobox-no-results.png`.
- **Combobox async.** Run `bun $S goto components-combobox--async`, `bun $S click 'button[command="show-modal"]'`, `bun $S focus '#assignee'`, and `bun $S type lov`. After 150ms the list shows `Ada Lovelace`. `bun $S press Escape` closes the list and leaves the dialog open. A second `bun $S press Escape` closes the dialog.
- **Combobox states.** Run `bun $S goto components-combobox--states` and `bun $S aria forms/combobox-states.aria.txt`. It shows `combobox "Empty"`, `combobox "Filled": Berlin`, `combobox "Invalid" [invalid]: Atlantis` with its error paragraph, and `combobox "Disabled" [disabled]: Cairo`.

## React Field

Build the composed Storybook and serve it.

```
bun scripts/storybooks.ts storybook-static
bun e2e/serve.ts storybook-static 6106
```

Open `http://127.0.0.1:6106/?path=/story/react_components-forms--text-fields`. The preview is the React TextFields story, built from `Field`, `Label`, `Input`, `Textarea`, `Hint`, and `FieldError`. The React Select story is `react_components-forms--select`. The Choice stories are under React Choice below, Search is under React Search, and Slider is under React Slider.

Run the pair sweep with `bunx playwright test e2e/usage.spec.ts --project firefox`. A pass prints the story count and `0 diagnostics`. For each Field and Choice story, both sides then match the `aria` literal in its file under `stories/mirrored/`, and the two screenshots are byte-identical.

## React Choice

Use the same composed build. These stories are built from `Choice`, `Switch`, and `Segmented`.

- **Choices.** Open `http://127.0.0.1:6106/?path=/story/react_components-forms--choices`. Click the "Weekly digest" text and its box checks. Click "Partner offers (unavailable)" and nothing changes.
- **Switch.** Open `http://127.0.0.1:6106/?path=/story/react_components-forms--switch`. Click "Compact grid" and the accessibility tree shows `switch "Compact grid" [checked]`.
- **Segmented.** Open `http://127.0.0.1:6106/?path=/story/react_components-forms--segmented`. Focus Grid and press the right arrow. List becomes checked.

The pair sweep above also checks these three stories against the `aria` literals in `stories/mirrored/Choice.stories.ts`.

## React Search

Use the same composed build. Open `http://127.0.0.1:6106/?path=/story/react_components-forms--search`. The preview is the Search story built from a `Search` part around a native hidden `label`, the magnifier `svg`, and an `Input`, inside a `form method="dialog"`, with the same ids and text as `components-forms--search`. The Search landmark recipe above works on the React side too.

The pair sweep checks the story against the `aria` literal in `stories/mirrored/Search.stories.ts`, and the two screenshots are byte-identical. `bunx playwright test e2e/behavior.spec.ts --project firefox -g "clear button"` finds `#card-search` in the HTML Storybook.

## React Slider

Use the same composed build. Open `http://127.0.0.1:6106/?path=/story/react_components-forms--slider`. The preview is the Slider story built from `Field`, `Label`, three `Slider` parts, `Hint`, and a native `output`, with the same ids and text as `components-forms--slider`. Its `play` wires `#copies-value` on both sides. Wait for `#copies` to have an `oninput` function, as in the slider recipe above, then focus `#copies` and press the left arrow twice. `#copies-value` reads `1 of 4`.

The pair sweep checks the story against the `aria` literal in `stories/mirrored/Slider.stories.ts`, and the two screenshots are byte-identical. `bunx playwright test e2e/behavior.spec.ts --project firefox -g "slider"` runs the keyboard and readout check on both Storybooks.

## React Combobox

Use the same composed build. Open `http://127.0.0.1:6106/?path=/story/react_components-combobox--open`. The preview is built from `Field`, `Label`, `Combobox`, `Input`, `ComboboxList`, and `ComboboxOption`, with the same ids and text as the HTML story. The combobox recipes above work on the React side too. `bunx playwright test e2e/behavior.spec.ts -g "combobox"` runs the keyboard, pointer, No results, async, caret, and anchoring checks on both Storybooks in Firefox and WebKit.

## Gotchas

- Do not clear inputs with `eval` (setting `.value`). Script changes do not count as user interaction, so `:user-invalid` stays false and the proof is invalid. Use `type` with `Backspace`.
- The `#email` field is invalid on load because it hardcodes `aria-invalid="true"`, not because of `:user-invalid`. Do not confuse the two sub-features.
- Clicking the `<label>` is the user path for the choice controls. The bare `<input>` may sit visually under custom styling.
- `--_progress` comes from a scroll-driven animation. If it stays at `0` for every slider, the browser lacks `timeline-scope` support (the fill is then plain by design). Report the version from `doctor`.
- `ctl.ts press` has no `PageUp`/`PageDown` keys. Use arrow keys, `Home`, and `End` for slider proofs.
- `appearance: base-select` support depends on the Chrome version. Report the browser version from `doctor` with any select proof.
- The combobox list is a manual popover, so the axe sweep's openers do not open it. The Open story's `play` opens it before any snapshot. Firefox leaves the placeholder out of a combobox's accessibility tree, so the Empty field in States reads `combobox "Empty"` with no placeholder line.
