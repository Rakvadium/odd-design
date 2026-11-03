import { Checkbox, RadioGroup, Segmented as SegmentedControl, Stack, Switch as SwitchControl } from "odd-design/react";
import { mirrored } from "../story.ts";

const meta = {
  title: "Components/Forms",
  parameters: {
    docs: {
      description: {
        component:
          "`Checkbox`, `Switch`, `RadioGroup`, and `Segmented` from `odd-design/react`. `Checkbox` and `Switch` render the label around a native checkbox, and `Switch` gives it the switch role. `RadioGroup` and `Segmented` take `label` for the legend and an `options` list, and write one radio per option under a shared `name`, which they generate when you leave it out. Set the starting state with `defaultChecked` or `defaultValue`, and disable with `disabled`.",
      },
    },
  },
};

export default meta;

export const Choices = mirrored({
  scene: () => (
    <Stack>
      <Stack>
        <Checkbox label="Deck comments" defaultChecked />
        <Checkbox label="Weekly digest" />
        <Checkbox label="Partner offers (unavailable)" disabled />
      </Stack>
      <RadioGroup
        label="Visibility"
        name="vis"
        defaultValue="public"
        options={[
          { value: "public", label: "Public" },
          { value: "unlisted", label: "Unlisted" },
          { value: "private", label: "Private" },
        ]}
      />
    </Stack>
  ),
  aria: `
- checkbox "Deck comments" [checked]
- text: Deck comments
- checkbox "Weekly digest"
- text: Weekly digest
- checkbox "Partner offers (unavailable)" [disabled]
- text: Partner offers (unavailable)
- group "Visibility":
  - text: Visibility
  - radio "Public" [checked]
  - text: Public
  - radio "Unlisted"
  - text: Unlisted
  - radio "Private"
  - text: Private`,
});

export const Switch = mirrored({
  scene: () => (
    <Stack>
      <SwitchControl label="Show card prices" defaultChecked />
      <SwitchControl label="Compact grid" />
    </Stack>
  ),
  aria: `
- switch "Show card prices" [checked]
- text: Show card prices
- switch "Compact grid"
- text: Compact grid`,
});

export const Segmented = mirrored({
  scene: () => (
    <SegmentedControl
      label="View"
      name="view"
      defaultValue="grid"
      options={[
        { value: "grid", label: "Grid" },
        { value: "list", label: "List" },
        { value: "stats", label: "Stats" },
      ]}
    />
  ),
  aria: `
- group "View":
  - text: View
  - radio "Grid" [checked]
  - text: Grid
  - radio "List"
  - text: List
  - radio "Stats"
  - text: Stats`,
});
