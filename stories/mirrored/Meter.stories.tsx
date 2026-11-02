import type { ReactElement, ReactNode } from "react";
import { Eyebrow, Grid, GridItem, Meter, Muted, Progress as OddProgress, Row, Stack, StatValue } from "odd-design/react";
import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Feedback",
  parameters: {
    docs: {
      description: {
        component:
          "`Progress` and `Meter` from `odd-design/react` render `progress.odd-progress` for tasks and `meter.odd-meter` for measurements, each named by its `label`. Leave out `value` for an indeterminate progress bar. `tone` recolors a bar that has no `low` or `high`. With `low`, `high`, and `optimum`, a meter colors itself by range. The value is also shown as text in a `StatValue`. Each bar sits in the Stat row recipe: a `Stack` with a `Row` of the label and the value above the bar.",
      },
    },
  },
};

export default meta;

function Stat({ label, value, children }: { readonly label: string; readonly value: ReactNode; readonly children: ReactElement }) {
  return (
    <Stack>
      <Row>
        <Muted as="span">{label}</Muted>
        <StatValue>{value}</StatValue>
      </Row>
      {children}
    </Stack>
  );
}

function share(count: number, percent: string): ReactNode {
  return (
    <>
      {`${count} `}
      <Muted as="span">({percent})</Muted>
    </>
  );
}

const storage: readonly [string, string, number][] = [
  ["store-low", "Images", 0.32],
  ["store-mid", "Backups", 0.71],
  ["store-high", "Exports", 0.93],
];

export const Progress = mirrored({
  scene: () => (
    <Grid>
      <GridItem span={5}>
        <Stack>
          <Stack>
            <Stat label="Importing decks" value="40%">
              <OddProgress id="import" label="Importing decks" value={40} max={100} />
            </Stat>
            <Stat label="Syncing collection" value={<Muted as="span">Waiting…</Muted>}>
              <OddProgress id="sync" label="Syncing collection" />
            </Stat>
          </Stack>
          <div role="group" aria-labelledby="mix-title">
            <Stack>
              <Eyebrow id="mix-title">Deck mix · 60 cards</Eyebrow>
              <Stat label="Units" value={share(24, "40%")}>
                <Meter id="units" label="Units" min={0} max={60} value={24} />
              </Stat>
              <Stat label="Actions" value={share(22, "37%")}>
                <Meter id="actions" label="Actions" min={0} max={60} value={22} tone="info" />
              </Stat>
              <Stat label="Assets" value={share(14, "23%")}>
                <Meter id="assets" label="Assets" min={0} max={60} value={14} tone="success" />
              </Stat>
            </Stack>
          </div>
          <div role="group" aria-labelledby="storage-title">
            <Stack>
              <Eyebrow id="storage-title">Storage, colored by range</Eyebrow>
              {storage.map(([id, label, value]) => (
                <Stat key={id} label={label} value={`${Math.round(value * 100)}% used`}>
                  <Meter id={id} label={label} value={value} low={0.6} high={0.85} optimum={0} />
                </Stat>
              ))}
            </Stack>
          </div>
        </Stack>
      </GridItem>
    </Grid>
  ),
  aria: `
- text: Importing decks 40%
- progressbar "Importing decks"
- text: Syncing collection Waiting…
- progressbar "Syncing collection"
- group "Deck mix · 60 cards":
  - paragraph: Deck mix · 60 cards
  - text: Units 24 (40%)
  - meter "Units"
  - text: Actions 22 (37%)
  - meter "Actions"
  - text: Assets 14 (23%)
  - meter "Assets"
- group "Storage, colored by range":
  - paragraph: Storage, colored by range
  - text: Images 32% used
  - meter "Images"
  - text: Backups 71% used
  - meter "Backups"
  - text: Exports 93% used
  - meter "Exports"`,
});
