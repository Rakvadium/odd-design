import { mirrored } from "../mirror.ts";

type Args = {
  label: string;
  variant: "default" | "primary" | "secondary" | "ghost" | "danger";
  size: "sm" | "md" | "lg";
  disabled: boolean;
  busy: boolean;
};

const meta = {
  title: "Components/Button",
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
};

export default meta;

const omitToken = {
  variant(value: Args["variant"]) {
    return value === "default" ? undefined : value;
  },
  size(value: Args["size"]) {
    return value === "md" ? undefined : value;
  },
};

export const Playground = mirrored<Args>({
  scene: ({ label, variant, size, disabled, busy }) => ({
    of: "Button",
    props: {
      variant: omitToken.variant(variant),
      size: omitToken.size(size),
      "aria-disabled": disabled ? "true" : undefined,
      "aria-busy": busy ? "true" : undefined,
    },
    children: [label],
  }),
  aria: `- button "Save changes"`,
});

export const Variants = mirrored<Args>({
  scene: () => ({
    of: "div",
    props: { className: "odd-row" },
    children: [
      { of: "Button", props: { variant: "primary" }, children: ["Primary"] },
      { of: "Button", props: { variant: "secondary" }, children: ["Secondary"] },
      { of: "Button", children: ["Default"] },
      { of: "Button", props: { variant: "ghost" }, children: ["Ghost"] },
      { of: "Button", props: { variant: "danger" }, children: [{ icon: "trash" }, " Delete"] },
    ],
  }),
  aria: `
- button "Primary"
- button "Secondary"
- button "Default"
- button "Ghost"
- button "Delete"`,
});

export const Sizes = mirrored<Args>({
  scene: () => ({
    of: "div",
    props: { className: "odd-row" },
    children: [
      { of: "Button", props: { variant: "primary", size: "sm" }, children: ["Small"] },
      { of: "Button", props: { variant: "primary" }, children: ["Medium"] },
      { of: "Button", props: { variant: "primary", size: "lg" }, children: ["Large ", { icon: "arrowRight" }] },
      { of: "Button", props: { iconOnly: true, "aria-label": "Settings" }, children: [{ icon: "settings" }] },
      { of: "Button", props: { iconOnly: true, variant: "primary", "aria-label": "Add card" }, children: [{ icon: "plus" }] },
    ],
  }),
  aria: `
- button "Small"
- button "Medium"
- button "Large"
- button "Settings"
- button "Add card"`,
});

export const States = mirrored<Args>({
  scene: () => ({
    of: "div",
    props: { className: "odd-row" },
    children: [
      { of: "Button", props: { variant: "primary", "aria-busy": "true" }, children: ["Saving…"] },
      { of: "Button", props: { variant: "primary", "aria-disabled": "true" }, children: ["Unavailable"] },
      { of: "Button", props: { "aria-disabled": "true" }, children: ["Unavailable"] },
    ],
  }),
  aria: `
- button "Saving…"
- button "Unavailable" [disabled]
- button "Unavailable" [disabled]`,
});

export const Link = mirrored<Args>({
  scene: () => ({
    of: "div",
    props: { className: "odd-row" },
    children: [
      { of: "Button", props: { href: "#docs", variant: "secondary" }, children: ["Docs"] },
      { of: "Button", props: { href: "#decks", variant: "ghost", "aria-current": "page" }, children: ["Decks"] },
    ],
  }),
  aria: `
- link "Docs":
  - /url: "#docs"
- link "Decks":
  - /url: "#decks"`,
});
