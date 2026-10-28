import type { ReactElement } from "react";
import type { SheetPartRule, SheetRule } from "../js/usage/contract.ts";
import { part, type Contract, type Exclusive, type Named, type Native } from "./part.ts";

interface SheetContract extends Contract<"Sheet", SheetRule> {}

export type SheetProps = SheetContract & Native<"Sheet", keyof SheetContract | keyof Exclusive<SheetRule>> & Named<SheetRule> & Exclusive<SheetRule>;

interface SheetHeaderContract extends Contract<"SheetHeader", SheetPartRule> {}

export interface SheetHeaderProps extends SheetHeaderContract, Native<"SheetHeader", keyof SheetHeaderContract> {}

interface SheetFooterContract extends Contract<"SheetFooter", SheetPartRule> {}

export interface SheetFooterProps extends SheetFooterContract, Native<"SheetFooter", keyof SheetFooterContract> {}

export const Sheet: (props: SheetProps) => ReactElement = part("Sheet");
export const SheetHeader: (props: SheetHeaderProps) => ReactElement = part("SheetHeader");
export const SheetFooter: (props: SheetFooterProps) => ReactElement = part("SheetFooter");
