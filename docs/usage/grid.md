# Grid usage rules

This code applies to `odd-grid`. Shared codes are in [General usage rules](general.md).

In React, render `Grid` and `GridItem` from `odd-design/react`. `span` takes a whole number from 1 to 12, so ODD-GRID-001 is a type error.

```tsx
<Grid as="main">
  <GridItem as="section" span={8} aria-labelledby="queue-title">…</GridItem>
  <GridItem as="section" span={4} aria-labelledby="notes-title">…</GridItem>
  <GridItem as="section" aria-labelledby="history-title">…</GridItem>
</Grid>
```

The components compile to this HTML:

```html
<main class="odd-grid">
  <section data-span="8" aria-labelledby="queue-title">…</section>
  <section data-span="4" aria-labelledby="notes-title">…</section>
  <section aria-labelledby="history-title">…</section>
</main>
```

`odd-grid` has 12 columns. `data-span` on a direct child sets how many it takes, and a child without one spans the row. The grid measures its own width, not the viewport. Under 64rem, a child that spans 5 or fewer takes half the row. Under 40rem, every child takes the full row. `--gap` sets the gutter in hand-written HTML, and `Grid` keeps the default. Spans do not reorder children, so the reading order matches the source.

## ODD-GRID-001

Fails when a direct child of `odd-grid` has a `data-span` other than a whole number from 1 to 12.

The grid reads only `data-span="1"` to `data-span="12"`. Any other value, such as `13`, `0`, `half`, or `span 4`, leaves the child spanning the full row with no warning.

Set `data-span` to a whole number from 1 to 12. For a child that spans the full row, remove `data-span`.
