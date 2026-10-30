# Core hygiene queue plan

The core primitives fitness audit (PR #42, `docs/audits/core-primitives-fitness.md`) scored every family against one bar and named what leaves core and which stories and codes each keeper still needs. The consistency audit (PR #41, a reading-only draft on `chore/consistency-tokens-audit`) ranked token fixes and put B-01 to B-03 on top. This plan turns the Tier A part of both into five stacked PRs, in the order AI UI Pain Scout gave.

| Item | PR | Branch | Parent |
| --- | --- | --- | --- |
| 2 | Meter split, Stepper and Range field recipes | `chore/core-hygiene-queue` | `main` | Alternative (Scout). |
| 3 | E-stop leaves core | `chore/core-hygiene-estop` | item 2 | Default (Scout). |
| 4 | B-01 to B-03 token fixes | `chore/core-hygiene-tokens` | item 3 | Default (Scout). |
| 5 | Usage codes and stories for Base utilities, Grid, Shell, Typography, and Table | `chore/core-hygiene-codes` | item 4 |
| 6 | Story depth for Table, Menu, Tabs, Sheet, and Toast | `chore/core-hygiene-stories` | item 5 |

Items 2 and 3 subtract before items 4 to 6 add. Item 4 then skips `estop.css`, which B-02 and B-03 both list, and `meter.css` has one rule fewer to migrate.

Out of scope, and parked. A raw-value lint, demoting the glass eyebrow, more audits, the rest of the #41 backlog (B-04 and up), demoting Shell, and the Appendix A recipe stylesheet. Nothing deploys.

## How the stack runs

The run follows `odd-mode/playbooks/autopilot-stack.md`, with one change the operator made. The lead merges each green PR itself under Dispatch's standing OK, bottom-up, instead of handing the chain over unmerged.

- One builder per item on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every diff. The lead plans, reviews, and verifies.
- A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews each PR at its code-ready head SHA. Nothing merges unreviewed.
- The repo has no CI, so `bun run check` at the PR head is the merge gate. Items 2, 3, 4, and 6 change rendered output, so each also gets a Storybook pass through `.agents/skills/verify-odd-design/`.
- Each child branch starts from its parent's tip. PRs squash-merge. After a parent lands, the child's base moves to `main` and the child takes `git merge origin/main`. No branch is rebased or force-pushed.
- The decision trail is local, in `.audit/core-hygiene-queue.tsv`.

## Item 2. Meter split, and Stepper and Range field become recipes

### What moves

The fitness audit gave `odd-stepper` and `odd-range-field` the verdict `demote-to-composed-recipe-or-app`, because their CSS only lays out `odd-button`, `odd-input`, and `odd-slider` (`stepper.css:18-42`, `range-field.css:18-33`). It split Meter. `odd-meter`, `odd-progress`, and `odd-stat-value` stay, and the `odd-stat` row demotes (`meter.css:96-112`).

The recipes follow the main proposal in the audit's Appendix A. A recipe adds no class and no stylesheet. It is an arrangement of core classes with the `--gap` variable.

- Delete `src/css/components/stepper.css` and `range-field.css`, and their imports in `src/css/index.css`.
- Delete the `.odd-stat` rules from `meter.css`. `.odd-stat-value` stays.
- Add `.odd-input[type="number"] { font-variant-numeric: tabular-nums; }` to `field.css`, so every number input lines up its digits. The spin buttons come back, and the centered digits and fixed widths go to the handoff (fork 2).
- Drop `odd-stepper`, `odd-range-field`, and `odd-stat` from `CLASS_REGISTRY` and drop `stepper` and `range-field` from VOCABULARY in `src/js/usage/contract.ts`.
- `enhanceStepper` and `enhanceRangeField` stay in `src/js/` and stay exported from `enhance.ts`. `enhance()` stops finding them by class (`enhance.ts:113-114`), because the classes are gone. A page calls each on its root. The JSDoc of each names the markup it reads.
- Add `stories/recipes/NumberStepper.stories.ts`, `SliderWithNumber.stories.ts`, and `StatRow.stories.ts`, titled `Recipes/Number stepper`, `Recipes/Slider with number`, and `Recipes/Stat row`. Number stepper has two stories, the single plus-and-minus field and the jog row. Move the stepper and range-field stories out of `stories/Controls.stories.ts`.
- Add `docs/recipes/number-stepper.md`, `slider-with-number.md`, and `stat-row.md`. Move the Stepper and Range field rows in `README.md` to a new Recipes section, keep a row each for `enhanceStepper` and `enhanceRangeField` under behaviors, and drop `odd-stat` from the Meter row.
- `stories/mirrored/Meter.stories.ts` builds its bars inside `odd-stat` today. It switches to the Stat row recipe markup, in both Storybooks.
- Update the fixtures, tests, and docs that name the three classes: `tests/stepper.test.ts`, `tests/range-field.test.ts`, `e2e/behavior.spec.ts`, `tests/fixtures/`, `docs/usage/meter.md`, `docs/usage/eslint.md`, `docs/usage/react.md`. Rerun `bun scripts/primitive-fitness.ts` so the family map drops the three.

ODD-STEPPER-001 and ODD-RANGE-FIELD-001 from the audit do not ship. Each one finds the root by its class, and the recipe has no class.

### Check

`bun run check` passes. `tests/stepper.test.ts` and `tests/range-field.test.ts` still prove hold-to-repeat, limit marking, and sync, with the enhancer called on a recipe root. The registry test (`tests/usage-contract.test.ts:62`) passes with no recipe class under `src/css`. The verify skill captures the three recipe stories under every chrome in light and dark.

## Item 3. E-stop leaves core

The audit gave `odd-estop` `demote-to-composed-recipe-or-app` at distance 7. Its "never disable it" rule (`estop.css:4`) belongs to machine control, its cap ignores the chrome, and it mixes in literal `black` (`estop.css:12`).

- Delete `src/css/components/estop.css` and its import.
- Drop `odd-estop` from `CLASS_REGISTRY` and `estop` from VOCABULARY.
- Delete the e-stop story in `stories/Controls.stories.ts`, the e-stop in the app shell story (`stories/Layout.stories.ts:57`), and any test or fixture that names it. Remove the `README.md:191` row.
- Add `docs/handoffs/odd-nexarm.md`. It holds the e-stop CSS as it stood at `main`, the stepper, range-field, and stat-row CSS removed in item 2, and the one-line `enhanceStepper` and `enhanceRangeField` calls the drive page needs. The robot-arm app's repository (`Rakvadium/odd-nexarm`) is the documented home. This queue does not edit it.
- Keep the latched forced-colors drawing (`estop.css:55-65`) in the handoff, as the audit asks.

### Check

`bun run check` passes, and `rg odd-estop src stories tests e2e` finds nothing.

## Item 4. B-01 to B-03 from the consistency audit

This item takes the three fixes from PR #41's report and leaves the rest of #41 unmerged. #41 is marked reading-only and adds its own script, TSVs, and drift captures, none of which B-01 to B-03 need. The PR body links #41's section for each fix.

- **B-01.** Add `--disabled-opacity: 0.55` to `foundations.css` and read it in `button.css`, `choice.css`, `slider.css`, `tabs.css`, and `field.css`. Field dims to 0.7 today with no comment, and this plan moves it to 0.55. Add `:not(:disabled, [aria-disabled="true"])` to the field and tab hover rules (`field.css:87`, `tabs.css:66`). Add one `e2e/behavior.spec.ts` assertion that a hovered disabled input keeps its resting border color.
- **B-02.** Give every control one focus recipe. Add `var(--focus-glow)` to the global `:focus-visible` rule in `base.css`. Replace the literal offsets in `choice.css`, `tabs.css`, and `field.css` with arithmetic on `--focus-offset` or `--focus-width`, as `menu.css` does. Draw the slider halo from `--focus-glow` and `--focus-color`. `e2e/axe.spec.ts` must stay at 0 violations.
- **B-03.** Add a `--weight-*` scale to `foundations.css`. Add `label-weight` to `CHROME_TOKENS` in `src/js/contract.ts` and set it to 600 in each of the 5 chromes, so no label moves at landing. Move the label-role 600s to `--label-weight` and every other font weight to the scale, across the 12 component stylesheets that remain after item 3. Replace the four story 600s (`Avatar.stories.ts:55`, `Table.stories.ts:59`, `Foundations.stories.ts:47`, `Foundations.stories.ts:94`) with the scale.

### Check

`bun run check` passes, including "defines every chrome token" in `tests/contract.test.ts`. The verify skill reruns #41's CSS-07, CSS-03, and CSS-01 cells under 5 chromes in light and dark. A disabled input and a disabled button read one opacity. Every focus offset equals `--focus-offset` or a stated multiple, and the glow shows on every control under glass and expressive. Button and badge weight equal `--label-weight`.

## Item 5. Usage codes and stories for the keepers with none

The audit ranked Base utilities, Grid, Shell, and Typography 2 to 5 because none has usage codes or a story of its own. Each gets a usage page under `docs/usage/`, the codes below, a good and a bad fixture per code, and a static story in the HTML Storybook. None has a React wrapper, so none is mirrored.

| Family | Codes | Story |
| --- | --- | --- |
| Base utilities | ODD-SCOPE-001 (`odd-scope` without all of `data-chrome`, `data-palette`, and `data-mode`), ODD-SKIP-001 (`odd-skip-link` not on an `a` whose `href` is an in-page id) | `Parts`. `odd-stack` and `odd-row` at two `--gap` values, `odd-muted`, `odd-skip-link`, and `odd-scope` nested in another chrome. |
| Grid | ODD-GRID-001 (`data-span` outside 1 to 12) | `Variants`. Every `data-span` from 1 to 12, and the two container-width collapses. |
| Shell | ODD-SHELL-001 (`odd-shell-header` not on a `header`, or `odd-shell-main` not on a `main`) | `Parts`. The header's title, status, and actions slots, each filled and empty. |
| Typography | ODD-TYPOGRAPHY-001 (`odd-heading` not on `h1` to `h6`), ODD-TYPOGRAPHY-002 (`data-size` outside xs, sm, lg, xl, 2xl, and hero), ODD-TYPOGRAPHY-003 (eyebrow `data-tone` outside primary and foreground) | `Sizes` for headings and `Variants` for eyebrow tones. |
| Table | ODD-TABLE-006 (a `data-select-all` box without `aria-label` or `aria-labelledby`) | Item 6. |

Grid also moves. Its CSS goes from `shell.css:58-90` to `base.css`, and `shell: ["data-span"]` becomes `grid: ["data-span"]` in VOCABULARY (`contract.ts:427`). The `README.md` Grid row moves beside `odd-stack` and `odd-row`.

### Check

`bun run check` passes. Each new code fires on its bad fixture and stays quiet on its good one, through both the HTML and the JSX checker where the contract applies to both.

## Item 6. Story depth for Table, Menu, Tabs, Sheet, and Toast

Each family gets stories of a Button kind (`Variants`, `Sizes`, `States`, or `Parts`) for the axes it has. This is not full Button parity. No `Playground` is added. Every new story in a mirrored file is mirrored in both Storybooks.

- **Table.** `Parts` with a plain table, numeric columns, and a sortable header in each `aria-sort` state (`ascending`, `descending`, `none`). `States` with no rows selected, some selected, and all selected. A wrap that overflows beside one that does not. The current packed story stays as the assembled example.
- **Menu.** An opened menu, opened in a `play` function, so its items show in the aria snapshot.
- **Tabs.** A vertical tabs story (`aria-orientation="vertical"`).
- **Sheet.** Each of the four sides opened in a `play` function, and one in right-to-left.
- **Toast.** Each tone, a toast with an action, and the closing state, built by `toast()` in a `play` function.

### Check

`bun run check` passes, and the aria snapshots in `e2e/usage.spec.ts` cover the new mirrored stories. The verify skill captures each new story under every chrome. Rerun `bun scripts/primitive-fitness.ts`. Table's "static axes no story renders" cell reads none, and so does Tabs'.

## Forks for Scout

Scout and Caleb answered all four on 2026-10-30, and the build follows the Answer column.

- Fork 1. Merges do not wait for the odd-nexarm PR. The handoff also carries the stepper's centered digits, fixed widths, and spin-button rules.
- Fork 2. `field.css` gets `.odd-input[type="number"] { font-variant-numeric: tabular-nums; }`, so item 2 changes that line in the Recipes section. Spin buttons return in the recipe.
- Fork 4. After B-01 lands, the verify skill checks that disabled field text stays readable under every chrome in light and dark. A second field token gets added only if that text fails, for example under glass or in dark mode.

| # | Fork | Default | Alternative | Answer |
| --- | --- | --- | --- | --- |
| 1 | The robot-arm drive page (`Rakvadium/odd-nexarm`, `src/odd_nexarm/web/static/index.html:22`, `:160`, `:188`, `:196`) uses `odd-estop`, `odd-stepper`, `odd-range-field`, and `odd-stat`, and calls `enhance()` (`drive.js:306`). It loads CSS and JS from the `../odd-design` checkout. Once items 2 and 3 land and that checkout pulls and builds, the e-stop loses its look, the jog steppers lose their layout and their buttons stop stepping, and the range fields stop syncing. | Merge items 2 and 3 as they go green. `docs/handoffs/odd-nexarm.md` holds the exact CSS and JS the app needs, and Dispatch schedules that app PR. | Hold the merges of items 2 and 3 until the odd-nexarm PR is ready. Items 4 to 6 keep building on the stack meanwhile. | Default (Caleb). |
| 2 | A recipe with no stylesheet drops what `stepper.css` and `range-field.css` add beyond layout. The number input shows its spin buttons again, loses centered tabular numbers, and loses its fixed widths. | Drop all of it. The recipe uses `odd-row`, and the app copies the rules from the handoff. | Move `font-variant-numeric: tabular-nums` to `.odd-input[type="number"]` in `field.css`, as a rule every number input gets. Spin buttons still show. | Alternative (Scout). |
| 3 | `enhance()` finds steppers and range fields by the classes item 2 deletes. | `enhance()` stops wiring them. A page calls `enhanceStepper(root)` and `enhanceRangeField(root)` itself, as Appendix A says. | `enhance()` finds them by a new data attribute, such as `data-enhance="stepper"`, which adds a public attribute to the contract. | Default (Scout). |
| 4 | B-01 picks one disabled strength. Fields dim to 0.7 and everything else to 0.55. | 0.55 for every control. Disabled inputs get fainter. | Keep fields at 0.7 through a second token, with a comment that says why. | Default (Scout). |
