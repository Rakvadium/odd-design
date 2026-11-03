"use client";

import { useImperativeHandle, useLayoutEffect, useRef, type ComponentPropsWithRef, type ReactElement, type ReactNode } from "react";
import { enhanceLog } from "../js/log.ts";
import type { LogLineRule } from "../js/usage/contract.ts";
import { cx, rejectBlank, type Passthrough, type Root, type Values } from "./own.ts";

export type LogLineTone = Values<LogLineRule, "data-tone">;

type LogOwned = "tabIndex" | "aria-label" | "aria-labelledby" | "aria-live" | "data-owner";

export type LogProps = Root &
  Passthrough<"div", LogOwned> & {
    /** The log's name. */
    readonly label: string;
    /** "off" for a fast log that a screen reader should not read line by line. Defaults to "polite". */
    readonly live?: "polite" | "off";
    /** LogLine elements. The app keeps the lines in state and trims them itself. */
    readonly children?: ReactNode;
  };

/**
 * div.odd-log[role=log], named, in the Tab order so a keyboard user can scroll it. enhanceLog keeps the
 * newest line in view until the reader scrolls up. data-owner="react" makes appendLogLine refuse it,
 * because a script that adds or trims lines would remove nodes React renders.
 */
export function Log({ label, live = "polite", className, children, ref, ...rest }: LogProps): ReactElement {
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  useLayoutEffect(() => enhanceLog(root.current!), []);
  return (
    <div {...(rest as ComponentPropsWithRef<"div">)} ref={root} className={cx("odd-log", className)} role="log" aria-label={rejectBlank(label, "ODD-LOG-003")} tabIndex={0} aria-live={live} data-owner="react">
      {children}
    </div>
  );
}

export type LogLineProps = Root &
  Passthrough<"div"> & {
    /** Color only, so the text says the level too, such as "Warning: …". */
    readonly tone?: LogLineTone;
    /** A Date shows the local time of day, and a string shows as written. */
    readonly time?: Date | string;
    readonly children: ReactNode;
  };

/** div.odd-log-line, with its time first when it has one. */
export function LogLine({ tone, time, className, children, ...rest }: LogLineProps): ReactElement {
  return (
    <div {...(rest as ComponentPropsWithRef<"div">)} className={cx("odd-log-line", className)} data-tone={tone}>
      {time === undefined ? null : time instanceof Date ? (
        // The server and the browser can sit in different time zones, so the shown time may differ on hydration.
        <time dateTime={time.toISOString()} suppressHydrationWarning>
          {time.toLocaleTimeString(undefined, { hour12: false })}
        </time>
      ) : (
        <time>{time}</time>
      )}
      {time === undefined ? null : " "}
      {children}
    </div>
  );
}
