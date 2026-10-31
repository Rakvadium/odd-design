"use client";

import { createElement, useImperativeHandle, useLayoutEffect, useRef, type ReactElement } from "react";
import { enhanceCombobox } from "../js/combobox.ts";
import { WRAPPERS, type ComboboxListRule, type ComboboxOptionRule, type ComboboxRule } from "../js/usage/contract.ts";
import { lower, part, type Contract, type Named, type Native, type Values } from "./part.ts";

interface ComboboxContract extends Contract<"Combobox", ComboboxRule> {}

export interface ComboboxProps extends ComboboxContract, Native<"Combobox", keyof ComboboxContract> {}

interface ComboboxListContract extends Contract<"ComboboxList", ComboboxListRule> {
  /** "manual" when your code filters the options. Omit it for the built-in prefix filter. */
  "data-filter"?: Values<ComboboxListRule, "data-filter">;
}

interface ComboboxListBase extends ComboboxListContract, Native<"ComboboxList", keyof ComboboxListContract> {}

export type ComboboxListProps = ComboboxListBase & Named<ComboboxListRule>;

interface ComboboxOptionContract extends Contract<"ComboboxOption", ComboboxOptionRule> {}

export interface ComboboxOptionProps extends ComboboxOptionContract, Native<"ComboboxOption", keyof ComboboxOptionContract> {}

export function Combobox({ ref, ...props }: ComboboxProps): ReactElement {
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  useLayoutEffect(() => enhanceCombobox(root.current!), []);
  // No deps: React can rewrite aria-expanded on a render, so every commit writes open and the active option back.
  useLayoutEffect(() => enhanceCombobox(root.current!));
  return createElement(WRAPPERS.Combobox.element, { ...lower("Combobox", props), ref: root });
}

export const ComboboxList: (props: ComboboxListProps) => ReactElement = part("ComboboxList");

export const ComboboxOption: (props: ComboboxOptionProps) => ReactElement = part("ComboboxOption");
