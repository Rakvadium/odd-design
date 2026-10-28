import { createElement, type ComponentProps, type ReactElement } from "react";
import { WRAPPERS, type APPEARANCE_AXES, type HEADLESS_ALLOWLIST, type VOCABULARY, type Wrapper } from "../js/usage/contract.ts";
import type { MESSAGES } from "../js/usage/format.ts";

type Name = keyof typeof WRAPPERS;

type Lowered<N extends Name> = (typeof WRAPPERS)[N]["props"];

type Own<N extends Name> = Lowered<N>[keyof Lowered<N>];

export type Message<Code extends keyof typeof MESSAGES> = (typeof MESSAGES)[Code];

export type Values<Rule, Attribute> = Extract<Rule, { kind: "enum"; attribute: Attribute; values: readonly string[] }>["values"][number];

type DataProps<N extends Name, Rule> = {
  -readonly [Prop in keyof Lowered<N>]?: [Extract<Rule, { kind: "boolean-attribute"; attribute: Lowered<N>[Prop] }>] extends [never]
    ? Values<Rule, Lowered<N>[Prop]>
    : boolean;
};

type RawData<N extends Name> = { [Attribute in Own<N> & string]?: never };

type SystemData = Exclude<(typeof VOCABULARY)[keyof typeof VOCABULARY][number], (typeof HEADLESS_ALLOWLIST)[number] | (typeof APPEARANCE_AXES)[number]>;

type ForeignData<N extends Name, Rule> = [Extract<Rule, { kind: "system-data" }>] extends [never]
  ? {}
  : Extract<Rule, { kind: "system-data" }> extends { code: infer Code extends keyof typeof MESSAGES }
    ? { [Attribute in Exclude<SystemData, Own<N> | Extract<Rule, { kind: "system-data"; allow: readonly string[] }>["allow"][number]>]?: Message<Code> }
    : never;

type Forbidden<N extends Name, Rule> = {
  [R in Rule as R extends
    | { kind: "forbidden-attribute"; attribute: infer A extends string }
    | { kind: "forbidden-on-element"; element: (typeof WRAPPERS)[N]["element"]; attribute: infer A extends string }
    ? A
    : never]?: R extends {
    code: infer Code extends keyof typeof MESSAGES;
  }
    ? Message<Code>
    : never;
};

type Pinned<N extends Name, Rule> = {
  [R in Rule as R extends { kind: "required-attribute"; element: (typeof WRAPPERS)[N]["element"]; attribute: infer A extends string } ? A : never]: R extends {
    attribute: infer A extends string;
  }
    ? [Values<Rule, A>] extends [never]
      ? string
      : Values<Rule, A>
    : never;
};

type NameKeys<Rule, Kind> = Extract<Rule, { kind: Kind; names: readonly string[] }>["names"][number];

export type Named<Rule> = { [Each in NameKeys<Rule, "accessible-name">]: { [Key in Each]: string } }[NameKeys<Rule, "accessible-name">];

export type Exclusive<Rule> =
  Extract<Rule, { kind: "forbidden-value" }> extends {
    attribute: infer A extends string;
    value: infer V;
    when: { attribute: infer W extends string; value: infer X };
  }
    ? { [Key in A]?: Values<Rule, A> } & (
        | ({ [Key in W]: X } & { [Key in A]?: Exclude<Values<Rule, A>, V> })
        | { [Key in W]?: Exclude<Values<Rule, W>, X> }
      )
    : {};

type Given<Keys extends string> = { [Each in Keys]: { [Key in Each]: NonNullable<unknown> } }[Keys];

type CodeOf<Rule, Kind> = Extract<Rule, { kind: Kind; code: keyof typeof MESSAGES }>["code"];

export type RoleWithName<P, Rule> = P extends { role: Values<Rule, "role"> }
  ? [P] extends [Given<NameKeys<Rule, "accessible-name">>]
    ? P
    : Message<CodeOf<Rule, "accessible-name">>
  : P extends Given<NameKeys<Rule, "name-requires">>
    ? Message<CodeOf<Rule, "name-requires">>
    : P;

export type Contract<N extends Name, Rule> = DataProps<N, Rule> & RawData<N> & ForeignData<N, Rule> & Forbidden<N, Rule> & Pinned<N, Rule>;

type Part = { [N in Name]: (typeof WRAPPERS)[N]["element"] extends string ? N : never }[Name];

type Tag<N extends Part> = (typeof WRAPPERS)[N]["element"];

export type Native<N extends Part, Replaced extends PropertyKey = never> = Omit<ComponentProps<Tag<N>>, Replaced>;

export function lower(name: Name, props: Record<string, unknown>): Record<string, unknown> {
  const wrapper: Wrapper = WRAPPERS[name];
  const { className, ...attributes } = props;
  const data: Record<string, unknown> = {};
  for (const [prop, attribute] of Object.entries(wrapper.props)) {
    const value = attributes[prop];
    data[attribute] = value === true ? "" : value === false ? undefined : value;
    delete attributes[prop];
  }
  return { ...attributes, className: className ? `${wrapper.className} ${className}` : wrapper.className, ...data };
}

export function part<N extends Part>(name: N) {
  const tag: string = WRAPPERS[name].element;
  function render(props: { className?: string | undefined }): ReactElement {
    return createElement(tag, lower(name, props));
  }
  return Object.assign(render, { displayName: name });
}
