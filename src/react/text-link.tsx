import type { ReactElement } from "react";
import type { LinkRule } from "../js/usage/contract.ts";
import { part, type Contract, type Native, type Values } from "./part.ts";

interface TextLinkContract extends Contract<"TextLink", LinkRule> {
  "aria-current"?: Values<LinkRule, "aria-current">;
}

export interface TextLinkProps extends TextLinkContract, Native<"TextLink", keyof TextLinkContract> {}

export const TextLink: (props: TextLinkProps) => ReactElement = part("TextLink");
