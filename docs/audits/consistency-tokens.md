# Consistency and tokens audit

This report records whether odd-design is still built as one system after the React ports. It checks module shape, hardcoded visual values, and design-system anti-patterns, and it ranks the fixes. Caleb picks fixes from section 5. The engineer who adds the next component reads sections 2 to 4 to learn which pattern to copy and which to avoid. [The approved plan](../plans/consistency-tokens-audit.md) defines every rule, score, and section used here.

The audit reads `d21483c` (`chore(react): land the post-port follow-ups (#40)`, 2026-10-28). The audit commits on top of it (`c9ff6fe`, `781adde`, `2172579`, `2fd2b6c`, and the commit that adds this report) change nothing under `src/`, `stories/`, `tests/`, `.storybook*`, or `docs/usage/`, so every line citation holds at the baseline and at the branch head. Report date 2026-10-29.

The four sections between `<!-- audit:NAME -->` markers are generated. Do not edit them by hand. To refresh them from the source and from `docs/audits/consistency-tokens.verdicts.tsv`, run `bun scripts/audit-consistency.ts --write`. To check every `` `path:line` (`value`) `` citation outside the generated sections, run `bun scripts/audit-consistency.ts --check-cites`. It fails when a cited line does not exist or does not contain the quoted value.

The chrome renders are in [the drift results](consistency-tokens-drift/results.md), with every raw value in `data.json` beside it. A measurement in this report cites that file by section heading. The screenshots stay local under `.verify/evidence/audit-drift/drift/`.

## Summary

The audit verified 70 findings, 60 CONFIRMED and 10 PLAUSIBLE, and rejected 13. Section 2 holds 13 consistency findings, section 3 holds 24 findings about hardcoded values, and section 4 holds 33 other anti-patterns. Twelve findings got a render sweep under all 5 chromes in light and dark. Eleven sweeps measured drift. JS-03's sweep was inconclusive, because no story has the `aria-disabled` tab it needed. The scanner found 366 literals in 46 files. Of those, 125 match no rule and 50 are exceptions, 9 of them under a widened plan exception that section 3 explains. The rest are 78 shared values, 44 missing-scale values, 48 story values, 20 chrome-owned values, and 1 raw color.

The backlog groups the findings into 36 fixes. The top three each score 9, from expansion 3 and drift 3.

- B-01 adds a `--disabled-opacity` token and stops disabled fields and tabs from reacting to hover (CSS-07).
- B-02 gives every control one focus recipe, so the ring offset and the glow follow the chrome (CSS-03).
- B-03 adds a `--weight-*` scale and a `--label-weight` chrome role, so label weight moves with the chrome like heading weight does (CSS-01, DOC-02).

## 1. Current state

### Inventory

The generated matrix in section 2 lists every component. This table counts the surfaces.

| Surface | Count | Detail |
| --- | --- | --- |
| CSS component files | 26 | Each is imported into the `components` layer of `src/css/index.css`. |
| Chromes | 5 | calm, glass, bubblegum, expressive, darkmatter (`src/js/contract.ts:6` (`export const CHROMES`)). |
| Palettes | 8 | One file each in `src/css/palettes/`. |
| React component modules | 20 | 15 `part()` only. 3 hand-written (`button`, `tabs`, `toast`). 2 mixed (`menu`, `table`). Those 5 are the only `"use client"` modules. |
| React parts | 39 | One `WRAPPERS` row each in `src/js/usage/contract.ts`. |
| React support modules | 3 | `index.ts`, `part.ts`, `props.ts`. |
| Behavior files in `src/js/` | 14 | `enhance()` runs 7 component enhancers and 3 fallbacks (`src/js/enhance.ts:108` (`export function enhance`)). |
| Story files | 29 | 8 hand-written files with 15 scenes. 21 mirrored files with 28 scenes. The catalog lists 43 HTML ids and 28 React ids. |
| Usage pages | 24 | 20 component code pages, plus `general.md`, `react.md`, `eslint.md`, and `runtime.md`. |
| Known design debt | 108 | Items under "Design debt" in `docs/follow-ups.md`. |
| CSS components with no React module and no usage page | 6 | estop, log, range-field, shell, stepper, and typography. |

### What #24 to #40 changed

- #24 to #39 added 17 React modules and mirrored each into both Storybooks. In order they are Badge, Alert, Avatar, Separator, Skeleton, Card, Disclosure, Tabs, Search, Slider and Meter (#33), Toaster, Popover, Dialog, Sheet, Menu, and Table. Button, Field, and Choice came before #24 and set the reference shape in `docs/plans/react-uniformity.md`.
- #40 landed the post-port follow-ups listed next.

### Post-port follow-ups as landed

- Every React part that renders a `button` defaults to `type="button"`. `lower` writes it when `elementTag` resolves to `button` (`src/react/part.ts:97` (`attributes.type ??= "button"`)). A written `type` wins.
- Enhanced buttons get the same default from one helper (`src/js/button-type.ts:1` (`export function defaultToButtonType`)). `enhanceTabs` and React `Tabs` call it through `typeTabs` (`src/js/tabs.ts:49` (`export function typeTabs`), `src/react/tabs.tsx:19` (`typeTabs(root.current!)`)). `enhanceMenu` calls it at wire time and on open (`src/js/menu.ts:62` (`defaultToButtonType(el)`)). `toast()` types its action and close buttons (`src/js/toast.ts:176` (`close.type = "button"`)).
- The holoterminal chrome is gone. `CHROMES` lists five (`src/js/contract.ts:6` (`"darkmatter"`)). The name remains only in `docs/plans/` history.
- `enhanceSelectAll` keeps calling `row.click()` on each changed row, and the Table plan records Caleb's confirmation (`docs/plans/react-table.md:150` (`Confirmed by Caleb after review`)).

### Parked

Typography is deferred, and tooltip and hover-card are parked (`docs/plans/consistency-tokens-audit.md:48` (`Typography is deferred`)). The report names a parked item only where it causes a finding elsewhere, and marks it parked. Typography causes DOC-02, because no body-text helper exists for stories to use. Tooltip and hover-card appear as extra sites in CSS-01, CSS-02, CSS-09, CSS-12, JS-07, and JS-08. No backlog item targets a parked component's own unfinished work, but seven items edit a rule or a file that a parked component shares:

- B-08 tokenizes the tooltip's own forced-colors outline (`src/css/components/popover.css:112` (`1px solid CanvasText`)).
- B-09 changes the radius token that the shared popover rule reads, and that rule also styles the hover card (`src/css/components/popover.css:32` (`.odd-hover-card {`)).
- B-14 changes how `interestForFallback`, the fallback that opens the tooltip and the hover card, resolves ids (`src/js/fallbacks.ts:14` (`export function interestForFallback`)).
- B-16 moves that fallback onto the shared wiring helper.
- B-25 makes the HTML preview run every fallback, including `interestForFallback`, on every story.
- B-27 tokenizes the overlay gutter, the width caps, and the enter scale. That reaches the hover card's and the tooltip's own width lines and the enter rules that cover both (`src/css/components/popover.css:46` (`.odd-hover-card { inline-size`), `src/css/components/popover.css:50` (`max-inline-size: min(18rem, 100vw - 2rem);`), `src/css/components/popover.css:65` (`.odd-tooltip {`)).
- B-32 tokenizes the compact padding in the shared popover rule, which the hover card reads (`src/css/components/popover.css:35` (`* 0.67`)).

None of the seven changes the tooltip's or the hover card's markup or API. Separately, B-12 puts the deferred `odd-heading` class on the Showcase wordmark without changing `typography.css`.

## 2. Consistency gaps

The generated matrix has one row per CSS component. Button, Field, and Choice are the reference shape. The entries after the matrix are the verified deviations from that shape, vanilla first, then React, then docs.

<!-- audit:matrix -->

| Component | CSS file | `index.css` import | `WRAPPERS` rows | `USAGE` rules | React module | Module kind | `"use client"` | Usage doc | Mirrored story | Type fail fixtures (prefixes) | Usage fixtures | `react.test.tsx` rows | Enhancer | Called by `enhance()` | Verify recipe |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| alert | src/css/components/alert.css | yes | Alert, AlertTitle | alert (5), alertTitle (2) | src/react/alert.tsx | part() only | no | docs/usage/alert.md | Alert | 5 (alert, alert-title) | 10 html, 1 jsx | 1 markup, 0 describe | none | none | feedback |
| avatar | src/css/components/avatar.css | yes | Avatar, AvatarGroup | avatar (5), avatarGroup (5) | src/react/avatar.tsx | part() only | no | docs/usage/avatar.md | Avatar | 8 (avatar, avatar-group) | 12 html, 1 jsx | 1 markup, 0 describe | avatarFallback | yes | data-display |
| badge | src/css/components/badge.css | yes | Badge | badge (4) | src/react/badge.tsx | part() only | no | docs/usage/badge.md | Badge | 2 (badge) | 8 html, 1 jsx | 1 markup, 0 describe | none | none | overlays, surfaces |
| button | src/css/components/button.css | yes | Button | button (15) | src/react/button.tsx | hand-written | yes | docs/usage/button.md | Button | 10 (button) | 30 html, 2 jsx | 8 markup, 1 describe | none | none | buttons, interactive, sample-app, surfaces |
| card | src/css/components/card.css | yes | Card, CardLink, CardFooter | card (8), cardTitle (2), cardLink (3), cardFooter (2) | src/react/card.tsx | part() only | no | docs/usage/card.md | Card | 3 (card, card-link) | 14 html, 1 jsx | 1 markup, 0 describe | none | none | surfaces |
| choice | src/css/components/choice.css | yes | Choice, Switch, Segmented | choice (3), switch (6) | src/react/choice.tsx | part() only | no | docs/usage/choice.md | Choice | 3 (choice, switch) | 6 html, 1 jsx | 1 markup, 0 describe | none | none | forms |
| dialog | src/css/components/dialog.css | yes | Dialog, DialogActions | dialog (7), dialogPart (4) | src/react/dialog.tsx | part() only | no | docs/usage/dialog.md | AlertDialog, Dialog | 7 (dialog, dialog-actions) | 16 html, 1 jsx | 2 markup, 0 describe | closedByFallback | yes | overlays, surfaces |
| disclosure | src/css/components/disclosure.css | yes | Disclosure | disclosure (3) | src/react/disclosure.tsx | part() only | no | docs/usage/disclosure.md | Disclosure | 1 (disclosure) | 6 html, 1 jsx | 1 markup, 0 describe | none | none | surfaces |
| estop | src/css/components/estop.css | yes | none | none | none | none | none | none | none | 0 | 0 html, 0 jsx | 0 markup, 0 describe | none | none | machine-controls |
| field | src/css/components/field.css | yes | Field, Label, Input, Textarea, Select, Hint, FieldError | field (2), fieldControl (4), fieldError (3) | src/react/field.tsx | part() only | no | docs/usage/field.md | Field | 2 (field-error, input) | 6 html, 1 jsx | 3 markup, 0 describe | none | none | forms, machine-controls |
| log | src/css/components/log.css | yes | none | none | none | none | none | none | none | 0 | 0 html, 0 jsx | 0 markup, 0 describe | enhanceLog | yes | machine-controls |
| menu | src/css/components/menu.css | yes | Menu, MenuItem | menu (7), menuItem (6) | src/react/menu.tsx | mixed | yes | docs/usage/menu.md | Menu | 7 (menu, menu-item) | 14 html, 1 jsx | 1 markup, 1 describe | enhanceMenu | yes | interactive |
| meter | src/css/components/meter.css | yes | Meter, Progress | meter (4) | src/react/meter.tsx | part() only | no | docs/usage/meter.md | Meter | 2 (meter, progress) | 6 html, 1 jsx | 2 markup, 0 describe | none | none | feedback |
| popover | src/css/components/popover.css | yes | Popover | popover (7) | src/react/popover.tsx | part() only | no | docs/usage/popover.md | Popover | 6 (popover) | 12 html, 1 jsx | 1 markup, 0 describe | none | none | overlays |
| range-field | src/css/components/range-field.css | yes | none | none | none | none | none | none | none | 0 | 0 html, 0 jsx | 0 markup, 0 describe | enhanceRangeField | yes | machine-controls |
| search | src/css/components/search.css | yes | Search | search (8) | src/react/search.tsx | part() only | no | docs/usage/search.md | Search | 2 (search) | 10 html, 1 jsx | 1 markup, 0 describe | none | none | forms |
| separator | src/css/components/separator.css | yes | Separator | separator (6) | src/react/separator.tsx | part() only | no | docs/usage/separator.md | Separator | 6 (separator) | 8 html, 1 jsx | 1 markup, 0 describe | none | none | data-display |
| sheet | src/css/components/sheet.css | yes | Sheet, SheetHeader, SheetFooter | sheet (8), sheetPart (4) | src/react/sheet.tsx | part() only | no | docs/usage/sheet.md | Sheet | 6 (sheet, sheet-footer) | 6 html, 1 jsx | 1 markup, 0 describe | closedByFallback | yes | overlays |
| shell | src/css/components/shell.css | yes | none | none | none | none | none | none | none | 0 | 0 html, 0 jsx | 0 markup, 0 describe | none | none | machine-controls |
| skeleton | src/css/components/skeleton.css | yes | Skeleton | skeleton (10) | src/react/skeleton.tsx | part() only | no | docs/usage/skeleton.md | Skeleton | 5 (skeleton) | 10 html, 1 jsx | 1 markup, 0 describe | none | none | feedback |
| slider | src/css/components/slider.css | yes | Slider | slider (5) | src/react/slider.tsx | part() only | no | docs/usage/slider.md | Slider | 3 (slider) | 8 html, 1 jsx | 1 markup, 0 describe | none | none | forms |
| stepper | src/css/components/stepper.css | yes | none | none | none | none | none | none | none | 0 | 0 html, 0 jsx | 0 markup, 0 describe | enhanceStepper | yes | machine-controls |
| table | src/css/components/table.css | yes | TableWrap, Table, TableSort | tableWrap (5), table (2), tableSort (3) | src/react/table.tsx | mixed | yes | docs/usage/table.md | Table | 7 (table, table-sort, table-wrap) | 10 html, 1 jsx | 1 markup, 1 describe | enhanceSelectAll | yes | data-display |
| tabs | src/css/components/tabs.css | yes | Tabs | tabs (6) | src/react/tabs.tsx | hand-written | yes | docs/usage/tabs.md | Tabs | 3 (tabs) | 10 html, 1 jsx | 1 markup, 1 describe | enhanceTabs | yes | interactive |
| toast | src/css/components/toast.css | yes | Toaster | toaster (5) | src/react/toast.tsx | hand-written | yes | docs/usage/toast.md | Toast | 5 (toaster) | 8 html, 1 jsx | 1 markup, 1 describe | enhanceToaster | yes | buttons, interactive |
| typography | src/css/components/typography.css | yes | none | none | none | none | none | none | none | 0 | 0 html, 0 jsx | 0 markup, 0 describe | none | none | foundations |

Not mapped to a component:

- usage fixture `odd-class-001.bad`
- usage fixture `odd-class-001.good`
- usage JSX fixture `children-prop`
- usage JSX fixture `cn`
- usage JSX fixture `link`
- usage JSX fixture `local-button`
- usage JSX fixture `radix`
- usage JSX fixture `raw.bad`
- usage JSX fixture `wrapper-data`
- usage JSX fixture `wrapper-href`
- usage JSX fixture `wrapper.bad`
- usage JSX fixture `wrapper.good`
- enhancer `interestForFallback` (src/js/fallbacks.ts, called by enhance())

<!-- /audit:matrix -->

### Vanilla deviations

#### CSS-24. One tab selector has no `.odd-` root

- **Rule.** Consistency check on selector naming (`.odd-x` with `data-*` variants).
- **Evidence.** `src/css/components/tabs.css:56` (`[aria-orientation="vertical"] > [role="tab"] {`) matches any vertical `role="tab"` on the page, including a third-party tab set. Every other tab rule sits under `.odd-tabs` (`src/css/components/tabs.css:31` (`.odd-tabs [role="tab"] {`)). `src/css/components/table.css:116` is also unscoped, but it requires `.odd-table-sort`, so it styles only odd-design's own button.
- **Verdict.** CONFIRMED. The verifier dropped two of the seam's claims. "Only unscoped selector" is too strong because of the table rule, and `.odd-switch` is that control's own class, not a missed `data-*` variant.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-20.

#### JS-01. Three of seven enhancers wire again on every call

- **Rule.** Consistency finding on the enhancer signature `(root) => cleanup`, which means "wire once" in four files and "wire again" in three.
- **Evidence.** `enhanceMenu`, `enhanceTabs`, `enhanceToaster`, and `enhanceSelectAll` keep a holder (`src/js/menu.ts:36` (`let hold = holders.get(menu);`), `src/js/tabs.ts:28` (`let hold = holders.get(root);`), `src/js/toast.ts:27` (`let hold = toasters.get(region);`), `src/js/enhance.ts:59` (`let hold = selectAllHolders.get(table);`)). `enhanceStepper`, `enhanceRangeField`, and `enhanceLog` add listeners or an observer on every call (`src/js/stepper.ts:88` (`root.addEventListener("pointerdown", onPointerDown);`), `src/js/range-field.ts:90` (`number.addEventListener("input", onNumberInput);`), `src/js/log.ts:30` (`const observer = new MutationObserver`)). `enhance()` runs all of them (`src/js/enhance.ts:113` (`.map(enhanceStepper)`)). The README promises once-only wiring for tabs and toasters only (`README.md:210` (`wires a tab set once, however many times it is called`)).
- **Verdict.** CONFIRMED. In happy-dom, two `enhance(document)` calls moved a stepper from 0 to 2 on one click, and one typed number fired two slider `input` events. A second `enhanceRangeField` reset the number from 80 to 40 (`src/js/range-field.ts:33`). Two wires of a field with no `id` created two `.odd-error` nodes on one commit, because each call takes a new id (`src/js/range-field.ts:34`). `enhanceLog` twice created two observers. Menu and tabs stayed single-fire.
- **Scores.** Expansion 2, drift 2. The verifier raised drift from 1 because the displayed value changes. Nothing was rendered under a chrome.
- **Tag.** new. The known item "Three enhancers repeat the same holder." (`docs/follow-ups.md:147` (`Three enhancers repeat the same holder.`)) names the shared code, not the enhancers that lack it.
- **Fix.** B-16.

#### JS-07. Cleanup leaves behind what two enhancers created

- **Rule.** Consistency finding on the cleanup half of `(root) => cleanup`, which has no stated contract.
- **Evidence.** Range field inserts an error and sets `aria-invalid` (`src/js/range-field.ts:51` (`root.after(error);`), `src/js/range-field.ts:54` (`number.setAttribute("aria-invalid", "true");`)), and its cleanup only removes listeners (`src/js/range-field.ts:93` (`return () => {`)). `interestForFallback` keeps timers in a `WeakMap` it cannot iterate (`src/js/fallbacks.ts:16` (`const timers = new WeakMap`)), and its cleanup leaves a pending show (`src/js/fallbacks.ts:78` (`return () => {`)). Toaster's cleanup removes everything it built (`src/js/toast.ts:209` (`stop: () => {`)).
- **Verdict.** PLAUSIBLE. The behavior is measured. After an out-of-range commit and cleanup, the error paragraph and `aria-invalid="true"` stayed. `interestForFallback` opened a popover 50ms after cleanup. Unproven is the rule, because the plan checks the signature `(root) => cleanup`, which both functions return, and it does not say cleanup must remove created nodes and timers. The tooltip and hover-card half is parked.
- **Scores.** Expansion 2, drift 2 (visible error left behind, not rendered under a chrome).
- **Tag.** new.
- **Fix.** B-16.

#### JS-M2. Tabs cleanup leaves panels in the Tab order

- **Rule.** The same cleanup reading as JS-07.
- **Evidence.** `src/js/tabs.ts:78` (`panel.tabIndex = 0`) makes a panel with nothing focusable reachable. Cleanup at `src/js/tabs.ts:106` (`return () => {`) removes listeners and leaves `tabIndex`.
- **Verdict.** PLAUSIBLE. The verifier measured panels at `[0, 0, 0]` after cleanup. The finding stands only under the cleanup contract that JS-07 leaves unproven.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new. Found by the JS verifier.
- **Fix.** B-16.

### React deviations

#### RX-02. Field and Choice have no `system-data` rule, and the recorded reason no longer holds

- **Rule.** Consistency finding. Every later family ends with a `system-data` rule. The reference families do not.
- **Evidence.** `field`, `fieldControl`, `fieldError`, `choice`, and `switch` have no such rule (`src/js/usage/contract.ts:62` (`field: [`), `src/js/usage/contract.ts:66` (`fieldControl: [`), `src/js/usage/contract.ts:72` (`fieldError: [`), `src/js/usage/contract.ts:77` (`choice: [`), `src/js/usage/contract.ts:82` (`switch: [`)). Disclosure has one (`src/js/usage/contract.ts:167` (`ODD-DISCLOSURE-003`)) with an empty vocabulary (`src/js/usage/contract.ts:416` (`disclosure: [],`)). The Field plan says the rule is absent because the vocabulary is empty (`docs/plans/react-field.md:48` (`Field gets no`)).
- **Verdict.** CONFIRMED. `<Input data-tone="danger" />` passes `tsc`, ESLint, and `checkRoot`. `<Disclosure data-tone="info">` fails all three with `ODD-DISCLOSURE-003`. Field, Hint, and Label props do not extend `Contract` (`src/react/field.tsx:13` (`export interface FieldProps extends Native<"Field">`)), so a new `field` rule would not type them until `field.tsx` changes.
- **Scores.** Expansion 1, drift 1. The verifier lowered expansion from 3, because the README recipe already tells the next part to add the rule. `field.css` and `choice.css` have no `data-tone` selector, so the attribute does not change the look.
- **Tag.** new.
- **Fix.** B-36.

#### RX-04. Avatar keeps its own copy of `RoleWithName`

- **Rule.** Consistency finding. The verifier ruled that the three-place helper rule is not met, because the copy lives in one module beside the shared helper.
- **Evidence.** `src/react/avatar.tsx:21` (`Message<"ODD-AVATAR-004">`) hardcodes the code, while `src/react/part.ts:73` (`export type RoleWithName<P, Rule>`) reads it from the rule. Popover and TableWrap already use the shared one (`src/react/popover.tsx:11` (`RoleWithName<P, PopoverRule>`)). The Popover plan built the shared helper from Avatar's (`docs/plans/react-popover.md:109` (`with the converse branch`)).
- **Verdict.** CONFIRMED. A throwaway alias of `RoleWithName` over Avatar's two rules typechecked, accepted a named role, and rejected an unnamed role with `ODD-AVATAR-004`.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new. Related known item "`RoleWithName` accepts a blank name and an optional role." (`docs/follow-ups.md:135` (`accepts a blank name and an optional role`)).
- **Fix.** B-30.

#### RX-11. Stateless sub-parts ship as client components because they share a file

- **Rule.** Consistency finding on the `"use client"` column.
- **Evidence.** `src/react/menu.tsx:1` and `src/react/table.tsx:1` are file-level `"use client"`. `MenuItem`, `TableWrap`, and `TableSort` are one-line `part()` calls (`src/react/menu.tsx:25` (`part("MenuItem")`), `src/react/table.tsx:32` (`part("TableSort")`)), the same shape as `DialogActions` in a file with no directive (`src/react/dialog.tsx:14` (`part("DialogActions")`)). The Menu plan records the directive for `Menu` because it has hooks (`docs/plans/react-menu.md:209` (`has hooks`)).
- **Verdict.** CONFIRMED. The seam's claim that a server-rendered table serializes the sub-parts' children was not measured.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-28.

#### RX-M1. The consumer smoke test locks `"use client"` for three of five client modules

- **Rule.** Consistency finding on the `"use client"` column. Nothing stops it drifting for Menu, Table, or a new client file.
- **Evidence.** `scripts/consumer-smoke.ts:10` (`const CLIENT_MODULES = ["button.js", "tabs.js", "toast.js"];`) omits `menu.js` and `table.js`, though both modules declare the directive.
- **Verdict.** CONFIRMED. Checked against the source.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new. Found by the React verifier.
- **Fix.** B-28.

#### RX-17. Five CSS components have contract vocabulary but no `USAGE` group and no React module

