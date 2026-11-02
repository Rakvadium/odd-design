import { Badge, Card as OddCard, Grid, GridItem } from "odd-design/react";
import { mirrored } from "../story.ts";

const meta = {
  title: "Components/Surfaces",
  parameters: {
    docs: {
      description: {
        component:
          "`Card` from `odd-design/react` renders `article.odd-card`: an `eyebrow`, the `title` as `h3.odd-card-title` (`headingLevel` changes the level), a muted `description`, the content, and a `footer`. With `href`, the whole card is clickable through the one `a.odd-card-link` it writes inside its title, and screen readers hear a single link named by the title. `as` makes it a `section` or a `div`.",
      },
    },
  },
};

export default meta;

export const Card = mirrored({
  scene: () => (
    <Grid>
      <GridItem span={4}>
        <OddCard
          eyebrow="Static"
          title="Midnight Control"
          description="A slow, grindy list that wins on card advantage."
          footer={
            <>
              <Badge tone="success">Legal</Badge>
              <Badge>60 cards</Badge>
            </>
          }
        />
      </GridItem>
      <GridItem span={4}>
        <OddCard
          href="#"
          eyebrow="Interactive"
          title="Ember Aggro"
          description="The whole card is clickable. Screen readers hear a single link."
          footer={<Badge tone="warning">Rotating soon</Badge>}
        />
      </GridItem>
    </Grid>
  ),
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
