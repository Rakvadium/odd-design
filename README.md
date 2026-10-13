# Design system

A framework-free, accessible design system made of CSS custom properties, native HTML, and one small TypeScript helper. Storybook is the workbench.

Appearance has three independent axes:

| Axis | Attribute | Owns |
| --- | --- | --- |
| Chrome | `data-chrome` | Feel: fonts, case, tracking, radius, border width, density, shadows, press motion, focus style, easing, effects |
| Palette | `data-palette` | Color roles: surfaces, text, brand, status, borders, focus ring |
| Mode | `data-mode` | `light`, `dark`, or `system` |

Any chrome pairs with any palette. Chromes: `calm`, `glass`, `bubblegum`, `holoterminal`. Palettes: `default`, `aurora`, `sorbet`.

## Commands

```sh
bun install
bun run storybook   # http://localhost:6006
bun test            # token contract + WCAG contrast
```

## Use it

```html
<html data-chrome="calm" data-palette="default" data-mode="system">
  <head>
    <script>/* FIRST_PAINT_SCRIPT from src/js/appearance.ts */</script>
    <link rel="stylesheet" href="design-system/src/css/index.css">
  </head>
  <body>
    <button class="ds-button" data-variant="primary">Save</button>
  </body>
</html>
```

Fonts are not bundled. Load Outfit, Bricolage Grotesque, and JetBrains Mono (for example with `@fontsource-variable/*`), or the stacks fall back to system fonts.

A subtree can have its own appearance: add `class="ds-scope"` and set all three attributes on it.

## How it fits together

`src/css/index.css` declares the cascade layers in order:

1. `foundations`: fixed scales (type, space, durations, z-index), derived tokens, and default status colors.
2. `palette`: `palettes/*.css`. Each color is `light-dark(light, dark)`, so mode is just `color-scheme` and `system` follows the OS without JS.
3. `chrome`: `chromes/*.css`. Feel tokens only. A chrome can reference palette colors, such as a primary-tinted glow, but never contains a hue of its own.
4. `preferences`: `prefers-contrast`, `prefers-reduced-motion`, `prefers-reduced-transparency`, and `forced-colors`. This layer beats palette and chrome.
5. `base`: element defaults.
6. `components`: `.ds-*` classes. These read tokens and never check which chrome or palette is active.

`src/js/contract.ts` lists every palette token, every chrome token, and the WCAG pairs. The tests read it, so adding a token to the contract fails `bun test` until every palette or chrome defines it.

## What `bun test` enforces

- Every palette defines all color roles and nothing else.
- Every palette passes WCAG 2.2 AA in light and dark: 4.5:1 for text (including links and error text on surfaces), and 3:1 for input borders and focus rings.
- Every chrome defines all feel tokens, defines no color roles, and contains no chromatic color literal.
- No component selector mentions `data-chrome` or `data-palette`.

## Add a palette

1. Copy `src/css/palettes/aurora.css`, rename the selector, and edit the colors.
2. Add the id to `PALETTES` in `src/js/contract.ts` and import the file in `index.css`.
3. Run `bun test` and fix any contrast failures it reports.

## Add a chrome

1. Copy the chrome closest to what you want, rename the selector, and edit the values.
2. Add the id to `CHROMES` and import the file in `index.css`.
3. Run `bun test`, then check **Showcase → Matrix** in Storybook.

## Components

| Class | Element | Notes |
| --- | --- | --- |
| `ds-button` | `<button>`, `<a>` | `data-variant`, `data-size`, `data-icon-only`. Use `aria-disabled` and `aria-busy`. |
| `ds-field`, `ds-label`, `ds-input`, `ds-textarea`, `ds-select`, `ds-hint`, `ds-error` | native form controls | Errors style on `:user-invalid`. The select upgrades through `appearance: base-select`. |
| `ds-choice`, `ds-switch` | checkbox, radio, `role="switch"` | |
| `ds-segmented` | radio `<fieldset>` | Arrow keys come from the browser. |
| `ds-card` | `<article>` | `data-interactive` plus `.ds-card-link` makes the whole card clickable through a single link. |
| `ds-badge` | `<span>` | `data-tone`, `data-solid`. |
| `ds-dialog` | `<dialog>` | Open with `commandfor`/`command="show-modal"`, no JS. |
| `ds-disclosure` | `<details name>` | An exclusive accordion. |
