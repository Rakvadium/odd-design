import { mirrored, type Node, type PropsOf } from "../mirror.ts";

const meta = {
  title: "Components/Overlays",
  parameters: {
    docs: {
      description: {
        component:
          "`Sheet` from `odd-design/react` renders a native `dialog.odd-sheet`, with `SheetHeader`, a `div.odd-sheet-body`, and `SheetFooter` as its three rows. A `Button` with `commandfor` and `command=\"show-modal\"` opens it, so focus is trapped, the page behind is inert, and focus returns on close. It slides in from `side`: `start`, `top`, or `bottom`, and from the end with no `side`. `start` and the end follow the writing direction. Focus starts on the Close button.",
      },
    },
  },
};

export default meta;

const sheet = (id: string, side?: PropsOf<"Sheet">["side"]): Node<"Sheet"> => ({
  of: "Sheet",
  props: { id, side, "aria-labelledby": `${id}-title`, closedby: "any" },
  children: [
    {
      of: "SheetHeader",
      children: [
        { of: "h2", props: { className: "odd-dialog-title", id: `${id}-title` }, children: ["Filters"] },
        { of: "Button", props: { variant: "ghost", iconOnly: true, "aria-label": "Close", commandfor: id, command: "close" }, children: [{ icon: "close" }] },
      ],
    },
    {
      of: "div",
      props: { className: "odd-sheet-body" },
      children: [
        {
          of: "Field",
          children: [
            { of: "Label", props: { htmlFor: `${id}-format` }, children: ["Format"] },
            {
              of: "Select",
              props: { id: `${id}-format` },
              children: [
                { of: "option", children: ["Any"] },
                { of: "option", children: ["Standard"] },
                { of: "option", children: ["Extended"] },
              ],
            },
          ],
        },
        {
          of: "fieldset",
          props: { className: "odd-stack", style: { "--gap": "var(--space-2)", border: "0", padding: "0", margin: "0" } },
          children: [
            { of: "legend", props: { className: "odd-label", style: { marginBlockEnd: "var(--space-2)" } }, children: ["Status"] },
            { of: "Choice", children: [{ of: "input", props: { type: "checkbox", defaultChecked: true } }, " Legal"] },
            { of: "Choice", children: [{ of: "input", props: { type: "checkbox" } }, " Rotating"] },
            { of: "Choice", children: [{ of: "input", props: { type: "checkbox" } }, " Banned"] },
          ],
        },
      ],
    },
    {
      of: "SheetFooter",
      children: [
        { of: "Button", props: { commandfor: id, command: "close" }, children: ["Reset"] },
        { of: "Button", props: { variant: "primary", commandfor: id, command: "close" }, children: ["Show 12 decks"] },
      ],
    },
  ],
});

export const Sheet = mirrored({
  scene: () => ({
    of: "div",
    props: { className: "odd-row" },
    children: [
      { of: "Button", props: { commandfor: "sheet-end", command: "show-modal" }, children: [{ icon: "filter" }, " Filters (end)"] },
      { of: "Button", props: { commandfor: "sheet-start", command: "show-modal" }, children: ["Start"] },
      { of: "Button", props: { commandfor: "sheet-bottom", command: "show-modal" }, children: ["Bottom"] },
      sheet("sheet-end"),
      sheet("sheet-start", "start"),
      sheet("sheet-bottom", "bottom"),
    ],
  }),
  aria: `
- button "Filters (end)"
- button "Start"
- button "Bottom"`,
});
