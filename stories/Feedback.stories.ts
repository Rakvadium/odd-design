import type { Meta, StoryObj } from "@storybook/html-vite";
import { icons } from "./icons.ts";

const meta = { title: "Components/Feedback" } satisfies Meta;

export default meta;
type Story = StoryObj;

export const Alert: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Static alerts need no role. For a message that appears later, insert it into an existing `role=\"status\"` (or `role=\"alert\"` for errors) container so it's announced. Text is `--foreground` on a soft tint in every tone.",
      },
    },
  },
  render: () => /* html */ `<div class="odd-stack" style="max-inline-size: 40rem">
    <div class="odd-alert">
      ${icons.info}
      <div><p class="odd-alert-title">Drafts are private</p><p>Only you can see a deck until you publish it.</p></div>
    </div>
    <div class="odd-alert" data-tone="info">
      ${icons.info}
      <div><p class="odd-alert-title">New set available</p><p>“Ember Tide” cards are now in the gallery.</p></div>
    </div>
    <div class="odd-alert" data-tone="success">
      ${icons.check}
      <div><p class="odd-alert-title">Deck published</p><p>Midnight Control is live on your profile.</p></div>
    </div>
    <div class="odd-alert" data-tone="warning">
      ${icons.warning}
      <div><p class="odd-alert-title">Rotation is coming</p><p>Three of your decks lose legality on May 1. <a href="#">Review them</a>.</p></div>
    </div>
    <div class="odd-alert" data-tone="danger">
      ${icons.danger}
      <div><p class="odd-alert-title">Couldn’t save</p><p>You’re offline. Your changes are kept on this device.</p></div>
    </div>
  </div>`,
};

export const Progress: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`<progress>` for tasks, `<meter>` for measurements. Each one is named by its `<label>` or `aria-label`, and the value is also shown as text. A meter with `low`/`high`/`optimum` colors itself by range.",
      },
    },
  },
  render: () => /* html */ `<div class="odd-stack" style="--gap: var(--space-6); max-inline-size: 28rem">
    <div class="odd-stack" style="--gap: var(--space-3)">
      <div class="odd-stat">
        <label for="import">Importing decks</label><span class="odd-stat-value">40%</span>
        <progress class="odd-progress" id="import" value="40" max="100"></progress>
      </div>
      <div class="odd-stat">
        <label for="sync">Syncing collection</label><span class="odd-stat-value odd-muted">Waiting…</span>
        <progress class="odd-progress" id="sync"></progress>
      </div>
    </div>

    <div class="odd-stack" style="--gap: var(--space-3)" role="group" aria-labelledby="mix-title">
      <p class="odd-eyebrow" id="mix-title">Deck mix · 60 cards</p>
      <div class="odd-stat">
        <label for="units">Units</label><span class="odd-stat-value">24 <span class="odd-muted">(40%)</span></span>
        <meter class="odd-meter" id="units" min="0" max="60" value="24"></meter>
      </div>
      <div class="odd-stat">
        <label for="actions">Actions</label><span class="odd-stat-value">22 <span class="odd-muted">(37%)</span></span>
        <meter class="odd-meter" id="actions" min="0" max="60" value="22" data-tone="info"></meter>
      </div>
      <div class="odd-stat">
        <label for="assets">Assets</label><span class="odd-stat-value">14 <span class="odd-muted">(23%)</span></span>
        <meter class="odd-meter" id="assets" min="0" max="60" value="14" data-tone="success"></meter>
      </div>
    </div>

    <div class="odd-stack" style="--gap: var(--space-3)" role="group" aria-labelledby="storage-title">
      <p class="odd-eyebrow" id="storage-title">Storage, colored by range</p>
      ${[
        ["store-low", "Images", 0.32],
        ["store-mid", "Backups", 0.71],
        ["store-high", "Exports", 0.93],
      ]
        .map(
          ([id, label, v]) => /* html */ `<div class="odd-stat">
        <label for="${id}">${label}</label><span class="odd-stat-value">${Math.round(Number(v) * 100)}% used</span>
        <meter class="odd-meter" id="${id}" value="${v}" low="0.6" high="0.85" optimum="0"></meter>
      </div>`,
        )
        .join("")}
    </div>
  </div>`,
};

export const Skeleton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The loading region has `aria-busy=\"true\"` and says “Loading” in text. The blocks are `aria-hidden`. The pulse follows `--duration-slow`, so reduced motion stops it.",
      },
    },
  },
  render: () => /* html */ `<div style="display:grid; gap: var(--space-5); grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr))" aria-busy="true">
    <span class="odd-visually-hidden">Loading decks…</span>
    ${/* html */ `<article class="odd-card" aria-hidden="true">
      <div class="odd-row">
        <div class="odd-skeleton" data-shape="avatar"></div>
        <div class="odd-stack" style="--gap: var(--space-2); flex: 1">
          <div class="odd-skeleton" style="inline-size: 70%"></div>
          <div class="odd-skeleton" style="inline-size: 40%; block-size: 0.75em"></div>
        </div>
      </div>
      <div class="odd-skeleton" style="block-size: 5rem; border-radius: var(--radius-surface)"></div>
      <div class="odd-skeleton" style="inline-size: 90%"></div>
      <div class="odd-skeleton" style="inline-size: 60%"></div>
    </article>`.repeat(2)}
  </div>`,
};
