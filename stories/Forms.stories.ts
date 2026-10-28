import type { Meta, StoryObj } from "@storybook/html-vite";

const meta = {
  title: "Components/Forms",
  parameters: {
    docs: {
      description: {
        component:
          "Native inputs with labels, hints, and errors wired through `for` and `aria-describedby`. Invalid styling uses `:user-invalid`, so a field only turns red after the user has interacted with it. The select upgrades to a fully styled picker where `appearance: base-select` is supported.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Slider: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A native `<input type=\"range\">`: arrow keys, Page Up/Down, and Home/End work with no JS. The filled track follows the thumb through a scroll-driven animation where supported. The `<output>` beside the first slider is updated by one inline `oninput`.",
      },
    },
  },
  render: () => /* html */ `<div class="odd-stack" style="--gap: var(--space-5); max-inline-size: 26rem">
    <div class="odd-field">
      <div class="odd-row" style="justify-content: space-between">
        <label class="odd-label" for="copies">Copies per card</label>
        <output class="odd-stat-value" id="copies-value" for="copies">3 of 4</output>
      </div>
      <input class="odd-slider" type="range" id="copies" min="1" max="4" value="3" aria-describedby="copies-hint"
        oninput="document.getElementById('copies-value').value = this.value + ' of ' + this.max">
      <p class="odd-hint" id="copies-hint">Most formats allow up to 4.</p>
    </div>
    <div class="odd-field">
      <label class="odd-label" for="card-size">Card size</label>
      <input class="odd-slider" type="range" id="card-size" min="0" max="100" value="65">
    </div>
    <div class="odd-field">
      <label class="odd-label" for="locked">Hand size (locked by format)</label>
      <input class="odd-slider" type="range" id="locked" min="5" max="9" value="7" disabled>
    </div>
  </div>`,
};
