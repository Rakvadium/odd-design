# React Menu plan

`odd-design/react` gains two parts. `Menu` renders `div.odd-menu` and runs `enhanceMenu` on itself in a layout effect, the `Tabs` shape. `MenuItem` renders `button.odd-menu-item` through `part()`, with a required menu item `role` and `tone` mapped to `data-tone`. The label (`p.odd-menu-label`), the shortcut (`kbd.odd-menu-shortcut`), the group (`div[role=group]`), and the separator (`Separator`) stay as they are, and the trigger is the existing `Button` with `commandfor`, `command="toggle-popover"`, and `aria-haspopup="menu"`. The browser owns the open state, light dismiss, Escape, and focus return. `enhanceMenu` owns the menu keyboard and `aria-checked` after mount. It writes attributes and moves no node, so React owns every node it renders.

A menu is an auto popover, so it fails the `popover` attribute the same way a popover does. Popover's two `ODD-POPOVER-002` rows move into one module-private `autoPopover` tuple, and `USAGE.popover` and `USAGE.menu` both spread it. This is the Sheet `modal` move, and `checkUsage` already counts a shared row object once per node. Seven new codes, ODD-MENU-001 to 007, cover what only a menu can get wrong. The Menu story moves into the mirror and keeps its id.

`enhanceMenu` changes in two ways that HTML callers also get. It wires each menu once however many callers enhance it, as `enhanceTabs` does, so a React `Menu` beside an app's `enhance()` works. It matches its triggers from `document` when they are used, so a trigger that mounts after the menu still opens it from the keyboard.

