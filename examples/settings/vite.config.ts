import { readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { defineConfig, searchForWorkspaceRoot, type Plugin } from "vite";

const firstPaintPath = realpathSync(createRequire(import.meta.url).resolve("odd-design/first-paint.js"));

// Inlined as the first thing in <head> so data-chrome/palette/mode are set before any stylesheet loads.
function firstPaint(): Plugin {
  const script = readFileSync(firstPaintPath, "utf8").trim();
  return {
    name: "odd-design-first-paint",
    transformIndexHtml: () => [{ tag: "script", children: script, injectTo: "head-prepend" }],
  };
}

export default defineConfig({
  plugins: [firstPaint()],
  // bun links the file: dependency, so its fonts resolve to the repo's dist/, outside this project.
  server: { fs: { allow: [searchForWorkspaceRoot(process.cwd()), dirname(firstPaintPath)] } },
  // Vite's default CSS target predates light-dark(), so the minifier would rewrite every
  // palette color into --lightningcss-light/dark variables. These browsers support it natively.
  build: { cssTarget: ["chrome123", "edge123", "firefox120", "safari17.5"] },
});
