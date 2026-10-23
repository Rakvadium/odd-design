// expect: ODD-STATIC-001 ODD-BUTTON-007
import { cn } from "./cn";
export const view = (active: boolean) => (
  <button className={cn("odd-button", active && "is-active")} disabled>
    Save
  </button>
);
