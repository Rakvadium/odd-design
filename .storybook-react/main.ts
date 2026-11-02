import type { StorybookConfig } from "@storybook/react-vite";
import html from "../.storybook/main.ts";
import { STORYBOOKS } from "../stories/catalog.ts";

const config: StorybookConfig = {
  stories: [`../${STORYBOOKS.react.stories}`],
  addons: html.addons,
  framework: { name: "@storybook/react-vite", options: {} },
  viteFinal: html.viteFinal,
};

export default config;
