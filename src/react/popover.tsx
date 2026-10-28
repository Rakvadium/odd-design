import type { ReactElement } from "react";
import type { PopoverRule } from "../js/usage/contract.ts";
import { part, type Contract, type Native, type RoleWithName, type Values } from "./part.ts";

interface PopoverContract extends Contract<"Popover", PopoverRule> {
  role?: Values<PopoverRule, "role">;
}

export interface PopoverProps extends PopoverContract, Native<"Popover", keyof PopoverContract> {}

export const Popover: <const P extends PopoverProps>(props: RoleWithName<P, PopoverRule> & PopoverProps) => ReactElement = part("Popover");
