// expect: none
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
export const view = (
  <DropdownMenu.Trigger asChild>
    <button className="odd-button" data-state="open" data-disabled="" aria-expanded="true">
      Options
    </button>
  </DropdownMenu.Trigger>
);
