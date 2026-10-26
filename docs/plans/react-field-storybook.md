# Mirror React Field in the Storybooks plan

Today the React Storybook shows only `Button`. The React Field parts from PR #19 (`Field`, `Label`, `Input`, `Textarea`, `Select`, `Hint`, `FieldError`) have no story there, because a scene cannot nest one wrapper inside another, and `toHtml` writes React prop names such as `htmlFor` as HTML attributes. After this plan, the React section has `Components/Forms / TextFields` and `Components/Forms / Select`. They render the real Field parts, and the Firefox pair sweep holds them equal to the HTML section in DOM, accessibility tree, and pixels. The HTML stories keep their ids and look the same.

The work ships as one PR on `feat/react-field-storybook`, built as three commits after a baseline capture. Each commit ends in a check. Nothing merges or deploys.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when its evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, verifies, and drives the browser session.

The design came from two architect runners and a cross-judge. Their records are local scratch in the gitignored `.verify/plan/` folder of this worktree (Appendix C).

## Decide these before the build starts

The build waits for your go. Each item has a default, and the build uses it unless you say otherwise.

1. **Keep the TextFields `<form>` and replace its inline `onsubmit` with `method="dialog"`.** A scene cannot carry an inline handler, because React drops a string `onsubmit`. In Firefox, `method="dialog"` gave the same pixels and the same accessibility tree as today's markup. Pressing Enter never submits this form, because it has two text inputs and no submit button. Under `requestSubmit()`, both guards keep the page in place, and a form with no guard navigates (Opus labs L6 and L7). The alternative is a plain `div.odd-stack` root, which also matched in Firefox but drops the form the story shows.
2. **Accept a new sidebar order in the HTML Storybook's Forms group.** Text Fields and Select move after Search, because their file loads later (Opus lab L11). Their ids do not change. The alternative is a `storySort` entry. No lab tested it, and a nested `order` array also reorders the other Components groups.
3. **No Field Playground.** Button's Playground walks the enums in `USAGE.button`. `USAGE.field` has no enums, and the Field `WRAPPERS` rows map no props, so the controls would only toggle story data. TextFields already shows a hint, an error, a textarea, and a disabled field side by side. The alternative is a Playground with `invalid`, `disabled`, and `control` args, plus its own sweep values.

## Arm the run

- [ ] Get the operator's go and answers to the three decisions. The evidence is the operator's reply in this thread.
- [ ] Brief one builder on `claudeAgent claude-opus-5-5` (effort high) with this file, `.verify/plan/how.md`, `.verify/plan/synthesis.md`, and `.verify/plan/candidate-opus/` (`design.md`, `sketch/changes.patch`, and the applied copy in `sb/`). The patch is a reference, not a file to apply blind. The builder re-grounds each change against the source. The evidence is the `delegate_task` taskId.

## Capture the baseline (no source change)

- [ ] Build this branch's HTML Storybook before any change with `bunx storybook build -c .storybook -o .verify/field/base-sb`, serve it, and capture it with `bun scripts/capture-stories.ts <url> .verify/field/base.json .verify/field/base-shots`. The evidence is `base.json` with two captures per story, one in light mode and one in dark.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check.

### Commit 1. One node type for scenes

The data shape is one node, `{ of, props, children }`, keyed the way JSX is. An uppercase `of` is a key of `WRAPPERS`, and both renderers render it through its wrapper. A lowercase `of` is a native HTML tag. `isComponent(of)`, which is `Object.hasOwn(WRAPPERS, of)`, is the only branch. Props use React's names and React's types. Children are exactly the list written, with no inserted spaces.

