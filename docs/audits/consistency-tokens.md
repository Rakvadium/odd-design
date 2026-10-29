# Consistency and tokens audit

## Current state

## Consistency gaps

<!-- audit:matrix -->

| Component | CSS file | `index.css` import | `WRAPPERS` rows | `USAGE` rules | React module | Module kind | `"use client"` | Usage doc | Mirrored story | Type fail fixtures (prefixes) | Usage fixtures | `react.test.tsx` rows | Enhancer | Called by `enhance()` | Verify recipe |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| alert | src/css/components/alert.css | yes | Alert, AlertTitle | alert (5), alertTitle (2) | src/react/alert.tsx | part() only | no | docs/usage/alert.md | Alert | 5 (alert, alert-title) | 10 html, 1 jsx | 1 markup, 0 describe | none | none | feedback |
| avatar | src/css/components/avatar.css | yes | Avatar, AvatarGroup | avatar (5), avatarGroup (5) | src/react/avatar.tsx | part() only | no | docs/usage/avatar.md | Avatar | 8 (avatar, avatar-group) | 12 html, 1 jsx | 1 markup, 0 describe | avatarFallback | yes | data-display |
| badge | src/css/components/badge.css | yes | Badge | badge (4) | src/react/badge.tsx | part() only | no | docs/usage/badge.md | Badge | 2 (badge) | 8 html, 1 jsx | 1 markup, 0 describe | none | none | overlays, surfaces |
| button | src/css/components/button.css | yes | Button | button (15) | src/react/button.tsx | hand-written | yes | docs/usage/button.md | Button | 10 (button) | 30 html, 2 jsx | 8 markup, 1 describe | none | none | buttons, interactive, sample-app, surfaces |
| card | src/css/components/card.css | yes | Card, CardLink, CardFooter | card (8), cardTitle (2), cardLink (3), cardFooter (2) | src/react/card.tsx | part() only | no | docs/usage/card.md | Card | 3 (card, card-link) | 14 html, 1 jsx | 1 markup, 0 describe | none | none | surfaces |
| choice | src/css/components/choice.css | yes | Choice, Switch, Segmented | choice (3), switch (6) | src/react/choice.tsx | part() only | no | docs/usage/choice.md | Choice | 3 (choice, switch) | 6 html, 1 jsx | 1 markup, 0 describe | none | none | forms |
| dialog | src/css/components/dialog.css | yes | Dialog, DialogActions | dialog (7), dialogPart (4) | src/react/dialog.tsx | part() only | no | docs/usage/dialog.md | AlertDialog, Dialog | 7 (dialog, dialog-actions) | 16 html, 1 jsx | 2 markup, 0 describe | closedByFallback | yes | overlays, surfaces |
| disclosure | src/css/components/disclosure.css | yes | Disclosure | disclosure (3) | src/react/disclosure.tsx | part() only | no | docs/usage/disclosure.md | Disclosure | 1 (disclosure) | 6 html, 1 jsx | 1 markup, 0 describe | none | none | surfaces |
| estop | src/css/components/estop.css | yes | none | none | none | none | none | none | none | 0 | 0 html, 0 jsx | 0 markup, 0 describe | none | none | machine-controls |
| field | src/css/components/field.css | yes | Field, Label, Input, Textarea, Select, Hint, FieldError | field (2), fieldControl (4), fieldError (3) | src/react/field.tsx | part() only | no | docs/usage/field.md | Field | 2 (field-error, input) | 6 html, 1 jsx | 3 markup, 0 describe | none | none | forms, machine-controls |
| log | src/css/components/log.css | yes | none | none | none | none | none | none | none | 0 | 0 html, 0 jsx | 0 markup, 0 describe | enhanceLog | yes | machine-controls |
| menu | src/css/components/menu.css | yes | Menu, MenuItem | menu (7), menuItem (6) | src/react/menu.tsx | mixed | yes | docs/usage/menu.md | Menu | 7 (menu, menu-item) | 14 html, 1 jsx | 1 markup, 1 describe | enhanceMenu | yes | interactive |
| meter | src/css/components/meter.css | yes | Meter, Progress | meter (4) | src/react/meter.tsx | part() only | no | docs/usage/meter.md | Meter | 2 (meter, progress) | 6 html, 1 jsx | 2 markup, 0 describe | none | none | feedback |
| popover | src/css/components/popover.css | yes | Popover | popover (7) | src/react/popover.tsx | part() only | no | docs/usage/popover.md | Popover | 6 (popover) | 12 html, 1 jsx | 1 markup, 0 describe | none | none | overlays |
| range-field | src/css/components/range-field.css | yes | none | none | none | none | none | none | none | 0 | 0 html, 0 jsx | 0 markup, 0 describe | enhanceRangeField | yes | machine-controls |
| search | src/css/components/search.css | yes | Search | search (8) | src/react/search.tsx | part() only | no | docs/usage/search.md | Search | 2 (search) | 10 html, 1 jsx | 1 markup, 0 describe | none | none | forms |
| separator | src/css/components/separator.css | yes | Separator | separator (6) | src/react/separator.tsx | part() only | no | docs/usage/separator.md | Separator | 6 (separator) | 8 html, 1 jsx | 1 markup, 0 describe | none | none | data-display |
| sheet | src/css/components/sheet.css | yes | Sheet, SheetHeader, SheetFooter | sheet (8), sheetPart (4) | src/react/sheet.tsx | part() only | no | docs/usage/sheet.md | Sheet | 6 (sheet, sheet-footer) | 6 html, 1 jsx | 1 markup, 0 describe | closedByFallback | yes | overlays |
| shell | src/css/components/shell.css | yes | none | none | none | none | none | none | none | 0 | 0 html, 0 jsx | 0 markup, 0 describe | none | none | machine-controls |
| skeleton | src/css/components/skeleton.css | yes | Skeleton | skeleton (10) | src/react/skeleton.tsx | part() only | no | docs/usage/skeleton.md | Skeleton | 5 (skeleton) | 10 html, 1 jsx | 1 markup, 0 describe | none | none | feedback |
| slider | src/css/components/slider.css | yes | Slider | slider (5) | src/react/slider.tsx | part() only | no | docs/usage/slider.md | Slider | 3 (slider) | 8 html, 1 jsx | 1 markup, 0 describe | none | none | forms |
| stepper | src/css/components/stepper.css | yes | none | none | none | none | none | none | none | 0 | 0 html, 0 jsx | 0 markup, 0 describe | enhanceStepper | yes | machine-controls |
| table | src/css/components/table.css | yes | TableWrap, Table, TableSort | tableWrap (5), table (2), tableSort (3) | src/react/table.tsx | mixed | yes | docs/usage/table.md | Table | 7 (table, table-sort, table-wrap) | 10 html, 1 jsx | 1 markup, 1 describe | enhanceSelectAll | yes | data-display |
| tabs | src/css/components/tabs.css | yes | Tabs | tabs (6) | src/react/tabs.tsx | hand-written | yes | docs/usage/tabs.md | Tabs | 3 (tabs) | 10 html, 1 jsx | 1 markup, 1 describe | enhanceTabs | yes | interactive |
| toast | src/css/components/toast.css | yes | Toaster | toaster (5) | src/react/toast.tsx | hand-written | yes | docs/usage/toast.md | Toast | 5 (toaster) | 8 html, 1 jsx | 1 markup, 1 describe | enhanceToaster | yes | buttons, interactive |
| typography | src/css/components/typography.css | yes | none | none | none | none | none | none | none | 0 | 0 html, 0 jsx | 0 markup, 0 describe | none | none | foundations |

