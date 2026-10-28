# Feedback

Feedback components tell the user about state: `.odd-alert` messages in a neutral tone or `data-tone` info, success, warning, or danger; `.odd-progress` and `.odd-meter` bars inside a `.odd-stat` label-and-value row; and `.odd-skeleton` placeholders inside an `aria-busy` region. Alert text stays `--foreground` on a soft tint in every tone. Progress and meter bars stay visible in forced-colors mode, and the skeleton pulse and indeterminate sweep stop under reduced motion.

## Sub-features

- `alert-tones`: each tone reads as its own color (info is blue, not the page hue) with legible text in every palette and mode.
- `progress-meter`: each bar is named by its label and fills to its value. A meter with `low`/`high`/`optimum` turns success, warning, or danger by range. Bars fill the full rail height.
- `bars-forced-colors`: under `forced-colors=active`, every progress and meter bar shows as a Highlight fill in an outlined track.
- `skeleton-busy`: the loading region says "Loading decks…" to screen readers, and the skeleton blocks are hidden from them.
- `motion-reduced`: under `prefers-reduced-motion=reduce`, the skeleton pulse and the indeterminate sweep have a `0s` duration.

## How to get to it (user POV)

- In Storybook, open **Components → Feedback**, which has Progress, Log, Alert, and Skeleton. Alert and Skeleton sort last because they load from `stories/mirrored/`.

## Driving it with ctl.ts

Preconditions:

- The baseline from the README.

- **Alert tones.** Run `bun $S goto components-feedback--alert "mode:light"` and `bun $S goto components-feedback--alert "mode:dark"`, capturing `feedback/alert-light.png` and `feedback/alert-dark.png`. Read both: the info alert's tint is blue in each. `bun $S eval 'getComputedStyle(document.querySelector(".odd-alert[data-tone=info]")).backgroundColor'` returns an `oklab(...)` color with a negative last channel (blue).
- **Progress and meter.** Run `bun $S goto components-feedback--progress "mode:light"` and `bun $S aria feedback/progress.aria.txt`. It shows `progressbar "Importing decks" value=40` and `meter "Units" value=24`. Capture `feedback/progress-light.png`. The Storage meters read green, amber, and red, and every bar is as tall as its rail.
- **Forced colors.** Run `bun $S emulate forced-colors=active`, then `bun $S goto components-feedback--progress`, and capture `feedback/progress-forced.png`. All seven bars are visible, including both `<progress>` bars. Then run `bun $S emulate` to clear.
- **Reduced motion.** Run `bun $S emulate prefers-reduced-motion=reduce`, `bun $S goto components-feedback--skeleton`, and `bun $S eval 'getComputedStyle(document.querySelector(".odd-skeleton")).animationDuration'`, which returns `"0s"`. On `components-feedback--progress`, the same read on `#sync` returns `"0s"`. Clear with `bun $S emulate`. Without emulation the skeleton reads `"1.6s"`.
- **Skeleton semantics.** Run `bun $S goto components-feedback--skeleton` and `bun $S aria feedback/skeleton.aria.txt`. The tree has the text `Loading decks…` and nothing from the skeleton cards.

## React Alert

Build the composed Storybook and serve it, as in the React Field section of `forms.md`. Open `http://127.0.0.1:6106/?path=/story/react_components-feedback--alert`. The preview is the Alert story built from `Alert` and `AlertTitle`. It shows the neutral alert and the four tones, the same as `components-feedback--alert`. Progress and Log have no React wrappers, so they appear only in the HTML section.

Run the pair sweep with `bunx playwright test e2e/usage.spec.ts --project firefox`. The Alert pair matches the `aria` literal in `stories/mirrored/Alert.stories.ts`, and the two screenshots are byte-identical.

## React Skeleton

In the same composed Storybook, open `http://127.0.0.1:6106/?path=/story/react_components-feedback--skeleton`. The preview is the Skeleton story built from `Skeleton`, the same as `components-feedback--skeleton`. The pair sweep matches the `aria` literal in `stories/mirrored/Skeleton.stories.ts`, which is only `- text: Loading decks…`, because every block and both cards are hidden. The avatar block matches a default avatar, and its shape follows the chrome's chip radius. The two screenshots are byte-identical.

## Gotchas

- `mode:system` renders dark in the headless browser. Pass `mode:light` or `mode:dark` explicitly when the proof depends on the mode.
- The meter's internal parts live in Chromium's UA shadow tree, which `eval` cannot reach. Judge the bar height from the screenshot, not from the `<meter>` element's own box.
- The indeterminate bar animates, so two screenshots differ in where the band sits. Do not treat that as flakiness.
