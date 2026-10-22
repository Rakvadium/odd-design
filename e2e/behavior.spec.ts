import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { openStory } from "./story.ts";

// Behavior that depends on the engine: native features each browser may or may not have, the JS
// fallbacks that stand in for them, and CSS that only Firefox or WebKit reads. Each test notes
// whether the browser used its native feature or our fallback, and attaches screenshots where only
// pixels can show the result.

/** The element's box once its transitions have finished: overlays scale in from 0.96, which shifts their edges. */
const rect = (page: Page, selector: string) =>
  page.locator(selector).evaluate(async (el) => {
    await Promise.all(el.getAnimations().map((a) => a.finished));
    const r = el.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, cx: r.left + r.width / 2 };
  });

/** Moves the pointer off the page first, so the browser always sees the pointer arrive on the element. */
async function hoverFresh(page: Page, selector: string) {
  await page.mouse.move(0, 0);
  await page.locator(selector).hover();
}

const isOpen = (page: Page, selector: string) => page.locator(selector).evaluate((el) => el.matches(":popover-open, [open]"));

/**
 * Waits, inside the page, for a popover or dialog to open or close. Under load, Playwright's round
 * trips into Firefox can lag by seconds, so expect.poll timed out on tooltips that had opened on time.
 */
const waitOpen = (page: Page, selector: string, open = true) =>
  page.waitForFunction(
    ([sel, want]) => document.querySelector(sel)?.matches(":popover-open, [open]") === want,
    [selector, open] as const,
    { timeout: 10_000 },
  );

/** Records, in page time, when the pointer enters and leaves `invoker` and when `target` opens and closes. */
const watchHover = (page: Page, invoker: string, target: string) =>
  page.evaluate(
    ([inv, tgt]) => {
      const log: Record<string, number[]> = ((window as any).__hover = { enter: [], leave: [], open: [], closed: [] });
      const i = document.querySelector(inv)!;
      i.addEventListener("pointerenter", () => log.enter!.push(performance.now()));
      i.addEventListener("pointerleave", () => log.leave!.push(performance.now()));
      document.querySelector(tgt)!.addEventListener("toggle", (e) => log[(e as ToggleEvent).newState]!.push(performance.now()));
    },
    [invoker, target] as const,
  );

/** Page-time ms from the last pointer `from` event to the target's last `to` toggle, once both have happened. */
const hoverDelay = async (page: Page, from: "enter" | "leave", to: "open" | "closed") => {
  const handle = await page.waitForFunction(
    ([f, t]) => {
      const log = (window as any).__hover as Record<string, number[]>;
      const a = log[f]!.at(-1);
      const b = log[t]!.at(-1);
      return a !== undefined && b !== undefined && b >= a ? { ms: b - a } : null;
    },
    [from, to] as const,
    { timeout: 10_000 },
  );
  return ((await handle.jsonValue()) as { ms: number }).ms;
};

async function note(page: Page, testInfo: TestInfo, feature: string, check: string) {
  const native = await page.evaluate(check);
  testInfo.annotations.push({ type: "path", description: `${feature}: ${native ? "native" : "fallback"}` });
}

async function shot(page: Page, testInfo: TestInfo, name: string, selector?: string) {
  const target = selector ? page.locator(selector) : page;
  await testInfo.attach(name, { body: await target.screenshot(), contentType: "image/png" });
}

