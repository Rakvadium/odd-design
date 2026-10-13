import type { Meta, StoryObj } from "@storybook/html-vite";
import { CHROMES, PALETTES, type Chrome, type Mode, type Palette } from "../src/js/appearance.ts";
import { icons } from "./icons.ts";

const meta = {
  title: "Showcase",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const radioGroup = (name: string, legend: string, values: readonly string[], current: string) => `
  <fieldset class="ds-segmented" data-axis="${name}">
    <legend>${legend}</legend>
    ${values.map((v) => `<label><input type="radio" name="${name}" value="${v}" ${v === current ? "checked" : ""}> ${v}</label>`).join("")}
  </fieldset>`;

const deckCard = (title: string, blurb: string, tone: string, status: string, cards: number) => `
  <article class="ds-card" data-interactive>
    <div class="ds-row" style="justify-content: space-between">
      <span class="ds-badge" data-tone="${tone}">${status}</span>
      <span class="ds-eyebrow">${cards} cards</span>
    </div>
    <h3 class="ds-card-title"><a class="ds-card-link" href="#">${title}</a></h3>
    <p class="ds-muted">${blurb}</p>
  </article>`;

/** A small app screen in its own appearance scope, with live controls built from the system itself. */
export const SampleApp: Story = {
  render: (_, { globals }) => {
    const root = document.createElement("div");
    root.className = "ds-scope";
    root.dataset.chrome = globals.chrome;
    root.dataset.palette = globals.palette;
    root.dataset.mode = globals.mode;
    root.style.minBlockSize = "100dvh";
    root.style.padding = "clamp(1rem, 4vw, 3rem)";

    root.innerHTML = `
      <div class="ds-stack" style="--gap: var(--space-8); max-inline-size: 72rem; margin-inline: auto">
        <header class="ds-row" style="justify-content: space-between">
          <div class="ds-row" style="--gap: var(--space-2)">
            <span class="ds-button" data-variant="primary" data-icon-only aria-hidden="true" style="pointer-events:none">${icons.layers}</span>
            <strong style="font-family: var(--font-heading); text-transform: var(--heading-case); letter-spacing: var(--heading-tracking); font-size: var(--text-lg)">Deckhouse</strong>
          </div>
          <nav aria-label="Primary" class="ds-row" style="--gap: var(--space-1)">
            <a class="ds-button" data-variant="ghost" href="#" aria-current="page">Decks</a>
            <a class="ds-button" data-variant="ghost" href="#">Collection</a>
            <a class="ds-button" data-variant="ghost" href="#">Community</a>
          </nav>
        </header>

        <section class="ds-stack" style="--gap: var(--space-4); max-inline-size: 44rem">
          <p class="ds-eyebrow">Season 7 · Extended</p>
          <h1>Build decks that look as sharp as they play.</h1>
          <p class="ds-muted" style="font-size: var(--text-lg)">One markup path, any chrome, any palette. Change the appearance below and watch everything update.</p>
          <div class="ds-row">
            <button class="ds-button" data-variant="primary" data-size="lg">${icons.plus} New deck</button>
            <button class="ds-button" data-size="lg" commandfor="appearance" command="show-modal">${icons.sparkles} Appearance</button>
          </div>
        </section>

        <section aria-labelledby="decks-heading" class="ds-stack">
          <div class="ds-row" style="justify-content: space-between">
            <h2 id="decks-heading" style="font-size: var(--text-2xl)">Your decks</h2>
            <fieldset class="ds-segmented">
              <legend>View</legend>
              <label><input type="radio" name="view" checked> Grid</label>
              <label><input type="radio" name="view"> List</label>
            </fieldset>
          </div>
          <div style="display:grid; gap: var(--space-5); grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr))">
            ${deckCard("Midnight Control", "Grinds out card advantage, then wins with one big turn.", "success", "Legal", 60)}
            ${deckCard("Ember Aggro", "Fast, cheap attacks. Wins by turn five or not at all.", "warning", "Rotating soon", 55)}
            ${deckCard("Tidecaller Ramp", "Ramps into huge late-game threats, protected by counters.", "info", "Draft", 62)}
          </div>
        </section>

        <section aria-labelledby="settings-heading" class="ds-card" style="--gap: var(--space-5)">
          <h2 id="settings-heading" class="ds-card-title" style="font-size: var(--text-xl)">Deck settings</h2>
          <div style="display:grid; gap: var(--space-5); grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr))">
            <div class="ds-field">
              <label class="ds-label" for="sample-name">Deck name</label>
              <input class="ds-input" id="sample-name" value="Midnight Control" required>
            </div>
            <div class="ds-field">
              <label class="ds-label" for="sample-format">Format</label>
              <select class="ds-select" id="sample-format"><option>Standard</option><option selected>Extended</option><option>Retro</option></select>
            </div>
          </div>
          <div class="ds-row" style="--gap: var(--space-6)">
            <label class="ds-choice"><input type="checkbox" role="switch" class="ds-switch" checked> Public</label>
            <label class="ds-choice"><input type="checkbox" role="switch" class="ds-switch"> Allow comments</label>
          </div>
          <div class="ds-card-footer" style="justify-content: flex-end">
            <button class="ds-button" data-variant="ghost">Discard</button>
            <button class="ds-button" data-variant="primary">Save deck</button>
          </div>
        </section>
      </div>

      <dialog class="ds-dialog" id="appearance" aria-labelledby="appearance-title" closedby="any">
        <form class="ds-dialog-body" method="dialog">
          <h2 class="ds-dialog-title" id="appearance-title">Appearance</h2>
          <p class="ds-muted">Chrome changes the feel. Palette changes the color. Mode picks light or dark.</p>
          <div class="ds-stack" style="--gap: var(--space-2)"><span class="ds-label" aria-hidden="true">Chrome</span>${radioGroup("chrome", "Chrome", CHROMES, globals.chrome)}</div>
          <div class="ds-stack" style="--gap: var(--space-2)"><span class="ds-label" aria-hidden="true">Palette</span>${radioGroup("palette", "Palette", PALETTES, globals.palette)}</div>
          <div class="ds-stack" style="--gap: var(--space-2)"><span class="ds-label" aria-hidden="true">Mode</span>${radioGroup("mode", "Mode", ["system", "light", "dark"], globals.mode)}</div>
          <div class="ds-dialog-actions"><button class="ds-button" data-variant="primary">Done</button></div>
        </form>
      </dialog>`;

    root.addEventListener("change", (event) => {
      const input = event.target as HTMLInputElement;
      const axis = input.closest<HTMLElement>("[data-axis]")?.dataset.axis;
      if (axis) root.dataset[axis] = input.value;
    });
    return root;
  },
};

const tile = (chrome: Chrome, palette: Palette, mode: Mode) => `
  <div class="ds-scope" data-chrome="${chrome}" data-palette="${palette}" data-mode="${mode}"
       style="padding: var(--space-5); border-radius: var(--radius-surface)">
    <div class="ds-card" style="--gap: var(--space-3)">
      <div class="ds-row" style="justify-content: space-between">
        <span class="ds-eyebrow">${chrome} × ${palette}</span>
        <span class="ds-badge" data-tone="success">Legal</span>
      </div>
      <h3 class="ds-card-title">Midnight Control</h3>
      <input class="ds-input" aria-label="Search cards (${chrome}, ${palette})" placeholder="Search cards…">
      <div class="ds-row">
        <button class="ds-button" data-variant="primary" data-size="sm">Save</button>
        <button class="ds-button" data-size="sm">Share</button>
        <input type="checkbox" role="switch" class="ds-switch" checked aria-label="Public (${chrome}, ${palette})">
      </div>
    </div>
  </div>`;

/** Every chrome against every palette. Rows are chrome (feel), columns are palette (color). */
export const Matrix: Story = {
  render: (_, { globals }) => `
    <div style="display:grid; gap: var(--space-4); padding: var(--space-5); grid-template-columns: repeat(${PALETTES.length}, minmax(18rem, 1fr))">
      ${CHROMES.flatMap((c) => PALETTES.map((p) => tile(c, p, globals.mode))).join("")}
    </div>`,
};
