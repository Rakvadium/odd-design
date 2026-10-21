// Arrow-key focus movement inside one composite widget (menu, tab list, toolbar).
// Every widget goes through here. When the `focusgroup` attribute ships beyond Chromium and its
// role and tab-order bugs are settled, this is the one place to hand the work to the browser.

export type RovingOptions = {
  /** The items in order. Read on every key press, so the list may change. */
  items: () => HTMLElement[];
  orientation: "horizontal" | "vertical";
  /** Keep exactly one item in the tab order (tabs, toolbars). Menus set focus on open instead. */
  tabStop?: boolean;
  /** Typing jumps to the next item whose text starts with what was typed. */
  typeahead?: boolean;
  /** Runs after a key moves focus to an item. */
  onMove?: (item: HTMLElement) => void;
};

const TYPEAHEAD_RESET_MS = 500;

/** Arrows move (and wrap), Home/End jump. Disabled items are skipped. Returns a cleanup function. */
export function roving(container: HTMLElement, options: RovingOptions): () => void {
  const { items, orientation, tabStop = false, typeahead = false, onMove } = options;
  let typed = "";
  let typedAt = -Infinity;

  const focusable = () => items().filter((el) => !el.matches(":disabled"));

  const moveTo = (target: HTMLElement | undefined) => {
    if (!target) return;
    if (tabStop) for (const el of items()) el.tabIndex = el === target ? 0 : -1;
    target.focus();
    onMove?.(target);
  };

  const match = (list: HTMLElement[], from: number, key: string, timeStamp: number) => {
    typed = timeStamp - typedAt > TYPEAHEAD_RESET_MS ? key : typed + key;
    typedAt = timeStamp;
    // Pressing one letter repeatedly cycles through the items starting with it.
    const query = [...typed].every((c) => c === typed[0]) ? typed[0]! : typed;
    const start = query.length === 1 ? from + 1 : from;
    const ordered = [...list.slice(start), ...list.slice(0, start)];
    return ordered.find((el) => (el.textContent ?? "").trim().toLowerCase().startsWith(query));
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const list = focusable();
    const current = list.indexOf(document.activeElement as HTMLElement);
    if (current === -1) return;

    const rtl = orientation === "horizontal" && getComputedStyle(container).direction === "rtl";
    const [back, forward] =
      orientation === "vertical" ? ["ArrowUp", "ArrowDown"] : rtl ? ["ArrowRight", "ArrowLeft"] : ["ArrowLeft", "ArrowRight"];

    let target: HTMLElement | undefined;
    if (event.key === forward) target = list[(current + 1) % list.length];
    else if (event.key === back) target = list[(current - 1 + list.length) % list.length];
    else if (event.key === "Home") target = list[0];
    else if (event.key === "End") target = list.at(-1);
    else if (typeahead && event.key.length === 1 && event.key !== " ") target = match(list, current, event.key.toLowerCase(), event.timeStamp);
    else return;

    event.preventDefault();
    moveTo(target);
  };

  if (tabStop) {
    const all = items();
    const first = all.find((el) => el.tabIndex === 0 && !el.matches(":disabled")) ?? focusable()[0];
    for (const el of all) el.tabIndex = el === first ? 0 : -1;
  }

  container.addEventListener("keydown", onKeyDown);
  return () => container.removeEventListener("keydown", onKeyDown);
}
