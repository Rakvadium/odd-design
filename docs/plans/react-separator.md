# React Separator plan

`odd-design/react` gains `Separator`, which renders `hr.odd-separator`. It has no mapped props. The caller writes `aria-orientation="vertical"`, the attribute `separator.css` reads, exactly as in the HTML docs. Four new codes, ODD-SEPARATOR-001 to 004, cover the Separator mistakes one node can show. TypeScript, ESLint, and the runtime checker report them from the same `USAGE` rules. The Separator story moves into the mirror and keeps its id, `components-data-display--separator`, so the React Storybook shows it built from the real part.

The work ships as one PR on `feat/react-separator`, based on `3af3465` (Avatar, PR #26). It is built as three commits after this plan, and each commit ends in a check. Nothing merges or deploys.

Caleb granted overnight autonomy for this run. The build starts after this plan is committed and uses the default in each decision below. The run stops when the PR is open and its checks report.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, and verifies.

The design came from two architect runners and a cross-judge. Both runners built and tested their design in a scratch worktree. The records are local scratch in the gitignored `.verify/plan/` folder of this worktree (Appendix C).

## Usage

```tsx
import { Separator } from "odd-design/react";

<Separator />;
<div className="odd-row">
  <a href="/decks/1/edit">Edit</a>
  <Separator aria-orientation="vertical" />
  <a href="/decks/1/export">Export</a>
</div>;
```

| Part | Element | Props from the contract |
| --- | --- | --- |
| `Separator` | `hr.odd-separator` | `aria-orientation?: "horizontal" \| "vertical"`, derived from the rule. `role?: "separator"`. `aria-hidden` and `data-orientation` are typed as their code's message. A system `data-*` is typed as the `ODD-SEPARATOR-004` message. `children` is `never` |

Leaving `aria-orientation` out is the horizontal line. `Separator` has no `"use client"`.

## Contract

Each rule comes from `separator.css`, the Separator story, the other `odd-separator` call sites, or a mistake an agent makes by copying the nearest example.

| Code | Kind | Fails when | Source | TypeScript |
| --- | --- | --- | --- | --- |
| `ODD-SEPARATOR-001` | `element` | `odd-separator` is not on an `hr` | The `separator.css` header, the README row, `menu.ts`, and every story. An `hr` is announced as a separator. A `div` with the class draws the same line and is read as nothing | Not a type error. `part` renders the tag |
| `ODD-SEPARATOR-002` | `enum` on `aria-orientation` (`horizontal`, `vertical`, no omit), plus `forbidden-attribute` on `data-orientation` | `aria-orientation` has another value, such as `verticle`, or `data-orientation` is present | `separator.css:16` turns the line only on `aria-orientation="vertical"`. `data-orientation` is the shadcn and Radix hook, the stylesheet ignores it, and `HEADLESS_ALLOWLIST` hides it from `system-data` | `aria-orientation` is `Values` of the enum. `data-orientation` is the 002 message |
| `ODD-SEPARATOR-003` | `enum` on `role` (`separator`), plus `forbidden-attribute` on `aria-hidden` | the `hr` has a role other than `separator`, or has `aria-hidden` | `separator.css:4`: a line that means nothing is a border on the container, not an element. `role="none"` is the shadcn decorative default | `role` is `"separator"`. `aria-hidden` is the 003 message |
| `ODD-SEPARATOR-004` | `system-data` | the separator has a system `data-*`, such as `data-tone` | `VOCABULARY.separator` is empty. AlertTitle and AvatarGroup ship the same rule with no own names | Each system name is typed as the 004 message |

`children?: never` is a part-level type, not a code. `hr` is void, and React throws on an `hr` with children before any checker sees the DOM. The precedent is `"data-initials"?: never` on `Avatar`.

Not added:

- A rule that a vertical separator sits inside a row. No rule kind reads an element's ancestors. Appendix D records it.
- A mapped `orientation` prop. Appendix B records why.

## Shape

`WRAPPERS.Separator` is `{ className: "odd-separator", props: {}, element: "hr" }`. `src/react/separator.tsx` is the README recipe with two typed lines and a `children` guard.

```tsx
interface SeparatorContract extends Contract<"Separator", SeparatorRule> {
  "aria-orientation"?: Values<SeparatorRule, "aria-orientation">;
  role?: Values<SeparatorRule, "role">;
  children?: never;
}
export interface SeparatorProps extends SeparatorContract, Native<"Separator", keyof SeparatorContract> {}
export const Separator: (props: SeparatorProps) => ReactElement = part("Separator");
```

`part.ts`, `check.ts`, `jsx.ts`, `html.ts`, `dom.ts`, `mirror.ts`, and `mirror-react.ts` do not change. The messages read the enum rows by position in `USAGE.separator`, so the enum rows keep their order.

## Decisions taken under the autonomy grant

Each item is the default the build uses. Each one can be reversed after review.

1. **Raw `aria-orientation`, no mapped prop.** The repo keeps ARIA attributes raw (`aria-current`, `aria-disabled`, Avatar's `role`). A mapped prop would force `horizontal` to an omit token under the CSS-sync test, break the vocabulary test, and drop a raw `aria-orientation` with no report.
2. **`horizontal` is a legal value.** It is valid ARIA and draws the base line. An omit token would print "horizontal means remove the attribute" against correct markup.
3. **`data-orientation` is forbidden on the separator, under 002.** Both runners saw it as the likeliest silent mistake. The cross-judge sided with forbidding it. It joins 002 because its fix is the same, set `aria-orientation`. The cost is that a Radix separator rendered with the `odd-separator` class, which sets both attributes, reports 002.
4. **`role` and `aria-hidden` share 003.** Both make the `hr` a line that means nothing, and both have one fix. `role` is an enum so an explicit `role="separator"` passes. `aria-hidden="false"` also reports, because `forbidden-attribute` reads presence.
5. **Keep `system-data` (004).** The cross-judge argued it does not earn its place. AlertTitle and AvatarGroup are the closest precedent, and each ships one.
6. **Opus candidate as the base, grok rules grafted in.** The cross-judge recommended the grok base. Both grafts converge on nearly the same result, and the opus lab already carries the docs, smoke, and browser runs.
7. **Accept a new HTML Storybook sidebar order in Data Display.** The mirrored file loads later, so Separator sorts after Avatar. The Badge, Choice, Alert, and Avatar ports made the same trade.

## Capture the baseline (no source change)

- [x] Build both Storybooks from `3af3465` with `bun scripts/storybooks.ts .verify/separator/base-sb`, serve the build, and capture the HTML section with `bun scripts/capture-stories.ts <url>/html .verify/separator/base.json .verify/separator/base-shots`.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check.

### Commit 1. Add Separator and check it with ODD-SEPARATOR-001 to 004

- [x] Add `USAGE.separator`, `SeparatorRule`, the `WRAPPERS` row, the four codes in `USAGE_CODES`, and their `MESSAGES`.
- [x] Write `docs/usage/separator.md` with one section per code.
- [x] Create `src/react/separator.tsx`. Add the barrel export and the `WrapperProps` line.
- [x] Add the `odd-separator-001` to `004` bad and good HTML pairs, four `RUNTIME_CODES` lines, and the `places` rows in `tests/eslint-html.test.ts`. Move `odd-separator` in `odd-class-001.good.html` onto an `hr`.
- [x] Add type fail fixtures for `aria-orientation`, `role`, `aria-hidden`, `data-orientation`, `data-tone`, and children, each with its `failures` entry. Add `pass.tsx` lines.
- [x] Add `tests/fixtures/usage/jsx/separator.tsx` and its `places` entry. Add one markup row to `tests/react.test.tsx`.
- [x] Check. Delete the `role` line, the `children` line, the `data-orientation` rule, and the `system-data` rule one at a time, and the fixtures that name each fail.

### Commit 2. Mirror Separator in the Storybooks

- [x] Create `stories/mirrored/Separator.stories.ts` with `title: "Components/Data Display"` and the export `Separator`. The scene is the HTML story. The meta component description carries the story text.
- [x] Remove the `Separator` export from `stories/DataDisplay.stories.ts`. Add the id to the mirrored-ids pin in `tests/stories.test.ts`.
- [x] Measure the `aria` literal in the built Firefox Storybook, then paste it.
- [x] Check. `bunx playwright test e2e/usage.spec.ts --project firefox` passes.

### Commit 3. Docs, smoke, and the verify recipe

- [x] In `docs/usage/react.md`, add "Split sections with a separator" and the type-error rows. Add a Separator section to `docs/usage/eslint.md`. Update the Separator lines in `README.md`.
- [x] Add `docs/usage/separator.md` to `REQUIRED` in `scripts/consumer-smoke.ts`. The clean app renders a `Separator`.
- [x] Update `.agents/skills/verify-odd-design/features/data-display.md` for the React Separator.
- [x] Add the follow-ups in Appendix D to `docs/follow-ups.md`.
- [x] Check. `bun run check`, `bun run build`, and `bun scripts/consumer-smoke.ts` pass.

## Verify on the real surface

- [x] Rebuild both Storybooks, capture the HTML section to `after.json`, and run `bun scripts/capture-stories.ts --diff .verify/separator/base.json .verify/separator/after.json`. Pass means `changed` lists only `components-data-display--separator`, with no `png` or `aria` change, and nothing else moves. Result: 2 changed (Separator light and dark, in `dom` only), 0 removed, 0 added.
- [x] Run `bun run test:browsers`. Pass means the Firefox and WebKit runs pass and the sweep reports 0 diagnostics. Result: 45 passed, 2 skipped, and 1 failed on the Firefox tooltip hover timing, which passed 3 of 3 on a rerun. "57 stories, 0 diagnostics", 0 axe violations.
- [x] Drive the composed build per the verify-odd-design skill. Open `react_components-data-display--separator` and `components-data-display--separator` in `calm` light, `holoterminal` dark, and one more palette. Save each screenshot and `ariaSnapshot`, and confirm that the two sides look the same and the vertical lines stand between the links. Result: `ctl.ts` drives only the HTML dev Storybook, so `.verify/separator/chrome-pair.ts` drove both sides of the built composed Storybook in Chrome. `calm` light, `holoterminal` dark, and `bubblegum` `sorbet` dark each gave byte-identical screenshots and identical aria. The vertical lines stand between the links, at `A@16 HR@53 A@66 HR@137 A@150` in calm.

## Review and open the PR

- [x] The `cursor grok-4.7` reviewer reads the diff against this plan. A fresh builder fixes each finding that blocks. Other findings go to `docs/follow-ups.md`. Result: `interrogate` ran two reviewers, Opus and `cursor grok-4.7`, and this run is also the cross-provider review. It found 0 blocking findings and no correctness bugs. Both reviewers found that the 004 message listed `data-orientation` as allowed. Grok found that the README row forbade `role`, and Opus found that the README recipe missed the hand-typed `Values` line. Five nits covered the 003 wording, message derivation, duplicate fixture lines, and a stray `Button` in `pass.tsx`. A fresh builder fixed all of them. The `dangerouslySetInnerHTML` nit is noted and left out. The recipe gap is in `docs/follow-ups.md`.
- [x] Run `/deslop` and `/no-comments` over the diff. Result: `/deslop` removed nothing. Comment Sicko kept the one JSDoc on `children?: never` and the fixtures' `expect:` lines, which the tests parse.
- [ ] Open the PR ready with `gh pr create --base main --repo Rakvadium/odd-design`. The title is `feat(react): add Separator and mirror it in the Storybooks`.
- [ ] Run `gh pr checks`. The repo has no workflows, so expect "no checks reported". Report the PR as open. Do not merge.

## Throughput checkpoint

- **Blocking first steps.** The committed plan, then the baseline capture. Commit 2 needs commit 1's part. Commit 3 needs both.
- **Independent workstreams.** None worth splitting. The tests, fixtures, stories, and docs all read the `contract.ts` rows.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The `.verify/plan/` candidates are read-only references.
- **Smallest safe decomposition.** One builder, one commit at a time, each checked before the next. The base candidate's lab is already a full patch, so a split would only add merges.

## Appendix A. Design choices

| Fork | Chosen | Why |
| --- | --- | --- |
| Parts | `Separator` only | `separator.css` styles one class. `.odd-menu > .odd-separator` is the same class inside an unported menu. |
| Orientation | Raw `aria-orientation`, typed from the enum | The stylesheet reads it, the docs use it, and the repo keeps ARIA raw. |
| Values | `horizontal` and `vertical`, no omit | Both are valid ARIA, and `horizontal` is the base line. |
| `data-orientation` | Forbidden, under 002 | The stylesheet ignores it and the allowlist hides it. Same fix as a bad orientation. |
| Decorative separator | `role` enum of `separator`, `aria-hidden` forbidden, under 003 | The CSS header says a meaningless line is a border. |
| `system-data` | Kept, as 004 | AlertTitle and AvatarGroup precedent. |
| Children | `never` on the part | React throws on an `hr` with children. |
| `SeparatorOrientation` export | No | It would equal React's own type and the attribute is the public name. |

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| A mapped `orientation` prop (the Radix and shadcn name) | The CSS-sync test forces `values: ["vertical"]`, so `horizontal` becomes "remove the attribute". It breaks the vocabulary test, and `lower` drops a raw `aria-orientation` with no report. |
| `values: ["vertical"]`, `omit: ["horizontal"]` | It reports valid ARIA as a mistake. |
| A rule-less row, like `Label` | It leaves `div.odd-separator`, `role="none"`, and orientation typos unchecked. |
| Forbidding `role` outright, as Alert does | It fails an explicit `role="separator"`. |
| `data-orientation` allowed, as the opus runner proposed | The line stays horizontal and no checker says why. |
| `data-orientation` under its own code, as the grok runner proposed | It has the same fix as a bad `aria-orientation`. |
| No `system-data`, as the grok runner and the cross-judge proposed | AlertTitle and AvatarGroup ship it with no own names. |

## Appendix C. Evidence and reading list

These files are local scratch under the gitignored `.verify/plan/` folder of this worktree. They are not on the branch.

- `how.md` explains the contract, the wrappers, the checkers, and the mirror, and lists 15 open forks.
- `task.md` and `rubric.md` are the arena's task and scoring rubric.
- `candidate-opus/` is the base. Its lab passed `bun run check` with 466 tests, `bun run test:browsers` with 57 stories and 0 diagnostics, `bun run build`, consumer smoke, and a baseline capture diff that moved only the separator story's inline style text.
- `candidate-grok/` is the other design. Its lab passed `bun run check` with 466 tests and the Firefox pair sweep.
- `judge.md` holds the cross-judge's scores and pick. `synthesis.md` records the base, the grafts, and the rejections.

## Appendix D. Risks and follow-ups

- **A vertical separator outside a row passes every checker.** It gets `min-block-size: 1em` and no stretch. No rule kind reads an element's ancestors.
- **A Radix separator with the `odd-separator` class reports 002.** Radix renders `data-orientation` beside `aria-orientation`. Nothing in this repo composes Radix onto `odd-` classes today.
- **A computed `aria-orientation` warns.** `<Separator aria-orientation={o}>` raises `ODD-STATIC-001`, the same as Badge, Alert, and Avatar. This is the existing cross-part follow-up.
