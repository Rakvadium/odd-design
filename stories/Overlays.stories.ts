import type { Meta, StoryObj } from "@storybook/html-vite";
import { icons } from "./icons.ts";

const meta = {
  title: "Components/Overlays",
  parameters: {
    docs: {
      description: {
        component:
          "Overlays built on the Popover API and `<dialog>`, opened by invoker commands and interest invokers with no JS. The browser provides the top layer, Escape, light dismiss, and focus return. Popovers anchor to their invoker through CSS anchor positioning and flip when they run out of room.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Tooltip: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Shown on hover or keyboard focus through `interestfor`, with the browser's show and hide delays. The icon-only buttons are named by their tooltips through `aria-labelledby`, so they keep a name where tooltips can't show. `Publish` points `aria-describedby` at its tooltip instead, because it already has a visible label.",
      },
    },
  },
  render: () => /* html */ `<div class="odd-row" style="padding-block-start: var(--space-8)">
    <button class="odd-button" data-variant="ghost" data-icon-only aria-labelledby="tip-copy" interestfor="tip-copy">${icons.copy}</button>
    <div class="odd-tooltip" id="tip-copy" popover="hint" role="tooltip">Duplicate deck</div>
    <button class="odd-button" data-variant="ghost" data-icon-only aria-labelledby="tip-share" interestfor="tip-share">${icons.share}</button>
    <div class="odd-tooltip" id="tip-share" popover="hint" role="tooltip">Share link</div>
    <button class="odd-button" data-variant="ghost" data-icon-only aria-labelledby="tip-delete" interestfor="tip-delete">${icons.trash}</button>
    <div class="odd-tooltip" id="tip-delete" popover="hint" role="tooltip">Delete deck</div>
    <hr class="odd-separator" aria-orientation="vertical">
    <button class="odd-button" data-variant="primary" aria-describedby="tip-publish" interestfor="tip-publish">Publish</button>
    <div class="odd-tooltip" id="tip-publish" popover="hint" role="tooltip">Anyone with the link can view it</div>
  </div>`,
};

export const HoverCard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A preview shown while the pointer or keyboard focus rests on the link. Everything in it is also on the page the link opens, so it's never the only way to the content.",
      },
    },
  },
  render: () => /* html */ `<p style="max-inline-size: 36rem">
    Last week's winner was <a href="#" interestfor="preview-midnight">Midnight Control</a>, a slow list that wins on card advantage.
  </p>
  <div class="odd-hover-card" id="preview-midnight" popover="hint">
    <div class="odd-stack" style="--gap: var(--space-3)">
      <div class="odd-row" style="--gap: var(--space-3)">
        <span class="odd-avatar" aria-hidden="true">MO</span>
        <div>
          <p class="odd-heading" data-size="sm">Midnight Control</p>
          <p class="odd-muted" style="font-size: var(--text-sm)">by Mira Okafor</p>
        </div>
      </div>
      <p style="font-size: var(--text-sm)">Grinds out card advantage, then wins with one big turn.</p>
      <div class="odd-row" style="--gap: var(--space-2)">
        <span class="odd-badge" data-tone="success">Legal</span>
        <span class="odd-badge">60 cards</span>
        <span class="odd-badge" data-tone="info">Extended</span>
      </div>
    </div>
  </div>`,
};

const sheet = (id: string, side: string, title: string) => /* html */ `<dialog class="odd-sheet" id="${id}" data-side="${side}" aria-labelledby="${id}-title" closedby="any">
      <div class="odd-sheet-header">
        <h2 class="odd-dialog-title" id="${id}-title">${title}</h2>
        <button class="odd-button" data-variant="ghost" data-icon-only aria-label="Close" commandfor="${id}" command="close">${icons.close}</button>
      </div>
      <div class="odd-sheet-body">
        <div class="odd-field">
          <label class="odd-label" for="${id}-format">Format</label>
          <select class="odd-select" id="${id}-format"><option>Any</option><option>Standard</option><option>Extended</option></select>
        </div>
        <fieldset class="odd-stack" style="--gap: var(--space-2); border: 0; padding: 0; margin: 0">
          <legend class="odd-label" style="margin-block-end: var(--space-2)">Status</legend>
          <label class="odd-choice"><input type="checkbox" checked> Legal</label>
          <label class="odd-choice"><input type="checkbox"> Rotating</label>
          <label class="odd-choice"><input type="checkbox"> Banned</label>
        </fieldset>
      </div>
      <div class="odd-sheet-footer">
        <button class="odd-button" commandfor="${id}" command="close">Reset</button>
        <button class="odd-button" data-variant="primary" commandfor="${id}" command="close">Show 12 decks</button>
      </div>
    </dialog>`;

export const Sheet: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A `<dialog>` opened with `show-modal`, so focus is trapped, the page behind is inert, and focus returns on close. It slides in from `data-side`: `start` and `end` follow the writing direction.",
      },
    },
  },
  render: () => /* html */ `<div class="odd-row">
    <button class="odd-button" commandfor="sheet-end" command="show-modal">${icons.filter} Filters (end)</button>
    <button class="odd-button" commandfor="sheet-start" command="show-modal">Start</button>
    <button class="odd-button" commandfor="sheet-bottom" command="show-modal">Bottom</button>
    ${sheet("sheet-end", "end", "Filters")}
    ${sheet("sheet-start", "start", "Filters")}
    ${sheet("sheet-bottom", "bottom", "Filters")}
  </div>`,
};

export const AlertDialog: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`role=\"alertdialog\"` for a decision the user must make. It leaves out `closedby=\"any\"`, so a click outside doesn't dismiss it, but Escape still cancels. Focus starts on the safe choice.",
      },
    },
  },
  render: () => /* html */ `<div>
    <button class="odd-button" data-variant="danger" commandfor="discard" command="show-modal">Discard changes…</button>
    <dialog class="odd-dialog" id="discard" role="alertdialog" aria-labelledby="discard-title" aria-describedby="discard-desc">
      <div class="odd-dialog-body">
        <h2 class="odd-dialog-title" id="discard-title">Discard unsaved changes?</h2>
        <p class="odd-muted" id="discard-desc">You’ve edited 6 cards since your last save. Discarding can’t be undone.</p>
        <div class="odd-dialog-actions">
          <button class="odd-button" commandfor="discard" command="close" autofocus>Keep editing</button>
          <button class="odd-button" data-variant="danger" commandfor="discard" command="close">Discard</button>
        </div>
      </div>
    </dialog>
  </div>`,
};
