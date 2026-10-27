import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Surfaces",
  parameters: {
    docs: {
      description: {
        component:
          "`Badge` from `odd-design/react` renders `span.odd-badge`. `tone` sets the color to `neutral`, `primary`, `success`, `warning`, `danger`, or `info`, and leaving it out is neutral. `solid` fills the badge with its tone.",
      },
    },
  },
};

export default meta;

const tones = [
  [undefined, "Neutral"],
  ["primary", "Primary"],
  ["success", "Legal"],
  ["warning", "Rotating"],
  ["danger", "Banned"],
  ["info", "New set"],
] as const;

export const Badge = mirrored({
  scene: () => ({
    of: "div",
    props: { className: "odd-stack" },
    children: [false, true].map((solid) => ({
      of: "div",
      props: { className: "odd-row" },
      children: tones.map(([tone, label]) => ({ of: "Badge", props: { tone, solid }, children: [label] })),
    })),
  }),
  aria: `
- text: Neutral Primary Legal Rotating Banned New set Neutral Primary Legal Rotating Banned New set`,
});
