import { createElement, type ReactElement, type ReactNode } from "react";
import type { Chrome, Mode, Palette } from "../js/contract.ts";
import type { GridRule } from "../js/usage/contract.ts";
import { Anchor } from "./context.ts";
import { cx, type Owned, type Passthrough, type Root } from "./own.ts";

type Block<Tag extends string> = Root &
  Passthrough<"div", never, "ref"> & {
    readonly as?: Tag;
    readonly children?: ReactNode;
  };

type FlowTag = "div" | "section" | "nav" | "header" | "footer" | "aside" | "ul" | "ol" | "dl";

/** A column with the stack's default gap. */
export type StackProps = Block<FlowTag>;

export function Stack({ as = "div", className, children, ...rest }: StackProps): ReactElement {
  return createElement(as, { ...rest, className: cx("odd-stack", className) }, children);
}

/** A wrapping row with the row's default gap. */
export type RowProps = Block<FlowTag>;

export function Row({ as = "div", className, children, ...rest }: RowProps): ReactElement {
  return createElement(as, { ...rest, className: cx("odd-row", className) }, children);
}

/** Twelve columns that narrow by the grid's own width. Its children are GridItems. */
export type GridProps = Block<"div" | "main" | "section" | "ul" | "ol">;

export function Grid({ as = "div", className, children, ...rest }: GridProps): ReactElement {
  return createElement(as, { ...rest, className: cx("odd-grid", className) }, children);
}

export type GridSpan = Extract<GridRule, { kind: "child-value" }>["values"][number] extends `${infer N extends number}` ? N : never;

export type GridItemProps = Block<"div" | "section" | "article" | "li"> & {
  /** Columns out of 12. Omit it for the full row. */
  readonly span?: GridSpan;
};

export function GridItem({ as = "div", span, children, ...rest }: GridItemProps): ReactElement {
  return createElement(as, { ...rest, "data-span": span }, children);
}

export type VisuallyHiddenProps = Root &
  Passthrough<"span", never, "ref"> & {
    readonly as?: "span" | "p";
    readonly children: ReactNode;
  };

/** Text a screen reader reads and the page does not show. */
export function VisuallyHidden({ as = "span", className, children, ...rest }: VisuallyHiddenProps): ReactElement {
  return createElement(as, { ...rest, className: cx("odd-visually-hidden", className) }, children);
}

export type SkipLinkProps = Root &
  Passthrough<"a", never, "href"> & {
    /** The id of the main content, as a fragment. */
    readonly href: `#${string}`;
    readonly children: ReactNode;
  };

/** The first focusable element on the page. It slides in when it takes focus. */
export function SkipLink({ className, ...rest }: SkipLinkProps): ReactElement {
  return <Anchor {...rest} className={cx("odd-skip-link", className)} />;
}

export type ScopeProps = Block<"div" | "section" | "main" | "aside"> &
  Owned<"data-chrome" | "data-palette" | "data-mode"> & {
    readonly chrome: Chrome;
    readonly palette: Palette;
    readonly mode: Mode;
  };

/** A subtree with its own chrome, palette, and mode. All three are required, so no axis leaks in from the page. */
export function Scope({ as = "div", chrome, palette, mode, className, children, ...rest }: ScopeProps): ReactElement {
  return createElement(as, { ...rest, className: cx("odd-scope", className), "data-chrome": chrome, "data-palette": palette, "data-mode": mode }, children);
}
