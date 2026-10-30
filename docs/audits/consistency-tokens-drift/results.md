# Chrome drift measurements

Run `audit-drift` of `.agents/skills/verify-odd-design/scripts/ctl.ts`, Storybook dev server on source identical to baseline `d21483c`, headless Chrome, palette `default`, viewport 1280×900. No product file changes between `d21483c` and this branch, so the measured values hold at both. Every cell is a fresh `goto` with `chrome:<c>;palette:default;mode:<m>`. Focus comes from real Tab presses (and ArrowDown for the menu), hover from `ctl.ts hover`, and pointer down from a real CDP `mousePressed` held 450 ms. Every focus cell matched `:focus-visible`, every hover cell matched `:hover`, and every press cell matched `:active`.

The throwaway helper scripts stayed local under `.verify/audit/drift/`, which is gitignored, and were not committed. `cdp.ts` talks to the same run's Chrome for the two things `ctl.ts` lacks: computed style of a user-agent shadow part (`getComputedStyle(el, "::-webkit-slider-thumb")` returns the host's style in Chrome, so the thumb and the search clear button are read through `CSS.getComputedStyleForNode`), and a pointer held down. `measure.ts` drives the sweep through `ctl.ts` and writes `data.json`, which holds every raw value and is committed beside this file. `report.ts` renders this file from it. Colors are shortened to `ok(...)`. No story or source file was changed.

Story ids. All ids in the render-candidate list resolved in `/index.json`, so no correction was needed. Two comparison elements named in the findings do not exist in the stories, and the substitutes are noted per section.

## CSS-03. Focus ring halo and offset

- **Stories.** `components-button--playground` (`.odd-button`), `components-forms--text-fields` (`#name`), `components-forms--segmented` (Tab to the checked radio, measured on `.odd-segmented > label:has(:focus-visible)`), `components-interactive--tabs` (`#tab-cards`), `components-interactive--menu` (Tab to the trigger, ArrowDown, measured on `.odd-menu-item:focus-visible`, which is Duplicate), `components-forms--switch` (`.odd-switch`), `components-surfaces--disclosure` (`summary`), `components-controls--emergency-stop` (`#estop`), `components-forms--slider` (`#copies` and its UA `#thumb` part).
- **Glow column.** "yes" means the element's `box-shadow` contains the chrome's `--focus-glow` layer (glass `0 0 0 6px` ring at 22%, expressive `0 0 12px` blur). The tab and segmented items keep `--shadow-control` because they are the selected item, not because of focus.

### Outline offset and width (px), per chrome, light mode (dark is identical for these two properties)

| element | calm off/w | glass off/w | bubblegum off/w | expressive off/w | darkmatter off/w |
| --- | --- | --- | --- | --- | --- |
| button | 2px / 2px | 3px / 2px | 3px / 3px | 2px / 2px | 2px / 2px |
| input | 0px / 2px | 0px / 2px | 0px / 3px | 0px / 2px | 0px / 2px |
| segmented | 1px / 2px | 1px / 2px | 1px / 3px | 1px / 2px | 1px / 2px |
| tab | 1px / 2px | 1px / 2px | 1px / 3px | 1px / 2px | 1px / 2px |
| menuitem | -2px / 2px | -2px / 2px | -3px / 3px | -2px / 2px | -2px / 2px |
| switch | 2px / 2px | 3px / 2px | 3px / 3px | 2px / 2px | 2px / 2px |
| disclosure | 2px / 2px | 3px / 2px | 3px / 3px | 2px / 2px | 2px / 2px |
| estop | 4px / 4px | 4px / 4px | 4px / 5px | 4px / 4px | 4px / 4px |
| slider | 2px / 2px | 3px / 2px | 3px / 3px | 2px / 2px | 2px / 2px |
| **chrome token** `--focus-offset` / `--focus-width` | 2px / 2px | 3px / 2px | 3px / 3px | 2px / 2px | 2px / 2px |

### Focus glow present, per chrome and mode

| element | calm light | calm dark | glass light | glass dark | bubblegum light | bubblegum dark | expressive light | expressive dark | darkmatter light | darkmatter dark |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| button | no | no | yes | yes | no | no | yes | yes | no | no |
| input | no | no | yes | yes | no | no | yes | yes | no | no |
| segmented | no | no | no | no | no | no | no | no | no | no |
| tab | no | no | no | no | no | no | no | no | no | no |
| menuitem | no | no | no | no | no | no | no | no | no | no |
| switch | no | no | no | no | no | no | no | no | no | no |
| disclosure | no | no | no | no | no | no | no | no | no | no |
| estop | no | no | no | no | no | no | no | no | no | no |
| slider | no | no | no | no | no | no | no | no | no | no |

