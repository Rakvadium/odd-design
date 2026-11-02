import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { cx, rejectBlank, type Passthrough, type Root } from "./own.ts";
import { TextLink } from "./text-link.tsx";

export type BreadcrumbItem = {
  readonly label: ReactNode;
  /** Omit it for a level with no page of its own, which renders as text. */
  readonly href?: string;
};

export type BreadcrumbProps = Root &
  Passthrough<"nav", "aria-label" | "aria-labelledby"> & {
    /** The trail's name. "Breadcrumb" when omitted. A second trail on the page needs a name of its own. */
    readonly label?: string;
    /** From the top level to the current page. The last item's link is the current page. */
    readonly items: readonly [BreadcrumbItem, ...BreadcrumbItem[]];
  };

/** nav.odd-breadcrumb > ol > li, one per item, with router links and aria-current="page" on the last. */
export function Breadcrumb({ label = "Breadcrumb", items, className, ...rest }: BreadcrumbProps): ReactElement {
  return (
    <nav {...(rest as ComponentPropsWithRef<"nav">)} className={cx("odd-breadcrumb", className)} aria-label={rejectBlank(label, "ODD-BREADCRUMB-002")}>
      <ol>
        {items.map((item, index) => (
          <li key={index}>
            {item.href === undefined ? (
              item.label
            ) : (
              <TextLink href={item.href} current={index === items.length - 1}>
                {item.label}
              </TextLink>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
