import type { Scenario } from "../sr.ts";

export default {
  title: "Tabs in focus mode and browse mode",
  why: "Screen-reader users reach tabs two ways: arrow keys in focus mode, and reading the page in browse mode. Proves both read the tab list, the selected state, and the panel that goes with the selected tab.",
  story: "components-interactive--tabs",
  globals: "mode:light",
  steps: [
    { focus: "#tab-cards", note: "Start on the Cards tab. Expect tab, selected, 1 of 3, and NVDA switching to focus mode." },
    { keys: "ArrowRight", note: "Stats. Automatic activation, so it is selected and its panel shows." },
    { keys: "nvda+Space", note: "Switch to browse mode." },
    { keys: "ArrowDown", note: "Browse mode reads one tab per line: Notes." },
    { keys: "ArrowDown", note: "Past the tab list. Expect the Stats panel's text, not the hidden Cards panel." },
    { keys: "ArrowUp", note: "Back to Notes." },
    { keys: "ArrowUp", note: "Stats, still selected." },
    { keys: "nvda+Space", note: "Back to focus mode." },
    { keys: "End", note: "Notes, the last tab." },
  ],
} satisfies Scenario;