### Slider halo color against the chrome's focus color

| chrome | mode | `#copies` outlineColor (= --focus-color) | thumb box-shadow while focused |
| --- | --- | --- | --- |
| calm | light | ok(0.56 0.19 38) | ok(0 0 0 / 0.06) 0px 1px 2px 0px, ok(0.56 0.19 38 / 0.3) 0px 0px 0px 4px |
| calm | dark | ok(0.72 0.17 40) | ok(0 0 0 / 0.3) 0px 1px 2px 0px, ok(0.72 0.13 0.10 / 0.29) 0px 0px 0px 3.99px |
| glass | light | ok(0.56 0.19 38) | ok(1 0 0 / 0.6) 0px 1px 0px 0px inset, ok(0 0 0 / 0.06) 0px 1px 2px 0px, ok(0.56 0.14 0.11 / 0.30) 0px 0px 0px 4.00px |
| glass | dark | ok(0.72 0.17 40) | ok(1 0 0 / 0.12) 0px 1px 0px 0px inset, ok(0 0 0 / 0.3) 0px 1px 2px 0px, ok(0.72 0.13 0.10 / 0.30) 0px 0px 0px 4.00px |
| bubblegum | light | ok(0.22 0.02 40) | ok(0.22 0.01 0.01) 3px 3px 0px 0px, ok(0.56 0.14 0.11 / 0.29) 0px 0px 0px 3.96px |
| bubblegum | dark | ok(0.95 0.01 70) | ok(0.95 0.00 0.01) 3px 3px 0px 0px, ok(0.72 0.13 0.10 / 0.29) 0px 0px 0px 3.95px |
| expressive | light | ok(0.3 0.02 40) | ok(0.3 0.02 40 / 0.55) 0px 0px 2px 0px, ok(0.3 0.02 40 / 0.3) 0px 0px 8px 0px, ok(0.56 0.19 38 / 0.3) 0px 0px 0px 4px |
| expressive | dark | ok(0.84 0.05 60) | ok(0.84 0.02 0.04 / 0.55) 0px 0px 2px 0px, ok(0.84 0.02 0.04 / 0.3) 0px 0px 8px 0px, ok(0.72 0.13 0.10 / 0.30) 0px 0px 0px 4.00px |
| darkmatter | light | ok(0.56 0.19 38) | ok(0 0 0 / 0.03) 0px 1px 4px 0px, ok(0.56 0.14 0.11 / 0.29) 0px 0px 0px 3.99px |
| darkmatter | dark | ok(0.72 0.17 40) | ok(0 0 0 / 0.2) 0px 1px 4px 0px, ok(0.72 0.17 40 / 0.3) 0px 0px 0px 4px |

- **Screenshots.** `.verify/evidence/audit-drift/drift/CSS-03/tab/calm-light.png`, `.verify/evidence/audit-drift/drift/CSS-03/tab/glass-light.png`, `.verify/evidence/audit-drift/drift/CSS-03/button/calm-light.png`, `.verify/evidence/audit-drift/drift/CSS-03/button/glass-light.png`, `.verify/evidence/audit-drift/drift/CSS-03/segmented/calm-light.png`, `.verify/evidence/audit-drift/drift/CSS-03/segmented/bubblegum-light.png`. In `tab/glass-light.png` the focused Cards tab has the outline only. In `button/glass-light.png` the button has the outline plus the faint 6px glass halo. In `segmented/bubblegum-light.png` the 3px ring sits 1px off the Grid item, against bubblegum's 3px token offset.
- **Verdict. DRIFT MEASURED.** The glow reaches only the button and the input. Under glass (6.18px ring) and expressive (12.17px blur), the segmented item, tab, menu item, switch, disclosure summary, e-stop, and slider input carry no glow layer, in both modes. Offsets ignore the chrome in four places. Segmented and tab stay at 1px in every chrome, against 2px, 3px, and 3px tokens. The input stays at 0px. The e-stop stays at 4px with a width of token + 2px (4px, 5px in bubblegum). The menu item follows the chrome through `calc(--focus-width * -1)` (-2px, -3px in bubblegum). The slider halo is always `--ring` at 30% and 4px. In bubblegum light the outline is `ok(0.22 0.02 40)` (foreground) and the halo is `ok(0.56 0.14 0.11)` (ring hue). In expressive light the outline is `ok(0.3 0.02 40)` (primary) and the halo is `ok(0.56 0.19 38 / 0.3)`.

