import { toast } from "../../src/js/enhance.ts";
import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Interactive",
  parameters: {
    docs: {
      description: {
        component:
          "`Toaster` from `odd-design/react` renders `section.odd-toaster` with `popover=\"manual\"` and an `aria-label`, and runs `enhanceToaster` on it. Render it once per page. `toast()` from `odd-design/enhance` then shows a toast on it from any code. Toasts pause while hovered or focused, keep at most three, and leave after six seconds. The danger toast stays until dismissed. Save inside Settings shows a toast above the open modal dialog.",
      },
    },
  },
};

export default meta;

export const Toast = {
  ...mirrored({
    scene: () => ({
      of: "div",
      children: [
        {
          of: "div",
          props: { className: "odd-row" },
          children: [
            { of: "Button", props: { "data-toast": "saved" }, children: ["Save deck"] },
            { of: "Button", props: { "data-toast": "undo" }, children: ["Remove card"] },
            { of: "Button", props: { "data-toast": "error", variant: "danger" }, children: ["Fail to sync"] },
            { of: "Button", props: { commandfor: "toast-settings", command: "show-modal" }, children: ["Settings…"] },
          ],
        },
        {
          of: "Dialog",
          props: { id: "toast-settings", "aria-labelledby": "toast-settings-title", closedby: "any" },
          children: [
            {
              of: "div",
              props: { className: "odd-dialog-body" },
              children: [
                { of: "h2", props: { className: "odd-dialog-title", id: "toast-settings-title" }, children: ["Deck settings"] },
                { of: "p", props: { className: "odd-muted" }, children: ["Saving here shows a toast while this dialog stays open."] },
                {
                  of: "DialogActions",
                  children: [
                    { of: "Button", props: { commandfor: "toast-settings", command: "close" }, children: ["Close"] },
                    { of: "Button", props: { variant: "primary", "data-toast": "saved" }, children: ["Save"] },
                  ],
                },
              ],
            },
          ],
        },
        { of: "Toaster", props: { popover: "manual", "aria-label": "Notifications" } },
      ],
    }),
    aria: `
- button "Save deck"
- button "Remove card"
- button "Fail to sync"
- button "Settings…"
- region "Notifications":
  - list`,
  }),
  play: ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const shows = {
      saved: () => toast({ title: "Deck saved", description: "Midnight Control, version 15.", tone: "success" }),
      undo: () => toast({ title: "Removed “Ember Drake”", action: { label: "Undo", onClick: () => toast({ title: "Card restored", tone: "info" }) } }),
      error: () =>
        toast({ title: "Couldn’t sync", description: "Check your connection. Your changes are safe on this device.", tone: "danger", duration: Infinity }),
    };
    for (const button of canvasElement.querySelectorAll<HTMLButtonElement>("[data-toast]")) button.onclick = shows[button.dataset.toast as keyof typeof shows];
  },
};
