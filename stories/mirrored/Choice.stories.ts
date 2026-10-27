import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Forms",
  parameters: {
    docs: {
      description: {
        component:
          "`Choice`, `Switch`, and `Segmented` from `odd-design/react`. `Choice` is the label around a native checkbox, radio, or `Switch`. `Switch` is an `input` that you give `type=\"checkbox\"` and `role=\"switch\"`. `Segmented` is the `fieldset` around a `legend` and one `label` per radio. Set the starting state with `defaultChecked`, and disable with `disabled`.",
      },
    },
  },
};

export default meta;

export const Choices = mirrored({
  scene: () => ({
    of: "div",
    props: { className: "odd-stack" },
    children: [
      {
        of: "fieldset",
        props: { className: "odd-stack", style: { "--gap": "var(--space-2)", border: "0", padding: "0", margin: "0" } },
        children: [
          { of: "legend", props: { className: "odd-label", style: { marginBlockEnd: "var(--space-2)" } }, children: ["Notifications"] },
          { of: "Choice", children: [{ of: "input", props: { type: "checkbox", defaultChecked: true } }, " Deck comments"] },
          { of: "Choice", children: [{ of: "input", props: { type: "checkbox" } }, " Weekly digest"] },
          { of: "Choice", children: [{ of: "input", props: { type: "checkbox", disabled: true } }, " Partner offers (unavailable)"] },
        ],
      },
      {
        of: "fieldset",
        props: { className: "odd-stack", style: { "--gap": "var(--space-2)", border: "0", padding: "0", margin: "0" } },
        children: [
          { of: "legend", props: { className: "odd-label", style: { marginBlockEnd: "var(--space-2)" } }, children: ["Visibility"] },
          { of: "Choice", children: [{ of: "input", props: { type: "radio", name: "vis", defaultChecked: true } }, " Public"] },
          { of: "Choice", children: [{ of: "input", props: { type: "radio", name: "vis" } }, " Unlisted"] },
          { of: "Choice", children: [{ of: "input", props: { type: "radio", name: "vis" } }, " Private"] },
        ],
      },
    ],
  }),
  aria: `
- group "Notifications":
  - text: Notifications
  - checkbox "Deck comments" [checked]
  - text: Deck comments
  - checkbox "Weekly digest"
  - text: Weekly digest
  - checkbox "Partner offers (unavailable)" [disabled]
  - text: Partner offers (unavailable)
- group "Visibility":
  - text: Visibility
  - radio "Public" [checked]
  - text: Public
  - radio "Unlisted"
  - text: Unlisted
  - radio "Private"
  - text: Private`,
});

export const Switch = mirrored({
  scene: () => ({
    of: "div",
    props: { className: "odd-stack", style: { "--gap": "var(--space-3)" } },
    children: [
      { of: "Choice", children: [{ of: "Switch", props: { type: "checkbox", role: "switch", defaultChecked: true } }, " Show card prices"] },
      { of: "Choice", children: [{ of: "Switch", props: { type: "checkbox", role: "switch" } }, " Compact grid"] },
    ],
  }),
  aria: `
- switch "Show card prices" [checked]
- text: Show card prices
- switch "Compact grid"
- text: Compact grid`,
});

export const Segmented = mirrored({
  scene: () => ({
    of: "Segmented",
    children: [
      { of: "legend", children: ["View"] },
      { of: "label", children: [{ of: "input", props: { type: "radio", name: "view", defaultChecked: true } }, " Grid"] },
      { of: "label", children: [{ of: "input", props: { type: "radio", name: "view" } }, " List"] },
      { of: "label", children: [{ of: "input", props: { type: "radio", name: "view" } }, " Stats"] },
    ],
  }),
  aria: `
- group "View":
  - text: View
  - radio "Grid" [checked]
  - text: Grid
  - radio "List"
  - text: List
  - radio "Stats"
  - text: Stats`,
});
