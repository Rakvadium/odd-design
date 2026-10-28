import { mirrored, type Node, type Text } from "../mirror.ts";

const meta = {
  title: "Components/Interactive",
  parameters: {
    docs: {
      description: {
        component:
          "`Menu` from `odd-design/react` renders `div.odd-menu` and runs `enhanceMenu` on it, and `MenuItem` renders each `button.odd-menu-item`. Open it from a `Button` with `commandfor`, `command=\"toggle-popover\"`, and `aria-haspopup=\"menu\"`. The browser opens and closes it. Focus lands on the first item; arrows, Home, End, and typing move; Escape or Tab closes and focus returns. ArrowDown or ArrowUp on the trigger opens at the first or last item. Checkbox and radio items stay open when toggled, and a disabled item stays reachable but does nothing.",
      },
    },
  },
};

export default meta;

const item = (props: Node<"MenuItem">["props"], children: readonly (Text | Node<"kbd">)[]): Node<"MenuItem"> => ({ of: "MenuItem", props, children });

export const Menu = {
  ...mirrored({
    scene: () => ({
      of: "div",
      children: [
        {
          of: "div",
          props: { className: "odd-row" },
          children: [
            { of: "Button", props: { commandfor: "deck-actions", command: "toggle-popover", "aria-haspopup": "menu" }, children: ["Deck actions"] },
            { of: "Button", props: { variant: "primary", id: "after-menu" }, children: ["Publish"] },
          ],
        },
        {
          of: "Menu",
          props: { id: "deck-actions", popover: "auto", role: "menu", "aria-label": "Deck actions" },
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
        },
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
