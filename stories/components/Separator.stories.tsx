import { Grid, GridItem, Heading, Muted, Row, Separator as OddSeparator, Stack } from "odd-design/react";
import { mirrored } from "../story.ts";

const meta = {
  title: "Components/Data Display",
  parameters: {
    docs: {
      description: {
        component:
          "`Separator` from `odd-design/react` renders `hr.odd-separator`, which screen readers announce as a separator. A horizontal line needs no props. Between inline items, pass `orientation=\"vertical\"` and put it inside a `Row`, which stretches it to the row's height. It takes no children. For a line that means nothing, draw a border on the container instead.",
      },
    },
  },
};

export default meta;

export const Separator = mirrored({
  scene: () => (
    <Grid>
      <GridItem span={5}>
        <Stack>
          <Stack>
            <Heading level={3}>Deck notes</Heading>
            <Muted>Mulligan aggressively for an early unit.</Muted>
          </Stack>
          <OddSeparator />
          <Stack>
            <Heading level={3}>Sideboard</Heading>
            <Muted>Bring in the control package against tempo decks.</Muted>
          </Stack>
          <OddSeparator />
          <Row>
            <a href="#">Edit</a>
            <OddSeparator orientation="vertical" />
            <a href="#">Duplicate</a>
            <OddSeparator orientation="vertical" />
            <a href="#">Export</a>
          </Row>
        </Stack>
      </GridItem>
    </Grid>
  ),
  aria: `
- heading "Deck notes" [level=3]
- paragraph: Mulligan aggressively for an early unit.
- separator
- heading "Sideboard" [level=3]
- paragraph: Bring in the control package against tempo decks.
- separator
- link "Edit":
  - /url: "#"
- separator
- link "Duplicate":
  - /url: "#"
- separator
- link "Export":
  - /url: "#"`,
});
