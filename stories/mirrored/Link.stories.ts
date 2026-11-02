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
          "`TextLink` from `odd-design/react` renders `a.odd-link`, a text link with an `href`. It looks like every bare `a`. `aria-current=\"page\"` marks the link to the page you are on, which takes the text color and drops the underline. A link that looks like a button is a Button with `href`. A link with `target` needs `rel=\"noopener\"` and words that say it opens a new tab.",
      },
    },
  },
};

export default meta;

export const Playground = mirrored<Args>({
  scene: ({ label, current }) => ({
    of: "TextLink",
    props: { href: "#guide", "aria-current": current === "none" ? undefined : current },
    children: [label],
  }),
  aria: `
- link "Read the guide":
  - /url: "#guide"`,
});

export const States = mirrored<Args>({
  scene: () => ({
    of: "div",
    props: { className: "odd-row" },
    children: [
      { of: "TextLink", props: { href: "#settings" }, children: ["Settings"] },
      { of: "TextLink", props: { href: "#roadmap", "aria-current": "page" }, children: ["Roadmap"] },
    ],
  }),
  aria: `
- link "Settings":
  - /url: "#settings"
- link "Roadmap":
  - /url: "#roadmap"`,
});

export const InText = mirrored<Args>({
  scene: () => ({
    of: "p",
    children: [
      "Read the ",
      { of: "TextLink", props: { href: "#guide" }, children: ["setup guide"] },
      ", then open ",
      { of: "TextLink", props: { href: "#settings" }, children: ["Settings"] },
      ".",
    ],
  }),
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
