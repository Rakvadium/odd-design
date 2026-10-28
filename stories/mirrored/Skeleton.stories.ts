import { mirrored, type Node } from "../mirror.ts";

const meta = {
  title: "Components/Feedback",
  parameters: {
    docs: {
      description: {
        component:
          "`Skeleton` from `odd-design/react` renders `div.odd-skeleton`, a decorative block that holds the place of content while it loads. Every block takes `aria-hidden=\"true\"` and no children. `shape=\"avatar\"` draws a block that matches a default avatar. The shape follows the chrome's chip radius. Size other blocks with `inline-size` and `block-size` in `style`. The region that is filling in has `aria-busy=\"true\"` and says “Loading” in an `odd-visually-hidden` span, and both go away when the content arrives. The pulse follows `--duration-slow`, so reduced motion stops it.",
      },
    },
  },
};

export default meta;

const card = (): Node<"article"> => ({
  of: "article",
  props: { className: "odd-card", "aria-hidden": "true" },
  children: [
    {
      of: "div",
      props: { className: "odd-row" },
      children: [
        { of: "Skeleton", props: { "aria-hidden": "true", shape: "avatar" } },
        {
          of: "div",
          props: { className: "odd-stack", style: { "--gap": "var(--space-2)", flex: "1" } },
          children: [
            { of: "Skeleton", props: { "aria-hidden": "true", style: { inlineSize: "70%" } } },
            { of: "Skeleton", props: { "aria-hidden": "true", style: { inlineSize: "40%", blockSize: "0.75em" } } },
          ],
        },
      ],
    },
    { of: "Skeleton", props: { "aria-hidden": "true", style: { blockSize: "5rem", borderRadius: "var(--radius-surface)" } } },
    { of: "Skeleton", props: { "aria-hidden": "true", style: { inlineSize: "90%" } } },
    { of: "Skeleton", props: { "aria-hidden": "true", style: { inlineSize: "60%" } } },
  ],
});

export const Skeleton = mirrored({
  scene: () => ({
    of: "div",
    props: {
      "aria-busy": "true",
      style: { display: "grid", gap: "var(--space-5)", gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))" },
    },
    children: [{ of: "span", props: { className: "odd-visually-hidden" }, children: ["Loading decks…"] }, card(), card()],
  }),
  aria: `
- text: Loading decks…`,
});
