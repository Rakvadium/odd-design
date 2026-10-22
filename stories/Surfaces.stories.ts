import type { Meta, StoryObj } from "@storybook/html-vite";
import { icons } from "./icons.ts";

const meta = { title: "Components/Surfaces" } satisfies Meta;

export default meta;
type Story = StoryObj;

export const Card: Story = {
  render: () => `<div style="display:grid; gap: var(--space-5); grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr))">
    <article class="odd-card">
      <p class="odd-eyebrow">Static</p>
      <h3 class="odd-card-title">Midnight Control</h3>
      <p class="odd-muted">A slow, grindy list that wins on card advantage.</p>
      <div class="odd-card-footer">
        <span class="odd-badge" data-tone="success">Legal</span>
        <span class="odd-badge">60 cards</span>
      </div>
    </article>
    <article class="odd-card" data-interactive>
      <p class="odd-eyebrow">Interactive</p>
      <h3 class="odd-card-title"><a class="odd-card-link" href="#">Ember Aggro</a></h3>
      <p class="odd-muted">The whole card is clickable. Screen readers hear a single link.</p>
      <div class="odd-card-footer">
        <span class="odd-badge" data-tone="warning">Rotating soon</span>
      </div>
    </article>
  </div>`,
};

export const Badge: Story = {
  render: () => `<div class="odd-stack">
    <div class="odd-row">
      <span class="odd-badge">Neutral</span>
      <span class="odd-badge" data-tone="primary">Primary</span>
      <span class="odd-badge" data-tone="success">Legal</span>
      <span class="odd-badge" data-tone="warning">Rotating</span>
      <span class="odd-badge" data-tone="danger">Banned</span>
      <span class="odd-badge" data-tone="info">New set</span>
    </div>
    <div class="odd-row">
      <span class="odd-badge" data-solid>Neutral</span>
      <span class="odd-badge" data-solid data-tone="primary">Primary</span>
      <span class="odd-badge" data-solid data-tone="success">Legal</span>
      <span class="odd-badge" data-solid data-tone="warning">Rotating</span>
      <span class="odd-badge" data-solid data-tone="danger">Banned</span>
      <span class="odd-badge" data-solid data-tone="info">New set</span>
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
    <button class="odd-button" data-variant="danger" commandfor="confirm-delete" command="show-modal">${icons.trash} Delete deck…</button>
    <dialog class="odd-dialog" id="confirm-delete" aria-labelledby="confirm-delete-title" closedby="any">
      <div class="odd-dialog-body">
        <h2 class="odd-dialog-title" id="confirm-delete-title">Delete “Midnight Control”?</h2>
        <p class="odd-muted">This removes the deck and its 14 saved versions. You can’t undo this.</p>
        <div class="odd-dialog-actions">
          <button class="odd-button" commandfor="confirm-delete" command="close" autofocus>Close</button>
          <button class="odd-button" data-variant="danger" commandfor="confirm-delete" command="close">Delete</button>
        </div>
      </div>
    </dialog>
  </div>`,
};

export const Disclosure: Story = {
  render: () => `<div style="max-inline-size: 36rem">
    <details class="odd-disclosure" name="faq" open>
      <summary>What’s the difference between chrome and palette?</summary>
      <div>Chrome is shape, type, depth, and motion. Palette is color. You can pair any chrome with any palette.</div>
    </details>
    <details class="odd-disclosure" name="faq">
      <summary>Does it need JavaScript?</summary>
      <div>No. These are native details elements, and sharing a name makes the group exclusive.</div>
    </details>
    <details class="odd-disclosure" name="faq">
      <summary>Does it respect reduced motion?</summary>
      <div>Yes. Durations drop to zero and press transforms switch off.</div>
    </details>
  </div>`,
};
