# Use the React components

`odd-design/react` exports `Button` and the Field parts. Each renders an `odd-` element from typed props. A contract mistake in those props is a TypeScript error that starts with its code, such as `ODD-BUTTON-007`. `Button` lives in `src/react/button.tsx`, and the Field parts live in `src/react/field.tsx`. Codes and fixes are in [Button usage rules](button.md) and [Field usage rules](field.md).

`button.tsx` starts with `"use client"`, so a React Server Components app can render `Button` from a server component. The Field parts hold no state and no handlers, so `field.tsx` has no directive.

## Render a button or a link

```tsx
import { Button } from "odd-design/react";

<Button variant="primary">Save</Button>;
<Button href="/docs" aria-current="page">Docs</Button>;
```

`Button` renders an `a` when you pass `href`, and a `button` otherwise. The element always has the class `odd-button`, plus the words in `className`. The table shows how the other props map to the element. The ESLint plugin reads `Button` with the same mapping, as [Check HTML with ESLint](eslint.md) describes.

| Prop | What the element gets |
| --- | --- |
| `href` | The element is an `a`. Without `href`, it is a `button`. |
| `variant` | `data-variant` |
| `size` | `data-size` |
| `iconOnly` | `data-icon-only` with an empty value. `iconOnly={false}` leaves it out. |
| `type` | On a `button`, `type`. It defaults to `button`, and takes `submit` and `reset`. |
| Any other prop | The attribute with the same name. |

Use `variant`, `size`, and `iconOnly`. Passing `data-variant`, `data-size`, or `data-icon-only` yourself is a type error.

## Disable a button with aria-disabled

Set `aria-disabled="true"`. The button stays focusable and stays in the tab order. A click calls `preventDefault` and does not call your `onClick`. So a `type="submit"` button does not submit its form, by click or by Enter in a field.

```tsx
<Button type="submit" aria-disabled="true">
  Pay
</Button>
```

`Button` never renders the `disabled` attribute, and the `disabled` prop is a type error. `aria-disabled="false"` works like no `aria-disabled`.

A link takes no `aria-disabled`. Render a button when the control should not navigate.

## Build a field

```tsx
import { Field, Hint, Input, Label } from "odd-design/react";

<Field>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" required aria-describedby="email-hint" />
  <Hint id="email-hint">We never share it.</Hint>
</Field>;
```

Each part renders one element with its class, plus the words in `className`. Every other prop goes to the element as is. The ESLint plugin reads each part as the same element.

| Part | Element | Required prop |
| --- | --- | --- |
| `Field` | `div.odd-field` | |
| `Label` | `label.odd-label` | `htmlFor` |
| `Input` | `input.odd-input` | |
| `Textarea` | `textarea.odd-textarea` | |
| `Select` | `select.odd-select` | |
| `Hint` | `p.odd-hint` | `id` |
| `FieldError` | `p.odd-error` | `id` |

Wire `htmlFor`, `id`, and `aria-describedby` yourself, as in HTML. No checker follows these references, so a dangling `aria-describedby` is not an error. `Input` takes no required `id`, because a search box is named with `aria-label`. `FieldError` is named so it does not shadow the global `Error`.

## Show an error

Render `FieldError` only while the field is invalid. Set `aria-invalid` on the control, and add the error's `id` to its `aria-describedby`.

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

Do not keep a hidden error in the tree. A screen reader still announces a hidden element that `aria-describedby` references. `hidden` and `aria-hidden` on `FieldError` are type errors.

## Disable a field with disabled

A field control is the reverse of `Button`. Set `disabled` on `Input`, `Textarea`, or `Select`. The field styles only `:disabled`.

```tsx
<Input id="owner" defaultValue="you" disabled />
```

`aria-disabled` on a field control is a type error. It leaves the control editable, and the control does not look disabled.

## Read a type error

The type error names the code and the fix. The table lists what each mistake prints.

| Mistake | The error prints |
| --- | --- |
| `disabled` | `ODD-BUTTON-007` |
| `iconOnly` with no `aria-label` and no `aria-labelledby` | `ODD-BUTTON-008` |
| `aria-current` without `href` | `ODD-BUTTON-012` |
| `aria-disabled` with `href` | `ODD-BUTTON-013` |
| A system `data-` attribute the button does not take, such as `data-tone` | `ODD-BUTTON-015` |
| `hidden` or `aria-hidden` on `FieldError` | `ODD-FIELD-002` |
| `aria-disabled` on `Input`, `Textarea`, or `Select` | `ODD-FIELD-003` |
| `Label` without `htmlFor`, or `Hint` or `FieldError` without `id` | TypeScript's missing property error |
| A `variant`, `size`, or `aria-current` value outside the contract | The allowed values |

TypeScript shortens a long type in an error. Set `noErrorTruncation` in `tsconfig.json` to see the whole message.

Some rules are not type errors. `Button` picks the element from `href`, so you cannot write an anchor without `href` (`ODD-BUTTON-009`) or a button with `href` (`ODD-BUTTON-010`). Those two codes apply to a raw `a` or `button` with the `odd-button` class. Each Field part picks its own element too, so `ODD-FIELD-001` applies only to raw markup. Visible text in an icon-only button (`ODD-BUTTON-014`) and a misspelled `data-` name are not type errors either. The ESLint plugin and the [runtime checker](runtime.md) report each of these.

## Open a dialog or a popover with a command

Pass `command` and `commandfor` in lowercase. `@types/react` does not declare them, so `Button` declares them. A link takes `interestfor`, and so does a button.

```tsx
<Button command="show-modal" commandfor="settings">
  Settings
</Button>
```

`command` takes `show-modal`, `close`, `request-close`, `show-popover`, `hide-popover`, `toggle-popover`, or a custom command that starts with `--`.
