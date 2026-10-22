import type { Scenario } from "../sr.ts";

export default {
  title: "Form fields with a hint and an error",
  why: "Hints and errors are wired with aria-describedby and aria-invalid. Proves NVDA reads the label, the invalid state, and the error text when the field is reached, and the hint on the field that has one.",
  story: "components-forms--text-fields",
  globals: "mode:light",
  steps: [
    { focus: "#name", note: "Deck name. Expect the label, required, and the hint." },
    { keys: "Tab", note: "Email. Expect the label, invalid entry, its value, and the error text." },
    { keys: "Tab", note: "Notes, a textarea." },
    { keys: "Tab", note: "Owner is disabled, so focus should leave the form." },
  ],
} satisfies Scenario;
