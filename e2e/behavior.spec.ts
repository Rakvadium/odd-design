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
  for (const storybook of ["html", "react"] as const) {
    test(`a popover anchors under its invoker and flips at the viewport edge (${storybook})`, async ({ page }, testInfo) => {
      await openStory(page, "components-overlays--popover", "mode:light", "", storybook);
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
      await shot(page, testInfo, `popover-open-${storybook}.png`);
      await page.keyboard.press("Escape");
      await expect(page.locator(opener)).toBeFocused();
      const endOpener = 'button[commandfor="filters-end"][command="toggle-popover"]';
      await page.locator(endOpener).click();
      await waitOpen(page, "#filters-end");
      const end = await rect(page, endOpener);
      const flipped = await rect(page, "#filters-end");
      expect(Math.abs(flipped.right - end.right), "flipped to align with the button's end edge").toBeLessThan(2);
      await shot(page, testInfo, `popover-flipped-${storybook}.png`);
    });
  }

  for (const storybook of ["html", "react"] as const) {
    test(`a dialog with closedby=any closes on a backdrop click (${storybook})`, async ({ page }, testInfo) => {
      await openStory(page, "components-surfaces--dialog", "mode:light", "", storybook);
      await note(page, testInfo, "closedby", `"closedBy" in HTMLDialogElement.prototype`);
      await page.locator('button[commandfor="confirm-delete"][command="show-modal"]').click();
      await waitOpen(page, "#confirm-delete");
      await expect(page.locator("#confirm-delete button", { hasText: "Close" })).toBeFocused();
      await page.mouse.click(10, 10);
      await waitOpen(page, "#confirm-delete", false);
    });

    test(`an alert dialog ignores backdrop clicks but closes on Escape (${storybook})`, async ({ page }) => {
      await openStory(page, "components-overlays--alert-dialog", "mode:light", "", storybook);
      await page.locator('button[commandfor="discard"][command="show-modal"]').focus();
      await page.keyboard.press("Enter");
      await waitOpen(page, "#discard");
      await expect(page.locator("#discard button", { hasText: "Keep editing" })).toBeFocused();
      await page.mouse.click(10, 10);
      await page.waitForTimeout(400);
      expect(await isOpen(page, "#discard")).toBe(true);
      await page.keyboard.press("Escape");
      await waitOpen(page, "#discard", false);
      await expect(page.locator('button[commandfor="discard"][command="show-modal"]')).toBeFocused();
    });
  }

  for (const storybook of ["html", "react"] as const) {
    test(`sheets fill the edge they slide in from and close on Escape or a backdrop click (${storybook})`, async ({ page }, testInfo) => {
      await openStory(page, "components-overlays--sheet", "mode:light", "", storybook);
      const viewport = page.viewportSize()!;
      for (const side of ["end", "start", "bottom"] as const) {
        const opener = page.locator(`button[commandfor="sheet-${side}"][command="show-modal"]`);
        await opener.click();
        await waitOpen(page, `#sheet-${side}`);
        const r = await rect(page, `#sheet-${side}`);
        if (side === "end") expect(Math.round(r.right)).toBe(viewport.width);
        if (side === "start") expect(Math.round(r.left)).toBe(0);
        if (side === "bottom") expect(Math.round(r.bottom)).toBe(viewport.height);
        await expect(page.locator(`#sheet-${side} button[aria-label="Close"]`)).toBeFocused();
        await shot(page, testInfo, `sheet-${side}-${storybook}.png`);
        await page.keyboard.press("Escape");
        await waitOpen(page, `#sheet-${side}`, false);
      }
      await page.locator('button[commandfor="sheet-end"][command="show-modal"]').click();
      await waitOpen(page, "#sheet-end");
      await page.mouse.click(10, 10);
      await waitOpen(page, "#sheet-end", false);
    });
  }
});

