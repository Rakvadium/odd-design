# Field usage rules

These codes apply to `odd-field` and its parts. Shared codes are in [General usage rules](general.md). For a text field with suggestions that filter as you type, put the input in an `odd-combobox` ([Combobox usage rules](combobox.md)).

```html
<div class="odd-field">
  <label class="odd-label" for="email">Email</label>
  <input class="odd-input" id="email" aria-describedby="email-hint">
  <p class="odd-hint" id="email-hint">We never share it.</p>
</div>
```

The checker reads one element at a time. It does not check that `for`, `id`, and `aria-describedby` point at each other. Wire them as above.

## ODD-FIELD-001

Fails when a field class is on the wrong element.

| Class | Element |
| --- | --- |
| `odd-field` | `div` |
| `odd-input` | `input` |
| `odd-textarea` | `textarea` |
| `odd-select` | `select` |
| `odd-hint` | `p` |
| `odd-error` | `p` |

The styles assume the native element. A `div` with `odd-input` looks like a field and takes no input.

Move the class onto its element.

## ODD-FIELD-002

Fails when `odd-error` has `hidden` or `aria-hidden`.

A screen reader still announces a hidden element that `aria-describedby` references. A hidden error reads as if the field were invalid.

Render `odd-error` only while the field is invalid. Then set `aria-invalid="true"` on the control, and add the error's `id` to its `aria-describedby`. Remove `hidden` and `aria-hidden`.

## ODD-FIELD-003

Fails when `odd-input`, `odd-textarea`, or `odd-select` has `aria-disabled`.

`aria-disabled` does not stop typing, and the field styles only `:disabled`. The control stays editable and looks enabled. This is the reverse of `odd-button`, which takes `aria-disabled` and forbids `disabled`.

Remove `aria-disabled` and set `disabled`.
