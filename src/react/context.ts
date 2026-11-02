"use client";

import { createContext, createElement, use, type ComponentPropsWithRef, type ComponentType, type ReactElement } from "react";
import type { ButtonCommand } from "./button.tsx";

/** Wiring an overlay hands to its trigger. The reader consumes it and provides null to its own subtree. */
export type Invoker =
  | { readonly kind: "command"; readonly commandfor: string; readonly command: ButtonCommand; readonly haspopup?: "menu" | "dialog" }
  | { readonly kind: "interest"; readonly interestfor: string };

export const TriggerContext = createContext<Invoker | null>(null);

/** The enclosing overlay, so a close or submit Button inside it needs no commandfor or form. */
export type Overlay = { readonly id: string; readonly close: ButtonCommand; readonly form?: string };

export const OverlayContext = createContext<Overlay | null>(null);

export type AnchorProps = ComponentPropsWithRef<"a"> & { readonly href: string };

/** "a", or a router's link component that takes href and anchor props. */
export type LinkComponent = "a" | ComponentType<AnchorProps>;

export const LinkContext = createContext<LinkComponent>("a");

/** A client leaf, so a server-safe component can render a router link. */
export function Anchor(props: AnchorProps): ReactElement {
  return createElement(use(LinkContext), props);
}
