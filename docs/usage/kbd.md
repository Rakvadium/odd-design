# Kbd usage rules

These codes apply to `odd-kbd`. Shared codes are in [General usage rules](general.md).

```html
<p>Press <kbd class="odd-kbd">Ctrl</kbd> <kbd class="odd-kbd">K</kbd> to search.</p>
<p><kbd class="odd-kbd">Esc</kbd> closes the dialog.</p>
```

A key is a `kbd` drawn as a keycap in running text, and a screen reader reads it with the sentence. Write one `kbd` per key, side by side, for a key combination. Write the key's name, such as Ctrl, Shift, or Enter, rather than a glyph: a screen reader reads ⌘ by its Unicode name. The cap takes its size from the text around it and leaves the line height alone, so a line with keys is as tall as one without. In React, `Kbd` renders the `kbd`.

A shortcut hint at the end of a menu item is a different thing: `kbd.odd-menu-shortcut` with `aria-hidden="true"`, beside `aria-keyshortcuts` on the item. The item already says its shortcut, so the hint is hidden. See [Menu usage rules](menu.md).

## ODD-KBD-001

Fails when `odd-kbd` is not on a `kbd`.

A `span` with the class looks the same and reads the same: `kbd` has no ARIA role, so a screen reader does not say "key". The `kbd` element still means a key to reader modes and to markup copied out of the page, and the rule places the class, as every family's first code does.

Move the class onto a `kbd`. In React, use `Kbd`, which renders one.

## ODD-KBD-002

Fails when `odd-kbd` has `aria-hidden`.

A hidden key drops out of the sentence. "Press Ctrl K to search." is read as "Press to search.", in Firefox and WebKit. The only other `kbd` in the system, `odd-menu-shortcut`, is hidden on purpose, so this is the attribute an agent copies from a menu.

Remove `aria-hidden`. A shortcut hint at the end of a menu item is `kbd.odd-menu-shortcut` instead. In React, `aria-hidden` on `Kbd` is a type error.

## ODD-KBD-003

Fails when `odd-kbd` has a system `data-` attribute.

`kbd.css` reads no `data-` attribute. `data-size="sm"` draws the same cap at the same font size. An app `data-` attribute, the appearance axes, and the headless allowlist pass.

Remove the attribute. The cap is 0.8em of the text around it, so size the text instead. In React, a system `data-` attribute such as `data-size` on `Kbd` is a type error.
