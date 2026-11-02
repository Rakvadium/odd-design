import { Badge, Button, Card, GridItem, Input, Log, LogLine, Muted, Shell, Slider } from "odd-design/react";
import { mirrored } from "../story.ts";

const meta = {
  title: "Components/Layout",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "`Shell` is a full-height page with a sticky header: the title, a status slot that takes the free space, and the actions. Its main area is a twelve-column grid of `Card` panels, each in a `GridItem` with a `span`. The grid measures itself: narrow the window and the 4-column panel takes half, then every panel takes the full row.",
      },
    },
  },
};

export default meta;

export const AppShell = mirrored({
  scene: () => (
    <Shell
      title="NexArm"
      status={
        <>
          <Badge tone="success">Connected</Badge>
          <Muted as="span">COM3</Muted>
        </>
      }
      actions={
        <>
          <Button>Home</Button>
          <Button variant="primary">Run sequence</Button>
        </>
      }
    >
      <GridItem span={8}>
        <Card as="section" title="Jog" headingLevel={2}>
          <Input id="shell-base" label="Base (degrees)" type="number" min={-90} max={90} defaultValue={0} />
          <Slider id="shell-speed" label="Speed (mm/s)" min={0} max={200} step={5} defaultValue={60} showValue />
        </Card>
      </GridItem>
      <GridItem span={4}>
        <Card as="section" title="Pose" headingLevel={2} description="Base 0, shoulder 45, elbow −30, wrist 10, gripper 12 mm." />
      </GridItem>
      <GridItem span={12}>
        <Card as="section" title="Log" headingLevel={2}>
          <Log label="Arm log">
            <LogLine tone="success" time="14:02:02">
              Connected to NexArm
            </LogLine>
            <LogLine time="14:02:07">Move base to 30 degrees</LogLine>
            <LogLine tone="warning" time="14:02:09">
              Warning: wrist near its limit
            </LogLine>
          </Log>
        </Card>
      </GridItem>
    </Shell>
  ),
  aria: `
- banner:
  - heading "NexArm" [level=1]
  - status: Connected COM3
  - button "Home"
  - button "Run sequence"
- main:
  - heading "Jog" [level=2]
  - text: Base (degrees)
  - spinbutton "Base (degrees)": "0"
  - text: Speed (mm/s)
  - slider "Speed (mm/s)": "60"
  - status: "60"
  - heading "Pose" [level=2]
  - paragraph: Base 0, shoulder 45, elbow −30, wrist 10, gripper 12 mm.
  - heading "Log" [level=2]
  - log "Arm log":
    - time: 14:02:02
    - text: Connected to NexArm
    - time: 14:02:07
    - text: Move base to 30 degrees
    - time: 14:02:09
    - text: "Warning: wrist near its limit"`,
});
