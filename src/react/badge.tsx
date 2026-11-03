import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import type { BadgeRule } from "../js/usage/contract.ts";
import { cx, type Passthrough, type Root, type Values } from "./own.ts";

export type BadgeTone = Values<BadgeRule, "data-tone">;

export type BadgeProps = Root &
  Passthrough<"span"> & {
    /** Neutral when omitted. */
    readonly tone?: BadgeTone;
    /** Fills the badge with its tone. */
    readonly solid?: boolean;
    readonly children: ReactNode;
  };

export function Badge({ tone, solid, className, children, ...rest }: BadgeProps): ReactElement {
  return (
    <span {...(rest as ComponentPropsWithRef<"span">)} className={cx("odd-badge", className)} data-tone={tone} data-solid={solid ? "" : undefined}>
      {children}
    </span>
  );
}
