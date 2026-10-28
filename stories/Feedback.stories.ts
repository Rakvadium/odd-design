import type { Meta, StoryObj } from "@storybook/html-vite";
import { appendLogLine, enhanceLog, type LogTone } from "../src/js/enhance.ts";

const meta = { title: "Components/Feedback" } satisfies Meta;

export default meta;
type Story = StoryObj;

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
