import { createElement, type ReactElement, type ReactNode } from "react";
import { interestForFallback } from "../js/fallbacks.ts";
import { VisuallyHidden } from "./layout.tsx";
import { mergeIds, useFallback, useOddId } from "./own.ts";

/** How a tooltip relates to its invoker: it names an icon-only control, or describes one with visible text. */
export type TooltipRole = "name" | "description";

/**
 * span.odd-tooltip[popover=hint][role=tooltip] after its invoker, and the invoker's references to it.
 * The interest fallback is installed while a tooltip is mounted, so no enhance() call is needed.
 */
export function useTooltip(id: string | undefined, text: string | undefined, role: TooltipRole, describedby: string | undefined) {
  const tip = `${useOddId(id)}-tooltip`;
  useFallback(text === undefined ? undefined : interestForFallback);
  if (text === undefined) return { invoker: { "aria-describedby": describedby }, tooltip: null };
  return {
    invoker: {
      "aria-labelledby": role === "name" ? tip : undefined,
      "aria-describedby": mergeIds(describedby, role === "description" && tip),
      interestfor: tip,
    },
    tooltip: createElement("span", { className: "odd-tooltip", id: tip, popover: "hint", role: "tooltip" }, text),
  };
}

const NEW_TAB = "(opens in a new tab)";

/** target and rel for a link that opens a new tab, and the hidden words that say so. */
export function newTabParts(newTab: boolean | undefined): { readonly attributes: { target?: "_blank"; rel?: "noopener" }; readonly words: ReactNode } {
  return newTab ? { attributes: { target: "_blank", rel: "noopener" }, words: createElement(VisuallyHidden, null, ` ${NEW_TAB}`) } : { attributes: {}, words: null };
}
