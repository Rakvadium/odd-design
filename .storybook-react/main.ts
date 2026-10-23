import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import type { AliasOptions } from "vite";
import html from "../.storybook/main.ts";

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
  stories: ["../stories/mirrored/**/*.stories.ts"],
  addons: html.addons,
  framework: { name: "@storybook/react-vite", options: {} },
  viteFinal: async (vite, options) => {
    if (html.viteFinal === undefined) return vite;
    const base = await html.viteFinal(vite, options);
    return { ...base, resolve: { ...base.resolve, alias: withPackageAlias(base.resolve?.alias) } };
  },
};

export default config;
