# Follow-ups

Open items from the component build-out (porting uvs-decks-gg's coverage to native HTML). Each item says what's missing and where it came from. Delete an item when it's done; don't tick it.

## Planned: screen readers and Safari

Agreed order, from the screen-reader panel. Captions always come from the screen reader's own text, never from transcribing audio.

1. **Playwright Firefox and WebKit suite.** Done: `bun run test:browsers`. Chrome stays on `ctl.ts`.
2. **NVDA phase 1: recorded runs to review.** Done: `sr.ts` in the verify skill, with five scenarios in `scripts/sr-scenarios/` (appearance dialog, toast over a modal, menu, tabs in both modes, form errors). Each writes a transcript, and a video with NVDA's audio and captions from NVDA's text. Findings are under Screen reader below.
3. **NVDA phase 2: automate the phrases that matter.** `sr.ts` already captures NVDA's speech as data, so this may not need Guidepup on Windows: add expected phrases to scenarios and fail on a mismatch. Only for what the DOM can't show; anything it can show belongs in Playwright (see the toast test). Guidepup is still the likely route for VoiceOver on the Mac.
4. **JAWS, after the NVDA phases.** JAWS was the largest primary screen reader in WebAIM's 2026 survey (55%), and Guidepup can't drive it. Options: a 90-day testing license (listed at $319) with Speech History, JAWS Inspect for transcripts, or Assistiv Labs with your own license.
5. **Mac Mini pass, once it arrives.** Real Safari through `safaridriver` (the Safari items in Verification and the `closedby` fallback), VoiceOver through Guidepup, and VoiceOver's Caption Panel for recordings.
6. **One session with a screen-reader user** on the sample app. That's the only evidence of confusion and workarounds; automate whatever they hit.

## Verification

- **Real Safari hasn't run anything.** Playwright's WebKit passes the sweep and the behavior checks, but it's a patched build on Windows. Still unseen in Safari: the slider fill (see below), the search clear-button restyle, `closedby`, anchoring, and variable-font weights (Playwright's Windows WebKit draws every weight thin). Mac Mini pass. (a11y pass)
- **The slider has no fill in WebKit.** WebKit accepts the view timeline on the thumb but never runs it, so the track shows no fill; `--_on` keeps it plain instead of a stub. The value is still in the readout. Check real Safari; if it's the same there, a fill needs script or a different technique. (a11y pass)
- **WebKit doesn't focus buttons on click.** Safari behaves the same, so after a mouse click a dialog returns focus to the body, not the opener. The behavior tests open overlays by keyboard for that reason. It's platform behavior, not ours to fix. (a11y pass)
- **Forced colors is only proven in Firefox.** Playwright's WebKit matches `(forced-colors: active)` without applying system colors, and Safari has no forced-colors mode. Chrome is covered by the harness. (a11y pass)
- **Firefox has no search clear button.** It never shows one for `type="search"`, so the restyle only applies in Chromium and WebKit. (a11y pass)
- **The axe sweep isn't in CI.** `ctl.ts axe` runs on demand. Storybook's Vitest addon would run the same `parameters.a11y` checks in CI, but it only sees each story's final state, so open overlays would need `play` functions, and its support for the HTML framework is unconfirmed (storybookjs/storybook#34647). Deferred. (a11y pass)
- **axe can't see contrast over gradients.** Every story on a gradient page reports a `REVIEW` item. The page-background test in `bun test` covers that math; a person still has to look at anything axe flags for another reason. (a11y pass)
- **Popovers without anchor positioning are unobserved.** Firefox and Playwright's WebKit both anchor and flip natively, so the centered-in-viewport fallback has never rendered. (step 2)
- **Sheets under RTL and touch.** `data-side="start|end"` under `dir="rtl"` and `interestfor` on touch (long-press) are unverified. (step 2)
- **Unobserved paths.** These are written but not proven: the slider fill under `:dir(rtl)`, Enter submitting the `odd-search` form (the story prevents submit), and the restyled search clear button (it only shows while hovered or focused with a value). (step 1)

## Behaviors (src/js)

- **The closedby fallback has never run.** `closedByFallback` in `src/js/fallbacks.ts` only acts where the browser lacks `closedby`, and Chrome, Firefox, and Playwright's WebKit all have it. Real Safari may not. The `interestfor` fallback is proven: it runs in Firefox and WebKit, where the tooltip and hover-card tests pass. (step 3)
- **Toasts already showing when a modal opens go inert.** The region moves into a dialog only when the next toast is shown. Moving it as soon as a dialog opens would need a hook on `showModal()`. (step 3)
- **No submenus.** `enhanceMenu` handles one level. uvs-decks-gg's dropdown menu supports nested submenus. (step 3)

## Screen reader (NVDA phase 1)

Run with NVDA 2026.2, OneCore David, rate 50, in Chrome. The transcripts are in `.verify/evidence/<run>/sr/`.

