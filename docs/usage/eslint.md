# Check HTML with ESLint

Add the plugin so ESLint reports a bad button, field, or choice in an HTML file or a template. Codes and fixes are in [Button usage rules](button.md), [Field usage rules](field.md), [Choice usage rules](choice.md), and [General usage rules](general.md).

## Add the plugin

Install `@html-eslint/parser` at `0.67.0`. The plugin entry is `odd-design/eslint`.

```js
import htmlParser from "@html-eslint/parser";
import odd from "odd-design/eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.html"],
    languageOptions: {
      parser: htmlParser,
    },
  },
  {
    files: ["**/*.{html,js,ts}"],
    plugins: { odd },
    rules: {
      "odd/usage": "error",
      "odd/usage-incomplete": "warn",
      "odd/disable-reason": "error",
    },
  },
]);
```

`odd/usage` reports a contract mistake. `odd/usage-incomplete` warns when a value is not static. `odd/disable-reason` reports a disable comment that names an `odd/` rule and gives no reason.

The HTML parser covers `.html` files. Your JS parser covers a template in a `.js` or `.ts` file. Both need to be in the `files` list above.

## Mark a template

The plugin checks a template tagged `html`, and a template with `/* html */` before the opening backtick. Put the comment on the template, with no comment between it and the backtick.

```ts
const save = /* html */ `<button class="odd-button">Save</button>`;
```

```ts
const save = html`<button class="odd-button">Save</button>`;
```

A bare template is not checked. If it contains an `odd-` class, `odd/usage` reports `ODD-STATIC-002` on the opening backtick. Tag it `html`, or add the comment.

## Check JSX

The plugin also checks JSX. Add your `.jsx` and `.tsx` files to the plugin's `files` list. Your JS parser has to read JSX, as `@typescript-eslint/parser` does, or `@babel/eslint-parser` with its `jsx` plugin.

```js
{
  files: ["**/*.{jsx,tsx}"],
  plugins: { odd },
  rules: {
    "odd/usage": "error",
    "odd/usage-incomplete": "warn",
    "odd/disable-reason": "error",
  },
}
```

The plugin checks a lowercase element, such as `<button>`, like the same element in HTML. It reads `className` as `class`. It reads each value the way React renders it.

- A string, a number, and a template literal with no `${...}` are literal values.
- On a `data-` or `aria-` attribute, `{true}` and `{false}` are the strings `true` and `false`. So `data-icon-only={false}` reports `ODD-BUTTON-004`.
- On any other attribute, `{true}` sets the attribute and `{false}` leaves it out.
- `{null}` and `{undefined}` leave the attribute out.
- With nothing between its tags, an element reads its `children` prop as its children. A literal `children="Close"` is text, so on an `odd-button` element with `data-icon-only` it reports `ODD-BUTTON-014`. The plugin cannot read a computed `children`, such as `children={label}`, and reports nothing for it.
- Any other expression is not static, and neither is a `{...props}` spread. On an `odd-button` element, `odd/usage-incomplete` warns `ODD-STATIC-001` on a spread, and on a computed value that a button rule reads, such as `data-variant={tone}`.
- A computed `className` keeps the string literals inside it. `className={cn("odd-button", active && "is-active")}` still runs the button rules, and warns `ODD-STATIC-001` on `className`.

### The Button from odd-design/react

The plugin checks `<Button>` as the element it renders when `Button` is imported from `odd-design/react`. An alias, such as `import { Button as OddButton } from "odd-design/react"`, counts too. A `Button` that you declare yourself is not checked.

Every imported `Button` gets the class `odd-button`, plus the words in its `className`. The table shows how its other props map to the element. The mapping comes from the `Button` entry of `WRAPPERS` in `src/js/usage/contract.ts`.

| Button prop | What the element gets |
| --- | --- |
| `href` | The element is an `a`. Without `href`, or with `href={undefined}`, it is a `button`. A computed `href`, such as `href={url}`, can render either. The plugin then checks an `a` with the `href` and a `button` without it, and reports each finding that both give. On that element, `odd/usage-incomplete` also warns `ODD-STATIC-001`. |
| `variant` | `data-variant` |
| `size` | `data-size` |
| `iconOnly` | `data-icon-only`. `iconOnly={false}` leaves it out. |
| `data-variant`, `data-size`, `data-icon-only` | Nothing. `Button` sets these attributes from `variant`, `size`, and `iconOnly`, so it drops a raw one. |
| `children` | The children, read as on a lowercase element. |
| Any other prop | The attribute with the same name. |

