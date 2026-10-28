"use client";

import { createElement, useImperativeHandle, useLayoutEffect, useRef, type ReactElement } from "react";
import { enhanceMenu } from "../js/menu.ts";
import { WRAPPERS, type MenuItemRule, type MenuRule } from "../js/usage/contract.ts";
import { lower, part, type Contract, type Named, type Native } from "./part.ts";

interface MenuContract extends Contract<"Menu", MenuRule> {}

interface MenuBase extends MenuContract, Native<"Menu", keyof MenuContract> {}

export type MenuProps = MenuBase & Named<MenuRule>;

interface MenuItemContract extends Contract<"MenuItem", MenuItemRule> {}

export interface MenuItemProps extends MenuItemContract, Native<"MenuItem", keyof MenuItemContract> {}

export function Menu({ ref, ...props }: MenuProps): ReactElement {
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  useLayoutEffect(() => enhanceMenu(root.current!), []);
  return createElement(WRAPPERS.Menu.element, { ...lower("Menu", props), ref: root });
}

export const MenuItem: (props: MenuItemProps) => ReactElement = part("MenuItem");
