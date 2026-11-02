import { cloneElement, type ComponentPropsWithRef, type ReactElement, type ReactNode, type SVGProps } from "react";
import type { AlertRule } from "../js/usage/contract.ts";
import { cx, type Message, type Passthrough, type Root, type Values } from "./own.ts";

export type AlertTone = Values<AlertRule, "data-tone">;

export type AlertProps = Root &
  Passthrough<"div", never, "aria-live"> & {
    /** The neutral tint when omitted. */
    readonly tone?: AlertTone;
    /** Says what kind of message it is, so the tone is not the only cue. */
    readonly title?: ReactNode;
    /** An svg, drawn first in the tone's color and hidden from screen readers. */
    readonly icon?: ReactElement;
    /** A message that appears later goes into a live region that was on the page before it. That region is the app's. */
    readonly "aria-live"?: Message<"ODD-ALERT-003">;
    readonly children?: ReactNode;
  };

/** div.odd-alert: the icon, then the title and the message. */
export function Alert({ tone, title, icon, className, children, ...rest }: AlertProps): ReactElement {
  return (
    <div {...(rest as ComponentPropsWithRef<"div">)} className={cx("odd-alert", className)} data-tone={tone}>
      {icon === undefined ? null : cloneElement(icon as ReactElement<SVGProps<SVGSVGElement>>, { "aria-hidden": "true" })}
      <div>
        {title === undefined ? null : <p className="odd-alert-title">{title}</p>}
        {children}
      </div>
    </div>
  );
}
