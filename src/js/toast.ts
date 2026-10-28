export type ToastTone = "neutral" | "info" | "success" | "warning" | "danger";

export type ToastOptions = {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
  action?: { label: string; onClick: () => void };
};

type Show = (options: ToastOptions) => { dismiss: () => void };

const MAX = 3;
const REHOME_DELAY_MS = 150;

const CLOSE_ICON =
  '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

const toasters = new Map<HTMLElement, { count: number; show: Show; stop: () => void }>();

/**
 * Wires a toaster region. A region is wired once however many callers enhance it, and the last
 * cleanup unwires and empties it. A region whose popover is not "manual" is left alone.
 */
export function enhanceToaster(region: HTMLElement): () => void {
  if (region.getAttribute("popover") !== "manual") return () => {};
  let hold = toasters.get(region);
  if (hold === undefined) {
    hold = { count: 0, ...wire(region) };
    toasters.set(region, hold);
  }
  hold.count++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--hold.count > 0) return;
    hold.stop();
    toasters.delete(region);
  };
}

/** Shows a toast on the newest wired region still in the document. */
export function toast(options: ToastOptions): { dismiss: () => void } {
  for (const [region, hold] of toasters) {
    if (region.isConnected) continue;
    hold.stop();
    toasters.delete(region);
  }
  const newest = [...toasters.values()].at(-1);
  if (newest === undefined)
    throw new Error(
      'toast() found no toaster. Write <section class="odd-toaster" popover="manual" aria-label="Notifications"></section> and call enhance(), or render <Toaster popover="manual" aria-label="Notifications" /> from odd-design/react.',
    );
  return newest.show(options);
}

function wire(region: HTMLElement): { show: Show; stop: () => void } {
  const controller = new AbortController();
  const { signal } = controller;
  const list = document.createElement("ol");
  const announcer = document.createElement("div");
  announcer.className = "odd-visually-hidden";
  announcer.setAttribute("aria-live", "polite");
  announcer.setAttribute("aria-relevant", "additions");
  region.append(list, announcer);
  region.showPopover();

  type Live = { el: HTMLLIElement; said: HTMLParagraphElement; remaining: number; startedAt: number; timer?: ReturnType<typeof setTimeout> };
  const live = new Set<Live>();
  let paused = false;

  const start = (t: Live) => {
    if (paused || !Number.isFinite(t.remaining)) return;
    t.startedAt = performance.now();
    t.timer = setTimeout(() => dismiss(t), t.remaining);
  };
  const stop = (t: Live) => {
    if (t.timer === undefined) return;
    clearTimeout(t.timer);
    t.timer = undefined;
    t.remaining -= performance.now() - t.startedAt;
  };

  const dismiss = (t: Live) => {
    if (!live.delete(t)) return;
    stop(t);
    const hadFocus = t.el.contains(document.activeElement);
    t.el.dataset.state = "closing";
    t.said.remove();
    Promise.all(t.el.getAnimations().map((a) => a.finished)).finally(() => t.el.remove());
    // Focus was on the toast's button; hand it to the next toast or let the page take it back.
    if (hadFocus) [...live].at(-1)?.el.querySelector("button")?.focus();
  };

  const pause = () => {
    paused = true;
    live.forEach(stop);
  };
  const resume = () => {
    paused = false;
    live.forEach(start);
  };
  const onPointerLeave = () => {
    if (!list.contains(document.activeElement)) resume();
  };
  const onFocusOut = (event: FocusEvent) => {
    if (!list.contains(event.relatedTarget as Node) && !list.matches(":hover")) resume();
  };
  list.addEventListener("pointerenter", pause, { signal });
  list.addEventListener("pointerleave", onPointerLeave, { signal });
  list.addEventListener("focusin", pause, { signal });
  list.addEventListener("focusout", onFocusOut, { signal });

  // Outside an open modal dialog the toasts would be inert: not announced and not clickable.
  let stand: HTMLElement | undefined;
  let standIn: HTMLDialogElement | undefined;
  const rehome = () => {
    const modal = [...document.querySelectorAll<HTMLDialogElement>("dialog:modal")].at(-1);
    if (modal === standIn) return false;
    stand?.remove();
    stand = standIn = undefined;
    if (modal === undefined) {
      region.append(list, announcer);
      return true;
    }
    stand = region.cloneNode(false) as HTMLElement;
    stand.removeAttribute("id");
    modal.append(stand);
    stand.showPopover();
    stand.append(list, announcer);
    standIn = modal;
    modal.addEventListener("close", () => rehome(), { once: true, signal });
    return true;
  };

  const show = ({ title, description, tone = "neutral", duration = 6000, action }: ToastOptions) => {
    const el = document.createElement("li");
    el.className = "odd-toast";
    el.dataset.tone = tone;

    const body = document.createElement("div");
    body.className = "odd-toast-body";
    const heading = document.createElement("p");
    heading.className = "odd-toast-title";
    heading.textContent = title;
    body.append(heading);
    if (description) {
      const text = document.createElement("p");
      text.className = "odd-toast-description";
      text.textContent = description;
      body.append(text);
    }
    el.append(body);

    // What's announced: one sentence, so the title and description don't run together.
    const said = document.createElement("p");
    said.textContent = [title, description].filter(Boolean).map((s) => (/[.!?…]$/.test(s!) ? s : `${s}.`)).join(" ");

    const t: Live = { el, said, remaining: duration, startedAt: 0 };

    if (action) {
      const button = document.createElement("button");
      button.className = "odd-button";
      button.dataset.size = "sm";
      button.textContent = action.label;
      button.addEventListener("click", () => {
        action.onClick();
        dismiss(t);
      });
      el.append(button);
    }

    const close = document.createElement("button");
    close.className = "odd-button";
    close.dataset.variant = "ghost";
    close.dataset.size = "sm";
    close.dataset.iconOnly = "";
    close.setAttribute("aria-label", `Dismiss: ${title}`);
    close.innerHTML = CLOSE_ICON;
    close.addEventListener("click", () => dismiss(t));
    el.append(close);

    live.add(t);
    const moved = rehome();
    // Re-raise the region so it lands above anything opened since, unless focus is in a toast.
    if (!moved && !list.contains(document.activeElement)) {
      const host = stand ?? region;
      host.hidePopover();
      host.showPopover();
    }
    const insert = () => {
      if (!live.has(t)) return;
      list.append(el);
      announcer.append(said);
      start(t);
    };
    // A live region that just moved needs a moment before screen readers watch it again.
    if (moved) setTimeout(insert, REHOME_DELAY_MS);
    else insert();
    for (const old of [...live].slice(0, Math.max(0, live.size - MAX))) dismiss(old);
    return { dismiss: () => dismiss(t) };
  };

  return {
    show,
    stop: () => {
      controller.abort();
      live.forEach(stop);
      live.clear();
      stand?.remove();
      list.remove();
      announcer.remove();
      region.hidePopover();
    },
  };
}
