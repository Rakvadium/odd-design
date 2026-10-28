import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { USAGE } from "../src/js/usage/contract.ts";
import { catalog, STORYBOOKS, type Storybook } from "../stories/catalog.ts";
import { openStory, storyIds } from "./story.ts";

const checkerDir = fileURLToPath(new URL("../.verify/playwright/usage-checker/", import.meta.url));
const checkerScript = join(checkerDir, "checker.js");

function bundleChecker(): void {
  mkdirSync(checkerDir, { recursive: true });
  const entry = join(checkerDir, "entry.ts");
  const dom = fileURLToPath(new URL("../src/js/usage/dom.ts", import.meta.url)).replaceAll("\\", "/");
  writeFileSync(entry, `import { checkRoot } from ${JSON.stringify(dom)};\nglobalThis.checkRoot = checkRoot;\n`);
  execFileSync("bun", ["build", entry, "--outfile", checkerScript, "--format", "iife"], { stdio: "pipe" });
}

const { html, react } = await catalog();
const reactIds = new Set(react.map((entry) => entry.id));
function fail(message: string): never {
  throw new Error(message);
}

const playground = react.find((entry) => entry.id === "components-button--playground") ?? fail("Button stories have no Playground");

function sorted(ids: readonly string[]): string[] {
  return [...ids].sort();
}

function enumValues(attribute: "data-variant" | "data-size", arg: "variant" | "size"): { options: readonly string[]; absent: string } {
  const rule = USAGE.button.find((item) => item.kind === "enum" && item.attribute === attribute);
  if (rule?.kind !== "enum") throw new Error(`no enum rule for ${attribute}`);
  const options = playground.meta.argTypes?.[arg]?.options;
  if (options === undefined) throw new Error(`Playground argTypes.${arg} has no options`);
  const absent = rule.omit.filter((token) => options.includes(token));
  const expected = [...rule.values, ...absent].sort();
  const actual = [...options].sort();
  if (absent.length !== 1 || absent[0] === undefined || actual.length !== expected.length || actual.some((item, index) => item !== expected[index])) {
    throw new Error(`Playground ${arg} options ${actual.join(", ")} do not match ${expected.join(", ")}`);
  }
  return { options, absent: absent[0] };
}

function ariaValues(attribute: "aria-disabled" | "aria-busy"): readonly ("true" | "false")[] {
  const rule = USAGE.button.find((item) => item.kind === "aria-boolean" && item.attribute === attribute);
  if (rule?.kind !== "aria-boolean") throw new Error(`no aria rule for ${attribute}`);
  return rule.values;
}

const variantControl = enumValues("data-variant", "variant");
const sizeControl = enumValues("data-size", "size");

async function problemsIn(page: Page, selector: string): Promise<string[]> {
  await page.addScriptTag({ path: checkerScript });
  return page.evaluate((sel) => {
    const check = (globalThis as { checkRoot?: (root: ParentNode) => void }).checkRoot;
    if (typeof check !== "function") return ["checkRoot is not installed"];
    const root = document.querySelector(sel);
    if (root === null) return [`missing ${sel}`];
    try {
      check(root);
      return [];
    } catch (error) {
      return error instanceof Error ? error.message.split("\n") : [String(error)];
    }
  }, selector);
}

type Seen = { readonly aria: string; readonly png: Buffer; readonly problems: readonly string[] };

async function see(page: Page, storybook: Storybook, id: string, args = "", expected?: string): Promise<Seen> {
  await openStory(page, id, "mode:light", args, storybook);
  const root = page.locator("#storybook-root");
  const aria = await root.ariaSnapshot();
  if (expected !== undefined) expect(aria).toBe(expected.trim());
  return {
    aria,
    png: await root.screenshot({ animations: "disabled" }),
    problems: await problemsIn(page, "#storybook-root"),
  };
}

async function comparePair(label: string, htmlSide: Seen, reactSide: Seen, findings: string[], testInfo: TestInfo): Promise<void> {
  for (const [name, side] of [
    ["html", htmlSide],
    ["react", reactSide],
  ] as const) {
    for (const line of side.problems) findings.push(`${label} [${name}] ${line}`);
  }
  if (htmlSide.aria !== reactSide.aria) findings.push(`${label} aria differs:\n${htmlSide.aria}\n---\n${reactSide.aria}`);
  if (Buffer.compare(htmlSide.png, reactSide.png) !== 0) {
    findings.push(`${label} pixels differ`);
    await testInfo.attach(`${label} html.png`, { body: htmlSide.png, contentType: "image/png" });
    await testInfo.attach(`${label} react.png`, { body: reactSide.png, contentType: "image/png" });
  }
}