## CSS-15. Switch thumb inset

- **Story.** `components-forms--switch`. Elements `.odd-switch:checked` (Show card prices) and `.odd-switch:not(:checked)` (Compact grid).
- **Gap** is (height - 2 × border - thumb) / 2, the space between the thumb and the inside of the track border, top and bottom.

| chrome | mode | border | height | thumb (background-size) | padding box | gap per side |
| --- | --- | --- | --- | --- | --- | --- |
| calm | light | 1px | 24px | 20px | 22.00px | 1.00px |
| calm | dark | 1px | 24px | 20px | 22.00px | 1.00px |
| glass | light | 1px | 25.18px | 21.2px | 23.19px | 0.99px |
| glass | dark | 1px | 25.18px | 21.2px | 23.19px | 0.99px |
| bubblegum | light | 2px | 25.18px | 21.2px | 21.19px | -0.01px |
| bubblegum | dark | 2px | 25.18px | 21.2px | 21.19px | -0.01px |
| expressive | light | 1px | 24px | 20px | 22.00px | 1.00px |
| expressive | dark | 1px | 24px | 20px | 22.00px | 1.00px |
| darkmatter | light | 1px | 24px | 20px | 22.00px | 1.00px |
| darkmatter | dark | 1px | 24px | 20px | 22.00px | 1.00px |

Unchecked rows have the same values (see `data.json`). Positions are `1px 50%` and `calc(100% - 1px) 50%` in every chrome.

- **Screenshots.** `.verify/evidence/audit-drift/drift/CSS-15/calm-light.png`, `.verify/evidence/audit-drift/drift/CSS-15/bubblegum-light.png`. In bubblegum the white thumb touches the dark track border. In calm a hairline of track shows around it.
- **Verdict. DRIFT MEASURED.** The gap is 1px in calm, glass, expressive, and darkmatter, and 0px (-0.01px) in bubblegum, where the 2px border eats the gap. The thumb is 21.2px inside a 21.19px padding box.

## CSS-11. Disclosure summary weight

- **Story.** `components-surfaces--disclosure`, element `summary` (first). **Comparison correction.** The story has no `h2`, so the comparison is the resolved `--heading-weight` on the summary itself and `.odd-card-title` in `components-surfaces--card`, which reads all four heading tokens.

| chrome | mode | summary font-weight | --heading-weight | card title font-weight | summary text-transform | summary letter-spacing |
| --- | --- | --- | --- | --- | --- | --- |
| calm | light | 600 | 650 | 650 | none | -0.24px |
| calm | dark | 600 | 650 | 650 | none | -0.24px |
| glass | light | 600 | 550 | 550 | none | -0.4px |
| glass | dark | 600 | 550 | 550 | none | -0.4px |
| bubblegum | light | 600 | 800 | 800 | none | -0.32px |
| bubblegum | dark | 600 | 800 | 800 | none | -0.32px |
| expressive | light | 600 | 750 | 750 | uppercase | 0.8px |
| expressive | dark | 600 | 750 | 750 | uppercase | 0.8px |
| darkmatter | light | 600 | 600 | 600 | none | -0.16px |
| darkmatter | dark | 600 | 600 | 600 | none | -0.16px |

- **Screenshots.** `.verify/evidence/audit-drift/drift/CSS-11/calm-light.png`, `.verify/evidence/audit-drift/drift/CSS-11/expressive-light.png`. Under expressive the summaries are uppercase and tracked like headings but at body-bold weight.
- **Verdict. DRIFT MEASURED.** The summary is 600 in every chrome and mode. Headings are 650 (calm), 550 (glass), 800 (bubblegum), and 750 (expressive). They match only in darkmatter (600). The other three heading tokens (font, case, tracking) do follow the chrome. Expressive, for example, gives uppercase with 0.8px = 0.05em tracking.

## CSS-12. Overlay radius split

- **Stories and elements.** `components-overlays--popover` (`#filters`, opened by clicking its trigger), `components-interactive--menu` (`#deck-actions`), `components-interactive--toast` (`.odd-toast` after clicking `[data-toast=saved]`), `components-surfaces--dialog` (`#confirm-delete`), `components-overlays--sheet` (`#sheet-end`, which rounds only its start corners). Every overlay was open when measured.

