# Buttons

`.odd-button` on a native `<button>` or `<a>` comes in five variants (default, primary, secondary, ghost, danger), three sizes, and icon-only. Busy and disabled states use `aria-busy` and `aria-disabled`, so disabled buttons stay focusable. Each chrome supplies its own press feel and focus ring.

## Sub-features

- `button-variants`: primary, secondary, default, ghost, and danger look distinct in every chrome and palette.
- `button-sizes`: `data-size="sm"`/`"lg"` and `data-icon-only` buttons have accessible names and are at least 24px tall.
- `button-states`: `aria-busy="true"` and `aria-disabled="true"` look busy or disabled but stay focusable and keep their names.
- `button-playground`: the Controls args (`label`, `variant`, `size`, `disabled`, `busy`) produce the matching markup.
- `button-focus`: keyboard focus shows a visible `:focus-visible` ring in every chrome.

## How to get to it (user POV)

- In Storybook, open **Components → Button**, which has Playground, Variants, Sizes, and States.
- On Playground, change values in the Controls panel.
- Tab to any button to see its focus ring.

## Driving it with ctl.ts

Preconditions:

- The baseline from the README.

- **Variants.** Run `bun $S goto components-button--variants "chrome:glass;palette:aurora;mode:dark"` and capture `buttons/variants-glass-aurora-dark.png`. Repeat with another chrome. Five buttons are visible in both, and the danger button has a trash icon.
- **Playground args.** Run `bun $S goto components-button--playground "" "variant:danger;size:lg;busy:!true;label:Delete+deck"`, then `bun $S eval 'document.querySelector(".odd-button").outerHTML'`. The output contains `data-variant="danger"`, `data-size="lg"`, `aria-busy="true"`, and the text `Delete deck`.
- **Sizes and names.** Run `bun $S goto components-button--sizes` and then `bun $S aria buttons/sizes.aria.txt`. It lists `button "Settings"` and `button "Add card"` for the icon-only buttons. `bun $S eval '[...document.querySelectorAll(".odd-button")].map(b => b.getBoundingClientRect().height)'` returns values that are all at least 24.
- **States stay focusable.** Run `bun $S goto components-button--states`, then `bun $S press Tab` three times. Each press reports focus on the next button, including the `aria-disabled` ones. The aria snapshot shows `[busy]` and `[disabled]` on the matching buttons.
- **Focus ring.** After the Tab above, run `bun $S eval 'getComputedStyle(document.activeElement).outlineWidth + " " + getComputedStyle(document.activeElement).outlineStyle'` and `bun $S screenshot buttons/focus.png`. The ring is visible and at least 2px, unless the chrome draws focus with a box-shadow glow. In that case, read `boxShadow` too.

## Usage sweep

Run `bunx playwright test e2e/usage.spec.ts --project firefox`.

The run checks `#storybook-root` on every story in the HTML Storybook and the React Storybook. For each mirrored story it compares the two accessibility trees with each other and with the story's `aria` literal, and it compares the two `#storybook-root` screenshots. It then opens Playground once for each contract value of `variant`, `size`, `disabled`, and `busy`, on both sides. It clicks the toast triggers on `components-interactive--toast` and checks `.odd-toaster` after each click. The action and dismiss buttons are not in the first render.

A pass prints the number of stories checked and `0 diagnostics`. The count is every HTML story plus every mirrored story. A pixel mismatch is `<story id> pixels differ`. An accessibility-tree mismatch is `<story id> aria differs`. A checker failure line is `<story id> [<state>] ODD-...`. A missing root is `<story id> [<state>] missing <selector>`. A Playground mismatch is `<story id> [<arg>=<value>] <attribute>=<actual>`. The disabled mismatch adds ` disabled=true` or ` disabled=false`. If the injected script did not define `checkRoot`, the line is `<story id> [<state>] checkRoot is not installed`. The Playwright report attaches `usage-summary.json` with those lines under `findings`. That attachment is separate from `axe-summary.json`.

## React Button

Build the composed Storybook and serve it.

```
bun scripts/storybooks.ts storybook-static
bun e2e/serve.ts storybook-static 6106
```

Open `http://127.0.0.1:6106/?path=/story/react_components-button--variants`. The preview is the React Variants story. Another React story uses the same host with `react_` plus its story id, for example `react_components-button--link`.

Run the pair sweep with `bunx playwright test e2e/usage.spec.ts --project firefox`. A pass prints the story count and `0 diagnostics`. The finding lines are in Usage sweep above.

## Gotchas

- Storybook args syntax uses `!true`/`!false` for booleans and `+` for spaces (`label:Delete+deck`).
- `aria-disabled` buttons still receive clicks. The design system only styles them, and blocking the action is the consumer's job. Do not "prove" disabling by expecting a click to be blocked.
- The press transform only applies while the mouse button is held down. The helper's `click` releases at once, so prove the press feel by reading `--press-transform`, not from a screenshot.
