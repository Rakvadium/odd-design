import { createElement, type FormEventHandler, type ReactElement, type ReactNode } from "react";
import { closedByFallback } from "../js/fallbacks.ts";
import { overlaid } from "./context.ts";
import { idsOf, rejectBlank, useFallback, useOddId, type HeadingLevel, type Passthrough, type Root } from "./own.ts";
import { Muted } from "./typography.tsx";

/** The attributes a modal writes on its dialog. */
export type ModalOwned = "aria-label" | "aria-labelledby" | "aria-describedby" | "closedby" | "open";

/** What Dialog, AlertDialog, and Sheet share. The title is required, so an unnamed dialog does not compile. */
export type ModalProps = Root &
  Passthrough<"dialog", ModalOwned, "id" | "title" | "onSubmit"> & {
    /** The Button that opens it, which gets command="show-modal" and commandfor. Omit it when a Button elsewhere opens it by id. */
    readonly trigger?: ReactElement;
    /** The dialog's id, for an opener elsewhere on the page. Generated when absent. */
    readonly id?: string;
    /** The heading that names the dialog. */
    readonly title: string;
    readonly headingLevel?: HeadingLevel;
    /** A muted paragraph at the top of the body that describes the dialog. */
    readonly description?: ReactNode;
    /** Buttons. One with command="close" closes this dialog, and one with type="submit" submits its body. */
    readonly actions?: ReactNode;
    /** Makes the body a form with method="dialog", so a submit Button closes the dialog after this runs. */
    readonly onSubmit?: FormEventHandler<HTMLFormElement>;
    readonly children?: ReactNode;
  };

export type ModalIds = { readonly base: string; readonly title: string; readonly description: string; readonly body: string };

/** The modal's ids, its rejected-blank title, and the closedby fallback while a dismissible modal is mounted. */
export function useModal(props: ModalProps, dismissible: boolean | undefined): { readonly ids: ModalIds; readonly title: string } {
  const base = useOddId(props.id);
  useFallback(dismissible ? closedByFallback : undefined);
  return { ids: { base, ...idsOf(base, ["title", "description", "body"]) }, title: rejectBlank(props.title, "ODD-DIALOG-002") };
}

/** The dialog's own attributes, written after the caller's. */
export function modalAttributes(props: ModalProps, ids: ModalIds, dismissible: boolean | undefined) {
  return {
    id: ids.base,
    "aria-labelledby": ids.title,
    "aria-describedby": props.description === undefined ? undefined : ids.description,
    closedby: dismissible ? ("any" as const) : undefined,
  };
}

export function modalTitle(props: ModalProps, ids: ModalIds, title: string): ReactElement {
  return createElement(`h${props.headingLevel ?? 2}`, { className: "odd-dialog-title", id: ids.title }, title);
}

/** The body, a form with method="dialog" when onSubmit is set. The description follows the title, when the title is in the body. */
export function modalBody(className: string, props: ModalProps, ids: ModalIds, title: ReactNode, ...children: ReactNode[]): ReactElement {
  const description = props.description === undefined ? null : createElement(Muted, { id: ids.description, children: props.description });
  return props.onSubmit === undefined
    ? createElement("div", { className }, title, description, ...children)
    : createElement("form", { className, id: ids.body, method: "dialog", onSubmit: props.onSubmit }, title, description, ...children);
}

/** The trigger with command="show-modal", then the dialog, whose close and submit Buttons need no commandfor or form. */
export function modal(props: ModalProps, ids: ModalIds, dialog: ReactElement): ReactElement {
  return overlaid(
    props.trigger,
    { kind: "command", command: "show-modal", commandfor: ids.base },
    { id: ids.base, close: "close", form: props.onSubmit === undefined ? undefined : ids.body },
    dialog,
  );
}
