import { createElement, type ReactElement, type ReactNode } from "react";
import { cx, idsOf, mergeIds, useOddId, type Root } from "./own.ts";

/** What every labeled control takes. The label is required, so an unnamed control does not compile. */
export type Labeled = Root & {
  readonly label: string;
  /** Keeps the label for a screen reader and hides it on the page. */
  readonly hideLabel?: boolean;
  readonly hint?: ReactNode;
  /** An error marks the control invalid and describes it. Leave it unset while the value is valid. */
  readonly error?: ReactNode;
  /** The control's id. Generated when absent. */
  readonly id?: string;
};

export type FieldOwned = "aria-invalid" | "aria-labelledby" | "aria-label" | "aria-disabled";

export type FieldIds = { readonly control: string; readonly label: string; readonly hint: string; readonly error: string };

function present(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false;
}

/** The frame's ids, and the attributes its control takes. The caller's aria-describedby is merged, never dropped. */
export function useField(props: Labeled & { readonly "aria-describedby"?: string | undefined }) {
  const control = useOddId(props.id);
  const ids: FieldIds = { control, ...idsOf(control, ["label", "hint", "error"]) };
  const wiring = {
    id: control,
    "aria-describedby": mergeIds(props["aria-describedby"], present(props.hint) && ids.hint, present(props.error) && ids.error),
    "aria-invalid": present(props.error) ? ("true" as const) : undefined,
  };
  return { ids, wiring };
}

/** div.odd-field > label.odd-label + the control + p.odd-hint + p.odd-error */
export function FieldFrame({ field, ids, children }: { readonly field: Labeled; readonly ids: FieldIds; readonly children: ReactNode }): ReactElement {
  return createElement(
    "div",
    { className: cx("odd-field", field.className) },
    createElement("label", { className: cx("odd-label", field.hideLabel ? "odd-visually-hidden" : undefined), htmlFor: ids.control, id: ids.label }, field.label),
    children,
    present(field.hint) ? createElement("p", { className: "odd-hint", id: ids.hint }, field.hint) : null,
    present(field.error) ? createElement("p", { className: "odd-error", id: ids.error }, field.error) : null,
  );
}
