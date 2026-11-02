import { Breadcrumb, Grid, GridItem, Stack, type BreadcrumbItem } from "odd-design/react";
import { mirrored } from "../mirror.ts";

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
          "`Breadcrumb` from `odd-design/react` renders `nav.odd-breadcrumb`, the trail to the current page, from `items`. It is named \"Breadcrumb\" unless `label` names it otherwise, so a second trail on the page gets a name of its own. Each item with an `href` is a router link, and the last one is the current page, with `aria-current=\"page\"`. An item with no `href` is plain text. CSS draws the slashes, which screen readers do not read, and a long trail wraps.",
      },
    },
  },
};

export default meta;

const LEVELS: readonly [BreadcrumbItem, ...BreadcrumbItem[]] = [
  { label: "Home", href: "#home" },
  { label: "Settings", href: "#settings" },
  { label: "Projects", href: "#projects" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Milestones", href: "#milestones" },
];

export const Playground = mirrored<Args>({
  scene: ({ label, levels }) => <Breadcrumb label={label} items={[LEVELS[0], ...LEVELS.slice(1, Number(levels))]} />,
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
  scene: () => (
    <Stack>
      <Breadcrumb
        items={[
          { label: "Home", href: "#home" },
          { label: "Projects", href: "#projects" },
          { label: "Roadmap", href: "#roadmap" },
        ]}
      />
      <Breadcrumb
        label="Settings breadcrumb"
        items={[{ label: "Home", href: "#home" }, { label: "Settings", href: "#settings" }, { label: "Archived" }, { label: "Notifications", href: "#notifications" }]}
      />
      <Breadcrumb label="Home breadcrumb" items={[{ label: "Home", href: "#home" }]} />
    </Stack>
  ),
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
  scene: () => (
    <Grid>
      <GridItem span={3}>
        <Breadcrumb items={LEVELS} />
      </GridItem>
    </Grid>
  ),
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
