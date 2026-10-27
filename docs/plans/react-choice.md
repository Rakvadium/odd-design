# React Choice plan

`odd-design/react` gains three Choice parts beside Button and the Field parts. `Choice` renders `label.odd-choice`, `Switch` renders `input.odd-switch`, and `Segmented` renders `fieldset.odd-segmented`. Each part renders one element with its class and passes every other prop through. Three new codes cover the Choice mistakes that one node can show. TypeScript, ESLint, and the runtime checker report them from the same `USAGE` rules. The Choices, Switch, and Segmented stories move into the mirror and keep their ids, so the React Storybook shows them built from the real parts.

The work ships as one PR on `feat/react-choice`, built as five commits after a baseline capture. Each commit ends in a check. Nothing merges or deploys.

This plan waits for approval. Nothing is built yet.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when its evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, verifies, and drives the browser session.

The design came from two architect runners and a cross-judge. Both runners built and tested their design in a scratch worktree. Their records are local scratch in the gitignored `.verify/plan/` folder of this worktree (Appendix C).

## Usage

```tsx
import { Choice, Segmented, Switch } from "odd-design/react";

<Choice>
  <input type="checkbox" defaultChecked /> Weekly digest
</Choice>;

<Choice>
  <Switch type="checkbox" role="switch" checked={on} onChange={toggle} /> Compact grid
</Choice>;

<Switch type="checkbox" role="switch" aria-label="Public" />;

<Segmented>
  <legend>View</legend>
  <label>
    <input type="radio" name="view" defaultChecked /> Grid
  </label>
  <label>
    <input type="radio" name="view" /> List
  </label>
</Segmented>;
```

| Part | Element | Required props |
| --- | --- | --- |
| `Choice` | `label.odd-choice` | |
| `Switch` | `input.odd-switch` | `type="checkbox"`, `role="switch"` |
| `Segmented` | `fieldset.odd-segmented` | |

The checkbox or radio inside `Choice`, and the `legend` and `label`s inside `Segmented`, stay raw elements, the way Field leaves `<option>` raw. `Input` is the wrong inner control, because it stamps `odd-input`. `disabled` is legal on every part, because `choice.css` dims with `:has(:disabled)`. `Switch` works without `Choice`, as Showcase's bare switch does.

## Contract

Each rule comes from the `choice.css` header or from the Button habit Field already guards against.

| Code | Fails when | Source | TypeScript |
| --- | --- | --- | --- |
| `ODD-CHOICE-001` | `odd-choice` is not on a `label`, `odd-switch` not on an `input`, or `odd-segmented` not on a `fieldset` | The `choice.css` header markup. A `div.odd-choice` does not toggle on a text click, and a `span.odd-switch` takes no input | Not a type error. Each part picks its tag |
| `ODD-CHOICE-002` | `odd-switch` is missing `type` or `role`, or either has another value | Without `type="checkbox"` the input is a text box drawn as a track, and `.odd-switch:checked` never matches. Without `role="switch"` a screen reader says "checkbox" | `type` and `role` are required props typed `"checkbox"` and `"switch"` |
| `ODD-CHOICE-003` | `aria-disabled` on any of the three classes | An agent that learned `Button` writes `aria-disabled`. The input still toggles and does not dim | `aria-disabled` on any part is the message string |

`USAGE` gains two keys. `choice` holds the `odd-choice` and `odd-segmented` element rules and the `aria-disabled` ban. `switch` holds the `odd-switch` element rule, the `type` and `role` rules, and the same ban. The split matters, because a key's attribute rules apply to every class in it, and `fieldset role="radiogroup"` must stay legal. Not added: a `disabled` ban (it contradicts the CSS), a parent rule for `odd-switch` (Showcase ships a bare switch), and a `system-data` rule (`VOCABULARY.choice` is empty).

The checker still sees one element at a time. `aria-disabled` on the raw checkbox inside `Choice`, a missing shared `name` on radios, and segmented's `> label > input` structure stay the caller's job, the same limit `field.md` states for `htmlFor`.

