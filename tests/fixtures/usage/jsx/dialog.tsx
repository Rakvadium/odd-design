// expect: ODD-STATIC-001 ODD-DIALOG-001 ODD-DIALOG-002 ODD-DIALOG-002 ODD-DIALOG-003 ODD-DIALOG-003 ODD-DIALOG-004 ODD-DIALOG-005 ODD-DIALOG-006 ODD-DIALOG-007 ODD-DIALOG-008 ODD-DIALOG-008 ODD-STATIC-001
import { Dialog, DialogActions, type DialogProps } from "odd-design/react";
declare const props: DialogProps;
declare const name: string;
export const view = (
  <>
    <Dialog id="a" aria-labelledby="a-title" closedby="any"><div className="odd-dialog-body"><h2 className="odd-dialog-title" id="a-title">Delete deck?</h2><DialogActions /></div></Dialog>
    <dialog className="odd-dialog" role="alertdialog" aria-label={name} closedby="closerequest"><form className="odd-dialog-body" method="dialog" /></dialog>
    <Dialog {...props} />
    <div className="odd-dialog" aria-label="Delete deck" />
    <Dialog id="b" />
    <Dialog id="c" aria-label="" />
    <Dialog role="dialog" aria-label="Appearance" />
    <Dialog role="region" aria-label="Appearance" />
    <Dialog aria-label="Appearance" open />
    <Dialog aria-label="Appearance" closedby="none" />
    <Dialog role="alertdialog" aria-label="Discard changes?" closedby="any" />
    <Dialog aria-label="Appearance" data-tone="danger" />
    <div className="odd-dialog-body" data-tone="danger" />
    <DialogActions data-variant="danger" />
    <Dialog aria-label="Appearance" {...props} />
  </>
);
