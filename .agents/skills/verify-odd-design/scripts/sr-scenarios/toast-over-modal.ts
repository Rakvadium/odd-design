import type { Scenario } from "../sr.ts";

export default {
  title: "Toast, on the page and over a modal",
  why: "Toast announcements were only inferred from the accessibility tree. A modal makes the rest of the page inert, so the region moves into the dialog first. This is the only check that a toast is actually spoken, both times.",
  story: "components-interactive--toast",
  globals: "mode:light",
  steps: [
    { focus: 'button[data-toast="saved"]', text: "Save deck", note: "Start on Save deck." },
    { keys: "Enter", wait: 3000, note: "Expect the button, then the toast's text from the polite region." },
    { focus: 'button[commandfor="toast-settings"][command="show-modal"]', note: "Settings…" },
    { keys: "Enter", note: "Opens the modal." },
    { keys: "Tab", note: "Save, inside the modal." },
    { keys: "Enter", wait: 3000, note: "Expect the toast's text, spoken over the open modal." },
    { keys: "Escape", note: "Closes the modal. Expect focus back on Settings…" },
  ],
} satisfies Scenario;
