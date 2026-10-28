# Skeleton usage rules

These codes apply to `odd-skeleton`. Shared codes are in [General usage rules](general.md).

```html
<div aria-busy="true">
  <span class="odd-visually-hidden">Loading decks…</span>
  <div class="odd-skeleton" aria-hidden="true" data-shape="avatar"></div>
  <div class="odd-skeleton" aria-hidden="true" style="inline-size: 60%"></div>
</div>
```

A skeleton block is decoration. Each block is an empty `div` with `aria-hidden="true"`. The region that is filling in has `aria-busy="true"` and says "Loading" in an `odd-visually-hidden` span. Remove the blocks, the span, and `aria-busy` when the content arrives. Size a block with `inline-size` and `block-size` in `style`. In React, `Skeleton` renders the `div`, `shape="avatar"` sets `data-shape`, and you pass `aria-hidden="true"` as on the element.

No checker reads the region. A block without a busy region and loading text beside it passes every code below, and a screen reader then hears nothing while the page loads.

## ODD-SKELETON-001

Fails when `odd-skeleton` is not on a `div`.

`skeleton.css` draws the class as a block, and the region it sits in holds other blocks. A `span` or `p` with the class draws the same bar in the wrong content model. A button that is working is a Button with `aria-busy`, not a skeleton inside the button.

Move the class onto a `div`. In React, use `Skeleton`, which renders one.

## ODD-SKELETON-002

Fails when `data-shape` is not `avatar`.

`skeleton.css` draws one shape, `avatar`, a square the size and radius of a default avatar. Any other value draws the plain block. `text`, `line`, `rect`, `rectangular`, and `rounded` name that block, so they mean remove the attribute. `circle` and `circular` mean `avatar`.

Remove `data-shape` for a line or a block, and size it with `inline-size` and `block-size`. Set `avatar` for a round or square placeholder beside text. In React, `shape` takes only `"avatar"`, and a raw `data-shape` is a type error.

## ODD-SKELETON-003

Fails when `odd-skeleton` has no `aria-hidden`, or has a value other than `true`.

A bare `aria-hidden` is an empty value, and ARIA treats an empty value as not hidden. Copying a block out of a hidden card drops the card's `aria-hidden`. The checker reads each block on its own, so a block inside a hidden card still needs its own attribute.

Set `aria-hidden="true"` on every block. In React, `aria-hidden="true"` is a required prop, and `aria-hidden` with no value or `{true}` is a type error.

## ODD-SKELETON-004

Fails when an `aria-hidden` skeleton block has visible text inside it, or has `aria-busy`, `role`, `aria-label`, or `aria-labelledby`.

`aria-hidden` hides the block and everything in it. Loading text inside the block is never read, and it draws over the bar. `aria-busy` on the block leaves the region it belongs to not busy. `role="status"` with hidden text inside is the spinner pattern, and inside a hidden block it announces nothing. `aria-label` or `aria-labelledby` names a block that nothing reads, so the loading words are in the wrong place.

Empty the block, and remove `aria-busy`, `role`, `aria-label`, and `aria-labelledby`. Set `aria-busy="true"` on the region that is filling in, and put the loading text in an `odd-visually-hidden` span inside that region. In React, children and each of those attributes on `Skeleton` are type errors.

## ODD-SKELETON-005

Fails when `odd-skeleton` has a system `data-` attribute other than `data-shape`, or a near miss of `data-shape`.

`skeleton.css` reads only `data-shape`. `data-size="lg"` copied from a large avatar does nothing, and the block stays the default avatar size. An app `data-` attribute, the appearance axes, and the headless allowlist pass.

Remove the attribute, or correct its name. In React, a system `data-` attribute such as `data-size` on `Skeleton` is a type error.
