# Use the React components

`odd-design/react` exports `Button`, the Field parts, the Choice parts, `Badge`, the Alert parts, the Avatar parts, `Separator`, `Skeleton`, the Card parts, `Disclosure`, `Tabs`, `Search`, `Slider`, `Meter`, `Progress`, `Toaster`, `Popover`, `Dialog`, `DialogActions`, `Sheet`, `SheetHeader`, `SheetFooter`, `Menu`, `MenuItem`, `TableWrap`, `Table`, `TableSort`, `TextLink`, `Spinner`, `Combobox`, `ComboboxList`, `ComboboxOption`, `Breadcrumb`, `Kbd`, `Code`, and `Pre`. Each renders an `odd-` element from typed props. A contract mistake in those props is a TypeScript error that starts with its code, such as `ODD-BUTTON-007`. `Button` lives in `src/react/button.tsx`, the Field parts in `src/react/field.tsx`, the Choice parts in `src/react/choice.tsx`, `Badge` in `src/react/badge.tsx`, the Alert parts in `src/react/alert.tsx`, the Avatar parts in `src/react/avatar.tsx`, `Separator` in `src/react/separator.tsx`, `Skeleton` in `src/react/skeleton.tsx`, the Card parts in `src/react/card.tsx`, `Disclosure` in `src/react/disclosure.tsx`, `Tabs` in `src/react/tabs.tsx`, `Search` in `src/react/search.tsx`, `Slider` in `src/react/slider.tsx`, `Meter` and `Progress` in `src/react/meter.tsx`, `Toaster` in `src/react/toast.tsx`, `Popover` in `src/react/popover.tsx`, `Dialog` and `DialogActions` in `src/react/dialog.tsx`, `Sheet`, `SheetHeader`, and `SheetFooter` in `src/react/sheet.tsx`, `Menu` and `MenuItem` in `src/react/menu.tsx`, `TableWrap`, `Table`, and `TableSort` in `src/react/table.tsx`, `TextLink` in `src/react/text-link.tsx`, `Spinner` in `src/react/spinner.tsx`, `Combobox`, `ComboboxList`, and `ComboboxOption` in `src/react/combobox.tsx`, `Breadcrumb` in `src/react/breadcrumb.tsx`, `Kbd` in `src/react/kbd.tsx`, and `Code` and `Pre` in `src/react/code.tsx`. Codes and fixes are in [Button usage rules](button.md), [Field usage rules](field.md), [Choice usage rules](choice.md), [Badge usage rules](badge.md), [Alert usage rules](alert.md), [Avatar usage rules](avatar.md), [Separator usage rules](separator.md), [Skeleton usage rules](skeleton.md), [Card usage rules](card.md), [Disclosure usage rules](disclosure.md), [Tabs usage rules](tabs.md), [Search usage rules](search.md), [Slider usage rules](slider.md), [Meter usage rules](meter.md), [Toast usage rules](toast.md), [Popover usage rules](popover.md), [Dialog usage rules](dialog.md), [Sheet usage rules](sheet.md), [Menu usage rules](menu.md), [Table usage rules](table.md), [Link usage rules](link.md), [Spinner usage rules](spinner.md), [Combobox usage rules](combobox.md), [Breadcrumb usage rules](breadcrumb.md), [Kbd usage rules](kbd.md), and [Code usage rules](code.md).

`button.tsx`, `tabs.tsx`, `toast.tsx`, `menu.tsx`, `table.tsx`, and `combobox.tsx` start with `"use client"`, so a React Server Components app can render `Button`, `Tabs`, `Toaster`, `Menu`, `MenuItem`, `TableWrap`, `Table`, `TableSort`, `Combobox`, `ComboboxList`, and `ComboboxOption` from a server component. `Tabs`, `Toaster`, `Menu`, `Table`, and `Combobox` wire themselves in a layout effect. The Field parts, the Choice parts, `Badge`, the Alert parts, the Avatar parts, `Separator`, `Skeleton`, the Card parts, `Disclosure`, `Search`, `Slider`, `Meter`, `Progress`, `Popover`, `Dialog`, `DialogActions`, `Sheet`, `SheetHeader`, `SheetFooter`, `TextLink`, `Spinner`, `Breadcrumb`, `Kbd`, `Code`, and `Pre` hold no state and no handlers, so `field.tsx`, `choice.tsx`, `badge.tsx`, `alert.tsx`, `avatar.tsx`, `separator.tsx`, `skeleton.tsx`, `card.tsx`, `disclosure.tsx`, `search.tsx`, `slider.tsx`, `meter.tsx`, `popover.tsx`, `dialog.tsx`, `sheet.tsx`, `text-link.tsx`, `spinner.tsx`, `breadcrumb.tsx`, `kbd.tsx`, and `code.tsx` have no directive. A component that holds the disclosure's, the popover's, the dialog's, or the sheet's state puts the directive in its own file.

When `Button`, `MenuItem`, or `TableSort` renders a `button`, it defaults to `type="button"` unless you pass `type`, so it does not submit a form around it. Pass `type="submit"` or `type="reset"` to opt in.

## Render a button or a link

```tsx
import { Button } from "odd-design/react";

<Button variant="primary">Save</Button>;
<Button href="/docs" aria-current="page">Docs</Button>;
```

`Button` renders an `a` when you pass `href`, and a `button` otherwise. The element always has the class `odd-button`, plus the words in `className`. The table shows how the other props map to the element.

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

Each part renders one element with its class, plus the words in `className`. Every other prop goes to the element as is.

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

Each part renders one element with its class, plus the words in `className`. Every other prop goes to the element as is.

| Part | Element | Required prop |
| --- | --- | --- |
| `Choice` | `label.odd-choice` | |
| `Switch` | `input.odd-switch` | `type="checkbox"` and `role="switch"` |
| `Segmented` | `fieldset.odd-segmented` | |

