# Spinner usage rules

These codes apply to `odd-spinner`. Shared codes are in [General usage rules](general.md).

```html
<div class="odd-row" aria-busy="true">
  <span class="odd-spinner" aria-hidden="true"></span> Loading projects…
</div>
<div class="odd-row" aria-busy="true">
  <span class="odd-spinner" aria-hidden="true"></span>
  <span class="odd-visually-hidden">Loading reports…</span>
</div>
```

A spinner is the moving form of a skeleton block. It is decoration: an empty `span` with `aria-hidden="true"`. The region that is loading has `aria-busy="true"` and says what is loading, in visible words beside the ring or in an `odd-visually-hidden` span. Remove the spinner, the words, and `aria-busy` when the content arrives. The ring is 1em across in the text color, so it takes its size and color from where it sits. Under reduced motion it turns slower instead of stopping. In React, `Spinner` renders the `span`, and you pass `aria-hidden="true"` as on the element.

A button that is working is a Button with `aria-busy="true"`, which draws its own ring. Don't put a spinner inside a button.

No checker reads the region. A spinner without a busy region and loading words beside it passes every code below, and a screen reader then hears nothing while the page loads.

## ODD-SPINNER-001

Fails when `odd-spinner` is not on a `span`.

A spinner sits in a sentence, in a button row, and in a flex row, so it has to be phrasing content. `<p>Saving <div class="odd-spinner"></div> your work.</p>` makes the parser close the paragraph at the `div`, and " your work." falls out of it, in Firefox and WebKit.

Move the class onto an empty `span`. In React, use `Spinner`, which renders one.

## ODD-SPINNER-002

Fails when `odd-spinner` has no `aria-hidden`, or a value other than `true`, holds visible text, or has `role`, `aria-label`, `aria-labelledby`, or `aria-busy`.

Text inside a spinner turns with the ring. `role="status"` with hidden text inside is announced as a status from the decoration, and `role="img"` with `aria-label` is announced as an image. In both, the region that is loading is not marked busy, so the announcement sits on a different element than the one a skeleton's region uses. `aria-busy` on the spinner leaves its region not busy. The bare `aria-hidden` requirement has no failure of its own, since an empty span is already absent from the tree. It is the pin that makes the empty check run and makes React require the attribute, as ODD-SKELETON-003 does.

Set `aria-hidden="true"`, empty the span, and remove `role`, `aria-label`, `aria-labelledby`, and `aria-busy`. Set `aria-busy="true"` on the region that is loading, and put the loading words beside the spinner or in an `odd-visually-hidden` span inside that region. In React, `aria-hidden="true"` is a required prop, and children and each of those attributes on `Spinner` are type errors.

## ODD-SPINNER-003

Fails when `odd-spinner` has a system `data-` attribute.

`spinner.css` reads no `data-` attribute. `data-size="lg"` draws the same 1em ring. An app `data-` attribute, the appearance axes, and the headless allowlist pass.

Remove the attribute. Size the ring with the font size where it sits, and color it with the text color. In React, a system `data-` attribute such as `data-size` on `Spinner` is a type error.
