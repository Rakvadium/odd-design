# Tabs usage rules

These codes apply to `odd-tabs`. Shared codes are in [General usage rules](general.md).

```html
<div class="odd-tabs">
  <div role="tablist" aria-label="Deck view">
    <button role="tab" id="tab-cards" aria-controls="panel-cards" aria-selected="true">Cards</button>
    <button role="tab" id="tab-stats" aria-controls="panel-stats" aria-selected="false">Stats</button>
  </div>
  <div role="tabpanel" id="panel-cards" aria-labelledby="tab-cards">…</div>
  <div role="tabpanel" id="panel-stats" aria-labelledby="tab-stats" hidden>…</div>
</div>
```

A tab set is a `div` with a `role="tablist"` as a direct child and the panels after it. Each tab is a `button` whose `aria-controls` names its panel's `id`. `enhanceTabs` adds the keyboard and switches the panels. `aria-orientation="vertical"` and `data-activation="manual"` go on the tablist. In React, `Tabs` renders the `div` and runs `enhanceTabs` itself, and you write the tablist, the tabs, and the panels.

## ODD-TABS-001

Fails when `odd-tabs` is on an element other than `div`.

Move the class onto a `div`. In React, use `Tabs`.

## ODD-TABS-002

Fails when a tab set has no element with `role="tablist"` as a direct child.

`tabs.css` styles only a direct child tablist. A tablist inside a wrapper loses its segmented track, and a vertical one does not form a column beside the panels. When the child comes from a component or an expression, ESLint cannot see it and stays silent. The runtime checker still reads the rendered page.

## ODD-TABS-003

Fails when `aria-orientation` or `data-activation` is on `odd-tabs` itself.

`tabs.css` and `enhanceTabs` read both on the tablist, so on the tab set they do nothing. A vertical set stays in a row, and a manual set chooses as focus moves. Move them onto the element with `role="tablist"`.

## ODD-TABS-004

Fails when an element with `role="tab"` is not a `button`, or has no `aria-controls`.

`enhanceTabs` shows the panel that `aria-controls` names. Without it, choosing a tab shows and hides no panel, so the panels keep whatever `hidden` they started with. In manual mode, Enter and Space choose through the button's own click, so a `div` tab cannot be chosen from the keyboard.

## ODD-TABS-005

Fails when a tab set has a system `data-*` attribute that it does not read, such as `data-tone`.

`tabs.css` reads no `data-*` attribute. Remove the attribute. App data attributes, the appearance axes, and the headless allowlist stay allowed.
