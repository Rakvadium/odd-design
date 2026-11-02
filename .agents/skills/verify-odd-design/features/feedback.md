# Feedback

Feedback components tell the user about state: `.odd-alert` messages in a neutral tone or `data-tone` info, success, warning, or danger; `.odd-progress` and `.odd-meter` bars under a label and value in the Stat row recipe (`docs/recipes/stat-row.md`); and `.odd-skeleton` placeholders inside an `aria-busy` region. Alert text stays `--foreground` on a soft tint in every tone. Progress and meter bars stay visible in forced-colors mode, and the skeleton pulse and indeterminate sweep stop under reduced motion.

## Sub-features

- `alert-tones`: each tone reads as its own color (info is blue, not the page hue) with legible text in every palette and mode.
- `progress-meter`: each bar is named by its label and fills to its value. A meter with `low`/`high`/`optimum` turns success, warning, or danger by range. Bars fill the full rail height.
- `bars-forced-colors`: under `forced-colors=active`, every progress and meter bar shows as a Highlight fill in an outlined track.
- `skeleton-busy`: the loading region says "Loading decks…" to screen readers, and the skeleton blocks are hidden from them.
- `motion-reduced`: under `prefers-reduced-motion=reduce`, the skeleton pulse and the indeterminate sweep have a `0s` duration.
- `spinner-busy`: in `components-spinner--states`, the busy region reads "Loading projects…" and the spinner is hidden from the tree. The spinner and the busy Button's ring sit side by side, each 1em across. The spinner is 16px at the region's text size, and the ring is 14px, because the Button sets `font-size: var(--text-sm)`.
- `spinner-motion`: the spinner turns every `0.7s`, and every `2.4s` under `prefers-reduced-motion=reduce`. It never stops.
- `spinner-forced-colors`: under `forced-colors=active`, the spinner's gap shows in the page color, so the ring still looks open. The busy Button's ring closes into a full circle there. That is a known Button bug in `docs/follow-ups.md`.

## How to get to it (user POV)

- In Storybook, open **Components → Spinner** for Playground, Parts, and States.
- In Storybook, open **Components → Feedback**, which has Log, Alert, Progress, and Skeleton. Log sorts first because Alert, Progress, and Skeleton load from `stories/mirrored/`.

## Driving it with ctl.ts

Preconditions:

- The baseline from the README.

- **Alert tones.** Run `bun $S goto components-feedback--alert "mode:light"` and `bun $S goto components-feedback--alert "mode:dark"`, capturing `feedback/alert-light.png` and `feedback/alert-dark.png`. Read both: the info alert's tint is blue in each. `bun $S eval 'getComputedStyle(document.querySelector(".odd-alert[data-tone=info]")).backgroundColor'` returns an `oklab(...)` color with a negative last channel (blue).
- **Progress and meter.** Run `bun $S goto components-feedback--progress "mode:light"` and `bun $S aria feedback/progress.aria.txt`. It shows `progressbar "Importing decks" value=40` and `meter "Units" value=24`. Capture `feedback/progress-light.png`. The Storage meters read green, amber, and red, and every bar is as tall as its rail.
- **Forced colors.** Run `bun $S emulate forced-colors=active`, then `bun $S goto components-feedback--progress`, and capture `feedback/progress-forced.png`. All seven bars are visible, including both `<progress>` bars. Then run `bun $S emulate` to clear.
- **Reduced motion.** Run `bun $S emulate prefers-reduced-motion=reduce`, `bun $S goto components-feedback--skeleton`, and `bun $S eval 'getComputedStyle(document.querySelector(".odd-skeleton")).animationDuration'`, which returns `"0s"`. On `components-feedback--progress`, the same read on `#sync` returns `"0s"`. Clear with `bun $S emulate`. Without emulation the skeleton reads `"1.6s"`.
- **Spinner.** Run `bun $S goto components-spinner--states "mode:light"` and `bun $S aria feedback/spinner-states.aria.txt`. It shows `text: Loading projects… 3 projects` and `button "Saving…"`, with nothing from the spinner. Capture `feedback/spinner-states-light.png` and the same in `mode:dark`. `bun $S eval 'getComputedStyle(document.querySelector(".odd-spinner")).animationDuration'` returns `"0.7s"`. With `bun $S emulate prefers-reduced-motion=reduce` it returns `"2.4s"`. With `bun $S emulate forced-colors=active`, capture `feedback/spinner-forced.png`. The spinner's ring shows a gap. Clear with `bun $S emulate`. On `components-spinner--parts`, the three `Syncing` rings grow with the text.
- **Skeleton semantics.** Run `bun $S goto components-feedback--skeleton` and `bun $S aria feedback/skeleton.aria.txt`. The tree has the text `Loading decks…` and nothing from the skeleton cards.

## React Alert

Build the composed Storybook and serve it, as in the React Field section of `forms.md`. Open `http://127.0.0.1:6106/?path=/story/react_components-feedback--alert`. The preview is the Alert story built from `Alert` and `AlertTitle`. It shows the neutral alert and the four tones, the same as `components-feedback--alert`. Log has no React wrapper, so it appears only in the HTML section.

Run the pair sweep with `bunx playwright test e2e/usage.spec.ts --project firefox`. The Alert pair matches the `aria` literal in `stories/mirrored/Alert.stories.ts`, and the two screenshots are byte-identical.

## React Skeleton

In the same composed Storybook, open `http://127.0.0.1:6106/?path=/story/react_components-feedback--skeleton`. The preview is the Skeleton story built from `Skeleton`, the same as `components-feedback--skeleton`. The pair sweep matches the `aria` literal in `stories/mirrored/Skeleton.stories.ts`, which is only `- text: Loading decks…`, because every block and both cards are hidden. The avatar block matches a default avatar, and its shape follows the chrome's chip radius. The two screenshots are byte-identical.

## React Progress

In the same composed Storybook, open `http://127.0.0.1:6106/?path=/story/react_components-feedback--progress`. The preview is the Progress story built from two `Progress` and six `Meter` parts, each in a Stat row recipe of `odd-stack` and `odd-row`, the same as `components-feedback--progress`. `#sync` has no `value`, so it sweeps. Actions is blue from `tone="info"` and Assets green from `tone="success"`. The Storage meters read green, amber, and red by range. The pair sweep matches the `aria` literal in `stories/mirrored/Meter.stories.ts`, and the two screenshots are byte-identical.

## Gotchas

- `mode:system` renders dark in the headless browser. Pass `mode:light` or `mode:dark` explicitly when the proof depends on the mode.
- The meter's internal parts live in Chromium's UA shadow tree, which `eval` cannot reach. Judge the bar height from the screenshot, not from the `<meter>` element's own box.
- The indeterminate bar animates, so two screenshots differ in where the band sits. Do not treat that as flakiness.
