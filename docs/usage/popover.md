# Popover usage rules

These codes apply to `odd-popover`. Shared codes are in [General usage rules](general.md).

In React, render `Popover` from `odd-design/react`. It renders its trigger and the popover, and its `title` decides the role and the name together, so the structural and naming codes below cannot happen. [Open a dialog, a sheet, or a popover](react.md#open-a-dialog-a-sheet-or-a-popover) covers the props.

```tsx
<Popover id="filters" trigger={<Button>Filters</Button>} title="Filter decks">
  <Checkbox label="Legal only" defaultChecked />
  <Button size="sm" command="close">Apply</Button>
</Popover>

<Popover id="rules" trigger={<Button>Rules</Button>}>Banned cards are marked in red.</Popover>
```

The component compiles to this HTML:

```html
<button class="odd-button" type="button" command="toggle-popover" commandfor="filters">Filters</button>
<div class="odd-popover" id="filters" popover="auto" role="dialog" aria-labelledby="filters-title">
  <div class="odd-stack">
    <p class="odd-eyebrow" id="filters-title">Filter decks</p>
    <label class="odd-choice"><input type="checkbox" checked>Legal only</label>
    <button class="odd-button" data-size="sm" type="button" command="hide-popover" commandfor="filters">Apply</button>
  </div>
</div>

<button class="odd-button" type="button" command="toggle-popover" commandfor="rules">Rules</button>
<div class="odd-popover" id="rules" popover="auto">
  <div class="odd-stack">Banned cards are marked in red.</div>
</div>
```

The browser does the rest with no JS. `command="toggle-popover"` opens the popover in the top layer, under its trigger. Escape, a click outside, or a `hide-popover` button closes it and returns focus to the trigger, and the trigger exposes its expanded state. A popover that holds controls takes `role="dialog"` and a name. A popover that only shows text takes neither. To read the open state in React, listen to `onToggle`.

These rules cover `odd-popover` only. `odd-tooltip` and `odd-hover-card` take `popover="hint"`, and `odd-menu` takes `role="menu"`.

## ODD-POPOVER-001

Fails when `odd-popover` is on an element other than `div`.

A `p` ends before its first block child, so the controls render in the page while the popover is closed. A `section` with a name becomes a region landmark.

Put `odd-popover` on a `div` with `popover`. In React, `Popover` renders the `div`.

## ODD-POPOVER-002

Fails when `odd-popover` or `odd-menu` has no `popover`, or a `popover` other than no value or `auto`.

With no `popover`, the box stays in the page at opacity 0. A popover's controls still take focus and are read out, a closed menu and its first items stay in the accessibility tree, and its trigger does nothing. `popover="manual"` ignores Escape and a click outside, and so does an unknown token such as `yes`, which acts as `manual`. `popover="hint"` closes when an `auto` popover or another `hint` opens, and a `manual` popover leaves it open. That suits `odd-tooltip` and `odd-hover-card`, not a popover or a [menu](menu.md).

Write `popover` with no value in HTML, or `popover="auto"`. In React, `Popover` writes `popover="auto"`, and `Menu` requires `popover` and takes `""` or `"auto"`.

## ODD-POPOVER-003

Fails when `odd-popover` has a `role` other than `dialog`.

A `menu` role without `enhanceMenu` has no arrow keys. A `tooltip` belongs on `odd-tooltip`. `alertdialog` claims a modal alert, and a popover is not modal.

Set `role="dialog"` on a popover that holds controls, and no role on one that only shows text. For a menu, use `odd-menu` with `enhanceMenu`. For a tooltip, use `odd-tooltip`. In React, `Popover` writes `role="dialog"` when it has a `title`, and `role` on it is a type error (`ODD-REACT-001`).

## ODD-POPOVER-004

Fails when an `odd-popover` with `role="dialog"` has no non-empty `aria-label` or `aria-labelledby`. A blank name such as `aria-label=" "` fails too.

A screen reader announces only "dialog", with no hint of what the controls are for.

Point `aria-labelledby` at the popover title, or set `aria-label`. In React, `Popover` names itself by its `title`, and a blank `title` throws this code outside production.

## ODD-POPOVER-005

Fails when `odd-popover` has a non-empty `aria-label` or `aria-labelledby` and no `role`.

A generic `div` drops the name. The open popover is read as its content, with no container and no name.

Add `role="dialog"`, or remove the name on a popover that only shows text. In React, `Popover` writes the role and the name together, from `title`.

## ODD-POPOVER-006

Fails when `odd-popover` has a system `data-*` attribute.

`popover.css` reads no data attributes, so `data-tone="danger"` and `data-size="sm"` change nothing.

Remove the attribute. App data attributes, the appearance axes, and the headless allowlist stay allowed.
