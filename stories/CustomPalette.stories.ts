import type { Meta, StoryObj } from "@storybook/html-vite";
import { applyPalette, generatePalette, paletteCss, paletteFailures } from "../src/js/palette.ts";
import { icons } from "./icons.ts";

const meta = { title: "Foundations/Custom Palette" } satisfies Meta;

export default meta;
type Story = StoryObj<{ primary: string; secondary: string }>;

const preview = (mode: "light" | "dark") => `
  <div class="odd-scope odd-stack" data-palette="custom" data-mode="${mode}" data-chrome="calm" style="--gap: var(--space-4); padding: var(--space-5); border-radius: var(--radius-surface)">
    <p class="odd-eyebrow" data-tone="primary">${mode}</p>
    <h3 class="odd-heading" data-size="lg">Midnight Control</h3>
    <p class="odd-muted">Grinds out card advantage, then wins with one big turn. <a href="#">View deck</a></p>
    <div class="odd-row">
      <button class="odd-button" data-variant="primary">${icons.plus} New deck</button>
      <button class="odd-button" data-variant="secondary">Duplicate</button>
      <button class="odd-button">Share</button>
    </div>
    <div class="odd-row" style="--gap: var(--space-2)">
      <span class="odd-badge" data-tone="primary">Primary</span>
      <span class="odd-badge" data-tone="success">Legal</span>
      <span class="odd-badge" data-tone="warning">Rotating</span>
      <span class="odd-badge" data-solid data-tone="danger">Banned</span>
    </div>
    <div class="odd-alert" data-tone="info">${icons.info}<div><p class="odd-alert-title">New set available</p><p>“Ember Tide” cards are in the gallery.</p></div></div>
    <div class="odd-field">
      <label class="odd-label" for="custom-${mode}-name">Deck name</label>
      <input class="odd-input" id="custom-${mode}-name" value="Midnight Control">
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
    root.className = "odd-stack";
    root.style.setProperty("--gap", "var(--space-5)");
    root.innerHTML = `
      <div class="odd-row" style="--gap: var(--space-5); align-items: end">
        <div class="odd-field">
          <label class="odd-label" for="seed-primary">Primary</label>
          <input type="color" id="seed-primary" value="${args.primary}" style="inline-size: 4rem; block-size: var(--control-height)">
        </div>
        <div class="odd-field">
          <label class="odd-label" for="seed-secondary">Secondary</label>
          <input type="color" id="seed-secondary" value="${args.secondary}" style="inline-size: 4rem; block-size: var(--control-height)">
        </div>
        <p class="odd-muted" id="palette-status" role="status" style="font-size: var(--text-sm)"></p>
      </div>
      <div style="display: grid; gap: var(--space-5); grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr))">
        ${preview("light")}${preview("dark")}
      </div>
      <details class="odd-disclosure">
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
