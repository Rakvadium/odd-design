import { Card, Grid, GridItem, Heading, Stack, type GridSpan } from "odd-design/react";
import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Grid",
  parameters: {
    docs: {
      description: {
        component:
          "`Grid` from `odd-design/react` renders `div.odd-grid`, 12 columns that measure the grid's own width. Each child is a `GridItem`, whose `span` sets how many columns it takes. A `GridItem` with no `span` takes the full row. Under 64rem a span of 5 or fewer takes half the row, and under 40rem every child takes the full row.",
      },
    },
  },
};

export default meta;

function cells(spans: readonly (GridSpan | undefined)[]) {
  return spans.map((span, index) => (
    <GridItem key={index} span={span}>
      <Card>{span ?? "No span"}</Card>
    </GridItem>
  ));
}

/** Each span beside the span that fills its row, then a child with no span. */
const ROWS = [...Array.from({ length: 12 }, (_, index) => (index + 1) as GridSpan).flatMap((span) => (span < 12 ? [span, (12 - span) as GridSpan] : [span])), undefined];

export const Variants = mirrored({
  scene: () => (
    <Stack>
      <Stack as="section" aria-labelledby="grid-spans-title">
        <Heading level={2} size="sm" id="grid-spans-title">
          Span 1 to 12
        </Heading>
        <Grid>{cells(ROWS)}</Grid>
      </Stack>
      <Grid>
        <GridItem span={8}>
          <Stack as="section" aria-labelledby="grid-half-title">
            <Heading level={2} size="sm" id="grid-half-title">
              In a span of 8, under 64rem
            </Heading>
            <Grid>{cells([3, 3, 5, 8])}</Grid>
          </Stack>
        </GridItem>
        <GridItem span={4}>
          <Stack as="section" aria-labelledby="grid-full-title">
            <Heading level={2} size="sm" id="grid-full-title">
              In a span of 4, under 40rem
            </Heading>
            <Grid>{cells([4, 4, 8])}</Grid>
          </Stack>
        </GridItem>
      </Grid>
    </Stack>
  ),
  aria: `
- region "Span 1 to 12":
  - heading "Span 1 to 12" [level=2]
  - article: "1"
  - article: "11"
  - article: "2"
  - article: "10"
  - article: "3"
  - article: "9"
  - article: "4"
  - article: "8"
  - article: "5"
  - article: "7"
  - article: "6"
  - article: "6"
  - article: "7"
  - article: "5"
  - article: "8"
  - article: "4"
  - article: "9"
  - article: "3"
  - article: "10"
  - article: "2"
  - article: "11"
  - article: "1"
  - article: "12"
  - article: No span
- region "In a span of 8, under 64rem":
  - heading "In a span of 8, under 64rem" [level=2]
  - article: "3"
  - article: "3"
  - article: "5"
  - article: "8"
- region "In a span of 4, under 40rem":
  - heading "In a span of 4, under 40rem" [level=2]
  - article: "4"
  - article: "4"
  - article: "8"`,
});