- [ ] In `stories/mirror.ts`, replace `Element`, `Part`, and `Layout` with `Node<K>` and `Scene`. Derive each guard from data that already exists.
  - `props` is required exactly when the props type has a required key. This brings back `Label.htmlFor` and the `id` on `Hint` and `FieldError`. Button keeps optional props.
  - Children follow the rendered tag. The `VOID` tags and `textarea` take none. A `select` takes only `option` nodes, and an `option` takes only text. The `VOID` array also drives the missing closing tag in `toHtml`, so the type and the output cannot drift.
  - Scene props drop `on*`, `children`, `ref`, `key`, and `dangerouslySetInnerHTML`. Controls also drop `value` and keep `defaultValue` (graft 1).
  - `style` values are strings only (graft 2).
  - A native element's `className` must be a `CLASS_REGISTRY` class that is no wrapper's base class. `div.odd-field` and the typo `odd-stak` fail `tsc`.
- [ ] In `toHtml`, lower React props to HTML in one place.
  - `RENAMED` maps `htmlFor` to `for`, `defaultValue` to `value`, and `defaultChecked` to `checked`. Then the name is lowercased.
  - A boolean on a name other than `aria-*` or `data-*` is written bare when true and dropped when false. On `aria-*` and `data-*` it is written as `"true"` or `"false"`.
  - A style object becomes `name:value` pairs joined by `;`, the way React writes it.
  - On a `select`, `defaultValue` marks the matching `option` as `selected`. On a `textarea`, it becomes the content.
  - A void tag gets no closing tag, and `toHtml` throws if one has children (graft 3).
  - `WRAPPERS`-mapped props such as `variant` keep today's rule.
- [ ] Rewrite `toReact` in `stories/mirror-react.ts` as one walk, `createElement(isComponent(of) ? Wrappers[of] : of, props, ...children)`. Delete `interleave`, the `Layout` branch, and `cloneElement`.
- [ ] In `stories/mirrored/Button.stories.ts`, change each `layout: "row"` to `{ of: "div", props: { className: "odd-row" } }`. Move the space next to an icon into the text, as in `" Delete"`. Keep the titles, export names, args, and argTypes as they are.
- [ ] In `tests/mirror.test.ts`, swap the row and stack cases for native-element and nesting cases. Add one case per new `toHtml` rule (`for`, a bare boolean, `defaultValue` on input, select, and textarea, a style object, a void tag, a nested wrapper). Name each case for the mutation it catches. Add the illegal scenes as `@ts-expect-error` lines: children on `Input`, a `Label` with no props, an `option` inside `Field`, a string `style`, a numeric style value, `value` on `Input`, an `onSubmit`, and `div.odd-field`.
- [ ] Check. `bun run check` passes. `tests/stories.test.ts` still finds the Button pairs equal, which shows the Button DOM did not change.

### Commit 2. Move TextFields and Select into the mirror

- [ ] Create `stories/mirrored/Field.stories.ts` with `title: "Components/Forms"` and the exports `TextFields` and `Select`. The ids stay `components-forms--text-fields` and `components-forms--select`, which `sr-scenarios/form-error.ts`, `features/forms.md`, and the verify skill's story table use. Each scene rebuilds today's markup from the Field parts:
  - TextFields is a `form.odd-stack` with `method: "dialog"` (decision 1) and the `max-inline-size: 26rem` style. It holds four fields: Deck name with a hint, Email with `defaultValue`, `aria-invalid`, and a `FieldError`, Notes as a `Textarea`, and Owner as a disabled `Input`.
  - Select is a `Field` with the same style, holding a `Label` and a `Select` with `defaultValue: "Extended"` and four `option` nodes.
- [ ] Delete the `TextFields` and `Select` exports from `stories/Forms.stories.ts`. Choices, Switch, Segmented, Slider, and Search stay unchanged.
- [ ] Keep the Forms description on the meta in `stories/Forms.stories.ts`. Give the mirrored meta a description of the Field parts, because the React Storybook reads only that file. No story sets the `autodocs` tag, so neither Storybook should get a docs page. The evidence is that neither built `index.json` has a `docs` entry under `Components/Forms`.
- [ ] In `tests/stories.test.ts`, make `expectSameDom` fail when React logs anything while rendering a scene. That one assertion catches `value` without `onChange` and `<option selected>`, using React's own checks. Extend the catalog test so it asserts that both Forms ids are mirrored.
- [ ] Measure each story's `aria` literal in the built Firefox Storybook, then paste it. Do not copy the probe-page values.
- [ ] Check. Make three mutations and confirm each fails. Drop the `htmlFor` rename from `RENAMED`, and the TextFields DOM comparison fails. Give the Owner input `value` instead of `defaultValue`, and `tsc` fails. Mark an option `selected` in a cast, and the React warning guard fails.

