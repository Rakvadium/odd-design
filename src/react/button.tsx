"use client";

import { use, type ComponentPropsWithRef, type MouseEvent, type ReactElement, type ReactNode } from "react";
import type { ButtonRule } from "../js/usage/contract.ts";
import { Anchor, OverlayContext, TriggerContext } from "./context.ts";
import { newTabParts, useTooltip } from "./invoker.ts";
import { cx, rejectBlank, type Passthrough, type Root, type Values } from "./own.ts";

export type ButtonVariant = Values<ButtonRule, "data-variant">;
export type ButtonSize = Values<ButtonRule, "data-size">;
export type ButtonCommand = "show-modal" | "close" | "request-close" | "show-popover" | "hide-popover" | "toggle-popover" | `--${string}`;

type ButtonOwned = "aria-disabled" | "aria-busy" | "aria-current" | "aria-label" | "aria-labelledby" | "aria-haspopup" | "interestfor" | "target" | "rel";

type Shared = Root & {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly children: ReactNode;
};

/** An icon-only button's label is its name and its tooltip. A button with visible text is named by that text. */
type Naming =
  | { readonly iconOnly: true; readonly label: string; readonly tooltip?: never }
  | {
      readonly iconOnly?: false;
      readonly label?: never;
      /** Text shown on hover or keyboard focus, which also describes the button to a screen reader. */
      readonly tooltip?: string;
    };

type AsLink = Passthrough<"a", ButtonOwned, "href"> & {
  readonly href: string;
  /** Marks the link as the current page. */
  readonly current?: boolean;
  /** Opens the link in a new tab, and says so to a screen reader. */
  readonly newTab?: boolean;
  readonly disabled?: never;
  readonly busy?: never;
};

type AsButton = Passthrough<"button", ButtonOwned, "type" | "disabled"> & {
  readonly href?: undefined;
  readonly current?: never;
  readonly newTab?: never;
  readonly type?: "button" | "submit" | "reset";
  /** Stays focusable and ignores clicks, so a screen reader can still find it. */
  readonly disabled?: boolean;
  /** Draws the busy ring and ignores clicks. */
  readonly busy?: boolean;
  /** An invoker command for a target elsewhere on the page. An overlay's own trigger and close buttons get theirs from the overlay. */
  readonly command?: ButtonCommand;
  readonly commandfor?: string;
};

export type ButtonProps = Shared & Naming & (AsLink | AsButton);

function swallow(event: MouseEvent): void {
  event.preventDefault();
}

function closes(command: ButtonCommand | undefined): boolean {
  return command === "close" || command === "request-close" || command === "hide-popover";
}

export function Button(props: ButtonProps): ReactElement {
  const trigger = use(TriggerContext);
  const overlay = use(OverlayContext);
  const text = props.iconOnly ? rejectBlank(props.label, "ODD-BUTTON-008") : props.tooltip;
  const { invoker, tooltip } = useTooltip(props.id, text, props.iconOnly ? "name" : "description", props["aria-describedby"]);

  const shared = {
    className: cx("odd-button", props.className),
    "data-variant": props.variant,
    "data-size": props.size,
    "data-icon-only": props.iconOnly ? "" : undefined,
    ...invoker,
  };
  const content = <TriggerContext value={null}>{props.children}</TriggerContext>;

  if (props.href !== undefined) {
    const { variant, size, iconOnly, label, tooltip: _tooltip, href, current, newTab, disabled, busy, className, children, ...rest } = props;
    const tab = newTabParts(newTab);
    return (
      <>
        <Anchor {...(rest as ComponentPropsWithRef<"a">)} {...shared} href={href} aria-current={current ? "page" : undefined} {...tab.attributes}>
          {content}
          {tab.words}
        </Anchor>
        {tooltip}
      </>
    );
  }

  const { variant, size, iconOnly, label, tooltip: _tooltip, current, newTab, disabled, busy, className, children, type = "button", command, commandfor, form, onClick, ...rest } = props;
  const wired = trigger?.kind === "command" ? trigger : undefined;
  const chosen = wired?.command ?? (command === "close" && commandfor === undefined && overlay !== null ? overlay.close : command);
  const blocked = disabled === true || busy === true;
  return (
    <>
      <button
        {...(rest as ComponentPropsWithRef<"button">)}
        {...shared}
        type={type}
        {...{ command: chosen, commandfor: wired?.commandfor ?? commandfor ?? (closes(chosen) ? overlay?.id : undefined) }}
        form={form ?? (type === "submit" ? overlay?.form : undefined)}
        aria-haspopup={wired?.haspopup}
        aria-disabled={disabled ? "true" : undefined}
        aria-busy={busy ? "true" : undefined}
        onClick={blocked ? swallow : onClick}
      >
        {content}
      </button>
      {tooltip}
    </>
  );
}