The work ships as one PR on `feat/react-menu`, based on `5d82748` (Sheet, PR #37). It is built as three commits after this plan, and each commit ends in a check. Nothing merges or deploys.

Caleb granted overnight autonomy for this run. The build starts after this plan is committed and uses the default in each decision below. The run stops when the PR is open and its checks report.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, and verifies.

The design came from two architect runners and a cross-judge. Both runners converged on the same two parts, the same `enhanceMenu` holder, document-matched triggers, the same preview line, and the same story move. They split on codes and reuse. The Opus runner shares Popover's `popover` rows and adds seven codes with no new rule kind. The Grok runner copied the `popover` rows under menu codes and added a `required-with` kind for `aria-checked`, for twelve codes. The `cursor grok-4.7` judge picked the Opus design and named two grafts, and this plan takes both. The Opus runner built its design on a scratch copy of `5d82748` (`lab.patch`, 648 tests passing) and measured each code in Firefox and WebKit. The records are local scratch in the gitignored `.verify/menu/` folder of this worktree (Appendix C).

## Usage

```tsx
import { Button, Menu, MenuItem, Separator } from "odd-design/react";

<Button commandfor="deck-actions" command="toggle-popover" aria-haspopup="menu">Deck actions</Button>
<Menu id="deck-actions" popover="auto" role="menu" aria-label="Deck actions">
  <MenuItem role="menuitem" onClick={rename}>Rename</MenuItem>
  <MenuItem role="menuitem" aria-disabled="true">Merge</MenuItem>
  <Separator />
  <MenuItem role="menuitemcheckbox" aria-checked="true" onClick={(e) => setPrices(e.currentTarget.getAttribute("aria-checked") === "true")}>Show prices</MenuItem>
  <div role="group" aria-label="Sort by">
    <MenuItem role="menuitemradio" aria-checked="true">Name</MenuItem>
  </div>
  <Separator />
  <MenuItem role="menuitem" tone="danger" onClick={remove}>Delete deck</MenuItem>
</Menu>;
```

By the time an item's `onClick` runs, `enhanceMenu` has already flipped `aria-checked`, because it listens on the menu and React listens on the root. A re-render that passes the same `aria-checked` keeps the toggled value, and a remount resets it to the prop.

| Part | Element | Props from the contract |
| --- | --- | --- |
| `Menu` | `div.odd-menu`, `"use client"`, self-enhancing | `popover: "" \| "auto"` and `role: "menu"` required through `Pinned`. A name, `aria-label` or `aria-labelledby`, required through `Named<MenuRule>`. A system `data-*` is the ODD-MENU-004 message. `id`, `ref`, and the rest come from `ComponentProps<"div">` |
| `MenuItem` | `button.odd-menu-item`, `part("MenuItem")` | `role: "menuitem" \| "menuitemcheckbox" \| "menuitemradio"` required through `Pinned`. `tone?: "danger"`. `disabled` is the ODD-MENU-007 message. Raw `data-tone` is a type error. A system `data-*` is the ODD-MENU-004 message |
| (no part) | `p.odd-menu-label`, `kbd.odd-menu-shortcut`, `div[role=group]` | No rule a part would type |

## Contract

Each failure below was measured in Firefox and WebKit on `5d82748`, beside a good control (`.verify/menu/candidate-opus/probes/base.misuse.json`).

| Code | Group, kind | Fails when | What breaks | TypeScript |
| --- | --- | --- | --- | --- |
| `ODD-MENU-001` | `menu` and `menuItem`, `element` | `odd-menu` is not on a `div`, or `odd-menu-item` is not on a `button` | A `p.odd-menu` ends before its first block child, so the items after a separator render in the page while the menu is closed. A `div` item ignores Enter and Space. An `a` item with `href` ignores Space and is underlined | Not a type error. The parts render their tags |
| `ODD-POPOVER-002` | `autoPopover`, `required-attribute` and `enum` | No `popover`, or a value other than empty or `auto` | With no `popover`, the closed menu and its first items are in the accessibility tree and the trigger opens nothing. A `manual` menu stays open after Escape and after an outside click | `popover: "" \| "auto"`, required |
| `ODD-MENU-002` | `menu`, `required-attribute` and `enum role` | No `role`, or not `menu` | `enhance()` skips it. ArrowDown on the trigger opens nothing, and a click opens it with focus left on the trigger | `role: "menu"`, required |
| `ODD-MENU-003` | `menu`, `accessible-name` | No non-blank `aria-label` or `aria-labelledby` | The open menu snapshot is `- menu:` with no name | TypeScript's missing-property error |
| `ODD-MENU-004` | `menu` and `menuItem`, `system-data` | A system `data-*` the menu does not read | `data-tone="danger"` on `odd-menu` leaves every item its plain color | The 004 message on `Menu` and `MenuItem` |
| `ODD-MENU-005` | `menuItem`, `required-attribute` and `enum role` | An item with no role or another role | The arrows skip it, and it stays in the Tab order | The three item roles, required |
| `ODD-MENU-006` | `menuItem`, `enum data-tone` | `data-tone` other than `danger` | An `info` item computes the plain item color | `tone?: "danger"`. Raw `data-tone` is not assignable to `undefined` |
| `ODD-MENU-007` | `menuItem`, `forbidden-attribute disabled` | `disabled` on an item | The arrows skip a `disabled` item, so keyboard users never reach it. `aria-disabled="true"` keeps it reachable and inert | The 007 message |

The `ODD-POPOVER-002` message names both `odd-popover` and `odd-menu`. `docs/usage/menu.md` points at `popover.md#odd-popover-002` for it.

Not added, each measured:

- **A checkbox or radio item with no `aria-checked`.** It snapshots the same as `aria-checked="false"`, and one click sets `"true"`. It would also need a new rule kind.
- **A menu with no `id`.** A ref with `showPopover({ source })` opens it, focus lands on the first item, and Tab closes it.
- **A separator inside a `group`.** It loses the 4px menu margin. That is cosmetic, so it is a follow-up.
- **`aria-haspopup` on the trigger.** It sits on a different element, and no rule kind checks across elements.

## Shape

### Rows

```ts
const autoPopover = [
  { kind: "required-attribute", code: "ODD-POPOVER-002", element: "div", attribute: "popover" },
  { kind: "enum", code: "ODD-POPOVER-002", attribute: "popover", values: ["", "auto"], omit: [] },
] as const satisfies readonly UsageRule[];

popover: [{ element ODD-POPOVER-001 }, ...autoPopover, 003, 004, 005, 006],
menu: [
  { kind: "element", code: "ODD-MENU-001", className: "odd-menu", elements: ["div"] },
  ...autoPopover,
  { kind: "required-attribute", code: "ODD-MENU-002", element: "div", attribute: "role" },
  { kind: "enum", code: "ODD-MENU-002", attribute: "role", values: ["menu"], omit: [] },
  { kind: "accessible-name", code: "ODD-MENU-003", element: "div", names: ["aria-label", "aria-labelledby"] },
  { kind: "system-data", code: "ODD-MENU-004" },
],
menuItem: [
  { kind: "element", code: "ODD-MENU-001", className: "odd-menu-item", elements: ["button"] },
  { kind: "required-attribute", code: "ODD-MENU-005", element: "button", attribute: "role" },
  { kind: "enum", code: "ODD-MENU-005", attribute: "role", values: ["menuitem", "menuitemcheckbox", "menuitemradio"], omit: [] },
  { kind: "enum", code: "ODD-MENU-006", attribute: "data-tone", values: ["danger"], omit: [] },
  { kind: "forbidden-attribute", code: "ODD-MENU-007", attribute: "disabled" },
  { kind: "system-data", code: "ODD-MENU-004" },
],

Menu: { source: "odd-design/react", className: "odd-menu", props: {}, element: "div" },
MenuItem: { source: "odd-design/react", className: "odd-menu-item", props: { tone: "data-tone" }, element: "button" },
```

The popover rows keep their positions, so `format.ts` reads them as before. `check.ts`, `part.ts`, `jsx.ts`, `html.ts`, `dom.ts`, the mirror, the CSS, `CLASS_REGISTRY`, and `VOCABULARY` do not change. `usage-contract.test.ts` maps `odd-menu-item` to `menu.css` beside the existing `odd-progress` to `meter.css` case.

### `enhanceMenu`

- A module `WeakMap<HTMLElement, { count, stop }>` holds each wired menu. The first call wires it, every call returns its own release, and the last release unwires. This is the `enhanceTabs` holder.
- Trigger `keydown` and `click` listen on `document` in the capture phase and match `closest('[commandfor="<id>"], [popovertarget="<id>"]')` when the event fires. A menu with no `id` matches no trigger.
- The `toggle` handler sets `tabIndex = -1` on every item when the menu opens, so an item React mounts while the menu is closed leaves the Tab order (graft from the Grok runner). An item mounted while the menu is open keeps its Tab stop until the menu next opens, a follow-up.

### The parts

```tsx
export type MenuProps = MenuContract & Native<"Menu", keyof MenuContract> & Named<MenuRule>;

export function Menu({ ref, ...props }: MenuProps): ReactElement {
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  useLayoutEffect(() => enhanceMenu(root.current!), []);
  return createElement(WRAPPERS.Menu.element, { ...lower("Menu", props), ref: root });
}

export const MenuItem: (props: MenuItemProps) => ReactElement = part("MenuItem");
```

### The story

| Story id | File | Change |
| --- | --- | --- |
| `components-interactive--menu` | `stories/mirrored/Menu.stories.ts`, title `Components/Interactive`, export `Menu` | Moved from `stories/Interactive.stories.ts`, which is deleted because it holds no other story. The scene is today's markup from `Button`, `Menu`, `MenuItem`, `Separator`, and native label, shortcut, and group. The "Chose …" log is app code in a `play`, as Toast's buttons are |

The HTML preview gains one line beside tabs and toasters: `.odd-menu[role="menu"]` to `enhanceMenu`, `enhance()`'s own selector.

## Decisions taken under the autonomy grant

Each item is the default the build uses. Each one can be reversed after review.

1. **Two parts, `Menu` and `MenuItem`.** `MenuItem` turns three measured item failures into type errors in one `part()` line. The label and the shortcut carry no rule a part would type.
2. **The browser owns open state. `enhanceMenu` owns `aria-checked` after mount.** This is the Tabs decision. There is no `open`, `value`, or change event.
3. **Shared `ODD-POPOVER-002` rows, ODD-MENU codes for the rest.** One code per failure. Copied rows would report the popover mistake twice on `odd-popover odd-menu`.
4. **Idempotent `enhanceMenu`.** Without it, a React `Menu` beside `enhance()` skips every other item and cancels checkbox toggles, measured in both engines.
5. **Document-matched triggers.** Without it, a trigger React mounts after the menu never opens it from the keyboard, measured in both engines.
6. **One preview line, not `enhance(canvasElement)`.** One call would also run stepper, range-field, log, select-all, and the fallbacks on every mirrored story, with no React counterpart. The follow-up that asks for one call stays open.
7. **No holder helper.** Tabs, Toast, and Menu now repeat the holder. Extracting it touches two shipped enhancers, so it is a follow-up.

## Capture the baseline (no source change)

- [x] Build both Storybooks at `5d82748` with `bun scripts/storybooks.ts .verify/menu/base-sb`, serve the build, and capture the HTML section with `bun scripts/capture-stories.ts http://localhost:6411/html .verify/menu/base.json .verify/menu/base-shots`. Result: 86 captures.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check.

### Commit 1. Add Menu and MenuItem and check them

- [x] Move the popover rows into `autoPopover`. Add `USAGE.menu`, `USAGE.menuItem`, `MenuRule`, `MenuItemRule`, the two `WRAPPERS` rows, ODD-MENU-001 to 007 in `USAGE_CODES`, and their `MESSAGES`. Reword ODD-POPOVER-002 to name both classes. ODD-MENU-007 says the arrows skip a `disabled` item, not that a screen reader never hears it. Result: `autoPopover` sits above `USAGE` beside `modal`, and `USAGE.popover` and `USAGE.menu` both spread it, so the popover rows keep their positions. `USAGE.menu` and `USAGE.menuItem` follow `sheetPart`. The 002 message names `odd-popover` and `odd-menu`, and says a closed menu and its first items stay in the accessibility tree, the graft from the judge. The 007 message says the arrow keys skip a disabled button, so a keyboard user never reaches the item. `format.ts` reads `USAGE.menuItem[2]` and `[3]` through `satisfies`, so a reorder fails `tsc`.
- [x] Make `enhanceMenu` idempotent, match triggers from `document`, and take items out of the Tab order. Result: a module `WeakMap` holder wraps a private `wire()`, and each call returns its own release. Trigger `keydown` and `click` listen on `document` in the capture phase and match with `closest` when they fire, and the `bound` list is gone. The `toggle` handler sets `tabIndex = -1` on every item when the menu opens, and the wire-time loop is gone, the graft from the Grok runner.
- [x] Create `src/react/menu.tsx`. Add the barrel export and the `WrapperProps` lines. Result: 25 lines with `"use client"`. `Menu` is the `Tabs` body with `enhanceMenu`, and `MenuItem` is one `part()` line.
- [x] Write `docs/usage/menu.md` with the HTML and React setup and one section per ODD-MENU code. Add `menu.md` to `REQUIRED` in `scripts/consumer-smoke.ts`. Result: `menu.md` points at `popover.md#odd-popover-002` in its first paragraph, then has the HTML setup, the browser and `enhanceMenu` behavior, the React setup, and seven sections. `popover.md` names `odd-menu` on 002. `REQUIRED` lists `menu.md` after `sheet.md`.
- [x] Add bad and good HTML pairs for 001 to 007, the `RUNTIME_CODES` lines, and the `places` rows. Add a nameless-popover `odd-popover odd-menu` case that expects one ODD-POPOVER-002. Result: fourteen fixture pages and seven `RUNTIME_CODES` lines. `odd-popover-002.bad.html` expects five 002s, two on `odd-menu` with no `popover` and with `manual`. `odd-class-001.good.html` writes a valid menu with one item. A `usage-check` test reads `div.odd-popover.odd-menu` with no `popover` and gets one ODD-POPOVER-002 and one ODD-POPOVER-003.
- [x] Add type fail fixtures for each typed code and a `pass.tsx` block. Add `tests/fixtures/usage/jsx/menu.tsx` and its `places` entry. Result: seven fixtures. `menu-data-tone` prints ODD-MENU-004, and `menu-item-disabled` prints ODD-MENU-007. The others print TypeScript's missing `popover`, `role`, or `aria-labelledby`, `"menu"`, and `'"info"' is not assignable to type '"danger"'`. Deviation: `MenuProps` is a `MenuBase` interface joined to `Named<MenuRule>`, not one intersection. With the intersection, a missing `popover` or `role` named the declaring `Pinned<"Menu", …>` type, whose first printed row is ODD-POPOVER-002, so a missing `role` printed the popover code (`.verify/menu/build/types/probe.txt`). With the interface the error names `MenuBase`, as a missing `popover` on `Popover` names `PopoverProps`. `pass.tsx` gains `DeckMenu`, with `ref`, `aria-labelledby` on the trigger, `aria-disabled`, a checkbox `onClick` that reads `aria-checked`, a radio in a group, `tone="danger"`, and app `data-*`. The JSX fixture gives eleven diagnostics at their places, with ODD-STATIC-001 on a spread and a computed `tone`.
- [x] Add one markup row to `tests/react.test.tsx`, and one test that `Menu` beside `enhance()` under `StrictMode` moves one item per ArrowDown. Result: the row renders `<div id="deck-actions" popover="auto" role="menu" aria-label="Deck actions" class="odd-menu">` around a plain item and a `data-tone="danger"` item. The test came with the lab patch. Under `StrictMode` beside `enhance(document)`, two ArrowDowns reach Share then Show prices and one click sets `aria-checked="true"`. After the app's cleanup the part still wires the menu.
- [x] Check. A mutation that copies the popover rows under a menu code fails a test. Result: `bun run check` passes 646 tests (`.verify/menu/build/check-commit1.txt`). `build/mutate.ts` ran four mutants against this commit, and each fails a test (`build/mutations.txt`). Copying the rows fails the `odd-popover odd-menu` test with a second ODD-POPOVER-002. Dropping the rows, removing the holder, and removing the 007 row fail 4, 1, and 5 tests.

### Commit 2. Mirror Menu in the Storybooks

- [x] Create `stories/mirrored/Menu.stories.ts` and delete `stories/Interactive.stories.ts`. Add the preview line. Measure the closed `aria` literal in the built Firefox Storybook, then paste it. Result: the scene is a row with the `Button` trigger and Publish, a `Menu` with nine `MenuItem`s, three `Separator`s, the native label, shortcut, and radio group, and the empty live log. The menu writes `popover="auto"` where the old HTML wrote a bare `popover`, which the browser reads the same. The "Chose …" log is a `play`. The HTML preview runs `enhanceMenu` on `.odd-menu[role="menu"]` beside tabs and toasters. Both sides give `- button "Deck actions"`, `- button "Publish"`, and `- paragraph`, the literal in the story (`.verify/menu/build/aria-c2-firefox.txt`, from `build/measure/aria.spec.ts`).
- [x] Pin `components-interactive--menu` in `tests/stories.test.ts`. Result: the pins end with the id, and it passes the HTML-equals-React and `checkRoot` loops.
- [x] Loop the menu test in `e2e/behavior.spec.ts` over `html` and `react`, and add a checkbox toggle and a radio choice. Result: one loop over both Storybooks. After typeahead lands on Compact grid, Enter sets its `aria-checked` to `true` with focus still on it, and Enter on Last edited leaves it the only checked radio. The rest of the old test is unchanged.
- [x] Check. `bunx playwright test e2e/usage.spec.ts e2e/behavior.spec.ts` passes in Firefox and WebKit with 0 diagnostics. Result: `bun run check` passes 648 tests (`.verify/menu/build/check-commit2.txt`). Against `build/sb-c2` on port 6761, from `build/pw.config.ts`, 60 passed and 2 skipped, the WebKit usage sweep and sidebar test, which run in Firefox only. Firefox reports "70 stories, 0 diagnostics", and all four menu tests pass (`browsers-c2.txt`).

### Commit 3. Docs, smoke, and the verify recipe

- [x] In `docs/usage/react.md`, list the parts, add Menu to the self-enhancing parts and the command section, and add the type-error rows. Add a Menu section to `docs/usage/eslint.md`. Name the parts in the README row, the React install sentence, and the usage-contract list. Name `odd-menu` in `docs/usage/popover.md` on 002. Result: `react.md` lists `Menu`, `MenuItem`, and `menu.tsx`, names `menu.tsx` with the `"use client"` files and `Menu` with the parts that wire themselves, and adds a Menu block after the Popover one. Its `aria-checked` sentence is the measured one. `onClick` reads the flipped value, a re-render with the same `aria-checked` keeps the toggled value, and a remount resets it. The table gains ODD-MENU-004, ODD-MENU-007, and raw `data-tone` on `MenuItem`, adds `Menu` and `MenuItem` to the missing-property and allowed-value rows, and ODD-MENU-001 joins the raw-markup-only codes. Each row matches `.verify/menu/build/types/probe-after.txt` or a fail fixture. `eslint.md` gains "Menu from odd-design/react", and each claim matches `build/lint/probe.txt` and the JSX fixture. The README row names `Menu` and `MenuItem`, and the install sentence and the usage-contract list name them and link `menu.md`. The text started from the Grok candidate's, and its codes, its required `aria-checked`, and its write-back sentence were replaced. Deviation: the `popover.md` 002 edit landed in commit 1 with the message it mirrors.
- [x] Update `.agents/skills/verify-odd-design/features/interactive.md` for the React side, and fix its stale line that says focus skips Merge. Result: a React Menu section points at `react_components-interactive--menu`, the `aria` literal, and `-g menu`. The keyboard recipe and the `menu-keyboard` sub-feature now say Merge stays reachable. The sidebar line says all three Interactive stories load from `stories/mirrored/`, in the measured order Menu, Tabs, Toast on both sides (`.verify/menu/build/sidebar-c2.txt`).
- [x] Add the follow-ups in Appendix D to `docs/follow-ups.md`. Result: six lines after the Sheet entries, tagged React Menu. The existing HTML preview line now names menus and why one `enhance()` call is not used, so it is not repeated. The missing-name line adds that a blank `aria-label` compiles, measured in `build/types/`. The shadow root line is labeled as inference.
- [x] Check. `bun run check`, `bun run build`, and `bun scripts/consumer-smoke.ts` pass. Result: `bun run check` passes 648 tests, the build exits 0, and the smoke exits 0 with zero for its clean types, ESLint, and Vitest runs (`.verify/menu/build/check-commit3.txt`, `build-c3.txt`, `smoke-c3.txt`).

## Verify on the real surface

- [x] Rebuild both Storybooks, capture to `after.json`, and diff against `base.json`. Pass means `changed` lists only the Menu story, and every change is explained. Result: 2 changed (Menu light and dark, `dom` only), 0 removed, 0 added (`.verify/menu/capture-diff.txt`). `.verify/menu/domdiff.txt` names three changes. The menu writes `popover="auto"` where the old HTML wrote `popover=""`. The items have no `tabindex="-1"` while closed, because `enhanceMenu` now writes it when the menu opens. The log's inline `style` loses the space after its colon.
- [x] Run `bun run test:browsers`. Pass means Firefox and WebKit pass, 0 diagnostics, and 0 axe violations. Result: 64 passed, 2 skipped, "70 stories, 0 diagnostics", and 0 axe violations in 58 runs per engine and mode (`.verify/menu/browsers-tip3.txt`). Two earlier runs at the tip each failed one Firefox interestfor test, the hover card and then the tooltip, and each passes 5 of 5 alone (`hovercard-tip.txt`). Base `5d82748` also failed 2 tests in 1 of 2 runs (`browsers-base-1.txt`).
- [x] Drive the composed build per the verify-odd-design skill. Open both sides of the Menu story in `calm` light, `holoterminal` dark, and one more palette. Confirm matching screenshots and aria while closed. On both sides, confirm that the trigger opens a named menu with focus on the first item, that the arrows reach Merge, that a checkbox and a radio toggle and stay open, that Escape and Tab close it and return focus, and that Delete deck closes it and writes the log. Result: `.verify/menu/chrome/chrome-pair.ts` drove both sides of the built composed Storybook in Chrome, and 87 of 87 checks pass in `calm` light, `holoterminal` dark, and `glass` `cyberpunk` dark (`.verify/menu/chrome/run.log`). The closed screenshots are byte-identical between the sides, and the aria is identical.

## Review and open the PR

- [x] The `cursor grok-4.7` reviewer reads the diff against this plan. A fresh builder fixes each finding that blocks. Other findings go to `docs/follow-ups.md`. Result: one blocking finding (`.verify/menu/review/review.md`). A menu whose cleanup was discarded kept its `document` listeners, and ArrowDown on the new trigger called `showPopover` on the detached menu, which threw in Chrome, Firefox, and WebKit. The trigger listeners now do nothing while the menu is disconnected, and a behavior test re-renders the HTML story and presses ArrowDown. It failed 4 of 4 in Firefox and WebKit before the fix and passes 6 of 6 after (`.verify/menu/detached-before-fix.txt`, `detached-after-fix.txt`). The ODD-MENU-001 text now says only an `a` with `href` is underlined. The late item's Tab stop, the Enter race after ArrowUp, and the held detached menu are in `docs/follow-ups.md`. The menu-inside-trigger finding is dismissed, because a `button` cannot contain the menu's buttons.
- [x] Run `/deslop` and `/no-comments` over the diff. Result: Comment Sicko deleted four comments, six lines, in src/js/menu.ts and e2e/behavior.spec.ts. Of its two refactor flags, the lead accepted one (items() wrote tabIndex as a side effect, so the toggle handler now writes it) and rejected one (the isConnected guards are the review fix, and each alternative drops late triggers or a menu that is removed and put back). For /deslop, the lead read the diff and found nothing to remove.
- [x] Open the PR ready with `gh pr create --base main --repo Rakvadium/odd-design`. The title is `feat(react): add Menu and mirror it in the Storybooks`. Result: https://github.com/Rakvadium/odd-design/pull/38, ready, at 177df74. A second `cursor grok-4.7` review read the delta after the first review, `4735223..177df74`, and found nothing blocking (`.verify/menu/review2/review.md`). Its two plan-text findings are fixed in this commit.
- [x] Run `gh pr checks`. The repo has no workflows, so expect "no checks reported". Report the PR as open. Do not merge. Result: `gh pr checks 38` printed "no checks reported on the 'feat/react-menu' branch". The PR is open, with no checks configured.

## Throughput checkpoint

- **Blocking first steps.** The committed plan and the baseline capture. Commit 2 needs commit 1's parts. Commit 3 needs both.
- **Independent workstreams.** None worth splitting. The rows, the parts, `enhanceMenu`, the story, and the docs all read `contract.ts` and `format.ts` and share the test tables.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The `.verify/menu/` candidates are read-only references.
- **Smallest safe decomposition.** One builder, one commit at a time, each checked before the next. The base candidate's `lab.patch` already passes `bun run check`, so the builder starts from it and applies the grafts.

## Appendix A. Design choices

| Fork | Chosen | Why |
| --- | --- | --- |
| Parts | `Menu`, `MenuItem` | The item has three measured failures a part types. The label and shortcut have none |
| Behavior owner | The browser for open state, `enhanceMenu` for keys and `aria-checked` | No JS moves a React node |
| Codes | Shared ODD-POPOVER-002, new ODD-MENU-001 to 007 | One code per failure |
| Idempotence | `enhanceTabs` holder in `menu.ts` | A part beside `enhance()` must wire once |
| Triggers | Matched from `document` in the capture phase | A late trigger must work |
| `"use client"` | `menu.tsx` only | `Menu` has hooks |

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| One `Menu` part with native item buttons | Leaves the item role, `disabled`, and tone failures untyped |
| Copied popover rows under ODD-MENU codes (Grok runner) | Two messages for one failure, and a double report on `odd-popover odd-menu` |
| A `required-with` kind and codes for a missing or `mixed` `aria-checked` (Grok runner) | A missing value behaves as `false` in the browser |
| Triggers bound at call time | A trigger mounted after the menu never opens it from the keyboard |
| `enhance(canvasElement)` in the HTML preview | Runs enhancers with no React counterpart on every mirrored story |

## Appendix C. Evidence and reading list

These files are local scratch under the gitignored `.verify/menu/` folder of this worktree. They are not on the branch.

- `how.md` explains the port system and how menu markup fits it today, and lists seventeen forks.
- `task.md` and `rubric.md` are the arena's task and scoring rubric.
- `candidate-opus/design.md` is the base, with `lab.patch` and its probes.
- `candidate-grok/design.md` is the other design, with its probes.
- `judge.md` holds the cross-judge's scores, the claims it found wrong, its pick, and the grafts.
- `synthesis.md` records the base, the grafts taken, and the grafts rejected.

## Appendix D. Risks and follow-ups

- **The holder repeats in three enhancers.** Tabs, Toast, and Menu each keep a `WeakMap` or `Map` holder.
- **The HTML preview still keeps its own enhancer list.** It now names tabs, toasters, and menus.
- **A separator inside a menu `group` loses its margin.** `menu.css` styles only `.odd-menu > .odd-separator`.
- **No submenus.** `enhanceMenu` handles one level.
- **A missing name prints TypeScript's text, not the 003 code.** The same gap as Dialog and Sheet.
- **Triggers inside a shadow root do not match.** `closest` stops at the shadow boundary, which is inferred, not measured.
- **NVDA has not run on the React side.**
