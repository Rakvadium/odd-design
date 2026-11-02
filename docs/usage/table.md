# Table usage rules

These codes apply to `odd-table-wrap`, `odd-table`, and `odd-table-sort`. Shared codes are in [General usage rules](general.md).

In React, render `Table` from `odd-design/react`. It renders the wrap, the caption and its id, the region's name, each `th` with its `scope`, one `aria-sort`, each sort button as its `th`'s only child, `data-numeric` on a column's header and cells, the select-all box in `thead`, and a named checkbox per row, so the codes below cannot happen. [Build a table](react.md#build-a-table) covers the props.

```tsx
<Table
  id="decks"
  caption="Your decks"
  rows={decks}
  rowKey={(deck) => deck.id}
  columns={[
    { key: "name", header: "Deck", rowHeader: true, cell: (deck) => deck.name },
    { key: "cards", header: "Cards", numeric: true, cell: (deck) => deck.cards },
  ]}
  sortable={["name"]}
  sort={{ column: "name", direction: "ascending" }}
  onSortChange={setSort}
  selection={{ selected, onChange: setSelected, label: (deck) => `Select ${deck.name}`, allLabel: "Select all decks" }}
/>
```

The component compiles to this HTML:

```html
<div class="odd-table-wrap" tabindex="0" role="region" aria-labelledby="decks-caption">
  <table class="odd-table" id="decks">
    <caption id="decks-caption">Your decks</caption>
    <thead>
      <tr>
        <th scope="col"><input type="checkbox" data-select-all aria-label="Select all decks"></th>
        <th scope="col" aria-sort="ascending"><button class="odd-table-sort" type="button">Deck</button></th>
        <th scope="col" data-numeric>Cards</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><input type="checkbox" aria-label="Select Ember Aggro"></td><th scope="row">Ember Aggro</th><td data-numeric>60</td></tr>
    </tbody>
  </table>
</div>
```

The wrap scrolls sideways when the table is wider than the page. `tabindex="0"`, `role="region"`, and a name let a keyboard user reach and scroll it. Drop all three if the table can never overflow. `data-numeric` goes on a `th` and its `td` cells. `aria-sort` goes on the sorted column's `th` only, and the page sorts the rows and moves `aria-sort`. No script wires a sort button, so write `type="button"` on it, or a click inside a form submits the form. `enhanceSelectAll`, which `enhance()` runs on every `table:has([data-select-all])`, makes the header box check or clear every row and show checked, mixed, or unchecked. It clicks each row it changes, so row listeners and React's `onChange` see the change.

## ODD-TABLE-001

Fails when `odd-table-wrap` is not on a `div`, `odd-table` is not on a `table`, or `odd-table-sort` is not on a `button`.

A `span` wrap does not scroll, so a wide table runs off the page. A `p` wrap ends before the table, so the table falls outside the border and the scroll. `odd-table` on a `div` around the table leaves the table at its content width. A `span` sort control is not in the Tab order. An `a` sort control is underlined, and Safari skips it on Tab.

Put each class on its element. In React, use `Table`.

## ODD-TABLE-002

Fails when `odd-table-wrap` has `tabindex`, `aria-label`, or `aria-labelledby` but no `role`, or a `role` other than `region`.

A screen reader drops the name of a plain `div`, so focus lands on the scroll area and nothing names it. Another role announces the wrap as that role.

Set `role="region"`. In React, `Table` writes all three, or none with `scrollable={false}`.

## ODD-TABLE-003

Fails when `odd-table-wrap` has `role="region"` and no non-empty `aria-label` or `aria-labelledby`.

A screen reader announces only "region" when focus enters it.

Give the caption an `id` and point `aria-labelledby` at it, or set `aria-label`. In React, `Table` names its region by its `caption`, and a blank `caption` throws this code outside production.

## ODD-TABLE-004

Fails when the wrap, the table, or a sort button has a system `data-*` attribute, or a near miss of one.

`table.css` reads `data-numeric` on a `th` and its `td` cells, so on the wrap or the table it does nothing. On a sort button, the column header stays start-aligned and the arrow stays after the label.

Move `data-numeric` to the `th` and its cells. In React, set `numeric` on the column, and `data-numeric` on `Table` is a type error (`ODD-REACT-002`).

## ODD-TABLE-005

Fails when `odd-table-sort` has `aria-sort`.

`table.css` reads `aria-sort` on the `th` around the button. On the button, the arrow stays the neutral up-down mark.

Move `aria-sort` to the `th` that holds the button. In React, `sort` writes it on the sorted column's `th`.

## ODD-TABLE-006

Fails when a box with `data-select-all` inside `odd-table` has no `aria-label` or `aria-labelledby`, or an empty one.

The header box usually has no visible text. Without a name, a screen reader announces only "checkbox", so nothing says that it checks or clears every row.

Set `aria-label` on the header box, such as `aria-label="Select all decks"`, or point `aria-labelledby` at text that says what it selects. In React, write it on the plain `input` inside `Table`.
