# Menu usage rules

These codes apply to `odd-menu` and `odd-menu-item`. A menu is an auto popover, so it shares [ODD-POPOVER-002](popover.md#odd-popover-002) with `odd-popover`. Shared codes are in [General usage rules](general.md).

```html
<button class="odd-button" commandfor="deck-actions" command="toggle-popover" aria-haspopup="menu">Deck actions</button>
<div class="odd-menu" id="deck-actions" popover role="menu" aria-label="Deck actions">
  <button class="odd-menu-item" role="menuitem">Rename</button>
  <button class="odd-menu-item" role="menuitem" aria-disabled="true">Merge</button>
  <hr class="odd-separator">
  <button class="odd-menu-item" role="menuitemcheckbox" aria-checked="true">Show prices</button>
  <p class="odd-menu-label" aria-hidden="true">Sort by</p>
  <div role="group" aria-label="Sort by">
    <button class="odd-menu-item" role="menuitemradio" aria-checked="true">Name</button>
    <button class="odd-menu-item" role="menuitemradio" aria-checked="false">Card count</button>
  </div>
  <hr class="odd-separator">
  <button class="odd-menu-item" role="menuitem" data-tone="danger">Delete deck</button>
</div>
```

The browser opens and closes the menu. `command="toggle-popover"` opens it under its trigger, and Escape or a click outside closes it and returns focus. `enhanceMenu`, which `enhance()` runs on every `.odd-menu[role="menu"]`, adds the menu keyboard. Focus lands on the first item, the arrows, Home, End, and typing move between items, and Tab closes. ArrowDown or ArrowUp on the trigger opens it at the first or last item. A `menuitem` closes the menu when chosen. Checkbox and radio items flip `aria-checked` and stay open. Listen for `click` on the items to act on them.

In React, `Menu` renders the `div` and runs `enhanceMenu` on it, and `MenuItem` renders each `button`. `Button` is the trigger. `enhanceMenu` owns `aria-checked` after the first render, so pass the first value and read the new one in `onClick`, where it has already flipped.

```tsx
import { Button, Menu, MenuItem, Separator } from "odd-design/react";

<Button commandfor="deck-actions" command="toggle-popover" aria-haspopup="menu">Deck actions</Button>
<Menu id="deck-actions" popover="auto" role="menu" aria-label="Deck actions">
  <MenuItem role="menuitem" onClick={rename}>Rename</MenuItem>
  <MenuItem role="menuitemcheckbox" aria-checked="true" onClick={(event) => setPrices(event.currentTarget.getAttribute("aria-checked") === "true")}>
    Show prices
  </MenuItem>
  <Separator />
  <MenuItem role="menuitem" tone="danger" onClick={remove}>Delete deck</MenuItem>
</Menu>;
```

## ODD-MENU-001

Fails when `odd-menu` is on an element other than `div`, or `odd-menu-item` is on an element other than `button`.

A `p` ends before its first block child, so the items after a separator or a group render in the page while the menu is closed. Enter and Space click only a button, so a `div` item does nothing when chosen from the keyboard. An `a` item with `href` ignores Space and is underlined.

Put `odd-menu` on a `div` with `popover` and `role="menu"`, and `odd-menu-item` on a `button`. In React, use `Menu` and `MenuItem`, which render those elements.

## ODD-MENU-002

Fails when `odd-menu` has no `role`, or a `role` other than `menu`.

`enhance()` wires only `.odd-menu[role="menu"]`. Without it the trigger still opens the menu, but focus stays on the trigger, and ArrowDown and the arrow keys inside do nothing.

Set `role="menu"`. For a popover that holds controls, use `odd-popover` with `role="dialog"`. In React, `Menu` requires `role="menu"`.

## ODD-MENU-003

Fails when `odd-menu` has no non-empty `aria-label` or `aria-labelledby`.

A screen reader announces only "menu" when it opens.

Point `aria-labelledby` at the trigger, or set `aria-label`. In React, `Menu` with neither name is a type error.

## ODD-MENU-004

Fails when `odd-menu` or `odd-menu-item` has a system `data-*` attribute it does not read.

`menu.css` reads `data-tone` on `odd-menu-item` and no data attribute on `odd-menu`, so `data-tone="danger"` on the menu changes nothing.

Remove the attribute, or move `data-tone` to the item. App data attributes such as `data-testid` are fine.

## ODD-MENU-005

Fails when `odd-menu-item` has no `role`, or a `role` other than `menuitem`, `menuitemcheckbox`, or `menuitemradio`.

`enhanceMenu` and the arrow keys reach only those roles, so the item is skipped and stays in the Tab order.

Set `role="menuitem"` for an action, `menuitemcheckbox` for a toggle, or `menuitemradio` for one choice in a group. In React, `MenuItem` requires `role`.

## ODD-MENU-006

Fails when `data-tone` on `odd-menu-item` is anything but `danger`.

`menu.css` styles only `danger`, so `info` or `warning` looks like a plain item.

Set `data-tone="danger"` on a destructive item, or remove it. In React, `tone` on `MenuItem` takes only `"danger"`.

## ODD-MENU-007

Fails when `odd-menu-item` has the `disabled` attribute.

The arrow keys skip a disabled button, so a keyboard user never reaches the item.

Replace `disabled` with `aria-disabled="true"`. The item stays reachable, and `enhanceMenu` stops its click before your listeners see it. In React, `disabled` on `MenuItem` is a type error.
