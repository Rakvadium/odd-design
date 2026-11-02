# Log usage rules

These codes apply to `odd-log` and `odd-log-line`. Shared codes are in [General usage rules](general.md).

In React, render `Log` with a `label` and one `LogLine` per line, and keep the lines in state. It renders the role, the name, the tab stop, and the live setting, so ODD-LOG-001 to 003 cannot happen. [Show a log](react.md#show-a-log) covers the props.

```tsx
import { Log, LogLine } from "odd-design/react";

<Log label="Sync log">
  {events.map((event) => (
    <LogLine key={event.id} tone={event.tone} time={event.at}>
      {event.text}
    </LogLine>
  ))}
</Log>;
```

The component compiles to this HTML:

```html
<div class="odd-log" role="log" aria-label="Sync log" tabindex="0" aria-live="polite" data-owner="react">
  <div class="odd-log-line"><time datetime="2026-11-02T09:14:01.000Z">09:14:01</time> Opened Midnight Control</div>
  <div class="odd-log-line" data-tone="warning"><time>09:14:09</time> Warning: 2 cards over the limit</div>
</div>
```

A log is a scrolling list of lines in the mono font. `role="log"` makes it a polite live region, so a screen reader reads each new line. For a fast log, set `aria-live="off"` and announce what matters some other way. `tabindex="0"` lets a keyboard user scroll it. `data-tone` on a line tints it and marks its start edge, and the text says the level too, because the tone is only color. The time is optional. `enhanceLog` keeps the newest line in view until the reader scrolls up, and `appendLogLine` adds a line as text and trims the oldest past `max`. `appendLogLine` refuses a log with `data-owner="react"`, because React renders and trims those lines.

## ODD-LOG-001

Fails when `odd-log` has no `role`, or a `role` other than `log`.

Without `role="log"`, the log is not a live region, so a screen reader never reads the lines that arrive. `role="status"` reads only the latest change and drops the history.

Set `role="log"`. In React, use `Log`.

## ODD-LOG-002

Fails when `odd-log` has no `tabindex`, or a `tabindex` other than `0`.

`log.css` caps the log's height and scrolls it. Without a tab stop, a keyboard user cannot reach it to scroll back to older lines.

Set `tabindex="0"`. In React, use `Log`.

## ODD-LOG-003

Fails when an element with `role="log"` has no `aria-label` and no `aria-labelledby`.

A screen reader announces lines from an unnamed live region with nothing to say which log they came from.

Name the log with `aria-label`, or point `aria-labelledby` at a visible heading. In React, pass `label` to `Log`, and a blank one throws this code outside production.

## ODD-LOG-004

Fails when a line's `data-tone` is not `info`, `success`, `warning`, or `danger`.

`log.css` draws a tint and a stripe for those four only. Any other tone draws neither and still recolors the line's time, because the time rule matches any `data-tone`.

Use one of the four, or remove `data-tone` for a plain line. In React, `tone` on `LogLine` takes only the four.
