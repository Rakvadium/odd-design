# React Table plan

`odd-design/react` gains three parts. `TableWrap` renders `div.odd-table-wrap` and `TableSort` renders `button.odd-table-sort`, both through `part()`. `Table` renders `table.odd-table` and runs `enhanceSelectAll` on itself in a layout effect after every commit. The caption, the sections, the rows, the cells, `data-numeric`, `aria-sort`, and every checkbox stay native, because no rule a part could type reaches them. The browser owns each checkbox's checked state. `enhanceSelectAll` owns the header box's `checked` and `indeterminate`, and it changes rows only by clicking them, as a user would. It writes no attribute and moves no node, so React owns every node it renders.

Five new codes, ODD-TABLE-001 to 005, cover the failures a browser shows on the three classed elements. They use existing rule kinds only. The wrap's region rows are Popover's shape (`enum role`, `accessible-name` keyed on role, `name-requires`) with Table's own values and codes, so they are not a shared tuple. What the two parts share is the type that turns those rows into props. Popover's private `RoleWithName` moves into `part.ts`, reads its codes and names from the rows, and serves both `Popover` and `TableWrap`.

`enhanceSelectAll` changes in two ways that HTML callers also get. It calls `row.click()` on each row it changes instead of setting `checked` and dispatching `change`, so React's `onChange` sees select-all. It finds the header box on every sync instead of once at call time, so a header box mounted or replaced later is found.

