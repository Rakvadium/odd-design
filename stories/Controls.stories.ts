import type { Meta, StoryObj } from "@storybook/html-vite";
import { enhanceRangeField, enhanceStepper } from "../src/js/enhance.ts";

const meta = {
  title: "Components/Controls",
  parameters: {
    docs: {
      description: {
        component: "Controls for driving a machine: an emergency stop, a jog stepper, and a slider paired with a number field.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** Renders markup, then runs `wire` once the story root is in the document. */
const mount = (html: string, wire: (root: HTMLElement) => void) => {
  const root = document.createElement("div");
  root.innerHTML = html;
  requestAnimationFrame(() => wire(root));
  return root;
};

export const EmergencyStop: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A plain `<button>`. The first stop latches with `aria-pressed`: press it to latch, press again to reset. The page sets the attribute and the status text; the component only draws the state. The second stop never latches, so it has no `aria-pressed`.",
      },
    },
  },
  render: () =>
    mount(
      /* html */ `<div class="odd-row" style="--gap: var(--space-6); align-items: start">
        <div class="odd-stack" style="align-items: center">
          <button class="odd-estop" type="button" id="estop" aria-pressed="false" aria-describedby="estop-status">Stop</button>
          <p id="estop-status" role="status">Running</p>
        </div>
        <button class="odd-estop" type="button" style="inline-size: 5rem; font-size: var(--text-sm)">Stop</button>
      </div>`,
      (root) => {
        const stop = root.querySelector<HTMLButtonElement>("#estop")!;
        const status = root.querySelector<HTMLElement>("#estop-status")!;
        stop.addEventListener("click", () => {
          const latched = stop.getAttribute("aria-pressed") !== "true";
          stop.setAttribute("aria-pressed", String(latched));
          status.textContent = latched ? "Stopped. Press again to reset." : "Running";
        });
      },
    ),
};

export const Stepper: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`enhanceStepper` steps the number input with its own `stepUp` and `stepDown`, so `min`, `max`, and `step` hold. `data-step` counts steps: on Wrist, `step=\"0.5\"` makes `data-step=\"10\"` move by 5, so its buttons are labelled in degrees. Hold a button to repeat. Each step fires `input`; `change` fires once when the press ends. Buttons at a limit get `aria-disabled`. Gripper is disabled through its input.",
      },
    },
  },
  render: () =>
    mount(
      /* html */ `<div class="odd-stack" style="--gap: var(--space-5); max-inline-size: 26rem">
        <div class="odd-field">
          <label class="odd-label" id="jog-base-label" for="jog-base">Base (degrees)</label>
          <div class="odd-stepper" role="group" aria-labelledby="jog-base-label">
            <button class="odd-button" type="button" data-step="-10">−10</button>
            <button class="odd-button" type="button" data-step="-1">−1</button>
            <input class="odd-input" type="number" id="jog-base" min="-90" max="90" step="1" value="0">
            <button class="odd-button" type="button" data-step="1">+1</button>
            <button class="odd-button" type="button" data-step="10">+10</button>
          </div>
        </div>
        <div class="odd-field">
          <label class="odd-label" id="jog-wrist-label" for="jog-wrist">Wrist (degrees)</label>
          <div class="odd-stepper" role="group" aria-labelledby="jog-wrist-label">
            <button class="odd-button" type="button" data-step="-10">−5</button>
            <button class="odd-button" type="button" data-step="-1">−0.5</button>
            <input class="odd-input" type="number" id="jog-wrist" min="-45" max="45" step="0.5" value="45">
            <button class="odd-button" type="button" data-step="1">+0.5</button>
            <button class="odd-button" type="button" data-step="10">+5</button>
          </div>
        </div>
        <div class="odd-field">
          <label class="odd-label" id="jog-gripper-label" for="jog-gripper">Gripper (mm)</label>
          <div class="odd-stepper" role="group" aria-labelledby="jog-gripper-label">
            <button class="odd-button" type="button" data-step="-1">−1</button>
            <input class="odd-input" type="number" id="jog-gripper" min="0" max="30" value="12" disabled>
            <button class="odd-button" type="button" data-step="1">+1</button>
          </div>
        </div>
        <p class="odd-muted" id="jog-events">No changes yet</p>
      </div>`,
      (root) => {
        const events = root.querySelector<HTMLElement>("#jog-events")!;
        root.addEventListener("change", (event) => {
          const input = event.target as HTMLInputElement;
          events.textContent = `change: ${input.id} = ${input.value}`;
        });
        root.querySelectorAll<HTMLElement>(".odd-stepper").forEach(enhanceStepper);
      },
    ),
};

export const RangeField: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "An `odd-slider` and a number input for one value, synced by `enhanceRangeField`. The number takes `min`, `max`, and `step` from the slider. Type 250 into Speed and press Tab: the slider stays put and an error appears until the number fits. The page listens to the slider only, and typed numbers fire its events too.",
      },
    },
  },
  render: () =>
    mount(
      /* html */ `<div class="odd-stack" style="--gap: var(--space-5); max-inline-size: 30rem">
        <div class="odd-field">
          <label class="odd-label" id="speed-label" for="speed">Speed</label>
          <div class="odd-range-field">
            <input class="odd-slider" type="range" id="speed" min="0" max="200" step="5" value="40" aria-describedby="speed-hint">
            <input class="odd-input" type="number" id="speed-number" min="0" max="200" step="5" value="40" aria-labelledby="speed-label speed-unit">
            <span class="odd-muted" id="speed-unit">mm/s</span>
          </div>
          <p class="odd-hint" id="speed-hint">0 to 200, in steps of 5.</p>
        </div>
        <div class="odd-field">
          <label class="odd-label" id="height-label" for="height">Lift height</label>
          <div class="odd-range-field">
            <input class="odd-slider" type="range" id="height" min="0" max="250" value="120">
            <input class="odd-input" type="number" id="height-number" min="0" max="250" value="120" aria-labelledby="height-label">
          </div>
        </div>
        <p class="odd-muted" id="range-events">No changes yet</p>
      </div>`,
      (root) => {
        const events = root.querySelector<HTMLElement>("#range-events")!;
        root.addEventListener("change", (event) => {
          const input = event.target as HTMLInputElement;
          events.textContent = `change: ${input.id} = ${input.value}`;
        });
        root.querySelectorAll<HTMLElement>(".odd-range-field").forEach((field) => enhanceRangeField(field));
      },
    ),
};
