import { Badge, Button, Heading, Muted, Row, Scope, SkipLink, Stack, VisuallyHidden } from "odd-design/react";
import { mirrored } from "../story.ts";

const meta = {
  title: "Components/Base Utilities",
  parameters: {
    docs: {
      description: {
        component:
          "`Stack` lays its children out in a column and `Row` in a wrapping row, each with its default gap. `Muted` dims secondary text. `VisuallyHidden` holds text only a screen reader reads. `SkipLink` is the first focusable element on a page and slides in at the top when Tab reaches it. `Scope` gives a subtree its own chrome, palette, and mode, and takes all three.",
      },
    },
  },
};

export default meta;

const items = (
  <>
    <Badge>One</Badge>
    <Badge>Two</Badge>
    <Badge>Three</Badge>
  </>
);

export const Parts = mirrored({
  scene: () => (
    <Stack>
      <Stack as="section" aria-labelledby="base-stack-title">
        <Heading level={2} size="sm" id="base-stack-title">
          Stack
        </Heading>
        <Row>
          <Stack>{items}</Stack>
        </Row>
      </Stack>
      <Stack as="section" aria-labelledby="base-row-title">
        <Heading level={2} size="sm" id="base-row-title">
          Row
        </Heading>
        <Row>{items}</Row>
      </Stack>
      <Stack as="section" aria-labelledby="base-muted-title">
        <Heading level={2} size="sm" id="base-muted-title">
          Muted
        </Heading>
        <p>
          Upload finished. <Muted as="span">2 minutes ago</Muted>
        </p>
      </Stack>
      <Stack as="section" aria-labelledby="base-hidden-title">
        <Heading level={2} size="sm" id="base-hidden-title">
          VisuallyHidden
        </Heading>
        <p>
          <span aria-hidden="true">★★★★☆</span>
          <VisuallyHidden>4 of 5 stars</VisuallyHidden>
        </p>
      </Stack>
      <Stack as="section" aria-labelledby="base-skip-title">
        <Heading level={2} size="sm" id="base-skip-title">
          SkipLink
        </Heading>
        <SkipLink href="#base-skip-target">Skip to content</SkipLink>
        <Row as="nav" aria-label="Example">
          <a href="#base-skip-title">Home</a>
          <a href="#base-skip-title">Reports</a>
          <a href="#base-skip-title">Settings</a>
        </Row>
        <p id="base-skip-target">Tab to the skip link and it slides in at the top of the page, ahead of these links.</p>
      </Stack>
      <Stack as="section" aria-labelledby="base-scope-title">
        <Heading level={2} size="sm" id="base-scope-title">
          Scope
        </Heading>
        <Scope chrome="expressive" palette="aurora" mode="dark">
          <Stack>
            <p>This box sets its own chrome, palette, and mode.</p>
            <Row>
              <Button variant="primary">Save draft</Button>
              <Button>Cancel</Button>
            </Row>
          </Stack>
        </Scope>
      </Stack>
    </Stack>
  ),
  aria: `
- region "Stack":
  - heading "Stack" [level=2]
  - text: One Two Three
- region "Row":
  - heading "Row" [level=2]
  - text: One Two Three
- region "Muted":
  - heading "Muted" [level=2]
  - paragraph: Upload finished. 2 minutes ago
- region "VisuallyHidden":
  - heading "VisuallyHidden" [level=2]
  - paragraph: 4 of 5 stars
- region "SkipLink":
  - heading "SkipLink" [level=2]
  - link "Skip to content":
    - /url: "#base-skip-target"
  - navigation "Example":
    - link "Home":
      - /url: "#base-skip-title"
    - link "Reports":
      - /url: "#base-skip-title"
    - link "Settings":
      - /url: "#base-skip-title"
  - paragraph: Tab to the skip link and it slides in at the top of the page, ahead of these links.
- region "Scope":
  - heading "Scope" [level=2]
  - paragraph: This box sets its own chrome, palette, and mode.
  - button "Save draft"
  - button "Cancel"`,
});
