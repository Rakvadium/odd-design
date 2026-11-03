# Sheet usage rules

These codes apply to `odd-sheet`, `odd-sheet-header`, `odd-sheet-body`, and `odd-sheet-footer`. A sheet is a native modal `dialog`, so ODD-DIALOG-002 to ODD-DIALOG-006 in [Dialog usage rules](dialog.md) also apply to `odd-sheet`, and its title uses `odd-dialog-title`, which ODD-DIALOG-001 and ODD-DIALOG-008 rule. Shared codes are in [General usage rules](general.md).

In React, render `Sheet` from `odd-design/react`. It renders its trigger, the dialog, the header with the title and a Close button, the body, and the footer, so the structural and naming codes below cannot happen. [Open a dialog, a sheet, or a popover](react.md#open-a-dialog-a-sheet-or-a-popover) covers the props.

```tsx
<Sheet
  id="filters"
  side="start"
  trigger={<Button>Filters</Button>}
  title="Filters"
  dismissible
  actions={<><Button command="close">Reset</Button><Button variant="primary" command="close">Show 12 decks</Button></>}
>
  …
</Sheet>
```

The component compiles to this HTML:

```html
<button class="odd-button" type="button" command="show-modal" commandfor="filters">Filters</button>
<dialog class="odd-sheet" id="filters" aria-labelledby="filters-title" closedby="any" data-side="start">
  <div class="odd-sheet-header">
    <h2 class="odd-dialog-title" id="filters-title">Filters</h2>
    <button class="odd-button" id="filters-close" data-variant="ghost" data-icon-only aria-labelledby="filters-close-tooltip" interestfor="filters-close-tooltip" type="button" command="close" commandfor="filters">…</button>
    <span class="odd-tooltip" id="filters-close-tooltip" popover="hint" role="tooltip">Close</span>
  </div>
  <div class="odd-sheet-body">…</div>
  <div class="odd-sheet-footer">
    <button class="odd-button" type="button" command="close" commandfor="filters">Reset</button>
    <button class="odd-button" data-variant="primary" type="button" command="close" commandfor="filters">Show 12 decks</button>
  </div>
</dialog>
```

The browser does the rest with no JS, as for a dialog. `command="show-modal"` opens the sheet in the top layer, traps focus, makes the page behind it inert, and closes it on Escape. Focus returns to the opener when it closes, and starts on the first focusable control, which is the Close button in the header. `closedby="any"` adds a click outside.

The Close button's tooltip names it. Where the browser counts the focus that `showModal()` gives it as keyboard focus, as WebKit does, the tooltip opens with the sheet, and the first Escape closes the tooltip and the second closes the sheet, as WCAG 1.4.13 asks of content shown on focus.

The sheet slides in from the end edge. `data-side="start"`, `"top"`, or `"bottom"` moves it. `start` and the end follow the writing direction, so in a right-to-left page the default sheet is on the left. The header, body, and footer are the sheet's three grid rows, so keep them as its direct children. To submit, make the body a `form` with an `id`, and point each footer button at it with `form`, which is what `onSubmit` on `Sheet` renders.

## ODD-SHEET-001

Fails when a sheet class is on the wrong element. `odd-sheet` goes on `dialog`. `odd-sheet-header` and `odd-sheet-footer` go on `div`. `odd-sheet-body` goes on `div`, or on `form` to submit.

`odd-sheet` on a `div` or a `section` is never hidden. It sits just past the end edge of the page, Tab moves focus onto its buttons off screen, and a screen reader reads its content as part of the page. A `header` or a `footer` inside the sheet is read as a banner or contentinfo landmark. In HTML, a `p` ends before its first block child, so the controls inside a `p.odd-sheet-body` are parsed outside the scrolling body.

A `section.odd-sheet-body` breaks nothing measured. It keeps the three grid rows and adds no landmark in Firefox and WebKit. The rule still allows only `div` and `form`, so every sheet body is written one of two ways.

Move the class onto its element. In React, `Sheet` renders each part on its element.

## ODD-SHEET-002

Fails when `data-side` on `odd-sheet` is a value other than `start`, `top`, or `bottom`.

`sheet.css` styles only those three. Any other value, such as `left`, `right`, or a typo, slides the sheet in from the end edge. `end` is the default, so `data-side="end"` changes nothing and the checker asks you to remove it.

Set `start`, `top`, or `bottom`, or remove `data-side` for the end edge. In React, `side` on `Sheet` takes `"start"`, `"top"`, or `"bottom"`, and `data-side` is a type error (`ODD-REACT-001`).

## ODD-SHEET-003

Fails when `odd-sheet`, `odd-sheet-header`, `odd-sheet-body`, or `odd-sheet-footer` has a system `data-*` attribute, or a near miss of `data-side` on `odd-sheet`, such as `data-sid`.

`sheet.css` reads only `data-side` on `odd-sheet`, so `data-tone="danger"` changes nothing, and `data-sid="start"` leaves the sheet on the end edge.

Remove the attribute, or correct its name. App data attributes, the appearance axes, and the headless allowlist stay allowed. In React, a system `data-*` on `Sheet` is a type error (`ODD-REACT-002`).
