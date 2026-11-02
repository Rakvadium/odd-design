import { useState } from "react";
import { Button, Grid, GridItem, Log as OddLog, LogLine, Row, Stack, type LogLineTone } from "odd-design/react";
import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Feedback",
  parameters: {
    docs: {
      description: {
        component:
          "`Log` from `odd-design/react` renders `div.odd-log` with `role=\"log\"`, its `label` as the name, and a tab stop, and runs `enhanceLog` on it, which keeps the newest line in view until the reader scrolls up. `LogLine` renders each line with an optional `tone` and `time`. The app keeps the lines in state: Add line appends one, and the log follows it. Scroll up and add more, and the log stays where you are until you scroll back to the bottom. Tone tints a line, and the text says the level too.",
      },
    },
  },
};

export default meta;

type Line = { readonly id: number; readonly text: string; readonly tone?: LogLineTone; readonly time?: string | Date };

const START: readonly Line[] = (
  [
    ["09:14:01", "Opened deck Midnight Control"],
    ["09:14:02", "Synced 60 cards from your collection", "success"],
    ["09:14:03", "Loaded prices for 60 cards"],
    ["09:14:04", "Info: 3 cards have new art", "info"],
    ["09:14:06", "Moved Tidecaller to the sideboard"],
    ["09:14:07", "Warning: the deck is 2 cards over the limit", "warning"],
    ["09:14:09", "Removed 2 copies of Ember Scout"],
    ["09:14:11", "Error: the price service did not answer", "danger"],
    ["09:14:12", "Asked the price service again"],
    ["09:14:13", "Prices loaded", "success"],
    ["09:14:15", "Renamed the deck to Midnight Control v2"],
    ["09:14:17", "Added 4 copies of Night Market"],
    ["09:14:18", "Info: format changed to Extended", "info"],
    ["09:14:20", "Saved version 13"],
    ["09:14:21", "Warning: 1 card rotates out on May 1", "warning"],
    ["09:14:23", "Shared a read-only link"],
  ] as const
).map(([time, text, tone], id) => ({ id, time, text, tone }));

const NEXT: readonly (readonly [string, LogLineTone | undefined])[] = [
  ["Added a copy of Tidecaller", undefined],
  ["Info: 2 players are viewing the deck", "info"],
  ["Warning: the sideboard is over 15 cards", "warning"],
  ["Error: sync failed, trying again", "danger"],
  ["Synced", "success"],
];

function SyncLog() {
  const [lines, setLines] = useState(START);
  const add = () =>
    setLines((current) => {
      const [text, tone] = NEXT[(current.length - START.length) % NEXT.length]!;
      return [...current, { id: current.length, text, tone, time: new Date() }].slice(-500);
    });
  return (
    <Stack>
      <OddLog id="sync-log" label="Sync log">
        {lines.map((line) => (
          <LogLine key={line.id} tone={line.tone} time={line.time}>
            {line.text}
          </LogLine>
        ))}
      </OddLog>
      <Row>
        <Button id="add-log-line" onClick={add}>
          Add line
        </Button>
      </Row>
    </Stack>
  );
}

export const Log = {
  ...mirrored({
    scene: () => (
      <Grid>
        <GridItem span={6}>
          <SyncLog />
        </GridItem>
      </Grid>
    ),
    aria: `
- log "Sync log":
  - time: 09:14:01
  - text: Opened deck Midnight Control
  - time: 09:14:02
  - text: Synced 60 cards from your collection
  - time: 09:14:03
  - text: Loaded prices for 60 cards
  - time: 09:14:04
  - text: "Info: 3 cards have new art"
  - time: 09:14:06
  - text: Moved Tidecaller to the sideboard
  - time: 09:14:07
  - text: "Warning: the deck is 2 cards over the limit"
  - time: 09:14:09
  - text: Removed 2 copies of Ember Scout
  - time: 09:14:11
  - text: "Error: the price service did not answer"
  - time: 09:14:12
  - text: Asked the price service again
  - time: 09:14:13
  - text: Prices loaded
  - time: 09:14:15
  - text: Renamed the deck to Midnight Control v2
  - time: 09:14:17
  - text: Added 4 copies of Night Market
  - time: 09:14:18
  - text: "Info: format changed to Extended"
  - time: 09:14:20
  - text: Saved version 13
  - time: 09:14:21
  - text: "Warning: 1 card rotates out on May 1"
  - time: 09:14:23
  - text: Shared a read-only link
- button "Add line"`,
  }),
  play: ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const log = canvasElement.querySelector<HTMLElement>("#sync-log");
    const add = canvasElement.querySelector<HTMLButtonElement>("#add-log-line");
    if (log === null || add === null) throw new Error("the Log story lost #sync-log or #add-log-line");
    // The compiled HTML runs no React, so the page adds the line. Under React, the click has rendered one by
    // the next task, and adding another here would put a node React does not know inside its list.
    let added = 0;
    add.addEventListener("click", () => {
      const before = log.childElementCount;
      setTimeout(() => {
        if (log.childElementCount !== before) return;
        const [text, tone] = NEXT[added++ % NEXT.length]!;
        const line = document.createElement("div");
        line.className = "odd-log-line";
        if (tone) line.dataset.tone = tone;
        const time = document.createElement("time");
        time.textContent = new Date().toLocaleTimeString(undefined, { hour12: false });
        line.append(time, " ", text);
        log.append(line);
      });
    });
  },
};

export const LogVariants = mirrored({
  scene: () => (
    <Grid>
      <GridItem span={6}>
        <OddLog label="Every kind of line">
          <LogLine time="09:14:01">Opened deck Midnight Control</LogLine>
          <LogLine time="09:14:02" tone="info">
            Info: 3 cards have new art
          </LogLine>
          <LogLine time="09:14:03" tone="success">
            Synced 60 cards
          </LogLine>
          <LogLine time="09:14:04" tone="warning">
            Warning: the deck is 2 cards over the limit
          </LogLine>
          <LogLine time="09:14:05" tone="danger">
            Error: the price service did not answer
          </LogLine>
          <LogLine>A line with no time</LogLine>
        </OddLog>
      </GridItem>
    </Grid>
  ),
  aria: `
- log "Every kind of line":
  - time: 09:14:01
  - text: Opened deck Midnight Control
  - time: 09:14:02
  - text: "Info: 3 cards have new art"
  - time: 09:14:03
  - text: Synced 60 cards
  - time: 09:14:04
  - text: "Warning: the deck is 2 cards over the limit"
  - time: 09:14:05
  - text: "Error: the price service did not answer A line with no time"`,
});