| chrome | mode | --radius-surface | --radius-overlay | popover | menu | toast | dialog | sheet (start corners) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| calm | light | 0.875rem | 1.125rem | 14px | 14px | 14px | 18px | 18px |
| calm | dark | 0.875rem | 1.125rem | 14px | 14px | 14px | 18px | 18px |
| glass | light | 1.5rem | 1.75rem | 24px | 24px | 24px | 28px | 28px |
| glass | dark | 1.5rem | 1.75rem | 24px | 24px | 24px | 28px | 28px |
| bubblegum | light | 1rem | 1.25rem | 16px | 16px | 16px | 20px | 20px |
| bubblegum | dark | 1rem | 1.25rem | 16px | 16px | 16px | 20px | 20px |
| expressive | light | 0.875rem | 1rem | 14px | 14px | 14px | 16px | 16px |
| expressive | dark | 0.875rem | 1rem | 14px | 14px | 14px | 16px | 16px |
| darkmatter | light | 1rem | 1.25rem | 16px | 16px | 16px | 20px | 20px |
| darkmatter | dark | 1rem | 1.25rem | 16px | 16px | 16px | 20px | 20px |

- **Screenshots.** `.verify/evidence/audit-drift/drift/CSS-12/popover/calm-light.png`, `.verify/evidence/audit-drift/drift/CSS-12/popover/glass-light.png`, `.verify/evidence/audit-drift/drift/CSS-12/dialog/glass-light.png`.
- **Verdict. DRIFT MEASURED.** Popover, menu, and toast follow `--radius-surface`. Dialog and sheet follow `--radius-overlay`. The gap is 4px in calm (14 vs 18), glass (24 vs 28), bubblegum and darkmatter (16 vs 20), and 2px in expressive (14 vs 16). Both families do track the chrome. The drift is the split between them, not a literal.

## CSS-16. Grouped avatar shadow and ring

- **Story.** `components-data-display--avatar`. Lone `.odd-row > .odd-avatar[role="img"]:not([data-size])` (AR, default size). Grouped `.odd-avatar-group > .odd-avatar[role="img"]` (AR). **Comparison gap.** The story's group sits in an `.odd-stack` on the page, not in a card, so the "page-colored ring on a surface" half of the claim could not be rendered without editing the story.

| chrome | mode | lone box-shadow | grouped box-shadow |
| --- | --- | --- | --- |
| calm | light | ok(0 0 0 / 0.06) 0px 1px 2px 0px | ok(0.96 0.00 70) 0px 0px 0px 2px |
| calm | dark | ok(0 0 0 / 0.3) 0px 1px 2px 0px | ok(0.19 0.01 55) 0px 0px 0px 2px |
| glass | light | ok(1 0 0 / 0.6) 0px 1px 0px 0px inset, ok(0 0 0 / 0.06) 0px 1px 2px 0px | ok(0.96 0.00 70) 0px 0px 0px 2px |
| glass | dark | ok(1 0 0 / 0.12) 0px 1px 0px 0px inset, ok(0 0 0 / 0.3) 0px 1px 2px 0px | ok(0.19 0.01 55) 0px 0px 0px 2px |
| bubblegum | light | ok(0.22 0.02 40) 3px 3px 0px 0px | ok(0.96 0.00 70) 0px 0px 0px 2px |
| bubblegum | dark | ok(0.95 0.01 70) 3px 3px 0px 0px | ok(0.19 0.01 55) 0px 0px 0px 2px |
| expressive | light | ok(0.3 0.02 40 / 0.55) 0px 0px 2px 0px, ok(0.3 0.02 40 / 0.3) 0px 0px 8px 0px | ok(0.96 0.00 70) 0px 0px 0px 2px |
| expressive | dark | ok(0.84 0.05 60 / 0.55) 0px 0px 2px 0px, ok(0.84 0.05 60 / 0.3) 0px 0px 8px 0px | ok(0.19 0.01 55) 0px 0px 0px 2px |
| darkmatter | light | ok(0 0 0 / 0.03) 0px 1px 4px 0px | ok(0.96 0.00 70) 0px 0px 0px 2px |
| darkmatter | dark | ok(0 0 0 / 0.2) 0px 1px 4px 0px | ok(0.19 0.01 55) 0px 0px 0px 2px |

