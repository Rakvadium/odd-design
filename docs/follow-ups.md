# Follow-ups

Open items from the component build-out (porting uvs-decks-gg's coverage to native HTML). Each item says what's missing and where it came from. Delete an item when it's done; don't tick it.

## Verification

- **Firefox and Safari have never run the step 1 code.** Everything was proven in Chrome 155 only. Unrun: the `-moz-` rules for `ds-slider`, `ds-meter`, and `ds-progress`; the WebKit slider fill and the search clear-button restyle in Safari. The verify harness drives Chromium only, so this needs a manual pass or a second browser in `ctl.ts`. (step 1)
- **No automated accessibility scan.** `.storybook/preview.ts` sets `a11y: { test: "error" }`, but nothing runs it. Add a Storybook test runner or an axe command to `ctl.ts` so every story gets checked. (step 1)
- **Anchoring outside Chromium.** Popovers rely on the invoker being the implicit anchor. That's unverified in Firefox (partial anchor positioning) and Safari 26/27. Without anchor positioning they center in the viewport, which is also unobserved. (step 2)
- **Sheets under RTL and touch.** `data-side="start|end"` under `dir="rtl"` and `interestfor` on touch (long-press) are unverified. (step 2)
- **Unobserved paths.** These are written but not proven: the slider without scroll-driven animations (fill should stay empty), the slider fill under `:dir(rtl)`, Enter submitting the `ds-search` form (the story prevents submit), and the restyled search clear button (it only shows while hovered or focused with a value). (step 1)

## Behavior that needs JS (step 3)

- **Tooltip and hover card fallback.** `interestfor` ships in Chromium only, so tooltips and hover cards never show in Firefox or Safari. Names still hold where `aria-labelledby` is used. A small module should open the hint popover on hover or focus and close it on leave, blur, or Escape, and step aside where `interestForElement` exists. (step 2)
- **`closedby="any"` fallback.** Safari lacks `closedby`, so a backdrop click doesn't close `ds-dialog` or `ds-sheet` there. Escape still works. Add a backdrop-click handler that steps aside where `closedBy` exists. (step 2)
- **Avatar image fallback.** When an image fails to load, show initials instead, like the Radix avatar in uvs-decks-gg. CSS can't detect a failed load. (step 1)
- **Table select-all.** The header checkbox in the Table story does nothing, and it has no indeterminate state. Sorting is the page's job and is documented; select-all isn't. (step 1)

## Design debt

- **`color-mix(in oklch)` can walk the hue wheel.** The tints and the alert icon moved to `oklab` for this reason. `ds-button` hover still mixes `--_bg` and `--_fg` in oklch. Audit every remaining oklch mix of two different hues. (step 1)
- **Bar fills are not contrast-tested against their rail.** For example, the light-mode warning fill on `--track` is low contrast. The rule is "always show the value as text," and nothing enforces it. (step 1)
- **Slider hover ring is clipped at the far ends.** This is a side effect of `overflow: hidden`, which the fill technique needs. It's cosmetic. (step 1)
- **No arrow on tooltips or popovers.** uvs-decks-gg's tooltip has one. An anchored arrow needs anchor functions on a pseudo-element; skipped for now. (step 2)
- **Uppercase chromes change accessible names.** Chrome exposes CSS `text-transform` in names, so holoterminal's `Publish` button is read as `PUBLISH`. Most screen readers say it normally, but some spell out all-caps words. This predates the build-out. Consider keeping case transforms off controls, or accept and document it. (step 2)

## Test gaps

- **Text on translucent surfaces.** Glass uses `--surface-alpha: 82%`. `tests/css.ts` now evaluates `color-mix()`, so compositing `--surface-fill` over `--background` is within reach. (original survey)
- **Preferences-layer colors.** `tests/css.ts` only parses flat blocks, so the colors set inside `@media` in `preferences.css` are never checked. (original survey)
- **The no-hue check on chromes is incomplete.** It misses named colors, `hwb()`, and `lab()`. (original survey)

## Housekeeping

- **The Showcase sample app doesn't use the new components.** (step 1)
- **Branch.** Step 1 is on `static-components`, not `main`. Merge or fast-forward when ready. (step 1)
- **Skipped from uvs-decks-gg on purpose.** Aspect ratio is plain CSS (`aspect-ratio`), and the gallery search field is app-specific. (step 1)
