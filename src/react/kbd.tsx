import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { cx, type Message, type Passthrough, type Root } from "./own.ts";

export type KbdProps = Root &
  Passthrough<"kbd", never, "aria-hidden"> & {
    /** A key is read with its sentence. A hidden shortcut hint in a menu item is MenuItem's shortcut. */
    readonly "aria-hidden"?: Message<"ODD-KBD-002">;
    /** One key, by its name. */
    readonly children: ReactNode;
  };

/** kbd.odd-kbd, a keycap in running text. */
export function Kbd({ className, children, ...rest }: KbdProps): ReactElement {
  return (
    <kbd {...(rest as ComponentPropsWithRef<"kbd">)} className={cx("odd-kbd", className)}>
      {children}
    </kbd>
  );
}
