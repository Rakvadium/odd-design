import type { ComponentProps, CSSProperties, JSX, ReactElement } from "react";
import type * as Odd from "odd-design/react";
import { CLASS_REGISTRY, WRAPPERS, type USAGE } from "../src/js/usage/contract.ts";
import type { icons } from "./icons.ts";

export type Component = keyof typeof WRAPPERS & keyof typeof Odd;

export type PropsOf<C extends Component> = ComponentProps<(typeof Odd)[C]>;

export type Tag = Extract<keyof JSX.IntrinsicElements, keyof HTMLElementTagNameMap>;

const VOID = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"] as const;

type TagOf<K extends Component | Tag> = K extends Component
  ? (typeof WRAPPERS)[K]["element"] extends infer E
    ? E extends string
      ? E
      : E extends { readonly present: infer P; readonly absent: infer A }
        ? P | A
        : never
    : never
  : K;

type WrapperClass<T> = { [C in Component]: T extends TagOf<C> ? (typeof WRAPPERS)[C]["className"] : never }[Component];

type ElementRuled = Extract<(typeof USAGE)[keyof typeof USAGE][number], { kind: "element" }>["className"];

type PinnedWrapperClass = Extract<(typeof WRAPPERS)[Component]["className"], ElementRuled>;

type NativeClass<T> = Exclude<(typeof CLASS_REGISTRY)[number], WrapperClass<T> | PinnedWrapperClass>;

type Unlowerable = "children" | "dangerouslySetInnerHTML" | "ref" | "key" | `on${string}`;

// A controlled value needs an onChange, which a scene cannot carry, and React stays silent on a disabled one.
type Controlled<T> = ([T] extends ["input" | "textarea" | "select"] ? "value" : never) | ([T] extends ["input"] ? "checked" : never);

type CustomProperty = "--gap";

// React appends px to a bare number, so a style value is always a string.
type StoryStyle = { readonly [Name in keyof CSSProperties | CustomProperty]?: string };

// A scene is returned from an arrow, where tsc skips excess-property checks, so a dropped prop is typed never rather than omitted.
type SceneProps<P, T> = {
  readonly [Name in keyof P]: Name extends Unlowerable | Controlled<T> ? never : Name extends "style" ? StoryStyle : P[Name];
};

type Props<K extends Component | Tag> = K extends Component
  ? SceneProps<PropsOf<K>, TagOf<K>>
  : K extends Tag
    ? Omit<SceneProps<ComponentProps<K>, K>, "className"> & { readonly className?: NativeClass<K> }
    : never;

export type Text = string | { readonly icon: keyof typeof icons };

type Childless = (typeof VOID)[number] | "textarea";

type ChildOf<T> = T extends "select" ? Node<"option"> : T extends "option" ? string : Text | Flow;

type PropsField<K extends Component | Tag> = {} extends Props<K> ? { readonly props?: Props<K> } : { readonly props: Props<K> };

type ChildrenField<K extends Component | Tag> = [TagOf<K>] extends [Childless]
  ? { readonly children?: never }
  : { readonly children?: readonly ChildOf<TagOf<K>>[] };

export type Node<K extends Component | Tag> = { readonly of: K } & PropsField<K> & ChildrenField<K>;

type Nodes = { [K in Component | Tag]: Node<K> };

type Flow = Nodes[Exclude<Component | Tag, "option">];

export type Scene = Nodes[Component | Tag];

/** A story's scene is data, or a React element for a story written in TSX. Both Storybooks render it through React. */
export type Mirror<Args> = { readonly scene: (args: Args) => Scene | ReactElement; readonly aria: string };

export type MirroredStory<Args> = { readonly parameters: { readonly mirror: Mirror<Args> } };

export function mirrored<Args>(mirror: Mirror<Args>): MirroredStory<Args> {
  return { parameters: { mirror } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function mirrorOf(parameters: unknown): Mirror<Record<string, unknown>> {
  const mirror = isRecord(parameters) ? parameters.mirror : undefined;
  if (!isRecord(mirror) || typeof mirror.scene !== "function" || typeof mirror.aria !== "string") {
    throw new Error("story has no parameters.mirror");
  }
  const scene = mirror.scene as Mirror<Record<string, unknown>>["scene"];
  return { scene, aria: mirror.aria };
}

export function isComponent(of: string): of is Component {
  return Object.hasOwn(WRAPPERS, of);
}