`check.ts`, `html.ts`, `jsx.ts`, `plugin.ts`, and `dom.ts` do not change, because every rule uses an existing kind.

## Shape

`WRAPPERS` gains three fixed-tag rows with `props: {}`. ESLint lowers them with no code change. Because `Switch` takes `type` and `role` from the caller, the JSX lowering sees the same attributes React renders, so `ODD-CHOICE-002` never fires on a correct `<Switch>`.

`src/react/part.ts` is new and internal. It takes `Message`, `Forbidden`, and `part` out of `field.tsx`, and adds `Pinned` and a `Part` union derived from `WRAPPERS`. `Pinned<Rule>` turns each `required-attribute` rule into a required prop typed as the `enum` values for that attribute, so `choice.tsx` writes no literal. The file is `.ts`, so it is not a barrel entry, and `package.json` exports only `./react`, so a consumer cannot import it. Field's public types do not change.

`src/react/choice.tsx` holds the three parts. It has no `"use client"`, because the parts hold no state and no handlers.

The mirror changes two types in `stories/mirror.ts` and no runtime code.

1. `NativeClass` becomes per tag. A wrapper's class stays banned on a native scene node, except a class with no element rule away from its wrapper's own tag. Today that frees only `odd-label` off a `label`, which the Choices legend needs (`legend.odd-label`). `label.odd-choice`, `span.odd-switch`, and `label.odd-label` stay type errors.
2. `StoryStyle` gains one named key, `"--gap"`, the knob `.odd-stack` reads. Today an inline `"--gap"` is TS2353. A `` `--${string}` `` pattern would also accept a misspelled `--gp`.

## Decide these before the build starts

The build waits for your go. Each item has a default, and the build uses it unless you say otherwise.

1. **Move `part` and `Forbidden` from `field.tsx` into a shared internal `src/react/part.ts`.** This edits a Field file, with no change to Field's exports, props, or tests. The alternative copies both helpers into `choice.tsx`, which leaves two copies to drift.
2. **`Switch` requires `type="checkbox"` and `role="switch"` from the caller.** The call site repeats two literals, and in exchange all three checkers see the markup React renders. The alternative writes them inside `Switch` and adds an "injected attributes" field to `WRAPPERS` that `jsx.ts` and `toHtml` read. That is a new contract mechanism for every wrapper, which Button and Field never needed.
3. **`ODD-CHOICE-003` bans `aria-disabled` on all three parts.** One rule for the family is easier to learn, and `<Choice aria-disabled>` is a likely guess. The weak case is `odd-segmented`, which has no disabled styling at all, but `fieldset disabled` does stop its radios. The alternative bans it on `odd-switch` only.
4. **Accept a new sidebar order in the HTML Storybook's Forms group.** Choices, Switch, and Segmented move after Search, because the mirrored file loads later. Their ids do not change. This is the same trade as the Field Storybook plan's decision 2.

## Arm the run

- [ ] Get the operator's go and answers to the four decisions. The evidence is the operator's reply in this thread.
- [ ] Brief one builder on `claudeAgent claude-opus-5-5` (effort high) with this file, `.verify/plan/how.md`, `.verify/plan/synthesis.md`, and `.verify/plan/candidate-opus/` (`design.md`, `labs.md`, `sketch/changes.patch`, and the applied tree in `sb/`). The patch is a reference, not a file to apply blind. The builder re-grounds each change against the source and keeps LF line endings. The evidence is the `delegate_task` taskId.

## Capture the baseline (no source change)

- [ ] Build this branch's HTML Storybook before any change with `bunx storybook build -c .storybook -o .verify/choice/base-sb`, serve it, and capture it with `bun scripts/capture-stories.ts <url> .verify/choice/base.json .verify/choice/base-shots`. The evidence is `base.json` with two captures per story, one in light mode and one in dark.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check.

### Commit 1. Check Choice markup with ODD-CHOICE-001 to 003

