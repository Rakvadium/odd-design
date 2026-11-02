"use client";

import type { ComponentPropsWithRef, ReactElement } from "react";
import type { SheetRule } from "../js/usage/contract.ts";
import { Button } from "./button.tsx";
import { closeIcon } from "./icons.ts";
import { modal, modalAttributes, modalBody, modalTitle, useModal, type ModalProps } from "./modal.ts";
import { cx, type Owned, type Values } from "./own.ts";

export type SheetSide = Values<SheetRule, "data-side">;

export type SheetProps = ModalProps &
  Owned<"data-side"> & {
    /** closedby="any", so a click outside closes it too. */
    readonly dismissible?: boolean;
    /** The edge it slides in from. Omit it for the end edge. */
    readonly side?: SheetSide;
    /** The close button's name and tooltip. */
    readonly closeLabel?: string;
  };

/**
 * The trigger, then dialog.odd-sheet > div.odd-sheet-header (the title and an icon-only close Button)
 * + (div|form).odd-sheet-body + div.odd-sheet-footer with the actions.
 */
export function Sheet(props: SheetProps): ReactElement {
  const { trigger, id, title: _title, headingLevel, description, actions, onSubmit, dismissible, side, closeLabel = "Close", className, children, ...rest } = props;
  const { ids, title } = useModal(props, dismissible);
  return modal(
    props,
    ids,
    <dialog {...(rest as ComponentPropsWithRef<"dialog">)} {...modalAttributes(props, ids, dismissible)} className={cx("odd-sheet", className)} data-side={side}>
      <div className="odd-sheet-header">
        {modalTitle(props, ids, title)}
        <Button variant="ghost" iconOnly label={closeLabel} command="close" id={`${ids.base}-close`}>
          {closeIcon}
        </Button>
      </div>
      {modalBody("odd-sheet-body", props, ids, null, children)}
      {actions === undefined ? null : <div className="odd-sheet-footer">{actions}</div>}
    </dialog>,
  );
}
