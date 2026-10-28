"use client";

import { createElement, useImperativeHandle, useLayoutEffect, useRef, type ReactElement } from "react";
import { enhanceSelectAll } from "../js/enhance.ts";
import { WRAPPERS, type TableRule, type TableSortRule, type TableWrapRule } from "../js/usage/contract.ts";
import { lower, part, type Contract, type Native, type RoleWithName, type Values } from "./part.ts";

interface TableWrapContract extends Contract<"TableWrap", TableWrapRule> {
  role?: Values<TableWrapRule, "role">;
}

export interface TableWrapProps extends TableWrapContract, Native<"TableWrap", keyof TableWrapContract> {}

interface TableContract extends Contract<"Table", TableRule> {}

export interface TableProps extends TableContract, Native<"Table", keyof TableContract> {}

interface TableSortContract extends Contract<"TableSort", TableSortRule> {}

export interface TableSortProps extends TableSortContract, Native<"TableSort", keyof TableSortContract> {}

export const TableWrap: <const P extends TableWrapProps>(props: RoleWithName<P, TableWrapRule> & TableWrapProps) => ReactElement = part("TableWrap");

export function Table({ ref, ...props }: TableProps): ReactElement {
  const root = useRef<HTMLTableElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  // No deps: rows React adds, removes, or sets checked fire no change event, so the header resyncs on every commit.
  useLayoutEffect(() => enhanceSelectAll(root.current!));
  return createElement(WRAPPERS.Table.element, { ...lower("Table", props), ref: root });
}

export const TableSort: (props: TableSortProps) => ReactElement = part("TableSort");
