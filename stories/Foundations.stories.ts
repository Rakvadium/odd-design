import type { Meta, StoryObj } from "@storybook/html-vite";
import { parse, wcagContrast } from "culori";
import { CONTRAST_PAIRS } from "../src/js/contract.ts";

const meta = { title: "Foundations" } satisfies Meta;

export default meta;
type Story = StoryObj;

/** Measures contrast from the browser's computed colors, so it reflects what's actually rendered. */
function measure(scope: HTMLElement) {
  for (const row of scope.querySelectorAll<HTMLElement>("[data-pair]")) {
    const sample = row.querySelector<HTMLElement>(".pair-sample")!;
    const { color, backgroundColor } = getComputedStyle(sample);
    const fg = parse(color);
    const bg = parse(backgroundColor);
    if (!fg || !bg) continue;
    const ratio = wcagContrast(fg, bg);
    const min = Number(row.dataset.min);
    const out = row.querySelector<HTMLElement>(".pair-ratio")!;
    out.textContent = `${ratio.toFixed(2)}:1`;
    out.closest("tr")!.querySelector<HTMLElement>(".pair-result")!.innerHTML =
      ratio >= min
        ? `<span class="ds-badge" data-tone="success">Pass ${min}:1</span>`
        : `<span class="ds-badge" data-solid data-tone="danger">Fail ${min}:1</span>`;
  }
}

const column = (mode: "light" | "dark", palette: string, chrome: string) => `
  <div class="ds-scope" data-mode="${mode}" data-palette="${palette}" data-chrome="${chrome}" style="padding: var(--space-5); border-radius: var(--radius-surface)">
    <h3 style="margin-block-end: var(--space-4)">${mode}</h3>
    <table style="border-collapse: collapse; inline-size: 100%; font-size: var(--text-sm)">
      <thead><tr>
        <th scope="col" style="text-align:start; padding-block-end: var(--space-2)">Pair</th>
        <th scope="col" style="text-align:end">Ratio</th>
        <th scope="col" style="text-align:end">WCAG</th>
      </tr></thead>
      <tbody>
        ${CONTRAST_PAIRS.map(
          ([fg, bg, min]) => `<tr data-pair data-min="${min}" style="border-block-start: 1px solid var(--border)">
            <td style="padding-block: var(--space-2)">
              <span class="pair-sample" style="display:inline-block; padding: 0.15em 0.6em; border-radius: 6px; color: var(--${fg}); background: var(--${bg}); box-shadow: inset 0 0 0 1px var(--border); font-weight: 600">Aa</span>
              <code style="margin-inline-start: var(--space-2)">${fg}</code> on <code>${bg}</code>
            </td>
            <td class="pair-ratio" style="text-align:end; font-variant-numeric: tabular-nums"></td>
            <td class="pair-result" style="text-align:end"></td>
          </tr>`,
        ).join("")}
      </tbody>
    </table>
  </div>`;

export const Contrast: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Live WCAG 2.2 contrast for the active palette, using the same pairs `bun test` enforces. Switch palettes in the toolbar.",
      },
    },
  },
  render: (_, { globals }) => {
    const el = document.createElement("div");
    el.style.cssText = "display:grid; gap: var(--space-5); grid-template-columns: repeat(auto-fit, minmax(26rem, 1fr))";
    el.innerHTML = column("light", globals.palette, globals.chrome) + column("dark", globals.palette, globals.chrome);
    requestAnimationFrame(() => measure(el));
    return el;
  },
};

const SWATCHES = [
  ["background", "foreground"],
  ["surface", "surface-foreground"],
  ["muted", "muted-foreground"],
  ["primary", "primary-foreground"],
  ["secondary", "secondary-foreground"],
  ["accent", "accent-foreground"],
  ["danger", "danger-foreground"],
  ["success", "success-foreground"],
  ["warning", "warning-foreground"],
  ["info", "info-foreground"],
] as const;

export const Palette: Story = {
  render: () => `<div style="display:grid; gap: var(--space-4); grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr))">
    ${SWATCHES.map(
      ([bg, fg]) => `<div style="border-radius: var(--radius-surface); overflow: hidden; border: var(--border-width) solid var(--edge-surface); box-shadow: var(--shadow-surface)">
        <div style="block-size: 6rem; padding: var(--space-3); background: var(--${bg}); color: var(--${fg}); font-weight: 600">Aa</div>
        <div style="padding: var(--space-3); background: var(--surface); font-size: var(--text-sm)"><code>--${bg}</code></div>
      </div>`,
    ).join("")}
  </div>`,
};

export const Type: Story = {
  render: () => `<div class="ds-stack" style="--gap: var(--space-5); max-inline-size: 48rem">
    <p class="ds-eyebrow">Eyebrow label</p>
    <h1>Display heading</h1>
    <h2>Section heading</h2>
    <h3>Card heading</h3>
    <h4>Small heading</h4>
    <p style="font-size: var(--text-lg)">Lead paragraph. Body text uses the chrome's body font; headings and labels follow its case and tracking.</p>
    <p>Body text with an <a href="#">inline link</a>. The link color is <code>--primary</code>, which the contract test holds to 4.5:1 against the page.</p>
    <p class="ds-muted">Muted text for secondary information.</p>
  </div>`,
};
