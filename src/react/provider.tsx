"use client";

import type { ReactElement, ReactNode } from "react";
import { LinkContext, type LinkComponent } from "./context.ts";

export type { LinkComponent };

export type OddProviderProps = {
  /** The router's link component, which every odd-design anchor renders through. */
  readonly link?: LinkComponent;
  readonly children: ReactNode;
};

export function OddProvider({ link = "a", children }: OddProviderProps): ReactElement {
  return <LinkContext value={link}>{children}</LinkContext>;
}
