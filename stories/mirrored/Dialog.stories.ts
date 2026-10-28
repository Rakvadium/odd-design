import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Surfaces",
  parameters: {
    docs: {
      description: {
        component:
          "`Dialog` from `odd-design/react` renders a native `dialog.odd-dialog`, with `DialogActions` inside a `div.odd-dialog-body` and the title on an `h2.odd-dialog-title`. A `Button` with `commandfor` and `command=\"show-modal\"` opens it, so no JS is needed. `showModal()` traps focus, closes on Escape, makes the page behind it inert, and returns focus when it closes. `closedby=\"any\"` adds closing by clicking outside. Focus starts on the first button, so put the safe choice first. It animates with `@starting-style`.",
      },
    },
  },
};

export default meta;

export const Dialog = mirrored({
  scene: () => ({
    of: "div",
    children: [
      { of: "Button", props: { variant: "danger", commandfor: "confirm-delete", command: "show-modal" }, children: [{ icon: "trash" }, " Delete deck…"] },
      {
        of: "Dialog",
        props: { id: "confirm-delete", "aria-labelledby": "confirm-delete-title", closedby: "any" },
        children: [
          {
            of: "div",
            props: { className: "odd-dialog-body" },
            children: [
              { of: "h2", props: { className: "odd-dialog-title", id: "confirm-delete-title" }, children: ["Delete “Midnight Control”?"] },
              { of: "p", props: { className: "odd-muted" }, children: ["This removes the deck and its 14 saved versions. You can’t undo this."] },
              {
                of: "DialogActions",
                children: [
                  { of: "Button", props: { commandfor: "confirm-delete", command: "close" }, children: ["Close"] },
                  { of: "Button", props: { variant: "danger", commandfor: "confirm-delete", command: "close" }, children: ["Delete"] },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  aria: `
- button "Delete deck…"`,
});
