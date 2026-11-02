import type { ReactElement } from "react";
import type { CodeRule } from "../js/usage/contract.ts";
import { part, type Contract, type Native } from "./part.ts";

interface CodeContract extends Contract<"Code", CodeRule> {}

export interface CodeProps extends CodeContract, Native<"Code", keyof CodeContract> {}

export const Code: (props: CodeProps) => ReactElement = part("Code");

interface PreContract extends Contract<"Pre", CodeRule> {}

export interface PreProps extends PreContract, Native<"Pre", keyof PreContract> {}

export const Pre: (props: PreProps) => ReactElement = part("Pre");