Not mapped to a component:

- usage fixture `odd-class-001.bad`
- usage fixture `odd-class-001.good`
- usage JSX fixture `children-prop`
- usage JSX fixture `cn`
- usage JSX fixture `link`
- usage JSX fixture `local-button`
- usage JSX fixture `radix`
- usage JSX fixture `raw.bad`
- usage JSX fixture `wrapper-data`
- usage JSX fixture `wrapper-href`
- usage JSX fixture `wrapper.bad`
- usage JSX fixture `wrapper.good`
- enhancer `interestForFallback` (src/js/fallbacks.ts, called by enhance())

<!-- /audit:matrix -->

## Hardcoded values

<!-- audit:stats -->

366 literals in 46 files, 311 distinct (file, property, value) keys.

| Category | Literals |
| --- | --- |
| color | 14 |
| spacing | 30 |
| size | 166 |
| radius | 9 |
| border-width | 22 |
| font-size | 3 |
| font-weight | 24 |
| tracking | 4 |
| line-height | 7 |
| shadow | 15 |
| motion | 29 |
| focus | 7 |
| other | 36 |

| Verdict | Literals |
| --- | --- |
| chrome | 20 |
| color | 1 |
| exception | 50 |
| missing-scale | 44 |
| none | 125 |
| shared | 78 |
| story | 48 |

`none` means no rule in the plan applies, so the literal is not a finding.

| Token graph | Count |
| --- | --- |
| References with no definition | 0 |
| ... of which have no fallback | 0 |
| Public tokens nothing reads | 12 |
| Palette tokens defined outside palettes and foundations | 7 |
| Chrome tokens defined outside chromes | 13 |
| Public custom properties in component files | 6 |
| Components in the matrix | 26 |

<!-- /audit:stats -->

<!-- audit:literals -->

### Color (14)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| color | `src/css/base.css:62` | `background` | `30%` |  | none one-off value |
| color | `src/css/components/alert.css:19` | `border` | `45%` |  | shared --tone-edge-mix |
| color | `src/css/components/alert.css:37` | `color` | `70%` |  | none one-off value |
| color | `src/css/components/avatar.css:18` | `border` | `40%` |  | shared --tone-edge-mix |
| color | `src/css/components/badge.css:14` | `border` | `35%` |  | shared --tone-edge-mix |
| color | `src/css/components/button.css:67` | `background-color` | `88%` |  | none one-off value |
| color | `src/css/components/button.css:71` | `background-color` | `8%` |  | none one-off value |
| color | `src/css/components/button.css:121` | `background-color` | `10%` |  | none one-off value |
| color | `src/css/components/choice.css:31` | `--_track` | `45%` |  | none one-off value |
| color | `src/css/components/choice.css:39` | `border` | `60%` |  | none one-off value |
| color | `src/css/components/estop.css:12` | `--_rim` | `black` |  | color raw black |
| color | `src/css/components/estop.css:12` | `--_rim` | `30%` |  | none one-off value |
| color | `src/css/components/field.css:90` | `border-color` | `50%` |  | none one-off value |
| color | `src/css/components/table.css:63` | `background` | `55%` |  | none one-off value |

### Spacing (30)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| spacing | `src/css/base.css:48` | `text-underline-offset` | `0.2em` |  | shared --underline-offset |
| spacing | `src/css/components/alert.css:18` | `padding` | `0.67` |  | shared --surface-padding-compact |
| spacing | `src/css/components/alert.css:36` | `margin-block-start` | `0.05em` |  | exception glyph geometry |
| spacing | `src/css/components/avatar.css:51` | `margin-inline-start` | `-0.2` |  | none one-off value |
| spacing | `src/css/components/badge.css:12` | `gap` | `0.4em` |  | shared --icon-gap |
| spacing | `src/css/components/badge.css:13` | `padding` | `0.2em` |  | none one-off value |
| spacing | `src/css/components/badge.css:13` | `padding` | `0.65em` |  | none one-off value |
| spacing | `src/css/components/button.css:16` | `gap` | `0.5em` |  | shared --icon-gap |
| spacing | `src/css/components/button.css:53` | `padding-inline` | `0.75` |  | none one-off value |
| spacing | `src/css/components/button.css:58` | `padding-inline` | `1.4` |  | none one-off value |
| spacing | `src/css/components/button.css:123` | `text-underline-offset` | `0.4em` |  | shared --underline-offset |
| spacing | `src/css/components/choice.css:70` | `gap` | `2px` |  | shared --segment-gap |
| spacing | `src/css/components/choice.css:72` | `padding` | `3px` |  | shared --inset-tight |
| spacing | `src/css/components/field.css:62` | `padding` | `0.85` |  | shared --input-padding-inline |
| spacing | `src/css/components/field.css:119` | `padding-inline-end` | `2.5rem` |  | exception glyph geometry |
| spacing | `src/css/components/field.css:137` | `padding-inline-end` | `0.85` |  | shared --input-padding-inline |
| spacing | `src/css/components/log.css:33` | `padding` | `0.0625rem` |  | none one-off value |
| spacing | `src/css/components/popover.css:35` | `padding` | `0.67` |  | shared --surface-padding-compact |
| spacing | `src/css/components/search.css:17` | `inset-block-start` | `50%` |  | none intrinsic value |
| spacing | `src/css/components/search.css:18` | `inset-inline-start` | `0.85` |  | shared --input-padding-inline |
| spacing | `src/css/components/search.css:27` | `padding-inline-start` | `0.85` |  | shared --input-padding-inline |
| spacing | `src/css/components/search.css:27` | `padding-inline-start` | `1.5rem` | `--space-5` | missing-scale icon-size |
| spacing | `src/css/components/table.css:97` | `gap` | `0.35em` |  | shared --icon-gap |
| spacing | `src/css/components/tabs.css:19` | `gap` | `2px` |  | shared --segment-gap |
| spacing | `src/css/components/tabs.css:20` | `padding` | `3px` |  | shared --inset-tight |
| spacing | `stories/Foundations.stories.ts:47` | `padding` | `0.15em` |  | story contrast swatch padding |
| spacing | `stories/Foundations.stories.ts:47` | `padding` | `0.6em` |  | story contrast swatch padding |
| spacing | `stories/Showcase.stories.ts:43` | `padding` | `1rem` | `--space-4` | story page padding floor |
| spacing | `stories/Showcase.stories.ts:43` | `padding` | `4vw` |  | story page padding fluid term |
| spacing | `stories/Showcase.stories.ts:43` | `padding` | `3rem` | `--space-8` | story page padding cap |

