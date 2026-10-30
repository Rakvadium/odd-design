# Base utilities usage rules

These codes apply to `odd-scope` and `odd-skip-link`. `odd-stack`, `odd-row`, `odd-muted`, and `odd-visually-hidden` have no codes. Shared codes are in [General usage rules](general.md).

```html
<a class="odd-skip-link" href="#main">Skip to content</a>
<main id="main" class="odd-stack" style="--gap: var(--space-5)">
  <div class="odd-row">
    <button class="odd-button" type="button">Save</button>
    <span class="odd-muted">Saved 2 minutes ago</span>
  </div>
  <section class="odd-scope" data-chrome="glass" data-palette="aurora" data-mode="dark">…</section>
</main>
```

`odd-stack` lays its children out in a column and `odd-row` in a wrapping row. `--gap` sets the space between them. `odd-muted` dims secondary text. `odd-visually-hidden` hides text until it takes focus. The skip link is the first focusable element on the page and slides in when it takes focus. `odd-scope` gives a subtree its own chrome, palette, and mode. None of these classes has a React part. Write them as native markup.

## ODD-SCOPE-001

Fails when `odd-scope` does not have all three of `data-chrome`, `data-palette`, and `data-mode`. The checker reports one finding for each missing attribute.

A chrome token that reads a palette color resolves on the element that sets `data-chrome`, as `base.css` notes. A scope that leaves out an axis takes that axis from the outer page, so its surfaces, borders, and glows can mix the two appearances.

Set the missing attributes on the `odd-scope` element. To keep an axis the same as the page, copy the outer value.

## ODD-SKIP-001

Fails when `odd-skip-link` is not on an `a`, when the `a` has no `href`, or when the `href` is not `#` followed by an id.

A skip link moves focus past the navigation to the main content. A `button` with the class does nothing on Enter. An `a` with no `href` takes no focus. `href="#"` scrolls to the top and leaves focus where it was, and a link to another page leaves the page.

Put `odd-skip-link` on an `a` whose `href` is `#` and the id of the main content, such as `#main`, and give that element the id.
