import type { Scenario } from "../sr.ts";

export default {
  title: "Menu by keyboard",
  why: "enhanceMenu moves focus itself. Proves NVDA announces the menu and each item's role and state (disabled, checked, radio), and that Escape returns focus to the trigger.",
  story: "components-interactive--menu",
  globals: "mode:light",
  steps: [
    { focus: 'button[commandfor="deck-actions"]', note: "Start on Deck actions." },
    { keys: "Enter", note: "Opens the menu on its first item. Expect the menu, then Duplicate with its shortcut." },
    { keys: "ArrowDown", note: "Share link." },
    { keys: "ArrowDown", note: "Merge. Expect it to be read as unavailable." },
    { keys: "Enter", note: "Choosing it does nothing: the menu stays open on Merge." },
    { keys: "ArrowDown", note: "Show prices, a checked checkbox item." },
    { keys: "Space", note: "Toggles it. Expect not checked, and the menu stays open." },
    { keys: "End", note: "Delete deck, the last item." },
    { keys: "Escape", note: "Closes. Expect focus back on Deck actions." },
  ],
} satisfies Scenario;
