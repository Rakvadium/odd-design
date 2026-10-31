# Code usage rules

These codes apply to `odd-code` and `odd-pre`. Shared codes are in [General usage rules](general.md).

```html
<p>Set <code class="odd-code">--primary</code> on the scope.</p>
<pre class="odd-pre"><code>import { Button } from "odd-design/react";</code></pre>
<pre class="odd-pre">3 files changed, 12 insertions</pre>
```

`odd-code` is a short piece of code inside a sentence: a `code` in the mono font, on a muted chip with a border. `odd-pre` is a block: a `pre` in the mono font on the page color, with a border. Put a bare `code` inside a `pre` when the block is code, so the tree reads it as code. Leave the `code` out for command output or other text that is not code. A `code` inside `odd-pre` loses the chip, even with `odd-code` on it.

Long lines in a block wrap instead of scrolling. A block that scrolls needs a tab stop, so a keyboard user can scroll it, and WebKit leaves a scrolling `pre` out of the tab order. A wrapped block never needs one. In React, `Code` renders the `code` and `Pre` renders the `pre`, and you write the inner `code` yourself.

## ODD-CODE-001

Fails when `odd-code` is not on a `code`, or `odd-pre` is not on a `pre`.

A `span` with `odd-code` loses the `code` role, so the tree reads the code as part of the sentence. A `div` with `odd-pre` keeps the look, because the class sets the whitespace, but the tree reads its content as plain text, and reader modes and copied markup lose the block.

Move `odd-code` onto a `code`, and `odd-pre` onto a `pre`. In React, use `Code` and `Pre`, which render them.

## ODD-CODE-002

Fails when `odd-code` or `odd-pre` has a system `data-` attribute.

`code.css` reads no `data-` attribute. `data-size="sm"` draws the same size. An app `data-` attribute, such as `data-language="ts"`, passes, and so do the appearance axes and the headless allowlist.

Remove the attribute. The chip is 0.875em of the text around it, and the block uses the small text size. In React, a system `data-` attribute such as `data-size` on `Code` or `Pre` is a type error.
