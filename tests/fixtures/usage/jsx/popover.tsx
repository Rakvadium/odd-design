// expect: ODD-STATIC-001 ODD-STATIC-001 ODD-POPOVER-001 ODD-POPOVER-002 ODD-POPOVER-002 ODD-POPOVER-002 ODD-POPOVER-003 ODD-POPOVER-005 ODD-POPOVER-004 ODD-POPOVER-006 ODD-STATIC-001
import { Popover, type PopoverProps } from "odd-design/react";
declare const props: PopoverProps;
declare const kind: "auto";
export const view = (
  <>
    <Popover id="a" popover="auto" role="dialog" aria-labelledby="a-title" />
    <div className="odd-popover" id="b" popover="" role="dialog" aria-label="Filter decks" />
    <Popover {...props} />
    <Popover id="c" popover={kind} />
    <span className="odd-popover" id="d" popover="auto" />
    <div className="odd-popover" id="e" />
    <Popover id="f" popover="manual" />
    <Popover id="g" popover="hint" />
    <Popover id="h" popover="auto" role="menu" aria-label="Deck actions" />
    <Popover id="i" popover="auto" aria-labelledby="i-title" />
    <Popover id="j" popover="auto" role="dialog" />
    <Popover id="k" popover="auto" data-tone="info" />
    <Popover aria-labelledby="l-title" {...props} />
  </>
);