The checkbox or radio inside `Choice`, and the `legend` and `label` children of `Segmented`, are plain elements. `Switch` takes `type` and `role` from you, as the HTML does. A `Switch` outside a `Choice` needs an `aria-label`. Start a choice with `defaultChecked`, or control it with `checked` and `onChange`.

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

Use `tone` and `solid`. Passing `data-tone` or `data-solid` yourself is a type error, and `Badge` drops the raw attribute. A `solid` that is not a boolean, such as `solid="false"`, is a type error too. Without types, it renders `data-solid="false"`, which is solid, and the runtime checker reports `ODD-BADGE-003`. `BadgeTone` is the type of `tone`, for a map from your data to a tone.

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

`Skeleton` renders a `div` with the class `odd-skeleton`, a block that pulses while content loads. Pass `aria-hidden="true"` on every block, as on the element. It is a required prop, and it takes only the string `"true"`. `aria-hidden={true}` and a bare `aria-hidden` are type errors. Leaving `shape` out draws a bar 1em tall. `shape="avatar"` draws a block that matches a default avatar. The shape follows the chrome's chip radius. Size each block with `inlineSize` and `blockSize` in `style`.

The block is hidden, so it cannot say that the page is loading. Set `aria-busy="true"` on the region that is filling in, and put the loading words in an `odd-visually-hidden` span inside it. Remove the blocks, the span, and `aria-busy` when the content arrives. No checker reads the region, so a block with no busy region beside it passes. Children, `aria-busy`, `role`, `aria-label`, and `aria-labelledby` on `Skeleton` are type errors (`ODD-SKELETON-004`). A computed `shape`, such as `<Skeleton shape={shapeOf[kind]}>`, gives the `ODD-STATIC-001` warning, the same as a computed `size` on `Avatar`.

## Show that something is loading

```tsx
import { Spinner } from "odd-design/react";

<div className="odd-row" aria-busy="true">
  <Spinner aria-hidden="true" /> Loading projects…
</div>;
```

`Spinner` renders a `span` with the class `odd-spinner`, a ring 1em across in the text color that turns while something loads. Pass `aria-hidden="true"`, as on the element. It is a required prop, and it takes only the string `"true"`. The font size where the ring sits sets its size. Under reduced motion it turns slower instead of stopping.

The spinner is decoration, like a skeleton block. Set `aria-busy="true"` on the region that is loading, and put the loading words beside the spinner or in an `odd-visually-hidden` span inside that region. Remove the spinner, the words, and `aria-busy` when the content arrives. No checker reads the region. Children, `role`, `aria-label`, `aria-labelledby`, and `aria-busy` on `Spinner` are type errors (`ODD-SPINNER-002`). A Button that is working takes `aria-busy="true"` and draws its own ring, so don't put a `Spinner` inside it.

## Link to a page

```tsx
import { TextLink } from "odd-design/react";

<p>
  Read the <TextLink href="/guide">setup guide</TextLink>, or open <TextLink href="/projects" aria-current="page">Projects</TextLink>.
</p>;
```

`TextLink` renders an `a` with the class `odd-link`. It looks like every bare `a`. `href` is a required prop. `aria-current` takes only `"page"`, and the current link takes the text color and drops its underline. The export is `TextLink`, not `Link`, so it does not clash with the `Link` that routers export. A router's `Link` with `className="odd-link"` gives the `ODD-STATIC-001` warning, because the checkers cannot see what it renders.

`aria-disabled` and `disabled` are type errors (`ODD-LINK-003`), and so is `role` (`ODD-LINK-004`). A link that can't be followed is plain text. A link that looks like a button is a `Button` with `href`. A `target` needs `rel="noopener"` and words in the link text that say it opens a new tab (`ODD-LINK-007`). The types do not check that pair, so the runtime checker reports it.

## Suggest values as someone types

```tsx
import { Combobox, ComboboxList, ComboboxOption, Field, Input, Label } from "odd-design/react";

<Field>
  <Label htmlFor="city" id="city-label">City</Label>
  <Combobox>
    <Input id="city" name="city" role="combobox" aria-controls="city-list" aria-expanded="false" aria-autocomplete="list" />
    <ComboboxList id="city-list" popover="manual" role="listbox" aria-labelledby="city-label">
      <ComboboxOption role="option">Amsterdam</ComboboxOption>
      <ComboboxOption role="option" aria-disabled="true">Atlantis</ComboboxOption>
      <ComboboxOption role="option">Berlin</ComboboxOption>
    </ComboboxList>
  </Combobox>
</Field>;
```

`Combobox` renders a `div` with the class `odd-combobox` and runs `enhanceCombobox` on it. The input is Field's `Input`, with `role="combobox"`, `aria-controls` set to the list's `id`, and `aria-autocomplete="list"`. `ComboboxList` renders the list, and `popover="manual"`, `role="listbox"`, and a name are required props. `ComboboxOption` renders each option, and `role="option"` is a required prop. Typing filters the options by prefix, the arrows move between them and skip disabled ones, and Enter or a click chooses. Focus stays in the input.

Render the options as children whenever you have them. When your code filters, set `data-filter="manual"` on `ComboboxList`, render the results, and render a disabled "No results" option when a search finds nothing. A choice writes the option's text into the input and fires one `onChange` on a controlled `Input`. Put an `onClick` on each option to act on a choice, since Enter clicks the active option. `enhanceCombobox` owns `aria-selected`, so it is a type error on `ComboboxOption` (`ODD-COMBOBOX-010`), and so is `disabled` (`ODD-COMBOBOX-009`). `role` and `data-filter` on `Combobox` are type errors too (`ODD-COMBOBOX-011` and `ODD-COMBOBOX-007`).

## Show where the page sits

```tsx
import { Breadcrumb, TextLink } from "odd-design/react";

<Breadcrumb aria-label="Breadcrumb">
  <ol>
    <li>
      <TextLink href="/">Home</TextLink>
    </li>
    <li>Archived</li>
    <li>
      <TextLink href="/archived/alerts" aria-current="page">
        Alerts
      </TextLink>
    </li>
  </ol>
</Breadcrumb>;
```