So `<Button disabled>` reports `ODD-BUTTON-007`, and `<Button href="#" aria-disabled="true">` reports `ODD-BUTTON-013`.

With a computed `href`, `<Button href={url} disabled>` still reports `ODD-BUTTON-007`, because both elements give it. `<Button href={url} aria-current="page">` gives only the warning, because the `button` reports `ODD-BUTTON-012` and the `a` does not.

### The Field parts from odd-design/react

The plugin checks each Field part imported from `odd-design/react` as the element it renders. The mapping comes from the part's entry of `WRAPPERS` in `src/js/usage/contract.ts`.

| Part | Element |
| --- | --- |
| `Field` | `div` with `odd-field` |
| `Label` | `label` with `odd-label` |
| `Input` | `input` with `odd-input` |
| `Textarea` | `textarea` with `odd-textarea` |
| `Select` | `select` with `odd-select` |
| `Hint` | `p` with `odd-hint` |
| `FieldError` | `p` with `odd-error` |

Each part adds the words in its `className`. Its `children` are the children, read as on a lowercase element. Every other prop is the attribute with the same name. So `<FieldError id="email-error" hidden>` reports `ODD-FIELD-002`, and `<Input id="owner" aria-disabled="true">` reports `ODD-FIELD-003`.

### The Choice parts from odd-design/react

The plugin checks each Choice part the same way, from its entry of `WRAPPERS`.

| Part | Element |
| --- | --- |
| `Choice` | `label` with `odd-choice` |
| `Switch` | `input` with `odd-switch` |
| `Segmented` | `fieldset` with `odd-segmented` |

So `<Switch type="radio" role="switch">` reports `ODD-CHOICE-002`, and `<Choice aria-disabled="true">` reports `ODD-CHOICE-003`.

### Badge from odd-design/react

The plugin checks `Badge` as a `span` with `odd-badge`, from its entry of `WRAPPERS`. `tone` is read as `data-tone`, and `solid` as `data-solid` with an empty value. `solid={false}` leaves it out. A raw `data-tone` or `data-solid` gives nothing. `Badge` sets these attributes from `tone` and `solid`, so it drops a raw one, and its type rejects one. Every other prop is the attribute with the same name.

So `<Badge tone="sucess">` reports `ODD-BADGE-002`, `<Badge data-tone="sucess">` reports nothing, and `<Badge data-variant="danger">` reports `ODD-BADGE-004`. A computed `tone`, such as `<Badge tone={toneOf[status]}>`, gives the `ODD-STATIC-001` warning, the same as a computed `variant` on `Button`.

### The Alert parts from odd-design/react

The plugin checks `Alert` as a `div` with `odd-alert`, and `AlertTitle` as a `p` with `odd-alert-title`, from their entries of `WRAPPERS`. `tone` is read as `data-tone`. A raw `data-tone` on `Alert` gives nothing. `Alert` sets that attribute from `tone`, so it drops a raw one, and its type rejects one. Every other prop is the attribute with the same name.

So `<Alert tone="neutral">` reports `ODD-ALERT-002`, `<Alert role="status">` and `<Alert aria-live="polite">` report `ODD-ALERT-003`, `<Alert data-variant="primary">` reports `ODD-ALERT-004`, and `<AlertTitle data-tone="info">` reports `ODD-ALERT-005`. A computed `tone`, such as `<Alert tone={toneOf[state]}>`, gives the `ODD-STATIC-001` warning, the same as a computed `tone` on `Badge`.

### The Avatar parts from odd-design/react

The plugin checks `Avatar` as a `span` with `odd-avatar`, and `AvatarGroup` as a `div` with `odd-avatar-group`, from their entries of `WRAPPERS`. `size` is read as `data-size`. A raw `data-size` on `Avatar` gives nothing. `Avatar` sets that attribute from `size`, so it drops a raw one, and its type rejects one. Every other prop is the attribute with the same name.

So `<Avatar size="md">` reports `ODD-AVATAR-002`, `<Avatar role="presentation">` and `<AvatarGroup aria-label="Team">` report `ODD-AVATAR-003`, `<Avatar role="img">AR</Avatar>` and `<AvatarGroup role="group">` report `ODD-AVATAR-004`, `<Avatar data-tone="info">` reports `ODD-AVATAR-005`, and `<AvatarGroup data-size="sm">` reports `ODD-AVATAR-006`. A computed `aria-label` counts as a name. A computed `size` or `role` gives the `ODD-STATIC-001` warning. The plugin does not read the `img` inside an avatar, so an `img` with no `alt` is left to the accessibility checker.

### Separator from odd-design/react

