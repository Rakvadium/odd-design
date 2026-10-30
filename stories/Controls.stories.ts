import type { Meta, StoryObj } from "@storybook/html-vite";
const meta = {
  title: "Components/Controls",
  parameters: {
    docs: {
      description: {
        component: "Controls for driving a machine: an emergency stop.",
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
