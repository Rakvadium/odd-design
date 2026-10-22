/*
 * Toasts: short messages that don't interrupt and leave on their own.
 *
 *   const toaster = createToaster();            // once per page; adds the region to <body>
 *   toaster.show({ title: "Deck saved", tone: "success", action: { label: "Undo", onClick: undo } });
 *
 * The region is a manual popover that stays open, so toasts sit in the top layer. It holds a hidden
 * polite live region from the start, and each toast adds one line there: its title and description as
 * a sentence. The visible toast isn't live, so its buttons ("Dismiss: Deck saved") aren't read out as
 * part of the message. A modal dialog makes the rest of the page inert, so while one is open the
 * region moves inside it, and moves back when it closes. Toasts pause while the
 * pointer or focus is in the region, each has a Dismiss button, and they leave after `duration`
 * (default 6 s; pass Infinity to keep one). Never make a toast the only place a piece of information
 * or an action lives: it can vanish before someone gets to it.
 */
export type ToastTone = "neutral" | "info" | "success" | "warning" | "danger";

export type ToastOptions = {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
  action?: { label: string; onClick: () => void };
};

export type Toaster = {
  show: (options: ToastOptions) => { dismiss: () => void };
  destroy: () => void;
};

const REHOME_DELAY_MS = 150;

const CLOSE_ICON =
  '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

export function createToaster({ label = "Notifications", max = 3, parent = document.body } = {}): Toaster {
  const region = document.createElement("section");
  region.className = "ds-toaster";
  region.popover = "manual";
  region.setAttribute("aria-label", label);
  const list = document.createElement("ol");
  const announcer = document.createElement("div");
  announcer.className = "ds-visually-hidden";
  announcer.setAttribute("aria-live", "polite");
  announcer.setAttribute("aria-relevant", "additions");
  region.append(list, announcer);
  parent.append(region);
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
    if (!region.contains(document.activeElement)) resume();
  };
  const onFocusOut = (event: FocusEvent) => {
    if (!region.contains(event.relatedTarget as Node) && !region.matches(":hover")) resume();
  };
  region.addEventListener("pointerenter", pause);
  region.addEventListener("pointerleave", onPointerLeave);
  region.addEventListener("focusin", pause);
  region.addEventListener("focusout", onFocusOut);

  // Outside an open modal dialog the region would be inert: not announced and not clickable.
  const rehome = () => {
    const modal = [...document.querySelectorAll<HTMLDialogElement>("dialog:modal")].at(-1);
    const host = modal ?? parent;
    if (region.parentElement === host) return false;
    host.append(region);
    region.showPopover();
    modal?.addEventListener("close", () => rehome(), { once: true });
    return true;
  };

  const show = ({ title, description, tone = "neutral", duration = 6000, action }: ToastOptions) => {
    const el = document.createElement("li");
    el.className = "ds-toast";
    el.dataset.tone = tone;

    const body = document.createElement("div");
    body.className = "ds-toast-body";
    const heading = document.createElement("p");
    heading.className = "ds-toast-title";
    heading.textContent = title;
    body.append(heading);
    if (description) {
      const text = document.createElement("p");
      text.className = "ds-toast-description";
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
      button.className = "ds-button";
      button.dataset.size = "sm";
      button.textContent = action.label;
      button.addEventListener("click", () => {
        action.onClick();
        dismiss(t);
      });
      el.append(button);
    }

    const close = document.createElement("button");
    close.className = "ds-button";
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
    if (!moved && !region.contains(document.activeElement)) {
      region.hidePopover();
      region.showPopover();
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
    for (const old of [...live].slice(0, Math.max(0, live.size - max))) dismiss(old);
    return { dismiss: () => dismiss(t) };
  };

  return {
    show,
    destroy: () => {
      live.forEach(stop);
      region.remove();
    },
  };
}