The plugin checks `Separator` as an `hr` with `odd-separator`, from its entry of `WRAPPERS`. It maps no props, so every prop is the attribute with the same name.

So `<Separator aria-orientation="verticle">` and `<Separator data-orientation="vertical">` report `ODD-SEPARATOR-002`, `<Separator role="none">` and `<Separator aria-hidden="true">` report `ODD-SEPARATOR-003`, and `<Separator data-tone="danger">` reports `ODD-SEPARATOR-004`. A computed `aria-orientation` or `role` gives the `ODD-STATIC-001` warning. The plugin does not read a separator's parent, so a vertical separator outside an `odd-row` passes.

### Skeleton from odd-design/react

The plugin checks `Skeleton` as a `div` with `odd-skeleton`, from its entry of `WRAPPERS`. `shape` is read as `data-shape`. A raw `data-shape` gives nothing. `Skeleton` sets that attribute from `shape`, so it drops a raw one, and its type rejects one. Every other prop is the attribute with the same name.

So `<Skeleton aria-hidden="true" shape="circle">` reports `ODD-SKELETON-002`, `<Skeleton />` and `<Skeleton aria-hidden>` report `ODD-SKELETON-003`, `<Skeleton aria-hidden="true">Loading</Skeleton>` and `<Skeleton aria-hidden="true" aria-busy="true">` report `ODD-SKELETON-004`, and `<Skeleton aria-hidden="true" data-size="lg">` reports `ODD-SKELETON-005`. A bare `aria-hidden` is read as empty, which hides nothing. A computed `shape` gives the `ODD-STATIC-001` warning. A spread gives that warning too, and `ODD-SKELETON-003` then stays quiet, because the spread may hold `aria-hidden`. The plugin does not read a skeleton's parent, so a block with no busy region passes.

### Card from odd-design/react

The plugin checks `Card` as an `article` with `odd-card`, `CardLink` as an `a` with `odd-card-link`, and `CardFooter` as a `div` with `odd-card-footer`, from their entries of `WRAPPERS`. `interactive` on `Card` is read as `data-interactive`. A raw `data-interactive` gives nothing. `Card` sets that attribute from `interactive`, so it drops a raw one, and its type rejects one. Every other prop is the attribute with the same name. The plugin reads a card's children, so a `CardLink` in the title counts as the card's link, even with a computed `href`.

So `<Card interactive>` with no `CardLink`, a `CardLink` in a `Card` without `interactive`, and a second link or button in an interactive card report `ODD-CARD-003`. `<Card onClick={open} tabIndex={0}>` reports `ODD-CARD-004` twice. `<CardLink>` without `href` reports `ODD-CARD-005`. `<Card data-tone="success">` reports `ODD-CARD-006`, and `data-span` passes. `<CardLink href="#" data-interactive>` and `<CardFooter data-tone="warning">` report `ODD-CARD-007`. A raw `<section className="odd-card">` gets the same card rules. The check stops at a nested card. A child component, such as `<Card interactive><DeckTitle /></Card>`, hides what it renders, so a missing link stays quiet and a second control still reports. A computed `interactive` gives the `ODD-STATIC-001` warning. The plugin does not read a card's parent, so a `CardLink` outside any card passes.

### Disclosure from odd-design/react

The plugin checks `Disclosure` as a `details` with `odd-disclosure`, from its entry of `WRAPPERS`. Every prop is the attribute with the same name. The plugin reads the disclosure's direct children, and the children of a fragment count as direct.

So a `Disclosure` whose question is a `div` or a `button`, or whose `summary` sits inside a `div`, reports `ODD-DISCLOSURE-002`. A `summary` placed after the answer passes. A raw `<div className="odd-disclosure">` reports `ODD-DISCLOSURE-001` alone. `<Disclosure data-tone="info">` reports `ODD-DISCLOSURE-003`, and `data-state` passes. A child component, such as `<Disclosure><FaqQuestion /><div>No.</div></Disclosure>`, or an expression child hides what it renders, so a missing summary stays quiet. A spread gives the `ODD-STATIC-001` warning. With no written children, `ODD-DISCLOSURE-002` then stays quiet, because the spread may hold `children`. Written children win over the spread, so `<Disclosure {...props}><div>Question</div></Disclosure>` still reports `ODD-DISCLOSURE-002`. A computed `open` gives no warning, so `open={open}` with `onToggle` passes.

### Tabs from odd-design/react

The plugin checks `Tabs` as a `div` with `odd-tabs`, from its entry of `WRAPPERS`. Every prop is the attribute with the same name. The plugin reads the direct children for the tablist, and the children of a fragment count as direct. It reads every element inside the set for the tabs, and it stops at a nested tab set.

