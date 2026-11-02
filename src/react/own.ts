import { useEffect, useId, useLayoutEffect, type ComponentPropsWithRef, type JSX, type RefObject } from "react";
import type { APPEARANCE_AXES, HEADLESS_ALLOWLIST, VOCABULARY } from "../js/usage/contract.ts";
import { message, type MESSAGES, type UsageCode } from "../js/usage/format.ts";

/** A code's message as a string literal type, so a prop typed as one fails to compile with the fix as its text. */
export type Message<Code extends keyof typeof MESSAGES> = (typeof MESSAGES)[Code];

/** The values of an enum rule, so a prop's vocabulary stays the contract's. */
export type Values<Rule, Attribute> = Extract<Rule, { kind: "enum"; attribute: Attribute; values: readonly string[] }>["values"][number];

/** VOCABULARY tokens no component takes from a consumer: each one repaints some family. */
type SystemData = Exclude<(typeof VOCABULARY)[keyof typeof VOCABULARY][number], (typeof HEADLESS_ALLOWLIST)[number] | (typeof APPEARANCE_AXES)[number]>;

/** `role` and the attributes a component writes are ODD-REACT-001, and system data- attributes are ODD-REACT-002. */
export type Owned<Keys extends string> = { readonly [K in Keys | "role"]?: Message<"ODD-REACT-001"> } & { readonly [K in SystemData]?: Message<"ODD-REACT-002"> };

/**
 * The native props a component forwards to one element. OwnedKeys come back as ODD-REACT-001.
 * ReplacedKeys are props the component declares with its own meaning, such as Button's disabled.
 * className goes to the outermost element, and style is never taken.
 */
export type Passthrough<Tag extends keyof JSX.IntrinsicElements, OwnedKeys extends string = never, ReplacedKeys extends string = never> = Omit<
  ComponentPropsWithRef<Tag>,
  OwnedKeys | ReplacedKeys | "role" | "className" | "style" | "children" | "dangerouslySetInnerHTML" | SystemData
> &
  Owned<OwnedKeys>;

export type Root = { readonly className?: string };

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export function cx(own: string, extra?: string): string {
  return extra ? `${own} ${extra}` : own;
}

/** The base id every derived id hangs off. useId runs on every render, so the hook order never changes. */
export function useOddId(id?: string): string {
  const generated = useId();
  return id ?? generated;
}

/** `${base}-${part}` for each part. Item ids use an index, never a value, so no value makes an invalid id. */
export function idsOf<const Parts extends readonly string[]>(base: string, parts: Parts): { readonly [P in Parts[number]]: string } {
  return Object.fromEntries(parts.map((part) => [part, `${base}-${part}`])) as { readonly [P in Parts[number]]: string };
}

/** Joins id-reference lists from the component and the consumer, without blanks or repeats. */
export function mergeIds(...lists: readonly (string | false | undefined)[]): string | undefined {
  const ids = [...new Set(lists.flatMap((list) => (list ? list.split(/\s+/).filter((id) => id !== "") : [])))];
  return ids.length > 0 ? ids.join(" ") : undefined;
}

// Bundlers replace process.env.NODE_ENV, as React's own builds rely on, so the package declares only what it reads.
declare const process: { readonly env: { readonly NODE_ENV?: string } };

/** A string type cannot exclude "", so a blank name throws its family's code outside production. */
export function rejectBlank(value: string, code: UsageCode): string {
  if (value.trim() === "" && process.env.NODE_ENV !== "production") throw new Error(message(code));
  return value;
}

/**
 * Runs a refcounted vanilla enhancer on the node. The first effect holds the enhancer for the
 * component's life. The second runs after every commit and releases its own call at once: the call
 * writes the holder's state back over what React just rendered, and the first effect stays the one owner.
 */
export function useEnhancer<E extends Element>(ref: RefObject<E | null>, enhance: (node: E) => () => void): void {
  useLayoutEffect(() => enhance(ref.current!), []);
  useLayoutEffect(() => enhance(ref.current!)());
}

/** Installs a platform fallback on the document while the component is mounted. Fallbacks are refcounted per root. */
export function useFallback(fallback: () => () => void): void {
  useEffect(() => fallback(), [fallback]);
}