`Breadcrumb` renders a `nav` with the class `odd-breadcrumb`. Pass `aria-label` or `aria-labelledby`, as on `Menu`. One of them is a required prop. Write the `ol`, the `li`s, and the `TextLink`s yourself. Each level with a page of its own is a `TextLink`, and the last one has `aria-current="page"`. A level with no page of its own is plain text in its `li`. CSS draws the slashes between crumbs, which screen readers do not read, and a long trail wraps.

The types do not read the children. A `ul` or bare links in place of the `ol` (`ODD-BREADCRUMB-003`) pass the types, and the runtime checker reports them. No checker requires the current crumb, so a trail without `aria-current="page"` passes, and its last crumb looks like every other link.

## Show a key

```tsx
import { Kbd } from "odd-design/react";

<p>
  Press <Kbd>Ctrl</Kbd> <Kbd>K</Kbd> to search.
</p>;
```

`Kbd` renders a `kbd` with the class `odd-kbd`, drawn as a keycap and read with the sentence. Write one `Kbd` per key, and write the key's name rather than a glyph. `aria-hidden` on `Kbd` is a type error (`ODD-KBD-002`). A shortcut hint at the end of a `MenuItem` is a raw `kbd` with `odd-menu-shortcut` and `aria-hidden="true"`, beside `aria-keyshortcuts` on the item.

## Show code

```tsx
import { Code, Pre } from "odd-design/react";

<p>
  Set <Code>--primary</Code> on the scope.
</p>;
<Pre>
  <code>bun add odd-design</code>
</Pre>;
```

`Code` renders a `code` with the class `odd-code`, a short piece of code inside a sentence. `Pre` renders a `pre` with the class `odd-pre`, a block. Put a raw `code` inside `Pre` when the block is code, and leave it out for command output. Long lines wrap instead of scrolling, so the block needs no `tabIndex`. An app attribute such as `data-language` passes, and a system `data-` attribute such as `data-size` on either is a type error (`ODD-CODE-002`).

## Make a whole card clickable

```tsx
import { Badge, Card, CardFooter, CardLink } from "odd-design/react";

<Card interactive>
  <p className="odd-eyebrow">Interactive</p>
  <h3 className="odd-card-title">
    <CardLink href="/decks/ember">Ember Aggro</CardLink>
  </h3>
  <p className="odd-muted">The whole card is clickable. Screen readers hear a single link.</p>
  <CardFooter>
    <Badge tone="warning">Rotating soon</Badge>
  </CardFooter>
</Card>;
```

`Card` renders an `article` with the class `odd-card`. `interactive` sets `data-interactive`, and `interactive={false}` leaves it off. `CardLink` renders an `a` with the class `odd-card-link`, and `href` is a required prop. In an interactive card, the link's `::after` covers the card, so a click anywhere on the card follows the link, and a screen reader hears one link named by the title. `CardFooter` renders a `div` with the class `odd-card-footer`. The title has no part. Write the heading at the level your page needs, with `className="odd-card-title"`.

An interactive card holds exactly one link or button, its `CardLink`. A second control sits under the stretched link and takes no click, so put it outside the card. A `CardLink` in a card without `interactive` does not stretch and loses its focus outline. The runtime checker reports both as `ODD-CARD-003` on the rendered page. `onClick` and `tabIndex` on `Card` are type errors (`ODD-CARD-004`), because the card itself is not a control. `data-span` places a card in an `odd-grid`, and other system `data-` attributes on `Card` are type errors (`ODD-CARD-006`). For a named panel or a plain box, write a raw `section` or `div` with the class `odd-card`.

## Build a disclosure

```tsx
import { Disclosure } from "odd-design/react";

<Disclosure name="faq" open>
  <summary>Does it need JavaScript?</summary>
  <div>No. Sharing a name makes the group exclusive.</div>
</Disclosure>;
```

`Disclosure` renders a `details` with the class `odd-disclosure`. Write the question as a `summary` directly inside it, and the answer as one element after it, such as a `div`, a `p`, or a `pre`. `open`, `name`, and `onToggle` are the native `details` props. Every disclosure that shares a `name` joins one exclusive group, so opening one closes the others with no script. Start at most one item of a group open. When two start open, WebKit closes both, and Firefox and Chromium keep the first.

A literal `open` sets only the first state. The browser owns every toggle after that. To read or drive the state from React, sync each item from its own `onToggle`.

```tsx
"use client";
import { useState } from "react";
import { Disclosure } from "odd-design/react";

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Disclosure name="faq" open={open} onToggle={(event) => setOpen(event.newState === "open")}>
      <summary>{question}</summary>
      <div>{answer}</div>
    </Disclosure>
  );
}
```

`event.newState === "open"` covers both directions, so the state also turns `false` when the user collapses the item. A list that keeps one shared open id must clear it on `"closed"` with a functional update, such as `setOpenId((current) => (current === id ? null : current))`. A handler that sets the id only on `"open"` leaves the prop `true` after the user collapses the item. A computed `open` with no `onToggle` goes stale after the first click, and React cannot reopen that item.

`open={false}` leaves the attribute off, and `open={true}` writes `open=""`. A string `open` is a type error. In raw HTML, `open="false"` still opens the panel, and no checker reports it.

A disclosure with no direct `summary` child shows the browser's own Details label, and the question sits hidden in the closed answer. A `summary` inside a `div`, or a `div` or `button` used as the trigger, reports `ODD-DISCLOSURE-002` in the runtime checker. Keep the summary's text non-empty, and keep links and buttons out of it. An empty summary takes its name from the answer, and a link in the summary follows its `href` and leaves the panel closed. Do not set `aria-expanded` on the summary. The browser reports the state, and a written `aria-expanded="false"` stays `false` after a click opens the panel. System `data-` attributes on `Disclosure`, such as `data-tone`, are type errors (`ODD-DISCLOSURE-003`).

## Build tabs

