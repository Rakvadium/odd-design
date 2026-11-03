import { Button, Checkbox, Grid, GridItem, Popover as OddPopover, Row, Separator } from "odd-design/react";
import { icon, mirrored } from "../story.ts";
import { opened } from "../opened.ts";

const meta = {
  title: "Components/Overlays",
  parameters: {
    docs: {
      description: {
        component:
          "`Popover` from `odd-design/react` renders its `trigger`, then `div.odd-popover` with `popover=\"auto\"`. The trigger gets `command=\"toggle-popover\"` and `commandfor`, and a `Button` with `command=\"close\"` inside hides the popover. The browser owns the rest: the top layer, Escape, a click outside, focus return, and the invoker's expanded state. With a `title`, the popover is a dialog named by that title, for a popover that holds controls. Without one it takes no role and no name. The right-hand trigger sits near the edge, so its popover flips to stay on screen.",
      },
    },
  },
};

export default meta;

function filters(id: string) {
  return (
    <OddPopover
      id={id}
      title="Filter decks"
      trigger={
        <Button>
          {icon("filter")} Filters
        </Button>
      }
    >
      <Checkbox label="Legal only" defaultChecked />
      <Checkbox label="Has sideboard" />
      <Checkbox label="Edited this week" />
      <Separator />
      <Row>
        <Button size="sm" variant="ghost" command="close">
          Cancel
        </Button>
        <Button size="sm" variant="primary" command="close">
          Apply
        </Button>
      </Row>
    </OddPopover>
  );
}

function pair() {
  return (
    <Grid>
      <GridItem span={10}>{filters("filters")}</GridItem>
      <GridItem span={2}>{filters("filters-end")}</GridItem>
    </Grid>
  );
}

export const Popover = mirrored({
  scene: pair,
  aria: `
- button "Filters"
- button "Filters"`,
});

export const PopoverOpen = opened("filters", {
  scene: pair,
  aria: `
- button "Filters"
- dialog "Filter decks":
  - paragraph: Filter decks
  - checkbox "Legal only" [checked]
  - text: Legal only
  - checkbox "Has sideboard"
  - text: Has sideboard
  - checkbox "Edited this week"
  - text: Edited this week
  - separator
  - button "Cancel"
  - button "Apply"
- button "Filters"`,
});
