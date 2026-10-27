# Design system

A framework-free, accessible design system made of CSS custom properties, native HTML, and one small TypeScript helper. The React wrapper is optional. Storybook is the workbench.

Appearance has three independent axes:

| Axis | Attribute | Owns |
| --- | --- | --- |
| Chrome | `data-chrome` | Feel: fonts, case, tracking, radius, border width, density, shadows, press motion, focus style, easing, effects |
| Palette | `data-palette` | Color roles: surfaces, text, brand, status, borders, focus ring |
| Mode | `data-mode` | `light`, `dark`, or `system` |

Any chrome pairs with any palette. Chromes: `calm`, `glass`, `bubblegum`, `holoterminal`, `expressive`, `darkmatter`. Palettes: `default`, `aurora`, `sorbet`, `calm-storm`, `cyberpunk`, `cotton-candy`, `caffeine`, `singularity`. You can also generate a palette from your own brand colors (see Custom palettes).

## Commands

```sh
bun install
bun run storybook   # http://localhost:6006
bun test            # token contract, WCAG contrast, palette generator, color math
bun run test:browsers   # Playwright: the axe sweep and behavior checks in Firefox and WebKit
```

`test:browsers` needs Playwright's own browsers once: `bunx playwright install firefox webkit`. It builds a static Storybook, runs it in both engines, and writes an HTML report with screenshots to `.verify/playwright/report`.

## Install

Install the package.

```sh
bun add odd-design
```

The stylesheet, `odd-design/appearance`, `odd-design/enhance`, and `odd-design/palette` need nothing else. Install React 19 when you render `Button`, the Field parts, or the Choice parts. React is an optional peer dependency.

```sh
bun add react@^19 react-dom@^19
```

Set up the checkers the docs describe.

- Types come from `odd-design/react`. See [Use the React components](docs/usage/react.md).
- ESLint loads `odd-design/eslint`. See [Check HTML with ESLint](docs/usage/eslint.md).
- Tests call `registerUsageChecks` from `odd-design/usage/test-setup`. See [Set up the runtime checker](docs/usage/runtime.md).

Add this line to your `AGENTS.md`.

```
Fix every odd-design ODD- code before you finish. TypeScript, ESLint, and tests all report them.
```

## Use it

```html
<html data-chrome="calm" data-palette="default" data-mode="system">
  <head>
    <script>/* FIRST_PAINT_SCRIPT from src/js/appearance.ts */</script>
    <link rel="stylesheet" href="odd-design/src/css/index.css">
  </head>
  <body>
    <button class="odd-button" data-variant="primary">Save</button>
  </body>
</html>
```

Fonts are not bundled. Load Outfit, Bricolage Grotesque, and JetBrains Mono (for example with `@fontsource-variable/*`), or the stacks fall back to system fonts.

A subtree can have its own appearance: add `class="odd-scope"` and set all three attributes on it.

## How it fits together

`src/css/index.css` declares the cascade layers in order:

1. `foundations`: fixed scales (type, space, durations, z-index), derived tokens, and default status colors.
2. `palette`: `palettes/*.css`. Each color is `light-dark(light, dark)`, so mode is just `color-scheme` and `system` follows the OS without JS.
3. `chrome`: `chromes/*.css`. Feel tokens only. A chrome can reference palette colors, such as a primary-tinted glow, but never contains a hue of its own.
4. `preferences`: `prefers-contrast`, `prefers-reduced-motion`, `prefers-reduced-transparency`, and `forced-colors`. This layer beats palette and chrome.
5. `base`: element defaults.
6. `components`: `.odd-*` classes. These read tokens and never check which chrome or palette is active.

`src/js/contract.ts` lists every palette token, every chrome token, and the WCAG pairs. The tests read it, so adding a token to the contract fails `bun test` until every palette or chrome defines it.

## What `bun test` enforces

