import type { ReactElement } from "react";
import type { ChoiceRule, SwitchRule } from "../js/usage/contract.ts";
import { part, type Contract, type Native } from "./part.ts";

interface ChoiceContract extends Contract<"Choice", ChoiceRule> {}

interface SwitchContract extends Contract<"Switch", SwitchRule> {}

interface SegmentedContract extends Contract<"Segmented", ChoiceRule> {}

export interface ChoiceProps extends ChoiceContract, Native<"Choice", keyof ChoiceContract> {}

export interface SwitchProps extends SwitchContract, Native<"Switch", keyof SwitchContract> {}

export interface SegmentedProps extends SegmentedContract, Native<"Segmented", keyof SegmentedContract> {}

export const Choice: (props: ChoiceProps) => ReactElement = part("Choice");
export const Switch: (props: SwitchProps) => ReactElement = part("Switch");
export const Segmented: (props: SegmentedProps) => ReactElement = part("Segmented");
