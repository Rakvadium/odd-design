"use client";

import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { modal, modalAttributes, modalBody, modalTitle, useModal, type ModalProps } from "./modal.ts";
import { cx } from "./own.ts";

export type DialogProps = ModalProps & {
  /** closedby="any", so a click outside closes it too. */
  readonly dismissible?: boolean;
};

/** A decision the user must make. It needs a description, and a click outside never closes it. */
export type AlertDialogProps = ModalProps & {
  readonly description: ReactNode;
  readonly dismissible?: never;
};

function render(props: DialogProps, role: "alertdialog" | undefined): ReactElement {
  const { trigger, id, title: _title, headingLevel, description, actions, onSubmit, dismissible, className, children, ...rest } = props;
  const { ids, title } = useModal(props, dismissible);
  return modal(
    props,
    ids,
    <dialog {...(rest as ComponentPropsWithRef<"dialog">)} {...modalAttributes(props, ids, dismissible)} className={cx("odd-dialog", className)} role={role}>
      {modalBody(
        "odd-dialog-body",
        props,
        ids,
        modalTitle(props, ids, title),
        children,
        actions === undefined ? null : <div className="odd-dialog-actions">{actions}</div>,
      )}
    </dialog>,
  );
}

/**
 * The trigger, then dialog.odd-dialog > (div|form).odd-dialog-body > h2.odd-dialog-title + the description + children + div.odd-dialog-actions.
 * The browser owns open, the top layer, Escape, and focus return.
 */
export function Dialog(props: DialogProps): ReactElement {
  return render(props, undefined);
}

/** Dialog with role="alertdialog". */
export function AlertDialog(props: AlertDialogProps): ReactElement {
  return render(props, "alertdialog");
}
