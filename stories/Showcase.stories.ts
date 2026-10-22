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
  <fieldset class="odd-segmented" data-axis="${name}">
    <legend>${legend}</legend>
    ${values.map((v) => `<label><input type="radio" name="${name}" value="${v}" ${v === current ? "checked" : ""}> ${v}</label>`).join("")}
  </fieldset>`;

const deckCard = (title: string, blurb: string, tone: string, status: string, cards: number) => `
  <article class="odd-card" data-interactive>
    <div class="odd-row" style="justify-content: space-between">
      <span class="odd-badge" data-tone="${tone}">${status}</span>
      <span class="odd-eyebrow">${cards} cards</span>
    </div>
    <h3 class="odd-card-title"><a class="odd-card-link" href="#">${title}</a></h3>
    <p class="odd-muted">${blurb}</p>
  </article>`;

/** A small app screen in its own appearance scope, with live controls built from the system itself. */
export const SampleApp: Story = {
  render: (_, { globals }) => {
    const root = document.createElement("div");
    root.className = "odd-scope";
    root.dataset.chrome = globals.chrome;
    root.dataset.palette = globals.palette;
    root.dataset.mode = globals.mode;
    root.style.minBlockSize = "100dvh";
    root.style.padding = "clamp(1rem, 4vw, 3rem)";

    root.innerHTML = `
      <div class="odd-stack" style="--gap: var(--space-8); max-inline-size: 72rem; margin-inline: auto">
        <header class="odd-row" style="justify-content: space-between">
          <div class="odd-row" style="--gap: var(--space-2)">
            <span class="odd-button" data-variant="primary" data-icon-only aria-hidden="true" style="pointer-events:none">${icons.layers}</span>
            <strong style="font-family: var(--font-heading); text-transform: var(--heading-case); letter-spacing: var(--heading-tracking); font-size: var(--text-lg)">Deckhouse</strong>
          </div>
          <nav aria-label="Primary" class="odd-row" style="--gap: var(--space-1)">
            <a class="odd-button" data-variant="ghost" href="#" aria-current="page">Decks</a>
            <a class="odd-button" data-variant="ghost" href="#">Collection</a>
            <a class="odd-button" data-variant="ghost" href="#">Community</a>
          </nav>
        </header>

        <section class="odd-stack" style="--gap: var(--space-4); max-inline-size: 44rem">
          <p class="odd-eyebrow">Season 7 · Extended</p>
          <h1>Build decks that look as sharp as they play.</h1>
          <p class="odd-muted" style="font-size: var(--text-lg)">One markup path, any chrome, any palette. Change the appearance below and watch everything update.</p>
          <div class="odd-row">
            <button class="odd-button" data-variant="primary" data-size="lg">${icons.plus} New deck</button>
            <button class="odd-button" data-size="lg" commandfor="appearance" command="show-modal">${icons.sparkles} Appearance</button>
          </div>
        </section>

        <section aria-labelledby="decks-heading" class="odd-stack">
          <div class="odd-row" style="justify-content: space-between">
            <h2 id="decks-heading" style="font-size: var(--text-2xl)">Your decks</h2>
            <fieldset class="odd-segmented">
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

        <section aria-labelledby="settings-heading" class="odd-card" style="--gap: var(--space-5)">
          <h2 id="settings-heading" class="odd-card-title" style="font-size: var(--text-xl)">Deck settings</h2>
          <div style="display:grid; gap: var(--space-5); grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr))">
            <div class="odd-field">
              <label class="odd-label" for="sample-name">Deck name</label>
              <input class="odd-input" id="sample-name" value="Midnight Control" required>
            </div>
            <div class="odd-field">
              <label class="odd-label" for="sample-format">Format</label>
              <select class="odd-select" id="sample-format"><option>Standard</option><option selected>Extended</option><option>Retro</option></select>
            </div>
          </div>
          <div class="odd-row" style="--gap: var(--space-6)">
            <label class="odd-choice"><input type="checkbox" role="switch" class="odd-switch" checked> Public</label>
            <label class="odd-choice"><input type="checkbox" role="switch" class="odd-switch"> Allow comments</label>
          </div>
          <div class="odd-card-footer" style="justify-content: flex-end">
            <button class="odd-button" data-variant="ghost">Discard</button>
            <button class="odd-button" data-variant="primary">Save deck</button>
          </div>
        </section>
      </div>

      <dialog class="odd-dialog" id="appearance" aria-labelledby="appearance-title" closedby="any">
        <form class="odd-dialog-body" method="dialog">
          <h2 class="odd-dialog-title" id="appearance-title">Appearance</h2>
          <p class="odd-muted">Chrome changes the feel. Palette changes the color. Mode picks light or dark.</p>
          <div class="odd-stack" style="--gap: var(--space-2)"><span class="odd-label" aria-hidden="true">Chrome</span>${radioGroup("chrome", "Chrome", CHROMES, globals.chrome)}</div>
          <div class="odd-stack" style="--gap: var(--space-2)"><span class="odd-label" aria-hidden="true">Palette</span>${radioGroup("palette", "Palette", PALETTES, globals.palette)}</div>
          <div class="odd-stack" style="--gap: var(--space-2)"><span class="odd-label" aria-hidden="true">Mode</span>${radioGroup("mode", "Mode", ["system", "light", "dark"], globals.mode)}</div>
          <div class="odd-dialog-actions"><button class="odd-button" data-variant="primary">Done</button></div>
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
  <div class="odd-scope" data-chrome="${chrome}" data-palette="${palette}" data-mode="${mode}"
       style="padding: var(--space-5); border-radius: var(--radius-surface)">
    <div class="odd-card" style="--gap: var(--space-3)">
      <div class="odd-row" style="justify-content: space-between">
        <span class="odd-eyebrow">${chrome} × ${palette}</span>
        <span class="odd-badge" data-tone="success">Legal</span>
      </div>
      <h3 class="odd-card-title">Midnight Control</h3>
      <input class="odd-input" aria-label="Search cards (${chrome}, ${palette})" placeholder="Search cards…">
      <div class="odd-row">
        <button class="odd-button" data-variant="primary" data-size="sm">Save</button>
        <button class="odd-button" data-size="sm">Share</button>
        <input type="checkbox" role="switch" class="odd-switch" checked aria-label="Public (${chrome}, ${palette})">
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
