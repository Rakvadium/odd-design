import { afterEach, expect, test } from "bun:test";
import { appendLogLine, enhanceLog } from "../src/js/log.ts";

const LINE_PX = 20;
const VIEW_PX = 100;

/** happy-dom has no layout, so each line is 20px tall and the log shows 100px of them. */
function mount() {
  document.body.innerHTML = /* html */ `<div class="odd-log" role="log" aria-label="Arm log" tabindex="0"></div>`;
  const log = document.querySelector<HTMLElement>(".odd-log")!;
  let top = 0;
  Object.defineProperty(log, "scrollHeight", { get: () => log.childElementCount * LINE_PX });
  Object.defineProperty(log, "clientHeight", { get: () => VIEW_PX });
  Object.defineProperty(log, "scrollTop", {
    get: () => top,
    set: (value: number) => {
      top = Math.max(0, Math.min(value, log.scrollHeight - VIEW_PX));
    },
  });
  const scrollTo = (value: number) => {
    log.scrollTop = value;
    log.dispatchEvent(new Event("scroll"));
  };
  return { log, scrollTo };
}

const settle = () => new Promise((resolve) => setTimeout(resolve));

afterEach(() => {
  document.body.innerHTML = "";
});

test("appendLogLine adds text, tone, and time, and keeps only the newest max lines", () => {
  const { log } = mount();
  appendLogLine(log, "<b>Connected</b>", { time: "14:02:07" });
  appendLogLine(log, "Warning: wrist near its limit", { tone: "warning", time: new Date(Date.UTC(2026, 9, 26, 14, 2, 9)) });
  appendLogLine(log, "Homed", { max: 2 });
  expect(log.innerHTML).toBe(
    '<div class="odd-log-line" data-tone="warning"><time datetime="2026-10-26T14:02:09.000Z">' +
      log.querySelector("time")!.textContent +
      '</time> Warning: wrist near its limit</div><div class="odd-log-line">Homed</div>',
  );
  appendLogLine(log, "<b>Connected</b>", { time: "14:02:07" });
  expect(log.lastElementChild!.outerHTML).toBe('<div class="odd-log-line"><time>14:02:07</time> &lt;b&gt;Connected&lt;/b&gt;</div>');
});

test("the log follows new lines until the reader scrolls up, and again once they scroll back down", async () => {
  const { log, scrollTo } = mount();
  enhanceLog(log);
  for (let i = 0; i < 10; i++) appendLogLine(log, `line ${i}`);
  await settle();
  expect(log.scrollTop).toBe(10 * LINE_PX - VIEW_PX);

  scrollTo(0);
  appendLogLine(log, "line 10");
  await settle();
  expect(log.scrollTop).toBe(0);

  scrollTo(log.scrollHeight);
  appendLogLine(log, "line 11");
  await settle();
  expect(log.scrollTop).toBe(12 * LINE_PX - VIEW_PX);
});

test("cleanup stops following", async () => {
  const { log } = mount();
  const cleanup = enhanceLog(log);
  cleanup();
  for (let i = 0; i < 10; i++) appendLogLine(log, `line ${i}`);
  await settle();
  expect(log.scrollTop).toBe(0);
});
