import type { Meta, StoryObj } from "@storybook/html-vite";

const meta = { title: "Components/Typography" } satisfies Meta;

export default meta;
type Story = StoryObj;

const heading = /* html */ `<h2 class="odd-heading" data-size="lg">Quarterly report</h2>`;

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: "Every `data-size` on `odd-heading`, largest first. A heading without `data-size` is md. The level follows the outline, not the size.",
      },
    },
  },
  render: () => /* html */ `<div class="odd-stack" style="--gap: var(--space-4); max-inline-size: 48rem">
    <h2 class="odd-heading" data-size="hero">hero · Quarterly report</h2>
    <h2 class="odd-heading" data-size="2xl">2xl · Quarterly report</h2>
    <h2 class="odd-heading" data-size="xl">xl · Quarterly report</h2>
    <h2 class="odd-heading" data-size="lg">lg · Quarterly report</h2>
    <h2 class="odd-heading">md · Quarterly report</h2>
    <h2 class="odd-heading" data-size="sm">sm · Quarterly report</h2>
    <h2 class="odd-heading" data-size="xs">xs · Quarterly report</h2>
  </div>`,
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story: "Each `odd-eyebrow` tone above a heading. Without `data-tone` the eyebrow is muted.",
      },
    },
  },
  render: () => /* html */ `<div class="odd-stack" style="--gap: var(--space-6); max-inline-size: 48rem">
    <div class="odd-stack" style="--gap: var(--space-1)"><p class="odd-eyebrow">Muted</p>${heading}</div>
    <div class="odd-stack" style="--gap: var(--space-1)"><p class="odd-eyebrow" data-tone="primary">Primary</p>${heading}</div>
    <div class="odd-stack" style="--gap: var(--space-1)"><p class="odd-eyebrow" data-tone="foreground">Foreground</p>${heading}</div>
  </div>`,
};
