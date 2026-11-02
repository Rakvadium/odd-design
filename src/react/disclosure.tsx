import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { cx, type Passthrough, type Root } from "./own.ts";

export type DisclosureProps = Root &
  Passthrough<"details", "open"> & {
    /** The question, which is the toggle. */
    readonly summary: ReactNode;
    /** The first state. The browser owns every toggle after that. */
    readonly defaultOpen?: boolean;
    /** The answer. */
    readonly children: ReactNode;
  };

/** details.odd-disclosure > summary + div. Disclosures that share a name open one at a time. */
export function Disclosure({ summary, defaultOpen, className, children, ...rest }: DisclosureProps): ReactElement {
  return (
    <details {...(rest as ComponentPropsWithRef<"details">)} className={cx("odd-disclosure", className)} open={defaultOpen}>
      <summary>{summary}</summary>
      <div>{children}</div>
    </details>
  );
}
