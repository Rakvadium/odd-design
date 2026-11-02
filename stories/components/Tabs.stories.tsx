import { Grid, GridItem, Stack, Tabs as OddTabs } from "odd-design/react";
import { mirrored } from "../story.ts";

const meta = {
  title: "Components/Interactive",
  parameters: {
    docs: {
      description: {
        component:
          "`Tabs` from `odd-design/react` takes `label` and a `tabs` array of `{ value, label, content, disabled }`, and renders `div.odd-tabs` with the tablist, each tab wired to its panel by id, and `enhanceTabs` on it: one tab stop, arrows and Home/End move between tabs, and the panel follows. `defaultValue` is chosen first. The second set has `activation=\"manual\"`, so arrows only move focus and Enter or Space chooses.",
      },
    },
  },
};

export default meta;

export const Tabs = mirrored({
  scene: () => (
    <Grid>
      <GridItem span={6}>
        <Stack>
          <OddTabs
            id="deck-tabs"
            label="Deck view"
            tabs={[
              { value: "cards", label: "Cards", content: <p>60 cards across 24 units, 22 actions, and 14 assets.</p> },
              { value: "stats", label: "Stats", content: <p>Average cost 2.4. Curve peaks at 3.</p> },
              {
                value: "notes",
                label: "Notes",
                content: (
                  <p>
                    Mulligan aggressively for an early unit. <a href="#">Edit notes</a>
                  </p>
                ),
              },
            ]}
          />
          <OddTabs
            id="manual-tabs"
            label="Season"
            activation="manual"
            tabs={[
              { value: "s7", label: "Season 7", content: <p>Current season. Rotation on May 1.</p> },
              { value: "s6", label: "Season 6", content: <p>Archived results.</p> },
              { value: "s5", label: "Season 5", content: <p>Not imported yet.</p>, disabled: true },
            ]}
          />
        </Stack>
      </GridItem>
    </Grid>
  ),
  aria: `
- tablist "Deck view":
  - tab "Cards" [selected]
  - tab "Stats"
  - tab "Notes"
- tabpanel "Cards":
  - paragraph: 60 cards across 24 units, 22 actions, and 14 assets.
- tablist "Season":
  - tab "Season 7" [selected]
  - tab "Season 6"
  - tab "Season 5" [disabled]
- tabpanel "Season 7":
  - paragraph: Current season. Rotation on May 1.`,
});

export const TabsVertical = mirrored({
  scene: () => (
    <Grid>
      <GridItem span={6}>
        <OddTabs
          id="settings-tabs"
          label="Deck settings"
          orientation="vertical"
          tabs={[
            { value: "general", label: "General", content: <p>Name, format, and cover card.</p> },
            { value: "sharing", label: "Sharing", content: <p>Anyone with the link can view this deck.</p> },
            { value: "archive", label: "Archive", content: <p>Archived decks leave your list but keep their history.</p> },
          ]}
        />
      </GridItem>
    </Grid>
  ),
  aria: `
- tablist "Deck settings":
  - tab "General" [selected]
  - tab "Sharing"
  - tab "Archive"
- tabpanel "General":
  - paragraph: Name, format, and cover card.`,
});
