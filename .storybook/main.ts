import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/html-vite";
import type { AliasOptions } from "vite";
import { STORYBOOKS } from "../stories/catalog.ts";

function packageAlias(): { find: string; replacement: string } {
  const source = readFileSync(new URL("../tsconfig.json", import.meta.url), "utf8");
  const tsconfig = JSON.parse(source) as { compilerOptions?: { paths?: Record<string, string[]> } };
  const target = tsconfig.compilerOptions?.paths?.["odd-design/react"]?.[0];
  if (target === undefined) throw new Error("tsconfig has no odd-design/react path");
  return { find: "odd-design/react", replacement: fileURLToPath(new URL(`../${target}`, import.meta.url)) };
}

function withPackageAlias(alias: AliasOptions | undefined): AliasOptions {
  const entry = packageAlias();
  if (alias === undefined) return [entry];
  if (Array.isArray(alias)) return [...alias, entry];
  return { ...alias, [entry.find]: entry.replacement };
}

const config: StorybookConfig = {
  stories: [`../${STORYBOOKS.html.stories}`, "../stories/**/*.mdx"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: { name: "@storybook/html-vite", options: {} },
  viteFinal: (vite) => {
    const ignored = vite.server?.watch?.ignored;
    return {
      ...vite,
      resolve: { ...vite.resolve, alias: withPackageAlias(vite.resolve?.alias) },
      // .verify holds harness runs and evidence. Vite reloads the page when an HTML file there changes
      // (sr.ts writes a review page per scenario), which reset the page mid-run under NVDA.
      server: {
        ...vite.server,
        watch: { ...vite.server?.watch, ignored: [...(Array.isArray(ignored) ? ignored : ignored ? [ignored] : []), "**/.verify/**"] },
      },
    };
  },
};

export default config;
