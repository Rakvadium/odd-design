# React Tabs plan

`odd-design/react` gains one part, `Tabs`. It renders `div.odd-tabs` and runs `enhanceTabs` on itself, so arrows, Home, End, clicks, manual activation, and the panel switch work with no other call. The caller writes the tablist, the tab buttons, and the panels as native elements, as `tabs.css` and `tabs.ts` already describe them. Five codes, ODD-TABS-001 to 005, cover the measured tab-set mistakes. TypeScript, ESLint, and the runtime checker report them from the same `USAGE` rules. The Tabs story moves into the mirror and keeps its id, `components-interactive--tabs`, so the React Storybook shows it built from the real part.

The work ships as one PR on `feat/react-tabs`, based on `8045700` (Disclosure, PR #30). It is built as three commits after this plan, and each commit ends in a check. Nothing merges or deploys.

Caleb granted overnight autonomy for this run. The build starts after this plan is committed and uses the default in each decision below. The run stops when the PR is open and its checks report.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, and verifies.

The design came from two architect runners and a cross-judge. Both runners measured their designs in scratch checkouts of `8045700`. They converged on one part that enhances itself, with the DOM as the only owner of the selection. The judge picked the Opus design as the base and named two grafts from the Grok design. The records are local scratch in the gitignored `.verify/tabs/` folder of this worktree (Appendix C).

## Usage

```tsx
import { Tabs } from "odd-design/react";

<Tabs>
  <div role="tablist" aria-label="Deck view">
    <button role="tab" id="tab-cards" aria-controls="panel-cards" aria-selected="true">Cards</button>
    <button role="tab" id="tab-stats" aria-controls="panel-stats" aria-selected="false">Stats</button>
  </div>
  <div role="tabpanel" id="panel-cards" aria-labelledby="tab-cards">60 cards across 24 units.</div>
  <div role="tabpanel" id="panel-stats" aria-labelledby="tab-stats" hidden>Average cost 2.4.</div>
</Tabs>;
```

`aria-selected` and `hidden` in the JSX set the first choice only. After mount, `enhanceTabs` owns them, as the browser owns `open` on a `Disclosure`. `aria-orientation="vertical"` and `data-activation="manual"` go on the tablist. An `enhance()` call elsewhere in the app does not wire the set twice.

To read the choice, listen for `odd-tab-change` on the forwarded ref. React 19 does not attach a custom-event prop on a `div`, so the listener goes through `addEventListener`. To choose a tab from code, call `.click()` on its button.

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Tabs } from "odd-design/react";

