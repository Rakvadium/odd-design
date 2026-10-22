import type { Scenario } from "../sr.ts";

export default {
  title: "Appearance dialog by keyboard",
  why: "The sample app's main flow. Proves the modal is announced by name, each segmented control reads as a radio group with its legend, changing a radio is spoken, and closing returns focus to the opener.",
  story: "showcase--sample-app",
  globals: "mode:light",
  steps: [
    { focus: 'button[commandfor="appearance"]', note: "Start on the Appearance button." },
    { keys: "Enter", note: "Opens the modal. Expect the dialog's name, then the checked chrome radio in the Chrome group." },
    { keys: "ArrowDown", note: "Next chrome. Expect the new radio's name and checked state, without the dialog closing." },
    { keys: "Tab", note: "Into the Palette group. Expect the group's legend." },
    { keys: "Tab", note: "Into the Mode group." },
    { keys: "Tab", note: "Done button." },
    { keys: "Enter", note: "Closes the modal. Expect focus back on Appearance." },
  ],
} satisfies Scenario;
