"use client";

import { createElement, useImperativeHandle, useLayoutEffect, useRef, type ReactElement } from "react";
import { enhanceTabs, typeTabs } from "../js/tabs.ts";
import { WRAPPERS, type TabsRule } from "../js/usage/contract.ts";
import { lower, type Contract, type Native } from "./part.ts";

interface TabsContract extends Contract<"Tabs", TabsRule> {
  /** The tab with aria-selected="true" is chosen first, and enhanceTabs owns the choice after that. */
  defaultValue?: never;
}

export interface TabsProps extends TabsContract, Native<"Tabs", keyof TabsContract> {}

export function Tabs({ ref, ...props }: TabsProps): ReactElement {
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  useLayoutEffect(() => enhanceTabs(root.current!), []);
  useLayoutEffect(() => typeTabs(root.current!));
  return createElement(WRAPPERS.Tabs.element, { ...lower("Tabs", props), ref: root });
}
