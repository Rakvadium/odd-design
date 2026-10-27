# React Badge plan

`odd-design/react` gains `Badge`, which renders `span.odd-badge`. `tone` sets `data-tone` and `solid` sets `data-solid`. Four new codes, ODD-BADGE-001 to 004, cover the Badge mistakes one node can show. TypeScript, ESLint, and the runtime checker report them from the same `USAGE` rules. The Badge story moves into the mirror and keeps its id, `components-surfaces--badge`, so the React Storybook shows it built from the real part.

Badge has no sibling parts. `badge.css` styles one class, and no other `WRAPPERS` row or `USAGE` group belongs to it.

The work ships as one PR on `feat/react-badge`. It is built as five commits after a baseline capture, and each commit ends in a check. Nothing merges or deploys.

Caleb granted overnight autonomy on 2026-10-26. The build starts after this plan is pushed and uses the default in each decision below. The run stops when the PR is open and its checks report.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, and verifies.

The design came from two architect runners and a cross-judge. Both runners built and tested their design in a scratch worktree. The records are local scratch in the gitignored `.verify/plan/` folder of this worktree (Appendix C).

## Usage

```tsx
import { Badge, type BadgeTone } from "odd-design/react";

<Badge>Draft</Badge>;
<Badge tone="danger" solid>Banned</Badge>;

const toneOf: Record<DeckStatus, BadgeTone> = { draft: "neutral", legal: "success", rotating: "warning", banned: "danger" };
<Badge tone={toneOf[deck.status]}>{deck.status}</Badge>;
```

| Part | Element | Props from the contract |
| --- | --- | --- |
| `Badge` | `span.odd-badge` | `tone?: BadgeTone`, `solid?: boolean` |

`BadgeTone` is `"neutral" | "primary" | "success" | "warning" | "danger" | "info"`. Leaving `tone` out is also neutral. `solid={false}` renders no `data-solid`. `Badge` has no `"use client"`, because it holds no state and no handlers.

## Contract

Each rule comes from `badge.css` or from a mistake an agent makes by copying Button, the nearest example.

| Code | Kind | Fails when | Source | TypeScript |
| --- | --- | --- | --- | --- |
| `ODD-BADGE-001` | `element` | `odd-badge` is on anything but a `span` | The `badge.css` header and every story use `span`. A badge sits in a `p`, a heading, or a button, which take phrasing content only | Not a type error. `part` renders the `span` |
| `ODD-BADGE-002` | `enum` | `data-tone` is not `neutral`, `primary`, `success`, `warning`, `danger`, or `info` | `badge.css:35-39` and `:51`. An unknown tone renders as neutral with no warning | `tone` is `BadgeTone`, and the error lists the six values |
| `ODD-BADGE-003` | `boolean-attribute` | `data-solid` has a value other than empty or `true` | `[data-solid]` is a presence selector, so `data-solid="false"` renders solid, the same trap as `ODD-BUTTON-004` | `solid` is `boolean`, and raw `data-solid` is `never` |
| `ODD-BADGE-004` | `system-data` | a badge carries another component's `data-*`, such as `data-variant`, or a near miss such as `data-tnoe` | `VOCABULARY` lists the system names. `badge.css` reads neither `data-variant` nor `data-size` | Each foreign system name is typed as the 004 message |

Not added:

- `neutral` as an omit token. `badge.css` documents it and selects it.
- A rule that a badge has text. It needs a new rule kind, and no story writes an empty badge.
- `role`, `aria-hidden`, or disabled rules. Nothing in the CSS or in behavior supports them.

## Shape

`USAGE.badge` holds the four rules. `WRAPPERS.Badge` is `{ className: "odd-badge", props: { tone: "data-tone", solid: "data-solid" }, element: "span" }`. `src/react/badge.tsx` is the README recipe plus one alias.

```tsx
export type BadgeTone = Values<BadgeRule, "data-tone">;
interface BadgeContract extends Contract<"Badge", BadgeRule> {}
export interface BadgeProps extends BadgeContract, Native<"Badge", keyof BadgeContract> {}
export const Badge: (props: BadgeProps) => ReactElement = part("Badge");
```

`jsx.ts`, `html.ts`, `toHtml`, and `toReact` do not change. Two shared files change, and each change has a measured reason.

