import type { ReactElement } from "react";
import type { PopoverRule } from "../js/usage/contract.ts";
import { part, type Contract, type Message, type Native, type Values } from "./part.ts";

interface PopoverContract extends Contract<"Popover", PopoverRule> {
  role?: Values<PopoverRule, "role">;
}

export interface PopoverProps extends PopoverContract, Native<"Popover", keyof PopoverContract> {}

type Names = Extract<PopoverRule, { kind: "name-requires" }>["names"][number];

type Named = { [Name in Names]: { [Key in Name]: string } }[Names];

type RoleWithName<P> = P extends { role: Values<PopoverRule, "role"> }
  ? [P] extends [Named]
    ? P
    : Message<"ODD-POPOVER-004">
  : P extends Named
    ? Message<"ODD-POPOVER-005">
    : P;

export const Popover: <const P extends PopoverProps>(props: RoleWithName<P> & PopoverProps) => ReactElement = part("Popover");