- Every palette defines all color roles and nothing else.
- Every palette passes WCAG 2.2 AA in light and dark: 4.5:1 for text (including links and error text on surfaces), and 3:1 for input borders and focus rings.
- Text on every soft tint (`--tint-*`, used by badges, alerts, avatars, and selected table rows) passes 4.5:1 in light and dark. The test evaluates the same `color-mix()` the browser does.
- Every chrome defines all feel tokens, defines no color roles, and contains no chromatic color literal.
- No component selector mentions `data-chrome` or `data-palette`.
- The tint and status-color values in `foundations.css` match the contract, which the palette generator also reads.
- The palette generator meets every contrast pair for 146 seed pairs across the hue wheel, checked both by its own math and through the CSS it emits.
- Text on every chrome's page background passes AA at the background's worst points (each solid color under every combination of its washes), for every palette and mode. Each chrome's `--page-background` matches `PAGE_BACKGROUNDS` in the contract, which the palette generator also reads.
- `src/js/color.ts` agrees with culori on parsing, contrast, gamut clamping, mixing, and compositing.

## Accessibility checks

One rule set, defined once in `.storybook/a11y.ts`: stock axe-core, WCAG 2.0, 2.1, and 2.2 at levels A and AA, with no custom rules. The Storybook a11y panel reads it through `parameters.a11y`, and the verify harness's sweep imports it, so both apply the same rules.

```sh
bun .agents/skills/verify-odd-design/scripts/ctl.ts up --run a11y
bun .agents/skills/verify-odd-design/scripts/ctl.ts axe --run a11y    # every story, light and dark, overlays opened
```

- The sweep fails on any violation. Results axe couldn't decide are printed as `REVIEW` with axe's reason.
- `.storybook/a11y-rules.txt` records the 63 rules the tags resolve to on the pinned axe-core. The sweep fails if the rules that ran differ, so an axe upgrade that adds or drops rules shows up as a diff to review. Accept it with `--update-rules`.
- axe can't measure contrast over gradients, so text on page backgrounds is proven by `bun test` instead.
- `bun run test:browsers` runs the same sweep, with the same rules and the same record, in Firefox and WebKit. Chrome stays on the harness.

## Usage checks

The package ships the button, field, and choice usage contracts and one message per pinned code. Each message names the code, the failure, and the fix. Types, ESLint, and the runtime checker report the same codes. The pages under [docs/usage/](docs/usage/) record the rules. Button codes are in [Button usage rules](docs/usage/button.md). Field codes are in [Field usage rules](docs/usage/field.md). Choice codes are in [Choice usage rules](docs/usage/choice.md). Class and static codes are in [General usage rules](docs/usage/general.md).

## Add a palette

1. Copy `src/css/palettes/aurora.css`, rename the selector, and edit the colors. Or generate one from brand colors with `paletteCss` (see Custom palettes).
2. Add the id to `PALETTES` in `src/js/contract.ts` and import the file in `index.css`.
3. Run `bun test` and fix any contrast failures it reports.

## Custom palettes

`odd-design/palette` (`src/js/palette.ts`) builds a full palette, light and dark, from one or two brand colors and holds it to the same contract as the shipped palettes.

```js
import { applyPalette, generatePalette, paletteCss } from "odd-design/palette";

const palette = generatePalette({ primary: "#7c3aed", secondary: "#f472b6" });
applyPalette(palette);                        // defines [data-palette="custom"] in the palette layer
document.documentElement.dataset.palette = "custom";
paletteCss("my-brand", palette);              // or ship it as a file like src/css/palettes/*.css
```

Every role is laid out from the seeds, then `repairPalette` moves the lightness of any role that fails a contrast pair until all pass. Hue and chroma stay as given, so a pale brand color may come out darker in light mode: a pale yellow becomes olive there, because yellow link text can't reach 4.5:1 on a light page. Try it in **Foundations → Custom Palette**. The color math is dependency-free.

The five palettes ported from uvs-decks-gg went through the same repair. Their input borders were darkened to 3:1, a few primaries and danger tones were nudged, and white text on danger in dark mode became dark text.

## Add a chrome

1. Copy the chrome closest to what you want, rename the selector, and edit the values.
2. Add the id to `CHROMES` and import the file in `index.css`.
3. Run `bun test`, then check **Showcase → Matrix** in Storybook.

## Components

