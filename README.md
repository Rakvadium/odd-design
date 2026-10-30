# Design system

A framework-free, accessible design system made of CSS custom properties, native HTML, and one small TypeScript helper. The React wrapper is optional. Storybook is the workbench.

Appearance has three independent axes:

| Axis | Attribute | Owns |
| --- | --- | --- |
| Chrome | `data-chrome` | Feel: fonts, case, tracking, radius, border width, density, shadows, press motion, focus style, easing, effects |
| Palette | `data-palette` | Color roles: surfaces, text, brand, status, borders, focus ring |
| Mode | `data-mode` | `light`, `dark`, or `system` |

Any chrome pairs with any palette. Chromes: `calm`, `glass`, `bubblegum`, `expressive`, `darkmatter`. Palettes: `default`, `aurora`, `sorbet`, `calm-storm`, `cyberpunk`, `cotton-candy`, `caffeine`, `singularity`. You can also generate a palette from your own brand colors (see Custom palettes).

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

The stylesheet, `odd-design/appearance`, `odd-design/enhance`, and `odd-design/palette` need nothing else. Install React 19 when you render `Button`, the Field parts, the Choice parts, `Badge`, the Alert parts, the Avatar parts, `Separator`, `Skeleton`, the Card parts, `Disclosure`, `Tabs`, `Search`, `Slider`, `Meter`, `Progress`, `Toaster`, `Popover`, `Dialog`, `DialogActions`, `Sheet`, `SheetHeader`, `SheetFooter`, `Menu`, `MenuItem`, `TableWrap`, `Table`, or `TableSort`. React is an optional peer dependency.

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

1. `foundations`: fixed scales (type, weight, space, durations, z-index), derived tokens, and default status colors.
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

The package ships the button, field, choice, badge, alert, avatar, separator, skeleton, card, disclosure, tabs, search, slider, meter, toast, popover, dialog, sheet, menu, table, base utility, grid, shell, and typography usage contracts and one message per pinned code. Each message names the code, the failure, and the fix. Types, ESLint, and the runtime checker report the same codes. The pages under [docs/usage/](docs/usage/) record the rules. Button codes are in [Button usage rules](docs/usage/button.md). Field codes are in [Field usage rules](docs/usage/field.md). Choice codes are in [Choice usage rules](docs/usage/choice.md). Badge codes are in [Badge usage rules](docs/usage/badge.md). Alert codes are in [Alert usage rules](docs/usage/alert.md). Avatar codes are in [Avatar usage rules](docs/usage/avatar.md). Separator codes are in [Separator usage rules](docs/usage/separator.md). Skeleton codes are in [Skeleton usage rules](docs/usage/skeleton.md). Card codes are in [Card usage rules](docs/usage/card.md). Disclosure codes are in [Disclosure usage rules](docs/usage/disclosure.md). Tabs codes are in [Tabs usage rules](docs/usage/tabs.md). Search codes are in [Search usage rules](docs/usage/search.md). Slider codes are in [Slider usage rules](docs/usage/slider.md). Meter and progress codes are in [Meter usage rules](docs/usage/meter.md). Toast codes are in [Toast usage rules](docs/usage/toast.md). Popover codes are in [Popover usage rules](docs/usage/popover.md). Dialog codes are in [Dialog usage rules](docs/usage/dialog.md). Sheet codes are in [Sheet usage rules](docs/usage/sheet.md). Menu codes are in [Menu usage rules](docs/usage/menu.md). Table codes are in [Table usage rules](docs/usage/table.md). Scope and skip link codes are in [Base utilities usage rules](docs/usage/base.md). Grid codes are in [Grid usage rules](docs/usage/grid.md). Shell codes are in [Shell usage rules](docs/usage/shell.md). Heading and eyebrow codes are in [Typography usage rules](docs/usage/typography.md). Class and static codes are in [General usage rules](docs/usage/general.md).

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

## Add a React part

