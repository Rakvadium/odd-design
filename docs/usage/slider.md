# Slider usage rules

These codes apply to `odd-slider`. Shared codes are in [General usage rules](general.md).

```html
<div class="odd-field">
  <label class="odd-label" for="copies">Copies per card</label>
  <input class="odd-slider" type="range" id="copies" min="1" max="4" value="3" aria-describedby="copies-hint">
  <p class="odd-hint" id="copies-hint">Most formats allow up to 4.</p>
</div>
```

A slider is a native range input, so the arrow keys, Page Up and Page Down, Home and End, and forms come from the browser. Name it with a `label`, and point `aria-describedby` at its hint. To show the value as text, write it on `input`, as `slider.css` says. In React, `Slider` renders the input and takes `type="range"`.

## ODD-SLIDER-001

Fails when `odd-slider` is on an element other than `input`.

A `div.odd-slider` has no slider role, no keys, and no value. The thumb and rail styles are range pseudo-elements, so they match nothing on another element.

Put `odd-slider` on an `input` with `type="range"`. In React, use `Slider`.

## ODD-SLIDER-002

Fails when `odd-slider` has no `type`, or a `type` other than `range`.

An input with no `type` is a text box, and `odd-slider` gives it slider sizing and no border. `type="number"` and the other types get no thumb or rail.

Set `type="range"`. In React, `Slider` requires it.

## ODD-SLIDER-003

Fails when `odd-slider` has `aria-disabled`.

`aria-disabled` does not stop the arrow keys or the pointer from moving the thumb, and `slider.css` dims the slider only through `:disabled`. The slider stays live and looks enabled. [ODD-FIELD-003](field.md#odd-field-003) and [ODD-CHOICE-003](choice.md#odd-choice-003) are the same rule.

Remove `aria-disabled` and set `disabled`. A disabled range input stops moving, leaves the tab order, and matches `:disabled`.

## ODD-SLIDER-004

Fails when `odd-slider` has a system `data-*` attribute.

`slider.css` reads no data attributes, so `data-tone`, `data-size`, and the rest do nothing.

Remove the attribute. App data attributes, the appearance axes, and the headless allowlist stay allowed.
