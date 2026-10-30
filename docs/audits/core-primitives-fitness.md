# Fitness of Odd Design's core components

This report scores every component family Odd Design ships against one bar. The bar asks for the smallest unit that is accessible, testable, themeable, chromeable, and lintable. Each family gets one of the four verdicts in [the plan](../plans/core-primitives-fitness.md#the-verdicts). The report changes no product code. It says what to keep, split, and move, and which stories and usage codes each keeper still needs.

Four families leave core. `odd-estop` goes to the robot-arm app. `odd-stepper`, `odd-range-field`, and `odd-shell` become recipes, and the two behaviors they carry, `enhanceStepper` and `enhanceRangeField`, stay in core. Meter splits, so its bars stay and its stat row becomes a recipe. Every other family stays in core. Of the 28 families, only Button has stories of the kinds this bar asks for. Typography has one more if you count a Foundations story.

## How to read the evidence

The numbers come from `bun scripts/primitive-fitness.ts` on this branch. The product code here matches `main` at `d21483c`. Rerun the script after any later split or move and the tables update. A script cell is written as `Table › Column`, for example `Tokens › Literal colors`. Add `--json` for lists the markdown cuts short.

The rendered evidence is an HTML Storybook capture under `.verify/evidence/fitness/`, which is not committed. It holds 36 accessibility-tree snapshots of every `Components/*` story, chrome screenshots of seven stories, and forced-colors captures of five. Seven images that prove a claim below are copied into [`core-primitives-fitness/`](core-primitives-fitness/). The rest are cited by file name, such as `contact/components-controls--stepper.contact.png`.

The script judges nothing. Where a cell needed judgment, this report reads the code and says so in [Corrections to the script](#corrections-to-the-script).

## 1. The answer

The table ranks families by distance from the bar. Distance is a count of six gaps, each read from a script cell or a file:

- **D.** Strong domain coupling, meaning a class name or a rule that only makes sense in one app. Sample text does not count.
- **Th.** A literal color that bypasses a token outside forced colors.
- **L.** Lint. 1 when some class in the family has no usage rule, 2 when the family has no usage codes at all.
- **T.** No unit or e2e test written for the family's own behavior or rendering. The two suites every wrapper and mirrored story gets (`tests/react.test.tsx` "React markup" and `tests/stories.test.ts`) do not count.
- **S.** No story of a Button kind (Playground, Variants, Sizes, States, or Parts) after the hand corrections in section 3.
- **X.** At least one axis that a new static story could show and no story renders.

Accessibility and chrome findings are in each family's section but are not scored. Forced-colors and chrome screenshots exist for seven stories only, so a score would favor the families nobody captured. Ties sort by verdict (demote, then split, then keep) and then by name.

| Rank | Family | Verdict | Gaps | Reason |
| --- | --- | --- | --- | --- |
| 1 | E-stop | `demote-to-composed-recipe-or-app` | 7 (D, Th, L2, T, S, X) | A real one-button atom whose name and "never disable it" rule belong to machine control, and whose cap ignores the chrome. |
| 2 | Shell | `demote-to-composed-recipe-or-app` | 4 (L2, T, S) | Page layout slots filled by other families, with surface paint that `odd-card` already has. |
| 3 | Base utilities | `keep-as-core-primitive` | 4 (L2, T, S) | Six small utilities that every story uses, with no usage codes and no story of their own. |
| 4 | Grid | `keep-as-core-primitive` | 4 (L2, S, X) | A 12-column container-query grid that no other class gives. It belongs beside `odd-stack` and `odd-row`. |
| 5 | Range field | `demote-to-composed-recipe-or-app` | 3 (L2, S) | Its CSS only lays out `odd-slider` and `odd-input`. Its sync behavior stays in core. |
| 6 | Stepper | `demote-to-composed-recipe-or-app` | 3 (L2, S) | Its CSS only lays out `odd-button` and `odd-input`. Its hold-to-repeat behavior stays in core. |
| 7 | Meter | `split-into-smaller-primitives` | 3 (L, S, X) | The two bars are atoms. The stat row is a label, value, and bar layout. |
| 8 | Badge | `keep-as-core-primitive` | 3 (T, S, X) | One `span` with a tone dot. No story shows the neutral tone. |
| 9 | Field | `keep-as-core-primitive` | 3 (L, T, S) | Three control atoms and their label, hint, and error parts. `odd-label` has no usage rule. |
| 10 | Log | `keep-as-core-primitive` | 3 (L2, S) | A generic `role="log"` atom with tested behavior. It has no usage codes yet. |
| 11 | Typography | `keep-as-core-primitive` | 3 (L2, T) | Heading sizes and eyebrow tones with a README row but no usage codes. |
| 12 | Alert | `keep-as-core-primitive` | 2 (T, S) | One message box with fixed parts. Every tone renders in its story. |
| 13 | Card | `keep-as-core-primitive` | 2 (T, S) | A surface with a stretched-link pattern no other class has. |
| 14 | Choice | `keep-as-core-primitive` | 2 (T, S) | Three atoms in one file: checkbox and radio label, switch, segmented group. |
| 15 | Disclosure | `keep-as-core-primitive` | 2 (T, S) | One `details` with an animated chevron and height. |
| 16 | Menu | `keep-as-core-primitive` | 2 (L, S) | Menu items and keyboard behavior. Its label and shortcut parts have no usage rule. |
| 17 | Popover | `keep-as-core-primitive` | 2 (L, S) | Three atoms in one file. Tooltip and hover card have no usage rule and no React wrapper. |
| 18 | Separator | `keep-as-core-primitive` | 2 (T, S) | One `hr`, drawn with a border. |
| 19 | Slider | `keep-as-core-primitive` | 2 (S, X) | A native range with a CSS-only fill. No story shows right-to-left. |
| 20 | Table | `keep-as-core-primitive` | 2 (S, X) | A styled native table. Its one story packs in every axis and still misses two sort states. |
| 21 | Tabs | `keep-as-core-primitive` | 2 (S, X) | Tabs and keyboard behavior. No story shows vertical tabs. |
| 22 | Avatar | `keep-as-core-primitive` | 1 (S) | One `span` with an image fallback. |
| 23 | Dialog | `keep-as-core-primitive` | 1 (S) | A native modal dialog with fixed parts. |
| 24 | Search | `keep-as-core-primitive` | 1 (S) | One search box with an icon slot. The closest call among the older families. |
| 25 | Sheet | `keep-as-core-primitive` | 1 (S) | A dialog that slides in from an edge. |
| 26 | Skeleton | `keep-as-core-primitive` | 1 (S) | One decorative block. |
| 27 | Toast | `keep-as-core-primitive` | 1 (S) | A toaster region whose toasts `toast()` builds at runtime. |
| 28 | Button | `keep-as-core-primitive` | 0 | The reference. |

Meter's pieces get their own verdicts. `odd-meter` and `odd-progress` get `keep-as-core-primitive`. `odd-stat` and `odd-stat-value` get `demote-to-composed-recipe-or-app`.

Two rules decide the close calls, and they apply the same way to every family.

- A file that holds several atoms, each with its own class, gets one verdict when every atom would get the same one. Choice, Popover, Field, and Base utilities are recorded that way. A split is only for a family whose pieces would get different verdicts, which is Meter.
- A family whose class renders several controls side by side, laid out from other families' classes, is a composition. Stepper and Range field render separate boxes in a row (`contact/components-controls--stepper.contact.png`). Search also targets `odd-input` (`search.css:26-45`), but it renders one box with an icon inside it, so it counts as one element with fixed parts.

## 2. The composition map

A family is an atom when its own CSS or JS draws something no other class draws. It is a composition when its selectors or its markup contract mostly arrange other families' classes. `Shape › Selects other families` lists the selector reach. The markup reach comes from each CSS file's header comment.

### True atoms

| Family | Classes | What its own CSS or JS adds |
| --- | --- | --- |
| Button | `odd-button` | Four variants, two sizes, icon-only, a busy spinner, `aria-disabled`, and `aria-current` styling (`button.css:41-123`). |
| Field | `odd-field`, `odd-label`, `odd-input`, `odd-textarea`, `odd-select`, `odd-hint`, `odd-error` | Control boxes, a drawn select chevron and a styled picker (`field.css:116-170`), a required asterisk (`field.css:25-28`), and the error icon (`field.css:43-55`). |
| Choice | `odd-choice`, `odd-switch`, `odd-segmented` | A drawn switch (`choice.css:29-55`) and a radio group drawn as one control (`choice.css:66-128`). |
| Slider | `odd-slider` | A track fill driven by a scroll timeline, with no JS (`slider.css:99-120`). |
| Badge | `odd-badge` | Soft and solid tones with a dot (`badge.css:27-54`). |
| Card | `odd-card`, `odd-card-link`, `odd-card-title`, `odd-card-footer` | A surface and a stretched link that makes the whole card clickable (`card.css:28-39`). |
| Disclosure | `odd-disclosure` | A chevron and an animated height on `details` (`disclosure.css:29-61`). |
| Alert | `odd-alert`, `odd-alert-title` | A toned tint, border, and icon color (`alert.css:11-38`). |
| Meter (bars) | `odd-meter`, `odd-progress` | Cross-engine bar drawing, range colors, an indeterminate sweep, and a forced-colors redraw (`meter.css:14-94`, `meter.css:118-130`). |
| Skeleton | `odd-skeleton` | A pulsing block and an avatar shape (`skeleton.css:11-28`). |
| Avatar | `odd-avatar`, `odd-avatar-group` | Sized initials or image, an overlapping group, and `avatarFallback` (`enhance.ts:18-45`). |
| Separator | `odd-separator` | A border line in either direction (`separator.css:7-22`). |
| Table | `odd-table-wrap`, `odd-table`, `odd-table-sort` | Cell rules, numeric alignment, a selected-row tint, sort arrows (`table.css:15-122`), and `enhanceSelectAll` (`enhance.ts:47-100`). |
| Popover | `odd-popover`, `odd-hover-card`, `odd-tooltip` | The shared overlay panel, open motion, and anchor placement (`popover.css:30-107`). `popover.css` also gives `odd-menu` its panel, which is why `Shape › Selects other families` shows Menu. |
| Dialog | `odd-dialog`, `odd-dialog-title`, `odd-dialog-body`, `odd-dialog-actions` | Open and close motion and a backdrop on native `dialog` (`dialog.css:10-61`), plus `closedByFallback` (`fallbacks.ts:83-97`). |
| Sheet | `odd-sheet`, `odd-sheet-header`, `odd-sheet-body`, `odd-sheet-footer` | Edge placement, slide motion, and writing-direction handling (`sheet.css:20-115`). It reuses `odd-dialog-title` in markup (`sheet.css:8`) and Dialog's codes. |
| Menu | `odd-menu`, `odd-menu-item`, `odd-menu-label`, `odd-menu-shortcut` | Item states, check and radio marks (`menu.css:16-104`), and `enhanceMenu` keyboard behavior. One rule spaces an `odd-separator` (`menu.css:106-108`). |
| Tabs | `odd-tabs` | Tab list and tab states (`tabs.css:6-92`) and `enhanceTabs`. |
| Toast | `odd-toaster`, `odd-toast`, `odd-toast-title`, `odd-toast-body`, `odd-toast-description` | A click-through corner region and the toast card (`toast.css:6-92`), built by `toast()` in `src/js/toast.ts`. |
| Typography | `odd-heading`, `odd-eyebrow` | Seven heading sizes apart from level, and eyebrow tones (`typography.css:8-43`). |
| Base utilities | `odd-stack`, `odd-row`, `odd-muted`, `odd-visually-hidden`, `odd-skip-link`, `odd-scope` | Flex layout with a `--gap` variable, hidden text, a skip link, and a nested appearance scope (`base.css:70-113`). |
| E-stop | `odd-estop` | A round red cap in a yellow collar with a latched state (`estop.css:11-65`). |
| Log | `odd-log`, `odd-log-line` | A scrolling mono log with toned lines (`log.css:14-52`), `enhanceLog`, and `appendLogLine` (`log.ts:25-60`). |
| Grid | `odd-grid` | 12 columns with `data-span` and container-query collapse (`shell.css:58-90`). |

### Compositions

| Family | Classes it composes | What its own CSS or JS adds |
| --- | --- | --- |
| Search | `odd-input`, plus a bare `svg` and an `odd-visually-hidden` label (`search.css:1-9`) | Icon placement inside the input and a restyled clear button (`search.css:15-45`). The result is one control, so the verdict is keep. |
| Stepper | `odd-button`, `odd-input`, inside an `odd-field` (`stepper.css:1-11`) | Flex layout, centered tabular numbers, and hidden spin buttons (`stepper.css:18-42`). `enhanceStepper` adds hold-to-repeat, limit marking, and one `change` per press (`stepper.ts:13-108`). |
| Range field | `odd-slider`, `odd-input`, `odd-muted`, inside an `odd-field` (`range-field.css:1-10`) | Flex layout and tabular numbers (`range-field.css:18-33`). `enhanceRangeField` adds two-way sync and an `odd-error` for a number the slider can't take (`range-field.ts:22-98`). |
| Shell | `odd-heading`, `odd-badge`, `odd-button`, `odd-grid`, `odd-card` by markup (`shell.css:1-12`). No selector names them. | A full-height grid, a sticky header painted with the same surface tokens as `odd-card`, and two flex slots (`shell.css:20-56`). |
| Meter (stat row) | `odd-meter` or `odd-progress`, a bare `label`, and `odd-muted` (`meter.css:6-10`) | A two-column grid and a value style (`meter.css:96-112`). It selects the bars by element, `:is(meter, progress)`, so the script does not see the reach. |

## 3. Story depth against Button

Button has a `Playground` with controls, then `Variants`, `Sizes`, and `States`, and every one is mirrored in HTML and React. The table holds every family against that. The counts come from `Story depth`, with two hand corrections marked. "Static" axes are ones a new story could show without interaction. "Needs interaction" lists axes that only appear after a click, a focus, or a `toast()` call. Pseudo-classes such as `:hover` are left out, as the plan says.

| Family | Playground | Variants | Sizes | States | Parts | Assembled | Mirrored | Static axes no story renders | Needs interaction | Only assembled |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Button | 1 | 1 | 1 | 1 | 0 | 1 | 5 of 5 | none | none | |
| Field | 0 | 0 | 0 | 0 | 0 | 2 | 2 of 2 | none | `:open` on the select | flagged |
| Choice | 0 | 0 | 0 | 0 | 0 | 3 | 3 of 3 | none | none | flagged |
| Slider | 0 | 0 | 0 | 0 | 0 | 1 | 1 of 1 | `:dir(rtl)` | none | flagged |
| Search | 0 | 0 | 0 | 0 | 0 | 1 | 1 of 1 | none | none | flagged |
| Badge | 0 | 0 | 0 | 0 | 0 | 1 | 1 of 1 | `[data-tone="neutral"]` | none | flagged |
| Card | 0 | 0 | 0 | 0 | 0 | 1 | 1 of 1 | none | none | flagged |
| Disclosure | 0 | 0 | 0 | 0 | 0 | 1 | 1 of 1 | none | none | flagged |
| Alert | 0 | 0 | 0 | 0 | 0 | 1 | 1 of 1 | none | none | flagged |
| Meter | 0 | 0 | 0 | 0 | 0 | 1 | 1 of 1 | `[data-tone="warning"]`, `[data-tone="danger"]` | none | flagged |
| Skeleton | 0 | 0 | 0 | 0 | 0 | 1 | 1 of 1 | none | none | flagged |
| Avatar | 0 | 0 | 0 | 0 | 0 | 2 | 1 of 2 | none | none | flagged |
| Separator | 0 | 0 | 0 | 0 | 0 | 1 | 1 of 1 | none | none | flagged |
| Table | 0 | 0 | 0 | 0 | 0 | 1 | 1 of 1 | `[aria-sort="descending"]`, `[aria-sort="none"]` | none | flagged |
| Popover | 0 | 0 | 0 | 0 | 0 | 3 | 1 of 3 | none | `:popover-open` on all three | flagged |
| Dialog | 0 | 0 | 0 | 0 | 0 | 2 | 2 of 2 | none | `[open]` | flagged |
| Sheet | 0 | 0 | 0 | 0 | 0 | 1 | 1 of 1 | none | `[open]`, `[data-side="top"]`, `:dir(rtl)` | flagged |
| Menu | 0 | 0 | 0 | 0 | 0 | 1 | 1 of 1 | none | open menu | flagged |
| Tabs | 0 | 0 | 0 | 0 | 0 | 1 | 1 of 1 | `[aria-orientation="vertical"]` | none | flagged |
| Toast | 0 | 0 | 0 | 0 | 0 | 1 | 1 of 1 | none | every toast part, `[data-state="closing"]`, four tones | flagged |
| Typography | 0 | 0 | 1, by hand | 0 | 0 | 0 | 0 | eyebrow tones render only in Foundations and Showcase | none | |
| Base utilities | 0 | 0 | 0 | 0 | 0 | 0 | 0 | every class renders only inside other stories | `.odd-skip-link` | flagged, no story |
| E-stop | 0 | 0 | 0 | 0 | 0 | 1 | 0 of 1 | `[aria-pressed="true"]` | none | flagged |
| Stepper | 0 | 0 | 0 | 0 | 0 | 1 | 0 of 1 | none | none | flagged |
| Range field | 0 | 0 | 0 | 0 | 0 | 1 | 0 of 1 | none | none | flagged |
| Log | 0 | 0 | 0 | 0 | 0 | 1 | 0 of 1 | none | none | flagged |
| Shell | 0 | 0 | 0 | 0 | 0 | 1 | 0 of 1 | none | none | flagged |
| Grid | 0 | 0 | 0 | 0 | 0 | 1, by hand | 0 of 1 | `data-span` 1, 2, 3, 5, 6, 7, 9, 10, 11 | none | flagged |

Three things stand out.

- 26 of 28 families have only assembled stories, or none at all. Button is the exception, and Typography is one only if you count `foundations--headings`.
- Most families render every static axis already. Field, Choice, Card, Alert, Disclosure, Menu, and Search show all of theirs, and so do Dialog and Sheet apart from `[open]`. Their gap is the shape of the stories, not their coverage. A reader cannot see one part or one state alone.
- The PR #23 set has no mirrored stories, so no aria snapshot check covers it. `e2e/usage.spec.ts:145-149` compares the expected aria snapshot only for mirrored stories.

Table's story is the plan's example of the shape to avoid. It renders selection, sorting, numeric columns, a footer, links, and `Badge` in one widget (`Table.stories.ts:28-152`). Even so, it misses two sort states, because only one column can carry `aria-sort` at a time.

### Corrections to the script

These cells were wrong or misleading, and the report uses the corrected reading. None of them changes a verdict, so the script stands.

- `Story depth` gives Typography 0 stories. `foundations--headings` lays out all seven sizes in a column (`Foundations.stories.ts:114-130`), so it counts as a Sizes story.
- `Story depth` gives Grid 0 stories. `components-layout--app-shell` renders it (`Layout.stories.ts:33`), so Grid has one assembled story, shared with Shell.
- `Axes` misses `:required` in Field (`field.css:25`) and `:disabled` in Choice (`choice.css:24`), because both sit inside `:has()`. Both are rendered, by `Field.stories.ts:26` and `Choice.stories.ts:29`.
- `Axes` counts Sheet's `[data-side="top"]` and `:dir(rtl)` as static. A closed sheet is off screen, and ODD-DIALOG-004 forbids a static `open`, so both need the sheet opened first.
- `Tests` credits `e2e/behavior.spec.ts` to Shell and not to Grid. The only test there, "the app grid narrows panels to half, then to one column" (`behavior.spec.ts:379`), measures the grid.
- `Tests` credits `e2e/behavior.spec.ts` to Badge. The only mention is a hover target inside the hover-card test (`behavior.spec.ts:112`).
- `Tests` credits several tests to Base utilities that only use `odd-row` or `odd-stack` for layout.
- `Tokens › Literal colors` lists `black` for Search (`search.css:35`). It is the stroke inside a mask image, and a mask uses only alpha. The drawn color is `--muted-foreground` (`search.css:34`), so no token is bypassed.
- `Tokens › Chrome-varying tokens read` gives Log `--radius-surface`. Log caps it at `min(var(--radius-surface), var(--space-3))` (`log.css:20`), so the radius is the same in every chrome. The screenshots agree.
- `Shape › JS` gives Button `src/js/button-type.ts`. That file is a helper that `menu.ts:1` and `tabs.ts:1` import to keep items from submitting forms. It does not style or wire `odd-button`.
- `Domain words › Strong` counts sample text in CSS header comments and usage-page examples as strong. By the plan's rule, only a class name or a rule is strong, so every strong hit in this audit is weak in kind except E-stop's. E-stop's coupling is a rule the word list cannot see. Its header says "Never disable it" (`estop.css:4`), and the README repeats it (`README.md:191`).

## 4. Family by family

Each section covers the nine bar columns in the plan's order and ends with the verdict.

### Forms

#### Button

- **Shape.** One `button` or `a` (`button.css:2`). It selects no other family. Stepper selects it (`Shape › Selected by`).
- **Atom or composition.** Atom. Variants, sizes, icon-only, busy, disabled, and current-page styles are all its own (`button.css:41-123`).
- **Domain coupling.** Weak only. One card-deck word in the `Link` story (`Domain words › Weak hits`).
- **Accessible.** It disables with `aria-disabled` so the button stays focusable and announced (`button.css:4`), and ODD-BUTTON-007 forbids `disabled`. An icon-only button needs a name (ODD-BUTTON-008). Filled variants keep a transparent border that forced colors draws (`button.css:46-49`).
- **Testable.** `tests/react.test.tsx:349` checks that an `aria-disabled` button ignores a click and Enter. `tests/usage-dom.test.ts` and `e2e/usage.spec.ts` run its codes against the DOM. `tests/stories.test.ts:155-182` checks every Playground control.
- **Themeable.** 29 tokens, no literal colors. The literal lengths are `em` icon and spinner sizes (`Tokens › Literal lengths`).
- **Chromeable.** 16 chrome-varying tokens, including radius, shadow, press transform, and label case (`Tokens › Chrome-varying tokens read`). No screenshot was taken, because the script flagged nothing.
- **Lintable.** 15 codes, 15 good and 15 bad fixtures, VOCABULARY `data-icon-only`, `data-size`, `data-variant`, and a `Button` wrapper (`Contract`).
- **Story depth.** Five stories, four of them typed kinds, all mirrored, and all 11 static axes rendered (`Axes`).

**Verdict.** `keep-as-core-primitive`, by the keep row. One element, its own substance, and no gaps.

#### Field

- **Shape.** `div.odd-field` holding `odd-label`, one control (`odd-input`, `odd-select`, or `odd-textarea`), and `odd-hint` or `odd-error` (`field.css:1-10`). It selects no other family.
- **Atom or composition.** A container with three control atoms. Range field, Search, and Stepper select `odd-input` on its own (`Shape › Selected by`), so the controls are used apart from `odd-field`. All seven classes would get the same verdict, so the family is not split.
- **Domain coupling.** Weak only. Three card-deck words in story labels (`Domain words › Weak hits`).
- **Accessible.** Native controls. The header warns that a hidden error is still announced (`field.css:7-9`), and ODD-FIELD-002 enforces it. Invalid styling waits for `:user-invalid` (`field.css:101-106`). The required asterisk is hidden from screen readers (`field.css:24-28`). In forced colors the select drops its drawn chevron for the native one (`field.css:172-177`).
- **Testable.** No test of its own rendering. `tests/range-field.test.ts:55` checks that an `odd-error` appears for a bad number, and that is Range field's behavior. The rest is lint (`tests/eslint-jsx.test.ts`, `tests/usage-check.test.ts`).
- **Themeable.** 30 tokens, no literal colors. The literal lengths draw the select chevron (`field.css:119-124`).
- **Chromeable.** 14 chrome-varying tokens, including control radius, edge, focus glow, and the picker's overlay fill (`Tokens`). In glass the input becomes a pill (`contact/components-forms--search.contact.png`).
- **Lintable.** 3 codes reach six of seven classes. `odd-label` has a `Label` wrapper but no element rule (`contract.ts:62-76`).
- **Story depth.** Two assembled stories, both mirrored. `TextFields` already renders required, invalid, and disabled (`Field.stories.ts:26`, `:34`, `:49`). What is missing is a Playground and a States story that sets those side by side.

**Verdict.** `keep-as-core-primitive`, by the keep row. One element with fixed parts, plus control atoms that need no class change.

#### Choice

- **Shape.** Three atoms. `label.odd-choice` around a native box (`choice.css:8-27`), `input.odd-switch` (`choice.css:29-64`), and `fieldset.odd-segmented` (`choice.css:66-134`).
- **Atom or composition.** Atoms. Each draws its own control. They would all get the same verdict, so the file is not split.
- **Domain coupling.** Weak only. One card-deck word in a story label.
- **Accessible.** All native inputs, so Space and arrow keys work with no JS (`choice.css:6`). A switch must be `type="checkbox"` with `role="switch"` (ODD-CHOICE-002). In forced colors the switch falls back to a native checkbox (`choice.css:57-64`), and the checked segment gets a `Highlight` outline (`choice.css:130-134`).
- **Testable.** None found beyond the two shared suites (`Tests` lists only `tests/react.test.tsx` and `tests/stories.test.ts`).
- **Themeable.** 25 tokens, no literal colors. The literal lengths are the 24px target and the box and segment sizes.
- **Chromeable.** 13 chrome-varying tokens, including control radius, shadow, and label case. No screenshot was taken.
- **Lintable.** 3 codes reach all three classes. `Choice`, `Switch`, and `Segmented` wrappers.
- **Story depth.** Three assembled stories, all mirrored, and every static axis rendered.

**Verdict.** `keep-as-core-primitive`, by the keep row. Three one-element atoms in one file.

#### Slider

- **Shape.** One native `input type="range"` (`slider.css:1-8`). Range field selects it.
- **Atom or composition.** Atom. The track fill comes from a scroll timeline with no JS, and the header explains the WebKit fallback (`slider.css:10-13`, `slider.css:99-120`).
- **Domain coupling.** Weak only. The strong hit is the word "formats" in a usage-page example (`docs/usage/slider.md:9`).
- **Accessible.** Native keyboard (`slider.css:7`). ODD-SLIDER-003 forbids `aria-disabled`. Forced colors redraw the track and thumb in system colors (`slider.css:122-127`).
- **Testable.** "the slider moves by keyboard and its fill follows the thumb" (`behavior.spec.ts:398`).
- **Themeable.** 10 tokens, no literal colors outside the forced-colors block.
- **Chromeable.** 4 chrome-varying tokens, and only `--shadow-control` changes the paint. The rail and thumb use `--radius-chip`, which every chrome sets to `var(--radius-pill)` (`calm.css:16` and the same line in the other four). In the range-field sheet only the thumb shadow changes, in bubblegum (`contact/components-controls--range-field.contact.png`).
- **Lintable.** 4 codes, a `Slider` wrapper.
- **Story depth.** One assembled story. No story renders `:dir(rtl)`, which flips the fill direction (`slider.css:40`).

**Verdict.** `keep-as-core-primitive`, by the keep row.

#### Search

- **Shape.** `search.odd-search`, or `form.odd-search` inside `search`, holding a visually hidden label, an icon `svg`, and `odd-input type="search"` (`search.css:1-9`).
- **Atom or composition.** A composition by selector, since it reaches into `odd-input` (`Shape › Selects other families`). It renders as one box with the icon inside, and its contract fixes the parts (ODD-SEARCH-002 and ODD-SEARCH-003), so it is one element with fixed parts.
- **Domain coupling.** None found (`Domain words`).
- **Accessible.** `search` is the search landmark. ODD-SEARCH-003 requires `aria-hidden="true"` on the icon. Forced colors redraw the clear button in `ButtonText` (`search.css:42-46`).
- **Testable.** "the search field's clear button is restyled" (`behavior.spec.ts:425`).
- **Themeable.** 3 tokens. The `black` in `Tokens › Literal colors` is mask alpha, not a bypass (see [Corrections to the script](#corrections-to-the-script)).
- **Chromeable.** It reads one chrome-varying token. The box follows Field's chrome changes, and the icon and layout stay put (`contact/components-forms--search.contact.png`).
- **Lintable.** 5 codes, a `Search` wrapper.
- **Story depth.** One assembled story. Its one static axis renders.

**Verdict.** `keep-as-core-primitive`, by the keep row. This is the closest call among the older families. If Caleb reads "arranges other families' classes" by selector alone, Search would move to a recipe with Stepper and Range field.

### Display

#### Badge

- **Shape.** One `span` (`badge.css:2`).
- **Atom or composition.** Atom. A tone dot and soft and solid fills (`badge.css:27-54`).
- **Domain coupling.** Weak only. "Banned" is example text (`docs/usage/badge.md:8`).
- **Accessible.** Text carries the meaning, and tone is tint and dot (`badge.css:3`). Forced colors drop every tone, and all badges become the same white outline ([table-forced.png](core-primitives-fitness/table-forced.png)). The family has no forced-colors block (`Tokens › Forced-colors blocks` is 0).
- **Testable.** None found of its own. The one e2e mention is a hover target (`behavior.spec.ts:112`).
- **Themeable.** 25 tokens, no literal colors.
- **Chromeable.** Label case, tracking, and border width change by chrome. Tone colors and the pill shape do not ([table-chromes.png](core-primitives-fitness/table-chromes.png)).
- **Lintable.** 4 codes. ODD-BADGE-002 fixes the tone list.
- **Story depth.** One assembled story. No story renders `data-tone="neutral"`.

**Verdict.** `keep-as-core-primitive`, by the keep row.

#### Card

- **Shape.** `article`, `section`, or `div` with an optional title, link, and footer (`card.css:1-6`).
- **Atom or composition.** Atom. The stretched link makes the whole card clickable while a screen reader hears one link (`card.css:3-5`, `card.css:28-33`).
- **Domain coupling.** Weak only. "decks" in a usage-page example (`docs/usage/card.md:8`).
- **Accessible.** ODD-CARD-004 forbids `onClick` and `tabindex` on the card. The focus ring moves to the card through `:has()` (`card.css:35-39`). No forced-colors capture of Card exists in `forced/`, so none found.
- **Testable.** None found beyond the shared suites.
- **Themeable.** 24 tokens, no literals.
- **Chromeable.** 16 chrome-varying tokens. In the app-shell sheet, cards take radius 14, 24 in glass, and 16 in bubblegum and darkmatter (`contact/components-layout--app-shell.contact.png`, per the helper report).
- **Lintable.** 7 codes. ODD-CARD-006 already allows `data-span` (`contract.ts:149`), which ties cards to Grid.
- **Story depth.** One assembled story. Every static axis renders.

**Verdict.** `keep-as-core-primitive`, by the keep row.

#### Avatar

- **Shape.** A `span` with an image or initials, and a `div` group (`avatar.css:1-8`).
- **Atom or composition.** Atom, with `avatarFallback` (`enhance.ts:18-45`).
- **Domain coupling.** None found.
- **Accessible.** Initials need `role="img"` and a name (ODD-AVATAR-003 and ODD-AVATAR-004). The fallback keeps the image's name, or hides a decorative one (`enhance.ts:27-34`).
- **Testable.** "a broken avatar image falls back to its initials and keeps its name" (`behavior.spec.ts:329`).
- **Themeable.** 9 tokens, no literal colors.
- **Chromeable.** Border and shadow change by chrome. The header says the shape follows the chrome's chip radius (`avatar.css:5`), but every chrome sets `--radius-chip` to the pill radius, so the shape never changes.
- **Lintable.** 6 codes, two wrappers.
- **Story depth.** Two assembled stories. `AvatarFallback` is HTML only (`DataDisplay.stories.ts:8`).

**Verdict.** `keep-as-core-primitive`, by the keep row.

#### Separator

- **Shape.** One `hr` (`separator.css:1-5`). Menu spaces it (`menu.css:106-108`).
- **Atom or composition.** Atom.
- **Domain coupling.** Weak only, in story text.
- **Accessible.** It is drawn with a border so forced colors keep it (`separator.css:5`). ODD-SEPARATOR-003 forbids hiding it.
- **Testable.** None found beyond the shared suites and lint.
- **Themeable.** 2 tokens, no literals.
- **Chromeable.** Only `--border-width` varies, which is the whole line.
- **Lintable.** 4 codes.
- **Story depth.** One assembled story. The vertical axis renders.

**Verdict.** `keep-as-core-primitive`, by the keep row.

#### Table

- **Shape.** `div.odd-table-wrap` around `table.odd-table`, with `button.odd-table-sort` in sortable headers (`table.css:1-14`). The story adds `Badge`.
- **Atom or composition.** Atom. It styles a native table and its fixed parts. Selection, the select-all box, and sorting all work on native elements. `enhanceSelectAll` adds the header box's mixed state (`enhance.ts:47-100`) and needs no class of its own.
- **Domain coupling.** Weak only. The 24 strong hits are "decks" in header comments and usage examples (`table.css:2-12`, `docs/usage/table.md`).
- **Accessible.** A wrap that scrolls needs `tabindex`, a region role, and a name (ODD-TABLE-002 and ODD-TABLE-003). Only the sorted column carries `aria-sort` (`table.css:12-13`), and the aria dump agrees (`aria-attrs/components-data-display--table.json`). In forced colors the selected-row tint is gone, but the checked box still shows the selection ([table-forced.png](core-primitives-fitness/table-forced.png)).
- **Testable.** "select-all checks every row, shows mixed, and clears" (`behavior.spec.ts:310`) and a StrictMode test (`tests/react.test.tsx:480`).
- **Themeable.** 22 tokens, no literal colors.
- **Chromeable.** The wrap's radius, border, blur, and font change, and expressive uppercases headers. Row rules, the selected tint, sort arrows, and numeric alignment stay the same ([table-chromes.png](core-primitives-fitness/table-chromes.png)).
- **Lintable.** 5 codes. Nothing checks that the `data-select-all` box has a name.
- **Story depth.** One assembled story that carries every axis. `[aria-sort="descending"]` and `[aria-sort="none"]` are not rendered.

**Verdict.** `keep-as-core-primitive`, by the keep row. One element with fixed parts. Its gaps are stories, not classes.

#### Disclosure

- **Shape.** One `details` with a `summary` (`disclosure.css:2`).
- **Atom or composition.** Atom. A chevron and an animated height (`disclosure.css:29-61`).
- **Domain coupling.** None found.
- **Accessible.** Native `details`. Sharing `name` makes an accordion with no JS (`disclosure.css:3`). Chrome exposes each `details` as an unnamed group with a named summary (`aria/components-surfaces--disclosure.txt`), which is the browser's mapping. The chevron is drawn in `currentColor`, so forced colors keep it (inferred from `disclosure.css:34-35`, no capture).
- **Testable.** None found beyond the shared suites and lint.
- **Themeable.** 13 tokens, no literal colors.
- **Chromeable.** 5 chrome-varying tokens, including heading case and control height.
- **Lintable.** 3 codes. ODD-DISCLOSURE-002 requires a `summary`.
- **Story depth.** One assembled story. `[open]` renders.

**Verdict.** `keep-as-core-primitive`, by the keep row.

### Feedback

#### Alert

- **Shape.** A `div` with an icon and an `odd-alert-title` (`alert.css:1-5`).
- **Atom or composition.** Atom.
- **Domain coupling.** Weak only. The strong hits are example text (`alert.css:4`, `docs/usage/alert.md`).
- **Accessible.** A message present from the start takes no role, and a later one goes into a live container (`alert.css:6-8`). ODD-ALERT-003 forbids `role` and `aria-live` on the alert. The story has no live container, so no alert in it has a role (`aria/components-feedback--alert.txt`). That matches the contract but never shows the pattern. No forced-colors capture of Alert exists in `forced/`, so none found. The title is meant to carry the tone (`alert.css:9`).
- **Testable.** None found beyond the shared suites and lint.
- **Themeable.** 20 tokens, no literal colors.
- **Chromeable.** 5 chrome-varying tokens. Tone colors come from the palette.
- **Lintable.** 5 codes.
- **Story depth.** One assembled story. All four tones render.

**Verdict.** `keep-as-core-primitive`, by the keep row.

#### Meter

- **Shape.** Two bars, `progress.odd-progress` and `meter.odd-meter`, and a stat row, `div.odd-stat` with a bare `label`, `odd-stat-value`, and a bar (`meter.css:1-13`).
- **Atom or composition.** Two atoms and one layout. The bars have their own substance (`meter.css:14-94`). The stat row is a grid that places a label, a value, and a bar (`meter.css:96-112`). `odd-stat-value` is also used outside the row, on a slider's `output` (`Slider.stories.ts:31`, `docs/usage/react.md:442`).
- **Domain coupling.** Weak only (`meter.css:2`, `docs/usage/meter.md:6`).
- **Accessible.** Native elements, and the value must show as text (`meter.css:11`). Forced colors redraw the bars with a `Highlight` fill (`meter.css:114-130`). Low, high, and optimum colors are lost, and every bar is the same cyan ([progress-forced.png](core-primitives-fitness/progress-forced.png)). The text values carry the reading.
- **Testable.** "progress and meter bars render, including in forced colors" (`behavior.spec.ts:417`) and the reduced-motion test (`behavior.spec.ts:431`). Nothing tests the stat row.
- **Themeable.** 9 tokens, no literal colors outside the forced-colors block.
- **Chromeable.** Only `--density` and `--ease` vary. The bars use `--radius-chip`, the same in every chrome, and palette colors. They look the same in all five chromes. That is inferred from the tokens, since no chrome screenshot of Progress was taken.
- **Lintable.** 3 codes reach the bars. The usage page says the stat has no codes and no React part (`docs/usage/meter.md:23`). A known follow-up says a wrapped bar loses its full row (`docs/follow-ups.md:115`).
- **Story depth.** One assembled story. `data-tone="warning"` and `data-tone="danger"` are not rendered.

**Verdict.** `split-into-smaller-primitives`, by the split row, because the file ships a second thing a consumer uses apart, a layout. `odd-meter` and `odd-progress` get `keep-as-core-primitive`. `odd-stat` and `odd-stat-value` get `demote-to-composed-recipe-or-app`, because their CSS only arranges a label and a bar.

#### Skeleton

- **Shape.** A `div` block, `aria-hidden`, inside a busy region (`skeleton.css:1-9`).
- **Atom or composition.** Atom.
- **Domain coupling.** Weak only (`skeleton.css:3`).
- **Accessible.** Decoration only. ODD-SKELETON-003 requires `aria-hidden="true"`, and ODD-SKELETON-004 keeps `aria-busy` off the block. Forced colors outline the block (`skeleton.css:30-35`).
- **Testable.** "reduced motion stops the skeleton pulse and the progress sweep" (`behavior.spec.ts:431`).
- **Themeable.** 5 tokens, no literal colors.
- **Chromeable.** Radius follows `--radius-control`, and size follows `--density`.
- **Lintable.** 5 codes.
- **Story depth.** One assembled story. Both shapes render.

**Verdict.** `keep-as-core-primitive`, by the keep row.

### Overlays

#### Popover

- **Shape.** Three atoms on the Popover API: `odd-popover`, `odd-tooltip`, and `odd-hover-card` (`popover.css:1-28`).
- **Atom or composition.** Atoms. They share a panel and motion, and `odd-menu` borrows the same rules (`popover.css:30-107`).
- **Domain coupling.** Weak only (`popover.css:14-20`, `docs/usage/popover.md`).
- **Accessible.** The browser handles top layer, light dismiss, Escape, and focus return (`popover.css:2-3`). A popover with controls must be `role="dialog"` with a name (ODD-POPOVER-003 to ODD-POPOVER-005). Forced colors outline the tooltip (`popover.css:109-113`). The story has two buttons named "Filters" (`aria/components-overlays--popover.txt`).
- **Testable.** Tooltip on hover and on focus, hover card, and popover placement (`behavior.spec.ts:75-121`).
- **Themeable.** 17 tokens, no literal colors.
- **Chromeable.** 10 chrome-varying tokens, including overlay fill, radius, and blur.
- **Lintable.** 6 codes, all on `odd-popover`. `odd-tooltip` and `odd-hover-card` have no element rule and no wrapper. `src/js/usage/format.ts:749` already explains why a tooltip must use `popover="hint"`.
- **Story depth.** Three assembled stories. Only Popover is mirrored. Tooltip and HoverCard are HTML only (`Overlays.stories.ts:19`, `:41`).

**Verdict.** `keep-as-core-primitive`, by the keep row, for all three atoms.

#### Dialog

- **Shape.** A native `dialog` with title, body, and actions parts (`dialog.css:1-9`).
- **Atom or composition.** Atom, with `closedByFallback` (`fallbacks.ts:83-97`).
- **Domain coupling.** Weak only, in usage examples.
- **Accessible.** `showModal()` gives the focus trap, Escape, an inert page, and focus return (`dialog.css:8`). Codes require a name and forbid a static `open`. Both stories render closed, so the dialog is absent from the aria tree.
- **Testable.** Backdrop close and alert-dialog behavior (`behavior.spec.ts:148`, `:158`).
- **Themeable.** 15 tokens, no literal colors.
- **Chromeable.** 8 chrome-varying tokens.
- **Lintable.** 8 codes, and Sheet borrows five.
- **Story depth.** Two assembled stories. `[open]` needs a click.

**Verdict.** `keep-as-core-primitive`, by the keep row.

#### Sheet

- **Shape.** A native `dialog` with header, body, and footer `div`s (`sheet.css:1-19`). It reuses `odd-dialog-title`.
- **Atom or composition.** Atom. Edge placement and slide motion are its own (`sheet.css:20-115`).
- **Domain coupling.** Weak only.
- **Accessible.** Plain `div`s for header and footer, so they are not page landmarks (`sheet.css:17-18`). ODD-DIALOG-002 to ODD-DIALOG-006 apply (`Contract › Borrowed codes`).
- **Testable.** "sheets fill the edge they slide in from and close on Escape or a backdrop click" (`behavior.spec.ts:174`).
- **Themeable.** 14 tokens, no literal colors.
- **Chromeable.** 8 chrome-varying tokens.
- **Lintable.** 3 own codes and 5 borrowed.
- **Story depth.** One assembled story. The top side and right-to-left need the sheet opened.

**Verdict.** `keep-as-core-primitive`, by the keep row.

### Interactive

#### Menu

- **Shape.** `div.odd-menu` as a popover with `role="menu"`, holding `button.odd-menu-item`, `odd-menu-label`, `odd-menu-shortcut`, and `odd-separator` (`menu.ts:6-15`).
- **Atom or composition.** Atom. Item states and marks (`menu.css:16-104`) and `enhanceMenu`. Its panel comes from `popover.css`.
- **Domain coupling.** Weak only. The 13 strong hits are "deck" in the example menu (`menu.ts:7-8`, `docs/usage/menu.md`).
- **Accessible.** Arrow, Home, End, and type-ahead keys, and Tab closes (`menu.ts:17-21`). A disabled item stays reachable (`menu.ts:24-26`). Focus shows as a ring and a fill (`menu.css:7`). Forced colors use `Highlight` (`menu.css:110-115`).
- **Testable.** `behavior.spec.ts:200` and `:296`, and `tests/react.test.tsx:448`.
- **Themeable.** 20 tokens, no literal colors.
- **Chromeable.** 7 chrome-varying tokens of its own, plus the popover panel's.
- **Lintable.** 7 codes plus ODD-POPOVER-002. `odd-menu-label` and `odd-menu-shortcut` have no rule.
- **Story depth.** One assembled story. Every static axis renders.

**Verdict.** `keep-as-core-primitive`, by the keep row.

#### Tabs

- **Shape.** `div.odd-tabs` holding a tablist, tabs, and panels (`tabs.ts:6-13`).
- **Atom or composition.** Atom. Its tablist copies the segmented control's look (`tabs.css:2-3`, `tabs.css:16-24` against `choice.css:67-76`).
- **Domain coupling.** Weak only (`tabs.ts:8`).
- **Accessible.** One tab stop, arrow keys, and manual activation with `data-activation="manual"` (`tabs.ts:15-18`). Forced colors outline the selected tab (`tabs.css:89-92`).
- **Testable.** "tabs follow the arrow keys, and manual tabs wait for Enter" (`behavior.spec.ts:239`) and three React tests (`tests/react.test.tsx:375-428`).
- **Themeable.** 19 tokens, no literal colors.
- **Chromeable.** 10 chrome-varying tokens.
- **Lintable.** 5 codes.
- **Story depth.** One assembled story that already shows manual tabs (`Tabs.stories.ts:50`). No story renders `aria-orientation="vertical"`.

**Verdict.** `keep-as-core-primitive`, by the keep row.

#### Toast

- **Shape.** A `section.odd-toaster` manual popover. `toast()` builds each toast and its parts (`toast.css:1-5`).
- **Atom or composition.** Atom. The region and card are its own (`toast.css:6-92`).
- **Domain coupling.** Weak only, in usage examples.
- **Accessible.** The region needs `popover="manual"` and a label (ODD-TOAST-002 and ODD-TOAST-003). A toast is read as one sentence without its buttons (`behavior.spec.ts:283`). Tone shows only as a dot drawn with `background` (`toast.css:81-88`), and the file has no forced-colors block, so the dot likely disappears in forced colors. That is inferred. No capture was taken.
- **Testable.** `behavior.spec.ts:267` and `:283`, and `tests/react.test.tsx:556`.
- **Themeable.** 19 tokens, no literal colors.
- **Chromeable.** 7 chrome-varying tokens.
- **Lintable.** 4 codes on the region. Toast parts have no rule, which is fine, because consumers never write them.
- **Story depth.** One assembled story. Every toast part needs a `toast()` call.

**Verdict.** `keep-as-core-primitive`, by the keep row.

### Typography and layout

#### Typography

- **Shape.** `odd-heading` on any heading level, and `odd-eyebrow` on a `p` (`typography.css:1-7`).
- **Atom or composition.** Atoms.
- **Domain coupling.** None found.
- **Accessible.** Size is separate from level, so the outline stays right (`typography.css:3`). Nothing checks that `odd-heading` sits on a heading element.
- **Testable.** None found (`Tests` is empty).
- **Themeable.** 20 tokens, no literal colors.
- **Chromeable.** 6 chrome-varying tokens, including heading case, weight, and the hero glow.
- **Lintable.** 0 codes. VOCABULARY lists `data-size` and `data-tone` (`contract.ts:434`), and the README has a row (`README.md:174`), but no rule reads them. No React wrapper.
- **Story depth.** `foundations--headings` is a Sizes story by hand. Eyebrow tones render only inside Foundations and Showcase stories.

**Verdict.** `keep-as-core-primitive`, by the keep row. Its gaps close with codes and stories, not class changes.

#### Base utilities

- **Shape.** Six classes in `base.css:70-113`.
- **Atom or composition.** Atoms. `odd-stack` and `odd-row` are layout, `odd-muted` is a color, `odd-visually-hidden` and `odd-skip-link` are accessibility helpers, and `odd-scope` nests an appearance.
- **Domain coupling.** None found.
- **Accessible.** The hidden text reappears on focus (`base.css:74`), and the skip link slides in on focus (`base.css:95-97`). `odd-scope` needs all three of `data-chrome`, `data-palette`, and `data-mode` (`base.css:102-105`), and nothing checks it.
- **Testable.** None found of their own. The tests the script lists use `odd-row` and `odd-stack` only for layout.
- **Themeable.** 12 tokens, no literal colors.
- **Chromeable.** Only `odd-scope` paints, through the page background and body font.
- **Lintable.** 0 codes and no VOCABULARY entry.
- **Story depth.** No story of their own. Every class except `odd-skip-link` renders inside other stories.

**Verdict.** `keep-as-core-primitive`, by the keep row, for all six.

### The PR #23 set

The robot-arm app is the only known consumer of these five families and Grid. None has a usage code, a React wrapper, or a mirrored story (`Contract`, `Story depth › Mirrored`).

#### E-stop

- **Shape.** One `button` (`estop.css:2`). It selects no other family.
- **Atom or composition.** Atom. The cap, collar, rim shadow, and latched state are all its own (`estop.css:11-65`).
- **Domain coupling.** Strong. The name is an emergency stop. The rule "Never disable it" (`estop.css:4`, `README.md:191`) only makes sense for a machine, and the header tells the page to "show the machine's state" (`estop.css:7`). The story's component description says "Controls for driving a machine" (`Controls.stories.ts:9`).
- **Accessible.** A plain button with `aria-pressed` for a latching stop (`estop.css:5-8`). After Enter, the tree shows `[pressed=true]` and the status text (`aria-extra/components-controls--emergency-stop.latched.txt`). In forced colors the latched cap fills with `Highlight`, so the state stays visible ([estop-forced-latched.png](core-primitives-fitness/estop-forced-latched.png)). The longer status text shifts both caps sideways in that capture. The story's status region has no name (`aria/components-controls--emergency-stop.txt`).
- **Testable.** None found (`Tests` is empty).
- **Themeable.** It mixes the rim from `--danger` and literal `black` (`estop.css:12`). The font weight 800 and tracking 0.06em are fixed (`estop.css:27`, `:31`).
- **Chromeable.** The cap, collar, and STOP text look the same in all five chromes. Only the outer shadow and, in bubblegum, the font change ([estop-chromes.png](core-primitives-fitness/estop-chromes.png)).
- **Lintable.** 0 codes. VOCABULARY has an empty `estop` entry (`contract.ts:417`).
- **Story depth.** One assembled story. No story renders `aria-pressed="true"` without a click.

**Verdict.** `demote-to-composed-recipe-or-app`, by the demote row's second clause, because its purpose belongs to one app. It moves to the robot-arm app. The forced-colors latched drawing (`estop.css:55-65`) is the part worth keeping in view, since any toggle button that draws its pressed state with a fill needs the same fix.

#### Stepper

- **Shape.** `div.odd-stepper role="group"` holding `odd-button`s with `data-step` around `odd-input type="number"` (`stepper.css:1-11`).
- **Atom or composition.** Composition. Every rule but the container selects `odd-button` or `odd-input` (`stepper.css:24-42`). The behavior is real and generic. `enhanceStepper` steps with the input's own `stepUp` and `stepDown`, repeats on hold, marks limits, and fires one `change` per press (`stepper.ts:1-9`).
- **Domain coupling.** Weak only. All 23 hits are jog, wrist, and gripper labels in the story (`Domain words › Weak hits`). The ±1 and ±10 jog row exists only in story markup (`Controls.stories.ts:71-75`). Neither the CSS nor the JS assumes it.
- **Accessible.** The group is named by the label (`stepper.css:4`). Buttons at a limit get `aria-disabled` (`stepper.ts:19-28`). Without JS the number input still works (`stepper.css:15-16`).
- **Testable.** Five unit tests (`tests/stepper.test.ts:30-70`) and "a held stepper button repeats in whole steps of the input" (`behavior.spec.ts:339`).
- **Themeable.** 3 tokens, no literal colors.
- **Chromeable.** It paints nothing of its own. Its buttons and input follow the chrome fully (`contact/components-controls--stepper.contact.png`).
- **Lintable.** 0 codes. VOCABULARY has an empty `stepper` entry.
- **Story depth.** One assembled story. No static axis is missing.

**Verdict.** `demote-to-composed-recipe-or-app`, by the demote row's first clause, because its CSS arranges other families' classes. `enhanceStepper` stays in core as a behavior with its own markup contract. A recipe documents both the single ± field and the jog row.

#### Range field

- **Shape.** `div.odd-range-field` holding `odd-slider`, `odd-input type="number"`, and an optional unit (`range-field.css:1-10`).
- **Atom or composition.** Composition. Both rules select other families (`range-field.css:24-33`). `enhanceRangeField` adds the sync and the error (`range-field.ts:1-10`).
- **Domain coupling.** None found.
- **Accessible.** The number is named by the label and the unit (`range-field.css:11-12`). A bad number gets `aria-invalid` and an `odd-error` named by `aria-describedby` (`range-field.ts:45-56`). The page hears each change once, from the slider (`range-field.ts:6-7`).
- **Testable.** Six unit tests (`tests/range-field.test.ts:35-80`). No e2e test.
- **Themeable.** 1 token.
- **Chromeable.** It paints nothing of its own. The input and track follow the chrome, and the fill and thumb stay the same (`contact/components-controls--range-field.contact.png`).
- **Lintable.** 0 codes.
- **Story depth.** One assembled story.

**Verdict.** `demote-to-composed-recipe-or-app`, by the demote row's first clause. `enhanceRangeField` stays in core.

#### Log

- **Shape.** `div.odd-log role="log"` of `odd-log-line` `div`s, each with an optional `time` (`log.css:1-5`).
- **Atom or composition.** Atom. It selects no other family. `enhanceLog` pins to the bottom until the reader scrolls up, and `appendLogLine` adds text, never HTML, and trims to `max` (`log.ts:8-10`).
- **Domain coupling.** Weak in kind. The five strong hits are robot-arm sample text in header comments (`log.css:2-4`, `log.ts:5-6`). They should be reworded, since they ship in the package, but no rule or class depends on them. The story's sample lines are weak (`Feedback.stories.ts:29-38`).
- **Accessible.** `role="log"` is a polite live region, with advice to turn it off for fast logs (`log.css:6-8`). `tabindex="0"` lets a keyboard user scroll. Tone is color only, so the level goes in the text (`log.css:9`). In forced colors every line gets the same start border and the tints flatten, so only the words "Info:", "Warning:", and "Error:" tell tones apart ([log-forced.png](core-primitives-fitness/log-forced.png)).
- **Testable.** Three unit tests (`tests/log.test.ts:33-65`) and "the log follows new lines until the reader scrolls up" (`behavior.spec.ts:359`).
- **Themeable.** 18 tokens, no literal colors.
- **Chromeable.** The log body looks the same in all five chromes. Radius is capped (`log.css:20`), and the fill, font, and tints don't vary. Only the border turns 2px and dark in bubblegum ([log-chromes.png](core-primitives-fitness/log-chromes.png)).
- **Lintable.** 0 codes. VOCABULARY lists `data-tone` (`contract.ts:419`).
- **Story depth.** One assembled story. All four tones render.

**Verdict.** `keep-as-core-primitive`, by the keep row. One element with a fixed part, its own substance, and no strong coupling.

#### Shell

- **Shape.** `div.odd-shell` with a header (title, status slot, actions) and a main area (`shell.css:1-14`). The story fills it with 12 other families (`Shape › Other families in its stories`).
- **Atom or composition.** Composition. Its selectors name no other family, but its job is to place other families' classes in slots. The only paint is the header, and it uses the same surface tokens as `odd-card` (`shell.css:35-39` against `card.css:13-18`). Layout alone does not make an atom. `Showcase/SampleApp` builds a full page header from `odd-row` without it (`Showcase.stories.ts:46-56`).
- **Domain coupling.** Weak in kind. "NexArm" and "jog" sit in header comments (`shell.css:4`, `:9`).
- **Accessible.** A `header` and `main` give landmarks. The status slot may take `role="status"` (`shell.css:13-14`). In the story it has no name (`aria/components-layout--app-shell.txt`).
- **Testable.** None found of its own. The e2e test the script credits to it measures Grid.
- **Themeable.** 11 tokens, no literal colors.
- **Chromeable.** The header changes radius, border, shadow, and blur by chrome. The layout does not (`contact/components-layout--app-shell.contact.png`).
- **Lintable.** 0 codes. VOCABULARY files `data-span` under `shell` (`contract.ts:427`), but Grid reads it.
- **Story depth.** One assembled story.

**Verdict.** `demote-to-composed-recipe-or-app`, by the demote row's first clause, as a page-layout recipe. This is the closest call in the PR #23 set. If Caleb wants a page frame in core, the header bar is one element with fixed parts and could stay.

#### Grid

- **Shape.** Any container, with `data-span` on children (`shell.css:16-18`).
- **Atom or composition.** Atom. A 12-column grid that measures itself, not the viewport (`shell.css:58-90`). No other class does this. `Showcase/SampleApp` writes its grids inline because none exists (`Showcase.stories.ts:78`, `:87`).
- **Domain coupling.** None found.
- **Accessible.** Spans don't reorder content, so reading order matches source order. Nothing else applies.
- **Testable.** "the app grid narrows panels to half, then to one column, by its own width" (`behavior.spec.ts:379`).
- **Themeable.** 2 tokens. `--gap` defaults to `--space-4` (`shell.css:63`).
- **Chromeable.** It paints nothing, so it is the same in every chrome, as a layout utility should be.
- **Lintable.** 0 codes. Its attribute sits under `shell` in VOCABULARY (`contract.ts:427`).
- **Story depth.** No story of its own. AppShell renders spans 4 and 8 only.

**Verdict.** `keep-as-core-primitive`, by the keep row. It belongs in `base.css` beside `odd-stack` and `odd-row`.

## 5. Ranked recommendations

Each list is ranked by the distance score in section 1, highest first. Ties follow the section 1 order.

### What stays in core

1. Base utilities. Add a story and codes first, since every other story leans on them.
2. Grid. Move it to `base.css`, and give it its own VOCABULARY entry and story.
3. Badge, Field, Log, Typography.
4. Alert, Card, Choice, Disclosure, Menu, Popover, Separator, Slider, Table, Tabs.
5. Avatar, Dialog, Search, Sheet, Skeleton, Toast.
6. Button, which needs nothing.
7. `odd-meter` and `odd-progress`, from the Meter split.
8. `enhanceStepper` and `enhanceRangeField`, as behaviors without a layout class.

### What splits

1. Meter. `odd-meter` and `odd-progress` stay. `odd-stat` and `odd-stat-value` become a stat-row recipe over `odd-row` and a bar. `odd-stat-value` is also used on a slider's `output` (`Slider.stories.ts:31`). One open question is whether its tabular-number style should move to Typography so that use keeps working.

### What moves to a recipe or an app

1. E-stop moves to the robot-arm app. Keep the latched forced-colors drawing (`estop.css:55-65`) in mind for any pressed-state toggle in core.
2. Shell becomes a page-layout recipe. Nothing behavioral to keep. Its header paint is the card surface.
3. Range field becomes a recipe. Keep `enhanceRangeField` in core, with its markup contract in its own doc page.
4. Stepper becomes a recipe with two stories, the single ± field and the jog row. Keep `enhanceStepper` in core.
5. The stat row from Meter becomes a recipe.

### Stories and usage codes to add for each keeper

Every keeper with only assembled stories needs a `Playground` with controls for its attribute axes, and a Variants, Sizes, or States story for each axis it has. That line is not repeated below. Each list names only what is specific to the family. Static stories come first, then stories that need interaction through a `play` function.

1. **Base utilities.** Static stories to add: a Parts story with `odd-stack` and `odd-row` at two `--gap` values, `odd-muted`, and `odd-scope` nested in another chrome. Stories that need interaction: `odd-skip-link` on focus. Codes:
	- ODD-SCOPE-001. `odd-scope` without all three of `data-chrome`, `data-palette`, and `data-mode`. It catches chrome tokens that reference palette colors resolving against the outer scope (`base.css:102-105`).
	- ODD-SKIP-001. `odd-skip-link` not on an `a` with an `href` to an in-page id. It catches a skip link that does not move focus.
2. **Grid.** Static stories to add: a Variants story with every `data-span` from 1 to 12 and the two container-width collapses. Codes:
	- ODD-GRID-001. `data-span` outside 1 to 12. It catches a child that silently spans the full row.
	- Move `data-span` from `shell` to a new `grid` VOCABULARY entry.
3. **Badge.** Static stories to add: Variants with all six tones, soft and solid. No new codes.
4. **Field.** Static stories to add: Parts with each control alone, then States with required, invalid, and disabled side by side. Stories that need interaction: `:user-invalid` after typing. Codes:
	- ODD-FIELD-004. `odd-label` not on a `label`. It catches a control left with no accessible name and no click-to-focus.
5. **Log.** Static stories to add: Variants with each tone and a line without a time. Mirror it in React once a wrapper exists. Codes:
	- ODD-LOG-001. `odd-log` without `role="log"`. It catches new lines that are never announced.
	- ODD-LOG-002. `odd-log` without `tabindex="0"`. It catches a capped log that keyboard users cannot scroll.
	- ODD-LOG-003. `role="log"` without `aria-label` or `aria-labelledby`. It catches an unnamed live region.
	- ODD-LOG-004. `data-tone` on a line outside info, success, warning, and danger. It catches a tone that silently draws nothing.
6. **Typography.** Static stories to add: a `Components/` Variants story for eyebrow tones beside the existing headings story. Codes:
	- ODD-TYPOGRAPHY-001. `odd-heading` not on `h1` to `h6`. It catches a big title that heading navigation skips.
	- ODD-TYPOGRAPHY-002. `data-size` outside xs, sm, lg, xl, 2xl, and hero, with `md` listed as an omitted value. It catches a size that silently renders as md.
	- ODD-TYPOGRAPHY-003. Eyebrow `data-tone` outside primary and foreground. It catches a tone that silently stays muted.
7. **Alert.** Static stories to add: a story that inserts an alert into an empty `role="status"` container, as `alert.css:6-8` asks. No new codes.
8. **Card.** Static stories to add: Parts with title, link, and footer, and States with plain and `data-interactive`. No new codes.
9. **Choice.** Static stories to add: Parts with checkbox, radio, switch, and segmented, each alone. No new codes.
10. **Disclosure.** Static stories to add: States with closed, open, and a named group. No new codes.
11. **Menu.** Stories that need interaction: an opened menu in a `play` function, so the items show in the aria snapshot. Codes:
	- ODD-MENU-008. `odd-menu-shortcut` without `aria-hidden="true"`. It catches a shortcut read twice, once as text and once from `aria-keyshortcuts`.
	- ODD-MENU-009. A `role="group"` inside `odd-menu` without a name. It catches a group whose `odd-menu-label` is visual only (`menu.css:5-6`).
12. **Popover.** Mirror Tooltip and HoverCard once wrappers exist. Stories that need interaction: each of the three opened. Codes:
	- ODD-TOOLTIP-001. `odd-tooltip` without `popover="hint"` and `role="tooltip"`. It catches a tooltip that closes an open menu when it appears (`format.ts:749`).
	- ODD-HOVER-CARD-001. `odd-hover-card` without `popover="hint"`. It catches the same failure for a hover card.
13. **Separator.** Static stories to add: a Variants story with horizontal and vertical. No new codes.
14. **Slider.** Static stories to add: a `dir="rtl"` story. No new codes.
15. **Table.** Static stories to add: Parts with a plain table, numeric columns, and a sortable header in each `aria-sort` state. States with no rows selected, some selected, and all selected. A wrap that overflows next to one that doesn't. Codes:
	- ODD-TABLE-006. A `data-select-all` box without `aria-label` or `aria-labelledby`. It catches an unnamed header checkbox.
16. **Tabs.** Static stories to add: a vertical tabs story. No new codes.
17. **Avatar.** Mirror AvatarFallback. Static stories to add: Sizes and an initials-versus-image Variants story. No new codes.
18. **Dialog.** Stories that need interaction: each dialog opened in a `play` function, so the aria snapshot includes it. No new codes.
19. **Search.** Static stories to add: the `form` variant inside `search`. No new codes.
20. **Sheet.** Stories that need interaction: each of the four sides opened, and one in right-to-left. No new codes.
21. **Skeleton.** No new stories or codes. Its one story already shows both shapes.
22. **Toast.** Stories that need interaction: each tone, a toast with an action, and the closing state, through `toast()` in a `play` function. Add a forced-colors check for the tone dot. No new codes.

The recipes need their own checks once they exist. `enhanceStepper` and `enhanceRangeField` read fixed markup, so two codes would hold that markup to what the JS expects.

- ODD-STEPPER-001. A stepper root without exactly one `input type="number"`. It catches buttons that do nothing.
- ODD-RANGE-FIELD-001. A range-field root without one `input type="range"` and one `input type="number"`. It catches a sync that silently never starts (`range-field.ts:25`).

## 6. Hypotheses

Six of the plan's eleven guesses held in full. Five held only in part or did not hold.

| Guess | Outcome | Evidence |
| --- | --- | --- |
| Table is an atom whose story is the anti-pattern. | Held for the verdict. "Largest story gap after the PR #23 set" did not hold by count. | Table misses two static axes. Grid misses nine. Table's story is still the one that packs every axis into one widget (`Table.stories.ts:28-152`). `enhanceSelectAll` needs no contract of its own. It already has an e2e test (`behavior.spec.ts:310`), and one code for the header box's name covers its gap. |
| Meter bundles a layout. | Held. | `meter.css:96-112`. One addition: `odd-stat-value` is used outside the row (`Slider.stories.ts:31`). |
| Field is atoms plus a container, with story gaps for invalid, disabled, required, and each control alone. | Verdict held. The story gaps did not. | `TextFields` renders required, invalid, and disabled, and each control appears (`Field.stories.ts:26-49`). The gap is the story kinds and the missing `odd-label` rule. |
| Popover's file holds three atoms. | Held. | `popover.css:30-107`. Tooltip and hover card also lack an element rule. |
| Choice, Dialog, Sheet, Menu, Tabs, Toast, Card, and Alert are keepers whose one story cannot show their axes. | Verdicts held. The axis guess held only for Sheet, Tabs, and Toast. | Card's `data-interactive`, Menu's disabled items, Tabs' manual mode, and Alert's tones all render today (`Axes › Rendered by its stories`). |
| Typography and the base utilities are keepers with no contract. | Held, with one correction. | `foundations--headings` is a Sizes story (`Foundations.stories.ts:114-130`). |
| `odd-estop` is a real atom with a domain name, demoted, with keep as the alternative. | Held. The alternative did not. | The cap ignores the chrome ([estop-chromes.png](core-primitives-fitness/estop-chromes.png)), it mixes in literal `black` (`estop.css:12`), and its rule only fits machines (`estop.css:4`). |
| `odd-log` is the strongest PR #23 core candidate, with domain words only in story sample lines. | Verdict held. The domain guess did not. | Five robot-arm words sit in header comments (`log.css:2-4`, `log.ts:5-6`). New finding: the log body ignores the chrome ([log-chromes.png](core-primitives-fitness/log-chromes.png)). |
| `odd-range-field` is a composition. | Held. | `range-field.css:24-33`. `enhanceRangeField` stays in core. |
| `odd-stepper` bundles an atom with a jog arrangement and should split. | Did not hold. Demote instead. | The jog row is story markup only (`Controls.stories.ts:71-75`). `stepper.css` and `stepper.ts` accept any number of `data-step` buttons, so there is no second shipped thing to split off. The CSS arranges `odd-button` and `odd-input` (`stepper.css:24-42`). |
| `odd-shell` is page chrome and `odd-grid` is a layout utility. | Held. | `contract.ts:427` files `data-span` under `shell`. `Showcase.stories.ts:46-56` builds a page header without `odd-shell`, and `Showcase.stories.ts:78` hand-writes a grid. |

## Appendix A. Proposed text for later PRs

This appendix proposes text only. Nothing here is applied.

### Recipe location and naming

> A recipe is a documented arrangement of core classes for one task. It lives in `stories/recipes/<Name>.stories.ts` with the title `Recipes/<Name>`, and its usage page lives in `docs/recipes/<name>.md`. Name a recipe for the task it does, in sentence case: "Number stepper", "Slider with number", "Stat row", "App shell".
>
> A recipe adds no class to `CLASS_REGISTRY`. When it needs layout rules that core classes and the `--gap` variable cannot give, those rules go in `src/css/recipes/<name>.css`, which `index.css` does not import. A recipe's classes keep the `odd-` prefix and are listed in a separate `RECIPE_CLASSES` array, so the `ODD-CLASS-001` check knows them without counting them as core.
>
> Behavior a recipe needs, such as `enhanceStepper`, stays in `src/js/` and is exported from `enhance.ts`. Its JSDoc names the markup it reads, and its usage codes check that markup.
>
> A component that only one app uses goes to that app's repository, not to a recipe.

The plan defines a recipe as a composition of core classes. The proposal above lets a recipe keep a small CSS file, because Stepper and Shell carry rules that no core class gives, such as hiding the number input's spin buttons (`stepper.css:38-42`). Dropping those rules would change how the robot-arm app looks. Caleb can choose plain core classes only instead, at the cost of those rules.

### Story-depth rule a test can enforce

> Every `Components/*` family has, beside any assembled stories, at least one story named `Playground`, `Variants`, `Sizes`, `States`, or `Parts`. Every attribute value and part class its CSS selects, other than ones that need interaction, is rendered by at least one story of that family.

`tests/stories.test.ts` can enforce this by importing the axis and story data from `scripts/primitive-fitness.ts` and failing on any family or axis not in a committed allowlist. The allowlist starts with today's gaps and may only shrink. Interaction axes stay out of the rule until `play` functions exist.

### README and contract changes that follow from the verdicts

- `README.md:191`. Remove the `odd-estop` row, and remove `odd-estop` from `CLASS_REGISTRY` and VOCABULARY (`contract.ts:417`) when the robot-arm app takes the file.
- `README.md:192-193`, `README.md:195`. Move the Stepper, Range field, and Shell rows to a new "Recipes" section that links each recipe page. Keep a row each for `enhanceStepper` and `enhanceRangeField` under behaviors.
- `README.md:196`. Move the `odd-grid` row beside `odd-stack` and `odd-row`, and move its CSS from `shell.css:58-90` into `base.css`.
- `contract.ts:427`. Replace `shell: ["data-span"]` with `grid: ["data-span"]`.
- `README.md:176`. Drop `odd-stat` from the Meter row and point to the Stat row recipe.
- `log.css:1-5` and `log.ts:4-6`. Replace the robot-arm sample text with neutral text, such as "Saved draft" and "Upload finished".
- `avatar.css:5`. Say the shape is a pill in every chrome, since `--radius-chip` is the pill radius in all five chrome files.

## Appendix B. Reviewer objections and outcomes

The cross-provider review is pending. The lead fills in this section after unit 4.
