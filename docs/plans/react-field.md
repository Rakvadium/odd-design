# React Field

`odd-design/react` gains seven Field parts beside `Button`. Each part renders one element with its `odd-` class and passes every other prop through. The caller wires `htmlFor`, `id`, and `aria-describedby` the same way as in HTML. Three new codes cover the Field mistakes that one node can show. TypeScript, ESLint, and the runtime checker all report them from the same `USAGE` rules.

This plan waits for approval. Nothing is built yet.

## Usage

```tsx
import { Field, FieldError, Hint, Input, Label } from "odd-design/react";

<Field>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    required
    aria-invalid={error === undefined ? undefined : "true"}
    aria-describedby={error === undefined ? "email-hint" : "email-hint email-error"}
  />
  <Hint id="email-hint">We never share it.</Hint>
  {error === undefined ? null : <FieldError id="email-error">{error}</FieldError>}
</Field>;
```

| Part | Element | Required prop |
| --- | --- | --- |
| `Field` | `div.odd-field` | |
| `Label` | `label.odd-label` | `htmlFor` |
| `Input` | `input.odd-input` | |
| `Textarea` | `textarea.odd-textarea` | |
| `Select` | `select.odd-select` | |
| `Hint` | `p.odd-hint` | `id` |
| `FieldError` | `p.odd-error` | `id` |

`className` adds words after the part's class, as on `Button`. Field has no `data-*` attributes, so no prop renames an attribute. `FieldError` is named so it does not shadow the global `Error`. `Input` takes no `id` requirement, because a search box is named with `aria-label`.

## Contract

Each rule comes from the `field.css` header or from the Button trap the owner named.

| Code | Fails when | Source | TypeScript |
| --- | --- | --- | --- |
| `ODD-FIELD-001` | `odd-field` is not on a `div`, `odd-input` not on an `input`, `odd-textarea` not on a `textarea`, `odd-select` not on a `select`, or `odd-hint` or `odd-error` not on a `p` | The `field.css` header markup | Not a type error. Each part picks its tag |
| `ODD-FIELD-002` | `odd-error` has `hidden` or `aria-hidden` | "Don't keep a hidden error in the DOM" in the header | `hidden` or `aria-hidden` on `FieldError` |
| `ODD-FIELD-003` | `odd-input`, `odd-textarea`, or `odd-select` has `aria-disabled` | Field styles only `:disabled`. An agent that learned `Button` writes `aria-disabled`, and the field stays editable and looks enabled | `aria-disabled` on `Input`, `Textarea`, or `Select` |

`odd-label` gets no rule. Stories put it on a `legend` and on a decorative `span`. Native `disabled` stays legal on every control. Field gets no `system-data` rule, because `VOCABULARY.field` is empty.

The checker cannot see wiring across nodes. A dangling `aria-describedby`, or `aria-invalid` without a rendered error, stays the caller's job. The React docs show the pattern above.

## Shape

`USAGE` gains three keys. `field` holds the element rules for `odd-field` and `odd-hint`. `fieldControl` holds the three control element rules and the `aria-disabled` rule. `fieldError` holds the `odd-error` element rule and the two hidden rules. All element rules share `ODD-FIELD-001`, and its message lists every class and tag pair.

`check.ts` changes one line. Today a key with several element rules hands every one of them to each class, so `input.odd-input` would fail the textarea rule. After the change, each class keeps its own element rule plus the key's other rules. Button has one element rule, so its checks do not change.

`WRAPPERS` gains seven fixed-tag entries with `props: {}`. `jsx.ts`, `toHtml`, and `check.ts` already accept a tag string, so the ESLint lowering needs no change.

`src/react/field.tsx` holds all seven parts. It imports the contract as types only, as `button.tsx` does. Two type helpers read the contract.

- `Forbidden<Rule>` turns each `forbidden-attribute` rule into an optional prop typed as that rule's message. A new forbidden rule then becomes a TypeScript error with no React edit.
- `Tag<Name>` reads the part's element from `WRAPPERS`, so each part takes the native props of the tag ESLint lowers it to.

One `part(name, tag, className)` function renders every part. Its `tag` and `className` arguments are typed as the `WRAPPERS` literals, so a part that drifts from its entry fails `tsc`. The file has no `"use client"`. The parts hold no state and no handlers, so a server component can render them.

## Files

| File | Change | Lines |
| --- | --- | --- |
| `src/js/usage/contract.ts` | Three `USAGE` keys, seven `WRAPPERS` entries, rule types | +28 |
| `src/js/usage/format.ts` | `ODD-FIELD-001` to `003` in `USAGE_CODES` and `MESSAGES` | +25 |
| `src/js/usage/check.ts` | Each class keeps only its own element rule | +4 −1 |
| `src/react/field.tsx` | New. Seven parts, `Forbidden`, `Tag`, `part` | +60 |
| `src/react/index.ts`, `src/react/props.ts` | Barrel export, seven `WrapperProps` lines | +9 |
| `scripts/build.ts` | `src/react/field.tsx` in `entries` | +1 |
| `scripts/consumer-smoke.ts`, `tests/fixtures/consumer/clean/src/App.tsx` | `REQUIRED` gains `dist/react/field.js`, `field.d.ts`, `docs/usage/field.md`. The clean app renders one field | +8 |
| `docs/usage/field.md` | New. One section per code in the `button.md` style | +35 |
| `docs/usage/react.md` | Retitled "Use the React components". Sections for building a field, showing an error, and disabling a field, plus Field rows in the type-error table | +60 |
| `docs/usage/eslint.md`, `README.md` | Name the Field parts and `field.md` beside Button | +10 |
| Tests and fixtures | See below | +110 |
| **Total** | | **~350** |

