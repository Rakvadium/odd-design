import type { ComponentPropsWithRef, ReactElement } from "react";
import type { SkeletonRule } from "../js/usage/contract.ts";
import { cx, type Message, type Passthrough, type Root, type Values } from "./own.ts";

export type SkeletonShape = Values<SkeletonRule, "data-shape">;

type Unread = "aria-busy" | "aria-label" | "aria-labelledby";

export type SkeletonProps = Root &
  Passthrough<"div", "aria-hidden", Unread> & {
    /** A block that matches a default avatar. Omit it for a line that fills its container's width at 1em tall. */
    readonly shape?: SkeletonShape;
  } & {
    /** A skeleton block is hidden, so nothing on it is read. Put aria-busy and the loading words on the region. */
    readonly [K in Unread | "children"]?: Message<"ODD-SKELETON-004">;
  };

/** div.odd-skeleton[aria-hidden=true], a placeholder block. Its size comes from its container. */
export function Skeleton({ shape, className, ...rest }: SkeletonProps): ReactElement {
  return <div {...(rest as ComponentPropsWithRef<"div">)} className={cx("odd-skeleton", className)} aria-hidden="true" data-shape={shape} />;
}