### Size (166)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| size | `src/css/base.css:15` | `min-block-size` | `100dvh` |  | none intrinsic value |
| size | `src/css/base.css:49` | `text-decoration-thickness` | `1px` |  | none one-off value |
| size | `src/css/base.css:53` | `text-decoration-thickness` | `2px` |  | shared --underline-strong |
| size | `src/css/base.css:76` | `inline-size` | `1px` |  | none intrinsic value |
| size | `src/css/base.css:77` | `block-size` | `1px` |  | none intrinsic value |
| size | `src/css/components/alert.css:34` | `inline-size` | `1.25rem` |  | missing-scale icon-size |
| size | `src/css/components/alert.css:35` | `block-size` | `1.25rem` |  | missing-scale icon-size |
| size | `src/css/components/avatar.css:10` | `--_size` | `2.5rem` |  | shared --avatar-size |
| size | `src/css/components/avatar.css:32` | `--_size` | `2rem` | `--space-6` | exception density-scaled private size |
| size | `src/css/components/avatar.css:33` | `--_size` | `3.5rem` |  | exception density-scaled private size |
| size | `src/css/components/avatar.css:36` | `inline-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/avatar.css:37` | `block-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/badge.css:29` | `inline-size` | `0.5em` |  | shared --tone-dot-size |
| size | `src/css/components/badge.css:30` | `block-size` | `0.5em` |  | shared --tone-dot-size |
| size | `src/css/components/button.css:91` | `inline-size` | `1.15em` |  | missing-scale icon-size |
| size | `src/css/components/button.css:92` | `block-size` | `1.15em` |  | missing-scale icon-size |
| size | `src/css/components/button.css:101` | `inline-size` | `1em` |  | exception glyph geometry |
| size | `src/css/components/button.css:102` | `block-size` | `1em` |  | exception glyph geometry |
| size | `src/css/components/button.css:122` | `text-decoration` | `2px` |  | shared --underline-strong |
| size | `src/css/components/choice.css:12` | `min-block-size` | `24px` |  | shared --target-min |
| size | `src/css/components/choice.css:17` | `inline-size` | `1.125rem` |  | shared --checkbox-size |
| size | `src/css/components/choice.css:18` | `block-size` | `1.125rem` |  | shared --checkbox-size |
| size | `src/css/components/choice.css:32` | `--_size` | `1.5rem` | `--space-5` | exception density-scaled private size |
| size | `src/css/components/choice.css:36` | `inline-size` | `1.75` |  | none one-off value |
| size | `src/css/components/choice.css:42` | `background` | `92%` |  | none intrinsic value |
| size | `src/css/components/choice.css:42` | `background` | `100%` |  | none intrinsic value |
| size | `src/css/components/choice.css:43` | `background` | `1px` |  | chrome --border-width |
| size | `src/css/components/choice.css:43` | `background` | `4px` |  | chrome --border-width |
| size | `src/css/components/choice.css:43` | `background` | `4px` |  | chrome --border-width |
| size | `src/css/components/choice.css:52` | `background` | `92%` |  | none intrinsic value |
| size | `src/css/components/choice.css:52` | `background` | `100%` |  | none intrinsic value |
| size | `src/css/components/choice.css:53` | `background` | `1px` |  | chrome --border-width |
| size | `src/css/components/choice.css:53` | `background` | `4px` |  | chrome --border-width |
| size | `src/css/components/choice.css:53` | `background` | `4px` |  | chrome --border-width |
| size | `src/css/components/choice.css:61` | `inline-size` | `1.125rem` |  | shared --checkbox-size |
| size | `src/css/components/choice.css:62` | `block-size` | `1.125rem` |  | shared --checkbox-size |
| size | `src/css/components/choice.css:80` | `inline-size` | `1px` |  | shared .odd-visually-hidden |
| size | `src/css/components/choice.css:81` | `block-size` | `1px` |  | shared .odd-visually-hidden |
| size | `src/css/components/dialog.css:11` | `inline-size` | `32rem` |  | shared --overlay-width-* |
| size | `src/css/components/dialog.css:11` | `inline-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/dialog.css:11` | `inline-size` | `2rem` | `--space-6` | shared --overlay-gutter |
| size | `src/css/components/dialog.css:12` | `max-block-size` | `40rem` |  | none one-off value |
| size | `src/css/components/dialog.css:12` | `max-block-size` | `100dvh` |  | none intrinsic value |
| size | `src/css/components/dialog.css:12` | `max-block-size` | `2rem` | `--space-6` | shared --overlay-gutter |
| size | `src/css/components/disclosure.css:32` | `inline-size` | `0.55rem` |  | exception glyph geometry |
| size | `src/css/components/disclosure.css:33` | `block-size` | `0.55rem` |  | exception glyph geometry |
| size | `src/css/components/estop.css:16` | `inline-size` | `8rem` |  | none one-off value |
| size | `src/css/components/field.css:48` | `inline-size` | `1.25em` |  | exception glyph geometry |
| size | `src/css/components/field.css:49` | `block-size` | `1.25em` |  | exception glyph geometry |
| size | `src/css/components/field.css:60` | `inline-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/field.css:76` | `min-block-size` | `2.5` |  | none one-off value |
| size | `src/css/components/field.css:123` | `background-position` | `1.15rem` |  | exception glyph geometry |
| size | `src/css/components/field.css:123` | `background-position` | `0.8rem` |  | exception glyph geometry |
| size | `src/css/components/field.css:124` | `background-size` | `0.35rem` |  | exception glyph geometry |
| size | `src/css/components/field.css:124` | `background-size` | `0.35rem` |  | exception glyph geometry |
| size | `src/css/components/log.css:15` | `max-block-size` | `20rem` |  | none one-off value |
| size | `src/css/components/menu.css:10` | `min-inline-size` | `12rem` |  | none one-off value |
| size | `src/css/components/menu.css:12` | `max-inline-size` | `20rem` |  | shared --overlay-width-* |
| size | `src/css/components/menu.css:12` | `max-inline-size` | `100vw` |  | none intrinsic value |
| size | `src/css/components/menu.css:12` | `max-inline-size` | `2rem` | `--space-6` | shared --overlay-gutter |
| size | `src/css/components/menu.css:20` | `inline-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/menu.css:21` | `min-block-size` | `24px` |  | shared --target-min |
| size | `src/css/components/menu.css:21` | `min-block-size` | `2.25rem` |  | none one-off value |
| size | `src/css/components/menu.css:37` | `inline-size` | `1rem` | `--space-4` | missing-scale icon-size |
| size | `src/css/components/menu.css:38` | `block-size` | `1rem` | `--space-4` | missing-scale icon-size |
| size | `src/css/components/menu.css:58` | `inline-size` | `1rem` | `--space-4` | missing-scale icon-size |
| size | `src/css/components/meter.css:20` | `inline-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/meter.css:21` | `block-size` | `0.5rem` | `--space-2` | exception density-scaled private size |
| size | `src/css/components/meter.css:47` | `block-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/meter.css:55` | `block-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/meter.css:80` | `background` | `40%` |  | none one-off value |
| size | `src/css/components/meter.css:80` | `background` | `100%` |  | none intrinsic value |
| size | `src/css/components/meter.css:92` | `background-position` | `-70%` |  | none intrinsic value |
| size | `src/css/components/meter.css:93` | `background-position` | `170%` |  | none intrinsic value |
| size | `src/css/components/popover.css:33` | `max-block-size` | `100dvh` |  | none intrinsic value |
| size | `src/css/components/popover.css:33` | `max-block-size` | `2rem` | `--space-6` | shared --overlay-gutter |
| size | `src/css/components/popover.css:45` | `inline-size` | `18rem` |  | shared --overlay-width-* |
| size | `src/css/components/popover.css:45` | `inline-size` | `100vw` |  | none intrinsic value |
| size | `src/css/components/popover.css:45` | `inline-size` | `2rem` | `--space-6` | shared --overlay-gutter |
| size | `src/css/components/popover.css:46` | `inline-size` | `20rem` |  | shared --overlay-width-* |
| size | `src/css/components/popover.css:46` | `inline-size` | `100vw` |  | none intrinsic value |
| size | `src/css/components/popover.css:46` | `inline-size` | `2rem` | `--space-6` | shared --overlay-gutter |
| size | `src/css/components/popover.css:50` | `max-inline-size` | `18rem` |  | shared --overlay-width-* |
| size | `src/css/components/popover.css:50` | `max-inline-size` | `100vw` |  | none intrinsic value |
| size | `src/css/components/popover.css:50` | `max-inline-size` | `2rem` | `--space-6` | shared --overlay-gutter |
| size | `src/css/components/range-field.css:25` | `flex` | `8rem` |  | none one-off value |
| size | `src/css/components/range-field.css:31` | `flex` | `6.5rem` |  | none one-off value |
| size | `src/css/components/search.css:19` | `inline-size` | `1rem` | `--space-4` | missing-scale icon-size |
| size | `src/css/components/search.css:20` | `block-size` | `1rem` | `--space-4` | missing-scale icon-size |
| size | `src/css/components/search.css:32` | `inline-size` | `1rem` | `--space-4` | missing-scale icon-size |
| size | `src/css/components/search.css:33` | `block-size` | `1rem` | `--space-4` | missing-scale icon-size |
| size | `src/css/components/separator.css:19` | `min-block-size` | `1em` |  | none intrinsic value |
| size | `src/css/components/sheet.css:26` | `inline-size` | `24rem` |  | shared --overlay-width-* |
| size | `src/css/components/sheet.css:26` | `inline-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/sheet.css:26` | `inline-size` | `3rem` | `--space-8` | shared --overlay-gutter |
| size | `src/css/components/sheet.css:28` | `block-size` | `100dvh` |  | none intrinsic value |
| size | `src/css/components/sheet.css:64` | `inline-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/sheet.css:66` | `max-block-size` | `85dvh` |  | none one-off value |
| size | `src/css/components/shell.css:23` | `min-block-size` | `100dvh` |  | none intrinsic value |
| size | `src/css/components/shell.css:79` | `@container` | `64rem` |  | none one-off value |
| size | `src/css/components/shell.css:86` | `@container` | `40rem` |  | none one-off value |
| size | `src/css/components/skeleton.css:13` | `block-size` | `1em` |  | none intrinsic value |
| size | `src/css/components/skeleton.css:20` | `inline-size` | `2.5rem` |  | shared --avatar-size |
| size | `src/css/components/slider.css:27` | `--_thumb` | `1.25rem` |  | exception density-scaled private size |
| size | `src/css/components/slider.css:33` | `inline-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/slider.css:34` | `block-size` | `24px` |  | shared --target-min |
| size | `src/css/components/slider.css:34` | `block-size` | `0.5rem` | `--space-2` | none one-off value |
| size | `src/css/components/slider.css:54` | `background` | `100%` |  | none intrinsic value |
| size | `src/css/components/stepper.css:32` | `flex` | `5rem` |  | none one-off value |
| size | `src/css/components/stepper.css:33` | `min-inline-size` | `4rem` | `--space-10` | none one-off value |
| size | `src/css/components/table.css:25` | `inline-size` | `100%` |  | none intrinsic value |
| size | `src/css/components/table.css:83` | `inline-size` | `1px` |  | none intrinsic value |
| size | `src/css/components/table.css:87` | `inline-size` | `1.125rem` |  | shared --checkbox-size |
| size | `src/css/components/table.css:88` | `block-size` | `1.125rem` |  | shared --checkbox-size |
| size | `src/css/components/table.css:98` | `min-block-size` | `24px` |  | shared --target-min |
| size | `src/css/components/tabs.css:61` | `inline-size` | `1rem` | `--space-4` | missing-scale icon-size |
| size | `src/css/components/tabs.css:62` | `block-size` | `1rem` | `--space-4` | missing-scale icon-size |
| size | `src/css/components/toast.css:10` | `inline-size` | `22rem` |  | shared --overlay-width-* |
| size | `src/css/components/toast.css:10` | `inline-size` | `100vw` |  | none intrinsic value |
| size | `src/css/components/toast.css:10` | `inline-size` | `2rem` | `--space-6` | shared --overlay-gutter |
| size | `src/css/components/toast.css:84` | `inline-size` | `0.5rem` | `--space-2` | shared --tone-dot-size |
| size | `src/css/components/toast.css:85` | `block-size` | `0.5rem` | `--space-2` | shared --tone-dot-size |
| size | `stories/Controls.stories.ts:42` | `inline-size` | `5rem` |  | exception story input data |
| size | `stories/Controls.stories.ts:67` | `max-inline-size` | `26rem` |  | story demo width cap |
| size | `stories/Controls.stories.ts:120` | `max-inline-size` | `30rem` |  | story demo width cap |
| size | `stories/CustomPalette.stories.ts:53` | `inline-size` | `4rem` | `--space-10` | story color input width |
| size | `stories/CustomPalette.stories.ts:57` | `inline-size` | `4rem` | `--space-10` | story color input width |
| size | `stories/CustomPalette.stories.ts:61` | `grid-template-columns` | `24rem` |  | story demo grid column minimum |
| size | `stories/Feedback.stories.ts:28` | `max-inline-size` | `40rem` |  | story demo width cap |
| size | `stories/Feedback.stories.ts:29` | `max-block-size` | `12rem` |  | exception story input data |
| size | `stories/Foundations.stories.ts:33` | `inline-size` | `100%` |  | none intrinsic value |
| size | `stories/Foundations.stories.ts:46` | `inline-size` | `2.4em` |  | story contrast swatch size |
| size | `stories/Foundations.stories.ts:46` | `block-size` | `1.5em` |  | story contrast swatch size |
| size | `stories/Foundations.stories.ts:70` | `grid-template-columns` | `26rem` |  | story demo grid column minimum |
| size | `stories/Foundations.stories.ts:91` | `grid-template-columns` | `12rem` |  | story demo grid column minimum |
| size | `stories/Foundations.stories.ts:94` | `block-size` | `6rem` |  | story palette swatch height |
| size | `stories/Foundations.stories.ts:102` | `max-inline-size` | `48rem` |  | story demo width cap |
| size | `stories/Foundations.stories.ts:123` | `max-inline-size` | `48rem` |  | story demo width cap |
| size | `stories/Layout.stories.ts:65` | `max-block-size` | `8rem` |  | exception story input data |
| size | `stories/Overlays.stories.ts:50` | `max-inline-size` | `36rem` |  | story demo width cap |
| size | `stories/Showcase.stories.ts:31` | `inline-size` | `1.15em` |  | story logo icon size |
| size | `stories/Showcase.stories.ts:31` | `block-size` | `1.15em` |  | story logo icon size |
| size | `stories/Showcase.stories.ts:42` | `min-block-size` | `100dvh` |  | none intrinsic value |
| size | `stories/Showcase.stories.ts:46` | `max-inline-size` | `72rem` |  | story page width cap |
| size | `stories/Showcase.stories.ts:59` | `max-inline-size` | `44rem` |  | story demo width cap |
| size | `stories/Showcase.stories.ts:78` | `grid-template-columns` | `16rem` |  | story demo grid column minimum |
| size | `stories/Showcase.stories.ts:87` | `grid-template-columns` | `16rem` |  | story demo grid column minimum |
| size | `stories/Showcase.stories.ts:149` | `grid-template-columns` | `18rem` |  | story demo grid column minimum |
| size | `stories/mirrored/Alert.stories.ts:20` | `max-inline-size` | `40rem` |  | story demo width cap |
| size | `stories/mirrored/Card.stories.ts:20` | `grid-template-columns` | `17rem` |  | story demo grid column minimum |
| size | `stories/mirrored/Disclosure.stories.ts:26` | `max-inline-size` | `36rem` |  | story demo width cap |
| size | `stories/mirrored/Field.stories.ts:20` | `max-inline-size` | `26rem` |  | story demo width cap |
| size | `stories/mirrored/Field.stories.ts:72` | `max-inline-size` | `26rem` |  | story demo width cap |
| size | `stories/mirrored/Meter.stories.ts:38` | `max-inline-size` | `28rem` |  | story demo width cap |
| size | `stories/mirrored/Search.stories.ts:20` | `max-inline-size` | `26rem` |  | story demo width cap |
| size | `stories/mirrored/Separator.stories.ts:20` | `max-inline-size` | `32rem` |  | story demo width cap |
| size | `stories/mirrored/Skeleton.stories.ts:30` | `inline-size` | `70%` |  | exception story input data |
| size | `stories/mirrored/Skeleton.stories.ts:31` | `inline-size` | `40%` |  | exception story input data |
| size | `stories/mirrored/Skeleton.stories.ts:31` | `block-size` | `0.75em` |  | exception story input data |
| size | `stories/mirrored/Skeleton.stories.ts:36` | `block-size` | `5rem` |  | exception story input data |
| size | `stories/mirrored/Skeleton.stories.ts:37` | `inline-size` | `90%` |  | exception story input data |
| size | `stories/mirrored/Skeleton.stories.ts:38` | `inline-size` | `60%` |  | exception story input data |
| size | `stories/mirrored/Skeleton.stories.ts:47` | `grid-template-columns` | `17rem` |  | story demo grid column minimum |
| size | `stories/mirrored/Slider.stories.ts:21` | `max-inline-size` | `26rem` |  | story demo width cap |
| size | `stories/mirrored/Table.stories.ts:31` | `max-inline-size` | `48rem` |  | story demo width cap |
| size | `stories/mirrored/Tabs.stories.ts:32` | `max-inline-size` | `40rem` |  | story demo width cap |

