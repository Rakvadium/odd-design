# Use the React components

`odd-design/react` exports `Button`, the Field parts, the Choice parts, `Badge`, the Alert parts, the Avatar parts, `Separator`, and `Skeleton`. Each renders an `odd-` element from typed props. A contract mistake in those props is a TypeScript error that starts with its code, such as `ODD-BUTTON-007`. `Button` lives in `src/react/button.tsx`, the Field parts in `src/react/field.tsx`, the Choice parts in `src/react/choice.tsx`, `Badge` in `src/react/badge.tsx`, the Alert parts in `src/react/alert.tsx`, the Avatar parts in `src/react/avatar.tsx`, `Separator` in `src/react/separator.tsx`, and `Skeleton` in `src/react/skeleton.tsx`. Codes and fixes are in [Button usage rules](button.md), [Field usage rules](field.md), [Choice usage rules](choice.md), [Badge usage rules](badge.md), [Alert usage rules](alert.md), [Avatar usage rules](avatar.md), [Separator usage rules](separator.md), and [Skeleton usage rules](skeleton.md).

`button.tsx` starts with `"use client"`, so a React Server Components app can render `Button` from a server component. The Field parts, the Choice parts, `Badge`, the Alert parts, the Avatar parts, `Separator`, and `Skeleton` hold no state and no handlers, so `field.tsx`, `choice.tsx`, `badge.tsx`, `alert.tsx`, `avatar.tsx`, `separator.tsx`, and `skeleton.tsx` have no directive.

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

## Show a person with an avatar

```tsx
import { Avatar, AvatarGroup, type AvatarSize } from "odd-design/react";

<Avatar size="lg">
  <img src={kai.photo} alt="Kai Nakamura" />
</Avatar>;
<Avatar role="img" aria-label="Ana Rojas">AR</Avatar>;
<p>
  <Avatar aria-hidden="true">MO</Avatar> Mira Okafor
</p>;

<AvatarGroup role="group" aria-label="Collaborators">
  {people.map((person) => (
    <PersonAvatar key={person.id} person={person} />
  ))}
</AvatarGroup>;

function PersonAvatar({ person }: { person: Person }) {
  const [failed, setFailed] = useState(false);
  if (person.photo === undefined || failed) {
    return (
      <Avatar role="img" aria-label={person.name}>
        {person.initials}
      </Avatar>
    );
  }
  return (
    <Avatar>
      <img src={person.photo} alt={person.name} onError={() => setFailed(true)} />
    </Avatar>
  );
}
```

`Avatar` renders a `span` with the class `odd-avatar`. `AvatarGroup` renders a `div` with the class `odd-avatar-group`. The image, the initials, and the name stay yours. An image avatar's `img` has `alt`. An initials avatar is `role="img"` with an `aria-label`. Next to a visible name, hide the avatar with `aria-hidden="true"`.

| Prop | What the element gets |
| --- | --- |
| `size` on `Avatar` | `data-size`. It takes `sm` or `lg`. Leave it out for the default size. |
| `role` on `Avatar` | `role`. It takes only `img`. |
| `role` on `AvatarGroup` | `role`. It is required and takes only `group`. |
| Any other prop | The attribute with the same name. |

`AvatarSize` is the type of `size`. `size="md"` is a type error. Passing `data-size` yourself is a type error, and `Avatar` drops the raw attribute. `role="img"` on `Avatar` with no `aria-label` and no `aria-labelledby` is a type error (`ODD-AVATAR-004`), and so is an `AvatarGroup` with neither. `data-size` on `AvatarGroup` is a type error (`ODD-AVATAR-006`). Put `size` on each `Avatar`.

`data-initials` on `Avatar` is a type error. `avatarFallback` from `odd-design/enhance` swaps a failed image for those initials by replacing the avatar's children, and React throws on its next render of children a script replaced. Render the initials yourself when the image's `onError` fires, as `PersonAvatar` does. A computed `size`, such as `<Avatar size={sizeOf[place]}>`, gives the `ODD-STATIC-001` warning, the same as a computed `tone` on `Badge`.

## Split sections with a separator

```tsx
import { Separator } from "odd-design/react";

<Separator />;
<div className="odd-row">
  <a href="/decks/1/edit">Edit</a>
  <Separator aria-orientation="vertical" />
  <a href="/decks/1/export">Export</a>
</div>;
```

`Separator` renders an `hr` with the class `odd-separator`. Screen readers announce it as a separator. A horizontal line needs no props. Between inline items, pass `aria-orientation="vertical"`, as on the element, and put it inside an `odd-row`, which stretches it to the row's height. No checker reports a vertical separator outside a row.

