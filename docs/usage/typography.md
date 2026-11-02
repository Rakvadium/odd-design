# Typography usage rules

These codes apply to `odd-heading` and `odd-eyebrow`. Shared codes are in [General usage rules](general.md).

```html
<p class="odd-eyebrow" data-tone="primary">Season 4</p>
<h2 class="odd-heading" data-size="xl">Your collection</h2>
```

`odd-heading` sets a heading's size apart from its level. Pick the level for the outline and `data-size` for the layout. A heading without `data-size` is the md size. `odd-eyebrow` is a short label above a heading. It is muted unless `data-tone` sets `primary` or `foreground`. Neither class has a React part. Write them as native markup.

## ODD-TYPOGRAPHY-001

Fails when `odd-heading` is not on an `h1` to `h6`.

A `div` or `p` with the class looks like a title, but heading navigation and the document outline skip it.

Move `odd-heading` onto the heading level the outline needs, and set the look with `data-size`.

## ODD-TYPOGRAPHY-002

Fails when `data-size` on `odd-heading` is not `xs`, `sm`, `lg`, `xl`, `2xl`, or `hero`.

`typography.css` styles only those six. `md` is the default and means remove the attribute. Any other value, such as `3xl` or `large`, renders at the md size with no warning.

Set one of the six sizes, or remove `data-size` for the md size.

## ODD-TYPOGRAPHY-003

Fails when `data-tone` on `odd-eyebrow` is not `primary` or `foreground`.

`typography.css` colors only those two tones. Any other value, such as `danger` copied from a badge, leaves the eyebrow muted.

Set `primary` or `foreground`, or remove `data-tone` for the muted eyebrow.
