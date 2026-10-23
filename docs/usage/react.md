# Use the React Button

`Button` renders an `odd-button` element from typed props. A contract mistake in those props is a TypeScript error that starts with its code, such as `ODD-BUTTON-007`. `Button` lives in `src/react/button.tsx`, and consumers import it as `odd-design/react`. Codes and fixes are in [Button usage rules](button.md).

The file starts with `"use client"`, so a React Server Components app can render `Button` from a server component.

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

## Read a type error

The type error names the code and the fix. The table lists what each mistake prints.

| Mistake | The error prints |
| --- | --- |
| `disabled` | `ODD-BUTTON-007` |
| `iconOnly` with no `aria-label` and no `aria-labelledby` | `ODD-BUTTON-008` |
| `aria-current` without `href` | `ODD-BUTTON-012` |
| `aria-disabled` with `href` | `ODD-BUTTON-013` |
| A system `data-` attribute the button does not take, such as `data-tone` | `ODD-BUTTON-015` |
| A `variant`, `size`, or `aria-current` value outside the contract | The allowed values |

TypeScript shortens a long type in an error. Set `noErrorTruncation` in `tsconfig.json` to see the whole message.

Some rules are not type errors. `Button` picks the element from `href`, so you cannot write an anchor without `href` (`ODD-BUTTON-009`) or a button with `href` (`ODD-BUTTON-010`). Those two codes apply to a raw `a` or `button` with the `odd-button` class. Visible text in an icon-only button (`ODD-BUTTON-014`) and a misspelled `data-` name are not type errors either. The ESLint plugin and the [runtime checker](runtime.md) report each of these.

## Open a dialog or a popover with a command

Pass `command` and `commandfor` in lowercase. `@types/react` does not declare them, so `Button` declares them. A link takes `interestfor`, and so does a button.

```tsx
<Button command="show-modal" commandfor="settings">
  Settings
</Button>
```

`command` takes `show-modal`, `close`, `request-close`, `show-popover`, `hide-popover`, `toggle-popover`, or a custom command that starts with `--`.
