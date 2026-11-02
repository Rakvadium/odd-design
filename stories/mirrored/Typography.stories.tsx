import { Eyebrow, Heading, Stack } from "odd-design/react";
import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Typography",
  parameters: {
    docs: {
      description: {
        component:
          "`Heading` from `odd-design/react` renders `h{level}.odd-heading`. `level` follows the outline and `size` sets the look, so the two stay apart. A heading without `size` is md. `Eyebrow` renders `p.odd-eyebrow`, a short label above a heading. It is muted unless `tone` is `primary` or `foreground`.",
      },
    },
  },
};

export default meta;

const SIZES = ["hero", "2xl", "xl", "lg", undefined, "sm", "xs"] as const;

export const Sizes = mirrored({
  scene: () => (
    <Stack>
      {SIZES.map((size) => (
        <Heading key={size ?? "md"} level={2} size={size}>
          {size ?? "md"} · Quarterly report
        </Heading>
      ))}
    </Stack>
  ),
  aria: `
- heading "hero · Quarterly report" [level=2]
- heading "2xl · Quarterly report" [level=2]
- heading "xl · Quarterly report" [level=2]
- heading "lg · Quarterly report" [level=2]
- heading "md · Quarterly report" [level=2]
- heading "sm · Quarterly report" [level=2]
- heading "xs · Quarterly report" [level=2]`,
});

const TONES = [
  ["Muted", undefined],
  ["Primary", "primary"],
  ["Foreground", "foreground"],
] as const;

export const Variants = mirrored({
  scene: () => (
    <Stack>
      {TONES.map(([name, tone]) => (
        <div key={name}>
          <Eyebrow tone={tone}>{name}</Eyebrow>
          <Heading level={2} size="lg">
            Quarterly report
          </Heading>
        </div>
      ))}
    </Stack>
  ),
  aria: `
- paragraph: Muted
- heading "Quarterly report" [level=2]
- paragraph: Primary
- heading "Quarterly report" [level=2]
- paragraph: Foreground
- heading "Quarterly report" [level=2]`,
});
