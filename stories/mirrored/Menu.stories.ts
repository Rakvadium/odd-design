import { mirrored, type Node, type Text } from "../mirror.ts";

const meta = {
  title: "Components/Interactive",
  parameters: {
    docs: {
      description: {
        component:
          "`Menu` from `odd-design/react` renders `div.odd-menu` and runs `enhanceMenu` on it, and `MenuItem` renders each `button.odd-menu-item`. Open it from a `Button` with `commandfor`, `command=\"toggle-popover\"`, and `aria-haspopup=\"menu\"`. The browser opens and closes it. Focus lands on the first item; arrows, Home, End, and typing move; Escape or Tab closes and focus returns. ArrowDown or ArrowUp on the trigger opens it at the first or last item. Checkbox and radio items stay open when toggled, and a disabled item stays reachable but does nothing.",
      },
    },
  },
};

export default meta;

const item = (props: Node<"MenuItem">["props"], children: readonly (Text | Node<"kbd">)[]): Node<"MenuItem"> => ({ of: "MenuItem", props, children });

const trigger = (id: string): Node<"Button"> => ({ of: "Button", props: { commandfor: id, command: "toggle-popover", "aria-haspopup": "menu" }, children: ["Deck actions"] });

const deckActions = (id: string): Node<"Menu"> => ({
  of: "Menu",
  props: { id, popover: "auto", role: "menu", "aria-label": "Deck actions" },
  children: [
    item({ role: "menuitem", "aria-keyshortcuts": "Control+D" }, [
      { icon: "copy" },
      " Duplicate ",
      { of: "kbd", props: { className: "odd-menu-shortcut", "aria-hidden": "true" }, children: ["Ctrl D"] },
    ]),
    item({ role: "menuitem" }, [{ icon: "share" }, " Share link"]),
    item({ role: "menuitem", "aria-disabled": "true" }, [{ icon: "layers" }, " Merge (needs two decks)"]),
    { of: "Separator" },
    item({ role: "menuitemcheckbox", "aria-checked": "true" }, ["Show prices"]),
    item({ role: "menuitemcheckbox", "aria-checked": "false" }, ["Compact grid"]),
    { of: "Separator" },
    { of: "p", props: { className: "odd-menu-label", "aria-hidden": "true" }, children: ["Sort by"] },
    {
      of: "div",
      props: { role: "group", "aria-label": "Sort by" },
      children: [
        item({ role: "menuitemradio", "aria-checked": "true" }, ["Name"]),
        item({ role: "menuitemradio", "aria-checked": "false" }, ["Last edited"]),
        item({ role: "menuitemradio", "aria-checked": "false" }, ["Card count"]),
      ],
    },
    { of: "Separator" },
    item({ role: "menuitem", tone: "danger" }, [{ icon: "trash" }, " Delete deck"]),
  ],
});

export const Menu = {
  ...mirrored({
    scene: () => ({
      of: "div",
      children: [
        {
          of: "div",
          props: { className: "odd-row" },
          children: [trigger("deck-actions"), { of: "Button", props: { variant: "primary", id: "after-menu" }, children: ["Publish"] }],
        },
        deckActions("deck-actions"),
        { of: "p", props: { className: "odd-muted", style: { marginBlockStart: "var(--space-4)" }, "aria-live": "polite", id: "menu-log" } },
      ],
    }),
    aria: `
- button "Deck actions"
- button "Publish"
- paragraph`,
  }),
  play: ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const log = canvasElement.querySelector("#menu-log")!;
    canvasElement.querySelector("#deck-actions")!.addEventListener("click", (event) => {
      const chosen = (event.target as Element).closest(".odd-menu-item");
      const label = [...(chosen?.childNodes ?? [])].filter((node) => node.nodeType === globalThis.Node.TEXT_NODE).map((node) => node.textContent).join("");
      if (chosen) log.textContent = `Chose “${label.trim()}”`;
    });
  },
};

export const MenuOpen = {
  ...mirrored({
    scene: () => ({
      of: "div",
      props: { style: { minBlockSize: "30rem" } },
      children: [trigger("open-deck-actions"), deckActions("open-deck-actions")],
    }),
    aria: `
- button "Deck actions"
- menu "Deck actions":
  - menuitem "Duplicate"
  - menuitem "Share link"
  - menuitem "Merge (needs two decks)" [disabled]
  - separator
  - menuitemcheckbox "Show prices" [checked]
  - menuitemcheckbox "Compact grid"
  - separator
  - group "Sort by":
    - menuitemradio "Name" [checked]
    - menuitemradio "Last edited"
    - menuitemradio "Card count"
  - separator
  - menuitem "Delete deck"`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const menu = canvasElement.querySelector("#open-deck-actions")!;
    const opened = new Promise((resolve) => menu.addEventListener("toggle", resolve, { once: true }));
    canvasElement.querySelector<HTMLButtonElement>('[commandfor="open-deck-actions"]')!.click();
    await opened;
    await Promise.all(menu.getAnimations().map((animation) => animation.finished));
  },
};
