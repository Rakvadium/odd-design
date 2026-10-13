import type { Meta, StoryObj } from "@storybook/html-vite";
import { icons } from "./icons.ts";

const meta = { title: "Components/Surfaces" } satisfies Meta;

export default meta;
type Story = StoryObj;

export const Card: Story = {
  render: () => `<div style="display:grid; gap: var(--space-5); grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr))">
    <article class="ds-card">
      <p class="ds-eyebrow">Static</p>
      <h3 class="ds-card-title">Midnight Control</h3>
      <p class="ds-muted">A slow, grindy list that wins on card advantage.</p>
      <div class="ds-card-footer">
        <span class="ds-badge" data-tone="success">Legal</span>
        <span class="ds-badge">60 cards</span>
      </div>
    </article>
    <article class="ds-card" data-interactive>
      <p class="ds-eyebrow">Interactive</p>
      <h3 class="ds-card-title"><a class="ds-card-link" href="#">Ember Aggro</a></h3>
      <p class="ds-muted">The whole card is clickable. Screen readers hear a single link.</p>
      <div class="ds-card-footer">
        <span class="ds-badge" data-tone="warning">Rotating soon</span>
      </div>
    </article>
  </div>`,
};

export const Badge: Story = {
  render: () => `<div class="ds-stack">
    <div class="ds-row">
      <span class="ds-badge">Neutral</span>
      <span class="ds-badge" data-tone="primary">Primary</span>
      <span class="ds-badge" data-tone="success">Legal</span>
      <span class="ds-badge" data-tone="warning">Rotating</span>
      <span class="ds-badge" data-tone="danger">Banned</span>
      <span class="ds-badge" data-tone="info">New set</span>
    </div>
    <div class="ds-row">
      <span class="ds-badge" data-solid>Neutral</span>
      <span class="ds-badge" data-solid data-tone="primary">Primary</span>
      <span class="ds-badge" data-solid data-tone="success">Legal</span>
      <span class="ds-badge" data-solid data-tone="warning">Rotating</span>
      <span class="ds-badge" data-solid data-tone="danger">Banned</span>
      <span class="ds-badge" data-solid data-tone="info">New set</span>
    </div>
  </div>`,
};

export const Dialog: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A native `<dialog>` opened with invoker commands (`commandfor` / `command`), so no JS is needed. `showModal()` traps focus, closes on Escape, makes the page behind it inert, and returns focus when it closes. `closedby=\"any\"` adds closing by clicking outside. It animates with `@starting-style`.",
      },
    },
  },
  render: () => `<div>
    <button class="ds-button" data-variant="danger" commandfor="confirm-delete" command="show-modal">${icons.trash} Delete deck…</button>
    <dialog class="ds-dialog" id="confirm-delete" aria-labelledby="confirm-delete-title" closedby="any">
      <div class="ds-dialog-body">
        <h2 class="ds-dialog-title" id="confirm-delete-title">Delete “Midnight Control”?</h2>
        <p class="ds-muted">This removes the deck and its 14 saved versions. You can’t undo this.</p>
        <div class="ds-dialog-actions">
          <button class="ds-button" commandfor="confirm-delete" command="close" autofocus>Close</button>
          <button class="ds-button" data-variant="danger" commandfor="confirm-delete" command="close">Delete</button>
        </div>
      </div>
    </dialog>
  </div>`,
};

export const Disclosure: Story = {
  render: () => `<div style="max-inline-size: 36rem">
    <details class="ds-disclosure" name="faq" open>
      <summary>What’s the difference between chrome and palette?</summary>
      <div>Chrome is shape, type, depth, and motion. Palette is color. You can pair any chrome with any palette.</div>
    </details>
    <details class="ds-disclosure" name="faq">
      <summary>Does it need JavaScript?</summary>
      <div>No. These are native details elements, and sharing a name makes the group exclusive.</div>
    </details>
    <details class="ds-disclosure" name="faq">
      <summary>Does it respect reduced motion?</summary>
      <div>Yes. Durations drop to zero and press transforms switch off.</div>
    </details>
  </div>`,
};
