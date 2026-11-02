import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { cx, type Passthrough, type Root } from "./own.ts";
import { Heading } from "./typography.tsx";

export type ShellProps = Root &
  Passthrough<"div"> & {
    /** The page's h1. */
    readonly title?: ReactNode;
    /** Takes the free space between the title and the actions, and is announced when it changes. */
    readonly status?: ReactNode;
    /** Buttons at the end of the bar. */
    readonly actions?: ReactNode;
    /** The main area's GridItems or panels, laid out on the twelve-column grid. */
    readonly children?: ReactNode;
  };

/**
 * A full-height page: div.odd-shell with a sticky header.odd-shell-header that holds the title, a
 * role=status slot, and the actions, over main.odd-shell-main.odd-grid.
 */
export function Shell({ title, status, actions, className, children, ...rest }: ShellProps): ReactElement {
  return (
    <div {...(rest as ComponentPropsWithRef<"div">)} className={cx("odd-shell", className)}>
      <header className="odd-shell-header">
        {title === undefined ? null : <Heading level={1}>{title}</Heading>}
        <div className="odd-shell-status" role="status">
          {status}
        </div>
        <div className="odd-shell-actions">{actions}</div>
      </header>
      <main className="odd-shell-main odd-grid">{children}</main>
    </div>
  );
}
