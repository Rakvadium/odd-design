// expect: ODD-STATIC-001 ODD-MENU-001 ODD-MENU-001 ODD-POPOVER-002 ODD-MENU-002 ODD-MENU-003 ODD-MENU-004 ODD-MENU-005 ODD-MENU-006 ODD-MENU-007 ODD-STATIC-001
import { Menu, MenuItem, type MenuItemProps } from "odd-design/react";
declare const props: MenuItemProps;
declare const tone: MenuItemProps["tone"];
export const view = (
  <>
    <Menu id="a" popover="auto" role="menu" aria-label="Deck actions"><MenuItem role="menuitem">Rename</MenuItem><MenuItem role="menuitemcheckbox" aria-checked="true">Show prices</MenuItem></Menu>
    <MenuItem {...props} />
    <section className="odd-menu" id="b" popover="" role="menu" aria-label="Deck actions" />
    <div className="odd-menu-item" role="menuitem">Rename</div>
    <Menu id="c" popover="manual" role="menu" aria-label="Deck actions" />
    <Menu id="d" popover="auto" role="listbox" aria-label="Deck actions" />
    <Menu id="e" popover="auto" role="menu" />
    <Menu id="f" popover="auto" role="menu" aria-label="Deck actions" data-tone="danger" />
    <MenuItem role="option">Share</MenuItem>
    <MenuItem role="menuitem" tone="info">Share</MenuItem>
    <MenuItem role="menuitem" disabled>Merge</MenuItem>
    <MenuItem role="menuitem" tone={tone}>Delete</MenuItem>
  </>
);
