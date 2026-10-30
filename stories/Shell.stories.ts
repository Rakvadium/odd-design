import type { Meta, StoryObj } from "@storybook/html-vite";

const meta = { title: "Components/Shell" } satisfies Meta;

export default meta;
type Story = StoryObj;

const title = /* html */ `<h3 class="odd-heading">Orders</h3>`;
const status = /* html */ `<div class="odd-shell-status" role="status"><span class="odd-badge" data-tone="success">Synced</span><span class="odd-muted">2 minutes ago</span></div>`;
const actions = /* html */ `<div class="odd-shell-actions"><button class="odd-button" type="button">Export</button><button class="odd-button" type="button" data-variant="primary">New order</button></div>`;
const emptyStatus = /* html */ `<div class="odd-shell-status" role="status"></div>`;
const emptyActions = /* html */ `<div class="odd-shell-actions"></div>`;

const variant = (id: string, label: string, parts: string) => /* html */ `<section class="odd-stack" style="--gap: var(--space-2)" aria-labelledby="${id}">
    <h2 class="odd-heading" data-size="xs" id="${id}">${label}</h2>
    <header class="odd-shell-header">${parts}</header>
  </section>`;

export const Parts: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The `odd-shell-header` slots, filled and empty. The status slot takes the free space, so the actions stay at the end when the status is empty. A header with empty actions or no title keeps the same bar.",
      },
    },
  },
  render: () => /* html */ `<div class="odd-stack" style="--gap: var(--space-6)">
    ${variant("shell-all", "Title, status, and actions", title + status + actions)}
    ${variant("shell-empty-status", "Empty status", title + emptyStatus + actions)}
    ${variant("shell-empty-actions", "Empty actions", title + status + emptyActions)}
    ${variant("shell-no-title", "No title", status + actions)}
  </div>`,
};
