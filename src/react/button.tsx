"use client";

import { createElement, type ComponentProps, type MouseEvent, type ReactElement } from "react";
import type { APPEARANCE_AXES, ATTRIBUTES, ButtonRule, HEADLESS_ALLOWLIST, VOCABULARY } from "../js/usage/contract.ts";
import type { MESSAGES } from "../js/usage/format.ts";

type Message<Code extends keyof typeof MESSAGES> = (typeof MESSAGES)[Code];

type EnumValues<Attribute extends string> = Extract<ButtonRule, { kind: "enum"; attribute: Attribute }>["values"][number];

export type ButtonVariant = EnumValues<"data-variant">;
export type ButtonSize = EnumValues<"data-size">;
export type ButtonCommand = "show-modal" | "close" | "request-close" | "show-popover" | "hide-popover" | "toggle-popover" | `--${string}`;

type ButtonAttribute = (typeof ATTRIBUTES.button)[number];

type OtherSystemData = Exclude<
  (typeof VOCABULARY)[keyof typeof VOCABULARY][number],
  ButtonAttribute | (typeof HEADLESS_ALLOWLIST)[number] | (typeof APPEARANCE_AXES)[number]
>;

type ReservedData = { [Name in ButtonAttribute]?: never } & { [Name in OtherSystemData]?: Message<"ODD-BUTTON-015"> };

interface SharedProps extends ReservedData {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  disabled?: Message<"ODD-BUTTON-007">;
  interestfor?: string;
  "aria-current"?: EnumValues<"aria-current">;
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
  const { variant, size, iconOnly, className, onClick, ...attributes } = props;
  const look = {
    className: className ? `odd-button ${className}` : "odd-button",
    "data-variant": variant,
    "data-size": size,
    "data-icon-only": iconOnly === true ? "" : undefined,
    onClick: blocked ? swallow : onClick,
  };
  if (attributes.href === undefined) return createElement("button", { ...attributes, type: attributes.type ?? "button", ...look });
  return createElement("a", { ...attributes, ...look });
}