test.describe("keyboard widgets", () => {
  for (const storybook of ["html", "react"] as const) {
    test(`the menu opens on ArrowDown, stops on disabled items, wraps, and Tab moves past the trigger (${storybook})`, async ({ page }) => {
      await openStory(page, "components-interactive--menu", "mode:light", "", storybook);
      const trigger = page.locator('button[commandfor="deck-actions"]');
      await trigger.focus();
      await page.keyboard.press("ArrowDown");
      await expect(page.locator(".odd-menu-item", { hasText: "Duplicate" })).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
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
      const compact = page.locator(".odd-menu-item", { hasText: "Compact grid" });
      await expect(compact).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(compact, "a checkbox item toggles and the menu stays open").toHaveAttribute("aria-checked", "true");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await expect(page.locator('[role="menuitemradio"][aria-checked="true"]')).toHaveText(["Last edited"]);
      await page.keyboard.press("Home");
      await page.keyboard.press("Enter");
      await expect(page.locator("#menu-log")).toHaveText("Chose “Duplicate”");
      await expect(trigger).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await expect(page.locator(".odd-menu-item", { hasText: "Duplicate" })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(page.locator("#after-menu")).toBeFocused();
      expect(await isOpen(page, "#deck-actions")).toBe(false);
    });
  }

  for (const storybook of ["html", "react"] as const) {
    test(`tabs follow the arrow keys, and manual tabs wait for Enter (${storybook})`, async ({ page }) => {
      await openStory(page, "components-interactive--tabs", "mode:light", "", storybook);
      await expect(page.locator("#tab-s5"), "enhanceTabs ran").toHaveAttribute("tabindex", "-1");
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
      await page.keyboard.press("ArrowRight");
      await expect(page.locator("#tab-s7"), "ArrowRight skips the disabled tab").toBeFocused();
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("Enter");
      await expect(page.locator("#tab-s6")).toHaveAttribute("aria-selected", "true");
      await expect(page.locator("#panel-s6")).toBeVisible();
      await page.locator("#tab-cards").click();
      await expect(page.locator("#panel-cards")).toBeVisible();
      await page.keyboard.press("Tab");
      await expect(page.locator("#panel-cards"), "Tab leaves the list for the chosen panel").toBeFocused();
    });
  }

  for (const storybook of ["html", "react"] as const) {
    test(`a toast shown over a modal dialog is clickable and the list comes home after (${storybook})`, async ({ page }) => {
      await openStory(page, "components-interactive--toast", "mode:light", "", storybook);
      await page.locator('button[commandfor="toast-settings"][command="show-modal"]').click();
      await page.waitForTimeout(300);
      await page.locator("#toast-settings [data-toast=saved]").click();
      await expect(page.locator("#toast-settings .odd-toast"), "the toast shows inside the modal").toHaveCount(1);
      const dismiss = page.locator('.odd-toast button[aria-label^="Dismiss"]');
      await expect(dismiss).toBeVisible();
      await dismiss.click();
      await expect(page.locator(".odd-toast")).toHaveCount(0);
      expect(await isOpen(page, "#toast-settings"), "the dialog stays open").toBe(true);
      await page.keyboard.press("Escape");
      await expect(page.locator(".odd-toaster"), "the stand-in is gone").toHaveCount(1);
      await expect(page.locator(".odd-toaster > ol"), "the region holds the list again").toHaveCount(1);
    });

    test(`a toast is announced as one sentence, without its buttons (${storybook})`, async ({ page }) => {
      await openStory(page, "components-interactive--toast", "mode:light", "", storybook);
      await page.getByRole("button", { name: "Save deck" }).click();
      await expect(page.locator(".odd-toast")).toHaveCount(1);
      const live = page.locator('.odd-toaster [aria-live="polite"]');
      await expect(live).toHaveCount(1);
      await expect(live).toHaveText("Deck saved. Midnight Control, version 15.");
      await expect(live.locator("button")).toHaveCount(0);
      await page.locator('.odd-toast button[aria-label^="Dismiss"]').click();
      await expect(live).toHaveText("");
    });
  }

  test("ArrowDown opens the menu after the HTML story renders it again", async ({ page }) => {
    const errors: Error[] = [];
    page.on("pageerror", (error) => errors.push(error));
    await openStory(page, "components-interactive--menu", "mode:light");
    const old = await page.locator("#deck-actions").elementHandle();
    await page.evaluate(() => (window as any).__STORYBOOK_PREVIEW__.channel.emit("forceReRender"));
    await page.waitForFunction((menu) => !menu!.isConnected, old);
    await page.locator('button[commandfor="deck-actions"]').focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator(".odd-menu-item", { hasText: "Duplicate" })).toBeFocused();
    expect(errors.map((error) => error.message)).toEqual([]);
  });

  for (const storybook of ["html", "react"] as const) {
    test(`select-all checks every row, shows mixed, and clears (${storybook})`, async ({ page }) => {
      await openStory(page, "components-data-display--table", "mode:light", "", storybook);
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
  }

  test("a broken avatar image falls back to its initials and keeps its name", async ({ page }) => {
    await openStory(page, "components-data-display--avatar-fallback", "mode:light");
    const avatar = page.locator("#broken-avatar");
    await expect(avatar).toHaveText("JP");
    await expect(avatar).toHaveAttribute("role", "img");
    await expect(avatar).toHaveAttribute("aria-label", "Jo Park");
  });
});

test.describe("machine controls", () => {
  test("a held stepper button repeats in whole steps of the input, and the press fires one change", async ({ page }) => {
    await openStory(page, "recipes-number-stepper--jog-row", "mode:light");
    const wrist = page.locator("#jog-wrist");
    await page.evaluate(() => {
      const log: string[] = ((window as any).__changes = []);
      document.addEventListener("change", (event) => log.push((event.target as HTMLInputElement).value));
    });
    await page.locator('[role="group"] button', { hasText: "−5" }).click();
    await expect(wrist).toHaveValue("40");
    await page.locator('[role="group"] button', { hasText: "−0.5" }).hover();
    await page.mouse.down();
    await page.waitForTimeout(900);
    await page.mouse.up();
    const held = Number(await wrist.inputValue());
    expect(held, "held for 900 ms: one step, then repeats after 400 ms every 100 ms").toBeLessThanOrEqual(38.5);
    expect(held % 0.5).toBe(0);
    expect(await page.evaluate(() => (window as any).__changes)).toEqual(["40", String(held)]);
    await expect(page.locator('[role="group"] button', { hasText: "+5" })).toHaveAttribute("aria-disabled", "false");
  });

  test("the log follows new lines until the reader scrolls up", async ({ page }) => {
    await openStory(page, "components-feedback--log", "mode:light");
    const log = page.locator("#arm-log");
    const fromBottom = () => log.evaluate((el) => Math.round(el.scrollHeight - el.scrollTop - el.clientHeight));
    const add = page.locator("#add-log-line");
    await add.click();
    await expect.poll(fromBottom).toBe(0);
    await log.hover();
    await page.mouse.wheel(0, -1000);
    await expect.poll(() => log.evaluate((el) => el.scrollTop)).toBe(0);
    await add.click();
    await page.waitForTimeout(100);
    expect(await log.evaluate((el) => el.scrollTop), "scrolled up, so the log stays put").toBe(0);
    await log.hover();
    await page.mouse.wheel(0, 5000);
    await expect.poll(fromBottom).toBe(0);
    await add.click();
    await expect.poll(fromBottom).toBe(0);
  });

  test("the app grid narrows panels to half, then to one column, by its own width", async ({ page }, testInfo) => {
    await openStory(page, "components-layout--app-shell", "mode:light");
    const fractions = () =>
      page.locator("#shell-grid").evaluate((grid) => {
        const content = grid.clientWidth - parseFloat(getComputedStyle(grid).paddingLeft) - parseFloat(getComputedStyle(grid).paddingRight);
        return [...grid.children].map((panel) => Math.round((panel.getBoundingClientRect().width / content) * 100));
      });
    expect(await fractions()).toEqual([66, 32, 100]);
    await shot(page, testInfo, "shell-wide.png", "#storybook-root");
    await page.setViewportSize({ width: 900, height: 900 });
    expect(await fractions()).toEqual([66, 49, 100]);
    await page.setViewportSize({ width: 560, height: 900 });
    expect(await fractions()).toEqual([100, 100, 100]);
    await shot(page, testInfo, "shell-narrow.png", "#storybook-root");
  });
});

test.describe("text and loading", () => {
  for (const storybook of ["html", "react"] as const) {
    test(`a current link takes the text color and drops its underline, and a resting link keeps both (${storybook})`, async ({ page }) => {
      await openStory(page, "components-link--states", "mode:light", "", storybook);
      const look = (name: string) =>
        page.getByRole("link", { name, exact: true }).evaluate((el) => {
          const style = getComputedStyle(el);
          const probe = document.createElement("span");
          probe.style.color = "var(--foreground)";
          el.parentElement!.append(probe);
          const foreground = getComputedStyle(probe).color;
          probe.remove();
          return { text: style.color === foreground, underline: style.textDecorationLine };
        });
      expect(await look("Settings")).toEqual({ text: false, underline: "underline" });
      expect(await look("Roadmap")).toEqual({ text: true, underline: "none" });
    });

    test(`Tab moves through the links in a sentence in order (${storybook})`, async ({ page, browserName }) => {
      test.skip(browserName !== "firefox", "this host's WebKit does not tab to links");
      await openStory(page, "components-link--in-text", "mode:light", "", storybook);
      await page.keyboard.press("Tab");
      await expect(page.getByRole("link", { name: "setup guide" })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(page.getByRole("link", { name: "Settings" })).toBeFocused();
    });

    test(`a spinner turns every 700ms and every 2.4s under reduced motion (${storybook})`, async ({ page }) => {
      const timing = () =>
        page.locator("#storybook-root .odd-spinner").first().evaluate((el) => {
          const style = getComputedStyle(el);
          return { name: style.animationName, duration: style.animationDuration, iterations: style.animationIterationCount };
        });
      await openStory(page, "components-spinner--states", "mode:light", "", storybook);
      expect(await timing()).toEqual({ name: "odd-spinner-turn", duration: "0.7s", iterations: "infinite" });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await openStory(page, "components-spinner--states", "mode:light", "", storybook);
      expect(await timing()).toEqual({ name: "odd-spinner-turn", duration: "2.4s", iterations: "infinite" });
    });
  }
});

test.describe("combobox", () => {
  const PLAYGROUND = "components-combobox--playground";
  const input = "#playground-city";
  const list = "#playground-city-list";
  const active = (page: Page, field = input) =>
    page.locator(field).evaluate((el) => document.getElementById(el.getAttribute("aria-activedescendant") ?? "")?.textContent ?? null);
  const shown = (page: Page, selector = list) =>
    page.locator(selector).evaluate((el) => [...el.querySelectorAll<HTMLElement>('[role="option"]')].filter((option) => !option.hidden).map((option) => option.textContent));

  for (const storybook of ["html", "react"] as const) {
    test(`ArrowDown opens at the first option, the arrows skip the disabled option and wrap, and Enter chooses with focus kept in the input (${storybook})`, async ({ page }) => {
      await openStory(page, PLAYGROUND, "mode:light", "", storybook);
      await page.locator(input).focus();
      await page.keyboard.press("ArrowDown");
      await waitOpen(page, list);
      expect(await active(page)).toBe("Amsterdam");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      expect(await active(page), "Atlantis is disabled, so the arrows pass it").toBe("Berlin");
      for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowUp");
      expect(await active(page), "ArrowUp wraps from the first option to the last").toBe("Cairo");
      await page.keyboard.press("Enter");
      await waitOpen(page, list, false);
      await expect(page.locator(input)).toHaveValue("Cairo");
      await expect(page.locator(input)).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator(input)).toBeFocused();
    });

    test(`typing filters by prefix with nothing active, a miss shows No results, Escape keeps the text, and Enter with nothing active is left to the form (${storybook})`, async ({ page }) => {
      await openStory(page, PLAYGROUND, "mode:light", "", storybook);
      await page.locator(input).focus();
      await page.keyboard.type("b");
      await waitOpen(page, list);
      expect([await shown(page), await active(page)]).toEqual([["Berlin", "Bogotá"], null]);
      await page.keyboard.type("x");
      await expect(page.getByRole("option", { name: "No results" })).toHaveAttribute("aria-disabled", "true");
      await page.keyboard.press("ArrowDown");
      expect(await active(page), "the No results option is never active").toBe(null);
      await page.keyboard.press("Escape");
      await waitOpen(page, list, false);
      await page.keyboard.press("Escape");
      await expect(page.locator(input)).toHaveValue("bx");
      const prevented = await page.locator(input).evaluate((el) => {
        let result: boolean | undefined;
        document.addEventListener("keydown", (event) => (result = event.defaultPrevented), { once: true });
        el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
        return result;
      });
      expect(prevented, "the browser's own Enter runs, which submits a form").toBe(false);
    });

    test(`a click on the input opens, a click on an option chooses and keeps focus, a disabled option ignores the click, and an outside click and Tab close (${storybook})`, async ({ page }) => {
      await openStory(page, PLAYGROUND, "mode:light", "", storybook);
      await page.locator(input).click();
      await waitOpen(page, list);
      await page.getByRole("option", { name: "Berlin" }).click();
      await waitOpen(page, list, false);
      await expect(page.locator(input)).toHaveValue("Berlin");
      await expect(page.locator(input)).toBeFocused();
      await page.locator(input).fill("");
      await waitOpen(page, list);
      await page.getByRole("option", { name: "Atlantis" }).click({ force: true });
      await page.waitForTimeout(300);
      expect(await isOpen(page, list), "a disabled option keeps the list open").toBe(true);
      await expect(page.locator(input)).toHaveValue("");
      await page.mouse.click(900, 600);
      await waitOpen(page, list, false);
      await page.locator(input).click();
      await waitOpen(page, list);
      await page.keyboard.press("Tab");
      await waitOpen(page, list, false);
      await expect(page.locator(input)).toHaveValue("");
    });

    test(`Home and End move the caret and clear the active option, choosing the same text twice dispatches nothing, and a disabled input stays closed (${storybook})`, async ({ page }) => {
      await openStory(page, PLAYGROUND, "mode:light", "", storybook);
      await page.locator(input).focus();
      await page.keyboard.type("Ber");
      await page.keyboard.press("Escape");
      await page.keyboard.press("Home");
      expect(await page.locator(input).evaluate((el: HTMLInputElement) => [el.selectionStart, el.getAttribute("aria-expanded"), el.hasAttribute("aria-activedescendant")])).toEqual([0, "false", false]);
      await page.keyboard.press("ArrowDown");
      expect(await active(page)).toBe("Berlin");
      await page.keyboard.press("End");
      expect(await page.locator(input).evaluate((el: HTMLInputElement) => [el.selectionStart, el.hasAttribute("aria-activedescendant")])).toEqual([3, false]);
      await page.locator(input).evaluate((el) => {
        const seen: string[] = [];
        el.addEventListener("input", () => seen.push("input"));
        el.addEventListener("change", () => seen.push("change"));
        Object.assign(window, { seen });
      });
      for (let round = 0; round < 2; round++) {
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
      }
      expect(await page.evaluate(() => (window as unknown as { seen: string[] }).seen)).toEqual(["input", "change"]);

      await openStory(page, PLAYGROUND, "mode:light", "disabled:!true", storybook);
      await page.locator(input).click({ force: true });
      await page.locator(input).dispatchEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });
      await page.waitForTimeout(300);
      expect([await isOpen(page, list), await page.locator(input).getAttribute("aria-expanded")]).toEqual([false, "false"]);
    });

    test(`async results open the list, an empty query closes it, and the first Escape closes the list and the second the dialog (${storybook})`, async ({ page }) => {
      await openStory(page, "components-combobox--async", "mode:light", "", storybook);
      await page.locator('button[commandfor="assign-dialog"][command="show-modal"]').click();
      await waitOpen(page, "#assign-dialog");
      await page.locator("#assignee").focus();
      const openAtOnce = await page.locator("#assignee").evaluate((el: HTMLInputElement) => {
        el.value = "lov";
        el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "lov" }));
        return document.querySelector("#assignee-list")!.matches(":popover-open");
      });
      expect(openAtOnce, "nothing opens before results arrive").toBe(false);
      await waitOpen(page, "#assignee-list");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await expect(page.locator("#assignee")).toHaveValue("Ada Lovelace");
      await expect(page.locator("#assign-log")).toHaveText("Assigned to Ada Lovelace");
      await page.locator("#assignee").fill("qq");
      await waitOpen(page, "#assignee-list");
      await expect(page.getByRole("option", { name: "No results" })).toHaveAttribute("aria-disabled", "true");
      await page.locator("#assignee").fill("");
      await waitOpen(page, "#assignee-list", false);
      await page.keyboard.type("hop");
      await waitOpen(page, "#assignee-list");
      await page.keyboard.press("Escape");
      await waitOpen(page, "#assignee-list", false);
      expect(await isOpen(page, "#assign-dialog"), "the first Escape closes only the list").toBe(true);
      await page.keyboard.press("Escape");
      await waitOpen(page, "#assign-dialog", false);
    });

    test(`Escape before async results land keeps the list closed when they land, and reaches the dialog unprevented (${storybook})`, async ({ page }) => {
      await openStory(page, "components-combobox--async", "mode:light", "", storybook);
      await page.locator('button[commandfor="assign-dialog"][command="show-modal"]').click();
      await waitOpen(page, "#assign-dialog");
      await page.locator("#assignee").focus();
      const atEscape = await page.locator("#assignee").evaluate((el: HTMLInputElement) => {
        let prevented: boolean | undefined;
        document.addEventListener("keydown", (event) => (prevented = event.defaultPrevented), { once: true });
        el.value = "lov";
        el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "lov" }));
        el.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
        return { options: document.querySelectorAll('#assignee-list [role="option"]').length, prevented };
      });
      expect(atEscape, "Escape came before any result and was left for the dialog").toEqual({ options: 0, prevented: false });
      await expect(page.locator('#assignee-list [role="option"]')).toHaveText(["Ada Lovelace"]);
      expect([await isOpen(page, "#assignee-list"), await page.locator("#assignee").getAttribute("aria-expanded")]).toEqual([false, "false"]);
    });

    test(`the list anchors under its input at the input's width and flips above it near the viewport bottom (${storybook})`, async ({ page }, testInfo) => {
      await openStory(page, "components-combobox--open", "mode:light", "", storybook);
      await note(page, testInfo, "anchor positioning", `CSS.supports("position-area: block-end")`);
      await waitOpen(page, "#open-city-list");
      const field = await rect(page, "#open-city");
      const below = await rect(page, "#open-city-list");
      expect(Math.abs(below.left - field.left), "aligned to the input's start edge").toBeLessThan(1);
      expect(Math.abs(below.right - field.right), "as wide as the input").toBeLessThan(1);
      expect(Math.abs(below.top - field.bottom - 4), "4px below the input").toBeLessThan(1.5);
      await shot(page, testInfo, `combobox-open-${storybook}.png`);
      await page.keyboard.press("Escape");
      await page.locator("#storybook-root").evaluate((el) => (el.style.paddingBlockStart = `${innerHeight - 120}px`));
      await page.locator("#open-city").focus();
      await page.keyboard.press("ArrowDown");
      await waitOpen(page, "#open-city-list");
      const raised = await rect(page, "#open-city");
      const above = await rect(page, "#open-city-list");
      expect(Math.abs(raised.top - above.bottom - 4), "flipped to 4px above the input").toBeLessThan(1.5);
      await shot(page, testInfo, `combobox-flipped-${storybook}.png`);
    });
  }
});

