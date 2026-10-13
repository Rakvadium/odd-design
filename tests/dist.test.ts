import { beforeAll, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const text = (path: string) => readFileSync(new URL(path, root), "utf8");
const code = (path: string) => text(path).replace(/\/\*[\s\S]*?\*\//g, "");
const count = (haystack: string, needle: string) => haystack.split(needle).length - 1;

beforeAll(() => {
  const build = Bun.spawnSync([process.execPath, "scripts/build.ts"], { cwd: fileURLToPath(root), stderr: "pipe" });
  if (build.exitCode !== 0) throw new Error(`build failed:\n${build.stderr}`);
});

test("odd-design.css has no @import left", () => {
  expect(text("dist/odd-design.css")).not.toContain("@import");
});

test("odd-design.css declares the layer order before any rule", () => {
  const firstStatement = code("dist/odd-design.css").trim().split(/\r?\n/)[0];
  expect(firstStatement).toBe("@layer foundations, palette, chrome, preferences, base, components;");
});

test("odd-design.css keeps every light-dark() from the source partials", () => {
  const partials = ["foundations.css", "preferences.css", "base.css", "palettes", "chromes", "components"].flatMap((p) =>
    p.endsWith(".css") ? [p] : readdirSync(new URL(`src/css/${p}/`, root)).map((f) => `${p}/${f}`),
  );
  const expected = partials.reduce((sum, p) => sum + count(code(`src/css/${p}`), "light-dark("), 0);
  expect(expected).toBeGreaterThan(0);
  expect(count(code("dist/odd-design.css"), "light-dark(")).toBe(expected);
});

test("every font file fonts.css points at ships in dist/files", () => {
  const urls = [...text("dist/fonts.css").matchAll(/url\((\.\/files\/[^)]+)\)/g)].map((m) => m[1]!);
  expect(urls.length).toBeGreaterThan(0);
  expect(urls.filter((u) => !existsSync(new URL(u, new URL("dist/", root))))).toEqual([]);
});

test("every export in package.json and dist/package.json points at a built file", () => {
  const targets = (exports: object): string[] =>
    Object.values(exports).flatMap((v) => (typeof v === "string" ? [v] : targets(v)));
  const rootTargets = targets(JSON.parse(text("package.json")).exports);
  const distTargets = targets(JSON.parse(text("dist/package.json")).exports);
  expect(distTargets.map((t) => t.replace("./", "./dist/"))).toEqual(rootTargets);
  expect(rootTargets.filter((t) => !existsSync(new URL(t, root)))).toEqual([]);
});

test("first-paint.js applies saved appearance as a classic script", () => {
  const dataset: Record<string, string> = {};
  const storage = { getItem: () => JSON.stringify({ chrome: "holoterminal", palette: "aurora", mode: "dark" }) };
  new Function("localStorage", "document", text("dist/first-paint.js"))(storage, { documentElement: { dataset } });
  expect(dataset).toEqual({ chrome: "holoterminal", palette: "aurora", mode: "dark" });
});
