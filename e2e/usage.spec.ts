import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";
import { USAGE } from "../src/js/usage/contract.ts";
import * as buttonStories from "../stories/Button.stories.ts";
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

const STORY_IDS = [
  "components-button--playground",
  "components-button--sizes",
  "components-button--states",
  "components-button--variants",
  "components-data-display--avatar",
  "components-data-display--separator",
  "components-data-display--table",
  "components-feedback--alert",
  "components-feedback--progress",
  "components-feedback--skeleton",
  "components-forms--choices",
  "components-forms--search",
  "components-forms--segmented",
  "components-forms--select",
  "components-forms--slider",
  "components-forms--switch",
  "components-forms--text-fields",
  "components-interactive--menu",
  "components-interactive--tabs",
  "components-interactive--toast",
  "components-overlays--alert-dialog",
  "components-overlays--hover-card",
  "components-overlays--popover",
  "components-overlays--sheet",
  "components-overlays--tooltip",
  "components-surfaces--badge",
  "components-surfaces--card",
  "components-surfaces--dialog",
  "components-surfaces--disclosure",
  "foundations--contrast",
  "foundations--headings",
  "foundations--palette",
  "foundations--type",
  "foundations-custom-palette--generator",
  "showcase--matrix",
  "showcase--sample-app",
] as const;

type ArgTypes = { readonly options?: readonly string[] };

const buttonMeta = buttonStories.default as {
  argTypes?: { variant?: ArgTypes; size?: ArgTypes };
};

function enumValues(attribute: "data-variant" | "data-size", arg: "variant" | "size"): { options: readonly string[]; absent: string } {
  const rule = USAGE.button.find((item) => item.kind === "enum" && item.attribute === attribute);
  if (rule?.kind !== "enum") throw new Error(`no enum rule for ${attribute}`);
  const options = buttonMeta.argTypes?.[arg]?.options;
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

test.beforeAll(({ browserName }) => {
  if (browserName !== "firefox") return;
  bundleChecker();
});

test.beforeEach(({ browserName }) => {
  test.skip(browserName !== "firefox", "the usage sweep runs in Firefox");
});

test("usage: every story, the Playground values, and the toast buttons", async ({ page }, testInfo) => {
  test.setTimeout(10 * 60_000);
  const findings: string[] = [];

  const record = async (story: string, state: string, selector: string) => {
    for (const line of await problemsIn(page, selector)) findings.push(`${story} [${state}] ${line}`);
  };

  const ids = await storyIds(page);
  expect([...ids].sort()).toEqual([...STORY_IDS].sort());

  let checked = 0;
  for (const story of ids) {
    await test.step(story, async () => {
      await openStory(page, story);
      await record(story, "rendered", "#storybook-root");
      checked += 1;
    });
  }

  for (const value of variantControl.options) {
    await openStory(page, "components-button--playground", "", `variant:${value}`);
    const actual = await page.locator("#storybook-root .odd-button").getAttribute("data-variant");
    const expected = value === variantControl.absent ? null : value;
    if (actual !== expected) findings.push(`components-button--playground [variant=${value}] data-variant=${String(actual)}`);
    await record("components-button--playground", `variant=${value}`, "#storybook-root");
  }

  for (const value of sizeControl.options) {
    await openStory(page, "components-button--playground", "", `size:${value}`);
    const actual = await page.locator("#storybook-root .odd-button").getAttribute("data-size");
    const expected = value === sizeControl.absent ? null : value;
    if (actual !== expected) findings.push(`components-button--playground [size=${value}] data-size=${String(actual)}`);
    await record("components-button--playground", `size=${value}`, "#storybook-root");
  }

  for (const value of ariaValues("aria-disabled")) {
    await openStory(page, "components-button--playground", "", `disabled:!${value}`);
    const button = page.locator("#storybook-root .odd-button");
    const aria = await button.getAttribute("aria-disabled");
    const disabled = await button.evaluate((el) => el.hasAttribute("disabled"));
    if (aria !== (value === "true" ? "true" : null) || disabled) {
      findings.push(`components-button--playground [disabled=${value}] aria-disabled=${String(aria)} disabled=${disabled}`);
    }
    await record("components-button--playground", `disabled=${value}`, "#storybook-root");
  }

  for (const value of ariaValues("aria-busy")) {
    await openStory(page, "components-button--playground", "", `busy:!${value}`);
    const aria = await page.locator("#storybook-root .odd-button").getAttribute("aria-busy");
    if (aria !== (value === "true" ? "true" : null)) findings.push(`components-button--playground [busy=${value}] aria-busy=${String(aria)}`);
    await record("components-button--playground", `busy=${value}`, "#storybook-root");
  }

  await openStory(page, "components-interactive--toast");
  const triggers = [
    ["saved", "Save deck"],
    ["undo", "Remove card"],
    ["error", "Fail to sync"],
  ] as const;
  for (const [kind, name] of triggers) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.locator(".odd-toast").last()).toBeVisible();
    await record("components-interactive--toast", `toast ${kind}`, ".odd-toaster");
  }
  await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
  await expect(page.locator('.odd-toast button[aria-label^="Dismiss"]')).toHaveCount(3);

  await page.locator('button[commandfor="toast-settings"][command="show-modal"]').click();
  await page.locator("#toast-settings [data-toast=saved]").click();
  await expect(page.locator('.odd-toast button[aria-label="Dismiss: Deck saved"]').last()).toBeVisible();
  await record("components-interactive--toast", "toast saved inside settings", ".odd-toaster");

  console.log(`[${testInfo.project.name}] ${checked} stories, ${findings.length} diagnostics`);
  await testInfo.attach("usage-summary.json", {
    contentType: "application/json",
    body: JSON.stringify({ stories: checked, findings }, null, 2),
  });
  expect(checked).toBe(STORY_IDS.length);
  expect(findings, "usage diagnostics").toEqual([]);
});
