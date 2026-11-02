import { mirrored, type Node } from "../mirror.ts";

const meta = {
  title: "Components/Data Display",
  parameters: {
    docs: {
      description: {
        component:
          "`TableWrap` from `odd-design/react` renders the scroll region, `Table` renders `table.odd-table` and runs `enhanceSelectAll` on it after every commit, and `TableSort` renders each sort button. The caption, sections, rows, cells, and checkboxes stay plain elements. Checking a row's checkbox tints the row, and the header checkbox selects every row and shows a mixed state. The sorted column's `th` carries `aria-sort`; the page does the sorting.",
      },
    },
  },
};

export default meta;

type Tone = "success" | "warning" | "danger";

const decks: readonly (readonly [string, string, number, number, Tone, string])[] = [
  ["Midnight Control", "Extended", 60, 14, "success", "Legal"],
  ["Ember Aggro", "Standard", 60, 9, "warning", "Rotating"],
  ["Tidecaller", "Standard", 62, 21, "success", "Legal"],
  ["Old Faithful", "Retro", 55, 3, "danger", "Banned card"],
];

const sortable = (label: string, attributes: Readonly<Record<string, string>> = {}): Node<"th"> => ({ of: "th", props: { scope: "col", ...attributes }, children: [{ of: "TableSort", children: [label] }] });

