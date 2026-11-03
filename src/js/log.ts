/*
 * Log: markup is described in src/css/components/log.css.
 *
 *   enhanceLog(log);                                         // keep the newest line in view
 *   appendLogLine(log, "Connected on COM3", { time: new Date() });
 *   appendLogLine(log, "Warning: wrist near its limit", { tone: "warning", time: "14:02:09" });
 *
 * enhanceLog pins the log to its bottom. When lines are added and the reader is at the bottom, the
 * log scrolls to the newest line. Once the reader scrolls up, it stays put until they scroll back
 * down. A log is wired once however many callers enhance it, and its listeners go when the last
 * caller cleans up. appendLogLine adds one line as text, never as HTML, and drops the oldest lines
 * past `max`. It refuses a log with data-owner="react", whose lines React renders and trims.
 */
export type LogTone = "info" | "success" | "warning" | "danger";

export type LogLineOptions = {
  tone?: LogTone;
  /** A Date shows as the local time of day; a string shows as written. */
  time?: Date | string;
  /** The most lines the log keeps. Default 500. */
  max?: number;
};

/** How far from the bottom, in pixels, still counts as at the bottom: rounding leaves a pixel or so. */
const PIN_SLACK_PX = 8;

const holders = new WeakMap<HTMLElement, { count: number; stop: () => void }>();

export function enhanceLog(log: HTMLElement): () => void {
  let hold = holders.get(log);
  if (hold === undefined) {
    hold = { count: 0, stop: wire(log) };
    holders.set(log, hold);
  }
  hold.count++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--hold.count > 0) return;
    hold.stop();
    holders.delete(log);
  };
}

function wire(log: HTMLElement): () => void {
  let pinned = true;
  const onScroll = () => {
    pinned = log.scrollHeight - log.scrollTop - log.clientHeight <= PIN_SLACK_PX;
  };
  const observer = new MutationObserver(() => {
    if (pinned) log.scrollTop = log.scrollHeight;
  });
  observer.observe(log, { childList: true, subtree: true, characterData: true });
  log.addEventListener("scroll", onScroll, { passive: true });
  log.scrollTop = log.scrollHeight;
  return () => {
    observer.disconnect();
    log.removeEventListener("scroll", onScroll);
  };
}

export function appendLogLine(log: HTMLElement, text: string, { tone, time, max = 500 }: LogLineOptions = {}): HTMLElement {
  if (log.dataset.owner === "react") throw new Error("appendLogLine cannot add to a React Log, because React renders its lines. Keep the lines in state and render a LogLine for each.");
  const line = document.createElement("div");
  line.className = "odd-log-line";
  if (tone) line.dataset.tone = tone;
  if (time !== undefined) {
    const stamp = document.createElement("time");
    if (time instanceof Date) {
      stamp.dateTime = time.toISOString();
      stamp.textContent = time.toLocaleTimeString(undefined, { hour12: false });
    } else {
      stamp.textContent = time;
    }
    line.append(stamp, " ");
  }
  line.append(text);
  log.append(line);
  while (log.childElementCount > max) log.firstElementChild!.remove();
  return line;
}
