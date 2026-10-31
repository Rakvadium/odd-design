# odd-design verification map

This directory is the maintained source for verifying the user-facing behavior of odd-design. A user here is either someone browsing Storybook or a developer whose markup uses `.odd-*` classes under `data-chrome`, `data-palette`, and `data-mode`. Read this index before driving, then use the matching feature file as the recipe.

## Baseline preconditions

- `bun install` has run, and `bun test` passes (182 tests at the time of writing).
- `S=.agents/skills/verify-odd-design/scripts/ctl.ts`, and every command runs from the repo root.
- A run started by this verification: `bun $S up --run <id>` printed `READY`, and `bun $S doctor --run <id>` printed no `FAIL`.
- Never drive a Storybook this run did not start. That includes the user's `bun run storybook` on port 6006.
- No browser emulation is active. If a previous step used `emulate`, run `bun $S emulate` with no arguments to clear it.

## Driving conventions

- Every recipe starts with `goto <storyId> "<globals>"`. A `goto` re-renders the story and resets in-page state.
- Globals are `chrome:<calm|glass|bubblegum|expressive|darkmatter>;palette:<default|aurora|sorbet|calm-storm|cyberpunk|cotton-candy|caffeine|singularity>;mode:<system|light|dark>`. Leave out an axis to keep its default (`calm`, `default`, `system`).
- Change state only through `click`, `hover`, `press`, `type`, and `focus`. Use `wait <ms>` for browser delays such as `interestfor`. Use `eval` and `state` only for reading.
- Select by ids, `commandfor`, `name`/`value`, `role`, `aria-*`, and `.odd-*` classes, or add `--text` with visible text. Do not use coordinates.
- Commands in the recipes leave out `--run <id>` for brevity. Add it to every call, or export `VERIFY_RUN=<id>`.

## Proof and skip reporting

- Capture the user action and the resulting state: a before and after `screenshot`, plus a `state`, `eval`, or `aria` read that confirms what the pixels show.
- Read each screenshot before citing it. Name the run ID, story ID, and globals with every artifact.
- Evidence lives in `.verify/evidence/<run>/`. `transcript.log` records every step automatically.
- Report a path you could not drive, such as the manager toolbar or the a11y addon panel, with the attempted command. Do not report it as verified through the iframe instead.
- For token or palette changes, include `bun test` output alongside the visual proof.

## Feature entry contract

Each feature file starts with an H1 and one paragraph on the user-visible behavior, then exactly four H2s in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with ctl.ts` (starting with `Preconditions:`), and `Gotchas`. Keep implementation detail out of the map. Name only stories, handles, commands, and observable proof.

## Features

- [Appearance axes](./appearance-axes.md) covers the chrome, palette, and mode globals; `mode:system` following the OS; scoped appearance; the Matrix; and the OS-preference overrides.
- [Sample app appearance dialog](./sample-app.md) covers the Showcase screen's no-JS dialog that re-themes its own scope live.
- [Buttons](./buttons.md) covers variants, sizes, icon-only, busy and disabled states, Playground args, and keyboard focus.
- [Forms](./forms.md) covers text fields with `:user-invalid`, the select, checkboxes and radios, switches, the segmented control, and the combobox keyboard, pointer, No results option, and async list.
- [Surfaces](./surfaces.md) covers cards with a whole-card link, badges, the modal dialog via invoker commands, and the exclusive disclosure.
- [Feedback](./feedback.md) covers alerts per tone, progress and meter bars (including range colors and forced colors), skeletons with reduced motion, and the spinner with its busy region, reduced motion, and forced colors.
- [Navigation](./navigation.md) covers text links, the current-page look, tab order, and forced colors.
- [Data display](./data-display.md) covers the table (row selection, sort indicators, focusable scroll wrapper), avatars and groups, and separators.
- [Overlays](./overlays.md) covers the anchored popover and its flip, tooltips and hover cards via `interestfor`, sheets from each side, and the alert dialog.
- [Interactive](./interactive.md) covers the menu keyboard and choosing, automatic and manual tabs, toasts (including over a modal dialog), table select-all, and the avatar image fallback.
- [Machine controls](./machine-controls.md) covers the stepper's steps, limits, and held repeat, the range field's sync and error, the log that follows new lines, and the app shell's grid.
- [Accessibility checks](./accessibility.md) covers the axe sweep with the one shared rule set, the rules record, manual mode for the addon, and the page-background contrast test.
- [Contrast and foundations](./foundations.md) covers live WCAG ratios per palette (including soft tints), swatches, the type scale, headings, the custom palette generator, and the `bun test` contract.
