# Core primitives fitness audit plan

This plan audits every component Odd Design ships against one bar: is it the smallest unit that is accessible, testable, themeable, chromeable, and lintable? Each component gets one of four verdicts. The output is a read-only report with ranked recommendations and a PR to read. No product CSS, JS, React, or story changes. Nothing merges or deploys.

The build starts only after Caleb approves this plan.

This replaces the scrapped `chore/robot-arm-primitive-audit` plan, which covered only the five components PR #23 added. That plan's bar columns and verdict rules carry over where they still fit. Its scope does not. The PR #23 set gets its own section in the report, and every older component gets the same scrutiny.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

The run follows `odd-mode`'s figure-it-out skill. The lead plans, reviews, and verifies, and writes no file except this plan and the decision log. A builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes the evidence script. A helper on the same model captures rendered evidence. A writer on the `judgment and prose` model (`claudeAgent claude-opus-5-5`, effort high) drafts the report. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`, reasoning high) tries to overturn each verdict against the code, so the writer and the reviewer run on different providers. The run stays at five agents, plus one fresh writer if a review objection changes a verdict.

## Definition of done

The run is done when all of these hold. Each one is a check a reviewer can repeat.

- `docs/audits/core-primitives-fitness.md` gives exactly one verdict to every family in [The inventory](#the-inventory). A family is one CSS file's set of classes, or a named group of classes inside one file when the report splits it. Each verdict is one of the four in [The verdicts](#the-verdicts).
- `bun scripts/primitive-fitness.ts` prints the evidence table, and every family in the report has a row in it. The script fails if a class in `CLASS_REGISTRY` belongs to no family, so the inventory cannot silently miss one.
- Every verdict cites at least one `file:line`, script cell, or evidence image for each column in [The bar](#the-bar). A column with no evidence says "none found" and names the search that found nothing.
- The report has a composition map. For each family it says whether the family is a new atom or a composition, lists the `odd-*` classes it composes, and names what its own CSS or JS adds.
- The report has a story-depth table. For each family it gives the count of `Playground`, `Variants`, `Sizes`, `States`, and `Parts` stories, and the axes its CSS exposes that no story renders. Every family with one story that shows only the assembled widget is flagged.
- The report ranks its recommendations in four lists: what stays in core, what splits, what moves to a recipe or an app, and the story and contract gaps to close for each keeper.
- Each cross-provider reviewer objection has a recorded outcome in the report's appendix: accepted with the change, or rejected with the reason.
- `git diff main --stat` lists only files under `docs/` and `scripts/primitive-fitness.ts`. `bun run check` passes. The PR is open and not merged.

## The inventory

These are the families the audit covers, as measured on `main` at `d21483c`. The script recomputes every count, and the report uses the script's numbers, not these.

| Family | Classes | CSS lines | JS | React | Stories | Usage codes |
| --- | --- | --- | --- | --- | --- | --- |
| Button | `odd-button` | 124 | `button-type.ts` | yes | 5 | 15 |
| Field | `odd-field`, `odd-label`, `odd-input`, `odd-textarea`, `odd-select`, `odd-hint`, `odd-error` | 177 | | yes | 2 | 3 |
| Choice | `odd-choice`, `odd-switch`, `odd-segmented` | 134 | | yes | 3 | 3 |
| Slider | `odd-slider` | 127 | | yes | 1 | 4 |
| Search | `odd-search` | 46 | | yes | 1 | 5 |
| Badge | `odd-badge` | 54 | | yes | 1 | 4 |
| Card | `odd-card`, `odd-card-link`, `odd-card-footer`, `odd-card-title` | 65 | | yes | 1 | 7 |
| Disclosure | `odd-disclosure` | 66 | | yes | 1 | 3 |
| Alert | `odd-alert`, `odd-alert-title` | 52 | | yes | 1 | 5 |
| Meter | `odd-meter`, `odd-progress`, `odd-stat`, `odd-stat-value` | 131 | | yes | 1 | 3 |
| Skeleton | `odd-skeleton` | 35 | | yes | 1 | 5 |
| Avatar | `odd-avatar`, `odd-avatar-group` | 52 | `avatarFallback` in `enhance.ts` | yes | 2 | 6 |
| Separator | `odd-separator` | 22 | | yes | 1 | 4 |
| Table | `odd-table-wrap`, `odd-table`, `odd-table-sort` | 122 | `enhanceSelectAll` in `enhance.ts` | yes | 1 | 5 |
| Popover | `odd-popover`, `odd-hover-card`, `odd-tooltip` | 114 | `fallbacks.ts` | Popover only | 3 | 6 |
| Dialog | `odd-dialog`, `odd-dialog-title`, `odd-dialog-body`, `odd-dialog-actions` | 86 | `fallbacks.ts` | yes | 2 | 8 |
| Sheet | `odd-sheet`, `odd-sheet-header`, `odd-sheet-body`, `odd-sheet-footer` | 141 | | yes | 1 | 3 |
| Menu | `odd-menu`, `odd-menu-item`, `odd-menu-label`, `odd-menu-shortcut` | 116 | `menu.ts`, `roving.ts` | yes | 1 | 7 |
| Tabs | `odd-tabs` | 93 | `tabs.ts`, `roving.ts` | yes | 1 | 5 |
| Toast | `odd-toaster`, `odd-toast`, `odd-toast-title`, `odd-toast-body`, `odd-toast-description` | 92 | `toast.ts` | yes | 1 | 4 |
| Typography | `odd-heading`, `odd-eyebrow` | 43 | | no | 2, under `Foundations` | 0 |
| Base utilities | `odd-stack`, `odd-row`, `odd-muted`, `odd-visually-hidden`, `odd-skip-link`, `odd-scope` | in `base.css` | | no | 0 | 0 |
| E-stop (#23) | `odd-estop` | 66 | | no | 1 | 0 |
| Stepper (#23) | `odd-stepper` | 42 | `stepper.ts` | no | 1 | 0 |
| Range field (#23) | `odd-range-field` | 33 | `range-field.ts` | no | 1 | 0 |
| Log (#23) | `odd-log`, `odd-log-line` | 52 | `log.ts` | no | 1 | 0 |
| Shell (#23) | `odd-shell`, `odd-shell-header`, `odd-shell-status`, `odd-shell-actions`, `odd-shell-main` | `shell.css` 1-56 | | no | 1, shared | 0 |
| Grid (#23) | `odd-grid` | `shell.css` 58-90 | | no | 1, shared | 0 |

Two facts from grounding shape the plan. Button is the only family with more than three stories, and 20 of the 28 families have exactly one. No chrome file in `src/css/chromes/` names an `odd-*` class, so every component's chrome behavior comes from tokens alone. The audit checks both facts instead of assuming them.

Out of scope:

- Any edit to product CSS, JS, React, stories, `README.md`, the usage contract, or the fixtures. The appendix may propose text. It does not apply it.
- Writing or rewriting any story. The report measures story depth and recommends stories. A later PR writes them.
- A React port of any PR #23 component.
- Moving anything into an app or a recipe folder. The report says where each piece goes. A later PR moves it.
- `Foundations` and `Showcase` stories as subjects. They count as consumers of components, which is evidence for composition, and get no verdict.

## The bar

Caleb's atomic bar is the smallest unit that is accessible, testable, themeable, chromeable, and lintable. Button's stories are the depth to match. Table's single story is the shape to avoid: one assembled widget, with no story for each part, variant, or state.

Today's reference rows:

| | Button | Table |
| --- | --- | --- |
| Stories | 5: `Playground` with controls, `Variants`, `Sizes`, `States`, `Link` | 1: `Table`, the whole widget with checkboxes, sort buttons, numeric columns, links, and badges |
| Mirrored in HTML and React | yes, all 5 | yes |
| Usage codes | 15 | 5 |
| `docs/usage/` page | `button.md` | `table.md` |

The script and the report score each family on these columns. The first two decide atom or composition. The rest are the five qualities of the bar, plus story depth.

1. **Shape.** The elements and parts in its markup, and which other families' classes appear in its selectors or in its own story. A family whose selectors mostly reach into other families' classes arranges them.
2. **New atom or composition.** What the family's own CSS and JS add that the classes it holds do not already give. Layout alone does not make an atom.
3. **Domain coupling.** Domain words in its class names, CSS comments, JS, README row, usage page, and stories, and any rule that only makes sense in one app. The word list is fixed in the script, so a reviewer sees what was searched. It covers the robot-arm domain (`robot`, `arm`, `machine`, `jog`, `servo`, `gripper`, `wrist`, `NexArm`, `COM3`, `baud`, `firmware`) and the card-deck domain the stories borrow from uvs-decks-gg (`deck`, `card game`, `format`, `banned`). Sample text in a story counts as weak coupling. A rule or a class name counts as strong coupling.
4. **Accessible.** Its role and name, states, keyboard behavior, live-region behavior, and forced-colors handling. Taken from the CSS header contract, the usage page, and rendered `aria` snapshots.
5. **Testable.** Unit tests, e2e tests, usage fixtures, and verify recipes that reach it, and what each one asserts.
6. **Themeable.** The tokens it reads, and any literal color, length, or font that bypasses a token.
7. **Chromeable.** Whether it renders differently across the five chromes (`calm`, `glass`, `bubblegum`, `expressive`, `darkmatter`) in light, dark, and forced colors, because the tokens it reads differ by chrome. A family that reads no chrome-varying token looks the same in every chrome, and the report records that as a finding.
8. **Lintable.** Usage codes, good and bad fixtures, `VOCABULARY` entries, and `WRAPPERS` entries that reach it.
9. **Story depth.** Story count by kind, controls, and the axes its CSS exposes that no story renders. An axis is an attribute value the CSS selects on (`data-variant="ghost"`, `data-size="sm"`, `data-tone="danger"`, `aria-sort="descending"`, `:disabled`, `[aria-busy]`) or a part class. The script lists the axes from the CSS and checks the rendered story markup for each one. Pseudo-classes that need interaction (`:hover`, `:focus-visible`) are listed and not counted.

Story kinds follow Button. A `Playground` story has args with controls. A `Variants`, `Sizes`, or `States` story lays out every value of one axis side by side. A `Parts` story shows each part class alone or with the fewest siblings it needs. Anything else is an assembled story. The script classifies by export name and args, and the writer corrects a misfiled story by hand and says so.

## The verdicts

Each family gets exactly one verdict. The table decides it, so two readers who agree on the evidence reach the same verdict. A family split into pieces gets `split-into-smaller-primitives`, and each piece then gets its own verdict from this table.

| Verdict | When it applies |
| --- | --- |
| `keep-as-core-primitive` | One element, or one element with fixed parts that make no sense alone. Its CSS or JS adds substance no other class has. No strong domain coupling. Its gaps against the bar close without changing its classes or markup. |
| `split-into-smaller-primitives` | It ships two or more things that a consumer would reasonably use apart: a generic atom with a layout, a domain arrangement, or a second atom. The report names each piece and its verdict. |
| `demote-to-composed-recipe-or-app` | Its CSS mostly arranges other families' classes, or its purpose belongs to one app. The report names any reusable behavior it carries so a move does not lose it. |
| `park-or-remove` | None of the above. It has no consumer outside one app and no generic form worth keeping. |

Story depth never decides the verdict on its own. A keeper with one assembled story stays a keeper and gets a story gap. Table is the expected example. This keeps the two questions apart: whether the shipped classes are atomic, and whether the stories show them atom by atom.

## Hypotheses to test

These are guesses from one read of the files. The run exists to confirm or overturn them. The report records which ones held.

- **Table is an atom whose story is the anti-pattern.** `odd-table` styles a native `<table>` and its parts are fixed (`table.css:1-13`). Its single story mixes selection, sorting, numeric columns, a footer, links, and `Badge`. The guess is `keep-as-core-primitive` with the largest story gap after the PR #23 set: a plain table, numeric columns, each `aria-sort` state, selected and mixed rows, and the wrap with and without overflow. Whether `enhanceSelectAll` is a separate behavior worth its own contract is open.
- **Meter bundles a layout.** `odd-stat` is a label, value, and bar row (`meter.css:96-113`) that a `docs/follow-ups.md` item already flags as fragile. The guess is `split-into-smaller-primitives`. `odd-meter` and `odd-progress` stay. `odd-stat` becomes a recipe over `odd-row`.
- **Field is a set of atoms plus a container.** `odd-input`, `odd-select`, and `odd-textarea` are atoms, and `odd-label`, `odd-hint`, and `odd-error` are parts of `odd-field`. Three usage codes cover seven classes. The guess is `keep-as-core-primitive`, with story gaps for invalid, disabled, required, and each control alone.
- **Popover's file holds three atoms.** `odd-popover`, `odd-hover-card`, and `odd-tooltip` share open and close motion, and each has its own story. Only `Popover` has a React wrapper. The guess is `keep-as-core-primitive` for each, recorded as three atoms in one file rather than a split.
- **Choice, Dialog, Sheet, Menu, Tabs, Toast, Card, and Alert are keepers with story gaps.** Each is one element with fixed parts. Their CSS exposes axes (`data-side`, `data-tone`, `data-interactive`, `data-state`, disabled items, manual tabs) that one story per family cannot show in full.
- **Typography and the base utilities are keepers with no contract.** `odd-heading` has seven sizes and `odd-eyebrow` has tones, and neither has a usage code or a `Components/` story. `odd-stack` and `odd-row` are layout atoms with no story of their own.
- **`odd-estop` is a real atom with a domain name.** It is one `<button>` and its CSS uses no other `odd-*` class (`estop.css:11-66`). Its name and its "never disable it" rule are machine-specific. The guess is `demote-to-composed-recipe-or-app`, with `keep-as-core-primitive` as the alternative if a generic name and use hold up.
- **`odd-log` is the strongest PR #23 core candidate.** `role="log"` is generic, its CSS uses no other `odd-*` class, and its domain words sit only in story sample lines. The guess is `keep-as-core-primitive`, with lint and story gaps.
- **`odd-range-field` is a composition.** Its CSS is flex rules over `.odd-slider` and `.odd-input` (`range-field.css:18-33`). Its value is the sync behavior in `src/js/range-field.ts`. The guess is `demote-to-composed-recipe-or-app`, and the report decides whether `enhanceRangeField` stays in core as a behavior the recipe uses.
- **`odd-stepper` bundles an atom with a jog arrangement.** Its CSS arranges `.odd-button` and `.odd-input` (`stepper.css:18-42`). Hold-to-repeat and limit marking in `src/js/stepper.ts` are generic. Rows of `±1` and `±10` buttons are a jog-control arrangement. The guess is `split-into-smaller-primitives`: a number field with one decrement and one increment button as the atom, and the multi-step row as the recipe.
- **`odd-shell` is page chrome and `odd-grid` is a layout utility.** `Showcase/SampleApp` already builds a full page without `odd-shell`. `odd-grid` is a 12-column container-query grid that belongs beside `odd-stack` and `odd-row` (`base.css:99-100`). `VOCABULARY` files `data-span` under `shell` (`contract.ts:427`), but `data-span` is read on grid children. The guess is `demote-to-composed-recipe-or-app` for `odd-shell` and `keep-as-core-primitive` for `odd-grid`.

## Units

Each unit ends in a check. The next unit starts only after that check passes.

### 1. The evidence script

- [ ] A builder writes `scripts/primitive-fitness.ts`, a read-only Bun script. It prints one markdown table per bar column group, with one row per family, and writes the same data as JSON to stdout with `--json`.

The family map lives in the script as one table from family name to classes, CSS file and line range, JS files, and React exports. The script fails if a `CLASS_REGISTRY` class has no family or a family names a class the registry lacks. Everything else it derives from files.

- Selectors: the `odd-*` classes in each family's selectors, split into its own and other families'.
- Tokens: the custom properties it reads, which of them vary by chrome (the script reads each chrome file's declarations), and literal colors, lengths, and fonts outside a `var()`.
- Domain words: hits by file for the fixed word list, split into strong (class name, CSS, JS, usage page, README rule) and weak (story sample text).
- Stories: each story export, its kind by the rules in [The bar](#the-bar), whether it has controls, and whether it is mirrored.
- Axes: every attribute value, part class, and state pseudo-class in the family's CSS, and for each, whether any story's rendered markup contains it. Mirrored stories render through `toHtml`. HTML stories render by calling their `render` under happy-dom.
- Contract: usage codes, good and bad fixtures, `VOCABULARY` attributes, `WRAPPERS` entries, and the `docs/usage/` page.
- Tests: unit tests in `tests/` and e2e tests in `e2e/` that name the family's classes or story IDs.

The script reads files only. It writes nothing to disk and needs no running Storybook. It is committed so the table reruns after a later split or demotion.

Check: `bun scripts/primitive-fitness.ts` prints the tables and exits 0. The lead checks eight cells by hand with `rg` or by reading the file: Button has 15 usage codes and 5 stories, Table has 1 story and its axes list includes `aria-sort="descending"` with no story rendering it, every PR #23 family has 0 usage codes, `odd-range-field`'s selectors name `odd-slider` and `odd-input`, `odd-log`'s domain hits are all weak, no chrome file names an `odd-*` class, and removing one class from the family map makes the script fail. `bun run lint` and `bun run typecheck` pass with the script in place.

### 2. The rendered evidence

- [ ] A helper drives the `verify-odd-design` skill on its own `--run` name and captures an `aria` snapshot of every `Components/*` story in the HTML Storybook. It takes screenshots in all five chromes, in light and dark mode, of the PR #23 stories, the Table story, and every family the script flags as reading no chrome-varying token or as using a literal color. It adds forced-colors screenshots for `odd-estop`, `odd-log`, `odd-shell`, the Table story's selected rows, and the Progress story.

The evidence goes under the run's evidence folder, outside the repo. A screenshot that proves a claim in the report is copied into `docs/audits/core-primitives-fitness/` and linked. The rest stay local and the report cites them by file name only.

Check: the lead opens every `aria` snapshot for the PR #23 set and Table, and at least one screenshot per screenshotted family. The report's chromeable column must match the screenshots. A family that looks the same in every chrome is recorded as such.

### 3. The report

- [ ] A writer drafts `docs/audits/core-primitives-fitness.md` from this plan, the script output, and the rendered evidence.

The report is explanation, per the technical-writing skill. It has these sections:

1. The answer. One table of every family's verdict, ranked by how far the family is from the bar, with one sentence of reason each.
2. The composition map. Every family, the classes it composes, and the substance its own CSS or JS adds. True atoms and compositions are listed apart.
3. Story depth against Button. The story-kind counts per family and the axes no story renders, with every single assembled story flagged.
4. One section per family, grouped as forms, display, feedback, overlays, interactive, typography and layout, and the PR #23 set. Each section gives the nine bar columns and ends with the verdict and the table row that decided it.
5. Ranked recommendations. What stays in core, what splits and into which pieces, what moves to a recipe or an app with the behavior to keep, and for each keeper the stories and usage codes to add. Each candidate usage code names the failure it catches.
6. Hypotheses. Which of this plan's guesses held and which did not.
7. Appendix A. Proposed text for later PRs: a recipe location and naming rule, a story-depth rule that a test could enforce, and the README and contract changes that follow from the verdicts.
8. Appendix B. The reviewer's objections and their outcomes.

Check: every claim in sections 1 to 5 carries a `file:line`, a script cell, or an evidence image. The lead spot-checks fifteen citations against the code, including at least one per verdict kind used. The lead runs the unslop and technical-writing passes on the report.

### 4. The cross-provider review

- [ ] A reviewer on `cursor grok-4.7` reads this plan, the report, the script output, and the code, and argues against each verdict and each story-gap claim. It does not see the writer's reasoning beyond the report.

The worktree path passes the Cursor path-length check (`C-wt-odd-design-chore-core-primitives-fitness` is 45 characters), and the brief carries the done marker that odd-mode requires.

Check: the lead records each objection and its outcome in Appendix B. An objection that changes a verdict sends the report back to a fresh writer with the objection in its brief.

### 5. The trail and the PR

- [ ] The decision log is committed at `docs/audits/core-primitives-fitness.decisions.tsv`, per the show-me-your-work skill. A reviewer on a different model family from the writer reads it against the run and flags weak evidence. The flags go in the PR description's Attention section.
- [ ] `bun run check` passes. The branch `chore/core-primitives-fitness` is pushed and a PR is opened against `main` for reading. It is not merged.

Check: `git diff main --stat` lists only this plan, the report and its images, the decision log, and `scripts/primitive-fitness.ts`. `bun run check` exits 0.

## Defaults Caleb can change

The run proceeds on these unless Caleb says otherwise.

- A family is a CSS file's classes, with `shell.css` split into Shell and Grid and `base.css` treated as one Base utilities family. The report may split a family further when the evidence calls for it.
- Story depth is scored and recommended, never part of the verdict rule.
- The evidence script is committed. If Caleb wants the PR to hold only docs, the script stays local and the report pastes its output with the command that made it.
- "Recipe" means a documented composition of core classes, shown in a story outside `Components/`. The report proposes where recipes live and creates no recipe folder or story.
- The robot-arm app is treated as the only known consumer of the PR #23 set. If another consumer exists, Caleb names it and the domain-coupling column changes.
- Card-deck sample text from uvs-decks-gg in older stories counts as weak domain coupling, the same as robot-arm sample text in the PR #23 stories.
