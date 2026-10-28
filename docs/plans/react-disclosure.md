# React Disclosure plan

`odd-design/react` gains one part, `Disclosure`. It renders `details.odd-disclosure` and maps no props. The caller writes a native `summary` as a direct child and the answer in one element after it. `open`, `name`, and `onToggle` are the native `details` props, typed by `Native<"Disclosure">`. Three codes, ODD-DISCLOSURE-001 to 003, cover the disclosure mistakes. TypeScript, ESLint, and the runtime checker report them from the same `USAGE` rules. The Disclosure story moves into the mirror and keeps its id, `components-surfaces--disclosure`, so the React Storybook shows it built from the real part.

The work ships as one PR on `feat/react-disclosure`, based on `6e49f4f` (Card, PR #29). It is built as three commits after this plan, and each commit ends in a check. Nothing merges or deploys.

Caleb granted overnight autonomy for this run. The build starts after this plan is committed and uses the default in each decision below. The run stops when the PR is open and its checks report.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, and verifies.

The design came from two architect runners and a cross-judge. The Opus runner applied its design to a scratch copy of `6e49f4f` and measured it in Chromium, Firefox, and WebKit. The Grok runner measured the same failures and the React toggle behavior. The judge picked the Opus design as the base. The records are local scratch in the gitignored `.verify/disclosure/` folder of this worktree (Appendix C).

## Usage

```tsx
import { Disclosure } from "odd-design/react";

<Disclosure name="faq" open>
  <summary>Does it need JavaScript?</summary>
  <div>No. Sharing a name makes the group exclusive.</div>
</Disclosure>;
```

A literal `open` sets only the first state. The browser owns every toggle after that. To read or drive the state from React, sync it from `onToggle`.

```tsx
"use client";
import { useState } from "react";
import { Disclosure } from "odd-design/react";

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Disclosure name="faq" open={open} onToggle={(event) => setOpen(event.newState === "open")}>
      <summary>{question}</summary>
      <div>{answer}</div>
    </Disclosure>
  );
}
```

| Part | Element | Props from the contract |
| --- | --- | --- |
| `Disclosure` | `details.odd-disclosure` | No mapped props. A foreign system `data-*`, such as `data-tone`, is typed as the 003 message. `open?: boolean`, `name?: string`, and `onToggle` come from `ComponentProps<"details">` |
| (no part) | native `summary`, a direct child | none |
| (no part) | one body element after the summary, such as `div`, `p`, or `pre` | none |

Raw markup stays as it is today. `disclosure.tsx` has no `"use client"`, because `part()` adds no state or handler. A caller that holds state puts the directive in its own file.

## Contract

| Code | Group, kind | Fails when | Source | TypeScript |
| --- | --- | --- | --- | --- |
| `ODD-DISCLOSURE-001` | `disclosure`, `element` on `details` | `odd-disclosure` is on another tag | The `disclosure.css` header and the README row. Only `details` toggles, keeps `open`, groups by `name`, and has `::details-content` | Not a type error. The part renders the tag |
| `ODD-DISCLOSURE-002` | `disclosure`, new kind `required-child` (`element: "details"`, `child: "summary"`) | The `details` has no direct `summary` child. That covers a `div` or `button` trigger and a `summary` wrapped in a `div` | Measured in Chromium, Firefox, and WebKit. With no direct summary, the closed row is the browser's "Details" label, 26px tall instead of 50px. The question is hidden in the closed body, and the group loses its accessible name. A summary inside a `div` is not the toggle. A summary placed last still renders as the top row, so the rule asks for a direct child, not the first child | Not a type error. Children are `ReactNode` |
| `ODD-DISCLOSURE-003` | `disclosure`, `system-data` | A foreign system `data-*`, such as `data-tone` | Every port has it. `data-tone` passes every checker on a disclosure today. `data-state` stays legal through the headless allowlist | Each foreign name is the 003 message |

The `required-child` rule runs only on its host tag, so `div.odd-disclosure` reports 001 alone. It reads direct children and skips text. A literal `summary` passes. An expression child or an opaque component makes the result unknown, and the rule stays silent, as `stretched-link` does for an opaque subtree. The runtime checker sees the real DOM, so it still catches what ESLint cannot see.

Not added:

- A code for `open="false"`. It opens the panel in all three engines (measured). A `boolean-attribute` rule on `open` would put an ODD-STATIC-001 warning on every `open={state}`, the controlled pattern the docs teach. Skipping that warning needs a new mode on the shared `enum` kind. In React, `open?: boolean` already rejects the string, and React writes a string `open` as `open=""` before the runtime checker reads it. Appendix D records it.
- A `DisclosureSummary` part or a composite with a `summary` prop. The summary has no class, so a part needs a new class and CSS edits. A composite breaks `jsx.ts` `renderings` and `toHtml`. An agent that writes shadcn's `AccordionTrigger` gets "no exported member", the same trade Card made for `CardTitle`.
- A stateful `"use client"` part with `defaultOpen` or `onOpenChange`. The browser already writes `open`. The native `onToggle` sync was measured to stay in step with the DOM, so a wrapper would be a second state owner.
- Rules for bare text in the body, an empty summary, controls inside the summary, `aria-expanded` on the summary, `data-state`, and two open items in one group. Appendix D records each with its measurement.

## Shape

```ts
disclosure: [
  { kind: "element", code: "ODD-DISCLOSURE-001", className: "odd-disclosure", elements: ["details"] },
  { kind: "required-child", code: "ODD-DISCLOSURE-002", element: "details", child: "summary" },
  { kind: "system-data", code: "ODD-DISCLOSURE-003" },
],

Disclosure: { source: "odd-design/react", className: "odd-disclosure", props: {}, element: "details" },
```

`UsageRule` gains `{ kind: "required-child"; code; element; child }`, and `check.ts` gains its `apply` case. `usage-contract.test.ts` gains one line, which requires the child tag in the message. `part.ts`, `jsx.ts`, `html.ts`, `dom.ts`, `mirror.ts`, and `mirror-react.ts` do not change. `src/react/disclosure.tsx` is the README recipe.

`odd-class-001.good.html` changes its `div.odd-disclosure` to a `details` with a `summary`. `CustomPalette.stories.ts` keeps its HTML disclosure with a `pre` body and no `name`, and it must pass.

The scene is the HTML Disclosure story built from `Disclosure` and native `summary` and `div`. The first question keeps the curly apostrophe (U+2019), because a straight one changes the accessible name. The `aria` literal was measured in Chromium, Firefox, and WebKit, and in both built Storybooks in Firefox. The commit re-measures it.

```
- group: What’s the difference between chrome and palette? Chrome is shape, type, depth, and motion. Palette is color. You can pair any chrome with any palette.
- group: Does it need JavaScript?
- group: Does it respect reduced motion?
```

## Decisions taken under the autonomy grant

Each item is the default the build uses. Each one can be reversed after review.

1. **One part, and native children.** The summary and the body are native elements, as the stylesheet header writes them. The HTML story and the React story stay one scene.
2. **A new rule kind for the summary.** The missing summary is the disclosure's one measured structural failure, and no existing kind reads an element's direct children. The kind is one union member and one short function.
3. **A direct child, not the first child.** A summary placed last still renders and toggles in all three engines, so "first" would flag markup that works.
4. **No code for `open="false"`.** Both runners measured the bug. The judge ruled it a follow-up, because the fix costs a shared mode and the React type already blocks the string.
5. **No stateful wrapper.** The docs teach the `onToggle` sync. A caller that keeps one shared open id clears it on `"closed"` with a functional update.
6. **Accept a new HTML Storybook sidebar order in Surfaces.** The mirrored file loads later, so Disclosure sorts after Dialog, Badge, and Card. Every earlier port made the same trade.

## Capture the baseline (no source change)

- [ ] Build both Storybooks from `6e49f4f` with `bun scripts/storybooks.ts .verify/disclosure/base-sb`, serve the build, and capture the HTML section with `bun scripts/capture-stories.ts <url>/html .verify/disclosure/base.json .verify/disclosure/base-shots`.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check.

### Commit 1. Add Disclosure and check it with ODD-DISCLOSURE-001 to 003

- [ ] Add the `required-child` kind and its `apply` case, with the host-tag guard and the opaque-child silence. Add the contract-test line.
- [ ] Add `USAGE.disclosure`, `DisclosureRule`, the `WRAPPERS` row, the three codes in `USAGE_CODES`, and their `MESSAGES`.
- [ ] Write `docs/usage/disclosure.md` with one section per code. Say "direct child", not "first child".
- [ ] Create `src/react/disclosure.tsx`. Add the barrel export and the `WrapperProps` line.
- [ ] Add the `odd-disclosure-001` to `003` bad and good HTML pairs, the `RUNTIME_CODES` lines, and the `places` rows in `tests/eslint-html.test.ts`. The 002 good fixture holds the CustomPalette shape with a `pre` body and a summary placed last. Fix `odd-class-001.good.html`.
- [ ] Add a type fail fixture for `data-tone` on `Disclosure` with its `failures` entry. Add `pass.tsx` lines for `open`, `name`, and an `onToggle` that reads `event.newState`.
- [ ] Add `tests/fixtures/usage/jsx/disclosure.tsx` and its `places` entry. It covers a fragment child, an opaque child, an expression child, a computed `open` with `onToggle` that stays silent, the 002 failures, and `data-tone`. Add one markup row to `tests/react.test.tsx`.
- [ ] Check. Delete each new rule row, the host-tag guard, and the opaque-child silence, one at a time, and each fails a test.

### Commit 2. Mirror Disclosure in the Storybooks

- [ ] Create `stories/mirrored/Disclosure.stories.ts` with `title: "Components/Surfaces"` and the export `Disclosure`. The meta component description carries the story text.
- [ ] Remove the `Disclosure` export from `stories/Surfaces.stories.ts`. Add the id to the mirrored-ids pin in `tests/stories.test.ts`.
- [ ] Measure the `aria` literal in the built Firefox Storybook, then paste it.
- [ ] Check. `bunx playwright test e2e/usage.spec.ts --project firefox` passes with 0 diagnostics.

### Commit 3. Docs, smoke, and the verify recipe

- [ ] In `docs/usage/react.md`, add a section on building a disclosure with the `onToggle` sync and the shared-id clear, the type-error row for 003, Disclosure in the "not type errors" paragraph (001, 002), and `disclosure.tsx` in the directive paragraph. Add a Disclosure section to `docs/usage/eslint.md`. Update the README install sentence, the usage-contract list, and the component row.
- [ ] Add `docs/usage/disclosure.md` to `REQUIRED` in `scripts/consumer-smoke.ts`. The clean app renders a `Disclosure`.
- [ ] Update `.agents/skills/verify-odd-design/features/surfaces.md`, which says Disclosure has no React wrapper, and its sidebar-order line.
- [ ] Add the follow-ups in Appendix D to `docs/follow-ups.md`.
- [ ] Check. `bun run check`, `bun run build`, and `bun scripts/consumer-smoke.ts` pass.

## Verify on the real surface

- [ ] Rebuild both Storybooks, capture the HTML section to `after.json`, and run `bun scripts/capture-stories.ts --diff .verify/disclosure/base.json .verify/disclosure/after.json`. Pass means `changed` lists only `components-surfaces--disclosure`, with no `png` or `aria` change.
- [ ] Run `bun run test:browsers`. Pass means the Firefox and WebKit runs pass, the sweep reports 0 diagnostics, and axe reports 0 violations.
- [ ] Drive the composed build per the verify-odd-design skill. Open `react_components-surfaces--disclosure` and `components-surfaces--disclosure` in `calm` light, `holoterminal` dark, and one more palette. Save each screenshot and `ariaSnapshot`. Confirm that the two sides look the same, and that a click on "Does it need JavaScript?" gives `[false, true, false]` on both sides.

## Review and open the PR

- [ ] The `cursor grok-4.7` reviewer reads the diff against this plan. A fresh builder fixes each finding that blocks. Other findings go to `docs/follow-ups.md`.
- [ ] Run `/deslop` and `/no-comments` over the diff.
- [ ] Open the PR ready with `gh pr create --base main --repo Rakvadium/odd-design`. The title is `feat(react): add Disclosure and mirror it in the Storybooks`.
- [ ] Run `gh pr checks`. The repo has no workflows, so expect "no checks reported". Report the PR as open. Do not merge.

## Throughput checkpoint

- **Blocking first steps.** The committed plan, then the baseline capture. Commit 2 needs commit 1's part. Commit 3 needs both.
- **Independent workstreams.** None worth splitting. The tests, fixtures, story, and docs all read the `contract.ts` rows.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The `.verify/disclosure/` candidates are read-only references.
- **Smallest safe decomposition.** One builder, one commit at a time, each checked before the next. The base candidate's lab is already a full patch for most of commits 1 and 2, so a split would only add merges.

## Appendix A. Design choices

| Fork | Chosen | Why |
| --- | --- | --- |
| Parts | `Disclosure` only, with native `summary` and body | The summary has no class, and the stylesheet names the native tag |
| Summary rule | New `required-child` kind with a host-tag guard | The one measured structural failure. The guard keeps a wrong tag to one code |
| Child position | Direct child, any position | A summary placed last renders and toggles (measured) |
| `open="false"` | Follow-up | A rule needs a shared `enum` mode, and React already blocks the string |
| State | Native `open`, `name`, `onToggle` | The `onToggle` sync stays in step with the DOM in three engines (measured) |
| Foreign data | `system-data` | Catches `data-tone`. `data-state` stays on the headless allowlist |

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| An `enum` on `open` with `computed: "skip"` (Grok runner) | A shared mode for a raw-HTML string. The runner's reason that `boolean-attribute` would suggest `true` is wrong, since `nearest("false", ["true"])` returns nothing |
| A child rule with no host tag (Grok runner) | `div.odd-disclosure` would report 002 beside 001 |
| `first-child` | Flags a summary placed last, which works |
| `DisclosureSummary` with a new class | A second component for an element the CSS already names, plus CSS and registry edits |
| A `summary` prop | `jsx.ts` and `toHtml` read only `WRAPPERS`, so a correct composite fails the child rule and the Storybooks differ |
| A `"use client"` owner of `open` | A second writer beside the browser. The native sync works |
| No child rule, recorded in follow-ups | The missing summary hides the question. Alert's flat-children miss kept the text readable |

## Appendix C. Evidence and reading list

These files are local scratch under the gitignored `.verify/disclosure/` folder of this worktree. They are not on the branch.

- `how.md` explains the contract, the wrappers, the checkers, and the mirror for Disclosure, and lists nine forks.
- `task.md` and `rubric.md` are the arena's task and scoring rubric.
- `candidate-opus/` is the base. `lab.patch` is its diff for commits 1 and 2. `measure/` holds the markup, aria, React state, mutation, e2e, and browser runs.
- `candidate-grok/` is the other design, with its probes in `measure/`.
- `judge.md` holds the cross-judge's scores, its pick, and the grafts.

## Appendix D. Risks and follow-ups

- **`open="false"` stays unchecked in raw HTML.** It opens the panel in all three engines. A value check that skips computed values would catch it without warning on `open={state}`.
- **Bare text as the body is not styled.** It keeps the foreground color and sits 16px shorter than an element body (measured). The fix belongs in `disclosure.css`, on the content box.
- **A computed `open` with no `onToggle` goes stale.** After a click, React still holds the old value and cannot reopen that item (measured). Only ESLint on JSX could see it.
- **WebKit closes both panels when two items in one `name` start open.** Firefox and Chromium keep the first. No adapter passes siblings, so no rule checks a group.
- **An empty summary takes its name from the body, and a link inside a summary does not toggle it.** axe's `summary-name` and `nested-interactive` cover the stories only.
- **`aria-expanded` on a summary goes stale.** It stays `false` after a click opens the panel (measured). The summary has no class, so no rule sees it.
- **A computed child silences 002 in ESLint.** The runtime checker still sees the DOM.
- **The runtime observer watches insertions only.** A summary added later is not rechecked.
