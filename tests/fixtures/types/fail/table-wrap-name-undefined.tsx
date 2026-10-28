import { Table, TableWrap } from "../../../../src/react/table.tsx";

declare const label: string | undefined;

export const view = <TableWrap tabIndex={0} role="region" aria-label={label}><Table><tbody /></Table></TableWrap>;
