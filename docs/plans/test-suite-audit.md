# Test suite audit

Measured on `audit/test-suite` at `2c5766f`, 2026-10-24. The standard is the test-behavior-not-implementation principle. A test must call the code the way its users do and assert an observed result against a literal value. If it would pass with every import returning `undefined`, it gets rewritten or cut.

This branch applies cut-list rows 1 to 16. Rows 17 and 18 and every rewrite except R1 and T2 stay open. R1 and T2 are applied.

## Summary

| Suite | Runtime tests today | Run by `bun run check` | Keep | Rewrite | Merge | Cut | After the plan |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `bun test` (11 files in `tests/`) | 368 | yes | 276 | 48 | 33 | 11 | 325 |
| Playwright (3 files in `e2e/`) | 40 | no | 32 | 6 | 2 | 0 | 38 |
| Total | 408 | 368 of 408 | 308 | 54 | 35 | 11 | 363 |

- `bun test` measured 368 pass, 0 fail, 1197 `expect()` calls, 3.41s wall.
- `bunx playwright test --list` lists 40 tests, 20 per engine (Firefox and WebKit). The WebKit copy of `e2e/usage.spec.ts` skips at runtime, so 39 execute.
- `bun run check` is `typecheck && lint && bun test`, and `bunfig.toml` sets `root = "tests"`. It never runs `e2e/`. The repo has no CI config. Playwright runs only through `bun run test:browsers`, by hand.
- The merge column counts every test folded into another test. Of the 35, 34 go away. The `usage-dom` fixture loop drops 31 when it becomes one test, `usage-check.test.ts:113` drops 1 when it joins `:99`, and `e2e/usage.spec.ts` drops its 2 listed tests.
- After the plan: 408 minus 11 cut minus 34 merged away is 363, with 325 in bun and 38 in Playwright. The toast check from `e2e/usage.spec.ts` moves into existing tests, so it adds no test.
- Run time barely moves, because the whole bun suite takes 3.41s. The win is fewer copies to edit when a rule or a message changes, and a suite where each test fails for its own reason.

Biggest winners if we cut and merge:

1. The `tests/usage-dom.test.ts` fixture loop, from 32 tests to 1. It repeats `tests/usage-check.test.ts:43` through a thinner wrapper. The one test left keeps the only check that the thrown message joins every diagnostic.
2. The `tests/eslint-jsx.test.ts` twins and fixture-list check, 6 tests and 4 fixture files.
3. Four tests in `tests/usage-contract.test.ts`, plus `tests/usage-codes.txt` and the `COMMENT_RULES` export. A message wording change then edits one place instead of three.
4. `e2e/usage.spec.ts`, the whole file, merged. It has a 10-minute timeout and opens every story in Firefox. After rewrites R2 and R11, `bun test` makes the same story checks, and the toast step moves to `behavior.spec.ts`.
5. `tests/eslint-parse.test.ts`, plus `tests/fixtures/parse.tsx` and its ignore entry in `eslint.config.js`.

## Verdicts by file

Verdicts mean the following. Keep leaves the test alone. Rewrite keeps the test and changes what it asserts. Merge folds the test into another test, and the folded test goes away. When a group of N tests collapses into one, all N count as merges and N minus 1 go away. Cut deletes the test.

### `tests/contract.test.ts` (171 tests). 165 keep, 6 rewrite

The count comes from parametrization. Each generated test names the palette, chrome, and mode that broke, so the count is not padding.

