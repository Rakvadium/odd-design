import type { Preview } from "@storybook/html-vite";
import "../src/css/fonts.css";
import "../src/css/index.css";
import { applyAppearance, CHROMES, MODES, PALETTES, type Appearance } from "../src/js/appearance.ts";

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
    a11y: { test: "error" },
    options: {
      storySort: { order: ["Introduction", "Showcase", "Foundations", "Components"] },
    },
  },
};

export default preview;