- **Rule.** Consistency finding on the `WRAPPERS`, `USAGE`, and React module columns.
- **Evidence.** Vocabulary rows exist for estop, log, range-field, shell, and stepper (`src/js/usage/contract.ts:417` (`estop: [],`), `src/js/usage/contract.ts:419` (`log: ["data-tone"],`), `src/js/usage/contract.ts:423` (`"range-field": [],`), `src/js/usage/contract.ts:427` (`shell: ["data-span"],`), `src/js/usage/contract.ts:430` (`stepper: [],`)), so no checker reads their markup. Three of them write DOM that React would own (`src/js/log.ts:42` (`export function appendLogLine`), `src/js/range-field.ts:63` (`number.value = slider.value;`), `src/js/stepper.ts:26` (`button.setAttribute("aria-disabled", String(off));`)).
- **Verdict.** CONFIRMED. The verifier dropped the typography row, which is parked. The React conflict for range field and stepper was read from the enhancer source, not run.
- **Scores.** Expansion 1, drift 1.
- **Tag.** known. "The HTML preview keeps its own list of enhancers." (`docs/follow-ups.md:105` (`keeps its own list of enhancers.`)) names these enhancers as having no React counterpart, and "Later components need script-set attributes marked in the contract." (`docs/follow-ups.md:185` (`script-set attributes marked in the contract`)) names the blocker for range field and stepper.
- **Fix.** B-34.

### Docs deviations

#### DOC-09. The layout utilities and `--gap` have no doc row, and Showcase sets `--gap` where nothing reads it

- **Rule.** Consistency finding, a shipped class with no doc row.
- **Evidence.** `src/css/base.css:99` (`gap: var(--gap, var(--space-4))`) and `src/css/base.css:100` (`gap: var(--gap, var(--space-3))`) read `--gap`. The README documents `--gap` only on `odd-grid` (`README.md:196` (`sets the gutter`)) and has no row for `odd-stack`, `odd-row`, `odd-muted`, or `odd-visually-hidden`. `odd-card` sets its own gap (`src/css/components/card.css:11` (`gap: var(--space-3)`)), yet Showcase sets `--gap` on two cards (`stories/Showcase.stories.ts:85` (`class="odd-card" style="--gap: var(--space-5)"`), `stories/Showcase.stories.ts:131` (`style="--gap: var(--space-3)"`)).
- **Verdict.** CONFIRMED. `shell.css` also reads `--gap` on the grid, so a complete doc row names it too.
- **Scores.** Expansion 2, drift 1.
- **Tag.** known for the Showcase half, "Showcase sets `--gap` on cards that do not read it." (`docs/follow-ups.md:89` (`on cards that do not read it`)). The README half is new.
- **Fix.** B-12.

#### DOC-11. Four families share one section in `react.md` whose heading names two of them

- **Rule.** Consistency finding on docs page shape.
- **Evidence.** Sixteen families get their own section, such as `docs/usage/react.md:334` (`## Build tabs`). Popover, Menu, Dialog, and Sheet share `docs/usage/react.md:609` (`## Open a dialog or a popover with a command`), after "Read a type error". No heading names Menu or Sheet.
- **Verdict.** PLAUSIBLE. Coverage is complete, because the section body and the type-error table name all four. Unproven is the rule, because `react-uniformity.md` does not require one heading per export, and the section groups the four on purpose because they open with `command` and `commandfor`.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-23.

#### DOC-12. Usage code pages have two section shapes

- **Rule.** Consistency finding on docs page shape.
- **Evidence.** `docs/usage/button.md:3` (`These codes apply to`) opens with two sentences and no example, while the other 19 component pages open with an `html` fence at line 5, such as `docs/usage/badge.md:6` (`<span class="odd-badge">Draft</span>`). The five Tabs codes have two paragraphs each. TABS-001 has no "why", and TABS-002 and TABS-004 have no fix sentence (`docs/usage/tabs.md:22` (`Move the class onto a`)).
- **Verdict.** PLAUSIBLE. The facts hold for Button and Tabs, and Separator's three-part shape was sampled. Unproven is the rule, because no plan defines a three-paragraph code section, and the census of the other 18 pages was not re-read line by line.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-23.

#### DOC-18. Five shipped components have README rules and no usage page

- **Rule.** Consistency finding on the usage doc column.
- **Evidence.** The README documents `odd-estop`, `odd-stepper`, `odd-range-field`, `odd-log`, and `odd-shell` with rules (`README.md:191` (`odd-estop`), `README.md:195` (`odd-shell`)). None has a page in `docs/usage/` or a code, so no checker enforces those rules. Log's four tone values appear only in `src/css/components/log.css:8` (`data-tone="info|success|warning|danger"`).
- **Verdict.** CONFIRMED. The verifier notes this restates the plan's starting inventory. It still matches the matrix column. Typography is parked.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-34.

## 3. Hardcoded values

The scanner reads every component stylesheet, `base.css`, `preferences.css`, the stories, the Storybook previews, and `src/react/`. It prints one row per literal, and the verdicts file gives each row a kind. The generated tables at the end of this section list every row.

A `none` verdict means no rule in the plan applies, so the literal is not a finding. The plan names five exception types. They cover 50 literals.

| Exception type | Literals | Reason |
| --- | --- | --- |
| Token definitions | 6 | `preferences.css` sets tokens, such as the zeroed durations under reduced motion. |
| Glyph geometry in `em` | 29 | One component draws an icon in CSS, such as the disclosure chevron and the select arrow strokes. |
| Platform or spec floors | 0 | `exception platform floor` has 0 rows. The 24px floor outside `--control-height` repeats in four components, so rule 6 applies instead (CSS-06). |
| Density-scaled private sizes | 6 | A `--_name` that multiplies one component's base size by `var(--density)`. |
| Input data in stories, widened to documented sizing knobs | 9 | A story passes a value to a sizing property that the component's own comment names as its API: the e-stop's `inline-size` (`src/css/components/estop.css:9` (`Set inline-size to change it`)), the log's `max-block-size` (`src/css/components/log.css:11-12` (`max-block-size to change that`)), and each skeleton block's size (`src/css/components/skeleton.css:8` (`Size each block with inline-size / block-size`)). |

The plan's fifth exception type is narrower than that row. It names only the seed colors in `CustomPalette.stories.ts` as story input data, and those seeds are `value="${args.primary}"` interpolations that the scanner never reads as literals. The classifier widened the exception to documented knob values passed by a story, and labeled those 9 rows `exception story input data`. The lead accepted the widening, which matches the reason DOC-17 was rejected. Caleb can overrule it, and then those 9 rows become `story` findings.

The entries below cover every missing scale, every shared name, every chrome-owned literal, and the raw color. Each lists its uses. Where a verified finding backs the entry, the finding follows it. Shared names with no finding came from the classifier only, and no verifier read them.

### Missing scales

#### Font weight, 20 literals

`foundations.css` has no `--weight-*` scale. The uses by value:

- 500 in `src/css/components/field.css:40` (`500`) and the parked tooltip at `src/css/components/popover.css:58` (`500`).
- 600 in `src/css/components/badge.css:20` (`600`), `src/css/components/button.css:27` (`600`), `src/css/components/choice.css:97` (`600`), `src/css/components/disclosure.css:18` (`600`), `src/css/components/field.css:19` (`600`), `src/css/components/field.css:165` (`600`), `src/css/components/menu.css:101` (`600`), `src/css/components/meter.css:107` (`600`), `src/css/components/table.css:49` (`600`), `src/css/components/table.css:73` (`600`), `src/css/components/tabs.css:46` (`600`), `src/css/components/toast.css:78` (`600`), and the parked typography at `src/css/components/typography.css:35` (`600`).
- 650 in `src/css/components/alert.css:49` (`650`).
- 700 in `src/css/components/avatar.css:25` (`700`) and `src/css/components/menu.css:60` (`700`).
- 800 in `src/css/components/estop.css:27` (`800`) and `src/css/components/field.css:54` (`800`).
- Stories add four more 600s, in `stories/mirrored/Avatar.stories.ts:55` (`fontWeight: "600"`), `stories/mirrored/Table.stories.ts:59` (`fontWeight: "600"`), `stories/Foundations.stories.ts:47` (`font-weight: 600`), and `stories/Foundations.stories.ts:94` (`font-weight: 600`).

##### CSS-01. Label weight is a literal while the chromes move heading weight

