import type { Preview } from "@storybook/html-vite";
import "@fontsource-variable/outfit";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/bricolage-grotesque";
import "../src/css/index.css";
import { applyAppearance, CHROMES, MODES, PALETTES, type Appearance } from "../src/js/appearance.ts";
import { A11Y_OPTIONS } from "./a11y.ts";
import { avatarFallback, closedByFallback, interestForFallback } from "../src/js/enhance.ts";
import { mirrorOf, toHtml } from "../stories/mirror.ts";

// Page-wide fallbacks, installed once as an app would. Each is a no-op where the browser has the feature.
interestForFallback();
closedByFallback();
avatarFallback();

const toolbar = (title: string, icon: string, items: readonly string[]) => ({
  description: title,
  toolbar: { title, icon, items: [...items], dynamicTitle: true },
});

const preview: Preview = {
  globalTypes: {
    chrome: toolbar("Chrome", "component", CHROMES),
    palette: toolbar("Palette", "paintbrush", PALETTES),
    mode: toolbar("Mode", "mirror", MODES),
  },
  initialGlobals: { chrome: "calm", palette: "default", mode: "system" },
  decorators: [
    (story, { globals }) => {
      applyAppearance(globals as Appearance);
      return story();
    },
  ],
  parameters: {
    layout: "padded",
    a11y: { test: "error", options: A11Y_OPTIONS },
    options: {
      storySort: { order: ["Introduction", "Showcase", "Foundations", "Components"] },
    },
  },
  render: (args, { parameters }) => toHtml(mirrorOf(parameters).scene(args)),
};

export default preview;