### Radius (9)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| radius | `src/css/components/badge.css:31` | `border-radius` | `50%` | `--radius-*` | none intrinsic value |
| radius | `src/css/components/button.css:105` | `border-radius` | `50%` | `--radius-*` | exception glyph geometry |
| radius | `src/css/components/choice.css:74` | `border-radius` | `3px` | `--radius-*` | shared --inset-tight |
| radius | `src/css/components/estop.css:20` | `border-radius` | `50%` | `--radius-*` | none intrinsic value |
| radius | `src/css/components/field.css:50` | `border-radius` | `50%` | `--radius-*` | exception glyph geometry |
| radius | `src/css/components/tabs.css:22` | `border-radius` | `3px` | `--radius-*` | shared --inset-tight |
| radius | `src/css/components/toast.css:86` | `border-radius` | `50%` | `--radius-*` | none intrinsic value |
| radius | `stories/Foundations.stories.ts:46` | `border-radius` | `6px` | `--radius-*` | story contrast swatch radius |
| radius | `stories/Foundations.stories.ts:47` | `border-radius` | `6px` | `--radius-*` | story contrast swatch radius |

### Border-width (22)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| border-width | `src/css/components/button.css:103` | `border` | `2px` | `--border-width (= bubblegum)` | exception glyph geometry |
| border-width | `src/css/components/disclosure.css:34` | `border-inline-end` | `2px` | `--border-width (= bubblegum)` | exception glyph geometry |
| border-width | `src/css/components/disclosure.css:35` | `border-block-end` | `2px` | `--border-width (= bubblegum)` | exception glyph geometry |
| border-width | `src/css/components/estop.css:19` | `border` | `0.5rem` | `--border-width` | none one-off value |
| border-width | `src/css/components/field.css:121` | `--_stroke` | `50%` | `--border-width` | exception glyph geometry |
| border-width | `src/css/components/field.css:121` | `--_stroke` | `0.8px` | `--border-width` | exception glyph geometry |
| border-width | `src/css/components/field.css:121` | `--_stroke` | `50%` | `--border-width` | exception glyph geometry |
| border-width | `src/css/components/field.css:121` | `--_stroke` | `0.6px` | `--border-width` | exception glyph geometry |
| border-width | `src/css/components/field.css:121` | `--_stroke` | `50%` | `--border-width` | exception glyph geometry |
| border-width | `src/css/components/field.css:121` | `--_stroke` | `0.6px` | `--border-width` | exception glyph geometry |
| border-width | `src/css/components/field.css:121` | `--_stroke` | `50%` | `--border-width` | exception glyph geometry |
| border-width | `src/css/components/field.css:121` | `--_stroke` | `0.8px` | `--border-width` | exception glyph geometry |
| border-width | `src/css/components/log.css:34` | `border-inline-start` | `3px` | `--border-width` | none one-off value |
| border-width | `src/css/components/meter.css:129` | `border` | `1px` | `--border-width (= calm, darkmatter, expressive, glass)` | shared --forced-hairline |
| border-width | `src/css/components/popover.css:112` | `border` | `1px` | `--border-width (= calm, darkmatter, expressive, glass)` | shared --forced-hairline |
| border-width | `src/css/components/skeleton.css:33` | `border` | `1px` | `--border-width (= calm, darkmatter, expressive, glass)` | shared --forced-hairline |
| border-width | `src/css/components/slider.css:64` | `border` | `2px` | `--border-width (= bubblegum)` | chrome --border-width |
| border-width | `src/css/components/slider.css:89` | `border` | `2px` | `--border-width (= bubblegum)` | chrome --border-width |
| border-width | `src/css/components/slider.css:123` | `border` | `1px` | `--border-width (= calm, darkmatter, expressive, glass)` | shared --forced-hairline |
| border-width | `src/css/components/slider.css:125` | `border` | `1px` | `--border-width (= calm, darkmatter, expressive, glass)` | shared --forced-hairline |
| border-width | `stories/Foundations.stories.ts:41` | `border-block-start` | `1px` | `--border-width (= calm, darkmatter, expressive, glass)` | story table row rule |
| border-width | `stories/Foundations.stories.ts:46` | `border` | `3px` | `--border-width` | story contrast swatch stroke |

