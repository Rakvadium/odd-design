# Shell usage rules

This code applies to `odd-shell-header` and `odd-shell-main`. Shared codes are in [General usage rules](general.md).

In React, render `Shell` from `odd-design/react` with a `title`, a `status`, and `actions`, and its `GridItem`s inside. It writes the header, the `h1`, the `role="status"` slot, the actions slot, and `main.odd-shell-main.odd-grid`. [Lay out a page](react.md#lay-out-a-page) covers the props.

```tsx
<Shell title="Orders" status={<Badge tone="success">Synced</Badge>} actions={<Button>Export</Button>}>
  <GridItem span={8}>…</GridItem>
</Shell>
```

The component compiles to the HTML below.

```html
<div class="odd-shell">
  <header class="odd-shell-header">
    <h1 class="odd-heading">Orders</h1>
    <div class="odd-shell-status" role="status"><span class="odd-badge" data-tone="success">Synced</span></div>
    <div class="odd-shell-actions"><button class="odd-button" type="button">New order</button></div>
  </header>
  <main class="odd-shell-main odd-grid">…</main>
</div>
```

`odd-shell` is a full-height page with a sticky header over a main area. The header holds a title, a status slot that takes the free space, and actions. Each slot may be empty or left out. Give the status slot `role="status"` when its changes should be announced. The main area is often an `odd-grid`. The shell has no React part. Write it as native markup.

## ODD-SHELL-001

Fails when `odd-shell-header` is not on a `header`, or `odd-shell-main` is not on a `main`.

A `header` at the top of the page is the banner landmark, and a `main` is the main landmark. A `div` with either class looks the same, but screen reader users who move by landmark find no banner and no main content.

Put `odd-shell-header` on a `header` and `odd-shell-main` on a `main`.