test.describe("tooltips and hover cards (interestfor)", () => {
  test("a tooltip opens on hover, centered above its button, and closes when the pointer leaves", async ({ page }, testInfo) => {
    await openStory(page, "components-overlays--tooltip", "mode:light");
    await note(page, testInfo, "interestfor", `"interestForElement" in HTMLButtonElement.prototype`);
    await watchHover(page, '[interestfor="tip-delete"]', "#tip-delete");
    await hoverFresh(page, '[interestfor="tip-delete"]');
    // Both engines here use the fallback: 500 ms to show, 250 ms to hide, timed in the page.
    const shown = await hoverDelay(page, "enter", "open");
    expect(shown, "opens after the show delay, not at once").toBeGreaterThanOrEqual(450);
    expect(shown, "opens after the show delay, not much later").toBeLessThan(1000);
    const button = await rect(page, '[interestfor="tip-delete"]');
    const tip = await rect(page, "#tip-delete");
    expect(Math.abs(tip.cx - button.cx), "tooltip centered on its button").toBeLessThan(2);
    expect(Math.abs(button.top - tip.bottom - 8), "8px above the button").toBeLessThan(1.5);
    await shot(page, testInfo, "tooltip-hover.png");
    await page.mouse.move(0, 0);
    const hidden = await hoverDelay(page, "leave", "closed");
    expect(hidden, "closes after the hide delay").toBeGreaterThanOrEqual(200);
    expect(hidden, "closes after the hide delay, not much later").toBeLessThan(750);
  });

  test("a tooltip opens on keyboard focus and Escape closes it", async ({ page }) => {
    await openStory(page, "components-overlays--tooltip", "mode:light");
    for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
    await expect(page.locator('[interestfor="tip-publish"]')).toBeFocused();
    await waitOpen(page, "#tip-publish");
    await page.keyboard.press("Escape");
    await waitOpen(page, "#tip-publish", false);
  });

  test("a hover card opens under its link and stays open while the pointer is inside it", async ({ page }, testInfo) => {
    await openStory(page, "components-overlays--hover-card", "mode:light");
    await hoverFresh(page, 'a[interestfor="preview-midnight"]');
    await waitOpen(page, "#preview-midnight");
    const link = await rect(page, 'a[interestfor="preview-midnight"]');
    const card = await rect(page, "#preview-midnight");
    expect(Math.abs(card.left - link.left), "aligned to the link's start edge").toBeLessThan(2);
    expect(Math.abs(card.top - link.bottom - 8), "8px below the link").toBeLessThan(1.5);
    await page.locator("#preview-midnight .odd-badge").first().hover();
    await page.waitForTimeout(800);
    expect(await isOpen(page, "#preview-midnight"), "still open with the pointer inside").toBe(true);
    await shot(page, testInfo, "hover-card.png");
  });
});