export const Table = mirrored({
  scene: () => ({
    of: "TableWrap",
    props: { tabIndex: 0, role: "region", "aria-labelledby": "decks-caption", style: { maxInlineSize: "48rem" } },
    children: [
      {
        of: "Table",
        children: [
          { of: "caption", props: { id: "decks-caption" }, children: ["Your decks, sorted by name"] },
          {
            of: "thead",
            children: [
              {
                of: "tr",
                children: [
                  { of: "th", props: { scope: "col" }, children: [{ of: "input", props: { type: "checkbox", "data-select-all": "", "aria-label": "Select all decks" } }] },
                  sortable("Deck", { "aria-sort": "ascending" }),
                  sortable("Format"),
                  sortable("Cards", { "data-numeric": "" }),
                  { of: "th", props: { scope: "col", "data-numeric": "" }, children: ["Versions"] },
                  { of: "th", props: { scope: "col" }, children: ["Status"] },
                ],
              },
            ],
          },
          {
            of: "tbody",
            children: decks.map(([name, format, cards, versions, tone, status], i) => ({
              of: "tr",
              children: [
                { of: "td", children: [{ of: "input", props: { type: "checkbox", "aria-label": `Select ${name}`, defaultChecked: i === 1 } }] },
                { of: "th", props: { scope: "row", style: { fontWeight: "var(--weight-semibold)" } }, children: [{ of: "a", props: { href: "#" }, children: [name] }] },
                { of: "td", children: [format] },
                { of: "td", props: { "data-numeric": "" }, children: [String(cards)] },
                { of: "td", props: { "data-numeric": "" }, children: [String(versions)] },
                { of: "td", children: [{ of: "Badge", props: { tone }, children: [status] }] },
              ],
            })),
          },
          {
            of: "tfoot",
            children: [
              {
                of: "tr",
                children: [
                  { of: "td" },
                  { of: "th", props: { scope: "row" }, children: ["4 decks"] },
                  { of: "td" },
                  { of: "td", props: { "data-numeric": "" }, children: ["237"] },
                  { of: "td", props: { "data-numeric": "" }, children: ["47"] },
                  { of: "td" },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
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
    - rowgroup:
      - row "4 decks 237 47":
        - cell
        - rowheader "4 decks"
        - cell
        - cell "237"
        - cell "47"
        - cell`,
});

const NUMERIC: Readonly<Record<string, string>> = { "data-numeric": "" };

const SELECT_ALL: Readonly<Record<string, string>> = { "data-select-all": "" };

const byName = [...decks].sort(([a], [b]) => a.localeCompare(b));
const byCards = [...decks].sort(([, , a], [, , b]) => b - a);

const head = (...cells: readonly Node<"th">[]): Node<"thead"> => ({ of: "thead", children: [{ of: "tr", children: cells }] });

const column = (label: string, attributes: Readonly<Record<string, string>> = {}): Node<"th"> => ({ of: "th", props: { scope: "col", ...attributes }, children: [label] });

const deckCell = (name: string): Node<"th"> => ({ of: "th", props: { scope: "row" }, children: [name] });

const numeric = (value: number): Node<"td"> => ({ of: "td", props: { ...NUMERIC }, children: [String(value)] });

const framed = (caption: string, sections: readonly (Node<"thead"> | Node<"tbody"> | Node<"tfoot">)[]): Node<"TableWrap"> => ({
  of: "TableWrap",
  children: [{ of: "Table", children: [{ of: "caption", children: [caption] }, ...sections] }],
});

type Sort = "ascending" | "descending" | "none";

const sortedBy = (caption: string, by: "Deck" | "Cards", sort: Sort, rows: typeof decks): Node<"TableWrap"> =>
  framed(caption, [
    head(sortable("Deck", by === "Deck" ? { "aria-sort": sort } : {}), sortable("Cards", { ...NUMERIC, ...(by === "Cards" ? { "aria-sort": sort } : {}) })),
    { of: "tbody", children: rows.map(([name, , cards]) => ({ of: "tr", children: [deckCell(name), numeric(cards)] })) },
  ]);

export const TableParts = mirrored({
  scene: () => ({
    of: "div",
    props: { className: "odd-stack", style: { "--gap": "var(--space-6)", maxInlineSize: "32rem" } },
    children: [
      framed("Plain", [head(column("Deck"), column("Format")), { of: "tbody", children: decks.map(([name, format]) => ({ of: "tr", children: [deckCell(name), { of: "td", children: [format] }] })) }]),
      framed("Numeric columns", [
        head(column("Deck"), column("Cards", NUMERIC), column("Versions", NUMERIC)),
        { of: "tbody", children: decks.map(([name, , cards, versions]) => ({ of: "tr", children: [deckCell(name), numeric(cards), numeric(versions)] })) },
        { of: "tfoot", children: [{ of: "tr", children: [deckCell("4 decks"), numeric(237), numeric(47)] }] },
      ]),
      sortedBy("Sorted by deck, A to Z", "Deck", "ascending", byName),
      sortedBy("Sorted by cards, most first", "Cards", "descending", byCards),
      sortedBy("Not sorted", "Deck", "none", decks),
    ],
  }),
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
      - cell "55"`,
});

const selectable = (caption: string, checked: readonly boolean[]): Node<"TableWrap"> =>
  framed(caption, [
    head({ of: "th", props: { scope: "col" }, children: [{ of: "input", props: { type: "checkbox", ...SELECT_ALL, "aria-label": "Select all decks" } }] }, column("Deck"), column("Format")),
    {
      of: "tbody",
      children: decks.slice(0, checked.length).map(([name, format], i) => ({
        of: "tr",
        children: [{ of: "td", children: [{ of: "input", props: { type: "checkbox", "aria-label": `Select ${name}`, defaultChecked: checked[i] } }] }, deckCell(name), { of: "td", children: [format] }],
      })),
    },
  ]);

export const TableStates = mirrored({
  scene: () => ({
    of: "div",
    props: { className: "odd-stack", style: { "--gap": "var(--space-6)", maxInlineSize: "32rem" } },
    children: [selectable("No rows selected", [false, false, false]), selectable("Some rows selected", [false, true, false]), selectable("All rows selected", [true, true, true])],
  }),
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
      - cell "Standard"`,
});

export const TableOverflow = mirrored({
  scene: () => ({
    of: "div",
    props: { className: "odd-row", style: { "--gap": "var(--space-6)", alignItems: "start" } },
    children: [
      {
        of: "TableWrap",
        props: { tabIndex: 0, role: "region", "aria-labelledby": "wide-caption", style: { inlineSize: "20rem" } },
        children: [
          {
            of: "Table",
            children: [
              { of: "caption", props: { id: "wide-caption" }, children: ["Every column, scrolls sideways"] },
              head(column("Deck"), column("Format"), column("Cards", NUMERIC), column("Versions", NUMERIC), column("Status")),
              {
                of: "tbody",
                children: decks.map(([name, format, cards, versions, tone, status]) => ({
                  of: "tr",
                  children: [deckCell(name), { of: "td", children: [format] }, numeric(cards), numeric(versions), { of: "td", children: [{ of: "Badge", props: { tone }, children: [status] }] }],
                })),
              },
            ],
          },
        ],
      },
      {
        of: "TableWrap",
        props: { style: { inlineSize: "20rem" } },
        children: [
          {
            of: "Table",
            children: [
              { of: "caption", children: ["Two columns, fits"] },
              head(column("Deck"), column("Cards", NUMERIC)),
              { of: "tbody", children: decks.map(([name, , cards]) => ({ of: "tr", children: [deckCell(name), numeric(cards)] })) },
            ],
          },
        ],
      },
    ],
  }),
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
