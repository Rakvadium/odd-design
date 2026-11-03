# Hover card usage rules

This code applies to `odd-hover-card`. Shared codes are in [General usage rules](general.md).

In React, render `HoverCard` around the block that holds the link, such as a paragraph or a list item, and write the link as `HoverCardLink`. The card renders after the block, never inside it, because a `div` inside a `p` closes the paragraph in the HTML parser and breaks hydration. [Show a preview on hover](react.md#show-a-preview-on-hover) covers the props.

```tsx
import { Heading, HoverCard, HoverCardLink, Muted } from "odd-design/react";

<HoverCard id="preview-midnight" preview={<><Heading level={2} size="sm">Midnight Control</Heading><Muted>by Mira Okafor</Muted></>}>
  <p>Last week’s winner was <HoverCardLink href="/decks/midnight">Midnight Control</HoverCardLink>.</p>
</HoverCard>;
```

The component compiles to this HTML:

```html
<p>Last week’s winner was <a class="odd-link" href="/decks/midnight" interestfor="preview-midnight">Midnight Control</a>.</p>
<div class="odd-hover-card" id="preview-midnight" popover="hint">
  <h2 class="odd-heading" data-size="sm">Midnight Control</h2>
  <p class="odd-muted">by Mira Okafor</p>
</div>
```

The card opens on hover or keyboard focus on the link, after the browser's show delay, and stays open while the pointer is over it, so its content can be reached. It closes when both leave or on Escape. It takes no role, because it is a preview of the page the link opens. Everything in it must also be on that page, so the card is never the only way to the content. Where the browser lacks `interestfor`, `HoverCard` installs the interest fallback itself while it is mounted, so a React app needs no `enhance()` call for it. For text only, use a tooltip.

## ODD-HOVER-CARD-001

Fails when `odd-hover-card` has no `popover`, or a `popover` other than `hint`.

Without a `popover`, the card sits in the page as content, and `interestfor` does not open it. An `auto` popover closes an open menu or popover when it opens and takes light dismiss, and a `manual` one ignores Escape, which a preview on hover should not do.

Set `popover="hint"` on the `odd-hover-card` element. In React, render `HoverCard` around the block that holds a `HoverCardLink`, and it renders the card.
