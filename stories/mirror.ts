import type { ComponentProps, CSSProperties, JSX } from "react";
import { CLASS_REGISTRY, WRAPPERS, type WrapperElement } from "../src/js/usage/contract.ts";
import type { WrapperProps } from "../src/react/props.ts";
import { icons } from "./icons.ts";

export type Component = keyof typeof WRAPPERS & keyof WrapperProps;

type Expect<T extends true> = T;

type MissingWrapperProps = Exclude<keyof typeof WRAPPERS, keyof WrapperProps>;

type EveryWrapperHasProps = Expect<[MissingWrapperProps] extends [never] ? true : MissingWrapperProps>;

export type PropsOf<C extends Component> = WrapperProps[C];

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

type NativeClass = Exclude<(typeof CLASS_REGISTRY)[number], (typeof WRAPPERS)[Component]["className"]>;

type Unlowerable = "children" | "dangerouslySetInnerHTML" | "ref" | "key" | `on${string}`;

// A controlled value needs an onChange, which a scene cannot carry, and React stays silent on a disabled one.
type Controlled<T> = ([T] extends ["input" | "textarea" | "select"] ? "value" : never) | ([T] extends ["input"] ? "checked" : never);

// React appends px to a bare number and toHtml would not, so a style value is always a string.
type StoryStyle = { readonly [Name in keyof CSSProperties]?: string };

// A scene is returned from an arrow, where tsc skips excess-property checks, so a dropped prop is typed never rather than omitted.
type SceneProps<P, T> = {
  readonly [Name in keyof P]: Name extends Unlowerable | Controlled<T> ? never : Name extends "style" ? StoryStyle : P[Name];
};

type Props<K extends Component | Tag> = K extends Component
  ? SceneProps<PropsOf<K>, TagOf<K>>
  : K extends Tag
    ? Omit<SceneProps<ComponentProps<K>, K>, "className"> & { readonly className?: NativeClass }
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

// Both renderers walk this wider shape, because reading props or children off the full Scene union is too complex for tsc.
export type AnyNode = { readonly of: Component | Tag; readonly props?: object; readonly children?: readonly (Text | AnyNode)[] };

export type Mirror<Args> = { readonly scene: (args: Args) => Scene; readonly aria: string };

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

function escapeText(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

const RENAMED: Readonly<Record<string, string>> = {
  className: "class",
  htmlFor: "for",
  defaultValue: "value",
  defaultChecked: "checked",
};

const DEFAULT_VALUE_IN: Readonly<Record<string, "option" | "content">> = { select: "option", textarea: "content" };

function cssText(style: object): string {
  return Object.entries(style)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => name.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase()) + ":" + String(value))
    .join(";");
}

function attribute(name: string, value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const html = (RENAMED[name] ?? name).toLowerCase();
  if (name === "style" && typeof value === "object") return 'style="' + escapeText(cssText(value)) + '"';
  if (typeof value === "boolean" && !html.startsWith("aria-") && !html.startsWith("data-")) return value ? html : undefined;
  return html + '="' + escapeText(String(value)) + '"';
}

function mappedAttribute(name: string, value: unknown): string | undefined {
  if (value === undefined || value === false) return undefined;
  return value === true ? name : name + '="' + escapeText(String(value)) + '"';
}

function tagName(element: WrapperElement, props: Record<string, unknown>): string {
  if (typeof element === "string") return element;
  return props[element.attribute] === undefined ? element.absent : element.present;
}

function className(base: string | undefined, extra: unknown): string | undefined {
  const names = [base, typeof extra === "string" && extra !== "" ? extra : undefined].filter((name) => name !== undefined);
  return names.length === 0 ? undefined : names.join(" ");
}

function textOf(children: readonly unknown[]): string {
  return children.filter((child) => typeof child === "string").join("");
}

function nodeHtml(scene: AnyNode, selected?: unknown): string {
  const props: Record<string, unknown> = { ...scene.props };
  const wrapper = isComponent(scene.of) ? WRAPPERS[scene.of] : undefined;
  const tag = wrapper === undefined ? scene.of : tagName(wrapper.element, props);
  const mapped: Readonly<Record<string, string>> = wrapper?.props ?? {};
  const defaultIn = DEFAULT_VALUE_IN[tag];
  const children = scene.children ?? [];
  const attrs = [attribute("className", className(wrapper?.className, props.className))];
  for (const [prop, name] of Object.entries(mapped)) attrs.push(mappedAttribute(name, props[prop]));
  for (const [name, value] of Object.entries(props)) {
    if (name === "className" || Object.hasOwn(mapped, name) || (defaultIn !== undefined && name === "defaultValue")) continue;
    attrs.push(attribute(name, value));
  }
  if (tag === "option" && selected !== undefined && String(props.value ?? textOf(children)) === String(selected)) attrs.push("selected");
  const open = "<" + [tag, ...attrs.filter((attr) => attr !== undefined)].join(" ") + ">";
  if ((VOID as readonly string[]).includes(tag)) {
    if (children.length > 0) throw new Error(`<${tag}> is a void element and cannot have children`);
    return open;
  }
  const inner =
    defaultIn === "content" && props.defaultValue !== undefined
      ? escapeText(String(props.defaultValue))
      : children.map((child) => childHtml(child, defaultIn === "option" ? props.defaultValue : undefined)).join("");
  return open + inner + "</" + tag + ">";
}

function childHtml(child: Text | AnyNode, selected: unknown): string {
  if (typeof child === "string") return escapeText(child);
  if ("icon" in child) return icons[child.icon];
  return nodeHtml(child, selected);
}

export function toHtml(scene: Scene): string {
  return nodeHtml(scene);
}
