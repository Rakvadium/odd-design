import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Data Display",
  parameters: {
    docs: {
      description: {
        component:
          "`Separator` from `odd-design/react` renders `hr.odd-separator`, which screen readers announce as a separator. A horizontal line needs no props. Between inline items, pass `aria-orientation=\"vertical\"` and put it inside an `odd-row`, which stretches it to the row's height. It takes no children. For a line that means nothing, draw a border on the container instead.",
      },
    },
  },
};

export default meta;

export const Separator = mirrored({
  scene: () => ({
    of: "div",
    props: { className: "odd-stack", style: { maxInlineSize: "32rem" } },
    children: [
      {
        of: "div",
        props: { className: "odd-stack", style: { "--gap": "var(--space-2)" } },
        children: [
          { of: "h3", props: { className: "odd-heading" }, children: ["Deck notes"] },
          { of: "p", props: { className: "odd-muted" }, children: ["Mulligan aggressively for an early unit."] },
        ],
      },
      { of: "Separator" },
      {
        of: "div",
        props: { className: "odd-stack", style: { "--gap": "var(--space-2)" } },
        children: [
          { of: "h3", props: { className: "odd-heading" }, children: ["Sideboard"] },
          { of: "p", props: { className: "odd-muted" }, children: ["Bring in the control package against tempo decks."] },
        ],
      },
      { of: "Separator" },
      {
        of: "div",
        props: { className: "odd-row", style: { "--gap": "var(--space-3)", fontSize: "var(--text-sm)" } },
        children: [
          { of: "a", props: { href: "#" }, children: ["Edit"] },
          { of: "Separator", props: { "aria-orientation": "vertical" } },
          { of: "a", props: { href: "#" }, children: ["Duplicate"] },
          { of: "Separator", props: { "aria-orientation": "vertical" } },
          { of: "a", props: { href: "#" }, children: ["Export"] },
        ],
      },
    ],
  }),
  aria: `
- heading "Deck notes" [level=3]
- paragraph: Mulligan aggressively for an early unit.
- separator
- heading "Sideboard" [level=3]
- paragraph: Bring in the control package against tempo decks.
- separator
- link "Edit":
  - /url: "#"
- separator
- link "Duplicate":
  - /url: "#"
- separator
- link "Export":
  - /url: "#"`,
});
