# Toast usage rules

These codes apply to `odd-toaster`. Shared codes are in [General usage rules](general.md).

```html
<section class="odd-toaster" popover="manual" aria-label="Notifications"></section>
<script type="module">
  import { enhance, toast } from "odd-design/enhance";
  enhance();
  save.addEventListener("click", () => toast({ title: "Deck saved", tone: "success" }));
</script>
```

Write the region once per page, empty. `enhance()`, or `enhanceToaster(region)`, builds the list and a hidden polite live region inside it and opens it. `toast({ title, description, tone, duration, action })` shows a toast on the newest wired region still in the document, and throws when there is none. Only `toast()` writes `odd-toast` and its parts, so no rule covers them.

In React, render `Toaster` once, near the end of the app shell. It runs `enhanceToaster` on itself, and `toast()` from `odd-design/enhance` reaches it from any component or from code outside React.

```tsx
import { Button, Toaster } from "odd-design/react";
import { toast } from "odd-design/enhance";

<body>
  {children}
  <Toaster popover="manual" aria-label="Notifications" />
</body>;

<Button onClick={() => toast({ title: "Deck saved", description: "Midnight Control, version 15.", tone: "success" })}>Save</Button>;
```

## ODD-TOAST-001

Fails when `odd-toaster` is on an element other than `section`.

A `section` with an `aria-label` is a region landmark, so a screen reader can jump to it. A `div` with the same label is no landmark, and an `aside` is a complementary landmark, which is the wrong one.

Put `odd-toaster` on a `section`. In React, use `Toaster`.

## ODD-TOAST-002

Fails when `odd-toaster` has no `popover`, or a `popover` other than `manual`.

An auto or hint popover, including `popover=""`, closes on any click outside it and when a menu opens, and every toast inside closes with it. So `enhanceToaster` wires only a manual popover. With no `popover` or any other value, it leaves the region unwired and returns a cleanup that does nothing. `toast()` then throws `toast() found no toaster`, or shows the toast on another wired region.

Set `popover="manual"`. In React, `Toaster` requires it.

## ODD-TOAST-003

Fails when `odd-toaster` has no `aria-label`.

A `section` with no name is no landmark, so a screen reader cannot jump to the notifications.

Set `aria-label`, such as `Notifications`. In React, `Toaster` requires it.

## ODD-TOAST-004

Fails when `odd-toaster` has a system `data-*` attribute.

`toast.css` reads `data-tone` on each toast, not on the region, so `data-tone="success"` on the region leaves every toast's dot muted. The region reads no data attributes.

Remove the attribute, and pass `tone` to `toast()`. App data attributes, the appearance axes, and the headless allowlist stay allowed.
