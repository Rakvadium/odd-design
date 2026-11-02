"use client";

import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { Anchor } from "./context.ts";
import { newTabParts, useTooltip } from "./invoker.ts";
import { cx, type Message, type Passthrough, type Root } from "./own.ts";

type TextLinkOwned = "aria-current" | "interestfor" | "target" | "rel";

type TextLinkBase = Root & Passthrough<"a", TextLinkOwned, "href" | "aria-disabled">;

/** An interface, so a type error names TextLinkProps rather than printing every prop. */
export interface TextLinkProps extends TextLinkBase {
  readonly href: string;
  /** Marks the link as the current page. */
  readonly current?: boolean;
  /** Opens the link in a new tab, and says so to a screen reader. */
  readonly newTab?: boolean;
  /** Text shown on hover or keyboard focus, which also describes the link to a screen reader. */
  readonly tooltip?: string;
  readonly "aria-disabled"?: Message<"ODD-LINK-003">;
  readonly disabled?: Message<"ODD-LINK-003">;
  readonly children: ReactNode;
}

/** a.odd-link through the router link from OddProvider, and its tooltip right after it. */
export function TextLink({ href, current, newTab, tooltip, className, children, ...rest }: TextLinkProps): ReactElement {
  const tip = useTooltip(rest.id, tooltip, "description", rest["aria-describedby"]);
  const tab = newTabParts(newTab);
  return (
    <>
      <Anchor {...(rest as ComponentPropsWithRef<"a">)} href={href} aria-current={current ? "page" : undefined} {...tip.invoker} {...tab.attributes} className={cx("odd-link", className)}>
        {children}
        {tab.words}
      </Anchor>
      {tip.tooltip}
    </>
  );
}