export function DeckView() {
  const ref = useRef<HTMLDivElement>(null);
  const [view, setView] = useState("cards");
  useEffect(() => {
    const tabs = ref.current!;
    const onChange = (event: Event) => setView((event as CustomEvent<{ tab: HTMLElement }>).detail.tab.id.replace("tab-", ""));
    tabs.addEventListener("odd-tab-change", onChange);
    return () => tabs.removeEventListener("odd-tab-change", onChange);
  }, []);
  return <Tabs ref={ref}>…</Tabs>;
}
```

| Part | Element | Props from the contract |
| --- | --- | --- |
| `Tabs` | `div.odd-tabs` | No mapped props. `aria-orientation` and `data-activation` are typed as the 003 message. A foreign system `data-*`, such as `data-tone`, is typed as the 005 message. `defaultValue?: never` turns the Radix habit into a type error |
| (no part) | native `div role="tablist"`, a direct child | `aria-label`, optional `aria-orientation`, optional `data-activation="manual"` |
| (no part) | native `button role="tab"` | `id`, `aria-controls`, the first `aria-selected`, optional `disabled` |
| (no part) | native `div role="tabpanel"` | `id`, `aria-labelledby`, the first `hidden` |

`tabs.tsx` starts with `"use client"`. It is the second client file after `button.tsx`, and the first part that uses hooks.

## Contract

The failures below were measured at the base in Chromium, Firefox, and WebKit (`.verify/tabs/candidate-opus/measure/baseline-summary.txt`).

| Code | Group, kind | Fails when | Source | TypeScript |
| --- | --- | --- | --- | --- |
| `ODD-TABS-001` | `tabs`, `element` on `div` | `odd-tabs` is on another tag | The documented markup and the part's tag. It also makes the group live | Not a type error. The part renders the tag |
| `ODD-TABS-002` | `tabs`, `required-child` with a new `role` match (`element: "div"`, `role: "tablist"`) | The `div` has no direct child with `role="tablist"` | `.odd-tabs > [role="tablist"]`. A wrapped tablist loses its track. It renders `display: block`, with no padding and a transparent background, 1280px wide in place of 214px | Not a type error. Children are `ReactNode` |
| `ODD-TABS-003` | `tabs`, `forbidden-attribute` on `aria-orientation` and on `data-activation` | Either attribute is on the root | `data-activation="manual"` on the root still chooses on ArrowRight. `aria-orientation` on the root leaves one grid column, and the tabs do not stack | Each name is typed as the 003 message |
| `ODD-TABS-004` | `tabs`, new kind `role-descendant` (`role: "tab"`, `elements: ["button"]`, `attribute: "aria-controls"`) | A `role="tab"` inside the set is not a `button`, or has no `aria-controls` | With no `aria-controls`, every panel stays visible after a click. A `div` tab in manual mode is not chosen by Enter or Space, because the click comes from the native button | Not a type error |
| `ODD-TABS-005` | `tabs`, `system-data` | A foreign system `data-*`, such as `data-tone` | Every port has it. `data-tone` passes every checker on a tab set today | Each foreign name is the 005 message |

The `required-child` role match counts a child with a computed role, or a spread and no role, as unknown, and stays silent. `role-descendant` walks `descendants()` and stops at nested component classes, so an inner tab set reports only its own tabs. A spread on a tab silences the missing-attribute half. Both 002 and 004 report on the `odd-tabs` host, as 002 on Disclosure and Card's `stretched-link` do. `html.ts` `readChild` keeps no spans for a child, so a diagnostic placed on a descendant would have no location.

Not added:

- A code for zero or several `aria-selected="true"`. `show(initial)` repairs it to the first.
- A code for tabs that are not direct children of a vertical tablist. They lose only `justify-content`.
- A code for a `data-activation` value other than `manual`. A typo takes the automatic path, which still works.
- A code for `aria-controls` naming an id with no panel. Appendix D records it.

## Shape

```ts
| { kind: "required-child"; code: UsageCode; element: string; child: string }
| { kind: "required-child"; code: UsageCode; element: string; role: string }
| { kind: "role-descendant"; code: UsageCode; role: string; elements: readonly string[]; attribute: string }

tabs: [
  { kind: "element", code: "ODD-TABS-001", className: "odd-tabs", elements: ["div"] },
  { kind: "required-child", code: "ODD-TABS-002", element: "div", role: "tablist" },
  { kind: "forbidden-attribute", code: "ODD-TABS-003", attribute: "aria-orientation" },
  { kind: "forbidden-attribute", code: "ODD-TABS-003", attribute: "data-activation" },
  { kind: "role-descendant", code: "ODD-TABS-004", role: "tab", elements: ["button"], attribute: "aria-controls" },
  { kind: "system-data", code: "ODD-TABS-005" },
],

Tabs: { source: "odd-design/react", className: "odd-tabs", props: {}, element: "div" },
```

`VOCABULARY.tabs` stays `[]`, and the row maps no props, so the stylesheet checks in `usage-contract.test.ts` hold unchanged.

`enhanceTabs` becomes idempotent per root. A module `WeakMap` holds a count and the stop function for each wired root. The first call wires and each call returns its own release. A release runs once. The last release unwires. A call that finds no tablist returns a no-op and stores nothing, so a later call can still wire (the graft from the Grok design). The old body becomes a private `wire(root)`. The built package keeps one `dist/js/tabs.js`, which both `dist/react/tabs.js` and `dist/js/enhance.js` import, so the two entry points share one map.

```tsx
"use client";

export function Tabs({ ref, ...props }: TabsProps): ReactElement {
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  useLayoutEffect(() => enhanceTabs(root.current!), []);
  return createElement(WRAPPERS.Tabs.element, { ...lower("Tabs", props), ref: root });
}
```

The layout effect wires the set in the commit that inserts it. With `useEffect`, WebKit's React side was still unwired when `#storybook-root` first had a child. Server rendering with the layout effect logs no error in React 19.3.

