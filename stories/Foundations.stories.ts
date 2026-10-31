import type { Meta, StoryObj } from "@storybook/html-vite";
import { parse, wcagContrast } from "culori";
import { CONTRAST_PAIRS, TINT_PAIRS } from "../src/js/contract.ts";

const meta = { title: "Foundations" } satisfies Meta;

export default meta;
type Story = StoryObj;

/** Measures contrast from the browser's computed colors, so it reflects what's actually rendered. */
function measure(scope: HTMLElement) {
  for (const row of scope.querySelectorAll<HTMLElement>("[data-pair]")) {
    const sample = row.querySelector<HTMLElement>(".pair-sample")!;
    // Non-text pairs are drawn as a border, so measure the border color for them.
    const { color, borderTopColor, backgroundColor } = getComputedStyle(sample);
    const fg = parse(sample.hasAttribute("data-nontext") ? borderTopColor : color);
    const bg = parse(backgroundColor);
    if (!fg || !bg) continue;
    const ratio = wcagContrast(fg, bg);
    const min = Number(row.dataset.min);
    const out = row.querySelector<HTMLElement>(".pair-ratio")!;
    out.textContent = `${ratio.toFixed(2)}:1`;
    out.closest("tr")!.querySelector<HTMLElement>(".pair-result")!.innerHTML =
      ratio >= min
        ? /* html */ `<span class="odd-badge" data-tone="success">Pass ${min}:1</span>`
        : /* html */ `<span class="odd-badge" data-solid data-tone="danger">Fail ${min}:1</span>`;
  }
}

const column = (mode: "light" | "dark", palette: string, chrome: string) => /* html */ `
  <div class="odd-scope" data-mode="${mode}" data-palette="${palette}" data-chrome="${chrome}" style="padding: var(--space-5); border-radius: var(--radius-surface)">
    <h3 style="margin-block-end: var(--space-4)">${mode}</h3>
    <table style="border-collapse: collapse; inline-size: 100%; font-size: var(--text-sm)">
      <thead><tr>
        <th scope="col" style="text-align:start; padding-block-end: var(--space-2)">Pair</th>
        <th scope="col" style="text-align:end">Ratio</th>
        <th scope="col" style="text-align:end">WCAG</th>
      </tr></thead>
      <tbody>
        ${[...CONTRAST_PAIRS, ...TINT_PAIRS].map(
          ([fg, bg, min]) => `<tr data-pair data-min="${min}" style="border-block-start: 1px solid var(--border)">
            <td style="padding-block: var(--space-2)">
              ${
                min < 4.5
                  ? // Borders and focus rings are non-text UI, so show them as a border, not as text held to the text minimum.
                    `<span class="pair-sample" data-nontext aria-hidden="true" style="display:inline-block; vertical-align: middle; inline-size: 2.4em; block-size: 1.5em; border-radius: 6px; border: 3px solid var(--${fg}); background: var(--${bg})"></span>`
                  : `<span class="pair-sample" style="display:inline-block; padding: 0.15em 0.6em; border-radius: 6px; color: var(--${fg}); background: var(--${bg}); box-shadow: inset 0 0 0 1px var(--border); font-weight: var(--weight-semibold)">Aa</span>`
              }
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
          "Live WCAG 2.2 contrast for the active palette, using the same pairs `bun test` enforces, including text on the soft tints. Switch palettes in the toolbar.",
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
        <div style="block-size: 6rem; padding: var(--space-3); background: var(--${bg}); color: var(--${fg}); font-weight: var(--weight-semibold)">Aa</div>
        <div style="padding: var(--space-3); background: var(--surface); font-size: var(--text-sm)"><code>--${bg}</code></div>
      </div>`,
    ).join("")}
  </div>`,
};

export const Type: Story = {
  render: () => /* html */ `<div class="odd-stack" style="--gap: var(--space-5); max-inline-size: 48rem">
    <p class="odd-eyebrow">Eyebrow label</p>
    <h1>Display heading</h1>
    <h2>Section heading</h2>
    <h3>Card heading</h3>
    <h4>Small heading</h4>
    <p style="font-size: var(--text-lg)">Lead paragraph. Body text uses the chrome's body font; headings and labels follow its case and tracking.</p>
    <p>Body text with an <a class="odd-link" href="#">inline link</a>. The link color is <code class="odd-code">--primary</code>, which the contract test holds to 4.5:1 against the page.</p>
    <p class="odd-muted">Muted text for secondary information.</p>
  </div>`,
};

export const Headings: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`.odd-heading` sets size apart from level, so the outline stays correct whatever the layout needs. Case, tracking, and weight come from the chrome.",
      },
    },
  },
  render: () => /* html */ `<div class="odd-stack" style="--gap: var(--space-4); max-inline-size: 48rem">
    <h1 class="odd-heading" data-size="hero">Hero · Build sharper decks</h1>
    <h2 class="odd-heading" data-size="2xl">2xl · Season overview</h2>
    <h2 class="odd-heading" data-size="xl">xl · Your collection</h2>
    <h3 class="odd-heading" data-size="lg">lg · Recently edited</h3>
    <h3 class="odd-heading">md · Deck notes (default)</h3>
    <h4 class="odd-heading" data-size="sm">sm · Sideboard</h4>
    <h4 class="odd-heading" data-size="xs">xs · Card details</h4>
    <div class="odd-row" style="--gap: var(--space-5)">
      <p class="odd-eyebrow">Muted eyebrow</p>
      <p class="odd-eyebrow" data-tone="primary">Primary eyebrow</p>
      <p class="odd-eyebrow" data-tone="foreground">Foreground eyebrow</p>
    </div>
  </div>`,
};
