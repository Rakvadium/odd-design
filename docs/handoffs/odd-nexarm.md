# Move the classes odd-design removed into odd-nexarm

odd-design no longer ships `odd-stepper`, `odd-range-field`, or `odd-stat`. Their CSS only laid out other odd-design classes, so it became three recipes made from core classes: [Number stepper](../recipes/number-stepper.md), [Slider with number](../recipes/slider-with-number.md), and [Stat row](../recipes/stat-row.md). `enhanceStepper` and `enhanceRangeField` stay in `odd-design/enhance`, but `enhance()` no longer finds them, because it found them by those classes.

The drive page in [Rakvadium/odd-nexarm](https://github.com/Rakvadium/odd-nexarm) uses all three classes. It serves the CSS and JS of the `../odd-design` checkout. After that checkout pulls this change and builds, the page shows these breaks:

- The jog steppers in the Joints table lose their layout, and their buttons stop stepping.
- The Speed field and the Move to fields lose their layout, and the slider and the number stop syncing.
- The Pose rows lose their two-column grid, so each value runs on right after its label.
- The jog inputs show their spin buttons again, and their digits are no longer centered.

This guide moves the removed CSS into the app under its own `arm-` names and wires the two behaviors from `drive.js`. The page then looks and works as it did. The file paths below are in `src/odd_nexarm/web/static/`.

## Add the removed CSS to `drive.css`

Add these rules to `drive.css`. They are the rules odd-design deleted, with each `odd-` class renamed to an `arm-` class. `drive.css` loads outside odd-design's cascade layers, so these rules beat odd-design's component rules, as the old rules did.

```css
.arm-stepper {
  display: flex;
  align-items: stretch;
  gap: var(--space-1);
}

.arm-stepper > .odd-button {
  flex: none;
  min-inline-size: var(--control-height);
  padding-inline: var(--space-2);
  font-variant-numeric: tabular-nums;
}

.arm-stepper > .odd-input {
  flex: 1 1 5rem;
  min-inline-size: 4rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
  appearance: textfield;
}
.arm-stepper > .odd-input::-webkit-inner-spin-button,
.arm-stepper > .odd-input::-webkit-outer-spin-button {
  appearance: none;
  margin: 0;
}

.arm-range-field {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.arm-range-field > .odd-slider {
  flex: 1 1 8rem;
  inline-size: auto;
  min-inline-size: 0;
}

.arm-range-field > .odd-input {
  flex: 0 0 6.5rem;
  font-variant-numeric: tabular-nums;
}

.arm-stat {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: baseline;
  gap: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
}
.arm-stat > label {
  color: var(--muted-foreground);
}
.arm-stat > :is(meter, progress) {
  grid-column: 1 / -1;
}
```

The `#pose-stat` template uses a `span.odd-muted`, not a `label`, and holds no bar. The last two `.arm-stat` rules do nothing there today. Keep them only if a stat with a `label` or a bar is planned.

## Rename the classes in `index.html`

Change four class names. The rest of the markup stays the same.

| Line | Element | Change |
| --- | --- | --- |
| 57 | The Speed field's row | `odd-range-field` to `arm-range-field` |
| 160 | The stepper in the `#joint-row` template | `odd-stepper` to `arm-stepper` |
| 188 | The row in the `#move-field` template | `odd-range-field` to `arm-range-field` |
| 196 | The `#pose-stat` template | `odd-stat` to `arm-stat` |

Leave `odd-stat-value` in `#pose-stat`. odd-design still ships it.

## Wire the steppers and the sliders in `drive.js`

`drive.js` clones the `#joint-row` and `#move-field` templates in `buildJoints`, then calls `enhance()` once near the end of the file. Until now, that one call wired every cloned stepper and slider row. It no longer wires steppers or slider rows, so wire each one yourself.

1. Add the two functions to the import from `/odd-design/js/enhance.js`:

   ```js
   import { appendLogLine, createToaster, enhance, enhanceRangeField, enhanceStepper } from "/odd-design/js/enhance.js";
   ```

2. In `buildJoints`, change the selector that names the jog group to the new class:

   ```js
   row.querySelector(".arm-stepper").setAttribute("aria-label", `Jog ${name.toLowerCase()}`);
   ```

3. In `buildJoints`, wire each jog stepper after `rows.append(row)`:

   ```js
   rows.append(row);
   enhanceStepper(row.querySelector(".arm-stepper"));
   ```

4. In `buildJoints`, wire each Move to row after `fields.append(field)`:

   ```js
   fields.append(field);
   enhanceRangeField(field.querySelector(".arm-range-field"));
   ```

   Call it after the slider has its `min` and `max`, and after the number input has its id. `enhanceRangeField` copies `min`, `max`, `step`, and the value from the slider once, and it builds the error id from the number input's id. The existing `Object.assign(slider, { min: low, max: high })` and `number.id = ...` lines already run before `fields.append(field)`.

5. Next to `enhance();`, wire the Speed field:

   ```js
   enhance();
   enhanceRangeField($("drive-speed").closest(".arm-range-field"));
   ```

Each call returns a cleanup function. The rows live as long as the page does, so the page can ignore it.

The stepper still fires `input` on each step and one `change` per press, so the `jog` listeners on each stepper input need no change. The slider still fires `input` for typed numbers, so the `touched` listener needs no change.

## Check the page

1. In the odd-design checkout, pull, then run `bun run build`.
2. Restart the odd-nexarm server, and open the drive page.
3. In the Joints table, click **+10** on a joint. The jog input moves by 10, and one jog request goes out when you release the button.
4. In Move to, drag a slider. Its number follows. Type a number past the safe range and press Tab. The slider stays put, and an error shows under the row.
5. In Pose, each value sits on the end of its label's line.

## Fix the toaster import too

This break is older than this change. odd-design removed `createToaster` in PR #34, so the import line in step 1 already fails against odd-design's `main`. To fix it, write a `section.odd-toaster` with `popover="manual"` and an `aria-label` in `index.html`, let `enhance()` wire it, and replace each `toaster.show(options)` call with `toast(options)` from `/odd-design/js/enhance.js`. Then drop `createToaster` from the import.