### Commit 3. Docs and the verify recipe

- [ ] Rewrite the `docs/follow-ups.md` item "React Field has no mirrored story" to the residual: Slider and Search have no mirrored story. No wrapper renders `input.odd-slider`, a visually hidden label, or `form.odd-search`, and the Slider's inline `oninput` cannot be written in a scene. They stay in `stories/Forms.stories.ts` until those parts exist. (React Field)
- [ ] Add a follow-up. The ESLint JSX lowering in `src/eslint/jsx.ts` maps only `className`, so `<Label htmlFor>` lowers to an `htmlFor` attribute. No rule reads `for` today. It could share `RENAMED`. (React Field)
- [ ] In `docs/plans/mirror-storybooks.md`, update step 3 of "Add a second component" to say that a parent component's story nests nodes, with `stories/mirrored/Field.stories.ts` as the example.
- [ ] Add a "React Field" section to `.agents/skills/verify-odd-design/features/forms.md`. It gives the composed-Storybook URLs `react_components-forms--text-fields` and `react_components-forms--select` and the pair-sweep command, following the "React Button" section in `features/buttons.md`.
- [ ] Check. `bun run check` passes.

## Verify on the real surface

- [ ] Rerun the baseline capture on the finished branch and run `bun scripts/capture-stories.ts --diff .verify/field/base.json .verify/field/after.json`. Pass means `changed` lists only `components-forms--text-fields` and `components-forms--select`, in light and dark, with the field `dom` and never `aria` or `png`. The expected DOM change is `method="dialog"` in place of `onsubmit` and the spacing inside `style`. No story is added or removed.
- [ ] Run `bunx playwright test e2e/usage.spec.ts --project firefox`. Pass means both Field pairs have equal accessibility trees, each tree equals its `aria` literal, the screenshots are byte-identical, and the run reports 0 diagnostics. Then run `bun run test:browsers` for Firefox and WebKit.
- [ ] Serve the composed build with `bun scripts/storybooks.ts storybook-static`, then `bun e2e/serve.ts storybook-static 6106`. Drive the React section per the verify-odd-design skill, and record it with `preview_recording_start`.
  - [ ] Open `react_components-forms--text-fields`. Tab from Deck name through Email and Notes, and confirm Owner takes no focus. Type into Deck name, clear it, and blur. Confirm `:user-invalid` styling appears only after that interaction.
  - [ ] Confirm Email shows its error text and an `invalid` accessibility state.
  - [ ] Press Enter in Deck name, and confirm the iframe URL does not change.
  - [ ] Open `react_components-forms--select`. Confirm Extended is selected, pick Retro, and confirm the value changes.
  - [ ] Repeat the TextFields steps once in the HTML section and confirm the same results.
- [ ] Stop with `preview_recording_stop`. Write a transcript next to the video with one line per step, saying what the agent did, what it saw, and the `ariaSnapshot`. If T3 recording fails, run the same steps in Playwright Firefox with `recordVideo` and say which recorder made the video.

## Review and open the PR

- [ ] Have the `cursor grok-4.7` reviewer read the diff against this plan and `.verify/plan/synthesis.md`. A fresh builder fixes each finding.
- [ ] Run `/deslop` and `/no-comments` over the diff.
- [ ] Open the PR ready, not draft, with `gh pr create --base main --repo Rakvadium/odd-design`. Title `feat(storybook): mirror React Field in the Storybooks`. Do not merge.

