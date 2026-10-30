import { mirrored, type Node } from "../mirror.ts";

const meta = {
  title: "Components/Feedback",
  parameters: {
    docs: {
      description: {
        component:
          "`Progress` and `Meter` from `odd-design/react` render `progress.odd-progress` for tasks and `meter.odd-meter` for measurements. Leave out `value` for an indeterminate progress bar. `tone` recolors a bar that has no `low` or `high`. With `low`, `high`, and `optimum`, a meter colors itself by range. Each bar is named by its `<label>` or `aria-label`, and the value is also shown as text. Each bar sits in the Stat row recipe, which is native markup.",
      },
    },
  },
};

export default meta;

function stat(id: string, label: string, value: Node<"span">["children"], bar: Node<"Meter"> | Node<"Progress">): Node<"div"> {
  return {
    of: "div",
    props: { className: "odd-stack", style: { "--gap": "var(--space-1)" } },
    children: [
      {
        of: "div",
        props: { className: "odd-row", style: { justifyContent: "space-between" } },
        children: [
          { of: "label", props: { className: "odd-muted", htmlFor: id }, children: [label] },
          { of: "span", props: { className: "odd-stat-value" }, children: value },
        ],
      },
      bar,
    ],
  };
}

function share(count: number, percent: string): Node<"span">["children"] {
  return [`${count} `, { of: "span", props: { className: "odd-muted" }, children: [`(${percent})`] }];
}

const storage: readonly [string, string, number][] = [
  ["store-low", "Images", 0.32],
  ["store-mid", "Backups", 0.71],
  ["store-high", "Exports", 0.93],
];

export const Progress = mirrored({
  scene: () => ({
    of: "div",
    props: { className: "odd-stack", style: { "--gap": "var(--space-6)", maxInlineSize: "28rem" } },
    children: [
      {
        of: "div",
        props: { className: "odd-stack", style: { "--gap": "var(--space-3)" } },
        children: [
          stat("import", "Importing decks", ["40%"], { of: "Progress", props: { id: "import", value: 40, max: 100 } }),
          stat("sync", "Syncing collection", [{ of: "span", props: { className: "odd-muted" }, children: ["Waiting…"] }], { of: "Progress", props: { id: "sync" } }),
        ],
      },
      {
        of: "div",
        props: { className: "odd-stack", style: { "--gap": "var(--space-3)" }, role: "group", "aria-labelledby": "mix-title" },
        children: [
          { of: "p", props: { className: "odd-eyebrow", id: "mix-title" }, children: ["Deck mix · 60 cards"] },
          stat("units", "Units", share(24, "40%"), { of: "Meter", props: { id: "units", min: 0, max: 60, value: 24 } }),
          stat("actions", "Actions", share(22, "37%"), { of: "Meter", props: { id: "actions", min: 0, max: 60, value: 22, tone: "info" } }),
          stat("assets", "Assets", share(14, "23%"), { of: "Meter", props: { id: "assets", min: 0, max: 60, value: 14, tone: "success" } }),
        ],
      },
      {
        of: "div",
        props: { className: "odd-stack", style: { "--gap": "var(--space-3)" }, role: "group", "aria-labelledby": "storage-title" },
        children: [
          { of: "p", props: { className: "odd-eyebrow", id: "storage-title" }, children: ["Storage, colored by range"] },
          ...storage.map(([id, label, value]) =>
            stat(id, label, [`${Math.round(value * 100)}% used`], { of: "Meter", props: { id, value, low: 0.6, high: 0.85, optimum: 0 } }),
          ),
        ],
      },
    ],
  }),
  aria: `
- text: Importing decks 40%
- progressbar "Importing decks"
- text: Syncing collection Waiting…
- progressbar "Syncing collection"
- group "Deck mix · 60 cards":
  - paragraph: Deck mix · 60 cards
  - text: Units 24 (40%)
  - meter "Units"
  - text: Actions 22 (37%)
  - meter "Actions"
  - text: Assets 14 (23%)
  - meter "Assets"
- group "Storage, colored by range":
  - paragraph: Storage, colored by range
  - text: Images 32% used
  - meter "Images"
  - text: Backups 71% used
  - meter "Backups"
  - text: Exports 93% used
  - meter "Exports"`,
});
