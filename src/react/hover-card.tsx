"use client";

import { use, type ComponentPropsWithRef, type ReactElement, type ReactNode } from "react";
import { interestForFallback } from "../js/fallbacks.ts";
import { Anchor, TriggerContext } from "./context.ts";
import { cx, useFallback, useOddId, type Passthrough, type Root } from "./own.ts";

export type HoverCardProps = Root & {
  /** The card. Everything in it must also be on the page the link opens. */
  readonly preview: ReactNode;
  /** The block, such as a paragraph or a list item, that holds one or more HoverCardLinks. */
  readonly children: ReactNode;
  /** The card's id. Generated when absent. */
  readonly id?: string;
};

/**
 * The block, then div.odd-hover-card[popover=hint] after it, never inside it, because a div inside a p
 * closes the paragraph. Each HoverCardLink in the block opens the card on hover or keyboard focus.
 */
export function HoverCard({ preview, children, id, className }: HoverCardProps): ReactElement {
  const card = useOddId(id);
  useFallback(interestForFallback);
  return (
    <>
      <TriggerContext value={{ kind: "interest", interestfor: card }}>{children}</TriggerContext>
      <TriggerContext value={null}>
        <div className={cx("odd-hover-card", className)} id={card} popover="hint">
          {preview}
        </div>
      </TriggerContext>
    </>
  );
}

export type HoverCardLinkProps = Root &
  Passthrough<"a", "interestfor", "href"> & {
    readonly href: string;
    readonly children: ReactNode;
  };

/** a.odd-link with interestfor pointed at the HoverCard around it, through the router link from OddProvider. */
export function HoverCardLink({ href, className, ...rest }: HoverCardLinkProps): ReactElement {
  const trigger = use(TriggerContext);
  if (trigger?.kind !== "interest") throw new Error("HoverCardLink renders inside the block a HoverCard wraps, which names the card it opens.");
  return <Anchor {...(rest as ComponentPropsWithRef<"a">)} {...{ interestfor: trigger.interestfor }} className={cx("odd-link", className)} href={href} />;
}
