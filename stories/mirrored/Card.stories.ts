import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Surfaces",
  parameters: {
    docs: {
      description: {
        component:
          "`Card` from `odd-design/react` renders `article.odd-card`. `interactive` sets `data-interactive`, which makes the whole card clickable through the one `CardLink` inside its title. Screen readers hear a single link named by the title. `CardLink` renders `a.odd-card-link` and needs an `href`. `CardFooter` renders `div.odd-card-footer`. Write the title as a heading at the level your page needs, with `className=\"odd-card-title\"`.",
      },
    },
  },
};

export default meta;

export const Card = mirrored({
  scene: () => ({
    of: "div",
    props: { style: { display: "grid", gap: "var(--space-5)", gridTemplateColumns: "repeat(auto-fill, minmax(17rem, 1fr))" } },
    children: [
      {
        of: "Card",
        children: [
          { of: "p", props: { className: "odd-eyebrow" }, children: ["Static"] },
          { of: "h3", props: { className: "odd-card-title" }, children: ["Midnight Control"] },
          { of: "p", props: { className: "odd-muted" }, children: ["A slow, grindy list that wins on card advantage."] },
          {
            of: "CardFooter",
            children: [
              { of: "Badge", props: { tone: "success" }, children: ["Legal"] },
              { of: "Badge", children: ["60 cards"] },
            ],
          },
        ],
      },
      {
        of: "Card",
        props: { interactive: true },
        children: [
          { of: "p", props: { className: "odd-eyebrow" }, children: ["Interactive"] },
          { of: "h3", props: { className: "odd-card-title" }, children: [{ of: "CardLink", props: { href: "#" }, children: ["Ember Aggro"] }] },
          { of: "p", props: { className: "odd-muted" }, children: ["The whole card is clickable. Screen readers hear a single link."] },
          { of: "CardFooter", children: [{ of: "Badge", props: { tone: "warning" }, children: ["Rotating soon"] }] },
        ],
      },
    ],
  }),
  aria: `
- article:
  - paragraph: Static
  - heading "Midnight Control" [level=3]
  - paragraph: A slow, grindy list that wins on card advantage.
  - text: Legal 60 cards
- article:
  - paragraph: Interactive
  - heading "Ember Aggro" [level=3]:
    - link "Ember Aggro":
      - /url: "#"
  - paragraph: The whole card is clickable. Screen readers hear a single link.
  - text: Rotating soon`,
});
