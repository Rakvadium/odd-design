"use client";

import { useImperativeHandle, useLayoutEffect, useRef, type ComponentPropsWithRef, type ReactElement } from "react";
import { enhanceToaster } from "../js/toast.ts";
import { cx, rejectBlank, type Passthrough, type Root } from "./own.ts";

export type ToasterProps = Root &
  Passthrough<"section", "popover" | "aria-label" | "aria-labelledby"> & {
    /** The region's name, such as "Notifications". */
    readonly label: string;
  };

/** section.odd-toaster[popover=manual], named. enhanceToaster builds its list and live region, and toast() fills them. */
export function Toaster({ label, className, ref, ...rest }: ToasterProps): ReactElement {
  const root = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  useLayoutEffect(() => enhanceToaster(root.current!), []);
  return <section {...(rest as ComponentPropsWithRef<"section">)} ref={root} className={cx("odd-toaster", className)} popover="manual" aria-label={rejectBlank(label, "ODD-TOAST-003")} />;
}
