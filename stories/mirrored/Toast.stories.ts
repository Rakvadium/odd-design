import { toast, type ToastOptions } from "../../src/js/enhance.ts";
import { mirrored, type Node } from "../mirror.ts";

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

const dataToast = (index: number): Readonly<Record<string, string>> => ({ "data-toast": String(index) });

type Shown = readonly (readonly [label: string, options: ToastOptions])[];

const shownOnLoad = (shows: Shown, aria: string) =>
  mirrored({
    scene: () => ({
      of: "div",
      children: [
        { of: "div", props: { className: "odd-row" }, children: shows.map(([label], i): Node<"Button"> => ({ of: "Button", props: { ...dataToast(i) }, children: [label] })) },
        { of: "Toaster", props: { popover: "manual", "aria-label": "Notifications" } },
      ],
    }),
    aria,
  });

const showAll = (canvasElement: HTMLElement, shows: Shown) => {
  for (const button of canvasElement.querySelectorAll<HTMLButtonElement>("[data-toast]")) button.onclick = () => toast(shows[Number(button.dataset.toast)]![1]);
  return shows.map(([, options]) => toast(options));
};

const tones: Shown = [
  ["Save deck", { title: "Deck saved", description: "Midnight Control, version 15.", tone: "success", duration: Infinity }],
  ["Check rotation", { title: "Rotation on May 1", description: "Ember Aggro leaves Standard.", tone: "warning", duration: Infinity }],
  ["Fail to sync", { title: "Couldn’t sync", description: "Check your connection. Your changes are safe on this device.", tone: "danger", duration: Infinity }],
];

export const ToastVariants = {
  ...shownOnLoad(tones, `
- button "Save deck"
- button "Check rotation"
- button "Fail to sync"
- region "Notifications":
  - list:
    - listitem:
      - paragraph: Deck saved
      - paragraph: Midnight Control, version 15.
      - 'button "Dismiss: Deck saved"'
    - listitem:
      - paragraph: Rotation on May 1
      - paragraph: Ember Aggro leaves Standard.
      - 'button "Dismiss: Rotation on May 1"'
    - listitem:
      - paragraph: Couldn’t sync
      - paragraph: Check your connection. Your changes are safe on this device.
      - 'button "Dismiss: Couldn’t sync"'
  - paragraph: Deck saved. Midnight Control, version 15.
  - paragraph: Rotation on May 1. Ember Aggro leaves Standard.
  - paragraph: Couldn’t sync. Check your connection. Your changes are safe on this device.`),
  play: ({ canvasElement }: { canvasElement: HTMLElement }) => {
    showAll(canvasElement, tones);
  },
};

const parts: Shown = [
  [
    "Remove card",
    {
      title: "Removed “Ember Drake”",
      description: "It goes back to your collection.",
      tone: "info",
      duration: Infinity,
      action: { label: "Undo", onClick: () => toast({ title: "Card restored", tone: "success" }) },
    },
  ],
];

export const ToastParts = {
  ...shownOnLoad(parts, `
- button "Remove card"
- region "Notifications":
  - list:
    - listitem:
      - paragraph: Removed “Ember Drake”
      - paragraph: It goes back to your collection.
      - button "Undo"
      - 'button "Dismiss: Removed “Ember Drake”"'
  - paragraph: Removed “Ember Drake”. It goes back to your collection.`),
  play: ({ canvasElement }: { canvasElement: HTMLElement }) => {
    showAll(canvasElement, parts);
  },
};

const freezeHalfwayOut = (element: Element) => {
  for (const animation of element.getAnimations()) {
    animation.pause();
    animation.currentTime = Number(animation.effect!.getComputedTiming().activeDuration) / 2;
  }
};

const states: Shown = [
  ["Save draft", { title: "Draft saved", duration: Infinity }],
  ["Finish upload", { title: "Upload finished", duration: Infinity }],
];

export const ToastStates = {
  ...shownOnLoad(states, `
- button "Save draft"
- button "Finish upload"
- region "Notifications":
  - list:
    - listitem:
      - paragraph: Draft saved
      - 'button "Dismiss: Draft saved"'
    - listitem:
      - paragraph: Upload finished
      - 'button "Dismiss: Upload finished"'
  - paragraph: Draft saved.`),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const [, upload] = showAll(canvasElement, states);
    const closing = [...canvasElement.querySelectorAll(".odd-toast")].at(-1)!;
    await Promise.all(closing.getAnimations().map((animation) => animation.finished));
    upload!.dismiss();
    freezeHalfwayOut(closing);
  },
};
