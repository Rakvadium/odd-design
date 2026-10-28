"use client";

import { createElement, useImperativeHandle, useLayoutEffect, useRef, type ReactElement } from "react";
import { enhanceToaster } from "../js/toast.ts";
import { WRAPPERS, type ToasterRule } from "../js/usage/contract.ts";
import { lower, type Contract, type Native } from "./part.ts";

interface ToasterContract extends Contract<"Toaster", ToasterRule> {
  /** enhanceToaster builds the list and the live region inside, and toast() fills them. */
  children?: never;
}

export interface ToasterProps extends ToasterContract, Native<"Toaster", keyof ToasterContract> {}

export function Toaster({ ref, ...props }: ToasterProps): ReactElement {
  const root = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  useLayoutEffect(() => enhanceToaster(root.current!), []);
  return createElement(WRAPPERS.Toaster.element, { ...lower("Toaster", props), ref: root });
}
