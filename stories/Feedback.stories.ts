import type { Meta, StoryObj } from "@storybook/html-vite";
import { appendLogLine, enhanceLog, type LogTone } from "../src/js/enhance.ts";

const meta = { title: "Components/Feedback" } satisfies Meta;

export default meta;
type Story = StoryObj;

export const Progress: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`<progress>` for tasks, `<meter>` for measurements. Each one is named by its `<label>` or `aria-label`, and the value is also shown as text. A meter with `low`/`high`/`optimum` colors itself by range.",
      },
    },
  },
  render: () => /* html */ `<div class="odd-stack" style="--gap: var(--space-6); max-inline-size: 28rem">
    <div class="odd-stack" style="--gap: var(--space-3)">
      <div class="odd-stat">
        <label for="import">Importing decks</label><span class="odd-stat-value">40%</span>
        <progress class="odd-progress" id="import" value="40" max="100"></progress>
      </div>
      <div class="odd-stat">
        <label for="sync">Syncing collection</label><span class="odd-stat-value odd-muted">Waiting…</span>
        <progress class="odd-progress" id="sync"></progress>
      </div>
    </div>

    <div class="odd-stack" style="--gap: var(--space-3)" role="group" aria-labelledby="mix-title">
      <p class="odd-eyebrow" id="mix-title">Deck mix · 60 cards</p>
      <div class="odd-stat">
        <label for="units">Units</label><span class="odd-stat-value">24 <span class="odd-muted">(40%)</span></span>
        <meter class="odd-meter" id="units" min="0" max="60" value="24"></meter>
      </div>
      <div class="odd-stat">
        <label for="actions">Actions</label><span class="odd-stat-value">22 <span class="odd-muted">(37%)</span></span>
        <meter class="odd-meter" id="actions" min="0" max="60" value="22" data-tone="info"></meter>
      </div>
      <div class="odd-stat">
        <label for="assets">Assets</label><span class="odd-stat-value">14 <span class="odd-muted">(23%)</span></span>
        <meter class="odd-meter" id="assets" min="0" max="60" value="14" data-tone="success"></meter>
      </div>
    </div>

    <div class="odd-stack" style="--gap: var(--space-3)" role="group" aria-labelledby="storage-title">
      <p class="odd-eyebrow" id="storage-title">Storage, colored by range</p>
      ${[
        ["store-low", "Images", 0.32],
        ["store-mid", "Backups", 0.71],
        ["store-high", "Exports", 0.93],
      ]
        .map(
          ([id, label, v]) => /* html */ `<div class="odd-stat">
        <label for="${id}">${label}</label><span class="odd-stat-value">${Math.round(Number(v) * 100)}% used</span>
        <meter class="odd-meter" id="${id}" value="${v}" low="0.6" high="0.85" optimum="0"></meter>
      </div>`,
        )
        .join("")}
    </div>
  </div>`,
};

export const Skeleton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The loading region has `aria-busy=\"true\"` and says “Loading” in text. The blocks are `aria-hidden`. The pulse follows `--duration-slow`, so reduced motion stops it.",
      },
    },
  },
  render: () => /* html */ `<div style="display:grid; gap: var(--space-5); grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr))" aria-busy="true">
    <span class="odd-visually-hidden">Loading decks…</span>
    ${/* html */ `<article class="odd-card" aria-hidden="true">
      <div class="odd-row">
        <div class="odd-skeleton" data-shape="avatar"></div>
        <div class="odd-stack" style="--gap: var(--space-2); flex: 1">
          <div class="odd-skeleton" style="inline-size: 70%"></div>
          <div class="odd-skeleton" style="inline-size: 40%; block-size: 0.75em"></div>
        </div>
      </div>
      <div class="odd-skeleton" style="block-size: 5rem; border-radius: var(--radius-surface)"></div>
      <div class="odd-skeleton" style="inline-size: 90%"></div>
      <div class="odd-skeleton" style="inline-size: 60%"></div>
    </article>`.repeat(2)}
  </div>`,
};

const logSamples: readonly [string, LogTone | undefined][] = [
  ["Pose saved: wave", undefined],
  ["Info: battery at 78%", "info"],
  ["Warning: wrist near its limit", "warning"],
  ["Error: servo 3 did not answer", "danger"],
  ["Homed all joints", "success"],
];

export const Log: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A `role=\"log\"` region in the mono font. Add line calls `appendLogLine`, and `enhanceLog` keeps the newest line in view. Scroll up and add more: the log stays where you are until you scroll back to the bottom. Tone tints a line; the text says the level too.",
      },
    },
  },
  render: () => {
    const root = document.createElement("div");
    root.innerHTML = /* html */ `<div class="odd-stack" style="max-inline-size: 40rem">
      <div class="odd-log" id="arm-log" role="log" aria-label="Arm log" tabindex="0" style="max-block-size: 12rem">
        <div class="odd-log-line"><time datetime="2026-10-26T14:02:01">14:02:01</time> Opened COM3 at 115200 baud</div>
        <div class="odd-log-line" data-tone="success"><time datetime="2026-10-26T14:02:02">14:02:02</time> Connected to NexArm, firmware 2.1</div>
        <div class="odd-log-line"><time datetime="2026-10-26T14:02:04">14:02:04</time> Read joint angles: 0, 45, -30, 10, 0, 12</div>
        <div class="odd-log-line" data-tone="info"><time datetime="2026-10-26T14:02:05">14:02:05</time> Info: speed limit is 120 mm/s</div>
        <div class="odd-log-line"><time datetime="2026-10-26T14:02:07">14:02:07</time> Move base to 30 degrees</div>
        <div class="odd-log-line" data-tone="warning"><time datetime="2026-10-26T14:02:09">14:02:09</time> Warning: wrist near its limit (44.5 of 45 degrees)</div>
        <div class="odd-log-line"><time datetime="2026-10-26T14:02:10">14:02:10</time> Move gripper to 12 mm</div>
        <div class="odd-log-line" data-tone="danger"><time datetime="2026-10-26T14:02:12">14:02:12</time> Error: refused a persistent command, servo ID write</div>
        <div class="odd-log-line"><time datetime="2026-10-26T14:02:15">14:02:15</time> Emergency stop released</div>
      </div>
      <div class="odd-row">
        <button class="odd-button" type="button" id="add-log-line">Add line</button>
      </div>
    </div>`;
    requestAnimationFrame(() => {
      const log = root.querySelector<HTMLElement>("#arm-log")!;
      enhanceLog(log);
      let next = 0;
      root.querySelector("#add-log-line")!.addEventListener("click", () => {
        const [text, tone] = logSamples[next++ % logSamples.length]!;
        appendLogLine(log, text, { tone, time: new Date() });
      });
    });
    return root;
  },
};
