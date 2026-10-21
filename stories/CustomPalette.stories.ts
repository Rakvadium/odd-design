import type { Meta, StoryObj } from "@storybook/html-vite";
import { applyPalette, generatePalette, paletteCss, paletteFailures } from "../src/js/palette.ts";
import { icons } from "./icons.ts";

const meta = { title: "Foundations/Custom Palette" } satisfies Meta;

export default meta;
type Story = StoryObj<{ primary: string; secondary: string }>;

const preview = (mode: "light" | "dark") => `
  <div class="ds-scope ds-stack" data-palette="custom" data-mode="${mode}" data-chrome="calm" style="--gap: var(--space-4); padding: var(--space-5); border-radius: var(--radius-surface)">
    <p class="ds-eyebrow" data-tone="primary">${mode}</p>
    <h3 class="ds-heading" data-size="lg">Midnight Control</h3>
    <p class="ds-muted">Grinds out card advantage, then wins with one big turn. <a href="#">View deck</a></p>
    <div class="ds-row">
      <button class="ds-button" data-variant="primary">${icons.plus} New deck</button>
      <button class="ds-button" data-variant="secondary">Duplicate</button>
      <button class="ds-button">Share</button>
    </div>
    <div class="ds-row" style="--gap: var(--space-2)">
      <span class="ds-badge" data-tone="primary">Primary</span>
      <span class="ds-badge" data-tone="success">Legal</span>
      <span class="ds-badge" data-tone="warning">Rotating</span>
      <span class="ds-badge" data-solid data-tone="danger">Banned</span>
    </div>
    <div class="ds-alert" data-tone="info">${icons.info}<div><p class="ds-alert-title">New set available</p><p>“Ember Tide” cards are in the gallery.</p></div></div>
    <div class="ds-field">
      <label class="ds-label" for="custom-${mode}-name">Deck name</label>
      <input class="ds-input" id="custom-${mode}-name" value="Midnight Control">
    </div>
  </div>`;

export const Generator: Story = {
  args: { primary: "#7c3aed", secondary: "#f472b6" },
  argTypes: { primary: { control: "color" }, secondary: { control: "color" } },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "`generatePalette({ primary, secondary })` builds every color role for light and dark, then repairs lightness until each `CONTRAST_PAIRS` and `TINT_PAIRS` check passes. `applyPalette` defines `[data-palette=\"custom\"]` inside the palette layer, so OS preferences still win. Copy the CSS to ship it as a file.",
      },
    },
  },
  render: (args) => {
    const root = document.createElement("div");
    root.className = "ds-stack";
    root.style.setProperty("--gap", "var(--space-5)");
    root.innerHTML = `
      <div class="ds-row" style="--gap: var(--space-5); align-items: end">
        <div class="ds-field">
          <label class="ds-label" for="seed-primary">Primary</label>
          <input type="color" id="seed-primary" value="${args.primary}" style="inline-size: 4rem; block-size: var(--control-height)">
        </div>
        <div class="ds-field">
          <label class="ds-label" for="seed-secondary">Secondary</label>
          <input type="color" id="seed-secondary" value="${args.secondary}" style="inline-size: 4rem; block-size: var(--control-height)">
        </div>
        <p class="ds-muted" id="palette-status" role="status" style="font-size: var(--text-sm)"></p>
      </div>
      <div style="display: grid; gap: var(--space-5); grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr))">
        ${preview("light")}${preview("dark")}
      </div>
      <details class="ds-disclosure">
        <summary>CSS for this palette</summary>
        <pre id="palette-css" style="overflow: auto; font-size: var(--text-xs)"></pre>
      </details>`;

    const primary = root.querySelector<HTMLInputElement>("#seed-primary")!;
    const secondary = root.querySelector<HTMLInputElement>("#seed-secondary")!;
    const update = () => {
      const palette = generatePalette({ primary: primary.value, secondary: secondary.value });
      applyPalette(palette);
      const failures = paletteFailures(palette);
      root.querySelector("#palette-status")!.textContent = failures.length
        ? `${failures.length} contrast failures`
        : "Meets the contrast contract in light and dark";
      root.querySelector("#palette-css")!.textContent = paletteCss("my-brand", palette);
    };
    primary.addEventListener("input", update);
    secondary.addEventListener("input", update);
    update();
    return root;
  },
};
