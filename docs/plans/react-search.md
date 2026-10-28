# React Search plan

`odd-design/react` gains one part, `Search`. It renders `search.odd-search`, the search landmark, so a `Search` can never lose the landmark. The caller writes the visually hidden label, the icon, and an `Input` inside it, as `search.css` documents them. To submit on Enter, the caller wraps `Search` in a native `form`. Five codes, ODD-SEARCH-001 to 005, cover the measured search mistakes. TypeScript, ESLint, and the runtime checker report them from the same `USAGE` rules. The Search story moves into the mirror and keeps its id, `components-forms--search`, so the React Storybook shows it built from the real part.

The work ships as one PR on `feat/react-search`, based on `734bfe7` (Tabs, PR #31). It is built as three commits after this plan, and each commit ends in a check. Nothing merges or deploys.

Caleb granted overnight autonomy for this run. The build starts after this plan is committed and uses the default in each decision below. The run stops when the PR is open and its checks report.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, and verifies.

The design came from two architect runners and a cross-judge. Both runners measured their designs in scratch checkouts of `734bfe7`. They converged on one part on `search` with native children. The judge picked the Opus design as the base and named two grafts from the Grok design. The records are local scratch in the gitignored `.verify/search/` folder of this worktree (Appendix C).

## Usage

```tsx
import { Input, Search } from "odd-design/react";

<Search>
  <label className="odd-visually-hidden" htmlFor="card-search">Search cards</label>
  <svg aria-hidden="true" viewBox="0 0 24 24">…magnifier…</svg>
  <Input type="search" id="card-search" placeholder="Search cards" />
</Search>;
```

Enter does nothing in a bare `Search`, so a filter reads the input's `onChange`. To submit on Enter, put a `form` around the part.

```tsx
<form action="/search" onSubmit={submit}>
  <Search>
    <label className="odd-visually-hidden" htmlFor="site-search">Search the docs</label>
    <SearchIcon aria-hidden />
    <Input type="search" id="site-search" name="q" />
  </Search>
</form>;
```

The CSS's own nested shape, `<search><form class="odd-search">`, stays valid in HTML and is checked like the part. `onSubmit` on `Search` is a type error (ODD-SEARCH-004), because a `search` element holds no form and the handler never runs.

| Part | Element | Props from the contract |
| --- | --- | --- |
| `Search` | `search.odd-search` | No mapped props. `onSubmit` and `onsubmit` are typed as the 004 message. A foreign system `data-*`, such as `data-tone`, is typed as the 005 message |
| (no part) | native `label.odd-visually-hidden`, a direct child | `htmlFor` paired with the input `id`. `aria-label` on the input also names it |
| (no part) | native `svg aria-hidden="true"`, a direct child | Any icon. A library icon component is opaque to ESLint |
| `Input` | `input.odd-input type="search"`, a direct child | The existing part |
| (no part) | native `form` around `Search`, only to submit | `action`, `method`, `onSubmit` |

`search.tsx` has no `"use client"`. The part has no state, effect, or handler.

## Contract

The failures below were measured at the base in Chromium, Firefox, and WebKit on `src/css/index.css` (`.verify/search/candidate-opus/measure/aria.txt` and `baseline.txt`; the landmark evidence is `aria.txt`, not the `baseline.txt` landmark column, whose regex also matches `searchbox`).

| Code | Group, kind | Fails when | Source | TypeScript |
| --- | --- | --- | --- | --- |
| `ODD-SEARCH-001` | `search`, `element` on `search` and `form` | `odd-search` is on another tag | A `div.odd-search` draws the same box with no search landmark. It also makes the group live | Not a type error. The part renders the tag |
| `ODD-SEARCH-002` | `search`, `required-child` with a new `className` match (`odd-input`) and an `attribute`/`value` pair (`type`, `search`), on `search` and on `form` | No direct child with `odd-input` and `type="search"` | `.odd-search > .odd-input`. A wrapped input keeps 13.6px padding, so the icon covers the text. A raw `input` loses the field styles. `type="text"` is a `textbox`, and the clear-button restyle in `search.css` applies only to `type="search"` | Not a type error. Children are `ReactNode` |
| `ODD-SEARCH-003` | `search`, `required-child` `child: "svg"` with the pair (`aria-hidden`, `true`), on `search` and on `form` | No direct `svg` with `aria-hidden="true"` | `.odd-search > svg`. With no icon the text starts after an empty gap. A wrapped icon is `position: static`, unplaced and unsized. An svg without `aria-hidden` is exposed as an `img` in Chromium and Firefox | Not a type error |
| `ODD-SEARCH-004` | `search`, `forbidden-on-element` on `search`, for `onSubmit` and `onsubmit` | A submit handler on `search.odd-search` | Enter fires the input's `keydown` and never the search's `onSubmit`, in three engines with React 19.3, while a form's handler fires (`react-submit.txt`) | The prop is the 004 message |
| `ODD-SEARCH-005` | `search`, `system-data` | A foreign system `data-*`, such as `data-tone` | Every port has it. `data-tone` passes every checker today | Each foreign name is the 005 message |

`required-child` runs only on its host tag, so a `div.odd-search` reports 001 alone. The `className` match reads literal class words, so `<Input className={cn("w-full", x)}>` still matches, and an `<input className={x}>` with a computed class is unknown and silent. A computed attribute value, or a spread with the attribute absent, is unknown and silent too. The message names what is missing, for example `no odd-input child with type="search"`.

Not added:

- A naming code. A placeholder alone names the field in all three engines (`aria.txt`, `placeholderOnly`), and no kind follows `for` to `id`.
- A parent check for a `form.odd-search` with no `search` around it. It has no landmark (`bareForm`), but no kind reads a parent, so ESLint and TypeScript could not report it. Appendix D.

## Shape

```ts
| { kind: "required-child"; code: UsageCode; element: string; child: string; attribute?: string; value?: string }
| { kind: "required-child"; code: UsageCode; element: string; role: string }
| { kind: "required-child"; code: UsageCode; element: string; className: string; attribute?: string; value?: string }

search: [
  { kind: "element", code: "ODD-SEARCH-001", className: "odd-search", elements: ["search", "form"] },
  { kind: "required-child", code: "ODD-SEARCH-002", element: "search", className: "odd-input", attribute: "type", value: "search" },
  { kind: "required-child", code: "ODD-SEARCH-002", element: "form", className: "odd-input", attribute: "type", value: "search" },
  { kind: "required-child", code: "ODD-SEARCH-003", element: "search", child: "svg", attribute: "aria-hidden", value: "true" },
  { kind: "required-child", code: "ODD-SEARCH-003", element: "form", child: "svg", attribute: "aria-hidden", value: "true" },
  { kind: "forbidden-on-element", code: "ODD-SEARCH-004", element: "search", attribute: "onSubmit" },
  { kind: "forbidden-on-element", code: "ODD-SEARCH-004", element: "search", attribute: "onsubmit" },
  { kind: "system-data", code: "ODD-SEARCH-005" },
],

Search: { source: "odd-design/react", className: "odd-search", props: {}, element: "search" },
```

The exact union spelling of the optional pair is the builder's call, as long as Disclosure's and Tabs' rows type unchanged and a rule cannot set `attribute` without `value`.

`check.ts` `requiredChildFindings` gains the `className` match and the pair. `hasUnknownRole` becomes `hasUnknown(node, name)`, which serves the role, the class, and the pair's attribute. `part.ts` `Forbidden` also reads `forbidden-on-element` rules whose `element` is the row's tag, the same element match `Pinned` uses. Button's `forbidden-on-element` rows name `button` and `a`, while its row element is the switch object, so Button's props do not change.

```tsx
interface SearchContract extends Contract<"Search", SearchRule> {}
export interface SearchProps extends SearchContract, Native<"Search", keyof SearchContract> {}
export const Search: (props: SearchProps) => ReactElement = part("Search");
```

`VOCABULARY.search` stays `[]`, and the row maps no props, so the stylesheet checks in `usage-contract.test.ts` hold. `jsx.ts`, `html.ts`, `dom.ts`, and the mirror renderers do not change.

The scene is the HTML Search story with the form moved outside the landmark, and `method="dialog"` in place of `onsubmit="event.preventDefault()"`, which a scene cannot carry. A `dialog` form outside a dialog fires `submit` and does not navigate, in three engines (`.verify/search/candidate-grok/measure/dialog-outer.json`). Enter did nothing before the change either.

```ts
{ of: "div", props: { className: "odd-stack", style: { maxInlineSize: "26rem" } }, children: [
  { of: "form", props: { method: "dialog" }, children: [
    { of: "Search", children: [
      { of: "label", props: { className: "odd-visually-hidden", htmlFor: "card-search" }, children: ["Search cards"] },
      { icon: "search" },
      { of: "Input", props: { type: "search", id: "card-search", name: "q", placeholder: "Search cards", defaultValue: "Ember" } },
    ] },
  ] },
] }
```

The expected `aria` literal, from `forms.md` and `aria.txt`. The commit re-measures it in built Firefox.

```
- search:
  - text: Search cards
  - searchbox "Search cards": Ember
```

## Decisions taken under the autonomy grant

Each item is the default the build uses. Each one can be reversed after review.

1. **The part is the landmark.** `Search` renders `search`. A part on `form` would leave every caller to remember the `search` wrapper, and a bare `form.odd-search` has no landmark (measured). It would also navigate on Enter unless the caller calls `preventDefault` (measured, three engines).
2. **To submit, wrap `Search` in a form.** This is the graft from the Grok design. One part covers a filter and a submit. The outer form keeps the 37.6px padding and the landmark, and its submit fires on Enter in three engines (`candidate-grok/measure/enter.json`, `outerForm`).
3. **The CSS's nested `form.odd-search` stays legal.** 001 accepts `search` and `form`, and 002 and 003 run on both hosts. `search.css` is not edited. The judge rejected the Grok design's header rewrite, because the comment is the HTML contract.
4. **002 and 003 check the documented attribute values.** This is the second graft. `type="search"` and `aria-hidden="true"` are both in the markup the `search.css` header documents. The Opus runner left them out because no kind read a child's attribute value. The judge ruled that the textbox role and the exposed `img` are measured failures.
5. **`onSubmit` on `Search` is a type error.** The handler never runs. `Forbidden` learns `forbidden-on-element` for the row's tag so 004 is typed from its rule, not a hand-written prop line.
6. **No naming code, no parent code.** See "Not added".
7. **The story drops `onsubmit`.** The capture diff should show a `dom` change on the Search story only, with identical `png` and `aria`.
8. **A new `docs/usage/search.md`.** Every family has its own page. It joins `REQUIRED` in the consumer smoke.
9. **Accept a new HTML Storybook sidebar order in Forms.** The mirrored file loads later, so Search sorts after the Field stories. Every earlier port made the same trade.

## Capture the baseline (no source change)

- [x] Reuse the Opus runner's capture of the HTML section at `734bfe7`, `.verify/search/candidate-opus/measure/base.json`. Result: taken from the same commit this branch starts at.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check. The Opus runner's `.verify/search/candidate-opus/lab.patch` is most of commits 1 and 2, minus the two grafts.

### Commit 1. Add Search and check it with ODD-SEARCH-001 to 005

- [ ] Add the `className` match and the optional attribute/value pair to `required-child`, with the unknown-class and unknown-attribute silences. Add the contract-test lines that require the class, the attribute, and the value in the message.
- [ ] Add `USAGE.search`, `SearchRule`, the `WRAPPERS` row, the five codes in `USAGE_CODES`, and their `MESSAGES`.
- [ ] Widen `Forbidden` in `part.ts` to `forbidden-on-element` rows on the row's tag.
- [ ] Write `docs/usage/search.md` with one section per code.
- [ ] Create `src/react/search.tsx`. Add the barrel export and the `WrapperProps` line.
- [ ] Add the `odd-search-001` to `005` bad and good HTML pairs, the `RUNTIME_CODES` lines, and the `places` rows in `tests/eslint-html.test.ts`. Give `odd-class-001.good.html` a full search in place of its bare `div.odd-search`.
- [ ] Add type fail fixtures for `onSubmit` and `data-tone` on `Search`, with their `failures` entries. Add `pass.tsx` lines for a filter `Search` and a `form` around a `Search`.
- [ ] Add `tests/fixtures/usage/jsx/search.tsx` and its `places` entry. It covers a wrapped input, a raw input, `type="text"`, a missing and a wrapped icon, an icon without `aria-hidden`, a library icon component (silent), a computed input class (silent), a computed `type` (silent), the nested form shape (clean), `onSubmit`, and `data-tone`.
- [ ] Add one markup row to `tests/react.test.tsx`.
- [ ] Check. Delete each new rule row, the `className` match, the pair, each silence, and the `Forbidden` widening, one at a time, and each fails a test.

### Commit 2. Mirror Search in the Storybooks

- [ ] Create `stories/mirrored/Search.stories.ts` with `title: "Components/Forms"` and the export `Search`. The meta component description carries the story text, now "With a `<form>` around it, Enter submits."
- [ ] Remove the `Search` export and the unused `icons` import from `stories/Forms.stories.ts`. Add the id to the mirrored-ids pin in `tests/stories.test.ts`.
- [ ] Measure the `aria` literal in the built Firefox Storybook, then paste it.
- [ ] Check. `bunx playwright test e2e/usage.spec.ts e2e/behavior.spec.ts --project firefox` passes with 0 diagnostics, and the clear-button test still finds `#card-search`.

### Commit 3. Docs, smoke, and the verify recipe

- [ ] In `docs/usage/react.md`, add "Build a search" with the filter and the submit call sites, the type-error rows for 004 and 005, and Search in the "not type errors" paragraph (001 to 003). Add a Search section to `docs/usage/eslint.md`. Update the README install sentence, the usage-contract list, and the component row.
- [ ] Add `docs/usage/search.md` to `REQUIRED` in `scripts/consumer-smoke.ts`. The clean app renders a `Search`.
- [ ] Update `.agents/skills/verify-odd-design/features/forms.md`: the React section loses "Search has no React wrapper" and gains a React Search line, the recipe names the outer form, and the sidebar list gets the new order.
- [ ] In `docs/follow-ups.md`, shrink the line on unmirrored stories to Slider only, drop Enter-submit from the unobserved paths (measured in `baseline.txt`), and add the follow-ups in Appendix D.
- [ ] Check. `bun run check`, `bun run build`, and `bun scripts/consumer-smoke.ts` pass.

## Verify on the real surface

- [ ] Rebuild both Storybooks, capture the HTML section to `after.json`, and run `bun scripts/capture-stories.ts --diff` against `base.json`. Pass means `changed` lists only `components-forms--search`, with no `png` or `aria` change.
- [ ] Run `bun run test:browsers`. Pass means the Firefox and WebKit runs pass, the sweep reports 0 diagnostics, and axe reports 0 violations.
- [ ] Drive the composed build per the verify-odd-design skill. Open `react_components-forms--search` and `components-forms--search` in `calm` light, `holoterminal` dark, and one more palette. Save each screenshot and `ariaSnapshot`. Confirm that the two sides look the same, that Enter fires the outer form's `submit` and does not navigate, and that the clear button empties the field in Chromium.

## Review and open the PR

- [ ] The `cursor grok-4.7` reviewer reads the diff against this plan. A fresh builder fixes each finding that blocks. Other findings go to `docs/follow-ups.md`.
- [ ] Run `/deslop` and `/no-comments` over the diff.
- [ ] Open the PR ready with `gh pr create --base main --repo Rakvadium/odd-design`. The title is `feat(react): add Search and mirror it in the Storybooks`.
- [ ] Run `gh pr checks`. The repo has no workflows, so expect "no checks reported". Report the PR as open. Do not merge.

## Throughput checkpoint

- **Blocking first steps.** The committed plan. Commit 2 needs commit 1's part. Commit 3 needs both.
- **Independent workstreams.** None worth splitting. The tests, fixtures, story, and docs all read the `contract.ts` rows.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The `.verify/search/` candidates are read-only references.
- **Smallest safe decomposition.** One builder, one commit at a time, each checked before the next. The base candidate's `lab.patch` is already most of commits 1 and 2, so a split would only add merges.

## Appendix A. Design choices

| Fork | Chosen | Why |
| --- | --- | --- |
| Part or story only | A part | Codes need an `element` rule, which pins `odd-search` and bans it on native scene nodes |
| Tag | `search` | The part is the landmark and never navigates on Enter (measured) |
| Submit shape in React | A native `form` around `Search` | One part covers filter and submit (graft from Grok) |
| `form.odd-search` | Still legal, checked by 001 to 003 and 005 | It is the CSS's documented shape |
| Label | Native `label.odd-visually-hidden` | `Label` adds `odd-label`. A `VisuallyHidden` part has no single tag |
| Icon | Caller's direct `svg aria-hidden="true"` | The package ships no React icons |
| Input | Existing `Input` with `type="search"` | No second row on `odd-input` |
| Codes | 001 to 005, one new `required-child` match and one attribute pair, no new kind | Each maps to a measured failure |
| `"use client"` | None | No state or handler |
| Story | `stories/mirrored/Search.stories.ts`, same id | Forms keeps Slider |

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| A part on `form`, the caller writes `<search>` | A forgotten wrapper has no landmark and no checker sees it, and Enter navigates unless prevented (measured) |
| A switch row on `action` | Its `form` branch loses the landmark unless wrapped |
| A hand-written part that emits `<search><form>` | Two elements. Breaks `lower()`, `renderings`, and `toHtml` |
| No part, a mirrored story with `Input` only | Leaves `div.odd-search` and the dead `onSubmit` passing every checker |
| Only `search` as a host (Grok runner) | Flags the CSS's documented, working `form.odd-search` shape |
| Rewrite the `search.css` header (Grok runner) | The comment is the HTML contract, and the selectors did not change |
| `role="search"` on a form | A second way to draw the landmark, and a caller who also wraps `search` stacks two |

## Appendix C. Evidence and reading list

These files are local scratch under the gitignored `.verify/search/` folder of this worktree. They are not on the branch.

- `how.md` explains the contract, the parts, the checkers, the mirror, and Search today, and lists eleven forks.
- `task.md` and `rubric.md` are the arena's task and scoring rubric.
- `candidate-opus/` is the base. `lab.patch` is its diff. `measure/` holds the baseline failures, the aria trees, the React submit probe, the mutation runs, the capture diff, the Chrome pair, and the browser suite.
- `candidate-grok/` is the other design, with its probes in `measure/`, including the outer-form and `method="dialog"` runs.
- `judge.md` holds the cross-judge's scores, the claims it found wrong or unmeasured, its pick, and the grafts.

## Appendix D. Risks and follow-ups

- **A `form.odd-search` with no `search` around it has no landmark.** It passes every checker. It needs a parent-reading kind.
- **A library icon component silences 002 and 003 in ESLint.** The runtime checker still sees the rendered `svg`.
- **A `for` that names no input passes,** as for every field.
- **happy-dom builds `search` as `HTMLUnknownElement`.** A `createRoot` test of `Search` there logs React's unrecognized-tag warning. No test mounts it that way.
