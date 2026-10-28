import type { ReactElement } from "react";
import type { MeterRule } from "../js/usage/contract.ts";
import { part, type Contract, type Native, type Values } from "./part.ts";

export type MeterTone = Values<MeterRule, "data-tone">;

interface MeterContract extends Contract<"Meter", MeterRule> {}

interface ProgressContract extends Contract<"Progress", MeterRule> {}

export interface MeterProps extends MeterContract, Native<"Meter", keyof MeterContract> {}

export interface ProgressProps extends ProgressContract, Native<"Progress", keyof ProgressContract> {}

export const Meter: (props: MeterProps) => ReactElement = part("Meter");
export const Progress: (props: ProgressProps) => ReactElement = part("Progress");
