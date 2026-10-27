import type { Meta, StoryObj } from "@storybook/html-vite";
import { enhance } from "../src/js/enhance.ts";

const meta = { title: "Components/Layout" } satisfies Meta;

export default meta;
type Story = StoryObj;

export const AppShell: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "`odd-shell` is a full-height page with a sticky header: title, a status slot that takes the free space, and actions. The main area is an `odd-grid` of `odd-card` panels sized with `data-span`. The grid measures itself: narrow the window and the 4-column panels take half, then every panel takes the full row. One `enhance()` call wires the stepper, range field, and log.",
      },
    },
  },
  render: () => {
    const root = document.createElement("div");
    root.innerHTML = /* html */ `<div class="odd-shell">
      <header class="odd-shell-header">
        <h1 class="odd-heading">NexArm</h1>
        <div class="odd-shell-status" role="status">
          <span class="odd-badge" data-tone="success">Connected</span>
          <span class="odd-muted">COM3</span>
        </div>
        <div class="odd-shell-actions">
          <button class="odd-button" type="button">Home</button>
          <button class="odd-button" type="button" data-variant="primary">Run sequence</button>
        </div>
      </header>
      <main class="odd-shell-main odd-grid" id="shell-grid">
        <section class="odd-card" data-span="8" aria-labelledby="shell-jog-title">
          <h2 class="odd-card-title" id="shell-jog-title">Jog</h2>
          <div class="odd-field">
            <label class="odd-label" id="shell-base-label" for="shell-base">Base (degrees)</label>
            <div class="odd-stepper" role="group" aria-labelledby="shell-base-label">
              <button class="odd-button" type="button" data-step="-10">−10</button>
              <button class="odd-button" type="button" data-step="-1">−1</button>
              <input class="odd-input" type="number" id="shell-base" min="-90" max="90" value="0">
              <button class="odd-button" type="button" data-step="1">+1</button>
              <button class="odd-button" type="button" data-step="10">+10</button>
            </div>
          </div>
          <div class="odd-field">
            <label class="odd-label" id="shell-speed-label" for="shell-speed">Speed</label>
            <div class="odd-range-field">
              <input class="odd-slider" type="range" id="shell-speed" min="0" max="200" step="5" value="60">
              <input class="odd-input" type="number" id="shell-speed-number" min="0" max="200" step="5" value="60" aria-labelledby="shell-speed-label shell-speed-unit">
              <span class="odd-muted" id="shell-speed-unit">mm/s</span>
            </div>
          </div>
        </section>
        <section class="odd-card" data-span="4" aria-labelledby="shell-stop-title" style="justify-items: center">
          <h2 class="odd-card-title" id="shell-stop-title">Stop</h2>
          <button class="odd-estop" type="button" aria-pressed="false">Stop</button>
        </section>
        <section class="odd-card" data-span="4" aria-labelledby="shell-pose-title">
          <h2 class="odd-card-title" id="shell-pose-title">Pose</h2>
          <p class="odd-muted">Base 0, shoulder 45, elbow −30, wrist 10, gripper 12 mm.</p>
        </section>
        <section class="odd-card" data-span="8" aria-labelledby="shell-log-title">
          <h2 class="odd-card-title" id="shell-log-title">Log</h2>
          <div class="odd-log" role="log" aria-labelledby="shell-log-title" tabindex="0" style="max-block-size: 8rem">
            <div class="odd-log-line" data-tone="success"><time>14:02:02</time> Connected to NexArm</div>
            <div class="odd-log-line"><time>14:02:07</time> Move base to 30 degrees</div>
            <div class="odd-log-line" data-tone="warning"><time>14:02:09</time> Warning: wrist near its limit</div>
          </div>
        </section>
      </main>
    </div>`;
    requestAnimationFrame(() => enhance(root));
    return root;
  },
};
