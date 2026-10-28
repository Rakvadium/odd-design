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
                { of: "th", props: { scope: "row", style: { fontWeight: "600" } }, children: [{ of: "a", props: { href: "#" }, children: [name] }] },
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