- **Rule.** 4 (missing scale), and theme and chrome drift.
- **Evidence.** Seven of the 600s sit on text that already reads the label role (`src/css/components/badge.css:18` (`var(--font-label)`), `src/css/components/button.css:25` (`var(--font-label)`), `src/css/components/choice.css:95` (`var(--font-label)`), `src/css/components/field.css:17` (`var(--font-label)`), `src/css/components/menu.css:99` (`var(--font-label)`), `src/css/components/table.css:47` (`var(--font-label)`), `src/css/components/tabs.css:44` (`var(--font-label)`)). The alert title reads the same role at 650 with no comment (`src/css/components/alert.css:48-49` (`font-weight: 650;`)). The chromes own heading weight (`src/js/contract.ts:48` (`"heading-weight",`), `src/css/chromes/bubblegum.css:6` (`--heading-weight: 800;`), `src/css/chromes/glass.css:6` (`--heading-weight: 550;`)) but not label weight.
- **Verdict.** CONFIRMED.
- **Drift.** Measured in [the drift results, "CSS-01. Label weight against heading weight"](consistency-tokens-drift/results.md#css-01-label-weight-against-heading-weight). Labels are 600 in all 10 cells. Headings are 650, 550, 800, 750, and 600. Glass labels are 50 heavier than its headings, and bubblegum's gap is 200. They match only in darkmatter.
- **Scores.** Expansion 3, drift 3.
- **Tag.** new.
- **Fix.** B-03.

##### DOC-02. Stories set text size and weight inline, including the literal 600

- **Rule.** 4 for the `600` literals, and the missing shared helper anti-pattern for the inline size and weight pairs. The parked Typography work is the cause.
- **Evidence.** The four story 600s above. `rg` finds 19 inline `font-size` or `font-weight` lines across 8 story files, such as `stories/Overlays.stories.ts:59` (`font-size: var(--text-sm)`) and `stories/Showcase.stories.ts:71` (`font-size: var(--text-2xl)`). Two mirrored stories carry the literal into the React Storybook, so `toReact` emits `style={{ fontWeight: "600" }}` as the example.
- **Verdict.** CONFIRMED. The verifier added `stories/Showcase.stories.ts:49` and `:50` to the 19 and counted 8 story files, not 9.
- **Scores.** Expansion 2, drift 2 (latent, not rendered). The verifier lowered expansion from 3, because only components that need a caption copy it.
- **Tag.** new. Typography is parked.
- **Fix.** B-03 for the literal. The text helper waits for Typography.

#### Line height, 6 literals

`foundations.css` defines only `--leading-tight` and `--leading-normal` (`src/css/foundations.css:15` (`--leading-tight: 1.15;`)). The uses are `src/css/components/avatar.css:26` (`1`), `src/css/components/button.css:28` (`1`), `src/css/components/badge.css:21` (`1.4`), the parked tooltip at `src/css/components/popover.css:59` (`1.4`), `src/css/components/estop.css:28` (`1.1`), and `src/css/components/log.css:25` (`1.45`).

##### CSS-09. `line-height: 1` repeats with no scale step

- **Rule.** 4 (missing scale).
- **Evidence.** `1` appears in button and avatar, the uses above.
- **Verdict.** CONFIRMED. The verifier narrowed the rule to the `1` pair. `1.1` and `1.45` occur once each, and badge's `1.4` pairs only with the parked tooltip.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-32.

#### Tracking, 4 literals

The uses are `src/css/components/avatar.css:27` (`0.02em`), `src/css/components/estop.css:31` (`0.06em`), `src/css/components/menu.css:90` (`0.04em`), and the parked eyebrow at `src/css/components/typography.css:37` (`0.06em`). The classifier marked them `missing-scale tracking`. The CSS verifier ruled that rule 4 does not apply, because each value occurs once outside the parked typography. The verified finding on the avatar and e-stop lines is CSS-10, under the chrome-owned label role below.

#### Icon size, 14 literals

The uses are `src/css/components/menu.css:37` (`1rem`), `src/css/components/menu.css:38` (`1rem`), `src/css/components/menu.css:58` (`1rem`), `src/css/components/tabs.css:61` (`1rem`), `src/css/components/tabs.css:62` (`1rem`), `src/css/components/search.css:19` (`1rem`), `src/css/components/search.css:20` (`1rem`), `src/css/components/search.css:32` (`1rem`), `src/css/components/search.css:33` (`1rem`), `src/css/components/search.css:27` (`1.5rem`), `src/css/components/alert.css:34` (`1.25rem`), `src/css/components/alert.css:35` (`1.25rem`), `src/css/components/button.css:91` (`1.15em`), and `src/css/components/button.css:92` (`1.15em`).

##### CSS-08. Icon and checkbox sizes have no scale

- **Rule.** 6.
- **Evidence.** 1rem icons repeat in menu, tabs, and search, the uses above. The native checkbox size repeats in choice and table, and again for the forced-colors switch (`src/css/components/choice.css:17` (`1.125rem`), `src/css/components/table.css:87` (`1.125rem`), `src/css/components/choice.css:61` (`1.125rem`)).
- **Verdict.** CONFIRMED. Tabs have no size step, so a tab icon that does not grow is not current drift. Alert's 1.25rem is one component. Button's 1.15em sizes a slot rather than drawing a glyph.
- **Scores.** Expansion 2, drift 1. The verifier lowered expansion from 3.
- **Tag.** new.
- **Fix.** B-32.

### Shared values

#### Overlay gutter and width caps, 16 literals

`--overlay-gutter` covers 9 literals and `--overlay-width-*` covers 7. The uses are `src/css/components/dialog.css:11` (`min(32rem, 100% - 2rem)`), `src/css/components/dialog.css:12` (`100dvh - 2rem`), `src/css/components/popover.css:33` (`100dvh - 2rem`), `src/css/components/popover.css:45` (`min(18rem, 100vw - 2rem)`), the parked hover card at `src/css/components/popover.css:46` (`min(20rem, 100vw - 2rem)`), the parked tooltip at `src/css/components/popover.css:50` (`min(18rem, 100vw - 2rem)`), `src/css/components/menu.css:12` (`min(20rem, 100vw - 2rem)`), `src/css/components/toast.css:10` (`min(22rem, 100vw - 2rem)`), and `src/css/components/sheet.css:26` (`min(24rem, 100% - 3rem)`).

##### CSS-02. Each overlay writes its own gutter and width cap

- **Rule.** 6. The plan names the dialog and sheet pair as its rule 6 example.
- **Evidence.** The 2rem gutter is written 8 times across 4 files and spelled with `100vw`, `100%`, or `100dvh`. Sheet uses 3rem with no comment. The width caps are 18, 20, 22, 24, and 32rem with no named steps.
- **Verdict.** CONFIRMED.
- **Scores.** Expansion 2, drift 1. The verifier lowered expansion from 3, because only a new overlay copies it.
- **Tag.** new.
- **Fix.** B-27.

#### Overlay enter motion, 7 literals

`--overlay-enter-scale` covers `src/css/components/dialog.css:23` (`scale: 0.96`), `src/css/components/dialog.css:40` (`scale: 0.96`), `src/css/components/popover.css:67` (`scale: 0.96`), and `src/css/components/popover.css:82` (`scale: 0.96`). `--overlay-enter-offset` covers `src/css/components/dialog.css:24` (`0.5rem`), `src/css/components/dialog.css:41` (`0.5rem`), and `src/css/components/toast.css:53` (`0.75rem`). The offset rows came from the classifier only.

##### CSS-M1. The overlay enter scale is the same literal in two files

- **Rule.** 6.
- **Evidence.** The four `scale: 0.96` lines above. The popover rule also covers menu, hover card, and tooltip.
- **Verdict.** CONFIRMED. Found by the CSS verifier and checked against the source.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-27.

#### Target-size floor, 4 literals

`--target-min` covers `src/css/components/choice.css:12` (`24px`), `src/css/components/menu.css:21` (`24px`), `src/css/components/table.css:98` (`24px`), and `src/css/components/slider.css:34` (`24px`).

##### CSS-06. The 24px target floor repeats outside `--control-height`

- **Rule.** 6. The plan's spec-floor exception covers the 24px inside `--control-height` only (`src/css/foundations.css:53` (`max(24px, calc(2.5rem * var(--density)))`)).
- **Evidence.** The four uses above. Menu also sets a 2.25rem height between the 2rem and 2.5rem control heights (`src/css/components/menu.css:21` (`2.25rem`)).
- **Verdict.** CONFIRMED.
- **Scores.** Expansion 2, drift 1. The verifier lowered expansion from 3, because a full control already reads `--control-height`.
- **Tag.** new.
- **Fix.** B-32.

#### Disabled opacity, 5 literals

`--disabled-opacity` covers `src/css/components/button.css:86` (`0.55`), `src/css/components/choice.css:26` (`0.55`), `src/css/components/slider.css:44` (`0.55`), `src/css/components/tabs.css:82` (`0.55`), and `src/css/components/field.css:113` (`0.7`).

##### CSS-07. Disabled strength differs by component, and two hover rules skip the disabled guard

- **Rule.** 6, and the consistency check on how states are hooked.
- **Evidence.** Four components dim to 0.55 and field dims to 0.7 with no comment, the uses above. Button and menu skip hover on disabled items (`src/css/components/button.css:66` (`:not([aria-disabled="true"], :disabled)`), `src/css/components/menu.css:43` (`:not(:disabled, [aria-disabled="true"])`)), and menu records why it dims by color (`src/css/components/menu.css:77` (`aria-disabled items stay focusable`)). Field and tab hover rules have no guard (`src/css/components/field.css:87` (`.odd-input:hover,`), `src/css/components/tabs.css:66` (`.odd-tabs [role="tab"]:hover {`)).
- **Verdict.** CONFIRMED. The verifier added disabled tab hover to the blast radius.
- **Drift.** Measured in [the drift results, "CSS-07. Disabled strength and hover guard"](consistency-tokens-drift/results.md#css-07-disabled-strength-and-hover-guard). A disabled input dims to 0.7 and a disabled button to 0.55 in all 10 cells, so those two opacities do not depend on the chrome. Hovering the disabled input moves its border to the enabled-hover color, lightness 0.55 to 0.385 in light and 0.61 to 0.78 in dark, in every chrome except bubblegum, whose control edge is already `--foreground`.
- **Scores.** Expansion 3, drift 3.
- **Tag.** new. Related known items "`odd-segmented` has no disabled styling." (`docs/follow-ups.md:64` (`has no disabled styling.`)) and "A bare `input.odd-switch` with `disabled` does not dim." (`docs/follow-ups.md:65` (`does not dim.`)).
- **Fix.** B-01.

#### Checkbox size, 6 literals

`--checkbox-size` covers `src/css/components/choice.css:17` (`1.125rem`), `src/css/components/choice.css:18` (`1.125rem`), `src/css/components/choice.css:61` (`1.125rem`), `src/css/components/choice.css:62` (`1.125rem`), `src/css/components/table.css:87` (`1.125rem`), and `src/css/components/table.css:88` (`1.125rem`). CSS-08, under icon size, is the finding.

#### Compact surface padding, 2 literals

`--surface-padding-compact` covers `src/css/components/alert.css:18` (`* 0.67`) and `src/css/components/popover.css:35` (`* 0.67`).

##### CSS-18. Compact surfaces pad two ways

- **Rule.** 6.
- **Evidence.** Alert and popover share the 0.67 factor on `--surface-padding`, which scales with density. Toast, a similar compact surface, uses fixed space steps (`src/css/components/toast.css:35` (`padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);`)).
- **Verdict.** CONFIRMED. The menu list inset is a different job, not a third formula. The density gap is 5% (`src/css/chromes/glass.css:23` (`--density: 1.05;`), `src/css/chromes/bubblegum.css:22` (`--density: 1.05;`)).
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-32.

#### Segment inset and gap, 6 literals

`--inset-tight` covers `src/css/components/choice.css:72` (`3px`), `src/css/components/tabs.css:20` (`3px`), `src/css/components/choice.css:74` (`+ 3px`), and `src/css/components/tabs.css:22` (`+ 3px`). `--segment-gap` covers `src/css/components/choice.css:70` (`gap: 2px`) and `src/css/components/tabs.css:19` (`gap: 2px`).

##### CSS-19. Nested radius arithmetic has no shared form

- **Rule.** 6.
- **Evidence.** Segmented and tabs pair `padding: 3px` with `calc(var(--radius-control) + 3px)`, the uses above. The select picker uses the same outer-equals-inner-plus-padding idea with a space token (`src/css/components/field.css:150` (`calc(var(--radius-control) + var(--space-1))`)).
- **Verdict.** CONFIRMED. The log's clamp is a different job (`src/css/components/log.css:20` (`min(var(--radius-surface), var(--space-3))`)). The verifier folded the 3px pair into CSS-04, the duplicated segmented and tab list rules in section 4.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-11.

#### Default avatar size, 2 literals

`--avatar-size` covers `src/css/components/avatar.css:10` (`calc(2.5rem * var(--density))`) and `src/css/components/skeleton.css:20` (`calc(2.5rem * var(--density))`).

##### CSS-M2. The skeleton copies the default avatar size

- **Rule.** 6. The density-scaled private-size exception does not cover a value two components share.
- **Evidence.** The two uses above.
- **Verdict.** CONFIRMED. Found by the CSS verifier and checked against the source.
- **Scores.** Expansion 1, drift 1.
- **Tag.** new. Related known item "The avatar skeleton matches only the default avatar size." (`docs/follow-ups.md:80` (`matches only the default avatar size.`)).
- **Fix.** B-32.

#### Input inset factor, 4 literals

`--input-padding-inline` covers `src/css/components/field.css:62` (`* 0.85`), `src/css/components/field.css:137` (`0.85`), `src/css/components/search.css:18` (`* 0.85`), and `src/css/components/search.css:27` (`* 0.85`).

##### CSS-M4. Field and search share an untokened inset factor

- **Rule.** 6.
- **Evidence.** The uses above. The search icon inset exists to line up with the field's padding.
- **Verdict.** CONFIRMED. Found by the CSS verifier and checked against the source.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-32.

#### Forced-colors widths, 7 literals

`--forced-hairline` covers `src/css/components/meter.css:129` (`1px solid CanvasText`), `src/css/components/popover.css:112` (`1px solid CanvasText`), `src/css/components/skeleton.css:33` (`1px solid GrayText`), `src/css/components/slider.css:123` (`1px solid CanvasText`), and `src/css/components/slider.css:125` (`1px`). `--forced-selected-outline` covers `src/css/components/choice.css:132` (`2px solid Highlight`) and `src/css/components/tabs.css:91` (`2px solid Highlight`). CSS-17, under the chrome-owned border width below, is the finding.

#### Loop easing, 2 literals

`--ease-loop` covers `src/css/components/meter.css:82` (`ease-in-out`) and `src/css/components/skeleton.css:16` (`ease-in-out`).

##### CSS-13. Looping animations and reduced motion follow three policies

- **Rule.** 2 (easing is chrome-owned), and the consistency check on motion through `--duration-*` and `--ease`.
- **Evidence.** The spinner runs on a literal 700ms and slows through its own media block (`src/css/components/button.css:106` (`odd-spin 700ms linear infinite`), `src/css/components/button.css:115` (`animation-duration: 2.4s;`)). Meter and skeleton derive from `--duration-slow` with `ease-in-out`, so `preferences.css` stops them (`src/css/preferences.css:27` (`--duration-fast: 0ms;`)). Dialog clears scale and translate under reduced motion (`src/css/components/dialog.css:80` (`prefers-reduced-motion: reduce`)), and sheet does not. Both backdrops omit a timing function (`src/css/components/dialog.css:45` (`.odd-dialog::backdrop {`), `src/css/components/sheet.css:101` (`.odd-sheet::backdrop {`)).
- **Verdict.** CONFIRMED. `ease-in-out` is a plausible loop choice because several `--ease` curves overshoot, and no comment records it.
- **Scores.** Expansion 2, drift 2. The verifier raised drift from 1, because the policies disagree under reduced motion. Nothing was rendered.
- **Tag.** new.
- **Fix.** B-15.

#### Shared names with no finding

No seam reviewer raised these, and no verifier read them. They carry no verdict. A related fix can absorb them as extra lines.

- `--tone-edge-mix` covers `src/css/components/alert.css:19` (`45%`), `src/css/components/avatar.css:18` (`40%`), and `src/css/components/badge.css:14` (`35%`). B-10 can absorb it.
- `--tone-dot-size` covers `src/css/components/badge.css:29` (`0.5em`), `src/css/components/badge.css:30` (`0.5em`), `src/css/components/toast.css:84` (`0.5rem`), and `src/css/components/toast.css:85` (`0.5rem`). B-10 can absorb it.
- `--icon-gap` covers `src/css/components/badge.css:12` (`0.4em`), `src/css/components/button.css:16` (`0.5em`), and `src/css/components/table.css:97` (`0.35em`). B-32 can absorb it.
- `--underline-offset` covers `src/css/base.css:48` (`0.2em`) and `src/css/components/button.css:123` (`0.4em`). `--underline-strong` covers `src/css/base.css:53` (`2px`) and `src/css/components/button.css:122` (`2px`). B-32 can absorb both.
- `.odd-visually-hidden` covers `src/css/components/choice.css:80` (`1px`), `src/css/components/choice.css:81` (`1px`), and `src/css/components/choice.css:83` (`50%`), which copy the utility in `base.css`. B-32 can absorb it.
- `--overlay-enter-offset`, listed under overlay enter motion. B-27 can absorb it.

### Chrome-owned values

#### Focus ring, 8 literals

`--focus-offset` covers `src/css/components/choice.css:127` (`outline-offset: 1px;`), `src/css/components/tabs.css:77` (`outline-offset: 1px;`), and `src/css/components/estop.css:52` (`outline-offset: 4px;`). `--focus-width` covers `src/css/components/estop.css:51` (`calc(var(--focus-width) + 2px)`). `--focus-glow` covers `src/css/components/slider.css:71` (`0 0 0 4px`) and `src/css/components/slider.css:96` (`0 0 0 4px`), two literals each. The scanner does not count a bare 0, so `src/css/components/field.css:96` (`outline-offset: 0;`) has no row.

##### CSS-03. Focus ring geometry is overridden per component, and the glow reaches two controls

- **Rule.** 2 (focus ring geometry is chrome-owned), and the consistency check on focus styling through `--focus-*`.
- **Evidence.** The global rule reads the chrome (`src/css/base.css:57-58` (`outline-offset: var(--focus-offset);`)). The uses above replace the offset with literals, add 2px to the e-stop's width, and draw the slider halo in `--ring` instead of `--focus-glow`. Only button, card, and field add the glow (`src/css/components/button.css:81` (`var(--focus-glow)`), `src/css/components/card.css:38` (`var(--focus-glow)`), `src/css/components/field.css:98` (`var(--focus-glow)`)). The chromes set the offset to 2px or 3px (`src/css/chromes/calm.css:37` (`--focus-offset: 2px;`), `src/css/chromes/glass.css:40` (`--focus-offset: 3px;`), `src/css/chromes/bubblegum.css:34` (`--focus-offset: 3px;`)), and only glass and expressive draw a glow (`src/css/chromes/glass.css:41` (`--focus-glow: 0 0 0 6px`), `src/css/chromes/expressive.css:42` (`--focus-glow: 0 0 12px`)). Menu already writes its inset as arithmetic on the token (`src/css/components/menu.css:49` (`calc(var(--focus-width) * -1)`)).
- **Verdict.** CONFIRMED.
- **Drift.** Measured in [the drift results, "CSS-03. Focus ring halo and offset"](consistency-tokens-drift/results.md#css-03-focus-ring-halo-and-offset). Under glass and expressive, only the button and the input carry the glow. The segmented item, tab, menu item, switch, disclosure summary, e-stop, and slider carry none, in both modes. Segmented and tab stay at a 1px offset in every chrome against 2px and 3px tokens. The input stays at 0px. The e-stop stays at 4px with a width of the token plus 2px. The slider halo is always `--ring` at 30% and 4px, so under bubblegum light the ring hue sits beside a foreground-colored outline.
- **Scores.** Expansion 3, drift 3.
- **Tag.** new.
- **Fix.** B-02.

#### Border width, 8 literals

`--border-width` covers the switch thumb geometry at `src/css/components/choice.css:43` (`left 1px center`) and `src/css/components/choice.css:53` (`right 1px center`), three literals each, and the slider thumb at `src/css/components/slider.css:64` (`border: 2px solid var(--primary);`) and `src/css/components/slider.css:89` (`border: 2px solid var(--primary);`).

##### CSS-15. The switch thumb assumes a 1px border

- **Rule.** 2 (border width is chrome-owned).
- **Evidence.** The track border reads the chrome (`src/css/components/choice.css:39` (`border: var(--border-width) solid`)), while the thumb's 1px offset and 4px inset are fixed, the uses above. Bubblegum's border is 2px (`src/css/chromes/bubblegum.css:16` (`--border-width: 2px;`)), and `src/css/base.css:4` (`box-sizing: border-box;`) makes the padding box shrink with it.
- **Verdict.** CONFIRMED.
- **Drift.** Measured in [the drift results, "CSS-15. Switch thumb inset"](consistency-tokens-drift/results.md#css-15-switch-thumb-inset). The gap between thumb and track border is 1px in calm, glass, expressive, and darkmatter, and -0.01px in bubblegum, where a 21.2px thumb sits in a 21.19px padding box.
- **Scores.** Expansion 1, drift 3.
- **Tag.** new.
- **Fix.** B-18.

##### CSS-17. The slider thumb ignores `--border-width`, and forced-colors widths have no tokens

- **Rule.** 2 (border width) for the thumb, and 6 for the forced-colors widths.
- **Evidence.** The slider thumb uses above, and the forced-colors widths listed under shared values. Every other structural border reads `--border-width`. The e-stop's 0.5rem collar is component geometry and is excluded (`src/css/components/estop.css:19` (`border: 0.5rem solid var(--warning);`)).
- **Verdict.** CONFIRMED.
- **Drift.** Measured for the thumb in [the drift results, "CSS-17. Slider thumb border"](consistency-tokens-drift/results.md#css-17-slider-thumb-border). The thumb border is 2px in all 10 cells, twice the chrome's 1px border in calm, glass, expressive, and darkmatter. The forced-colors lines have no visual effect outside forced colors.
- **Scores.** Expansion 2, drift 3.
- **Tag.** new.
- **Fix.** B-08.

#### Press transform, 1 literal

`--press-transform` covers `src/css/components/estop.css:46` (`transform: scale(0.95);`).

##### CSS-14. The e-stop presses with a fixed scale, and card transitions a transform it never sets

- **Rule.** 2 (press motion is chrome-owned).
- **Evidence.** Button presses with the chrome token (`src/css/components/button.css:76` (`transform: var(--press-transform);`)), which reduced motion turns off (`src/css/preferences.css:26` (`--press-transform: none;`)). The e-stop sets `scale(0.95)` for `:active` and the latched state, the use above. Card lists `transform` in its transitions, and no rule sets one (`src/css/components/card.css:19` (`transition-property: box-shadow, border-color, transform;`)).
- **Verdict.** CONFIRMED.
- **Drift.** Measured in [the drift results, "CSS-14. E-stop press"](consistency-tokens-drift/results.md#css-14-e-stop-press). The e-stop presses to `scale(0.95)` in all 10 cells. The button follows the token, 0.98 in calm, 0.97 in glass and expressive, 0.99 in darkmatter, and `translate(3px, 3px)` in bubblegum. Under reduced motion the button stops moving and the e-stop still scales.
- **Scores.** Expansion 2, drift 3.
- **Tag.** new.
- **Fix.** B-05.

#### Shadow, 3 literals

`--shadow-*` covers `src/css/components/avatar.css:48` (`0 0 0 2px var(--background)`) and the e-stop's latched shading at `src/css/components/estop.css:47` (`inset 0 0.5rem 1rem`), two literals. The rim artwork at `src/css/components/estop.css:23` (`var(--shadow-control)`) and `src/css/components/estop.css:41` (`var(--shadow-control-hover)`) is not a finding, because it is layered before the chrome shadow, and the verdicts file labels those rows `none`.

##### CSS-16. Grouped avatars drop the chrome shadow for a page-colored ring

- **Rule.** Theme and chrome drift (overrides `--shadow-control`).
- **Evidence.** A lone avatar wears the chrome shadow (`src/css/components/avatar.css:22` (`box-shadow: var(--shadow-control);`)). The group rule replaces it, the use above. Bubblegum's control shadow is a hard offset (`src/css/chromes/bubblegum.css:24` (`--shadow-control: 3px 3px 0 var(--foreground);`)), and expressive's is a glow (`src/css/chromes/expressive.css:25` (`--shadow-control: 0 0 2px`)). The comment records the ring color, not the dropped shadow.
- **Verdict.** CONFIRMED.
- **Drift.** Measured for the shadow in [the drift results, "CSS-16. Grouped avatar shadow and ring"](consistency-tokens-drift/results.md#css-16-grouped-avatar-shadow-and-ring). In every chrome the grouped avatar's shadow is only the 2px ring, so bubblegum's `3px 3px 0` offset and expressive's 2px and 8px glow are gone. The ring on a surface was inconclusive, because no story renders a group inside a card.
- **Scores.** Expansion 1, drift 3.
- **Tag.** new.
- **Fix.** B-19.

##### CSS-L2. The latched e-stop drops the chrome's active shadow

- **Rule.** 2 (shadow is chrome-owned).
- **Evidence.** The pressed button reads the chrome role (`src/css/components/button.css:77` (`box-shadow: var(--shadow-control-active);`)), and each chrome sets it (`src/css/chromes/calm.css:27` (`--shadow-control-active: var(--shadow-control);`), `src/css/chromes/bubblegum.css:26` (`--shadow-control-active: 0 0 0 var(--foreground);`)). The e-stop's `:active` and latched rule replaces the whole shadow with its rim and an inset shade, the use above, so no chrome shadow remains while it is pressed or latched. Under calm, a pressed button keeps its control shadow and a pressed e-stop loses it.
- **Verdict.** CONFIRMED by the source. The classifier marked this line chrome-owned, and the CSS seam reviewer called it glyph geometry. The lead sided with the classifier during the report review.
- **Scores.** Expansion 2, because a new pressable or latching control that copies the e-stop would drop the active shadow too. Drift 2 (latent), because the CSS-14 sweep recorded only `transform` for the held e-stop.
- **Tag.** new.
- **Fix.** B-05.

#### Heading weight

No chrome-kind row exists here. The literal is the 600 at `src/css/components/disclosure.css:18` (`600`), which the font-weight scale lists.

##### CSS-11. The disclosure summary takes three heading tokens and fixes the weight

- **Rule.** Theme and chrome drift (ignores `--heading-weight`).
- **Evidence.** The summary reads the heading font, case, and tracking (`src/css/components/disclosure.css:17` (`var(--font-heading)`)) and sets `font-weight: 600`. The card title reads the chrome weight (`src/css/components/card.css:52` (`font-weight: var(--heading-weight);`)). Expressive is 750 and glass is 550 (`src/css/chromes/expressive.css:6` (`--heading-weight: 750;`), `src/css/chromes/glass.css:6` (`--heading-weight: 550;`)).
- **Verdict.** CONFIRMED. Darkmatter is already 600 and does not change. Calm is 650 and does (`src/css/chromes/calm.css:7` (`--heading-weight: 650;`)).
- **Drift.** Measured in [the drift results, "CSS-11. Disclosure summary weight"](consistency-tokens-drift/results.md#css-11-disclosure-summary-weight). The summary is 600 in all 10 cells. Headings are 650, 550, 800, and 750, and match only in darkmatter. Under expressive the summary is uppercase and tracked like a heading at body-bold weight.
- **Scores.** Expansion 2, drift 3.
- **Tag.** new.
- **Fix.** B-04.

#### Label role

No chrome-kind row exists here. The literals are the tracking rows above, the uppercase at `src/css/components/estop.css:30` (`text-transform: uppercase;`) and `src/css/components/avatar.css:28` (`text-transform: uppercase;`), and the toast title's 600.

##### CSS-10. Avatar and e-stop fix their case and tracking instead of reading the label role

- **Rule.** Theme and chrome drift (ignores `--label-case` and `--label-tracking`). Rule 4 does not apply.
- **Evidence.** Avatar sets `font-family: var(--font-label)` and then fixes tracking and case (`src/css/components/avatar.css:23` (`var(--font-label)`), `src/css/components/avatar.css:27-28` (`letter-spacing: 0.02em;`)). The e-stop does the same at 0.06em (`src/css/components/estop.css:30-31` (`letter-spacing: 0.06em;`)). Expressive tracks labels at 0.08em (`src/css/chromes/expressive.css:10` (`--label-tracking: 0.08em;`)).
- **Verdict.** CONFIRMED.
- **Drift.** Measured in [the drift results, "CSS-10. Label tracking and case"](consistency-tokens-drift/results.md#css-10-label-tracking-and-case). The badge follows the chrome at 0.010em, 0, 0, 0.080em, and 0.010em. The avatar stays at 0.020em and uppercase, and the e-stop at 0.060em and uppercase, in all 10 cells. Under calm, glass, bubblegum, and darkmatter the e-stop is uppercased while `--label-case` is `none`.
- **Scores.** Expansion 2, drift 3.
- **Tag.** new. Related known item "Uppercase chromes change accessible names." (`docs/follow-ups.md:167` (`Uppercase chromes change accessible names.`)), which names the mechanism behind the e-stop's forced uppercase.
- **Fix.** B-07.

##### CSS-M3. The toast title and the stat label skip the label role

- **Rule.** Theme and chrome drift (ignores the label role).
- **Evidence.** The toast title sets `font-weight: 600` and no label tokens (`src/css/components/toast.css:74-78` (`font-weight: 600;`)). The alert title reads all three (`src/css/components/alert.css:48` (`var(--font-label)`), `src/css/components/alert.css:50` (`var(--label-case)`), `src/css/components/alert.css:51` (`var(--label-tracking)`)). Expressive sets the label case to uppercase (`src/css/chromes/expressive.css:9` (`--label-case: uppercase;`)). The stat label sets only a muted color (`src/css/components/meter.css:103` (`.odd-stat > label {`)).
- **Verdict.** CONFIRMED. Found by the CSS verifier and checked against the source.
- **Scores.** Expansion 2, drift 2 (latent, not rendered).
- **Tag.** new.
- **Fix.** B-07.

#### Chrome-owned literals in stories

##### DOC-07. The Contrast story draws its table and samples with border and radius literals

- **Rule.** 2 (border width and radius are chrome-owned).
- **Evidence.** `stories/Foundations.stories.ts:41` (`border-block-start: 1px solid var(--border)`), `stories/Foundations.stories.ts:46` (`border-radius: 6px; border: 3px solid`), and `stories/Foundations.stories.ts:47` (`box-shadow: inset 0 0 0 1px var(--border)`). Bubblegum sets a 2px border and a 3px focus width, and calm sets 1px and 2px. No chrome's radius token is 6px.
- **Verdict.** CONFIRMED. `--radius-chip` is a pill in all five chromes, so the small radius role is `--radius-control`. `odd-table` is a scrollable data table and a poor fit for this matrix.
- **Scores.** Expansion 1, drift 2 (latent, not rendered).
- **Tag.** new.
- **Fix.** B-22.

### Raw color, 1 literal

`src/css/components/estop.css:12` (`black 30%`) mixes `black` into the e-stop rim. The classifier marked it `color raw black`.

#### CSS-L1. The e-stop rim mixes in a raw `black`

- **Rule.** 1 (a color other than `transparent`, `currentColor`, `inherit`, or a forced-colors system color).
- **Evidence.** `src/css/components/estop.css:12` (`--_rim: color-mix(in oklab, var(--danger), black 30%);`). The rim shade is the same black in every palette and mode, so it ignores the palette's own dark ink.
- **Verdict.** CONFIRMED by the source. The CSS seam reviewer had left the literal to the scanner as an exception. No plan exception covers a raw color, so the lead made it a finding during the report review.
- **Scores.** Expansion 1, because only the e-stop draws a rim. Drift 2 (latent), because no render compared the rim across palettes.
- **Tag.** new.
- **Fix.** B-05.

<!-- audit:stats -->

366 literals in 46 files, 311 distinct (file, property, value) keys.

| Category | Literals |
| --- | --- |
| color | 14 |
| spacing | 30 |
| size | 166 |
| radius | 9 |
| border-width | 22 |
| font-size | 3 |
| font-weight | 24 |
| tracking | 4 |
| line-height | 7 |
| shadow | 15 |
| motion | 29 |
| focus | 7 |
| other | 36 |

| Verdict | Literals |
| --- | --- |
| chrome | 20 |
| color | 1 |
| exception | 50 |
| missing-scale | 44 |
| none | 125 |
| shared | 78 |
| story | 48 |

`none` means no rule in the plan applies, so the literal is not a finding.

| Token graph | Count |
| --- | --- |
| References with no definition | 0 |
| ... of which have no fallback | 0 |
| Public tokens nothing reads | 12 |
| Palette tokens defined outside palettes and foundations | 7 |
| Chrome tokens defined outside chromes | 13 |
| Public custom properties in component files | 6 |
| Components in the matrix | 26 |

<!-- /audit:stats -->

<!-- audit:literals -->

### Color (14)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| color | `src/css/base.css:62` | `background` | `30%` |  | none one-off value |
| color | `src/css/components/alert.css:19` | `border` | `45%` |  | shared --tone-edge-mix |
| color | `src/css/components/alert.css:37` | `color` | `70%` |  | none one-off value |
| color | `src/css/components/avatar.css:18` | `border` | `40%` |  | shared --tone-edge-mix |
| color | `src/css/components/badge.css:14` | `border` | `35%` |  | shared --tone-edge-mix |
| color | `src/css/components/button.css:67` | `background-color` | `88%` |  | none one-off value |
| color | `src/css/components/button.css:71` | `background-color` | `8%` |  | none one-off value |
| color | `src/css/components/button.css:121` | `background-color` | `10%` |  | none one-off value |
| color | `src/css/components/choice.css:31` | `--_track` | `45%` |  | none one-off value |
| color | `src/css/components/choice.css:39` | `border` | `60%` |  | none one-off value |
| color | `src/css/components/estop.css:12` | `--_rim` | `black` |  | color raw black |
| color | `src/css/components/estop.css:12` | `--_rim` | `30%` |  | none one-off value |
| color | `src/css/components/field.css:90` | `border-color` | `50%` |  | none one-off value |
| color | `src/css/components/table.css:63` | `background` | `55%` |  | none one-off value |

### Spacing (30)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| spacing | `src/css/base.css:48` | `text-underline-offset` | `0.2em` |  | shared --underline-offset |
| spacing | `src/css/components/alert.css:18` | `padding` | `0.67` |  | shared --surface-padding-compact |
| spacing | `src/css/components/alert.css:36` | `margin-block-start` | `0.05em` |  | exception glyph geometry |
| spacing | `src/css/components/avatar.css:51` | `margin-inline-start` | `-0.2` |  | none one-off value |
| spacing | `src/css/components/badge.css:12` | `gap` | `0.4em` |  | shared --icon-gap |
| spacing | `src/css/components/badge.css:13` | `padding` | `0.2em` |  | none one-off value |
| spacing | `src/css/components/badge.css:13` | `padding` | `0.65em` |  | none one-off value |
| spacing | `src/css/components/button.css:16` | `gap` | `0.5em` |  | shared --icon-gap |
| spacing | `src/css/components/button.css:53` | `padding-inline` | `0.75` |  | none one-off value |
| spacing | `src/css/components/button.css:58` | `padding-inline` | `1.4` |  | none one-off value |
| spacing | `src/css/components/button.css:123` | `text-underline-offset` | `0.4em` |  | shared --underline-offset |
| spacing | `src/css/components/choice.css:70` | `gap` | `2px` |  | shared --segment-gap |
| spacing | `src/css/components/choice.css:72` | `padding` | `3px` |  | shared --inset-tight |
| spacing | `src/css/components/field.css:62` | `padding` | `0.85` |  | shared --input-padding-inline |
| spacing | `src/css/components/field.css:119` | `padding-inline-end` | `2.5rem` |  | exception glyph geometry |
| spacing | `src/css/components/field.css:137` | `padding-inline-end` | `0.85` |  | shared --input-padding-inline |
| spacing | `src/css/components/log.css:33` | `padding` | `0.0625rem` |  | none one-off value |
| spacing | `src/css/components/popover.css:35` | `padding` | `0.67` |  | shared --surface-padding-compact |
| spacing | `src/css/components/search.css:17` | `inset-block-start` | `50%` |  | none intrinsic value |
| spacing | `src/css/components/search.css:18` | `inset-inline-start` | `0.85` |  | shared --input-padding-inline |
| spacing | `src/css/components/search.css:27` | `padding-inline-start` | `0.85` |  | shared --input-padding-inline |
| spacing | `src/css/components/search.css:27` | `padding-inline-start` | `1.5rem` | `--space-5` | missing-scale icon-size |
| spacing | `src/css/components/table.css:97` | `gap` | `0.35em` |  | shared --icon-gap |
| spacing | `src/css/components/tabs.css:19` | `gap` | `2px` |  | shared --segment-gap |
| spacing | `src/css/components/tabs.css:20` | `padding` | `3px` |  | shared --inset-tight |
| spacing | `stories/Foundations.stories.ts:47` | `padding` | `0.15em` |  | story contrast swatch padding |
| spacing | `stories/Foundations.stories.ts:47` | `padding` | `0.6em` |  | story contrast swatch padding |
| spacing | `stories/Showcase.stories.ts:43` | `padding` | `1rem` | `--space-4` | story page padding floor |
| spacing | `stories/Showcase.stories.ts:43` | `padding` | `4vw` |  | story page padding fluid term |
| spacing | `stories/Showcase.stories.ts:43` | `padding` | `3rem` | `--space-8` | story page padding cap |

### Size (166)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| size | `src/css/base.css:15` | `min-block-size` | `100dvh` |  | none intrinsic value |
| size | `src/css/base.css:49` | `text-decoration-thickness` | `1px` |  | none one-off value |
| size | `src/css/base.css:53` | `text-decoration-thickness` | `2px` |  | shared --underline-strong |
| size | `src/css/base.css:76` | `inline-size` | `1px` |  | none intrinsic value |
| size | `src/css/base.css:77` | `block-size` | `1px` |  | none intrinsic value |
| size | `src/css/components/alert.css:34` | `inline-size` | `1.25rem` |  | missing-scale icon-size |
| size | `src/css/components/alert.css:35` | `block-size` | `1.25rem` |  | missing-scale icon-size |
| size | `src/css/components/avatar.css:10` | `--_size` | `2.5rem` |  | shared --avatar-size |
| size | `src/css/components/avatar.css:32` | `--_size` | `2rem` | `--space-6` | exception density-scaled private size |
| size | `src/css/components/avatar.css:33` | `--_size` | `3.5rem` |  | exception density-scaled private size |
| size | `src/css/components/avatar.css:36` | `inline-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/avatar.css:37` | `block-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/badge.css:29` | `inline-size` | `0.5em` |  | shared --tone-dot-size |
| size | `src/css/components/badge.css:30` | `block-size` | `0.5em` |  | shared --tone-dot-size |
| size | `src/css/components/button.css:91` | `inline-size` | `1.15em` |  | missing-scale icon-size |
| size | `src/css/components/button.css:92` | `block-size` | `1.15em` |  | missing-scale icon-size |
| size | `src/css/components/button.css:101` | `inline-size` | `1em` |  | exception glyph geometry |
| size | `src/css/components/button.css:102` | `block-size` | `1em` |  | exception glyph geometry |
| size | `src/css/components/button.css:122` | `text-decoration` | `2px` |  | shared --underline-strong |
| size | `src/css/components/choice.css:12` | `min-block-size` | `24px` |  | shared --target-min |
| size | `src/css/components/choice.css:17` | `inline-size` | `1.125rem` |  | shared --checkbox-size |
| size | `src/css/components/choice.css:18` | `block-size` | `1.125rem` |  | shared --checkbox-size |
| size | `src/css/components/choice.css:32` | `--_size` | `1.5rem` | `--space-5` | exception density-scaled private size |
| size | `src/css/components/choice.css:36` | `inline-size` | `1.75` |  | none one-off value |
| size | `src/css/components/choice.css:42` | `background` | `92%` |  | none intrinsic value |
| size | `src/css/components/choice.css:42` | `background` | `100%` |  | none intrinsic value |
| size | `src/css/components/choice.css:43` | `background` | `1px` |  | chrome --border-width |
| size | `src/css/components/choice.css:43` | `background` | `4px` |  | chrome --border-width |
| size | `src/css/components/choice.css:43` | `background` | `4px` |  | chrome --border-width |
| size | `src/css/components/choice.css:52` | `background` | `92%` |  | none intrinsic value |
| size | `src/css/components/choice.css:52` | `background` | `100%` |  | none intrinsic value |
| size | `src/css/components/choice.css:53` | `background` | `1px` |  | chrome --border-width |
| size | `src/css/components/choice.css:53` | `background` | `4px` |  | chrome --border-width |
| size | `src/css/components/choice.css:53` | `background` | `4px` |  | chrome --border-width |
| size | `src/css/components/choice.css:61` | `inline-size` | `1.125rem` |  | shared --checkbox-size |
| size | `src/css/components/choice.css:62` | `block-size` | `1.125rem` |  | shared --checkbox-size |
| size | `src/css/components/choice.css:80` | `inline-size` | `1px` |  | shared .odd-visually-hidden |
| size | `src/css/components/choice.css:81` | `block-size` | `1px` |  | shared .odd-visually-hidden |
| size | `src/css/components/dialog.css:11` | `inline-size` | `32rem` |  | shared --overlay-width-* |
| size | `src/css/components/dialog.css:11` | `inline-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/dialog.css:11` | `inline-size` | `2rem` | `--space-6` | shared --overlay-gutter |
| size | `src/css/components/dialog.css:12` | `max-block-size` | `40rem` |  | none one-off value |
| size | `src/css/components/dialog.css:12` | `max-block-size` | `100dvh` |  | none intrinsic value |
| size | `src/css/components/dialog.css:12` | `max-block-size` | `2rem` | `--space-6` | shared --overlay-gutter |
| size | `src/css/components/disclosure.css:32` | `inline-size` | `0.55rem` |  | exception glyph geometry |
| size | `src/css/components/disclosure.css:33` | `block-size` | `0.55rem` |  | exception glyph geometry |
| size | `src/css/components/estop.css:16` | `inline-size` | `8rem` |  | none one-off value |
| size | `src/css/components/field.css:48` | `inline-size` | `1.25em` |  | exception glyph geometry |
| size | `src/css/components/field.css:49` | `block-size` | `1.25em` |  | exception glyph geometry |
| size | `src/css/components/field.css:60` | `inline-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/field.css:76` | `min-block-size` | `2.5` |  | none one-off value |
| size | `src/css/components/field.css:123` | `background-position` | `1.15rem` |  | exception glyph geometry |
| size | `src/css/components/field.css:123` | `background-position` | `0.8rem` |  | exception glyph geometry |
| size | `src/css/components/field.css:124` | `background-size` | `0.35rem` |  | exception glyph geometry |
| size | `src/css/components/field.css:124` | `background-size` | `0.35rem` |  | exception glyph geometry |
| size | `src/css/components/log.css:15` | `max-block-size` | `20rem` |  | none one-off value |
| size | `src/css/components/menu.css:10` | `min-inline-size` | `12rem` |  | none one-off value |
| size | `src/css/components/menu.css:12` | `max-inline-size` | `20rem` |  | shared --overlay-width-* |
| size | `src/css/components/menu.css:12` | `max-inline-size` | `100vw` |  | none intrinsic value |
| size | `src/css/components/menu.css:12` | `max-inline-size` | `2rem` | `--space-6` | shared --overlay-gutter |
| size | `src/css/components/menu.css:20` | `inline-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/menu.css:21` | `min-block-size` | `24px` |  | shared --target-min |
| size | `src/css/components/menu.css:21` | `min-block-size` | `2.25rem` |  | none one-off value |
| size | `src/css/components/menu.css:37` | `inline-size` | `1rem` | `--space-4` | missing-scale icon-size |
| size | `src/css/components/menu.css:38` | `block-size` | `1rem` | `--space-4` | missing-scale icon-size |
| size | `src/css/components/menu.css:58` | `inline-size` | `1rem` | `--space-4` | missing-scale icon-size |
| size | `src/css/components/meter.css:20` | `inline-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/meter.css:21` | `block-size` | `0.5rem` | `--space-2` | exception density-scaled private size |
| size | `src/css/components/meter.css:47` | `block-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/meter.css:55` | `block-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/meter.css:80` | `background` | `40%` |  | none one-off value |
| size | `src/css/components/meter.css:80` | `background` | `100%` |  | none intrinsic value |
| size | `src/css/components/meter.css:92` | `background-position` | `-70%` |  | none intrinsic value |
| size | `src/css/components/meter.css:93` | `background-position` | `170%` |  | none intrinsic value |
| size | `src/css/components/popover.css:33` | `max-block-size` | `100dvh` |  | none intrinsic value |
| size | `src/css/components/popover.css:33` | `max-block-size` | `2rem` | `--space-6` | shared --overlay-gutter |
| size | `src/css/components/popover.css:45` | `inline-size` | `18rem` |  | shared --overlay-width-* |
| size | `src/css/components/popover.css:45` | `inline-size` | `100vw` |  | none intrinsic value |
| size | `src/css/components/popover.css:45` | `inline-size` | `2rem` | `--space-6` | shared --overlay-gutter |
| size | `src/css/components/popover.css:46` | `inline-size` | `20rem` |  | shared --overlay-width-* |
| size | `src/css/components/popover.css:46` | `inline-size` | `100vw` |  | none intrinsic value |
| size | `src/css/components/popover.css:46` | `inline-size` | `2rem` | `--space-6` | shared --overlay-gutter |
| size | `src/css/components/popover.css:50` | `max-inline-size` | `18rem` |  | shared --overlay-width-* |
| size | `src/css/components/popover.css:50` | `max-inline-size` | `100vw` |  | none intrinsic value |
| size | `src/css/components/popover.css:50` | `max-inline-size` | `2rem` | `--space-6` | shared --overlay-gutter |
| size | `src/css/components/range-field.css:25` | `flex` | `8rem` |  | none one-off value |
| size | `src/css/components/range-field.css:31` | `flex` | `6.5rem` |  | none one-off value |
| size | `src/css/components/search.css:19` | `inline-size` | `1rem` | `--space-4` | missing-scale icon-size |
| size | `src/css/components/search.css:20` | `block-size` | `1rem` | `--space-4` | missing-scale icon-size |
| size | `src/css/components/search.css:32` | `inline-size` | `1rem` | `--space-4` | missing-scale icon-size |
| size | `src/css/components/search.css:33` | `block-size` | `1rem` | `--space-4` | missing-scale icon-size |
| size | `src/css/components/separator.css:19` | `min-block-size` | `1em` |  | none intrinsic value |
| size | `src/css/components/sheet.css:26` | `inline-size` | `24rem` |  | shared --overlay-width-* |
| size | `src/css/components/sheet.css:26` | `inline-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/sheet.css:26` | `inline-size` | `3rem` | `--space-8` | shared --overlay-gutter |
| size | `src/css/components/sheet.css:28` | `block-size` | `100dvh` |  | none intrinsic value |
| size | `src/css/components/sheet.css:64` | `inline-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/sheet.css:66` | `max-block-size` | `85dvh` |  | none one-off value |
| size | `src/css/components/shell.css:23` | `min-block-size` | `100dvh` |  | none intrinsic value |
| size | `src/css/components/shell.css:79` | `@container` | `64rem` |  | none one-off value |
| size | `src/css/components/shell.css:86` | `@container` | `40rem` |  | none one-off value |
| size | `src/css/components/skeleton.css:13` | `block-size` | `1em` |  | none intrinsic value |
| size | `src/css/components/skeleton.css:20` | `inline-size` | `2.5rem` |  | shared --avatar-size |
| size | `src/css/components/slider.css:27` | `--_thumb` | `1.25rem` |  | exception density-scaled private size |
| size | `src/css/components/slider.css:33` | `inline-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/slider.css:34` | `block-size` | `24px` |  | shared --target-min |
| size | `src/css/components/slider.css:34` | `block-size` | `0.5rem` | `--space-2` | none one-off value |
| size | `src/css/components/slider.css:54` | `background` | `100%` |  | none intrinsic value |
| size | `src/css/components/stepper.css:32` | `flex` | `5rem` |  | none one-off value |
| size | `src/css/components/stepper.css:33` | `min-inline-size` | `4rem` | `--space-10` | none one-off value |
| size | `src/css/components/table.css:25` | `inline-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/table.css:83` | `inline-size` | `1px` |  | none intrinsic value |
| size | `src/css/components/table.css:87` | `inline-size` | `1.125rem` |  | shared --checkbox-size |
| size | `src/css/components/table.css:88` | `block-size` | `1.125rem` |  | shared --checkbox-size |
| size | `src/css/components/table.css:98` | `min-block-size` | `24px` |  | shared --target-min |
| size | `src/css/components/tabs.css:61` | `inline-size` | `1rem` | `--space-4` | missing-scale icon-size |
| size | `src/css/components/tabs.css:62` | `block-size` | `1rem` | `--space-4` | missing-scale icon-size |
| size | `src/css/components/toast.css:10` | `inline-size` | `22rem` |  | shared --overlay-width-* |
| size | `src/css/components/toast.css:10` | `inline-size` | `100vw` |  | none intrinsic value |
| size | `src/css/components/toast.css:10` | `inline-size` | `2rem` | `--space-6` | shared --overlay-gutter |
| size | `src/css/components/toast.css:84` | `inline-size` | `0.5rem` | `--space-2` | shared --tone-dot-size |
| size | `src/css/components/toast.css:85` | `block-size` | `0.5rem` | `--space-2` | shared --tone-dot-size |
| size | `stories/Controls.stories.ts:42` | `inline-size` | `5rem` |  | exception story input data |
| size | `stories/Controls.stories.ts:67` | `max-inline-size` | `26rem` |  | story demo width cap |
| size | `stories/Controls.stories.ts:120` | `max-inline-size` | `30rem` |  | story demo width cap |
| size | `stories/CustomPalette.stories.ts:53` | `inline-size` | `4rem` | `--space-10` | story color input width |
| size | `stories/CustomPalette.stories.ts:57` | `inline-size` | `4rem` | `--space-10` | story color input width |
| size | `stories/CustomPalette.stories.ts:61` | `grid-template-columns` | `24rem` |  | story demo grid column minimum |
| size | `stories/Feedback.stories.ts:28` | `max-inline-size` | `40rem` |  | story demo width cap |
| size | `stories/Feedback.stories.ts:29` | `max-block-size` | `12rem` |  | exception story input data |
| size | `stories/Foundations.stories.ts:33` | `inline-size` | `100%` |  | none intrinsic value |
| size | `stories/Foundations.stories.ts:46` | `inline-size` | `2.4em` |  | story contrast swatch size |
| size | `stories/Foundations.stories.ts:46` | `block-size` | `1.5em` |  | story contrast swatch size |
| size | `stories/Foundations.stories.ts:70` | `grid-template-columns` | `26rem` |  | story demo grid column minimum |
| size | `stories/Foundations.stories.ts:91` | `grid-template-columns` | `12rem` |  | story demo grid column minimum |
| size | `stories/Foundations.stories.ts:94` | `block-size` | `6rem` |  | story palette swatch height |
| size | `stories/Foundations.stories.ts:102` | `max-inline-size` | `48rem` |  | story demo width cap |
| size | `stories/Foundations.stories.ts:123` | `max-inline-size` | `48rem` |  | story demo width cap |
| size | `stories/Layout.stories.ts:65` | `max-block-size` | `8rem` |  | exception story input data |
| size | `stories/Overlays.stories.ts:50` | `max-inline-size` | `36rem` |  | story demo width cap |
| size | `stories/Showcase.stories.ts:31` | `inline-size` | `1.15em` |  | story logo icon size |
| size | `stories/Showcase.stories.ts:31` | `block-size` | `1.15em` |  | story logo icon size |
| size | `stories/Showcase.stories.ts:42` | `min-block-size` | `100dvh` |  | none intrinsic value |
| size | `stories/Showcase.stories.ts:46` | `max-inline-size` | `72rem` |  | story page width cap |
| size | `stories/Showcase.stories.ts:59` | `max-inline-size` | `44rem` |  | story demo width cap |
| size | `stories/Showcase.stories.ts:78` | `grid-template-columns` | `16rem` |  | story demo grid column minimum |
| size | `stories/Showcase.stories.ts:87` | `grid-template-columns` | `16rem` |  | story demo grid column minimum |
| size | `stories/Showcase.stories.ts:149` | `grid-template-columns` | `18rem` |  | story demo grid column minimum |
| size | `stories/mirrored/Alert.stories.ts:20` | `max-inline-size` | `40rem` |  | story demo width cap |
| size | `stories/mirrored/Card.stories.ts:20` | `grid-template-columns` | `17rem` |  | story demo grid column minimum |
| size | `stories/mirrored/Disclosure.stories.ts:26` | `max-inline-size` | `36rem` |  | story demo width cap |
| size | `stories/mirrored/Field.stories.ts:20` | `max-inline-size` | `26rem` |  | story demo width cap |
| size | `stories/mirrored/Field.stories.ts:72` | `max-inline-size` | `26rem` |  | story demo width cap |
| size | `stories/mirrored/Meter.stories.ts:38` | `max-inline-size` | `28rem` |  | story demo width cap |
| size | `stories/mirrored/Search.stories.ts:20` | `max-inline-size` | `26rem` |  | story demo width cap |
| size | `stories/mirrored/Separator.stories.ts:20` | `max-inline-size` | `32rem` |  | story demo width cap |
| size | `stories/mirrored/Skeleton.stories.ts:30` | `inline-size` | `70%` |  | exception story input data |
| size | `stories/mirrored/Skeleton.stories.ts:31` | `inline-size` | `40%` |  | exception story input data |
| size | `stories/mirrored/Skeleton.stories.ts:31` | `block-size` | `0.75em` |  | exception story input data |
| size | `stories/mirrored/Skeleton.stories.ts:36` | `block-size` | `5rem` |  | exception story input data |
| size | `stories/mirrored/Skeleton.stories.ts:37` | `inline-size` | `90%` |  | exception story input data |
| size | `stories/mirrored/Skeleton.stories.ts:38` | `inline-size` | `60%` |  | exception story input data |
| size | `stories/mirrored/Skeleton.stories.ts:47` | `grid-template-columns` | `17rem` |  | story demo grid column minimum |
| size | `stories/mirrored/Slider.stories.ts:21` | `max-inline-size` | `26rem` |  | story demo width cap |
| size | `stories/mirrored/Table.stories.ts:31` | `max-inline-size` | `48rem` |  | story demo width cap |
| size | `stories/mirrored/Tabs.stories.ts:32` | `max-inline-size` | `40rem` |  | story demo width cap |

### Radius (9)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| radius | `src/css/components/badge.css:31` | `border-radius` | `50%` | `--radius-*` | none intrinsic value |
| radius | `src/css/components/button.css:105` | `border-radius` | `50%` | `--radius-*` | exception glyph geometry |
| radius | `src/css/components/choice.css:74` | `border-radius` | `3px` | `--radius-*` | shared --inset-tight |
| radius | `src/css/components/estop.css:20` | `border-radius` | `50%` | `--radius-*` | none intrinsic value |
| radius | `src/css/components/field.css:50` | `border-radius` | `50%` | `--radius-*` | exception glyph geometry |
| radius | `src/css/components/tabs.css:22` | `border-radius` | `3px` | `--radius-*` | shared --inset-tight |
| radius | `src/css/components/toast.css:86` | `border-radius` | `50%` | `--radius-*` | none intrinsic value |
| radius | `stories/Foundations.stories.ts:46` | `border-radius` | `6px` | `--radius-*` | story contrast swatch radius |
| radius | `stories/Foundations.stories.ts:47` | `border-radius` | `6px` | `--radius-*` | story contrast swatch radius |

### Border-width (22)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| border-width | `src/css/components/button.css:103` | `border` | `2px` | `--border-width (= bubblegum)` | exception glyph geometry |
| border-width | `src/css/components/disclosure.css:34` | `border-inline-end` | `2px` | `--border-width (= bubblegum)` | exception glyph geometry |
| border-width | `src/css/components/disclosure.css:35` | `border-block-end` | `2px` | `--border-width (= bubblegum)` | exception glyph geometry |
| border-width | `src/css/components/estop.css:19` | `border` | `0.5rem` | `--border-width` | none one-off value |
| border-width | `src/css/components/field.css:121` | `--_stroke` | `50%` | `--border-width` | exception glyph geometry |
| border-width | `src/css/components/field.css:121` | `--_stroke` | `0.8px` | `--border-width` | exception glyph geometry |
| border-width | `src/css/components/field.css:121` | `--_stroke` | `50%` | `--border-width` | exception glyph geometry |
| border-width | `src/css/components/field.css:121` | `--_stroke` | `0.6px` | `--border-width` | exception glyph geometry |
| border-width | `src/css/components/field.css:121` | `--_stroke` | `50%` | `--border-width` | exception glyph geometry |
| border-width | `src/css/components/field.css:121` | `--_stroke` | `0.6px` | `--border-width` | exception glyph geometry |
| border-width | `src/css/components/field.css:121` | `--_stroke` | `50%` | `--border-width` | exception glyph geometry |
| border-width | `src/css/components/field.css:121` | `--_stroke` | `0.8px` | `--border-width` | exception glyph geometry |
| border-width | `src/css/components/log.css:34` | `border-inline-start` | `3px` | `--border-width` | none one-off value |
| border-width | `src/css/components/meter.css:129` | `border` | `1px` | `--border-width (= calm, darkmatter, expressive, glass)` | shared --forced-hairline |
| border-width | `src/css/components/popover.css:112` | `border` | `1px` | `--border-width (= calm, darkmatter, expressive, glass)` | shared --forced-hairline |
| border-width | `src/css/components/skeleton.css:33` | `border` | `1px` | `--border-width (= calm, darkmatter, expressive, glass)` | shared --forced-hairline |
| border-width | `src/css/components/slider.css:64` | `border` | `2px` | `--border-width (= bubblegum)` | chrome --border-width |
| border-width | `src/css/components/slider.css:89` | `border` | `2px` | `--border-width (= bubblegum)` | chrome --border-width |
| border-width | `src/css/components/slider.css:123` | `border` | `1px` | `--border-width (= calm, darkmatter, expressive, glass)` | shared --forced-hairline |
| border-width | `src/css/components/slider.css:125` | `border` | `1px` | `--border-width (= calm, darkmatter, expressive, glass)` | shared --forced-hairline |
| border-width | `stories/Foundations.stories.ts:41` | `border-block-start` | `1px` | `--border-width (= calm, darkmatter, expressive, glass)` | story table row rule |
| border-width | `stories/Foundations.stories.ts:46` | `border` | `3px` | `--border-width` | story contrast swatch stroke |

### Font-size (3)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| font-size | `src/css/components/avatar.css:24` | `font-size` | `0.38` |  | none one-off value |
| font-size | `src/css/components/field.css:53` | `font-size` | `0.8em` |  | exception glyph geometry |
| font-size | `src/css/components/menu.css:63` | `font-size` | `0.625rem` |  | exception glyph geometry |

### Font-weight (24)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| font-weight | `src/css/components/alert.css:49` | `font-weight` | `650` |  | missing-scale font-weight |
| font-weight | `src/css/components/avatar.css:25` | `font-weight` | `700` |  | missing-scale font-weight |
| font-weight | `src/css/components/badge.css:20` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/button.css:27` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/choice.css:97` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/disclosure.css:18` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/estop.css:27` | `font-weight` | `800` |  | missing-scale font-weight |
| font-weight | `src/css/components/field.css:19` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/field.css:40` | `font-weight` | `500` |  | missing-scale font-weight |
| font-weight | `src/css/components/field.css:54` | `font-weight` | `800` |  | missing-scale font-weight |
| font-weight | `src/css/components/field.css:165` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/menu.css:60` | `font-weight` | `700` |  | missing-scale font-weight |
| font-weight | `src/css/components/menu.css:101` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/meter.css:107` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/popover.css:58` | `font-weight` | `500` |  | missing-scale font-weight |
| font-weight | `src/css/components/table.css:49` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/table.css:73` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/tabs.css:46` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/toast.css:78` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/typography.css:35` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `stories/Foundations.stories.ts:47` | `font-weight` | `600` |  | story swatch label weight |
| font-weight | `stories/Foundations.stories.ts:94` | `font-weight` | `600` |  | story swatch label weight |
| font-weight | `stories/mirrored/Avatar.stories.ts:55` | `font-weight` | `600` |  | story name weight |
| font-weight | `stories/mirrored/Table.stories.ts:59` | `font-weight` | `600` |  | story row header weight |

### Tracking (4)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| tracking | `src/css/components/avatar.css:27` | `letter-spacing` | `0.02em` |  | missing-scale tracking |
| tracking | `src/css/components/estop.css:31` | `letter-spacing` | `0.06em` |  | missing-scale tracking |
| tracking | `src/css/components/menu.css:90` | `letter-spacing` | `0.04em` |  | missing-scale tracking |
| tracking | `src/css/components/typography.css:37` | `letter-spacing` | `0.06em` |  | missing-scale tracking |

### Line-height (7)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| line-height | `src/css/components/avatar.css:26` | `line-height` | `1` |  | missing-scale line-height |
| line-height | `src/css/components/badge.css:21` | `line-height` | `1.4` |  | missing-scale line-height |
| line-height | `src/css/components/button.css:28` | `line-height` | `1` |  | missing-scale line-height |
| line-height | `src/css/components/estop.css:28` | `line-height` | `1.1` |  | missing-scale line-height |
| line-height | `src/css/components/log.css:25` | `line-height` | `1.45` |  | missing-scale line-height |
| line-height | `src/css/components/popover.css:59` | `line-height` | `1.4` |  | missing-scale line-height |
| line-height | `stories/Showcase.stories.ts:49` | `line-height` | `1` |  | story logo tile line height |

### Shadow (15)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| shadow | `src/css/components/avatar.css:48` | `box-shadow` | `2px` | `--shadow-*` | chrome --shadow-* |
| shadow | `src/css/components/estop.css:23` | `box-shadow` | `3px` | `--shadow-*` | none one-off value |
| shadow | `src/css/components/estop.css:23` | `box-shadow` | `-0.35rem` | `--shadow-*` | none one-off value |
| shadow | `src/css/components/estop.css:23` | `box-shadow` | `3px` | `--shadow-*` | none one-off value |
| shadow | `src/css/components/estop.css:41` | `box-shadow` | `3px` | `--shadow-*` | none one-off value |
| shadow | `src/css/components/estop.css:41` | `box-shadow` | `-0.35rem` | `--shadow-*` | none one-off value |
| shadow | `src/css/components/estop.css:41` | `box-shadow` | `3px` | `--shadow-*` | none one-off value |
| shadow | `src/css/components/estop.css:47` | `box-shadow` | `3px` | `--shadow-*` | none one-off value |
| shadow | `src/css/components/estop.css:47` | `box-shadow` | `0.5rem` | `--shadow-*` | chrome --shadow-* |
| shadow | `src/css/components/estop.css:47` | `box-shadow` | `1rem` | `--shadow-*` | chrome --shadow-* |
| shadow | `src/css/components/slider.css:71` | `box-shadow` | `4px` | `--shadow-*` | chrome --focus-glow |
| shadow | `src/css/components/slider.css:71` | `box-shadow` | `30%` | `--shadow-*` | chrome --focus-glow |
| shadow | `src/css/components/slider.css:96` | `box-shadow` | `4px` | `--shadow-*` | chrome --focus-glow |
| shadow | `src/css/components/slider.css:96` | `box-shadow` | `30%` | `--shadow-*` | chrome --focus-glow |
| shadow | `stories/Foundations.stories.ts:47` | `box-shadow` | `1px` | `--shadow-*` | story contrast swatch outline |

### Motion (29)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| motion | `src/css/base.css:92` | `translate` | `-200%` |  | none intrinsic value |
| motion | `src/css/components/button.css:106` | `animation` | `700ms` | `--duration-*` | none one-off value |
| motion | `src/css/components/button.css:106` | `animation` | `linear` | `--ease` | none intrinsic value |
| motion | `src/css/components/button.css:115` | `animation-duration` | `2.4s` | `--duration-*` | none one-off value |
| motion | `src/css/components/dialog.css:23` | `scale` | `0.96` |  | shared --overlay-enter-scale |
| motion | `src/css/components/dialog.css:24` | `translate` | `0.5rem` |  | shared --overlay-enter-offset |
| motion | `src/css/components/dialog.css:33` | `scale` | `1` |  | none intrinsic value |
| motion | `src/css/components/dialog.css:40` | `scale` | `0.96` |  | shared --overlay-enter-scale |
| motion | `src/css/components/dialog.css:41` | `translate` | `0.5rem` |  | shared --overlay-enter-offset |
| motion | `src/css/components/dialog.css:83` | `scale` | `1` |  | none intrinsic value |
| motion | `src/css/components/disclosure.css:37` | `translate` | `-25%` |  | exception glyph geometry |
| motion | `src/css/components/disclosure.css:43` | `translate` | `25%` |  | exception glyph geometry |
| motion | `src/css/components/estop.css:46` | `transform` | `0.95` | `--press-transform` | chrome --press-transform |
| motion | `src/css/components/meter.css:82` | `animation` | `4` |  | none one-off value |
| motion | `src/css/components/meter.css:82` | `animation` | `ease-in-out` | `--ease` | shared --ease-loop |
| motion | `src/css/components/popover.css:67` | `scale` | `0.96` |  | shared --overlay-enter-scale |
| motion | `src/css/components/popover.css:76` | `scale` | `1` |  | none intrinsic value |
| motion | `src/css/components/popover.css:82` | `scale` | `0.96` |  | shared --overlay-enter-scale |
| motion | `src/css/components/search.css:21` | `translate` | `-50%` |  | none intrinsic value |
| motion | `src/css/components/skeleton.css:16` | `animation` | `5` |  | none one-off value |
| motion | `src/css/components/skeleton.css:16` | `animation` | `ease-in-out` | `--ease` | shared --ease-loop |
| motion | `src/css/components/slider.css:108` | `animation` | `linear` | `--ease` | none intrinsic value |
| motion | `src/css/components/slider.css:110` | `animation-range` | `100%` |  | none intrinsic value |
| motion | `src/css/components/slider.css:110` | `animation-range` | `0%` |  | none intrinsic value |
| motion | `src/css/components/toast.css:53` | `translate` | `0.75rem` |  | shared --overlay-enter-offset |
| motion | `src/css/components/toast.css:59` | `translate` | `1rem` |  | none one-off value |
| motion | `src/css/preferences.css:27` | `--duration-fast` | `0ms` | `--duration-*` | exception token definition |
| motion | `src/css/preferences.css:28` | `--duration-base` | `0ms` | `--duration-*` | exception token definition |
| motion | `src/css/preferences.css:29` | `--duration-slow` | `0ms` | `--duration-*` | exception token definition |

### Focus (7)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| focus | `src/css/components/choice.css:127` | `outline-offset` | `1px` | `--focus-offset` | chrome --focus-offset |
| focus | `src/css/components/choice.css:132` | `outline` | `2px` | `--focus-width (= calm, darkmatter, expressive, glass)` | shared --forced-selected-outline |
| focus | `src/css/components/estop.css:51` | `outline` | `2px` | `--focus-width (= calm, darkmatter, expressive, glass)` | chrome --focus-width |
| focus | `src/css/components/estop.css:52` | `outline-offset` | `4px` | `--focus-offset` | chrome --focus-offset |
| focus | `src/css/components/tabs.css:77` | `outline-offset` | `1px` | `--focus-offset` | chrome --focus-offset |
| focus | `src/css/components/tabs.css:91` | `outline` | `2px` | `--focus-width (= calm, darkmatter, expressive, glass)` | shared --forced-selected-outline |
| focus | `src/css/preferences.css:11` | `--focus-width` | `3px` |  | exception token definition |

### Other (36)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| other | `src/css/base.css:79` | `clip-path` | `50%` |  | none intrinsic value |
| other | `src/css/components/button.css:86` | `opacity` | `0.55` |  | shared --disabled-opacity |
| other | `src/css/components/choice.css:26` | `opacity` | `0.55` |  | shared --disabled-opacity |
| other | `src/css/components/choice.css:83` | `clip-path` | `50%` |  | shared .odd-visually-hidden |
| other | `src/css/components/choice.css:111` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/dialog.css:22` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/dialog.css:32` | `opacity` | `1` |  | none intrinsic value |
| other | `src/css/components/dialog.css:39` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/dialog.css:47` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/dialog.css:54` | `opacity` | `1` |  | none intrinsic value |
| other | `src/css/components/dialog.css:59` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/field.css:84` | `opacity` | `1` |  | none intrinsic value |
| other | `src/css/components/field.css:113` | `opacity` | `0.7` |  | shared --disabled-opacity |
| other | `src/css/components/popover.css:66` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/popover.css:75` | `opacity` | `1` |  | none intrinsic value |
| other | `src/css/components/popover.css:81` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/sheet.css:21` | `--_hide` | `100%` |  | none intrinsic value |
| other | `src/css/components/sheet.css:48` | `--_hide` | `-100%` |  | none intrinsic value |
| other | `src/css/components/sheet.css:51` | `--_hide` | `-100%` |  | none intrinsic value |
| other | `src/css/components/sheet.css:60` | `--_hide` | `100%` |  | none intrinsic value |
| other | `src/css/components/sheet.css:72` | `--_hide` | `100%` |  | none intrinsic value |
| other | `src/css/components/sheet.css:81` | `--_hide` | `-100%` |  | none intrinsic value |
| other | `src/css/components/sheet.css:103` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/sheet.css:109` | `opacity` | `1` |  | none intrinsic value |
| other | `src/css/components/sheet.css:113` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/skeleton.css:27` | `opacity` | `0.45` |  | none one-off value |
| other | `src/css/components/slider.css:28` | `--_rail` | `0.375rem` |  | exception density-scaled private size |
| other | `src/css/components/slider.css:44` | `opacity` | `0.55` |  | shared --disabled-opacity |
| other | `src/css/components/table.css:114` | `opacity` | `0.5` |  | none one-off value |
| other | `src/css/components/table.css:116` | `opacity` | `1` |  | none intrinsic value |
| other | `src/css/components/table.css:117` | `opacity` | `1` |  | none intrinsic value |
| other | `src/css/components/tabs.css:82` | `opacity` | `0.55` |  | shared --disabled-opacity |
| other | `src/css/components/toast.css:52` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/toast.css:58` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/preferences.css:8` | `--surface-alpha` | `100%` |  | exception token definition |
| other | `src/css/preferences.css:19` | `--surface-alpha` | `100%` |  | exception token definition |

<!-- /audit:literals -->

## 4. Other anti-patterns

The generated token graph comes first. The entries after it are the verified findings that sections 2 and 3 do not hold, grouped by the plan's anti-pattern kinds.

<!-- audit:graph -->

### Definitions by file

| File | Layer | Definitions |
| --- | --- | --- |
| `src/css/chromes/bubblegum.css` | chrome | 33 |
| `src/css/chromes/calm.css` | chrome | 33 |
| `src/css/chromes/darkmatter.css` | chrome | 33 |
| `src/css/chromes/expressive.css` | chrome | 33 |
| `src/css/chromes/glass.css` | chrome | 33 |
| `src/css/components/alert.css` | components | 10 |
| `src/css/components/avatar.css` | components | 3 |
| `src/css/components/badge.css` | components | 12 |
| `src/css/components/button.css` | components | 15 |
| `src/css/components/choice.css` | components | 3 |
| `src/css/components/estop.css` | components | 1 |
| `src/css/components/field.css` | components | 1 |
| `src/css/components/log.css` | components | 5 |
| `src/css/components/meter.css` | components | 11 |
| `src/css/components/sheet.css` | components | 6 |
| `src/css/components/slider.css` | components | 8 |
| `src/css/components/toast.css` | components | 5 |
| `src/css/components/typography.css` | components | 7 |
| `src/css/foundations.css` | foundations | 51 |
| `src/css/palettes/aurora.css` | palette | 18 |
| `src/css/palettes/caffeine.css` | palette | 19 |
| `src/css/palettes/calm-storm.css` | palette | 19 |
| `src/css/palettes/cotton-candy.css` | palette | 19 |
| `src/css/palettes/cyberpunk.css` | palette | 19 |
| `src/css/palettes/default.css` | palette | 18 |
| `src/css/palettes/singularity.css` | palette | 19 |
| `src/css/palettes/sorbet.css` | palette | 18 |
| `src/css/preferences.css` | preferences | 18 |
| `stories/Controls.stories.ts` | inline | 3 |
| `stories/CustomPalette.stories.ts` | inline | 4 |
| `stories/Foundations.stories.ts` | inline | 3 |
| `stories/Overlays.stories.ts` | inline | 3 |
| `stories/Showcase.stories.ts` | inline | 10 |
| `stories/mirrored/Avatar.stories.ts` | inline | 2 |
| `stories/mirrored/Choice.stories.ts` | inline | 3 |
| `stories/mirrored/Meter.stories.ts` | inline | 4 |
| `stories/mirrored/Popover.stories.ts` | inline | 2 |
| `stories/mirrored/Separator.stories.ts` | inline | 3 |
| `stories/mirrored/Sheet.stories.ts` | inline | 1 |
| `stories/mirrored/Skeleton.stories.ts` | inline | 1 |
| `stories/mirrored/Slider.stories.ts` | inline | 1 |
| `stories/mirrored/Tabs.stories.ts` | inline | 1 |

### References with no definition

None.

### Public tokens nothing reads

| Token | Defined at | Layer |
| --- | --- | --- |
| `--accent-foreground` | `src/css/palettes/aurora.css:19` | palette |
| `--accent-foreground` | `src/css/palettes/caffeine.css:19` | palette |
| `--accent-foreground` | `src/css/palettes/calm-storm.css:19` | palette |
| `--accent-foreground` | `src/css/palettes/cotton-candy.css:19` | palette |
| `--accent-foreground` | `src/css/palettes/cyberpunk.css:19` | palette |
| `--accent-foreground` | `src/css/palettes/default.css:20` | palette |
| `--accent-foreground` | `src/css/palettes/singularity.css:19` | palette |
| `--accent-foreground` | `src/css/palettes/sorbet.css:19` | palette |
| `--space-10` | `src/css/foundations.css:25` | foundations |
| `--z-overlay` | `src/css/foundations.css:36` | foundations |
| `--z-popover` | `src/css/foundations.css:37` | foundations |
| `--z-sticky` | `src/css/foundations.css:34` | foundations |

Names built at runtime (`var(--${…})`) are invisible to this count. Files that build them: `stories/Foundations.stories.ts`.

### Palette tokens defined outside palettes and foundations

| Token | Defined at | Layer |
| --- | --- | --- |
| `--border` | `src/css/preferences.css:6` | preferences |
| `--danger` | `src/css/components/meter.css:125` | components |
| `--info` | `src/css/components/meter.css:126` | components |
| `--muted-foreground` | `src/css/preferences.css:5` | preferences |
| `--primary` | `src/css/components/meter.css:122` | components |
| `--success` | `src/css/components/meter.css:123` | components |
| `--warning` | `src/css/components/meter.css:124` | components |

### Chrome tokens defined outside chromes

| Token | Defined at | Layer |
| --- | --- | --- |
| `--edge-surface` | `src/css/preferences.css:7` | preferences |
| `--focus-color` | `src/css/preferences.css:36` | preferences |
| `--focus-glow` | `src/css/preferences.css:37` | preferences |
| `--focus-width` | `src/css/preferences.css:11` | preferences |
| `--fx-backdrop` | `src/css/preferences.css:10` | preferences |
| `--fx-backdrop` | `src/css/preferences.css:20` | preferences |
| `--fx-glow` | `src/css/preferences.css:9` | preferences |
| `--fx-glow` | `src/css/preferences.css:38` | preferences |
| `--page-background` | `src/css/preferences.css:13` | preferences |
| `--page-background` | `src/css/preferences.css:39` | preferences |
| `--press-transform` | `src/css/preferences.css:26` | preferences |
| `--surface-alpha` | `src/css/preferences.css:8` | preferences |
| `--surface-alpha` | `src/css/preferences.css:19` | preferences |

### Public custom properties in component files

| Token | Defined at | Layer |
| --- | --- | --- |
| `--danger` | `src/css/components/meter.css:125` | components |
| `--info` | `src/css/components/meter.css:126` | components |
| `--primary` | `src/css/components/meter.css:122` | components |
| `--success` | `src/css/components/meter.css:123` | components |
| `--track` | `src/css/components/meter.css:121` | components |
| `--warning` | `src/css/components/meter.css:124` | components |

<!-- /audit:graph -->

### Theme and chrome drift

#### CSS-12. Small overlays take the surface radius, large ones the overlay radius

- **Rule.** Theme and chrome drift. A chrome author who tunes `--radius-overlay` reaches two of the overlays.
- **Evidence.** Dialog and sheet read the overlay radius (`src/css/components/dialog.css:15` (`var(--radius-overlay)`), `src/css/components/sheet.css:34` (`var(--radius-overlay)`)). Popover, menu, and the parked hover card wear the overlay shadow with the surface radius (`src/css/components/popover.css:37` (`var(--radius-surface)`), `src/css/components/popover.css:40` (`var(--shadow-overlay)`)). Toast does the same with the overlay fill (`src/css/components/toast.css:37` (`var(--radius-surface)`), `src/css/components/toast.css:38` (`var(--overlay-fill)`)). The select picker uses a third formula (`src/css/components/field.css:150` (`calc(var(--radius-control) + var(--space-1))`)). All five chromes set the two radii apart (`src/css/chromes/glass.css:13-14` (`--radius-overlay: 1.75rem;`)).
- **Verdict.** CONFIRMED.
- **Drift.** Measured in [the drift results, "CSS-12. Overlay radius split"](consistency-tokens-drift/results.md#css-12-overlay-radius-split). Popover, menu, and toast follow `--radius-surface`, and dialog and sheet follow `--radius-overlay`. The gap is 4px in calm, glass, bubblegum, and darkmatter, and 2px in expressive. Both families track the chrome, so the drift is the split, not a literal.
- **Scores.** Expansion 2, drift 3.
- **Tag.** new.
- **Fix.** B-09.

### Token graph faults

#### CSS-20. Three z-index rungs, `--space-10`, and `--accent-foreground` have no CSS reader

- **Rule.** Token graph fault, a token defined and never read.
- **Evidence.** `src/css/foundations.css:34` (`--z-sticky: 30;`), `src/css/foundations.css:36` (`--z-overlay: 50;`), and `src/css/foundations.css:37` (`--z-popover: 200;`) have no `var()` reader. Overlays use the top layer (`src/css/components/toast.css:2` (`The region is a manual popover`)). The only `--z-toast` reader is the skip link (`src/css/base.css:87` (`z-index: var(--z-toast);`)). `src/css/foundations.css:25` (`--space-10: 4rem;`) has no reader in `src/`. No stylesheet reads `--accent-foreground` (`src/css/palettes/default.css:20` (`--accent-foreground`), `src/js/contract.ts:31` (`"accent-foreground",`)).
- **Verdict.** CONFIRMED. The contrast check and the palette generator still use the accent-foreground name (`src/js/contract.ts:115` (`["accent-foreground", "accent", 4.5]`), `src/js/palette.ts:44` (`accent: "accent-foreground",`)), so "never read" holds for CSS only. The generated graph above lists 12 public tokens with no reader.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-26.

#### CSS-21. The layer comment says foundations holds only fixed scales

- **Rule.** Token graph fault, a token in a layer that does not own it.
- **Evidence.** `src/css/index.css:3` (`fixed scales nobody themes`) is the ownership model a new author reads first. Foundations also derives tokens from chrome and palette roles (`src/css/foundations.css:53` (`var(--density)`), `src/css/foundations.css:58` (`var(--surface-alpha)`)) and defines eight palette color defaults (`src/css/foundations.css:79` (`--danger: light-dark`)), while `src/js/contract.ts:13` (`Palettes own these and nothing else.`) says palettes own color roles.
- **Verdict.** PLAUSIBLE. The stale summary in `index.css` is real. Unproven is the wrong-layer claim, because the comments in foundations say the blocks belong there (`src/css/foundations.css:49` (`Derived tokens.`), `src/css/foundations.css:77` (`shared defaults that a palette may override`)), and the default palette overrides `--danger` from the palette layer (`src/css/palettes/default.css:21` (`--danger`)).
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-26.

#### CSS-22. Space scale names stop tracking their values after `--space-4`

- **Rule.** Token source consistency, a scale gap.
- **Evidence.** Steps 1 to 4 are n times 0.25rem (`src/css/foundations.css:18` (`--space-1: 0.25rem;`)). `--space-5` is 1.5rem and `--space-6` is 2rem (`src/css/foundations.css:22` (`--space-5: 1.5rem;`), `src/css/foundations.css:23` (`--space-6: 2rem;`)). There is no `--space-7` or `--space-9` and no 1.25rem step.
- **Verdict.** PLAUSIBLE. The gap is real and the plan allows scale-gap checks on token files. Unproven is the seam's claim that an author expects `--space-5` to be 1.25rem, because nothing in the file says the name is a multiplier.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-26.

### One-off APIs

#### DOC-01. One danger look is `variant` on Button and `tone` on MenuItem, and `tone` takes a different set on each part

- **Rule.** One-off APIs, the plan's own example.
- **Evidence.** `stories/mirrored/Button.stories.ts:62` (`variant: "danger"`) against `stories/mirrored/Menu.stories.ts:58` (`tone: "danger"`). The allow-lists differ (`src/js/usage/contract.ts:47` (`ODD-BUTTON-002`), `src/js/usage/contract.ts:92` (`ODD-BADGE-002`), `src/js/usage/contract.ts:98` (`omit: ["neutral"]`), `src/js/usage/contract.ts:197` (`omit: ["primary", "neutral"]`), `src/js/usage/contract.ts:250` (`values: ["danger"]`)). The parked eyebrow takes `primary` and `foreground`. A copied value matches no selector (`docs/usage/meter.md:42` (`copied from a badge or an alert`)).
- **Verdict.** CONFIRMED. Alert and Meter share one allow-list and differ in the omit list. Toast and log use the same four values, so they are not a fifth set. The checker still reports `ODD-METER-002`, so the silence is in CSS.
- **Scores.** Expansion 3, drift 2 (latent, not rendered).
- **Tag.** new. Related known item "`data-tone="neutral"` is written on a neutral toast but styles nothing." (`docs/follow-ups.md:127` (`is written on a neutral toast but styles nothing.`)).
- **Fix.** B-10.

#### DOC-M3. Toast and log `tone` values are not listed where the docs teach them

- **Rule.** One-off APIs, the vocabulary gap DOC-01 leaves out.
- **Evidence.** `docs/usage/toast.md:10` (`tone: "success"`) and `docs/usage/react.md:501` (`tone: "success"`) pass a tone, and `docs/usage/react.md:506` (`toast({ title, description, tone, duration, action })`) names the option without values. The CSS paints four (`src/css/components/toast.css:62-65` (`.odd-toast[data-tone="danger"]`)). Log uses the same four (`src/css/components/log.css:8` (`data-tone="info|success|warning|danger"`)), and the README says only "data-tone on a line" (`README.md:194` (`on a line`)).
- **Verdict.** CONFIRMED. Found by the docs verifier and checked against the source.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new. A reader who copies Badge's `neutral` hits the known item "`data-tone="neutral"` is written on a neutral toast but styles nothing." (`docs/follow-ups.md:127` (`styles nothing.`)).
- **Fix.** B-10.

#### RX-12. `data-span` is the one system attribute React passes raw and unchecked

- **Rule.** One-off APIs.
- **Evidence.** Card allows it (`src/js/usage/contract.ts:149` (`allow: ["data-span"]`)), and `ForeignData` excludes an allowed name (`src/react/part.ts:28` (`"allow"][number]`)), so the prop stays a React string. The CSS styles `"1"` to `"11"` (`src/css/components/shell.css:67` (`[data-span="1"]`), `src/css/components/shell.css:77` (`[data-span="11"]`)), and every other value falls to the default (`src/css/components/shell.css:66` (`grid-column: span 12;`)). The Card plan records why the attribute is allowed, not why its value is unchecked (`docs/plans/react-card.md:54` (`ODD-CARD-006`)).
- **Verdict.** CONFIRMED. `<Card data-span="13" />` and `<Card data-span="six" />` pass `tsc`, ESLint, and `checkRoot`.
- **Scores.** Expansion 2, drift 2 (read from the CSS, not rendered).
- **Tag.** new.
- **Fix.** B-13.

#### DOC-14. The action row is "actions" in Dialog and "footer" in Sheet

- **Rule.** One-off APIs.
- **Evidence.** `README.md:172` (`odd-dialog-actions`) against `README.md:186` (`odd-sheet-footer`), and `stories/mirrored/Dialog.stories.ts:33` (`of: "DialogActions"`) against `stories/mirrored/Sheet.stories.ts:60` (`of: "SheetFooter"`). Showcase puts action buttons in a card footer (`stories/Showcase.stories.ts:101` (`odd-card-footer`)).
- **Verdict.** CONFIRMED. `src/css/components/sheet.css:17` explains why the element is a `div`, not why the name differs. A rename has to keep Sheet's header, body, and footer stack.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-31.

### Duplicated enhancers

#### JS-04. The selector-to-enhancer list is restated outside `enhance()`

- **Rule.** Missing shared tokens or helpers, a pattern written by hand in three or more places.
- **Evidence.** `src/js/enhance.ts:110` (`.map(enhanceMenu)`) maps selectors to enhancers. The HTML preview repeats four pairs (`.storybook/preview.ts:43` (`forEach(enhanceTabs)`)), and stories call the others themselves (`stories/Controls.stories.ts:104` (`.forEach(enhanceStepper)`), `stories/Controls.stories.ts:145` (`enhanceRangeField(field)`), `stories/Feedback.stories.ts:46`).
- **Verdict.** CONFIRMED. The preview also installs the three fallbacks once, outside the per-story list (`.storybook/preview.ts:12`). The follow-up records that stepper, range field, log, and the fallbacks have no React counterpart. JS-01 is a second reason the preview calls only the four safe enhancers.
- **Scores.** Expansion 2, drift 1.
- **Tag.** known. "The HTML preview keeps its own list of enhancers." (`docs/follow-ups.md:105` (`The HTML preview keeps its own list of enhancers.`)).
- **Fix.** B-25.

#### DOC-10. The HTML preview keeps a second wiring list

- **Rule.** Duplicated enhancers.
- **Evidence.** `.storybook/preview.ts:8` (`enhanceMenu, enhanceSelectAll, enhanceTabs, enhanceToaster`) imports four enhancers, and lines 43 to 46 call them on the canvas.
- **Verdict.** CONFIRMED. This is the story-side view of JS-04.
- **Scores.** Expansion 2, drift 1. The verifier lowered expansion from 3, because only a new enhanced component adds a line.
- **Tag.** known. "The HTML preview keeps its own list of enhancers." (`docs/follow-ups.md:105` (`keeps its own list of enhancers.`)).
- **Fix.** B-25.

### Missing shared tokens or helpers

#### CSS-04. The tab list is a hand copy of the segmented control, and the copies have drifted

- **Rule.** Missing shared tokens or helpers. Rule 6 for the literals, listed under segment inset and gap in section 3.
- **Evidence.** The comment says the match is on purpose (`src/css/components/tabs.css:2` (`The tab list wears the segmented`)). The container, item, selected, focus, and forced-colors rules exist twice (`src/css/components/choice.css:67` (`.odd-segmented {`), `src/css/components/tabs.css:16` (`.odd-tabs > [role="tablist"] {`)). Tabs dim on `:disabled` and size icons (`src/css/components/tabs.css:80` (`:disabled {`), `src/css/components/tabs.css:60` (`[role="tab"] svg {`)). Segmented does neither, and it redraws the focus outline because its radio is hidden (`src/css/components/choice.css:125` (`label:has(:focus-visible)`), `src/css/components/choice.css:107` (`.odd-segmented > label > input {`)).
- **Verdict.** CONFIRMED. The hidden input explains the one outline split, not the duplicated shell.
- **Scores.** Expansion 2, drift 2 (latent, not rendered).
- **Tag.** new for the duplication. The disabled half is known, "`odd-segmented` has no disabled styling." (`docs/follow-ups.md:64` (`has no disabled styling.`)).
- **Fix.** B-11.

#### CSS-05. The tone-to-color mapping is hand-written in five components

- **Rule.** Missing shared tokens or helpers.
- **Evidence.** Five files repeat `[data-tone=x] { --_tone: var(--x) }`, 21 declarations in all (`src/css/components/alert.css:26` (`--_tone: var(--info)`), `src/css/components/badge.css:35` (`--_tone: var(--primary)`), `src/css/components/meter.css:28` (`--_bar: var(--success)`), `src/css/components/log.css:44` (`background-color: var(--tint-info)`), `src/css/components/toast.css:62` (`--_tone: var(--info)`)). Meter names the property `--_bar`, and log paints the tint on the declaration.
- **Verdict.** CONFIRMED. Each file header lists its subset (`src/css/components/badge.css:2` (`neutral|primary|success|warning|danger|info`), `src/css/components/alert.css:2` (`info|success|warning|danger`)), so the vocabulary split is documented and is not a silent one-off API. The copied CSS still matches the helper rule.
- **Scores.** Expansion 3, drift 1.
- **Tag.** new. Related known item "`data-tone="neutral"` is written on a neutral toast but styles nothing." (`docs/follow-ups.md:127` (`styles nothing.`)).
- **Fix.** B-10.

#### JS-02. The once-only holder is hand-written four times

- **Rule.** Missing shared tokens or helpers.
- **Evidence.** The count, the `released` guard, and stop-on-last-release repeat in `src/js/menu.ts:35` (`export function enhanceMenu`), `src/js/tabs.ts:26` (`export function enhanceTabs`), `src/js/toast.ts:25` (`export function enhanceToaster`), and `src/js/enhance.ts:58` (`export function enhanceSelectAll`).
- **Verdict.** CONFIRMED. A behavior-preserving extract keeps the toaster's `Map` (`src/js/toast.ts:19` (`const toasters = new Map`)) and the tabs rewire (`src/js/tabs.ts:33`).
- **Scores.** Expansion 2, drift 1. The verifier lowered expansion from 3.
- **Tag.** known. "Three enhancers repeat the same holder." (`docs/follow-ups.md:147` (`Three enhancers repeat the same holder.`)). Select-all is the fourth copy.
- **Fix.** B-16.

#### JS-06. Enhancers remove listeners three ways

- **Rule.** Missing shared tokens or helpers.
- **Evidence.** Toast passes one `AbortController` signal (`src/js/toast.ts:59` (`const controller = new AbortController();`)). `interestForFallback` loops a listener table (`src/js/fallbacks.ts:70` (`const listeners`)). Menu, stepper, tabs, and range field pair each `addEventListener` with a hand-written `removeEventListener` (`src/js/menu.ts:128` (`return () => {`), `src/js/stepper.ts:97` (`return () => {`), `src/js/tabs.ts:106` (`return () => {`), `src/js/range-field.ts:93` (`return () => {`)).
- **Verdict.** CONFIRMED. Every cleanup is complete today, and the menu capture flags match on add and remove. Toast's action and close clicks do not take the signal (`src/js/toast.ts:168`, `src/js/toast.ts:183`), and `stop()` removes the list, so those clicks go with the node.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-16.

#### JS-08. Four enhancers look up ids through the global `document`

- **Rule.** Missing shared tokens or helpers.
- **Evidence.** `src/js/menu.ts:57` (`document.querySelectorAll`), `src/js/tabs.ts:55` (`document.getElementById`), `src/js/range-field.ts:46` (`document.getElementById(errorId)`), and `src/js/fallbacks.ts:19` (`document.getElementById`).
- **Verdict.** CONFIRMED. Inside an open shadow root, the verifier measured a second `.odd-error` on the second invalid commit, and a clicked tab that set `aria-selected="true"` while its panel stayed `hidden`.
- **Scores.** Expansion 2, drift 2. The verifier raised drift from 1, because the duplicate error text is visible in a shadow root. Nothing was rendered under a chrome.
- **Tag.** known for Menu, "Menu triggers inside a shadow root do not match." (`docs/follow-ups.md:151` (`Menu triggers inside a shadow root do not match.`)). New for tabs, range field, and the fallback.
- **Fix.** B-14.

#### JS-M1. Toast finds the open modal through the global `document`

- **Rule.** Missing shared tokens or helpers, the same lookup as JS-08 in a fifth place.
- **Evidence.** `src/js/toast.ts:119` (`document.querySelectorAll<HTMLDialogElement>("dialog:modal")`). With no match, `rehome` leaves the list on the region (`src/js/toast.ts:123` (`if (modal === undefined) {`)). A `byId` helper does not cover this selector.
- **Verdict.** PLAUSIBLE. A dialog in an open shadow root was invisible to `document.querySelectorAll`, 0 in the document and 1 in the shadow root. Unproven is `rehome` itself, which did not run, because happy-dom does not match `dialog:modal` (`docs/follow-ups.md:141` (`does not match`)).
- **Scores.** Expansion 2, drift 2 (latent, not rendered).
- **Tag.** new. Found by the JS verifier.
- **Fix.** B-14.

#### JS-10. The close glyph is drawn three times with two stroke widths

- **Rule.** 6 and the missing shared helper anti-pattern. The glyph-geometry exception does not apply, because more than one component draws the glyph.
- **Evidence.** Toast and the story icon set use path `M18 6 6 18M6 6l12 12` at stroke width 2 (`src/js/toast.ts:17` (`stroke-width="2"`), `stories/icons.ts:14` (`close: icon(`)). The story set also sets a round line join that toast lacks (`stories/icons.ts:3` (`stroke-linejoin="round"`)). Search masks the reversed path at 2.5 (`src/css/components/search.css:35` (`stroke-width='2.5'`)). The scanner cannot see the toast copy, because it is a string in `src/js/`.
- **Verdict.** PLAUSIBLE. Unproven is rule 6, which needs the same literal in two or more components. The search string is reversed, and `stories/icons.ts` is not a component.
- **Drift.** Measured in [the drift results, "JS-10. Close glyph stroke widths"](consistency-tokens-drift/results.md#js-10-close-glyph-stroke-widths). The toast close renders 1.15px of stroke with no line join, and the search clear renders 1.67px. The search glyph is 45% heavier in all 10 cells.
- **Scores.** Expansion 2, drift 3.
- **Tag.** new.
- **Fix.** B-06.

#### RX-01. Four self-enhancing parts repeat one hook body

- **Rule.** Missing shared tokens or helpers.
- **Evidence.** `src/react/tabs.tsx:15` (`export function Tabs({ ref, ...props }`), `src/react/toast.tsx:15` (`export function Toaster({ ref, ...props }`), `src/react/menu.tsx:18` (`export function Menu({ ref, ...props }`), and `src/react/table.tsx:24` (`export function Table({ ref, ...props }`) each keep a root ref, call `useImperativeHandle`, run a layout effect, and render `lower`. The Menu plan's "No holder helper" refers to the vanilla module map (`docs/plans/react-menu.md:145` (`No holder helper.`)).
- **Verdict.** CONFIRMED. The bodies differ in effects. Tabs runs a second effect with no dependency array (`src/react/tabs.tsx:19` (`useLayoutEffect(() => typeTabs(root.current!));`)), and so does Table's (`src/react/table.tsx:28` (`useLayoutEffect(() => enhanceSelectAll(root.current!));`)).
- **Scores.** Expansion 2, drift 1. The verifier lowered expansion from 3, because only an enhanced part copies it.
- **Tag.** new. The vanilla analog is known, "Three enhancers repeat the same holder." (`docs/follow-ups.md:147` (`repeat the same holder.`)).
- **Fix.** B-28.

#### RX-03. `Contract` does not type enum attributes outside `props`, and five modules hand-type them

- **Rule.** Missing shared tokens or helpers.
- **Evidence.** `src/react/part.ts:81` (`export type Contract<N extends Name, Rule>`) has no enum member. The hand lines are `src/react/avatar.tsx:8` (`role?: Values<AvatarRule, "role">;`), `src/react/separator.tsx:6` (`"aria-orientation"?:`), `src/react/separator.tsx:7` (`role?: Values<SeparatorRule, "role">;`), `src/react/popover.tsx:6` (`role?: Values<PopoverRule, "role">;`), `src/react/table.tsx:9` (`role?: Values<TableWrapRule, "role">;`), and `src/react/button.tsx:13` (`"aria-current"?:`).
- **Verdict.** CONFIRMED. The README tells the author to write the line (`README.md:154`). Dialog's `role` already fails through `Exclusive`, so the fix excludes it.
- **Scores.** Expansion 2, drift 1.
- **Tag.** known. "`Contract` does not type an `enum` attribute outside the row's `props`." (`docs/follow-ups.md:75` (`attribute outside the row's`)). Popover, TableWrap, and Button copied the line since.
- **Fix.** B-30.

#### RX-07. `format.ts` reads `USAGE` rules by array index

- **Rule.** Missing shared tokens or helpers.
- **Evidence.** Eleven lookups pick a rule by position, such as `src/js/usage/format.ts:149` (`const variantRule = USAGE.button[1];`), `src/js/usage/format.ts:162` (`const shapeRule = USAGE.skeleton[1];`), and `src/js/usage/format.ts:166` (`const meterToneRule = USAGE.meter[2];`). Four guard the position with `satisfies` (`src/js/usage/format.ts:169` (`satisfies { kind: "enum"; attribute: "role" }`)). The fix strings restate values the rule already holds (`src/js/usage/format.ts:219` (`or set primary, secondary, danger, or ghost.`), `src/js/usage/format.ts:226` (`or set sm or lg.`)).
- **Verdict.** CONFIRMED. Inserting an enum with `values` and `omit` above an unguarded index keeps `tsc` silent. Line 344 of `format.ts`, which the seam cited, is a handwritten Allowed field, not an index lookup.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new. Related known item "The omit list in `ODD-SKELETON-002` reads "text and line and rect and rectangular and rounded"." (`docs/follow-ups.md:82` (`The omit list in`)), in the same file.
- **Fix.** B-21.

#### RX-16. React and HTML spellings of one attribute are duplicate contract rows

- **Rule.** Missing shared tokens or helpers, the shared rename table.
- **Evidence.** Card repeats `onClick` and `onclick` and both tab-index spellings (`src/js/usage/contract.ts:145` (`attribute: "onClick"`), `src/js/usage/contract.ts:148` (`attribute: "tabindex"`)). Search repeats `onSubmit` and `onsubmit` (`src/js/usage/contract.ts:183` (`attribute: "onSubmit"`)). TableWrap lists both spellings (`src/js/usage/contract.ts:257` (`"tabindex", "tabIndex"`)). The ESLint lowering renames only `className` (`src/eslint/jsx.ts:43` (`{ className: "class", children: null }`)).
- **Verdict.** CONFIRMED.
- **Scores.** Expansion 2, drift 1.
- **Tag.** known. "The ESLint JSX lowering renames only `className`." (`docs/follow-ups.md:187` (`renames only`)).
- **Fix.** B-24.

#### DOC-03. Story post-render wiring is written five ways

- **Rule.** Missing shared tokens or helpers.
- **Evidence.** Controls has a `mount` helper no other file uses (`stories/Controls.stories.ts:19` (`const mount = (html: string`)). Feedback, Layout, and Foundations call `requestAnimationFrame` by hand (`stories/Feedback.stories.ts:44` (`requestAnimationFrame`), `stories/Layout.stories.ts:73` (`requestAnimationFrame(() => enhance(root));`), `stories/Foundations.stories.ts:72` (`requestAnimationFrame(() => measure(el));`)). The preview uses a microtask (`.storybook/preview.ts:42` (`queueMicrotask(() => {`)). Menu, Slider, and Toast add a `play`, each attaching its handler a different way (`stories/mirrored/Menu.stories.ts:71` (`addEventListener("click"`), `stories/mirrored/Slider.stories.ts:68` (`slider.oninput = () => {`), `stories/mirrored/Toast.stories.ts:72` (`button.onclick = shows`)).
- **Verdict.** CONFIRMED. Showcase and CustomPalette also wire synchronously on the node they return (`stories/Showcase.stories.ts:119`, `stories/CustomPalette.stories.ts:80`), so the fix has ten call sites, not eight.
- **Scores.** Expansion 2, drift 1. The verifier lowered expansion from 3, because most components have no behavior.
- **Tag.** new. Related known items "A story `play` does not run on a Docs page." (`docs/follow-ups.md:116` (`does not run on a Docs page.`)) and "The Toast story's triggers do nothing on a Docs page," (`docs/follow-ups.md:128` (`triggers do nothing on a Docs page,`)).
- **Fix.** B-29.

#### DOC-04. Story grids and row alignment are inline styles

- **Rule.** Missing shared tokens or helpers. Rule 3 does not apply, because the space scale stops at 4rem.
- **Evidence.** A responsive grid is written 8 times with minimums of 12, 16, 17, 18, 24, and 26rem, such as `stories/mirrored/Card.stories.ts:20` (`minmax(17rem, 1fr)`), which `stories/mirrored/Skeleton.stories.ts:47` (`minmax(17rem, 1fr)`) copies. Row spacing is written 8 times, such as `stories/Showcase.stories.ts:21` (`justify-content: space-between`) and `stories/mirrored/Popover.stories.ts:32` (`justifyContent: "flex-end"`).
- **Verdict.** CONFIRMED. Three of the eight grids are card grids. The other five are contrast columns, swatches, a settings form, a palette matrix, and the custom-palette preview.
- **Scores.** Expansion 2, drift 1. The verifier lowered expansion from 3.
- **Tag.** new.
- **Fix.** B-33.

#### DOC-M1. Cross-axis row alignment is a third inline helper

- **Rule.** Missing shared tokens or helpers.
- **Evidence.** `stories/Controls.stories.ts:37` (`align-items: start`), `stories/Controls.stories.ts:38` (`align-items: center`), and `stories/CustomPalette.stories.ts:50` (`align-items: end`). No `data-align` exists.
- **Verdict.** CONFIRMED. Found by the docs verifier and checked against the source.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-33.

#### DOC-05. Story width caps are 18 inline values with 9 sizes

- **Rule.** Missing shared tokens or helpers. Rule 3 does not apply, because no scale holds these widths.
- **Evidence.** Sizes from 26 to 72rem, such as `stories/mirrored/Field.stories.ts:20` (`maxInlineSize: "26rem"`), `stories/mirrored/Alert.stories.ts:20` (`maxInlineSize: "40rem"`), and `stories/Showcase.stories.ts:46` (`max-inline-size: 72rem`). In mirrored stories the cap is part of the scene, so it reaches the React example an agent reads.
- **Verdict.** CONFIRMED. The 18 lines sit in 14 story files, not 15.
- **Scores.** Expansion 2, drift 1. The verifier lowered expansion from 3, because several stories set no cap.
- **Tag.** new.
- **Fix.** B-33.

#### DOC-06. The fieldset reset is written three times

- **Rule.** Missing shared tokens or helpers.
- **Evidence.** `stories/mirrored/Choice.stories.ts:24` (`border: "0", padding: "0", margin: "0"`), `stories/mirrored/Choice.stories.ts:34` (`border: "0", padding: "0", margin: "0"`), and `stories/mirrored/Sheet.stories.ts:49` (`border: "0", padding: "0", margin: "0"`), each with a spaced legend. `base.css` does not reset `fieldset`.
- **Verdict.** CONFIRMED.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-33.

#### DOC-08. Showcase rebuilds a primary icon button and a heading inline

- **Rule.** Missing shared tokens or helpers.
- **Evidence.** The logo tile copies button tokens into one style (`stories/Showcase.stories.ts:49` (`border-radius: var(--radius-control)`)). The wordmark copies the heading font, case, and tracking (`stories/Showcase.stories.ts:50` (`text-transform: var(--heading-case)`)) and omits `--heading-weight`. The padding clamp ends at the values of `--space-4` and `--space-8` (`stories/Showcase.stories.ts:43` (`clamp(1rem, 4vw, 3rem)`)).
- **Verdict.** CONFIRMED. The copy omits button properties such as `font-weight: 600`. `1.15em` does not play the role of `--leading-tight`, so rule 3 does not apply to it. `odd-heading` with `data-size="lg"` is `--text-xl` and would enlarge the wordmark.
- **Scores.** Expansion 2, drift 2 (latent, not rendered).
- **Tag.** known. "The Showcase sample app doesn't use the new components." (`docs/follow-ups.md:178` (`doesn't use the new components.`)).
- **Fix.** B-12.

#### DOC-19. The default appearance is restated by hand in the Storybook config

- **Rule.** Missing shared tokens or helpers.
- **Evidence.** `src/js/appearance.ts:7` (`export const DEFAULT_APPEARANCE`) exists, and `.storybook/preview.ts:27` (`chrome: "calm", palette: "default", mode: "system"`) and `stories/catalog.ts:40` (`chrome: "calm", palette: "default", mode: "system"`) write the same values.
- **Verdict.** PLAUSIBLE. Unproven is the three-place bar, because two hand copies plus the definition are not three hand-written places.
- **Scores.** Expansion 1, drift 1.
- **Tag.** new.
- **Fix.** B-35.

### Accessibility contract gaps that block expansion

#### JS-03. The two roving widgets follow opposite disabled models

- **Rule.** Accessibility contract gap that blocks expansion.
- **Evidence.** `roving()` skips only `:disabled` (`src/js/roving.ts:25` (`!el.matches(":disabled")`)). Menu forbids `disabled` and requires `aria-disabled` (`src/js/usage/contract.ts:251` (`ODD-MENU-007`)), and adds its own check (`src/js/menu.ts:54` (`[aria-disabled="true"]`)). Tabs honor only native `disabled` (`src/js/tabs.ts:94` (`!tab.matches(":disabled")`), `src/css/components/tabs.css:80` (`:disabled {`)), and the tabs rules never mention disabled (`src/js/usage/contract.ts:170` (`ODD-TABS-001`)). `roving.ts` names toolbar as its next widget (`src/js/roving.ts:1` (`(menu, tab list, toolbar)`)).
- **Verdict.** PLAUSIBLE. In happy-dom, ArrowRight and a click both selected an `aria-disabled` tab and showed its panel. Unproven is that the split is a defect, because the React docs say a disabled tab takes native `disabled` (`docs/usage/react.md:349` (`A disabled tab takes native`)) and the menu choice is a recorded APG fix (`docs/follow-ups.md:40`). The checker gap is the part that matches the rule.
- **Drift.** Not measured. [The drift results, "JS-03. `aria-disabled` tab draws as enabled"](consistency-tokens-drift/results.md#js-03-aria-disabled-tab-draws-as-enabled) are inconclusive, because no story renders an `aria-disabled` tab. The only disabled-tab rule in the loaded CSS is `.odd-tabs [role="tab"]:disabled`, which such a tab would not match.
- **Scores.** Expansion 2, drift 2.
- **Tag.** new.
- **Fix.** B-17.

#### DOC-15. Menu bans `disabled` for keyboard reach, while the Tabs story uses it and `tabs.md` is silent

- **Rule.** Accessibility contract gap that blocks expansion.
- **Evidence.** `docs/usage/menu.md:90` (`has the`) rejects `disabled` because the arrow keys would skip the item. The Tabs story disables a tab natively (`stories/mirrored/Tabs.stories.ts:51` (`tab("s5", "Season 5", false, true)`)), and `tabs.md` never mentions `disabled` or `aria-disabled`.
- **Verdict.** CONFIRMED. The stepper also uses `aria-disabled`, so Menu is not the only reachable-disabled precedent.
- **Scores.** Expansion 2, drift 1. The verifier lowered expansion from 3, because not every component roves.
- **Tag.** new.
- **Fix.** B-17.

#### RX-06. Required props from `Pinned` and `Named` print TypeScript's text, not the code

- **Rule.** Accessibility contract gap that blocks expansion.
- **Evidence.** `src/react/part.ts:43` (`type Pinned<N extends Name, Rule> = {`) and `src/react/part.ts:55` (`export type Named<Rule>`) add required keys, so a missing key prints TypeScript's missing-property text. The test expects that text for `menu-name` (`tests/react.test.tsx:762` (`"menu-name": { codes: [], text:`)), while the role-gated helper prints the code (`tests/react.test.tsx:714` (`"avatar-group-name": { codes: ["ODD-AVATAR-004"]`)).
- **Verdict.** CONFIRMED.
- **Scores.** Expansion 2, drift 1. The verifier lowered expansion from 3.
- **Tag.** known. "A missing required attribute prints "Property missing"." (`docs/follow-ups.md:77` (`A missing required attribute prints`)), also `docs/follow-ups.md:136` (`print TypeScript's text, not a code.`), `docs/follow-ups.md:143` (`prints TypeScript's missing-property text`), and `docs/follow-ups.md:150` (`prints TypeScript's missing-property text`). Each port added a copy.
- **Fix.** B-30.

#### RX-08. Button-shaped parts follow three disabled contracts

- **Rule.** Accessibility contract gap that blocks expansion.
- **Evidence.** Button forbids `disabled` and checks the `aria-disabled` value (`src/js/usage/contract.ts:50` (`ODD-BUTTON-005`), `src/js/usage/contract.ts:52` (`ODD-BUTTON-007`)). MenuItem forbids `disabled` only (`src/js/usage/contract.ts:251` (`ODD-MENU-007`)), though its fix text says to use `aria-disabled=true` (`src/js/usage/format.ts:905` (`replace disabled with aria-disabled=true.`)). TableSort has neither rule (`src/js/usage/contract.ts:265` (`tableSort: [`)).
- **Verdict.** CONFIRMED. `<button class="odd-menu-item" aria-disabled="yes">` passes ESLint and `checkRoot`, and the same attribute on `odd-button` is `ODD-BUTTON-005`. `<TableSort disabled>` passes all three checkers. `<MenuItem aria-disabled="yes">` fails `tsc` through React's own type, so the gap is in ESLint and `checkRoot`.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-17.

#### RX-M2. ESLint drops a raw mapped attribute that the HTML checker reports

- **Rule.** Accessibility contract gap that blocks expansion. The HTML checker reports a value that the JSX checker never sees.
- **Evidence.** `src/eslint/jsx.ts:86` (`function wrapperNames`) maps each prop's raw attribute to `null`, so the lowering drops it before the rule runs.
- **Verdict.** CONFIRMED. `<Badge data-tone="nope">` passes ESLint, and `tsc` rejects it. `<span className="odd-badge" data-tone="nope">` is `ODD-BADGE-002` in ESLint, and the same HTML is `ODD-BADGE-002` from `checkRoot`. Found by the React verifier and checked against the source.
- **Scores.** Expansion 2, drift 1.
- **Tag.** new.
- **Fix.** B-24.

## 5. Ranked fix backlog

Each item is one fix. A fix may close several findings across seams. An item's expansion and drift are the highest among the findings it closes, and its score is their product. Items sort by score, highest first. Ties go to the item that touches fewer files, and an item with a breaking public API change sorts after a non-breaking item of the same size. Drift 3 means [the drift results](consistency-tokens-drift/results.md) measured it. The scores are judgments, and the inputs sit beside each one so they can be argued with.

The ranking puts three changes with measured drift at the top, and that order holds up. They are small, they touch tokens rather than APIs, and every later component would copy the gap each one closes. The one-file and two-file items with measured drift, B-04, B-05, B-18, and B-19, cost little enough to fold into a nearby PR. B-16 scores 4, but JS-01 double-steps a stepper when `enhance()` runs twice, which is a behavior bug a user can hit. It deserves a slot earlier than its score gives it. B-10 and B-17 are the two items that need a product decision before code, a tone vocabulary and a disabled model, so their PRs should start with a short plan.

| Id | Fix | Closes | Expansion | Drift | Score | Blast radius | Depends on |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B-01 | `--disabled-opacity` token and a disabled guard on hover | CSS-07 | 3 | 3 | 9 | 6 CSS files. Visual yes, disabled fields and tabs in every chrome. API additive. | none |
| B-02 | One focus recipe that reads the chrome's offset, width, and glow | CSS-03 | 3 | 3 | 9 | 6 CSS files. Visual yes, every chrome. API none. | none |
| B-03 | `--weight-*` scale and a `--label-weight` chrome role | CSS-01, DOC-02 | 3 | 3 | 9 | 23 files across components, chromes, contract, and stories. Visual only if a chrome moves label weight. API additive. | none |
| B-04 | Disclosure summary reads `--heading-weight` | CSS-11 | 2 | 3 | 6 | 1 CSS file. Visual yes, calm, glass, bubblegum, expressive. API none. | none |
| B-05 | E-stop press, latched shadow, and rim color read tokens, and card drops the dead transform | CSS-14, CSS-L2, CSS-L1 | 2 | 3 | 6 | 2 CSS files. Visual yes, the press in every chrome and under reduced motion, the latched shadow in calm, glass, expressive, and darkmatter, and the rim in every palette. API none. | none |
| B-06 | One close glyph | JS-10 | 2 | 3 | 6 | 4 files. Visual yes, toast or search, every chrome. API none. | none |
| B-07 | Label-like text reads the label role | CSS-10, CSS-M3 | 2 | 3 | 6 | 5 CSS files. Visual yes, every chrome, most under expressive. API none. | B-03 |
| B-08 | Slider thumb reads `--border-width`, forced-colors widths get tokens | CSS-17 | 2 | 3 | 6 | 7 CSS files. Visual yes, calm, glass, expressive, darkmatter. API additive. | none |
| B-09 | One overlay radius rule | CSS-12 | 2 | 3 | 6 | 2 CSS files, or 8 files with a new chrome role, plus `field.css` if the select picker joins. Sorted by the 8-file option. Visual yes, every chrome. API none, or additive for a new role. | none |
| B-10 | One tone vocabulary and one tone mapping | CSS-05, DOC-01, DOC-M3 | 3 | 2 | 6 | About 23 files across CSS, contract, format, docs, and stories. Visual no. API additive, or breaking if MenuItem `tone` is renamed. | none |
| B-11 | One rule set for the segmented control and the tab list | CSS-04, CSS-19 | 2 | 2 | 4 | 2 CSS files. Visual yes, segmented gains disabled dimming in every chrome. API none. | B-01 |
| B-12 | Showcase uses the components, and the README documents the layout classes | DOC-08, DOC-09 | 2 | 2 | 4 | 2 files. Visual yes on the Showcase wordmark in all 5 chromes, and possible on the logo. API none. | none |
| B-13 | Type and check `data-span` values | RX-12 | 2 | 2 | 4 | 3 files plus fixtures. Visual no. API breaking for TypeScript callers outside 1 to 12. | none |
| B-14 | Root-aware id and modal lookup | JS-08, JS-M1 | 2 | 2 | 4 | 6 files in `src/js/`. Visual only inside shadow roots. API none. | none |
| B-15 | One reduced-motion policy and a named loop easing | CSS-13 | 2 | 2 | 4 | 7 CSS files. Visual only under reduced motion and on backdrops. API additive. | none |
| B-16 | One wiring helper for enhancers | JS-01, JS-02, JS-06, JS-07, JS-M2 | 2 | 2 | 4 | 10 files. Behavior change on a second call and after cleanup. API none. | none |
| B-17 | One disabled model for roving widgets and button-shaped parts | JS-03, DOC-15, RX-08 | 2 | 2 | 4 | About 12 files. Visual only for an `aria-disabled` tab. API additive, or breaking with new codes. | none |
| B-18 | Switch thumb geometry from `--border-width` | CSS-15 | 1 | 3 | 3 | 1 CSS file. Visual yes, bubblegum only. API none. | none |
| B-19 | Grouped avatars keep the chrome shadow | CSS-16 | 1 | 3 | 3 | 1 CSS file. Visual yes, every chrome. API additive if the ring color becomes a token. | none |
| B-20 | Scope the vertical tab selector | CSS-24 | 2 | 1 | 2 | 1 CSS file. Visual no in odd-design's stories. API none. | none |
| B-21 | Typed rule lookup and derived fix text in `format.ts` | RX-07 | 2 | 1 | 2 | 1 file. Visual no. API none if messages stay byte-equal. | none |
| B-22 | Tokens for the story literals | DOC-07 | 1 | 2 | 2 | 1 story file. Visual yes in the Contrast story under chromes whose border or radius differ. API none. | none |
| B-23 | One shape for usage pages and `react.md` sections | DOC-11, DOC-12 | 2 | 1 | 2 | 3 doc files. Visual no. API none. | none |
| B-24 | Shared rename table for the ESLint lowering, and report raw mapped attributes | RX-16, RX-M2 | 2 | 1 | 2 | 3 files. Visual no. ESLint output changes. API none. | none |
| B-25 | One enhancer registry | JS-04, DOC-10 | 2 | 1 | 2 | 4 files. Behavior change in the HTML preview. API additive. | B-16 |
| B-26 | Token source cleanup | CSS-20, CSS-21, CSS-22 | 2 | 1 | 2 | 4 files. Visual no. API breaking only if tokens are removed. | none |
| B-27 | Overlay geometry tokens | CSS-02, CSS-M1 | 2 | 1 | 2 | 6 CSS files. Visual no if values are kept. API additive. | none |
| B-28 | React helper for self-enhancing parts, and a narrower client boundary | RX-01, RX-11, RX-M1 | 2 | 1 | 2 | 7 files. Visual no. API none. | none |
| B-29 | One story wiring helper | DOC-03 | 2 | 1 | 2 | 12 story and preview files. Visual no. API none. | none |
| B-30 | `part.ts` derives enum props, role-gated names, and required-prop messages | RX-03, RX-04, RX-06 | 2 | 1 | 2 | About 13 React files. Visual no. API none for valid code. | none |
| B-31 | One name for the action row | DOC-14 | 2 | 1 | 2 | About 13 files. Visual no. API breaking if renamed, additive if aliased. | none |
| B-32 | Shared size tokens in `foundations.css` | CSS-06, CSS-08, CSS-09, CSS-18, CSS-M2, CSS-M4 | 2 | 1 | 2 | About 17 CSS files. Visual no if values are kept. API additive. | none |
| B-33 | Story layout helpers | DOC-04, DOC-05, DOC-06, DOC-M1 | 2 | 1 | 2 | About 23 files across stories, previews, and layout CSS. Visual small if widths snap. API additive. | none |
| B-34 | Contract rows and pages for the five uncovered components | RX-17, DOC-18 | 2 | 1 | 2 | Many files, new code families. Visual no. API additive. | B-13 for shell, B-28 for log |
| B-35 | Import `DEFAULT_APPEARANCE` in the Storybook config | DOC-19 | 1 | 1 | 1 | 2 files. Visual no. API none. | none |
| B-36 | `system-data` rules for Field and Choice | RX-02 | 1 | 1 | 1 | 6 files plus fixtures. Visual no. API breaking for TypeScript callers. | none |

### B-01. `--disabled-opacity` token and a disabled guard on hover

- **Fix.** Add `--disabled-opacity: 0.55` to `foundations.css` and read it in button, choice, slider, tabs, and field. Reconcile field's 0.7 to it, or record why field differs. Add `:not(:disabled, [aria-disabled="true"])` to the field and tab hover rules.
- **Scores.** Expansion 3 and drift 3, both from CSS-07.
- **Files.** `src/css/foundations.css`, `src/css/components/button.css`, `choice.css`, `slider.css`, `tabs.css`, `field.css`.
- **Components.** Button, Choice, Switch, Slider, Tabs, Field.
- **Visual change.** Yes in every chrome. Disabled inputs drop from 0.7 to 0.55 if reconciled. A hovered disabled input or tab stops changing.
- **Public API.** Additive (`--disabled-opacity`).
- **Codes and checkers.** None.
- **Tests.** None assert opacity today. A browser assertion in `e2e/behavior.spec.ts` would lock the hover guard.
- **Verification.** Rerun the CSS-07 cells. A disabled input and a disabled button read one opacity, and the disabled input's border is the same at rest and hovered in all 10 cells.

### B-02. One focus recipe that reads the chrome's offset, width, and glow

- **Fix.** Add `var(--focus-glow)` to the global `:focus-visible` rule or to one rule per control family. Replace the literal offsets with arithmetic on `--focus-offset` or `--focus-width`, as `menu.css` does. Draw the slider halo from `--focus-glow` and `--focus-color`. Keep the e-stop's larger ring only as arithmetic on the tokens.
- **Scores.** Expansion 3 and drift 3, both from CSS-03.
- **Files.** `src/css/base.css`, `src/css/components/choice.css`, `tabs.css`, `field.css`, `estop.css`, `slider.css`.
- **Components.** Segmented, Switch, Tabs, Field, E-stop, Slider, Disclosure, and Menu items through the global rule.
- **Visual change.** Yes. Under glass and expressive, seven more controls gain the glow. Under every chrome, segmented, tab, and input offsets move to the chrome's value.
- **Public API.** None.
- **Codes and checkers.** None. The axe sweep in `e2e/axe.spec.ts` rechecks focus contrast.
- **Tests.** None in `bun test`. `e2e/axe.spec.ts` must stay at 0 violations.
- **Verification.** Rerun the CSS-03 sweep. Every element's offset equals `--focus-offset` or a stated multiple, and the glow column reads "yes" for every element under glass and expressive.

### B-03. `--weight-*` scale and a `--label-weight` chrome role

- **Fix.** Add a `--weight-*` scale to `foundations.css`. Add `label-weight` to `CHROME_TOKENS` and set it in each chrome at 600, so nothing moves until a chrome chooses otherwise. Migrate the label-role 600s to `--label-weight` and the other weights to the scale. Replace the four story 600s with the scale. The story text helper waits for Typography, which is parked.
- **Scores.** Expansion 3 and drift 3 from CSS-01. DOC-02 adds expansion 2 and drift 2.
- **Files.** `src/css/foundations.css`, the 5 files in `src/css/chromes/`, `src/js/contract.ts`, 13 component stylesheets (alert, avatar, badge, button, choice, disclosure, estop, field, menu, meter, table, tabs, toast), and `stories/mirrored/Avatar.stories.ts`, `stories/mirrored/Table.stories.ts`, `stories/Foundations.stories.ts`.
- **Components.** Every component with a label, title, or value, 13 in all.
- **Visual change.** None at landing if every chrome sets 600. A later chrome choice changes labels under that chrome only.
- **Public API.** Additive (`--weight-*`, `--label-weight`). Custom chromes must add the new role.
- **Codes and checkers.** None.
- **Tests.** `tests/contract.test.ts` "defines every chrome token" needs the new role in each chrome.
- **Verification.** Rerun the CSS-01 cells. Button and badge weight equal `--label-weight` in all 10 cells, and the scanner's font-weight category drops to the parked lines.

### B-04. Disclosure summary reads `--heading-weight`

- **Fix.** Replace `font-weight: 600` on the summary with `var(--heading-weight)`, or move the summary to the label role and record which role it plays.
- **Scores.** Expansion 2 and drift 3, both from CSS-11.
- **Files.** `src/css/components/disclosure.css`.
- **Components.** Disclosure.
- **Visual change.** Yes under calm (650), glass (550), bubblegum (800), and expressive (750). Darkmatter stays at 600.
- **Public API.** None.
- **Codes and checkers.** None.
- **Tests.** None.
- **Verification.** Rerun the CSS-11 cells. The summary weight equals `--heading-weight` in all 10 cells.

### B-05. E-stop press, latched shadow, and rim color read tokens, and card drops the dead transform

- **Fix.** Use `var(--press-transform)` for the e-stop's `:active`. Keep a fixed inset for the latched state only. In the pressed and latched shadow, keep the rim layers and add `var(--shadow-control-active)` after them, as the resting rule does with `--shadow-control`. Derive the rim shade from a palette token instead of `black`, and check it in light and dark. Remove `transform` from card's transition list, or wire a hover lift.
- **Scores.** Expansion 2 and drift 3 from CSS-14. CSS-L2 adds expansion 2 and drift 2, and CSS-L1 adds expansion 1 and drift 2, so the score stays 6.
- **Files.** `src/css/components/estop.css`, `src/css/components/card.css`.
- **Components.** E-stop, Card.
- **Visual change.** Yes. The held e-stop follows each chrome, translates under bubblegum, and stops moving under reduced motion. The pressed and latched e-stop regains an outer shadow in calm, glass, expressive, and darkmatter, where `--shadow-control-active` equals `--shadow-control`. Bubblegum's active shadow has no offset, so it does not change there. The rim shade changes in every palette and mode. The shadow and rim changes are inferred from the source, not rendered.
- **Public API.** None.
- **Codes and checkers.** None.
- **Tests.** None.
- **Verification.** Rerun the CSS-14 cells with a held pointer, including the reduced-motion pair. The e-stop transform equals the button's in every cell. Record the e-stop's `box-shadow` while held and while latched, and confirm it ends with the chrome's `--shadow-control-active` in all 10 cells. Screenshot the latched e-stop in light and dark under two palettes to check the rim shade.

### B-06. One close glyph

- **Fix.** Keep one close glyph, as one exported string or one CSS mask on a shared custom property, with one stroke width and one line join.
- **Scores.** Expansion 2 and drift 3, both from JS-10. JS-10 is PLAUSIBLE.
- **Files.** `src/js/toast.ts`, `src/css/components/search.css`, `stories/icons.ts`, and `src/css/foundations.css` for a shared property.
- **Components.** Toast, Search.
- **Visual change.** Yes in every chrome, for whichever copy changes width.
- **Public API.** None.
- **Codes and checkers.** None.
- **Tests.** None.
- **Verification.** Rerun the JS-10 cells. The effective stroke of the toast close and the search clear match within rounding.

### B-07. Label-like text reads the label role

- **Fix.** Avatar and e-stop read `--label-case` and `--label-tracking`, or a named `--tracking-caps` token with a comment that says why they ignore the chrome. The toast title and the stat label read the label font, case, tracking, and the weight from B-03.
- **Scores.** Expansion 2 and drift 3 from CSS-10. CSS-M3 adds expansion 2 and drift 2.
- **Files.** `src/css/components/avatar.css`, `estop.css`, `toast.css`, `meter.css`, and `src/css/foundations.css` for a caps token.
- **Components.** Avatar, E-stop, Toast, Meter stat.
- **Visual change.** Yes. Under expressive, all four track at 0.08em. Under the other chromes, the e-stop loses its forced uppercase unless a caps token keeps it.
- **Public API.** None.
- **Codes and checkers.** None. The known accessible-name item changes, because e-stop text stops being uppercased under four chromes.
- **Tests.** None.
- **Verification.** Rerun the CSS-10 cells, and add the toast title. Tracking and case equal the badge's in all 10 cells, or equal the caps token.

### B-08. Slider thumb reads `--border-width`, forced-colors widths get tokens

- **Fix.** Read `--border-width` or a stated multiple for the slider thumb. Add `--forced-hairline` and `--forced-selected-outline`, or one forced-colors rule that components opt into.
- **Scores.** Expansion 2 and drift 3, both from CSS-17.
- **Files.** `src/css/components/slider.css`, `meter.css`, `popover.css`, `skeleton.css`, `choice.css`, `tabs.css`, and `src/css/foundations.css` or `preferences.css`.
- **Components.** Slider, Meter, Skeleton, Segmented, Tabs, and the parked tooltip, whose forced-colors outline is the `popover.css` line.
- **Visual change.** Yes for the slider thumb under calm, glass, expressive, and darkmatter, where it drops from 2px to 1px unless a multiple keeps it. No change in forced colors if the values are kept.
- **Public API.** Additive for the forced-colors tokens.
- **Codes and checkers.** None.
- **Tests.** None.
- **Verification.** Rerun the CSS-17 cells. The thumb border equals `--border-width` or its stated multiple in all 10 cells. Check forced colors in Chrome emulation.

### B-09. One overlay radius rule

- **Fix.** Move popover, menu, and toast to `--radius-overlay`, or add a chrome role for small overlays and record the split in `contract.ts`. Decide whether the select picker joins the rule.
- **Scores.** Expansion 2 and drift 3, both from CSS-12.
- **Files.** `src/css/components/popover.css`, `toast.css`, maybe `field.css`. With a new role, also `src/js/contract.ts` and the 5 chromes.
- **Components.** Popover, Menu, Toast, and the parked hover card, which shares the popover radius rule. The parked tooltip has its own `--radius-control` rule and does not change.
- **Visual change.** Yes in every chrome. Small overlays gain 2px to 4px of radius if they move to `--radius-overlay`.
- **Public API.** None, or additive for a new role.
- **Codes and checkers.** None.
- **Tests.** `tests/contract.test.ts` if a role is added.
- **Verification.** Rerun the CSS-12 cells. The five overlays read one radius per chrome, or two radii that match a recorded rule.

### B-10. One tone vocabulary and one tone mapping

- **Fix.** Decide one name for the action look (`variant` or `tone`) and one tone vocabulary, with each part's subset recorded in `src/js/usage/contract.ts`. Write the tone mapping once, as a `:where([data-tone])` rule that sets `--_tone` and `--_tint`. List the toast and log values in their docs and the README. Add a "Tones" section to `docs/usage/general.md`.
- **Scores.** Expansion 3 from CSS-05 and DOC-01. Drift 2 from DOC-01.
- **Files.** `src/css/components/alert.css`, `badge.css`, `meter.css`, `log.css`, `toast.css`, `menu.css`, one shared rule, `src/js/usage/contract.ts`, `src/js/usage/format.ts`, `docs/usage/badge.md`, `alert.md`, `meter.md`, `menu.md`, `button.md`, `toast.md`, `react.md`, `general.md`, `README.md`, and the Button, Menu, Badge, Alert, and Meter stories.
- **Components.** Badge, Alert, Meter, Progress, Log, Toast, MenuItem, Button.
- **Visual change.** None if the mapping keeps today's colors.
- **Public API.** Additive if Alert and Meter accept more values. Breaking if MenuItem `tone` becomes `variant`.
- **Codes and checkers.** `ODD-BADGE-002`, `ODD-ALERT-002`, `ODD-METER-002`, and `ODD-MENU-006` messages, in all three checkers.
- **Tests.** `tests/fixtures/types/fail/alert-tone.tsx`, `meter-tone.tsx`, `menu-item-tone.tsx`, the matching usage fixture pairs in `tests/fixtures/usage/`, and the `failures` map in `tests/react.test.tsx`.
- **Verification.** Screenshot every toned story before and after in light and dark, and diff. `bun run check` passes with the new fixtures.

### B-11. One rule set for the segmented control and the tab list

- **Fix.** Style both from one selector list or one shared class. Name the 2px gap and the 3px inset once, with the radius written as inner radius plus the inset token.
- **Scores.** Expansion 2 and drift 2 from CSS-04. CSS-19 adds expansion 2 and drift 1.
- **Files.** `src/css/components/choice.css`, `src/css/components/tabs.css`.
- **Components.** Segmented, Tabs.
- **Visual change.** Yes where the copies differ. Segmented gains disabled dimming in every chrome, which also closes the known segmented item.
- **Public API.** None.
- **Codes and checkers.** None.
- **Tests.** None in `bun test`.
- **Verification.** Screenshot the segmented and tabs stories under all 5 chromes, light and dark, before and after. Only the intended differences change.

### B-12. Showcase uses the components, and the README documents the layout classes

- **Fix.** Render the Showcase logo with button classes or a decorative-mark class, and the wordmark with `odd-heading` at the current size. Use the space tokens in the padding clamp. Remove `--gap` from the two cards. Add a layout row group to the README for `odd-stack`, `odd-row`, `odd-muted`, `odd-visually-hidden`, and `odd-scope`, naming every `--gap` reader, including `shell.css`.
- **Scores.** Expansion 2 and drift 2 from DOC-08. DOC-09 adds expansion 2 and drift 1.
- **Files.** `stories/Showcase.stories.ts`, `README.md`.
- **Components.** The Showcase sample app.
- **Visual change.** Yes on the wordmark in all 5 chromes. It is a `<strong>` at 700 today, and `odd-heading` reads `--heading-weight`, which is 650, 550, 800, 750, and 600. Possible on the logo if the button classes differ from the copy. Both are inferred from the source, not rendered.
- **Public API.** None.
- **Codes and checkers.** None.
- **Tests.** `tests/stories.test.ts` and the axe sweep cover the Showcase story.
- **Verification.** Screenshot `showcase--sample-app` under all 5 chromes before and after.

### B-13. Type and check `data-span` values

- **Fix.** Give the grid child attribute an `enum` rule with values `1` to `12`, owned by a shell group and shared with every grid child. Map it to a typed `span` prop when Shell ports.
- **Scores.** Expansion 2 and drift 2, both from RX-12.
- **Files.** `src/js/usage/contract.ts`, `src/js/usage/format.ts`, `docs/usage/card.md`, plus a usage fixture pair and a type fail fixture.
- **Components.** Card now, every grid child later.
- **Visual change.** No.
- **Public API.** Breaking for TypeScript callers who pass a value outside 1 to 12.
- **Codes and checkers.** One new code in all three checkers.
- **Tests.** The new fixtures, the `failures` map in `tests/react.test.tsx`, and `tests/usage-contract.test.ts`.
- **Verification.** `<Card data-span="13" />` fails `tsc`, ESLint, and `checkRoot` with the new code. `bun run check` passes.

### B-14. Root-aware id and modal lookup

- **Fix.** Add one helper that resolves an id through `element.getRootNode()`, and use it in menu, tabs, range field, and the interest fallback. Find the open modal from the toaster's root node in `rehome`.
- **Scores.** Expansion 2 and drift 2, from JS-08 and JS-M1.
- **Files.** `src/js/menu.ts`, `tabs.ts`, `range-field.ts`, `fallbacks.ts`, `toast.ts`, and one new helper module.
- **Components.** Menu, Tabs, Range field, Toast, and the parked tooltip and hover card.
- **Visual change.** Only inside shadow roots.
- **Public API.** None.
- **Codes and checkers.** None.
- **Tests.** New shadow-root cases in `tests/range-field.test.ts` and a tabs case in `tests/react.test.tsx` or a new file.
- **Verification.** Repeat the verifier's happy-dom shadow-root runs. One error node after two invalid commits, and a clicked shadow tab shows its panel. A browser check for the modal case, because happy-dom does not match `dialog:modal`.

### B-15. One reduced-motion policy and a named loop easing

- **Fix.** Pick one reduced-motion policy, tokens in `preferences.css` with an in-file block only where motion must persist, and record it in `index.css`. Name the loop easing once in `foundations.css`. Give both backdrops `--ease`. Derive the spinner duration from a token.
- **Scores.** Expansion 2 and drift 2, both from CSS-13.
- **Files.** `src/css/components/button.css`, `meter.css`, `skeleton.css`, `dialog.css`, `sheet.css`, `src/css/foundations.css`, `src/css/index.css`.
- **Components.** Button spinner, Meter, Skeleton, Dialog, Sheet.
- **Visual change.** Only under reduced motion and on backdrop fades.
- **Public API.** Additive for a loop easing token.
- **Codes and checkers.** None.
- **Tests.** None.
- **Verification.** Emulate reduced motion and record computed `animation` and `transition` values on the five components before and after.

### B-16. One wiring helper for enhancers

- **Fix.** Add one helper that keeps the count, the release guard, and the stop, and owns one `AbortController` per wire. State the cleanup contract in one place. Cleanup removes every node, attribute, timer, and `tabIndex` the enhancer added. Move all seven enhancers and the fallbacks onto it, and say in `enhance()`'s comment that every enhancer is safe to call twice.
- **Scores.** Expansion 2 and drift 2 from JS-01 and JS-07. JS-02, JS-06, and JS-M2 add expansion 2 and drift 1.
- **Files.** `src/js/menu.ts`, `tabs.ts`, `toast.ts`, `enhance.ts`, `stepper.ts`, `range-field.ts`, `log.ts`, `fallbacks.ts`, one new helper module, and `README.md`.
- **Components.** Menu, Tabs, Toast, Table, Stepper, Range field, Log, Avatar, Dialog `closedby`, and the parked tooltip and hover card.
- **Visual change.** Only after a second call or after cleanup.
- **Public API.** None.
- **Codes and checkers.** None.
- **Tests.** Call-twice and cleanup cases in `tests/stepper.test.ts`, `tests/range-field.test.ts`, and `tests/log.test.ts`. A new case for `src/js/fallbacks.ts`, which has no unit test. The Menu, Tabs, Toaster, and Table rows in `tests/react.test.tsx` and `e2e/behavior.spec.ts` must pass unchanged.
- **Verification.** Repeat the verifier's happy-dom runs. Two `enhance(document)` calls step a stepper by 1 on one click, and cleanup leaves no `.odd-error`, no `aria-invalid`, no pending popover, and no panel `tabIndex`.

### B-17. One disabled model for roving widgets and button-shaped parts

- **Fix.** Decide whether disabled items stay reachable, and write the rule in `docs/usage/general.md`. Give `roving()` one predicate for `:disabled` and `[aria-disabled="true"]` with an option for reach. Make Tabs honor `aria-disabled`, or reject it with a code as Menu rejects `disabled`. Add a shared rule list for button-shaped parts, `disabled` forbidden and `aria-disabled` checked as a boolean, and spread it into `button`, `menuItem`, and `tableSort`.
- **Scores.** Expansion 2 and drift 2 from JS-03. DOC-15 and RX-08 add expansion 2 and drift 1.
- **Files.** `src/js/roving.ts`, `menu.ts`, `tabs.ts`, `src/css/components/tabs.css`, `src/js/usage/contract.ts`, `src/js/usage/format.ts`, `docs/usage/tabs.md`, `menu.md`, `table.md`, `general.md`, `react.md`, and `stories/mirrored/Tabs.stories.ts`.
- **Components.** Tabs, Menu, MenuItem, TableSort, Button.
- **Visual change.** Only for an `aria-disabled` tab, which would dim.
- **Public API.** Additive for a `roving` option. Breaking for TypeScript callers who pass `disabled` to `TableSort`, and for Tabs if a new code rejects one model.
- **Codes and checkers.** New codes such as `ODD-MENU-008`, `ODD-TABLE-006`, and an `ODD-TABS` code, in all three checkers.
- **Tests.** Usage fixture pairs and type fail fixtures for each new code, the Tabs rows in `tests/react.test.tsx`, and `tests/usage-dom.test.ts`.
- **Verification.** Add a story with an `aria-disabled` tab, rerun the JS-03 cells, and confirm the tab dims and is skipped or reached per the decision. Confirm `<TableSort disabled>` fails all three checkers.

### B-18. Switch thumb geometry from `--border-width`

- **Fix.** Derive the thumb inset and size from `--border-width`, or size the thumb from the padding box with `background-origin` and a gap token.
- **Scores.** Expansion 1 and drift 3, both from CSS-15.
- **Files.** `src/css/components/choice.css`.
- **Components.** Switch.
- **Visual change.** Yes under bubblegum only.
- **Public API.** None.
- **Codes and checkers.** None.
- **Tests.** None.
- **Verification.** Rerun the CSS-15 cells. The gap per side is 1px in all 10 cells.

### B-19. Grouped avatars keep the chrome shadow

- **Fix.** Append the ring to `var(--shadow-control)` instead of replacing it. Read the ring color from a token a container can set, defaulting to `--background`.
- **Scores.** Expansion 1 and drift 3, both from CSS-16.
- **Files.** `src/css/components/avatar.css`.
- **Components.** AvatarGroup.
- **Visual change.** Yes in every chrome. Grouped avatars regain the chrome shadow.
- **Public API.** Additive if the ring color becomes a token.
- **Codes and checkers.** None.
- **Tests.** None.
- **Verification.** Rerun the CSS-16 cells. The grouped shadow contains the lone avatar's shadow plus the ring. Add a story with a group inside a card to render the ring-on-surface half.

### B-20. Scope the vertical tab selector

- **Fix.** Put `src/css/components/tabs.css:56` under `.odd-tabs`.
- **Scores.** Expansion 2 and drift 1, both from CSS-24.
- **Files.** `src/css/components/tabs.css`.
- **Components.** Tabs.
- **Visual change.** None in odd-design's stories. A foreign vertical tab set stops picking up the rule.
- **Public API.** None.
- **Codes and checkers.** None.
- **Tests.** None.
- **Verification.** Screenshot the vertical tabs story before and after. No pixel change.

### B-21. Typed rule lookup and derived fix text in `format.ts`

- **Fix.** Add a typed `rule(group, kind, attribute)` lookup that fails `tsc` when nothing matches. Build each fix string from the rule's values with a list-join helper. The join also fixes the known omit-list sentence.
- **Scores.** Expansion 2 and drift 1, both from RX-07.
- **Files.** `src/js/usage/format.ts`.
- **Components.** None directly. Every enum message.
- **Visual change.** No.
- **Public API.** None if message text stays byte-equal, except the omit-list wording.
- **Codes and checkers.** Message text for the derived codes.
- **Tests.** Tests that compare exact message text, `tests/usage-check.test.ts`, and type fail fixtures that print a message.
- **Verification.** `bun run check` passes, and a planted rule inserted above `USAGE.skeleton[1]` fails `tsc`.

### B-22. Tokens for the story literals

- **Fix.** Use `var(--border-width)` and `var(--radius-control)` for the Contrast samples, and `--focus-width` for the non-text sample's wider border.
- **Scores.** Expansion 1 and drift 2, both from DOC-07.
- **Files.** `stories/Foundations.stories.ts`.
- **Components.** None. The Contrast story.
- **Visual change.** Yes in the Contrast story under chromes whose border width or radius differ from 1px and 6px.
- **Public API.** None.
- **Codes and checkers.** None.
- **Tests.** `tests/stories.test.ts` if it pins the Contrast markup.
- **Verification.** Screenshot `foundations--contrast` under all 5 chromes. The scanner shows no chrome-owned rows for the file.

### B-23. One shape for usage pages and `react.md` sections

- **Fix.** Give `button.md` the example block the others open with. Give each Tabs code a fail, why, and fix paragraph. Split the shared `react.md` section into one section per family and keep the shared `command` paragraph as its own section. A test that splits each page on `## ODD-` can lock the shape.
- **Scores.** Expansion 2 and drift 1, from DOC-11 and DOC-12. Both are PLAUSIBLE, so Caleb first decides whether the shape is a rule.
- **Files.** `docs/usage/react.md`, `docs/usage/button.md`, `docs/usage/tabs.md`.
- **Components.** None.
- **Visual change.** No.
- **Public API.** None. Runtime messages link to code anchors, which stay.
- **Codes and checkers.** None.
- **Tests.** A new docs-shape test if wanted. Check `scripts/consumer-smoke.ts` and tests for anchors into `react.md`.
- **Verification.** Every runtime message link still resolves, checked by `tests/usage-contract.test.ts` or a link walk.

### B-24. Shared rename table for the ESLint lowering, and report raw mapped attributes

- **Fix.** Share one rename table between `src/eslint/jsx.ts` and `stories/mirror.ts` that maps `tabIndex`, `htmlFor`, and `on*` handlers to their HTML names, then delete the camelCase contract rows. Lower a raw mapped attribute instead of dropping it, so ESLint reports the same code as `checkRoot`.
- **Scores.** Expansion 2 and drift 1, from RX-16 and RX-M2.
- **Files.** `src/eslint/jsx.ts`, `stories/mirror.ts`, `src/js/usage/contract.ts`.
- **Components.** Card, Search, TableWrap, and every part with a mapped prop.
- **Visual change.** No.
- **Public API.** None. ESLint reports new findings on raw mapped attributes.
- **Codes and checkers.** ESLint lowering output. Codes stay.
- **Tests.** `tests/eslint-jsx.test.ts` places, `tests/mirror.test.ts`, and the `odd-card-004`, `odd-search-004`, and `odd-table-002` fixtures.
- **Verification.** `<Badge data-tone="nope">` reports `ODD-BADGE-002` in ESLint, and `bun run check` passes.

### B-25. One enhancer registry

- **Fix.** Export one table of selector and enhancer rows from `src/js/enhance.ts`, and have `enhance()` iterate it. After B-16, the preview and the stories call `enhance(canvasElement)`.
- **Scores.** Expansion 2 and drift 1, from JS-04 and DOC-10.
- **Files.** `src/js/enhance.ts`, `.storybook/preview.ts`, `stories/Controls.stories.ts`, `stories/Feedback.stories.ts`.
- **Components.** Every enhanced component.
- **Visual change.** No. The HTML preview starts running stepper, range field, log, and the fallbacks on every story.
- **Public API.** Additive if the table is exported.
- **Codes and checkers.** None.
- **Tests.** `tests/stories.test.ts`, and the a11y addon rechecks every mirrored story.
- **Verification.** `bun run test:browsers` passes with 0 diagnostics and 0 axe violations.

### B-26. Token source cleanup

- **Fix.** Trim the z ladder to rungs page content uses, add a skip-link rung, and say in a comment that top-layer overlays need none. Decide whether `--accent-foreground` stays in the palette contract with no CSS consumer. Rewrite the `index.css` layer comment to name derived tokens and status defaults in foundations. Document the space scale as ordinal steps.
- **Scores.** Expansion 2 and drift 1, from CSS-20, CSS-21, and CSS-22. CSS-21 and CSS-22 are PLAUSIBLE.
- **Files.** `src/css/foundations.css`, `src/css/base.css`, `src/css/index.css`, `src/js/contract.ts`.
- **Components.** None visibly. The skip link.
- **Visual change.** No.
- **Public API.** Breaking for consumers who read a removed token. That needs a deprecation note. Comment-only changes are none.
- **Codes and checkers.** None.
- **Tests.** `tests/contract.test.ts` and `tests/palette.test.ts` if `--accent-foreground` leaves the contract.
- **Verification.** The generated token graph shows no unused rung, and `bun run check` passes.

### B-27. Overlay geometry tokens

- **Fix.** Add `--overlay-gutter`, an `--overlay-width-*` ladder, `--overlay-enter-scale`, and `--overlay-enter-offset` to `foundations.css`, and read them in each overlay. Keep sheet's 3rem gutter as a named exception if it is deliberate.
- **Scores.** Expansion 2 and drift 1, from CSS-02 and CSS-M1.
- **Files.** `src/css/foundations.css`, `src/css/components/dialog.css`, `sheet.css`, `popover.css`, `menu.css`, `toast.css`.
- **Components.** Dialog, Sheet, Popover, Menu, Toast, and the parked tooltip and hover card through the shared popover rule.
- **Visual change.** None if values are kept.
- **Public API.** Additive.
- **Codes and checkers.** None.
- **Tests.** None.
- **Verification.** The scanner shows no `shared --overlay-*` rows, and the overlay stories capture identically before and after.

### B-28. React helper for self-enhancing parts, and a narrower client boundary

- **Fix.** Add one helper, such as `enhanced("Tabs", { once, everyCommit })`, in its own `"use client"` file beside `part.ts`. Move Tabs, Toaster, Menu, and Table onto it. Drop the file-level directive from `menu.tsx` and `table.tsx` so `MenuItem`, `TableWrap`, and `TableSort` stay server-safe. Add every client module to the smoke test's list.
- **Scores.** Expansion 2 and drift 1, from RX-01, RX-11, and RX-M1.
- **Files.** `src/react/tabs.tsx`, `toast.tsx`, `menu.tsx`, `table.tsx`, one new helper file, `scripts/consumer-smoke.ts`, `docs/usage/react.md`.
- **Components.** Tabs, Toaster, Menu, MenuItem, Table, TableWrap, TableSort.
- **Visual change.** No.
- **Public API.** None. The exports and props stay.
- **Codes and checkers.** None.
- **Tests.** The `tests/react.test.tsx` markup and behavior rows pass unchanged. `scripts/consumer-smoke.ts` checks the new list.
- **Verification.** `bun run check` and the consumer smoke pass. The packed `menu.js` and `table.js` match the directive the docs state.

### B-29. One story wiring helper

- **Fix.** Export one typed helper from `stories/mirror.ts` whose `wire(root)` returns a cleanup, and one `mount` for hand-written stories. Migrate the ten call sites.
- **Scores.** Expansion 2 and drift 1, from DOC-03.
- **Files.** `stories/mirror.ts`, `.storybook/preview.ts`, `.storybook-react/preview.ts`, and the Controls, Feedback, Layout, Foundations, Showcase, CustomPalette, Menu, Slider, and Toast stories.
- **Components.** None. Story behavior only.
- **Visual change.** No.
- **Public API.** None.
- **Codes and checkers.** None.
- **Tests.** `tests/stories.test.ts` if it reads `play`, and `tests/mirror.test.ts`.
- **Verification.** The behavior stories work in both Storybooks, including on a Docs page, which closes the two known `play` items.

### B-30. `part.ts` derives enum props, role-gated names, and required-prop messages

- **Fix.** Add an enum member to `Contract` for each `enum` rule whose attribute is not in `props`, not pinned, and not covered by `Exclusive`, and delete the six hand lines. Point Avatar at `RoleWithName` and delete its local helper. Give `Pinned` and `Named` parts the generic call signature `RoleWithName` uses, so a missing required key prints the code.
- **Scores.** Expansion 2 and drift 1, from RX-03, RX-04, and RX-06.
- **Files.** `src/react/part.ts`, `avatar.tsx`, `separator.tsx`, `popover.tsx`, `table.tsx`, `button.tsx`, `dialog.tsx`, `sheet.tsx`, `menu.tsx`, `skeleton.tsx`, `choice.tsx`, `slider.tsx`, `toast.tsx`.
- **Components.** Avatar, AvatarGroup, Separator, Popover, TableWrap, Button, Dialog, Sheet, Menu, MenuItem, Skeleton, Switch, Slider, Toaster.
- **Visual change.** No.
- **Public API.** None for valid code. Error text changes for invalid code.
- **Codes and checkers.** None. TypeScript now prints existing codes.
- **Tests.** The `failures` map in `tests/react.test.tsx` for about 13 fixtures, such as `dialog-name`, `menu-name`, and `toaster-aria-label`. `avatar-role`, `separator-role`, `popover-role`, and `button-aria-current-value` must keep failing with the same text.
- **Verification.** `bun run check` passes, and each changed fixture prints its `ODD-` code.

### B-31. One name for the action row

- **Fix.** Choose one name for the bottom row of buttons in Dialog and Sheet, and alias or rename the other in the next breaking window. Record the card footer as a content row.
- **Scores.** Expansion 2 and drift 1, from DOC-14.
- **Files.** `src/js/usage/contract.ts`, `src/react/dialog.tsx`, `src/react/sheet.tsx`, `src/css/components/dialog.css`, `sheet.css`, `docs/usage/dialog.md`, `sheet.md`, `react.md`, `README.md`, and the Dialog, AlertDialog, Toast, and Sheet stories.
- **Components.** Dialog, Sheet.
- **Visual change.** No.
- **Public API.** Breaking if renamed, additive if aliased.
- **Codes and checkers.** Dialog and Sheet part codes and messages.
- **Tests.** `tests/react-public-api.test.ts`, the Dialog and Sheet rows in `tests/react.test.tsx`, and their fixtures.
- **Verification.** `bun run check` and `tests/react-public-api.test.ts` show the intended export change only.

### B-32. Shared size tokens in `foundations.css`

- **Fix.** Add `--target-min`, `--icon-sm` and `--icon-md`, `--checkbox-size`, `--leading-none`, `--surface-padding-compact`, `--avatar-size`, and an input inset factor to `foundations.css`, and read them where the scanner lists the literals. Decide whether the menu item height joins the control-height ladder. The classifier-only names listed in section 3 can land here too.
- **Scores.** Expansion 2 and drift 1, from CSS-06, CSS-08, CSS-09, CSS-18, and CSS-M4. CSS-M2 adds expansion 1 and drift 1.
- **Files.** `src/css/foundations.css` and about 16 component stylesheets (alert, avatar, badge, button, choice, estop, field, log, menu, popover, search, skeleton, slider, table, tabs, toast).
- **Components.** Most components.
- **Visual change.** None if values are kept. Toast padding scales with density under glass and bubblegum if it moves to the compact token.
- **Public API.** Additive.
- **Codes and checkers.** None.
- **Tests.** None.
- **Verification.** The scanner shows no `shared` or `missing-scale` rows for the listed names, and the full story capture matches before and after.

### B-33. Story layout helpers

- **Fix.** Add an auto-fill mode to `odd-grid`, justify and align attributes to `odd-row`, a plain fieldset class, and a frame width parameter that both previews apply in a decorator. Migrate the inline lines.
- **Scores.** Expansion 2 and drift 1, from DOC-04, DOC-05, DOC-06, and DOC-M1.
- **Files.** `src/css/base.css`, `src/css/components/shell.css`, both Storybook previews, `README.md`, and about 18 story files.
- **Components.** Layout utilities. Story frames only.
- **Visual change.** Small, within 2rem per story, if widths snap to fewer sizes.
- **Public API.** Additive (new attributes and a class), with `CLASS_REGISTRY` entries if pinned.
- **Codes and checkers.** Usage rules for new attributes, if pinned.
- **Tests.** `tests/stories.test.ts` and the HTML and React pair comparison.
- **Verification.** Capture both Storybooks before and after and explain every diff.

### B-34. Contract rows and pages for the five uncovered components

- **Fix.** Add `USAGE` groups, usage pages, and fixtures for estop and shell first, because they need no new helper. Port log after B-28 with React-owned lines. Keep range field and stepper vanilla until script-set attributes are in the contract, and mark them unchecked in the README until then.
- **Scores.** Expansion 2 from DOC-18 and drift 1. RX-17 adds expansion 1 and drift 1.
- **Files.** `src/js/usage/contract.ts`, `src/js/usage/format.ts`, new `src/react/*.tsx` modules, new pages in `docs/usage/`, `README.md`, `scripts/consumer-smoke.ts`, mirrored stories, and fixtures.
- **Components.** E-stop, Shell, Log, Range field, Stepper.
- **Visual change.** No.
- **Public API.** Additive.
- **Codes and checkers.** New code families in all three checkers.
- **Tests.** New usage and type fixtures per code, new `tests/react.test.tsx` rows, and `tests/react-public-api.test.ts`.
- **Verification.** The matrix in section 2 shows each ported component with every column filled, and `bun run check` passes.

### B-35. Import `DEFAULT_APPEARANCE` in the Storybook config

- **Fix.** Import `DEFAULT_APPEARANCE` in `.storybook/preview.ts` and `stories/catalog.ts`.
- **Scores.** Expansion 1 and drift 1, from DOC-19, which is PLAUSIBLE.
- **Files.** `.storybook/preview.ts`, `stories/catalog.ts`.
- **Components.** None.
- **Visual change.** No.
- **Public API.** None.
- **Codes and checkers.** None.
- **Tests.** `tests/stories.test.ts`.
- **Verification.** `bun run check` passes, and the Storybook toolbar opens on calm, default, system.

### B-36. `system-data` rules for Field and Choice

- **Fix.** Add a `system-data` rule to `field`, `fieldControl`, `fieldError`, `choice`, and `switch` under new codes. Extend `Contract` to Field, Hint, and Label so the rule types them.
- **Scores.** Expansion 1 and drift 1, from RX-02.
- **Files.** `src/js/usage/contract.ts`, `src/js/usage/format.ts`, `src/react/field.tsx`, `docs/usage/field.md`, `choice.md`, `react.md`, plus fixtures.
- **Components.** Field, Label, Input, Textarea, Select, Hint, FieldError, Choice, Switch, Segmented.
- **Visual change.** No.
- **Public API.** Breaking for TypeScript callers who pass a system `data-*` to these parts.
- **Codes and checkers.** Two new codes, such as `ODD-FIELD-004` and `ODD-CHOICE-004`, in all three checkers.
- **Tests.** Two usage fixture pairs, at least two type fail fixtures, the `failures` map, and the ESLint places in `tests/eslint-jsx.test.ts`.
- **Verification.** `<Input data-tone="danger" />` fails `tsc`, ESLint, and `checkRoot` with the new code.

## Rejected during verification

The cross-provider verifiers rejected 12 findings, and the lead rejected DOC-M2 during the report review. None of the 13 appears in sections 2 to 5.

- CSS-23. Every chrome restates `--radius-chip` and the two font roles, which is the chrome contract. The token-file check is a scale gap or a role left to a default, and `999px` is the pill exception.
- JS-05. Typing menu items, typing tabs, syncing a header box, and pinning log scroll are different jobs. The three symptoms stay separate known items.
- JS-09. Function names and file homes are not a prop, attribute, or option spelled differently, which is what the one-off API rule covers.
- RX-05. Each of the five name encodings is a recorded choice for a different gate, and those reasons still hold.
- RX-09. Split and shared sub-part `system-data` codes already follow "own code when the fix differs," and the messages say so.
- RX-10. The reference Badge module exports no value alias, and the uniformity plan keeps existing export names.
- RX-13. The Field plan chose "No fixture per control" on purpose, and each part binds a rule that a sibling fixture covers.
- RX-14. The React-only `htmlFor` and `id` requirements are the recorded Field design.
- RX-15. Each omit list follows its component's CSS, and each value set is recorded in its plan.
- DOC-13. Two phrasings of one checker rule across the usage pages do not ship two attributes.
- DOC-16. The sidebar titles and the `Progress` export keep story ids that `tests/stories.test.ts` pins, and the plans record that.
- DOC-17. The estop and log stylesheet comments name `inline-size` and `max-block-size` as the sizing API.
- DOC-M2. The custom-palette color wells are 4rem wide (`stories/CustomPalette.stories.ts:53` (`inline-size: 4rem`)). That equals `--space-10` by value only. A color-well width is not a spacing role, so rule 3 does not apply, and the verdicts file says the same.

## Outside this rubric

The seams found these problems, and no rule in the plan covers them. They are listed for Caleb to route to `docs/follow-ups.md`.

- `FIRST_PAINT_SCRIPT` writes saved appearance values without checking them (`src/js/appearance.ts:36` (`export const FIRST_PAINT_SCRIPT`)), while `loadAppearance` checks each against `MODES`, `PALETTES`, and `CHROMES` (`src/js/appearance.ts:18` (`export function loadAppearance`)). A stale palette name paints with no palette until the app's own load runs. This is inferred from the source, not run.
- `applyPalette` reuses one `style` element by id (`src/js/palette.ts:200` (`doc.getElementById(id)`)). Two callers with the same name share it, and the first cleanup removes it for both. The holder enhancers count callers, and this function does not.
- `avatarFallback` has a platform-fallback name and lives in `enhance.ts`, though it is a component enhancer (`src/js/enhance.ts:23` (`export function avatarFallback`)). `enhanceSelectAll` is the only `enhanceX` without its own module, and `typeTabs` is a third name shape. The verifier rejected this as a one-off API (JS-09), and the facts stand as a naming note.
- Showcase writes the three modes as a literal instead of importing `MODES` (`stories/Showcase.stories.ts:114`). The verifier split it from DOC-19.
- `src/js/fallbacks.ts` has no unit test, so no call-twice or cleanup case covers the fallbacks.

## Limits

- The scanner reads literals in files. It does not see a value a script sets at runtime through `element.style`, and a `${…}` interpolation reads as nothing.
- The literal scan covers stylesheets, stories, the Storybook previews, and `src/react/`. It does not cover `src/js/`, so the toast close glyph has no row (JS-10). The JS seam reviewer checked `src/js/` by hand and found no other visual literal.
- Stories are read through five inline-style forms (`style="…"` and `<style>` in strings, `cssText`, `.style.prop`, `setProperty`, and object styles with string values). Other forms are invisible.
- A bare `0` is never a literal except on a unitless property, so `outline-offset: 0` has no row. A unitless number counts only as a factor beside a `var()` inside `calc()`, `min()`, `max()`, or `clamp()`, and `* 1`, `* -1`, and `/ 2` are skipped.
- A custom property's category comes from its name only.
- Verdicts are keyed by file, property, and value, so one verdict covers every line in a file with the same key.
- The token graph does not see names built at runtime. `stories/Foundations.stories.ts` builds some, so a token it reads that way can appear unused.
- The drift renders ran in headless Chrome only, with the default palette, at 1280 by 900. Firefox and WebKit were not rendered for drift.
- JS-03 was not rendered, because no story has an `aria-disabled` tab. The ring-on-surface half of CSS-16 was not rendered, because no story puts an avatar group in a card.
- A drift score of 2 means the finding was not rendered. A render could raise it to 3 or lower it to 1.
- The JS findings were measured in happy-dom 21, not a browser. The React findings used `tsc`, ESLint's `Linter`, and `checkRoot` under happy-dom.
- Each seam's findings passed one verifier on a different provider. The verifiers found the `-M` findings, and they were checked against the source while this report was written. No second verifier read them.
- Shared names with no finding in section 3 carry only the classifier's verdict.
- Expansion and drift scores are judgments. The inputs sit beside every finding and every backlog item.
