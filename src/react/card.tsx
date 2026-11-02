import { createElement, type ReactElement } from "react";
import type { CardFooterRule, CardLinkRule, CardRule } from "../js/usage/contract.ts";
import { Anchor } from "./context.ts";
import { lower, part, type Contract, type Native } from "./part.ts";

interface CardContract extends Contract<"Card", CardRule> {}

export interface CardProps extends CardContract, Native<"Card", keyof CardContract> {}

interface CardLinkContract extends Contract<"CardLink", CardLinkRule> {}

export interface CardLinkProps extends CardLinkContract, Native<"CardLink", keyof CardLinkContract> {}

interface CardFooterContract extends Contract<"CardFooter", CardFooterRule> {}

export interface CardFooterProps extends CardFooterContract, Native<"CardFooter", keyof CardFooterContract> {}

export const Card: (props: CardProps) => ReactElement = part("Card");
/** a.odd-card-link through the router link from OddProvider. */
export function CardLink(props: CardLinkProps): ReactElement {
  return createElement(Anchor, { ...lower("CardLink", { ...props }), href: props.href });
}
export const CardFooter: (props: CardFooterProps) => ReactElement = part("CardFooter");
