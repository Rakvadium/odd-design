import { closedByFallback, interestForFallback } from "./fallbacks.ts";
import { enhanceMenu } from "./menu.ts";
import { enhanceRangeField } from "./range-field.ts";
import { enhanceStepper } from "./stepper.ts";
import { enhanceTabs } from "./tabs.ts";

export { closedByFallback, interestForFallback, supportsClosedBy, supportsInterestFor } from "./fallbacks.ts";
export { enhanceMenu } from "./menu.ts";
export { enhanceRangeField, type RangeFieldOptions } from "./range-field.ts";
export { enhanceStepper } from "./stepper.ts";
export { enhanceTabs } from "./tabs.ts";
export { createToaster, type Toaster, type ToastOptions, type ToastTone } from "./toast.ts";
export { roving, type RovingOptions } from "./roving.ts";

/**
 * Avatar image fallback: <span class="odd-avatar" data-initials="KN"><img src="…" alt="Kai Nakamura"></span>
 * When the image fails to load, the avatar shows its initials and keeps the image's name
 * (or stays hidden, if the image was decorative with alt="").
 */
export function avatarFallback(root: Document | HTMLElement = document): () => void {
  const swap = (img: HTMLImageElement) => {
    const avatar = img.closest<HTMLElement>(".odd-avatar[data-initials]");
    if (!avatar) return;
    const name = img.alt;
    avatar.textContent = avatar.dataset.initials!;
    if (name) {
      avatar.setAttribute("role", "img");
      avatar.setAttribute("aria-label", name);
    } else {
      avatar.setAttribute("aria-hidden", "true");
    }
  };
  const onError = (event: Event) => {
    if (event.target instanceof HTMLImageElement) swap(event.target);
  };
  root.addEventListener("error", onError, true);
  // Images that failed before this ran.
  for (const img of root.querySelectorAll<HTMLImageElement>(".odd-avatar[data-initials] > img")) {
    if (img.complete && img.naturalWidth === 0) swap(img);
  }
  return () => root.removeEventListener("error", onError, true);
}

/**
 * Table select-all: <th><input type="checkbox" data-select-all aria-label="Select all decks"></th>
 * Checking it checks every row; checking rows updates it to checked, unchecked, or mixed.
 * Rows it changes fire a bubbling change event, as if the user had clicked them.
 */
export function enhanceSelectAll(table: HTMLTableElement): () => void {
  const all = table.querySelector<HTMLInputElement>('thead input[type="checkbox"][data-select-all]');
  if (!all) return () => {};
  const rows = () => [...table.querySelectorAll<HTMLInputElement>('tbody input[type="checkbox"]:not(:disabled)')];

  const sync = () => {
    const list = rows();
    const checked = list.filter((c) => c.checked).length;
    all.checked = list.length > 0 && checked === list.length;
    all.indeterminate = checked > 0 && checked < list.length;
  };
  const onChange = (event: Event) => {
    if (event.target === all) {
      // Read once: each row's change event re-enters this handler and re-syncs `all` mid-loop.
      const checked = all.checked;
      for (const row of rows()) {
        if (row.checked === checked) continue;
        row.checked = checked;
        row.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
    sync();
  };
  table.addEventListener("change", onChange);
  sync();
  return () => table.removeEventListener("change", onChange);
}

/**
 * Wires every behavior under root: menus (.odd-menu[role="menu"]), tab sets (.odd-tabs), steppers
 * (.odd-stepper), range fields (.odd-range-field), select-all tables, avatar fallbacks, and the
 * interestfor and closedby fallbacks. Elements added later need their own enhance* call. Returns
 * one cleanup function for everything.
 */
export function enhance(root: Document | HTMLElement = document): () => void {
  const cleanups = [
    ...[...root.querySelectorAll<HTMLElement>('.odd-menu[role="menu"]')].map(enhanceMenu),
    ...[...root.querySelectorAll<HTMLElement>(".odd-tabs")].map(enhanceTabs),
    ...[...root.querySelectorAll<HTMLElement>(".odd-stepper")].map(enhanceStepper),
    ...[...root.querySelectorAll<HTMLElement>(".odd-range-field")].map((field) => enhanceRangeField(field)),
    ...[...root.querySelectorAll<HTMLTableElement>("table:has([data-select-all])")].map(enhanceSelectAll),
    avatarFallback(root),
    interestForFallback(root),
    closedByFallback(root),
  ];
  return () => cleanups.forEach((fn) => fn());
}
