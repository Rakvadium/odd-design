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

export const TextFields: Story = {
  render: () => `<form class="ds-stack" style="max-inline-size: 26rem" onsubmit="event.preventDefault()">
    <div class="ds-field">
      <label class="ds-label" for="name">Deck name</label>
      <input class="ds-input" id="name" required placeholder="Midnight Control" aria-describedby="name-hint">
      <p class="ds-hint" id="name-hint">Shown on your public profile.</p>
    </div>
    <div class="ds-field">
      <label class="ds-label" for="email">Email</label>
      <input class="ds-input" id="email" type="email" value="not-an-email" aria-invalid="true" aria-describedby="email-error">
      <p class="ds-error" id="email-error">Enter an email address like name@example.com.</p>
    </div>
    <div class="ds-field">
      <label class="ds-label" for="notes">Notes</label>
      <textarea class="ds-textarea" id="notes" placeholder="The textarea grows with its content."></textarea>
    </div>
    <div class="ds-field">
      <label class="ds-label" for="disabled">Owner</label>
      <input class="ds-input" id="disabled" value="you" disabled>
    </div>
  </form>`,
};

export const Select: Story = {
  render: () => `<div class="ds-field" style="max-inline-size: 26rem">
    <label class="ds-label" for="format">Format</label>
    <select class="ds-select" id="format">
      <option>Standard</option>
      <option selected>Extended</option>
      <option>Retro</option>
      <option>Draft</option>
    </select>
  </div>`,
};

export const Choices: Story = {
  render: () => `<div class="ds-stack">
    <fieldset class="ds-stack" style="--gap: var(--space-2); border: 0; padding: 0; margin: 0">
      <legend class="ds-label" style="margin-block-end: var(--space-2)">Notifications</legend>
      <label class="ds-choice"><input type="checkbox" checked> Deck comments</label>
      <label class="ds-choice"><input type="checkbox"> Weekly digest</label>
      <label class="ds-choice"><input type="checkbox" disabled> Partner offers (unavailable)</label>
    </fieldset>
    <fieldset class="ds-stack" style="--gap: var(--space-2); border: 0; padding: 0; margin: 0">
      <legend class="ds-label" style="margin-block-end: var(--space-2)">Visibility</legend>
      <label class="ds-choice"><input type="radio" name="vis" checked> Public</label>
      <label class="ds-choice"><input type="radio" name="vis"> Unlisted</label>
      <label class="ds-choice"><input type="radio" name="vis"> Private</label>
    </fieldset>
  </div>`,
};

export const Switch: Story = {
  render: () => `<div class="ds-stack" style="--gap: var(--space-3)">
    <label class="ds-choice"><input type="checkbox" role="switch" class="ds-switch" checked> Show card prices</label>
    <label class="ds-choice"><input type="checkbox" role="switch" class="ds-switch"> Compact grid</label>
  </div>`,
};

export const Segmented: Story = {
  render: () => `<fieldset class="ds-segmented">
    <legend>View</legend>
    <label><input type="radio" name="view" checked> Grid</label>
    <label><input type="radio" name="view"> List</label>
    <label><input type="radio" name="view"> Stats</label>
  </fieldset>`,
};
