import { Row, TextLink } from "odd-design/react";
import { mirrored } from "../mirror.ts";

type Args = {
  label: string;
  current: "none" | "page";
};

const meta = {
  title: "Components/Link",
  args: { label: "Read the guide", current: "none" },
  argTypes: {
    current: { control: "inline-radio", options: ["none", "page"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "`TextLink` from `odd-design/react` renders `a.odd-link`, a text link with an `href`, through the router link that `OddProvider` supplies. It looks like every bare `a`. `current` marks the link to the page you are on with `aria-current=\"page\"`, which takes the text color and drops the underline. `newTab` opens a new tab and says so to a screen reader, and `tooltip` adds a tooltip that describes the link. A link that looks like a button is a Button with `href`.",
      },
    },
  },
};

export default meta;

export const Playground = mirrored<Args>({
  scene: ({ label, current }) => (
    <TextLink href="#guide" current={current === "page"}>
      {label}
    </TextLink>
  ),
  aria: `
- link "Read the guide":
  - /url: "#guide"`,
});

export const States = mirrored<Args>({
  scene: () => (
    <Row>
      <TextLink href="#settings">Settings</TextLink>
      <TextLink href="#roadmap" current>
        Roadmap
      </TextLink>
    </Row>
  ),
  aria: `
- link "Settings":
  - /url: "#settings"
- link "Roadmap":
  - /url: "#roadmap"`,
});

export const InText = mirrored<Args>({
  scene: () => (
    <p>
      Read the <TextLink href="#guide">setup guide</TextLink>, then open <TextLink href="#settings">Settings</TextLink>.
    </p>
  ),
  aria: `
- paragraph:
  - text: Read the
  - link "setup guide":
    - /url: "#guide"
  - text: ", then open"
  - link "Settings":
    - /url: "#settings"
  - text: .`,
});
