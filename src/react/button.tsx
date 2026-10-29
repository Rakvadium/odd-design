"use client";

import { createElement, type ComponentProps, type MouseEvent, type ReactElement } from "react";
import { WRAPPERS, type ButtonRule } from "../js/usage/contract.ts";
import { elementTag, lower, type Contract, type Message, type Values } from "./part.ts";

export type ButtonVariant = Values<ButtonRule, "data-variant">;
export type ButtonSize = Values<ButtonRule, "data-size">;
export type ButtonCommand = "show-modal" | "close" | "request-close" | "show-popover" | "hide-popover" | "toggle-popover" | `--${string}`;

interface SharedProps extends Contract<"Button", ButtonRule> {
  interestfor?: string;
  "aria-current"?: Values<ButtonRule, "aria-current">;
}

export interface LinkProps extends SharedProps, Omit<ComponentProps<"a">, keyof SharedProps | "aria-disabled"> {
  href: string;
  "aria-disabled"?: Message<"ODD-BUTTON-013">;
}

export interface NativeButtonProps extends SharedProps, Omit<ComponentProps<"button">, keyof SharedProps | "type"> {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  command?: ButtonCommand;
  commandfor?: string;
}

export type ButtonProps = LinkProps | NativeButtonProps;

type Named = { "aria-label": string } | { "aria-labelledby": string };

type NamedWhenIconOnly<P> = P extends { iconOnly: true } ? ([P] extends [Named] ? P : Message<"ODD-BUTTON-008">) : P;

type CurrentOnLink<P> = P extends { "aria-current": string; href?: undefined } ? Message<"ODD-BUTTON-012"> : P;

function swallow(event: MouseEvent): void {
  event.preventDefault();
}

export function Button<const P extends ButtonProps>(props: CurrentOnLink<NamedWhenIconOnly<P>> & ButtonProps): ReactElement;
export function Button(props: ButtonProps): ReactElement {
  const blocked = props["aria-disabled"] === true || props["aria-disabled"] === "true";
  const attributes = { ...props, onClick: blocked ? swallow : props.onClick };
  return createElement(elementTag(WRAPPERS.Button.element, attributes), lower("Button", attributes));
}
