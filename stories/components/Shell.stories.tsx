import { Badge, Button, Muted, Shell } from "odd-design/react";
import { mirrored } from "../story.ts";

const meta = {
  title: "Components/Shell",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`Shell` from `odd-design/react` renders `div.odd-shell`, a full-height page: a sticky `header.odd-shell-header` with the `title` as the page's `h1`, a `status` slot with `role=\"status\"` that takes the free space, and the `actions`, over `main.odd-shell-main`, a twelve-column grid. The status and actions slots render even when empty, so the actions stay at the end of the bar. A page has one `main`, so each variant is its own story.",
      },
    },
  },
};

export default meta;

const status = (
  <>
    <Badge tone="success">Synced</Badge>
    <Muted as="span">2 minutes ago</Muted>
  </>
);

const actions = (
  <>
    <Button>Export</Button>
    <Button variant="primary">New order</Button>
  </>
);

export const Parts = mirrored({
  scene: () => <Shell title="Orders" status={status} actions={actions} />,
  aria: `
- banner:
  - heading "Orders" [level=1]
  - status: Synced 2 minutes ago
  - button "Export"
  - button "New order"
- main`,
});

export const EmptyStatus = mirrored({
  scene: () => <Shell title="Orders" actions={actions} />,
  aria: `
- banner:
  - heading "Orders" [level=1]
  - status
  - button "Export"
  - button "New order"
- main`,
});

export const EmptyActions = mirrored({
  scene: () => <Shell title="Orders" status={status} />,
  aria: `
- banner:
  - heading "Orders" [level=1]
  - status: Synced 2 minutes ago
- main`,
});

export const NoTitle = mirrored({
  scene: () => <Shell status={status} actions={actions} />,
  aria: `
- banner:
  - status: Synced 2 minutes ago
  - button "Export"
  - button "New order"
- main`,
});
