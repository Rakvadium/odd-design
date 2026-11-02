# Move the classes odd-design removed into odd-nexarm

odd-design no longer ships `odd-stepper`, `odd-range-field`, or `odd-stat`. Their CSS only laid out other odd-design classes, so it became three recipes made from core classes: [Number stepper](../recipes/number-stepper.md), [Slider with number](../recipes/slider-with-number.md), and [Stat row](../recipes/stat-row.md). `enhanceStepper` and `enhanceRangeField` stay in `odd-design/enhance`, but `enhance()` no longer finds them, because it found them by those classes.

The drive page in [Rakvadium/odd-nexarm](https://github.com/Rakvadium/odd-nexarm) uses all three classes. It serves the CSS and JS of the `../odd-design` checkout. After that checkout pulls this change and builds, the page shows these breaks:

- The jog steppers in the Joints table lose their layout, and their buttons stop stepping.
- The Speed field and the Move to fields lose their layout, and the slider and the number stop syncing.
- The Pose rows lose their two-column grid, so each value runs on right after its label.
- The jog inputs show their spin buttons again, and their digits are no longer centered.

One older break comes first. `drive.js` imports `createToaster`, which odd-design removed in PR #34, so against odd-design's `main` the module throws at load and nothing on the page runs.

This guide moves the removed CSS into the app under its own `arm-` names, wires the two behaviors from `drive.js`, and replaces the toaster with `toast()`. [Move the e-stop into the app](#move-the-e-stop-into-the-app) does the same for `odd-estop`, which odd-design also removed. The page then looks and works as it did. The file paths below are in `src/odd_nexarm/web/static/`. Each line number is from the file as it is today, before any step in this guide.

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

Change four class names. [Replace the toaster](#replace-the-toaster-with-toast) adds one element later.

| Line | Element | Change |
| --- | --- | --- |
| 57 | The Speed field's row | `odd-range-field` to `arm-range-field` |
| 160 | The stepper in the `#joint-row` template | `odd-stepper` to `arm-stepper` |
| 188 | The row in the `#move-field` template | `odd-range-field` to `arm-range-field` |
| 196 | The `#pose-stat` template | `odd-stat` to `arm-stat` |

Leave `odd-stat-value` in `#pose-stat`. odd-design still ships it.

## Wire the steppers and the sliders in `drive.js`

`drive.js` clones the `#joint-row` and `#move-field` templates in `buildJoints`, then calls `enhance()` once near the end of the file. Until now, that one call wired every cloned stepper and slider row. It no longer wires steppers or slider rows, so wire each one yourself.

1. Change the import from `/odd-design/js/enhance.js`. Add the two functions, and swap `createToaster` for `toast`:

   ```js
   import { appendLogLine, enhance, enhanceRangeField, enhanceStepper, toast } from "/odd-design/js/enhance.js";
   ```

   `drive.js` still uses `createToaster` and `toaster` after this change. [Replace the toaster](#replace-the-toaster-with-toast) removes each use. The page does not load until that section is done too.

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

## Replace the toaster with `toast()`

`toast(options)` takes the same `title`, `description`, and `tone` as `toaster.show(options)` did. It shows the toast on the `section.odd-toaster` that `enhance()` wires, and it throws when the page has none. Every call below runs after a request or a server message, so `enhance()` has wired the region by then.

1. In `index.html`, add the region once, after the `</div>` that closes `.odd-shell` and before the `#overwrite` dialog:

   ```html
   <section class="odd-toaster" popover="manual" aria-label="Notifications"></section>
   ```

2. In `drive.js`, delete line 34:

   ```js
   const toaster = createToaster();
   ```

3. In `drive.js`, change `toaster.show(` to `toast(` in three places. The options stay the same.

   | Line | Where |
   | --- | --- |
   | 63 | `complain` |
   | 258 | The `#move` submit listener in `wire`, for **Nothing to move** |
   | 294 | `record`, for **Recorded** |

4. In `drive.js`, stop passing the toaster to `createLiveDrive` on line 305:

   ```js
   const live = createLiveDrive({ send, stop });
   ```

5. In `live.js`, add the import after the header comment, above `const MAX_VELOCITY`. `live.js` has no imports yet.

   ```js
   import { toast } from "/odd-design/js/enhance.js";
   ```

6. In `live.js`, drop `toaster` from the parameters of `createLiveDrive` on line 50:

   ```js
   export function createLiveDrive({ send, stop }) {
   ```

7. In `live.js`, change `toaster.show(` to `toast(` in `refused` on line 160:

   ```js
   if (!complained) toast({ title: "Drive refused", description: message, tone: "danger" });
   ```

After these steps, neither file names `toaster` or `createToaster`.

## Move the e-stop into the app

odd-design no longer ships `odd-estop`. Its look and its "never disable it" rule belong to a machine, so the stop moves into the app. The header's Stop button (`index.html:22`) carries `odd-estop arm-estop`. After the odd-design checkout pulls and builds, the button keeps only the size and text from the `.arm-estop` rule. It loses its round red cap, its yellow collar, and its pressed-in latched look, and in forced colors the latched state no longer shows.

### Add the e-stop CSS to `drive.css`

Add these rules near the top of `drive.css`, above the existing `.arm-estop` rule. They are the rules odd-design deleted, with `odd-estop` renamed to `arm-estop`. Keep the existing rule after them. It sets the 5rem size and small text that fit the header, and it wins because it comes later at the same specificity.

```css
.arm-estop {
  --_rim: color-mix(in oklab, var(--danger), black 30%);

  display: inline-grid;
  place-items: center;
  inline-size: 8rem;
  aspect-ratio: 1;
  padding: var(--space-1);
  border: 0.5rem solid var(--warning);
  border-radius: 50%;
  background-color: var(--danger);
  color: var(--danger-foreground);
  box-shadow: inset 0 0 0 3px var(--_rim), inset 0 -0.35rem 0 3px var(--_rim), var(--shadow-control);
  font: inherit;
  font-family: var(--font-label);
  font-size: var(--text-xl);
  font-weight: 800;
  line-height: 1.1;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  transition-property: box-shadow, transform;
  transition-duration: var(--duration-fast);
  transition-timing-function: var(--ease);
}

.arm-estop:hover {
  box-shadow: inset 0 0 0 3px var(--_rim), inset 0 -0.35rem 0 3px var(--_rim), var(--shadow-control-hover);
}

.arm-estop:active,
.arm-estop[aria-pressed="true"] {
  transform: scale(0.95);
  box-shadow: inset 0 0 0 3px var(--_rim), inset 0 0.5rem 1rem var(--_rim);
}

.arm-estop:focus-visible {
  outline: calc(var(--focus-width) + 2px) solid var(--focus-color);
  outline-offset: 4px;
}

@media (forced-colors: active) {
  .arm-estop {
    border-color: ButtonText;
  }
  .arm-estop[aria-pressed="true"] {
    forced-color-adjust: none;
    border-color: ButtonText;
    background-color: Highlight;
    color: HighlightText;
    box-shadow: none;
  }
}
```

The forced-colors block keeps the latched state visible when the system replaces every color. Without it, the latched cap looks the same as the resting one.

### Drop `odd-estop` from `index.html`

On line 22, change `class="odd-estop arm-estop"` to `class="arm-estop"`. The rest of the button stays the same. `drive.js` already sets `aria-pressed` on `#stop` while the stop holds, and that attribute draws the latched cap. Never give the button `disabled` or `aria-disabled`.

## Check the page

1. In the odd-design checkout, pull, then run `bun run build`.
2. Restart the odd-nexarm server, and open the drive page. The console shows no error.
3. In the Joints table, click **+10** on a joint. The jog input moves by 10, and one jog request goes out when you release the button.
4. In Move to, drag a slider. Its number follows. Type a number past the safe range and press Tab. The slider stays put, and an error shows under the row.
5. In Pose, each value sits on the end of its label's line.
6. With no slider moved since the last move, press **Move**. A **Nothing to move** toast shows.
7. The Stop button in the header is a round red cap in a yellow collar. Click it. The cap sits pressed in for the one-second latch, then pops back out.
8. In Chrome DevTools, open Rendering and set "Emulate CSS media feature forced-colors" to `active`. Click Stop. The latched cap fills with the highlight color.
