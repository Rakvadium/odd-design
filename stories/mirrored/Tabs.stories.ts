import { mirrored, type Node, type Text } from "../mirror.ts";

const meta = {
  title: "Components/Interactive",
  parameters: {
    docs: {
      description: {
        component:
          "`Tabs` from `odd-design/react` renders `div.odd-tabs` and runs `enhanceTabs` on it: one tab stop, arrows and Home/End move between tabs, and the panel follows. Write the tablist, the tab buttons, and the panels inside it, wired by `aria-controls` and `aria-labelledby`. The tab with `aria-selected=\"true\"` is chosen first. The second set uses `data-activation=\"manual\"` on its tablist, so arrows only move focus and Enter or Space chooses.",
      },
    },
  },
};

export default meta;

const tab = (id: string, label: string, selected: boolean, disabled?: boolean): Node<"button"> => ({
  of: "button",
  props: { role: "tab", id: `tab-${id}`, "aria-controls": `panel-${id}`, "aria-selected": selected ? "true" : "false", disabled },
  children: [label],
});

const panel = (id: string, hidden: boolean, children: readonly (Text | Node<"a">)[]): Node<"div"> => ({
  of: "div",
  props: { role: "tabpanel", id: `panel-${id}`, "aria-labelledby": `tab-${id}`, hidden },
  children: [{ of: "p", children }],
});

export const Tabs = mirrored({
  scene: () => ({
    of: "div",
    props: { className: "odd-stack", style: { "--gap": "var(--space-8)", maxInlineSize: "40rem" } },
    children: [
      {
        of: "Tabs",
        props: { id: "deck-tabs" },
        children: [
          { of: "div", props: { role: "tablist", "aria-label": "Deck view" }, children: [tab("cards", "Cards", true), tab("stats", "Stats", false), tab("notes", "Notes", false)] },
          panel("cards", false, ["60 cards across 24 units, 22 actions, and 14 assets."]),
          panel("stats", true, ["Average cost 2.4. Curve peaks at 3."]),
          panel("notes", true, ["Mulligan aggressively for an early unit. ", { of: "a", props: { href: "#" }, children: ["Edit notes"] }]),
        ],
      },
      {
        of: "Tabs",
        props: { id: "manual-tabs" },
        children: [
          {
            of: "div",
            props: { role: "tablist", "aria-label": "Season", "data-activation": "manual" },
            children: [tab("s7", "Season 7", true), tab("s6", "Season 6", false), tab("s5", "Season 5", false, true)],
          },
          panel("s7", false, ["Current season. Rotation on May 1."]),
          panel("s6", true, ["Archived results."]),
          panel("s5", true, ["Not imported yet."]),
        ],
      },
    ],
  }),
  aria: `
- tablist "Deck view":
  - tab "Cards" [selected]
  - tab "Stats"
  - tab "Notes"
- tabpanel "Cards":
  - paragraph: 60 cards across 24 units, 22 actions, and 14 assets.
- tablist "Season":
  - tab "Season 7" [selected]
  - tab "Season 6"
  - tab "Season 5" [disabled]
- tabpanel "Season 7":
  - paragraph: Current season. Rotation on May 1.`,
});