## Throughput checkpoint

- **Blocking first steps.** The operator's go, then the baseline capture. No source moves before `base.json` exists, and Commit 2 builds on Commit 1's node type.
- **Independent workstreams.** None. `stories/mirror.ts`, `stories/mirror-react.ts`, the Button and Field stories, and both test files change together in Commits 1 and 2. Commit 3 is docs and small.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The candidate folders under `.verify/plan/` are read-only references, and the baseline JSON is written once.
- **Smallest safe decomposition.** One builder, one commit at a time, each checked before the next. A split would put two agents on `stories/mirror.ts` and the tests.

## Appendix A. Design choices

| Fork | Chosen | Why |
| --- | --- | --- |
| Scene vocabulary | React prop names, lowered once in `toHtml` | The props stay typed by the real components, so `LabelProps.htmlFor` and the Field contract types guard scenes. `toReact` needs no translation. |
| Native elements (`form`, `option`, `div.odd-row`) | Lowercase `of`, typed by React's intrinsic props | One node type. `Layout` would make a second way to write `div.odd-row`. |
| Field nesting | Children allowed by the rendered tag's content model | No Field-specific code. The next wrapper is a `WRAPPERS` row and a props type. |
| React-only rules (`value` without `onChange`, `<option selected>`) | Fail the DOM test when React logs | React already detects them. Copying the rules would be a second list. |
| Illegal scenes | `tsc` errors derived from `WRAPPERS`, `CLASS_REGISTRY`, and React's types | A type error is caught before any test runs. |

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| Keep `Layout` and add per-wrapper child kinds (Grok candidate) | It keeps a hand-written `FieldPartName` list and renderer branches on `Field`, `Select`, and `Input`. The next wrapper would extend both. |
| `Select` children as plain option strings (Grok candidate) | It is smaller to write, but it is keyed to the `Select` name, and an option whose value differs from its label needs a new child type. |
| HTML attribute names in the scene, lowered in `toReact` | The props would no longer be React's types, so the Field contract types would stop guarding scenes. The Button plan rejected this too. |
| An allowlist of native tags | It is about 0.05 s cheaper for `tsc` (Opus lab L5), but every new story would extend the list. |
| Throw when `defaultValue` matches zero or two options | React marks both matches selected, so the throw would make the HTML side stricter than React. |

## Appendix C. Evidence and reading list

These files are local scratch under the gitignored `.verify/plan/` folder in this worktree. They are not on the branch.

- `how.md` explains the mirror end to end and lists 21 Field blockers, each marked observed or read.
- `task.md` and `rubric.md` are the arena's task and scoring rubric.
- `candidate-opus/` is the base design. `labs.md` records eleven labs. In an applied copy (`sb/`), `bun run check` passed with 374 tests, the Firefox e2e suite passed 21 of 21 over 44 stories with 0 diagnostics, and tsc rejected all 15 illegal scenes.
- `candidate-grok/` is the other design and its labs. Firefox, with fonts, matched aria and pixels for a `div` root and for the React markup.
- `synthesis.md` records the cross-judge's scores, the base, the three grafts, and the rejections.

## Appendix D. Risks

- **Type cost.** The open tag set raises the mirror's type instantiations from about 30k to 343k, and the check time from 0.03 s to 0.20 s (Opus lab L5).
- **`toHtml` reimplements part of React DOM's serializer.** It covers the props these stories use. It does not cover React's booleanish strings (`spellCheck`, `draggable`), unitless numbers, or SVG nodes. The DOM comparison and the warning guard fail on the first story that needs one.
- **ESLint does not read scene data.** Moving TextFields and Select out of `/* html */` templates removes them from `odd/usage`. `tsc`, the native-class type, and `checkRoot` in `tests/stories.test.ts` still run.
- **The React warning guard misses a `value` on a disabled input.** The control types drop `value`, so `tsc` catches that case instead.
