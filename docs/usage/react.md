# Use the React components

`odd-design/react` exports `Button`, the Field parts, the Choice parts, `Badge`, and the Alert parts. Each renders an `odd-` element from typed props. A contract mistake in those props is a TypeScript error that starts with its code, such as `ODD-BUTTON-007`. `Button` lives in `src/react/button.tsx`, the Field parts in `src/react/field.tsx`, the Choice parts in `src/react/choice.tsx`, `Badge` in `src/react/badge.tsx`, and the Alert parts in `src/react/alert.tsx`. Codes and fixes are in [Button usage rules](button.md), [Field usage rules](field.md), [Choice usage rules](choice.md), [Badge usage rules](badge.md), and [Alert usage rules](alert.md).

`button.tsx` starts with `"use client"`, so a React Server Components app can render `Button` from a server component. The Field parts, the Choice parts, `Badge`, and the Alert parts hold no state and no handlers, so `field.tsx`, `choice.tsx`, `badge.tsx`, and `alert.tsx` have no directive.

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

## Build a checkbox, a switch, or a segmented control

```tsx
import { Choice, Segmented, Switch } from "odd-design/react";

<Choice>
  <input type="checkbox" defaultChecked /> Weekly digest
</Choice>;
<Choice>
  <Switch type="checkbox" role="switch" /> Compact grid
</Choice>;
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

Each part renders one element with its class, plus the words in `className`. Every other prop goes to the element as is. The ESLint plugin reads each part as the same element.

| Part | Element | Required prop |
| --- | --- | --- |
| `Choice` | `label.odd-choice` | |
| `Switch` | `input.odd-switch` | `type="checkbox"` and `role="switch"` |
| `Segmented` | `fieldset.odd-segmented` | |

The checkbox or radio inside `Choice`, and the `legend` and `label` children of `Segmented`, are plain elements. `Switch` takes `type` and `role` from you, as the HTML does, so the element ESLint reads is the element React renders. A `Switch` outside a `Choice` needs an `aria-label`. Start a choice with `defaultChecked`, or control it with `checked` and `onChange`.

Disable a choice with the native `disabled` attribute on the input, or on `Segmented`. `aria-disabled` on any Choice part is a type error. It leaves the input toggling, and the choice does not look disabled.

## Show a status with a badge

```tsx
import { Badge, type BadgeTone } from "odd-design/react";

<Badge>Draft</Badge>;
<Badge tone="danger" solid>Banned</Badge>;

const toneOf: Record<Status, BadgeTone> = { draft: "neutral", legal: "success", banned: "danger" };
<Badge tone={toneOf[deck.status]}>{deck.status}</Badge>;
```

`Badge` renders a `span` with the class `odd-badge`, plus the words in `className`.

| Prop | What the element gets |
| --- | --- |
| `tone` | `data-tone`. It takes `neutral`, `primary`, `success`, `warning`, `danger`, or `info`. Leave it out for a neutral badge. |
| `solid` | `data-solid` with an empty value. `solid={false}` leaves it out. |
| Any other prop | The attribute with the same name. |

Use `tone` and `solid`. Passing `data-tone` or `data-solid` yourself is a type error, and `Badge` drops the raw attribute. A `solid` that is not a boolean, such as `solid="false"`, is a type error too. Without types, it renders `data-solid="false"`, which is solid, and ESLint and the runtime checker report `ODD-BADGE-003`. `BadgeTone` is the type of `tone`, for a map from your data to a tone.

## Show a message with an alert

```tsx
import { Alert, AlertTitle, type AlertTone } from "odd-design/react";

<Alert tone="warning">
  <WarningIcon aria-hidden="true" />
  <div>
    <AlertTitle>Rotation is coming</AlertTitle>
    <p>Three of your decks lose legality on May 1.</p>
  </div>
</Alert>;

const toneOf: Record<SaveState, AlertTone> = { saved: "success", offline: "danger" };
<div role="status">
  {state && (
    <Alert tone={toneOf[state]}>
      <div>
        <AlertTitle>{titles[state]}</AlertTitle>
      </div>
    </Alert>
  )}
</div>;
```

`Alert` renders a `div` with the class `odd-alert`. `AlertTitle` renders a `p` with the class `odd-alert-title`. The icon and the body stay yours. Put the icon `svg` first and one body `div` after it, with the title and the text inside, the same way the HTML story does. Each other direct child becomes a column beside the icon, so a title followed by bare text puts the text beside the title. No checker reports that.

| Prop | What the element gets |
| --- | --- |
| `tone` on `Alert` | `data-tone`. It takes `info`, `success`, `warning`, or `danger`. Leave it out for the neutral tint. |
| Any other prop | The attribute with the same name. |

`AlertTone` is the type of `tone`. It has no `neutral` and no `primary`. Leaving `tone` out is the neutral tint, and `tone="neutral"` is a type error. Passing `data-tone` yourself is a type error, and `Alert` drops the raw attribute. `role` or `aria-live` on `Alert` is a type error (`ODD-ALERT-003`). A static alert needs no role. For a message that appears later, keep an empty `role="status"` element on the page, or `role="alert"` for an error, and render the alert inside it, as in the second example. A system `data-` attribute on `AlertTitle`, such as `data-tone`, is a type error (`ODD-ALERT-005`). A computed `tone`, such as `<Alert tone={toneOf[state]}>`, gives the `ODD-STATIC-001` warning, the same as a computed `tone` on `Badge`.

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
| `aria-disabled` on `Choice`, `Switch`, or `Segmented` | `ODD-CHOICE-003` |
| A system `data-` attribute the badge does not take, such as `data-variant` | `ODD-BADGE-004` |
| `role` or `aria-live` on `Alert` | `ODD-ALERT-003` |
| A system `data-` attribute the alert does not take, such as `data-variant` | `ODD-ALERT-004` |
| A system `data-` attribute on `AlertTitle`, such as `data-tone` | `ODD-ALERT-005` |
| `Switch` without `type` or `role` | TypeScript's missing property error |
| A `Switch` `type` other than `checkbox`, or a `role` other than `switch` | The allowed value |
| `Label` without `htmlFor`, or `Hint` or `FieldError` without `id` | TypeScript's missing property error |
| A `variant`, `size`, `aria-current`, or `tone` value outside the contract | The allowed values |

TypeScript shortens a long type in an error. Set `noErrorTruncation` in `tsconfig.json` to see the whole message.

Some rules are not type errors. `Button` picks the element from `href`, so you cannot write an anchor without `href` (`ODD-BUTTON-009`) or a button with `href` (`ODD-BUTTON-010`). Those two codes apply to a raw `a` or `button` with the `odd-button` class. Each Field and Choice part, `Badge`, and each Alert part picks its own element too, so `ODD-FIELD-001`, `ODD-CHOICE-001`, `ODD-BADGE-001`, and `ODD-ALERT-001` apply only to raw markup. Visible text in an icon-only button (`ODD-BUTTON-014`) and a misspelled `data-` name are not type errors either. The ESLint plugin and the [runtime checker](runtime.md) report each of these.

## Open a dialog or a popover with a command

Pass `command` and `commandfor` in lowercase. `@types/react` does not declare them, so `Button` declares them. A link takes `interestfor`, and so does a button.

```tsx
<Button command="show-modal" commandfor="settings">
  Settings
</Button>
```

`command` takes `show-modal`, `close`, `request-close`, `show-popover`, `hide-popover`, `toggle-popover`, or a custom command that starts with `--`.