The HTML preview's mirrored `render` queues `enhanceTabs` on each `.odd-tabs` in `canvasElement` in a microtask. The React preview replaces that `render`, so the React side has only the part's own wiring, and a broken part fails the React behavior test. The mirror, `part.ts`, `jsx.ts`, `html.ts`, and `dom.ts` do not change.

The scene is the HTML Tabs story built from two `Tabs` with native tablist, `button`, and panel nodes, with the same ids and text as today. `toHtml` and `renderToStaticMarkup` differ only in `hidden` against `hidden=""` and in attribute order, which `normalized()` absorbs. The `aria` literal was measured identical in Chromium, Firefox, and WebKit on both sides. The commit re-measures it.

```
- tablist "Deck view":
  - tab "Cards" [selected]
  - tab "Stats"
  - tab "Notes"
- tabpanel "Cards":
  - paragraph: 60 cards across 24 units, 22 actions, and 14 assets.
- tablist "Season":
  - tab "Season 7" [selected]
  - tab "Season 6"
  - tab "Season 5" [disabled]
- tabpanel "Season 7":
  - paragraph: Current season. Rotation on May 1.
```

## Decisions taken under the autonomy grant

Each item is the default the build uses. Each one can be reversed after review.

1. **One part, and native children.** The CSS styles one class and three roles. New classes for the list, tab, and panel would need CSS and registry edits for elements the CSS already selects by role, as Disclosure decided for `summary`.
2. **The DOM owns the selection.** `enhanceTabs` writes `aria-selected`, `tabIndex`, and `hidden`. A React-owned index would be a second writer. Measured, a React-only write moves `aria-selected` and `hidden` but leaves the tab stop on the old tab.
3. **No `value` or `onValueChange`.** The caller reads `odd-tab-change` on the ref and drives with `click()`. Syncing `aria-selected={view === id}` from the event was measured to agree with the DOM.
4. **`enhanceTabs` changes for HTML users too.** The only observable change is that a second call on one root no longer moves two tabs per arrow. That double move was measured at the base in all three engines.
5. **Five codes, with one new kind and one new match.** 003 and 004 catch tab sets that compile and then do nothing. The Grok runner proposed three codes and left 004 as a follow-up. The judge ruled that S2 and S3 are visible failures in all three engines.
6. **The HTML side is wired in the preview, not in a story `play`.** A `play` on the mirrored story runs in both Storybooks, so it would enhance the React side and hide a broken part. Measured, with the part's self-enhancement removed, the pair sweep still passes and only the React behavior test fails.
7. **No scene type change.** `data-activation` on an inline scene node typechecks through the known excess-property hole. The `` `data-${string}` `` index belongs to the later sweep.
8. **Native `disabled` stays on tabs.** `roving()` and the click handler skip `:disabled`. Tabs carry no `odd-button`, so ODD-BUTTON-007 does not apply.
9. **Accept a new HTML Storybook sidebar order in Interactive.** The mirrored file loads later, so Tabs sorts after Menu and Toast. Every earlier port made the same trade.

## Capture the baseline (no source change)

- [x] Build both Storybooks from `8045700` with `bun scripts/storybooks.ts .verify/tabs/base-sb`, serve the build, and capture the HTML section with `bun scripts/capture-stories.ts <url>/html .verify/tabs/base.json .verify/tabs/base-shots`. Result: 86 captures in `base.json`.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check.

### Commit 1. Add Tabs and check it with ODD-TABS-001 to 005