```tsx
import { Tabs } from "odd-design/react";

<Tabs>
  <div role="tablist" aria-label="Deck view">
    <button role="tab" id="tab-cards" aria-controls="panel-cards" aria-selected="true">Cards</button>
    <button role="tab" id="tab-stats" aria-controls="panel-stats" aria-selected="false">Stats</button>
  </div>
  <div role="tabpanel" id="panel-cards" aria-labelledby="tab-cards">60 cards across 24 units.</div>
  <div role="tabpanel" id="panel-stats" aria-labelledby="tab-stats" hidden>Average cost 2.4.</div>
</Tabs>;
```

`Tabs` renders a `div` with the class `odd-tabs` and runs `enhanceTabs` on it, so arrows, Home, End, clicks, and the panel switch work with no other call. Write the tablist as its direct child. Each tab is a `button` with `role="tab"` and an `aria-controls` that names its panel. Each panel has `role="tabpanel"`, that `id`, and an `aria-labelledby` that names its tab. `enhanceTabs` finds a panel by its `id`, so keep the ids unique on the page. `aria-selected` and `hidden` in the JSX set the first choice only. After mount, `enhanceTabs` owns them, as the browser owns `open` on a `Disclosure`. `aria-orientation="vertical"` and `data-activation="manual"` go on the tablist. A disabled tab takes native `disabled`, and the arrows skip it. `Tabs` gives a tab with no `type` the type `button` each time `Tabs` renders, so a tab inside a form does not submit it. A tab you write as `type="submit"` keeps it. A tab that a child component adds while `Tabs` does not render stays untyped until `Tabs` renders again, so write `type="button"` on it. An `enhance()` call elsewhere in the app does not wire the set twice.

To read the choice, listen for `odd-tab-change` on the forwarded ref. React 19 does not attach a custom-event prop on a `div`, so the listener goes through `addEventListener`. To choose a tab from code, call `.click()` on its button. The click goes through `enhanceTabs`, so the tab stop moves too.

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Tabs } from "odd-design/react";

export function DeckView() {
  const ref = useRef<HTMLDivElement>(null);
  const [view, setView] = useState("cards");
  useEffect(() => {
    const tabs = ref.current!;
    const onChange = (event: Event) => setView((event as CustomEvent<{ tab: HTMLElement }>).detail.tab.id.replace("tab-", ""));
    tabs.addEventListener("odd-tab-change", onChange);
    return () => tabs.removeEventListener("odd-tab-change", onChange);
  }, []);
  return <Tabs ref={ref}>…</Tabs>;
}
```

`Tabs` takes no `value`, `onValueChange`, or `defaultValue`, and `defaultValue` is a type error. React state that writes `aria-selected` by itself moves the selection and leaves the tab stop on the old tab. Setting `aria-selected` from the `odd-tab-change` value is safe, because it writes what `enhanceTabs` already wrote.

A tablist inside a wrapper loses its segmented track and reports `ODD-TABS-002` in the runtime checker. A tab that is not a `button`, or has no `aria-controls`, reports `ODD-TABS-004`. Without `aria-controls`, choosing a tab shows and hides no panel, so the panels keep whatever `hidden` they started with. `aria-orientation` and `data-activation` on `Tabs` are type errors (`ODD-TABS-003`), because nothing reads them on the root. System `data-` attributes on `Tabs`, such as `data-tone`, are type errors (`ODD-TABS-005`).

## Build a search

```tsx
import { Input, Search } from "odd-design/react";

<Search>
  <label className="odd-visually-hidden" htmlFor="card-search">Search cards</label>
  <svg aria-hidden="true" viewBox="0 0 24 24">…magnifier…</svg>
  <Input type="search" id="card-search" placeholder="Search cards" />
</Search>;
```

`Search` renders a `search` element with the class `odd-search`, the search landmark. Put the visually hidden `label`, the magnifier `svg` with `aria-hidden="true"`, and an `Input` with `type="search"` directly inside it, in that order. The label's `htmlFor` names the input's `id`. An `aria-label` on the input names it too. Enter does nothing in a bare `Search`, so a filter reads the input's `onChange`.

```tsx
"use client";
import { useState } from "react";
import { Input, Search } from "odd-design/react";

export function CardFilter({ onQuery }: { onQuery: (query: string) => void }) {
  const [query, setQuery] = useState("");
  return (
    <Search>
      <label className="odd-visually-hidden" htmlFor="card-filter">Filter cards</label>
      <svg aria-hidden="true" viewBox="0 0 24 24">…magnifier…</svg>
      <Input
        type="search"
        id="card-filter"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          onQuery(event.target.value);
        }}
      />
    </Search>
  );
}
```

To submit on Enter, put a `form` around `Search`. Enter in the input fires the form's `submit`, and the landmark and the icon's room stay as they are.

```tsx
<form action="/search" onSubmit={submit}>
  <Search>
    <label className="odd-visually-hidden" htmlFor="site-search">Search the docs</label>
    <SearchIcon aria-hidden="true" />
    <Input type="search" id="site-search" name="q" />
  </Search>
</form>;
```

`onSubmit` on `Search` is a type error (`ODD-SEARCH-004`), because a `search` element holds no form and the handler never runs. Do not put the `form` inside `Search`. A form between `odd-search` and its children leaves the input unstyled and the icon unsized, and reports `ODD-SEARCH-002` and `ODD-SEARCH-003` in the runtime checker. An input inside a wrapper, a raw `input` with no `odd-input`, or an input whose `type` is not `search` reports `ODD-SEARCH-002`. A missing or wrapped icon, or an `svg` without `aria-hidden="true"`, reports `ODD-SEARCH-003`. The runtime checker reads the rendered page, so it sees inside an icon component too. System `data-` attributes on `Search`, such as `data-tone`, are type errors (`ODD-SEARCH-005`).

The CSS's own shape, `<search><form className="odd-search">`, also works and is checked the same way. Its form submits on Enter, and the page navigates unless `onSubmit` calls `preventDefault`.

## Build a slider

```tsx
"use client";
import { useState } from "react";
import { Field, Hint, Label, Slider } from "odd-design/react";

