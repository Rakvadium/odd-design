# Grid usage rules

This code applies to `odd-grid`. Shared codes are in [General usage rules](general.md).

```html
<main class="odd-grid" style="--gap: var(--space-5)">
  <section class="odd-card" data-span="8" aria-labelledby="queue-title">…</section>
  <section class="odd-card" data-span="4" aria-labelledby="notes-title">…</section>
  <section class="odd-card" aria-labelledby="history-title">…</section>
</main>
```

`odd-grid` has 12 columns. `data-span` on a direct child sets how many it takes, and a child without one spans the row. The grid measures its own width, not the viewport. Under 64rem, a child that spans 5 or fewer takes half the row. Under 40rem, every child takes the full row. `--gap` sets the gutter. Spans do not reorder children, so the reading order matches the source. The grid has no React part. Write it as native markup, and put `data-span` on a `Card` or any other child.

## ODD-GRID-001

Fails when a direct child of `odd-grid` has a `data-span` other than a whole number from 1 to 12.

The grid reads only `data-span="1"` to `data-span="12"`. Any other value, such as `13`, `0`, `half`, or `span 4`, leaves the child spanning the full row with no warning.

Set `data-span` to a whole number from 1 to 12. For a child that spans the full row, remove `data-span`.
