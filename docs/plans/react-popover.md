# React Popover plan

`odd-design/react` gains one part, `Popover`. It renders `div.odd-popover` and maps no props, so it is `part("Popover")`, the Disclosure shape. The caller writes `popover`, an `id`, and, when the popover holds controls, `role="dialog"` and a name. `Button` already types `commandfor` and `command`, so it opens the popover, and the browser owns the top layer, light dismiss, Escape, focus return, and anchoring after that. Six codes, ODD-POPOVER-001 to 006, cover the popover mistakes a caller can write. TypeScript, ESLint, and the runtime checker report them from the same `USAGE` rows. The Popover story moves into the mirror and keeps its id, `components-overlays--popover`, so the React Storybook shows it built from `Button`, `Popover`, `Choice`, and `Separator`.

The work ships as one PR on `feat/react-popover`, based on `2823cce` (Toast, PR #34). It is built as three commits after this plan, and each commit ends in a check. Nothing merges or deploys.

Caleb granted overnight autonomy for this run. The build starts after this plan is committed and uses the default in each decision below. The run stops when the PR is open and its checks report.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, and verifies.

The design came from two architect runners and a cross-judge. Both runners converged on the same part and most of the same rows. The Opus runner applied its design to a scratch copy of `2823cce` and measured it in Firefox and WebKit. The Grok runner measured each misuse in the same engines. The `cursor grok-4.7` judge picked the Opus design as the base and named grafts from the Grok design, and this plan takes two of them. The records are local scratch in the gitignored `.verify/popover/` folder of this worktree (Appendix C).

## Usage

```tsx
import { Button, Choice, Popover } from "odd-design/react";

<Button commandfor="filters" command="toggle-popover">Filters</Button>
<Popover id="filters" popover="auto" role="dialog" aria-labelledby="filters-title">
  <p className="odd-eyebrow" id="filters-title">Filter decks</p>
  <Choice><input type="checkbox" defaultChecked /> Legal only</Choice>
  <Button size="sm" commandfor="filters" command="hide-popover">Apply</Button>
</Popover>;
```

A popover that only shows text takes no role and no name.

```tsx
<Popover id="rules" popover="auto">Banned cards are marked in red.</Popover>
```

To read the open state, sync it from the browser's own `onToggle`. The part holds no state.

| Part | Element | Props from the contract |
| --- | --- | --- |
| `Popover` | `div.odd-popover` | `popover: "" \| "auto"` is required. `role?: "dialog"`. `role="dialog"` with no name is the 004 message, and a name with no role is the 005 message. A system `data-*`, such as `data-tone`, is the 006 message. `id`, `ref`, `onToggle`, and the rest come from `ComponentProps<"div">` |

`popover.tsx` has no `"use client"`, because `part()` adds no state or handler.

## Contract

Each failure below was measured in Firefox and WebKit on the baseline build (`.verify/popover/candidate-opus/probes/misuse.out.json` and `candidate-grok/probes/browser.json`).

| Code | Group, kind | Fails when | What breaks | TypeScript |
| --- | --- | --- | --- | --- |
| `ODD-POPOVER-001` | `popover`, `element` on `div` | `odd-popover` is on another tag | A `p` ends before its first block child, so the controls render in the page while the popover is closed. A named `section` becomes a `region`. A `span` or `button` cannot hold the controls. The rule also makes the group live | Not a type error. The part renders the tag |
| `ODD-POPOVER-002` | `popover`, `required-attribute popover` and `enum popover ["", "auto"]` | `popover` is missing, `manual`, `hint`, or any other value | With none, the box stays in the flow at opacity 0, its controls take focus and are read out, and the trigger does nothing. `manual` and unknown tokens ignore Escape and a click outside. `hint` closes when any other popover opens | Yes. `Pinned` makes `popover: "" \| "auto"` required |
| `ODD-POPOVER-003` | `popover`, `enum role ["dialog"]` | `role` is `menu`, `tooltip`, `alertdialog`, or another value | A `menu` without `enhanceMenu` has no arrow keys. A `tooltip` belongs on `odd-tooltip`. `alertdialog` claims a modal alert | Yes. `role` is typed `"dialog"` |
| `ODD-POPOVER-004` | `popover`, `accessible-name role` | `role="dialog"` has no `aria-label` or `aria-labelledby` | The snapshot is `- dialog:` with no name | Yes, the 004 message |
| `ODD-POPOVER-005` | `popover`, new kind `name-requires` (`attribute: "role"`, `names: ["aria-label", "aria-labelledby"]`) | A name with no `role` | A generic `div` drops the name. The open snapshot is the content with no container and no name | Yes, the 005 message |
| `ODD-POPOVER-006` | `popover`, `system-data` | A foreign system `data-*`, such as `data-tone` | `popover.css` reads no data attribute, so `data-tone="danger"` changes nothing | Yes, from `ForeignData` |

`name-requires` is the converse of `accessible-name`, with the same fields. `accessible-name` says "when `role` is set, one of `names` must be there". `name-requires` says "when one of `names` is there, `role` must be there". It reports on the name attribute, counts a computed name as present and a blank one as absent (`hasName`), and stays silent on a node with a spread, as `required-attribute` does. Avatar's pair sits beside it, so an agent that copies one sees the other.

Not added:

- **A required `id`.** `showPopover({ source })` anchors under the source with no id (measured). An id rule would reject a valid ref path.
- **`aria-modal`.** No visible or audible failure was measured in either engine, and no screen reader ran.
- **"Has controls, so needs `role="dialog"`."** It would walk descendants for focusables, a new kind with no measured break beyond a generic container.
- **An ESLint lowering change for a bare JSX `popover`.** React drops `popover={true}` and warns. `tsc` rejects it on `Popover` and on an intrinsic `div`, and the runtime checker reports 002 on the rendered DOM (measured). Only an outside `.jsx` consumer misses it.
- **Rules for `odd-tooltip`, `odd-hover-card`, and `odd-menu`.** They take `hint` or `role="menu"`, so they cannot share this group. The good fixtures hold their markup, so a rule that leaks fails a test.

## Shape

### Rows

```ts
| { kind: "name-requires"; code: UsageCode; attribute: string; names: readonly string[] }

popover: [
  { kind: "element", code: "ODD-POPOVER-001", className: "odd-popover", elements: ["div"] },
  { kind: "required-attribute", code: "ODD-POPOVER-002", element: "div", attribute: "popover" },
  { kind: "enum", code: "ODD-POPOVER-002", attribute: "popover", values: ["", "auto"], omit: [] },
  { kind: "enum", code: "ODD-POPOVER-003", attribute: "role", values: ["dialog"], omit: [] },
  { kind: "accessible-name", code: "ODD-POPOVER-004", attribute: "role", names: ["aria-label", "aria-labelledby"] },
  { kind: "name-requires", code: "ODD-POPOVER-005", attribute: "role", names: ["aria-label", "aria-labelledby"] },
  { kind: "system-data", code: "ODD-POPOVER-006" },
],

Popover: { source: "odd-design/react", className: "odd-popover", props: {}, element: "div" },
```

`check.ts` gains one `apply` case for `name-requires`. `part.ts`, `mirror.ts`, `mirror-react.ts`, `jsx.ts`, `html.ts`, `dom.ts`, `popover.css`, `CLASS_REGISTRY`, and `VOCABULARY` do not change.

### The part

```tsx
interface PopoverContract extends Contract<"Popover", PopoverRule> {
  role?: Values<PopoverRule, "role">;
}

export interface PopoverProps extends PopoverContract, Native<"Popover", keyof PopoverContract> {}

type Names = Extract<PopoverRule, { kind: "name-requires" }>["names"][number];

type Named = { [Name in Names]: { [Key in Name]: string } }[Names];

type RoleWithName<P> = P extends { role: Values<PopoverRule, "role"> }
  ? [P] extends [Named] ? P : Message<"ODD-POPOVER-004">
  : P extends Named ? Message<"ODD-POPOVER-005"> : P;

export const Popover: <const P extends PopoverProps>(props: RoleWithName<P> & PopoverProps) => ReactElement = part("Popover");
```

It is Avatar's `NamedWhenRole` with the converse branch. Both branches read the names from the rule, so the list lives only in the row.

### The story

`stories/mirrored/Popover.stories.ts`, with `title: "Components/Overlays"` and the export `Popover`. The `Popover` export and its `filters` helper leave `stories/Overlays.stories.ts` in the same commit. The scene is today's two triggers and two filter popovers, with the ids `filters` and `filters-end`. Each trigger is a `Button` with `{ icon: "filter" }`. Each popover is a `Popover` with `popover: "auto"`, `role: "dialog"`, and `aria-labelledby`. Inside, `label.odd-choice` becomes `Choice`, `hr.odd-separator` becomes `Separator`, Cancel and Apply become `Button`, and the first checkbox takes `defaultChecked`. The HTML render changes from a bare `popover` to `popover="auto"`, which behaves the same. Closed popovers are `display: none`, so the `aria` literal is two buttons:

```
- button "Filters"
- button "Filters"
```

## Decisions taken under the autonomy grant

Each item is the default the build uses. Each one can be reversed after review.

1. **One part, `Popover`.** Tooltip, hover card, and menu share `popover.css` but take other popover states and, for menu, behavior JS. They are out of scope.
2. **Stateless `part()`, no `open` prop, no trigger part.** The browser is the only state owner, as for Disclosure. `Button` is the trigger.
3. **`popover` takes `""` or `auto`.** Both are the auto state in both engines. A bare `popover` is what the CSS header and README document. The scene and the React docs spell `auto`.
4. **A new rule kind, `name-requires`.** A name on a role-less popover is the one silent failure of a correct-looking popover. The kind is the converse of `accessible-name`, not a general "A requires B".
5. **Separate codes for a wrong role (003) and a name with no role (005).** The fixes differ, and Avatar splits its role enum from its missing name in the same way.
6. **The popover behavior test runs on both Storybooks.** The closed parity test cannot see the open state. Tabs and Toast loop the same way. `e2e/axe.spec.ts` stays HTML-only.
7. **Accept a new sidebar order in Overlays.** The mirrored file loads later, so Popover sorts after the HTML-only stories. Every earlier port made the same trade.

## Capture the baseline (no source change)

- [x] Build both Storybooks at `2823cce` with `bun scripts/storybooks.ts .verify/popover/base-sb`, serve the build, and capture the HTML section with `bun scripts/capture-stories.ts http://localhost:6111/html .verify/popover/base.json .verify/popover/base-shots`. Result: 86 captures.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check.

### Commit 1. Add Popover and check it with ODD-POPOVER-001 to 006

- [x] Add the `name-requires` kind to `UsageRule` and its `apply` case in `check.ts`. Add one `name-requires` branch to `tests/usage-contract.test.ts` that requires the attribute and every name in the message. Result: the case reports on the first name `hasName` counts as present, with `found` set to `aria-labelledby without role`, for example. It is silent when `role` is there, computed or not, and on a node with a spread. The contract test requires `role`, `aria-label`, and `aria-labelledby` in the 005 message.
- [x] Add `USAGE.popover`, `PopoverRule`, the `Popover` row, the six codes in `USAGE_CODES`, and their `MESSAGES`. Each message says what breaks, in the measured words of the Contract table. Result: the seven planned rows after `toaster`, and the row after `Toaster`. 001 names the `p` that ends early, the named `section` that becomes a region, and the `span` or `button` that cannot hold controls. 002 says a manual popover and any token the browser does not know ignore Escape and a click outside. 003 covers only a wrong role. 005 says a generic div drops the name and to add role=dialog or remove the name.
- [x] Write `docs/usage/popover.md` with one section per code and the HTML and React setup. Add it to `REQUIRED` in `scripts/consumer-smoke.ts`. Result: the HTML markup with a text-only popover, the browser behavior, the React setup with `onToggle` for the open state, a line on what the rules leave to tooltip, hover card, and menu, and one section per code. `REQUIRED` lists it after `toast.md`.
- [x] Create `src/react/popover.tsx`. Add the barrel export and the `WrapperProps` line. Result: the planned `PopoverContract`, `PopoverProps`, `Names`, `Named`, and `RoleWithName`, with no `"use client"`. The name-without-role branch prints the 005 message.
- [x] Add the `odd-popover-001` to `006` bad and good HTML pairs, the `RUNTIME_CODES` lines, and the `places` rows in `tests/eslint-html.test.ts`. The good files hold tooltip, hover-card, and menu markup. Change the bare `div.odd-popover` in `odd-class-001.good.html` to a `div` with `popover`. Result: the 001 bad page has a `p` and a `span`. The 002 bad page has no `popover`, `manual`, and `hint`. The 003 bad page has `menu`, `tooltip`, and `alertdialog`. The 004 bad page has no name and a blank name. The 005 bad page has `aria-labelledby` and `aria-label` with no role, and its good page has a blank `aria-label` with no role, which `hasName` counts as absent. The 006 bad page has `data-tone` and `data-size`. The 002, 003, and 005 good pages hold the tooltip, hover-card, and menu markup.
- [x] Add type fail fixtures for a missing `popover`, `popover="manual"`, `role="menu"`, a dialog with no name, a name with no role, and `data-tone`, with their `failures` entries. Add a `pass.tsx` block with `ref`, `onToggle`, `className`, and a text-only `popover=""`. Result: six fixtures, `popover-popover`, `popover-popover-manual`, `popover-role`, `popover-name`, `popover-name-without-role`, and `popover-data-tone`. The last three print ODD-POPOVER-004, 005, and 006. The others are TypeScript's missing-property, `"auto"`, and `"dialog"` errors. `pass.tsx` gains `DeckFilters`, which also passes a computed `aria-label` and app `data-*`.
- [x] Add `tests/fixtures/usage/jsx/popover.tsx` and its `places` entry. Cover each code, a computed `popover` (the `ODD-STATIC-001` warning), and a spread. Result: thirteen elements, eleven diagnostics at their places. `<Popover {...props} />` gives the `ODD-STATIC-001` warning and silences 002. `<Popover aria-labelledby="l-title" {...props} />` gives only the warning, so `name-requires` stays silent on a spread.
- [x] Add one markup row to `tests/react.test.tsx`. Result: the row renders `<div id="filters" popover="auto" role="dialog" aria-labelledby="filters-title" class="odd-popover wide">` around its title.
- [x] Check. Delete each new rule row one at a time, and each fails a test. Drop the spread guard in `name-requires`, and a test fails. Drop each `RoleWithName` branch, and the type fixtures fail. Result: `bun run check` passes 594 tests (`.verify/popover/build/check-c1.txt`). Each of the seven row deletions fails the HTML places, the JSX places, and its bad fixture. The 002, 003, 005, and 006 deletions also fail the type fixtures. Dropping the spread guard fails only the JSX places. Dropping either `RoleWithName` branch fails only the type fixtures (`.verify/popover/build/mutations-c1.txt`, from `build/mutate.ts`, which restores each file after its run).

### Commit 2. Mirror Popover in the Storybooks

- [ ] Create `stories/mirrored/Popover.stories.ts` with the scene and the meta description. Remove `Popover` and `filters` from `stories/Overlays.stories.ts`.
- [ ] Pin `components-overlays--popover` in `tests/stories.test.ts`.
- [ ] Loop the popover test in `e2e/behavior.spec.ts` over `html` and `react`.
- [ ] Measure the `aria` literal in the built Firefox Storybook, then paste it.
- [ ] Check. `bunx playwright test e2e/usage.spec.ts e2e/behavior.spec.ts --project firefox` passes with 0 diagnostics. With the part rendering `section`, the React runs fail and the HTML runs pass.

### Commit 3. Docs, smoke, and the verify recipe

- [ ] In `docs/usage/react.md`, add `Popover` to the export list and the directive-free list, rewrite "Open a dialog or a popover with a command" around `Popover`, add the type-error rows, and add ODD-POPOVER-001 to the "not type errors" paragraph. Add a Popover section and the `name-requires` kind to `docs/usage/eslint.md`. Name `Popover` in the README `odd-popover` row and the usage-contract list.
- [ ] Update `.agents/skills/verify-odd-design/features/overlays.md` so the Popover recipe names its React side and the new sidebar order.
- [ ] Add the follow-ups in Appendix D to `docs/follow-ups.md`.
- [ ] Check. `bun run check`, `bun run build`, and `bun scripts/consumer-smoke.ts` pass.

## Verify on the real surface

- [ ] Rebuild both Storybooks, capture to `after.json`, and diff against `base.json`. Pass means `changed` lists only the Popover story, with `dom` changes only (bare `popover` becomes `popover="auto"`), and no `png` or `aria` change.
- [ ] Run `bun run test:browsers`. Pass means Firefox and WebKit pass, 0 diagnostics, and 0 axe violations.
- [ ] Drive the composed build per the verify-odd-design skill. Open both sides of the Popover story in `calm` light, `holoterminal` dark, and one more palette. Confirm matching screenshots and aria while closed, that each trigger opens its popover under it, that the end trigger's popover flips, that Escape closes it and returns focus, and that Apply closes it, on both sides.

## Review and open the PR

- [ ] The `cursor grok-4.7` reviewer reads the diff against this plan. A fresh builder fixes each finding that blocks. Other findings go to `docs/follow-ups.md`.
- [ ] Run `/deslop` and `/no-comments` over the diff.
- [ ] Open the PR ready with `gh pr create --base main --repo Rakvadium/odd-design`. The title is `feat(react): add Popover and mirror it in the Storybooks`.
- [ ] Run `gh pr checks`. The repo has no workflows, so expect "no checks reported". Report the PR as open. Do not merge.

## Throughput checkpoint

- **Blocking first steps.** The committed plan and the baseline capture. Commit 2 needs commit 1's part. Commit 3 needs both.
- **Independent workstreams.** None worth splitting. The rows, the part, the story, and the docs all read `contract.ts` and `format.ts` and share the test tables.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The `.verify/popover/` candidates are read-only references.
- **Smallest safe decomposition.** One builder, one commit at a time, each checked before the next. The base candidate's `lab.patch` already passes `bun run check` on a scratch copy, so the builder starts from it.

## Appendix A. Design choices

| Fork | Chosen | Why |
| --- | --- | --- |
| Parts | `Popover` only | Tooltip, hover card, and menu take other states |
| Behavior owner | The browser | Nothing in `src/js` touches `odd-popover`, so React owns every node it renders |
| Trigger | `Button` with `commandfor` and `command` | Already typed. A trigger part is a second way |
| `popover` values | `""` and `auto` | Both are auto, and the bare form is the documented HTML |
| Name without role | New kind `name-requires` | No existing kind expresses it, and the name is silently dropped |
| Codes | Six, with the wrong role and the name without role split | Different fixes |
| `id` | Not required | A ref and `showPopover({ source })` anchors with no id |
| `"use client"` | No | No hooks |
| Browser proof | Behavior test on both sides | Parity covers only the closed state |

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| `popover` enum `["auto"]` only (Grok runner) | Flags the bare `popover` the CSS and README document and both engines treat as auto |
| `requires-attribute` with one `requires` string (Grok runner) | Two rows for one pair, a hand-copied name list in the part, and silence on a computed name |
| `aria-modal` code (Grok runner) | No measured failure |
| One code for a wrong role and a name with no role (Opus runner) | The fixes differ |
| Require `role="dialog"` and a name on every popover | Fires on the text-only popover the CSS documents |
| The part writes `popover` itself | Parity normalizes only `type="button"`, and it hides the attribute that makes the element a popover |
| `PopoverTrigger`, or an `open` prop | A second way to write `Button`, and a second state owner |
| `<dialog popover>` as a second tag | Two ways to write one popover, and a row renders one tag |
| Behavior test HTML-only (Grok runner) | Closed parity cannot see the open state |

## Appendix C. Evidence and reading list

These files are local scratch under the gitignored `.verify/popover/` folder of this worktree. They are not on the branch.

- `how.md` explains the CSS, the story, the invoker typing, the contract, the checkers, and the mirror, and lists twelve forks.
- `task.md` and `rubric.md` are the arena's task and scoring rubric.
- `candidate-opus/design.md` is the base, with `lab.patch` and its probes.
- `candidate-grok/design.md` is the other design, with its probes.
- `judge.md` holds the cross-judge's scores, the claims it found wrong, its pick, and the grafts.
- `synthesis.md` records the base, the grafts taken, and the grafts rejected.

## Appendix D. Risks and follow-ups

- **A bare JSX `popover` passes ESLint.** The JSX lowering reads it as `""`, and React drops it. `tsc` and the runtime checker catch it. Only a `.jsx` consumer misses it.
- **A popover with controls and no role passes.** No rule walks descendants for controls.
- **`aria-modal` on a popover passes.** No failure was measured. A screen-reader run could change that.
- **`showPopover()` with no source and no invoker lands unanchored.** Catching it needs a cross-element kind.
- **The open popover is unchecked by a screen reader.** NVDA and VoiceOver did not run.