1. **`ATTRIBUTES` is deleted.** The runtime checker reads a class's own data attributes from `ATTRIBUTES`, keyed by `USAGE` group. React and ESLint read them from `WRAPPERS`, keyed by part name. A Badge `system-data` rule with no `ATTRIBUTES.badge` makes the runtime and ESLint report `data-tone` on every correct badge while TypeScript accepts it. The lab measured 15 or more failing tests from that one omission. `check.ts` now takes own attributes from the `WRAPPERS` row with the same `className`, a key both tables already carry. The Button and Badge system-data messages list their attributes as `WRAPPERS.<Part>.props.<prop>`, so a renamed prop fails to compile. `react-uniformity.md` deferred this decision to the Badge PR.
2. **`Values` gives `never` when no `enum` rule matches.** At `ae04c60` it gives `unknown`, so a mapped prop whose rule is missing accepts any value with no type error. The lab showed it on Badge. With the `data-solid` rule deleted, `solid` took any value and `tsc` stayed silent. The new form is an indexed access, `Extract<Rule, { kind: "enum"; attribute: Attribute; values: readonly string[] }>["values"][number]`. The fail-fixture `tsc` output for every existing part is byte-identical before and after.

Two story templates write `data-tone="${tone}"` inside `/* html */`, at `DataDisplay.stories.ts:49` and `Showcase.stories.ts:22`. Once a rule reads `data-tone`, each raises `ODD-STATIC-001`, and the story sweep allows none. Each badge becomes its own `/* html */` literal, so the checker reads every tone, and the rendered DOM stays the same.

## Decisions taken under the autonomy grant

Each item is the default the build uses. Each one can be reversed after review.

1. **`neutral` is an allowed tone.** The alternative makes `data-tone="neutral"` an error that says to remove the attribute, and edits the `badge.css` header to match. That rule would contradict the `badge.css:51` selector.
2. **Delete `ATTRIBUTES` and derive it from `WRAPPERS` in `check.ts`.** This changes the contract layer for Button too, with the same runtime behavior. The alternative adds `ATTRIBUTES.badge`, a second hand-synced list.
3. **Fix `Values` in `part.ts`.** It is one line, and no existing type error changes.
4. **Rewrite the two computed-tone templates as literals.** The alternatives are an `eslint-disable` with a reason, which hides two badges from the checker, or a helper module for two call sites.
5. **Accept a new HTML Storybook sidebar order in Surfaces.** Badge moves after Dialog and Disclosure, because the mirrored file loads later. The id does not change. It is the same trade the Choice port made.

## Capture the baseline (no source change)

- [ ] Run `bun install`. Build both Storybooks from this branch before any change with `bun scripts/storybooks.ts .verify/badge/base-sb`. Serve the build and capture the HTML section with `bun scripts/capture-stories.ts <url> .verify/badge/base.json .verify/badge/base-shots`. The evidence is `base.json`, with one light and one dark capture per story.
- [ ] Save `bunx tsc -p tests/fixtures/types/fail --noErrorTruncation` to `.verify/badge/fail-before.txt`.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check.

### Commit 1. Derive own data attributes from WRAPPERS

- [ ] Delete `ATTRIBUTES` from `contract.ts`. `check.ts` reads a class's own attributes from the `WRAPPERS` row with the same `className`. `format.ts` builds Button's 015 attribute list from `WRAPPERS.Button.props`.
- [ ] In `usage-contract.test.ts`, replace the `ATTRIBUTES.button` subset line with "every wrapper-mapped attribute is in its stylesheet's vocabulary". Add "a system-data message names every attribute its class's wrapper maps".
- [ ] Check. `bun run check` passes with every Button fixture unchanged.

### Commit 2. Type a mapped prop with no rule as never

- [ ] Change `Values` in `src/react/part.ts` to the indexed access in Shape.
- [ ] Check. `bun run check` passes. A fresh `tsc -p tests/fixtures/types/fail --noErrorTruncation` output equals `fail-before.txt`.

### Commit 3. Add Badge and check it with ODD-BADGE-001 to 004

