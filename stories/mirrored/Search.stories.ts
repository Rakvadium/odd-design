import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Forms",
  parameters: {
    docs: {
      description: {
        component:
          "`Search` from `odd-design/react` renders `search.odd-search`, the search landmark. The label is visually hidden but still names the field. Put the label, the magnifier `svg` with `aria-hidden=\"true\"`, and an `Input` with `type=\"search\"` directly inside it. With a `<form>` around it, Enter submits.",
      },
    },
  },
};

export default meta;

export const Search = mirrored({
  scene: () => ({
    of: "div",
    props: { className: "odd-stack", style: { maxInlineSize: "26rem" } },
    children: [
      {
        of: "form",
        props: { method: "dialog" },
        children: [
          {
            of: "Search",
            children: [
              { of: "label", props: { className: "odd-visually-hidden", htmlFor: "card-search" }, children: ["Search cards"] },
              { icon: "search" },
              { of: "Input", props: { type: "search", id: "card-search", name: "q", placeholder: "Search cards", defaultValue: "Ember" } },
            ],
          },
        ],
      },
    ],
  }),
  aria: `
- search:
  - text: Search cards
  - searchbox "Search cards": Ember`,
});
