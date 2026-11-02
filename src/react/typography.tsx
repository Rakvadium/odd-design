import { createElement, type ReactElement, type ReactNode } from "react";
import type { EyebrowRule, HeadingRule } from "../js/usage/contract.ts";
import { cx, type HeadingLevel, type Passthrough, type Root, type Values } from "./own.ts";

export type HeadingSize = Values<HeadingRule, "data-size">;
export type EyebrowTone = Values<EyebrowRule, "data-tone">;

export type HeadingProps = Root &
  Passthrough<"h2", never, "ref"> & {
    /** The outline level. Only the app knows where the heading sits in the outline. */
    readonly level: HeadingLevel;
    /** The look, apart from the level. Omit it for the md size. */
    readonly size?: HeadingSize;
    readonly children: ReactNode;
  };

export function Heading({ level, size, className, children, ...rest }: HeadingProps): ReactElement {
  return createElement(`h${level}`, { ...rest, className: cx("odd-heading", className), "data-size": size }, children);
}

type Phrase = "p" | "span";

export type EyebrowProps = Root &
  Passthrough<"p", never, "ref"> & {
    /** Muted when omitted. */
    readonly tone?: EyebrowTone;
    readonly as?: Phrase;
    readonly children: ReactNode;
  };

export function Eyebrow({ tone, as = "p", className, children, ...rest }: EyebrowProps): ReactElement {
  return createElement(as, { ...rest, className: cx("odd-eyebrow", className), "data-tone": tone }, children);
}

export type MutedProps = Root &
  Passthrough<"p", never, "ref"> & {
    readonly as?: Phrase;
    readonly children: ReactNode;
  };

export function Muted({ as = "p", className, children, ...rest }: MutedProps): ReactElement {
  return createElement(as, { ...rest, className: cx("odd-muted", className) }, children);
}