- [ ] Make `enhanceTabs` idempotent per root with the hold count, and store nothing when the root has no tablist.
- [ ] Add the `required-child` role match and the `role-descendant` kind with its `apply` case, the unknown-role silence, the spread silence, and the nested-set stop. Add the contract-test lines.
- [ ] Add `USAGE.tabs`, `TabsRule`, the `WRAPPERS` row, the five codes in `USAGE_CODES`, and their `MESSAGES`.
- [ ] Write `docs/usage/tabs.md` with one section per code.
- [ ] Create `src/react/tabs.tsx`. Add the barrel export and the `WrapperProps` line.
- [ ] Add the `odd-tabs-001` to `005` bad and good HTML pairs, the `RUNTIME_CODES` lines, and the `places` rows in `tests/eslint-html.test.ts`. Give `odd-class-001.good.html` a direct tablist.
- [ ] Add type fail fixtures for `aria-orientation`, `data-tone`, and `defaultValue` on `Tabs`, with their `failures` entries. Add `pass.tsx` lines for a vertical manual set with `ref`, `id`, `className`, and a disabled tab.
- [ ] Add `tests/fixtures/usage/jsx/tabs.tsx` and its `places` entry. It covers a wrapped tablist, a computed role, a spread child, a `div` tab, a tab with no `aria-controls`, a nested set, and the 003 and 005 attributes.
- [ ] Add one markup row and one behavior test to `tests/react.test.tsx`. The test mounts `Tabs` under `StrictMode`, calls `enhance(document)`, presses ArrowRight, and expects one move. It then runs the app's cleanup and presses again, and expects a second move.
- [ ] Check. Delete each new rule row, the unknown-role silence, the spread silence, the nested-set stop, and the empty-root guard, one at a time, and each fails a test. Make `enhanceTabs` wire on every call, and make any cleanup unwire, and each fails the behavior test.

### Commit 2. Mirror Tabs in the Storybooks

- [ ] Create `stories/mirrored/Tabs.stories.ts` with `title: "Components/Interactive"` and the export `Tabs`. The meta component description carries the story text.
- [ ] Remove the `Tabs` export and the `enhanceTabs` import from `stories/Interactive.stories.ts`. Add the id to the mirrored-ids pin in `tests/stories.test.ts`.
- [ ] Queue `enhanceTabs` in the HTML preview's mirrored `render`.
- [ ] Run the tabs test in `e2e/behavior.spec.ts` once per Storybook. It first waits for `#tab-s5` to have `tabindex="-1"`, which only `enhanceTabs` writes.
- [ ] Measure the `aria` literal in the built Firefox Storybook, then paste it.
- [ ] Check. `bunx playwright test e2e/usage.spec.ts e2e/behavior.spec.ts --project firefox` passes with 0 diagnostics. With the part's self-enhancement removed, the React run of the tabs test fails.

### Commit 3. Docs, smoke, and the verify recipe

- [ ] In `docs/usage/react.md`, add a section on building tabs with the `odd-tab-change` read and the `click()` drive, the type-error rows for 003 and 005 and `defaultValue`, Tabs in the "not type errors" paragraph (001, 002, 004), and `tabs.tsx` in the directive paragraph. Add a Tabs section to `docs/usage/eslint.md`. Update the README install sentence, the usage-contract list, the component row, and the Behaviors note on `enhance()`.
- [ ] Add `docs/usage/tabs.md` to `REQUIRED` in `scripts/consumer-smoke.ts`, and check that `dist/react/tabs.js` starts with `"use client"` as `button.js` does. The clean app renders a `Tabs`.
- [ ] Update `.agents/skills/verify-odd-design/features/interactive.md` with a React Tabs section and its new sidebar-order line.
- [ ] Add the follow-ups in Appendix D to `docs/follow-ups.md`.
- [ ] Check. `bun run check`, `bun run build`, and `bun scripts/consumer-smoke.ts` pass.

## Verify on the real surface

- [ ] Rebuild both Storybooks, capture the HTML section to `after.json`, and run `bun scripts/capture-stories.ts --diff .verify/tabs/base.json .verify/tabs/after.json`. Pass means `changed` lists only `components-interactive--tabs`, with no `png` or `aria` change.
- [ ] Run `bun run test:browsers`. Pass means the Firefox and WebKit runs pass, the sweep reports 0 diagnostics, and axe reports 0 violations.
- [ ] Drive the composed build per the verify-odd-design skill. Open `react_components-interactive--tabs` and `components-interactive--tabs` in `calm` light, `holoterminal` dark, and one more palette. Save each screenshot and `ariaSnapshot`. Confirm that the two sides look the same, that ArrowRight from Cards selects Stats and shows its panel, and that in the Season set ArrowRight then Enter selects Season 6 on both sides.

## Review and open the PR

- [ ] The `cursor grok-4.7` reviewer reads the diff against this plan. A fresh builder fixes each finding that blocks. Other findings go to `docs/follow-ups.md`.
- [ ] Run `/deslop` and `/no-comments` over the diff.
- [ ] Open the PR ready with `gh pr create --base main --repo Rakvadium/odd-design`. The title is `feat(react): add Tabs and mirror it in the Storybooks`.
- [ ] Run `gh pr checks`. The repo has no workflows, so expect "no checks reported". Report the PR as open. Do not merge.

