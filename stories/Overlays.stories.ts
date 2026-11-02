import type { Meta, StoryObj } from "@storybook/html-vite";

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
          <h2 class="odd-heading" data-size="sm">Midnight Control</h2>
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
