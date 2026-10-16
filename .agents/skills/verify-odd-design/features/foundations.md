# Contrast and foundations

Foundations stories show the active palette's WCAG 2.2 contrast measured from the browser's computed colors, the palette's color roles as swatches, and the chrome's type scale. `bun test` enforces the same contrast pairs plus the token contract for every palette and chrome without a browser.

## Sub-features

- `contrast-live`: `foundations--contrast` shows a light and a dark column for the active palette. Each pair has a ratio and a `Pass`/`Fail` badge.
- `palette-swatches`: `foundations--palette` shows every background and foreground role pair.
- `type-scale`: `foundations--type` shows the eyebrow, headings, body, and mono text in the active chrome's fonts and case.
- `contract-tests`: `bun test` fails when a palette misses a role, falls below AA, or a chrome contains a hue.

## How to get to it (user POV)

- In Storybook, open **Foundations → Contrast / Palette / Type** and switch palettes and chromes in the toolbar.
- In a terminal, run `bun test` from the repo root.

## Driving it with ctl.ts

Preconditions:

- The baseline from the README.

- **Contract tests.** Run `bun test 2>&1 | tee .verify/evidence/<run>/bun-test.txt`. The exit code is `0`, and the summary reads `N pass` and `0 fail`.
- **Live contrast per palette.** For each palette `p` in `default aurora sorbet`, run `bun $S goto foundations--contrast "palette:p"` and then `bun $S eval '[...document.querySelectorAll(".pair-result")].map(r => r.textContent.trim())'`. All 44 entries (22 pairs × light and dark) start with `Pass`, and none start with `Fail` or are empty. Capture `foundations/contrast-p.png --full`.
- **Swatches.** Run `bun $S goto foundations--palette "palette:aurora;mode:dark"` and capture `foundations/palette-aurora-dark.png`. Ten swatches are visible, each showing `Aa` and its `--token` name.
- **Type per chrome.** Run `bun $S goto foundations--type "chrome:holoterminal"` and `bun $S eval 'getComputedStyle(document.querySelector("h1")).fontFamily'`, then repeat with `chrome:bubblegum`. The font families differ, and the screenshot shows holoterminal's uppercase headings.

## Gotchas

- Ratios are filled in on the next animation frame after render. If `.pair-result` is empty right after `goto`, run the `eval` again rather than reporting a failure.
- The contrast story measures the computed colors. If a palette passes in `bun test` but fails here, the difference is real rendering, such as preferences or a chrome tint. Report it rather than trusting the test alone.
- An active `emulate prefers-contrast=more` changes the measured ratios. Clear emulation first.
