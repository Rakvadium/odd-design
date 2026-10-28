# Disclosure usage rules

These codes apply to `odd-disclosure`. Shared codes are in [General usage rules](general.md).

```html
<details class="odd-disclosure" name="faq" open>
  <summary>Does it need JavaScript?</summary>
  <div>No. These are native details elements, and sharing a name makes the group exclusive.</div>
</details>
```

A disclosure is a `details` element with a `summary` as a direct child. The `summary` holds the question and is the toggle. The answer follows in one element, such as a `div`, a `p`, or a `pre`. `open` opens it, and every `details` that shares a `name` belongs to one exclusive group, so opening one closes the others with no script. In React, `Disclosure` renders the `details`, and you write the `summary` and the answer element yourself. `open`, `name`, and `onToggle` are the native props.

## ODD-DISCLOSURE-001

Fails when `odd-disclosure` is on an element other than `details`.

Only `details` toggles by itself, keeps an `open` state, joins a `name` group, and animates its content through `::details-content`. On a `div` or `section`, the class draws a bottom border and nothing opens.

Move the class onto a `details`. In React, use `Disclosure`.

## ODD-DISCLOSURE-002

Fails when a disclosure has no `summary` as a direct child.

Without a direct `summary`, the browser draws its own label, a marker and the word Details, in place of the styled row. The question then sits inside the answer, so it is hidden while the disclosure is closed. A `summary` wrapped in a `div` does not count, and a `div` or `button` used as the trigger, the habit from headless accordion libraries, is not a toggle.

Make the question a `summary` that is a direct child of the `details`, and put the answer in one element after it. When the summary comes from a component or an expression, ESLint cannot see it and stays silent. The runtime checker still reads the rendered page.

## ODD-DISCLOSURE-003

Fails when a disclosure has a system `data-*` attribute that it does not read, such as `data-tone`.

`disclosure.css` reads no `data-*` attribute. Use `open` to open the disclosure and a shared `name` to group several. App data attributes, the appearance axes, and the headless allowlist stay allowed.

Remove the attribute.
