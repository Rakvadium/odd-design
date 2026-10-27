# Alert usage rules

These codes apply to `odd-alert` and `odd-alert-title`. Shared codes are in [General usage rules](general.md).

```html
<div class="odd-alert">
  <svg aria-hidden="true"></svg>
  <div>
    <p class="odd-alert-title">Drafts are private</p>
    <p>Only you can see a deck until you publish it.</p>
  </div>
</div>
<div class="odd-alert" data-tone="warning">
  <svg aria-hidden="true"></svg>
  <div>
    <p class="odd-alert-title">Rotation is coming</p>
    <p>Three of your decks lose legality on May 1.</p>
  </div>
</div>
```

`data-tone` colors the border, the tint, and the icon. The text stays `--foreground`. No `data-tone` is the neutral tint. The title is a label, not a heading. In React, `Alert` renders the `div` and `AlertTitle` renders the `p`. Pass `tone` to `Alert`. The icon and the body `div` stay yours.

A message that is on the page from the start needs no role. For one that appears later, keep an empty `role="status"` container on the page, or `role="alert"` for an error, and insert the alert into it.

## ODD-ALERT-001

Fails when `odd-alert` is not on a `div`, or `odd-alert-title` is not on a `p`.

`alert.css` and every story use those elements. The title uses the label font. It is not a heading, and `odd-heading` is the heading class.

| Class | Element |
| --- | --- |
| `odd-alert` | `div` |
| `odd-alert-title` | `p` |

Move the class onto its element. In React, use `Alert` and `AlertTitle`, which render those elements.

## ODD-ALERT-002

Fails when `data-tone` is not `info`, `success`, `warning`, or `danger`.

`alert.css` selects only those four. Any other value keeps the neutral tint, so a misspelled tone looks like a working neutral alert. `neutral` is the look of no attribute. `alert.css` has no `data-tone="neutral"` selector. Remove the attribute for that look. `primary` is a badge tone, and an alert does not take it.

Set `info`, `success`, `warning`, or `danger`, or remove `data-tone`. In React, `tone` is `AlertTone`, and `tone="neutral"` is a type error.

## ODD-ALERT-003

Fails when `odd-alert` has `role` or `aria-live`.

A live region is announced when its content changes, which means the region has to be on the page before the message arrives. A `role` or an `aria-live` that shows up with the alert is not that region. A static alert needs no role at all.

Remove `role` and `aria-live` from the alert. For a message that appears later, put `role="status"` or `role="alert"` on an empty container that is already on the page, and insert the alert into it. In React, `role` or `aria-live` on `Alert` is a type error.

## ODD-ALERT-004

Fails when `odd-alert` has a system `data-` attribute it does not take.

An alert reads `data-tone` and nothing else. `data-variant` and `data-size` belong to other components, and `alert.css` ignores them. An app `data-` attribute passes. The appearance axes and the headless allowlist pass. A misspelled tone attribute, such as `data-tnoe`, is reported with a suggested spelling.

Remove the attribute, or correct its name. The alert takes `data-tone`. In React, pass `tone`. Passing `data-variant` is a type error, and passing `data-tone` yourself is a type error too, because `Alert` sets that attribute from `tone`.

## ODD-ALERT-005

Fails when `odd-alert-title` has a system `data-` attribute.

The title reads no `data-` attribute. `data-tone` on the title does nothing, because `alert.css` selects the tone on `odd-alert` only. An app `data-` attribute passes. The appearance axes and the headless allowlist pass.

Remove the attribute. Put `data-tone` on the alert. In React, `data-tone` on `AlertTitle` is a type error.
