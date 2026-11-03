"use client";

import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { overlaid } from "./context.ts";
import { Stack } from "./layout.tsx";
import { cx, idsOf, rejectBlank, useOddId, type Passthrough, type Root } from "./own.ts";
import { Eyebrow } from "./typography.tsx";

type PopoverOwned = "popover" | "aria-label" | "aria-labelledby";

export type PopoverProps = Root &
  Passthrough<"div", PopoverOwned, "id" | "title"> & {
    /** The Button that opens it, which gets command="toggle-popover" and commandfor. */
    readonly trigger: ReactElement;
    /** Generated when absent. */
    readonly id?: string;
    /** A popover that holds controls is a dialog, and its title names it. Leave it out for a popover that only shows text. */
    readonly title?: string;
    readonly children: ReactNode;
  };

/**
 * The trigger, then div.odd-popover[popover=auto] > a stack of the title and the children. With a title,
 * the popover is role="dialog", named by p.odd-eyebrow. A Button with command="close" inside closes it.
 */
export function Popover({ trigger, id, title, className, children, ...rest }: PopoverProps): ReactElement {
  const base = useOddId(id);
  const ids = idsOf(base, ["title"]);
  const name = title === undefined ? undefined : rejectBlank(title, "ODD-POPOVER-004");
  return overlaid(
    trigger,
    { kind: "command", command: "toggle-popover", commandfor: base },
    { id: base, close: "hide-popover" },
    <div
      {...(rest as ComponentPropsWithRef<"div">)}
      id={base}
      className={cx("odd-popover", className)}
      popover="auto"
      role={name === undefined ? undefined : "dialog"}
      aria-labelledby={name === undefined ? undefined : ids.title}
    >
      <Stack>
        {name === undefined ? null : <Eyebrow id={ids.title}>{name}</Eyebrow>}
        {children}
      </Stack>
    </div>,
  );
}
