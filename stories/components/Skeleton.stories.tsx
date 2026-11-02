import { Card, Grid, GridItem, Skeleton as OddSkeleton, Stack, VisuallyHidden } from "odd-design/react";
import { mirrored } from "../story.ts";

const meta = {
  title: "Components/Feedback",
  parameters: {
    docs: {
      description: {
        component:
          "`Skeleton` from `odd-design/react` renders `div.odd-skeleton`, a decorative block that holds the place of content while it loads. Every block is `aria-hidden=\"true\"` and takes no children. A block fills its container's width at 1em tall, so its container sizes it. `shape=\"avatar\"` draws a block that matches a default avatar, and follows the chrome's chip radius. The region that is filling in has `aria-busy=\"true\"` and says “Loading” in a `VisuallyHidden`, and both go away when the content arrives. The pulse follows `--duration-slow`, so reduced motion stops it.",
      },
    },
  },
};

export default meta;

function card() {
  return (
    <Card aria-hidden="true">
      <Stack>
        <OddSkeleton shape="avatar" />
        <OddSkeleton />
        <OddSkeleton />
        <OddSkeleton />
      </Stack>
    </Card>
  );
}

export const Skeleton = mirrored({
  scene: () => (
    <Grid aria-busy="true">
      <VisuallyHidden>Loading decks…</VisuallyHidden>
      <GridItem span={4}>{card()}</GridItem>
      <GridItem span={4}>{card()}</GridItem>
    </Grid>
  ),
  aria: `
- text: Loading decks…`,
});
