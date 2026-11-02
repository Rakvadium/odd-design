# Text

Keys and code sit in running text. `kbd.odd-kbd` draws a keycap from the chrome's edge, border width, and radius, at 0.8em of the text around it, and a line with keycaps is as tall as one without. `code.odd-code` is inline code on a muted chip with a border. `pre.odd-pre` is a block on the page color whose long lines wrap, so it never scrolls and never needs a tab stop. A `code` inside the block loses the chip.

## Sub-features

- `kbd-in-text`: in `components-kbd--parts`, the tree reads `paragraph: Press Ctrl K to search.`, so the keys are read with the sentence.
- `kbd-line-box`: the first paragraph of `components-kbd--parts` is as tall as the same text without keycaps.
- `kbd-shortcut-list`: in `components-kbd--shortcut-list`, the tree reads a `term` with the keys and a `definition` with the action, three times.
- `kbd-chromes`: the cap follows the chrome, heavy in bubblegum and crisp in darkmatter, and glass's pill radius stops at a small rounded corner.
- `code-parts`: in `components-code--parts`, the tree reads `code: "--primary"` inside the paragraph, a `code` block for the TypeScript, and `text` for the command output.
- `code-wraps`: in `components-code--long-lines`, a 100-character line wraps inside a 20rem box, with no horizontal scroller.
- `code-forced-colors`: under `forced-colors=active`, the inline chip loses its fill and keeps its border, and the block keeps its border.

## How to get to it (user POV)

- In Storybook, open **Components → Kbd**, which has Playground, Parts, and Shortcut List, and **Components → Code**, which has Playground, Parts, and Long Lines. The React section builds them from `Kbd`, `Code`, and `Pre`.

## Driving it with ctl.ts

Preconditions:

- The baseline from the README.

- **Keys.** Run `bun $S goto components-kbd--parts "mode:light"`, capture `text/kbd-parts-light.png`, and run `bun $S aria text/kbd-parts.aria.txt`. It shows the three sentences with their keys. Repeat with `mode:dark` and with each chrome.
- **Line box.** On the same story, run `bun $S eval 'const p = document.querySelector("#storybook-root p"); const q = Object.assign(document.createElement("p"), { textContent: p.textContent }); p.after(q); const h = [p.offsetHeight, q.offsetHeight]; q.remove(); h'`. The two heights match.
- **Code.** Run `bun $S goto components-code--parts "mode:light"`, capture `text/code-parts-light.png`, and run `bun $S aria text/code-parts.aria.txt`.
- **Wrapping.** Run `bun $S goto components-code--long-lines` and `bun $S eval 'const pre = document.querySelector(".odd-pre"); [pre.scrollWidth, pre.clientWidth]'`. The two numbers match. Capture `text/code-long-lines.png`.
- **Forced colors.** Run `bun $S emulate forced-colors=active`, then `bun $S goto components-code--parts`, and capture `text/code-forced.png`. Each inline chip has a border, and the blocks keep theirs. Clear with `bun $S emulate`.

## Gotchas

- `kbd` has no ARIA role, so a screen reader does not say "key". The keys read as words in the sentence.
- `kbd.odd-menu-shortcut` in the Menu stories is a different class and stays hidden. Don't compare it with `odd-kbd`.
