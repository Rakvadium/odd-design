import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Surfaces",
  parameters: {
    docs: {
      description: {
        component:
          "`Disclosure` from `odd-design/react` renders `details.odd-disclosure`. Write the question as a `summary` directly inside it and the answer as one element after it. `open` opens it, and every disclosure that shares a `name` joins one exclusive group, so opening one closes the others with no script. To track the state in React, set `open` from `onToggle` with `event.newState`.",
      },
    },
  },
};

export default meta;

const faq = [
  ["What’s the difference between chrome and palette?", "Chrome is shape, type, depth, and motion. Palette is color. You can pair any chrome with any palette."],
  ["Does it need JavaScript?", "No. These are native details elements, and sharing a name makes the group exclusive."],
  ["Does it respect reduced motion?", "Yes. Durations drop to zero and press transforms switch off."],
] as const;

export const Disclosure = mirrored({
  scene: () => ({
    of: "div",
    props: { style: { maxInlineSize: "36rem" } },
    children: faq.map(([question, answer], index) => ({
      of: "Disclosure",
      props: index === 0 ? { name: "faq", open: true } : { name: "faq" },
      children: [
        { of: "summary", children: [question] },
        { of: "div", children: [answer] },
      ],
    })),
  }),
  aria: `
- group: What’s the difference between chrome and palette? Chrome is shape, type, depth, and motion. Palette is color. You can pair any chrome with any palette.
- group: Does it need JavaScript?
- group: Does it respect reduced motion?`,
});
