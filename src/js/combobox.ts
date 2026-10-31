type Holder = { count: number; stop: () => void; project: () => void };

const holders = new WeakMap<HTMLElement, Holder>();

/*
 * <div class="odd-combobox">
 *   <input class="odd-input" id="city" role="combobox" aria-controls="city-list" aria-expanded="false" aria-autocomplete="list">
 *   <div class="odd-combobox-list" id="city-list" popover="manual" role="listbox" aria-labelledby="city-label">
 *     <div class="odd-combobox-option" role="option">Amsterdam</div>
 *     <div class="odd-combobox-option" role="option" aria-disabled="true">Atlantis</div>
 *   </div>
 * </div>
 *
 * An editable combobox with list autocomplete and manual selection (the APG pattern). Focus stays in
 * the input, so the caret, typing, and IME keep working, and aria-activedescendant points at the
 * active option. That is why this does not use roving, which moves focus.
 *
 * Typing filters the options by prefix and opens the list with nothing active. ArrowDown and ArrowUp
 * open it at the first or last option, then move and wrap, skipping aria-disabled options. Enter
 * clicks the active option; with nothing active it closes the list and the form submits. Escape
 * closes and keeps the text, and stops there so a dialog around the combobox stays open. Tab closes
 * without choosing. Left, Right, Home, and End move the caret and clear the active option. A click on
 * the input opens the list, and a click on an option chooses it without moving focus.
 *
 * Choosing writes the option's text into the input and dispatches input (inputType
 * insertReplacementText) and change, so a controlled React input gets one onChange. Listen for click
 * on the options to act on a choice: Enter clicks too. A disabled option's click never reaches you.
 *
 * The options are the list's children, read on every event and watched, so options rendered later
 * (async results, React) are filtered and shown as they land. With data-filter="manual" on the list,
 * your code filters and every option present is shown. When the built-in filter matches nothing, the
 * list shows a disabled No results option.
 *
 * Open and the active option live here, not in the DOM. Each enhanceCombobox call writes them onto
 * aria-expanded, the popover, aria-activedescendant, and aria-selected, so the attributes follow this
 * record whatever React renders. A root is wired once however many callers enhance it, and its
 * listeners go when the last caller cleans up.
 */
export function enhanceCombobox(root: HTMLElement): () => void {
  let hold = holders.get(root);
  if (hold === undefined) {
    hold = { count: 0, ...wire(root) };
    holders.set(root, hold);
  }
  hold.count++;
  hold.project();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--hold.count > 0) return;
    hold.stop();
    holders.delete(root);
  };
}

const OPTION = '[role="option"]';
const unavailable = (option: Element) => option.getAttribute("aria-disabled") === "true";
const textOf = (option: Element) => (option.textContent ?? "").replace(/\s+/g, " ").trim();

