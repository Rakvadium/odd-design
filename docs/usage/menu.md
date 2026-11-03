# Menu usage rules

These codes apply to `odd-menu` and `odd-menu-item`. A menu is an auto popover, so it shares [ODD-POPOVER-002](popover.md#odd-popover-002) with `odd-popover`. Shared codes are in [General usage rules](general.md).

In React, render `Menu` from `odd-design/react` with `MenuItem`, `MenuCheckboxItem`, `MenuRadioGroup` and `MenuRadioItem`, `MenuGroup`, and `MenuSeparator` inside it. It renders its trigger, the menu, each item's role, and each group's name, so the structural codes below cannot happen. [Open a menu](react.md#open-a-menu) covers the props.

```tsx
<Menu id="deck-actions" label="Deck actions" trigger={<Button>Deck actions</Button>}>
  <MenuItem shortcut="F2" onClick={rename}>Rename</MenuItem>
  <MenuItem disabled>Merge</MenuItem>
  <MenuSeparator />
  <MenuCheckboxItem defaultChecked onClick={(event) => setPrices(event.currentTarget.getAttribute("aria-checked") === "true")}>Show prices</MenuCheckboxItem>
  <MenuRadioGroup label="Sort by" id="deck-sort">
    <MenuRadioItem defaultChecked>Name</MenuRadioItem>
    <MenuRadioItem>Card count</MenuRadioItem>
  </MenuRadioGroup>
  <MenuSeparator />
  <MenuItem tone="danger" onClick={remove}>Delete deck</MenuItem>
</Menu>
```

The component compiles to this HTML:

```html
<button class="odd-button" type="button" command="toggle-popover" commandfor="deck-actions" aria-haspopup="menu">Deck actions</button>
<div class="odd-menu" id="deck-actions" popover="auto" role="menu" aria-label="Deck actions">
  <button class="odd-menu-item" type="button" role="menuitem" aria-keyshortcuts="F2">Rename<kbd class="odd-menu-shortcut" aria-hidden="true">F2</kbd></button>
  <button class="odd-menu-item" type="button" role="menuitem" aria-disabled="true">Merge</button>
  <hr class="odd-separator">
  <button class="odd-menu-item" type="button" role="menuitemcheckbox" aria-checked="true">Show prices</button>
  <p class="odd-menu-label" id="deck-sort-label" aria-hidden="true">Sort by</p>
  <div id="deck-sort" role="group" aria-labelledby="deck-sort-label">
    <button class="odd-menu-item" type="button" role="menuitemradio" aria-checked="true">Name</button>
    <button class="odd-menu-item" type="button" role="menuitemradio" aria-checked="false">Card count</button>
  </div>
  <hr class="odd-separator">
  <button class="odd-menu-item" type="button" role="menuitem" data-tone="danger">Delete deck</button>
</div>
```

The browser opens and closes the menu. `command="toggle-popover"` opens it under its trigger, and Escape or a click outside closes it and returns focus. `enhanceMenu`, which `enhance()` runs on every `.odd-menu[role="menu"]`, adds the menu keyboard. Focus lands on the first item, the arrows, Home, End, and typing move between items, and Tab closes. ArrowDown or ArrowUp on the trigger opens it at the first or last item. A `menuitem` closes the menu when chosen. Checkbox and radio items flip `aria-checked` and stay open. Listen for `click` on the items to act on them. `enhanceMenu` also gives an item with no `type` the type `button` when it wires the menu and each time it opens, so an item inside a form does not submit it.

The group label is hidden from the accessibility tree, because a menu holds only items, groups, and separators. The group takes its name from the hidden label through `aria-labelledby`, which reads hidden text.

`enhanceMenu` keeps the choices the user makes. When it runs again on the same menu, it writes those choices back onto the items, so a render that writes `aria-checked` again cannot undo a choice. `Menu` runs it after every render.

## ODD-MENU-001

Fails when `odd-menu` is on an element other than `div`, or `odd-menu-item` is on an element other than `button`.

A `p` ends before its first block child, so the items after a separator or a group render in the page while the menu is closed. Enter and Space click only a button, so a `div` item does nothing when chosen from the keyboard. An `a` item with `href` ignores Space and is underlined.

Put `odd-menu` on a `div` with `popover` and `role="menu"`, and `odd-menu-item` on a `button`. In React, `Menu` and its items render those elements.

## ODD-MENU-002

Fails when `odd-menu` has no `role`, or a `role` other than `menu`.

`enhance()` wires only `.odd-menu[role="menu"]`. Without it the trigger still opens the menu, but focus stays on the trigger, and ArrowDown and the arrow keys inside do nothing.

Set `role="menu"`. For a popover that holds controls, use `odd-popover` with `role="dialog"`. In React, `Menu` writes `role="menu"`, and `role` on it is a type error (`ODD-REACT-001`).

## ODD-MENU-003

Fails when `odd-menu` has no non-empty `aria-label` or `aria-labelledby`.

A screen reader announces only "menu" when it opens.

Point `aria-labelledby` at the trigger, or set `aria-label`. In React, `label` is required on `Menu`, which names the menu by it, and a blank `label` throws this code outside production.

## ODD-MENU-004

Fails when `odd-menu` or `odd-menu-item` has a system `data-*` attribute it does not read.

`menu.css` reads `data-tone` on `odd-menu-item` and no data attribute on `odd-menu`, so `data-tone="danger"` on the menu changes nothing.

Remove the attribute, or move `data-tone` to the item. App data attributes such as `data-testid` are fine.

## ODD-MENU-005

Fails when `odd-menu-item` has no `role`, or a `role` other than `menuitem`, `menuitemcheckbox`, or `menuitemradio`.

`enhanceMenu` and the arrow keys reach only those roles, so the item is skipped and stays in the Tab order.

Set `role="menuitem"` for an action, `menuitemcheckbox` for a toggle, or `menuitemradio` for one choice in a group. In React, `MenuItem`, `MenuCheckboxItem`, and `MenuRadioItem` each write their role, and `role` on them is a type error (`ODD-REACT-001`).

## ODD-MENU-006

Fails when `data-tone` on `odd-menu-item` is anything but `danger`.

`menu.css` styles only `danger`, so `info` or `warning` looks like a plain item.

Set `data-tone="danger"` on a destructive item, or remove it. In React, `tone` on `MenuItem` takes only `"danger"`.

## ODD-MENU-007

Fails when `odd-menu-item` has the `disabled` attribute.

The arrow keys skip a disabled button, so a keyboard user never reaches the item.

Replace `disabled` with `aria-disabled="true"`. The item stays reachable, and `enhanceMenu` stops its click before your listeners see it. In React, `disabled` on an item writes `aria-disabled="true"`.