- **Screenshots.** `.verify/evidence/audit-drift/drift/CSS-16/calm-dark.png`, `.verify/evidence/audit-drift/drift/CSS-16/bubblegum-dark.png`. In bubblegum dark the lone avatars carry the light 3px offset shadow and the grouped ones carry none.
- **Verdict. DRIFT MEASURED** for the shadow. In every chrome the grouped avatar's shadow is only `0 0 0 2px var(--background)`, `ok(0.965 0.007 70)` light and `ok(0.19 0.012 55)` dark. The chrome's control shadow is gone, including bubblegum's `3px 3px 0` offset and expressive's 2px + 8px glow. **INCONCLUSIVE** for the ring on a surface, because no story renders a group inside a card. The `--surface` the ring would sit on is `ok(0.99 0.004 60)` / `ok(0.235 0.014 52)`, against the ring's `--background` `ok(0.965 …)` / `ok(0.19 …)`.

## CSS-10. Label tracking and case

- **Stories.** `components-data-display--avatar` (`.odd-row > .odd-avatar[role="img"]:not([data-size])`, text "AR"), `components-controls--emergency-stop` (`#estop`, text "Stop"), against `components-surfaces--badge` (first `.odd-badge`, text "Neutral"). Tracking is `letter-spacing / font-size`.

| chrome | mode | --label-tracking | --label-case | badge tracking / case | avatar tracking / case | e-stop tracking / case |
| --- | --- | --- | --- | --- | --- | --- |
| calm | light | 0.01em | none | 0.010em / none | 0.020em / uppercase | 0.060em / uppercase |
| calm | dark | 0.01em | none | 0.010em / none | 0.020em / uppercase | 0.060em / uppercase |
| glass | light | 0 | none | 0.000em / none | 0.020em / uppercase | 0.060em / uppercase |
| glass | dark | 0 | none | 0.000em / none | 0.020em / uppercase | 0.060em / uppercase |
| bubblegum | light | 0 | none | 0.000em / none | 0.020em / uppercase | 0.060em / uppercase |
| bubblegum | dark | 0 | none | 0.000em / none | 0.020em / uppercase | 0.060em / uppercase |
| expressive | light | 0.08em | uppercase | 0.080em / uppercase | 0.020em / uppercase | 0.060em / uppercase |
| expressive | dark | 0.08em | uppercase | 0.080em / uppercase | 0.020em / uppercase | 0.060em / uppercase |
| darkmatter | light | 0.01em | none | 0.010em / none | 0.020em / uppercase | 0.060em / uppercase |
| darkmatter | dark | 0.01em | none | 0.010em / none | 0.020em / uppercase | 0.060em / uppercase |

- **Screenshots.** `.verify/evidence/audit-drift/drift/CSS-10/avatar/calm-light.png`, `.verify/evidence/audit-drift/drift/CSS-10/avatar/expressive-light.png`, `.verify/evidence/audit-drift/drift/CSS-10/estop/expressive-light.png`, `.verify/evidence/audit-drift/drift/CSS-10/badge/expressive-light.png`. Under expressive the badges read "NEUTRAL" with wide tracking, while the e-stop reads "STOP" with visibly tighter tracking.
- **Verdict. DRIFT MEASURED.** The badge follows the chrome (0.010em, 0, 0, 0.080em, 0.010em, with uppercase only in expressive). The avatar is fixed at 0.020em and uppercase, and the e-stop at 0.060em and uppercase, in every chrome and mode. Under expressive that is 0.02em and 0.06em against 0.08em. Under calm, glass, bubblegum, and darkmatter the e-stop is uppercased while `--label-case` is `none`. The avatar's forced uppercase has no visible effect on "AR", which is already uppercase.

## CSS-14. E-stop press

- **Stories.** `components-controls--emergency-stop` (`#estop`) against `components-button--variants` (`.odd-button[data-variant="primary"]`). Pointer held down 450 ms through `cdp.ts hold`. During the hold `#estop` is `:active` and still `aria-pressed="false"`, so the `:active` rule produced the transform, not the latched state.

