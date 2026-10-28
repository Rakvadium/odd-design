# Meter usage rules

These codes apply to `odd-meter` and `odd-progress`. Shared codes are in [General usage rules](general.md).

```html
<progress class="odd-progress" value="40" max="100" aria-label="Importing decks"></progress>
<meter class="odd-meter" min="0" max="60" value="22" data-tone="info" aria-label="Actions"></meter>
<meter class="odd-meter" value="0.93" low="0.6" high="0.85" optimum="0" aria-label="Storage"></meter>
```

A progress bar shows how far a task has run. Leave out `value` for an indeterminate bar. A meter shows a measurement inside a known range. With `low` or `high`, a meter colors itself by range, so it takes no `data-tone`. Without them, `data-tone` recolors either bar. Show the value as text too, because the bar alone is not enough. In React, `Progress` and `Meter` render the two bars, and `tone` sets `data-tone`.

A stat lays out a label, a value, and a bar:

```html
<div class="odd-stat">
  <label for="units">Units</label>
  <span class="odd-stat-value">24 <span class="odd-muted">(40%)</span></span>
  <meter class="odd-meter" id="units" min="0" max="60" value="24"></meter>
</div>
```

The `label` is a bare `label`, a direct child of `odd-stat`, and names the bar through `for`. `odd-stat-value` goes on a `span`, or on an `output` that follows a control. The bar is a direct child, so it spans the full row. The stat has no codes and no React part. Write it as native markup, with a `Meter` or `Progress` inside.

## ODD-METER-001

Fails when a bar class is on the wrong element.

| Class | Element |
| --- | --- |
| `odd-meter` | `meter` |
| `odd-progress` | `progress` |

A `div.odd-progress` or `div.odd-meter` draws an empty track with no value and no role. A screen reader hears nothing. On `progress.odd-meter`, the `::-webkit-progress-*` rules in `meter.css` are scoped to `.odd-progress`, so they miss, and the browser's own bar shows through in Chromium and WebKit.

Move the class onto its element. In React, use `Meter` or `Progress`.

## ODD-METER-002

Fails when `data-tone` is not `success`, `warning`, `danger`, or `info`.

`meter.css` colors those four tones. `primary` and `neutral`, copied from a badge or an alert, match nothing, so the bar silently draws its default color, which is already the primary color.

Set one of the four tones, or remove `data-tone` for the default bar.

## ODD-METER-003

Fails when a bar has a system `data-*` attribute other than `data-tone`.

`meter.css` reads only `data-tone`, so `data-size` and the rest do nothing. App data attributes, the appearance axes, and the headless allowlist stay allowed.

Remove the attribute, or correct its name.
