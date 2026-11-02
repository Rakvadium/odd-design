import { useState } from "react";
import { Badge, Grid, GridItem, SORT_DIRECTIONS, Stack, Table as OddTable, type Selection, type Sort, type SortDirection } from "odd-design/react";
import { mirrored } from "../story.ts";

type Args = {
  numeric: boolean;
  sortColumn: "name" | "cards";
  sortDirection: SortDirection | "none";
  selectable: boolean;
  scrollable: boolean;
  hideCaption: boolean;
};

const meta = {
  title: "Components/Data Display",
  args: { numeric: true, sortColumn: "name", sortDirection: "ascending", selectable: true, scrollable: true, hideCaption: false } satisfies Args,
  argTypes: {
    sortColumn: { control: "inline-radio", options: ["name", "cards"] },
    sortDirection: { control: "inline-radio", options: [...SORT_DIRECTIONS, "none"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "`Table` from `odd-design/react` takes a `caption`, `columns`, `rows`, and a `rowKey`, and renders `div.odd-table-wrap`, a named scroll region unless `scrollable={false}`, around `table.odd-table`. `sortable` lists the columns whose header is a sort button, and `sort` puts `aria-sort` on one of them; the page sorts the rows from `onSortChange`. `selection` adds a named checkbox per row and a select-all box in the header, which `enhanceSelectAll` keeps checked, mixed, or clear. A column's `footer` adds the `tfoot` row.",
      },
    },
  },
};

export default meta;

type Tone = "success" | "warning" | "danger";

type Deck = { readonly id: string; readonly name: string; readonly format: string; readonly cards: number; readonly versions: number; readonly tone: Tone; readonly status: string };

const decks: readonly Deck[] = [
  { id: "midnight", name: "Midnight Control", format: "Extended", cards: 60, versions: 14, tone: "success", status: "Legal" },
  { id: "ember", name: "Ember Aggro", format: "Standard", cards: 60, versions: 9, tone: "warning", status: "Rotating" },
  { id: "tide", name: "Tidecaller", format: "Standard", cards: 62, versions: 21, tone: "success", status: "Legal" },
  { id: "faithful", name: "Old Faithful", format: "Retro", cards: 55, versions: 3, tone: "danger", status: "Banned card" },
];

type DeckKey = "name" | "format" | "cards" | "versions" | "status";

const ORDER: Readonly<Record<DeckKey, (a: Deck, b: Deck) => number>> = {
  name: (a, b) => a.name.localeCompare(b.name),
  format: (a, b) => a.format.localeCompare(b.format),
  cards: (a, b) => a.cards - b.cards,
  versions: (a, b) => a.versions - b.versions,
  status: (a, b) => a.status.localeCompare(b.status),
};

function sorted(rows: readonly Deck[], sort: Sort<DeckKey> | undefined): readonly Deck[] {
  if (sort === undefined) return rows;
  const order = ORDER[sort.column];
  return [...rows].sort((a, b) => (sort.direction === "ascending" ? order(a, b) : order(b, a)));
}

function useSelection(initial: readonly string[], disabled?: (deck: Deck) => boolean): Selection<Deck> {
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set(initial));
  return { selected, onChange: setSelected, label: (deck) => `Select ${deck.name}`, allLabel: "Select all decks", disabled };
}

const name = { key: "name", header: "Deck", rowHeader: true, cell: (deck: Deck) => deck.name } as const;
const format = { key: "format", header: "Format", cell: (deck: Deck) => deck.format } as const;
const cards = { key: "cards", header: "Cards", numeric: true, cell: (deck: Deck) => deck.cards } as const;
const versions = { key: "versions", header: "Versions", numeric: true, cell: (deck: Deck) => deck.versions } as const;
const status = { key: "status", header: "Status", cell: (deck: Deck) => <Badge tone={deck.tone}>{deck.status}</Badge> } as const;

function YourDecks() {
  const [sort, setSort] = useState<Sort<"name" | "format" | "cards">>({ column: "name", direction: "ascending" });
  const selection = useSelection(["ember"]);
  return (
    <OddTable
      caption="Your decks, sorted by name"
      rows={sorted(decks, sort)}
      rowKey={(deck) => deck.id}
      columns={[
        {
          ...name,
          cell: (deck) => <a href="#">{deck.name}</a>,
          footer: "4 decks",
        },
        format,
        { ...cards, footer: 237 },
        { ...versions, footer: 47 },
        status,
      ]}
      sortable={["name", "format", "cards"]}
      sort={sort}
      onSortChange={setSort}
      selection={selection}
    />
  );
}