test.describe("form fields", () => {
  test("hover darkens an enabled input's border but leaves a disabled one at rest", async ({ page }) => {
    await openStory(page, "components-forms--text-fields", "mode:light");
    const border = (selector: string) =>
      page.locator(selector).evaluate(async (el) => {
        await Promise.all(el.getAnimations().map((a) => a.finished));
        return getComputedStyle(el).borderTopColor;
      });
    const enabled = await border("#name");
    await hoverFresh(page, "#name");
    expect(await border("#name")).not.toBe(enabled);
    const disabled = await border("#disabled");
    await hoverFresh(page, "#disabled");
    expect(await border("#disabled")).toBe(disabled);
  });
});

test.describe("engine-specific CSS", () => {
  for (const storybook of ["html", "react"] as const) {
    test(`the slider moves by keyboard and its fill follows the thumb (${storybook})`, async ({ page }, testInfo) => {
      await openStory(page, "components-forms--slider", "mode:light", "", storybook);
      await shot(page, testInfo, "slider-before.png", ".odd-stack");
      const copies = page.locator("#copies");
      const readout = page.locator("#copies-value");
      await copies.focus();
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("ArrowLeft");
      await expect(copies).toHaveValue("1");
      await expect(readout).toHaveText("1 of 4");
      const fill = await page
        .locator("#card-size")
        .evaluate((el) => ({ timelineRuns: Number(getComputedStyle(el).getPropertyValue("--_on")) === 1, progress: Number(getComputedStyle(el).getPropertyValue("--_progress")) }));
      testInfo.annotations.push({ type: "path", description: `slider fill: ${fill.timelineRuns ? "scroll timeline" : testInfo.project.name === "firefox" ? "::-moz-range-progress" : "plain track"}` });
      if (fill.timelineRuns) expect(fill.progress).toBeCloseTo(0.65, 2);
      await shot(page, testInfo, "slider-after.png", ".odd-stack");
    });
  }

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
