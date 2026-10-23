import { cloneElement, createElement, type ReactElement, type ReactNode } from "react";
import * as Wrappers from "odd-design/react";
import type { WRAPPERS } from "../src/js/usage/contract.ts";
import { icons } from "./icons.ts";
import type { Scene } from "./mirror.ts";

type Expect<T extends true> = T;

type MissingPackageExport = Exclude<keyof typeof WRAPPERS, keyof typeof Wrappers>;

type EveryWrapperHasPackageExport = Expect<[MissingPackageExport] extends [never] ? true : MissingPackageExport>;

const components = Wrappers;

function propName(name: string): string {
  if (name.startsWith("aria-") || name.startsWith("data-")) return name;
  return name.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
}

function icon(name: keyof typeof icons, key: number): ReactElement {
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
  return createElement("svg", { ...props, key, dangerouslySetInnerHTML: { __html: inner } });
}

function interleave(nodes: readonly ReactNode[], separator: string): ReactNode[] {
  const result: ReactNode[] = [];
  nodes.forEach((node, index) => {
    if (index > 0) result.push(separator);
    result.push(node);
  });
  return result;
}

export function toReact(scene: Scene): ReactElement {
  if ("layout" in scene) {
    return createElement(
      "div",
      { className: "odd-" + scene.layout },
      ...scene.children.map((child, index) => cloneElement(toReact(child), { key: index })),
    );
  }
  const children = interleave(
    (scene.children ?? []).map((child, index) => (typeof child === "string" ? child : icon(child.icon, index))),
    " ",
  );
  const render = components[scene.of] as (props: object) => ReactElement;
  return createElement(render, scene.props ?? {}, ...children);
}
