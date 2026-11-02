import type { ComponentPropsWithRef, ReactElement } from "react";
import { VisuallyHidden } from "./layout.tsx";
import { cx, type Message, type Passthrough, type Root } from "./own.ts";

type Unread = "aria-busy" | "aria-label" | "aria-labelledby";

export type SpinnerProps = Root &
  Passthrough<"span", "aria-hidden", Unread> & {
    /** The loading words, read from a hidden span beside the ring. Omit it when visible words sit beside the spinner. */
    readonly label?: string;
  } & {
    /** The ring is decoration. Its words are label, and aria-busy goes on the region that is loading. */
    readonly [K in Unread | "children"]?: Message<"ODD-SPINNER-002">;
  };

/** span.odd-spinner[aria-hidden=true], 1em across in the text color, then the label's hidden words. */
export function Spinner({ label, className, ...rest }: SpinnerProps): ReactElement {
  return (
    <>
      <span {...(rest as ComponentPropsWithRef<"span">)} className={cx("odd-spinner", className)} aria-hidden="true" />
      {label ? <VisuallyHidden>{label}</VisuallyHidden> : null}
    </>
  );
}
