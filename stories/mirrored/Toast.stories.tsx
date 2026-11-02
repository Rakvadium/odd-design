import { toast, type ToastOptions } from "../../src/js/enhance.ts";
import { Button, Dialog, Row, Toaster } from "odd-design/react";
import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Interactive",
  parameters: {
    docs: {
      description: {
        component:
          "`Toaster` from `odd-design/react` renders `section.odd-toaster` with `popover=\"manual\"`, named by its `label`, and runs `enhanceToaster` on it. Render it once per page. `toast()` from `odd-design/enhance` then shows a toast on it from any code. Toasts pause while hovered or focused, keep at most three, and leave after six seconds. The danger toast stays until dismissed. Save inside Settings shows a toast above the open modal dialog.",
      },
    },
  },
};

export default meta;

export const Toast = {
  ...mirrored({
    scene: () => (
      <div>
        <Row>
          <Button data-toast="saved">Save deck</Button>
          <Button data-toast="undo">Remove card</Button>
          <Button data-toast="error" variant="danger">
            Fail to sync
          </Button>
          <Dialog
            id="toast-settings"
            trigger={<Button>Settings…</Button>}
            title="Deck settings"
            description="Saving here shows a toast while this dialog stays open."
            dismissible
            actions={
              <>
                <Button command="close">Close</Button>
                <Button variant="primary" data-toast="saved">
                  Save
                </Button>
              </>
            }
          />
        </Row>
        <Toaster label="Notifications" />
      </div>
    ),
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

type Shown = readonly (readonly [label: string, options: ToastOptions])[];

const shownOnLoad = (shows: Shown, aria: string) =>
  mirrored({
    scene: () => (
      <div>
        <Row>
          {shows.map(([label], i) => (
            <Button key={label} data-toast={String(i)}>
              {label}
            </Button>
          ))}
        </Row>
        <Toaster label="Notifications" />
      </div>
    ),
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
    const closing = [...canvasElement.querySelectorAll<HTMLElement>(".odd-toast")].at(-1)!;
    await Promise.all(closing.getAnimations().map((animation) => animation.finished));
    // Reduced motion makes --duration-base 0ms, so dismiss() would find no exit to wait on and remove the toast.
    closing.style.transitionDuration = "1s";
    upload!.dismiss();
    freezeHalfwayOut(closing);
  },
};
