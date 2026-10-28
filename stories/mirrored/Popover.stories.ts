import { mirrored, type Node } from "../mirror.ts";

const meta = {
  title: "Components/Overlays",
  parameters: {
    docs: {
      description: {
        component:
          "`Popover` from `odd-design/react` renders `div.odd-popover`. Give it an `id` and `popover=\"auto\"`, and open it from a `Button` with `commandfor` and `command=\"toggle-popover\"`. The browser owns the rest: the top layer, Escape, a click outside, focus return, and the invoker's expanded state. A popover that holds controls takes `role=\"dialog\"` and a name. One that only shows text takes neither. The right-hand trigger sits at the edge, so its popover flips to stay on screen.",
      },
    },
  },
};

export default meta;

const filters = (id: string): Node<"Popover"> => ({
  of: "Popover",
  props: { id, popover: "auto", role: "dialog", "aria-labelledby": `${id}-title` },
  children: [
    {
      of: "div",
      props: { className: "odd-stack", style: { "--gap": "var(--space-3)" } },
      children: [
        { of: "p", props: { className: "odd-eyebrow", id: `${id}-title` }, children: ["Filter decks"] },
        { of: "Choice", children: [{ of: "input", props: { type: "checkbox", defaultChecked: true } }, " Legal only"] },
        { of: "Choice", children: [{ of: "input", props: { type: "checkbox" } }, " Has sideboard"] },
        { of: "Choice", children: [{ of: "input", props: { type: "checkbox" } }, " Edited this week"] },
        { of: "Separator" },
        {
          of: "div",
          props: { className: "odd-row", style: { justifyContent: "flex-end", "--gap": "var(--space-2)" } },
          children: [
            { of: "Button", props: { size: "sm", variant: "ghost", commandfor: id, command: "hide-popover" }, children: ["Cancel"] },
            { of: "Button", props: { size: "sm", variant: "primary", commandfor: id, command: "hide-popover" }, children: ["Apply"] },
          ],
        },
      ],
    },
  ],
});

const trigger = (id: string): Node<"Button"> => ({ of: "Button", props: { commandfor: id, command: "toggle-popover" }, children: [{ icon: "filter" }, " Filters"] });

export const Popover = mirrored({
  scene: () => ({
    of: "div",
    props: { className: "odd-row", style: { justifyContent: "space-between" } },
    children: [trigger("filters"), filters("filters"), trigger("filters-end"), filters("filters-end")],
  }),
  aria: `
- button "Filters"
- button "Filters"`,
});