| Class | Element | Notes |
| --- | --- | --- |
| `odd-button` | `<button>`, `<a>` | `data-variant`, `data-size`, `data-icon-only`. Use `aria-disabled` and `aria-busy`. |
| `odd-field`, `odd-label`, `odd-input`, `odd-textarea`, `odd-select`, `odd-hint`, `odd-error` | native form controls | Errors style on `:user-invalid`. The select upgrades through `appearance: base-select`. |
| `odd-choice`, `odd-switch` | checkbox, radio, `role="switch"` | |
| `odd-segmented` | radio `<fieldset>` | Arrow keys come from the browser. |
| `odd-card` | `<article>` | `data-interactive` plus `.odd-card-link` makes the whole card clickable through a single link. |
| `odd-badge` | `<span>` | `data-tone`, `data-solid`. |
| `odd-dialog` | `<dialog>` | Open with `commandfor`/`command="show-modal"`, no JS. |
| `odd-disclosure` | `<details name>` | An exclusive accordion. |
| `odd-heading`, `odd-eyebrow` | `<h1>`–`<h6>`, `<p>` | `data-size` (xs–2xl, hero) sets size apart from level. The eyebrow takes `data-tone`. |
| `odd-alert`, `odd-alert-title` | `<div>` | `data-tone`. Static alerts need no role; insert later ones into an existing `role="status"` or `role="alert"` container. |
| `odd-progress`, `odd-meter`, `odd-stat` | `<progress>`, `<meter>` | A meter with `low`/`high`/`optimum` colors itself by range. Always show the value as text too. |
| `odd-skeleton` | `<div aria-hidden>` | Put `aria-busy` and "Loading" text on the region. `data-shape="avatar"`. |
| `odd-separator` | `<hr>` | `aria-orientation="vertical"` inside a row. |
| `odd-avatar`, `odd-avatar-group` | `<span>` with `<img alt>` or `role="img"` initials | `data-size`. |
| `odd-table-wrap`, `odd-table`, `odd-table-sort` | `<table>` | The wrapper scrolls and is focusable. `data-numeric`, `aria-sort`, and a row checkbox tints the row. |
| `odd-slider` | `<input type="range">` | The filled track follows the thumb with no JS where scroll-driven animations exist. |
| `odd-search` | `<search>` with `<input type="search">` | Visually hidden label, leading icon. |
| `odd-popover` | `<div popover role="dialog">` | Open with `commandfor`/`command="toggle-popover"`. Anchors to the invoker and flips. Use `role="dialog"` and a name when it holds controls. |
| `odd-tooltip` | `<div popover="hint" role="tooltip">` | Shown via `interestfor`. Wire `aria-labelledby` or `aria-describedby` yourself. |
| `odd-hover-card` | `<div popover="hint">` | A preview via `interestfor`. Its content must also be reachable through the link. |
| `odd-sheet` | `<dialog>` | Opens with `command="show-modal"`; `data-side="start|end|top|bottom"`. |
| alert dialog | `<dialog class="odd-dialog" role="alertdialog">` | Leave out `closedby="any"` so only Escape or a button closes it. |
| `odd-menu`, `odd-menu-item` | `<div popover role="menu">` | Needs `enhanceMenu`. `menuitemcheckbox`/`menuitemradio` with `aria-checked`; `data-tone="danger"`; disable items with `aria-disabled="true"`, which keeps them reachable. |
| `odd-tabs` | `role="tablist"`, `tab`, `tabpanel` | Needs `enhanceTabs`. `data-activation="manual"`, `aria-orientation="vertical"`. |
| `odd-toaster`, `odd-toast` | built by `createToaster()` | A polite live region in the corner; it moves into an open modal dialog so toasts stay live. |

## Behaviors

Menus, tabs, and toasts have no HTML element yet, so `odd-design/enhance` (`src/js/enhance.ts`) adds them on top of native markup. Each function takes an element and returns a cleanup function. No dependencies. There is no framework, and the React wrapper is optional.

```js
import { enhance, createToaster } from "odd-design/enhance";

enhance();                   // menus, tab sets, select-all tables, and the fallbacks below, under document
const toaster = createToaster();
toaster.show({ title: "Deck saved", tone: "success" });
```

- `enhanceMenu(menu)`, `enhanceTabs(root)`, `enhanceSelectAll(table)`: one widget each. Call them for elements added after `enhance()`.
- `createToaster({ label, max, parent })`: `show({ title, description, tone, duration, action })` returns `{ dismiss }`.
- `avatarFallback()`: an `.odd-avatar[data-initials]` whose image fails to load shows its initials.
- `interestForFallback()` and `closedByFallback()`: tooltips and hover cards, and `closedby="any"`, in browsers without them. They do nothing where the browser has the feature.
- `roving(container, options)`: the shared arrow-key, Home/End, and typeahead helper the widgets use.
