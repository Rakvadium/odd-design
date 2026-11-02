import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { cx, type Passthrough, type Root } from "./own.ts";

export type CodeProps = Root & Passthrough<"code"> & { readonly children: ReactNode };

/** code.odd-code, a short piece of code inside a sentence. */
export function Code({ className, children, ...rest }: CodeProps): ReactElement {
  return (
    <code {...(rest as ComponentPropsWithRef<"code">)} className={cx("odd-code", className)}>
      {children}
    </code>
  );
}

export type PreProps = Root &
  Passthrough<"pre"> & {
    /** Command output, which is not code: the text goes in the pre with no code inside. */
    readonly output?: boolean;
    readonly children: ReactNode;
  };

/** pre.odd-pre with its text in a bare code, whose long lines wrap. */
export function Pre({ output, className, children, ...rest }: PreProps): ReactElement {
  return (
    <pre {...(rest as ComponentPropsWithRef<"pre">)} className={cx("odd-pre", className)}>
      {output ? children : <code>{children}</code>}
    </pre>
  );
}