| chrome | mode | --press-transform | e-stop transform (held) | button transform (held) |
| --- | --- | --- | --- | --- |
| calm | light | scale(0.98) | matrix(0.95, 0, 0, 0.95, 0, 0) | matrix(0.98, 0, 0, 0.98, 0, 0) |
| calm | dark | scale(0.98) | matrix(0.95, 0, 0, 0.95, 0, 0) | matrix(0.98, 0, 0, 0.98, 0, 0) |
| glass | light | scale(0.97) | matrix(0.95, 0, 0, 0.95, 0, 0) | matrix(0.97, 0, 0, 0.97, 0, 0) |
| glass | dark | scale(0.97) | matrix(0.95, 0, 0, 0.95, 0, 0) | matrix(0.97, 0, 0, 0.97, 0, 0) |
| bubblegum | light | translate(3px, 3px) | matrix(0.95, 0, 0, 0.95, 0, 0) | matrix(1, 0, 0, 1, 3, 3) |
| bubblegum | dark | translate(3px, 3px) | matrix(0.95, 0, 0, 0.95, 0, 0) | matrix(1, 0, 0, 1, 3, 3) |
| expressive | light | scale(0.97) | matrix(0.95, 0, 0, 0.95, 0, 0) | matrix(0.97, 0, 0, 0.97, 0, 0) |
| expressive | dark | scale(0.97) | matrix(0.95, 0, 0, 0.95, 0, 0) | matrix(0.97, 0, 0, 0.97, 0, 0) |
| darkmatter | light | scale(0.99) | matrix(0.95, 0, 0, 0.95, 0, 0) | matrix(0.99, 0, 0, 0.99, 0, 0) |
| darkmatter | dark | scale(0.99) | matrix(0.95, 0, 0, 0.95, 0, 0) | matrix(0.99, 0, 0, 0.99, 0, 0) |

### With `prefers-reduced-motion: reduce` emulated (light)

| chrome | --press-transform | e-stop transform (held) | button transform (held) |
| --- | --- | --- | --- |
| calm | none | matrix(0.95, 0, 0, 0.95, 0, 0) | none |
| bubblegum | none | matrix(0.95, 0, 0, 0.95, 0, 0) | none |

- **Screenshots** (taken while held). `.verify/evidence/audit-drift/drift/CSS-14/estop/calm-light.png`, `.verify/evidence/audit-drift/drift/CSS-14/estop/bubblegum-light.png`, `.verify/evidence/audit-drift/drift/CSS-14/button/bubblegum-light.png`. In bubblegum the held e-stop is scaled down in place, while the held primary button is shifted 3px onto its shadow.
- **Verdict. DRIFT MEASURED.** The e-stop presses to `scale(0.95)` in all 10 cells. The button follows `--press-transform`: 0.98 in calm, 0.97 in glass and expressive, 0.99 in darkmatter, and `translate(3px, 3px)` in bubblegum. Under reduced motion the token becomes `none` and the button stops moving, but the e-stop still scales to 0.95.

## CSS-01. Label weight against heading weight

- **Stories.** `components-button--variants` (`.odd-button[data-variant="primary"]`) and `components-surfaces--card` (first `.odd-card-title` and first `.odd-badge`).

| chrome | mode | --heading-weight | card title weight | button label weight | badge weight |
| --- | --- | --- | --- | --- | --- |
| calm | light | 650 | 650 | 600 | 600 |
| calm | dark | 650 | 650 | 600 | 600 |
| glass | light | 550 | 550 | 600 | 600 |
| glass | dark | 550 | 550 | 600 | 600 |
| bubblegum | light | 800 | 800 | 600 | 600 |
| bubblegum | dark | 800 | 800 | 600 | 600 |
| expressive | light | 750 | 750 | 600 | 600 |
| expressive | dark | 750 | 750 | 600 | 600 |
| darkmatter | light | 600 | 600 | 600 | 600 |
| darkmatter | dark | 600 | 600 | 600 | 600 |

- **Screenshots.** `.verify/evidence/audit-drift/drift/CSS-01/calm-light.png`, `.verify/evidence/audit-drift/drift/CSS-01/glass-light.png`, `.verify/evidence/audit-drift/drift/CSS-01/bubblegum-light.png`. In glass the "Midnight Control" title is lighter than the "Legal" and "60 cards" badge labels. In bubblegum it is much heavier.
- **Verdict. DRIFT MEASURED** (as the finding predicts, a mismatch rather than a regression). Labels are 600 in every chrome and mode. Headings follow the chrome at 650, 550, 800, 750, and 600. Glass is the inverted case, with labels 50 heavier than headings. Bubblegum is the widest gap at 200. They match only in darkmatter.

## CSS-17. Slider thumb border

- **Story.** `components-forms--slider`, `#copies`, read through its UA `#thumb` part (`::-webkit-slider-thumb`), unfocused and unhovered.