### Font-size (3)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| font-size | `src/css/components/avatar.css:24` | `font-size` | `0.38` |  | none one-off value |
| font-size | `src/css/components/field.css:53` | `font-size` | `0.8em` |  | exception glyph geometry |
| font-size | `src/css/components/menu.css:63` | `font-size` | `0.625rem` |  | exception glyph geometry |

### Font-weight (24)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| font-weight | `src/css/components/alert.css:49` | `font-weight` | `650` |  | missing-scale font-weight |
| font-weight | `src/css/components/avatar.css:25` | `font-weight` | `700` |  | missing-scale font-weight |
| font-weight | `src/css/components/badge.css:20` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/button.css:27` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/choice.css:97` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/disclosure.css:18` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/estop.css:27` | `font-weight` | `800` |  | missing-scale font-weight |
| font-weight | `src/css/components/field.css:19` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/field.css:40` | `font-weight` | `500` |  | missing-scale font-weight |
| font-weight | `src/css/components/field.css:54` | `font-weight` | `800` |  | missing-scale font-weight |
| font-weight | `src/css/components/field.css:165` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/menu.css:60` | `font-weight` | `700` |  | missing-scale font-weight |
| font-weight | `src/css/components/menu.css:101` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/meter.css:107` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/popover.css:58` | `font-weight` | `500` |  | missing-scale font-weight |
| font-weight | `src/css/components/table.css:49` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/table.css:73` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/tabs.css:46` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/toast.css:78` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `src/css/components/typography.css:35` | `font-weight` | `600` |  | missing-scale font-weight |
| font-weight | `stories/Foundations.stories.ts:47` | `font-weight` | `600` |  | story swatch label weight |
| font-weight | `stories/Foundations.stories.ts:94` | `font-weight` | `600` |  | story swatch label weight |
| font-weight | `stories/mirrored/Avatar.stories.ts:55` | `font-weight` | `600` |  | story name weight |
| font-weight | `stories/mirrored/Table.stories.ts:59` | `font-weight` | `600` |  | story row header weight |

### Tracking (4)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| tracking | `src/css/components/avatar.css:27` | `letter-spacing` | `0.02em` |  | missing-scale tracking |
| tracking | `src/css/components/estop.css:31` | `letter-spacing` | `0.06em` |  | missing-scale tracking |
| tracking | `src/css/components/menu.css:90` | `letter-spacing` | `0.04em` |  | missing-scale tracking |
| tracking | `src/css/components/typography.css:37` | `letter-spacing` | `0.06em` |  | missing-scale tracking |

### Line-height (7)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| line-height | `src/css/components/avatar.css:26` | `line-height` | `1` |  | missing-scale line-height |
| line-height | `src/css/components/badge.css:21` | `line-height` | `1.4` |  | missing-scale line-height |
| line-height | `src/css/components/button.css:28` | `line-height` | `1` |  | missing-scale line-height |
| line-height | `src/css/components/estop.css:28` | `line-height` | `1.1` |  | missing-scale line-height |
| line-height | `src/css/components/log.css:25` | `line-height` | `1.45` |  | missing-scale line-height |
| line-height | `src/css/components/popover.css:59` | `line-height` | `1.4` |  | missing-scale line-height |
| line-height | `stories/Showcase.stories.ts:49` | `line-height` | `1` |  | story logo tile line height |

### Shadow (15)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| shadow | `src/css/components/avatar.css:48` | `box-shadow` | `2px` | `--shadow-*` | chrome --shadow-* |
| shadow | `src/css/components/estop.css:23` | `box-shadow` | `3px` | `--shadow-*` | none one-off value |
| shadow | `src/css/components/estop.css:23` | `box-shadow` | `-0.35rem` | `--shadow-*` | none one-off value |
| shadow | `src/css/components/estop.css:23` | `box-shadow` | `3px` | `--shadow-*` | none one-off value |
| shadow | `src/css/components/estop.css:41` | `box-shadow` | `3px` | `--shadow-*` | none one-off value |
| shadow | `src/css/components/estop.css:41` | `box-shadow` | `-0.35rem` | `--shadow-*` | none one-off value |
| shadow | `src/css/components/estop.css:41` | `box-shadow` | `3px` | `--shadow-*` | none one-off value |
| shadow | `src/css/components/estop.css:47` | `box-shadow` | `3px` | `--shadow-*` | none one-off value |
| shadow | `src/css/components/estop.css:47` | `box-shadow` | `0.5rem` | `--shadow-*` | chrome --shadow-* |
| shadow | `src/css/components/estop.css:47` | `box-shadow` | `1rem` | `--shadow-*` | chrome --shadow-* |
| shadow | `src/css/components/slider.css:71` | `box-shadow` | `4px` | `--shadow-*` | chrome --focus-glow |
| shadow | `src/css/components/slider.css:71` | `box-shadow` | `30%` | `--shadow-*` | chrome --focus-glow |
| shadow | `src/css/components/slider.css:96` | `box-shadow` | `4px` | `--shadow-*` | chrome --focus-glow |
| shadow | `src/css/components/slider.css:96` | `box-shadow` | `30%` | `--shadow-*` | chrome --focus-glow |
| shadow | `stories/Foundations.stories.ts:47` | `box-shadow` | `1px` | `--shadow-*` | story contrast swatch outline |

### Motion (29)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| motion | `src/css/base.css:92` | `translate` | `-200%` |  | none intrinsic value |
| motion | `src/css/components/button.css:106` | `animation` | `700ms` | `--duration-*` | none one-off value |
| motion | `src/css/components/button.css:106` | `animation` | `linear` | `--ease` | none intrinsic value |
| motion | `src/css/components/button.css:115` | `animation-duration` | `2.4s` | `--duration-*` | none one-off value |
| motion | `src/css/components/dialog.css:23` | `scale` | `0.96` |  | shared --overlay-enter-scale |
| motion | `src/css/components/dialog.css:24` | `translate` | `0.5rem` |  | shared --overlay-enter-offset |
| motion | `src/css/components/dialog.css:33` | `scale` | `1` |  | none intrinsic value |
| motion | `src/css/components/dialog.css:40` | `scale` | `0.96` |  | shared --overlay-enter-scale |
| motion | `src/css/components/dialog.css:41` | `translate` | `0.5rem` |  | shared --overlay-enter-offset |
| motion | `src/css/components/dialog.css:83` | `scale` | `1` |  | none intrinsic value |
| motion | `src/css/components/disclosure.css:37` | `translate` | `-25%` |  | exception glyph geometry |
| motion | `src/css/components/disclosure.css:43` | `translate` | `25%` |  | exception glyph geometry |
| motion | `src/css/components/estop.css:46` | `transform` | `0.95` | `--press-transform` | chrome --press-transform |
| motion | `src/css/components/meter.css:82` | `animation` | `4` |  | none one-off value |
| motion | `src/css/components/meter.css:82` | `animation` | `ease-in-out` | `--ease` | shared --ease-loop |
| motion | `src/css/components/popover.css:67` | `scale` | `0.96` |  | shared --overlay-enter-scale |
| motion | `src/css/components/popover.css:76` | `scale` | `1` |  | none intrinsic value |
| motion | `src/css/components/popover.css:82` | `scale` | `0.96` |  | shared --overlay-enter-scale |
| motion | `src/css/components/search.css:21` | `translate` | `-50%` |  | none intrinsic value |
| motion | `src/css/components/skeleton.css:16` | `animation` | `5` |  | none one-off value |
| motion | `src/css/components/skeleton.css:16` | `animation` | `ease-in-out` | `--ease` | shared --ease-loop |
| motion | `src/css/components/slider.css:108` | `animation` | `linear` | `--ease` | none intrinsic value |
| motion | `src/css/components/slider.css:110` | `animation-range` | `100%` |  | none intrinsic value |
| motion | `src/css/components/slider.css:110` | `animation-range` | `0%` |  | none intrinsic value |
| motion | `src/css/components/toast.css:53` | `translate` | `0.75rem` |  | shared --overlay-enter-offset |
| motion | `src/css/components/toast.css:59` | `translate` | `1rem` |  | none one-off value |
| motion | `src/css/preferences.css:27` | `--duration-fast` | `0ms` | `--duration-*` | exception token definition |
| motion | `src/css/preferences.css:28` | `--duration-base` | `0ms` | `--duration-*` | exception token definition |
| motion | `src/css/preferences.css:29` | `--duration-slow` | `0ms` | `--duration-*` | exception token definition |

### Focus (7)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| focus | `src/css/components/choice.css:127` | `outline-offset` | `1px` | `--focus-offset` | chrome --focus-offset |
| focus | `src/css/components/choice.css:132` | `outline` | `2px` | `--focus-width (= calm, darkmatter, expressive, glass)` | shared --forced-selected-outline |
| focus | `src/css/components/estop.css:51` | `outline` | `2px` | `--focus-width (= calm, darkmatter, expressive, glass)` | chrome --focus-width |
| focus | `src/css/components/estop.css:52` | `outline-offset` | `4px` | `--focus-offset` | chrome --focus-offset |
| focus | `src/css/components/tabs.css:77` | `outline-offset` | `1px` | `--focus-offset` | chrome --focus-offset |
| focus | `src/css/components/tabs.css:91` | `outline` | `2px` | `--focus-width (= calm, darkmatter, expressive, glass)` | shared --forced-selected-outline |
| focus | `src/css/preferences.css:11` | `--focus-width` | `3px` |  | exception token definition |

### Other (36)

| Category | `file:line` | Property | Value | Matching token | Verdict |
| --- | --- | --- | --- | --- | --- |
| other | `src/css/base.css:79` | `clip-path` | `50%` |  | none intrinsic value |
| other | `src/css/components/button.css:86` | `opacity` | `0.55` |  | shared --disabled-opacity |
| other | `src/css/components/choice.css:26` | `opacity` | `0.55` |  | shared --disabled-opacity |
| other | `src/css/components/choice.css:83` | `clip-path` | `50%` |  | shared .odd-visually-hidden |
| other | `src/css/components/choice.css:111` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/dialog.css:22` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/dialog.css:32` | `opacity` | `1` |  | none intrinsic value |
| other | `src/css/components/dialog.css:39` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/dialog.css:47` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/dialog.css:54` | `opacity` | `1` |  | none intrinsic value |
| other | `src/css/components/dialog.css:59` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/field.css:84` | `opacity` | `1` |  | none intrinsic value |
| other | `src/css/components/field.css:113` | `opacity` | `0.7` |  | shared --disabled-opacity |
| other | `src/css/components/popover.css:66` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/popover.css:75` | `opacity` | `1` |  | none intrinsic value |
| other | `src/css/components/popover.css:81` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/sheet.css:21` | `--_hide` | `100%` |  | none intrinsic value |
| other | `src/css/components/sheet.css:48` | `--_hide` | `-100%` |  | none intrinsic value |
| other | `src/css/components/sheet.css:51` | `--_hide` | `-100%` |  | none intrinsic value |
| other | `src/css/components/sheet.css:60` | `--_hide` | `100%` |  | none intrinsic value |
| other | `src/css/components/sheet.css:72` | `--_hide` | `100%` |  | none intrinsic value |
| other | `src/css/components/sheet.css:81` | `--_hide` | `-100%` |  | none intrinsic value |
| other | `src/css/components/sheet.css:103` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/sheet.css:109` | `opacity` | `1` |  | none intrinsic value |
| other | `src/css/components/sheet.css:113` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/skeleton.css:27` | `opacity` | `0.45` |  | none one-off value |
| other | `src/css/components/slider.css:28` | `--_rail` | `0.375rem` |  | exception density-scaled private size |
| other | `src/css/components/slider.css:44` | `opacity` | `0.55` |  | shared --disabled-opacity |
| other | `src/css/components/table.css:114` | `opacity` | `0.5` |  | none one-off value |
| other | `src/css/components/table.css:116` | `opacity` | `1` |  | none intrinsic value |
| other | `src/css/components/table.css:117` | `opacity` | `1` |  | none intrinsic value |
| other | `src/css/components/tabs.css:82` | `opacity` | `0.55` |  | shared --disabled-opacity |
| other | `src/css/components/toast.css:52` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/components/toast.css:58` | `opacity` | `0` |  | none intrinsic value |
| other | `src/css/preferences.css:8` | `--surface-alpha` | `100%` |  | exception token definition |
| other | `src/css/preferences.css:19` | `--surface-alpha` | `100%` |  | exception token definition |

<!-- /audit:literals -->

## Other anti-patterns

<!-- audit:graph -->

### Definitions by file

| File | Layer | Definitions |
| --- | --- | --- |
| `src/css/chromes/bubblegum.css` | chrome | 33 |
| `src/css/chromes/calm.css` | chrome | 33 |
| `src/css/chromes/darkmatter.css` | chrome | 33 |
| `src/css/chromes/expressive.css` | chrome | 33 |
| `src/css/chromes/glass.css` | chrome | 33 |
| `src/css/components/alert.css` | components | 10 |
| `src/css/components/avatar.css` | components | 3 |
| `src/css/components/badge.css` | components | 12 |
| `src/css/components/button.css` | components | 15 |
| `src/css/components/choice.css` | components | 3 |
| `src/css/components/estop.css` | components | 1 |
| `src/css/components/field.css` | components | 1 |
| `src/css/components/log.css` | components | 5 |
| `src/css/components/meter.css` | components | 11 |
| `src/css/components/sheet.css` | components | 6 |
| `src/css/components/slider.css` | components | 8 |
| `src/css/components/toast.css` | components | 5 |
| `src/css/components/typography.css` | components | 7 |
| `src/css/foundations.css` | foundations | 51 |
| `src/css/palettes/aurora.css` | palette | 18 |
| `src/css/palettes/caffeine.css` | palette | 19 |
| `src/css/palettes/calm-storm.css` | palette | 19 |
| `src/css/palettes/cotton-candy.css` | palette | 19 |
| `src/css/palettes/cyberpunk.css` | palette | 19 |
| `src/css/palettes/default.css` | palette | 18 |
| `src/css/palettes/singularity.css` | palette | 19 |
| `src/css/palettes/sorbet.css` | palette | 18 |
| `src/css/preferences.css` | preferences | 18 |
| `stories/Controls.stories.ts` | inline | 3 |
| `stories/CustomPalette.stories.ts` | inline | 4 |
| `stories/Foundations.stories.ts` | inline | 3 |
| `stories/Overlays.stories.ts` | inline | 3 |
| `stories/Showcase.stories.ts` | inline | 10 |
| `stories/mirrored/Avatar.stories.ts` | inline | 2 |
| `stories/mirrored/Choice.stories.ts` | inline | 3 |
| `stories/mirrored/Meter.stories.ts` | inline | 4 |
| `stories/mirrored/Popover.stories.ts` | inline | 2 |
| `stories/mirrored/Separator.stories.ts` | inline | 3 |
| `stories/mirrored/Sheet.stories.ts` | inline | 1 |
| `stories/mirrored/Skeleton.stories.ts` | inline | 1 |
| `stories/mirrored/Slider.stories.ts` | inline | 1 |
| `stories/mirrored/Tabs.stories.ts` | inline | 1 |

### References with no definition

None.

### Public tokens nothing reads

| Token | Defined at | Layer |
| --- | --- | --- |
| `--accent-foreground` | `src/css/palettes/aurora.css:19` | palette |
| `--accent-foreground` | `src/css/palettes/caffeine.css:19` | palette |
| `--accent-foreground` | `src/css/palettes/calm-storm.css:19` | palette |
| `--accent-foreground` | `src/css/palettes/cotton-candy.css:19` | palette |
| `--accent-foreground` | `src/css/palettes/cyberpunk.css:19` | palette |
| `--accent-foreground` | `src/css/palettes/default.css:20` | palette |
| `--accent-foreground` | `src/css/palettes/singularity.css:19` | palette |
| `--accent-foreground` | `src/css/palettes/sorbet.css:19` | palette |
| `--space-10` | `src/css/foundations.css:25` | foundations |
| `--z-overlay` | `src/css/foundations.css:36` | foundations |
| `--z-popover` | `src/css/foundations.css:37` | foundations |
| `--z-sticky` | `src/css/foundations.css:34` | foundations |

Names built at runtime (`var(--${…})`) are invisible to this count. Files that build them: `stories/Foundations.stories.ts`.

### Palette tokens defined outside palettes and foundations

| Token | Defined at | Layer |
| --- | --- | --- |
| `--border` | `src/css/preferences.css:6` | preferences |
| `--danger` | `src/css/components/meter.css:125` | components |
| `--info` | `src/css/components/meter.css:126` | components |
| `--muted-foreground` | `src/css/preferences.css:5` | preferences |
| `--primary` | `src/css/components/meter.css:122` | components |
| `--success` | `src/css/components/meter.css:123` | components |
| `--warning` | `src/css/components/meter.css:124` | components |

### Chrome tokens defined outside chromes

| Token | Defined at | Layer |
| --- | --- | --- |
| `--edge-surface` | `src/css/preferences.css:7` | preferences |
| `--focus-color` | `src/css/preferences.css:36` | preferences |
| `--focus-glow` | `src/css/preferences.css:37` | preferences |
| `--focus-width` | `src/css/preferences.css:11` | preferences |
| `--fx-backdrop` | `src/css/preferences.css:10` | preferences |
| `--fx-backdrop` | `src/css/preferences.css:20` | preferences |
| `--fx-glow` | `src/css/preferences.css:9` | preferences |
| `--fx-glow` | `src/css/preferences.css:38` | preferences |
| `--page-background` | `src/css/preferences.css:13` | preferences |
| `--page-background` | `src/css/preferences.css:39` | preferences |
| `--press-transform` | `src/css/preferences.css:26` | preferences |
| `--surface-alpha` | `src/css/preferences.css:8` | preferences |
| `--surface-alpha` | `src/css/preferences.css:19` | preferences |

### Public custom properties in component files

| Token | Defined at | Layer |
| --- | --- | --- |
| `--danger` | `src/css/components/meter.css:125` | components |
| `--info` | `src/css/components/meter.css:126` | components |
| `--primary` | `src/css/components/meter.css:122` | components |
| `--success` | `src/css/components/meter.css:123` | components |
| `--track` | `src/css/components/meter.css:121` | components |
| `--warning` | `src/css/components/meter.css:124` | components |

<!-- /audit:graph -->

## Ranked fix backlog
