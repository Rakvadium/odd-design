import { createElement, type ReactElement, type ReactNode } from "react";
import { Anchor } from "./context.ts";
import { cx, type HeadingLevel, type Message, type Passthrough, type Root } from "./own.ts";
import { Eyebrow, Muted } from "./typography.tsx";

type Unclickable = "onClick" | "tabIndex";

type CardBase = Root &
  Passthrough<"article", never, Unclickable> & {
    readonly as?: "article" | "section" | "div";
    /** A short label above the title. */
    readonly eyebrow?: ReactNode;
    /** A line under the title, in the muted color. */
    readonly description?: ReactNode;
    /** Below the content, such as badges or a byline. */
    readonly footer?: ReactNode;
    /** The title's outline level. 3 when omitted. */
    readonly headingLevel?: HeadingLevel;
    readonly children?: ReactNode;
  } & {
    /** The card is not a control. A clickable card takes href, and its title becomes the one link. */
    readonly [K in Unclickable]?: Message<"ODD-CARD-004">;
  };

export type CardProps = CardBase &
  (
    | {
        /** Makes the whole card a link, through the router link from OddProvider, named by the title. */
        readonly href: string;
        readonly title: ReactNode;
      }
    | { readonly href?: undefined; readonly title?: ReactNode }
  );

/**
 * article.odd-card: the eyebrow, the h{level}.odd-card-title, the description, the content, and
 * div.odd-card-footer. With href the card is data-interactive, and its title holds its one a.odd-card-link.
 */
export function Card({ as = "article", href, title, eyebrow, description, footer, headingLevel = 3, className, children, ...rest }: CardProps): ReactElement {
  return createElement(
    as,
    { ...rest, className: cx("odd-card", className), "data-interactive": href === undefined ? undefined : "" },
    eyebrow === undefined ? null : <Eyebrow>{eyebrow}</Eyebrow>,
    title === undefined
      ? null
      : createElement(
          `h${headingLevel}`,
          { className: "odd-card-title" },
          href === undefined ? (
            title
          ) : (
            <Anchor href={href} className="odd-card-link">
              {title}
            </Anchor>
          ),
        ),
    description === undefined ? null : <Muted>{description}</Muted>,
    children,
    footer === undefined ? null : <div className="odd-card-footer">{footer}</div>,
  );
}
