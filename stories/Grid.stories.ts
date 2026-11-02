import type { Meta, StoryObj } from "@storybook/html-vite";

const meta = { title: "Components/Grid" } satisfies Meta;

export default meta;
type Story = StoryObj;

const cell = (span?: number) =>
  /* html */ `<div${span === undefined ? "" : ` data-span="${span}"`} style="padding: var(--space-2); border-radius: var(--radius-control); background: var(--muted); color: var(--foreground); font-size: var(--text-sm)">${span === undefined ? "no data-span" : `data-span ${span}`}</div>`;

const spans = Array.from({ length: 12 }, (_, index) => index + 1);

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Every `data-span` from 1 to 12, each beside the span that fills its row, then a child with no `data-span`. The grid measures its own width. The second grid is under 64rem, so a span of 5 or fewer takes half the row. The third is under 40rem, so every child takes the full row.",
      },
    },
  },
  render: () => /* html */ `<div class="odd-stack" style="--gap: var(--space-6)">
    <section class="odd-stack" aria-labelledby="grid-spans-title">
      <h2 class="odd-heading" data-size="sm" id="grid-spans-title">data-span 1 to 12</h2>
      <div class="odd-grid" style="--gap: var(--space-2)">
        ${spans.map((span) => cell(span) + (span < 12 ? cell(12 - span) : "")).join("")}
        ${cell()}
      </div>
    </section>
    <section class="odd-stack" aria-labelledby="grid-half-title">
      <h2 class="odd-heading" data-size="sm" id="grid-half-title">Under 64rem</h2>
      <div class="odd-grid" style="--gap: var(--space-2); max-inline-size: 48rem">${cell(3)}${cell(3)}${cell(5)}${cell(8)}</div>
    </section>
    <section class="odd-stack" aria-labelledby="grid-full-title">
      <h2 class="odd-heading" data-size="sm" id="grid-full-title">Under 40rem</h2>
      <div class="odd-grid" style="--gap: var(--space-2); max-inline-size: 30rem">${cell(4)}${cell(4)}${cell(8)}</div>
    </section>
  </div>`,
};