- [ ] Add `USAGE.badge`, `BadgeRule`, `WRAPPERS.Badge`, the four codes in `USAGE_CODES`, and their `MESSAGES`. The 002 message lists the values from the rule. The 004 message lists `WRAPPERS.Badge.props.tone` and `.solid`.
- [ ] Write `docs/usage/badge.md` with one section per code, in the `choice.md` style, citing the `badge.css` evidence.
- [ ] Create `src/react/badge.tsx`. Add the barrel export and the `WrapperProps` line.
- [ ] Add `odd-badge-001` to `004` bad and good HTML pairs, four `RUNTIME_CODES` lines, and the `places` rows in `tests/eslint-html.test.ts`. The good files hold a badge in a `p` and in a `button.odd-button`, all six tones, and app, appearance, and headless data attributes. Move `odd-badge` in `tests/fixtures/usage/odd-class-001.good.html` onto a `span`.
- [ ] Generalize the Button CSS-sync test to "each wrapper's enum data prop takes exactly the values its stylesheet styles". It asserts the compared list is `data-variant`, `data-size`, and `data-tone`, so it cannot pass empty.
- [ ] Add type fixtures. `badge-tone.tsx` passes a wrong tone, and its `failures` entry requires all six tone literals. `badge-data-variant.tsx` expects `ODD-BADGE-004`. Add `pass.tsx` lines for the `Record<Status, BadgeTone>` call site and `solid={boolean}`.
- [ ] Add `tests/fixtures/usage/jsx/badge.tsx` with a correct `Badge`, a wrapper `tone` error, wrapper foreign data, a raw `data-solid={false}`, and a raw `div.odd-badge`, plus its `places` entry.
- [ ] Add one row to the markup table in `tests/react.test.tsx` with a bare badge, `tone` with `solid` and `className`, and `solid={false}` with an app data attribute, as one exact string.
- [ ] Rewrite the two computed-tone templates in `DataDisplay.stories.ts` and `Showcase.stories.ts` so each badge is its own `/* html */` literal.
- [ ] Check. Make three mutations and confirm each fails. Delete the `boolean-attribute` rule, and `tsc` fails. Drop `neutral` from the tones, and the CSS sync and `pass.tsx` fail. Put a computed tone back in the Data Display table, and `bunx eslint stories` warns `ODD-STATIC-001`.

### Commit 4. Mirror Badge in the Storybooks

- [ ] Create `stories/mirrored/Badge.stories.ts` with `title: "Components/Surfaces"` and the export `Badge`, so the id stays `components-surfaces--badge`. The scene is the same twelve badges, two `odd-row`s of six. The meta description names `Badge`, its tones, and `solid`, because the React Storybook reads only that file.
- [ ] Delete the `Badge` export from `stories/Surfaces.stories.ts`. Add the id to the mirrored-ids pin in `tests/stories.test.ts`.
- [ ] Measure the story's `aria` literal in the built Firefox Storybook, then paste it. Do not copy the runner's value.
- [ ] Check. `bunx playwright test e2e/usage.spec.ts --project firefox` passes. Change one label in the `aria` literal and confirm the run fails, then restore it.

### Commit 5. Docs, smoke, and the verify recipe

- [ ] In `docs/usage/react.md`, add "Show a status with a badge", two rows in the type-error table, and `ODD-BADGE-001` in the "not a type error" paragraph. Add a Badge section to `docs/usage/eslint.md` that states the computed-`tone` warning. Add Badge to the `README.md` component and usage lines.
- [ ] Close the gaps the `how` pass found in README "Add a React part". Say that a group's rules run only with an `element` rule. Say that own data attributes come from the `WRAPPERS` row. Name the HTML fixture pairs with `RUNTIME_CODES`, the mirrored-ids pin, and the `REQUIRED` line for a new usage page.
- [ ] Add `docs/usage/badge.md` to `REQUIRED` in `scripts/consumer-smoke.ts`. The clean app renders `<Badge tone="success" solid>`.
- [ ] Add a "React Badge" section to `.agents/skills/verify-odd-design/features/surfaces.md` with the composed URL `react_components-surfaces--badge`. Check that the `.claude` and `.cursor` links show the edit.
- [ ] Check. `bun run check`, `bun run build`, and `bun scripts/consumer-smoke.ts` pass.

## Verify on the real surface

- [ ] Rebuild both Storybooks on the finished branch, capture the HTML section to `after.json`, and run `bun scripts/capture-stories.ts --diff .verify/badge/base.json .verify/badge/after.json`. Pass means `changed` lists at most `components-surfaces--badge`, and only in the `dom` field, never in `aria` or `png`. `components-data-display--table` and `showcase--sample-app` must not appear, which proves the literal rewrites render the same page.
- [ ] Run `bun run test:browsers`. Pass means the Firefox and WebKit runs pass, the Badge pair has equal accessibility trees and byte-identical screenshots, and the sweep reports 0 diagnostics.
- [ ] Serve the composed build with `bun e2e/serve.ts <dir> 6106` and drive it per the verify-odd-design skill. Open `react_components-surfaces--badge` and `components-surfaces--badge` in `calm` light, `sorbet` dark, and `holoterminal` dark. Save each screenshot and the `ariaSnapshot`, and confirm that every badge is legible and that the React and HTML sides look the same. Write a transcript with one line per step. Badge has no interaction, so the evidence is screenshots and snapshots, not a video.

