// expect: ODD-STATIC-001 ODD-STATIC-001 ODD-TOAST-001 ODD-TOAST-001 ODD-TOAST-002 ODD-TOAST-002 ODD-TOAST-003 ODD-TOAST-004
import { Toaster, type ToasterProps } from "odd-design/react";
declare const mode: "manual";
declare const props: ToasterProps;
export const view = (
  <>
    <Toaster popover="manual" aria-label="Notifications" />
    <section className="odd-toaster" popover="manual" aria-label="Notifications" />
    <Toaster {...props} />
    <Toaster popover={mode} aria-label="Notifications" />
    <div className="odd-toaster" popover="manual" aria-label="Notifications" />
    <aside className="odd-toaster" popover="manual" aria-label="Notifications" />
    <section className="odd-toaster" aria-label="Notifications" />
    <Toaster popover="auto" aria-label="Notifications" />
    <Toaster popover="manual" />
    <Toaster popover="manual" aria-label="Notifications" data-tone="success" />
  </>
);