| chrome | mode | --border-width | thumb border width | thumb size |
| --- | --- | --- | --- | --- |
| calm | light | 1px | 2px | 20px |
| calm | dark | 1px | 2px | 20px |
| glass | light | 1px | 2px | 21px |
| glass | dark | 1px | 2px | 21px |
| bubblegum | light | 2px | 2px | 21px |
| bubblegum | dark | 2px | 2px | 21px |
| expressive | light | 1px | 2px | 20px |
| expressive | dark | 1px | 2px | 20px |
| darkmatter | light | 1px | 2px | 20px |
| darkmatter | dark | 1px | 2px | 20px |

- **Screenshots.** `.verify/evidence/audit-drift/drift/CSS-17/calm-light.png`, `.verify/evidence/audit-drift/drift/CSS-17/bubblegum-light.png`. In calm the thumb ring is drawn at 2px while the chrome border is 1px.
- **Verdict. DRIFT MEASURED.** The thumb border is 2px in all 10 cells. `--border-width` is 1px in calm, glass, expressive, and darkmatter, so the thumb is twice the chrome's border there. They match only in bubblegum.

## CSS-07. Disabled strength and hover guard

- **Stories.** `components-forms--text-fields` (`#disabled`, the Owner input, with `#name` as the enabled reference) and `components-button--states` (`.odd-button[aria-disabled="true"]:not([data-variant])`). Hover from `ctl.ts hover` plus a 400 ms wait.

| chrome | mode | input opacity | input border at rest | input border hovered | enabled input border hovered | button opacity | button bg at rest → hovered |
| --- | --- | --- | --- | --- | --- | --- | --- |
| calm | light | 0.7 | ok(0.55 0.02 50) | ok(0.38 0.02 45) | ok(0.38 0.02 45) | 0.55 | ok(0.99 0.00 60) → ok(0.99 0.00 60) |
| calm | dark | 0.7 | ok(0.61 0.02 55) | ok(0.78 0.01 62.5) | ok(0.78 0.01 62.5) | 0.55 | ok(0.23 0.01 52) → ok(0.23 0.01 52) |
| glass | light | 0.7 | ok(0.55 0.02 50) | ok(0.38 0.02 45) | ok(0.38 0.02 45) | 0.55 | ok(0.99 0.00 60) → ok(0.99 0.00 60) |
| glass | dark | 0.7 | ok(0.61 0.02 55) | ok(0.78 0.01 62.5) | ok(0.78 0.01 62.5) | 0.55 | ok(0.23 0.01 52) → ok(0.23 0.01 52) |
| bubblegum | light | 0.7 | ok(0.22 0.02 40) | ok(0.22 0.02 40) | ok(0.22 0.02 40) | 0.55 | ok(0.99 0.00 60) → ok(0.99 0.00 60) |
| bubblegum | dark | 0.7 | ok(0.95 0.01 70) | ok(0.95 0.01 70) | ok(0.95 0.01 70) | 0.55 | ok(0.23 0.01 52) → ok(0.23 0.01 52) |
| expressive | light | 0.7 | ok(0.55 0.02 50) | ok(0.38 0.02 45) | ok(0.38 0.02 45) | 0.55 | ok(0.99 0.00 60) → ok(0.99 0.00 60) |
| expressive | dark | 0.7 | ok(0.61 0.02 55) | ok(0.78 0.01 62.5) | ok(0.78 0.01 62.5) | 0.55 | ok(0.23 0.01 52) → ok(0.23 0.01 52) |
| darkmatter | light | 0.7 | ok(0.55 0.02 50) | ok(0.38 0.02 45) | ok(0.38 0.02 45) | 0.55 | ok(0.99 0.00 60) → ok(0.99 0.00 60) |
| darkmatter | dark | 0.7 | ok(0.61 0.02 55) | ok(0.78 0.01 62.5) | ok(0.78 0.01 62.5) | 0.55 | ok(0.23 0.01 52) → ok(0.23 0.01 52) |

- **Screenshots.** `.verify/evidence/audit-drift/drift/CSS-07/field/calm-light.png`, `.verify/evidence/audit-drift/drift/CSS-07/field/bubblegum-light.png`, `.verify/evidence/audit-drift/drift/CSS-07/button/calm-light.png`. Each was taken with the pointer on the disabled element.
- **Verdict. DRIFT MEASURED**, chrome-independent as the finding says. A disabled input dims to 0.7 and a disabled button to 0.55, in every cell. Hovering the disabled input moves its border to the enabled-hover color: in light, lightness 0.55 → 0.385, and in dark, 0.61 → 0.78. The one exception is bubblegum, whose control edge is already `--foreground`, so the hover mix is a no-op there. The disabled button does not change on hover.

## JS-03. `aria-disabled` tab draws as enabled

