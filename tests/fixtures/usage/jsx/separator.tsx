// expect: ODD-SEPARATOR-002 ODD-SEPARATOR-003 ODD-SEPARATOR-003 ODD-SEPARATOR-004 ODD-SEPARATOR-001
import { Separator } from "odd-design/react";
export const view = (
  <>
    <Separator />
    <Separator aria-orientation="verticle" />
    <Separator role="none" />
    <Separator aria-hidden="true" />
    <Separator data-tone="danger" />
    <div className="odd-separator" />
  </>
);
