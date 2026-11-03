"use client";

import { useImperativeHandle, useRef, type ChangeEvent, type ComponentPropsWithRef, type ReactElement, type ReactNode } from "react";
import { enhanceSelectAll } from "../js/enhance.ts";
import { cx, rejectBlank, useEnhancer, useOddId, type Passthrough, type Root } from "./own.ts";

/** table.css paints no separate "other" direction, so a sort is one of these two. */
export const SORT_DIRECTIONS = ["ascending", "descending"] as const;
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

/** One sort for the whole table, so only one column carries aria-sort. */
export type Sort<Key extends string> = { readonly column: Key; readonly direction: SortDirection };

export type Column<Row, Key extends string> = {
  readonly key: Key;
  readonly header: ReactNode;
  readonly cell: (row: Row) => ReactNode;
  /** data-numeric on the header and every cell of the column. */
  readonly numeric?: boolean;
  /** Each cell renders as th[scope=row]. One column names each row. */
  readonly rowHeader?: boolean;
  /** A tfoot cell. Any column with a footer adds the tfoot row. */
  readonly footer?: ReactNode;
};

export type Selection<Row> = {
  /** The keys of the selected rows, from rowKey. */
  readonly selected: ReadonlySet<string>;
  /** Called once per row that changes, with every selected key, including a row the select-all box changed. */
  readonly onChange: (selected: ReadonlySet<string>) => void;
  /** Each row checkbox's name. */
  readonly label: (row: Row) => string;
  /** The select-all box's name. */
  readonly allLabel: string;
  /** A disabled row cannot be selected, and select-all skips it. */
  readonly disabled?: (row: Row) => boolean;
};

export type TableProps<Row, Key extends string, SortKey extends Key> = Root &
  Passthrough<"table", never, "id"> & {
    /** Names the table and its scroll region. */
    readonly caption: string;
    readonly hideCaption?: boolean;
    readonly columns: readonly Column<Row, Key>[];
    readonly rows: readonly Row[];
    readonly rowKey: (row: Row) => string;
    /** The keys of the columns whose header is a sort button. */
    readonly sortable?: readonly SortKey[];
    readonly sort?: Sort<NoInfer<SortKey>>;
    /** The next sort when a sort button is pressed: the same column flips, another starts ascending. The app sorts rows. */
    readonly onSortChange?: (sort: Sort<SortKey>) => void;
    readonly selection?: Selection<Row>;
    /** A named scroll region keyboard users can reach. Set false for a table that can never overflow. Defaults to true. */
    readonly scrollable?: boolean;
    /** The base of the caption id. Generated when absent. */
    readonly id?: string;
  };

/**
 * div.odd-table-wrap, a named region when scrollable, around table.odd-table with its caption, thead, tbody,
 * and a tfoot when a column has a footer. enhanceSelectAll owns the select-all box and resyncs after every commit.
 */
export function Table<Row, const Key extends string, const SortKey extends Key = never>({
  caption,
  hideCaption,
  columns,
  rows,
  rowKey,
  sortable = [],
  sort,
  onSortChange,
  selection,
  scrollable = true,
  id,
  className,
  ref,
  ...rest
}: TableProps<Row, Key, SortKey>): ReactElement {
  const base = useOddId(id);
  const captionId = `${base}-caption`;
  const table = useRef<HTMLTableElement>(null);
  useImperativeHandle(ref, () => table.current!, []);
  useEnhancer(table, enhanceSelectAll);
  const toggle = (key: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const next = new Set(selection?.selected);
    if (event.target.checked) next.add(key);
    else next.delete(key);
    selection?.onChange(next);
  };
  const nextSort = (column: SortKey): Sort<SortKey> => ({ column, direction: sort?.column === column && sort.direction === "ascending" ? "descending" : "ascending" });
  const isSortable = (key: Key): key is SortKey => (sortable as readonly Key[]).includes(key);
  const footed = columns.some((column) => column.footer !== undefined);
  const region = scrollable ? { role: "region", tabIndex: 0, "aria-labelledby": captionId } : {};
  return (
    <div {...region} className={cx("odd-table-wrap", className)}>
      <table {...(rest as ComponentPropsWithRef<"table">)} ref={table} id={base} className="odd-table">
        <caption id={captionId} className={hideCaption ? "odd-visually-hidden" : undefined}>
          {rejectBlank(caption, "ODD-TABLE-003")}
        </caption>
        <thead>
          <tr>
            {selection ? (
              <th scope="col">
                <input type="checkbox" data-select-all="" aria-label={rejectBlank(selection.allLabel, "ODD-TABLE-006")} />
              </th>
            ) : null}
            {columns.map((column) => (
              <th key={column.key} scope="col" data-numeric={column.numeric ? "" : undefined} aria-sort={sort?.column === column.key ? sort.direction : undefined}>
                {isSortable(column.key) ? (
                  <button type="button" className="odd-table-sort" onClick={() => onSortChange?.(nextSort(column.key as SortKey))}>
                    {column.header}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = rowKey(row);
            return (
              <tr key={key}>
                {selection ? (
                  <td>
                    <input type="checkbox" aria-label={selection.label(row)} checked={selection.selected.has(key)} disabled={selection.disabled?.(row)} onChange={toggle(key)} />
                  </td>
                ) : null}
                {columns.map((column) =>
                  column.rowHeader ? (
                    <th key={column.key} scope="row" data-numeric={column.numeric ? "" : undefined}>
                      {column.cell(row)}
                    </th>
                  ) : (
                    <td key={column.key} data-numeric={column.numeric ? "" : undefined}>
                      {column.cell(row)}
                    </td>
                  ),
                )}
              </tr>
            );
          })}
        </tbody>
        {footed ? (
          <tfoot>
            <tr>
              {selection ? <td /> : null}
              {columns.map((column) =>
                column.rowHeader && column.footer !== undefined ? (
                  <th key={column.key} scope="row">
                    {column.footer}
                  </th>
                ) : (
                  <td key={column.key} data-numeric={column.numeric ? "" : undefined}>
                    {column.footer}
                  </td>
                ),
              )}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