| Test | Runs | Protects | Verdict | Why |
| --- | --- | --- | --- | --- |
| [:10](../../tests/contract.test.ts#L10) status colors match `STATUS_DEFAULTS` | 1 | The `foundations.css` status block equals the table `palette.ts` parses | keep | A relation across two sources |
| [:17](../../tests/contract.test.ts#L17) tints match `TINT_SOURCE` and `TINT_PERCENT` | 1 | The generator and the CSS use one tint formula | keep | A relation across two sources |
| [:27](../../tests/contract.test.ts#L27) palette defines every token | 8 | The merged cascade a user gets | keep | |
| [:31](../../tests/contract.test.ts#L31) palette defines only palette tokens | 8 | Palettes stay out of chrome tokens | keep | |
| [:42](../../tests/contract.test.ts#L42) WCAG AA contrast, light and dark | 16 | Text contrast per palette and mode | keep | Resolves `var()`, `light-dark()`, and `color-mix()` to colors and compares to literal minima |
| [:46](../../tests/contract.test.ts#L46) text on soft tints at AA | 16 | Contrast on tinted surfaces | keep | |
| [:55](../../tests/contract.test.ts#L55) chrome defines every chrome token | 6 | Chrome completeness | keep | |
| [:59](../../tests/contract.test.ts#L59) chrome defines no palette tokens | 6 | Chrome stays out of palette tokens | keep | |
| [:64](../../tests/contract.test.ts#L64) chrome has no chromatic color literals | 6 | Chrome never ships a hue | rewrite | The regex at :65 and :67 catches only `oklch()` with nonzero chroma and `#hex`, `rgb()`, `hsl()`. A named color (`red`), `lab()`, `lch()`, `oklab()`, `hwb()`, and `color()` all pass. Parse every color literal and assert chroma 0 |
| [:72](../../tests/contract.test.ts#L72) components never select on a chrome or palette id | 1 | "Components read tokens" | keep | A source scan, but the rule is about source, so the scan is the behavior. The only check of that rule |
| [:89](../../tests/contract.test.ts#L89) page text AA on every chrome page background | 96 | Contrast over gradients (8 palettes, 6 chromes, 2 modes) | keep | The only automated check of it. axe cannot measure gradients (`README.md:106`, `docs/follow-ups.md:24`) |
| [:103](../../tests/contract.test.ts#L103) chrome page background matches `PAGE_BACKGROUNDS` | 6 | The generator's repair target equals the painted CSS | keep | |

### `tests/color.test.ts` (6 tests). 5 keep, 1 rewrite

`src/js/color.ts` reimplements color math so the runtime has no dependency. culori is the oracle.

| Test | Runs | Protects | Verdict | Why |
| --- | --- | --- | --- | --- |
| [:18](../../tests/color.test.ts#L18) hex parses to the same OKLCH | 1 | `parseColor` | keep | Independent oracle |
| [:30](../../tests/color.test.ts#L30) WCAG contrast agrees within 0.2% | 1 | `contrast` | keep | Independent oracle |
| [:39](../../tests/color.test.ts#L39) `clampChroma` lands in sRGB, keeps L and H | 1 | Gamut mapping | rewrite | A `clampChroma` that returned chroma 0 passes every assertion (inferred from the assertions, not run). Assert the result is the largest in-gamut chroma, or compare to culori's clamp |
| [:48](../../tests/color.test.ts#L48) `mixOklab` matches `color-mix` | 1 | Mixing | keep | |
| [:57](../../tests/color.test.ts#L57) `compositeOver` matches sRGB compositing | 1 | Alpha compositing | keep | |
| [:66](../../tests/color.test.ts#L66) `formatOklch` round-trips | 1 | Formatting | keep | |

### `tests/palette.test.ts` (5 tests). Keep all

| Test | Runs | Protects | Verdict | Why |
| --- | --- | --- | --- | --- |
| [:23](../../tests/palette.test.ts#L23) meets the contract for all 146 seed pairs | 1 | The generator, by its own checker | keep | |
| [:29](../../tests/palette.test.ts#L29) emitted CSS passes culori contrast | 1 | The generator, by an independent oracle | keep | |
| [:44](../../tests/palette.test.ts#L44) page text AA on every chrome's real background | 1 | Generated palettes on gradients | keep | |
| [:63](../../tests/palette.test.ts#L63) every palette token and nothing else | 1 | Emitted token set | keep | |
| [:68](../../tests/palette.test.ts#L68) keeps the brand hue on primary | 1 | The seed hue survives repair | keep | |

### `tests/stories.test.ts` (50 tests). 13 keep, 37 rewrite

| Test | Runs | Protects | Verdict | Why |
| --- | --- | --- | --- | --- |
| [:119](../../tests/stories.test.ts#L119) checks 36 stories | 1 | That the sweep covers every story | rewrite (R2) | Compares labels to the hand list `STORY_LABELS` (:32). It fails on any story add or rename, and stays green when a new `stories/*.stories.ts` file is never imported. Assert every file on disk is in `modules` and delete `STORY_LABELS` |
| [:123](../../tests/stories.test.ts#L123) one test per story | 36 | Every story renders markup the checker accepts | rewrite (R11) | No `expect`, but this is not the no-assertion shape. The subject is each story's `render`. `asRoot` (:103-111) throws when `render` returns anything but a string or an Element, so a `render` that returns `undefined` fails. `checkRoot` is the checker, not the subject, and `usage-dom.test.ts:153` proves it throws. The rewrite is because :125 runs `checkRoot` before the `requestAnimationFrame` wiring, so markup that wiring writes goes unchecked |
| [:149](../../tests/stories.test.ts#L149) Playground `argTypes` match the button contract | 1 | Controls offer exactly the contract values | keep | |
| [:158](../../tests/stories.test.ts#L158) Playground variant and size values | 8 | Each control value sets a literal attribute | keep | |
| [:173](../../tests/stories.test.ts#L173) Playground disabled and busy | 4 | `aria-disabled` and `aria-busy`, never `disabled` | keep | |

### `tests/usage-check.test.ts` (43 tests). 40 keep, 2 rewrite, 1 merge

| Test | Runs | Protects | Verdict | Why |
| --- | --- | --- | --- | --- |
| [:43](../../tests/usage-check.test.ts#L43) one test per HTML fixture | 32 | `checkUsage` on each fixture, against its literal expect line | keep | Called the way the DOM adapter calls it |
| [:50](../../tests/usage-check.test.ts#L50) every runtime code has a bad and a good fixture | 1 | Fixture coverage per rule | rewrite | Compares filenames to `RUNTIME_CODES` (:9), a hand copy of `USAGE` minus the static codes. Derive the list from `USAGE.button` plus the unknown-class rule |
| [:61](../../tests/usage-check.test.ts#L61) outline says to remove the attribute | 1 | The omit sentence | keep | Only test of it |
| [:67](../../tests/usage-check.test.ts#L67) primray suggests primary | 1 | Value spelling suggestion | keep | Only `checkUsage` test of it |
| [:73](../../tests/usage-check.test.ts#L73) data-varient suggests data-variant | 1 | Attribute spelling suggestion | keep | |
| [:87](../../tests/usage-check.test.ts#L87) computed `data-variant` warns | 1 | `ODD-STATIC-001` on a computed value | keep | HTML fixtures cannot build a `Computed` |
| [:93](../../tests/usage-check.test.ts#L93) unknown attribute on an anchor | 1 | No false "href missing" | keep | |
| [:99](../../tests/usage-check.test.ts#L99) partly computed class applies button rules | 1 | Literal words still checked | keep | |
| [:108](../../tests/usage-check.test.ts#L108) computed tag with an odd- class only warns | 1 | | keep | |
| [:113](../../tests/usage-check.test.ts#L113) computed class with no odd- word | 1 | Outside the contract | merge into :99 | Asserts only `[]`. Put both nodes in one test so the empty result sits next to the non-empty one |
| [:118](../../tests/usage-check.test.ts#L118) computed children and `aria-label` do not fail icon-only | 1 | No false `ODD-BUTTON-008` | rewrite | Absence only. Add the literal twin in the same test (no name, expect `ODD-BUTTON-008`) |
| [:127](../../tests/usage-check.test.ts#L127) computed `data-icon-only` on a text button warns | 1 | | keep | |

### `tests/usage-contract.test.ts` (10 tests, plus 4 compile-time checks). 5 keep, 1 rewrite, 4 cut

| Test | Runs | Protects | Verdict | Why |
| --- | --- | --- | --- | --- |
| [:42](../../tests/usage-contract.test.ts#L42) `usage-codes.txt` matches the contract codes | 1 | The code list | rewrite | `tests/usage-codes.txt` is a third copy of `USAGE_CODES`, and this file is its only reader. Assert `Object.keys(MESSAGES)` equals `USAGE_CODES` and delete the txt |
| [:47](../../tests/usage-contract.test.ts#L47) css sync with `button.css` | 1 | `data-variant` and `data-size` selectors equal `USAGE` | keep | Trim :53. Any `:disabled` substring satisfies it |
| [:56](../../tests/usage-contract.test.ts#L56) `headerLists` reads a header with outline | 1 | A test-file helper, and a comment's wording | cut | The first half tests `headerLists` (:11, defined in the test) on a string the test built. The second half pins the comment at `src/css/components/button.css:1-5`. Nothing replaces it, on purpose, because a comment's wording is not behavior |
| [:68](../../tests/usage-contract.test.ts#L68) registry matches every odd- class in `src/css` | 1 | `CLASS_REGISTRY` | keep | |
| [:74](../../tests/usage-contract.test.ts#L74) messages have the code, `Fix:`, a docs heading, no double quote | 1 | Message format and docs links | keep | Trim :115-116. It adds `COMMENT_RULES` only so the set matches. Compare rule codes to `USAGE_CODES` and delete the export |
| [:119](../../tests/usage-contract.test.ts#L119) docs/usage has a heading for every code | 1 | Docs headings | cut | :74 already requires `## CODE` in the file the message names (:84). If :74 passes, :119 cannot fail |
| [:131](../../tests/usage-contract.test.ts#L131) vocabulary matches each stylesheet's data attributes | 1 | `VOCABULARY` | keep | |
| [:146](../../tests/usage-contract.test.ts#L146) allowed values in 002, 003, 015 come from the contract | 1 | Three message strings | cut | `message(code)` with no detail returns `MESSAGES[code]` (`src/js/usage/format.ts:224`), so this restates constants. 002 and 015 stay pinned in `usage-check.test.ts:61`, `:67`, and `:73`. After the cut, no test pins the full 003 sentence. :74 (lines 97-99) still requires 003's values and omit words in its message, and its wording is left unpinned on purpose |
| [:158](../../tests/usage-contract.test.ts#L158) found value loses its double quotes | 1 | `withoutQuotes` | keep | |
| [:164](../../tests/usage-contract.test.ts#L164) hint names the found value and suggestion | 1 | Hint format | cut | Same full string as `usage-check.test.ts:67`, which also runs the suggestion finder |
| [:170-178](../../tests/usage-contract.test.ts#L170) `LiteralMessage` assignments | 0 | Message types stay literal | keep | `bun run typecheck` checks them. Optionally move to a `*.test-d.ts` |

### `tests/usage-dom.test.ts` (42 tests). 10 keep, 32 merge into 1

| Test | Runs | Protects | Verdict | Why |
| --- | --- | --- | --- | --- |
| [:40](../../tests/usage-dom.test.ts#L40) one test per HTML fixture through `checkRoot` | 32 | Same fixtures as `usage-check.test.ts:43`, plus the joined throw message | merge into one test | `checkRoot` runs `checkUsage(toUsageNode(...))` over the same elements (`toUsageNode` at `src/js/usage/dom.ts:12-22`, the call at `:40-42`). The fixtures put nothing on `<body>`. But the loop is the only check that `throwProblems` (`:44-47`) joins every message. `usage-check.test.ts:43` never calls `checkRoot`, and each mode test below has one problem. Keep one `checkRoot` test on `odd-button-001.bad.html`, which expects two `ODD-BUTTON-001`, and assert both codes |
| [:48](../../tests/usage-dom.test.ts#L48) dev mode logs the code, flush does not throw | 1 | Dev mode | keep | |
| [:65](../../tests/usage-dom.test.ts#L65) test mode throws the code from flush | 1 | Test mode | keep | |
| [:75](../../tests/usage-dom.test.ts#L75) flush reports a nested button | 1 | Subtree scan | keep | |
| [:85](../../tests/usage-dom.test.ts#L85) hook fails when disabled is set later | 1 | Attribute mutations | keep | |
| [:104](../../tests/usage-dom.test.ts#L104) dev mode logs once after one microtask | 1 | Timing | keep | |
| [:121](../../tests/usage-dom.test.ts#L121) moved button reported once | 1 | Dedupe | keep | |
| [:142](../../tests/usage-dom.test.ts#L142) prod mode does not log or throw | 1 | Prod mode | keep | Absence paired with a positive `checkRoot` throw |
| [:160](../../tests/usage-dom.test.ts#L160) `createToaster().show()` with an action | 1 | Toast markup passes the checker | keep | |
| [:187](../../tests/usage-dom.test.ts#L187) disabled odd-button fails the importing test | 1 | `test-setup` hook, in a subprocess | keep | |
| [:194](../../tests/usage-dom.test.ts#L194) a later test passes after a failure | 1 | Hook resets between tests | keep | |

### `tests/eslint-html.test.ts` (9 tests). 8 keep, 1 rewrite

| Test | Runs | Protects | Verdict | Why |
| --- | --- | --- | --- | --- |
| [:85](../../tests/eslint-html.test.ts#L85) HTML fixtures report each code on its attribute | 1 | Line and column an ESLint user sees | keep | Only HTML-parser integration check |
| [:107](../../tests/eslint-html.test.ts#L107) marked template | 1 | `/* html */` templates | keep | |
| [:116](../../tests/eslint-html.test.ts#L116) tagged template | 1 | Tagged templates | keep | |
| [:125](../../tests/eslint-html.test.ts#L125) computed class still reports static disabled | 1 | Partial templates | keep | |
| [:136](../../tests/eslint-html.test.ts#L136) CRLF template | 1 | Locations with `\r\n` | keep | |
| [:153](../../tests/eslint-html.test.ts#L153) unmarked template reports `ODD-STATIC-002` | 1 | `ODD-STATIC-002` | keep | Only emitter of that code |
| [:162](../../tests/eslint-html.test.ts#L162) disable without a reason reports `ODD-STATIC-003` | 1 | `odd/disable-reason` | keep | Trim :169. It reads the fixture the test just loaded |
| [:172](../../tests/eslint-html.test.ts#L172) odd-buton suggests odd-button | 1 | Class suggestion | keep | Only test of it |
| [:180](../../tests/eslint-html.test.ts#L180) Playground reports incomplete only on computed attributes | 1 | Real stories lint clean | rewrite | Pins `stories/Button.stories.ts` lines 14-17, so any edit above them breaks it. Assert the only findings are `ODD-STATIC-001` in `Button.stories.ts` and each span starts with `${` |

### `tests/eslint-jsx.test.ts` (18 tests). 12 keep, 6 cut

| Test | Runs | Protects | Verdict | Why |
| --- | --- | --- | --- | --- |
| [:102](../../tests/eslint-jsx.test.ts#L102) every JSX fixture has a case | 1 | The `places` table lists every fixture | cut | Never calls the linter. A fixture missing from `places` that reports anything already fails its generated test (:110 falls back to `[]`) |
| [:107](../../tests/eslint-jsx.test.ts#L107) per fixture, 12 kept | 12 | JSX adapter codes and locations | keep | `children-prop`, `cn`, `link`, `local-button`, `odd-button-004.bad` (the JSX-only `{false}` path), `odd-button-014.bad` (span child walk), `radix`, `raw.bad`, `wrapper-data`, `wrapper-href`, `wrapper.bad`, `wrapper.good` |
| [:107](../../tests/eslint-jsx.test.ts#L107) per fixture, 4 cut | 4 | Paths already covered | cut | `icon-only-false.tsx` repeats `odd-button-004.bad.tsx:5`. `odd-button-001.bad.tsx`, `-008.bad.tsx`, and `-015.bad.tsx` repeat `raw.bad.tsx` lines 4, 11, and 18, and their second lines repeat their HTML twins, which `checkUsage` runs. Delete the fixture files too |
| [:123](../../tests/eslint-jsx.test.ts#L123) each JSX twin reports its HTML fixture's codes | 1 | JSX and HTML agree | cut | Re-lints twins already checked against their own expect line, from a hardcoded twin list (:125) |

### `tests/eslint-parse.test.ts` (1 test). Cut

| Test | Runs | Protects | Verdict | Why |
| --- | --- | --- | --- | --- |
| [:16](../../tests/eslint-parse.test.ts#L16) Babel parser reports the disabled attribute on its line | 1 | Babel's locations and the config wiring | cut | Registers a throwaway rule and checks a third-party parser. Every JSX fixture test and `bun run lint` fail if the wiring breaks. `tests/fixtures/parse.tsx:6` has `<button className="odd-button" disabled>` on one line, so no multi-line case hides here |

### `tests/react-button.test.tsx` (13 tests). Keep all

| Test | Runs | Protects | Verdict | Why |
| --- | --- | --- | --- | --- |
| [:67](../../tests/react-button.test.tsx#L67) markup cases | 8 | Literal `renderToStaticMarkup` output that `checkRoot` accepts | keep | |
| [:119](../../tests/react-button.test.tsx#L119) `aria-disabled` ignores click and Enter | 1 | Disabled behavior without `disabled` | keep | |
| [:128](../../tests/react-button.test.tsx#L128) without `aria-disabled` submits once per click and Enter | 2 | The presence pair for :119 | keep | |
| [:167](../../tests/react-button.test.tsx#L167) each fail fixture prints its own code (tsc) | 1 | Type errors name the right code | keep | |
| [:183](../../tests/react-button.test.tsx#L183) pass fixture compiles clean | 1 | No false type errors | keep | |

### `e2e/axe.spec.ts` (4 tests, 2 modes in 2 engines). Keep

| Test | Runs | Protects | Verdict | Why |
| --- | --- | --- | --- | --- |
| [:33](../../e2e/axe.spec.ts#L33) axe on every story per mode | 4 | Violations, overlays that do not open, and rule-set drift against `.storybook/a11y-rules.txt` (:89-91) | keep | The only automated non-Chrome axe sweep. Not run by `check` |

### `e2e/behavior.spec.ts` (34 tests, 17 in 2 engines). 28 keep, 6 rewrite

These are the only tests of `menu.ts`, `tabs.ts`, `roving.ts`, the toast rehome, `enhanceSelectAll`, `avatarFallback`, and the fallbacks.

| Test | Runs | Protects | Verdict | Why |
| --- | --- | --- | --- | --- |
| [:75](../../e2e/behavior.spec.ts#L75), [:95](../../e2e/behavior.spec.ts#L95), [:104](../../e2e/behavior.spec.ts#L104) tooltip hover, tooltip focus and Escape, hover card | 6 | `interestfor` timing and anchoring | keep | |
| [:120](../../e2e/behavior.spec.ts#L120), [:145](../../e2e/behavior.spec.ts#L145), [:155](../../e2e/behavior.spec.ts#L155), [:168](../../e2e/behavior.spec.ts#L168) popover flip, `closedby=any`, alert dialog, sheets | 8 | Overlay placement and dismissal | keep | |
| [:187](../../e2e/behavior.spec.ts#L187), [:220](../../e2e/behavior.spec.ts#L220) menu and tabs keyboard | 4 | Roving focus | keep | |
| [:238](../../e2e/behavior.spec.ts#L238), [:254](../../e2e/behavior.spec.ts#L254) toast over a modal, toast announced as one sentence | 4 | Toast rehome and live region | keep | |
| [:266](../../e2e/behavior.spec.ts#L266), [:284](../../e2e/behavior.spec.ts#L284) select-all mixed, broken avatar initials | 4 | `enhanceSelectAll`, `avatarFallback` | keep | |
| [:326](../../e2e/behavior.spec.ts#L326) reduced motion is 0s | 2 | Reduced-motion CSS | keep | |
| [:294](../../e2e/behavior.spec.ts#L294) slider keyboard and fill | 2 | Slider value and fill | rewrite the fill half | The fill check runs only `if (fill.on)` (:308). `src/css/components/slider.css:10-13` says Firefox fills with `::-moz-range-progress` and WebKit never runs the timeline, so `--_on` likely stays 0 in both (inferred, not run). The keyboard half asserts and stays |
| [:312](../../e2e/behavior.spec.ts#L312) progress and meter bars in forced colors | 2 | Meter rendering | rewrite | No `expect`, only screenshots. It passes if `meter.css` is deleted. Assert computed border and `forced-color-adjust` under `forcedColors: "active"`, or cut it if no engine reports them |
| [:320](../../e2e/behavior.spec.ts#L320) search clear button is restyled | 2 | Clear-button CSS | rewrite | No `expect`, only focus and a screenshot. Firefox has no clear button (`docs/follow-ups.md:22`), so at most a WebKit-only assertion. Otherwise cut |

### `e2e/usage.spec.ts` (2 listed, 1 runs). Merge

| Test | Runs | Protects | Verdict | Why |
| --- | --- | --- | --- | --- |
| [:114](../../e2e/usage.spec.ts#L114) every story, the Playground values, and the toast buttons | 1 (WebKit skips at :111) | Checker on real rendered stories | merge | Same 36-story pin (`STORY_IDS`, :21), same `checkRoot` sweep, and same Playground loops as `tests/stories.test.ts:119-178`. That bun file is not a full cover today. The merge waits for R2, R11, and the toast block (:168-185) moving with its expects into the toast tests in `behavior.spec.ts`. Then delete the file |

The e2e sweep catches three things `bun test` misses today:

- A new `stories/*.stories.ts` file that `stories.test.ts` never imports. Its bad markup stays green in bun. R2 closes this.
- Markup that `requestAnimationFrame` wiring writes. `stories.test.ts:125` runs `checkRoot` before that wiring runs. R11 closes this. See "Not verified" for what the wiring writes.
- The toast block. It clicks the three triggers, expects the Undo button and three dismiss buttons (:179-180), and runs `checkRoot` on `.odd-toaster` (:177, :185). `behavior.spec.ts:238-264` has none of those checks, so the block moves with its expects.

`problemsIn` injects the bundled checker with `addScriptTag` (:90), so `bundleChecker` (:13) moves to `behavior.spec.ts` with the toast block. The other option is to move the toast check to bun instead, next to `usage-dom.test.ts:160`.

## Flags

### Tests implementation instead of behavior

- `usage-contract.test.ts:56` tests `headerLists`, a helper in the test file, then pins a comment's wording in `button.css`.
- `usage-contract.test.ts:146` restates three `MESSAGES` constants, because `message(code)` with no detail returns them unchanged.
- `stories.test.ts:119` restates the hand list `STORY_LABELS` instead of checking which story files exist.
- `eslint-parse.test.ts:16` checks Babel's locations with a throwaway rule and never runs odd-design code.

### Duplicates another check

- `usage-dom.test.ts:40` (32 tests) runs the same fixtures as `usage-check.test.ts:43` through `checkRoot`, which wraps the same `checkUsage` call. Only one fixture is needed, to check the joined throw message.
- `usage-contract.test.ts:119` is implied by `:74`, which already requires `## CODE` in the named docs file.
- `usage-contract.test.ts:164` asserts the same full string as `usage-check.test.ts:67`.
- `eslint-jsx.test.ts:123` re-lints twins that `:107` already checks against their own expect lines.
- The 4 cut JSX fixtures repeat lines in `raw.bad.tsx`, `odd-button-004.bad.tsx`, and their HTML twins.
- `eslint-parse.test.ts:16` fails only when every JSX fixture test and `bun run lint` would fail too.
- `e2e/usage.spec.ts:114` repeats `stories.test.ts:119-178` in a browser, except for three checks. R2, R11, and the moved toast block cover those.

### Brittle snapshots

- `stories.test.ts:119` fails on any story add or rename, and stays green when a story file is never imported.
- `eslint-html.test.ts:180` pins `Button.stories.ts` lines 14-17, so an edit above them breaks it.
- `usage-contract.test.ts:42` keeps `tests/usage-codes.txt` as a third hand copy of `USAGE_CODES`.
- `usage-contract.test.ts:146` breaks on every wording edit to 002, 003, or 015, along with `usage-check.test.ts`.
- `e2e/usage.spec.ts:21` `STORY_IDS` is a second hand pin of the story catalog.

### Empty coverage of a real rule

- `contract.test.ts:64` lets named colors, `lab()`, `lch()`, `oklab()`, `hwb()`, and `color()` through its regex.
- `color.test.ts:39` passes for a `clampChroma` that returns chroma 0 (inferred from the assertions).
- `usage-check.test.ts:118` asserts only `[]`, with no literal twin that must report `ODD-BUTTON-008`.
- `usage-check.test.ts:50` checks fixtures against `RUNTIME_CODES`, so a new rule in `USAGE` needs no fixture.
- `behavior.spec.ts:294` guards its fill check with `if (fill.on)`, which likely never holds in either engine.
- `behavior.spec.ts:312` has no `expect` and passes with `meter.css` deleted.
- `behavior.spec.ts:320` has no `expect`, and Firefox has no clear button to check.

### Exists only to prop up dead code

- `tests/usage-codes.txt` has one reader, `usage-contract.test.ts:9`.
- `COMMENT_RULES` (`src/js/usage/contract.ts:64`) has one reader, `usage-contract.test.ts:115`. `ODD-STATIC-003` stays real in `src/eslint/plugin.ts:56`.
- `tests/fixtures/parse.tsx` and its ignore at `eslint.config.js:34` exist only for `eslint-parse.test.ts`.

## Cut list for approval

This branch applies cut-list rows 1 to 16. Rows 17 and 18 and every rewrite except R1 and T2 stay open. R1 and T2 are applied. Each duplicate target below was checked against the code on 2c5766f.

| # | Delete or merge | Tests removed | Still covered by |
| --- | --- | --- | --- |
| 1 | Merge the fixture loop at `tests/usage-dom.test.ts:40-46` into one `checkRoot` test on `odd-button-001.bad.html` that asserts both `ODD-BUTTON-001` codes | 31 | `usage-check.test.ts:43` for each fixture. The one test left checks the joined throw message |
| 2 | `tests/eslint-jsx.test.ts:102-104`, "every jsx fixture has a case" | 1 | `eslint-jsx.test.ts:107` |
| 3 | `tests/eslint-jsx.test.ts:123-131`, the twin check | 1 | `eslint-jsx.test.ts:107` |
| 4 | `tests/fixtures/usage/jsx/icon-only-false.tsx` and its `places` row (:33) | 1 | `odd-button-004.bad.tsx:5` |
| 5 | `tests/fixtures/usage/jsx/odd-button-001.bad.tsx` and its `places` row (:36-39) | 1 | `raw.bad.tsx:4`, `odd-button-001.bad.html` |
| 6 | `tests/fixtures/usage/jsx/odd-button-008.bad.tsx` and its `places` row (:45-48) | 1 | `raw.bad.tsx:11`, `odd-button-008.bad.html` |
| 7 | `tests/fixtures/usage/jsx/odd-button-015.bad.tsx` and its `places` row (:53-56) | 1 | `raw.bad.tsx:18`, `usage-check.test.ts:73` |
| 8 | `tests/usage-contract.test.ts:56-66` and the `headerLists` helper (:11-13) | 1 | Not covered, on purpose. A comment's wording is not behavior |
| 9 | `tests/usage-contract.test.ts:119-129` | 1 | `usage-contract.test.ts:74` |
| 10 | `tests/usage-contract.test.ts:146-156` | 1 | `usage-check.test.ts:61`, `:67`, and `:73` pin 002 and 015. No test pins the full 003 sentence, on purpose. `usage-contract.test.ts:74` (lines 97-99) still requires 003's values and omit words |
| 11 | `tests/usage-contract.test.ts:164-168` | 1 | `usage-check.test.ts:67` |
| 12 | `tests/eslint-parse.test.ts`, the whole file | 1 | `eslint-jsx.test.ts:107`, `bun run lint` |
| 13 | `tests/fixtures/parse.tsx` | 0 | Only `eslint-parse.test.ts` reads it |
| 14 | `"tests/fixtures/parse.tsx"` in the `ignores` at `eslint.config.js:34` | 0 | Only needed for item 13 |
| 15 | `tests/usage-codes.txt` | 0 | `USAGE_CODES` in `src/js/usage/format.ts` (needs rewrite R1) |
| 16 | `COMMENT_RULES` export at `src/js/usage/contract.ts:64` and its import at `usage-contract.test.ts:5` | 0 | `src/eslint/plugin.ts:56` (needs trim T2) |
| 17 | Merge `tests/usage-check.test.ts:113` into `:99` | 1 | The merged test |
| 18 | Merge `e2e/usage.spec.ts` into `e2e/behavior.spec.ts` toast tests, then delete it | 2 listed | `stories.test.ts:119-178` after R2 and R11, plus `usage.spec.ts:168-185` moved with its expects. The merge waits for all three |

Total removed: 11 cut and 34 merged away, from 408 to 363.

## Rewrites and trims

These keep the test and change what it asserts. They delete no test, so they sit apart from the cut list.

| # | Test | Change |
| --- | --- | --- |
| R1 | `usage-contract.test.ts:42` | Assert `Object.keys(MESSAGES)` equals `USAGE_CODES`. Switch `:9` and `:74` from the txt to `USAGE_CODES`, then delete the txt |
| R2 | `stories.test.ts:119` | Assert every `stories/*.stories.ts` on disk is in `modules`. Delete `STORY_LABELS`. Cut-list item 18 waits for it |
| R3 | `usage-check.test.ts:50` | Derive the code list from `USAGE.button` plus the unknown-class rule. Delete `RUNTIME_CODES` |
| R4 | `usage-check.test.ts:118` | Add the literal twin with no name that expects `ODD-BUTTON-008` |
| R5 | `contract.test.ts:64` (6) | Parse every color literal in chrome values and assert chroma 0 |
| R6 | `color.test.ts:39` | Assert the clamped chroma is the largest in gamut, or compare to culori's clamp |
| R7 | `eslint-html.test.ts:180` | Assert the only findings are `ODD-STATIC-001` in `Button.stories.ts`, each starting at `${`, with no line numbers |
| R8 | `behavior.spec.ts:294` (2) | Assert the fill path each engine takes, so the fill check cannot skip silently |
| R9 | `behavior.spec.ts:312` (2) | Assert computed border and `forced-color-adjust` under forced colors, or cut |
| R10 | `behavior.spec.ts:320` (2) | Assert the WebKit clear-button style, or cut |
| R11 | `stories.test.ts:123` (36) | Await one animation frame after `render` and before `checkRoot`, so the checker sees markup the `requestAnimationFrame` wiring writes. Cut-list item 18 waits for it |
| T1 | `usage-contract.test.ts:53` | Delete the `:disabled` substring check |
| T2 | `usage-contract.test.ts:115-116` | Compare rule codes plus `ODD-STATIC-003` to `USAGE_CODES` without `COMMENT_RULES` |
| T3 | `eslint-html.test.ts:169` | Delete the fixture-reads-fixture check |

## Gaps

These are missing tests, not cuts. A useful suite covers both directions.

- `src/js/appearance.ts` has no test of `loadAppearance` id validation, `saveAppearance`, or `FIRST_PAINT_SCRIPT` (grep of `tests/` and `e2e/` finds no import).
- `menu.ts`, `tabs.ts`, `roving.ts`, `enhance.ts`, `fallbacks.ts`, and the toast rehome are tested only in `e2e/`, which `bun run check` never runs.
- `scripts/consumer-smoke.ts` with `tests/fixtures/consumer/**` is a real pack-and-install test (tsc, typescript-eslint, and vitest against the tarball). No script, doc, or CI runs it. Add a `package.json` script or delete it. It is the only test of the published `dist/` exports.
- `preferences.css` (`prefers-contrast: more`, forced colors) and the `@import` completeness of `index.css` have no test.

## Not verified

- No mutation runs. The `clampChroma` and slider-fill claims are inferred from reading the assertions and `slider.css`.
- Playwright browsers were not run for this audit. The e2e counts come from `--list`.
- Which `requestAnimationFrame` wiring writes `odd-` markup that `tests/stories.test.ts:125` never sees comes from a grep trace, not a run.
  - `measure()` in `stories/Foundations.stories.ts:11-28`, scheduled at `:72`, writes `odd-badge` spans into the Contrast story at `:25-26`. It skips a row when `parse` returns nothing (`:18`), so whether it writes badges under happy-dom is not known.
  - `createToaster()`, called in the Toast story's wiring at `stories/Interactive.stories.ts:142`, appends an `odd-toaster` region to `document.body`, outside the story root (`src/js/toast.ts:36-48`). Its `odd-button` buttons come from `show()` (`src/js/toast.ts:133`, `:144`), which the story calls only on a click. Only the moved toast block checks those buttons.
  - `src/js/menu.ts`, `src/js/tabs.ts`, and `enhanceSelectAll` in `src/js/enhance.ts:45-71` write no `odd-` markup. They set ARIA state, `tabIndex`, `hidden`, and checkbox state on elements already there.
