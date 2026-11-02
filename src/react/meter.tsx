import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import type { MeterRule } from "../js/usage/contract.ts";
import { cx, type Passthrough, type Root, type Values } from "./own.ts";

export type MeterTone = Values<MeterRule, "data-tone">;

type BarOwned = "aria-label" | "aria-labelledby";

type Bar = {
  /** The bar's name. Show the value as text beside it too. */
  readonly label: string;
  /** Recolors a bar that has no low or high. */
  readonly tone?: MeterTone;
};

export type MeterProps = Root & Passthrough<"meter", BarOwned> & Bar;

/** meter.odd-meter, a measurement. With low, high, and optimum it colors itself by range. */
export function Meter({ label, tone, className, ...rest }: MeterProps): ReactElement {
  return <meter {...(rest as ComponentPropsWithRef<"meter">)} className={cx("odd-meter", className)} aria-label={label} data-tone={tone} />;
}

export type ProgressProps = Root & Passthrough<"progress", BarOwned> & Bar;

/** progress.odd-progress, a task. Omit value for an indeterminate bar. */
export function Progress({ label, tone, className, ...rest }: ProgressProps): ReactElement {
  return <progress {...(rest as ComponentPropsWithRef<"progress">)} className={cx("odd-progress", className)} aria-label={label} data-tone={tone} />;
}

export type StatValueProps = Root & Passthrough<"span"> & { readonly children: ReactNode };

/** span.odd-stat-value, a number in tabular figures. */
export function StatValue({ className, children, ...rest }: StatValueProps): ReactElement {
  return (
    <span {...(rest as ComponentPropsWithRef<"span">)} className={cx("odd-stat-value", className)}>
      {children}
    </span>
  );
}
