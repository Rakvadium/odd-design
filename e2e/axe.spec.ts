import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { expect, test } from "@playwright/test";
import { A11Y_EXCLUDE, A11Y_OPTIONS } from "../.storybook/a11y.ts";
import { STORYBOOKS, type Storybook } from "../stories/catalog.ts";
import { openStory, storyIds } from "./story.ts";

// The same sweep as `ctl.ts axe`, in Firefox and WebKit: the pinned axe-core with the one shared
// rule set, every story in both Storybooks, rendered and with each overlay opened by a real click or hover.
const AXE_PATH = createRequire(import.meta.url).resolve("axe-core/axe.min.js");
const RECORD = readFileSync(new URL("../.storybook/a11y-rules.txt", import.meta.url), "utf8")
  .split(/\r?\n/)
  .filter((l) => l && !l.startsWith("#"));

type Result = { ran: string[]; violations: { rule: string; help: string; targets: string[] }[]; incomplete: number };

async function runAxe(page: import("@playwright/test").Page): Promise<Result> {
  await page.addScriptTag({ path: AXE_PATH });
  return page.evaluate(
    async ({ exclude, options }) => {
      const axe = (window as any).axe;
      const r = await axe.run({ include: [document.body], exclude: exclude.map((s: string) => [s]) }, options);
      return {
        ran: [...r.passes, ...r.violations, ...r.incomplete, ...r.inapplicable].map((x: any) => x.id),
        incomplete: r.incomplete.length,
        violations: r.violations.map((v: any) => ({ rule: v.id, help: v.help, targets: v.nodes.map((n: any) => n.target.join(" ")) })),
      };
    },
    { exclude: A11Y_EXCLUDE, options: A11Y_OPTIONS },
  );
}

for (const storybook of Object.keys(STORYBOOKS) as Storybook[]) {
  for (const mode of ["light", "dark"] as const) {
    test(`axe: every ${storybook} story in ${mode} mode`, async ({ page }, testInfo) => {
      test.setTimeout(15 * 60_000);
      const findings: string[] = [];
      const ran = new Set<string>();
      const unopened: string[] = [];
      let runs = 0;
      let incomplete = 0;

      const check = async (story: string, state: string) => {
        const r = await runAxe(page);
        runs++;
        incomplete += r.incomplete;
        r.ran.forEach((id) => ran.add(id));
        for (const v of r.violations) findings.push(`${story} [${state}] ${v.rule}: ${v.help} — ${v.targets.join(", ")}`);
      };

      for (const story of await storyIds(page, storybook)) {
        await test.step(story, async () => {
          await openStory(page, story, `mode:${mode}`, "", storybook);
          await check(story, "rendered");

          const openers = page.locator(
            '#storybook-root :is([command="show-modal"], [command="toggle-popover"], [popovertarget], [interestfor])',
          );
          const count = await openers.count();
          for (let i = 0; i < count; i++) {
            const opener = openers.nth(i);
            if (!(await opener.isVisible())) continue;
            const target = await opener.evaluate((el) => el.getAttribute("commandfor") ?? el.getAttribute("popovertarget") ?? el.getAttribute("interestfor"));
            const isOpen = (id: string | null) => page.evaluate((id) => id !== null && document.getElementById(id)?.matches("[open], :popover-open") === true, id);
            if (await isOpen(target)) continue;
            const hover = (await opener.getAttribute("interestfor")) !== null;
            const label = ((await opener.textContent())?.trim() || (await opener.getAttribute("aria-label")) || `#${i}`).slice(0, 40);
            if (hover) {
              await opener.hover();
              await page.waitForTimeout(1100);
            } else {
              await opener.click();
              await page.waitForTimeout(450);
            }
            // The opener's own target, not a count of open layers: a hint closes the hint before it, so the count can stay flat.
            if (!(await isOpen(target))) unopened.push(`${story}: "${label}"`);
            await check(story, `${hover ? "hover" : "click"} "${label}"`);
            // Escape closes the top layer only. A sheet whose focused close button shows its tooltip needs a second one.
            const layers = () => page.evaluate(() => document.querySelectorAll('dialog[open], [popover]:not([popover="manual"]):popover-open').length);
            for (let presses = 0; presses < 3 && (await layers()) > 0; presses++) {
              await page.keyboard.press("Escape");
              await page.waitForTimeout(150);
            }
            await page.mouse.move(0, 0);
            await page.waitForTimeout(400);
          }
        });
      }

      console.log(
        `[${testInfo.project.name}, ${storybook}, ${mode}] ${runs} axe runs, ${ran.size} rules, ${findings.length} violations, ${incomplete} needing review, ${unopened.length} overlays that didn't open`,
      );
      await testInfo.attach("axe-summary.json", {
        contentType: "application/json",
        body: JSON.stringify({ storybook, runs, incomplete, rulesRan: ran.size, unopened, findings }, null, 2),
      });
      expect(findings, "axe violations").toEqual([]);
      expect([...ran].sort(), "rules that ran vs .storybook/a11y-rules.txt").toEqual([...RECORD].sort());
      expect(unopened, "overlays that did not open on a real click or hover").toEqual([]);
    });
  }
}
