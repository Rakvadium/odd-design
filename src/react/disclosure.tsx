import type { ReactElement } from "react";
import type { DisclosureRule } from "../js/usage/contract.ts";
import { part, type Contract, type Native } from "./part.ts";

interface DisclosureContract extends Contract<"Disclosure", DisclosureRule> {}

export interface DisclosureProps extends DisclosureContract, Native<"Disclosure", keyof DisclosureContract> {}

export const Disclosure: (props: DisclosureProps) => ReactElement = part("Disclosure");