1. Add the part's `WRAPPERS` row and its `USAGE` rules to `src/js/usage/contract.ts`. Add each new code to `USAGE_CODES` and `MESSAGES` in `src/js/usage/format.ts`. A class's rules run only when its `USAGE` group has an `element` rule for it. Each data prop in the row needs an `enum` or `boolean-attribute` rule, which types the prop. The row's `props` are also the part's own `data-*` names, which a `system-data` rule allows and its message lists.
2. Document each code in `docs/usage/<family>.md`.
3. Write `src/react/<family>.tsx`. A part with a fixed tag needs three declarations. `Contract` types its props from its rules, and `part` renders its row.

   ```tsx
   interface BadgeContract extends Contract<"Badge", BadgeRule> {}
   export interface BadgeProps extends BadgeContract, Native<"Badge", keyof BadgeContract> {}
   export const Badge: (props: BadgeProps) => ReactElement = part("Badge");
   ```

   `Contract` does not type an `enum` rule on an attribute that is not in the row's `props`. Give each one its own line, `attribute?: Values<Rule, "attribute">`, as `Avatar` does for `role` and `Separator` does for `aria-orientation` and `role`.

4. Export the module from `src/react/index.ts`, and add the props to `WrapperProps` in `src/react/props.ts`.
5. Mirror the part's stories in `stories/mirrored/<Family>.stories.ts`.
6. Add the part's rows to the `markup` table in `tests/react.test.tsx`. Add a `<part>-<rule>.tsx` fail fixture in `tests/fixtures/types/fail/` for each code its props reject, with its `failures` entry. Add the `places` entries for its ESLint fixtures in `tests/eslint-jsx.test.ts` and `tests/eslint-html.test.ts`. Add a `<code>.bad.html` and `<code>.good.html` pair in `tests/fixtures/usage/` for each runtime code, with the code in lower case, and list the code in `RUNTIME_CODES` in `tests/usage-check.test.ts`. Pin the mirrored story ids in `tests/stories.test.ts`.

`scripts/build.ts` and `scripts/consumer-smoke.ts` read the `odd-design/react` barrel, so a new part adds no line to either. A new usage page goes in `REQUIRED` in `scripts/consumer-smoke.ts`.

## Components

