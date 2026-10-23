# Button usage rules

These codes apply to `odd-button`. Shared codes are in [General usage rules](general.md). Omitting `data-variant` gives the default bordered button.

## ODD-BUTTON-001

Fails when `odd-button` is on an element other than `button` or `a`.

The class is for an action or a link. Another element does not expose that role.

Move `odd-button` onto a `button` or an `a` element.

## ODD-BUTTON-002

Fails when `data-variant` is not `primary`, `secondary`, `danger`, or `ghost`.

Omitting `data-variant` gives the default bordered button. `outline` and `default` are names for that default.

Remove `data-variant`, or set `primary`, `secondary`, `danger`, or `ghost`.

## ODD-BUTTON-003

Fails when `data-size` is not `sm` or `lg`.

Omitting `data-size` gives the medium control height. `md` and `medium` are names for that default.

Remove `data-size`, or set `sm` or `lg`.

## ODD-BUTTON-004

Fails when `data-icon-only` is present and its value is not empty or `true`.

The attribute is a flag. A value of `false` still matches the CSS attribute selector, and the contract rejects it.

Remove the value, or set it to `true`. To show a label, remove `data-icon-only`.

## ODD-BUTTON-005

Fails when `aria-disabled` is not `true` or `false`.

The attribute is an ARIA boolean. Any other value is not a state.

Set `aria-disabled` to `true` or `false`, or remove it.

## ODD-BUTTON-006

Fails when `aria-busy` is not `true` or `false`.

The attribute is an ARIA boolean. The button uses `true` while an action is in progress.

Set `aria-busy` to `true` or `false`, or remove it.

## ODD-BUTTON-007

Fails when `odd-button` has the `disabled` attribute.

`disabled` removes the control from the tab order. `aria-disabled="true"` keeps it focusable and announced.

Remove `disabled`. Set `aria-disabled` to `true` when the button must not activate.

## ODD-BUTTON-008

Fails when `data-icon-only` is set and the button has neither `aria-label` nor `aria-labelledby`.

An icon has no text for the accessible name. The name has to come from one of those attributes.

Add `aria-label` or `aria-labelledby`.

## ODD-BUTTON-009

Fails when an `a` element with `odd-button` has no `href`.

Without `href`, the element is not a link.

Add an `href`.

## ODD-BUTTON-010

Fails when a `button` with `odd-button` has an `href`.

`href` belongs on a link. A button does not navigate by URL.

Remove `href`, or use an `a` element.

## ODD-BUTTON-011

Fails when `aria-current` is not `page`.

A button link marks the current page. Other `aria-current` values are outside this contract.

Set `aria-current` to `page`, or remove it.

## ODD-BUTTON-012

Fails when `aria-current` is on an element other than `a`.

Current-page state applies to a link, not to a button.

Move `aria-current` onto an `a` element, or remove it.

## ODD-BUTTON-013

Fails when an `a` element with `odd-button` has `aria-disabled`.

A link does not have a disabled state.

Remove `aria-disabled` and keep `href` when the link should still navigate. Render a `button` when the control should not navigate. Render plain text without `odd-button` when the control should not look like a button.

## ODD-BUTTON-014

Fails when `data-icon-only` is set and the button contains visible text.

Icon-only means the accessible name comes from an attribute, not from text in the button. Text inside an `aria-hidden` child does not count.

Remove the visible text, or remove `data-icon-only`.

## ODD-BUTTON-015

Fails when `odd-button` has a system `data-` attribute it does not take.

An app `data-` attribute passes. The appearance axes and the headless allowlist pass. A misspelled system name is reported with a suggested spelling.

Remove the attribute, or correct its name. The button takes `data-variant`, `data-size`, and `data-icon-only`.
