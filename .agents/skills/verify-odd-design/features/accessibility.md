# Accessibility checks

Every story is checked with one rule set: stock axe-core 4.14.0, limited to WCAG 2.0, 2.1, and 2.2 at levels A and AA. That set is defined once in `.storybook/a11y.ts`. The Storybook a11y panel reads it through `parameters.a11y.options`, and `ctl.ts axe` imports it, so the panel and the sweep apply the same rules. There are no custom rules. The 63 rules those tags resolve to are recorded in `.storybook/a11y-rules.txt`, and the sweep fails if the rules that actually ran differ from that record.

## Sub-features

- `axe-sweep`: every story, in light and dark, has 0 violations, both as rendered and with each dialog, sheet, popover, menu, and tooltip opened through a real click or hover.
- `rules-record`: the rules that ran match `.storybook/a11y-rules.txt`, and the header names the axe-core version and tags.
- `one-runner`: the sweep loads stories with `a11y.manual:!true`, so the addon's own automatic run is off and only the sweep's axe runs on the page.
- `needs-review`: results axe could not decide are listed as `REVIEW` with axe's reason. They don't fail the run.
- `page-backgrounds`: axe can't measure contrast over gradients, so `bun test` checks text on every chrome's page background at its worst points, for every palette and mode.

## How to get to it (user POV)

- In Storybook, open any story and the **Accessibility** panel. It shows results for the same rules the sweep enforces.
- In a terminal, run the sweep (below) or `bun test` for the page-background math.

## Driving it with ctl.ts

Preconditions:

- The baseline from the README.

- **Full sweep.** Run `bun $S axe 2>&1 | tee .verify/evidence/<run>/axe.txt`. The last line reads `102 axe runs over 36 stories, 2 appearance(s), axe-core 4.14.0, 63 rules: 0 violations, … needing manual review`, and the exit code is `0`. No line starts with `FAIL` or `RULES CHANGED`. The full results are in `.verify/evidence/<run>/axe/report.json`.
- **Every chrome and palette.** Run `bun $S axe --appearance full`. It checks each story in every chrome and every palette, in both modes, and takes several minutes.
- **One story.** Run `bun $S axe components-overlays--sheet`. It reports 8 runs: the rendered story plus three opened sheets, in each mode.
- **Manual mode is on.** After `bun $S goto components-surfaces--badge "mode:light;a11y.manual:!true"`, running `bun $S eval 'window.__STORYBOOK_PREVIEW__.storyStoreValue.userGlobals.get().a11y'` returns `{ "manual": true }`.
- **Review items.** The `REVIEW` lines say why axe couldn't decide. At the time of writing, all of them say `background color could not be determined due to a background gradient`, and the page-background test in `bun test` covers those.

## Gotchas

- An axe-core upgrade can add or drop rules even in a minor version. The sweep then prints `RULES CHANGED` with the added (`+`) and removed (`-`) rule ids and exits `1`. Review the change, then rerun with `--update-rules` to accept it.
- Don't add axe tags or rule overrides in `ctl.ts` or `preview.ts`. Change `.storybook/a11y.ts`, so the panel and the sweep stay identical.
- `axe` drives real clicks and hovers, so leave the browser alone while it runs.
