import type { Page } from "@playwright/test";

/**
 * Opens one story in Storybook's isolated iframe and waits until it has rendered.
 * a11y.manual turns off the Storybook a11y addon's automatic run, so it never races our own axe.
 */
export async function openStory(page: Page, id: string, globals = "", args = "") {
  const g = [globals, "a11y.manual:!true"].filter(Boolean).join(";");
  await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=${g}${args ? `&args=${args}` : ""}`);
  await page.waitForFunction(() => {
    const root = document.querySelector("#storybook-root");
    return document.readyState === "complete" && !!root && root.childElementCount > 0;
  });
  if (await page.locator("body.sb-show-errordisplay").count()) throw new Error(`story ${id} failed to render`);
  await page.evaluate(() => document.fonts.ready);
}

/** Every story id Storybook serves. */
export async function storyIds(page: Page): Promise<string[]> {
  const index = await (await page.request.get("/index.json")).json();
  return Object.values(index.entries as Record<string, { id: string; type: string }>)
    .filter((e) => e.type === "story")
    .map((e) => e.id);
}
