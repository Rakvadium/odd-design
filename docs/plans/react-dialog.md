# React Dialog plan

`odd-design/react` gains two parts. `Dialog` renders `dialog.odd-dialog`, and `DialogActions` renders `div.odd-dialog-actions`. Both are stateless `part()` calls. `Button` with `commandfor` and `command` opens and closes the dialog, and the browser owns the open state, the top layer, the focus trap, the inert page, Escape, `closedby`, and focus return. The body and the title stay ruled classes, because their tags vary. Eight codes, ODD-DIALOG-001 to 008, cover the dialog mistakes a caller can write. TypeScript, ESLint, and the runtime checker report them from the same `USAGE` rows. The Dialog and Alert Dialog stories move into the mirror and keep their ids, and the Toast scene switches to the new parts.

The work ships as one PR on `feat/react-dialog`, based on `bc3c93f` (Popover, PR #35). It is built as three commits after this plan, and each commit ends in a check. Nothing merges or deploys.

Caleb granted overnight autonomy for this run. The build starts after this plan is committed and uses the default in each decision below. The run stops when the PR is open and its checks report.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, and verifies.

The design came from two architect runners and a cross-judge. Both runners converged on the same part, the same state owner, and most of the same rows. The Opus runner built its design on a scratch copy of `bc3c93f` (`lab.patch`, 616 tests passing) and measured it in Firefox and WebKit. The Grok runner measured each misuse in the same engines. The `cursor grok-4.7` judge picked the Opus design as the base and named four grafts from the Grok design, and this plan takes all four. The records are local scratch in the gitignored `.verify/dialog/` folder of this worktree (Appendix C).

## Usage

```tsx
import { Button, Dialog, DialogActions } from "odd-design/react";

<Button variant="danger" commandfor="confirm-delete" command="show-modal">Delete deck…</Button>
<Dialog id="confirm-delete" aria-labelledby="confirm-delete-title" closedby="any">
  <div className="odd-dialog-body">
    <h2 className="odd-dialog-title" id="confirm-delete-title">Delete “Midnight Control”?</h2>
    <p className="odd-muted">This removes the deck and its 14 saved versions.</p>
    <DialogActions>
      <Button commandfor="confirm-delete" command="close">Close</Button>
      <Button variant="danger" commandfor="confirm-delete" command="close">Delete</Button>
    </DialogActions>
  </div>
</Dialog>;
```

An alert dialog takes `role="alertdialog"` and leaves out `closedby="any"`, so a click outside does not dismiss the decision. Escape still cancels.

```tsx
<Dialog id="discard" role="alertdialog" aria-labelledby="discard-title" aria-describedby="discard-desc">…</Dialog>
```

A dialog that submits uses `form.odd-dialog-body` with `method="dialog"`. To open from code, call `showModal()` on a `ref`, and read the close from `onClose`. The part holds no state.

| Part | Element | Props from the contract |
| --- | --- | --- |
| `Dialog` | `dialog.odd-dialog` | A name, `aria-label` or `aria-labelledby`, is required. `role?: "alertdialog"`. `closedby?: "any" \| "closerequest"`, and not `"any"` with `role="alertdialog"`. `open` is the 004 message. A system `data-*` is the 007 message. `id`, `ref`, `onClose`, `onCancel`, and the rest come from `ComponentProps<"dialog">` |
| `DialogActions` | `div.odd-dialog-actions` | A system `data-*` is the 008 message |
| (no part) | `odd-dialog-body` on `div` or `form` | Ruled by the shared `dialogPart` group |
| (no part) | `odd-dialog-title` on `h1` to `h6` | Ruled by the shared `dialogPart` group. Sheet titles pass |

`dialog.tsx` has no `"use client"`, because `part()` adds no state or handler.

## Contract

Each failure below was measured in Firefox and WebKit on the baseline build (`.verify/dialog/candidate-opus/probes/` and `candidate-grok/probe/`).

| Code | Group, kind | Fails when | What breaks | TypeScript |
| --- | --- | --- | --- | --- |
| `ODD-DIALOG-001` | `dialog` and `dialogPart`, `element` | A dialog class is on the wrong tag | `div.odd-dialog` is never hidden. It sits in the page at opacity 0 and its button still takes Tab. In HTML, a `p.odd-dialog-body` ends before the heading, so the title is parsed outside the body. React leaves it inside the `p`, where a heading is not allowed. A title that is not a heading drops out of heading navigation | Not a type error. The parts render their tags |
| `ODD-DIALOG-002` | `dialog`, `accessible-name` with a new `element` field | No non-blank `aria-label` or `aria-labelledby` | The open snapshot is `- dialog:` with no name. A heading inside does not name it | Yes, as TypeScript's missing-property error |
| `ODD-DIALOG-003` | `dialog`, `enum role ["alertdialog"]`, `omit ["dialog"]` | Any other role, including the redundant `dialog` | `role="region"` on an open modal reads as a region | Yes, `"alertdialog"` only |
| `ODD-DIALOG-004` | `dialog`, `forbidden-attribute open` | `open` in markup | The dialog shows without `showModal()`, so the page behind it stays live and Escape does nothing. In React, `open` never calls `showModal()` and goes stale when the browser closes the dialog | Yes, the 004 message |
| `ODD-DIALOG-005` | `dialog`, `enum closedby ["any", "closerequest"]` | `closedby="none"` or another value | `none` stops Escape from closing the dialog, so only a button can close it | Yes, the allowed values |
| `ODD-DIALOG-006` | `dialog`, new kind `forbidden-value` (`closedby="any"` when `role="alertdialog"`) | An alert dialog with `closedby="any"` | A stray click outside dismisses the decision | Yes, the 006 message |
| `ODD-DIALOG-007` | `dialog`, `system-data` | A foreign system `data-*` on `odd-dialog` | `dialog.css` reads no data attribute | Yes, from `ForeignData` |
| `ODD-DIALOG-008` | `dialogPart`, `system-data` | The same on the body, title, or actions | The same | Yes, on `DialogActions` |

The `element` variant of `accessible-name` is the unconditional form: "this tag needs one of these names". It reuses `hasName`, so a blank name fails and a computed name passes, and it stays silent on a node with a spread. `forbidden-value` says "this value of one attribute is wrong when another attribute holds this value". It reports on the forbidden attribute and stays silent when either value is computed.

`dom.ts` drops `open` from a dialog that matches `dialog:modal`, with a one-line why comment. `showModal()` writes `open`, so on a modal dialog it is the browser's state. An authored `open` cannot become modal, because `showModal()` throws on a non-modal open dialog. Without the filter, `checkRoot` on the open Toast settings dialog reports 004 on both Storybooks (measured).

Not added:

- **A required `id`.** The `ref` path needs none. Popover made the same call.
- **`aria-modal`.** `showModal()` makes it implicit, and no failure is known.
- **A rule against `autoFocus` inside a dialog.** It would walk descendants for a JSX-only prop. The docs say to put the safe choice first.
- **`DialogBody` and `DialogTitle` parts.** Their tags vary, which is Card's title.

## Shape

### Rows

```ts
| { kind: "accessible-name"; code: UsageCode; element: string; names: readonly string[] }
| { kind: "forbidden-value"; code: UsageCode; attribute: string; value: string; when: { readonly attribute: string; readonly value: string } }

dialog: [
  { kind: "element", code: "ODD-DIALOG-001", className: "odd-dialog", elements: ["dialog"] },
  { kind: "accessible-name", code: "ODD-DIALOG-002", element: "dialog", names: ["aria-label", "aria-labelledby"] },
  { kind: "enum", code: "ODD-DIALOG-003", attribute: "role", values: ["alertdialog"], omit: ["dialog"] },
  { kind: "forbidden-attribute", code: "ODD-DIALOG-004", attribute: "open" },
  { kind: "enum", code: "ODD-DIALOG-005", attribute: "closedby", values: ["any", "closerequest"], omit: [] },
  { kind: "forbidden-value", code: "ODD-DIALOG-006", attribute: "closedby", value: "any", when: { attribute: "role", value: "alertdialog" } },
  { kind: "system-data", code: "ODD-DIALOG-007" },
],
dialogPart: [
  { kind: "element", code: "ODD-DIALOG-001", className: "odd-dialog-body", elements: ["div", "form"] },
  { kind: "element", code: "ODD-DIALOG-001", className: "odd-dialog-title", elements: ["h1", "h2", "h3", "h4", "h5", "h6"] },
  { kind: "element", code: "ODD-DIALOG-001", className: "odd-dialog-actions", elements: ["div"] },
  { kind: "system-data", code: "ODD-DIALOG-008" },
],

Dialog: { source: "odd-design/react", className: "odd-dialog", props: {}, element: "dialog" },
DialogActions: { source: "odd-design/react", className: "odd-dialog-actions", props: {}, element: "div" },
```

`check.ts` gains the `element` branch in its `accessible-name` case and one `forbidden-value` case. `tests/usage-contract.test.ts` gains one `forbidden-value` branch that requires both attributes and both values in the message. `part.ts`, `mirror.ts`, `mirror-react.ts`, `jsx.ts`, `html.ts`, `dialog.css`, `CLASS_REGISTRY`, and `VOCABULARY` do not change.

### The part

```tsx
type Names = Extract<DialogRule, { kind: "accessible-name" }>["names"][number];
type Named = { [Name in Names]: { [Key in Name]: string } }[Names];

type Conflict = Extract<DialogRule, { kind: "forbidden-value" }>;
type When = Conflict["when"];
type Exclusive =
  | ({ [Key in When["attribute"]]: When["value"] } & { [Key in Conflict["attribute"]]?: Exclude<Values<DialogRule, Conflict["attribute"]>, Conflict["value"]> | Message<Conflict["code"]> })
  | ({ [Key in When["attribute"]]?: Exclude<Values<DialogRule, When["attribute"]>, When["value"]> } & { [Key in Conflict["attribute"]]?: Values<DialogRule, Conflict["attribute"]> });

interface DialogContract extends Contract<"Dialog", DialogRule> {}
export type DialogProps = DialogContract & Native<"Dialog", keyof DialogContract | keyof Exclusive> & Named & Exclusive;

export const Dialog: (props: DialogProps) => ReactElement = part("Dialog");
export const DialogActions: (props: DialogActionsProps) => ReactElement = part("DialogActions");
```

The name and the alert rule live in `DialogProps` as unions, with no Popover-style `const P` generic. The generic rejects a correct dialog whenever a handler has an untyped parameter, such as `onCancel={(event) => event.preventDefault()}` (measured by the Opus runner and the judge). The union passes every handler case and lets an app wrapper forward `DialogProps`. The cost is that a missing name prints TypeScript's "Property 'aria-labelledby' is missing" rather than the 002 code. Each list lives only in its row. `DialogActions` is the README's three-declaration shape.

### The stories

| Story id | File | Change |
| --- | --- | --- |
| `components-surfaces--dialog` | `stories/mirrored/Dialog.stories.ts`, title `Components/Surfaces`, export `Dialog` | Moved from `stories/Surfaces.stories.ts`, which is deleted because it is then empty (the `Forms.stories.ts` precedent). `Dialog > div.odd-dialog-body > [h2.odd-dialog-title, p.odd-muted, DialogActions > Button × 2]` |
| `components-overlays--alert-dialog` | `stories/mirrored/AlertDialog.stories.ts`, title `Components/Overlays`, export `AlertDialog` | Moved from `stories/Overlays.stories.ts`. A CSF file has one title, so it needs its own file |
| `components-interactive--toast` | `stories/mirrored/Toast.stories.ts` | The intrinsic `dialog.odd-dialog` and `div.odd-dialog-actions` become `Dialog` and `DialogActions` |
| `components-overlays--sheet`, `showcase--sample-app` | unchanged | Stay HTML-only. Both pass the new rules |

Both moved scenes drop `autofocus` from their first button. React writes no `autofocus` attribute on the client, and `showModal()` focuses the first focusable control anyway, which is the safe choice in both stories (measured in both engines). Both `aria` literals are the trigger only, because a closed dialog is `display: none`.

## Decisions taken under the autonomy grant

Each item is the default the build uses. Each one can be reversed after review.

1. **Two parts, `Dialog` and `DialogActions`.** The body takes `div` or `form`, and the title level is the caller's, so both stay classes, as Card's title does. The actions row is a fixed `div`, the `CardFooter` shape.
2. **Stateless `part()`, no `open` prop, no trigger part.** The browser is the only state owner, as for Disclosure and Popover. `Button` is the trigger. `ref.showModal()`, `onClose`, and `onCancel` are the escape hatches.
3. **A required name as either attribute.** `required-attribute aria-labelledby` would reject a valid `aria-label` dialog. `role="dialog"` is redundant ARIA.
4. **`closedby` takes `any` or `closerequest`.** A missing attribute is IDL `closerequest`, so spelling it is correct. `none` is rejected, because it stops Escape.
5. **One new kind, `forbidden-value`, for the alert pair, with its own code.** It is the likeliest copy-paste mistake when an agent turns the Dialog story into an alert dialog.
6. **The runtime checker ignores the `open` that `showModal()` writes.** Otherwise `checkRoot` lies on every open modal.
7. **Drop `autofocus` from the scenes.** Both Storybooks then focus the first button for the same reason. The usage page warns that React writes no `autofocus`.
8. **Both dialog behavior tests run on both Storybooks.** The closed parity test cannot see the open state. `e2e/axe.spec.ts` stays HTML-only.
9. **Accept a new sidebar order.** Surfaces becomes Badge, Card, Dialog, Disclosure. Alert Dialog stays before Popover.

## Capture the baseline (no source change)

- [x] Build both Storybooks at `bc3c93f` with `bun scripts/storybooks.ts .verify/dialog/base-sb`, serve the build, and capture the HTML section with `bun scripts/capture-stories.ts http://localhost:6311/html .verify/dialog/base.json .verify/dialog/base-shots`. Result: 86 captures.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check.

### Commit 1. Add Dialog and DialogActions and check them with ODD-DIALOG-001 to 008

- [x] Add the `element` variant of `accessible-name`, the `forbidden-value` kind, and their `check.ts` cases. Add the `forbidden-value` branch to `tests/usage-contract.test.ts`. Result: the `accessible-name` case runs on the tag when the row has `element` and on the attribute otherwise, and stays silent on a spread. The `forbidden-value` case reports on `closedby` with `found` set to `closedby=any with role=alertdialog`. The contract test requires both pairs in the 006 message.
- [x] Add `USAGE.dialog`, `USAGE.dialogPart`, `DialogRule`, `DialogPartRule`, the two `WRAPPERS` rows, the eight codes in `USAGE_CODES`, and their `MESSAGES`. Each message says what breaks, in the measured words of the Contract table. Result: the eleven planned rows after `popover`, and the `Dialog` and `DialogActions` rows after `Popover`. 001 names the opacity-0 `div`, the `p` that ends before the heading, and the title that is not a heading. 005 says `none` stops Escape, and 006 says a stray click dismisses the decision. `format.ts` reads only the role row by index, and writes the 005 allowed values as a literal, the shape of the other `omit: []` messages.
- [x] Add the `dom.ts` filter for `open` on `dialog:modal`. Result: one `filter` on the attribute list with a one-line why comment. happy-dom never matches `:modal`, so commit 2's browser run proves it.
- [x] Write `docs/usage/dialog.md` with one section per code, the HTML and React setup, and the `autoFocus` note. Add it to `REQUIRED` in `scripts/consumer-smoke.ts`. Result: the HTML markup, the browser behavior, the React setup with the body as a `div.odd-dialog-body`, the `autoFocus` and `ref` note, and eight sections. `REQUIRED` lists it after `popover.md`.
- [x] Create `src/react/dialog.tsx`. Add the barrel export and the `WrapperProps` lines. Result: `Dialog` and `DialogActions`, with no `"use client"`. Deviation: `Exclusive` puts `closedby?: "any" | "closerequest"` in a shared intersection and narrows it to `"closerequest"` in the alert branch. The planned shape, with `closedby` only inside the branches, printed the 006 message for `closedby="none"` on a dialog with no role, because TypeScript cannot pick a branch when `role` is absent. The cost is that an alert dialog with `closedby="any"` prints `'"any"' is not assignable to type '"closerequest"'`, not the 006 code (`.verify/dialog/build/types-shapes.txt`, four shapes compared). The Toast scene also switches to `Dialog` and `DialogActions` in this commit, because the intrinsic `dialog.odd-dialog` fails `tsc` once the row exists.
- [x] Add the `odd-dialog-001` to `008` bad and good HTML pairs, the `RUNTIME_CODES` lines, and the `places` rows in `tests/eslint-html.test.ts`. The good files hold a `form` body, an `h1` title, sheet markup with `closedby="any"`, `closedby="closerequest"` on an alert dialog, and `data-side`. Update the dialog lines in `odd-class-001.good.html`. Result: the 001 bad page has a `div`, a `section` body, a `p` title, and `p` actions. The 002 bad page has no name, a blank name, and an alert dialog with no name. The 003 bad page has `dialog`, `region`, and `menu`. The 005 bad page has `none` and a typo, and its good page has `any`, `closerequest`, and a sheet with `any`. The 006 bad page has the pair in both attribute orders, and its good page has an alert dialog with `closerequest` and one with no `closedby`. The 007 good page has `data-side` on a dialog and a sheet. `odd-class-001.good.html` now writes a named `dialog` and an `h2` title.
- [x] Add type fail fixtures for a missing name, `role="dialog"`, `open`, `closedby="none"`, an alert dialog with `closedby="any"`, `data-tone` on `Dialog`, and `data-tone` on `DialogActions`, with their `failures` entries. Add a `pass.tsx` block with `ref`, `onClose`, an untyped `onCancel={(event) => …}`, both name forms, `closedby="closerequest"` on an alert dialog, a `form` body, `data-side`, and app `data-*`. Result: seven fixtures. `dialog-open`, `dialog-data-tone`, and `dialog-actions-data-tone` print ODD-DIALOG-004, 007, and 008. The others print TypeScript's missing-property error, `"alertdialog"`, `"any" | "closerequest" | undefined`, and `'"any"' is not assignable to type '"closerequest"'`. `pass.tsx` gains `DeleteDeck`.
- [x] Add `tests/fixtures/usage/jsx/dialog.tsx` and its `places` entry. Cover each code, a computed name, and a spread. Result: thirteen diagnostics at their places. The intrinsic alert dialog with a computed `aria-label` and `closedby="closerequest"` passes. `<Dialog {...props} />` gives the ODD-STATIC-001 warning and silences 002.
- [x] Add one markup row to `tests/react.test.tsx` for `Dialog` around `DialogActions`. Result: the row renders `<dialog id="confirm" aria-labelledby="confirm-title" closedby="any" class="odd-dialog wide">` around a heading and `<div class="odd-dialog-actions end">`.
- [x] Check. Replace each new rule row with a placeholder one at a time, and each fails a test. Drop either `Exclusive` branch or `Named`, and the type fixtures fail. Result: `bun run check` passes 614 tests (`.verify/dialog/build/check-c1.txt`). `build/mutate.ts` replaces each row with an inert row of the same code, an enum on `data-mutant` for the two enum rows, and restores the file after each run. All eleven row mutants fail the HTML or JSX places and their bad fixture, and the 002, 004, 005, 006, 007, and 008 mutants also fail the type fixtures. Dropping the alert branch, the plain branch, the shared `closedby`, or `Named` fails the type fixtures. 15 mutants, 0 survived (`build/mutations.txt`).

### Commit 2. Mirror Dialog and Alert Dialog in the Storybooks

- [x] Create `stories/mirrored/Dialog.stories.ts` and `stories/mirrored/AlertDialog.stories.ts`. Delete `stories/Surfaces.stories.ts`, and remove `AlertDialog` from `stories/Overlays.stories.ts`. Switch the Toast scene to `Dialog` and `DialogActions`. Result: both scenes are `Dialog > div.odd-dialog-body > [h2.odd-dialog-title, p.odd-muted, DialogActions > Button × 2]` with no `autofocus`, and each meta description carries the old story text and says focus starts on the first button. `stories/Surfaces.stories.ts` is deleted. The Toast scene switch landed in commit 1, because the intrinsic `dialog.odd-dialog` fails `tsc` once the row exists.
- [x] Pin `components-surfaces--dialog` and `components-overlays--alert-dialog` in `tests/stories.test.ts`. Result: the pins end with both ids, and the test title names Dialog and Alert Dialog. Both pass the HTML-equals-React and `checkRoot` loops.
- [x] Loop the backdrop and alert-dialog tests in `e2e/behavior.spec.ts` over `html` and `react`. The alert test also asserts that focus starts on Keep editing. Widen the Toast check in `e2e/usage.spec.ts` to the whole open `#toast-settings`. Result: one loop over `html` and `react` holds both tests. The usage sweep now checks `#toast-settings` whole, open, with the toaster inside.
- [x] Measure both `aria` literals in the built Firefox Storybook, then paste them. Result: both sides give `- button "Delete deck…"` and `- button "Discard changes…"`, the literals in the scenes (`.verify/dialog/build/aria-c2.txt`, from `build/measure/aria.spec.ts`).
- [x] Check. `bunx playwright test e2e/usage.spec.ts e2e/behavior.spec.ts` passes in Firefox and WebKit with 0 diagnostics. With the `dom.ts` filter reverted, the usage sweep reports ODD-DIALOG-004 on both sides. Result: `bun run check` passes 618 tests (`.verify/dialog/build/check-c2.txt`). Against `build/sb-c2` on port 6631, from `build/pw.config.ts`, 56 passed and 2 skipped, the WebKit usage sweep, which runs in Firefox only. Firefox reports "68 stories, 0 diagnostics" (`browsers-c2.txt`). With the filter reverted by `build/dom-revert.ts`, which restores the file, the sweep reports "68 stories, 2 diagnostics", ODD-DIALOG-004 on the open Toast settings dialog in `html` and in `react` (`dom-revert.txt`).

### Commit 3. Docs, smoke, and the verify recipe

- [x] In `docs/usage/react.md`, add `Dialog` and `DialogActions` to the export list and the directive-free list, add a Dialog block to "Open a dialog or a popover with a command", add the type-error rows, and add ODD-DIALOG-001 to the "not type errors" paragraph. Add a Dialog section, the `element` variant of `accessible-name`, and `forbidden-value` to `docs/usage/eslint.md`. Name `Dialog` and `DialogActions` in the README rows, the React install sentence, and the usage-contract list. Result: the command section replaces the bare `show-modal` snippet with the `Dialog` example, the browser behavior, the body and title classes, the alert dialog, `showModal()` on a `ref`, and the `autofocus` note. The table gains ODD-DIALOG-004, 007, and 008, the alert `closedby` text, the missing name, and the `role` and `closedby` allowed values. `eslint.md` gains "Dialog from odd-design/react", with the spread warning, the `element` form of `accessible-name`, and `forbidden-value`. The README names both parts in the `odd-dialog` and alert-dialog rows and the install sentence, and links the dialog page.
- [x] Update `.agents/skills/verify-odd-design/features/surfaces.md` and `overlays.md` for the React sides, the new sidebar order, and focus on the first button without `autofocus`. Result: React Dialog and React Alert Dialog sections point the recipes at the `react_` ids and the per-side behavior tests. The measured order in `index.json` is Badge, Card, Dialog, Disclosure in both Surfaces sections, Tooltip, Hover Card, Sheet, Alert Dialog, Popover in HTML Overlays, and Alert Dialog, Popover in React Overlays (`.verify/dialog/build/sidebar-c2.txt`). The `autofocus` gotcha now says focus lands on the first button.
- [x] Add the follow-ups in Appendix D to `docs/follow-ups.md`. Result: five lines after the Popover entries. The first also names the alert `closedby` type error, which prints TypeScript's text since the commit 1 deviation.
- [x] Check. `bun run check`, `bun run build`, and `bun scripts/consumer-smoke.ts` pass. Result: `bun run check` passes 618 tests, the build exits 0, and the smoke exits 0 with zero for its clean types, ESLint, and Vitest runs (`.verify/dialog/build/check-c3.txt`, `build-c3.txt`, `smoke-c3.txt`).

## Verify on the real surface

- [x] Rebuild both Storybooks, capture to `after.json`, and diff against `base.json`. Pass means `changed` lists only the Dialog and Alert Dialog stories, with `dom` changes only (the removed `autofocus`), and no `png` or `aria` change. Result: built at `12c37ae`. 86 captures. The diff reports 4 changed (Dialog and Alert Dialog, light and dark, `dom` only), 0 removed, 0 added (`.verify/dialog/capture-diff.txt`). The only `dom` change is the removed `autofocus=""` on the first button.
- [x] Run `bun run test:browsers`. Pass means Firefox and WebKit pass, 0 diagnostics, and 0 axe violations. Result: 60 passed, 2 skipped. "68 stories, 0 diagnostics". 0 axe violations in 58 runs per engine and mode, in Firefox and WebKit (`.verify/dialog/browsers-tip.txt`).
- [x] Drive the composed build per the verify-odd-design skill. Open both sides of the Dialog and Alert Dialog stories in `calm` light, `holoterminal` dark, and one more palette. Confirm matching screenshots and aria while closed. Confirm that each trigger opens a named modal with focus on the first button, that Escape closes it and returns focus, that a backdrop click closes the Dialog and not the Alert Dialog, and that each close button closes it, on both sides. Result: `.verify/dialog/chrome/chrome-pair.ts` drove the built composed Storybook in Chrome in `calm` light, `holoterminal` dark, and `bubblegum` `sorbet` dark. All 68 checks pass on both sides. Closed, the root screenshots are byte-identical and the aria equals each literal. Enter opens a `:modal` dialog named by its title, with the heading, the paragraph, and both buttons, and focus on Close or Keep editing. Escape closes it and focus returns to the trigger. A click at (10, 10) closes the Dialog and leaves the Alert Dialog open, and Delete and Discard close them. The composed manager lists both React stories, and each preview renders one `dialog.odd-dialog` (`.verify/dialog/chrome/results.txt`).

## Review and open the PR

- [x] The `cursor grok-4.7` reviewer reads the diff against this plan. A fresh builder fixes each finding that blocks. Other findings go to `docs/follow-ups.md`. Result: no blocking finding. The reviewer measured three sentences that were false or too broad. The `p` body claim holds only for HTML parsing, the recipe's `-g dialog` selected 9 tests, and the `open` filter is a no-op in happy-dom. A fresh builder corrected all three in `83721e2`, and the happy-dom gap went to `docs/follow-ups.md` (`.verify/dialog/review/review.md`).
- [x] Run `/deslop` and `/no-comments` over the diff. Result: Comment Sicko deleted nothing. It kept the one `dom.ts` comment, a platform fact, and skipped the `expect:` lines, which are test input. For `/deslop`, the lead read the diff and found nothing to remove.
- [ ] Open the PR ready with `gh pr create --base main --repo Rakvadium/odd-design`. The title is `feat(react): add Dialog and mirror it in the Storybooks`.
- [ ] Run `gh pr checks`. The repo has no workflows, so expect "no checks reported". Report the PR as open. Do not merge.

## Throughput checkpoint

- **Blocking first steps.** The committed plan and the baseline capture. Commit 2 needs commit 1's parts. Commit 3 needs both.
- **Independent workstreams.** None worth splitting. The rows, the parts, the stories, and the docs all read `contract.ts` and `format.ts` and share the test tables.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The `.verify/dialog/` candidates are read-only references.
- **Smallest safe decomposition.** One builder, one commit at a time, each checked before the next. The base candidate's `lab.patch` already passes `bun run check` on a scratch copy, so the builder starts from it and applies the four grafts.

## Appendix A. Design choices

| Fork | Chosen | Why |
| --- | --- | --- |
| Parts | `Dialog` and `DialogActions` | The body and title tags vary. The actions row is fixed |
| Behavior owner | The browser | No JS in `src/js` moves a dialog node, so React owns every node it renders |
| Trigger | `Button` with `commandfor` and `command` | Already typed. A trigger part is a second way |
| Name | `accessible-name` with an `element` field | Either attribute is valid, and the kind already exists |
| Role | `alertdialog` only | `dialog` is redundant, and other roles misannounce |
| `closedby` | `any` or `closerequest` | `none` stops Escape |
| Alert with `closedby="any"` | New kind `forbidden-value`, own code | A stray click discards the decision |
| `open` | Forbidden, filtered on `:modal` | Non-modal and stale in React |
| Types | Structural unions in `DialogProps` | The generic false-positives on untyped handlers |
| `"use client"` | No | No hooks |
| Browser proof | Both behavior tests on both sides | Parity covers only the closed state |

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| `Dialog` only (Grok runner) | Breaks the `CardFooter` shape for the fixed actions row |
| `DialogBody` part (Opus runner) | Renders only a `div`, so the `form` body is a second spelling |
| `DialogTitle` part fixed to `h2` | Hides the heading level, which Card leaves to the caller |
| Popover-style `const P` generic (Grok runner) | Rejects a correct dialog with `onCancel={(event) => …}` |
| A new `required-name` kind (Grok runner) | The same check as an `element` field on `accessible-name` |
| `closedby` takes `none` (Grok runner) | Escape stops closing the dialog |
| `closedby` takes only `any` (Opus runner) | Flags a correct alert dialog that spells the default |
| One code for both `closedby` mistakes (Opus runner) | The failures differ |
| A stateful `open` and `onOpenChange` | A second state owner, `"use client"`, and an effect |
| An `AlertDialog` row on the same class | Two rows and two parts for one element |

## Appendix C. Evidence and reading list

These files are local scratch under the gitignored `.verify/dialog/` folder of this worktree. They are not on the branch.

- `how.md` explains the CSS, the stories, the JS that touches dialogs, the checkers, the typing, and the mirror, and lists thirteen forks.
- `task.md` and `rubric.md` are the arena's task and scoring rubric.
- `candidate-opus/design.md` is the base, with `lab.patch` and its probes.
- `candidate-grok/design.md` is the other design, with its probes.
- `judge.md` holds the cross-judge's scores, the claims it found wrong, its pick, and the grafts.
- `synthesis.md` records the base, the grafts taken, and the grafts rejected.

## Appendix D. Risks and follow-ups

- **A missing name prints TypeScript's text, not the 002 code.** A branded "one of these props" helper in `part.ts` could print the message.
- **`aria-labelledby` that points at a missing id passes.** No rule resolves ids.
- **A dialog whose safe choice is not first cannot set initial focus in React.** React writes no `autofocus`. The docs say to put the safe choice first.
- **A `Dialog` unmounted while modal, holding the toast stand-in, is unmeasured.**
- **The open dialog is unchecked by a screen reader.** NVDA and VoiceOver did not run.
