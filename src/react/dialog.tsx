import type { ReactElement } from "react";
import type { DialogPartRule, DialogRule } from "../js/usage/contract.ts";
import { part, type Contract, type Native, type Values } from "./part.ts";

type Names = Extract<DialogRule, { kind: "accessible-name" }>["names"][number];

type Named = { [Name in Names]: { [Key in Name]: string } }[Names];

type Conflict = Extract<DialogRule, { kind: "forbidden-value" }>;

type When = Conflict["when"];

type Exclusive = { [Key in Conflict["attribute"]]?: Values<DialogRule, Conflict["attribute"]> } & (
  | ({ [Key in When["attribute"]]: When["value"] } & { [Key in Conflict["attribute"]]?: Exclude<Values<DialogRule, Conflict["attribute"]>, Conflict["value"]> })
  | { [Key in When["attribute"]]?: Exclude<Values<DialogRule, When["attribute"]>, When["value"]> }
);

interface DialogContract extends Contract<"Dialog", DialogRule> {}

export type DialogProps = DialogContract & Native<"Dialog", keyof DialogContract | keyof Exclusive> & Named & Exclusive;

interface DialogActionsContract extends Contract<"DialogActions", DialogPartRule> {}

export interface DialogActionsProps extends DialogActionsContract, Native<"DialogActions", keyof DialogActionsContract> {}

export const Dialog: (props: DialogProps) => ReactElement = part("Dialog");
export const DialogActions: (props: DialogActionsProps) => ReactElement = part("DialogActions");
