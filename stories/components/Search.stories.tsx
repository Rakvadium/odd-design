import { Grid, GridItem, Search as SearchField } from "odd-design/react";
import { mirrored } from "../story.ts";

const meta = {
  title: "Components/Forms",
  parameters: {
    docs: {
      description: {
        component:
          "`Search` from `odd-design/react` renders `search.odd-search`, the search landmark, with a hidden label that still names the field, the magnifier, and an input with `type=\"search\"`. `label` is required. With `onSubmit`, the search sits in a form and Enter submits. Without it, the search filters as the user types.",
      },
    },
  },
};

export default meta;

export const Search = mirrored({
  scene: () => (
    <Grid>
      <GridItem span={4}>
        <SearchField id="card-search" label="Search cards" name="q" placeholder="Search cards" defaultValue="Ember" />
      </GridItem>
    </Grid>
  ),
  aria: `
- search:
  - text: Search cards
  - searchbox "Search cards": Ember`,
});
