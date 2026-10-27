import type { ReactElement } from "react";
import type { FieldControlRule, FieldErrorRule } from "../js/usage/contract.ts";
import { part, type Contract, type Native } from "./part.ts";

interface InputContract extends Contract<"Input", FieldControlRule> {}

interface TextareaContract extends Contract<"Textarea", FieldControlRule> {}

interface SelectContract extends Contract<"Select", FieldControlRule> {}

interface ErrorContract extends Contract<"FieldError", FieldErrorRule> {}

export interface FieldProps extends Native<"Field"> {}

export interface LabelProps extends Native<"Label", "htmlFor"> {
  htmlFor: string;
}

export interface InputProps extends InputContract, Native<"Input", keyof InputContract> {}

export interface TextareaProps extends TextareaContract, Native<"Textarea", keyof TextareaContract> {}

export interface SelectProps extends SelectContract, Native<"Select", keyof SelectContract> {}

export interface HintProps extends Native<"Hint", "id"> {
  id: string;
}

export interface FieldErrorProps extends ErrorContract, Native<"FieldError", "id" | keyof ErrorContract> {
  id: string;
}

export const Field: (props: FieldProps) => ReactElement = part("Field");
export const Label: (props: LabelProps) => ReactElement = part("Label");
export const Input: (props: InputProps) => ReactElement = part("Input");
export const Textarea: (props: TextareaProps) => ReactElement = part("Textarea");
export const Select: (props: SelectProps) => ReactElement = part("Select");
export const Hint: (props: HintProps) => ReactElement = part("Hint");
export const FieldError: (props: FieldErrorProps) => ReactElement = part("FieldError");
