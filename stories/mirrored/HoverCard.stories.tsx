import { Avatar, Badge, Heading, HoverCard as OddHoverCard, HoverCardLink, Muted, Row, Stack } from "odd-design/react";
import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Overlays",
  parameters: {
    docs: {
      description: {
        component:
          "`HoverCard` from `odd-design/react` wraps the block that holds a `HoverCardLink` and renders `div.odd-hover-card` with `popover=\"hint\"` right after it. The card opens while the pointer or keyboard focus rests on the link, and stays open while the pointer is over it. Everything in it is also on the page the link opens, so it's never the only way to the content. `HoverCard` installs the interest fallback itself where the browser lacks `interestfor`.",
      },
    },
  },
};

export default meta;

function winner() {
  return (
    <OddHoverCard
      id="preview-midnight"
      preview={
        <Stack>
          <Row>
            <Avatar name="Mira Okafor" decorative />
            <div>
              <Heading level={2} size="sm">
                Midnight Control
              </Heading>
              <Muted>by Mira Okafor</Muted>
            </div>
          </Row>
          <p>Grinds out card advantage, then wins with one big turn.</p>
          <Row>
            <Badge tone="success">Legal</Badge>
            <Badge>60 cards</Badge>
            <Badge tone="info">Extended</Badge>
          </Row>
        </Stack>
      }
    >
      <p>
        Last week’s winner was <HoverCardLink href="#midnight">Midnight Control</HoverCardLink>, a slow list that wins on card advantage.
      </p>
    </OddHoverCard>
  );
}

const closed = `
- paragraph:
  - text: Last week’s winner was
  - link "Midnight Control":
    - /url: "#midnight"
  - text: ", a slow list that wins on card advantage."`;

export const HoverCard = mirrored({ scene: winner, aria: closed });

export const HoverCardOpen = {
  ...mirrored({
    scene: winner,
    aria: `${closed}
- heading "Midnight Control" [level=2]
- paragraph: by Mira Okafor
- paragraph: Grinds out card advantage, then wins with one big turn.
- text: Legal 60 cards Extended`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const link = canvasElement.querySelector<HTMLElement>('[interestfor="preview-midnight"]')!;
    const card = canvasElement.querySelector<HTMLElement>("#preview-midnight")!;
    card.showPopover({ source: link } as ShowPopoverOptions);
    await Promise.all(card.getAnimations().map((animation) => animation.finished));
  },
};
