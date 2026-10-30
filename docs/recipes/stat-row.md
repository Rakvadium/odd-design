# Stat row

A stat row puts a label and its value on one line, with a bar under them. It is a recipe, so it has no class of its own and needs no JavaScript. `odd-stack` stacks the line over the bar, and `odd-row` spreads the label and the value. The story is under **Recipes → Stat row** in the HTML Storybook.

## Markup

```html
<div class="odd-stack" style="--gap: var(--space-1)">
  <div class="odd-row" style="justify-content: space-between">
    <label class="odd-muted" for="actions">Actions</label>
    <span class="odd-stat-value">22 <span class="odd-muted">(37%)</span></span>
  </div>
  <meter class="odd-meter" id="actions" min="0" max="60" value="22" data-tone="info"></meter>
</div>
```

- The `label` names the bar through `for`. It is a bare `label` with `odd-muted`, not an `odd-label`, so it reads as body text.
- `odd-stat-value` sets the value bold, with tabular digits. Put it on a `span`, or on an `output` that follows a control.
- `justify-content: space-between` moves the value to the end of the line. Leave it out to keep the value beside the label.
- The bar is an `odd-meter` or an `odd-progress`, and it fills the stack's width. Show the value as text too, because the bar alone is not enough.
- A stat with no bar is the `odd-row` alone.

## In React

`Meter` and `Progress` from `odd-design/react` render the bar. Write the rest of the row as native markup, as above.
