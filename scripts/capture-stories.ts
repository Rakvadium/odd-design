import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { firefox, type Page } from "@playwright/test";

type Mode = "light" | "dark";

type Capture = {
  readonly id: string;
  readonly title: string;
  readonly name: string;
  readonly mode: Mode;
  readonly dom: string;
  readonly aria: string;
  readonly png: string;
};

type IndexEntry = {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly name: string;
};

const MODES = ["light", "dark"] as const satisfies readonly Mode[];

function fail(message: string): never {
  throw new Error(message);
}

function keyOf(capture: Pick<Capture, "id" | "mode">): string {
  return `${capture.id}@${capture.mode}`;
}

function readCaptures(path: string): Capture[] {
  const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(parsed)) fail(`${path} is not a capture list`);
  return parsed as Capture[];
}

async function storyEntries(root: string): Promise<IndexEntry[]> {
  const url = new URL("index.json", root.endsWith("/") ? root : `${root}/`);
  const response = await fetch(url);
  if (!response.ok) fail(`${url} returned ${response.status}`);
  const index = (await response.json()) as { entries?: Record<string, IndexEntry> };
  const entries = Object.values(index.entries ?? {}).filter((entry) => entry.type === "story");
  entries.sort((a, b) => a.id.localeCompare(b.id));
  return entries;
}

async function afterTwoFrames(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      }),
  );
}

async function normalizedDom(page: Page): Promise<string> {
  return page.locator("#storybook-root").evaluate((root) => {
    const walk = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? "").replace(/\s+/g, " ");
      if (!(node instanceof Element)) return "";
      const attrs = [...node.attributes]
        .map((attr) => `${attr.name}="${attr.value.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}"`)
        .sort()
        .join(" ");
      const inner = [...node.childNodes].map(walk).join("");
      return `<${node.localName}${attrs === "" ? "" : ` ${attrs}`}>${inner}</${node.localName}>`;
    };
    return walk(root).replace(/>\s+</g, "><").trim();
  });
}

async function capture(root: string, shotsDir: string): Promise<Capture[]> {
  mkdirSync(shotsDir, { recursive: true });
  const entries = await storyEntries(root);
  const browser = await firefox.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const captures: Capture[] = [];
  try {
    for (const entry of entries) {
      for (const mode of MODES) {
        const globals = `mode:${mode};a11y.manual:!true`;
        const url = new URL("iframe.html", root.endsWith("/") ? root : `${root}/`);
        url.searchParams.set("id", entry.id);
        url.searchParams.set("viewMode", "story");
        url.searchParams.set("globals", globals);
        await page.goto(url.href);
        await page.waitForFunction(() => {
          const storyRoot = document.querySelector("#storybook-root");
          return document.readyState === "complete" && storyRoot !== null && storyRoot.childElementCount > 0;
        });
        if ((await page.locator("body.sb-show-errordisplay").count()) > 0) fail(`story ${entry.id} failed to render`);
        await page.evaluate(() => document.fonts.ready);
        await afterTwoFrames(page);
        const storyRoot = page.locator("#storybook-root");
        const png = await storyRoot.screenshot({ animations: "disabled" });
        const hash = createHash("sha256").update(png).digest("hex");
        writeFileSync(join(shotsDir, `${entry.id}.${mode}.png`), png);
        captures.push({
          id: entry.id,
          title: entry.title,
          name: entry.name,
          mode,
          dom: await normalizedDom(page),
          aria: await storyRoot.ariaSnapshot(),
          png: hash,
        });
      }
    }
  } finally {
    await browser.close();
  }
  return captures;
}

const FIELDS = ["title", "name", "dom", "aria", "png"] as const;

function diff(before: readonly Capture[], after: readonly Capture[]): { changed: string[]; removed: string[]; added: string[] } {
  const left = new Map(before.map((capture) => [keyOf(capture), capture]));
  const right = new Map(after.map((capture) => [keyOf(capture), capture]));
  const changed: string[] = [];
  const removed: string[] = [];
  const added: string[] = [];
  for (const [key, earlier] of left) {
    const later = right.get(key);
    if (later === undefined) {
      removed.push(key);
      continue;
    }
    const fields = FIELDS.filter((field) => earlier[field] !== later[field]);
    if (fields.length > 0) changed.push(`${key} ${fields.join(", ")}`);
  }
  for (const key of right.keys()) {
    if (!left.has(key)) added.push(key);
  }
  changed.sort();
  removed.sort();
  added.sort();
  return { changed, removed, added };
}

function printDiff(result: { changed: string[]; removed: string[]; added: string[] }): number {
  for (const line of result.changed) console.log(`changed ${line}`);
  for (const line of result.removed) console.log(`removed ${line}`);
  for (const line of result.added) console.log(`added ${line}`);
  const total = result.changed.length + result.removed.length + result.added.length;
  console.log(`${result.changed.length} changed, ${result.removed.length} removed, ${result.added.length} added`);
  return total === 0 ? 0 : 1;
}

const args = process.argv.slice(2);
if (args[0] === "--diff") {
  const beforePath = args[1];
  const afterPath = args[2];
  if (beforePath === undefined || afterPath === undefined) fail("usage: capture-stories.ts --diff <a.json> <b.json>");
  process.exit(printDiff(diff(readCaptures(beforePath), readCaptures(afterPath))));
}

const [root, outPath, shotsDir] = args;
if (root === undefined || outPath === undefined || shotsDir === undefined) {
  fail("usage: capture-stories.ts <storybook-root-url> <out.json> <shots-dir>");
}

const captures = await capture(root, shotsDir);
writeFileSync(outPath, `${JSON.stringify(captures, null, 2)}\n`);
console.log(`${captures.length} captures -> ${outPath}`);
