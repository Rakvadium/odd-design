# Table usage rules

These codes apply to `odd-table-wrap`, `odd-table`, and `odd-table-sort`. Shared codes are in [General usage rules](general.md).

```html
<div class="odd-table-wrap" tabindex="0" role="region" aria-labelledby="decks-caption">
  <table class="odd-table">
    <caption id="decks-caption">Your decks</caption>
    <thead>
      <tr>
        <th scope="col"><input type="checkbox" data-select-all aria-label="Select all decks"></th>
        <th scope="col" aria-sort="ascending"><button class="odd-table-sort">Deck</button></th>
        <th scope="col" data-numeric>Cards</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><input type="checkbox" aria-label="Select Ember Aggro"></td><th scope="row">Ember Aggro</th><td data-numeric>60</td></tr>
    </tbody>
  </table>
</div>
```

The wrap scrolls sideways when the table is wider than the page. `tabindex="0"`, `role="region"`, and a name let a keyboard user reach and scroll it. Drop all three if the table can never overflow. `data-numeric` goes on a `th` and its `td` cells. `aria-sort` goes on the sorted column's `th` only, and the page sorts the rows and moves `aria-sort`. `enhanceSelectAll`, which `enhance()` runs on every `table:has([data-select-all])`, makes the header box check or clear every row and show checked, mixed, or unchecked. It clicks each row it changes, so row listeners and React's `onChange` see the change.

In React, `TableWrap` renders the `div`, `Table` renders the `table` and runs `enhanceSelectAll` on it after every commit, and `TableSort` renders each sort `button`. Write the caption, sections, rows, cells, and checkboxes as plain elements. Leave the header box uncontrolled, with no `checked`, because `Table` owns it. Row boxes can be uncontrolled or controlled with `onChange`, and a header click reaches each changed row's `onChange` once.

React sets a controlled box's `checked` without a `change` event, so `Table` resyncs the header box each time it renders. A row list that re-renders on its own, such as a memoized `tbody` component, leaves the header box stale until `Table` renders again or a box changes.

```tsx
import { Table, TableSort, TableWrap } from "odd-design/react";

<TableWrap tabIndex={0} role="region" aria-labelledby="decks-caption">
  <Table>
    <caption id="decks-caption">Your decks</caption>
    <thead>
      <tr>
        <th scope="col"><input type="checkbox" data-select-all aria-label="Select all decks" /></th>
        <th scope="col" aria-sort="ascending"><TableSort onClick={sortByName}>Deck</TableSort></th>
        <th scope="col" data-numeric>Cards</th>
      </tr>
    </thead>
    <tbody>
      {decks.map((deck) => (
        <tr key={deck.id}>
          <td><input type="checkbox" aria-label={`Select ${deck.name}`} checked={selected.has(deck.id)} onChange={() => toggle(deck.id)} /></td>
          <th scope="row">{deck.name}</th>
          <td data-numeric>{deck.cards}</td>
        </tr>
      ))}
    </tbody>
  </Table>
</TableWrap>;
```

## ODD-TABLE-001

Fails when `odd-table-wrap` is not on a `div`, `odd-table` is not on a `table`, or `odd-table-sort` is not on a `button`.

A `span` wrap does not scroll, so a wide table runs off the page. A `p` wrap ends before the table, so the table falls outside the border and the scroll. `odd-table` on a `div` around the table leaves the table at its content width. A `span` sort control is not in the Tab order. An `a` sort control is underlined, and Safari skips it on Tab.

Put each class on its element. In React, use `TableWrap`, `Table`, and `TableSort`.

## ODD-TABLE-002

Fails when `odd-table-wrap` has `tabindex`, `aria-label`, or `aria-labelledby` but no `role`, or a `role` other than `region`.

A screen reader drops the name of a plain `div`, so focus lands on the scroll area and nothing names it. Another role announces the wrap as that role.

Set `role="region"`. In React, `TableWrap` with `tabIndex` or a name and no `role` is a type error.

## ODD-TABLE-003

Fails when `odd-table-wrap` has `role="region"` and no non-empty `aria-label` or `aria-labelledby`.

A screen reader announces only "region" when focus enters it.

Give the caption an `id` and point `aria-labelledby` at it, or set `aria-label`. In React, `TableWrap` with `role="region"` and neither name is a type error.

## ODD-TABLE-004

Fails when the wrap, the table, or a sort button has a system `data-*` attribute, or a near miss of one.

`table.css` reads `data-numeric` on a `th` and its `td` cells, so on the wrap or the table it does nothing. On a sort button, the column header stays start-aligned and the arrow stays after the label.

Move `data-numeric` to the `th` and its cells. In React, `data-numeric` on `TableWrap`, `Table`, or `TableSort` is a type error.

## ODD-TABLE-005

Fails when `odd-table-sort` has `aria-sort`.

`table.css` reads `aria-sort` on the `th` around the button. On the button, the arrow stays the neutral up-down mark.

Move `aria-sort` to the `th` that holds the button. In React, `aria-sort` on `TableSort` is a type error.
