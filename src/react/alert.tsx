import type { ReactElement } from "react";
import type { AlertRule, AlertTitleRule } from "../js/usage/contract.ts";
import { part, type Contract, type Native, type Values } from "./part.ts";

export type AlertTone = Values<AlertRule, "data-tone">;

interface AlertContract extends Contract<"Alert", AlertRule> {}

export interface AlertProps extends AlertContract, Native<"Alert", keyof AlertContract> {}

interface AlertTitleContract extends Contract<"AlertTitle", AlertTitleRule> {}

export interface AlertTitleProps extends AlertTitleContract, Native<"AlertTitle", keyof AlertTitleContract> {}

export const Alert: (props: AlertProps) => ReactElement = part("Alert");
export const AlertTitle: (props: AlertTitleProps) => ReactElement = part("AlertTitle");
