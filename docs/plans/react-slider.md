# React Slider and Meter plan

`odd-design/react` gains three parts, `Slider`, `Meter`, and `Progress`. `Slider` renders `input.odd-slider`, and its `type="range"` is a required prop, the same pin `Switch` uses. `Meter` renders `meter.odd-meter` and `Progress` renders `progress.odd-progress`, and both map `tone` to `data-tone`. Seven codes cover the slider and bar mistakes: ODD-SLIDER-001 to 004 and ODD-METER-001 to 003. TypeScript, ESLint, and the runtime checker report them from the same `USAGE` rules. The Slider story and the Progress story move into the mirror and keep their ids, `components-forms--slider` and `components-feedback--progress`, so the React Storybook shows them built from the real parts.

The work ships as one PR on `feat/react-slider`, based on `6b6c6ee` (Search, PR #32). It is built as four commits after this plan, and each commit ends in a check. Nothing merges or deploys.

Caleb granted overnight autonomy for this run. The build starts after this plan is committed and uses the default in each decision below. The run stops when the PR is open and its checks report.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, and verifies.

The design came from two architect runners and a cross-judge. The Opus runner proposed three parts and one shared `meter` group. The Grok runner proposed five parts, adding `Stat` and `StatValue`, with separate progress and stat codes. Both put the slider readout in a story `play`. The `cursor grok-4.7` judge picked the Opus design as the base and named two grafts from the Grok design. The records are local scratch in the gitignored `.verify/slider/` folder of this worktree (Appendix C).

## Usage

```tsx
import { Field, Hint, Label, Meter, Progress, Slider, type MeterTone } from "odd-design/react";

function CopiesField() {
  const [copies, setCopies] = useState(3);
  return (
    <Field>
      <Label htmlFor="copies">Copies per card</Label>
      <output className="odd-stat-value" htmlFor="copies">{copies} of 4</output>
      <Slider type="range" id="copies" min={1} max={4} value={copies}
        onChange={(event) => setCopies(event.currentTarget.valueAsNumber)} aria-describedby="copies-hint" />
      <Hint id="copies-hint">Most formats allow up to 4.</Hint>
    </Field>
  );
}

<div className="odd-stat">
  <label htmlFor="actions">Actions</label>
  <span className="odd-stat-value">22 <span className="odd-muted">(37%)</span></span>
  <Meter id="actions" min={0} max={60} value={22} tone="info" />
</div>;

<Meter id="store-high" value={0.93} low={0.6} high={0.85} optimum={0} />;
<Progress id="import" value={40} max={100} aria-label="Importing decks" />;
<Progress id="sync" />;
```

A `Progress` with no `value` is the indeterminate bar. With `low` or `high`, a `Meter` colors itself by range, so it takes no `tone`.

| Part | Element | Props from the contract |
| --- | --- | --- |
| `Slider` | `input.odd-slider` | `type: "range"` is required. `aria-disabled` is typed as the 003 message. A system `data-*`, such as `data-tone`, is typed as the 004 message |
| `Meter` | `meter.odd-meter` | `tone?: "success" \| "warning" \| "danger" \| "info"`. Raw `data-tone` is `never`. Another system `data-*` is typed as the METER-003 message |
| `Progress` | `progress.odd-progress` | The same as `Meter` |
| (no part) | native `div.odd-stat`, its bare `label`, and `.odd-stat-value` on a `span` or an `output` | As `meter.css` documents them |

`slider.tsx` and `meter.tsx` have no `"use client"`. The parts have no state, effect, or handler.

## Contract

| Code | Group, kind | Fails when | Why it is a mistake | TypeScript |
| --- | --- | --- | --- | --- |
| `ODD-SLIDER-001` | `slider`, `element` on `input` | `odd-slider` is on another tag | A `div.odd-slider` has no range role, keys, or value. The range pseudo-elements never match. It also makes the group live | Not a type error. The part renders the tag |
| `ODD-SLIDER-002` | `slider`, `required-attribute type` and `enum type ["range"]` | `type` is missing or not `range` | An `input.odd-slider` with no type is a text box with slider sizing. `type="number"` gets no thumb or rail | Yes. `Pinned` makes `type: "range"` required, as for `Switch` |
| `ODD-SLIDER-003` | `slider`, `forbidden-attribute aria-disabled` | `aria-disabled` is set | `slider.css` styles only `:disabled`, and the thumb still moves. The same rule as ODD-FIELD-003 and ODD-CHOICE-003 | Yes, from `Forbidden` |
| `ODD-SLIDER-004` | `slider`, `system-data` | A system `data-*` is set | `VOCABULARY.slider` is empty, so any system `data-*` does nothing | Yes, from `ForeignData` |
| `ODD-METER-001` | `meter`, `element` rules for `odd-meter` on `meter` and `odd-progress` on `progress` | A bar class is on another tag | A `div.odd-progress` is an empty track with no value or role. In `progress.odd-meter`, the `::-webkit-progress-*` rules scoped to `.odd-progress` miss, so the UA bar shows through | Not a type error |
| `ODD-METER-002` | `meter`, `enum data-tone` with `omit: ["primary", "neutral"]` | `data-tone` is not one of the four tones | `meter.css` styles `success`, `warning`, `danger`, and `info`. `primary` or `neutral`, copied from Badge or Alert, silently draws the default bar | Yes. `tone` is the union and raw `data-tone` is `never` |
| `ODD-METER-003` | `meter`, `system-data` | A system `data-*` other than `data-tone` is set | `data-size` and the rest do nothing on a bar | Yes, from `ForeignData` |

`Meter` and `Progress` share the `meter` group, as `Input`, `Textarea`, and `Select` share `fieldControl`. One `data-tone` rule in `meter.css` styles both bars, so one group holds one tone list. The codes follow the stylesheet, as `odd-switch` reports ODD-CHOICE codes.

Not added:

- **A naming code.** No rule kind follows `for` to `id`. The Search port made the same call.
- **A code for `tone` with `low` or `high`.** The range rules override the tone (inferred from `meter.css`, not measured). It would need a new kind that reads two attributes. It goes to follow-ups.
- **A required bar inside `odd-stat`.** A stat with no bar is still the label and value row. `required-child` cannot say "meter or progress".
- **`low`, `high`, or `min` on `Progress`.** React's progress attributes already reject them.

## Shape

### Rows

```ts
slider: [
  { kind: "element", code: "ODD-SLIDER-001", className: "odd-slider", elements: ["input"] },
  { kind: "required-attribute", code: "ODD-SLIDER-002", element: "input", attribute: "type" },
  { kind: "enum", code: "ODD-SLIDER-002", attribute: "type", values: ["range"], omit: [] },
  { kind: "forbidden-attribute", code: "ODD-SLIDER-003", attribute: "aria-disabled" },
  { kind: "system-data", code: "ODD-SLIDER-004" },
],
meter: [
  { kind: "element", code: "ODD-METER-001", className: "odd-meter", elements: ["meter"] },
  { kind: "element", code: "ODD-METER-001", className: "odd-progress", elements: ["progress"] },
  { kind: "enum", code: "ODD-METER-002", attribute: "data-tone", values: ["success", "warning", "danger", "info"], omit: ["primary", "neutral"] },
  { kind: "system-data", code: "ODD-METER-003" },
],
```

```ts
Slider: { source: "odd-design/react", className: "odd-slider", props: {}, element: "input" },
Meter: { source: "odd-design/react", className: "odd-meter", props: { tone: "data-tone" }, element: "meter" },
Progress: { source: "odd-design/react", className: "odd-progress", props: { tone: "data-tone" }, element: "progress" },
```

Every rule kind the rows use exists today. `part.ts`, `check.ts`, `dom.ts`, the ESLint hosts, `mirror.ts`, `mirror-react.ts`, and both previews do not change.

### Parts

```tsx
// src/react/slider.tsx
interface SliderContract extends Contract<"Slider", SliderRule> {}
export interface SliderProps extends SliderContract, Native<"Slider", keyof SliderContract> {}
export const Slider: (props: SliderProps) => ReactElement = part("Slider");

// src/react/meter.tsx
export type MeterTone = Values<MeterRule, "data-tone">;
interface MeterContract extends Contract<"Meter", MeterRule> {}
interface ProgressContract extends Contract<"Progress", MeterRule> {}
export interface MeterProps extends MeterContract, Native<"Meter", keyof MeterContract> {}
export interface ProgressProps extends ProgressContract, Native<"Progress", keyof ProgressContract> {}
export const Meter: (props: MeterProps) => ReactElement = part("Meter");
export const Progress: (props: ProgressProps) => ReactElement = part("Progress");
```

`MeterTone` is exported like `AlertTone` and `BadgeTone`.

### The stylesheet test

`stylesheet()` in `tests/usage-contract.test.ts` derives `progress` from `odd-progress`, and there is no `progress.css`. Its result is both the file it reads and the `VOCABULARY` key. It returns `meter` for `odd-progress` and keeps the derived name for every other class. The mapped-enum pin gains two trailing `data-tone` entries.

### The slider readout

The Slider story's inline `oninput` keeps `output#copies-value` in sync, and a scene cannot carry an `on*` prop. The mirrored story keeps the `output` and adds a `play` beside `mirrored(...)`. The `play` finds `#copies` and `#copies-value` under `canvasElement` and assigns `slider.oninput`, which writes `` `${slider.value} of ${slider.max}` ``. Both Storybooks load the same file and both run `play`, so one definition wires both sides. Assigning the property, not adding a listener, means a second run replaces the handler. `bun test` never runs `play`, so the static markup equality still sees `3 of 4`.

`openStory` returns before `play` binds. The slider behavior test therefore probes first. It sets `#copies` to its max, dispatches `input`, waits until `#copies-value` reads `4 of 4`, and restores `3` the same way. Then it presses ArrowLeft twice and expects `1 of 4`. The test runs on both Storybooks, the way the tabs test does. The forms verify recipe gets the same wait.

## Decisions taken under the autonomy grant

Each item is the default the build uses. Each one can be reversed after review.

1. **Three parts, and the stat stays native.** `div.odd-stat`, its bare `label`, and `.odd-stat-value` live in `meter.css`, but no mistake there earns a code. A `StatValue` part would need a tag switch to cover both the Slider story's `output` and the Progress story's `span`, because an element rule bans the class on native scene nodes. If a later change pins `odd-stat-value`, the Grok runner's `htmlFor` switch is the way.
2. **One `meter` group and ODD-METER codes for both bars.** One tone list, one system-data message, one docs page per stylesheet. The Grok runner's separate ODD-PROGRESS codes would copy the same rules.
3. **`type="range"` is a required prop.** `part()` stays the three declarations, and `type="text"` is unrepresentable. The cost is one attribute at every call site, the same as `Switch`.
4. **`stylesheet()` maps `odd-progress` to `meter`.** This is the first graft from the Grok design. The judge rejected the Opus runner's content scan, because `.odd-button` lives in two files.
5. **The readout lives in the story `play`.** It keeps the live text, the e2e check, and the recipe on both sides. Docs pages show the static `3 of 4`.
6. **The behavior test probes the binding before ArrowLeft.** This is the second graft. It makes the race between `openStory` and `play` a wait on visible text.
7. **`stories/Forms.stories.ts` is deleted.** `Slider` is its last story, and a story file with no stories fails the catalog's coverage test. Its component paragraph on `:user-invalid` and `base-select` moves to the Field meta.
8. **The Progress story's `span.odd-stat-value.odd-muted` becomes `span.odd-stat-value > span.odd-muted`.** A native scene node takes one class. The story already nests `odd-muted` this way for `(40%)`. The capture diff should show `dom` only.
9. **Two new usage pages, `docs/usage/slider.md` and `docs/usage/meter.md`.** Both join `REQUIRED` in the consumer smoke.
10. **Accept a new sidebar order in Forms and Feedback.** Mirrored files load later. Every earlier port made the same trade.

## Capture the baseline (no source change)

- [x] Build both Storybooks at `6b6c6ee` and capture the HTML section to `.verify/slider/base.json` with `bun scripts/capture-stories.ts`. Result: built at `195f38d`, whose only change from `6b6c6ee` is this plan. 86 captures, served with `e2e/serve.ts` (`.verify/slider/base.json`, `build/shots-base/`).

## Build

Each commit ends with `bun run check`.

### Commit 1. Add Slider and check it with ODD-SLIDER-001 to 004

- [x] Add `USAGE.slider`, `SliderRule`, the `Slider` row, the four codes in `USAGE_CODES`, and their `MESSAGES`. Result: five rows as planned, after `search`. The messages name `input` for 001 and `type range` for 002, and 004 lists the appearance axes and the headless allowlist, as Search's 005 does.
- [x] Write `docs/usage/slider.md` with one section per code. Result: one section per code, with the labeled range input as the base shape.
- [x] Create `src/react/slider.tsx`. Add the barrel export and the `WrapperProps` line. Result: the README's three declarations, no `"use client"`. A `Slider` with no `type` is TypeScript's missing property error (TS2741, probed).
- [x] Add the `odd-slider-001` to `004` bad and good HTML pairs, the `RUNTIME_CODES` lines, and the `places` rows in `tests/eslint-html.test.ts`. Replace the bare `div.odd-slider` in `odd-class-001.good.html` with `input.odd-slider type="range"`. Result: the 001 bad page has a `div` and an `output` with the class, and the 002 bad page a missing `type` and `type="number"`. Each bad line reports at its attribute or tag in ESLint.
- [x] Add type fail fixtures for `type="text"`, `aria-disabled`, and `data-tone` on `Slider`, with their `failures` entries. Add a controlled `Slider` with an `output` readout to `pass.tsx`. Result: `slider-type` prints `"range"`, `slider-aria-disabled` prints ODD-SLIDER-003, and `slider-data-tone` prints ODD-SLIDER-004. `pass.tsx` gains `CopiesField`, a controlled `Slider` with an `output`.
- [x] Add `tests/fixtures/usage/jsx/slider.tsx` and its `places` entry. Cover a `div` with the class, a missing and a wrong `type`, a computed `type` (the `ODD-STATIC-001` warning), `aria-disabled`, `data-tone`, and a clean part. Result: nine lines, six diagnostics at their places. Deviation: a computed `type` is not silent. A rule reads `type`, so `type={kind}` gives the `ODD-STATIC-001` warning, as a computed `tone` on `Badge` does (`check.ts:218`). The fixture pins that warning, and the docs say so.
- [x] Add one markup row to `tests/react.test.tsx`. Result: a disabled `Slider` with `defaultValue` renders `<input type="range" … class="odd-slider wide" value="7"/>`, which the runtime checker accepts.
- [x] Check. Delete each new rule row one at a time, and each fails a test. Result: `bun run check` passes 553 tests. Each of the five row deletions fails at least the HTML places, the JSX places, and its bad fixture, and the 002, 003, and 004 rows also fail the type fixtures (`.verify/slider/build/mutations-c1.txt`, from `build/mutate.ts slider`).

### Commit 2. Add Meter and Progress and check them with ODD-METER-001 to 003

- [x] Add `USAGE.meter`, `MeterRule`, the two rows, the three codes, and their `MESSAGES`. Result: four rows as planned. METER-002's allowed text comes from `enumAllowed`, so it names the four tones and says primary and neutral mean remove the attribute. METER-003 names `data-tone`.
- [x] Map `odd-progress` to `meter` in `stylesheet()` and extend the enum pin. Result: `stylesheet()` returns `meter` for `odd-progress`, and the pin ends with two more `data-tone` entries.
- [x] Write `docs/usage/meter.md` with one section per code and the native stat shape. Result: one section per code, plus the stat shape with its bare `label`, `odd-stat-value`, and direct bar.
- [x] Create `src/react/meter.tsx`. Add the barrel export and the two `WrapperProps` lines. Result: `MeterTone`, `Meter`, and `Progress` from the planned declarations, no `"use client"`.
- [x] Add the `odd-meter-001` to `003` pairs, `RUNTIME_CODES`, and HTML `places`. The 001 bad page has `div.odd-meter`, `progress.odd-meter`, and `div.odd-progress`. Replace the bare `div.odd-meter` and `div.odd-progress` in `odd-class-001.good.html`. Result: the 001 bad page has the three planned misuses. The 002 bad page has `primary`, `neutral`, and a misspelled tone, and the 003 page `data-size` and `data-variant`. `odd-class-001.good.html` writes a `meter` and a `progress`.
- [x] Add type fail fixtures for `tone="primary"` on `Meter` and `data-size` on `Progress`. Add a toned `Meter` and an indeterminate `Progress` to `pass.tsx`. Result: `meter-tone` prints the four tone literals, and `progress-data-size` prints ODD-METER-003. `pass.tsx` gains `DeckMix`, with a tone from a `Record` of `MeterTone | undefined`, a range-colored `Meter`, and both `Progress` states.
- [x] Add `tests/fixtures/usage/jsx/meter.tsx` and its `places` entry. Cover the raw-class misuses, a bad tone, a computed tone (the `ODD-STATIC-001` warning), `data-size`, and clean parts. Result: fourteen lines, seven diagnostics at their places. Deviation: as for the slider, `tone={typeTone}` gives the `ODD-STATIC-001` warning, which the fixture pins. A raw `data-tone` on `Meter` gives nothing in ESLint (probed), as on `Badge`.
- [x] Add markup rows for a toned `Meter` and an indeterminate `Progress` with no `value` attribute. Result: `<Meter tone="info">` renders `data-tone="info"`, and `<Progress>` renders `<progress … class="odd-progress"></progress>` with no `value`.
- [x] Check. Delete each new rule row and the `stylesheet()` mapping one at a time, and each fails a test. Result: `bun run check` passes 562 tests. Deleting the METER-003 row fails the places, the bad fixture, and the type fixtures. Deleting any of the other three rows shifts `USAGE.meter[2]`, which `format.ts` reads for METER-002, so `format.ts` throws on import. A second pass therefore made each of those rows inert in place: each element row swapped to its sibling, and the enum aimed at an unread attribute. Each fails the HTML and JSX places and the enum pin, and the enum also fails the type fixtures. Dropping the mapping fails the enum pin and the vocabulary test (`.verify/slider/build/mutations-c2.txt`).

### Commit 3. Mirror Slider and Progress in the Storybooks

- [x] Create `stories/mirrored/Slider.stories.ts` with `title: "Components/Forms"`, export `Slider`, the scene from `Field`, `Label`, `Slider`, `Hint`, and the native `output`, and the `play`. Delete `stories/Forms.stories.ts` and move its component paragraph to the Field meta. Result: the scene is the planned `Field`, `Label`, `Slider`, `Hint`, and native `output`, with `defaultValue` on each `Slider`. The story-level text moves into the meta's component description, because `mirrored()` owns `parameters`. The `play` assigns `slider.oninput`. The Field meta gains the `:user-invalid` and `base-select` sentences.
- [x] Create `stories/mirrored/Meter.stories.ts` with `title: "Components/Feedback"` and export `Progress`. Remove `Progress` from `stories/Feedback.stories.ts`. Result: a local `stat()` builds each native `odd-stat` row, and the storage meters map from one table. `Feedback.stories.ts` keeps `Log`.
- [x] Pin both ids in `tests/stories.test.ts`. Result: the catalog test pins `components-forms--slider` and `components-feedback--progress`. Both pass the HTML-equals-React and `checkRoot` loops with no React warnings.
- [x] Measure both `aria` literals in the built Firefox Storybook, then paste them. Result: the HTML and React sides give identical `ariaSnapshot()` trees in Firefox. The Slider tree equals the base design's guess. The Progress tree names each bar and shows no value (`.verify/slider/build/aria-c3.txt`).
- [x] Add the probe to the slider test in `e2e/behavior.spec.ts` and run it on both Storybooks. Deviation: no probe. `openStory` waits until Storybook's `__STORYBOOK_PREVIEW__.currentRender.phase` is past `playing`, so `play` has returned before the test starts. Result: the test presses ArrowLeft twice and expects `1 of 4`. With `play` removed, all four runs fail there, with the readout still at `3 of 4` (`.verify/slider/build/fix2-no-play.txt`). An earlier version of the test, with the probe's fill steps still in it, passed with a `play` delayed by 1.5s and failed with the old wait on `#storybook-root`.
- [x] Check. `bunx playwright test e2e/usage.spec.ts e2e/behavior.spec.ts --project firefox` passes with 0 diagnostics. Result: `bun run check` passes 566 tests. Firefox passes 24 of 24 with "64 stories, 0 diagnostics", and both slider runs pass (`.verify/slider/build/browsers-c3-firefox.txt`).

### Commit 4. Docs, smoke, and the verify recipes

- [x] In `docs/usage/react.md`, add "Build a slider" and "Show progress or a measurement", the type-error rows, and the 001 codes in the "not type errors" paragraph. Add Slider and Meter sections to `docs/usage/eslint.md`. Update the README install sentence, the usage-contract list, and the component rows. Result: "Build a slider" teaches the required `type`, a controlled `Slider` with an `output`, and `disabled`. "Show progress or a measurement" teaches both `Progress` states, `tone` and `MeterTone`, range colors with no tone, and the native stat row. The table gains the SLIDER-003, SLIDER-004, and METER-003 rows and the `Slider` type rows. Both 001 codes join the raw-markup list.
- [x] Add both pages to `REQUIRED` in `scripts/consumer-smoke.ts`. The clean app renders a `Slider` and a `Meter`. Result: the clean app renders a `Slider` in a `Field` and a `Meter` in an `odd-stat`.
- [x] Update `.agents/skills/verify-odd-design/features/forms.md` and `feedback.md`: the React sections, the readout wait, and the measured sidebar order. Result: the slider recipe waits until `#copies` has an `oninput` function, and both files gain a React section. The measured order is Choices, Switch, Segmented, Text Fields, Select, Search, Slider in Forms, and Log, Alert, Progress, Skeleton in Feedback, in `index.json` and the composed sidebar. A `ctl.ts` run of the slider recipe saw the function on the first read, `--_progress` equal to each value, and `1 of 4` with progress 0 after two ArrowLefts (`.verify/slider/build/ctl-evidence/`).
- [x] In `docs/follow-ups.md`, drop the unmirrored-Slider line and add the follow-ups in Appendix D. Result: four lines, from Appendix D.
- [x] Check. `bun run check`, `bun run build`, and `bun scripts/consumer-smoke.ts` pass. Result: `bun run check` passes 566 tests, the build exits 0, and the smoke reports zero for its types, ESLint, and Vitest runs (`.verify/slider/build/smoke-c4.txt`).

## Verify on the real surface

- [x] Rebuild both Storybooks, capture to `after.json`, and diff against `base.json`. Pass means `changed` lists only the Slider and Progress stories, with no `png` or `aria` change. Result: built with `bun scripts/storybooks.ts .verify/slider/build/sb` at `6a28f96`. 86 captures. The diff reports 4 changed (Slider and Progress, light and dark, `dom` only), 0 removed, 0 added. The `oninput` attribute is gone, the inline styles lost their spaces, and `Waiting…` moved into a nested `span.odd-muted` (`.verify/slider/build/capture-diff.txt`, `dom-diff.txt`).
- [x] Run `bun run test:browsers`. Pass means Firefox and WebKit pass, 0 diagnostics, and 0 axe violations. Result: 50 passed, 2 skipped. "64 stories, 0 diagnostics". 0 axe violations in 58 runs per engine and mode, in Firefox and WebKit (`.verify/slider/build/browsers-tip.txt`).
- [x] Drive the composed build per the verify-odd-design skill. Open both sides of the Slider and Progress stories in `calm` light, `holoterminal` dark, and one more palette. Confirm matching screenshots and aria, and that ArrowLeft moves the readout on both sides. Result: `.verify/slider/build/chrome-pair.ts` drove the built composed Storybook in Chrome in `calm` light, `holoterminal` dark, and `bubblegum` `sorbet` dark. The manager lists both React stories. In each appearance the two sides give byte-identical screenshots, before and after two ArrowLefts, and the same aria tree. The value reaches 1 and `#copies-value` reads `1 of 4` on both sides, and a rerun matched. Slider shots allow animations, because disabling them cancels the scroll-driven fill. The first run, with the fill cancelled, differed after ArrowLeft in `calm` light only, and that did not recur (`.verify/slider/build/chrome/`, `chrome-pair.txt`).

## Review and open the PR

- [ ] The `cursor grok-4.7` reviewer reads the diff against this plan. A fresh builder fixes each finding that blocks. Other findings go to `docs/follow-ups.md`.
- [ ] Run `/deslop` and `/no-comments` over the diff.
- [ ] Open the PR ready with `gh pr create --base main --repo Rakvadium/odd-design`. The title is `feat(react): add Slider and Meter and mirror them in the Storybooks`.
- [ ] Run `gh pr checks`. Report the PR as open. Do not merge.

## Throughput checkpoint

- **Blocking first steps.** The committed plan and the baseline capture. Commit 2 reuses commit 1's test wiring. Commit 3 needs both parts. Commit 4 needs all three.
- **Independent workstreams.** None worth splitting. The tests, fixtures, stories, and docs all read the `contract.ts` rows and share `format.ts`, the test tables, and the README.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The `.verify/slider/` candidates are read-only references.
- **Smallest safe decomposition.** One builder, one commit at a time, each checked before the next. The shared files would turn a split into merges.

## Appendix A. Design choices

| Fork | Chosen | Why |
| --- | --- | --- |
| Parts | `Slider`, `Meter`, `Progress` | Each has a misuse that earns a code |
| Stat pieces | Native | No code earns them, and `StatValue` needs two tags |
| Slider type | Required `type: "range"` | The `Switch` precedent keeps `part()` |
| Bar codes | One `meter` group, ODD-METER | One CSS rule styles both bars |
| Stylesheet test | `odd-progress` maps to `meter` | The result is also the vocabulary key |
| Readout | Story `play` assigning `oninput` | Keeps the live text on both sides, and a rerun converges |
| Probe | Set, dispatch, and wait before ArrowLeft | `openStory` returns before `play` binds |
| `"use client"` | None | No state or handler |

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| `Stat` and `StatValue` parts (Grok runner) | No misuse earns a code. `StatValue` needs an `htmlFor` tag switch to keep the story's `output` |
| ODD-PROGRESS codes (Grok runner) | Copies the meter tone list and system-data rule |
| Content scan for the stylesheet (Opus runner) | `.odd-button` lives in two files, and the result must be the vocabulary key |
| Drop the live readout | Loses the e2e check and the one line of JS `slider.css` tells callers to write |
| A `wire` hook on the mirror, run by both previews | Threads a new field through `mirror.ts` and both previews to do what `play` does |
| A `Slider` that writes `output[for]` | Hides one story's sentence inside the library |

## Appendix C. Evidence and reading list

These files are local scratch under the gitignored `.verify/slider/` folder of this worktree. They are not on the branch.

- `grounding.md` explains the contract, the parts, the checkers, the mirror, and Slider and Meter today, with their traps.
- `task.md` is the arena's task and rubric.
- `candidate-opus/design.md` is the base.
- `candidate-grok/design.md` is the other design.
- `judge.md` holds the cross-judge's scores, the claims it found wrong, its pick, and the grafts.

## Appendix D. Risks and follow-ups

- **`tone` with `low` or `high` is unchecked.** The override is inferred, not measured, and no kind reads two attributes.
- **A wrapped bar inside `odd-stat` loses its full-width row.** No kind checks a direct child that may be one of two tags.
- **`play` does not run on Docs pages,** so the readout there is static.
- **`<Input type="range">` draws `odd-input` on a range,** and no code steers it to `Slider`.