test.describe("popovers and dialogs", () => {
  test("a popover anchors under its invoker and flips at the viewport edge", async ({ page }, testInfo) => {
    await openStory(page, "components-overlays--popover", "mode:light");
    await note(page, testInfo, "anchor positioning", `CSS.supports("position-area: block-end")`);
    // Opened from the keyboard: focus return is for keyboard users, and WebKit, like Safari,
    // doesn't focus a button when it's clicked.
    const opener = 'button[commandfor="filters"][command="toggle-popover"]';
    await page.locator(opener).focus();
    await page.keyboard.press("Enter");
    await waitOpen(page, "#filters");
    const button = await rect(page, opener);
    const pop = await rect(page, "#filters");
    expect(Math.abs(pop.left - button.left), "aligned to the button's start edge").toBeLessThan(2);
    expect(Math.abs(pop.top - button.bottom - 8), "8px below the button").toBeLessThan(1.5);
    await shot(page, testInfo, "popover-open.png");
    await page.keyboard.press("Escape");
    await expect(page.locator(opener)).toBeFocused();
    const endOpener = 'button[commandfor="filters-end"][command="toggle-popover"]';
    await page.locator(endOpener).click();
    await waitOpen(page, "#filters-end");
    const end = await rect(page, endOpener);
    const flipped = await rect(page, "#filters-end");
    expect(Math.abs(flipped.right - end.right), "flipped to align with the button's end edge").toBeLessThan(2);
    await shot(page, testInfo, "popover-flipped.png");
  });

  test("a dialog with closedby=any closes on a backdrop click", async ({ page }, testInfo) => {
    await openStory(page, "components-surfaces--dialog", "mode:light");
    await note(page, testInfo, "closedby", `"closedBy" in HTMLDialogElement.prototype`);
    await page.locator('button[commandfor="confirm-delete"][command="show-modal"]').click();
    await waitOpen(page, "#confirm-delete");
    await expect(page.locator("#confirm-delete button", { hasText: "Close" })).toBeFocused();
    await page.mouse.click(10, 10);
    await waitOpen(page, "#confirm-delete", false);
  });

  test("an alert dialog ignores backdrop clicks but closes on Escape", async ({ page }) => {
    await openStory(page, "components-overlays--alert-dialog", "mode:light");
    await page.locator('button[commandfor="discard"][command="show-modal"]').focus();
    await page.keyboard.press("Enter");
    await waitOpen(page, "#discard");
    await page.mouse.click(10, 10);
    await page.waitForTimeout(400);
    expect(await isOpen(page, "#discard")).toBe(true);
    await page.keyboard.press("Escape");
    await waitOpen(page, "#discard", false);
    await expect(page.locator('button[commandfor="discard"][command="show-modal"]')).toBeFocused();
  });

  test("sheets fill the edge they slide in from", async ({ page }, testInfo) => {
    await openStory(page, "components-overlays--sheet", "mode:light");
    const viewport = page.viewportSize()!;
    for (const side of ["end", "start", "bottom"] as const) {
      await page.locator(`button[commandfor="sheet-${side}"][command="show-modal"]`).click();
      await page.waitForTimeout(500);
      const r = await rect(page, `#sheet-${side}`);
      if (side === "end") expect(Math.round(r.right)).toBe(viewport.width);
      if (side === "start") expect(Math.round(r.left)).toBe(0);
      if (side === "bottom") expect(Math.round(r.bottom)).toBe(viewport.height);
      await expect(page.locator(`#sheet-${side} button[aria-label="Close"]`)).toBeFocused();
      await shot(page, testInfo, `sheet-${side}.png`);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
  });
});

test.describe("keyboard widgets", () => {
  test("the menu opens on ArrowDown, stops on disabled items, wraps, and Tab moves past the trigger", async ({ page }) => {
    await openStory(page, "components-interactive--menu", "mode:light");
    const trigger = page.locator('button[commandfor="deck-actions"]');
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator(".odd-menu-item", { hasText: "Duplicate" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    // NVDA heard the old menu skip Merge while still counting it ("Show prices 4 of 9"). A disabled
    // item stays reachable, so it can be announced as unavailable, and choosing it does nothing.
    const merge = page.locator(".odd-menu-item", { hasText: "Merge" });
    await expect(merge).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(merge, "Enter on a disabled item keeps the menu open").toBeFocused();
    await expect(page.locator("#menu-log")).toHaveText("");
    await page.keyboard.press("ArrowDown");
    await expect(page.locator(".odd-menu-item", { hasText: "Show prices" })).toBeFocused();
    for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowUp");
    await expect(page.locator(".odd-menu-item", { hasText: "Delete deck" })).toBeFocused();
    await page.keyboard.press("c");
    await expect(page.locator(".odd-menu-item", { hasText: "Compact grid" })).toBeFocused();
    await page.keyboard.press("Home");
    await page.keyboard.press("Enter");
    await expect(page.locator("#menu-log")).toHaveText("Chose “Duplicate”");
    await expect(trigger).toBeFocused();
    await page.keyboard.press("ArrowDown");
    // The menu focuses its first item once it has opened; Tab from there.
    await expect(page.locator(".odd-menu-item", { hasText: "Duplicate" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator("#after-menu")).toBeFocused();
    expect(await isOpen(page, "#deck-actions")).toBe(false);
  });

  test("tabs follow the arrow keys, and manual tabs wait for Enter", async ({ page }) => {
    await openStory(page, "components-interactive--tabs", "mode:light");
    await page.locator("#tab-cards").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#tab-stats")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#panel-stats")).toBeVisible();
    await page.keyboard.press("End");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#tab-cards")).toBeFocused();
    await page.locator("#tab-s7").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#tab-s6")).toBeFocused();
    await expect(page.locator("#tab-s7")).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect(page.locator("#tab-s6")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#panel-s6")).toBeVisible();
  });

  test("a toast shown over a modal dialog is clickable and the region moves back after", async ({ page }) => {
    await openStory(page, "components-interactive--toast", "mode:light");
    await page.locator('button[commandfor="toast-settings"][command="show-modal"]').click();
    await page.waitForTimeout(300);
    await page.locator("#toast-settings [data-toast=saved]").click();
    const dismiss = page.locator('.odd-toast button[aria-label^="Dismiss"]');
    await expect(dismiss).toBeVisible();
    await dismiss.click();
    await expect(page.locator(".odd-toast")).toHaveCount(0);
    expect(await isOpen(page, "#toast-settings"), "the dialog stays open").toBe(true);
    await page.keyboard.press("Escape");
    await expect.poll(() => page.locator(".odd-toaster").evaluate((el) => el.parentElement!.tagName)).toBe("BODY");
  });

  // NVDA read the old markup as "Deck savedMidnight Control, version 15. Dismiss: Deck saved": the
  // title ran into the description and the Dismiss button's name was part of the announcement.
  test("a toast is announced as one sentence, without its buttons", async ({ page }) => {
    await openStory(page, "components-interactive--toast", "mode:light");
    await page.getByRole("button", { name: "Save deck" }).click();
    await expect(page.locator(".odd-toast")).toHaveCount(1);
    const live = page.locator('.odd-toaster [aria-live="polite"]');
    await expect(live).toHaveCount(1);
    await expect(live).toHaveText("Deck saved. Midnight Control, version 15.");
    await expect(live.locator("button")).toHaveCount(0);
    await page.locator('.odd-toast button[aria-label^="Dismiss"]').click();
    await expect(live).toHaveText("");
  });

  test("select-all checks every row, shows mixed, and clears", async ({ page }) => {
    await openStory(page, "components-data-display--table", "mode:light");
    const all = page.locator("[data-select-all]");
    const state = () =>
      page.evaluate(() => {
        const a = document.querySelector<HTMLInputElement>("[data-select-all]")!;
        return { all: a.checked, mixed: a.indeterminate, rows: [...document.querySelectorAll<HTMLInputElement>("tbody input")].map((c) => c.checked) };
      });
    expect(await state()).toEqual({ all: false, mixed: true, rows: [false, true, false, false] });
    await all.click();
    expect(await state()).toEqual({ all: true, mixed: false, rows: [true, true, true, true] });
    await page.locator('input[aria-label="Select Tidecaller"]').click();
    expect((await state()).mixed).toBe(true);
    await all.click();
    await all.click();
    expect(await state()).toEqual({ all: false, mixed: false, rows: [false, false, false, false] });
  });

  test("a broken avatar image falls back to its initials and keeps its name", async ({ page }) => {
    await openStory(page, "components-data-display--avatar", "mode:light");
    const avatar = page.locator("#broken-avatar");
    await expect(avatar).toHaveText("JP");
    await expect(avatar).toHaveAttribute("role", "img");
    await expect(avatar).toHaveAttribute("aria-label", "Jo Park");
  });
});

test.describe("engine-specific CSS", () => {
  test("the slider moves by keyboard and its fill follows the thumb", async ({ page }, testInfo) => {
    await openStory(page, "components-forms--slider", "mode:light");
    await shot(page, testInfo, "slider-before.png", ".odd-stack");
    await page.locator("#copies").focus();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("#copies")).toHaveValue("1");
    await expect(page.locator("#copies-value")).toHaveText("1 of 4");
    // Where the fill's scroll timeline runs (--_on is 1), its progress must match the value exactly.
    // Where it doesn't, nothing may be filled: a partial fill would misstate the value.
    const fill = await page
      .locator("#card-size")
      .evaluate((el) => ({ on: Number(getComputedStyle(el).getPropertyValue("--_on")), progress: Number(getComputedStyle(el).getPropertyValue("--_progress")) }));
    testInfo.annotations.push({ type: "path", description: `slider fill: ${fill.on ? "scroll timeline" : testInfo.project.name === "firefox" ? "::-moz-range-progress" : "plain track"}` });
    if (fill.on) expect(fill.progress).toBeCloseTo(0.65, 2);
    await shot(page, testInfo, "slider-after.png", ".odd-stack");
  });

  test("progress and meter bars render, including in forced colors", async ({ page }, testInfo) => {
    await openStory(page, "components-feedback--progress", "mode:light");
    await shot(page, testInfo, "progress-light.png", "#storybook-root");
    await page.emulateMedia({ forcedColors: "active" });
    await openStory(page, "components-feedback--progress");
    await shot(page, testInfo, "progress-forced-colors.png", "#storybook-root");
  });

  test("the search field's clear button is restyled", async ({ page }, testInfo) => {
    await openStory(page, "components-forms--search", "mode:light");
    await page.locator("#card-search").focus();
    await shot(page, testInfo, "search-focused.png", "#storybook-root");
  });

  test("reduced motion stops the skeleton pulse and the progress sweep", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openStory(page, "components-feedback--skeleton");
    expect(await page.locator(".odd-skeleton").first().evaluate((el) => getComputedStyle(el).animationDuration)).toBe("0s");
    await openStory(page, "components-feedback--progress");
    expect(await page.locator("#sync").evaluate((el) => getComputedStyle(el).animationDuration)).toBe("0s");
  });
});