export const Table = mirrored<Args>({
  scene: () => (
    <Grid>
      <GridItem span={8}>
        <YourDecks />
      </GridItem>
    </Grid>
  ),
  aria: `
- region "Your decks, sorted by name":
  - table "Your decks, sorted by name":
    - caption: Your decks, sorted by name
    - rowgroup:
      - row "Select all decks Deck Format Cards Versions Status":
        - columnheader "Select all decks":
          - checkbox "Select all decks" [checked=mixed]
        - columnheader "Deck":
          - button "Deck"
        - columnheader "Format":
          - button "Format"
        - columnheader "Cards":
          - button "Cards"
        - columnheader "Versions"
        - columnheader "Status"
    - rowgroup:
      - row "Select Ember Aggro Ember Aggro Standard 60 9 Rotating":
        - cell "Select Ember Aggro":
          - checkbox "Select Ember Aggro" [checked]
        - rowheader "Ember Aggro":
          - link "Ember Aggro":
            - /url: "#"
        - cell "Standard"
        - cell "60"
        - cell "9"
        - cell "Rotating"
      - row "Select Midnight Control Midnight Control Extended 60 14 Legal":
        - cell "Select Midnight Control":
          - checkbox "Select Midnight Control"
        - rowheader "Midnight Control":
          - link "Midnight Control":
            - /url: "#"
        - cell "Extended"
        - cell "60"
        - cell "14"
        - cell "Legal"
      - row "Select Old Faithful Old Faithful Retro 55 3 Banned card":
        - cell "Select Old Faithful":
          - checkbox "Select Old Faithful"
        - rowheader "Old Faithful":
          - link "Old Faithful":
            - /url: "#"
        - cell "Retro"
        - cell "55"
        - cell "3"
        - cell "Banned card"
      - row "Select Tidecaller Tidecaller Standard 62 21 Legal":
        - cell "Select Tidecaller":
          - checkbox "Select Tidecaller"
        - rowheader "Tidecaller":
          - link "Tidecaller":
            - /url: "#"
        - cell "Standard"
        - cell "62"
        - cell "21"
        - cell "Legal"
    - rowgroup:
      - row "4 decks 237 47":
        - cell
        - rowheader "4 decks"
        - cell
        - cell "237"
        - cell "47"
        - cell`,
});

function PlaygroundTable({ numeric, sortColumn, sortDirection, selectable, scrollable, hideCaption }: Args) {
  const selection = useSelection(["midnight"]);
  return (
    <OddTable
      caption="Decks"
      hideCaption={hideCaption}
      scrollable={scrollable}
      rows={decks.slice(0, 3)}
      rowKey={(deck) => deck.id}
      columns={[name, format, { ...cards, numeric }]}
      sortable={["name", "cards"]}
      sort={sortDirection === "none" ? undefined : { column: sortColumn, direction: sortDirection }}
      selection={selectable ? selection : undefined}
    />
  );
}

export const TablePlayground = mirrored<Args>({
  scene: (args) => (
    <Grid>
      <GridItem span={6}>
        <PlaygroundTable {...args} />
      </GridItem>
    </Grid>
  ),
  aria: `
- region "Decks":
  - table "Decks":
    - caption: Decks
    - rowgroup:
      - row "Select all decks Deck Format Cards":
        - columnheader "Select all decks":
          - checkbox "Select all decks" [checked=mixed]
        - columnheader "Deck":
          - button "Deck"
        - columnheader "Format"
        - columnheader "Cards":
          - button "Cards"
    - rowgroup:
      - row "Select Midnight Control Midnight Control Extended 60":
        - cell "Select Midnight Control":
          - checkbox "Select Midnight Control" [checked]
        - rowheader "Midnight Control"
        - cell "Extended"
        - cell "60"
      - row "Select Ember Aggro Ember Aggro Standard 60":
        - cell "Select Ember Aggro":
          - checkbox "Select Ember Aggro"
        - rowheader "Ember Aggro"
        - cell "Standard"
        - cell "60"
      - row "Select Tidecaller Tidecaller Standard 62":
        - cell "Select Tidecaller":
          - checkbox "Select Tidecaller"
        - rowheader "Tidecaller"
        - cell "Standard"
        - cell "62"`,
});

