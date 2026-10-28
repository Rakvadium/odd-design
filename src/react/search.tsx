import type { ReactElement } from "react";
import type { SearchRule } from "../js/usage/contract.ts";
import { part, type Contract, type Native } from "./part.ts";

interface SearchContract extends Contract<"Search", SearchRule> {}

export interface SearchProps extends SearchContract, Native<"Search", keyof SearchContract> {}

export const Search: (props: SearchProps) => ReactElement = part("Search");
