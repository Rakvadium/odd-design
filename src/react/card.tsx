import type { ReactElement } from "react";
import type { CardFooterRule, CardLinkRule, CardRule } from "../js/usage/contract.ts";
import { part, type Contract, type Native } from "./part.ts";

interface CardContract extends Contract<"Card", CardRule> {}

export interface CardProps extends CardContract, Native<"Card", keyof CardContract> {}

interface CardLinkContract extends Contract<"CardLink", CardLinkRule> {}

export interface CardLinkProps extends CardLinkContract, Native<"CardLink", keyof CardLinkContract> {}

interface CardFooterContract extends Contract<"CardFooter", CardFooterRule> {}

export interface CardFooterProps extends CardFooterContract, Native<"CardFooter", keyof CardFooterContract> {}

export const Card: (props: CardProps) => ReactElement = part("Card");
export const CardLink: (props: CardLinkProps) => ReactElement = part("CardLink");
export const CardFooter: (props: CardFooterProps) => ReactElement = part("CardFooter");
