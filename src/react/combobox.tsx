"use client";

import { useRef, type ComponentPropsWithRef, type ReactElement, type ReactNode } from "react";
import { enhanceCombobox } from "../js/combobox.ts";
import type { ComboboxListRule } from "../js/usage/contract.ts";
import { FieldFrame, useField, type FieldOwned, type Labeled } from "./frame.ts";
import { cx, rejectBlank, useEnhancer, type Passthrough, type Root, type Values } from "./own.ts";

export type ComboboxFilter = Values<ComboboxListRule, "data-filter">;

type ComboboxOwned = FieldOwned | "type" | "aria-controls" | "aria-autocomplete" | "aria-expanded" | "aria-activedescendant";

export type ComboboxProps = Labeled &
  Passthrough<"input", ComboboxOwned, "id"> & {
    /** "manual" when your code filters the options and renders its own empty state. Omit it for the built-in prefix filter. */
    readonly filter?: ComboboxFilter;
    /** ComboboxOption elements. */
    readonly children?: ReactNode;
  };

const NO_RESULTS = "No results";

/**
 * The field frame around div.odd-combobox > input.odd-input[role=combobox] + div.odd-combobox-list[popover=manual][role=listbox].
 * enhanceCombobox owns open, the active option, and filtering after mount, and writes them back after every commit.
 */
export function Combobox({ label, hideLabel, hint, error, id, className, filter, children, ...rest }: ComboboxProps): ReactElement {
  const field = { label: rejectBlank(label, "ODD-COMBOBOX-006"), hideLabel, hint, error, id, className };
  const { ids, wiring } = useField({ ...field, "aria-describedby": rest["aria-describedby"] });
  const list = `${ids.control}-list`;
  const root = useRef<HTMLDivElement>(null);
  useEnhancer(root, enhanceCombobox);
  return (
    <FieldFrame field={field} ids={ids}>
      <div className="odd-combobox" ref={root}>
        <input
          {...(rest as ComponentPropsWithRef<"input">)}
          {...wiring}
          className="odd-input"
          role="combobox"
          aria-controls={list}
          aria-autocomplete="list"
          aria-expanded="false"
        />
        <div className="odd-combobox-list" id={list} popover="manual" role="listbox" aria-labelledby={ids.label} data-filter={filter}>
          {children}
          {filter === "manual" ? null : (
            <div className="odd-combobox-option" id={`${list}-empty`} role="option" aria-disabled="true" hidden>
              {NO_RESULTS}
            </div>
          )}
        </div>
      </div>
    </FieldFrame>
  );
}

export type ComboboxOptionProps = Root &
  Passthrough<"div", "aria-selected" | "aria-disabled", "disabled"> & {
    /** Stays in the list and cannot be chosen. */
    readonly disabled?: boolean;
    /** The text the input takes when this option is chosen. */
    readonly children: string;
  };

/** div.odd-combobox-option[role=option] */
export function ComboboxOption({ disabled, className, children, ...rest }: ComboboxOptionProps): ReactElement {
  return (
    <div {...(rest as ComponentPropsWithRef<"div">)} className={cx("odd-combobox-option", className)} role="option" aria-disabled={disabled ? "true" : undefined}>
      {children}
    </div>
  );
}
