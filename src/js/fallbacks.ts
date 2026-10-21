// Fallbacks for platform features some browsers lack. Each one does nothing where the browser has
// the feature, so it's safe to install everywhere and delete once support is universal.

type Root = Document | HTMLElement;

export const supportsInterestFor = () => "interestForElement" in HTMLButtonElement.prototype;
export const supportsClosedBy = () => "closedBy" in HTMLDialogElement.prototype;

/**
 * interestfor (Chromium only today): show the target popover while the pointer rests on its invoker
 * or keyboard focus is on it, and hide it when both leave or on Escape. The popover stays open while
 * the pointer is over it, so a hover card's content can be reached. Uses the same delays as Chromium.
 */
export function interestForFallback(root: Root = document, { showDelay = 500, hideDelay = 250 } = {}): () => void {
  if (supportsInterestFor()) return () => {};
  const timers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();
  const shown = new Set<HTMLElement>();

  const targetOf = (invoker: Element) => document.getElementById(invoker.getAttribute("interestfor") ?? "");
  const invokerOf = (node: EventTarget | null) => (node instanceof Element ? node.closest("[interestfor]") : null);
  const popoverOf = (node: EventTarget | null) =>
    node instanceof Element ? [...shown].find((p) => p.contains(node)) : undefined;

  const later = (target: HTMLElement, delay: number, run: () => void) => {
    clearTimeout(timers.get(target));
    timers.set(target, setTimeout(run, delay));
  };
  const show = (invoker: Element) => {
    const target = targetOf(invoker);
    if (!target) return;
    later(target, showDelay, () => {
      if (!target.matches(":popover-open")) target.showPopover({ source: invoker } as ShowPopoverOptions);
      shown.add(target);
    });
  };
  const hide = (target: HTMLElement, delay = hideDelay) =>
    later(target, delay, () => {
      if (target.matches(":popover-open")) target.hidePopover();
      shown.delete(target);
    });

  const onOver = (event: Event) => {
    const invoker = invokerOf(event.target);
    if (invoker) return show(invoker);
    const popover = popoverOf(event.target);
    if (popover) clearTimeout(timers.get(popover));
  };
  const onOut = (event: Event) => {
    const { target, relatedTarget } = event as PointerEvent;
    const invoker = invokerOf(target);
    const from = invoker ? targetOf(invoker) : popoverOf(target);
    if (!from) return;
    const into = invokerOf(relatedTarget);
    if ((into && targetOf(into) === from) || from.contains(relatedTarget as Node)) return;
    hide(from);
  };
  const onFocusIn = (event: Event) => {
    const invoker = invokerOf(event.target);
    if (invoker?.matches(":focus-visible")) show(invoker);
  };
  const onFocusOut = (event: Event) => {
    const invoker = invokerOf(event.target);
    const target = invoker && targetOf(invoker);
    if (target) hide(target);
  };
  const onKeyDown = (event: Event) => {
    if ((event as KeyboardEvent).key === "Escape") for (const target of [...shown]) hide(target, 0);
  };

  const listeners: [string, (e: Event) => void][] = [
    ["pointerover", onOver],
    ["pointerout", onOut],
    ["focusin", onFocusIn],
    ["focusout", onFocusOut],
    ["keydown", onKeyDown],
  ];
  for (const [type, fn] of listeners) root.addEventListener(type, fn);
  return () => {
    for (const [type, fn] of listeners) root.removeEventListener(type, fn);
  };
}

/**
 * closedby="any" (missing in Safari today): a click on a modal dialog's backdrop closes it.
 * Backdrop clicks are dispatched to the dialog itself but land outside its box.
 */
export function closedByFallback(root: Root = document): () => void {
  if (supportsClosedBy()) return () => {};
  const onClick = (event: Event) => {
    const { target, clientX: x, clientY: y } = event as MouseEvent;
    if (!(target instanceof HTMLDialogElement) || !target.open || target.getAttribute("closedby") !== "any") return;
    const r = target.getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) target.close();
  };
  root.addEventListener("click", onClick);
  return () => root.removeEventListener("click", onClick);
}
