"use client";

import { useImperativeHandle, useLayoutEffect, useRef, type ComponentPropsWithRef, type ReactElement, type ReactNode } from "react";
import { enhanceTabs } from "../js/tabs.ts";
import { cx, useEnhancer, useOddId, type Passthrough, type Root } from "./own.ts";

export type TabItem<V extends string> = {
  readonly value: V;
  readonly label: ReactNode;
  readonly content: ReactNode;
  readonly disabled?: boolean;
};

type TabsOwned = "aria-orientation" | "data-activation";

export type TabsProps<V extends string> = Root &
  Passthrough<"div", TabsOwned, "id" | "defaultValue"> & {
    /** The tablist's name. */
    readonly label: string;
    /** Each item renders a tab and its panel. */
    readonly tabs: readonly [TabItem<V>, ...TabItem<V>[]];
    /** The first choice. enhanceTabs owns the choice after mount. Defaults to the first enabled tab. */
    readonly defaultValue?: NoInfer<V>;
    /** "manual" for panels that are slow to fill: the arrows move focus, and Enter or Space chooses. */
    readonly activation?: "automatic" | "manual";
    readonly orientation?: "horizontal" | "vertical";
    readonly onValueChange?: (value: V) => void;
    /** The base of the tab and panel ids. Generated when absent. */
    readonly id?: string;
  };

/**
 * div.odd-tabs > the tablist, then one tabpanel per tab, each named by its tab. enhanceTabs owns the
 * choice, the tab stop, and the panels after mount, and shows the user's choice again after every commit.
 */
export function Tabs<const V extends string>({ label, tabs, defaultValue, activation, orientation, onValueChange, id, className, ref, ...rest }: TabsProps<V>): ReactElement {
  const base = useOddId(id);
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  useEnhancer(root, enhanceTabs);
  useLayoutEffect(() => {
    const node = root.current!;
    if (onValueChange === undefined) return;
    const onChange = (event: Event) => {
      const tablist = node.querySelector(':scope > [role="tablist"]');
      const index = [...(tablist?.children ?? [])].indexOf((event as CustomEvent<{ tab: HTMLElement }>).detail.tab);
      const tab = tabs[index];
      if (tab) onValueChange(tab.value);
    };
    node.addEventListener("odd-tab-change", onChange);
    return () => node.removeEventListener("odd-tab-change", onChange);
  }, [tabs, onValueChange]);
  const initial = defaultValue ?? tabs.find((tab) => !tab.disabled)?.value;
  return (
    <div {...(rest as ComponentPropsWithRef<"div">)} ref={root} id={base} className={cx("odd-tabs", className)}>
      <div role="tablist" aria-label={label} aria-orientation={orientation === "vertical" ? "vertical" : undefined} data-activation={activation === "manual" ? "manual" : undefined}>
        {tabs.map((tab, index) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            id={`${base}-tab-${index}`}
            aria-controls={`${base}-panel-${index}`}
            aria-selected={tab.value === initial ? "true" : "false"}
            tabIndex={tab.value === initial ? 0 : -1}
            disabled={tab.disabled}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div key={tab.value} role="tabpanel" id={`${base}-panel-${index}`} aria-labelledby={`${base}-tab-${index}`} hidden={tab.value !== initial}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}
