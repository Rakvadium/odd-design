import type { Meta, StoryObj } from "@storybook/html-vite";
import { enhanceMenu, enhanceToaster, toast } from "../src/js/enhance.ts";
import { icons } from "./icons.ts";

const meta = {
  title: "Components/Interactive",
  parameters: {
    docs: {
      description: {
        component:
          "Patterns HTML has no element for yet, so a small module from `odd-design/enhance` adds the keyboard model and state on top of native markup. Each module takes an element and returns a cleanup function.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** Renders markup, then runs `wire` once the story root is in the document. */
const mount = (html: string, wire: (root: HTMLElement) => void) => {
  const root = document.createElement("div");
  root.innerHTML = html;
  requestAnimationFrame(() => wire(root));
  return root;
};

export const Menu: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A popover with `role=\"menu\"`, enhanced by `enhanceMenu`. Focus lands on the first item; arrows, Home, End, and typing move; Escape or Tab closes and focus returns. ArrowDown or ArrowUp on the trigger opens at the first or last item. Checkbox and radio items stay open when toggled.",
      },
    },
  },
  render: () =>
    mount(
      /* html */ `<div class="odd-row">
        <button class="odd-button" commandfor="deck-actions" command="toggle-popover" aria-haspopup="menu">Deck actions</button>
        <button class="odd-button" data-variant="primary" id="after-menu">Publish</button>
      </div>
      <div class="odd-menu" id="deck-actions" popover role="menu" aria-label="Deck actions">
        <button class="odd-menu-item" role="menuitem" aria-keyshortcuts="Control+D">${icons.copy} Duplicate <kbd class="odd-menu-shortcut" aria-hidden="true">Ctrl D</kbd></button>
        <button class="odd-menu-item" role="menuitem">${icons.share} Share link</button>
        <button class="odd-menu-item" role="menuitem" aria-disabled="true">${icons.layers} Merge (needs two decks)</button>
        <hr class="odd-separator">
        <button class="odd-menu-item" role="menuitemcheckbox" aria-checked="true">Show prices</button>
        <button class="odd-menu-item" role="menuitemcheckbox" aria-checked="false">Compact grid</button>
        <hr class="odd-separator">
        <p class="odd-menu-label" aria-hidden="true">Sort by</p>
        <div role="group" aria-label="Sort by">
          <button class="odd-menu-item" role="menuitemradio" aria-checked="true">Name</button>
          <button class="odd-menu-item" role="menuitemradio" aria-checked="false">Last edited</button>
          <button class="odd-menu-item" role="menuitemradio" aria-checked="false">Card count</button>
        </div>
        <hr class="odd-separator">
        <button class="odd-menu-item" role="menuitem" data-tone="danger">${icons.trash} Delete deck</button>
      </div>
      <p class="odd-muted" style="margin-block-start: var(--space-4)" aria-live="polite" id="menu-log"></p>`,
      (root) => {
        const menu = root.querySelector<HTMLElement>("#deck-actions")!;
        enhanceMenu(menu);
        const log = root.querySelector("#menu-log")!;
        menu.addEventListener("click", (event) => {
          const item = (event.target as Element).closest(".odd-menu-item");
          const label = [...(item?.childNodes ?? [])].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join("");
          if (item) log.textContent = `Chose “${label.trim()}”`;
        });
      },
    ),
};

export const Toast: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A `section.odd-toaster` with `popover=\"manual\"` and an `aria-label`, wired by `enhanceToaster`, is the one polite live region per page, and `toast()` shows a toast on it. Toasts pause while hovered or focused, keep at most three, and leave after six seconds. The danger toast stays until dismissed. Save inside Settings shows a toast above the open modal dialog.",
      },
    },
  },
  render: () =>
    mount(
      /* html */ `<div class="odd-row">
        <button class="odd-button" data-toast="saved">Save deck</button>
        <button class="odd-button" data-toast="undo">Remove card</button>
        <button class="odd-button" data-toast="error" data-variant="danger">Fail to sync</button>
        <button class="odd-button" commandfor="toast-settings" command="show-modal">Settings…</button>
      </div>
      <dialog class="odd-dialog" id="toast-settings" aria-labelledby="toast-settings-title" closedby="any">
        <div class="odd-dialog-body">
          <h2 class="odd-dialog-title" id="toast-settings-title">Deck settings</h2>
          <p class="odd-muted">Saving here shows a toast while this dialog stays open.</p>
          <div class="odd-dialog-actions">
            <button class="odd-button" commandfor="toast-settings" command="close">Close</button>
            <button class="odd-button" data-variant="primary" data-toast="saved">Save</button>
          </div>
        </div>
      </dialog>
      <section class="odd-toaster" popover="manual" aria-label="Notifications"></section>`,
      (root) => {
        enhanceToaster(root.querySelector<HTMLElement>(".odd-toaster")!);
        root.addEventListener("click", (event) => {
          const kind = (event.target as Element).closest<HTMLElement>("[data-toast]")?.dataset.toast;
          if (kind === "saved") toast({ title: "Deck saved", description: "Midnight Control, version 15.", tone: "success" });
          if (kind === "undo")
            toast({ title: "Removed “Ember Drake”", action: { label: "Undo", onClick: () => toast({ title: "Card restored", tone: "info" }) } });
          if (kind === "error")
            toast({ title: "Couldn’t sync", description: "Check your connection. Your changes are safe on this device.", tone: "danger", duration: Infinity });
        });
      },
    ),
};
