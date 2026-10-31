import type { ReactElement } from "react";
import type { KbdRule } from "../js/usage/contract.ts";
import { part, type Contract, type Native } from "./part.ts";

interface KbdContract extends Contract<"Kbd", KbdRule> {}

export interface KbdProps extends KbdContract, Native<"Kbd", keyof KbdContract> {}

export const Kbd: (props: KbdProps) => ReactElement = part("Kbd");
