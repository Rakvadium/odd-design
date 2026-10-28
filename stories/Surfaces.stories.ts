import type { Meta, StoryObj } from "@storybook/html-vite";
import { icons } from "./icons.ts";

const meta = { title: "Components/Surfaces" } satisfies Meta;

export default meta;
type Story = StoryObj;

export const Dialog: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A native `<dialog>` opened with invoker commands (`commandfor` / `command`), so no JS is needed. `showModal()` traps focus, closes on Escape, makes the page behind it inert, and returns focus when it closes. `closedby=\"any\"` adds closing by clicking outside. It animates with `@starting-style`.",
      },
    },
  },
  render: () => /* html */ `<div>
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
  render: () => /* html */ `<div style="max-inline-size: 36rem">
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
