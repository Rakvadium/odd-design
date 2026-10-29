# Post-port follow-ups plan

Caleb approved three follow-ups after the React set locked at Table (`f175abd`, PR #39). This plan covers them.

1. Every button that `odd-design/react` renders or wires defaults to `type="button"`. A caller who writes `type` keeps it, so form submit stays opt-in.
2. The `holoterminal` chrome goes away, with its CSS, contract entries, docs, and verify recipes.
3. `enhanceSelectAll` keeps the behavior #39 landed. The plan's autonomy-grant framing for it becomes a confirmed decision.

The work ships as one PR on `chore/post-port-followups`, based on `f175abd`. It is built as three commits after this plan, and each commit ends in a check. Nothing merges or deploys. The build starts only after Caleb approves this plan.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, and verifies.

The `type` design came from two architect runners and a cross-judge. Both runners put the React default in one place keyed on the rendered tag, and both had `enhanceTabs` stamp tab buttons, because no part renders them. They split on scope. The Opus runner also typed the buttons `toast()` builds and the stepper's buttons. The Grok runner added a global `enhance()` pass over every `odd-button`, `odd-table-sort`, and `odd-estop`, and a `buttonType` parser that rewrites any value other than `submit` or `reset`. The `cursor grok-4.7` judge picked the Opus design and named three grafts. This plan takes all three and drops the stepper call. The scratch records are in `%TEMP%\odd-ppf\` (grounding, both candidates, the rubric).

## Item 1. Buttons default to `type="button"`

### Why

A `button` with no `type` submits the form around it. `Button` already defaults to `type="button"`. `MenuItem` and `TableSort` go through `part()`, and `lower` cannot add an attribute, so both render untyped buttons. Tab buttons are consumer markup inside `Tabs`, and `enhanceTabs` never writes `type`. The `toast()` Undo and Dismiss buttons are untyped too. A tab submits a form in Chromium, Firefox, and WebKit, and a `TableSort` submits in Firefox and WebKit (both measured, `docs/follow-ups.md`).

A click-time `preventDefault` does not fix this. Enter in a text field clicks the form's default button, which is the first submit button in tree order (HTML implicit submission, inferred from the spec, not measured). An untyped tab or menu item placed before the real submit button would take that click. The attribute has to be on the element before any interaction.

### Usage

```tsx
import { Button, Menu, MenuItem, TableSort, Tabs } from "odd-design/react";

<form onSubmit={save}>
  <Tabs>
    <div role="tablist" aria-label="Deck view">
      <button role="tab" id="tab-cards" aria-controls="panel-cards" aria-selected="true">Cards</button>
    </div>
    …
  </Tabs>
  <MenuItem role="menuitem" onClick={duplicate}>Duplicate</MenuItem>
  <TableSort onClick={sortByName}>Deck</TableSort>
  <Button type="submit">Save deck</Button>
</form>
```

`MenuItem` and `TableSort` render `type="button"` in server markup. The tab button carries `type="button"` after `Tabs` commits. `<MenuItem type="submit">` and `<button role="tab" type="submit">` still submit.

### Shape

Two rules, each decided in one place. Neither adds a part, a prop, an export, or a lint code.

**React parts. The rendered tag decides.** A new `elementTag(element, props)` in `src/react/part.ts` returns the tag a `WRAPPERS` row renders for these props. A string element is fixed, and `Button`'s switch picks `a` when `href` is set. `lower` calls it and writes `type ??= "button"` when the tag is `button`. `MenuItem`, `TableSort`, and any later part whose element is `"button"` get the default with no list to keep. `Button` drops its hand-written `?? "button"` and its two-branch render, and calls `createElement(elementTag(...), lower(...))`. A link gets no `type`. `??=` keeps the attribute where `Button` puts it today, so the existing `Button` markup rows do not change.

**Enhanced buttons. The enhancer that owns the click decides.** A new internal `defaultToButtonType(el)` in `src/js/button-type.ts` writes `type="button"` on a `button` with no `type` attribute. It reads the attribute, because `.type` reports `"submit"` when the attribute is missing. It never overrides a written `type`, and a second call does nothing.

- `enhanceTabs` calls it on every tab at wire time.
- `Tabs` gains a second layout effect with no dependency list. It calls the same helper on the tablist after every commit, so a tab that React mounts later is typed before paint. The wiring effect keeps `[]`. React does not remove an attribute it never rendered, so the effect exists for new nodes, not for re-renders. This copies `Table`'s per-commit resync.
- `enhanceMenu` calls it on every item at wire time and when the menu opens. React `MenuItem` is already typed by `lower`, so this covers HTML menus and keeps the two Storybooks alike.
- `toast()` sets `type = "button"` on the two buttons it creates.

Out of scope, on purpose:

- No global `enhance()` pass. Nothing owns a raw `odd-button` or `odd-table-sort` click, and retyping an HTML author's button would change HTML semantics behind their back.
- No stepper change. Nothing in React renders a stepper, and its docs and tests already write `type="button"`.
- `toHtml` stays unchanged. `tests/mirror.test.ts` keeps its pin that `toHtml` adds no `type`, and `tests/stories.test.ts` already drops `type="button"` before it compares the two Storybooks.

### Tests

| Test | Regression it catches | File |
| --- | --- | --- |
| Update the "menu with a danger item" and "table in its scroll region with a sortable header" markup rows to carry `type="button"` in `lower`'s order. | A default applied only on the client, so server markup submits before hydration. | `tests/react.test.tsx`, existing rows |
| `test.each` over `MenuItem` and `TableSort` mounted in a form. A click gives 0 submits. With `type="submit"`, a click gives 1. | `lower` loses the default, or the default overwrites an explicit `type`. | `tests/react.test.tsx`, new `describe("Buttons in a form")` |
| Mount `Tabs` in a form. An untyped tab reads `type="button"` and a click gives 0 submits. A tab that mounts on a later commit also reads `type="button"`. A tab written `type="submit"` gives 1 submit. | `enhanceTabs` stops typing tabs, the per-commit effect is missing, or a written `type` is replaced. | same `describe` |
| Raw HTML in a form, then `enhance(document)`. Clicking an untyped menu item, a toast's Undo, and a toast's Dismiss gives 0 submits. A menu item written `type="submit"` gives 1. | `enhanceMenu` stops typing items, `toast()` builds untyped buttons, or the helper replaces an author's `type`. | same `describe` |

The existing `Button` rows stay the net for `Button`, including the `href` row with no `type`. The static "tab set" row keeps no `type`, because `renderToStaticMarkup` runs no layout effect.

### Docs

- `docs/usage/react.md` says once, near the top, that every part that renders a `button` defaults to `type="button"` and takes `submit` and `reset`. The Tabs section says `Tabs` types an untyped tab.
- `docs/usage/tabs.md`, `docs/usage/menu.md`, and `docs/usage/table.md` write `type="button"` on their HTML sample buttons. Tabs and menu say their enhancer fills a missing `type`. Table says no script owns a sort button, so HTML writes the type and `TableSort` writes it for you.
- `docs/follow-ups.md` drops the "A tab button, a `MenuItem`, or a `TableSort` inside a `form` submits it" item. It gains one line for the gap this leaves. An HTML tab or menu item added after wiring stays untyped until the next wire or open.
- `docs/plans/react-table.md` decision 7 ("No `type="button"` pin on `TableSort`") gains one sentence that names this plan as the cross-part fix.

## Item 2. Remove the holoterminal chrome

`CHROMES` in `src/js/contract.ts` is the source. The `Chrome` type, the Storybook toolbar, the Showcase radios and matrix, the contract and palette tests, the palette generator's page checks, and the verify harness's `--appearance full` sweep all derive from it. The rest is kept by hand.

Delete:

- `src/css/chromes/holoterminal.css` and its `@import` in `src/css/index.css`.
- `"holoterminal"` in `CHROMES` and its `PAGE_BACKGROUNDS` entry. `tsc` fails if one is left without the other.
- The id in `README.md`'s chrome list.

Rewrite, in the verify skill (`.agents/skills/verify-odd-design/`):

- `SKILL.md` and `features/README.md` list five chromes.
- `features/appearance-axes.md` runs its more-contrast check on another chrome with a gradient page background (glass or expressive). The builder measures the new `--focus-width` and `--page-background` before pasting them.
- `features/data-display.md` drops the round-versus-square avatar check. Every remaining chrome sets `--radius-chip` to a pill, so no chrome gives a contrasting shape. The group-overlap check stays.
- `features/foundations.md` compares type and headings across chromes that differ. Only bubblegum changes `--font-body`, and only expressive uppercases headings. The builder measures each value before pasting it.
- `features/sample-app.md` re-themes to expressive dark and re-measures `state`.

Rewrite, in `docs/follow-ups.md`:

- Line 55 drops "Holoterminal does the same."
- The "holoterminal uppercases the Sheet's accessible name" item and the "Uppercase chromes change accessible names" item name expressive. The builder measures the Sheet story's name in expressive in Chrome first. The open question remains, because expressive sets the same `--heading-case: uppercase` and `--label-case: uppercase`. See **Open decision** below.

Keep:

- JetBrains Mono. `foundations.css` uses it for `--font-mono`.
- The 16 `docs/plans/*` lines that name holoterminal. They record checks that ran before this change, and rewriting them would falsify the record.

A saved `holoterminal` in localStorage falls back to calm. `loadAppearance` rejects the id, and `FIRST_PAINT_SCRIPT` writes the stale string, which matches no chrome rule, so calm's `:where(:root)` applies (read in code, not measured). No code change.

## Item 3. Keep `enhanceSelectAll` as landed

No code change. A header click reads `all.checked` once, then calls `row.click()` on each enabled row that differs, so rows fire `click`, `input`, and `change`. A row click handler that calls `preventDefault` keeps that row unchanged. `tests/react.test.tsx` and `e2e/behavior.spec.ts` already pin it.

`docs/plans/react-table.md` lists it as decision 4 under "Decisions taken under the autonomy grant", whose preamble says "Each one can be reversed after review". Decision 4 gains "Confirmed by Caleb after review. Keep it." The cancelled-row behavior in the `enhanceSelectAll` section gets the same mark. No other doc frames it as open. The `docs/follow-ups.md` select-all items are known limits, not decisions, and stay as they are.

## Throughput checkpoint

- **Blocking first steps.** Caleb approves this plan. Then the baseline capture runs before any source change.
- **Independent workstreams.** The three items touch disjoint code. Item 1 is `src/react`, `src/js`, and their tests. Item 2 is chrome CSS, the contract, and docs. Item 3 is one plan file. They share `docs/follow-ups.md` and `docs/plans/react-table.md`.
- **Shared mutable state.** Those two docs files. One builder writes all three commits in order, so there is no concurrent write.
- **Smallest safe decomposition.** One builder. Item 1 is about 40 lines of source plus tests. Items 2 and 3 are deletions and doc edits. A second builder would add a merge on two shared docs for no time saved.

## Capture the baseline (no source change)

- [ ] Build both Storybooks at `f175abd` with `bun scripts/storybooks.ts .verify/ppf/base-sb`, serve the build, and capture the HTML section with `bun scripts/capture-stories.ts http://localhost:<port>/html .verify/ppf/base.json .verify/ppf/base-shots`.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check.

### Commit 1. `feat(react): default every button part to type="button"`

- [x] Add `elementTag` and the `type ??= "button"` line to `lower`. Move `Button` onto `elementTag`. Result: `elementTag(element, props)` in `src/react/part.ts` returns a string element as is and picks `absent` or `present` from the switch attribute. `lower` writes `attributes.type ??= "button"` when that tag is `button`, before the `data-*` loop. `Button` is one `createElement(elementTag(WRAPPERS.Button.element, attributes), lower("Button", attributes))`, so the hand-written default and the `href` branch are gone. Every existing `Button` markup row passes unchanged, including the `href` row with no `type`.
- [x] Add `src/js/button-type.ts`. Call it from `enhanceTabs`, the new `Tabs` effect, and `enhanceMenu`. Set `type` in `toast()`. Result: `defaultToButtonType(element)` writes `type="button"` when `localName` is `button` and the `type` attribute is missing. Nothing re-exports it. `enhanceTabs` calls it on every tab in `wire`, and `enhanceMenu` calls it on every item in `wire` and in the `toggle` handler on open. `Tabs` gains a layout effect with no dependency list that calls it on each `[role="tablist"] [role="tab"]` under the root. `toast()` sets `type = "button"` on the action and close buttons. The `enhanceTabs` and `enhanceMenu` doc comments say an untyped tab or item gets `type="button"`.
- [x] Update the two markup rows. Add the `Buttons in a form` tests. Result: the menu row reads `<button role="menuitem" type="button" class="odd-menu-item">` and `<button role="menuitem" aria-disabled="true" type="button" class="odd-menu-item" data-tone="danger">`, and the table row reads `<button type="button" class="odd-table-sort">`. `describe("Buttons in a form")` holds the four rows of the test table. Each mounts in a `form` that counts `submit` events. `MenuItem` and `TableSort` give 0 submits untyped and 1 with `type="submit"`. The `Tabs` test renders twice, the second time with a third tab, and reads types `["button", "submit", "button"]`, then 0 submits from the late tab and 1 from the `submit` tab. The HTML test runs `enhance(document)` over a menu and a toaster in a form, shows a toast with an Undo action and one without, and gets 0 submits from Rename, Undo, and the second toast's Dismiss, then 1 from the menu item written `type="submit"`. All six failed before the source change, with 1, 1, the tab types, and 3 submits where 0 was expected.
- [x] Update the docs and follow-ups listed under Item 1. Result: `docs/usage/react.md` adds a paragraph after the `"use client"` one that names `Button`, `MenuItem`, and `TableSort`, and the Tabs section says `Tabs` types an untyped tab each time it renders and keeps a written `submit`. It also says a tab that a child component adds while `Tabs` does not render stays untyped until `Tabs` renders again, because a probe read `type` as `null` on that tab (`.verify/ppf/build/probe/child-tab.txt`). `tabs.md`, `menu.md`, and `table.md` write `type="button"` on every button in their HTML samples, and say what fills or writes the type. `docs/follow-ups.md` drops the `form` item and adds "A tab or menu item added after wiring can submit its form" in its place, which also names the React child-component case. `docs/plans/react-table.md` decision 7 ends "`docs/plans/post-port-followups.md` is that fix." Deviation: the `menu.md` sample's `odd-button` trigger also gains `type="button"`, because the plan names every HTML sample button and no script types the trigger.
- [x] Check. A mutant that drops the `lower` line, one that drops the `Tabs` effect, and one that makes the helper overwrite a written `type` each fail a test. Result: `bun run check` passes 667 tests, 663 at the base plus the four new ones (`.verify/ppf/build/check-commit1.txt`). `.verify/ppf/build/mutate.ts` ran each mutant against `tests/react.test.tsx` and restored the file (`mutants-commit1.txt`). Dropping the `lower` line fails 10 tests: the six untyped `Button` rows, the menu and table rows, and both `test.each` rows. Dropping the `Tabs` effect fails the `Tabs` test. Overwriting a written `type` fails the `Tabs` test and the HTML test.

### Commit 2. `feat(chromes)!: remove the holoterminal chrome`

- [x] Delete the CSS, the import, the `CHROMES` id, the `PAGE_BACKGROUNDS` entry, and the README mention. Result: `src/css/chromes/holoterminal.css` and its `@import` are gone, `CHROMES` lists `calm`, `glass`, `bubblegum`, `expressive`, and `darkmatter`, `PAGE_BACKGROUNDS` has five keys, and the README chrome list names five. `tsc` passes. `bun test` drops 20 tests, all in the `chrome holoterminal` and `page background of chrome holoterminal` suites, and gains none (`.verify/ppf/build/junit-c1.xml` and `junit-c2.xml`).
- [x] Rewrite the verify recipes and follow-ups listed under Item 2, with each new value measured in the harness. Result: every value comes from run `ppf-build` on this tree (`.verify/ppf/build/harness-transcript.log`). `SKILL.md` and `features/README.md` list five chromes. `appearance-axes.md` runs more contrast on `chrome:expressive;mode:dark`, which reads `--focus-width` `3px` and a `--page-background` of `light-dark(oklch(0.965 0.007 70), oklch(0.19 0.012 55))` with no gradient, against `2px` and a gradient with no emulation. `data-display.md` drops the shape check and keeps the group check as `avatar-group`, because every chrome reads `border-radius` `999px`. Calm still steps `[16, 48, 80, 112]`. `foundations.md` compares the `h1` font in bubblegum (`"Bricolage Grotesque Variable"`) and calm (`"Outfit Variable"`), and captures expressive for uppercase. Its headings step reads `60px` down to `14px`, `uppercase` on every level, and a `text-shadow` on hero only, in expressive dark. `sample-app.md` re-themes to expressive dark, and `state` shows `scopes[0]` as `{"chrome":"expressive","palette":"default","mode":"dark"}` with `html` still `calm/default/light`. In `docs/follow-ups.md`, the wrap item drops "Holoterminal does the same." The Sheet item names expressive, whose Sheet is `dialog "FILTERS"` with buttons `RESET` and `SHOW 12 DECKS` in Chrome. The uppercase-names item names expressive, whose Tooltip story reads `button "PUBLISH"` against `button "Publish"` in calm. Expressive CSS is unchanged. Not changed: `appearance-axes.md` still says `state` lists 12 scopes on the Matrix, but `state` caps the list at 20 and the Matrix has 40 tiles (measured). The 12 was already wrong at the base, with 48 tiles.
- [x] Check. `git grep -i holoterminal` lists only `docs/plans/*` lines dated before this plan, plus this plan. `bun run build-storybook` exits 0. The toolbar lists five chromes. Result: `bun run check` passes 647 tests (`.verify/ppf/build/check-commit2.txt`). Before the Result lines were added, `git grep -i holoterminal` gave 28 lines, 17 in 16 earlier plan files and 11 in this plan (`grep-holoterminal-commit2.txt`). `react-sheet.md` holds two of the 17. `bun run build-storybook` exits 0 (`build-storybook-commit2.txt`). The preview's `chrome` toolbar items read `["calm","glass","bubblegum","expressive","darkmatter"]` in the harness, and the sample app's Appearance dialog shows the same five radios.

### Commit 3. `docs(table): confirm select-all row clicks`

- [x] Mark decision 4 and the cancelled-row behavior in `docs/plans/react-table.md` as confirmed. Result: decision 4 and the `preventDefault` sentence in the `enhanceSelectAll` section each end "Confirmed by Caleb after review. Keep it." No code or test changed. `bun run check` passes 647 tests (`.verify/ppf/build/check-commit3.txt`).

## Verify on the real surface

- [ ] Rebuild both Storybooks, capture to `after.json`, and diff against `base.json`. Pass means every change is explained. Expected changes are the Showcase matrix and sample app (one chrome fewer) and `type` on tabs and menu items in the Tabs and Menu stories.
- [ ] Run `bun run test:browsers`. Pass means Firefox and WebKit pass, with 0 diagnostics and 0 axe violations.
- [ ] Drive the composed build per the verify-odd-design skill. On both sides of the Tabs, Menu, Table, and Toast stories, read `type` on each tab, menu item, sort button, and toast button. Expect `button` on every one except the HTML Table sort buttons, which `toHtml` leaves as written. Open `showcase--matrix` in light and dark and confirm five chrome rows. Measure the Sheet story's accessible name in expressive for the follow-up.

## Review and open the PR

- [ ] The `cursor grok-4.7` reviewer reads the diff against this plan. A fresh builder fixes each finding that blocks. Other findings go to `docs/follow-ups.md`.
- [ ] Run `/deslop` and `/no-comments` over the diff.
- [ ] Open the PR ready with `gh pr create --base main --repo Rakvadium/odd-design`. Title it `chore(react): land the post-port follow-ups`.
- [ ] Run `gh pr checks`. The repo has no workflows, so expect "no checks reported". Report the PR as open. Do not merge.

## Open decision

**Expressive keeps the uppercase accessible-name quirk.** The Done-when asks for no leftover "FILTERS" uppercase path. Removing holoterminal removes one source, but expressive also sets `--heading-case: uppercase` and `--label-case: uppercase`. So the Sheet title in expressive should still be named "FILTERS" in Chrome (inferred from the shared token, measured only in holoterminal so far). The default in this plan rewrites the two follow-up items to name expressive, measures the name, and leaves expressive's look alone. You could choose instead to set expressive's heading and label case to `none`, which changes how expressive looks. Or you could keep `text-transform` off titles and controls in every chrome, which is a design change across chromes.