`Separator` takes no children, because React throws on an `hr` with children. Put a label beside it. `role` takes only `separator`, and `aria-hidden` is a type error (`ODD-SEPARATOR-003`). For a line that means nothing, draw a border on the container instead. `data-orientation` is a type error (`ODD-SEPARATOR-002`), because the stylesheet does not read it. A computed `aria-orientation`, such as `<Separator aria-orientation={orientation}>`, gives the `ODD-STATIC-001` warning, the same as a computed `role` on `Avatar`.

## Hold the place of loading content

```tsx
import { Skeleton } from "odd-design/react";

<div aria-busy="true">
  <span className="odd-visually-hidden">Loading decks…</span>
  <Skeleton aria-hidden="true" shape="avatar" />
  <Skeleton aria-hidden="true" style={{ inlineSize: "60%" }} />
</div>;
```

`Skeleton` renders a `div` with the class `odd-skeleton`, a block that pulses while content loads. Pass `aria-hidden="true"` on every block, as on the element. It is a required prop, and it takes only the string `"true"`. `aria-hidden={true}` and a bare `aria-hidden` are type errors, because ESLint reads the bare form as empty, and an empty value hides nothing. Leaving `shape` out draws a bar 1em tall. `shape="avatar"` draws a square the size of a default avatar. Size each block with `inlineSize` and `blockSize` in `style`.

The block is hidden, so it cannot say that the page is loading. Set `aria-busy="true"` on the region that is filling in, and put the loading words in an `odd-visually-hidden` span inside it. Remove the blocks, the span, and `aria-busy` when the content arrives. No checker reads the region, so a block with no busy region beside it passes. Children, `aria-busy`, `role`, `aria-label`, and `aria-labelledby` on `Skeleton` are type errors (`ODD-SKELETON-004`). A computed `shape`, such as `<Skeleton shape={shapeOf[kind]}>`, gives the `ODD-STATIC-001` warning, the same as a computed `size` on `Avatar`.

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
| `role="img"` on `Avatar`, or an `AvatarGroup`, with no `aria-label` and no `aria-labelledby` | `ODD-AVATAR-004` |
| A system `data-` attribute the avatar does not take, such as `data-tone` | `ODD-AVATAR-005` |
| A system `data-` attribute on `AvatarGroup`, such as `data-size` | `ODD-AVATAR-006` |
| `data-initials` on `Avatar` | `Types of property '"data-initials"' are incompatible` |
| `data-orientation` on `Separator` | `ODD-SEPARATOR-002` |
| `aria-hidden` on `Separator` | `ODD-SEPARATOR-003` |
| A system `data-` attribute on `Separator`, such as `data-tone` | `ODD-SEPARATOR-004` |
| Children on `Separator` | `the expected type of 'children' is 'undefined'` |
| Children, `aria-busy`, `role`, `aria-label`, or `aria-labelledby` on `Skeleton` | `ODD-SKELETON-004` |
| A system `data-` attribute on `Skeleton`, such as `data-size` | `ODD-SKELETON-005` |
| `Switch` without `type` or `role`, `AvatarGroup` without `role`, or `Skeleton` without `aria-hidden` | TypeScript's missing property error |
| A `Switch` `type` other than `checkbox`, a `Switch` `role` other than `switch`, an `Avatar` or `AvatarGroup` `role` other than `img` or `group`, a `Separator` `role` other than `separator`, or a `Skeleton` `aria-hidden` other than `"true"` | The allowed value |
| `Label` without `htmlFor`, or `Hint` or `FieldError` without `id` | TypeScript's missing property error |
| A `variant`, `size`, `aria-current`, `tone`, `aria-orientation`, or `shape` value outside the contract | The allowed values |

TypeScript shortens a long type in an error. Set `noErrorTruncation` in `tsconfig.json` to see the whole message.

Some rules are not type errors. `Button` picks the element from `href`, so you cannot write an anchor without `href` (`ODD-BUTTON-009`) or a button with `href` (`ODD-BUTTON-010`). Those two codes apply to a raw `a` or `button` with the `odd-button` class. Each Field and Choice part, `Badge`, each Alert part, each Avatar part, `Separator`, and `Skeleton` picks its own element too, so `ODD-FIELD-001`, `ODD-CHOICE-001`, `ODD-BADGE-001`, `ODD-ALERT-001`, `ODD-AVATAR-001`, `ODD-SEPARATOR-001`, and `ODD-SKELETON-001` apply only to raw markup. Visible text in an icon-only button (`ODD-BUTTON-014`) and a misspelled `data-` name are not type errors either. The ESLint plugin and the [runtime checker](runtime.md) report each of these.

## Open a dialog or a popover with a command

Pass `command` and `commandfor` in lowercase. `@types/react` does not declare them, so `Button` declares them. A link takes `interestfor`, and so does a button.

```tsx
<Button command="show-modal" commandfor="settings">
  Settings
</Button>
```

`command` takes `show-modal`, `close`, `request-close`, `show-popover`, `hide-popover`, `toggle-popover`, or a custom command that starts with `--`.
