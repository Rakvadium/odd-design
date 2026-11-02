import { RadioGroup } from "../../../../src/react/field.tsx";

export const view = (
  <RadioGroup
    label="Visibility"
    defaultValue="secret"
    options={[
      { value: "public", label: "Public" },
      { value: "private", label: "Private" },
    ]}
  />
);
