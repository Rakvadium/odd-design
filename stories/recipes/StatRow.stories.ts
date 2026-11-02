import type { Meta, StoryObj } from "@storybook/html-vite";

const meta = {
  title: "Recipes/Stat row",
  parameters: {
    docs: {
      description: {
        component:
          "A label and its value on one line, with the bar under them. An `odd-row` spreads the label and the `odd-stat-value`, and an `odd-stack` puts the bar below. See `docs/recipes/stat-row.md`.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const stat = (id: string, label: string, value: string, bar: string) => /* html */ `<div class="odd-stack" style="--gap: var(--space-1)">
  <div class="odd-row" style="justify-content: space-between">
    <label class="odd-muted" for="${id}">${label}</label>
    <span class="odd-stat-value">${value}</span>
  </div>
  ${bar}
</div>`;

export const StatRow: Story = {
  parameters: {
    docs: {
      description: {
        story: "A progress bar, a toned meter, and a meter that colors itself by range. The value is always shown as text too.",
      },
    },
  },
  render: () => /* html */ `<div class="odd-stack" style="--gap: var(--space-3); max-inline-size: 28rem">
    ${stat("stat-import", "Importing decks", "40%", /* html */ `<progress class="odd-progress" id="stat-import" value="40" max="100"></progress>`)}
    ${stat("stat-actions", "Actions", /* html */ `22 <span class="odd-muted">(37%)</span>`, /* html */ `<meter class="odd-meter" id="stat-actions" min="0" max="60" value="22" data-tone="info"></meter>`)}
    ${stat("stat-exports", "Exports", "93% used", /* html */ `<meter class="odd-meter" id="stat-exports" value="0.93" low="0.6" high="0.85" optimum="0"></meter>`)}
  </div>`,
};
