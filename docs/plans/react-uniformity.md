# React uniformity plan

Button, Field, and Choice ship from `odd-design/react`, but they reach the DOM two ways. Field and Choice call `part(name, tag, className)`. Button is hand-written. It lowers `variant`, `size`, and `iconOnly` to `data-*` attributes in its own code, and it types its contract by hand. Badge is the next port. It is a fixed `span` with two data props, `tone` and `solid`, and `part()` cannot express data props today. Without this change, Badge copies Button's hand-written lowering.

This plan gives every part one shape. `part.ts` reads each part's row in `WRAPPERS` at runtime. One `lower` function turns props into DOM attributes for Button and for every fixed part. Prop types come from the `USAGE` rules by rule kind. After this change, Badge's React module is four lines once its contract rows exist. Markup, type errors, export names, and stories stay the same.

The work ships as one PR on `feat/react-uniformity`, built as four commits after a baseline capture. Each commit ends in a check. Nothing merges or deploys.

This plan waits for approval. Nothing is built yet.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when its evidence exists.

The run follows `odd-mode/playbooks/refactoring.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff. The lead plans, reviews, and verifies.

The design came from two architect runners and a cross-judge. Both runners built their shape in a lab and checked it against the current suite. Their records are local scratch in the gitignored `.verify/arena/` folder of this worktree: `candidate-opus/design.md`, `candidate-grok/design.md`, and `synthesis.md`.

## How the three families differ today

| | Button | Field | Choice |
| --- | --- | --- | --- |
| Module | `button.tsx`, hand-written function with an overload | `field.tsx`, seven `part()` calls | `choice.tsx`, three `part()` calls |
| Render | own `createElement`, tag chosen by `href` | `part(name, tag, className)` | same as Field |
| Tag and class | literals `"a"`, `"button"`, `"odd-button"` | restated at each call, typed against `WRAPPERS` | same as Field |
| Data props | hand-coded `look` object | none | none |
| Contract types | own `Message`, own `EnumValues`, hand-typed `disabled`, `ReservedData` | `Forbidden` from `part.ts` | `Forbidden`, plus `Pinned` for Switch |
| `"use client"` | yes, for the click handler | no | no |
| Story file | `stories/mirrored/Button.stories.ts`, typed `Args`, Playground | `Field.stories.ts`, no args | `Choice.stories.ts`, no args |
| Type fail fixtures | unprefixed: `disabled.tsx`, `variant.tsx`, `data-tone.tsx`, and seven more | `field-error-hidden`, `input-aria-disabled` | `choice-*`, `switch-*` |
| Tests | rows in the `tests/react.test.tsx` markup table, plus click tests | rows in the same table | rows in the same table |

The story files and the shared test files already have one shape. Button's typed `Args`, its Playground, and its click tests exist because Button has behavior and controls that the other parts lack. They stay.

## Shape diffs to close

1. **Two render paths.** Field and Choice use `part()`, and Button writes its own `createElement` call. After the change, both paths call `lower`. Button keeps its own function, because only Button chooses its tag from a prop and swallows clicks.
2. **Restated contract facts.** Each `part()` call passes a tag and a class that its `WRAPPERS` row already holds, which is ten pairs. Button passes `"a"` and `"button"` as literals. After the change, `part("Input")` and Button both read the row.
3. **Hand-coded data props.** `toHtml` in `stories/mirror.ts` and the ESLint lowering in `src/eslint/jsx.ts` already read `WRAPPERS[Name].props` generically. React is the only reader that hand-codes it. After the change, `lower` reads the same map.
4. **Hand-typed Button contract.** `disabled?: Message<"ODD-BUTTON-007">` is what `Forbidden<ButtonRule>` already derives. `EnumValues` and `ReservedData` are Button-only copies of logic a contract type can derive. After the change, Button declares `Contract<"Button", ButtonRule>`, like the other families.
5. **Two copies of `Message`.** Today it is declared in `button.tsx` and in `part.ts`. After the change, `part.ts` has the only copy.
6. **Unprefixed Button fail fixtures.** `data-tone.tsx` tests that Button rejects `data-tone`. Beside a Badge that accepts `tone`, that name reads as the opposite. After the change, every Button fixture is `button-*.tsx`, like `field-*`, `choice-*`, and `switch-*`.
7. **Hand-listed build entries.** `scripts/build.ts` lists `button.tsx`, `choice.tsx`, and `field.tsx` beside `index.ts`. `scripts/consumer-smoke.ts` lists six `dist/react/*` files in `REQUIRED`. A tsc emit from `index.ts` alone gave the same tree as the full list. The lead measured that on 2026-10-26 with `diff -r`, and it matched byte for byte. After the change, both scripts read the barrel, and a new part adds no line to either.

## Abstractions to extract

Each one reads contract data and makes no judgment call. Each one has callers today and an obvious caller in Badge. None is exported from `odd-design/react`. They live in the internal `src/react/part.ts`, which the barrel does not re-export.

| Name | Kind | Reads | Callers today | Badge |
| --- | --- | --- | --- | --- |
| `part(name)` | function | `WRAPPERS[name].element` | the ten fixed parts | `part("Badge")` |
| `lower(name, props)` | function | `WRAPPERS[name].className` and `.props` | Button and `part` | through `part` |
| `Contract<Name, Rule>` | type | rule kinds `enum`, `boolean-attribute`, `forbidden-attribute`, `required-attribute`, `system-data`, plus `WRAPPERS[Name].props` | Button, Input, Textarea, Select, FieldError, Choice, Switch, Segmented | `Contract<"Badge", BadgeRule>` |
| `Values<Rule, Attribute>` | type | the `enum` rule for one attribute | `ButtonVariant`, `ButtonSize`, Button's `aria-current` | `BadgeTone`, if Badge exports one |
| `Message<Code>` | type | `MESSAGES` | Button's 008, 012, and 013 checks, and `Contract` | through `Contract` |
| `Native<Name, Replaced>` | type | `WRAPPERS[Name].element` | the ten fixed parts, unchanged | yes |

`lower` copies a string value onto the mapped attribute. It turns `true` into `""` and `false` into an absent attribute, the same way `mappedAttribute` in `toHtml` does. `Contract` turns an `enum` attribute into its value union and a `boolean-attribute` into `boolean`. It types the raw mapped attributes, such as `data-variant`, as `never`. If the rules include a `system-data` rule, it types other families' `data-*` names as that rule's message. `Contract` replaces the exported `Forbidden`, `Pinned`, and `Part`, so a part author has one way to describe a part's rules. `Pinned` learns one filter: it keeps only `required-attribute` rules whose element is the part's tag. Without that filter, Button's `a` needs `href` rule (009) would add a required `href` to `<button>`.

After the change, Badge's React module looks like this. It is not built in this PR.

```tsx
interface BadgeContract extends Contract<"Badge", BadgeRule> {}
export interface BadgeProps extends BadgeContract, Native<"Badge", keyof BadgeContract> {}
export const Badge: (props: BadgeProps) => ReactElement = part("Badge");
```

### The runtime import

`part.ts` changes from a types-only import of the contract to a value import of `WRAPPERS`. The earlier plans kept the import types-only to match `button.tsx`, and they gave no other reason (`docs/plans/react-field.md:60`). `contract.ts` imports only types, so `contract.js` has no runtime dependencies, and it already ships for `./usage`. In the Opus lab, the minified React entry grew from 1109 B to 1959 B, and gzipped it grew from 577 B to 752 B. No `USAGE`, `CLASS_REGISTRY`, or `VOCABULARY` string survived tree-shaking. The alternative keeps the import types-only and passes the tag, the class, and the prop map at every call site. Badge would then restate three facts that its own `WRAPPERS` row holds.

### Deferred

- **Deriving `src/react/props.ts` from the barrel.** The Opus lab measured `Parameters<typeof Button>[0]` as `never`, because of Button's generic overload. The `EveryWrapperHasProps` assert in `stories/mirror.ts` already fails the build when the map misses a part.
- **Generic icon-only naming (008) and link-only `aria-current` (012).** Each is one rule with one caller, and Badge has neither.
- **A generic tag-by-prop element.** Only Button has one. Heading's `h1` to `h6` has no contract row yet.
- **`ATTRIBUTES` duplicating `WRAPPERS.Button.props`.** Deriving it changes `check.ts` and `format.ts`, which belong to the contract layer. Decide this in the Badge PR.
- **One rename table for ESLint and `toHtml`** (`docs/follow-ups.md`, the `htmlFor` item). It changes lowering output, and Badge does not need it.
- **The scene excess-prop seal** (`docs/follow-ups.md`). It does not block one shape.
- **A `"use client"` check for every module that declares it.** Only Button declares it, and Badge has no handlers.

## Out of scope

- Badge or any later port, a new `WRAPPERS` row, or a new `USAGE` group.
- CSS, palettes, and chromes.
- `toHtml`, `toReact`, `catalog.ts`, the ESLint plugin, and the runtime checker.
- Story content, story ids, and sidebar order.
- Public export names and consumer-visible prop types. The emitted `.d.ts` will read `extends Contract<"Button", ButtonRule>` where it listed `variant?: ButtonVariant`, and the resolved types stay equal.
- Merge and deploy.

## Baseline

- [ ] Build the React Storybook before any change with `bunx storybook build -c .storybook-react -o .verify/uni/base-react`, serve it, and capture it with `bun scripts/capture-stories.ts <url> .verify/uni/base.json .verify/uni/base-shots`. The evidence is `base.json`. If the script cannot read the React build, say so. The `tests/stories.test.ts` check that HTML and React give the same DOM, plus the Firefox pair sweep, then carry the story proof.
- [ ] Save `bunx tsc -p tests/fixtures/types/fail --noErrorTruncation` to `.verify/uni/fail-before.txt`.
- [ ] Copy the Opus lab's `markup.tsx` render matrix to `.verify/uni/markup.tsx`, pointed at `src/react`, and save its output from `main` to `.verify/uni/markup-before.json`. It holds 324 Button prop combinations and 50 renders of the fixed parts. It stays local and is not committed.

## Commits

### Commit 1. Subtract the duplicates

- [ ] `scripts/build.ts` keeps `src/react/index.ts` and drops the three family entries.
- [ ] `scripts/consumer-smoke.ts` drops the six `dist/react/{button,choice,field}.{js,d.ts}` rows from `REQUIRED`. It keeps the `index` rows and the `button.js` `"use client"` check. It gains one step in the installed app, `node -e "import('odd-design/react').then(m => console.log(Object.keys(m).sort().join()))"`, that must print the eleven export names. That one import resolves every family file, and from commit 3 on it also resolves `part.js` and `contract.js`. No smoke step runs the React entry today.
- [ ] `button.tsx` imports `Message` from `part.ts` and deletes its own copy. `contract.ts` deletes the unused `SharedRule` alias.
- [ ] Check. Run `bun run check`, `bun run build`, and `bun scripts/consumer-smoke.ts`. Pass means all three exit 0, and the smoke prints the eleven names.

### Commit 2. Prefix the Button fail fixtures

- [ ] `git mv` the ten unprefixed fixtures in `tests/fixtures/types/fail/` to `button-<name>.tsx`. Rename their keys in the `failures` map in `tests/react.test.tsx`. Codes and text fragments stay the same.
- [ ] Check. Run `bun test tests/react.test.tsx`. Pass means it is green, and the fixture set equals the `failures` keys.

### Commit 3. One part shape

- [ ] Rewrite `src/react/part.ts` to the shape above. It exports `part`, `lower`, `Contract`, `Values`, `Message`, and `Native`, and it deletes `Forbidden`, `Pinned`, and `Part`.
- [ ] Migrate Field, Choice, and Button in the same commit. Field and Choice call `part("X")` and declare `Contract<"X", XRule>`. Button declares `Contract<"Button", ButtonRule>` and keeps `"use client"`, `swallow`, the `type="button"` default, the overload, and the 008 and 012 call-signature types. It renders `createElement(WRAPPERS.Button.element.absent | .present, lower("Button", ...))`. Delete `EnumValues`, `ButtonAttribute`, `OtherSystemData`, `ReservedData`, the hand-typed data props and `disabled`, and the `look` object.
- [ ] Check. Run `bun run check`. Then run `bun .verify/uni/markup.tsx` and diff the output against `markup-before.json`. Pass means 0 mismatches over 374 renders. Diff the new `tsc -p tests/fixtures/types/fail --noErrorTruncation` output against `fail-before.txt`, with the `button-` rename applied. Pass means identical lines.

### Commit 4. Write the port recipe

- [ ] Add a short "Add a React part" section to `README.md`, after "Add a chrome". It names the files a port touches in order: the contract rows and codes, `docs/usage/<family>.md`, the part module with `Contract` and `part`, one `index.ts` line, one `props.ts` line, a mirrored story file, and the markup, fixture, and `places` test entries. A new part adds no line to `build.ts` or `consumer-smoke.ts`.
- [ ] Check. A reader can follow the recipe without opening `docs/plans/`. The lead reads it against the files.

## Verify on the real artifact

- [ ] Run `bun run check`, `bun run build`, `bun scripts/consumer-smoke.ts`, and `bun run test:browsers`. Pass means every command exits 0. The browser run includes the Firefox HTML-versus-React pair sweep over every mirrored story.
- [ ] Rebuild the React Storybook and run `bun scripts/capture-stories.ts --diff .verify/uni/base.json .verify/uni/after.json`. Pass means `changed` is empty.
- [ ] Compare the export names of `dist/react/index.d.ts` with `main`, using `exportedNames()` from `tests/react-public-api.ts`. Pass means the lists are equal. `tests/react-public-api.test.ts` also checks this.
- [ ] Report the minified and gzipped size of the React entry against `main`, with the command. The expected change is about +850 B minified, from the lab.

## Review and open the PR

- [ ] The cross-provider reviewer reads the diff against this plan and `.verify/arena/synthesis.md`. A fresh builder round fixes every finding.
- [ ] Run `/deslop` and `/no-comments` over the diff.
- [ ] Open the PR ready, not draft, with `gh pr create --base main --repo Rakvadium/odd-design`. The title is `refactor(react): build every part from its WRAPPERS row`. Link the PR to this thread.
- [ ] Run `gh pr checks <pr> --watch --repo Rakvadium/odd-design`. The repo has no workflows, so expect "no checks reported". Report the PR as open with no checks configured. Do not merge.

## Throughput checkpoint

- **Blocking first steps.** The baseline capture and the two `before` files. No structural change starts before they exist.
- **Independent workstreams.** None worth splitting. Commit 3 touches every file in `src/react/`, and commits 1 and 2 are small.
- **Shared mutable state.** One builder owns the branch. The baseline files are written once.
- **Smallest safe decomposition.** One builder, one commit at a time, and each commit's check passes before the next commit starts.
