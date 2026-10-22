import type { Meta, StoryObj } from "@storybook/html-vite";
import { icons } from "./icons.ts";

type Args = {
  label: string;
  variant: "default" | "primary" | "secondary" | "ghost" | "danger";
  size: "sm" | "md" | "lg";
  disabled: boolean;
  busy: boolean;
};

const button = ({ label, variant, size, disabled, busy }: Args) =>
  `<button class="odd-button"
    ${variant === "default" ? "" : `data-variant="${variant}"`}
    ${size === "md" ? "" : `data-size="${size}"`}
    ${disabled ? `aria-disabled="true"` : ""}
    ${busy ? `aria-busy="true"` : ""}>${label}</button>`;

const meta = {
  title: "Components/Button",
  render: button,
  args: { label: "Save changes", variant: "primary", size: "md", disabled: false, busy: false },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "primary", "secondary", "ghost", "danger"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A native `<button>`. Disable with `aria-disabled=\"true\"` so it stays focusable and screen readers can still find it. Pressing it in bubblegum chrome sinks it into its shadow, and in calm chrome it scales down slightly. Each chrome supplies that through `--press-transform` and `--shadow-control-active`.",
      },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => `<div class="odd-row">
    <button class="odd-button" data-variant="primary">Primary</button>
    <button class="odd-button" data-variant="secondary">Secondary</button>
    <button class="odd-button">Default</button>
    <button class="odd-button" data-variant="ghost">Ghost</button>
    <button class="odd-button" data-variant="danger">${icons.trash} Delete</button>
  </div>`,
};

export const Sizes: Story = {
  render: () => `<div class="odd-row">
    <button class="odd-button" data-variant="primary" data-size="sm">Small</button>
    <button class="odd-button" data-variant="primary">Medium</button>
    <button class="odd-button" data-variant="primary" data-size="lg">Large ${icons.arrowRight}</button>
    <button class="odd-button" data-icon-only aria-label="Settings">${icons.settings}</button>
    <button class="odd-button" data-icon-only data-variant="primary" aria-label="Add card">${icons.plus}</button>
  </div>`,
};

export const States: Story = {
  render: () => `<div class="odd-row">
    <button class="odd-button" data-variant="primary" aria-busy="true">Saving…</button>
    <button class="odd-button" data-variant="primary" aria-disabled="true">Unavailable</button>
    <button class="odd-button" aria-disabled="true">Unavailable</button>
  </div>`,
};
