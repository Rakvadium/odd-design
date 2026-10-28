# Popover usage rules

These codes apply to `odd-popover`. Shared codes are in [General usage rules](general.md).

```html
<button class="odd-button" commandfor="filters" command="toggle-popover">Filters</button>
<div class="odd-popover" id="filters" popover role="dialog" aria-labelledby="filters-title">
  <p class="odd-eyebrow" id="filters-title">Filter decks</p>
  <label class="odd-choice"><input type="checkbox" checked> Legal only</label>
  <button class="odd-button" data-size="sm" commandfor="filters" command="hide-popover">Apply</button>
</div>

<div class="odd-popover" id="rules" popover>Banned cards are marked in red.</div>
```

The browser does the rest with no JS. `command="toggle-popover"` opens the popover in the top layer, under its trigger. Escape, a click outside, or a `hide-popover` button closes it and returns focus to the trigger, and the trigger exposes its expanded state. A popover that holds controls takes `role="dialog"` and a name. A popover that only shows text takes neither.

In React, `Popover` renders the `div`, and `Button` takes `commandfor` and `command`. The part holds no state. To read the open state, listen to `onToggle`.

```tsx
import { Button, Choice, Popover } from "odd-design/react";

<Button commandfor="filters" command="toggle-popover">Filters</Button>
<Popover id="filters" popover="auto" role="dialog" aria-labelledby="filters-title">
  <p className="odd-eyebrow" id="filters-title">Filter decks</p>
  <Choice><input type="checkbox" defaultChecked /> Legal only</Choice>
  <Button size="sm" commandfor="filters" command="hide-popover">Apply</Button>
</Popover>;

<Popover id="rules" popover="auto">Banned cards are marked in red.</Popover>;
```

These rules cover `odd-popover` only. `odd-tooltip` and `odd-hover-card` take `popover="hint"`, and `odd-menu` takes `role="menu"`.

## ODD-POPOVER-001

Fails when `odd-popover` is on an element other than `div`.

A `p` ends before its first block child, so the controls render in the page while the popover is closed. A `section` with a name becomes a region landmark. A `span` or a `button` cannot hold the controls a popover takes.

Put `odd-popover` on a `div` with `popover`. In React, use `Popover`, which renders the `div`.

## ODD-POPOVER-002

Fails when `odd-popover` has no `popover`, or a `popover` other than no value or `auto`.

With no `popover`, the box stays in the page at opacity 0. Its controls still take focus and are read out, and its trigger does nothing. `popover="manual"`, and any token the browser does not know, such as `yes`, ignores Escape and a click outside. `popover="hint"` closes when any other popover opens, which suits `odd-tooltip` and `odd-hover-card`, not a popover.

Write `popover` with no value in HTML, or `popover="auto"`. In React, `Popover` requires `popover`, and it takes `""` or `"auto"`.

## ODD-POPOVER-003

Fails when `odd-popover` has a `role` other than `dialog`.

A `menu` role without `enhanceMenu` has no arrow keys. A `tooltip` belongs on `odd-tooltip`. `alertdialog` claims a modal alert, and a popover is not modal.

Set `role="dialog"` on a popover that holds controls, and no role on one that only shows text. For a menu, use `odd-menu` with `enhanceMenu`. For a tooltip, use `odd-tooltip`. In React, `role` on `Popover` takes only `"dialog"`.

## ODD-POPOVER-004

Fails when an `odd-popover` with `role="dialog"` has no non-empty `aria-label` or `aria-labelledby`. A blank name such as `aria-label=" "` fails too.

A screen reader announces only "dialog", with no hint of what the controls are for.

Point `aria-labelledby` at the popover title, or set `aria-label`. In React, `role="dialog"` on `Popover` with neither name is a type error.

## ODD-POPOVER-005

Fails when `odd-popover` has a non-empty `aria-label` or `aria-labelledby` and no `role`.

A generic `div` drops the name. The open popover is read as its content, with no container and no name.

Add `role="dialog"`, or remove the name on a popover that only shows text. In React, a name on `Popover` with no `role` is a type error.

## ODD-POPOVER-006

Fails when `odd-popover` has a system `data-*` attribute.

`popover.css` reads no data attributes, so `data-tone="danger"` and `data-size="sm"` change nothing.

Remove the attribute. App data attributes, the appearance axes, and the headless allowlist stay allowed.
