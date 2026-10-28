import type { ReactElement } from "react";
import type { DialogPartRule, DialogRule } from "../js/usage/contract.ts";
import { part, type Contract, type Exclusive, type Named, type Native } from "./part.ts";

interface DialogContract extends Contract<"Dialog", DialogRule> {}

export type DialogProps = DialogContract & Native<"Dialog", keyof DialogContract | keyof Exclusive<DialogRule>> & Named<DialogRule> & Exclusive<DialogRule>;

interface DialogActionsContract extends Contract<"DialogActions", DialogPartRule> {}

export interface DialogActionsProps extends DialogActionsContract, Native<"DialogActions", keyof DialogActionsContract> {}

export const Dialog: (props: DialogProps) => ReactElement = part("Dialog");
export const DialogActions: (props: DialogActionsProps) => ReactElement = part("DialogActions");
