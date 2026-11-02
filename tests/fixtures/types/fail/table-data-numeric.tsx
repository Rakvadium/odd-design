import { Table } from "../../../../src/react/table.tsx";

const rows = [{ id: "ember", name: "Ember Aggro", cards: 60 }];
const columns = [
  { key: "name", header: "Deck", cell: (deck: (typeof rows)[number]) => deck.name },
  { key: "cards", header: "Cards", cell: (deck: (typeof rows)[number]) => deck.cards },
] as const;

export const view = <Table data-numeric="" caption="Decks" rows={rows} rowKey={(deck) => deck.id} columns={columns} />;
