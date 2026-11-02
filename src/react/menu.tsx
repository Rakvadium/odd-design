"use client";

import { useImperativeHandle, useRef, type ComponentPropsWithRef, type MouseEvent, type ReactElement, type ReactNode } from "react";
import { enhanceMenu } from "../js/menu.ts";
import type { MenuItemRule } from "../js/usage/contract.ts";
import type { ButtonCommand } from "./button.tsx";
import { overlaid } from "./context.ts";
import { cx, idsOf, rejectBlank, useEnhancer, useOddId, type Passthrough, type Root, type Values } from "./own.ts";
import { Separator } from "./separator.tsx";

export type MenuItemTone = Values<MenuItemRule, "data-tone">;

type MenuOwned = "popover" | "aria-label" | "aria-labelledby";

export type MenuProps = Root &
  Passthrough<"div", MenuOwned, "id"> & {
    /** The Button that opens it, which gets command="toggle-popover", commandfor, and aria-haspopup="menu". */
    readonly trigger: ReactElement;
    /** The menu's name. An icon-only trigger's name does not carry over, so the menu takes its own. */
    readonly label: string;
    /** Generated when absent. */
    readonly id?: string;
    readonly children: ReactNode;
  };

/**
 * The trigger, then div.odd-menu[popover=auto][role=menu] named by its label. enhanceMenu owns the
 * keyboard and aria-checked after mount, and writes the user's choices back after every commit.
 */
export function Menu({ trigger, label, id, className, children, ref, ...rest }: MenuProps): ReactElement {
  const base = useOddId(id);
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  useEnhancer(root, enhanceMenu);
  return overlaid(
    trigger,
    { kind: "command", command: "toggle-popover", commandfor: base, haspopup: "menu" },
    { id: base, close: "hide-popover" },
    <div {...(rest as ComponentPropsWithRef<"div">)} ref={root} id={base} className={cx("odd-menu", className)} popover="auto" role="menu" aria-label={rejectBlank(label, "ODD-MENU-003")}>
      {children}
    </div>,
  );
}

type ItemOwned = "type" | "aria-disabled" | "aria-checked" | "aria-keyshortcuts";

type ItemBase = Root &
  Passthrough<"button", ItemOwned, "disabled"> & {
    /** Stays reachable with the arrows and does nothing when chosen. */
    readonly disabled?: boolean;
    readonly children: ReactNode;
  };

export type MenuItemProps = ItemBase & {
  readonly tone?: MenuItemTone;
  /** The aria-keyshortcuts value, such as "Control+D". The item shows it as a keycap, with Control as Ctrl. */
  readonly shortcut?: string;
  /** Opens an overlay elsewhere on the page by its id, such as a Dialog. */
  readonly command?: ButtonCommand;
  readonly commandfor?: string;
};

export type MenuCheckboxItemProps = ItemBase & {
  /** The first state. enhanceMenu owns it after mount, so read the new value in onClick. */
  readonly defaultChecked?: boolean;
};

export type MenuRadioItemProps = MenuCheckboxItemProps;

const KEY_LABELS: Readonly<Record<string, string>> = { Control: "Ctrl" };

function keycap(shortcut: string): string {
  return shortcut
    .split("+")
    .map((key) => KEY_LABELS[key] ?? key)
    .join(" ");
}

function swallow(event: MouseEvent): void {
  event.preventDefault();
}

function item(role: "menuitem" | "menuitemcheckbox" | "menuitemradio", { disabled, className, onClick, children, ...rest }: ItemBase, own: object, after?: ReactNode): ReactElement {
  return (
    <button
      {...(rest as ComponentPropsWithRef<"button">)}
      {...own}
      className={cx("odd-menu-item", className)}
      type="button"
      role={role}
      aria-disabled={disabled ? "true" : undefined}
      onClick={disabled ? swallow : onClick}
    >
      {children}
      {after}
    </button>
  );
}

/** button.odd-menu-item[role=menuitem], and a hidden keycap for its shortcut. Choosing it closes the menu. */
export function MenuItem({ tone, shortcut, command, commandfor, ...props }: MenuItemProps): ReactElement {
  const own = { "data-tone": tone, "aria-keyshortcuts": shortcut, command, commandfor };
  return item("menuitem", props, own, shortcut === undefined ? null : <kbd className="odd-menu-shortcut" aria-hidden="true">{keycap(shortcut)}</kbd>);
}

/** button.odd-menu-item[role=menuitemcheckbox]. Choosing it toggles aria-checked and keeps the menu open. */
export function MenuCheckboxItem({ defaultChecked = false, ...props }: MenuCheckboxItemProps): ReactElement {
  return item("menuitemcheckbox", props, { "aria-checked": defaultChecked ? "true" : "false" });
}

/** button.odd-menu-item[role=menuitemradio]. Choosing it checks it and unchecks the others in its MenuRadioGroup. */
export function MenuRadioItem({ defaultChecked = false, ...props }: MenuRadioItemProps): ReactElement {
  return item("menuitemradio", props, { "aria-checked": defaultChecked ? "true" : "false" });
}

export type MenuGroupProps = Root & {
  /** Shown above the group, and names it. */
  readonly label: string;
  /** The group's id. Generated when absent. */
  readonly id?: string;
  readonly children: ReactNode;
};

/** p.odd-menu-label, hidden from the tree because a menu holds only items, then div[role=group] named by it. */
export function MenuGroup({ label, id, className, children }: MenuGroupProps): ReactElement {
  const group = useOddId(id);
  const ids = idsOf(group, ["label"]);
  return (
    <>
      <p className="odd-menu-label" id={ids.label} aria-hidden="true">
        {label}
      </p>
      <div className={className} id={group} role="group" aria-labelledby={ids.label}>
        {children}
      </div>
    </>
  );
}

export type MenuRadioGroupProps = MenuGroupProps;

/** A MenuGroup of MenuRadioItems. One radio in it is checked at a time. */
export function MenuRadioGroup(props: MenuRadioGroupProps): ReactElement {
  return <MenuGroup {...props} />;
}

/** hr.odd-separator between groups of items. */
export function MenuSeparator(): ReactElement {
  return <Separator />;
}
