# Number stepper

A number stepper is a number input between step buttons. It is a recipe, so it has no class of its own. `odd-row` lays it out, and `enhanceStepper` from `odd-design/enhance` wires the buttons. The stories are under **Recipes → Number stepper** in the HTML Storybook.

## Markup

```html
<div class="odd-field">
  <label class="odd-label" id="copies-label" for="copies">Copies</label>
  <div class="odd-row" style="--gap: var(--space-1)" role="group" aria-labelledby="copies-label">
    <button class="odd-button" type="button" data-step="-1" aria-label="Fewer copies">−</button>
    <input class="odd-input" type="number" id="copies" min="1" max="4" value="1" style="flex: 1 1 4rem">
    <button class="odd-button" type="button" data-step="1" aria-label="More copies">+</button>
  </div>
</div>
```

- The label names the input through `for`. The row takes `role="group"` and the label's id in `aria-labelledby`, so the buttons sit in a group with the same name.
- `odd-input` fills its whole row. Give the number input `flex: 1 1 4rem`, inline or in your own class, so it shares the row with the buttons. Without it, the input wraps to a line of its own.
- A button whose text is only a sign, such as `−`, needs an `aria-label`. A button that reads `+10` names itself.
- A jog row puts two or more buttons on each side, such as `data-step="-10"`, `"-1"`, `"1"`, and `"10"`.
- `field.css` gives every number input tabular digits. The browser's own spin buttons still show. To hide them, add your own rule for `::-webkit-inner-spin-button` and `::-webkit-outer-spin-button`, and `appearance: textfield` for Firefox.

## Wire the buttons

```js
import { enhanceStepper } from "odd-design/enhance";

const cleanup = enhanceStepper(document.querySelector('[aria-labelledby="copies-label"]'));
```

`enhance()` does not find steppers, because the recipe has no class to find. Call `enhanceStepper` on each group, including groups that your page adds or clones later. It returns a cleanup function.

## Behavior

- `data-step` counts the input's steps. With `step="0.5"`, `data-step="10"` moves the value by 5, so label that button `+5`.
- Each step calls the input's own `stepUp` or `stepDown`, so `min`, `max`, and `step` clamp and snap the value.
- A click or a key press steps once. A held pointer press steps, waits 400 ms, and then steps every 100 ms until release or a limit.
- Each step fires `input` on the number input. One `change` follows when the press ends, however long it was held.
- Buttons at a limit get `aria-disabled="true"`. To disable the whole stepper, set `disabled` on the input.
- Without JavaScript, the number input still works on its own.