function wire(root: HTMLElement): Omit<Holder, "count"> {
  const input = () => root.querySelector<HTMLInputElement>(':scope > input[role="combobox"]');
  const list = () => {
    const id = input()?.getAttribute("aria-controls");
    return id ? root.querySelector<HTMLElement>(`:scope > #${CSS.escape(id)}`) : null;
  };
  const empty = document.createElement("div");
  empty.className = "odd-combobox-option";
  empty.setAttribute("role", "option");
  empty.setAttribute("aria-disabled", "true");
  empty.textContent = "No results";
  const options = () => [...(list()?.querySelectorAll<HTMLElement>(OPTION) ?? [])].filter((option) => option !== empty);
  const shown = () => options().filter((option) => !option.hidden);
  const enabled = () => shown().filter((option) => !unavailable(option));
  const manual = () => list()?.dataset.filter === "manual";

  let wanted = false;
  let open = false;
  let active: HTMLElement | null = null;
  let replacing = false;

  const project = () => {
    const field = input();
    const popup = list();
    if (!field || !popup) return;
    const noResults = open && !manual() && shown().length === 0;
    if (noResults && empty.parentElement !== popup) popup.append(empty);
    if (!noResults && empty.isConnected) empty.remove();
    field.setAttribute("aria-expanded", String(open));
    if (open !== popup.matches(":popover-open")) {
      if (open) popup.showPopover();
      else popup.hidePopover();
    }
    for (const option of options()) {
      if (option === active) option.setAttribute("aria-selected", "true");
      else if (option.hasAttribute("aria-selected")) option.removeAttribute("aria-selected");
    }
    if (active) field.setAttribute("aria-activedescendant", active.id);
    else field.removeAttribute("aria-activedescendant");
  };

  const update = () => {
    const field = input();
    const popup = list();
    open = wanted && field !== null && popup !== null && !field.disabled && (manual() ? shown() : options()).length > 0;
    if (!open || (active && !enabled().includes(active))) active = null;
    project();
  };

  const filter = () => {
    if (manual()) return;
    const query = (input()?.value ?? "").trim().toLocaleLowerCase();
    for (const option of options()) {
      const hide = !textOf(option).toLocaleLowerCase().startsWith(query);
      if (option.hidden !== hide) option.hidden = hide;
    }
  };

  const close = () => {
    wanted = false;
    update();
  };

  const activate = (option: HTMLElement | null) => {
    active = option;
    if (option) {
      if (!option.id) {
        let id: string;
        let n = 0;
        do id = `${list()!.id}-${++n}`;
        while (document.getElementById(id));
        option.id = id;
      }
      option.scrollIntoView({ block: "nearest" });
    }
    project();
  };

  const step = (by: 1 | -1) => {
    const reachable = enabled();
    if (reachable.length === 0) return;
    const at = active ? reachable.indexOf(active) : -1;
    activate(at === -1 ? (by === 1 ? reachable[0]! : reachable.at(-1)!) : reachable[(at + by + reachable.length) % reachable.length]!);
  };

  const choose = (option: HTMLElement) => {
    const field = input()!;
    const value = textOf(option);
    if (!field.disabled && field.value !== value) {
      // HTMLInputElement's own setter skips React's value tracker, so React's onChange sees the input event.
      replacing = true;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(field, value);
      field.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertReplacementText", data: value }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
      replacing = false;
    }
    filter();
    close();
  };

  const onInput = (event: Event) => {
    if (replacing || event.target !== input()) return;
    wanted = true;
    active = null;
    filter();
    update();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.target !== input() || event.isComposing || event.ctrlKey || event.metaKey) return;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        if (event.altKey) {
          if (event.key === "ArrowUp") close();
          else if (!open) {
            wanted = true;
            update();
          }
          return;
        }
        if (!open) {
          wanted = true;
          update();
        }
        if (open) step(event.key === "ArrowDown" ? 1 : -1);
        return;
      case "Enter":
        if (!open || !active) {
          if (open) close();
          return;
        }
        event.preventDefault();
        active.click();
        return;
      case "Escape":
        if (open) {
          event.preventDefault();
          event.stopPropagation();
        }
        close();
        return;
      case "Tab":
        close();
        return;
      case "ArrowLeft":
      case "ArrowRight":
      case "Home":
      case "End":
        activate(null);
        return;
    }
  };

  // Capture phase, so a disabled option's click never reaches the option's or the app's listeners.
  const onDisabledClick = (event: MouseEvent) => {
    const option = (event.target as Element).closest<HTMLElement>(OPTION);
    if (option && list()?.contains(option) && unavailable(option)) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const onClick = (event: MouseEvent) => {
    const target = event.target as Element;
    const option = target.closest<HTMLElement>(OPTION);
    if (option && list()?.contains(option)) return choose(option);
    if (target === input() && !open) {
      wanted = true;
      update();
    }
  };

  // A press in the list keeps focus in the input, so focusout doesn't close the list before the click.
  const onPress = (event: Event) => {
    if (list()?.contains(event.target as Node)) event.preventDefault();
  };

  const onFocusOut = (event: FocusEvent) => {
    if (!root.contains(event.relatedTarget as Node | null)) close();
  };

  // Only children and text: the attributes this module writes would otherwise call it back.
  const observer = new MutationObserver(() => {
    filter();
    update();
  });

  const field = input();
  if (field && !field.hasAttribute("autocomplete")) field.setAttribute("autocomplete", "off");
  filter();
  observer.observe(root, { childList: true, subtree: true, characterData: true });
  root.addEventListener("input", onInput);
  root.addEventListener("keydown", onKeyDown);
  root.addEventListener("click", onDisabledClick, true);
  root.addEventListener("click", onClick);
  root.addEventListener("pointerdown", onPress);
  root.addEventListener("mousedown", onPress);
  root.addEventListener("focusout", onFocusOut);

  return {
    project,
    stop: () => {
      observer.disconnect();
      root.removeEventListener("input", onInput);
      root.removeEventListener("keydown", onKeyDown);
      root.removeEventListener("click", onDisabledClick, true);
      root.removeEventListener("click", onClick);
      root.removeEventListener("pointerdown", onPress);
      root.removeEventListener("mousedown", onPress);
      root.removeEventListener("focusout", onFocusOut);
      wanted = false;
      open = false;
      active = null;
      project();
    },
  };
}
