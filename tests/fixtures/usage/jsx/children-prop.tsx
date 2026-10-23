// expect: ODD-BUTTON-014 ODD-BUTTON-014
import { Button } from "odd-design/react";
export const view = (label: string) => (
  <>
    <Button iconOnly aria-label="Close" children="Close" />
    <button className="odd-button" children="x" data-icon-only aria-label="y" />
    <Button iconOnly aria-label="Close" children={label} />
  </>
);
