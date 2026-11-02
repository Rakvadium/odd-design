import { Badge as OddBadge, Row, Stack } from "odd-design/react";
import { mirrored } from "../story.ts";

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
  scene: () => (
    <Stack>
      {[false, true].map((solid) => (
        <Row key={String(solid)}>
          {tones.map(([tone, label]) => (
            <OddBadge key={label} tone={tone} solid={solid}>
              {label}
            </OddBadge>
          ))}
        </Row>
      ))}
    </Stack>
  ),
  aria: `
- text: Neutral Primary Legal Rotating Banned New set Neutral Primary Legal Rotating Banned New set`,
});
