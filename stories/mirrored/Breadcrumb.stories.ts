import { mirrored, type Node } from "../mirror.ts";

type Args = {
  label: string;
  levels: number;
};

const meta = {
  title: "Components/Breadcrumb",
  args: { label: "Breadcrumb", levels: 3 },
  argTypes: {
    levels: { control: { type: "range", min: 1, max: 5, step: 1 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "`Breadcrumb` from `odd-design/react` renders `nav.odd-breadcrumb`, the trail to the current page. Name it with `aria-label` or `aria-labelledby`, and put an `ol` inside with one `li` per level. Each level with a page is a `TextLink`, and the last one has `aria-current=\"page\"`. A level with no page of its own is plain text in its `li`. CSS draws the slashes, which screen readers do not read, and a long trail wraps.",
      },
    },
  },
};

export default meta;

type Level = readonly [label: string, href: string | null];

const LEVELS: readonly Level[] = [
  ["Home", "#home"],
  ["Settings", "#settings"],
  ["Projects", "#projects"],
  ["Roadmap", "#roadmap"],
  ["Milestones", "#milestones"],
];

function crumb([label, href]: Level, current: boolean): Node<"li"> {
  if (href === null) return { of: "li", children: [label] };
  return { of: "li", children: [{ of: "TextLink", props: { href, "aria-current": current ? "page" : undefined }, children: [label] }] };
}

function trail(label: string, levels: readonly Level[]): Node<"Breadcrumb"> {
  return {
    of: "Breadcrumb",
    props: { "aria-label": label },
    children: [{ of: "ol", children: levels.map((level, index) => crumb(level, index === levels.length - 1)) }],
  };
}

export const Playground = mirrored<Args>({
  scene: ({ label, levels }) => trail(label, LEVELS.slice(0, Number(levels))),
  aria: `
- navigation "Breadcrumb":
  - list:
    - listitem:
      - link "Home":
        - /url: "#home"
    - listitem:
      - link "Settings":
        - /url: "#settings"
    - listitem:
      - link "Projects":
        - /url: "#projects"`,
});

export const Parts = mirrored<Args>({
  scene: () => ({
    of: "div",
    props: { className: "odd-stack" },
    children: [
      trail("Breadcrumb", [
        ["Home", "#home"],
        ["Projects", "#projects"],
        ["Roadmap", "#roadmap"],
      ]),
      trail("Settings breadcrumb", [
        ["Home", "#home"],
        ["Settings", "#settings"],
        ["Archived", null],
        ["Notifications", "#notifications"],
      ]),
      trail("Home breadcrumb", [["Home", "#home"]]),
    ],
  }),
  aria: `
- navigation "Breadcrumb":
  - list:
    - listitem:
      - link "Home":
        - /url: "#home"
    - listitem:
      - link "Projects":
        - /url: "#projects"
    - listitem:
      - link "Roadmap":
        - /url: "#roadmap"
- navigation "Settings breadcrumb":
  - list:
    - listitem:
      - link "Home":
        - /url: "#home"
    - listitem:
      - link "Settings":
        - /url: "#settings"
    - listitem: Archived
    - listitem:
      - link "Notifications":
        - /url: "#notifications"
- navigation "Home breadcrumb":
  - list:
    - listitem:
      - link "Home":
        - /url: "#home"`,
});

export const Wrapping = mirrored<Args>({
  scene: () => ({
    of: "div",
    props: { style: { maxInlineSize: "16rem" } },
    children: [trail("Breadcrumb", LEVELS)],
  }),
  aria: `
- navigation "Breadcrumb":
  - list:
    - listitem:
      - link "Home":
        - /url: "#home"
    - listitem:
      - link "Settings":
        - /url: "#settings"
    - listitem:
      - link "Projects":
        - /url: "#projects"
    - listitem:
      - link "Roadmap":
        - /url: "#roadmap"
    - listitem:
      - link "Milestones":
        - /url: "#milestones"`,
});