## Review and open the PR

- [ ] The `cursor grok-4.7` reviewer reads the diff against this plan and `.verify/plan/synthesis.md`. A fresh builder fixes each finding that blocks. Other findings go to `docs/follow-ups.md`.
- [ ] Run `/deslop` and `/no-comments` over the diff.
- [ ] Open the PR ready, not draft, with `gh pr create --base main --repo Rakvadium/odd-design`. The title is `feat(react): add Badge and mirror it in the Storybooks`. Link the PR to this thread.
- [ ] Run `gh pr checks`. The repo has no workflows, so expect "no checks reported". Report the PR as open. Do not merge.

## Throughput checkpoint

- **Blocking first steps.** The pushed plan, then the baseline capture. No source changes before `base.json` and `fail-before.txt` exist. Commit 3 needs commit 1's derivation, because the 004 rule reads own attributes from `WRAPPERS`. Commit 4 needs commit 3's part.
- **Independent workstreams.** None worth splitting. Everything reads `contract.ts`, and the tests, fixtures, and stories all read its rows. Commit 5 is docs and is small.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The `.verify/plan/` candidates are read-only references, and the baseline is written once.
- **Smallest safe decomposition.** One builder, one commit at a time, each checked before the next. The base candidate's lab tree changed 38 files, mostly fixtures and docs. A split would serialize on `contract.ts` anyway.

## Appendix A. Design choices

| Fork | Chosen | Why |
| --- | --- | --- |
| Parts | One `Badge` | `badge.css` styles one class. |
| Codes | Four, one per rule kind | Each has a different fix. Choice shared a code only where two attributes were one constraint. |
| `neutral` | Allowed value | `badge.css:2` documents it, and `badge.css:51` selects it. |
| Own attributes | Read from `WRAPPERS` by `className` | It deletes the list a port forgets. |
| `Values` | Indexed access | It turns a silent `unknown` into a type error. |
| Computed story tones | Literal per badge | The checker reads every tone, and no helper is added. |
| `BadgeTone` export | Yes | A caller that maps app data to a tone needs the type. It follows `ButtonVariant`. |

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| `neutral` as an omit token, with a `badge.css` header edit (Grok runner) | The rule contradicts the `badge.css:51` selector. |
| `ATTRIBUTES` kept as a `SameKeys` projection (Grok runner) | It keeps a hand-listed key array and the `?? []` fallback that hides a missing row. |
| `stories/badge-html.ts` switch helper (Grok runner) | It is a module for two call sites. |
| No `system-data` rule, like Field and Choice | `data-variant` on a badge would pass every checker. Field and Choice publish no system data names, and Badge does. |
| `ATTRIBUTES.badge` beside `ATTRIBUTES.button` | It is a second hand-synced list keyed differently from `WRAPPERS`. |
| `badge-raw-data-tone` fixture, `ref` in `pass.tsx`, `data-tnoe` message assertion (judge grafts) | Each overlaps an existing test (Appendix C, `synthesis.md`). |

## Appendix C. Evidence and reading list

These files are local scratch under the gitignored `.verify/plan/` folder of this worktree. They are not on the branch.

- `how.md` explains the contract, the wrappers, the checkers, and the mirror, and lists 17 open forks with file and line evidence.
- `task.md` and `rubric.md` are the arena's task and scoring rubric.
- `candidate-opus/` is the base. Its lab passed `bun run check` with 402 tests, the Firefox pair sweep with 48 stories and 0 diagnostics, `bun run build`, and consumer smoke. It ran eight mutations, and each one failed.
- `candidate-grok/` is the other design. Its lab passed `bun run check` with 407 tests and the Firefox pair sweep.
- `judge.md` holds the cross-judge's scores and pick. `synthesis.md` records the base, the forks, and the rejected grafts.

## Appendix D. Risks

- **A computed `tone` warns.** `<Badge tone={toneOf[status]}>` raises `ODD-STATIC-001` as a warning under `odd/usage-incomplete`, the same as `<Button variant={v}>` today. The type already guards the value. Trusting typed wrapper props in the lowering is a cross-part change, recorded as a follow-up.
- **An empty badge passes.** `<span class="odd-badge"></span>` shows only a colored dot. Catching it needs a new rule kind. This is recorded as a follow-up.
- **`docs/plans/mirror-storybooks.md:132-136` is stale on fixed-tag rows.** It is a plan record, so it stays as written.
