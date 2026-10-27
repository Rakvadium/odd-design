import type { ReactElement } from "react";
import type { ChoiceRule, SwitchRule } from "../js/usage/contract.ts";
import { part, type Forbidden, type Native, type Pinned } from "./part.ts";

interface ChoiceContract extends Forbidden<ChoiceRule> {}

interface SwitchContract extends Forbidden<SwitchRule>, Pinned<SwitchRule> {}

export interface ChoiceProps extends ChoiceContract, Native<"Choice", keyof ChoiceContract> {}

export interface SwitchProps extends SwitchContract, Native<"Switch", keyof SwitchContract> {}

export interface SegmentedProps extends ChoiceContract, Native<"Segmented", keyof ChoiceContract> {}

export const Choice: (props: ChoiceProps) => ReactElement = part("Choice", "label", "odd-choice");
export const Switch: (props: SwitchProps) => ReactElement = part("Switch", "input", "odd-switch");
export const Segmented: (props: SegmentedProps) => ReactElement = part("Segmented", "fieldset", "odd-segmented");