function Selectable({ caption, rows = decks.slice(0, 3), initial, disabled }: { caption: string; rows?: readonly Deck[]; initial: readonly string[]; disabled?: (deck: Deck) => boolean }) {
  const selection = useSelection(initial, disabled);
  return <OddTable caption={caption} scrollable={false} rows={rows} rowKey={(deck) => deck.id} columns={[name, format]} selection={selection} />;
}

export const TableParts = mirrored<Args>({
  scene: () => (
    <Grid>
      <GridItem span={5}>
        <Stack>
          <OddTable caption="Plain" scrollable={false} rows={decks} rowKey={(deck) => deck.id} columns={[name, format]} />
          <OddTable
            caption="Numeric columns"
            scrollable={false}
            rows={decks}
            rowKey={(deck) => deck.id}
            columns={[
              { ...name, footer: "4 decks" },
              { ...cards, footer: 237 },
              { ...versions, footer: 47 },
            ]}
          />
          {SORT_DIRECTIONS.map((direction) => (
            <OddTable
              key={direction}
              caption={direction === "ascending" ? "Sorted by deck, A to Z" : "Sorted by cards, most first"}
              scrollable={false}
              rows={sorted(decks, { column: direction === "ascending" ? "name" : "cards", direction })}
              rowKey={(deck) => deck.id}
              columns={[name, cards]}
              sortable={["name", "cards"]}
              sort={{ column: direction === "ascending" ? "name" : "cards", direction }}
            />
          ))}
          <OddTable caption="Not sorted" scrollable={false} rows={decks} rowKey={(deck) => deck.id} columns={[name, cards]} sortable={["name", "cards"]} />
          <Selectable caption="No decks yet" rows={[]} initial={[]} />
        </Stack>
      </GridItem>
    </Grid>
  ),
  aria: `
- table "Plain":
  - caption: Plain
  - rowgroup:
    - row "Deck Format":
      - columnheader "Deck"
      - columnheader "Format"
  - rowgroup:
    - row "Midnight Control Extended":
      - rowheader "Midnight Control"
      - cell "Extended"
    - row "Ember Aggro Standard":
      - rowheader "Ember Aggro"
      - cell "Standard"
    - row "Tidecaller Standard":
      - rowheader "Tidecaller"
      - cell "Standard"
    - row "Old Faithful Retro":
      - rowheader "Old Faithful"
      - cell "Retro"
- table "Numeric columns":
  - caption: Numeric columns
  - rowgroup:
    - row "Deck Cards Versions":
      - columnheader "Deck"
      - columnheader "Cards"
      - columnheader "Versions"
  - rowgroup:
    - row "Midnight Control 60 14":
      - rowheader "Midnight Control"
      - cell "60"
      - cell "14"
    - row "Ember Aggro 60 9":
      - rowheader "Ember Aggro"
      - cell "60"
      - cell "9"
    - row "Tidecaller 62 21":
      - rowheader "Tidecaller"
      - cell "62"
      - cell "21"
    - row "Old Faithful 55 3":
      - rowheader "Old Faithful"
      - cell "55"
      - cell "3"
  - rowgroup:
    - row "4 decks 237 47":
      - rowheader "4 decks"
      - cell "237"
      - cell "47"
- table "Sorted by deck, A to Z":
  - caption: Sorted by deck, A to Z
  - rowgroup:
    - row "Deck Cards":
      - columnheader "Deck":
        - button "Deck"
      - columnheader "Cards":
        - button "Cards"
  - rowgroup:
    - row "Ember Aggro 60":
      - rowheader "Ember Aggro"
      - cell "60"
    - row "Midnight Control 60":
      - rowheader "Midnight Control"
      - cell "60"
    - row "Old Faithful 55":
      - rowheader "Old Faithful"
      - cell "55"
    - row "Tidecaller 62":
      - rowheader "Tidecaller"
      - cell "62"
- table "Sorted by cards, most first":
  - caption: Sorted by cards, most first
  - rowgroup:
    - row "Deck Cards":
      - columnheader "Deck":
        - button "Deck"
      - columnheader "Cards":
        - button "Cards"
  - rowgroup:
    - row "Tidecaller 62":
      - rowheader "Tidecaller"
      - cell "62"
    - row "Midnight Control 60":
      - rowheader "Midnight Control"
      - cell "60"
    - row "Ember Aggro 60":
      - rowheader "Ember Aggro"
      - cell "60"
    - row "Old Faithful 55":
      - rowheader "Old Faithful"
      - cell "55"
- table "Not sorted":
  - caption: Not sorted
  - rowgroup:
    - row "Deck Cards":
      - columnheader "Deck":
        - button "Deck"
      - columnheader "Cards":
        - button "Cards"
  - rowgroup:
    - row "Midnight Control 60":
      - rowheader "Midnight Control"
      - cell "60"
    - row "Ember Aggro 60":
      - rowheader "Ember Aggro"
      - cell "60"
    - row "Tidecaller 62":
      - rowheader "Tidecaller"
      - cell "62"
    - row "Old Faithful 55":
      - rowheader "Old Faithful"
      - cell "55"
- table "No decks yet":
  - caption: No decks yet
  - rowgroup:
    - row "Select all decks Deck Format":
      - columnheader "Select all decks":
        - checkbox "Select all decks"
      - columnheader "Deck"
      - columnheader "Format"
  - rowgroup`,
});

