import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Overlays",
  parameters: {
    docs: {
      description: {
        component:
          "`Dialog` with `role=\"alertdialog\"` for a decision the user must make. It leaves out `closedby=\"any\"`, so a click outside doesn't dismiss it, but Escape still cancels. Focus starts on the first button, the safe choice.",
      },
    },
  },
};

export default meta;

export const AlertDialog = mirrored({
  scene: () => ({
    of: "div",
    children: [
      { of: "Button", props: { variant: "danger", commandfor: "discard", command: "show-modal" }, children: ["Discard changes…"] },
      {
        of: "Dialog",
        props: { id: "discard", role: "alertdialog", "aria-labelledby": "discard-title", "aria-describedby": "discard-desc" },
        children: [
          {
            of: "div",
            props: { className: "odd-dialog-body" },
            children: [
              { of: "h2", props: { className: "odd-dialog-title", id: "discard-title" }, children: ["Discard unsaved changes?"] },
              { of: "p", props: { className: "odd-muted", id: "discard-desc" }, children: ["You’ve edited 6 cards since your last save. Discarding can’t be undone."] },
              {
                of: "DialogActions",
                children: [
                  { of: "Button", props: { commandfor: "discard", command: "close" }, children: ["Keep editing"] },
                  { of: "Button", props: { variant: "danger", commandfor: "discard", command: "close" }, children: ["Discard"] },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  aria: `
- button "Discard changes…"`,
});