export function CopiesField() {
  const [copies, setCopies] = useState(3);
  return (
    <Field>
      <Label htmlFor="copies">Copies per card</Label>
      <output className="odd-stat-value" htmlFor="copies">{copies} of 4</output>
      <Slider
        type="range"
        id="copies"
        min={1}
        max={4}
        value={copies}
        onChange={(event) => setCopies(event.currentTarget.valueAsNumber)}
        aria-describedby="copies-hint"
      />
      <Hint id="copies-hint">Most formats allow up to 4.</Hint>
    </Field>
  );
}
```

`Slider` renders an `input` with the class `odd-slider`. It takes `type="range"` from you, as `Switch` takes `type="checkbox"`, so the element you write is the element React renders. A `Slider` without `type` is TypeScript's missing property error, and another `type` prints `"range"`. Every other prop goes to the input: `min`, `max`, `step`, `value` with `onChange`, or `defaultValue`. The arrow keys, Page Up and Page Down, and Home and End come from the browser.

Show the value as text when it matters, as the `output` above does. WebKit draws no filled track, so the thumb and that text are what show the value there. Disable a slider with `disabled`. `aria-disabled` on `Slider` is a type error (`ODD-SLIDER-003`), because the thumb still moves and the slider does not look disabled. A system `data-` attribute on `Slider`, such as `data-tone`, is a type error (`ODD-SLIDER-004`). A computed `type`, such as `type={kind}`, gives the `ODD-STATIC-001` warning.

## Show progress or a measurement

```tsx
import { Meter, Progress, type MeterTone } from "odd-design/react";

<Progress id="import" value={40} max={100} aria-label="Importing decks" />;
<Progress id="sync" aria-label="Syncing collection" />;

<div className="odd-stack">
  <div className="odd-row">
    <label className="odd-muted" htmlFor="actions">Actions</label>
    <span className="odd-stat-value">22 <span className="odd-muted">(37%)</span></span>
  </div>
  <Meter id="actions" min={0} max={60} value={22} tone="info" />
</div>;

<Meter id="store-high" value={0.93} low={0.6} high={0.85} optimum={0} aria-label="Exports" />;
```

`Progress` renders a `progress` with the class `odd-progress`, for a task. Leave out `value` for an indeterminate bar. `Meter` renders a `meter` with the class `odd-meter`, for a measurement in a known range. Name each bar with a `label` or `aria-label`, and show the value as text too.

| Prop | What the element gets |
| --- | --- |
| `tone` | `data-tone`. It takes `success`, `warning`, `danger`, or `info`. Leave it out for the default bar. |
| Any other prop | The attribute with the same name, such as `value`, `max`, `low`, `high`, and `optimum`. |

`MeterTone` is the type of `tone`, for both bars. It has no `primary` and no `neutral`, and either one is a type error. Passing `data-tone` yourself is a type error, and the part drops the raw attribute. A system `data-` attribute other than `data-tone`, such as `data-size`, is a type error (`ODD-METER-003`). With `low` or `high`, a `Meter` colors itself by range, so give it no `tone`. No checker reads the two together yet. A computed `tone`, such as `<Meter tone={toneOf[kind]}>`, gives the `ODD-STATIC-001` warning, the same as a computed `tone` on `Badge`.

The `Meter` above sits in the [Stat row](../recipes/stat-row.md) recipe, which has no part. Write it as native markup around the bar. `Label` adds `odd-label` and is not the stat's label.

## Show a toast

```tsx
import { Button, Toaster } from "odd-design/react";
import { toast } from "odd-design/enhance";

<body>
  {children}
  <Toaster popover="manual" aria-label="Notifications" />
</body>;

<Button onClick={() => toast({ title: "Deck saved", description: "Midnight Control, version 15.", tone: "success" })}>Save</Button>;
```

`Toaster` renders an empty `section` with the class `odd-toaster` and runs `enhanceToaster` on it, which builds the list and a hidden polite live region inside and opens the region. Render it once, in the app shell. `popover="manual"` and `aria-label` are required, as `type="range"` is on `Slider`, so the JSX reads like the HTML. An `enhance()` call elsewhere in the app does not wire the region twice.

`toast({ title, description, tone, duration, action })` from `odd-design/enhance` shows a toast on the newest `Toaster` still on the page and returns `{ dismiss }`. Call it from any component or from code outside React. No provider, context, or ref is needed. It throws when no `Toaster` is mounted, so a missing one fails the first time the code runs. Each toast announces its title and description as one sentence, pauses while the pointer or focus is on it, and leaves after `duration`, 6 seconds by default. Pass `Infinity` to keep it. At most three show at once. A toast shown while a modal dialog is open moves the list inside the dialog, so the toasts stay live and clickable. Toasts already showing when the dialog opens stay behind it, inert, until the next `toast()`.

`Toaster` takes no children, and children are a type error, because `enhanceToaster` owns what is inside. A system `data-` attribute on `Toaster`, such as `data-tone`, is a type error (`ODD-TOAST-004`). Pass `tone` to `toast()` instead.

## Build a table

```tsx
import { Table, TableSort, TableWrap } from "odd-design/react";

<TableWrap tabIndex={0} role="region" aria-labelledby="decks-caption">
  <Table>
    <caption id="decks-caption">Your decks</caption>
    <thead>
      <tr>
        <th scope="col"><input type="checkbox" data-select-all aria-label="Select all decks" /></th>
        <th scope="col" aria-sort="ascending"><TableSort onClick={sortByName}>Deck</TableSort></th>
        <th scope="col" data-numeric>Cards</th>
      </tr>
    </thead>
    <tbody>
      {decks.map((deck) => (
        <tr key={deck.id}>
          <td><input type="checkbox" aria-label={`Select ${deck.name}`} checked={selected.has(deck.id)} onChange={() => toggle(deck.id)} /></td>
          <th scope="row">{deck.name}</th>
          <td data-numeric>{deck.cards}</td>
        </tr>
      ))}
    </tbody>
  </Table>
