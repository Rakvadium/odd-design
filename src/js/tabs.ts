import { roving } from "./roving.ts";

const holders = new WeakMap<HTMLElement, { count: number; tablist: HTMLElement; stop: () => void }>();

/*
 * <div class="odd-tabs">
 *   <div role="tablist" aria-label="Deck view">
 *     <button role="tab" id="tab-cards" aria-controls="panel-cards" aria-selected="true">Cards</button>
 *     <button role="tab" id="tab-stats" aria-controls="panel-stats" aria-selected="false">Stats</button>
 *   </div>
 *   <div role="tabpanel" id="panel-cards" aria-labelledby="tab-cards">…</div>
 *   <div role="tabpanel" id="panel-stats" aria-labelledby="tab-stats" hidden>…</div>
 * </div>
 *
 * enhanceTabs keeps one tab in the tab order, moves between tabs with the arrow keys, Home, and End,
 * and shows the chosen tab's panel. By default a tab is chosen as focus reaches it. For panels that
 * are slow to fill, set data-activation="manual" on the tablist so Enter or Space chooses instead.
 * aria-orientation="vertical" on the tablist switches to Up and Down.
 * Fires a bubbling "odd-tab-change" event with { tab, panel } in its detail.
 * A root is wired once however many callers enhance it, and its listeners go when the last caller
 * cleans up. A root with no tablist yet is
 * left alone, so a later call can still wire it. A call after the tablist was replaced wires the new one.
 */
export function enhanceTabs(root: HTMLElement): () => void {
  const tablist = root.querySelector<HTMLElement>('[role="tablist"]');
  let hold = holders.get(root);
  if (hold === undefined) {
    if (!tablist) return () => {};
    hold = { count: 0, tablist, stop: wire(root, tablist) };
    holders.set(root, hold);
  } else if (tablist && tablist !== hold.tablist) {
    hold.stop();
    hold.tablist = tablist;
    hold.stop = wire(root, tablist);
  }
  hold.count++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--hold.count > 0) return;
    hold.stop();
    holders.delete(root);
  };
}

function wire(root: HTMLElement, tablist: HTMLElement): () => void {
  const tabs = () => [...tablist.querySelectorAll<HTMLElement>('[role="tab"]')];
  const panelOf = (tab: HTMLElement) => document.getElementById(tab.getAttribute("aria-controls") ?? "");

  const show = (tab: HTMLElement) => {
    for (const t of tabs()) {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = panelOf(t);
      if (panel) panel.hidden = !on;
    }
  };

  const select = (tab: HTMLElement) => {
    if (tab.getAttribute("aria-selected") === "true") return;
    show(tab);
    root.dispatchEvent(new CustomEvent("odd-tab-change", { bubbles: true, detail: { tab, panel: panelOf(tab) } }));
  };

  // A panel with nothing focusable inside takes focus itself, so Tab from the tab list reaches its content.
  for (const tab of tabs()) {
    const panel = panelOf(tab);
    if (panel && !panel.querySelector("a[href], button, input, select, textarea, [tabindex]")) panel.tabIndex = 0;
  }

  const initial = tabs().find((t) => t.getAttribute("aria-selected") === "true") ?? tabs()[0];
  if (initial) show(initial);

  const manual = tablist.dataset.activation === "manual";
  const stopRoving = roving(tablist, {
    items: tabs,
    orientation: tablist.getAttribute("aria-orientation") === "vertical" ? "vertical" : "horizontal",
    tabStop: true,
    onMove: manual ? undefined : select,
  });

  const onClick = (event: MouseEvent) => {
    const tab = (event.target as Element).closest<HTMLElement>('[role="tab"]');
    if (tab && tablist.contains(tab) && !tab.matches(":disabled")) select(tab);
  };
  // In manual mode focus can rest on a tab that isn't chosen. When focus leaves the list, put the
  // tab stop back on the chosen tab so Tab returns there.
  const onFocusOut = (event: FocusEvent) => {
    if (tablist.contains(event.relatedTarget as Node)) return;
    const chosen = tabs().find((t) => t.getAttribute("aria-selected") === "true");
    for (const t of tabs()) t.tabIndex = t === chosen ? 0 : -1;
  };
  tablist.addEventListener("click", onClick);
  tablist.addEventListener("focusout", onFocusOut);

  return () => {
    stopRoving();
    tablist.removeEventListener("click", onClick);
    tablist.removeEventListener("focusout", onFocusOut);
  };
}
