# Appearance axes

Every story renders under three independent axes on `<html>`: chrome (feel), palette (color), and mode (light, dark, or system). Any chrome pairs with any palette. `mode:system` follows the OS with no JS. A `.odd-scope` subtree can carry its own three axes. OS preferences (reduced motion, more contrast, forced colors, reduced transparency) override any palette or chrome.

## Sub-features

- `axes-globals`: the toolbar `Chrome`/`Palette`/`Mode` globals set `html[data-chrome|data-palette|data-mode]` and restyle everything.
- `axes-system-mode`: with `mode:system`, rendered colors follow `prefers-color-scheme`.
- `axes-scope`: a `.odd-scope` with its own attributes overrides the page appearance for its subtree.
- `axes-matrix`: `showcase--matrix` shows every chrome × palette pair at once.
- `axes-preferences`: `prefers-reduced-motion`, `prefers-contrast: more`, `forced-colors`, and `prefers-reduced-transparency` override tokens.

## How to get to it (user POV)

- In the Storybook manager, use the toolbar's `Chrome` (component icon), `Palette` (paintbrush), and `Mode` (mirror) dropdowns on any story.
- Open **Showcase → Matrix** to compare every pair.
- Change the OS theme or accessibility settings while `Mode` is `system`.
- In consuming markup, set `data-chrome`, `data-palette`, and `data-mode` on `<html>`, or on an element with `class="odd-scope"`.

## Driving it with ctl.ts

Preconditions:

- The baseline from the README, with no emulation active.

- **Globals apply.** Open a story with explicit axes: `bun $S goto components-button--variants "chrome:bubblegum;palette:sorbet;mode:dark"`. The output line `html data:` reads `{"mode":"dark","palette":"sorbet","chrome":"bubblegum"}`. Run `bun $S eval '(s => [s.fontFamily, s.borderWidth, s.boxShadow])(getComputedStyle(document.querySelector("[data-variant=primary]")))'`, then repeat with `chrome:calm`. Bubblegum reads `"Bricolage Grotesque Variable"…`, `2px`, and a hard `3px 3px 0px` offset shadow. Calm reads `"Outfit Variable"…`, `1px`, and a soft blur shadow. (Border radius is the same in both, so don't use it to tell them apart.)
- **System mode follows the OS.** Run `bun $S emulate prefers-color-scheme=dark`, then `bun $S goto showcase--sample-app "mode:system"`, then `bun $S eval 'getComputedStyle(document.querySelector(".odd-scope")).color'`. The result is light text (`oklch(0.95 …)` in the default palette). Repeat with `prefers-color-scheme=light`, which gives dark text (`oklch(0.22 …)`). Clear emulation afterwards with `bun $S emulate`.
- **Scope overrides page.** Open `bun $S goto showcase--matrix "chrome:calm;palette:default;mode:light"` and run `bun $S state`. `html` shows `calm/default/light`. `scopes` lists 12 entries, one for each chrome × palette pair, each with its own values.
- **Matrix proof.** Run `bun $S screenshot matrix/light.png --full`, then `goto` again with `mode:dark` and take `matrix/dark.png --full`. Rows are chromes and columns are palettes. Every tile shows a badge, an input, buttons, and a switch with no missing text.
- **Reduced motion.** Run `bun $S emulate prefers-reduced-motion=reduce`, then `bun $S goto components-button--variants "chrome:bubblegum"`, then `bun $S eval 'getComputedStyle(document.documentElement).getPropertyValue("--press-transform")'`. The value is `none`. Without the emulation, bubblegum's value is `translate(3px, 3px)`.
- **More contrast.** Run `bun $S emulate prefers-contrast=more` and `bun $S goto showcase--sample-app "chrome:expressive;mode:dark"`, then read `--focus-width` (it should be `3px`) and `--page-background` (it should contain no `gradient`, because more contrast flattens the page) with `eval` on `getComputedStyle(document.documentElement)`.

## Gotchas

- Globals in the `goto` URL must use literal `:` and `;`. The helper builds the URL by hand for this reason. Do not URL-encode them yourself.
- Matrix tiles use the page's `mode` global and fix chrome and palette per tile, so toolbar chrome and palette changes do not affect the tiles.
- `emulate` persists across commands and `goto` calls until you run `bun $S emulate` or `down`, and each call replaces the previous feature set. To combine features, pass them in one call. A leftover emulation silently changes later proofs.
- `backgroundColor` on `html`, `body`, and `.odd-scope` computes to transparent. Probe mode through the resolved text `color` instead.
- Custom properties read through `getPropertyValue` come back as raw token text (for example `oklch(...)` or `var(...)`). To compare rendered colors, read a resolved property such as `backgroundColor`.
- The manager toolbar itself lives at `http://127.0.0.1:<port>/?path=/story/<id>`. The helper drives the story iframe, which receives exactly the same globals. If a claim is specifically about the toolbar UI, report that it was not driven.