## Throughput checkpoint

- **Blocking first steps.** The committed plan, then the baseline capture. Commit 2 needs commit 1's part. Commit 3 needs both.
- **Independent workstreams.** None worth splitting. The tests, fixtures, story, and docs all read the `contract.ts` rows.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The `.verify/tabs/` candidates are read-only references.
- **Smallest safe decomposition.** One builder, one commit at a time, each checked before the next. The base candidate's `lab.patch` is already most of commits 1 and 2, so a split would only add merges.

## Appendix A. Design choices

| Fork | Chosen | Why |
| --- | --- | --- |
| Parts | `Tabs` only, with native tablist, tabs, and panels | The CSS selects the inner pieces by role |
| Selection owner | The DOM, through `enhanceTabs` in a layout effect | One writer. A React write leaves the tab stop behind (measured) |
| Controlled API | None. `odd-tab-change` on the ref, `click()` to drive | The sync agrees with the DOM (measured) |
| Orientation and activation | Native attributes on the tablist. 003 bans them on the root | S5 and S6, three engines |
| Effect | `useLayoutEffect` | `useEffect` left WebKit unwired at first paint (measured) |
| Ref | `useImperativeHandle` | Forwards the root with no hand-written merge |
| Ids | Caller-supplied | `useId` cannot be reproduced by `toHtml` |
| Double wiring | Hold-counted `enhanceTabs` | S1. Two wirings move two tabs per arrow |
| HTML story wiring | Preview microtask, mirrored stories only | Keeps the React side on the part's own wiring |

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| A Radix-shaped compound with React state | A second implementation of `roving()` and `enhanceTabs`, new classes the CSS lacks, and `tabindex` in SSR markup that the HTML scene cannot match |
| A static `Tabs` and docs that say to call `enhanceTabs` on a ref (Avatar's precedent) | The tabs compile and do nothing (measured). The rubric calls this "broken tabs that compile" |
| A self-enhancing part with no change to `enhanceTabs` | An app's `enhance()` then moves two tabs per arrow (S1) |
| A shared story `play` with docs autoplay (Grok runner) | It runs in both Storybooks, so the React test passes with a broken part |
| Three codes (Grok runner) | Leaves S2, S3, S5, and S6 unchecked. Its 002 also warned on a spread child it could not see |
| An inline ref callback that merges refs (Grok runner) | More code than `useImperativeHandle`, and it runs again on each parent render |
| A `` `data-${string}` `` index on intrinsic scene props (Grok runner) | Broader than Tabs. The task defers the excess-property sweep |

## Appendix C. Evidence and reading list

These files are local scratch under the gitignored `.verify/tabs/` folder of this worktree. They are not on the branch.

- `how.md` explains the contract, the parts, the checkers, the mirror, and Tabs today, and lists twelve forks.
- `task.md` and `rubric.md` are the arena's task and scoring rubric.
- `candidate-opus/` is the base. `lab.patch` is its diff for most of commits 1 and 2. `measure/` holds the baseline failures, the Storybook pair runs, the React sync and controlled probes, the mutation runs, and the browser suite.
- `candidate-grok/` is the other design, with its probes in `measure/`.
- `judge.md` holds the cross-judge's scores, its pick, and the grafts.

## Appendix D. Risks and follow-ups

- **A tab button inside a `form` submits it.** Measured at the base, one submit per click and per manual Enter in all three engines. `enhanceTabs` could call `preventDefault`, or the docs could write `type="button"`.
- **`aria-controls` naming a missing id is unchecked.** A literal-id match inside the subtree is cheap.
- **Changing `aria-orientation` or `data-activation` after mount does nothing.** `wire` reads them once. A `key` on `Tabs` remounts the set.
- **The HTML preview keeps a Tabs-only line.** It is a second list beside `enhance()`. The next behavior port (Menu) should turn it into one call.
- **Intrinsic scene props have no `data-*` index.** `data-activation` passes through the excess-property hole. The later sweep should add `` `data-${string}` ``.
- **A computed role or a spread silences 002 and 004 in ESLint.** The runtime checker still sees the DOM.
- **The Firefox hover-card test timed out once under full-suite load.** It passed alone. It predates this work, by inference.