export const TableStates = mirrored<Args>({
  scene: () => (
    <Grid>
      <GridItem span={5}>
        <Stack>
          <Selectable caption="No rows selected" initial={[]} />
          <Selectable caption="Some rows selected" initial={["ember"]} />
          <Selectable caption="All rows selected" initial={["midnight", "ember", "tide"]} />
          <Selectable caption="A banned deck cannot be selected" rows={decks} initial={["midnight", "ember", "tide"]} disabled={(deck) => deck.status === "Banned card"} />
          <OddTable caption="Not selectable" scrollable={false} rows={decks.slice(0, 3)} rowKey={(deck) => deck.id} columns={[name, format]} />
        </Stack>
      </GridItem>
    </Grid>
  ),
  aria: `
- table "No rows selected":
  - caption: No rows selected
  - rowgroup:
    - row "Select all decks Deck Format":
      - columnheader "Select all decks":
        - checkbox "Select all decks"
      - columnheader "Deck"
      - columnheader "Format"
  - rowgroup:
    - row "Select Midnight Control Midnight Control Extended":
      - cell "Select Midnight Control":
        - checkbox "Select Midnight Control"
      - rowheader "Midnight Control"
      - cell "Extended"
    - row "Select Ember Aggro Ember Aggro Standard":
      - cell "Select Ember Aggro":
        - checkbox "Select Ember Aggro"
      - rowheader "Ember Aggro"
      - cell "Standard"
    - row "Select Tidecaller Tidecaller Standard":
      - cell "Select Tidecaller":
        - checkbox "Select Tidecaller"
      - rowheader "Tidecaller"
      - cell "Standard"
- table "Some rows selected":
  - caption: Some rows selected
  - rowgroup:
    - row "Select all decks Deck Format":
      - columnheader "Select all decks":
        - checkbox "Select all decks" [checked=mixed]
      - columnheader "Deck"
      - columnheader "Format"
  - rowgroup:
    - row "Select Midnight Control Midnight Control Extended":
      - cell "Select Midnight Control":
        - checkbox "Select Midnight Control"
      - rowheader "Midnight Control"
      - cell "Extended"
    - row "Select Ember Aggro Ember Aggro Standard":
      - cell "Select Ember Aggro":
        - checkbox "Select Ember Aggro" [checked]
      - rowheader "Ember Aggro"
      - cell "Standard"
    - row "Select Tidecaller Tidecaller Standard":
      - cell "Select Tidecaller":
        - checkbox "Select Tidecaller"
      - rowheader "Tidecaller"
      - cell "Standard"
- table "All rows selected":
  - caption: All rows selected
  - rowgroup:
    - row "Select all decks Deck Format":
      - columnheader "Select all decks":
        - checkbox "Select all decks" [checked]
      - columnheader "Deck"
      - columnheader "Format"
  - rowgroup:
    - row "Select Midnight Control Midnight Control Extended":
      - cell "Select Midnight Control":
        - checkbox "Select Midnight Control" [checked]
      - rowheader "Midnight Control"
      - cell "Extended"
    - row "Select Ember Aggro Ember Aggro Standard":
      - cell "Select Ember Aggro":
        - checkbox "Select Ember Aggro" [checked]
      - rowheader "Ember Aggro"
      - cell "Standard"
    - row "Select Tidecaller Tidecaller Standard":
      - cell "Select Tidecaller":
        - checkbox "Select Tidecaller" [checked]
      - rowheader "Tidecaller"
      - cell "Standard"
- table "A banned deck cannot be selected":
  - caption: A banned deck cannot be selected
  - rowgroup:
    - row "Select all decks Deck Format":
      - columnheader "Select all decks":
        - checkbox "Select all decks" [checked]
      - columnheader "Deck"
      - columnheader "Format"
  - rowgroup:
    - row "Select Midnight Control Midnight Control Extended":
      - cell "Select Midnight Control":
        - checkbox "Select Midnight Control" [checked]
      - rowheader "Midnight Control"
      - cell "Extended"
    - row "Select Ember Aggro Ember Aggro Standard":
      - cell "Select Ember Aggro":
        - checkbox "Select Ember Aggro" [checked]
      - rowheader "Ember Aggro"
      - cell "Standard"
    - row "Select Tidecaller Tidecaller Standard":
      - cell "Select Tidecaller":
        - checkbox "Select Tidecaller" [checked]
      - rowheader "Tidecaller"
      - cell "Standard"
    - row "Select Old Faithful Old Faithful Retro":
      - cell "Select Old Faithful":
        - checkbox "Select Old Faithful" [disabled]
      - rowheader "Old Faithful"
      - cell "Retro"
- table "Not selectable":
  - caption: Not selectable
  - rowgroup:
    - row "Deck Format":
      - columnheader "Deck"
      - columnheader "Format"
  - rowgroup:
    - row "Midnight Control Extended":
      - rowheader "Midnight Control"
      - cell "Extended"
    - row "Ember Aggro Standard":
      - rowheader "Ember Aggro"
      - cell "Standard"
    - row "Tidecaller Standard":
      - rowheader "Tidecaller"
      - cell "Standard"`,
});

