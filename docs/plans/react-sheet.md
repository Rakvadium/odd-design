# React Sheet plan

`odd-design/react` gains three parts. `Sheet` renders `dialog.odd-sheet`, `SheetHeader` renders `div.odd-sheet-header`, and `SheetFooter` renders `div.odd-sheet-footer`. All three are stateless `part()` calls. `Button` with `commandfor` and `command` opens and closes the sheet, and the browser owns the open state, the top layer, the focus trap, the inert page, Escape, `closedby`, and focus return. The body stays a ruled class, because its tag is a `div` or a `form`. The title stays `h1` to `h6` with `odd-dialog-title`, which `dialogPart` already rules.

A sheet is a dialog opened with `showModal()`, so it fails in the same five ways a dialog does. Dialog's rows for ODD-DIALOG-002 to 006 move into one module-private `modal` tuple, and `USAGE.dialog` and `USAGE.sheet` both spread it. The same row objects run on both classes, so there is one check and one code per failure. Three new codes, ODD-SHEET-001 to 003, cover what only a sheet can get wrong. The Sheet story moves into the mirror and keeps its id.

The work ships as one PR on `feat/react-sheet`, based on `4aa8bb0` (Dialog, PR #36). It is built as three commits after this plan, and each commit ends in a check. Nothing merges or deploys.

Caleb granted overnight autonomy for this run. The build starts after this plan is committed and uses the default in each decision below. The run stops when the PR is open and its checks report.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, and verifies.

The design came from two architect runners and a cross-judge. Both runners converged on the same parts, the same state owner, the same `side` enum, and the same story plan. They split on reuse. The Opus runner shares Dialog's row objects. The Grok runner copied the five modal checks as new ODD-SHEET codes over a shared values list. The `cursor grok-4.7` judge picked the Opus design, 26 to 25, and named three grafts, and this plan takes all three. The Opus runner built its design on a scratch copy of `4aa8bb0` (`lab.patch`, 628 tests passing, 11 of 11 mutants killed) and measured each code in Firefox and WebKit. The records are local scratch in the gitignored `.verify/sheet/` folder of this worktree (Appendix C).

## Usage

```tsx
import { Button, Sheet, SheetFooter, SheetHeader } from "odd-design/react";

<Button commandfor="filters" command="show-modal">Filters</Button>
<Sheet id="filters" side="start" aria-labelledby="filters-title" closedby="any">
  <SheetHeader>
    <h2 className="odd-dialog-title" id="filters-title">Filters</h2>
    <Button variant="ghost" iconOnly aria-label="Close" commandfor="filters" command="close"><CloseIcon /></Button>
  </SheetHeader>
  <div className="odd-sheet-body">…</div>
  <SheetFooter>
    <Button commandfor="filters" command="close">Reset</Button>
    <Button variant="primary" commandfor="filters" command="close">Show 12 decks</Button>
  </SheetFooter>
</Sheet>;
```

With no `side`, the sheet docks on the end edge. `start` and the end edge follow the writing direction.

A sheet that submits puts its fields in `form.odd-sheet-body` and points the footer button at that form with `form`. The footer stays a sibling of the body, so the three-row grid holds. A bottom sheet for a decision takes `role="alertdialog"` and leaves out `closedby="any"`.

| Part | Element | Props from the contract |
| --- | --- | --- |
| `Sheet` | `dialog.odd-sheet` | A name, `aria-label` or `aria-labelledby`, is required. `side?: "start" \| "top" \| "bottom"`. `role?: "alertdialog"`. `closedby?: "any" \| "closerequest"`, and not `"any"` with `role="alertdialog"`. `open` is the ODD-DIALOG-004 message. Raw `data-side` is a type error. A system `data-*` is the ODD-SHEET-003 message. `id`, `ref`, `onClose`, `onCancel`, and the rest come from `ComponentProps<"dialog">` |
| `SheetHeader` | `div.odd-sheet-header` | A system `data-*` is the ODD-SHEET-003 message |
| `SheetFooter` | `div.odd-sheet-footer` | A system `data-*` is the ODD-SHEET-003 message |
| (no part) | `odd-sheet-body` on `div` or `form` | Ruled by `sheetPart` |
| (no part) | `odd-dialog-title` on `h1` to `h6` | Already ruled by `dialogPart` |

`sheet.tsx` has no `"use client"`, because `part()` adds no state or handler.

## Contract

Each failure below was measured in Firefox and WebKit at 1280 by 900 on the lab build (`.verify/sheet/candidate-opus/probes/`).

| Code | Group, kind | Fails when | What breaks | TypeScript |
| --- | --- | --- | --- | --- |
| `ODD-SHEET-001` | `sheet` and `sheetPart`, `element` | `odd-sheet` is not on a `dialog`, the header or footer is not a `div`, or the body is not a `div` or a `form` | `div.odd-sheet` sits past the right edge of the viewport and is never hidden. One Tab focuses its Close button off screen, and a screen reader reads its content as page content. `header` and `footer` inside an open sheet read as `banner` and `contentinfo`. In HTML a `p.odd-sheet-body` ends before its first block child, so the controls fall out of the scrolling body | Not a type error. The parts render their tags |
| `ODD-DIALOG-002` | `modal`, `accessible-name` | No non-blank `aria-label` or `aria-labelledby` | The open sheet snapshot is `- dialog:` with no name | TypeScript's missing-property error |
| `ODD-DIALOG-003` | `modal`, `enum role` | Any role but `alertdialog` | `role="region"` reads as `region "Filters"` | `"alertdialog"` only |
| `ODD-DIALOG-004` | `modal`, `forbidden-attribute open` | `open` in markup | The sheet is open and not modal. Escape leaves it open, and a click reaches the page behind it | The 004 message |
| `ODD-DIALOG-005` | `modal`, `enum closedby` | `none` or another value | Escape leaves the sheet open | `"any" \| "closerequest" \| undefined` |
| `ODD-DIALOG-006` | `modal`, `forbidden-value` | `closedby="any"` with `role="alertdialog"` | A backdrop click closes the alert sheet | `'"any"' is not assignable to type '"closerequest"'` |
| `ODD-SHEET-002` | `sheet`, `enum data-side`, `omit: ["end"]` | Any value but `start`, `top`, or `bottom` | `left`, `right`, and a typo render on the end edge. `end` renders the same pixels as no attribute in both engines, so the message says to remove it | `side` takes `"start" \| "top" \| "bottom"`. Raw `data-side` is not assignable to `undefined` |
| `ODD-SHEET-003` | `sheet` and `sheetPart`, `system-data` | A system `data-*`, or a near miss of `data-side` on `odd-sheet` | `data-tone` and `data-size` change no pixel. `data-sid="start"` leaves the sheet on the end edge | The 003 message on `Sheet`, `SheetHeader`, and `SheetFooter` |

The messages for ODD-DIALOG-003, 004, and 005 name both `odd-dialog` and `odd-sheet`. ODD-DIALOG-007 stays dialog-only, because `sheet.css` reads `data-side` and the sheet has its own `system-data` row. `docs/usage/dialog.md` lists `odd-sheet` on 002 to 006, and `docs/usage/sheet.md` points there.

Not added:

- **A `SheetBody` part.** The body is a `div` or a `form`, so a fixed-`div` part would be a second spelling. `section.odd-sheet-body` kept the grid and added no landmark (measured by the Grok runner). 001 still allows only `div` and `form`, and its message claims no `section` break.
- **`SheetTitle`, `SheetClose`, or a trigger part.** The title is the caller's heading on `odd-dialog-title`. `Button` with `command` already types the close and the trigger.
- **A rule against `odd-dialog` and `odd-sheet` on one node.** It renders as a sheet, and no failure was measured.
- **A `top` sheet or an RTL story.** The CSS styles `top`, and the probes measured it and the RTL flip. Both stay follow-ups.

## Shape

### Rows

```ts
// odd-dialog and odd-sheet are both a dialog opened with showModal(), so they fail the same ways and share these rows.
const modal = [
  { kind: "accessible-name", code: "ODD-DIALOG-002", element: "dialog", names: ["aria-label", "aria-labelledby"] },
  { kind: "enum", code: "ODD-DIALOG-003", attribute: "role", values: ["alertdialog"], omit: ["dialog"] },
  { kind: "forbidden-attribute", code: "ODD-DIALOG-004", attribute: "open" },
  { kind: "enum", code: "ODD-DIALOG-005", attribute: "closedby", values: ["any", "closerequest"], omit: [] },
  { kind: "forbidden-value", code: "ODD-DIALOG-006", attribute: "closedby", value: "any", when: { attribute: "role", value: "alertdialog" } },
] as const satisfies readonly UsageRule[];

dialog: [{ kind: "element", code: "ODD-DIALOG-001", className: "odd-dialog", elements: ["dialog"] }, ...modal, { kind: "system-data", code: "ODD-DIALOG-007" }],
sheet: [
  { kind: "element", code: "ODD-SHEET-001", className: "odd-sheet", elements: ["dialog"] },
  ...modal,
  { kind: "enum", code: "ODD-SHEET-002", attribute: "data-side", values: ["start", "top", "bottom"], omit: ["end"] },
  { kind: "system-data", code: "ODD-SHEET-003" },
],
sheetPart: [
  { kind: "element", code: "ODD-SHEET-001", className: "odd-sheet-header", elements: ["div"] },
  { kind: "element", code: "ODD-SHEET-001", className: "odd-sheet-body", elements: ["div", "form"] },
  { kind: "element", code: "ODD-SHEET-001", className: "odd-sheet-footer", elements: ["div"] },
  { kind: "system-data", code: "ODD-SHEET-003" },
],

Sheet: { source: "odd-design/react", className: "odd-sheet", props: { side: "data-side" }, element: "dialog" },
SheetHeader: { source: "odd-design/react", className: "odd-sheet-header", props: {}, element: "div" },
SheetFooter: { source: "odd-design/react", className: "odd-sheet-footer", props: {}, element: "div" },
```

`checkUsage` runs each row object once per node. A node with both `odd-dialog` and `odd-sheet` would otherwise run the shared rows twice and report ODD-DIALOG-002 twice. The change is one `Set` around the rule list. Only identical objects collapse, so rows that repeat a code in separate literals still all run.

`format.ts` reads the role row as `USAGE.dialog[2]` and the side row as `USAGE.sheet[6]`. Each read `satisfies` an enum on its attribute, so a reorder fails `tsc` before a message reads the wrong values.

`CLASS_REGISTRY`, `VOCABULARY`, `dom.ts`, `jsx.ts`, `html.ts`, `mirror.ts`, and `mirror-react.ts` do not change. `sheet.css` changes only its header comment, which stops listing `end` as a value to write.

### The parts

`Named` and `Exclusive` move from `dialog.tsx` into `part.ts` as generics over the rule type. `dialog.tsx` and `sheet.tsx` both use them. `Exclusive`'s branch for a rule set with no `forbidden-value` row is `{}`, not `never`, so it cannot erase a props type. `popover.tsx` keeps its local alias, because it reads the `name-requires` row and the generic reads `accessible-name`.

```tsx
interface SheetContract extends Contract<"Sheet", SheetRule> {}
export type SheetProps = SheetContract & Native<"Sheet", keyof SheetContract | keyof Exclusive<SheetRule>> & Named<SheetRule> & Exclusive<SheetRule>;

export const Sheet: (props: SheetProps) => ReactElement = part("Sheet");
export const SheetHeader: (props: SheetHeaderProps) => ReactElement = part("SheetHeader");
export const SheetFooter: (props: SheetFooterProps) => ReactElement = part("SheetFooter");
```

`SheetHeader` and `SheetFooter` are the README's three-declaration shape.

### The story

| Story id | File | Change |
| --- | --- | --- |
| `components-overlays--sheet` | `stories/mirrored/Sheet.stories.ts`, title `Components/Overlays`, export `Sheet` | Moved from `stories/Overlays.stories.ts`, which keeps `icons` for Tooltip. Three sheets, `end` (no `side`), `start`, and `bottom`, each `SheetHeader > [h2.odd-dialog-title, Button Close]`, `div.odd-sheet-body > [Field, fieldset]`, `SheetFooter > [Button × 2]` |

The end sheet loses `data-side="end"`. The probes show the same pixels with and without it, so the capture diff should show a `dom` change on Sheet only.

## Decisions taken under the autonomy grant

Each item is the default the build uses. Each one can be reversed after review.

1. **Three parts, `Sheet`, `SheetHeader`, and `SheetFooter`.** The header and footer tags are fixed by a measured landmark failure. The body tag varies, so it stays a class.
2. **Stateless `part()`, no `open` prop, no trigger part.** The browser is the only state owner, as for Dialog and Popover.
3. **Shared ODD-DIALOG codes for the five modal failures, ODD-SHEET codes for the rest.** One code per failure. The alternative was five copied codes, messages, and docs sections that a later Dialog fix would need to edit twice.
4. **`side` maps to `data-side`, and `end` is in `omit`.** `end` is the same pixels as no attribute. That is the Button `default` precedent, and it needs no CSS selector and no test exception. An app that writes `data-side="end"` gets ODD-SHEET-002 with a suggestion to remove it.
5. **One `Set` in `checkUsage`.** Without it, shared rows double-report on a node with both classes.
6. **Generic `Named` and `Exclusive` in `part.ts` for Dialog and Sheet.** Two callers with the same rows. Popover stays as it is.
7. **Keep three sheets in the story.** The parity sweep, the 58 axe runs, and the behavior loop keep their shape.
8. **The sheet behavior test runs on both Storybooks and asserts a backdrop click.** The verify recipe claims the click, and no test checked it.

## Capture the baseline (no source change)

- [x] Build both Storybooks at `4aa8bb0` with `bun scripts/storybooks.ts .verify/sheet/base-sb`, serve the build, and capture the HTML section with `bun scripts/capture-stories.ts http://localhost:6311/html .verify/sheet/base.json .verify/sheet/base-shots`. Result: 86 captures.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check.

### Commit 1. Add Sheet, SheetHeader, and SheetFooter and check them

- [x] Move the five modal rows into `modal`, add `USAGE.sheet`, `USAGE.sheetPart`, `SheetRule`, `SheetPartRule`, the three `WRAPPERS` rows, ODD-SHEET-001 to 003 in `USAGE_CODES`, and their `MESSAGES`. Reword ODD-DIALOG-003, 004, and 005 to name both classes. Pin the two `format.ts` index reads with `satisfies`. Result: `modal` sits above `USAGE` with the one-line why from Shape, and `USAGE.sheet` and `USAGE.sheetPart` follow `dialogPart`. The 003, 004, and 005 messages name `odd-dialog` and `odd-sheet`. `USAGE.dialog[2]` satisfies `{ kind: "enum"; attribute: "role" }` and `USAGE.sheet[6]` satisfies `{ kind: "enum"; attribute: "data-side" }`. Swapping the role and `open` rows, moving the side row after `system-data`, and appending an enum with a non-empty `omit` to `modal` each fail `tsc` in `format.ts` (`.verify/sheet/build/pins.txt`, from `build/pins.ts`).
- [x] Add the `Set` to `checkUsage`. Result: one `Set` around the rule list, with a one-line why comment. Without it, the nameless `odd-dialog odd-sheet` node reports ODD-DIALOG-002 twice (mutant 9 in `build/mutations.txt`).
- [x] Move `Named` and `Exclusive` into `part.ts`, migrate `dialog.tsx`, and create `src/react/sheet.tsx`. Add the barrel export and the `WrapperProps` lines. Result: `Named<Rule>` and `Exclusive<Rule>` in `part.ts`, with `{}` as the `Exclusive` branch for a rule set with no `forbidden-value` row. `dialog.tsx` uses both, and `popover.tsx` is unchanged from `4aa8bb0`. `sheet.tsx` has the three parts and no `"use client"`.
- [x] Write `docs/usage/sheet.md` with one section per ODD-SHEET code, the HTML and React setup, the form body, and the `section` body measurement. List `odd-sheet` on 002 to 006 in `docs/usage/dialog.md`. Add `sheet.md` to `REQUIRED` in `scripts/consumer-smoke.ts`. Update the `sheet.css` header comment. Result: `sheet.md` has the HTML and React setup, the browser behavior, the `form` body, and three sections. The 001 section records that `section.odd-sheet-body` kept three grid rows (67.6, 774.6, and 57.8 px in Firefox) and added no landmark (`.verify/sheet/candidate-grok/probe/firefox.json` and `webkit.json`, `section-body`), and the 001 message makes no `section` body claim. `dialog.md` names `odd-sheet` in its intro and on 002 to 006. `REQUIRED` lists `sheet.md` after `dialog.md`. The CSS comment drops `data-side="end"` and lists `start|top|bottom`.
- [x] Add the `odd-sheet-001` to `003` bad and good HTML pairs, the `RUNTIME_CODES` lines, and the `places` rows. Move the nameless sheet from `odd-dialog-002.good.html` to the bad file, and add a nameless `odd-dialog odd-sheet` that expects one 002. Write `dialog.odd-sheet` with a name in `odd-class-001.good.html`. Result: the 001 bad page has a `div` and a `section` sheet, a `header`, a `p` body, and a `footer`. The 002 bad page has `end`, `left`, and `botom`, and its good page has no `data-side`, `start`, `top`, `bottom`, and `data-side="end"` on an `odd-dialog`. The 003 bad page has `data-tone`, `data-sid`, and `data-variant` on a footer, and its good page has app and headless `data-*`. `odd-dialog-002.bad.html` expects five 002s, one of them on the nameless `odd-dialog odd-sheet`.
- [x] Add type fail fixtures for a missing name, `side="end"`, raw `data-side`, an alert sheet with `closedby="any"`, `data-tone` on `Sheet`, and a system `data-*` on `SheetFooter`. Add a `pass.tsx` block with `ref`, `onClose`, an untyped `onCancel`, a computed `side`, a form body, an alert bottom sheet with `closerequest`, and app and headless `data-*`. Result: six fixtures. `sheet-data-tone` and `sheet-footer-data-variant` print ODD-SHEET-003. The others print TypeScript's missing `aria-labelledby`, `"bottom" | "start" | "top" | undefined`, `not assignable to type 'undefined'`, and `'"any"' is not assignable to type '"closerequest"'`. `pass.tsx` gains `FilterSheet`.
- [x] Add `tests/fixtures/usage/jsx/sheet.tsx` and its `places` entry. Cover each sheet code, the shared 002, 004, and 006 through `Sheet`, a computed `side`, and a spread. Result: eleven diagnostics at their places. `side={side}` and `{...props}` give ODD-STATIC-001.
- [x] Add one markup row to `tests/react.test.tsx` for `Sheet` around `SheetHeader`, a body `div`, and `SheetFooter`. Result: the row renders `<dialog id="filters" aria-labelledby="filters-title" closedby="any" class="odd-sheet wide" data-side="start">` around the header, body, and footer `div`s.
- [x] Check. Rerun the lab's mutation script against the branch, and each mutant fails a test. Result: `bun run check` passes 626 tests (`.verify/sheet/build/check-commit1.txt`). `build/mutate.ts`, the lab script with its output path moved, ran against this commit. 11 killed, 0 survived (`build/mutations.txt`). Deviation: the HTML Sheet story in `stories/Overlays.stories.ts` changes in this commit. Its `data-side="end"` fails ODD-SHEET-002 in the story `checkRoot` test, and its computed `data-side="${side}"` fails ODD-STATIC-001 in the story lint test. The three `dialog` tags are now literals at the call sites, and the end sheet has no `data-side`. Commit 2 replaces the story.

### Commit 2. Mirror Sheet in the Storybooks

- [ ] Create `stories/mirrored/Sheet.stories.ts` and remove the Sheet story and its helper from `stories/Overlays.stories.ts`. Measure the closed `aria` literal in the built Firefox Storybook, then paste it.
- [ ] Pin `components-overlays--sheet` in `tests/stories.test.ts`.
- [ ] Loop the sheet test in `e2e/behavior.spec.ts` over `html` and `react`, wait on the open state instead of fixed timeouts, and add a backdrop click on the end sheet.
- [ ] Check. `bunx playwright test e2e/usage.spec.ts e2e/behavior.spec.ts` passes in Firefox and WebKit with 0 diagnostics.

### Commit 3. Docs, smoke, and the verify recipe

- [ ] In `docs/usage/react.md`, add the three parts to the export list and the directive-free list, add a Sheet block to the command section, and add the type-error rows. Add a Sheet section to `docs/usage/eslint.md`. Name the parts in the README rows, the React install sentence, and the usage-contract list, and stop listing `end` in the `odd-sheet` row.
- [ ] Update `.agents/skills/verify-odd-design/features/overlays.md` for the React side and the measured sidebar order.
- [ ] Add the follow-ups in Appendix D to `docs/follow-ups.md`.
- [ ] Check. `bun run check`, `bun run build`, and `bun scripts/consumer-smoke.ts` pass.

## Verify on the real surface

- [ ] Rebuild both Storybooks, capture to `after.json`, and diff against `base.json`. Pass means `changed` lists only the Sheet story, with `dom` changes only, and no `png` or `aria` change.
- [ ] Run `bun run test:browsers`. Pass means Firefox and WebKit pass, 0 diagnostics, and 0 axe violations.
- [ ] Drive the composed build per the verify-odd-design skill. Open both sides of the Sheet story in `calm` light, `holoterminal` dark, and one more palette. Confirm matching screenshots and aria while closed. On both sides, confirm that each trigger opens a named modal on its edge with focus on Close, that Escape closes it and returns focus, that a backdrop click closes it, and that each footer button closes it.

## Review and open the PR

- [ ] The `cursor grok-4.7` reviewer reads the diff against this plan. A fresh builder fixes each finding that blocks. Other findings go to `docs/follow-ups.md`.
- [ ] Run `/deslop` and `/no-comments` over the diff.
- [ ] Open the PR ready with `gh pr create --base main --repo Rakvadium/odd-design`. The title is `feat(react): add Sheet and mirror it in the Storybooks`.
- [ ] Run `gh pr checks`. The repo has no workflows, so expect "no checks reported". Report the PR as open. Do not merge.

## Throughput checkpoint

- **Blocking first steps.** The committed plan and the baseline capture. Commit 2 needs commit 1's parts. Commit 3 needs both.
- **Independent workstreams.** None worth splitting. The rows, the parts, the story, and the docs all read `contract.ts` and `format.ts` and share the test tables.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The `.verify/sheet/` candidates are read-only references.
- **Smallest safe decomposition.** One builder, one commit at a time, each checked before the next. The base candidate's `lab.patch` already passes `bun run check`, so the builder starts from it and applies the three grafts.

## Appendix A. Design choices

| Fork | Chosen | Why |
| --- | --- | --- |
| Parts | `Sheet`, `SheetHeader`, `SheetFooter` | The header and footer tags are fixed. The body tag varies |
| Behavior owner | The browser | No JS in `src/js` moves a sheet node, so React owns every node it renders |
| Codes | Shared ODD-DIALOG-002 to 006, new ODD-SHEET-001 to 003 | One code per failure |
| Shared rows | One `modal` tuple of row objects, and a `Set` in `checkUsage` | One check per failure, counted once |
| Side | `side` maps to `data-side`, `end` in `omit` | The README requires an enum per data prop. `end` is the default |
| Types | Generic `Named` and `Exclusive` in `part.ts` | Dialog and Sheet read the same rows |
| `"use client"` | No | No hooks |

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| Nine ODD-SHEET codes over a shared values const (Grok runner) | Copies the five modal checks, their messages, and their docs |
| An `odd-sheet` element row inside `USAGE.dialog` | The `data-side` enum would run on `odd-dialog`, and ODD-DIALOG-007 says `dialog.css` reads no data attributes |
| Raw `data-side`, no `side` prop | A typo or `left` lands on the end edge with no finding |
| `end` in `values` with a new selector or a test exception | New CSS, or a second list in the test |
| A third local copy of `Named` and `Exclusive` (Grok runner) | The two copies would drift |
| Migrate Popover to the generic `Named` | It reads a different row kind. The types match only while the name lists match |
| `SheetBody` part | Renders only a `div`, so the `form` body is a second spelling |

## Appendix C. Evidence and reading list

These files are local scratch under the gitignored `.verify/sheet/` folder of this worktree. They are not on the branch.

- `how.md` explains the port system and how sheet markup fits it today, and lists seventeen forks.
- `task.md` and `rubric.md` are the arena's task and scoring rubric.
- `candidate-opus/design.md` is the base, with `lab.patch` and its probes.
- `candidate-grok/design.md` is the other design, with its probes.
- `judge.md` holds the cross-judge's scores, the claims it found wrong, its pick, and the grafts.
- `synthesis.md` records the base, the grafts taken, and the grafts rejected.

## Appendix D. Risks and follow-ups

- **`data-side="end"` is now a finding.** The README and the CSS comment documented it until this change. The message says to remove it.
- **A missing name prints TypeScript's text, not the 002 code.** The same gap as Dialog.
- **No story renders a `top` sheet or sets `dir="rtl"`.** The probes measured both.
- **happy-dom does not match `:modal`.** A bun test that opens a sheet and runs `checkRoot` reports ODD-DIALOG-004, as it does for Dialog.
