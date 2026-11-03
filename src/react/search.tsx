"use client";

import { type ComponentPropsWithRef, type FormEventHandler, type ReactElement } from "react";
import type { FieldOwned } from "./frame.ts";
import { searchIcon } from "./icons.ts";
import { cx, useOddId, type Passthrough, type Root } from "./own.ts";

export type SearchProps = Root &
  Passthrough<"input", FieldOwned | "type", "id" | "onSubmit"> & {
    /** Names the field. It stays hidden on the page, where the magnifier and the placeholder show the purpose. */
    readonly label: string;
    /** The input's id. Generated when absent. */
    readonly id?: string;
    /** With a handler, the search sits in a form and Enter submits. Without one, it filters as the user types. */
    readonly onSubmit?: FormEventHandler<HTMLFormElement>;
  };

/** search.odd-search > a hidden label + the magnifier + input.odd-input[type=search], or search > form.odd-search with onSubmit. */
export function Search({ label, id, className, onSubmit, ...rest }: SearchProps): ReactElement {
  const control = useOddId(id);
  const parts = (
    <>
      <label className="odd-visually-hidden" htmlFor={control}>
        {label}
      </label>
      {searchIcon}
      <input {...(rest as ComponentPropsWithRef<"input">)} id={control} type="search" className="odd-input" />
    </>
  );
  if (onSubmit === undefined) return <search className={cx("odd-search", className)}>{parts}</search>;
  return (
    <search className={className}>
      <form className="odd-search" onSubmit={onSubmit}>
        {parts}
      </form>
    </search>
  );
}
