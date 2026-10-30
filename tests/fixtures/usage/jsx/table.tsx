// expect: ODD-STATIC-001 ODD-TABLE-001 ODD-TABLE-002 ODD-TABLE-002 ODD-TABLE-003 ODD-TABLE-004 ODD-TABLE-004 ODD-TABLE-005 ODD-TABLE-006
import { Table, TableSort, TableWrap, type TableSortProps } from "odd-design/react";
declare const props: TableSortProps;
export const view = (
  <>
    <TableWrap tabIndex={0} role="region" aria-labelledby="decks-caption"><Table><caption id="decks-caption">Your decks</caption><thead><tr><th scope="col" aria-sort="ascending"><TableSort>Deck</TableSort></th><th scope="col" data-numeric>Cards</th></tr></thead><tbody /></Table></TableWrap>
    <TableWrap><Table><tbody /></Table></TableWrap>
    <TableSort {...props} />
    <span className="odd-table-wrap" />
    <TableWrap tabIndex={0} />
    <TableWrap tabIndex={0} role="group" aria-label="Your decks" />
    <TableWrap tabIndex={0} role="region" />
    <Table data-numeric=""><tbody /></Table>
    <TableSort data-numeric="">Cards</TableSort>
    <TableSort aria-sort="ascending">Deck</TableSort>
    <Table><thead><tr><th scope="col"><input type="checkbox" data-select-all aria-label="Select all decks" /></th></tr></thead></Table>
    <Table><thead><tr><th scope="col"><input type="checkbox" data-select-all /></th></tr></thead></Table>
  </>
);
