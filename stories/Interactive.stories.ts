import type { Meta, StoryObj } from "@storybook/html-vite";
import { createToaster, enhanceMenu, enhanceTabs, type Toaster } from "../src/js/enhance.ts";
import { icons } from "./icons.ts";

const meta = {
  title: "Components/Interactive",
  parameters: {
    docs: {
      description: {
        component:
          "Patterns HTML has no element for yet, so a small module from `design-system/enhance` adds the keyboard model and state on top of native markup. Each module takes an element and returns a cleanup function.",
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
      `<div class="odd-row">
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

export const Tabs: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The ARIA tabs pattern, enhanced by `enhanceTabs`: one tab stop, arrows and Home/End move between tabs, and the panel follows. The second set uses `data-activation=\"manual\"`, so arrows only move focus and Enter or Space chooses.",
      },
    },
  },
  render: () =>
    mount(
      `<div class="odd-stack" style="--gap: var(--space-8); max-inline-size: 40rem">
        <div class="odd-tabs" id="deck-tabs">
          <div role="tablist" aria-label="Deck view">
            <button role="tab" id="tab-cards" aria-controls="panel-cards" aria-selected="true">Cards</button>
            <button role="tab" id="tab-stats" aria-controls="panel-stats" aria-selected="false">Stats</button>
            <button role="tab" id="tab-notes" aria-controls="panel-notes" aria-selected="false">Notes</button>
          </div>
          <div role="tabpanel" id="panel-cards" aria-labelledby="tab-cards"><p>60 cards across 24 units, 22 actions, and 14 assets.</p></div>
          <div role="tabpanel" id="panel-stats" aria-labelledby="tab-stats" hidden><p>Average cost 2.4. Curve peaks at 3.</p></div>
          <div role="tabpanel" id="panel-notes" aria-labelledby="tab-notes" hidden><p>Mulligan aggressively for an early unit. <a href="#">Edit notes</a></p></div>
        </div>
        <div class="odd-tabs" id="manual-tabs">
          <div role="tablist" aria-label="Season" data-activation="manual">
            <button role="tab" id="tab-s7" aria-controls="panel-s7" aria-selected="true">Season 7</button>
            <button role="tab" id="tab-s6" aria-controls="panel-s6" aria-selected="false">Season 6</button>
            <button role="tab" id="tab-s5" aria-controls="panel-s5" aria-selected="false" disabled>Season 5</button>
          </div>
          <div role="tabpanel" id="panel-s7" aria-labelledby="tab-s7"><p>Current season. Rotation on May 1.</p></div>
          <div role="tabpanel" id="panel-s6" aria-labelledby="tab-s6" hidden><p>Archived results.</p></div>
          <div role="tabpanel" id="panel-s5" aria-labelledby="tab-s5" hidden><p>Not imported yet.</p></div>
        </div>
      </div>`,
      (root) => root.querySelectorAll<HTMLElement>(".odd-tabs").forEach(enhanceTabs),
    ),
};

let toaster: Toaster | undefined;

export const Toast: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`createToaster()` adds one polite live region per page. Toasts pause while hovered or focused, keep at most three, and leave after six seconds. The danger toast stays until dismissed. Save inside Settings shows a toast above the open modal dialog.",
      },
    },
  },
  render: () =>
    mount(
      `<div class="odd-row">
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
      </dialog>`,
      (root) => {
        toaster?.destroy();
        const t = (toaster = createToaster());
        root.addEventListener("click", (event) => {
          const kind = (event.target as Element).closest<HTMLElement>("[data-toast]")?.dataset.toast;
          if (kind === "saved") t.show({ title: "Deck saved", description: "Midnight Control, version 15.", tone: "success" });
          if (kind === "undo")
            t.show({ title: "Removed “Ember Drake”", action: { label: "Undo", onClick: () => t.show({ title: "Card restored", tone: "info" }) } });
          if (kind === "error")
            t.show({ title: "Couldn’t sync", description: "Check your connection. Your changes are safe on this device.", tone: "danger", duration: Infinity });
        });
      },
    ),
};
