import type { Page } from "@playwright/test";
import type { Renderer } from "storybook/internal/types";
import type { PreviewWeb } from "storybook/preview-api";
import type { Storybook } from "../stories/catalog.ts";

/**
 * Opens one story in Storybook's isolated iframe and waits until it has rendered and its play has returned.
 * a11y.manual turns off the Storybook a11y addon's automatic run, so it never races our own axe.
 */
export async function openStory(page: Page, id: string, globals = "", args = "", storybook: Storybook = "html"): Promise<void> {
  const g = [globals, "a11y.manual:!true"].filter(Boolean).join(";");
  await page.goto(`/${storybook}/iframe.html?id=${id}&viewMode=story&globals=${g}${args ? `&args=${args}` : ""}`);
  // Not "finished": the phases after play wait up to 5s for running animations, and a scroll-driven fill never ends.
  await page.waitForFunction(() => {
    const render = (window as Window & { __STORYBOOK_PREVIEW__?: PreviewWeb<Renderer> }).__STORYBOOK_PREVIEW__?.currentRender;
    const pending = new Set(["preparing", "loading", "beforeEach", "rendering", "playing"]);
    return render !== undefined && "phase" in render && render.phase !== undefined && !pending.has(render.phase);
  });
  if (await page.locator("body.sb-show-errordisplay").count()) throw new Error(`story ${id} failed to render`);
  await page.evaluate(() => document.fonts.ready);
}

export async function storyIds(page: Page, storybook: Storybook = "html"): Promise<string[]> {
  const index = await (await page.request.get(`/${storybook}/index.json`)).json();
  return Object.values(index.entries as Record<string, { id: string; type: string }>)
    .filter((entry) => entry.type === "story")
    .map((entry) => entry.id);
}
