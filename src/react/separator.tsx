import type { ReactElement } from "react";
import type { SeparatorRule } from "../js/usage/contract.ts";
import { part, type Contract, type Native, type Values } from "./part.ts";

interface SeparatorContract extends Contract<"Separator", SeparatorRule> {
  "aria-orientation"?: Values<SeparatorRule, "aria-orientation">;
  role?: Values<SeparatorRule, "role">;
  /** hr is a void element, and React throws when it has children. Put a label beside the separator, not inside it. */
  children?: never;
}

export interface SeparatorProps extends SeparatorContract, Native<"Separator", keyof SeparatorContract> {}

export const Separator: (props: SeparatorProps) => ReactElement = part("Separator");
