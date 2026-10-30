# Consistency and tokens audit plan

odd-design now ships 20 React component modules beside 26 component stylesheets, after the React ports (#24 to #39) and the post-port follow-ups (#40). This audit checks whether the system is still one system. The questions are whether every component is built the same way, whether every visual value comes from a token, and which design-system anti-patterns will make the next component harder to add.

The audit is for two readers. Caleb gets a ranked backlog to pick fixes from. The engineer who adds the next component gets a record of which pattern to copy and which to avoid.

The deliverable is a living report at `docs/audits/consistency-tokens.md`, plus the script that produces its counts. The audit changes no product code. No component, token, story, or usage doc changes in this phase. Fixes wait for Caleb to pick backlog items in a separate OK.

This plan waits for approval. Nothing is built yet.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when its evidence exists.

The run follows `odd-mode`'s figure-it-out playbook. The lead plans, reviews, and verifies. Delegates write every file after this plan, including the script and the report. Model routing is in [Models](#models).

## Starting state

The branch was three PRs behind `origin/main`. It is now fast-forwarded to `d21483c` (`chore(react): land the post-port follow-ups (#40)`), so the audit sees Menu, Table, and the holoterminal removal. Every number below was measured with `rg` on `d21483c`. Each number counts matching lines, not values.

| Surface | Files | Pre-scan signal |
| --- | --- | --- |
| `src/css/components/*.css` | 26 | 497 `var(--` lines. 0 hex or `oklch()`/`rgb()` lines. 0 numeric `z-index` lines. 123 lines with a `px`, `rem`, or `em` literal. 20 numeric `font-weight` lines. 7 numeric `border-radius` lines. 6 `box-shadow` lines with a `px` literal. 2 lines with a raw duration. |
| `src/css/base.css`, `preferences.css` | 2 | 5 and 1 length-literal lines. |
| `src/css/chromes/*.css` | 5 | Token sources. Their color literals are achromatic shadow colors, which `bun test` already allows. |
| `src/css/foundations.css`, `palettes/*.css` | 9 | Token sources. |
| `src/react/*` | 23 | 20 component modules plus `index.ts`, `part.ts`, and `props.ts`. 15 modules only call `part()`. `button`, `tabs`, and `toast` call `createElement` themselves. `menu` and `table` mix `part()` with `createElement`. Those 5 are the only `"use client"` modules. |
| CSS with no React module and no usage page | 6 | `estop`, `log`, `range-field`, `shell`, `stepper`, `typography`. Typography is deferred. |
| `src/js/*.ts` | 14 | 10 behavior files export 16 functions (enhancers, fallbacks, `roving`, `toast`, and helpers). Whether they share one signature is unchecked. `enhance()` is at `src/js/enhance.ts:108`. |
| `stories/` | 8 hand-written, 21 mirrored | Lines with inline `style` or `.style.`: Showcase 27, Foundations 22, CustomPalette 9, Overlays 7, Controls 5. |
| `docs/usage/*.md` | 24 | 21 code pages (20 components plus `general.md`) share one heading shape, `## ODD-X-00N`. |
| `docs/follow-ups.md` Design debt | 1 | 108 known items. The audit cites them and does not count them as new. |

`holoterminal` appears nowhere in `src/`, `stories/`, `README.md`, or `docs/usage/`. It remains only in `docs/plans/` history, which the audit leaves alone.

## Scope

In scope:

- CSS: `foundations.css`, `palettes/`, `chromes/`, `preferences.css`, `base.css`, `index.css`, and every file in `components/`.
- Vanilla JS: every file in `src/js/` except `color.ts` math, plus `src/js/usage/contract.ts` and `format.ts` where they define component contracts.
- React: every file in `src/react/`, and `src/eslint/jsx.ts` where it reads `WRAPPERS`.
- Stories: `stories/*.ts`, `stories/mirrored/*.ts`, `stories/catalog.ts`, `stories/mirror*.ts`, and `.storybook*/preview.ts`.
- Docs: `README.md`, `docs/usage/`, and `docs/follow-ups.md` as the known-debt list.

Out of scope: `tests/`, `e2e/`, `eval/`, `scripts/` other than the new audit script, `docs/plans/`, and the verify skill's own code. A finding may still cite a test, for example a contract test that would block a fix.

Parked items stay parked. Typography is deferred, and tooltip and hover-card are parked. Each appears in the report only if it is the cause of an anti-pattern finding elsewhere, and the report marks it parked.

## What counts as a finding

A finding is a fact with a `file:line`, a rule from this section, and a fix direction. Opinion without a rule is not a finding.

### Token findings

A literal in a component, `base.css`, `preferences.css`, or a story is a token finding when any of these is true:

1. It is a color other than `transparent`, `currentColor`, `inherit`, or a forced-colors system color.
2. It sets a value that a chrome owns. That covers border width (`--border-width`), radius (`--radius-*`), shadow (`--shadow-*`), focus ring geometry (`--focus-width`, `--focus-offset`), easing (`--ease`), and press motion. A literal here ignores the active chrome. That is chrome drift.
3. It equals a value on a foundations scale and plays that scale's role. For example, `gap: 0.5rem` is `--space-2`, and `120ms` is `--duration-fast`.
4. It is a `font-weight`, `letter-spacing`, `line-height`, or `font-size` with no scale token, and the same value appears in two or more components. That is a missing scale.
5. It is a `z-index` outside the ladder in `foundations.css`.
6. The same literal does the same job in two or more components, even when each use alone would be an exception. That is a missing shared token. Example: overlay width caps in `dialog.css:11` and `sheet.css:26`.

### Exceptions

A literal is an exception when it fits one of these. The report lists each with its reason.

- **Token definitions.** Literals in `foundations.css`, `palettes/`, and `chromes/` are the tokens. The audit checks those files for internal consistency instead, such as scale gaps and a chrome that sets a role another chrome leaves to a default.
- **Glyph geometry in `em`.** One component draws an icon in CSS, sized relative to its own text, and no other component draws the same glyph. Examples: the disclosure chevron and the select arrow strokes.
- **Platform or spec floors.** The 24px minimum target size (WCAG 2.5.8) in `--control-height`, and `999px` for a pill radius.
- **Density-scaled private sizes.** A `--_name` that multiplies one component-specific base size by `var(--density)`, unless rule 6 applies.
- **Input data in stories.** Seed colors in `CustomPalette.stories.ts` are user input, not styling.

### Consistency findings

The reference shape is the one `docs/plans/react-uniformity.md` set for Button, Field, and Choice. A component deviates when it differs from that shape with no reason recorded in a plan or a code comment. The script builds one matrix row per component with these columns:

- CSS file, and its `@import` in `index.css`.
- A `WRAPPERS` row and `USAGE` rules in `src/js/usage/contract.ts`.
- The React module, and whether it is `part()` only or hand-written, and whether it is `"use client"`.
- A `docs/usage/<name>.md` page.
- A mirrored story in `stories/mirrored/`.
- Type fixtures in `tests/fixtures/types/fail/` and the fixture prefix they use.
- Usage fixtures in `tests/fixtures/usage/`.
- Rows in `tests/react.test.tsx`.
- An enhancer in `src/js/`, and whether `enhance()` calls it.
- A recipe in `.agents/skills/verify-odd-design/features/`.

For vanilla CSS and JS, the shape checks are these: selector naming (`.odd-x` with `data-*` variants), private properties named `--_x`, how states are hooked (`aria-*`, `:disabled`, `[data-*]`), focus styling through `--focus-*`, whether motion goes through `--duration-*` and `--ease`, forced-colors handling, and the enhancer signature `(root) => cleanup`.

### Anti-pattern findings

These are the kinds the goal names. Each needs evidence beyond one file.

- **One-off APIs.** A prop, attribute, or option that one component spells differently from its siblings. Example to test: `tone` versus `variant` versus `data-tone`.
- **Duplicated enhancers.** Two or more functions in `src/js/` that do the same job, such as roving focus, outside-click, typing, or observing insertions.
- **Missing shared tokens or helpers.** A pattern written by hand in three or more places. Rule 6 covers the CSS case.
- **Theme and chrome drift.** A component that looks wrong under a shipped chrome because it ignores a chrome token. This needs a render to prove it. See step 5.
- **Token graph faults.** A `var(--x)` with no definition in any layer, which fails silently. A token defined and never read. A token defined in a layer that does not own it.
- **Accessibility contract gaps that block expansion.** A rule the checkers enforce for one component and skip for its sibling, where the next component would copy the gap. Single-component a11y bugs belong in `docs/follow-ups.md`, not here.

Each finding is tagged `new` or `known` with a link to the `docs/follow-ups.md` item it matches.

## Method

Two scripts carry the evidence. They are committed so a reviewer can rerun them. Both are read-only, and neither is shipped in the package.

- [ ] **1. Build the scanner.** A delegate writes `scripts/audit-consistency.ts`. It reads the in-scope files and prints three Markdown tables.
  - The literal table has one row per literal. Its columns are category, `file:line`, property, value, the token that holds the same value if one exists, and a verdict.
  - The token graph lists undefined references, unused tokens, and tokens defined outside their owning layer.
  - The module-shape matrix has one row per component, with the columns above.

  With `--write`, it replaces the generated sections of the report between `<!-- audit:NAME -->` markers. Verdicts come from `docs/audits/consistency-tokens.verdicts.tsv`, keyed by file, property, and value so that line drift keeps them. A literal with no verdict prints as `unclassified`.
  Evidence: the lead counts one file by hand (`badge.css`) and the script's rows for it match. A second `--write` run produces no diff. `bun run check` passes.
- [ ] **2. Build the citation checker.** In the same script, `--check-cites` reads every `path:line` link in the report and fails when the line does not exist or does not contain the value quoted beside it.
  Evidence: the checker fails on a planted wrong line number and passes after the fix. The planted line is reverted.
- [ ] **3. Classify every literal.** A judgment delegate reads the rubric above and writes one verdict row per unclassified literal: `token <name>`, `missing-scale <family>`, `shared <name>`, or `exception <reason>`.
  Evidence: the scanner reports 0 `unclassified`. The lead spot-checks 15 rows chosen by the script's `--sample 15` seed against the source.
- [ ] **4. Review the anti-patterns by seam.** Four delegates run in parallel. Each gets this plan's rubric and one seam, but not the lead's hypotheses. The seams are these:
  - CSS layers and components.
  - Vanilla JS enhancers and fallbacks.
  - React modules, `part.ts`, `props.ts`, and the contract rows.
  - Stories and docs.

  Each returns findings with `file:line`, the rule, a fix direction, and a `new` or `known` tag.
  Evidence: one findings file per seam in `.verify/audit/` (gitignored).
- [ ] **5. Verify each finding adversarially, on the other provider.** A `cursor grok-4.7` verifier reads each seam's findings and the cited code. It marks each finding CONFIRMED, PLAUSIBLE, or REJECTED, with a reason. Only CONFIRMED and labeled PLAUSIBLE findings reach the report. Rejected ones are logged in the decision trail with the reason.
  For every drift finding, a delegate drives the `verify-odd-design` skill. It renders the component under all 5 chromes in light and dark, and records the computed value of the property in question. The finding states the measured values. If the render shows no drift, the finding is downgraded to latent.
  Evidence: the verdict files, plus computed-style dumps and screenshots under `.verify/audit/drift/`.
- [ ] **6. Write the report.** A judgment delegate writes `docs/audits/consistency-tokens.md` with the outline below. Then it runs the scanner's `--write` and `--check-cites`.
  Evidence: `--check-cites` passes. Every backlog item links its findings.
- [ ] **7. Review the report on the other provider.** A `cursor grok-4.7` reviewer checks the report against the Done-when predicate and samples its evidence. The lead fixes nothing by hand. Review findings go to a fresh writer delegate.
  Evidence: the reviewer's verdict, and the round count in the decision trail.
- [ ] **8. Close.** Run `bun run check`. Commit the decision trail at `docs/audits/consistency-tokens.decisions.tsv`, and get a cross-model review of it. Push the branch and open a PR for reading. Do not merge.
  Evidence: the check output, the PR link, and the trail reviewer's flags.

The scanner is a single read-only file whose shape is already concrete, so the architect skill is skipped for it. The audit has no one-way doors. The fixes it ranks may, and each gets its own plan.

## Report outline

`docs/audits/consistency-tokens.md` has five sections, matching the goal.

1. **Current state.** The inventory matrix (generated), what changed in #24 to #40, and the post-port follow-ups as landed. It also states the baseline SHA and the date.
2. **Consistency gaps.** The module-shape matrix (generated), followed by one entry per deviation from the Button, Field, and Choice shape, in both vanilla and React.
3. **Hardcoded values.** The literal table (generated), grouped by category: color, spacing, radius, border width, font size, font weight, tracking, line height, z-index, shadow, motion. Exceptions appear with their reasons. Each missing scale gets one entry with all of its uses.
4. **Other anti-patterns.** One entry per verified finding. Each entry has the rule, the evidence, the `new` or `known` tag, and the verifier's verdict.
5. **Ranked fix backlog.** One row per fix. A fix may close several findings.

## Ranking and blast radius

Each backlog item gets two scores from 1 to 3 and a blast radius.

- **Expansion cost.** 3 if every new component would copy the problem. 2 if some would. 1 if it is isolated.
- **Drift.** 3 if a render under a shipped chrome or palette shows it. 2 if it is latent. 1 if it has no visual effect.

Items sort by expansion cost times drift, highest first. Ties go to the smaller blast radius. The blast radius lists the files touched, the components affected, whether visuals change and under which chromes, whether the public API changes (breaking, additive, or none), which `ODD-` codes or checkers change, and which tests need updating. An item that depends on another, such as a new `--weight-*` scale before migrating `font-weight` literals, names that dependency.

## Rigor

Rigor is medium-high. The audit itself is reversible and changes no product code, which argues for less. The backlog will steer changes to visuals and public APIs, which argues for more. So every number comes from a committed script, every finding passes a verifier on a different provider, every drift claim is measured in a render, and every citation is checked by a script.

## Throughput checkpoint

| Unit | Who | Runs | Estimate (guess) |
| --- | --- | --- | --- |
| 1, 2. Scanner and citation checker | builder | 1 | 45 min |
| 3. Classify literals | judgment | 1 | 30 min |
| 4. Seam review | judgment | 4 in parallel | 40 min |
| 5. Verify findings, render drift | verifier, verify-skill driver | 4 verifiers, 1 driver | 45 min |
| 6. Report | judgment | 1 | 40 min |
| 7. Review | cross-provider reviewer | 1 or 2 rounds | 30 min |

The total is about 4 hours of wall-clock time, by guess. Units 1 and 2 come first because every later unit reads their output. Unit 4 does not depend on unit 3, so it runs at the same time.

## Models

Routing follows `models.txt` in the odd-mode skill. Every child is a `delegate_task` in this T3 Code thread.

| Role | Entry |
| --- | --- |
| Scanner builder, units 1 and 2 | `feature, refactoring`: `claudeAgent claude-opus-5-5 effort=high` |
| Classifier, seam reviewers, report writer | `judgment and prose`: `claudeAgent claude-opus-5-5 effort=high` |
| Finding verifier, report reviewer, trail reviewer | `cross-provider reviewer`: `cursor grok-4.7 reasoning_effort=high fastMode=true` |

`cursor` children run in this checkout. Its folder name, `C-wt-odd-design-chore-consistency-tokens-audit`, is 46 characters, under the 51 limit. Each `cursor` brief carries the done marker that odd-mode requires.

## Limits

- `rg` sees literals in files. It does not see a value a script sets at runtime through `element.style`. The JS seam reviewer looks for those by hand.
- The drift renders run in Chromium through the verify skill. Firefox and WebKit are not rendered for drift. A drift claim that depends on an engine says so.
- Scores are judgments, not measurements. The report shows the inputs to each score so Caleb can disagree with them.

## Decisions taken by default

These are reversible. Each is listed so Caleb can overrule it at approval.

- `scripts/audit-consistency.ts` and `docs/audits/consistency-tokens.verdicts.tsv` are committed. They are not in the package `files` list, so consumers never get them. A later fix can turn the verdicts file into a lint gate that fails on new unclassified literals.
- The decision trail is committed, because Caleb reviews this audit after the fact.
- The branch is pushed and a PR is opened for reading. Nothing merges.
