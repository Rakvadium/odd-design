# Slider with number

A slider with number pairs an `odd-slider` with a number input for one value. It is a recipe, so it has no class of its own. `odd-row` lays it out, and `enhanceRangeField` from `odd-design/enhance` keeps the two inputs in sync. The story is under **Recipes → Slider with number** in the HTML Storybook.

## Markup

```html
<div class="odd-field">
  <label class="odd-label" id="speed-label" for="speed">Speed</label>
  <div class="odd-row" id="speed-row">
    <input class="odd-slider" type="range" id="speed" min="0" max="200" step="5" value="40" aria-describedby="speed-hint" style="flex: 1 1 8rem">
    <input class="odd-input" type="number" id="speed-number" min="0" max="200" step="5" value="40" aria-labelledby="speed-label speed-unit" style="flex: 0 0 6.5rem">
    <span class="odd-muted" id="speed-unit">mm/s</span>
  </div>
  <p class="odd-hint" id="speed-hint">0 to 200, in steps of 5.</p>
</div>
```

- The label names the slider through `for`. The number input takes the label and the unit in `aria-labelledby`. Leave out the unit when the value has none.
- `odd-slider` and `odd-input` each fill their whole row. Give the slider `flex: 1 1 8rem` and the number input `flex: 0 0 6.5rem`, inline or in your own class. Without them, each input wraps to a line of its own.
- Give the number input the same `min`, `max`, and `step` as the slider, so the two still agree without JavaScript.
- `field.css` gives every number input tabular digits. The browser's own spin buttons still show.

## Wire the inputs

```js
import { enhanceRangeField } from "odd-design/enhance";

const cleanup = enhanceRangeField(document.getElementById("speed-row"), {
  message: ({ min, max }) => `Enter a speed from ${min} to ${max}.`,
});
```

`enhance()` does not find these rows, because the recipe has no class to find. Call `enhanceRangeField` on each row, after the slider has its final `min`, `max`, and `step`. It reads them once. `message` is optional. It returns a cleanup function.

## Behavior

- The slider holds the value. Read the slider, and listen to its `input` and `change` events, which fire for typed numbers too.
- Moving the slider writes the number.
- A typed number that fits moves the slider. The number input's own `input` and `change` events stop at the number input, so the page hears each change once.
- A number that is out of range or off step leaves the slider where it is. On `change`, the number input gets `aria-invalid="true"` and an `odd-error` after the row, named by its `aria-describedby`. The error goes when the number fits again.
- An empty number on `change` goes back to the slider's value.
- Without JavaScript, both inputs still work, unsynced.
