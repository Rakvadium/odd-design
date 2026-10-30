import type { Meta, StoryObj } from "@storybook/html-vite";
import { enhanceStepper } from "../../src/js/enhance.ts";

const meta = {
  title: "Recipes/Number stepper",
  parameters: {
    docs: {
      description: {
        component:
          "A number input between step buttons, laid out with `odd-row`. `enhanceStepper` wires each group: `data-step` counts the input's steps, a held button repeats, and buttons at a limit get `aria-disabled`. See `docs/recipes/number-stepper.md`.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const mount = (html: string, eventsId: string) => {
  const root = document.createElement("div");
  root.innerHTML = html;
  requestAnimationFrame(() => {
    const events = root.querySelector<HTMLElement>(`#${eventsId}`)!;
    root.addEventListener("change", (event) => {
      const input = event.target as HTMLInputElement;
      events.textContent = `change: ${input.id} = ${input.value}`;
    });
    root.querySelectorAll<HTMLElement>('[role="group"]').forEach(enhanceStepper);
  });
  return root;
};

export const SingleField: Story = {
  parameters: {
    docs: {
      description: {
        story: "One button on each side. Copies runs from 1 to 4, so − starts marked at its limit.",
      },
    },
  },
  render: () =>
    mount(/* html */ `<div class="odd-stack" style="--gap: var(--space-5); max-inline-size: 16rem">
      <div class="odd-field">
        <label class="odd-label" id="copies-label" for="copies">Copies</label>
        <div class="odd-row" style="--gap: var(--space-1)" role="group" aria-labelledby="copies-label">
          <button class="odd-button" type="button" data-step="-1" aria-label="Fewer copies">−</button>
          <input class="odd-input" type="number" id="copies" min="1" max="4" value="1" style="flex: 1 1 4rem">
          <button class="odd-button" type="button" data-step="1" aria-label="More copies">+</button>
        </div>
      </div>
      <p class="odd-muted" id="copies-events">No changes yet</p>
    </div>`, "copies-events"),
};

export const JogRow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Two buttons on each side. On Wrist, `step=\"0.5\"` makes `data-step=\"10\"` move by 5, so its buttons are labelled in degrees. Hold a button to repeat. Each step fires `input`, and `change` fires once when the press ends. Gripper is disabled through its input.",
      },
    },
  },
  render: () =>
    mount(/* html */ `<div class="odd-stack" style="--gap: var(--space-5); max-inline-size: 26rem">
      <div class="odd-field">
        <label class="odd-label" id="jog-base-label" for="jog-base">Base (degrees)</label>
        <div class="odd-row" style="--gap: var(--space-1)" role="group" aria-labelledby="jog-base-label">
          <button class="odd-button" type="button" data-step="-10">−10</button>
          <button class="odd-button" type="button" data-step="-1">−1</button>
          <input class="odd-input" type="number" id="jog-base" min="-90" max="90" step="1" value="0" style="flex: 1 1 4rem">
          <button class="odd-button" type="button" data-step="1">+1</button>
          <button class="odd-button" type="button" data-step="10">+10</button>
        </div>
      </div>
      <div class="odd-field">
        <label class="odd-label" id="jog-wrist-label" for="jog-wrist">Wrist (degrees)</label>
        <div class="odd-row" style="--gap: var(--space-1)" role="group" aria-labelledby="jog-wrist-label">
          <button class="odd-button" type="button" data-step="-10">−5</button>
          <button class="odd-button" type="button" data-step="-1">−0.5</button>
          <input class="odd-input" type="number" id="jog-wrist" min="-45" max="45" step="0.5" value="45" style="flex: 1 1 4rem">
          <button class="odd-button" type="button" data-step="1">+0.5</button>
          <button class="odd-button" type="button" data-step="10">+5</button>
        </div>
      </div>
      <div class="odd-field">
        <label class="odd-label" id="jog-gripper-label" for="jog-gripper">Gripper (mm)</label>
        <div class="odd-row" style="--gap: var(--space-1)" role="group" aria-labelledby="jog-gripper-label">
          <button class="odd-button" type="button" data-step="-1">−1</button>
          <input class="odd-input" type="number" id="jog-gripper" min="0" max="30" value="12" disabled style="flex: 1 1 4rem">
          <button class="odd-button" type="button" data-step="1">+1</button>
        </div>
      </div>
      <p class="odd-muted" id="jog-events">No changes yet</p>
    </div>`, "jog-events"),
};
