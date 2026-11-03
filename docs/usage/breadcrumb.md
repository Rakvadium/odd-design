# Breadcrumb usage rules

These codes apply to `odd-breadcrumb`. Shared codes are in [General usage rules](general.md).

In React, render `Breadcrumb` from `odd-design/react` with `items`. It writes the name, the `ol`, the links, and `aria-current="page"` on the last one, so ODD-BREADCRUMB-002 and ODD-BREADCRUMB-003 cannot happen. [The React guide](react.md#show-where-the-page-sits) covers the props.

```tsx
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Archived" }, { label: "Alerts", href: "/settings/archived/alerts" }]} />
```

The component compiles to this HTML:

```html
<nav class="odd-breadcrumb" aria-label="Breadcrumb">
  <ol>
    <li><a class="odd-link" href="/">Home</a></li>
    <li>Archived</li>
    <li><a class="odd-link" href="/settings/archived/alerts" aria-current="page">Alerts</a></li>
  </ol>
</nav>
```

A breadcrumb is the trail from the top of the site to the page you are on. It is a `nav` with a name, around an `ol` with one `li` per level. The `ol` and `li` need no class. Each level with a page of its own is an `odd-link`. The last crumb is the page you are on, with `aria-current="page"`, which the link draws in the text color without an underline. A level with no page of its own is plain text in its `li`. The slashes between crumbs are drawn by CSS and hidden from screen readers, and a long trail wraps onto more lines. In React, `Breadcrumb` writes the `nav`, the `ol`, and one `li` per item in `items`. An item with an `href` is a `TextLink`.

Mark only the last crumb with `aria-current="page"`. No checker reads that deep, so a trail without it passes, and its last crumb then looks like every other link. A wrong `aria-current` value on a crumb is ODD-LINK-005.

## ODD-BREADCRUMB-001

Fails when `odd-breadcrumb` is not on a `nav`.

A `nav` is a navigation landmark. A `div` with the class draws the same trail, but the accessibility tree starts at the list instead of at `navigation "Breadcrumb"`, so a screen reader's landmark list skips it, in Firefox and WebKit.

Move the class onto a `nav` with a name. In React, use `Breadcrumb`, which renders a `nav`.

## ODD-BREADCRUMB-002

Fails when a `nav` with `odd-breadcrumb` has no `aria-label` and no `aria-labelledby`.

A page often has two navigations: the main one and the breadcrumb. An unnamed breadcrumb is listed as a bare `navigation` beside `navigation "Primary"`, so a screen reader user can't tell which is which.

Set `aria-label`, such as "Breadcrumb", or point `aria-labelledby` at a visible heading. In React, `Breadcrumb` is named "Breadcrumb" unless `label` says otherwise.

## ODD-BREADCRUMB-003

Fails when a `nav` with `odd-breadcrumb` has no `ol` as a direct child.

`breadcrumb.css` draws the trail on `nav > ol > li`. A `ul` keeps its bullets and draws no slashes, in Firefox and WebKit. Links placed straight in the `nav` lose the list, so a screen reader no longer says how many levels the trail has. An `ol` says the levels come in order.

Put the crumbs in an `ol` directly inside the `nav`, with one `li` per level. In React, `Breadcrumb` writes the list from `items`.

## ODD-BREADCRUMB-004

Fails when `odd-breadcrumb` has a system `data-` attribute.

`breadcrumb.css` reads no `data-` attribute. `data-tone="primary"` draws the same trail. An app `data-` attribute, the appearance axes, and the headless allowlist pass.

Remove the attribute. The current crumb is the link with `aria-current="page"`. In React, a system `data-` attribute such as `data-tone` on `Breadcrumb` is a type error.
