import { Disclosure as OddDisclosure, Grid, GridItem } from "odd-design/react";
import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Surfaces",
  parameters: {
    docs: {
      description: {
        component:
          "`Disclosure` from `odd-design/react` renders `details.odd-disclosure` with its `summary` as the toggle and its children as the answer. `defaultOpen` opens it first, and the browser owns every toggle after that. Every disclosure that shares a `name` joins one exclusive group, so opening one closes the others with no script.",
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
  scene: () => (
    <Grid>
      <GridItem span={6}>
        {faq.map(([question, answer], index) => (
          <OddDisclosure key={question} name="faq" summary={question} defaultOpen={index === 0}>
            {answer}
          </OddDisclosure>
        ))}
      </GridItem>
    </Grid>
  ),
  aria: `
- group: What’s the difference between chrome and palette? Chrome is shape, type, depth, and motion. Palette is color. You can pair any chrome with any palette.
- group: Does it need JavaScript?
- group: Does it respect reduced motion?`,
});
