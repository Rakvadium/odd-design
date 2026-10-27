/*
 * Stepper: markup and data-step are described in src/css/components/stepper.css.
 *
 * enhanceStepper steps the number input with its own stepUp and stepDown, so min, max, and step
 * clamp and snap the value. A click or a keyboard press steps once. A held pointer press steps,
 * waits REPEAT_DELAY_MS, then steps every REPEAT_INTERVAL_MS until release or a limit. Each step
 * fires a bubbling input event on the number input. A change event follows once the press ends,
 * so a listener on change sees one event per press, however long it was held.
 */
const REPEAT_DELAY_MS = 400;
const REPEAT_INTERVAL_MS = 100;

export function enhanceStepper(root: HTMLElement): () => void {
  const input = root.querySelector<HTMLInputElement>('input[type="number"]');
  if (!input) return () => {};
  const buttons = () => [...root.querySelectorAll<HTMLButtonElement>("button[data-step]")];
  const blocked = (button: HTMLButtonElement) => button.getAttribute("aria-disabled") === "true";

  const sync = () => {
    const value = input.valueAsNumber;
    const min = input.min === "" ? -Infinity : Number(input.min);
    const max = input.max === "" ? Infinity : Number(input.max);
    for (const button of buttons()) {
      const down = Number(button.dataset.step) < 0;
      const off = input.disabled || input.readOnly || (down ? value <= min : value >= max);
      button.setAttribute("aria-disabled", String(off));
    }
  };

  /** Steps once and fires input. Returns whether the value changed. */
  const step = (button: HTMLButtonElement): boolean => {
    if (blocked(button)) return false;
    const count = Number(button.dataset.step);
    const before = input.value;
    try {
      if (count < 0) input.stepDown(-count);
      else input.stepUp(count);
    } catch {
      return false; // step="any" has no step to take.
    }
    if (input.value === before) return false;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  };

  const commit = () => input.dispatchEvent(new Event("change", { bubbles: true }));

  let hold: { timer: ReturnType<typeof setTimeout>; changed: boolean } | undefined;

  const release = () => {
    if (!hold) return;
    clearTimeout(hold.timer);
    const { changed } = hold;
    hold = undefined;
    if (changed) commit();
  };

  const target = (event: Event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>("button[data-step]");
    return button && root.contains(button) ? button : undefined;
  };

  const onPointerDown = (event: PointerEvent) => {
    const button = target(event);
    if (!button || event.button !== 0) return;
    release();
    button.setPointerCapture?.(event.pointerId);
    const repeat = () => {
      if (!hold || !step(button)) return;
      hold.changed = true;
      hold.timer = setTimeout(repeat, REPEAT_INTERVAL_MS);
    };
    hold = { changed: step(button), timer: setTimeout(repeat, REPEAT_DELAY_MS) };
  };

  // A pointer press already stepped on pointerdown. Keyboard presses and click() arrive with detail 0.
  const onClick = (event: MouseEvent) => {
    const button = target(event);
    if (button && event.detail === 0 && step(button)) commit();
  };

  const onContextMenu = (event: Event) => {
    if (target(event)) event.preventDefault();
  };

  const observer = new MutationObserver(sync);
  observer.observe(input, { attributes: true, attributeFilter: ["disabled", "readonly", "min", "max", "value"] });
  root.addEventListener("pointerdown", onPointerDown);
  root.addEventListener("pointerup", release);
  root.addEventListener("pointercancel", release);
  root.addEventListener("lostpointercapture", release);
  root.addEventListener("click", onClick);
  root.addEventListener("contextmenu", onContextMenu);
  root.addEventListener("input", sync);
  sync();

  return () => {
    release();
    observer.disconnect();
    root.removeEventListener("pointerdown", onPointerDown);
    root.removeEventListener("pointerup", release);
    root.removeEventListener("pointercancel", release);
    root.removeEventListener("lostpointercapture", release);
    root.removeEventListener("click", onClick);
    root.removeEventListener("contextmenu", onContextMenu);
    root.removeEventListener("input", sync);
  };
}
