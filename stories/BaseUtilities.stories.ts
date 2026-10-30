import type { Meta, StoryObj } from "@storybook/html-vite";

const meta = { title: "Components/Base Utilities" } satisfies Meta;

export default meta;
type Story = StoryObj;

const item = (label: string) => /* html */ `<span class="odd-badge">${label}</span>`;

const items = item("One") + item("Two") + item("Three");

export const Parts: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`odd-stack` and `odd-row` at two `--gap` values, `odd-muted` beside body text, text that only a screen reader reads, an `odd-skip-link` that slides in when Tab reaches it, and an `odd-scope` set to another chrome, palette, and mode than the page.",
      },
    },
  },
  render: (_, { globals }) => /* html */ `<div class="odd-stack" style="--gap: var(--space-6); max-inline-size: 48rem">
    <section class="odd-stack" aria-labelledby="base-stack-title">
      <h2 class="odd-heading" data-size="sm" id="base-stack-title">odd-stack</h2>
      <div class="odd-row" style="--gap: var(--space-8); align-items: start">
        <div class="odd-stack" style="--gap: var(--space-2)">${items}</div>
        <div class="odd-stack" style="--gap: var(--space-5)">${items}</div>
      </div>
      <p class="odd-muted">--gap: var(--space-2), then var(--space-5).</p>
    </section>
    <section class="odd-stack" aria-labelledby="base-row-title">
      <h2 class="odd-heading" data-size="sm" id="base-row-title">odd-row</h2>
      <div class="odd-row" style="--gap: var(--space-1)">${items}</div>
      <div class="odd-row" style="--gap: var(--space-6)">${items}</div>
      <p class="odd-muted">--gap: var(--space-1), then var(--space-6).</p>
    </section>
    <section class="odd-stack" aria-labelledby="base-muted-title">
      <h2 class="odd-heading" data-size="sm" id="base-muted-title">odd-muted</h2>
      <p>Upload finished. <span class="odd-muted">2 minutes ago</span></p>
    </section>
    <section class="odd-stack" aria-labelledby="base-hidden-title">
      <h2 class="odd-heading" data-size="sm" id="base-hidden-title">odd-visually-hidden</h2>
      <p><span aria-hidden="true">★★★★☆</span><span class="odd-visually-hidden">4 of 5 stars</span></p>
    </section>
    <section class="odd-stack" aria-labelledby="base-skip-title">
      <h2 class="odd-heading" data-size="sm" id="base-skip-title">odd-skip-link</h2>
      <div style="position: relative; overflow: hidden; padding: var(--space-8) var(--space-4) var(--space-4); border: var(--border-width) solid var(--border); border-radius: var(--radius-surface)">
        <a class="odd-skip-link" href="#base-skip-target">Skip to content</a>
        <nav class="odd-row" aria-label="Example"><a href="#base-skip-title">Home</a><a href="#base-skip-title">Reports</a><a href="#base-skip-title">Settings</a></nav>
        <p id="base-skip-target">Tab into this frame and the skip link appears above the links.</p>
      </div>
    </section>
    <section class="odd-stack" aria-labelledby="base-scope-title">
      <h2 class="odd-heading" data-size="sm" id="base-scope-title">odd-scope</h2>
      <div class="odd-scope odd-stack" data-chrome="${globals.chrome === "expressive" ? "glass" : "expressive"}" data-palette="${globals.palette === "aurora" ? "default" : "aurora"}" data-mode="${globals.mode === "dark" ? "light" : "dark"}" style="padding: var(--space-5); border-radius: var(--radius-surface)">
        <p>This box sets its own chrome, palette, and mode.</p>
        <div class="odd-row"><button class="odd-button" type="button" data-variant="primary">Save draft</button><button class="odd-button" type="button">Cancel</button></div>
      </div>
    </section>
  </div>`,
};
