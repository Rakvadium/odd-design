# Choice usage rules

These codes apply to `odd-choice`, `odd-switch`, and `odd-segmented`. Shared codes are in [General usage rules](general.md).

```html
<label class="odd-choice"><input type="checkbox"> Weekly digest</label>
<label class="odd-choice"><input type="checkbox" role="switch" class="odd-switch"> Compact grid</label>
<fieldset class="odd-segmented">
  <legend>View</legend>
  <label><input type="radio" name="view" checked> Grid</label>
  <label><input type="radio" name="view"> List</label>
</fieldset>
```

The checkbox, radio, and switch are native inputs, so keyboard and forms work with no script. The other two parts are the `odd-choice` label and the `odd-segmented` fieldset, which wrap them. The checker reads one element at a time. It does not check the checkbox or radio inside `odd-choice`, or the `legend` and `label` children of `odd-segmented`. Write them as above.

## ODD-CHOICE-001

Fails when a choice class is on the wrong element.

| Class | Element |
| --- | --- |
| `odd-choice` | `label` |
| `odd-switch` | `input` |
| `odd-segmented` | `fieldset` |

A click on an `odd-choice` label toggles its input only when the class is on the `label`. The switch track is drawn on the `input`. The segmented control's radios group and announce through the `fieldset` and its `legend`.

Move the class onto its element.

## ODD-CHOICE-002

Fails when `odd-switch` has no `type` or no `role`, or when `type` is not `checkbox` or `role` is not `switch`.

Without `type="checkbox"` the input is a text box drawn as a track, and `:checked` never matches. Without `role="switch"` a screen reader announces a checkbox.

Set `type="checkbox"` and `role="switch"`.

## ODD-CHOICE-003

Fails when `odd-choice`, `odd-switch`, or `odd-segmented` has `aria-disabled`.

`aria-disabled` does not stop a click or Space from toggling the input, and `odd-choice` dims only through `:disabled`. The input stays live and looks enabled. This is the reverse of `odd-button`, which takes `aria-disabled` and forbids `disabled`. A disabled `odd-segmented` and a bare disabled `odd-switch` do not dim yet, as [Design debt](../follow-ups.md#design-debt) records.

Remove `aria-disabled` and use the native `disabled` attribute on the input, or on the `fieldset` of a segmented control. A native disabled input stops toggling, leaves the tab order, and matches `:disabled`. A disabled `fieldset` disables every radio in it.