So a `Tabs` whose tablist sits inside a `div` reports `ODD-TABS-002`. A panel placed before the tablist passes. `aria-orientation` or `data-activation` on `Tabs` reports `ODD-TABS-003`, and on the tablist it passes. A `div` with `role="tab"`, or a tab `button` with no `aria-controls`, reports `ODD-TABS-004`. A raw `<section className="odd-tabs">` reports `ODD-TABS-001`. `<Tabs data-tone="info">` reports `ODD-TABS-005`, and `data-state` passes. A child component, such as `<Tabs><DeckTabList /></Tabs>`, a computed `role`, or a spread with no `role` hides the tablist, so a missing tablist stays quiet. A spread on a tab hides its `aria-controls`, so only a tab that is not a `button` still reports.

### Search from odd-design/react

The plugin checks `Search` as a `search` with `odd-search`, from its entry of `WRAPPERS`. Every prop is the attribute with the same name. The plugin reads the direct children for the input and the icon, and the children of a fragment count as direct. An `Input` counts as an `input` with `odd-input`.

So a `Search` whose `Input` sits inside a `div` or a `form`, a raw `input` with no `odd-input`, or an `Input` with `type="text"` reports `ODD-SEARCH-002`. A `Search` with no `svg`, with its `svg` inside a `span`, or with an `svg` that lacks `aria-hidden="true"` reports `ODD-SEARCH-003`. A bare `aria-hidden` reads as empty, so it reports too. `<Search onSubmit={submit}>` reports `ODD-SEARCH-004`. A raw `<div className="odd-search">` reports `ODD-SEARCH-001` alone, and `<search><form className="odd-search">` is checked like `Search`. `<Search data-tone="info">` reports `ODD-SEARCH-005`. A child component, such as an icon from an icon library, or an expression child hides what it renders, so `ODD-SEARCH-002` and `ODD-SEARCH-003` both stay quiet on that search. A computed `className` or `type` on the input, a computed `aria-hidden` on the icon, or a spread that leaves the attribute out also stays quiet. A computed `className` still reports when the input's `type` is missing or not `search`.

### Slider from odd-design/react

The plugin checks `Slider` as an `input` with `odd-slider`, from its entry of `WRAPPERS`. Every prop is the attribute with the same name, so `type` is read as written.

So `<Slider>` with no `type`, `<Slider type="number">`, and a raw `<input className="odd-slider">` with no `type` report `ODD-SLIDER-002`. `<Slider type="range" aria-disabled="true">` reports `ODD-SLIDER-003`, and `<Slider type="range" data-tone="info">` reports `ODD-SLIDER-004`. A raw `<div className="odd-slider">` reports `ODD-SLIDER-001`. A computed `type`, such as `type={kind}`, gives the `ODD-STATIC-001` warning.

### Meter and Progress from odd-design/react

The plugin checks `Meter` as a `meter` with `odd-meter`, and `Progress` as a `progress` with `odd-progress`, from their entries of `WRAPPERS`. `tone` is read as `data-tone`. A raw `data-tone` gives nothing. Both parts set that attribute from `tone`, so they drop a raw one, and their types reject one. Every other prop is the attribute with the same name.

So `<Meter tone="primary">` reports `ODD-METER-002`, and so does a raw `<progress className="odd-progress" data-tone="neutral">`. `<Progress data-size="sm">` reports `ODD-METER-003`. A raw `<div className="odd-progress">` or `<progress className="odd-meter">` reports `ODD-METER-001`. A computed `tone`, such as `<Meter tone={toneOf[kind]}>`, gives the `ODD-STATIC-001` warning, the same as a computed `tone` on `Badge`. The plugin does not read `low` and `high` beside `tone`, or the `odd-stat` around a bar.

### Other components

The plugin cannot see what another component renders. A component with an `odd-` class, such as `<Link className="odd-button">`, gets one `ODD-STATIC-001` warning on the element and no button rules. An `odd-` class that is not in the registry still reports `ODD-CLASS-001`. `<UI.Button>`, with `UI` a namespace import, counts as another component.

## Write a literal attribute value

A `${...}` attribute value is not static. `odd/usage-incomplete` warns `ODD-STATIC-001` on that attribute. The plugin still checks the other attributes on the same element.

Write the value as a literal when you can. Leave the warning when the value has to stay computed.

## Write a reason on a disable

Put the reason after `--`.

```ts
// eslint-disable-next-line odd/usage -- the markup is third-party
```

`odd/disable-reason` reports `ODD-STATIC-003` when the reason is missing. With a reason, that rule reports nothing.
