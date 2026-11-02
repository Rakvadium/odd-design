import { createElement, isValidElement, type ReactElement, type ReactNode } from "react";
import * as Wrappers from "odd-design/react";
import type { WRAPPERS } from "../src/js/usage/contract.ts";
import { icons } from "./icons.ts";
import { isComponent, type Scene, type Text } from "./mirror.ts";

type Expect<T extends true> = T;

type MissingPackageExport = Exclude<keyof typeof WRAPPERS, keyof typeof Wrappers>;

type EveryWrapperHasPackageExport = Expect<[MissingPackageExport] extends [never] ? true : MissingPackageExport>;

function propName(name: string): string {
  if (name.startsWith("aria-") || name.startsWith("data-")) return name;
  return name.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
}

function icon(name: keyof typeof icons): ReactElement {
  const match = /^<svg([^>]*)>([\s\S]*)<\/svg>$/.exec(icons[name]);
  if (match === null) throw new Error(`icon ${name} is not an svg`);
  const attrs = match[1] ?? "";
  const inner = match[2] ?? "";
  const props: Record<string, string> = {};
  for (const attr of attrs.matchAll(/([^\s=]+)="([^"]*)"/g)) {
    const raw = attr[1];
    const value = attr[2];
    if (raw === undefined || value === undefined) continue;
    props[propName(raw)] = value;
  }
  return createElement("svg", { ...props, dangerouslySetInnerHTML: { __html: inner } });
}

function child(node: Text | Scene): ReactNode {
  if (typeof node === "string") return node;
  return "icon" in node ? icon(node.icon) : toReact(node);
}

export function toReact(node: Scene | ReactElement): ReactElement {
  if (isValidElement(node)) return node;
  const type = isComponent(node.of) ? (Wrappers[node.of] as (props: object) => ReactElement) : node.of;
  return createElement(type, node.props, ...(node.children ?? []).map(child));
}
