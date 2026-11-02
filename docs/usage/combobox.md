# Combobox usage rules

These codes apply to `odd-combobox`, `odd-combobox-list`, and `odd-combobox-option`. The input is Field's `odd-input`, so [ODD-FIELD-001](field.md#odd-field-001) and [ODD-FIELD-003](field.md#odd-field-003) govern it: an `input`, disabled with `disabled`, never `aria-disabled`. Shared codes are in [General usage rules](general.md).

```html
<div class="odd-field">
  <label class="odd-label" for="city" id="city-label">City</label>
  <div class="odd-combobox">
    <input class="odd-input" id="city" name="city" role="combobox" aria-controls="city-list" aria-expanded="false" aria-autocomplete="list">
    <div class="odd-combobox-list" id="city-list" popover="manual" role="listbox" aria-labelledby="city-label">
      <div class="odd-combobox-option" role="option">Amsterdam</div>
      <div class="odd-combobox-option" role="option" aria-disabled="true">Atlantis</div>
      <div class="odd-combobox-option" role="option">Berlin</div>
    </div>
  </div>
</div>
```

Use a combobox for a text field with suggestions that narrow as you type. A closed list with no typing is `select.odd-select`, and a list of actions is `odd-menu`. For search with suggestions, wrap the combobox in a plain `<search>` element. `odd-search` needs its own search input as a direct child.

`enhanceCombobox`, which `enhance()` runs on every `.odd-combobox`, adds the behavior. Focus stays in the input, so the caret, typing, and IME keep working.

- Typing filters the options by a case-insensitive prefix and opens the list with nothing active.
- ArrowDown and ArrowUp open the list at the first or last option, then move and wrap. They skip `aria-disabled` options.
- Enter chooses the active option. With nothing active, Enter closes the list and the form submits.
- Escape closes the list and keeps the text. A second Escape reaches a dialog around the combobox.
- Tab closes the list without choosing. Left, Right, Home, and End move the caret and clear the active option.
- A click on the input opens the list, and a click on an option chooses it. Focus stays in the input.

Choosing writes the option's text into the input and dispatches `input` (with `inputType` `insertReplacementText`) and `change`. The form submits the input's `name`, and any text is a valid value. Listen for `click` on the options to act on a choice: Enter clicks the active option, so one listener covers keyboard and pointer. A click on a disabled option never reaches your listeners.

When the built-in filter matches nothing, the open list shows one disabled option that reads "No results". The arrow keys skip it, and a click on it does nothing. A listbox may only hold options and groups, and a disabled option is the one row that keeps axe at 0 violations and is read in the accessibility tree in Firefox and WebKit. A plain row, a row with `role="none"`, and a group with text inside the listbox all fail axe `aria-required-children`.

## Options from your code

The options are the list's children. `enhanceCombobox` reads them on every event and watches them, so options you render later are filtered and shown as they land. When your code filters, for example on a server, set `data-filter="manual"` on the list. The combobox then shows every option present and opens the list when there is one. Render a disabled option yourself when the search returns nothing, since only your code knows whether a search is still running.

```js
input.addEventListener("input", async (event) => {
  if (event.inputType === "insertReplacementText") return; // the combobox wrote a chosen option
  const people = await search(input.value);
  list.replaceChildren(...people.map(toOption));
});
```

In React, `Combobox` renders the root and runs `enhanceCombobox` on it, `ComboboxList` renders the list, and `ComboboxOption` renders each option. The input is Field's `Input`. A controlled `Input` gets one `onChange` when an option is chosen.

```tsx
import { Combobox, ComboboxList, ComboboxOption, Field, Input, Label } from "odd-design/react";

<Field>
  <Label htmlFor="assignee" id="assignee-label">Assignee</Label>
  <Combobox>
    <Input id="assignee" role="combobox" aria-controls="assignee-list" aria-expanded="false" aria-autocomplete="list" value={query} onChange={(event) => setQuery(event.target.value)} />
    <ComboboxList id="assignee-list" popover="manual" role="listbox" aria-labelledby="assignee-label" data-filter="manual">
      {people.map((person) => (
        <ComboboxOption key={person.id} role="option" onClick={() => assign(person.id)}>
          {person.name}
        </ComboboxOption>
      ))}
      {searched && people.length === 0 && (
        <ComboboxOption role="option" aria-disabled="true">
          No results
        </ComboboxOption>
      )}
    </ComboboxList>
  </Combobox>
</Field>;
```

