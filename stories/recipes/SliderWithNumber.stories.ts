import type { Meta, StoryObj } from "@storybook/html-vite";
import { enhanceRangeField } from "../../src/js/enhance.ts";

const meta = {
  title: "Recipes/Slider with number",
  parameters: {
    docs: {
      description: {
        component:
          "An `odd-slider` and a number input for one value, laid out with `odd-row` and synced by `enhanceRangeField`. See `docs/recipes/slider-with-number.md`.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const SliderWithNumber: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The number takes `min`, `max`, and `step` from the slider. Type 250 into Speed and press Tab: the slider stays put and an error appears until the number fits. The page listens to the slider only, and typed numbers fire its events too.",
      },
    },
  },
  render: () => {
    const root = document.createElement("div");
    root.innerHTML = /* html */ `<div class="odd-stack" style="--gap: var(--space-5); max-inline-size: 30rem">
      <div class="odd-field">
        <label class="odd-label" id="speed-label" for="speed">Speed</label>
        <div class="odd-row" id="speed-row">
          <input class="odd-slider" type="range" id="speed" min="0" max="200" step="5" value="40" aria-describedby="speed-hint" style="flex: 1 1 8rem">
          <input class="odd-input" type="number" id="speed-number" min="0" max="200" step="5" value="40" aria-labelledby="speed-label speed-unit" style="flex: 0 0 6.5rem">
          <span class="odd-muted" id="speed-unit">mm/s</span>
        </div>
        <p class="odd-hint" id="speed-hint">0 to 200, in steps of 5.</p>
      </div>
      <div class="odd-field">
        <label class="odd-label" id="height-label" for="height">Lift height</label>
        <div class="odd-row" id="height-row">
          <input class="odd-slider" type="range" id="height" min="0" max="250" value="120" style="flex: 1 1 8rem">
          <input class="odd-input" type="number" id="height-number" min="0" max="250" value="120" aria-labelledby="height-label" style="flex: 0 0 6.5rem">
        </div>
      </div>
      <p class="odd-muted" id="range-events">No changes yet</p>
    </div>`;
    requestAnimationFrame(() => {
      const events = root.querySelector<HTMLElement>("#range-events")!;
      root.addEventListener("change", (event) => {
        const input = event.target as HTMLInputElement;
        events.textContent = `change: ${input.id} = ${input.value}`;
      });
      enhanceRangeField(root.querySelector<HTMLElement>("#speed-row")!);
      enhanceRangeField(root.querySelector<HTMLElement>("#height-row")!);
    });
    return root;
  },
};
