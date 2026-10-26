import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Forms",
  parameters: {
    docs: {
      description: {
        component:
          "`Field`, `Label`, `Input`, `Textarea`, `Select`, `Hint`, and `FieldError` from `odd-design/react`. Each renders one native element with its `odd-*` class. Wire the label with `htmlFor` and the hint or error with `aria-describedby`, and set a starting value with `defaultValue`.",
      },
    },
  },
};

export default meta;

export const TextFields = mirrored({
  scene: () => ({
    of: "form",
    props: { className: "odd-stack", method: "dialog", style: { maxInlineSize: "26rem" } },
    children: [
      {
        of: "Field",
        children: [
          { of: "Label", props: { htmlFor: "name" }, children: ["Deck name"] },
          { of: "Input", props: { id: "name", required: true, placeholder: "Midnight Control", "aria-describedby": "name-hint" } },
          { of: "Hint", props: { id: "name-hint" }, children: ["Shown on your public profile."] },
        ],
      },
      {
        of: "Field",
        children: [
          { of: "Label", props: { htmlFor: "email" }, children: ["Email"] },
          { of: "Input", props: { id: "email", type: "email", defaultValue: "not-an-email", "aria-invalid": "true", "aria-describedby": "email-error" } },
          { of: "FieldError", props: { id: "email-error" }, children: ["Enter an email address like name@example.com."] },
        ],
      },
      {
        of: "Field",
        children: [
          { of: "Label", props: { htmlFor: "notes" }, children: ["Notes"] },
          { of: "Textarea", props: { id: "notes", placeholder: "The textarea grows with its content." } },
        ],
      },
      {
        of: "Field",
        children: [
          { of: "Label", props: { htmlFor: "disabled" }, children: ["Owner"] },
          { of: "Input", props: { id: "disabled", defaultValue: "you", disabled: true } },
        ],
      },
    ],
  }),
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
  scene: () => ({
    of: "Field",
    props: { style: { maxInlineSize: "26rem" } },
    children: [
      { of: "Label", props: { htmlFor: "format" }, children: ["Format"] },
      {
        of: "Select",
        props: { id: "format", defaultValue: "Extended" },
        children: [
          { of: "option", children: ["Standard"] },
          { of: "option", children: ["Extended"] },
          { of: "option", children: ["Retro"] },
          { of: "option", children: ["Draft"] },
        ],
      },
    ],
  }),
  aria: `
- text: Format
- combobox "Format":
  - option "Standard"
  - option "Extended" [selected]
  - option "Retro"
  - option "Draft"`,
});