Not touched: `button.tsx`, `jsx.ts`, `html.ts`, `plugin.ts`, `dom.ts`, `mirror.ts`, stories, `package.json`.

## Tests

Each test names the regression it catches. All of them extend existing files or join existing fixture loops.

| Test | Where | Catches |
| --- | --- | --- |
| Markup row with a full field and an error, as an exact string, then `checkRoot` | `tests/react.test.tsx`, the existing markup table | A part with the wrong tag or class, a dropped attribute, or markup the runtime checker rejects |
| Markup row with a disabled `Textarea` and a `Select` with `className` | same | Native `disabled` reaching the DOM, the `className` merge, the other two tags |
| `field-error-hidden.tsx`, expects `ODD-FIELD-002` | `tests/fixtures/types/fail` and the `failures` map | `Forbidden` no longer reading the rule, or the message losing its literal type |
| `input-aria-disabled.tsx`, expects `ODD-FIELD-003` | same | `aria-disabled` falling back to React's own type. One fixture covers all three controls, since they share one contract type |
| Field call sites, including `disabled` on each control, `ref`, a boolean `aria-invalid`, a conditional `FieldError`, and a bare search `Input` | `tests/fixtures/types/pass/pass.tsx` | A false positive, above all a copy of Button's ban on `disabled` |
| `odd-field-001`, `002`, `003` bad and good HTML pairs, plus three `RUNTIME_CODES` lines and three `places` rows | `tests/fixtures/usage/`, `usage-check.test.ts`, `eslint-html.test.ts` | A rule that does not fire. The 001 good file holds a full field, so it also catches the `check.ts` sibling bug coming back |
| `field.tsx` with a correct seven-part field plus `FieldError hidden` and `Input aria-disabled` | `tests/fixtures/usage/jsx/`, one `places` entry | A `WRAPPERS` entry that does not lower, or lowers to a tag its element rule rejects |
| The code-set check reads every `USAGE` list instead of naming `button` and `shared`. The message-token loop covers element rules | `tests/usage-contract.test.ts` | A code with no rule, or `ODD-FIELD-001`'s class and tag list drifting from the rules |

`tests/react-button.test.tsx` moves to `tests/react.test.tsx` with `git mv`, because it now holds both components. `tests/fixtures/usage/odd-class-001.good.html` puts the six ruled classes on their legal tags. It currently puts them on `div`s and would start failing.

Deliberately not written. No new React test file, since the exact `failures` map already owns the fail folder. No fixture per control. No test for a missing `htmlFor` or `id`, which is plain TypeScript. No click or keyboard tests, because the parts add no behavior. No consumer-smoke bad-app line for Field, because that script pins one Button diagnostic.

## Build order

One builder on the `feature, refactoring` model. The work is about 350 coupled lines that all hang off `contract.ts`, so splitting it would only serialize on that file. Each commit ends green under `bun run check`.

1. Contract, `check.ts`, messages, `field.md`, the HTML fixtures, and the `usage-contract` and `odd-class-001` updates. The runtime and HTML lint checks report the three codes.
2. `field.tsx`, `WRAPPERS`, the barrel, `props.ts`, `build.ts`, the type fixtures, the JSX fixture, and the markup rows.
3. `react.md`, `eslint.md`, `README.md`, and consumer smoke.

## Verify

1. `bun run check` passes.
2. `bun scripts/consumer-smoke.ts` packs the tarball, installs it into a React app, and passes with the new `REQUIRED` files and the clean field.
3. In that packed app, `<FieldError id="e" hidden>` prints a `TS2322` line that contains the full `ODD-FIELD-002` message. The line goes into the PR as evidence.
4. A Grok review of the diff, on the other provider from the builder.

Storybook is not a verification surface for this change. The CSS and stories do not change. `verify-odd-design` drives Storybook only, and React Field has no story (see choice 3). The markup test pins the React output to the same markup as the Forms story.

## Choices to confirm

The build uses each default unless you say otherwise.

1. **`ODD-FIELD-003` ships.** It is the Button inverse trap you named. The alternative ships only 001 and 002.
2. **`Label` requires `htmlFor`, and `Hint` and `FieldError` require `id`.** The alternative leaves them optional and allows `<Label>Email <Input /></Label>`, which the CSS header does not show.
3. **No React Storybook story for Field in this PR.** The scene model cannot nest a control inside a field, and `toHtml` would write `htmlFor` as is. That goes to `docs/follow-ups.md`. The alternative extends `Scene` here.
4. **`docs/usage/react.md` covers both components.** The alternative is a separate `react-field.md`.
