import type { ReactElement } from "react";
import type { SpinnerRule } from "../js/usage/contract.ts";
import { part, type Contract, type Message, type Native } from "./part.ts";

interface SpinnerContract extends Contract<"Spinner", SpinnerRule> {
  /** A spinner turns and is hidden, so text inside it spins and is never read. Put the loading words on the region. */
  children?: Message<"ODD-SPINNER-002">;
}

export interface SpinnerProps extends SpinnerContract, Native<"Spinner", keyof SpinnerContract> {}

export const Spinner: (props: SpinnerProps) => ReactElement = part("Spinner");