| Class | Element | Notes |
| --- | --- | --- |
| `odd-button` | `<button>`, `<a>` | `data-variant`, `data-size`, `data-icon-only`. Use `aria-disabled` and `aria-busy`. |
| `odd-field`, `odd-label`, `odd-input`, `odd-textarea`, `odd-select`, `odd-hint`, `odd-error` | native form controls | Errors style on `:user-invalid`. The select upgrades through `appearance: base-select`. |
| `odd-choice`, `odd-switch` | checkbox, radio, `role="switch"` | |
| `odd-segmented` | radio `<fieldset>` | Arrow keys come from the browser. |
| `odd-card`, `odd-card-title`, `odd-card-link`, `odd-card-footer` | `<article>`, `<section>`, or `<div>` | The title is a heading at the level the page needs. `data-interactive` plus one `.odd-card-link` makes the whole card clickable through a single link, so the card holds no other link or button. |
| `odd-badge` | `<span>` | `data-tone`, `data-solid`. |
| `odd-dialog`, `odd-dialog-body`, `odd-dialog-title`, `odd-dialog-actions` | `<dialog>` with a `<div>` or `<form>` body, a heading title, and a `<div>` of actions | Open with `commandfor`/`command="show-modal"`, no JS. Name it with `aria-labelledby` or `aria-label`. Leave out `open`. `Dialog` and `DialogActions` from `odd-design/react` render the dialog and the actions. |
| `odd-disclosure` | `<details>` | The question is a `<summary>` directly inside it, and the answer is one element after it. Disclosures that share a `name` form an exclusive accordion. |
| `odd-heading`, `odd-eyebrow` | `<h1>`–`<h6>`, `<p>` | `data-size` (xs–2xl, hero) sets size apart from level. The eyebrow takes `data-tone`. |
| `odd-stack`, `odd-row` | any container | A column, or a row that wraps. `--gap` sets the gap. |
| `odd-grid` | any container, often `<main class="odd-shell-main odd-grid">` | 12 columns. `data-span="1"`–`"12"` on a child, usually an `odd-card`. Under 64rem of grid width, narrow children take half; under 40rem, all take the full row. `--gap` sets the gutter. |
| `odd-muted`, `odd-visually-hidden`, `odd-skip-link`, `odd-scope` | any element, an `<a href="#id">` for the skip link | The skip link slides in on focus. `odd-scope` takes all three of `data-chrome`, `data-palette`, and `data-mode`. |
| `odd-alert`, `odd-alert-title` | `<div>`, `<p>` | `data-tone` is `info`, `success`, `warning`, or `danger`. Leaving it out is the neutral tint. The title is a `p`. Static alerts need no role; insert later ones into an existing `role="status"` or `role="alert"` container. |
| `odd-progress`, `odd-meter`, `odd-stat-value` | `<progress>`, `<meter>`, and a `<span>` or `<output>` value | `data-tone` is `success`, `warning`, `danger`, or `info`. A meter with `low`/`high`/`optimum` colors itself by range. Always show the value as text too. `odd-stat-value` sets it bold with tabular digits. `Progress` and `Meter` from `odd-design/react` render the bars. The [Stat row](docs/recipes/stat-row.md) recipe sets a label and a value above a bar. |
| `odd-skeleton` | `<div aria-hidden="true">` | Put `aria-busy` and "Loading" text on the region, not on the block. The block takes no `role` or name. `data-shape="avatar"`. |
| `odd-separator` | `<hr>` | `aria-orientation="vertical"` inside a row, not `data-orientation`. `role` takes only `separator`, and `aria-hidden` is not allowed. For a line that means nothing, use a border. |
| `odd-avatar`, `odd-avatar-group` | `<span>` with `<img alt>` or `role="img"` initials, `<div role="group">` with a name | `data-size` on each avatar. |
| `odd-table-wrap`, `odd-table`, `odd-table-sort` | `<div>` around a `<table>`, with sort `<button>`s | The wrapper scrolls and is focusable. `data-numeric` goes on a `th` and its cells, `aria-sort` on the sorted `th`, and a row checkbox tints the row. `enhanceSelectAll` wires a `data-select-all` header box. `TableWrap`, `Table`, and `TableSort` from `odd-design/react` render the three, and `Table` runs `enhanceSelectAll`. |
| `odd-slider` | `<input type="range">` | The filled track follows the thumb with no JS where scroll-driven animations exist. Disable it with `disabled`, not `aria-disabled`. `Slider` from `odd-design/react` renders it and takes `type="range"`. |
| `odd-search` | `<search>` with a direct visually hidden `<label>`, `<svg aria-hidden="true">`, and `<input class="odd-input" type="search">` | Put a `<form>` around it to submit. `Search` from `odd-design/react` renders the `<search>`. |
| `odd-popover` | `<div popover role="dialog">` | Open with `commandfor`/`command="toggle-popover"`. Anchors to the invoker and flips. Use `role="dialog"` and a name when it holds controls, and neither when it only shows text. `Popover` from `odd-design/react` renders it. |
| `odd-tooltip` | `<div popover="hint" role="tooltip">` | Shown via `interestfor`. Wire `aria-labelledby` or `aria-describedby` yourself. |
| `odd-hover-card` | `<div popover="hint">` | A preview via `interestfor`. Its content must also be reachable through the link. |
| `odd-sheet`, `odd-sheet-header`, `odd-sheet-body`, `odd-sheet-footer` | `<dialog>` with a `<div>` header, a `<div>` or `<form>` body, and a `<div>` footer | Opens with `command="show-modal"`. Name it with `aria-labelledby` or `aria-label`. `data-side="start|top|bottom"`, and no `data-side` for the end edge. `Sheet`, `SheetHeader`, and `SheetFooter` from `odd-design/react` render the sheet, the header, and the footer. |
| alert dialog | `<dialog class="odd-dialog" role="alertdialog">` | Leave out `closedby="any"` so only Escape or a button closes it. `Dialog` with `role="alertdialog"` renders it. |
| `odd-menu`, `odd-menu-item` | `<div popover role="menu">` | Needs `enhanceMenu`, or `Menu` from `odd-design/react`. Items are `<button>`s with a menu item `role`, and `MenuItem` renders them. `menuitemcheckbox` and `menuitemradio` take `aria-checked`. `data-tone="danger"` goes on an item. Disable an item with `aria-disabled="true"`, which keeps it reachable. |
| `odd-tabs` | `<div>` with a direct `role="tablist"`, `<button role="tab">`, `role="tabpanel"` | Needs `enhanceTabs`, or `Tabs` from `odd-design/react`. Each tab's `aria-controls` names its panel. `data-activation="manual"` and `aria-orientation="vertical"` go on the tablist. |
| `odd-toaster`, `odd-toast` | `<section popover="manual" aria-label="Notifications">`, once per page | Needs `enhanceToaster`, or `Toaster` from `odd-design/react`. `enhanceToaster` builds the list and a polite live region inside. `toast()` adds each `odd-toast`. A toast shown while a modal dialog is open moves the list inside the dialog, so the toasts stay live. Toasts already showing when it opens stay behind it until the next `toast()`. |
| `odd-log`, `odd-log-line` | `<div role="log" tabindex="0">` of line `<div>`s, each with an optional `<time>` | Mono, scrolls past 20rem. `data-tone` on a line. Append with `appendLogLine`; `enhanceLog` keeps the newest line in view unless the reader scrolled up. |
| `odd-shell`, `odd-shell-header`, `odd-shell-status`, `odd-shell-actions`, `odd-shell-main` | `<div>`, `<header>`, `<main>` | A full-height page under a sticky header bar: title, a status slot that takes the free space, and actions. |

