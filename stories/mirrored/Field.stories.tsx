import { Grid, GridItem, Input, Select as SelectField, Stack, Textarea } from "odd-design/react";
import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Forms",
  parameters: {
    docs: {
      description: {
        component:
          "`Input`, `Textarea`, and `Select` from `odd-design/react` each render a whole field: the label, the control, an optional hint, and an error while one is set. The component pairs the label with the control and points `aria-describedby` at the hint and the error, so the app writes no ids. `error` marks the control invalid. Set a starting value with `defaultValue`. Invalid styling also follows `:user-invalid`, so a field the user has not touched stays calm. The select upgrades to a fully styled picker where `appearance: base-select` is supported.",
      },
    },
  },
};

export default meta;

export const TextFields = mirrored({
  scene: () => (
    <Grid>
      <GridItem span={4}>
        <form method="dialog">
          <Stack>
            <Input id="name" label="Deck name" required placeholder="Midnight Control" hint="Shown on your public profile." />
            <Input id="email" label="Email" type="email" defaultValue="not-an-email" error="Enter an email address like name@example.com." />
            <Textarea id="notes" label="Notes" placeholder="The textarea grows with its content." />
            <Input id="disabled" label="Owner" defaultValue="you" disabled />
          </Stack>
        </form>
      </GridItem>
    </Grid>
  ),
  aria: `
- text: Deck name
- textbox "Deck name":
  - /placeholder: Midnight Control
- paragraph: Shown on your public profile.
- text: Email
- textbox "Email" [invalid]: not-an-email
- paragraph: Enter an email address like name@example.com.
- text: Notes
- textbox "Notes":
  - /placeholder: The textarea grows with its content.
- text: Owner
- textbox "Owner" [disabled]: you`,
});

export const Select = mirrored({
  scene: () => (
    <Grid>
      <GridItem span={4}>
        <SelectField id="format" label="Format" defaultValue="Extended">
          <option>Standard</option>
          <option>Extended</option>
          <option>Retro</option>
          <option>Draft</option>
        </SelectField>
      </GridItem>
    </Grid>
  ),
  aria: `
- text: Format
- combobox "Format":
  - option "Standard"
  - option "Extended" [selected]
  - option "Retro"
  - option "Draft"`,
});
