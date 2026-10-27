import { createElement, type ComponentProps, type ReactElement } from "react";
import type { WRAPPERS } from "../js/usage/contract.ts";
import type { MESSAGES } from "../js/usage/format.ts";

export type Message<Code extends keyof typeof MESSAGES> = (typeof MESSAGES)[Code];

export type Forbidden<Rule> = {
  [R in Rule as R extends { kind: "forbidden-attribute"; attribute: infer Name extends string } ? Name : never]?: R extends {
    code: infer Code extends keyof typeof MESSAGES;
  }
    ? Message<Code>
    : never;
};

export type Pinned<Rule> = {
  [R in Rule as R extends { kind: "required-attribute"; attribute: infer Name extends string } ? Name : never]: R extends {
    attribute: infer Name extends string;
  }
    ? Extract<Rule, { kind: "enum"; attribute: Name }> extends { values: readonly (infer Value)[] }
      ? Value
      : never
    : never;
};

type FixedTagWrapper<Name extends keyof typeof WRAPPERS> = (typeof WRAPPERS)[Name]["element"] extends string ? Name : never;

export type Part = { [Name in keyof typeof WRAPPERS]: FixedTagWrapper<Name> }[keyof typeof WRAPPERS];

type Tag<Name extends Part> = (typeof WRAPPERS)[Name]["element"];

export type Native<Name extends Part, Replaced extends PropertyKey = never> = Omit<ComponentProps<Tag<Name>>, Replaced>;

export function part<Name extends Part>(name: Name, tag: Tag<Name>, base: (typeof WRAPPERS)[Name]["className"]) {
  function render(props: { className?: string | undefined }): ReactElement {
    const { className, ...attributes } = props;
    return createElement(tag, { ...attributes, className: className ? `${base} ${className}` : base });
  }
  return Object.assign(render, { displayName: name });
}