- [x] Add the `choice` and `switch` keys to `USAGE`, the `ChoiceRule` and `SwitchRule` types, and the three codes in `USAGE_CODES` and `MESSAGES`. The 001 message lists `odd-choice on label, odd-switch on input, odd-segmented on fieldset`.
- [x] Write `docs/usage/choice.md` with one section per code in the `field.md` style.
- [x] Add `odd-choice-001` to `003` bad and good HTML pairs, three `RUNTIME_CODES` lines, and three `places` rows in `tests/eslint-html.test.ts`. The 001 good file holds a bare labeled switch and a `fieldset.odd-segmented role="radiogroup"`, so it catches the switch rules leaking into the `choice` key.
- [x] Move the three classes in `tests/fixtures/usage/odd-class-001.good.html` onto `label`, `input type="checkbox" role="switch"`, and `fieldset`.
- [x] Check. The `eslint-html` story sweep still reports zero findings, which covers Showcase's bare switch, its `data-axis` segmented, and the Overlays choices.

### Commit 2. Share the Field part helpers

- [x] Create `src/react/part.ts` with `Message`, `Forbidden`, `Pinned`, the derived `Part` union, `Native`, and `part`. `field.tsx` imports them and keeps its exports byte for byte.
- [x] Check. `bun run check` passes with no test edited. `react-public-api.test.ts` still finds the barrel equal to the `.tsx` exports and no `WrapperProps` leak.

### Commit 3. Add the Choice parts

- [x] Create `src/react/choice.tsx` with `Choice`, `Switch`, and `Segmented`. Add the three `WRAPPERS` rows, the barrel export, three `WrapperProps` lines, and the `scripts/build.ts` entry.
- [x] Add type fixtures. `choice-aria-disabled.tsx` and `switch-aria-disabled.tsx` expect `ODD-CHOICE-003`. They are two because `Choice` and `Switch` read different rule groups, and `Segmented` shares `Choice`'s. `switch-type.tsx` passes a wrong `type` and a wrong `role`, and its `failures` entry requires the text `"checkbox"` and `"switch"`, so either prop widening back to `string` fails.
- [x] Add Choice call sites to `tests/fixtures/types/pass/pass.tsx`: a controlled switch with `ref`, `disabled` on each part, a bare switch with `aria-label`, and `Segmented disabled`. These catch a false positive, above all a copied Button ban on `disabled`.
- [x] Add `tests/fixtures/usage/jsx/choice.tsx` with the three correct parts plus one bad line each for 002 and 003, and its `places` entry. The correct lines report nothing, which proves each row lowers to its element-rule tag and that `type` and `role` reach the lowering.
- [x] Add one row to the markup table in `tests/react.test.tsx` with all three parts, as an exact string, then `checkRoot`.
- [x] Check. `bun run check` passes.

### Commit 4. Mirror Choice in the Storybooks

- [x] In `stories/mirror.ts`, make `NativeClass` per tag and add the `"--gap"` key to `StoryStyle`, as in Shape. The comment says the rule frees a class with no element rule off its wrapper's tag, not "legend".
- [x] Create `stories/mirrored/Choice.stories.ts` with `title: "Components/Forms"` and the exports `Choices`, `Switch`, and `Segmented`, so the ids stay `components-forms--choices`, `--switch`, and `--segmented`. The scenes use `of: "Choice" | "Switch" | "Segmented"`, raw `input`, `legend`, and `label` nodes inside, `defaultChecked` for `checked`, and a leading space in each label's text (`" Deck comments"`). The meta gets a description of the Choice parts, because the React Storybook reads only that file.
- [x] Delete the `Choices`, `Switch`, and `Segmented` exports from `stories/Forms.stories.ts`. Slider and Search stay.
- [x] Add the three ids to the mirrored-ids pin in `tests/stories.test.ts`.
- [x] Measure each story's `aria` literal in the built Firefox Storybook, then paste it. Do not copy the runner's values.
- [x] Check. Make three mutations and confirm each fails. Drop `defaultChecked` from `RENAMED`, and the Choices DOM comparison fails. Put `className: "odd-choice"` on a native `label` scene node, and `tsc` fails. Write `"--gp"` in a style, and `tsc` fails.

### Commit 5. Docs, smoke, and the verify recipe

