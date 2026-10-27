import type { ReactElement } from "react";
import type { FieldControlRule, FieldErrorRule } from "../js/usage/contract.ts";
import { part, type Forbidden, type Native } from "./part.ts";

interface ControlContract extends Forbidden<FieldControlRule> {}

interface ErrorContract extends Forbidden<FieldErrorRule> {}

export interface FieldProps extends Native<"Field"> {}

export interface LabelProps extends Native<"Label", "htmlFor"> {
  htmlFor: string;
}

export interface InputProps extends ControlContract, Native<"Input", keyof ControlContract> {}

export interface TextareaProps extends ControlContract, Native<"Textarea", keyof ControlContract> {}

export interface SelectProps extends ControlContract, Native<"Select", keyof ControlContract> {}

export interface HintProps extends Native<"Hint", "id"> {
  id: string;
}

export interface FieldErrorProps extends ErrorContract, Native<"FieldError", "id" | keyof ErrorContract> {
  id: string;
}

export const Field: (props: FieldProps) => ReactElement = part("Field", "div", "odd-field");
export const Label: (props: LabelProps) => ReactElement = part("Label", "label", "odd-label");
export const Input: (props: InputProps) => ReactElement = part("Input", "input", "odd-input");
export const Textarea: (props: TextareaProps) => ReactElement = part("Textarea", "textarea", "odd-textarea");
export const Select: (props: SelectProps) => ReactElement = part("Select", "select", "odd-select");
export const Hint: (props: HintProps) => ReactElement = part("Hint", "p", "odd-hint");
export const FieldError: (props: FieldErrorProps) => ReactElement = part("FieldError", "p", "odd-error");
