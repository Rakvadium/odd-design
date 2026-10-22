import { roving } from "./roving.ts";

/*
 * <button class="ds-button" commandfor="deck-actions" command="toggle-popover" aria-haspopup="menu">Actions</button>
 * <div class="ds-menu" id="deck-actions" popover role="menu" aria-label="Deck actions">
 *   <button class="ds-menu-item" role="menuitem">Rename</button>
 *   <button class="ds-menu-item" role="menuitemcheckbox" aria-checked="true">Show prices</button>
 *   <div role="group" aria-label="Sort by">
 *     <button class="ds-menu-item" role="menuitemradio" aria-checked="true">Name</button> …
 *   </div>
 *   <hr class="ds-separator">
 *   <button class="ds-menu-item" role="menuitem" data-tone="danger">Delete</button>
 * </div>
 *
 * The popover already opens from its invoker, closes on Escape or an outside click, and returns focus.
 * enhanceMenu adds the menu keyboard: focus lands on the first item, arrows, Home, End, and typing
 * move between items, and Tab closes. ArrowDown or ArrowUp on the trigger opens it at the first or
 * last item. A menuitem closes the menu when chosen; checkbox and radio items toggle and stay open.
 * Listen for click on the items to act on them.
 *
 * Disable an item with aria-disabled="true", not the disabled attribute. It stays reachable with the
 * arrows, so a screen-reader user hears that it exists and that it's unavailable (the APG's default
 * for menus), and it does nothing when chosen: enhanceMenu stops the click before your listeners see it.
 */
const ITEM = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';

export function enhanceMenu(menu: HTMLElement): () => void {
  const items = () => [...menu.querySelectorAll<HTMLElement>(ITEM)];
  const unavailable = (el: Element) => el.matches(':disabled, [aria-disabled="true"]');
  const enabled = () => items().filter((el) => !unavailable(el));
  const triggers = () => [
    ...document.querySelectorAll<HTMLElement>(`[commandfor="${CSS.escape(menu.id)}"], [popovertarget="${CSS.escape(menu.id)}"]`),
  ];
  let openAt: "first" | "last" = "first";
  let lastTrigger: HTMLElement | undefined;

  for (const el of items()) el.tabIndex = -1;
  const stopRoving = roving(menu, { items, orientation: "vertical", typeahead: true });

  const onToggle = (event: Event) => {
    if ((event as ToggleEvent).newState !== "open") return;
    (openAt === "last" ? enabled().at(-1) : enabled()[0])?.focus();
    openAt = "first";
  };

  // Capture phase, so a disabled item's click never reaches the item's or the menu's own listeners.
  const onDisabledClick = (event: MouseEvent) => {
    const item = (event.target as Element).closest<HTMLElement>(ITEM);
    if (item && menu.contains(item) && unavailable(item)) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const onClick = (event: MouseEvent) => {
    const item = (event.target as Element).closest<HTMLElement>(ITEM);
    if (!item || !menu.contains(item) || unavailable(item)) return;
    const role = item.getAttribute("role");
    if (role === "menuitemcheckbox") {
      item.setAttribute("aria-checked", String(item.getAttribute("aria-checked") !== "true"));
    } else if (role === "menuitemradio") {
      const group = item.closest('[role="group"]') ?? menu;
      for (const radio of group.querySelectorAll('[role="menuitemradio"]')) radio.setAttribute("aria-checked", String(radio === item));
    } else {
      menu.hidePopover();
    }
  };

  // Tab leaves the menu. Focus the trigger first, so the browser's Tab moves on from the trigger
  // rather than from the menu's own place in the document.
  const onMenuKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;
    (lastTrigger ?? triggers()[0])?.focus();
    menu.hidePopover();
  };
  const onTriggerUse = (event: Event) => {
    lastTrigger = event.currentTarget as HTMLElement;
  };

  const onTriggerKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    openAt = event.key === "ArrowUp" ? "last" : "first";
    lastTrigger = event.currentTarget as HTMLElement;
    if (menu.matches(":popover-open")) (openAt === "last" ? enabled().at(-1) : enabled()[0])?.focus();
    else menu.showPopover({ source: event.currentTarget } as ShowPopoverOptions);
  };

  const bound = triggers();
  menu.addEventListener("toggle", onToggle);
  menu.addEventListener("click", onDisabledClick, true);
  menu.addEventListener("click", onClick);
  menu.addEventListener("keydown", onMenuKeyDown);
  for (const t of bound) {
    t.addEventListener("keydown", onTriggerKeyDown);
    t.addEventListener("click", onTriggerUse);
  }

  return () => {
    stopRoving();
    menu.removeEventListener("toggle", onToggle);
    menu.removeEventListener("click", onDisabledClick, true);
    menu.removeEventListener("click", onClick);
    menu.removeEventListener("keydown", onMenuKeyDown);
    for (const t of bound) {
      t.removeEventListener("keydown", onTriggerKeyDown);
      t.removeEventListener("click", onTriggerUse);
    }
  };
}