- [ ] In `docs/usage/react.md`, add "Build a checkbox, a switch, or a segmented control", three rows in the type-error table, and `ODD-CHOICE-001` in the "not a type error" paragraph.
- [ ] Add the Choice parts to `docs/usage/eslint.md` and `README.md`, beside Field.
- [ ] Add `dist/react/choice.js`, `choice.d.ts`, and `docs/usage/choice.md` to `REQUIRED` in `scripts/consumer-smoke.ts`. The clean app renders `<Choice><Switch type="checkbox" role="switch" /> Compact grid</Choice>`. No bad-app line, matching Field.
- [ ] In `.agents/skills/verify-odd-design/features/forms.md`, replace the sentence that says Choices, Switch, and Segmented appear only in the HTML section, and add a "React Choice" section with the composed URLs `react_components-forms--choices`, `--switch`, and `--segmented`. The `.claude` and `.cursor` copies are links to this file, so check that they show the edit.
- [ ] Add two follow-ups to `docs/follow-ups.md`. `odd-segmented` has no disabled styling. A bare `input.odd-switch` with `disabled` does not dim, because the only dim rule is `.odd-choice:has(:disabled)`. Neither changes `choice.css` in this PR.
- [ ] Check. `bun run check` passes, then `bun run build` and `bun scripts/consumer-smoke.ts` pass.

## Verify on the real surface

- [ ] Rerun the baseline capture on the finished branch and run `bun scripts/capture-stories.ts --diff .verify/choice/base.json .verify/choice/after.json`. Pass means `changed` lists only the three Choice ids, in light and dark, with the field `dom` and never `aria` or `png`. The expected DOM change is the style spacing and the switch input's attribute order. Segmented should not appear at all.
- [ ] Run `bunx playwright test e2e/usage.spec.ts --project firefox`. Pass means the three Choice pairs have equal accessibility trees, each tree equals its `aria` literal, the screenshots are byte-identical, and the run reports 0 diagnostics. Then run `bun run test:browsers` for Firefox and WebKit.
- [ ] Serve the composed build with `bun scripts/storybooks.ts storybook-static`, then `bun e2e/serve.ts storybook-static 6106`. Drive the React section per the verify-odd-design skill, and record it with `preview_recording_start`.
  - [ ] Open `react_components-forms--choices`. Click the "Weekly digest" text and confirm its box checks. Click "Partner offers (unavailable)" and confirm nothing changes. Tab into the Visibility radios, press the down arrow, and confirm "Unlisted" becomes checked.
  - [ ] Open `react_components-forms--switch`. Click "Compact grid" and confirm the thumb moves and the accessibility tree shows the switch `[checked]`. Press Space on "Show card prices" and confirm it turns off.
  - [ ] Open `react_components-forms--segmented`. Tab to Grid, press the right arrow, and confirm List is selected and painted as selected.
  - [ ] Repeat the Choices and Segmented steps once in the HTML section and confirm the same results.
- [ ] Stop with `preview_recording_stop`. Convert the video to H.264 MP4. Write a transcript next to it with one line per step, saying what the agent did, what it saw, and the `ariaSnapshot`. If T3 recording fails, run the same steps in Playwright Firefox with `recordVideo` and say which recorder made the video.

## Review and open the PR

- [ ] Have the `cursor grok-4.7` reviewer read the diff against this plan and `.verify/plan/synthesis.md`. A fresh builder fixes each finding.
- [ ] Run `/deslop` and `/no-comments` over the diff.
- [ ] Open the PR ready, not draft, with `gh pr create --base main --repo Rakvadium/odd-design`. Title `feat(react): add the Choice parts and mirror them in the Storybooks`. Do not merge.

## Throughput checkpoint

- **Blocking first steps.** The operator's go, then the baseline capture. No source moves before `base.json` exists. Commit 3 needs Commit 1's rule types and Commit 2's `part.ts`, and Commit 4 needs Commit 3's `WRAPPERS` rows.
- **Independent workstreams.** None worth splitting. Everything hangs off `contract.ts`, and the tests, fixtures, and stories all read its rows. Commit 5 is docs and small.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The candidate folders under `.verify/plan/` are read-only references, and the baseline JSON is written once.
- **Smallest safe decomposition.** One builder, one commit at a time, each checked before the next. The runner's applied tree measured about 460 added and 80 removed lines across 35 files. A split would serialize on `contract.ts` anyway.