- **Story.** `components-interactive--tabs`. `#tab-s5` (native `disabled`) against `#tab-s6` (enabled). Count of `[role="tab"][aria-disabled="true"]` on the page.

| chrome | mode | native-disabled tab opacity / cursor | enabled tab opacity / cursor | aria-disabled tabs in story |
| --- | --- | --- | --- | --- |
| calm | light | 0.55 / not-allowed | 1 / pointer | 0 |
| calm | dark | 0.55 / not-allowed | 1 / pointer | 0 |
| glass | light | 0.55 / not-allowed | 1 / pointer | 0 |
| glass | dark | 0.55 / not-allowed | 1 / pointer | 0 |
| bubblegum | light | 0.55 / not-allowed | 1 / pointer | 0 |
| bubblegum | dark | 0.55 / not-allowed | 1 / pointer | 0 |
| expressive | light | 0.55 / not-allowed | 1 / pointer | 0 |
| expressive | dark | 0.55 / not-allowed | 1 / pointer | 0 |
| darkmatter | light | 0.55 / not-allowed | 1 / pointer | 0 |
| darkmatter | dark | 0.55 / not-allowed | 1 / pointer | 0 |

Every CSS rule in the page whose selector names `role="tab"` and `disabled` (CSSOM walk of all stylesheets, including layers):

- `.odd-tabs [role="tab"]:disabled { cursor: not-allowed; opacity: 0.55; }`

- **Screenshots.** `.verify/evidence/audit-drift/drift/JS-03/calm-light.png`, `.verify/evidence/audit-drift/drift/JS-03/expressive-light.png`. Season 5 (native disabled) is dimmed.
- **Verdict. INCONCLUSIVE.** No story, HTML or React, renders a tab with `aria-disabled="true"` (count 0 in every cell). Rendering one would mean editing a story or injecting markup, both out of scope. The read-only evidence supports the claim. The only disabled-tab rule in the loaded CSS is `.odd-tabs [role="tab"]:disabled`, which an `aria-disabled` tab would not match. The native-disabled tab dims to 0.55 with `not-allowed` in every chrome.

## JS-10. Close glyph stroke widths

- **Stories.** `components-interactive--toast` (the Dismiss `svg` in `.odd-toast` after clicking `[data-toast=saved]`) and `components-forms--search` (`#card-search` focused by Tab, its UA `-webkit-search-cancel-button` part read through `cdp.ts`). Effective stroke is `stroke-width × rendered size / 24` (both glyphs use a 24-unit viewBox).

| chrome | mode | toast stroke-width / size / effective | toast linejoin | search stroke-width / size / effective |
| --- | --- | --- | --- | --- |
| calm | light | 2 / 13.80px / 1.15px | none | 2.5 / 16px / 1.67px |
| calm | dark | 2 / 13.80px / 1.15px | none | 2.5 / 16px / 1.67px |
| glass | light | 2 / 13.80px / 1.15px | none | 2.5 / 16px / 1.67px |
| glass | dark | 2 / 13.80px / 1.15px | none | 2.5 / 16px / 1.67px |
| bubblegum | light | 2 / 13.80px / 1.15px | none | 2.5 / 16px / 1.67px |
| bubblegum | dark | 2 / 13.80px / 1.15px | none | 2.5 / 16px / 1.67px |
| expressive | light | 2 / 13.80px / 1.15px | none | 2.5 / 16px / 1.67px |
| expressive | dark | 2 / 13.80px / 1.15px | none | 2.5 / 16px / 1.67px |
| darkmatter | light | 2 / 13.80px / 1.15px | none | 2.5 / 16px / 1.67px |
| darkmatter | dark | 2 / 13.80px / 1.15px | none | 2.5 / 16px / 1.67px |

- **Screenshots.** `.verify/evidence/audit-drift/drift/JS-10/toast/calm-light.png`, `.verify/evidence/audit-drift/drift/JS-10/toast/expressive-light.png`, `.verify/evidence/audit-drift/drift/JS-10/search/calm-light.png`, `.verify/evidence/audit-drift/drift/JS-10/search/expressive-light.png`. The two X glyphs are small at this viewport, so the numbers carry the claim.
- **Verdict. DRIFT MEASURED**, chrome-independent. The toast close renders at 2 units over 13.80px, which is 1.15px of stroke, with no `stroke-linejoin`. The search clear renders at 2.5 units over 16px, which is 1.67px. The search glyph is 45% heavier in every chrome and mode.