export const TableOverflow = mirrored<Args>({
  scene: () => (
    <Grid>
      <GridItem span={3}>
        <OddTable caption="Every column, scrolls sideways" rows={decks} rowKey={(deck) => deck.id} columns={[name, format, cards, versions, status]} />
      </GridItem>
      <GridItem span={3}>
        <OddTable caption="Two columns, fits" scrollable={false} rows={decks} rowKey={(deck) => deck.id} columns={[name, cards]} />
      </GridItem>
    </Grid>
  ),
  aria: `
- region "Every column, scrolls sideways":
  - table "Every column, scrolls sideways":
    - caption: Every column, scrolls sideways
    - rowgroup:
      - row "Deck Format Cards Versions Status":
        - columnheader "Deck"
        - columnheader "Format"
        - columnheader "Cards"
        - columnheader "Versions"
        - columnheader "Status"
    - rowgroup:
      - row "Midnight Control Extended 60 14 Legal":
        - rowheader "Midnight Control"
        - cell "Extended"
        - cell "60"
        - cell "14"
        - cell "Legal"
      - row "Ember Aggro Standard 60 9 Rotating":
        - rowheader "Ember Aggro"
        - cell "Standard"
        - cell "60"
        - cell "9"
        - cell "Rotating"
      - row "Tidecaller Standard 62 21 Legal":
        - rowheader "Tidecaller"
        - cell "Standard"
        - cell "62"
        - cell "21"
        - cell "Legal"
      - row "Old Faithful Retro 55 3 Banned card":
        - rowheader "Old Faithful"
        - cell "Retro"
        - cell "55"
        - cell "3"
        - cell "Banned card"
- table "Two columns, fits":
  - caption: Two columns, fits
  - rowgroup:
    - row "Deck Cards":
      - columnheader "Deck"
      - columnheader "Cards"
  - rowgroup:
    - row "Midnight Control 60":
      - rowheader "Midnight Control"
      - cell "60"
    - row "Ember Aggro 60":
      - rowheader "Ember Aggro"
      - cell "60"
    - row "Tidecaller 62":
      - rowheader "Tidecaller"
      - cell "62"
    - row "Old Faithful 55":
      - rowheader "Old Faithful"
      - cell "55"`,
});
