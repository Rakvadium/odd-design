# Tooltip usage rules

This code applies to `odd-tooltip`. Shared codes are in [General usage rules](general.md).

In React, a tooltip is a prop on `Button`, never a component of its own. An icon-only `Button` takes `label`, which renders as the button's name and as its tooltip. A `Button` with visible text takes `tooltip`, which renders a tooltip that describes it.

```tsx
import { Button } from "odd-design/react";

<Button variant="ghost" iconOnly label="Duplicate deck">
  <CopyIcon aria-hidden="true" />
</Button>;
<Button variant="primary" tooltip="Anyone with the link can view it">
  Publish
</Button>;
```

`Button` writes the tooltip right after itself, gives it an id, and points `interestfor` at it. The icon-only button points `aria-labelledby` at its tooltip, so the name holds where tooltips can't show. The button with text points `aria-describedby` at its tooltip, merged with any `aria-describedby` you pass. Where the browser lacks `interestfor`, `Button` installs the interest fallback itself while a tooltip is on the page, so a React app needs no `enhance()` call for it. A blank `label` throws `ODD-BUTTON-008` outside production.

The components compile to this HTML:

```html
<button class="odd-button" type="button" data-variant="ghost" data-icon-only aria-labelledby="copy-tooltip" interestfor="copy-tooltip">
  <svg aria-hidden="true">…</svg>
</button>
<span class="odd-tooltip" id="copy-tooltip" popover="hint" role="tooltip">Duplicate deck</span>
<button class="odd-button" type="button" data-variant="primary" aria-describedby="publish-tooltip" interestfor="publish-tooltip">Publish</button>
<span class="odd-tooltip" id="publish-tooltip" popover="hint" role="tooltip">Anyone with the link can view it</span>
```

The tooltip opens on hover or keyboard focus, after the browser's show delay, and closes when both leave or on Escape. Only a `button` or an `a` opens an interest popover, so a tooltip never belongs to an `input` or a `div`. A tooltip holds text only. For a preview with links or images, use `odd-hover-card`.

## ODD-TOOLTIP-001

Fails when `odd-tooltip` has no `popover`, a `popover` other than `hint`, no `role`, or a `role` other than `tooltip`.

Without `popover="hint"`, `interestfor` does not open the tooltip, and it sits in the page as plain text. An `auto` popover closes other popovers when it opens and takes light dismiss, which a hint should not. Without `role="tooltip"`, a screen reader does not read the element as the tooltip of the button that points at it.

Set `popover="hint"` and `role="tooltip"` on the `odd-tooltip` element. The tag can be a `span` or a `div`. In React, pass `label` to an icon-only `Button`, or `tooltip` to a `Button`, and it renders the tooltip.