The work ships as one PR on `feat/react-table`, based on `eac9863` (Menu, PR #38). It is built as three commits after this plan, and each commit ends in a check. Nothing merges or deploys.

Caleb granted overnight autonomy for this run. The build starts after this plan is committed and uses the default in each decision below. The run stops when the PR is open and its checks report.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, and verifies.

The design came from two architect runners and a cross-judge. Both runners converged on the same three parts, native cells, a self-enhancing `Table`, `row.click()` in `enhanceSelectAll`, a region contract that stays silent on a bare wrap, the same preview line, and the same story move. They split on codes and kinds. The Opus runner shipped five codes from existing kinds and a per-commit resync. The Grok runner shipped nine codes, three new rule kinds, a holder, and a `MutationObserver`. The `cursor grok-4.7` judge picked the Opus design and named three grafts. This plan takes one of them. The records are local scratch in the gitignored `.verify/table/` folder of this worktree (Appendix C).

## Usage

```tsx
import { Badge, Table, TableSort, TableWrap } from "odd-design/react";

<TableWrap tabIndex={0} role="region" aria-labelledby="decks-caption">
  <Table>
    <caption id="decks-caption">Your decks, sorted by name</caption>
    <thead>
      <tr>
        <th scope="col"><input type="checkbox" data-select-all aria-label="Select all decks" /></th>
        <th scope="col" aria-sort="ascending"><TableSort onClick={() => sortBy("name")}>Deck</TableSort></th>
        <th scope="col" data-numeric><TableSort onClick={() => sortBy("cards")}>Cards</TableSort></th>
      </tr>
    </thead>
    <tbody>
      {decks.map((deck) => (
        <tr key={deck.id}>
          <td><input type="checkbox" aria-label={`Select ${deck.name}`} checked={selected.has(deck.id)} onChange={() => toggle(deck.id)} /></td>
          <th scope="row">{deck.name}</th>
          <td data-numeric>{deck.cards}</td>
        </tr>
      ))}
    </tbody>
  </Table>
</TableWrap>;
```

A table that can never overflow drops the region, as the `table.css` comment allows: `<TableWrap><Table>…</Table></TableWrap>`. Rows may be controlled or uncontrolled. The header box stays uncontrolled, because `Table` owns it. A header click reaches each changed row's `onChange` once.

| Part | Element | Props from the contract |
| --- | --- | --- |
| `TableWrap` | `div.odd-table-wrap`, `part()` | `role?: "region"`. `tabIndex`, `aria-label`, or `aria-labelledby` with no `role` is the ODD-TABLE-002 message. `role="region"` with no name is the ODD-TABLE-003 message. A system `data-*` is the ODD-TABLE-004 message |
| `Table` | `table.odd-table`, `"use client"`, self-enhancing after every commit | A system `data-*`, `data-numeric` included, is the ODD-TABLE-004 message. `ref` reaches the `table` |
| `TableSort` | `button.odd-table-sort`, `part()` | `aria-sort` is the ODD-TABLE-005 message. A system `data-*` is the ODD-TABLE-004 message |
| (no part) | `caption`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td`, every checkbox | No class, so no rule reaches them |

## Contract

Each failure below was measured in Firefox and WebKit at `eac9863`, beside a good control (`.verify/table/candidate-opus/probes/static.txt`).

| Code | Group, kind | Fails when | What breaks | TypeScript |
| --- | --- | --- | --- | --- |
| `ODD-TABLE-001` | all three, `element` | `odd-table-wrap` not on a `div`, `odd-table` not on a `table`, `odd-table-sort` not on a `button` | A `span` wrap does not scroll, so the table runs past the frame. A `p` wrap ends before the table, which falls out of the border. `odd-table` on a `div` around the table leaves the table 128px wide in Firefox and 134px in WebKit, against 898px. A `span` sort is out of the Tab order. An `a` sort is underlined, and WebKit's Tab skips it | Not a type error. The parts render their tags |
| `ODD-TABLE-002` | `tableWrap`, `enum role` and `name-requires role` (names `tabindex`, `tabIndex`, `aria-label`, `aria-labelledby`) | The wrap has `tabindex` or a name and no `role`, or a role other than `region` | The tree shows no region, and focus lands on an unnamed generic. `role="group"` is announced as `group "Your decks"` | No `role` beside them is the 002 message. `role="group"` is not assignable to `"region"` |
| `ODD-TABLE-003` | `tableWrap`, `accessible-name` keyed on `role` | `role="region"` with no non-blank name | The tree shows `- region:` with no name | The 003 message |
| `ODD-TABLE-004` | all three, `system-data` | A system `data-*` on the wrap, table, or sort button | `data-numeric` on the wrap or the table does nothing there, so the numbers stay start-aligned. On the sort button the `th` stays start-aligned over end-aligned cells, and the arrow does not move to the start (`flex-direction` stays `row`) | The 004 message on all three parts |
| `ODD-TABLE-005` | `tableSort`, `forbidden-attribute aria-sort` | `aria-sort` on the sort button | The sorted column's arrow stays the neutral `↕` at half opacity. The control shows `↑` | The 005 message |

`tabIndex` is listed beside `tabindex`, because the JSX lowering keeps `tabIndex` camelCase. Card's ODD-CARD-004 rows list both spellings the same way.

Not added, each with its reason:

- **A missing `tbody`.** Built and dropped by the Opus runner. ESLint's HTML parser does not insert `tbody` the way a browser does, so repaired HTML failed lint, and a header-only table failed too. React already warns in dev.
- **A wrap that can overflow with no `tabindex`.** The CSS comment allows dropping the region when the table cannot overflow, and no checker sees overflow.
- **A sort button wrapped inside `th[aria-sort]`, two sorted columns, and a select-all box outside `thead`.** The Grok runner measured each one (neutral arrow, two arrows, a box that checks only itself). Each needs a kind that reads descendants by tag or a parent. They go to `docs/follow-ups.md`.
- **`type="button"` on `TableSort`.** A sort click inside a form submits it in both engines (measured). Tab buttons and menu items have the same failure, and `docs/follow-ups.md` already holds one cross-part fix for it. The follow-up is widened to name `TableSort`.

## Shape

### Rows

```ts
tableWrap: [
  { kind: "element", code: "ODD-TABLE-001", className: "odd-table-wrap", elements: ["div"] },
  { kind: "enum", code: "ODD-TABLE-002", attribute: "role", values: ["region"], omit: [] },
  { kind: "name-requires", code: "ODD-TABLE-002", attribute: "role", names: ["tabindex", "tabIndex", "aria-label", "aria-labelledby"] },
  { kind: "accessible-name", code: "ODD-TABLE-003", attribute: "role", names: ["aria-label", "aria-labelledby"] },
  { kind: "system-data", code: "ODD-TABLE-004" },
],
table: [
  { kind: "element", code: "ODD-TABLE-001", className: "odd-table", elements: ["table"] },
  { kind: "system-data", code: "ODD-TABLE-004" },
],
tableSort: [
  { kind: "element", code: "ODD-TABLE-001", className: "odd-table-sort", elements: ["button"] },
  { kind: "forbidden-attribute", code: "ODD-TABLE-005", attribute: "aria-sort" },
  { kind: "system-data", code: "ODD-TABLE-004" },
],

TableWrap: { source: "odd-design/react", className: "odd-table-wrap", props: {}, element: "div" },
Table: { source: "odd-design/react", className: "odd-table", props: {}, element: "table" },
TableSort: { source: "odd-design/react", className: "odd-table-sort", props: {}, element: "button" },
```

No new rule kind. `check.ts`, `jsx.ts`, `html.ts`, `dom.ts`, the mirror, the CSS, `CLASS_REGISTRY`, and `VOCABULARY` do not change. No row maps a prop, so `usage-contract.test.ts` needs no `SHARED_STYLESHEET` entry.

### `RoleWithName`

Popover's private conditional type moves to `part.ts` and takes the rule as a parameter. It reads the role values from the `enum` row, the names and code of `accessible-name`, and the names and code of `name-requires`. A name key is typed `unknown`, so `tabIndex={0}` enters the 002 branch. `popover.tsx` drops its copy in the same commit, and Popover's fail and pass fixtures print the same messages.

### `enhanceSelectAll`

- The header box is found with `thead input[type="checkbox"][data-select-all]` on every sync and every `change`, not once at call time (graft from the Grok runner through the judge). A table with no header box stays a no-op in outcome.
- A header change reads `all.checked` once, then calls `row.click()` on each enabled row that differs. A click fires `click`, `input`, and `change` as a user's click does, so React raises `onChange`. A row `click` listener that calls `preventDefault` now keeps that row unchanged, as it would for a user. Disabled rows are still skipped.
- No holder. Two wires converge because the loop clicks only rows that differ, measured with `StrictMode` beside `enhance(document)`.

### The parts

```tsx
export const TableWrap: <const P extends TableWrapProps>(props: RoleWithName<P, TableWrapRule> & TableWrapProps) => ReactElement = part("TableWrap");

export function Table({ ref, ...props }: TableProps): ReactElement {
  const root = useRef<HTMLTableElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  useLayoutEffect(() => enhanceSelectAll(root.current!));
  return createElement(WRAPPERS.Table.element, { ...lower("Table", props), ref: root });
}

export const TableSort: (props: TableSortProps) => ReactElement = part("TableSort");
```

The layout effect has no dependency list. React writes `checked` as a property and fires no `change`, so a "Clear" button or an added row would leave the header stale after a run-once effect (measured: mixed over three unchecked rows). Rewiring after every commit resyncs the header. A memoized row list that re-renders without `Table` still goes stale, and `docs/usage/table.md` says so.

### The story

| Story id | File | Change |
| --- | --- | --- |
| `components-data-display--table` | `stories/mirrored/Table.stories.ts`, title `Components/Data Display`, export `Table` | Moved from `stories/DataDisplay.stories.ts`, which keeps `AvatarFallback`. The scene is today's markup from `TableWrap`, `Table`, `TableSort`, and `Badge`, with native caption, sections, rows, cells, links, and checkboxes. Row two uses `defaultChecked`. The `aria` literal pins the mixed header box, so a side that skips select-all fails the pair sweep |

The HTML preview gains one line beside tabs, toasters, and menus: `table:has([data-select-all])` to `enhanceSelectAll`, `enhance()`'s own selector.

## Decisions taken under the autonomy grant

Each item is the default the build uses. Each one can be reversed after review.

1. **Three parts, `TableWrap`, `Table`, and `TableSort`.** Each classed element carries a rule its type enforces. Native cells stay plain.
2. **Conditional region contract.** A bare wrap passes, as the CSS comment allows. `tabindex` or a name requires `role="region"`, and the region requires a name.
3. **Five codes from existing kinds.** The three descendant failures the Grok runner measured go to follow-ups, not three new kinds in this port.
4. **`row.click()` for everyone.** Without it, controlled React rows snap back and the header shows "all" over one checked row (measured in both engines).
5. **Per-commit resync over a `MutationObserver`.** An observer does not see React's property writes (measured stale after Clear).
6. **`RoleWithName` shared with Popover.** One type for the same three-row shape, not two copies.
7. **No `type="button"` pin on `TableSort`.** One cross-part fix for every button part, in the existing follow-up.
8. **One preview line, not `enhance(canvasElement)`.** The Menu decision.

## Capture the baseline (no source change)

- [x] Build both Storybooks at `eac9863` with `bun scripts/storybooks.ts .verify/table/base-sb`, serve the build, and capture the HTML section with `bun scripts/capture-stories.ts http://localhost:6811/html .verify/table/base.json .verify/table/base-shots`. Result: 86 captures.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check.

### Commit 1. Add TableWrap, Table, and TableSort and check them

- [x] Add `USAGE.tableWrap`, `USAGE.table`, `USAGE.tableSort`, the three rule types, the three `WRAPPERS` rows, ODD-TABLE-001 to 005 in `USAGE_CODES`, and their `MESSAGES`. The 004 message says `data-numeric` belongs on the `th` and its cells and does nothing on the wrap or table. The 005 message names only the arrow. Result: the rows and the `WRAPPERS` lines are the ones under Shape, after `menuItem` and `MenuItem`. The 004 fix says `table.css` reads `data-numeric` on a `th` and its `td` cells, so on the wrap or the table it does nothing, and on a sort button the header stays start-aligned and the arrow stays after the label. It no longer says the wrap or the table leaves the numbers start-aligned. The 005 problem says only that the arrow stays the neutral up-down mark, and its screen reader sentence is gone (`.verify/table/build/types/fail.txt`).
- [x] Change `enhanceSelectAll` to find the header box on every sync and to click the rows it changes. Update its doc comment. Result: a `header()` query replaces the `all` constant, and `sync` and the `change` handler each call it. The handler reads `all.checked` once, then clicks each enabled row that differs. A table with no header box gets a listener whose `sync` returns early, so the outcome is still a no-op. The doc comment names the click and the late header box.
- [x] Move `RoleWithName` into `part.ts` and migrate `popover.tsx`. Create `src/react/table.tsx`. Add the barrel export and the `WrapperProps` lines. Result: `RoleWithName<P, Rule>` reads the role values, names, and codes from the rows, and `popover.tsx` drops its 12-line copy. The six Popover fail fixtures print the same 14 lines as at the base (`.verify/table/build/types/popover-base.txt` and `popover-after.txt`). `src/react/table.tsx` is 32 lines with `"use client"`. Deviation: `part.ts` had a private `Names<Rule>` for `Named`, and it is folded into the new `NameKeys<Rule, Kind>`, so `Named` and `RoleWithName` read the names one way. The Dialog, Sheet, and Menu fail fixtures still pass.
- [x] Write `docs/usage/table.md` with the HTML and React setup, the select-all behavior, the controlled-row note, and one section per code. Add it to `REQUIRED` in `scripts/consumer-smoke.ts`. Result: the page has the HTML setup, the wrap, `data-numeric`, `aria-sort`, and select-all behavior, the React setup, the controlled-row note (React writes `checked` with no `change` event, so `Table` resyncs on every render, and a memoized row list that re-renders alone leaves the header stale), and five sections. The 004 and 005 sections match the messages. `REQUIRED` lists `table.md` after `menu.md`.
- [x] Add bad and good HTML pairs for 001 to 005, the `RUNTIME_CODES` lines, and the `places` rows. Move the table lines in `odd-class-001.good.html` onto valid tags. Result: ten fixture pages, five `RUNTIME_CODES` lines, and five `places` entries in `tests/eslint-html.test.ts`. `odd-table-001.bad.html` covers a `span` wrap, a `div` table, a `span` sort, and an `a` sort. `odd-table-004.bad.html` covers `data-numeric` on the wrap, the table, and the sort button, and `data-tone` on the table. `odd-class-001.good.html` writes one valid wrap, table, and sort button.
- [x] Add the six type fail fixtures, their `failures` entries, and a `pass.tsx` block with a ref, controlled rows, a bare wrap, an `aria-label` region, and an app `data-*`. Add a JSX usage fixture and its `places` entry if the ESLint JSX test keeps one per family. Result: `table-wrap-tabindex`, `table-wrap-name`, `table-data-numeric`, `table-sort-aria-sort`, and `table-sort-data-numeric` print ODD-TABLE-002, 003, 004, 005, and 004. `table-wrap-role` prints `'"group"' is not assignable to type '"region"'` (`.verify/table/build/types/fail.txt`). `pass.tsx` gains `DeckTable`. The ESLint JSX test keeps one fixture per family, so `tests/fixtures/usage/jsx/table.tsx` gives eight diagnostics at their places, one per code with two 002s and two 004s, and ODD-STATIC-001 on a spread.
- [x] Add one markup row to `tests/react.test.tsx`, and one test: under `StrictMode` beside `enhance(document)`, a header click reaches `onChange` for exactly the unchecked rows and the header reads checked; a Clear button leaves every row and the header unchecked; a header box rendered after mount is found. Result: the row renders a named region around a table with a caption and a `button.odd-table-sort` under `th[aria-sort]`. The test starts at rows `[false, true, false]` and `mixed`. A header click gives `onChange` for `a` and `c` only, rows all checked, and `checked`. Clear gives all unchecked and `unchecked`. A `SelectAll` component then remounts the header box from its own state, so `Table` does not render again, and a click on the new box gives `onChange` for `a`, `b`, and `c` and `checked`.
- [x] Check. A mutation that restores the set-and-dispatch loop, one that gives the effect `[]` deps, and one that finds the header once each fail a test. Result: `bun run check` passes 661 tests (`.verify/table/build/check-commit1.txt`). `.verify/table/build/mutate.ts` ran the three mutants against this commit's tree, and each fails the Table test (`build/mutations.txt`). Set-and-dispatch reaches no `onChange`. `[]` deps leave the header `checked` after Clear. Finding the header once leaves every row unchecked after the late header box is clicked.

### Commit 2. Mirror Table in the Storybooks

- [x] Create `stories/mirrored/Table.stories.ts` and remove `Table` from `stories/DataDisplay.stories.ts`. Add the preview line. Measure the `aria` literal in the built Firefox Storybook, then paste it. Result: the scene is `TableWrap` with the region and name, `Table`, the native caption, a header row with the select-all box, three `TableSort` buttons, and two plain headers, four rows with a link and a `Badge`, and the `tfoot`. Row two uses `defaultChecked`. `DataDisplay.stories.ts` keeps `AvatarFallback` and drops its `enhanceSelectAll` import. The HTML preview runs `enhanceSelectAll` on `table:has([data-select-all])` beside tabs, toasters, and menus. Both sides give the same snapshot in Firefox, with `checkbox "Select all decks" [checked=mixed]`, and it equals the literal in the story line for line (`.verify/table/build/aria-c2-firefox.txt`, from `build/measure/aria.spec.ts`).
- [x] Pin `components-data-display--table` in `tests/stories.test.ts`. Result: the pins end with the id, and it passes the HTML-equals-React and `checkRoot` loops.
- [x] Loop the select-all test in `e2e/behavior.spec.ts` over `html` and `react`. Result: one loop over both Storybooks. The steps and expected states are unchanged, and both sides pass them in both engines.
- [x] Check. `bunx playwright test e2e/usage.spec.ts e2e/behavior.spec.ts` passes in Firefox and WebKit with 0 diagnostics. Result: `bun run check` passes 663 tests (`.verify/table/build/check-commit2.txt`). Against `build/sb-c2`, served by `python -m http.server 6771` and run from `build/pw.config.ts`, 64 passed and 2 skipped, the WebKit usage sweep and sidebar test, which run in Firefox only. Firefox reports "71 stories, 0 diagnostics", and the four select-all tests pass (`browsers-c2.txt`).

### Commit 3. Docs, smoke, and the verify recipe

- [x] In `docs/usage/react.md`, list the parts, add `Table` to the self-enhancing parts and `table.tsx` to the `"use client"` files, and add the type-error rows. Add a Table section to `docs/usage/eslint.md`. Name the parts in the README row, the React install sentence, and the usage-contract list. Result: `react.md` lists `TableWrap`, `Table`, `TableSort`, and `table.tsx`, names `table.tsx` with the `"use client"` files and `Table` with the parts that wire themselves, and adds ODD-TABLE-002 to 005 rows, a `TableWrap` `role` in the allowed-value row, and ODD-TABLE-001 with the raw-markup-only codes. Each row matches a fail fixture or `.verify/table/build/types/probe.txt`, where `aria-label` alone and `aria-labelledby` alone print 002, `role="region"` alone prints 003, `data-tone` on `Table` and `TableSort` prints 004, and a blank `aria-label` compiles. `eslint.md` gains "Table from odd-design/react", and each claim matches `build/lint/probe.txt` or the JSX fixture. A computed `data-numeric` still reports 004, and a computed `role` or a spread on `TableWrap` gives only ODD-STATIC-001. The README row names the wrap `div`, the sort `button`s, `enhanceSelectAll`, and the three parts, and the install sentence and the usage-contract list name them and link `table.md`. Deviation: `react.md` also gains a short "Build a table" section before "Read a type error", as Tabs and Toast have, so the self-enhancing claim and the controlled-row note have a home there.
- [x] Update `.agents/skills/verify-odd-design/features/data-display.md` for the React side and drop its "Table has no React wrapper" line. Result: a React Table section points at `react_components-data-display--table`, the `aria` literal with the mixed header box, and `-g select-all`. The "Table has no React wrapper" sentence is gone. The sidebar line says Avatar Fallback, Avatar, Separator, and Table. The built HTML `index.json` lists those four. The React `index.json` lists Avatar, Separator, and Table, which load from `stories/mirrored/`, because Avatar Fallback stays in `stories/DataDisplay.stories.ts`.
- [x] Add the follow-ups in Appendix D to `docs/follow-ups.md`, and widen the tab-button `form` follow-up to name every button part. Result: seven lines after the Menu entries, tagged React Table. Six are Appendix D, and the seventh is the blank `aria-label` that compiles, measured in `build/types/`. The `form` line now names tab buttons, `MenuItem`, and `TableSort`. The tab and sort submits are measured, and the `MenuItem` submit is labeled as inference, because `enhanceMenu` prevents only a disabled item's click. The HTML preview line now names select-all tables and drops select-all from the enhancers one `enhance()` call would add.
- [x] Check. `bun run check`, `bun run build`, and `bun scripts/consumer-smoke.ts` pass. Result: `bun run check` passes 663 tests, the build exits 0, and the smoke exits 0 with zero for its clean types, ESLint, and Vitest runs (`.verify/table/build/check-commit3.txt`, `build-c3.txt`, `smoke-c3.txt`).

## Verify on the real surface

- [x] Rebuild both Storybooks, capture to `after.json`, and diff against `base.json`. Pass means `changed` lists only the Table story, and every change is explained. Result: at `2596ead`, 2 changed (Table light and dark, `dom` only), 0 removed, 0 added (`.verify/table/capture-diff.txt`). `.verify/table/domdiff.txt` names two changes. The old story's outer render `div` is gone. The inline `style` values lose the space after the colon. The aria and the screenshots are unchanged.
- [x] Run `bun run test:browsers`. Pass means Firefox and WebKit pass, 0 diagnostics, and 0 axe violations. Result: 68 passed, 2 skipped, "71 stories, 0 diagnostics", and 0 axe violations in 58 runs per engine and mode, at `085a2ef` (`.verify/table/browsers-tip.txt`) and at `2596ead` (`browsers-tip2.txt`). The two skipped are the WebKit usage sweep and sidebar test, which run in Firefox only.
- [x] Drive the composed build per the verify-odd-design skill. Open both sides of the Table story in `calm` light, `holoterminal` dark, and one more palette. Confirm matching screenshots and aria. On both sides, confirm the wrap takes focus first, a row click tints the row, the header box goes checked, mixed, and unchecked, the sorted column shows `↑`, and numbers end-align. Result: `.verify/table/chrome/chrome-pair.ts` drove both sides of the built composed Storybook in Chrome 156 (`channel: "chrome"`), and 51 of 51 checks pass in `calm` light, `holoterminal` dark, and `glass` `cyberpunk` dark, at `085a2ef` (`.verify/table/chrome/run.log`) and at `2596ead` (`run-tip.log`). The initial screenshots are byte-identical between the sides. The Chrome AX trees match once the Storybook path prefix of the link URLs is normalized, because each `href="#"` resolves against its own `/html/` or `/react/` iframe. On both sides the first Tab lands on the named region. Deck shows `↑` and the other sort columns show `↕`. The numeric cells end-align. Header clicks go checked, mixed, and unchecked. A checked row is tinted.

## Review and open the PR

- [x] The `cursor grok-4.7` reviewer reads the diff against this plan. A fresh builder fixes each finding that blocks. Other findings go to `docs/follow-ups.md`. Result: the review (`.verify/table/review/review.md`) found two findings that block and two that do not. First, `Table`'s `enhanceSelectAll` and an app's `enhance()` put two listeners on one table, and they undid a header click when a row cancelled its click. `eeb762d` gives each table one listener through a holder, as `enhanceTabs` and `enhanceMenu` do, and every call still syncs the header. The Table test gains a row whose `tr` click calls `preventDefault`. Before the fix, a header click ends with rows `[false, false, false, false]`, the header unchecked, and `onChange` for `a`, `c`, `a`, `b`, and `c`. After it, the rows are `[true, true, true, false]`, the header is mixed, and `onChange` runs for `a` and `c` (`.verify/table/fix/select-all-before.txt` and `select-all-after.txt`). That row is uncontrolled, because React runs a controlled box's `onChange` even when its click is cancelled (measured in happy-dom). Second, `RoleWithName` counted an `undefined` name as a name. `6f245fa` types name values as `NonNullable<unknown>`. In the tsc probe (`.verify/table/fix/types-before.txt` and `types-after.txt`), the six Popover cases now print what `eac9863`'s Popover prints. That is ODD-POPOVER-004 for `role="dialog"` with `aria-label={undefined}` or a `string | undefined` name, and a clean compile for `aria-label={undefined}` with no role, which printed 005 before the fix. A `TableWrap` region with an `undefined` or `string | undefined` name prints ODD-TABLE-003, and `tabIndex={0}` or a `number` with no role still prints 002. The new `table-wrap-name-undefined` fixture fails the fixture test before the fix and passes after (`types-fixture-before.txt` and `types-fixture-after.txt`). The Popover fail fixtures print the same 8 lines as at `eac9863`, and the pass fixture prints nothing at both (`popover-fail-eac9863.txt` and `popover-fail-after.txt`). The stale remounted header box went to `docs/follow-ups.md` and `docs/usage/table.md`. The sidebar overclaim is corrected in the commit-3 box. `bun run check` passes 663 tests after each fix commit (`check-fix1.txt` and `check-fix2.txt`). A second `cursor grok-4.7` review read `085a2ef..2596ead` (`.verify/table/review2/review.md`). It confirmed both fixes in Chromium, Firefox, WebKit, and `tsc`, and showed that each new assertion fails with its fix reverted. It found nothing blocking. Its doc correction and its nit are fixed in this commit.
- [x] Run `/deslop` and `/no-comments` over the diff. Result: for /deslop, the lead read the diff and found nothing to remove. The `released` guard in `enhanceSelectAll` matches the Tabs, Menu, and Toast holders. Comment Sicko deleted one comment, the `RoleWithName` doc comment in `src/react/part.ts` (`6d18a39`). The lead rejected its one refactor flag, which was to wire `Table` once and export a sync for every commit. That adds a public export to `odd-design/enhance` to save one listener rewire per commit.
- [x] Open the PR ready with `gh pr create --base main --repo Rakvadium/odd-design`. The title is `feat(react): add Table and mirror it in the Storybooks`. Result: https://github.com/Rakvadium/odd-design/pull/39, ready, at 3d30795. Before it opened, `bun run check` passed 663 tests at that commit, and `bun run build` and `bun scripts/consumer-smoke.ts` exited 0 (`.verify/table/check-final.txt`, `build-final.txt`, and `smoke-final.txt`).
- [x] Run `gh pr checks`. The repo has no workflows, so expect "no checks reported". Report the PR as open. Do not merge. Result: `gh pr checks 39` printed "no checks reported on the 'feat/react-table' branch". The repo has no `.github/workflows`. The PR is open, with no checks configured.

## Throughput checkpoint

- **Blocking first steps.** The committed plan and the baseline capture. Commit 2 needs commit 1's parts. Commit 3 needs both.
- **Independent workstreams.** None worth splitting. The rows, the parts, the enhancer, the story, and the docs all read `contract.ts` and `format.ts` and share the test tables.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The `.verify/table/` candidates are read-only references.
- **Smallest safe decomposition.** One builder, one commit at a time, each checked before the next. The base candidate's `lab.patch` already passes `bun run check` (662 tests), so the builder starts from it and applies the graft and the corrections.

## Appendix A. Design choices

| Fork | Chosen | Why |
| --- | --- | --- |
| Parts | `TableWrap`, `Table`, `TableSort` | Each has a measured failure its type carries. Cells have none that a class reaches |
| Cell props | None. `data-numeric` and `aria-sort` stay raw on native cells | A cell part needs a new class and CSS change |
| Region | Conditional | The CSS comment allows a bare wrap |
| Behavior owner | The browser for each box, `enhanceSelectAll` for the header | No JS moves a React node, and rows change only by click |
| Header sync | Per-commit layout effect | React's `checked` writes fire no event |
| Codes | ODD-TABLE-001 to 005, existing kinds | One code per measured failure |
| Shared type | `RoleWithName` in `part.ts` | Popover and TableWrap have the same three-row shape |

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| Nine codes with `direct-attribute`, `sole-value`, and `inside` kinds (Grok runner) | Three new walkers for failures a follow-up can take. JSX sees mapped rows as computed, so they stay quiet in most real JSX |
| `required-child tbody` | Lints browser-repaired HTML and header-only tables |
| `section` as a wrap tag with `name-requires role` (Grok runner) | Rejects a named `section`, which is already a region |
| A holder and `MutationObserver` in `enhanceSelectAll` (Grok runner) | Does not see React's property writes, measured stale after Clear |
| React-owned selection with `indeterminate` through a ref | Every app carries the enhancer's logic, and the HTML side keeps a second writer |
| Pin `type="button"` on `TableSort` (judge graft) | Tab and menu item buttons share the failure. One fix for all of them |
| Map `tabIndex` in the JSX lowering (judge graft) | Changes every part's lowering. Card already lists both spellings |
| Always pin `tabIndex`, `role`, and a name | Rejects the CSS comment's bare wrap with no measured failure |

## Appendix C. Evidence and reading list

These files are local scratch under the gitignored `.verify/table/` folder of this worktree. They are not on the branch.

- `how.md` explains the port system and how table markup fits it today, and lists sixteen forks.
- `task.md` and `rubric.md` are the arena's task and scoring rubric.
- `candidate-opus/design.md` is the base, with `lab.patch` and its probes.
- `candidate-grok/design.md` is the other design, with its probes.
- `judge.md` holds the cross-judge's scores, the claims it found wrong, its pick, and the grafts.
- `synthesis.md` records the base, the graft taken, and the grafts rejected.
- `decisions.tsv` is the decision trail.

## Appendix D. Risks and follow-ups

- **A sort button wrapped inside `th[aria-sort]` shows the neutral arrow.** The CSS needs the button as a direct child. No kind reads a parent.
- **Two columns with a concrete `aria-sort` draw two arrows.** No kind counts siblings.
- **A select-all box outside `thead` checks only itself.** No kind reads an ancestor by tag.
- **A memoized row list that re-renders without `Table` leaves the header stale.** `docs/usage/table.md` names it.
- **Rows HTML code inserts after `enhanceSelectAll` leave the header stale until the next change.** This was already true before the port.
- **Every button part submits an enclosing form.** Tabs, MenuItem, and TableSort share one follow-up.
- **The resync cost grows with row count.** It re-queries the enabled row boxes on each commit. Not measured on a large table.