async function refStoryIds(page: Page, key: Storybook): Promise<string[]> {
  await page.goto("/");
  const url = await page.evaluate((name) => {
    const refs = (window as { REFS?: Record<string, { url?: string }> }).REFS;
    return refs?.[name]?.url;
  }, key);
  if (url === undefined) return [];
  const indexPath = new URL(`${url}/index.json`, page.url()).pathname;
  const response = await page.request.get(indexPath);
  if (!response.ok()) return [];
  const index = (await response.json()) as { entries: Record<string, { id: string; type: string }> };
  return Object.values(index.entries)
    .filter((entry) => entry.type === "story")
    .map((entry) => entry.id);
}

test.beforeAll(({ browserName }) => {
  if (browserName !== "firefox") return;
  bundleChecker();
});

test.beforeEach(({ browserName }) => {
  test.skip(browserName !== "firefox", "the usage sweep runs in Firefox");
});

test("usage and mirror: every story in both Storybooks, each pair, the Playground values, the toast buttons", async ({ page }, testInfo) => {
  test.setTimeout(10 * 60_000);
  const findings: string[] = [];

  expect(sorted(await storyIds(page, "html"))).toEqual(sorted(html.map((entry) => entry.id)));
  expect(sorted(await storyIds(page, "react"))).toEqual(sorted(react.map((entry) => entry.id)));
  expect(sorted(await refStoryIds(page, "html"))).toEqual(sorted(html.map((entry) => entry.id)));
  expect(sorted(await refStoryIds(page, "react"))).toEqual(sorted(react.map((entry) => entry.id)));

  let checked = 0;
  for (const entry of html) {
    if (reactIds.has(entry.id)) continue;
    await test.step(entry.id, async () => {
      await openStory(page, entry.id);
      for (const line of await problemsIn(page, "#storybook-root")) findings.push(`${entry.id} [rendered] ${line}`);
      checked += 1;
    });
  }

  for (const entry of react) {
    await test.step(entry.id, async () => {
      const htmlSide = await see(page, "html", entry.id, "", entry.mirror.aria);
      const reactSide = await see(page, "react", entry.id, "", entry.mirror.aria);
      await comparePair(entry.id, htmlSide, reactSide, findings, testInfo);
      checked += 2;
    });
  }

  for (const value of variantControl.options) {
    const args = `variant:${value}`;
    const expected = value === variantControl.absent ? null : value;
    const htmlSide = await see(page, "html", "components-button--playground", args);
    const htmlActual = await page.locator("#storybook-root .odd-button").getAttribute("data-variant");
    const reactSide = await see(page, "react", "components-button--playground", args);
    const reactActual = await page.locator("#storybook-root .odd-button").getAttribute("data-variant");
    if (htmlActual !== expected) findings.push(`components-button--playground [html variant=${value}] data-variant=${String(htmlActual)}`);
    if (reactActual !== expected) findings.push(`components-button--playground [react variant=${value}] data-variant=${String(reactActual)}`);
    await comparePair(`playground [${args}]`, htmlSide, reactSide, findings, testInfo);
  }

  for (const value of sizeControl.options) {
    const args = `size:${value}`;
    const expected = value === sizeControl.absent ? null : value;
    const htmlSide = await see(page, "html", "components-button--playground", args);
    const htmlActual = await page.locator("#storybook-root .odd-button").getAttribute("data-size");
    const reactSide = await see(page, "react", "components-button--playground", args);
    const reactActual = await page.locator("#storybook-root .odd-button").getAttribute("data-size");
    if (htmlActual !== expected) findings.push(`components-button--playground [html size=${value}] data-size=${String(htmlActual)}`);
    if (reactActual !== expected) findings.push(`components-button--playground [react size=${value}] data-size=${String(reactActual)}`);
    await comparePair(`playground [${args}]`, htmlSide, reactSide, findings, testInfo);
  }

  for (const value of ariaValues("aria-disabled")) {
    const args = `disabled:!${value}`;
    const expected = value === "true" ? "true" : null;
    const htmlSide = await see(page, "html", "components-button--playground", args);
    const htmlButton = page.locator("#storybook-root .odd-button");
    const htmlAria = await htmlButton.getAttribute("aria-disabled");
    const htmlDisabled = await htmlButton.evaluate((el) => el.hasAttribute("disabled"));
    const reactSide = await see(page, "react", "components-button--playground", args);
    const reactButton = page.locator("#storybook-root .odd-button");
    const reactAria = await reactButton.getAttribute("aria-disabled");
    const reactDisabled = await reactButton.evaluate((el) => el.hasAttribute("disabled"));
    if (htmlAria !== expected || htmlDisabled) {
      findings.push(`components-button--playground [html disabled=${value}] aria-disabled=${String(htmlAria)} disabled=${htmlDisabled}`);
    }
    if (reactAria !== expected || reactDisabled) {
      findings.push(`components-button--playground [react disabled=${value}] aria-disabled=${String(reactAria)} disabled=${reactDisabled}`);
    }
    await comparePair(`playground [${args}]`, htmlSide, reactSide, findings, testInfo);
  }

  for (const value of ariaValues("aria-busy")) {
    const args = `busy:!${value}`;
    const expected = value === "true" ? "true" : null;
    const htmlSide = await see(page, "html", "components-button--playground", args);
    const htmlAria = await page.locator("#storybook-root .odd-button").getAttribute("aria-busy");
    const reactSide = await see(page, "react", "components-button--playground", args);
    const reactAria = await page.locator("#storybook-root .odd-button").getAttribute("aria-busy");
    if (htmlAria !== expected) findings.push(`components-button--playground [html busy=${value}] aria-busy=${String(htmlAria)}`);
    if (reactAria !== expected) findings.push(`components-button--playground [react busy=${value}] aria-busy=${String(reactAria)}`);
    await comparePair(`playground [${args}]`, htmlSide, reactSide, findings, testInfo);
  }

  const triggers = [
    ["saved", "Save deck"],
    ["undo", "Remove card"],
    ["error", "Fail to sync"],
  ] as const;
  for (const storybook of ["html", "react"] as const) {
    await openStory(page, "components-interactive--toast", "", "", storybook);
    for (const [kind, name] of triggers) {
      await page.getByRole("button", { name, exact: true }).click();
      await expect(page.locator(".odd-toast").last()).toBeVisible();
      for (const line of await problemsIn(page, "#storybook-root .odd-toaster")) findings.push(`components-interactive--toast [${storybook} toast ${kind}] ${line}`);
    }
    await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
    await expect(page.locator('.odd-toast button[aria-label^="Dismiss"]')).toHaveCount(3);

    await page.locator('button[commandfor="toast-settings"][command="show-modal"]').click();
    await page.locator("#toast-settings [data-toast=saved]").click();
    await expect(page.locator('.odd-toast button[aria-label="Dismiss: Deck saved"]').last()).toBeVisible();
    for (const line of await problemsIn(page, "#toast-settings")) findings.push(`components-interactive--toast [${storybook} toast saved inside settings] ${line}`);
  }

  console.log(`[${testInfo.project.name}] ${checked} stories, ${findings.length} diagnostics`);
  await testInfo.attach("usage-summary.json", {
    contentType: "application/json",
    body: JSON.stringify({ stories: checked, pairs: react.length, findings }, null, 2),
  });
  expect(checked).toBe(html.length + react.length);
  expect(findings, "usage diagnostics").toEqual([]);
});

async function loadStoryFromUrl(page: Page): Promise<void> {
  await page.reload();
}

test("the composed sidebar shows HTML and React sections", async ({ page }) => {
  await page.goto("/?path=/docs/about--docs");
  const nav = page.getByRole("navigation", { name: "Stories" });
  for (const { title } of Object.values(STORYBOOKS)) {
    await expect(nav.getByRole("button", { name: title, exact: true })).toBeVisible();
  }
  const reactSection = nav.locator('[data-ref-id="react"]');
  await reactSection.getByRole("button", { name: "Button", exact: true }).click();
  const variants = nav.getByRole("link", { name: "Variants", exact: true });
  await expect(variants).toHaveAttribute("href", /react_components-button--variants/);
  await variants.click();
  await expect(page).toHaveURL(/react_components-button--variants/);
  await loadStoryFromUrl(page);
  await expect(page.locator("#storybook-ref-react")).toHaveAttribute("src", /\.?\/react\/iframe\.html\?id=components-button--variants/);
});
