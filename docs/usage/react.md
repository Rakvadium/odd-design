# Use the React components

`odd-design/react` exports `Button`, the field controls (`Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `RadioGroup`, and `Segmented`), `Badge`, the Alert parts, the Avatar parts, `Separator`, `Skeleton`, the Card parts, `Disclosure`, `Tabs`, `Search`, `Slider`, `Meter`, `Progress`, `Toaster`, `Popover`, `Dialog`, `AlertDialog`, `Sheet`, `Menu`, `MenuItem`, `MenuCheckboxItem`, `MenuRadioItem`, `MenuRadioGroup`, `MenuGroup`, `MenuSeparator`, `TableWrap`, `Table`, `TableSort`, `TextLink`, `HoverCard`, `HoverCardLink`, `Spinner`, `Combobox`, `ComboboxOption`, `Breadcrumb`, `Kbd`, `Code`, `Pre`, the layout components (`Stack`, `Row`, `Grid`, `GridItem`, `VisuallyHidden`, `SkipLink`, and `Scope`), and the typography components (`Heading`, `Eyebrow`, and `Muted`). Each renders an `odd-` element from typed props. A contract mistake in those props is a TypeScript error that starts with its code, such as `ODD-BUTTON-007`. `Button` lives in `src/react/button.tsx`, the field controls in `src/react/field.tsx`, `Badge` in `src/react/badge.tsx`, the Alert parts in `src/react/alert.tsx`, the Avatar parts in `src/react/avatar.tsx`, `Separator` in `src/react/separator.tsx`, `Skeleton` in `src/react/skeleton.tsx`, the Card parts in `src/react/card.tsx`, `Disclosure` in `src/react/disclosure.tsx`, `Tabs` in `src/react/tabs.tsx`, `Search` in `src/react/search.tsx`, `Slider` in `src/react/slider.tsx`, `Meter` and `Progress` in `src/react/meter.tsx`, `Toaster` in `src/react/toast.tsx`, `Popover` in `src/react/popover.tsx`, `Dialog` and `AlertDialog` in `src/react/dialog.tsx`, `Sheet` in `src/react/sheet.tsx`, the Menu parts in `src/react/menu.tsx`, `TableWrap`, `Table`, and `TableSort` in `src/react/table.tsx`, `TextLink` in `src/react/text-link.tsx`, `HoverCard` and `HoverCardLink` in `src/react/hover-card.tsx`, `Spinner` in `src/react/spinner.tsx`, `Combobox` and `ComboboxOption` in `src/react/combobox.tsx`, `Breadcrumb` in `src/react/breadcrumb.tsx`, `Kbd` in `src/react/kbd.tsx`, `Code` and `Pre` in `src/react/code.tsx`, the layout components in `src/react/layout.tsx`, and the typography components in `src/react/typography.tsx`. Codes and fixes are in [Button usage rules](button.md), [Field usage rules](field.md), [Choice usage rules](choice.md), [Badge usage rules](badge.md), [Alert usage rules](alert.md), [Avatar usage rules](avatar.md), [Separator usage rules](separator.md), [Skeleton usage rules](skeleton.md), [Card usage rules](card.md), [Disclosure usage rules](disclosure.md), [Tabs usage rules](tabs.md), [Search usage rules](search.md), [Slider usage rules](slider.md), [Meter usage rules](meter.md), [Toast usage rules](toast.md), [Popover usage rules](popover.md), [Dialog usage rules](dialog.md), [Sheet usage rules](sheet.md), [Menu usage rules](menu.md), [Table usage rules](table.md), [Link usage rules](link.md), [Hover card usage rules](hover-card.md), [Spinner usage rules](spinner.md), [Combobox usage rules](combobox.md), [Breadcrumb usage rules](breadcrumb.md), [Kbd usage rules](kbd.md), [Code usage rules](code.md), [Base utilities usage rules](base.md), [Grid usage rules](grid.md), and [Typography usage rules](typography.md).

`button.tsx`, `field.tsx`, `search.tsx`, `slider.tsx`, `tabs.tsx`, `toast.tsx`, `popover.tsx`, `dialog.tsx`, `sheet.tsx`, `menu.tsx`, `text-link.tsx`, `hover-card.tsx`, `table.tsx`, and `combobox.tsx` start with `"use client"`, so a React Server Components app can render `Button`, the field controls, `Search`, `Slider`, `Tabs`, `Toaster`, `Popover`, `Dialog`, `AlertDialog`, `Sheet`, the Menu parts, `TextLink`, `HoverCard`, `HoverCardLink`, `TableWrap`, `Table`, `TableSort`, `Combobox`, and `ComboboxOption` from a server component. `Tabs`, `Toaster`, `Menu`, `Table`, and `Combobox` wire themselves in a layout effect. `Badge`, the Alert parts, the Avatar parts, `Separator`, `Skeleton`, the Card parts, `Disclosure`, `Meter`, `Progress`, `Spinner`, `Breadcrumb`, `Kbd`, `Code`, and `Pre` hold no state and no handlers, so `badge.tsx`, `alert.tsx`, `avatar.tsx`, `separator.tsx`, `skeleton.tsx`, `card.tsx`, `disclosure.tsx`, `meter.tsx`, `spinner.tsx`, `breadcrumb.tsx`, `kbd.tsx`, `code.tsx`, `layout.tsx`, and `typography.tsx` have no directive. `SkipLink` renders its anchor through a client leaf that reads the router link from `OddProvider`. A component that holds the disclosure's state puts the directive in its own file. The overlays need the directive because they hand their trigger and their buttons its wiring through context.

When `Button` or `TableSort` renders a `button`, it defaults to `type="button"` unless you pass `type`, so it does not submit a form around it. Pass `type="submit"` or `type="reset"` to opt in. A Menu item is always `type="button"`.

## Render a button or a link

```tsx
import { Button } from "odd-design/react";

<Button variant="primary">Save</Button>;
<Button href="/docs" current>Docs</Button>;
<Button iconOnly label="Duplicate deck"><CopyIcon aria-hidden="true" /></Button>;
<Button tooltip="Anyone with the link can view it">Publish</Button>;
```

`Button` renders an `a` when you pass `href`, and a `button` otherwise. The element always has the class `odd-button`, plus the words in `className`. `Button` writes every attribute in the table, and passing that attribute yourself is a type error that names the prop (`ODD-REACT-001`).

| Prop | What the element gets |
| --- | --- |
| `href` | The element is an `a`, through the router link from `OddProvider`. Without `href`, it is a `button`. |
| `variant` | `data-variant` |
| `size` | `data-size` |
| `iconOnly` with `label` | `data-icon-only`, and a tooltip with the label that names the button through `aria-labelledby`. `label` is required with `iconOnly`, and a blank one throws `ODD-BUTTON-008` outside production. |
| `tooltip` | A tooltip that `aria-describedby` points at, merged with yours. Only a button with visible text takes it. |
| `disabled` | `aria-disabled="true"`, and a click that does nothing. Only on a `button`. |
| `busy` | `aria-busy="true"`, the busy ring, and a click that does nothing. Only on a `button`. |
| `current` | `aria-current="page"`. Only on a link. |
| `newTab` | `target="_blank"`, `rel="noopener"`, and the hidden words "(opens in a new tab)". Only on a link. |
| `type` | On a `button`, `type`. It defaults to `button`, and takes `submit` and `reset`. |
| `command` and `commandfor` | The invoker command for a target elsewhere on the page. |
| Any other prop | The attribute with the same name. |

The tooltip renders as a `span.odd-tooltip` right after the button, and `interestfor` opens it on hover or keyboard focus. Where the browser lacks `interestfor`, `Button` installs the fallback itself while it shows a tooltip, so the app needs no `enhance()` call for it. [Tooltip usage rules](tooltip.md) has the compiled HTML.

`aria-expanded`, `aria-controls`, and `aria-describedby` pass through, for a `Button` your own code uses as a toggle. `Button` writes `aria-haspopup` only as a `Menu` trigger, so passing it is a type error (`ODD-REACT-001`).

## Disable a button

Set `disabled`. The button gets `aria-disabled="true"`, so it stays focusable and stays in the tab order. A click calls `preventDefault` and does not call your `onClick`. So a `type="submit"` button does not submit its form, by click or by Enter in a field. `busy` does the same while it draws the busy ring.

```tsx
<Button type="submit" disabled>
  Pay
</Button>
```

`Button` never renders the `disabled` attribute. A link takes neither `disabled` nor `busy`. Render a button when the control should not navigate.

## Build a field

```tsx
import { Input, Select, Textarea } from "odd-design/react";

<Input label="Email" type="email" required hint="We never share it." error={error} />;
<Textarea label="Notes" rows={4} />;
<Select label="Format" defaultValue="standard">
  <option value="standard">Standard</option>
  <option value="extended">Extended</option>
</Select>;
```

`Input`, `Textarea`, and `Select` each render a whole field. `label` is required.

| Prop | What the field gets |
| --- | --- |
| `label` | `label.odd-label`, paired with the control by `for` and `id` |
| `hideLabel` | The label stays for a screen reader and gets `odd-visually-hidden` |
| `hint` | `p.odd-hint`, which the control's `aria-describedby` points at |
| `error` | `p.odd-error` while it is set, `aria-invalid="true"` on the control, and the error in `aria-describedby` |
| `id` | The control's id. The component generates one when you leave it out, and derives the label, hint, and error ids from it. |
| `className` | The outer `div.odd-field` |
| `ref` and any other prop | The control |

The rendered field is `div.odd-field > label.odd-label + input.odd-input + p.odd-hint + p.odd-error`, with `textarea.odd-textarea` or `select.odd-select` in place of the input. An `aria-describedby` you pass is merged ahead of the hint and the error. `Input` takes the text types (`text`, `email`, `password`, `search`, `tel`, `url`, `number`, and the date and time types). A checkbox is `Checkbox`, and a range is `Slider`.

## Show an error

Pass `error` while the value is invalid, and leave it unset otherwise. The field renders the message, marks the control invalid, and adds the message to its description. It keeps no hidden error in the tree, because a screen reader still announces a hidden element that `aria-describedby` references.

```tsx
<Input label="Email" type="email" required error={valid ? undefined : "Enter an email address like name@example.com."} />
```

`aria-invalid`, `aria-label`, and `aria-labelledby` on a field control are type errors (`ODD-REACT-001`), because the field writes them.

## Disable a field with disabled

A field control is the reverse of `Button`. Set `disabled` on `Input`, `Textarea`, or `Select`. The field styles only `:disabled`.

```tsx
<Input label="Owner" defaultValue="you" disabled />
```

`aria-disabled` on a field control is a type error (`ODD-REACT-001`). It leaves the control editable, and the control does not look disabled.

## Build a checkbox, a switch, or a radio group

```tsx
import { Checkbox, RadioGroup, Segmented, Switch } from "odd-design/react";

<Checkbox label="Weekly digest" defaultChecked />;
<Switch label="Compact grid" checked={compact} onChange={toggle} />;
<RadioGroup
  label="Visibility"
  defaultValue="public"
  options={[
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
  ]}
  onValueChange={setVisibility}
/>;
<Segmented label="View" defaultValue="grid" options={views} onValueChange={setView} />;
```

| Component | Element |
| --- | --- |
| `Checkbox` | `label.odd-choice > input[type=checkbox]` and the label |
| `Switch` | `label.odd-choice > input.odd-switch[type=checkbox][role=switch]` and the label |
| `RadioGroup` | `fieldset.odd-stack > legend.odd-label` and one `label.odd-choice > input[type=radio]` per option |
| `Segmented` | `fieldset.odd-segmented > legend` and one `label > input[type=radio]` per option |

`Checkbox` and `Switch` pass every other prop, and `ref`, to the input. `type`, `role`, and `aria-disabled` on them are type errors (`ODD-REACT-001`). `RadioGroup` and `Segmented` take the legend as `label` and the options as a list, because each option writes a radio that shares the group's `name`. Leave `name` out and the group generates one, so two groups never merge by accident. `defaultValue` takes only a value from `options`. `onValueChange` gets the chosen option's value. `disabled` on the group disables the fieldset, and `disabled` on an option disables its radio. Start a choice with `defaultChecked` or `defaultValue`, or control a checkbox or a switch with `checked` and `onChange`.

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

The spinner is decoration, like a skeleton block. Set `aria-busy="true"` on the region that is loading, and put the loading words beside the spinner or in an `odd-visually-hidden` span inside that region. Remove the spinner, the words, and `aria-busy` when the content arrives. No checker reads the region. Children, `role`, `aria-label`, `aria-labelledby`, and `aria-busy` on `Spinner` are type errors (`ODD-SPINNER-002`). A `Button` that is working takes `busy` and draws its own ring, so don't put a `Spinner` inside it.

## Link to a page

```tsx
import { OddProvider, TextLink } from "odd-design/react";
import { Link } from "react-router";

<OddProvider link={({ href, ...rest }) => <Link to={href} {...rest} />}>
  <p>
    Read the <TextLink href="/guide">setup guide</TextLink>, or open <TextLink href="/projects" current>Projects</TextLink>.
  </p>
  <TextLink href="https://example.com/changelog" newTab tooltip="What changed this week">Changelog</TextLink>
</OddProvider>;
```

`TextLink` renders an `a` with the class `odd-link`. It looks like every bare `a`. `href` is a required prop. `current` writes `aria-current="page"`, and the current link takes the text color and drops its underline. `newTab` writes `target="_blank"` and `rel="noopener"`, and adds the hidden words "(opens in a new tab)". `tooltip` renders a tooltip after the link that `aria-describedby` points at, merged with yours, as on `Button`. The export is `TextLink`, not `Link`, so it does not clash with the `Link` that routers export.

`OddProvider` takes the router's link component as `link`. `TextLink`, `Button` with `href`, `CardLink`, the links in a `Breadcrumb`, `HoverCardLink`, and `SkipLink` render through it, with `href` and the anchor props, so a router does a client-side navigation with no `as` prop on each link. Without a provider, each renders a plain `a`.

`aria-current`, `target`, `rel`, `interestfor`, and `role` on `TextLink` are type errors (`ODD-REACT-001`). `aria-disabled` and `disabled` are type errors that print `ODD-LINK-003`, because a link that can't be followed is plain text. A link that looks like a button is a `Button` with `href`.

## Show a preview on hover

```tsx
import { HoverCard, HoverCardLink } from "odd-design/react";

<HoverCard preview={<DeckPreview deck={winner} />}>
  <p>Last week’s winner was <HoverCardLink href={`/decks/${winner.id}`}>{winner.name}</HoverCardLink>.</p>
</HoverCard>;
```

`HoverCard` wraps the block that holds the link, such as a paragraph or a list item, and renders `div.odd-hover-card` with `popover="hint"` right after the block. It never renders inside the block, because a `div` inside a `p` closes the paragraph in the HTML parser and breaks hydration. Each `HoverCardLink` in the block renders an `a.odd-link` through the router link, with `interestfor` pointed at the card, so the card opens on hover or keyboard focus and stays open while the pointer is over it. Everything in the card must also be on the page the link opens. `HoverCard` installs the interest fallback itself where the browser lacks `interestfor`. A `HoverCardLink` outside a `HoverCard` throws, because it names no card. `preview` is required.

## Suggest values as someone types

```tsx
import { Combobox, ComboboxOption } from "odd-design/react";

<Combobox label="City" name="city" hint="Type to filter.">
  <ComboboxOption>Amsterdam</ComboboxOption>
  <ComboboxOption disabled>Atlantis</ComboboxOption>
  <ComboboxOption>Berlin</ComboboxOption>
</Combobox>;
```

`Combobox` renders a whole field: `label.odd-label`, `div.odd-combobox` with the input and `div.odd-combobox-list`, and the hint and error as on `Input`. It writes the input's `role="combobox"`, `aria-controls`, `aria-autocomplete`, and `aria-expanded`, names the list by the label, and runs `enhanceCombobox`. Each `ComboboxOption` renders `div.odd-combobox-option[role=option]`, and `disabled` writes `aria-disabled="true"`. Typing filters the options by prefix, the arrows move between them and skip disabled ones, and Enter or a click chooses. Focus stays in the input. `ref`, `value`, `onChange`, and every other input prop go to the input, and `className` goes to the field.

The list ends with a hidden, disabled "No results" option that `Combobox` renders itself, with the list's id plus `-empty`. When the built-in filter matches nothing, `enhanceCombobox` shows it. The module only toggles its `hidden`, so it never adds a node to the list React owns.

When your code filters, pass `filter="manual"`, render the results as children, and render a disabled "No results" option yourself when a search finds nothing. `Combobox` then renders no empty option of its own. A choice writes the option's text into the input and fires one `onChange` on a controlled input. Put an `onClick` on each option to act on a choice, since Enter clicks the active option. `role`, `aria-controls`, `aria-autocomplete`, `aria-expanded`, and `aria-activedescendant` on `Combobox`, and `aria-selected` and `aria-disabled` on `ComboboxOption`, are type errors (`ODD-REACT-001`). A blank `label` throws `ODD-COMBOBOX-006` outside production, because it names the list too.

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

`Breadcrumb` renders a `nav` with the class `odd-breadcrumb`. Pass `aria-label` or `aria-labelledby`. One of them is a required prop. Write the `ol`, the `li`s, and the `TextLink`s yourself. Each level with a page of its own is a `TextLink`, and the last one has `aria-current="page"`. A level with no page of its own is plain text in its `li`. CSS draws the slashes between crumbs, which screen readers do not read, and a long trail wraps.

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

<Disclosure name="faq" summary="Does it need JavaScript?" defaultOpen>
  No. Sharing a name makes the group exclusive.
</Disclosure>;
```

`Disclosure` renders `details.odd-disclosure`, then `summary` as its direct child with the `summary` prop inside it, then a `div` with the children, which is the answer. `name` and `onToggle` are the native `details` props. Every disclosure that shares a `name` joins one exclusive group, so opening one closes the others with no script. Start at most one item of a group open. When two start open, WebKit closes both, and Firefox and Chromium keep the first.

`defaultOpen` sets the first state, and the browser owns every toggle after that. `open` is a type error (`ODD-REACT-001`), because a controlled `open` goes stale after the first click and React cannot reopen that item. A render with a different `defaultOpen` writes it again, so keep it constant for an item, such as `defaultOpen={index === 0}`. To read the state, listen with `onToggle` and read `event.newState`.

```tsx
"use client";
import { useState } from "react";
import { Disclosure } from "odd-design/react";

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Disclosure name="faq" summary={question} onToggle={(event) => setOpen(event.newState === "open")} className={open ? "faq-open" : undefined}>
      {answer}
    </Disclosure>
  );
}
```

`event.newState === "open"` covers both directions, so the state also turns `false` when the user collapses the item. Keep the summary's text non-empty, and keep links and buttons out of it. An empty summary takes its name from the answer, and a link in the summary follows its `href` and leaves the panel closed. The browser reports the open state, so the summary needs no `aria-expanded`. System `data-` attributes on `Disclosure`, such as `data-tone`, are type errors (`ODD-REACT-002`). `Disclosure` holds no state and no handlers, so it renders in a server component.

## Build tabs

```tsx
import { Tabs } from "odd-design/react";

<Tabs
  label="Deck view"
  defaultValue="cards"
  onValueChange={setView}
  tabs={[
    { value: "cards", label: "Cards", content: <CardList /> },
    { value: "stats", label: "Stats", content: <DeckStats /> },
    { value: "notes", label: "Notes", content: <DeckNotes />, disabled: true },
  ]}
/>;
```

`Tabs` renders `div.odd-tabs` with the tablist as its direct child, named by `label`, and one panel per tab after it. Each tab is a `button` with `type="button"`, `role="tab"`, and an `aria-controls` that names its panel, and each panel is named by its tab through `aria-labelledby`. The ids hang off `id`, as `${id}-tab-0` and `${id}-panel-0`, and `Tabs` generates the base when `id` is absent. `Tabs` runs `enhanceTabs` on itself, so arrows, Home, End, clicks, and the panel switch work with no other call, and an `enhance()` call elsewhere in the app does not wire the set twice. `orientation="vertical"` switches to Up and Down, and `activation="manual"`, for panels that are slow to fill, makes the arrows move focus and Enter or Space choose. A `disabled` tab takes native `disabled`, and the arrows skip it.

`defaultValue` is the first choice, typed from each `value` in `tabs`, so a value that names no tab is a type error. Without it, the first enabled tab is chosen. After mount, `enhanceTabs` owns the choice, the tab stop, and the panels. A render with a different `defaultValue` moves the choice until the user chooses a tab. After that, `Tabs` shows the user's choice again after every render, as a native checkbox ignores a new `defaultChecked` once the user has changed it. A remount starts again from `defaultValue`. There is no controlled `value`. `onValueChange` gets the chosen tab's `value`. To choose a tab from code, call `.click()` on its button through the forwarded ref, so the tab stop moves too.

`label` is required, because an unnamed tablist gives a screen reader nothing to announce. `aria-orientation` and `data-activation` on `Tabs` are type errors (`ODD-REACT-001`), because `orientation` and `activation` write them on the tablist. System `data-` attributes on `Tabs`, such as `data-tone`, are type errors (`ODD-REACT-002`). [Tabs usage rules](tabs.md) has the codes for hand-written markup.

## Build a search

```tsx
import { Search } from "odd-design/react";

<Search label="Filter cards" value={query} onChange={(event) => setQuery(event.target.value)} />;
<Search label="Search the docs" name="q" onSubmit={submit} />;
```

`Search` renders `search.odd-search`, the search landmark, with a visually hidden label, the magnifier `svg` with `aria-hidden="true"`, and `input.odd-input[type=search]`. `label` is required and names the field. `ref`, `value`, `onChange`, and every other input prop go to the input, and `className` goes to the `search` element. Without `onSubmit`, Enter does nothing, so a filter reads `onChange`. With `onSubmit`, the parts sit in `form.odd-search` inside the `search` element, and Enter submits it. `type` and `aria-label` on `Search` are type errors (`ODD-REACT-001`).

## Build a slider

```tsx
"use client";
import { useState } from "react";
import { Slider } from "odd-design/react";

export function CopiesField() {
  const [copies, setCopies] = useState(3);
  return (
    <Slider
      label="Copies per card"
      min={1}
      max={4}
      value={copies}
      onChange={(event) => setCopies(event.currentTarget.valueAsNumber)}
      hint="Most formats allow up to 4."
      showValue
      formatValue={(value) => `${value} of 4`}
    />
  );
}
```

`Slider` renders a whole field around `input.odd-slider[type=range]`, with the label, hint, and error as on `Input`. It writes `type` itself. `min`, `max`, `step`, `value` with `onChange`, `defaultValue`, and `ref` go to the input. The arrow keys, Page Up and Page Down, and Home and End come from the browser.

`showValue` renders `output.odd-stat-value` after the slider, paired with it by `for`, and keeps it in step as the thumb moves, controlled or not. `formatValue` writes the text, and it defaults to the number. Show the value when it matters. WebKit draws no filled track, so the thumb and that text are what show the value there. Disable a slider with `disabled`. `type` and `aria-disabled` on `Slider` are type errors (`ODD-REACT-001`), and so is a system `data-` attribute such as `data-tone` (`ODD-REACT-002`).

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

## Lay out a page

```tsx
import { Grid, GridItem, Row, Scope, SkipLink, Stack, VisuallyHidden } from "odd-design/react";

<>
  <SkipLink href="#main">Skip to content</SkipLink>
  <Grid as="main" id="main">
    <GridItem span={8}>
      <Stack as="section" aria-labelledby="queue-title">…</Stack>
    </GridItem>
    <GridItem span={4}>
      <Row>…</Row>
    </GridItem>
  </Grid>
  <Scope chrome="glass" palette="aurora" mode="dark">…</Scope>
  <VisuallyHidden>4 of 5 stars</VisuallyHidden>
</>;
```

| Component | Element | Props it owns |
| --- | --- | --- |
| `Stack` | `div.odd-stack`, or the tag in `as` | None. The gap is the stylesheet's default. |
| `Row` | `div.odd-row`, or the tag in `as` | None. The gap is the stylesheet's default. |
| `Grid` | `div.odd-grid`, or `main`, `section`, `ul`, or `ol` in `as` | None. |
| `GridItem` | `div`, or `section`, `article`, or `li` in `as` | `span`, a whole number from 1 to 12, as `data-span`. Omit it for the full row. |
| `VisuallyHidden` | `span.odd-visually-hidden`, or `p` in `as` | None. |
| `SkipLink` | `a.odd-skip-link` through the router link | `href`, typed `` `#${string}` ``, so a link that is not a fragment is a type error (`ODD-SKIP-001`). |
| `Scope` | `div.odd-scope`, or the tag in `as` | `chrome`, `palette`, and `mode`, all three required (`ODD-SCOPE-001`). |

`Stack`, `Row`, and `Grid` take no `gap` and no `style`. Each one keeps the gap its stylesheet sets. `role` and system `data-` attributes, such as `data-span`, are type errors on every one of them (`ODD-REACT-001` and `ODD-REACT-002`). Other props, such as `id` and `aria-labelledby`, go to the element.

## Set type

```tsx
import { Eyebrow, Heading, Muted } from "odd-design/react";

<Eyebrow tone="primary">Season 4</Eyebrow>;
<Heading level={2} size="xl">Your collection</Heading>;
<Muted>Saved 2 minutes ago</Muted>;
```

`Heading` renders `h{level}.odd-heading`. `level` is required, because only the app knows where the heading sits in the outline. `size` takes `xs`, `sm`, `lg`, `xl`, `2xl`, or `hero`, and its absence is md (`ODD-TYPOGRAPHY-002`). `Eyebrow` renders `p.odd-eyebrow`, or a `span` with `as="span"`. `tone` takes `primary` or `foreground`, and its absence is muted (`ODD-TYPOGRAPHY-003`). `Muted` renders `p.odd-muted`, or a `span` with `as="span"`.

## Read a type error

The type error names the code and the fix. The table lists what each mistake prints.

| Mistake | The error prints |
| --- | --- |
| `role`, or an attribute `Button` writes, such as `aria-label`, `aria-disabled`, or `aria-current` | `ODD-REACT-001` |
| A system `data-` attribute on `Button`, such as `data-tone` or `data-variant` | `ODD-REACT-002` |
| `iconOnly` with no `label` | "Property 'label' is missing" |
| `label` without `iconOnly` | "Property 'iconOnly' is missing" |
| `current` or `newTab` without `href` | "Property 'href' is missing" |
| `disabled` or `busy` with `href` | "Types of property 'disabled' are incompatible" |
| `aria-disabled`, `aria-invalid`, `aria-label`, or `aria-labelledby` on `Input`, `Textarea`, or `Select` | `ODD-REACT-001` |
| `type`, `role`, or `aria-disabled` on `Checkbox` or `Switch` | `ODD-REACT-001` |
| A field control with no `label` | "Property 'label' is missing" |
| A `RadioGroup` or `Segmented` `defaultValue` that is not one of its options | "is not assignable to type" with the option values |
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
| `role`, `aria-current`, `target`, `rel`, or `interestfor` on `TextLink`, or `interestfor` on `HoverCardLink` | `ODD-REACT-001` |
| A system `data-` attribute on `TextLink`, such as `data-variant` | `ODD-REACT-002` |
| `HoverCard` with no `preview` | "Property 'preview' is missing" |
| `role`, `aria-controls`, `aria-autocomplete`, `aria-expanded`, or `aria-activedescendant` on `Combobox`, or `aria-selected` or `aria-disabled` on `ComboboxOption` | `ODD-REACT-001` |
| A system `data-` attribute on `Combobox` or `ComboboxOption`, such as `data-tone` | `ODD-REACT-002` |
| A `filter` other than `manual` on `Combobox` | `'"auto"' is not assignable to type '"manual"'` |
| A system `data-` attribute on `Breadcrumb`, such as `data-tone` | `ODD-BREADCRUMB-004` |
| `aria-hidden` on `Kbd` | `ODD-KBD-002` |
| A system `data-` attribute on `Kbd`, such as `data-size` | `ODD-KBD-003` |
| A system `data-` attribute on `Code` or `Pre`, such as `data-size` | `ODD-CODE-002` |
| `onClick` or `tabIndex` on `Card` | `ODD-CARD-004` |
| A system `data-` attribute on `Card` other than `data-span`, such as `data-tone` | `ODD-CARD-006` |
| A system `data-` attribute on `CardLink` or `CardFooter`, such as `data-interactive` | `ODD-CARD-007` |
| `open` on `Disclosure` | `ODD-REACT-001` |
| A system `data-` attribute on `Disclosure`, such as `data-tone` | `ODD-REACT-002` |
| `aria-orientation` or `data-activation` on `Tabs` | `ODD-REACT-001` |
| A system `data-` attribute on `Tabs`, such as `data-tone` | `ODD-REACT-002` |
| `Tabs` with no `label` | "Property 'label' is missing" |
| A `defaultValue` that names no tab in `tabs` | `Type '"notes"' is not assignable to type '"cards" \| "stats" \| undefined'` |
| `type` or `aria-label` on `Search`, or `type` or `aria-disabled` on `Slider` | `ODD-REACT-001` |
| A system `data-` attribute on `Search` or `Slider`, such as `data-tone` | `ODD-REACT-002` |
| A system `data-` attribute on `Meter` or `Progress` other than `data-tone`, such as `data-size` | `ODD-METER-003` |
| A system `data-` attribute on `Toaster`, such as `data-tone` | `ODD-TOAST-004` |
| Children on `Toaster` | `not assignable to type 'undefined'` |
| `role`, `popover`, `aria-label`, or `aria-labelledby` on `Popover` | `ODD-REACT-001` |
| `role`, `open`, `closedby`, `aria-label`, `aria-labelledby`, or `aria-describedby` on `Dialog`, `AlertDialog`, or `Sheet`, or `data-side` on `Sheet` | `ODD-REACT-001` |
| A system `data-` attribute on `Popover`, `Dialog`, `AlertDialog`, or `Sheet`, such as `data-tone` | `ODD-REACT-002` |
| `Dialog`, `AlertDialog`, or `Sheet` with no `title`, or `AlertDialog` with no `description` | "Property 'title' is missing" or "Property 'description' is missing" |
| `dismissible` on `AlertDialog` | `Type 'true' is not assignable to type 'undefined'` |
| `role`, `popover`, `aria-label`, or `aria-labelledby` on `Menu`, or `role`, `type`, `aria-disabled`, `aria-checked`, or `aria-keyshortcuts` on a Menu item | `ODD-REACT-001` |
| A system `data-` attribute on `Menu` or a Menu item, such as `data-tone` | `ODD-REACT-002` |
| `Menu` with no `label` | "Property 'label' is missing" |
| `aria-haspopup` on `Button` | `ODD-REACT-001` |
| `tabIndex`, `aria-label`, or `aria-labelledby` on `TableWrap` with no `role` | `ODD-TABLE-002` |
| `role="region"` on `TableWrap` with no `aria-label` and no `aria-labelledby` | `ODD-TABLE-003` |
| A system `data-` attribute on `TableWrap`, `Table`, or `TableSort`, such as `data-numeric` | `ODD-TABLE-004` |
| `aria-sort` on `TableSort` | `ODD-TABLE-005` |
| `Toaster` without `popover` or `aria-label`, `Breadcrumb` without `aria-label` or `aria-labelledby`, `AvatarGroup` without `role`, `Skeleton` or `Spinner` without `aria-hidden`, `CardLink` or `TextLink` without `href` | TypeScript's missing property error |
| A `Toaster` `popover` other than `manual`, a `TableWrap` `role` other than `region`, an `Avatar` or `AvatarGroup` `role` other than `img` or `group`, a `Separator` `role` other than `separator`, or a `Skeleton` or `Spinner` `aria-hidden` other than `"true"` | The allowed value |
| A `variant`, `size`, `aria-current`, `tone`, `aria-orientation`, `shape`, or `side` value outside the contract | The allowed values |

TypeScript shortens a long type in an error. Set `noErrorTruncation` in `tsconfig.json` to see the whole message.

Some rules are not type errors. `Button` picks the element from `href`, so you cannot write an anchor without `href` (`ODD-BUTTON-009`) or a button with `href` (`ODD-BUTTON-010`). Those two codes apply to a raw `a` or `button` with the `odd-button` class. Each field control, `Badge`, each Alert part, each Avatar part, `Separator`, `Skeleton`, each Card part, `Disclosure`, `Tabs`, `Search`, `Slider`, `Meter`, `Progress`, `Toaster`, `Popover`, `Dialog`, `AlertDialog`, `Sheet`, each Menu part, `TableWrap`, `Table`, `TableSort`, `TextLink`, `Spinner`, `Combobox`, `ComboboxOption`, `Breadcrumb`, `Kbd`, `Code`, and `Pre` picks its own element too, so `ODD-FIELD-001`, `ODD-CHOICE-001`, `ODD-BADGE-001`, `ODD-ALERT-001`, `ODD-AVATAR-001`, `ODD-SEPARATOR-001`, `ODD-SKELETON-001`, `ODD-CARD-001`, `ODD-DISCLOSURE-001`, `ODD-DISCLOSURE-002`, `ODD-TABS-001`, `ODD-TABS-002`, `ODD-TABS-004`, `ODD-SEARCH-001`, `ODD-SLIDER-001`, `ODD-METER-001`, `ODD-TOAST-001`, `ODD-POPOVER-001`, `ODD-DIALOG-001`, `ODD-SHEET-001`, `ODD-MENU-001`, `ODD-TABLE-001`, `ODD-LINK-001`, `ODD-HOVER-CARD-001`, `ODD-SPINNER-001`, `ODD-COMBOBOX-001`, `ODD-BREADCRUMB-001`, `ODD-KBD-001`, and `ODD-CODE-001` apply only to raw markup. the links and buttons in a card (`ODD-CARD-003`), the input and the icon of a search (`ODD-SEARCH-002` and `ODD-SEARCH-003`), a `target` without `rel` on a link (`ODD-LINK-007`), the input and the list of a combobox (`ODD-COMBOBOX-002` and `ODD-COMBOBOX-003`), the list of a breadcrumb (`ODD-BREADCRUMB-003`), and a misspelled `data-` name are not type errors either. The [runtime checker](runtime.md) reports each of these.

## Open a dialog, a sheet, or a popover

`Dialog`, `AlertDialog`, `Sheet`, and `Popover` each take a `trigger`, which is a `Button`. The overlay renders the trigger, then its panel right after it, and gives the trigger `command` and `commandfor` with the panel's id. Inside the panel, a `Button` with `command="close"` closes that overlay and needs no `commandfor`. The browser owns open, the top layer, Escape, focus return, and the trigger's expanded state, so none of them takes an `open` prop. To open one from code, call `showModal()` or `showPopover({ source })` on its `ref`.

```tsx
import { Button, Checkbox, Popover } from "odd-design/react";

<Popover trigger={<Button>Filters</Button>} title="Filter decks">
  <Checkbox label="Legal only" defaultChecked />
  <Button size="sm" command="close">Apply</Button>
</Popover>;
```

`Popover` renders `div.odd-popover` with `popover="auto"`, and the trigger gets `command="toggle-popover"`. With a `title`, the popover is `role="dialog"`, named by its title on a `p.odd-eyebrow`, which is right for a popover that holds controls. Without a `title`, it takes no role and no name, which is right for one that only shows text. The title and the children stack inside it. A `Button` with `command="close"` inside gets `command="hide-popover"`. To read the open state, set it from `onToggle` with `event.newState`. A blank `title` throws `ODD-POPOVER-004` outside production.

```tsx
import { Button, Dialog } from "odd-design/react";

<Dialog
  trigger={<Button variant="danger">Delete deck…</Button>}
  title="Delete “Midnight Control”?"
  description="This removes the deck and its 14 saved versions."
  dismissible
  actions={<><Button command="close">Close</Button><Button variant="danger" command="close">Delete</Button></>}
/>;
```

`Dialog` renders `dialog.odd-dialog`, and the trigger gets `command="show-modal"`. The dialog holds `div.odd-dialog-body`, which holds the title as `h2.odd-dialog-title`, the `description` as a muted paragraph, the children, and the `actions` in `div.odd-dialog-actions`. The dialog is named by its title through `aria-labelledby` and described by the `description` through `aria-describedby`. `headingLevel` changes the title's level. `dismissible` writes `closedby="any"`, so a click outside closes it too, and installs the `closedby` fallback where the browser lacks it, with no `enhance()` call. Focus starts on the first focusable control, so put the safe choice first. React writes no `autofocus` attribute.

To submit, pass `onSubmit`. The body becomes a `form` with `method="dialog"` and an id, and a `Button` with `type="submit"` in the actions gets `form` with that id. Read the button's `value` from `returnValue` in `onClose`. A blank `title` throws `ODD-DIALOG-002` outside production.

`AlertDialog` is a `Dialog` with `role="alertdialog"`, for a decision the user must make. Its `description` is required, and it takes no `dismissible`, so a click outside never dismisses the decision. Escape still cancels it.

To open a dialog from a control in another part of the page, such as a `MenuItem`, give the dialog an `id` and the opener `command="show-modal"` and `commandfor` with that id. That is the one id you write, because it says which dialog to open.

```tsx
import { Button, Input, Sheet } from "odd-design/react";

<Sheet trigger={<Button>Filters</Button>} title="Filters" side="start" dismissible onSubmit={apply}
  actions={<Button type="submit" variant="primary">Show 12 decks</Button>}>
  <Input label="Name" name="name" />
</Sheet>;
```

`Sheet` renders `dialog.odd-sheet` and takes every `Dialog` prop. Its three rows are `div.odd-sheet-header` with the title and an icon-only Close button, `div.odd-sheet-body` with the `description` and the children, and `div.odd-sheet-footer` with the `actions`. `closeLabel` names the Close button and its tooltip, and defaults to "Close". Focus starts on the Close button. With no `side`, the sheet slides in from the end edge. `side` takes `"start"`, `"top"`, or `"bottom"`, and `start` and the end follow the writing direction. With `onSubmit`, the body is the `form`, and a submit `Button` in the footer gets `form` with its id.

`command` takes `show-modal`, `close`, `request-close`, `show-popover`, `hide-popover`, `toggle-popover`, or a custom command that starts with `--`. Pass `command` and `commandfor` in lowercase. `@types/react` does not declare them, so `Button` declares them.

## Open a menu

```tsx
import { Button, Menu, MenuCheckboxItem, MenuItem, MenuRadioGroup, MenuRadioItem, MenuSeparator } from "odd-design/react";

<Menu label="Deck actions" trigger={<Button>Deck actions</Button>}>
  <MenuItem shortcut="Control+D" onClick={duplicate}>Duplicate</MenuItem>
  <MenuItem disabled>Merge</MenuItem>
  <MenuSeparator />
  <MenuCheckboxItem defaultChecked={prices} onClick={(event) => setPrices(event.currentTarget.getAttribute("aria-checked") === "true")}>
    Show prices
  </MenuCheckboxItem>
  <MenuRadioGroup label="Sort by">
    <MenuRadioItem defaultChecked>Name</MenuRadioItem>
    <MenuRadioItem>Card count</MenuRadioItem>
  </MenuRadioGroup>
  <MenuSeparator />
  <MenuItem tone="danger" command="show-modal" commandfor="delete-deck">Delete deck…</MenuItem>
</Menu>;
```

`Menu` renders its `trigger`, then `div.odd-menu` with `popover="auto"` and `role="menu"`, named by `label`, and runs `enhanceMenu` on it. The trigger gets `command="toggle-popover"`, `commandfor`, and `aria-haspopup="menu"`. The browser opens and closes the menu, as it does a popover. `enhanceMenu` adds the menu keyboard, and ArrowDown or ArrowUp on the trigger opens it at the first or last item. `label` is required, because an icon-only trigger's name does not carry over to the menu, and a blank one throws `ODD-MENU-003` outside production.

Each item renders `button.odd-menu-item` with `type="button"` and its role. `MenuItem` is a `menuitem`, which closes the menu when chosen. `tone="danger"` writes `data-tone`, and `shortcut` takes the `aria-keyshortcuts` value, such as `"Control+D"`, and shows it as a keycap, with Control as Ctrl. `MenuCheckboxItem` and `MenuRadioItem` stay open when chosen. `MenuRadioGroup` and `MenuGroup` render a visible label and a `role="group"` named by it, and one radio in a `MenuRadioGroup` is checked at a time. `MenuSeparator` renders `hr.odd-separator`. `disabled` writes `aria-disabled="true"`, which keeps the item reachable, and choosing it does nothing.

`enhanceMenu` owns `aria-checked` after mount. `defaultChecked` sets the first state, and by the time an item's `onClick` runs it has already flipped, so read the new value there. After the user chooses, a render with a new `defaultChecked` does not undo the choice, as a native checkbox ignores a new `defaultChecked` once the user has changed it. `Menu` writes the user's choices back after every render. A remount starts again from `defaultChecked`. To open a dialog from an item, give the dialog an `id` and the item `command="show-modal"` and `commandfor`. `Menu` takes no `open` prop. To open it from code, call `showPopover({ source })` on its `ref`.

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
