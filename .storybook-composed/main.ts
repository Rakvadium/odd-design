import type { StorybookConfig } from "@storybook/html-vite";
import { STORYBOOKS } from "../stories/catalog.ts";

const config: StorybookConfig = {
  stories: ["./About.mdx"],
  addons: ["@storybook/addon-docs"],
  framework: { name: "@storybook/html-vite", options: {} },
  refs: Object.fromEntries(Object.entries(STORYBOOKS).map(([key, { title }]) => [key, { title, url: `./${key}` }])),
};

export default config;
