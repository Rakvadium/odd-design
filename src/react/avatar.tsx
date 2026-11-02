"use client";

import { useState, type ComponentPropsWithRef, type ReactElement, type ReactNode } from "react";
import type { AvatarRule } from "../js/usage/contract.ts";
import { cx, rejectBlank, type Passthrough, type Root, type Values } from "./own.ts";

export type AvatarSize = Values<AvatarRule, "data-size">;

type Named = "aria-label" | "aria-labelledby";

export type AvatarProps = Root &
  Passthrough<"span", Named | "aria-hidden" | "data-initials"> & {
    /** The person's name: the image's alt text, or the name of the initials. */
    readonly name: string;
    readonly src?: string;
    /** Shown when there is no image, or the image fails to load. The first letters of the first two words of name when omitted. */
    readonly initials?: string;
    readonly size?: AvatarSize;
    /** Beside a visible name, so a screen reader does not read the name twice. */
    readonly decorative?: boolean;
  };

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toUpperCase();
}

/**
 * span.odd-avatar with an img, or with initials when there is no image or it fails. The fallback is
 * React state, and data-initials is owned, so a page-level avatarFallback() never replaces children React renders.
 */
export function Avatar({ name, src, initials, size, decorative, className, ...rest }: AvatarProps): ReactElement {
  const [failed, setFailed] = useState<string>();
  const label = rejectBlank(name, "ODD-AVATAR-004");
  const own = { ...(rest as ComponentPropsWithRef<"span">), className: cx("odd-avatar", className), "data-size": size, "aria-hidden": decorative ? ("true" as const) : undefined };
  if (src !== undefined && failed !== src) {
    return (
      <span {...own}>
        <img src={src} alt={decorative ? "" : label} onError={() => setFailed(src)} />
      </span>
    );
  }
  return (
    <span {...own} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : label}>
      {initials ?? initialsOf(label)}
    </span>
  );
}

export type AvatarGroupProps = Root &
  Passthrough<"div", Named> & {
    /** The group's name, such as "Collaborators". */
    readonly label: string;
    /** Avatars. Each sets its own size. */
    readonly children: ReactNode;
  };

/** div.odd-avatar-group[role=group], named. */
export function AvatarGroup({ label, className, children, ...rest }: AvatarGroupProps): ReactElement {
  return (
    <div {...(rest as ComponentPropsWithRef<"div">)} className={cx("odd-avatar-group", className)} role="group" aria-label={rejectBlank(label, "ODD-AVATAR-004")}>
      {children}
    </div>
  );
}