## Recipes

A recipe is an arrangement of core classes for one task. It adds no class and no stylesheet. Each recipe has a page under `docs/recipes/` and stories under **Recipes** in the HTML Storybook.

| Recipe | Built from | Behavior |
| --- | --- | --- |
| [Number stepper](docs/recipes/number-stepper.md) | An `odd-row` with `role="group"`, `odd-button`s with `data-step`, and an `odd-input type="number"` | `enhanceStepper` |
| [Slider with number](docs/recipes/slider-with-number.md) | An `odd-row` holding an `odd-slider`, an `odd-input type="number"`, and an optional `odd-muted` unit | `enhanceRangeField` |
| [Stat row](docs/recipes/stat-row.md) | An `odd-stack` holding an `odd-row` of a label and an `odd-stat-value`, then an `odd-meter` or `odd-progress` | None |

## Recipes

A recipe is an arrangement of core classes for one task. It adds no class and no stylesheet. Each recipe has a page under `docs/recipes/` and stories under **Recipes** in the HTML Storybook.

| Recipe | Built from | Behavior |
| --- | --- | --- |
| [Number stepper](docs/recipes/number-stepper.md) | An `odd-row` with `role="group"`, `odd-button`s with `data-step`, and an `odd-input type="number"` | `enhanceStepper` |
| [Slider with number](docs/recipes/slider-with-number.md) | An `odd-row` holding an `odd-slider`, an `odd-input type="number"`, and an optional `odd-muted` unit | `enhanceRangeField` |
| [Stat row](docs/recipes/stat-row.md) | An `odd-stack` holding an `odd-row` of a label and an `odd-stat-value`, then an `odd-meter` or `odd-progress` | None |

## Behaviors

Menus, tabs, toasts, steppers, range fields, and logs need behavior HTML doesn't have yet, so `odd-design/enhance` (`src/js/enhance.ts`) adds them on top of native markup. Each function takes an element and returns a cleanup function. No dependencies. There is no framework, and the React wrapper is optional.

```js
import { enhance, toast } from "odd-design/enhance";

enhance();                   // menus, tab sets, toasters, logs, select-all tables, and the fallbacks below, under document
toast({ title: "Deck saved", tone: "success" });
```

- `enhanceMenu(menu)`, `enhanceTabs(root)`, `enhanceToaster(region)`, `enhanceSelectAll(table)`, `enhanceLog(log)`: one widget each. Call them for elements added after `enhance()`.
- `enhanceStepper(root)` wires the `button[data-step]`s under `root` to the first number input under it. `enhance()` does not find steppers, so call it on each one. The markup is in [Number stepper](docs/recipes/number-stepper.md).
- `enhanceRangeField(root, { message })` syncs the first range input and the first number input under `root`, and shows an `odd-error` for a number the slider can't take. `enhance()` does not find these rows, so call it on each one. The markup is in [Slider with number](docs/recipes/slider-with-number.md).
- `enhanceTabs(root)` wires a tab set once, however many times it is called. Each call returns its own cleanup, and the last cleanup unwires. A React `Tabs` runs it on itself, so `enhance()` beside it does not wire the set twice.
- `enhanceToaster(region)` wires a `section.odd-toaster` once, however many times it is called, as `enhanceTabs` does. `toast({ title, description, tone, duration, action })` shows a toast on the newest wired region still in the document and returns `{ dismiss }`. It throws when no region is wired.
- `appendLogLine(log, text, { tone, time, max })`: adds a line as text, with `time` as a `Date` or a string, and drops the oldest lines past `max` (500).
- `avatarFallback()`: an `.odd-avatar[data-initials]` whose image fails to load shows its initials. It replaces the avatar's children, so use it on markup the page owns, not on a React `Avatar`.
- `interestForFallback()` and `closedByFallback()`: tooltips and hover cards, and `closedby="any"`, in browsers without them. They do nothing where the browser has the feature.
- `roving(container, options)`: the shared arrow-key, Home/End, and typeahead helper the widgets use.
