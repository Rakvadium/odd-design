import { Alert as OddAlert, Grid, GridItem, Stack } from "odd-design/react";
import { icon, mirrored } from "../story.ts";

const meta = {
  title: "Components/Feedback",
  parameters: {
    docs: {
      description: {
        component:
          "`Alert` from `odd-design/react` renders `div.odd-alert`: its `icon` first, hidden from screen readers, then the `title` in `p.odd-alert-title` and the message. `tone` sets `data-tone` to `info`, `success`, `warning`, or `danger`. Leaving `tone` out is the neutral tint. Static alerts need no role. For a message that appears later, insert the alert into an existing role=status container, or role=alert for errors. Text is `--foreground` on a soft tint in every tone.",
      },
    },
  },
};

export default meta;

export const Alert = mirrored({
  scene: () => (
    <Grid>
      <GridItem span={6}>
        <Stack>
          <OddAlert icon={icon("info")} title="Drafts are private">
            <p>Only you can see a deck until you publish it.</p>
          </OddAlert>
          <OddAlert tone="info" icon={icon("info")} title="New set available">
            <p>“Ember Tide” cards are now in the gallery.</p>
          </OddAlert>
          <OddAlert tone="success" icon={icon("check")} title="Deck published">
            <p>Midnight Control is live on your profile.</p>
          </OddAlert>
          <OddAlert tone="warning" icon={icon("warning")} title="Rotation is coming">
            <p>
              Three of your decks lose legality on May 1. <a href="#">Review them</a>.
            </p>
          </OddAlert>
          <OddAlert tone="danger" icon={icon("danger")} title="Couldn’t save">
            <p>You’re offline. Your changes are kept on this device.</p>
          </OddAlert>
        </Stack>
      </GridItem>
    </Grid>
  ),
  aria: `
- paragraph: Drafts are private
- paragraph: Only you can see a deck until you publish it.
- paragraph: New set available
- paragraph: “Ember Tide” cards are now in the gallery.
- paragraph: Deck published
- paragraph: Midnight Control is live on your profile.
- paragraph: Rotation is coming
- paragraph:
  - text: Three of your decks lose legality on May 1.
  - link "Review them":
    - /url: "#"
  - text: .
- paragraph: Couldn’t save
- paragraph: You’re offline. Your changes are kept on this device.`,
});
