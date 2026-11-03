import type { ComponentPropsWithRef, ReactElement } from "react";
import type { SeparatorRule } from "../js/usage/contract.ts";
import { cx, type Message, type Passthrough, type Root, type Values } from "./own.ts";

export type SeparatorOrientation = Values<SeparatorRule, "aria-orientation">;

export type SeparatorProps = Root &
  Passthrough<"hr", "aria-orientation", "aria-hidden"> & {
    /** A vertical separator sits between inline items in a Row, which stretches it to the row's height. */
    readonly orientation?: SeparatorOrientation;
    /** A line that means nothing is a border on its container, not a hidden separator. */
    readonly "aria-hidden"?: Message<"ODD-SEPARATOR-003">;
  };

/** hr.odd-separator, which screen readers announce. */
export function Separator({ orientation, className, ...rest }: SeparatorProps): ReactElement {
  return <hr {...(rest as ComponentPropsWithRef<"hr">)} className={cx("odd-separator", className)} aria-orientation={orientation === "vertical" ? "vertical" : undefined} />;
}
