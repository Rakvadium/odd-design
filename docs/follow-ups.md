# Follow-ups

Open items from the component build-out (porting uvs-decks-gg's coverage to native HTML). Each item says what's missing and where it came from. Delete an item when it's done; don't tick it.

## Verification

- **Firefox and Safari have never run the step 1 code.** Everything was proven in Chrome 155 only. Unrun: the `-moz-` rules for `ds-slider`, `ds-meter`, and `ds-progress`; the WebKit slider fill and the search clear-button restyle in Safari. The verify harness drives Chromium only, so this needs a manual pass or a second browser in `ctl.ts`. (step 1)
- **No automated accessibility scan.** `.storybook/preview.ts` sets `a11y: { test: "error" }`, but nothing runs it. Add a Storybook test runner or an axe command to `ctl.ts` so every story gets checked. (step 1)
- **Anchoring outside Chromium.** Popovers rely on the invoker being the implicit anchor. That's unverified in Firefox (partial anchor positioning) and Safari 26/27. Without anchor positioning they center in the viewport, which is also unobserved. (step 2)
- **Sheets under RTL and touch.** `data-side="start|end"` under `dir="rtl"` and `interestfor` on touch (long-press) are unverified. (step 2)
- **Unobserved paths.** These are written but not proven: the slider without scroll-driven animations (fill should stay empty), the slider fill under `:dir(rtl)`, Enter submitting the `ds-search` form (the story prevents submit), and the restyled search clear button (it only shows while hovered or focused with a value). (step 1)

## Behaviors (src/js)

- **The interestfor and closedby fallbacks are written but have never run.** `interestForFallback` and `closedByFallback` in `src/js/fallbacks.ts` only act where the browser lacks the feature. Chrome has both, and their Blink flags were removed after shipping, so the harness can't turn them off, and no Firefox is installed here. Prove them in Firefox (no `interestfor`) and Safari (no `interestfor` or `closedby`). Check the hint popover's positioning there too, since it relies on `showPopover({ source })`. (step 3)
- **Toast announcements are inferred, not heard.** The region is a polite live region present before each toast, and it is in the accessibility tree over modals. No screen reader has confirmed the announcement, including the first toast after the region moves into a dialog, which is inserted after a 150 ms delay. (step 3)
- **Toasts already showing when a modal opens go inert.** The region moves into a dialog only when the next toast is shown. Moving it as soon as a dialog opens would need a hook on `showModal()`. (step 3)
- **No submenus.** `enhanceMenu` handles one level. uvs-decks-gg's dropdown menu supports nested submenus. (step 3)

## Palettes and chromes (step 4)

- **Review the ported palettes' repairs.** Contrast repair changed some looks from uvs-decks-gg. calm-storm's light primary went from L 0.746 to 0.536, and white text on danger in dark mode became dark text in all five (uvs-decks-gg kept `#fff` as an owner exception). The port script printed every change; the before values are in uvs-decks-gg's `src/styles/themes/`. (step 4)
- **Bright brand colors lose their brightness in light mode.** `--primary` is both a fill and link text, so a pale yellow must darken to olive everywhere to pass as text. Splitting off a text-only role (say `--primary-text`) would let buttons keep the exact brand color. That's a contract change, so it needs a decision. (step 4)
- **Custom palettes aren't persisted.** `loadAppearance` only accepts the shipped palette ids, and `FIRST_PAINT_SCRIPT` can't rebuild a generated palette. An app has to store the seeds and call `applyPalette` before first paint itself. (step 4)
- **No per-chrome custom palettes.** uvs-decks-gg lets a custom seed pair differ per chrome. Here one custom palette serves every chrome. (step 4)
- **Expressive's uppercase and tracking wrap tight rows.** In the sample app, a card header ("Rotating soon" plus "55 cards") wraps to two lines. Holoterminal does the same. It's a layout pressure to design for, not a component bug. (step 4)
- **Darkmatter is close to calm.** It differs in radii, flatter shadows, and a flat page background. Check it still earns its place as a separate chrome. (step 4)

## Design debt

- **`focusgroup` seam.** All arrow-key movement goes through `src/js/roving.ts`. When `focusgroup` is in more than Chromium and its role and tab-order bugs are fixed, hand the work to the browser there. (step 3)
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
