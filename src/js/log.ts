/*
 * Log: markup is described in src/css/components/log.css.
 *
 *   enhanceLog(log);                                         // keep the newest line in view
 *   appendLogLine(log, "Connected on COM3", { time: new Date() });
 *   appendLogLine(log, "Warning: wrist near its limit", { tone: "warning", time: "14:02:09" });
 *
 * enhanceLog pins the log to its bottom. When lines are added and the reader is at the bottom, the
 * log scrolls to the newest line. Once the reader scrolls up, it stays put until they scroll back
 * down. appendLogLine adds one line as text, never as HTML, and drops the oldest lines past `max`.
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

export function enhanceLog(log: HTMLElement): () => void {
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