- **Fixed: toast announcements.** NVDA said "Deck savedMidnight Control, version 15. Dismiss: Deck saved": the title ran into the description and the Dismiss button's name was read. Toasts now announce one sentence from a hidden live line, and `e2e/behavior.spec.ts` asserts the text. Confirmed spoken on the page and over an open modal. (phase 1)
- **Fixed: the menu skipped disabled items.** Arrow keys went from Share link straight to Show prices, while NVDA still counted Merge ("4 of 9"). Menu items are now disabled with `aria-disabled="true"`, which keeps them reachable, as the APG recommends, and `enhanceMenu` swallows their clicks. (phase 1)
- **Tabs are read twice on arrow keys.** "Stats tab selected 2 of 3" is read, cut off, and read again. It isn't our order: the tab is already selected, with its panel shown, when it takes focus, so the likely cause is Chrome sending the selection change after the focus event. Compare with JAWS. (phase 1)
- **NVDA re-reads around dialogs.** Opening one reads its intro, cuts off, and reads it again. After one closes, focus returns correctly, but NVDA also reads the page's first landmark or "Storybook document". DOM focus is right in both. Compare with JAWS. (phase 1)
- **Owner, a disabled field, isn't announced when tabbing.** That's expected for a disabled input, but it means a screen-reader user only finds it in browse mode. (phase 1)
- **Fixed: the first run after a start was reset mid-scenario.** Storybook's dev server watched `.verify/`, so when a scenario deleted the previous run's review page, Vite reloaded the page under test. On a fresh start the watcher was still crawling `.verify/` and reported it seconds late, mid-run, which looked like NVDA losing the menu. `.storybook/main.ts` now ignores `.verify/`. (phase 1)
- **Limits of the recordings.** The audio is the whole system's output, so a notification sound during a run is in the video. Chrome must launch after NVDA to send it events; `sr.ts start` relaunches it. (phase 1)

## Palettes and chromes (step 4)

- **The a11y pass changed palettes and glass.** Glass's washes went from 28/26/20% to 12/11/8%. Every shipped palette got headroom so page text passes on every chrome's page background: light-mode links, danger, borders, and rings got darker (up to 0.11 lightness), dark-mode borders and danger lighter (up to 0.12), and a few chromas dropped where the new lightness is out of sRGB (calm-storm's dark danger, 0.24 to 0.16). default, aurora, and sorbet now override `--danger`. Review the look. (a11y pass)
- **Under `prefers-contrast: more` and forced colors, the page background is flat.** That replaced the scanline switch-off, so those users also lose the subtle page gradients. (a11y pass)
- **Review the ported palettes' repairs.** Contrast repair changed some looks from uvs-decks-gg. calm-storm's light primary went from L 0.746 to 0.536, and white text on danger in dark mode became dark text in all five (uvs-decks-gg kept `#fff` as an owner exception). The port script printed every change; the before values are in uvs-decks-gg's `src/styles/themes/`. (step 4)
- **Bright brand colors lose their brightness in light mode.** `--primary` is both a fill and link text, so a pale yellow must darken to olive everywhere to pass as text. Splitting off a text-only role (say `--primary-text`) would let buttons keep the exact brand color. That's a contract change, so it needs a decision. (step 4)
- **Custom palettes aren't persisted.** `loadAppearance` only accepts the shipped palette ids, and `FIRST_PAINT_SCRIPT` can't rebuild a generated palette. An app has to store the seeds and call `applyPalette` before first paint itself. (step 4)
- **No per-chrome custom palettes.** uvs-decks-gg lets a custom seed pair differ per chrome. Here one custom palette serves every chrome. (step 4)
- **Expressive's uppercase and tracking wrap tight rows.** In the sample app, a card header ("Rotating soon" plus "55 cards") wraps to two lines. Holoterminal does the same. It's a layout pressure to design for, not a component bug. (step 4)
- **Darkmatter is close to calm.** It differs in radii, flatter shadows, and a flat page background. Check it still earns its place as a separate chrome. (step 4)

## Design debt

- **`focusgroup` seam.** All arrow-key movement goes through `src/js/roving.ts`. When `focusgroup` is in more than Chromium and its role and tab-order bugs are fixed, hand the work to the browser there. (step 3)
- **`color-mix(in oklch)` can walk the hue wheel.** The tints and the alert icon moved to `oklab` for this reason. `odd-button` hover still mixes `--_bg` and `--_fg` in oklch. Audit every remaining oklch mix of two different hues. (step 1)
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
- **Branch.** The accessibility pass is on `a11y-pass`, not `main`. Merge or fast-forward when ready. (a11y pass)
- **Skipped from uvs-decks-gg on purpose.** Aspect ratio is plain CSS (`aspect-ratio`), and the gallery search field is app-specific. (step 1)

## Package

- **`./enhance`, `./palette`, and `./appearance` still ship `.ts`.** `./react`, `./usage`, `./usage/test-setup`, and `./eslint` build to JavaScript and `.d.ts`. These three exports still point at TypeScript source. (P10)
- **Later components need script-set attributes marked in the contract.** The button rules do not name attributes that script adds after render. A later component has to mark those attributes, or the checkers treat them as unknown. (P10)
- **A `boolean`-typed `iconOnly` variable skips the type-level `ODD-BUTTON-008` check.** `<Button iconOnly>` with no accessible name is a type error that prints `ODD-BUTTON-008`. `const iconOnly: boolean = true` and then `<Button iconOnly={iconOnly}>` is not a type error, because the value is `boolean` rather than the literal `true`. ESLint and the runtime checker still report `ODD-BUTTON-008`. (P10)
- **React Field has no mirrored story.** The scene model in `stories/mirror.ts` cannot nest a control inside a field, and `toHtml` would write `htmlFor` as is instead of `for`. So the React Storybook shows `Button` and no Field parts yet. (React Field)
