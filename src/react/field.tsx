import { createElement, type ComponentProps, type ReactElement } from "react";
import type { FieldControlRule, FieldErrorRule, WRAPPERS } from "../js/usage/contract.ts";
import type { MESSAGES } from "../js/usage/format.ts";

type Message<Code extends keyof typeof MESSAGES> = (typeof MESSAGES)[Code];

type Forbidden<Rule> = {
  [R in Rule as R extends { kind: "forbidden-attribute"; attribute: infer Name extends string } ? Name : never]?: R extends {
    code: infer Code extends keyof typeof MESSAGES;
  }
    ? Message<Code>
    : never;
};

type Part = "Field" | "Label" | "Input" | "Textarea" | "Select" | "Hint" | "FieldError";

type Tag<Name extends Part> = (typeof WRAPPERS)[Name]["element"];

type Native<Name extends Part, Replaced extends PropertyKey = never> = Omit<ComponentProps<Tag<Name>>, Replaced>;

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

function part<Name extends Part>(name: Name, tag: Tag<Name>, base: (typeof WRAPPERS)[Name]["className"]) {
  function render(props: { className?: string | undefined }): ReactElement {
    const { className, ...attributes } = props;
    return createElement(tag, { ...attributes, className: className ? `${base} ${className}` : base });
  }
  return Object.assign(render, { displayName: name });
}

export const Field: (props: FieldProps) => ReactElement = part("Field", "div", "odd-field");
export const Label: (props: LabelProps) => ReactElement = part("Label", "label", "odd-label");
export const Input: (props: InputProps) => ReactElement = part("Input", "input", "odd-input");
export const Textarea: (props: TextareaProps) => ReactElement = part("Textarea", "textarea", "odd-textarea");
export const Select: (props: SelectProps) => ReactElement = part("Select", "select", "odd-select");
export const Hint: (props: HintProps) => ReactElement = part("Hint", "p", "odd-hint");
export const FieldError: (props: FieldErrorProps) => ReactElement = part("FieldError", "p", "odd-error");
