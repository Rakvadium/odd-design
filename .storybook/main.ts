import type { StorybookConfig } from "@storybook/html-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.ts"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: { name: "@storybook/html-vite", options: {} },
  // .verify holds harness runs and evidence. Vite reloads the page when an HTML file there changes
  // (sr.ts writes a review page per scenario), which reset the page mid-run under NVDA.
  viteFinal: (vite) => {
    const ignored = vite.server?.watch?.ignored;
    vite.server = {
      ...vite.server,
      watch: { ...vite.server?.watch, ignored: [...(Array.isArray(ignored) ? ignored : ignored ? [ignored] : []), "**/.verify/**"] },
    };
    return vite;
  },
};

export default config;
