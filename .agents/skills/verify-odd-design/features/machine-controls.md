# Machine controls

Components for a machine's drive screen: the Number stepper recipe's jog row, whose step buttons step a number input and repeat while held; the Slider with number recipe, a slider paired with a number input; the `.odd-log` panel, which follows new lines until the reader scrolls up; and the `.odd-shell` page with its `.odd-grid` of panels, which collapses by the grid's own width.

## Sub-features

- `stepper-steps`: `data-step` counts input steps, so on Wrist (`step="0.5"`) the `−5` button moves by 5. Buttons toward a limit get `aria-disabled="true"`, and a disabled input marks every button.
- `stepper-hold`: a held button steps, waits 400 ms, then steps every 100 ms. The press fires one `change`.
- `range-sync`: the slider writes the number. A typed valid number moves the slider. An out-of-range number leaves the slider and, on commit, shows an `odd-error` named by the number's `aria-describedby`.
- `log-pin`: Add line keeps the newest line in view. After the reader scrolls up, new lines don't move the log until they scroll back to the bottom.
- `shell-grid`: at 1280px Jog and Pose span 8 and 4 of 12 columns, and Log spans all 12. Under 64rem of grid width Pose takes half. Under 40rem every panel takes the full row.

## How to get to it (user POV)

- In Storybook, open **Recipes → Number stepper → Jog Row**, **Recipes → Slider with number**, **Components → Feedback → Log**, and **Components → Layout → App Shell**.

## Driving it with ctl.ts

Preconditions:

- The baseline from the README.

- **Stepper steps.** Run `bun $S goto recipes-number-stepper--jog-row "mode:light"`. `bun $S eval '[...document.querySelectorAll("[role=group] button")].map(b => b.textContent + ":" + b.getAttribute("aria-disabled")).join(" ")'` shows `+0.5:true +5:true` on Wrist (it starts at its max) and `true` on both Gripper buttons. Run `bun $S click '[role=group] button' --text '−5'`. `#jog-wrist` reads `40` and `#jog-events` reads `change: jog-wrist = 40`.
- **Range sync.** Run `bun $S goto recipes-slider-with-number--slider-with-number "mode:dark"`, `bun $S focus '#speed'`, and `bun $S press ArrowRight`. `#speed-number` reads `45`. Focus `#speed-number`, clear it with `End` and `Backspace`, type `250`, and press `Tab`. `#speed` stays `45`, `#speed-number` has `aria-invalid="true"`, and `bun $S aria controls/range-error.txt` shows `spinbutton "Speed mm/s" ... description="Enter a number from 0 to 200, in steps of 5." [invalid=true]`.
- **Log pin.** Run `bun $S goto components-feedback--log "mode:light"` and click `#add-log-line` twice. `bun $S eval '(l => Math.round(l.scrollHeight - l.scrollTop - l.clientHeight))(document.querySelector("#arm-log"))'` returns `0`. Focus `#arm-log`, press `Home`, and click Add line: the same eval returns more than `0`. Focus `#arm-log`, press `End`, `wait 600`, and click Add line: it returns `0`.
- **Shell grid.** Run `bun $S goto components-layout--app-shell "chrome:glass;palette:aurora;mode:dark"` and capture `layout/shell.png`. The Jog panel is twice as wide as Pose, and Log takes the full row. The harness viewport is fixed, so the narrow widths are proven by `e2e/behavior.spec.ts` ("the app grid narrows panels…").

## Gotchas

- The press-and-hold repeat needs a held pointer, which `ctl.ts click` doesn't send. `bunx playwright test e2e/behavior.spec.ts -g "machine controls"` drives it in Firefox and WebKit.
- Keyboard scrolling in the log is animated. Wait about 600 ms after `End` before adding a line, or the line arrives while the log is still short of the bottom and the log correctly stays unpinned.
- `mode:system` renders dark in the headless browser. Pass `mode:light` or `mode:dark` explicitly.
