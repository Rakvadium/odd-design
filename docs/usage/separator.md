# Separator usage rules

These codes apply to `odd-separator`. Shared codes are in [General usage rules](general.md).

```html
<hr class="odd-separator">
<div class="odd-row">
  <a href="/edit">Edit</a>
  <hr class="odd-separator" aria-orientation="vertical">
  <a href="/export">Export</a>
</div>
```

A separator is an `hr`, and screen readers announce it as a separator. A horizontal line needs no attribute. A line between inline items is `aria-orientation="vertical"` inside an `odd-row`, which stretches it to the row's height. In React, `Separator` renders the `hr`, and you pass `aria-orientation` as on the element. `Separator` takes no children.

## ODD-SEPARATOR-001

Fails when `odd-separator` is not on an `hr`.

An `hr` is a separator with no role or label. A `div` with the class draws the same line and is read as nothing, or as a generic group when it has children.

Move the class onto an `hr`. In React, use `Separator`, which renders one.

## ODD-SEPARATOR-002

Fails when `aria-orientation` is not `horizontal` or `vertical`, or when `odd-separator` has `data-orientation`.

`separator.css` turns the line only for `aria-orientation="vertical"`. Any other value, such as `verticle` or `Vertical`, draws a horizontal line between the items of a row. `data-orientation` is the attribute shadcn and Radix separators set, and the stylesheet does not read it, so `data-orientation="vertical"` also leaves the line horizontal.

Set `aria-orientation="vertical"` for a vertical line, or remove `aria-orientation` for a horizontal line. Remove `data-orientation`. In React, `aria-orientation` takes only `"horizontal"` or `"vertical"`, and `data-orientation` is a type error.

## ODD-SEPARATOR-003

Fails when `odd-separator` has a `role` other than `separator`, or has `aria-hidden`.

An `hr` is already a separator. `role="none"`, `role="presentation"`, or `aria-hidden="true"` hides it, so the line shows a break that screen readers skip. A component library's decorative separator renders `role="none"`. `separator.css` asks for a border on the container instead of a separator element when the line means nothing.

Remove `role` and `aria-hidden`. For a line that means nothing, draw a border on the container. In React, `role` on `Separator` takes only `"separator"`, and `aria-hidden` is a type error.

## ODD-SEPARATOR-004

Fails when `odd-separator` has a system `data-` attribute.

A separator reads no `data-` attribute. `data-tone` and `data-size` belong to other components, and `separator.css` ignores them. An app `data-` attribute passes. The appearance axes and the headless allowlist pass, except `data-orientation`, which is ODD-SEPARATOR-002.

Remove the attribute. In React, passing a system `data-` attribute such as `data-tone` to `Separator` is a type error.
