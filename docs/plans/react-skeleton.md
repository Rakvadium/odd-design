# React Skeleton plan

`odd-design/react` gains `Skeleton`, which renders `div.odd-skeleton`. It maps one prop, `shape`, to `data-shape`, and `"avatar"` is its only value. The caller writes `aria-hidden="true"` on every block, as the `skeleton.css` header does. Five new codes, ODD-SKELETON-001 to 005, cover the Skeleton mistakes one node can show. TypeScript, ESLint, and the runtime checker report them from the same `USAGE` rules. The Skeleton story moves into the mirror and keeps its id, `components-feedback--skeleton`, so the React Storybook shows it built from the real part.

The work ships as one PR on `feat/react-skeleton`, based on `0a2847c` (Separator, PR #27). It is built as three commits after this plan, and each commit ends in a check. Nothing merges or deploys.

Caleb granted overnight autonomy for this run. The build starts after this plan is committed and uses the default in each decision below. The run stops when the PR is open and its checks report.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, and verifies.

The design came from two architect runners and a cross-judge. The Opus runner applied its design to a scratch copy of `0a2847c` and measured it. The Grok runner probed the types and the aria tree. The records are local scratch in the gitignored `.verify/skeleton/` folder of this worktree (Appendix C).

## Usage

```tsx
import { Skeleton } from "odd-design/react";

<div aria-busy="true">
  <span className="odd-visually-hidden">Loading decks…</span>
  <Skeleton aria-hidden="true" shape="avatar" />
  <Skeleton aria-hidden="true" style={{ inlineSize: "60%" }} />
</div>;
```

| Part | Element | Props from the contract |
| --- | --- | --- |
| `Skeleton` | `div.odd-skeleton` | `shape?: "avatar"`, mapped to `data-shape`. `"aria-hidden": "true"`, required. `role`, `aria-busy`, `aria-label`, and `aria-labelledby` are typed as the 004 message. `children` is typed as the 004 message. A system `data-*` is typed as the 005 message |

Leaving `shape` out is the 1em bar. `style` sizes each block. The region that is filling in carries `aria-busy` and the loading text, and the caller removes it when the content arrives. No checker can see the region. `Skeleton` has no `"use client"`.

## Contract

Each rule comes from `skeleton.css`, the Skeleton story, the README row, or a mistake an agent makes by copying the nearest example.

| Code | Kind | Fails when | Source | TypeScript |
| --- | --- | --- | --- | --- |
| `ODD-SKELETON-001` | `element` | `odd-skeleton` is not on a `div` | The `skeleton.css` header, the README row, and the story all use a `div`. `check.ts` applies the other rows only when the group has an `element` rule | Not a type error. `part` renders the tag |
| `ODD-SKELETON-002` | `enum` on `data-shape` (`avatar`), omit `text`, `line`, `rect`, `rectangular`, `rounded` | `data-shape` has another value | `skeleton.css` draws only `avatar`. `text`, `line`, and `rect` pass every checker today. `text`, `rectangular`, and `rounded` are MUI's bar variants. The fix says that a circle is `avatar` | `shape?: "avatar"`. A raw `data-shape` is `never` |
| `ODD-SKELETON-003` | `required-attribute` on `div` for `aria-hidden`, plus `enum` (`true`) | `aria-hidden` is missing, empty, or `false` | The `skeleton.css` header. The README writes a bare `aria-hidden`, which is empty in HTML and hides nothing. This row also arms 004 | A required `"aria-hidden": "true"` from `Pinned`, the Switch pattern |
| `ODD-SKELETON-004` | `icon-only-text` keyed on `aria-hidden` (ignore `aria-hidden`), plus `forbidden-attribute` on `aria-busy`, `role`, `aria-label`, and `aria-labelledby` | A hidden block holds visible text, or carries one of those attributes | Each one tries to announce loading from inside a hidden block, so nothing is announced. `aria-busy` is Button's loading idiom. `role="status"` is the spinner copy. A name on a hidden block is the loading words in the wrong place | `children` and each forbidden name are the 004 message |
| `ODD-SKELETON-005` | `system-data` | The block has a foreign system `data-*`, such as `data-size`, or a near miss of `data-shape` | `data-size="lg"` copied from a large Avatar does nothing, because the stylesheet has one size | Each foreign system name is the 005 message |

Text and the four attributes share 004 because they share one fix, which is to empty the block and announce on the region. Separator grouped its rules the same way.

Not added:

- A rule that the region has `aria-busy` and loading text. No rule kind reads a parent. Appendix D records it.
- A `SkeletonRegion` part. It needs a new CSS class, so it is component work, not a port.
- A part that writes `aria-hidden` itself. Appendix B records why.

## Shape

`WRAPPERS.Skeleton` is `{ className: "odd-skeleton", props: { shape: "data-shape" }, element: "div" }`. `src/react/skeleton.tsx` is the README recipe plus one typed line.

```tsx
interface SkeletonContract extends Contract<"Skeleton", SkeletonRule> {
  /** A skeleton block is hidden, so text inside it is never read. Put the loading words on the region. */
  children?: Message<"ODD-SKELETON-004">;
}
export interface SkeletonProps extends SkeletonContract, Native<"Skeleton", keyof SkeletonContract> {}
export const Skeleton: (props: SkeletonProps) => ReactElement = part("Skeleton");
```

`children` prints the 004 code instead of Separator's bare `never`, because a code exists for this mistake. `part.ts`, `check.ts`, `jsx.ts`, `html.ts`, `dom.ts`, `mirror.ts`, and `mirror-react.ts` do not change. One test literal changes. The CSS-sync list in `tests/usage-contract.test.ts` gains `"data-shape"`.

The scene keeps `aria-hidden="true"` on each `article.odd-card` and adds it to all 12 blocks, because each rule reads one node. Taking it off the cards adds two empty `article` nodes to the tree. The region keeps `aria-busy="true"` and the visually hidden "Loading decks…". The `aria` literal is `- text: Loading decks…`, measured in both built Storybooks in Firefox and WebKit.

## Decisions taken under the autonomy grant

Each item is the default the build uses. Each one can be reversed after review.

1. **The caller writes `aria-hidden="true"`.** The part could set it, but ESLint and the HTML Storybook read only the `WRAPPERS` row. A correct `<Skeleton />` would then fail ESLint, and the two Storybooks would render different DOM. The Choice port turned down a fixed-attributes field for Switch for the same reason.
2. **`aria-hidden` is the string `"true"`.** `aria-hidden={true}` and a bare `aria-hidden` fail TypeScript, although React renders both as `"true"`. ESLint reads the bare form as empty, so the string is the one spelling that every checker accepts.
3. **A missing `aria-hidden` prints "Property missing" in TypeScript, not the code.** Switch and AvatarGroup do the same. Printing the code belongs in `Pinned` for all three parts, as a follow-up.
4. **One code for text, `aria-busy`, `role`, `aria-label`, and `aria-labelledby`.** They have one fix. The cross-judge moved `aria-label` and `aria-labelledby` in from the Grok candidate.
5. **Five omit tokens on `data-shape`.** An omit token makes the message say "remove the attribute". `circle` and `circular` stay out, because removing the attribute draws a bar. The 002 fix names `avatar` for them.
6. **Keep `system-data` (005).** It catches `data-size="lg"` copied from Avatar.
7. **Opus candidate as the base, Grok grafts folded in.** The cross-judge and the lead each scored the Opus candidate higher. Appendix A lists the grafts.
8. **Accept a new HTML Storybook sidebar order in Feedback.** The mirrored file loads later, so Skeleton sorts after Alert. The Badge, Choice, Alert, Avatar, and Separator ports made the same trade.

## Capture the baseline (no source change)

- [x] Build both Storybooks from `0a2847c` with `bun scripts/storybooks.ts .verify/skeleton/base-sb`, serve the build, and capture the HTML section with `bun scripts/capture-stories.ts <url>/html .verify/skeleton/base.json .verify/skeleton/base-shots`. Result: 86 captures in `base.json`.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check.

### Commit 1. Add Skeleton and check it with ODD-SKELETON-001 to 005

- [x] Add `USAGE.skeleton`, `SkeletonRule`, the `WRAPPERS` row, the five codes in `USAGE_CODES`, and their `MESSAGES`. Add `"data-shape"` to the CSS-sync list.
- [x] Write `docs/usage/skeleton.md` with one section per code.
- [x] Create `src/react/skeleton.tsx`. Add the barrel export and the `WrapperProps` line.
- [x] Add the `odd-skeleton-001` to `005` bad and good HTML pairs, five `RUNTIME_CODES` lines, and the `places` rows in `tests/eslint-html.test.ts`. Add `aria-hidden="true"` to the skeleton in `odd-class-001.good.html`.
- [x] Add type fail fixtures for `shape`, a missing `aria-hidden`, text children, `aria-busy`, and `data-size`, each with its `failures` entry. Add `pass.tsx` lines.
- [x] Add `tests/fixtures/usage/jsx/skeleton.tsx`, including the bare `aria-hidden` line, and its `places` entry. Add one markup row to `tests/react.test.tsx`.
- [x] Check. Delete the `children` line and each rule row after the `element` row, one at a time, and the fixtures that name each fail. Result: `bun run check` passes 479 tests. Each deletion fails. `children` fails the type fixtures. The `data-shape` row breaks `tsc` and the `format.ts` import. Each other row fails 2 to 6 tests. The HTML Skeleton story gains `aria-hidden="true"` on its blocks here, because 003 flags them before commit 2 moves the story.

### Commit 2. Mirror Skeleton in the Storybooks

- [x] Create `stories/mirrored/Skeleton.stories.ts` with `title: "Components/Feedback"` and the export `Skeleton`. The scene is the HTML story with `aria-hidden="true"` on every block. The meta component description carries the story text.
- [x] Remove the `Skeleton` export from `stories/Feedback.stories.ts`. Add the id to the mirrored-ids pin in `tests/stories.test.ts`.
- [x] Measure the `aria` literal in the built Firefox Storybook, then paste it. Result: `- text: Loading decks�` on both sides in Firefox and WebKit, with 12 of 12 blocks hidden and byte-identical screenshots per engine.
- [x] Check. `bunx playwright test e2e/usage.spec.ts --project firefox` and the reduced-motion test in `e2e/behavior.spec.ts` pass. Result: `bun run check` passes 481 tests. `usage.spec.ts` passes 2 of 2 with "58 stories, 0 diagnostics". The reduced-motion test passes.

### Commit 3. Docs, smoke, and the verify recipe

- [ ] In `docs/usage/react.md`, add a section on holding the place of loading content, the type-error rows, and Skeleton in the "not type errors" paragraph. Add a Skeleton section to `docs/usage/eslint.md`. Fix the README row to `<div aria-hidden="true">` and add Skeleton to the part list.
- [ ] Add `docs/usage/skeleton.md` to `REQUIRED` in `scripts/consumer-smoke.ts`. The clean app renders a `Skeleton`.
- [ ] Update `.agents/skills/verify-odd-design/features/feedback.md` for the React Skeleton.
- [ ] Add the follow-ups in Appendix D to `docs/follow-ups.md`.
- [ ] Check. `bun run check`, `bun run build`, and `bun scripts/consumer-smoke.ts` pass.

## Verify on the real surface

- [ ] Rebuild both Storybooks, capture the HTML section to `after.json`, and run `bun scripts/capture-stories.ts --diff .verify/skeleton/base.json .verify/skeleton/after.json`. Pass means `changed` lists only `components-feedback--skeleton`, with no `png` or `aria` change, and nothing else moves.
- [ ] Run `bun run test:browsers`. Pass means the Firefox and WebKit runs pass and the sweep reports 0 diagnostics.
- [ ] Drive the composed build per the verify-odd-design skill. Open `react_components-feedback--skeleton` and `components-feedback--skeleton` in `calm` light, `holoterminal` dark, and one more palette. Save each screenshot and `ariaSnapshot`, and confirm that the two sides look the same, the avatar block is square, and the tree reads only "Loading decks…".

## Review and open the PR

- [ ] The `cursor grok-4.7` reviewer reads the diff against this plan. A fresh builder fixes each finding that blocks. Other findings go to `docs/follow-ups.md`.
- [ ] Run `/deslop` and `/no-comments` over the diff.
- [ ] Open the PR ready with `gh pr create --base main --repo Rakvadium/odd-design`. The title is `feat(react): add Skeleton and mirror it in the Storybooks`.
- [ ] Run `gh pr checks`. The repo has no workflows, so expect "no checks reported". Report the PR as open. Do not merge.

## Throughput checkpoint

- **Blocking first steps.** The committed plan, then the baseline capture. Commit 2 needs commit 1's part. Commit 3 needs both.
- **Independent workstreams.** None worth splitting. The tests, fixtures, stories, and docs all read the `contract.ts` rows.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The `.verify/skeleton/` candidates are read-only references.
- **Smallest safe decomposition.** One builder, one commit at a time, each checked before the next. The base candidate's lab is already a full patch for commits 1 and 2, so a split would only add merges.

## Appendix A. Design choices

| Fork | Chosen | Why |
| --- | --- | --- |
| Parts | `Skeleton` only | `skeleton.css` styles one class. `avatar` is a value. The region has no class |
| Shape | Mapped `shape`, `"avatar"` only | Matches Badge, Alert, and Avatar. The CSS-sync test pins it to the stylesheet. A raw `data-shape` would trip the part's own `system-data` |
| Hidden | Required `aria-hidden="true"`, written by the caller | The stylesheet header. It arms the text check. One spelling for every checker |
| Announcing from the block | Text, `aria-busy`, `role`, `aria-label`, `aria-labelledby` under 004 | One fix. Graft of the two name attributes from Grok |
| Omit tokens | `text`, `line`, `rect`, `rectangular`, `rounded` | Graft from Grok. The first three pass every checker today |
| `children` | Typed as the 004 message, with a JSDoc | The type error prints the code. JSDoc wording grafted from Grok |
| `system-data` | Kept, as 005 | Catches `data-size` from Avatar |
| Scene | `aria-hidden` on cards and blocks | Measured `- text: Loading decks…` in both Storybooks |

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| The part writes `aria-hidden` | ESLint and `toHtml` read only `WRAPPERS`, so a correct `<Skeleton />` fails lint and the Storybooks differ. Fixing that needs a field four modules read |
| `aria-hidden` typed as `"true" \| true` | The bare JSX form then typechecks, and ESLint reads it as empty and reports 003. Two spellings, and the short one fails lint |
| No `aria-hidden` rule | 004 never runs without it, so text inside a block stays silent |
| A conditional type that prints 003 for a missing `aria-hidden` | A second way to type a required attribute, used by one part. It belongs in `Pinned` |
| Six codes, as the Grok runner proposed | Two messages would print the same fix |
| `ignore: "hidden"` on the text rule, as the Grok runner proposed | `isHidden` reads only the value `true`, so a bare `hidden` still counts and an `aria-hidden` child is no longer skipped |
| `span` in the element list | The block is `display: block`, and the part renders one tag |
| A type fixture per forbidden attribute, a raw `data-shape` fixture, or an `aria-hidden={true}` fixture | Each repeats a type path another fixture in the suite already proves |

## Appendix C. Evidence and reading list

These files are local scratch under the gitignored `.verify/skeleton/` folder of this worktree. They are not on the branch.

- `how.md` explains the contract, the wrappers, the checkers, and the mirror, and lists 16 open forks.
- `task.md` and `rubric.md` are the arena's task and scoring rubric.
- `candidate-opus/` is the base. Its lab passed `bun run check` with 481 tests (467 at base). Deleting each rule row failed 2 or 3 tests. Both built Storybooks gave `- text: Loading decks…` with byte-identical screenshots per engine in Firefox and WebKit.
- `candidate-grok/` is the other design, with a type probe and a Firefox aria probe.
- `judge.md` holds the cross-judge's scores, its pick, and the grafts.

## Appendix D. Risks and follow-ups

- **Nothing checks the region.** A skeleton with no `aria-busy` region and no loading text passes every checker. No rule kind reads a parent.
- **A missing required attribute prints "Property missing".** `Pinned` could print the code for Switch, AvatarGroup, and Skeleton at once.
- **A spread silences 003.** `required-attribute` skips a node with a spread, as it already does for Switch.
- **A scene can pass children to the block.** Scene children follow the `div` tag, not the part. `checkRoot` still catches visible text.
- **The avatar square matches only the default Avatar size.** Skeleton sizes for `sm` and `lg` would be a CSS change.
- **A computed `shape` warns.** `<Skeleton shape={s}>` raises `ODD-STATIC-001`, the same as the other parts.