</TableWrap>;
```

`TableWrap` renders the scroll `div` with the class `odd-table-wrap`, `Table` renders the `table` with the class `odd-table`, and `TableSort` renders a sort `button` with the class `odd-table-sort`. The caption, the sections, the rows, the cells, and the checkboxes are plain elements. `data-numeric` goes on a `th` and its cells, and `aria-sort` goes on the sorted column's `th`. A table that can never overflow drops the region, as in `<TableWrap><Table>…</Table></TableWrap>`. `tabIndex`, `aria-label`, or `aria-labelledby` on `TableWrap` needs `role="region"`, and `role="region"` needs a name.

`Table` runs `enhanceSelectAll` on itself after every commit, so the header box checks or clears every row and shows checked, mixed, or unchecked. It clicks each row it changes, so each changed row's `onChange` runs once. Rows may be controlled or uncontrolled. Leave the header box uncontrolled, because `Table` owns it. A row list that re-renders without `Table`, such as a memoized `tbody` component, leaves the header box stale until `Table` renders again or a box changes. An `enhance()` call that runs after `Table` mounts uses the listener `Table` installed. One that runs before finds no table and adds nothing. Either way a row is not clicked twice. [Table usage rules](table.md) has the codes.

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
| Children, `role`, `aria-label`, `aria-labelledby`, or `aria-busy` on `Spinner` | `ODD-SPINNER-002` |
| A system `data-` attribute on `Spinner`, such as `data-size` | `ODD-SPINNER-003` |
| `aria-disabled` or `disabled` on `TextLink` | `ODD-LINK-003` |
| `role` on `TextLink` | `ODD-LINK-004` |
| A system `data-` attribute on `TextLink`, such as `data-variant` | `ODD-LINK-006` |
| `data-filter` on `Combobox` | `ODD-COMBOBOX-007` |
| `disabled` on `ComboboxOption` | `ODD-COMBOBOX-009` |
| `aria-selected` on `ComboboxOption` | `ODD-COMBOBOX-010` |
| `role` on `Combobox` | `ODD-COMBOBOX-011` |
| A system `data-` attribute on `Combobox`, `ComboboxList`, or `ComboboxOption`, such as `data-tone` | `ODD-COMBOBOX-012` |
| A system `data-` attribute on `Breadcrumb`, such as `data-tone` | `ODD-BREADCRUMB-004` |
| `aria-hidden` on `Kbd` | `ODD-KBD-002` |
| A system `data-` attribute on `Kbd`, such as `data-size` | `ODD-KBD-003` |
| A system `data-` attribute on `Code` or `Pre`, such as `data-size` | `ODD-CODE-002` |
| `onClick` or `tabIndex` on `Card` | `ODD-CARD-004` |
| A system `data-` attribute on `Card` other than `data-span`, such as `data-tone` | `ODD-CARD-006` |
| A system `data-` attribute on `CardLink` or `CardFooter`, such as `data-interactive` | `ODD-CARD-007` |
| A system `data-` attribute on `Disclosure`, such as `data-tone` | `ODD-DISCLOSURE-003` |
| `aria-orientation` or `data-activation` on `Tabs` | `ODD-TABS-003` |
| A system `data-` attribute on `Tabs`, such as `data-tone` | `ODD-TABS-005` |
| `defaultValue` on `Tabs` | `not assignable to type 'undefined'` |
| `onSubmit` or `onsubmit` on `Search` | `ODD-SEARCH-004` |
| A system `data-` attribute on `Search`, such as `data-tone` | `ODD-SEARCH-005` |
| `aria-disabled` on `Slider` | `ODD-SLIDER-003` |
| A system `data-` attribute on `Slider`, such as `data-tone` | `ODD-SLIDER-004` |
| A system `data-` attribute on `Meter` or `Progress` other than `data-tone`, such as `data-size` | `ODD-METER-003` |
| A system `data-` attribute on `Toaster`, such as `data-tone` | `ODD-TOAST-004` |
| Children on `Toaster` | `not assignable to type 'undefined'` |
| `role="dialog"` on `Popover` with no `aria-label` and no `aria-labelledby` | `ODD-POPOVER-004` |
| `aria-label` or `aria-labelledby` on `Popover` with no `role` | `ODD-POPOVER-005` |
| A system `data-` attribute on `Popover`, such as `data-tone` | `ODD-POPOVER-006` |
| `open` on `Dialog` or `Sheet` | `ODD-DIALOG-004` |
| A system `data-` attribute on `Dialog`, such as `data-tone` | `ODD-DIALOG-007` |
| A system `data-` attribute on `DialogActions`, such as `data-variant` | `ODD-DIALOG-008` |
| `closedby="any"` on `Dialog` or `Sheet` with `role="alertdialog"` | `'"any"' is not assignable to type '"closerequest"'` |
| A system `data-` attribute on `Sheet`, `SheetHeader`, or `SheetFooter`, such as `data-tone` | `ODD-SHEET-003` |
| `data-side` on `Sheet` | `not assignable to type 'undefined'` |
| A system `data-` attribute on `Menu` or `MenuItem`, such as `data-tone` on `Menu` | `ODD-MENU-004` |
| `disabled` on `MenuItem` | `ODD-MENU-007` |
| `data-tone` on `MenuItem` | `not assignable to type 'undefined'` |
| `tabIndex`, `aria-label`, or `aria-labelledby` on `TableWrap` with no `role` | `ODD-TABLE-002` |
| `role="region"` on `TableWrap` with no `aria-label` and no `aria-labelledby` | `ODD-TABLE-003` |
| A system `data-` attribute on `TableWrap`, `Table`, or `TableSort`, such as `data-numeric` | `ODD-TABLE-004` |
| `aria-sort` on `TableSort` | `ODD-TABLE-005` |
| `Switch` without `type` or `role`, `Slider` without `type`, `Toaster` without `popover` or `aria-label`, `Popover` without `popover`, `Dialog`, `Sheet`, or `Breadcrumb` without `aria-label` or `aria-labelledby`, `Menu` without `popover`, `role`, `aria-label`, or `aria-labelledby`, `MenuItem` without `role`, `AvatarGroup` without `role`, `Skeleton` or `Spinner` without `aria-hidden`, `CardLink` or `TextLink` without `href`, `ComboboxList` without `popover`, `role`, `aria-label`, or `aria-labelledby`, or `ComboboxOption` without `role` | TypeScript's missing property error |
| A `Switch` `type` other than `checkbox`, a `Switch` `role` other than `switch`, a `Slider` `type` other than `range`, a `Toaster` `popover` other than `manual`, a `Popover` `popover` other than `""` or `auto`, a `Popover` `role` other than `dialog`, a `Dialog` or `Sheet` `role` other than `alertdialog`, a `Dialog` or `Sheet` `closedby` other than `any` or `closerequest`, a `Menu` `popover` other than `""` or `auto`, a `Menu` `role` other than `menu`, a `MenuItem` `role` other than `menuitem`, `menuitemcheckbox`, or `menuitemradio`, a `TableWrap` `role` other than `region`, an `Avatar` or `AvatarGroup` `role` other than `img` or `group`, a `Separator` `role` other than `separator`, a `Skeleton` or `Spinner` `aria-hidden` other than `"true"`, a `ComboboxList` `popover` other than `manual`, a `ComboboxList` `role` other than `listbox`, a `ComboboxList` `data-filter` other than `manual`, or a `ComboboxOption` `role` other than `option` | The allowed value |
| `Label` without `htmlFor`, or `Hint` or `FieldError` without `id` | TypeScript's missing property error |
| A `variant`, `size`, `aria-current`, `tone`, `aria-orientation`, `shape`, or `side` value outside the contract | The allowed values |

TypeScript shortens a long type in an error. Set `noErrorTruncation` in `tsconfig.json` to see the whole message.

Some rules are not type errors. `Button` picks the element from `href`, so you cannot write an anchor without `href` (`ODD-BUTTON-009`) or a button with `href` (`ODD-BUTTON-010`). Those two codes apply to a raw `a` or `button` with the `odd-button` class. Each Field and Choice part, `Badge`, each Alert part, each Avatar part, `Separator`, `Skeleton`, each Card part, `Disclosure`, `Tabs`, `Search`, `Slider`, `Meter`, `Progress`, `Toaster`, `Popover`, `Dialog`, `DialogActions`, each Sheet part, `Menu`, `MenuItem`, `TableWrap`, `Table`, `TableSort`, `TextLink`, `Spinner`, `Combobox`, `ComboboxList`, `ComboboxOption`, `Breadcrumb`, `Kbd`, `Code`, and `Pre` picks its own element too, so `ODD-FIELD-001`, `ODD-CHOICE-001`, `ODD-BADGE-001`, `ODD-ALERT-001`, `ODD-AVATAR-001`, `ODD-SEPARATOR-001`, `ODD-SKELETON-001`, `ODD-CARD-001`, `ODD-DISCLOSURE-001`, `ODD-TABS-001`, `ODD-SEARCH-001`, `ODD-SLIDER-001`, `ODD-METER-001`, `ODD-TOAST-001`, `ODD-POPOVER-001`, `ODD-DIALOG-001`, `ODD-SHEET-001`, `ODD-MENU-001`, `ODD-TABLE-001`, `ODD-LINK-001`, `ODD-SPINNER-001`, `ODD-COMBOBOX-001`, `ODD-BREADCRUMB-001`, `ODD-KBD-001`, and `ODD-CODE-001` apply only to raw markup. Visible text in an icon-only button (`ODD-BUTTON-014`), the links and buttons in a card (`ODD-CARD-003`), the summary of a disclosure (`ODD-DISCLOSURE-002`), the tablist of a tab set (`ODD-TABS-002`), the tabs in a tab set (`ODD-TABS-004`), the input and the icon of a search (`ODD-SEARCH-002` and `ODD-SEARCH-003`), a `target` without `rel` on a link (`ODD-LINK-007`), the input and the list of a combobox (`ODD-COMBOBOX-002` and `ODD-COMBOBOX-003`), the list of a breadcrumb (`ODD-BREADCRUMB-003`), and a misspelled `data-` name are not type errors either. The [runtime checker](runtime.md) reports each of these.

## Open a dialog or a popover with a command

Pass `command` and `commandfor` in lowercase. `@types/react` does not declare them, so `Button` declares them. A link takes `interestfor`, and so does a button.

`Popover` renders a `div` with the class `odd-popover`. Give it an `id` and `popover="auto"`, and open it from a `Button` whose `commandfor` names that `id`.

```tsx
import { Button, Choice, Popover } from "odd-design/react";