## ODD-COMBOBOX-001

Fails when `odd-combobox`, `odd-combobox-list`, or `odd-combobox-option` is on an element other than `div`.

A `button` option inside a form submits the form when it is clicked.

Put each class on a `div`. In React, use `Combobox`, `ComboboxList`, and `ComboboxOption`, which render divs.

## ODD-COMBOBOX-002

Fails when `odd-combobox` has no direct child with `role="combobox"`, or no direct child with `odd-combobox-list`.

`enhanceCombobox` looks for the input and the list among the root's children. A list outside the root never opens, and `combobox.css` cannot anchor it to the input: its width is wrong in both engines, and WebKit places it 156px off.

Put the `odd-input` with `role="combobox"` and the `odd-combobox-list` directly inside `odd-combobox`, the input first.

## ODD-COMBOBOX-003

Fails when an element with `role="combobox"` inside `odd-combobox` is not an `input`, or has no `aria-controls`, or the root has no direct `role="combobox"` child with `aria-autocomplete="list"`.

Without `aria-controls`, ArrowDown opens nothing, and axe reports nothing. `aria-autocomplete="list"` says the list filters as you type, which is the one mode the combobox has.

Put `role="combobox"` on the `odd-input`, set `aria-controls` to the list's `id`, and set `aria-autocomplete="list"`.

## ODD-COMBOBOX-004

Fails when `odd-combobox-list` has no `popover`, or a `popover` other than `manual`.

Without `popover`, the list sits in the page, always visible. With `popover` or `popover="auto"`, a press in the input closes the list as it opens.

Set `popover="manual"`. `enhanceCombobox` opens and closes the list. In React, `ComboboxList` requires `popover="manual"`.

## ODD-COMBOBOX-005

Fails when `odd-combobox-list` has no `role`, or a `role` other than `listbox`.

Options inside a list with no role, or with `role="menu"`, fail axe `aria-required-children` and `aria-required-parent`.

Set `role="listbox"`. A list of actions opened from a button is an `odd-menu`. In React, `ComboboxList` requires `role="listbox"`.

## ODD-COMBOBOX-006

Fails when `odd-combobox-list` has no non-empty `aria-label` or `aria-labelledby`.

The accessibility tree reads an unnamed `listbox`, and axe says nothing.

Point `aria-labelledby` at the label's `id`, or set `aria-label`. In React, `ComboboxList` with neither name is a type error.

## ODD-COMBOBOX-007

Fails when `data-filter` on `odd-combobox-list` is not `manual`, or when `odd-combobox` has `data-filter`.

`enhanceCombobox` reads `data-filter` only on the list. On the root it is ignored, and the built-in prefix filter hides the options your search matched in the middle of a name, so the list never opens.

Set `data-filter="manual"` on the list when your code filters, or remove it for the built-in filter. `auto` means remove the attribute.

## ODD-COMBOBOX-008

Fails when `odd-combobox-option` has no `role`, or a `role` other than `option`.

`enhanceCombobox` finds options by their role, so an option without it is never shown or chosen, and a list of them never opens.

Set `role="option"`. In React, `ComboboxOption` requires `role="option"`.

## ODD-COMBOBOX-009

Fails when an option has `disabled`, or `aria-disabled` with a value other than `true` or `false`.

A `div` ignores `disabled`. The option can still be chosen, is not announced as unavailable, and is drawn like the others.

Replace `disabled` with `aria-disabled="true"`. The arrow keys skip the option, a click on it does nothing, and a screen reader announces it as unavailable. In React, `disabled` on `ComboboxOption` is a type error.

## ODD-COMBOBOX-010

Fails when an option has `aria-selected`.

`enhanceCombobox` owns `aria-selected`. It marks the active option and erases a written value when the list opens, so in React the prop and the page disagree.

Remove `aria-selected`. In React, it is a type error on `ComboboxOption`.

## ODD-COMBOBOX-011

Fails when `odd-combobox` has a `role`.

`role="combobox"` on the wrapper is the ARIA 1.0 pattern. The accessibility tree reads an unnamed combobox around the real one, and axe says nothing.

Remove the role. The input carries `role="combobox"`.

## ODD-COMBOBOX-012

Fails when a combobox part has a system `data-*` attribute it does not read.

`combobox.css` reads no data attributes, so a system attribute such as `data-size` draws nothing.

Remove the attribute. `data-filter="manual"` goes on the list. App data attributes such as `data-testid` are fine.
