// expect: ODD-SHEET-001 ODD-SHEET-001 ODD-DIALOG-002 ODD-DIALOG-004 ODD-DIALOG-006 ODD-SHEET-002 ODD-SHEET-002 ODD-SHEET-003 ODD-SHEET-003 ODD-STATIC-001 ODD-STATIC-001
import { Sheet, SheetFooter, SheetHeader, type SheetProps } from "odd-design/react";
declare const props: SheetProps;
declare const side: SheetProps["side"];
export const view = (
  <>
    <Sheet id="a" side="start" aria-labelledby="a-title" closedby="any"><SheetHeader><h2 className="odd-dialog-title" id="a-title">Filters</h2></SheetHeader><form className="odd-sheet-body" /><SheetFooter /></Sheet>
    <div className="odd-sheet" aria-label="Filters" />
    <header className="odd-sheet-header" />
    <Sheet id="b" />
    <Sheet aria-label="Filters" open />
    <Sheet role="alertdialog" aria-label="Discard changes?" closedby="any" />
    <Sheet aria-label="Filters" side="end" />
    <dialog className="odd-sheet" aria-label="Filters" data-side="left" />
    <Sheet aria-label="Filters" data-tone="danger" />
    <SheetHeader data-variant="primary" />
    <Sheet aria-label="Filters" side={side} />
    <Sheet {...props} />
  </>
);