<Button commandfor="filters" command="toggle-popover">Filters</Button>
<Popover id="filters" popover="auto" role="dialog" aria-labelledby="filters-title">
  <p className="odd-eyebrow" id="filters-title">Filter decks</p>
  <Choice><input type="checkbox" defaultChecked /> Legal only</Choice>
  <Button size="sm" commandfor="filters" command="hide-popover">Apply</Button>
</Popover>;
```

The browser owns the rest. It opens the popover in the top layer under its trigger, closes it on Escape, a click outside, or a `hide-popover` button, returns focus to the trigger, and sets the trigger's expanded state. `popover` is required and takes `""` or `"auto"`. A popover that holds controls takes `role="dialog"` and a name, and a popover that only shows text takes neither, as in `<Popover id="rules" popover="auto">Banned cards are marked in red.</Popover>`. `Popover` holds no state and takes no `open` prop. To read the open state, set it from `onToggle` with `event.newState`. To open it from code, call `showPopover({ source })` on its `ref`, which anchors it under `source` with no `id`.

`Menu` renders a `div` with the class `odd-menu` and runs `enhanceMenu` on it, and `MenuItem` renders each `button` with the class `odd-menu-item`. Open it like a popover, from a `Button` with `aria-haspopup="menu"`.

```tsx
import { Button, Menu, MenuItem, Separator } from "odd-design/react";

