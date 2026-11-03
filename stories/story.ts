import { createElement, type ReactElement } from "react";
import { icons } from "./icons.ts";

/**
 * A story both Storybooks show from one scene. The React Storybook mounts the scene, and the HTML one shows its
 * static markup with vanilla enhance(). aria is the snapshot the pair sweep expects on both sides.
 */
export type Mirror<Args> = { readonly scene: (args: Args) => ReactElement; readonly aria: string };

export type MirroredStory<Args> = { readonly parameters: { readonly mirror: Mirror<Args> } };

export function mirrored<Args>(mirror: Mirror<Args>): MirroredStory<Args> {
  return { parameters: { mirror } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isMirror(value: unknown): value is Mirror<Record<string, unknown>> {
  return isRecord(value) && typeof value.scene === "function" && typeof value.aria === "string";
}

/** The scene in a story's parameters.mirror. Throws rather than render nothing. */
export function sceneOf(parameters: unknown): Mirror<Record<string, unknown>>["scene"] {
  const mirror = isRecord(parameters) ? parameters.mirror : undefined;
  if (!isMirror(mirror)) throw new Error("story has no parameters.mirror");
  return mirror.scene;
}

function propName(name: string): string {
  if (name.startsWith("aria-") || name.startsWith("data-")) return name;
  return name.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
}

export function icon(name: keyof typeof icons): ReactElement {
  const match = /^<svg([^>]*)>([\s\S]*)<\/svg>$/.exec(icons[name]);
  if (match === null) throw new Error(`icon ${name} is not an svg`);
  const props: Record<string, string> = {};
  for (const [, raw, value] of (match[1] ?? "").matchAll(/([^\s=]+)="([^"]*)"/g)) {
    if (raw !== undefined && value !== undefined) props[propName(raw)] = value;
  }
  return createElement("svg", { ...props, dangerouslySetInnerHTML: { __html: match[2] ?? "" } });
}