## Appendix A. Design choices

| Fork | Chosen | Why |
| --- | --- | --- |
| Parts | One wrapper per classed element: `Choice`, `Switch`, `Segmented` | It is Field's pattern. Each export is one `WRAPPERS` row and one `createElement`, so `toReact`, the lowering, and `part` need no second path. |
| `Switch` attributes | Caller passes `type` and `role`, typed from the contract by `Pinned` | ESLint never reads `src/react`, so attributes written inside `Switch` would be invisible to it. Both runners chose this independently. |
| Codes | Three, with `type` and `role` under one code | One code reads as "the switch markup". The type fixture checks both literals, so neither can widen unnoticed. |
| `USAGE` keys | `choice` and `switch` | A key's attribute rules apply to all its classes. One key would put `role` on `fieldset.odd-segmented`. |
| Choices legend | Per-tag `NativeClass` | It needs no new export, and `odd-label` belongs to the Field family. |
| `--gap` | One named `StoryStyle` key | A pattern key would accept a typo such as `--gp`. |

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| A `Legend` wrapper for `legend.odd-label` (Grok runner) | It is a second owner for Field's class and outside the one-family scope. HTML still allows `span.odd-label`, so it seals nothing. |
| Copying `part` and `Forbidden` into `choice.tsx` (Grok runner) | It leaves two copies and a hand-written `Part` union. |
| Four codes, with `type` and `role` split (Grok runner, judge graft) | It adds a code an agent must learn. The strengthened fixture catches the same regression. |
| `` `--${string}` `` style key (Grok runner) | It accepts any misspelled custom property. |
| `mirror.test.ts` pins for `defaultChecked` and `--gap` (Grok runner) | `expectSameDom` already fails if either breaks, because the HTML and React sides would differ. Duplicate tests. |
| `Switch` writes `type` and `role`, and `WRAPPERS` gains an injected-attributes field | It is a new contract field plus changes to `jsx.ts` and `toHtml` to save two props. |
| A composite `<Choice label type>` that renders the label and the input | It breaks one export to one element and has to re-expose `name`, `checked`, and `disabled`. |
| No `type` and `role` rules | `<input class="odd-switch">`, a text box drawn as a track, would pass every checker. |

## Appendix C. Evidence and reading list

These files are local scratch under the gitignored `.verify/plan/` folder in this worktree. They are not on the branch.

- `how.md` explains the contract, the wrappers, and the mirror end to end, and lists 15 open forks with file and line evidence.
- `task.md` and `rubric.md` are the arena's task and scoring rubric.
- `candidate-opus/` is the base design. With its patch applied, `bun run check` passed 389 tests, the Firefox pair sweep passed with 47 stories and 0 diagnostics, and consumer smoke passed. In Firefox, all three stories had the same aria and the same `#storybook-root` pixels as today's HTML stories (labs 5 to 8).
- `candidate-grok/` is the other design. Its applied tree passed `bun run check` with 395 tests and the Firefox pair sweep.
- `judge.md` is the cross-judge's scores and pick. `synthesis.md` records the base, the graft, the rejections, and one measurement the judge could not reproduce.

## Appendix D. Risks

- **The checker cannot see the raw inputs.** `aria-disabled` on the checkbox inside `Choice` passes every checker. Covering it needs a class on that input or a parent rule kind. Field left the same class of wiring unchecked.
- **`NativeClass` frees `odd-label` on every native tag but `label`.** That matches the checker, which has no element rule for `odd-label`, and Showcase's `span.odd-label`.
- **ESLint does not read scene data.** Moving the three stories out of `/* html */` templates removes them from `odd/usage`. `tsc`, `NativeClass`, and `checkRoot` in `tests/stories.test.ts` still run.
- **Runner measurements conflict on one point.** The Opus runner saw a pattern style key turn off the typo check. The judge could not reproduce that. The choice of the named key does not depend on it.