<Button commandfor="deck-actions" command="toggle-popover" aria-haspopup="menu">Deck actions</Button>
<Menu id="deck-actions" popover="auto" role="menu" aria-label="Deck actions">
  <MenuItem role="menuitem" onClick={rename}>Rename</MenuItem>
  <MenuItem role="menuitem" aria-disabled="true">Merge</MenuItem>
  <Separator />
  <MenuItem role="menuitemcheckbox" aria-checked="true" onClick={(event) => setPrices(event.currentTarget.getAttribute("aria-checked") === "true")}>
    Show prices
  </MenuItem>
  <MenuItem role="menuitem" tone="danger" onClick={remove}>Delete deck</MenuItem>
</Menu>;
```

The browser opens and closes the menu, as it does a popover. `enhanceMenu` adds the menu keyboard, and ArrowDown or ArrowUp on the trigger opens it at the first or last item. `popover` takes `""` or `"auto"`, `role` takes only `"menu"`, and the menu needs `aria-label` or `aria-labelledby`. `MenuItem` takes `role="menuitem"`, `"menuitemcheckbox"`, or `"menuitemradio"`, and `tone="danger"` maps to `data-tone`. Disable an item with `aria-disabled="true"`, which keeps it reachable. A `menuitem` closes the menu when chosen, and checkbox and radio items stay open. `enhanceMenu` owns `aria-checked` after mount. By the time an item's `onClick` runs it has already flipped, so read the new value there. A re-render that passes the same `aria-checked` keeps the toggled value, and a remount resets it to the prop. `Menu` takes no `open` prop. To open it from code, call `showPopover({ source })` on its `ref`.

`Dialog` renders a `dialog` with the class `odd-dialog`, and `DialogActions` renders its actions `div`. Give the dialog an `id` and a name, and open it from a `Button` with `command="show-modal"`.

```tsx
import { Button, Dialog, DialogActions } from "odd-design/react";

<Button variant="danger" commandfor="confirm-delete" command="show-modal">Delete deck…</Button>
<Dialog id="confirm-delete" aria-labelledby="confirm-delete-title" closedby="any">
  <div className="odd-dialog-body">
    <h2 className="odd-dialog-title" id="confirm-delete-title">Delete “Midnight Control”?</h2>
    <DialogActions>
      <Button commandfor="confirm-delete" command="close">Close</Button>
      <Button variant="danger" commandfor="confirm-delete" command="close">Delete</Button>
    </DialogActions>
  </div>
</Dialog>;
```

The browser owns the rest. It opens the dialog in the top layer, traps focus, makes the page behind it inert, closes it on Escape or a `close` button, and returns focus to the trigger. `closedby="any"` adds a click outside. The body is a `div` or a `form` with `odd-dialog-body`, and the title is a heading with `odd-dialog-title`, because their tags are yours. An alert dialog takes `role="alertdialog"` and leaves out `closedby="any"`. `Dialog` holds no state and takes no `open` prop. To open it from code, call `showModal()` on its `ref`, and read the close from `onClose`. React writes no `autofocus` attribute, so put the control that should take focus first.

`Sheet` renders a `dialog` with the class `odd-sheet`, and `SheetHeader` and `SheetFooter` render its header and footer `div`s. It opens the same way as `Dialog`.

```tsx
import { Button, Sheet, SheetFooter, SheetHeader } from "odd-design/react";

<Button commandfor="filters" command="show-modal">Filters</Button>
<Sheet id="filters" side="start" aria-labelledby="filters-title" closedby="any">
  <SheetHeader>
    <h2 className="odd-dialog-title" id="filters-title">Filters</h2>
    <Button variant="ghost" iconOnly aria-label="Close" commandfor="filters" command="close"><CloseIcon /></Button>
  </SheetHeader>
  <div className="odd-sheet-body">…</div>
  <SheetFooter>
    <Button commandfor="filters" command="close">Reset</Button>
    <Button variant="primary" commandfor="filters" command="close">Show 12 decks</Button>
  </SheetFooter>
</Sheet>;
```

With no `side`, the sheet slides in from the end edge. `side` takes `"start"`, `"top"`, or `"bottom"`, and `start` and the end follow the writing direction. Focus starts on the Close button, the first control in the header. The header, the body, and the footer are the sheet's three grid rows, so keep them as its direct children. The body is a `div` or a `form` with `odd-sheet-body`, because its tag is yours. To submit, make the body a `form` with an `id`, and point each footer button at it with `form`. A bottom sheet for a decision takes `role="alertdialog"` and leaves out `closedby="any"`. Like `Dialog`, `Sheet` holds no state and takes no `open` prop.

`command` takes `show-modal`, `close`, `request-close`, `show-popover`, `hide-popover`, `toggle-popover`, or a custom command that starts with `--`.

## ODD-REACT-001

Fails when you pass `role`, or an attribute the component writes itself, to an `odd-design/react` component.

The component writes every attribute its markup depends on, such as a name, a state, or an id reference. A value you pass would fight the one it writes.

Remove the attribute, and pass the prop that sets it, such as `label`, `title`, `current`, `disabled`, or `busy`.

## ODD-REACT-002

Fails when you pass a system `data-` attribute to an `odd-design/react` component.

A system `data-` attribute is one an `odd-` stylesheet reads, such as `data-tone` or `data-variant`. The component writes its own, and one from another family repaints the wrong thing. App attributes such as `data-testid` pass through.

Remove the attribute, and pass the prop that sets it, such as `tone`, `variant`, `size`, `side`, or `shape`.

## ODD-REACT-003

Fails when JSX writes an `odd-` class in `className`.

An `odd-` class is markup an `odd-design/react` component renders. A hand-written one skips the roles, ids, and wiring the component owns. The message names the component that renders the class.

Remove the class, and render the component the message names.
