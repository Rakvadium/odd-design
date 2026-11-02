import { Button, Eyebrow, Heading, Row, Spinner, Stack } from "odd-design/react";
import { mirrored } from "../story.ts";

type Args = {
  label: string;
};

const meta = {
  title: "Components/Spinner",
  args: { label: "Loading projects…" },
  parameters: {
    docs: {
      description: {
        component:
          "`Spinner` from `odd-design/react` renders `span.odd-spinner`, a turning ring that is decoration, with `aria-hidden=\"true\"` and no children. The region that is loading has `aria-busy=\"true\"` and says what is loading, in words beside the ring or in the spinner's `label`, which it reads from a hidden span. The ring is 1em across in the text color, so the text it sits in sizes it. Under reduced motion it turns slower instead of stopping. A Button that is working takes `busy` and draws its own ring.",
      },
    },
  },
};

export default meta;

export const Playground = mirrored<Args>({
  scene: ({ label }) => (
    <Row aria-busy="true">
      <Spinner /> {label}
    </Row>
  ),
  aria: `- text: Loading projects…`,
});

export const Parts = mirrored<Args>({
  scene: () => (
    <Stack>
      <Row aria-busy="true">
        <Spinner /> Loading projects…
      </Row>
      <Row aria-busy="true">
        <Spinner label="Loading reports…" />
      </Row>
      <div aria-busy="true">
        <Eyebrow>
          <Spinner /> Syncing
        </Eyebrow>
      </div>
      <p aria-busy="true">
        <Spinner /> Syncing
      </p>
      <div aria-busy="true">
        <Heading level={3} size="xl">
          <Spinner /> Syncing
        </Heading>
      </div>
    </Stack>
  ),
  aria: `
- text: Loading projects… Loading reports…
- paragraph: Syncing
- paragraph: Syncing
- heading "Syncing" [level=3]`,
});

export const States = mirrored<Args>({
  scene: () => (
    <Row>
      <Row aria-busy="true">
        <Spinner /> Loading projects…
      </Row>
      <Row>3 projects</Row>
      <Button variant="primary" busy>
        Saving…
      </Button>
    </Row>
  ),
  aria: `
- text: Loading projects… 3 projects
- button "Saving…"`,
});
