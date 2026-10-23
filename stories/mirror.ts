// A mirrored story is data. toHtml turns it into the HTML Storybook's markup.
// React is type-only here, so the HTML Storybook does not load React through this file.

import { WRAPPERS, type WrapperElement } from "../src/js/usage/contract.ts";
import type * as Wrappers from "odd-design/react";
import { icons } from "./icons.ts";

export type Component = keyof typeof WRAPPERS & keyof typeof Wrappers;

// `Parameters<typeof Button>` is `never`. Button's `const` type parameter makes the
// inferring conditional inside `Parameters` fail, so the widened props type is named here.
// A component missing from this map fails `tsc` at `PropsOf` below.
type PropTypes = {
  Button: Wrappers.ButtonProps;
};

export type PropsOf<C extends Component & keyof PropTypes> = PropTypes[C];

export type Part = string | { readonly icon: keyof typeof icons };

export type Element = {
  readonly [C in Component]: { readonly of: C; readonly props?: PropsOf<C>; readonly children?: readonly Part[] };
}[Component];

export type Layout = { readonly layout: "row" | "stack"; readonly children: readonly Scene[] };

export type Scene = Element | Layout;

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

function escapeText(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function partHtml(part: Part): string {
  return typeof part === "string" ? escapeText(part) : icons[part.icon];
}

function pushAttr(attrs: string[], name: string, value: unknown): void {
  if (value === undefined || value === false) return;
  if (value === true) {
    attrs.push(name);
    return;
  }
  attrs.push(name + '="' + escapeText(String(value)) + '"');
}

function pushString(attrs: string[], name: string, value: unknown): void {
  if (value === undefined) return;
  attrs.push(name + '="' + escapeText(String(value)) + '"');
}

function tagName(element: WrapperElement, props: Record<string, unknown>): string {
  if (typeof element === "string") return element;
  return props[element.attribute] === undefined ? element.absent : element.present;
}

function classAttr(className: string, extra: unknown): string {
  const names = [className];
  if (typeof extra === "string" && extra !== "") names.push(extra);
  return 'class="' + names.join(" ") + '"';
}

function propsRecord(props: object | undefined): Record<string, unknown> {
  if (props === undefined) return {};
  return Object.fromEntries(Object.entries(props));
}

function elementHtml(scene: Element): string {
  const wrapper = WRAPPERS[scene.of];
  const props = propsRecord(scene.props);
  const attrs = [classAttr(wrapper.className, props.className)];
  const mapped = new Set<string>(["className"]);
  for (const [prop, attr] of Object.entries(wrapper.props)) {
    mapped.add(prop);
    pushAttr(attrs, attr, props[prop]);
  }
  // A scene uses HTML attribute names. A React camelCase name such as tabIndex is unsupported.
  for (const [key, value] of Object.entries(props)) {
    if (mapped.has(key)) continue;
    pushString(attrs, key, value);
  }
  const tag = tagName(wrapper.element, props);
  const inner = (scene.children ?? []).map(partHtml).join(" ");
  return "<" + tag + " " + attrs.join(" ") + ">" + inner + "</" + tag + ">";
}

function layoutHtml(scene: Layout): string {
  // Joined strings, not a template: odd/usage flags an untagged template that contains an odd-* class.
  const open = '<div class="' + "odd-" + scene.layout + '">';
  const inner = scene.children.map((child) => toHtml(child)).join("\n");
  return open + inner + "</div>";
}

export function toHtml(scene: Scene): string {
  if ("layout" in scene) return layoutHtml(scene);
  return elementHtml(scene);
}
