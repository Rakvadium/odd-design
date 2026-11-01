---
name: verify-odd-design
description: REQUIRED before claiming any change under src/, stories/, or .storybook/ done. Drives the odd-design Storybook in an isolated headless Chrome with real clicks and keys, captures screenshots, accessibility-tree snapshots, and a transcript, and writes PROOF.md, which `ctl.ts proof` checks against every story the branch changed. Optional extras run Firefox/WebKit through Playwright, NVDA through sr.ts, and a whole-catalog screenshot diff. Also use when asked to verify, screenshot, or check a component, chrome, palette, or appearance behavior in the rendered UI. `bun test` alone does not count.
---

# Verify odd-design

odd-design is a framework-free CSS design system. Users touch it in two places:

- **Storybook** (primary): stories under `stories/` render real `.odd-*` markup. The `Chrome`, `Palette`, and `Mode` toolbar globals set `html[data-chrome|data-palette|data-mode]`.
- **`bun test`** (secondary, no UI): enforces the token contract and WCAG contrast. Run it alongside any visual proof. It is not a replacement for one.

The harness is `scripts/ctl.ts`, a zero-dependency Bun script. It starts Storybook on a free port and a headless Chrome/Edge with its own profile, then drives that Chrome over CDP. Each command connects, does one thing, appends an event to the transcript, and exits. Browser state (open dialogs, focus, typed values) persists between commands until the next `goto`.

Every command below runs from the repo root:

```sh
S=.agents/skills/verify-odd-design/scripts/ctl.ts   # then: bun $S <command> [--run NAME]
bun $S help
```

The default run name is the branch slug (`feat/x` becomes `feat-x`), so evidence lands in `.verify/evidence/<branch-slug>/`. `--run NAME` (or `VERIFY_RUN=NAME`) overrides it. Different run names get different ports, browser profiles, and evidence dirs, so parallel agents on different branches never collide. Never drive a run you did not start, and never drive the user's own `bun run storybook` on port 6006.

## Launch

Prerequisites: `bun install` has run, and Chrome or Edge is installed. If neither is at a standard path, set `CHROME_PATH`.

```sh
bun $S up
```

The command blocks until both processes are ready and prints `READY run="<branch-slug>" storybook=http://127.0.0.1:<port> evidence=...`. Ready means Chrome's CDP answers and Storybook's `/index.json` lists `showcase--sample-app`. A cold start takes about 5-10 s. On failure it prints the tail of the Storybook log.

Storybook runs in dev mode with HMR. Edits to `src/` or `stories/` show up live, but re-run `goto` to re-render. Edits to `.storybook/main.ts` need `down` and then `up`.

## Doctor

```sh
bun $S doctor
```

This check is read-only. It verifies that the Storybook process is alive, that the port's listener is in that process tree, that the index serves the expected story, that the Chrome process is alive, and that CDP answers. It also reports whether HEAD still matches launch and flags uncommitted `src/stories` changes. It exits 1 on any `FAIL`. Run it first whenever something looks off. If it fails, run `down` and then `up`. Do not patch around it.

## Find changed stories

Right after `up`, run:

```sh
bun $S proof
```

The first run fails and prints a `MISSING` line for every story the branch must prove. It diffs the working tree against the merge base with `origin/main`, adds untracked files, and maps each change through the live `index.json`, new stories included. A changed line inside `export const X` requires story X. A change anywhere else in a story file requires every story in that file, and a new story file requires all its stories.

It also names changed files that no story file maps to, such as CSS, JS, and `.storybook` changes. For those, pick the stories that render the change and prove them too. When nothing maps, `proof` needs at least one story you picked. A changed story missing from the index means it failed to load or the server is stale, so run `doctor`.

A plain `proof` leaves the run up. Drive the gaps and run it again until it exits 0.

## Drive

Stories render in isolation at `iframe.html?id=<storyId>`, which skips the manager chrome. The story ID is the kebab-cased title and export name, such as `components-surfaces--dialog`. The full list is at `curl -s http://127.0.0.1:<port>/index.json`. MDX docs like `introduction--docs` are not stories, so open them through the manager URL.

```sh
bun $S goto showcase--sample-app "chrome:glass;palette:aurora;mode:dark"   # globals = the toolbar
bun $S goto components-button--playground "" "variant:danger;size:lg;label:Delete+deck"   # args = Controls panel
bun $S state                                  # html data-*, every .odd-scope's data-*, open dialogs and popovers, focused element
bun $S click 'button[commandfor="appearance"]'            # real mouse events at the element's center
bun $S click '.odd-button' --text 'Done'                    # filter by visible text
bun $S hover 'button[interestfor="tip-copy"]' ; bun $S wait 1200   # pointer stays put; wait covers interest delays
bun $S focus '#name' ; bun $S type 'x' ; bun $S press Backspace ; bun $S press Tab
bun $S press Escape                          # also Enter Space Tab Backspace Home End Arrow{Left,Right,Up,Down}, or one letter
bun $S emulate prefers-color-scheme=dark prefers-reduced-motion=reduce prefers-contrast=more forced-colors=active
bun $S emulate                               # no args clears; each call replaces the previous set; persists until cleared or down
bun $S eval 'getComputedStyle(document.querySelector(".odd-button")).borderRadius'   # read-only assertions
bun $S axe                                   # accessibility sweep: every story, both modes, overlays opened (see features/accessibility.md)
```

Rules for driving:

- Valid globals are `chrome` ∈ `calm glass bubblegum expressive darkmatter`, `palette` ∈ `default aurora sorbet calm-storm cyberpunk cotton-candy caffeine singularity`, and `mode` ∈ `system light dark`. The toolbar defaults are `calm`, `default`, and `system`.
- Prefer stable handles: ids and `commandfor`/`command` attributes in the stories, `input[name=…][value=…]`, `[role=switch]`, `aria-*`, and `.odd-*` classes. Do not use coordinates or nth-child.
- Change state with `click`, `press`, and `type`, which send real input events. Use `eval` only to read state, never to set it. Setting `.value`, calling `.showModal()`, or toggling attributes bypasses exactly what you are trying to prove: `:user-invalid`, invoker commands, `closedby`, and the native radio behavior.
- `mode:system` follows the browser's `prefers-color-scheme`, so pair it with `emulate`. `emulate` lasts until it is cleared or the run goes `down`.
- Real feature recipes are in [`features/`](features/README.md). Read the matching file before driving.

## Evidence

Evidence goes to `.verify/evidence/<run>/`, which is gitignored and survives `down`:

- `transcript.log` is automatic. Each line is one event, `[<iso time>] <kind> <json>`. It records every `goto` with the resolved `html data-*`, each click target, key and resulting focus, `state`, `eval` and its result, `aria` path, and screenshot path and scheme. `proof` reads it.
- `bun $S screenshot <name>.png [--full]` takes a viewport screenshot (1280×900), or the full page with `--full`. Subdirectory names like `dialog/open.png` are fine.
- `bun $S aria <name>.txt` saves the accessibility tree (roles, names, values, and checked/expanded/focused/modal/invalid/disabled/busy) and prints it.
- `PROOF.md` is written by `proof`.
- `storybook.log` is copied in at `down`.

## Definition of done

Each story `proof` lists needs, within one `goto`:

1. A `screenshot` before any interaction.
2. At least one real interaction: `click`, `hover`, `press`, or `type`. `focus`, `wait`, and `emulate` do not count.
3. A `screenshot` after the interaction.
4. A `state`, `eval`, or `aria` read after the interaction.

Do this in both light and dark. A new `goto` starts a new segment, so evidence never spans a reload. For example:

```sh
bun $S goto components-surfaces--dialog mode:light
bun $S screenshot dialog/light-before.png
bun $S click 'button[commandfor="confirm-delete"][command="show-modal"]'
bun $S screenshot dialog/light-after.png
bun $S state
```

Then repeat it with `mode:dark`.

- Capture each chrome or palette the change touches. A chrome change needs that chrome in light and dark, or `showcase--matrix`. A palette change needs `foundations--contrast` plus `bun test`.
- Use `screenshot --full` for layout changes.
- The screenshot records the scheme the page actually rendered. `mode:system` counts as whatever `emulate` made it.
- `proof` counts only events since the last `up`. If HEAD moved since `up` and the commits in between touch `src/`, `stories/`, or `.storybook/`, it fails as stale. Run `down`, `up`, and drive again.
- Read every screenshot you cite.
- There are no mocks and no backend. If something cannot be driven (for example, the a11y addon panel lives in the manager UI, not the iframe), say so rather than substituting a different path.

`proof` exits 0 only when every changed story passes. `bun test` alone does not count. Finish with the hand-back, which stops the run. If you are not publishing, run `down` instead.

## Hand-back

Once `proof` exits 0:

```sh
bun $S proof --publish
gh pr comment <pr> --body-file .verify/evidence/<branch-slug>/PROOF.md
```

`proof --publish` runs only on a pass. It pushes the cited PNGs to the orphan `proof-assets` branch under `<branch-slug>/<short-head>/`, using git plumbing, and never touches main or the working tree. It rewrites the image links in `PROOF.md` to commit-pinned `raw.githubusercontent.com` URLs, then runs `down`.

`PROOF.md` has a table with one row per proven story and theme: the story, the theme, the action, the before and after screenshots, and the read. Below it, it lists missing items and unmapped files.

`PROOF.md` and the screenshots stay gitignored under `.verify/`. Never commit them to main.

## Cleanup

```sh
bun $S down
```

This kills only the Storybook and Chrome PIDs recorded at `up`, including their process trees (`taskkill /T` on Windows). It never kills by process name. It deletes `.verify/runs/<run>/` (the state, Chrome profile, and live log) and keeps `.verify/evidence/<run>/`. Run it after every attempt, including failed ones. `proof --publish` runs it for you. If `up` died halfway, `down` still cleans whatever `state.json` recorded. Delete old evidence dirs by hand only when the user no longer needs them.

## Optional, when relevant

### Firefox and WebKit

Run these when a change depends on a feature with engine fallbacks, such as `interestfor`, `closedby`, anchor positioning, or the slider fill. The harness drives Chrome only. For the other engines, use the Playwright suite in `e2e/`:

```sh
bunx playwright install firefox webkit   # once
bun run test:browsers                    # or: bunx playwright test e2e/behavior.spec.ts --project=firefox
```

- It builds a static Storybook to `.verify/playwright/storybook` and serves it on port 6107, so it never touches a harness run or the user's port 6006.
- `e2e/axe.spec.ts` is the `ctl.ts axe` sweep with the same rule set and record. `e2e/behavior.spec.ts` checks overlays, keyboard behaviors, the slider, and preferences.
- Each behavior test records whether the engine used the native feature or the fallback as an annotation, and attaches screenshots. Read them in `.verify/playwright/report`.
- These are Playwright's patched builds, not Firefox or Safari as shipped. Playwright's WebKit on Windows draws variable fonts at their thinnest weight, though layout uses the requested one, so thin text in a WebKit screenshot is not a bug in the CSS. `emulateMedia({ forcedColors })` in WebKit matches the media query but doesn't swap in system colors. Real Safari needs a Mac (see `docs/follow-ups.md`).

### Button usage sweep

Run this after changing the Button contract, the usage checker in `src/js/usage/`, or a story that renders buttons.

```sh
bunx playwright test e2e/usage.spec.ts --project firefox
```

`e2e/usage.spec.ts` builds `src/js/usage/dom.ts` once in the Firefox worker, during `beforeAll`, and writes `checker.js` under `.verify/playwright/usage-checker`. It injects that script the way `e2e/axe.spec.ts` injects axe. It opens every story and runs `checkRoot` on `#storybook-root`. It opens the Button Playground once per contract value. It clicks each toast trigger and runs `checkRoot` on `.odd-toaster`, because the action and dismiss buttons appear only after the click.

A clean run prints one line that starts with `[firefox]`, gives the number of stories the sweep checked, and ends with `0 diagnostics`. That number matches the pinned story list. A checker problem is one line, `<story id> [<state>] ODD-...`. A missing root is `<story id> [<state>] missing <selector>`. A Playground control that rendered the wrong attribute is `<story id> [<arg>=<value>] <attribute>=<actual>`. The disabled control adds ` disabled=true` or ` disabled=false` on that same line. If the injected script did not define `checkRoot`, the line is `<story id> [<state>] checkRoot is not installed`. The attached `usage-summary.json` stores those lines under `findings`. That file is not the axe report. Read it in the test output, or in the Playwright HTML report at `.verify/playwright/report`.

The sweep runs in the Firefox project only.

### Screen reader (NVDA)

Run this after changing names, roles, states, live regions, focus movement, or dialogs. `scripts/sr.ts` runs NVDA against a headed run and records what it says. axe checks the markup; this checks what a listener hears. Windows only.

Prerequisites: NVDA installed (`winget install NVAccess.NVDA`, or set `NVDA_PATH`), and ffmpeg for recorded scenarios (`winget install Gyan.FFmpeg`, or set `FFMPEG_PATH`). If the user's own NVDA is running, `start` refuses rather than replace it.

```sh
SR=.agents/skills/verify-odd-design/scripts/sr.ts
bun $S up --headed --run sr        # a visible app window at 0,0
bun $SR start --run sr             # NVDA with scripts/nvda/nvda.ini, then relaunches Chrome (see below)
bun $S goto components-forms--text-fields mode:light --run sr
bun $S focus '#name' --run sr      # setup through CDP; NVDA announces the focus
bun $SR press Tab shift+Tab nvda+Space ArrowDown --run sr
bun $SR scenario toast-over-modal --run sr
bun $S down --run sr               # also stops NVDA
```

- Pass the same `--run` to `sr.ts` and `ctl.ts`. Both default to the branch slug.
- `press` sends real keys through `SendInput`, so NVDA's own commands work (browse-mode arrows, quick keys, `nvda+...`). CDP keys would skip NVDA entirely. After each chord it waits for NVDA to finish speaking and prints what it said.
- Output lines: `"..."` is speech, `[focus: role, name, states]` is where NVDA's focus went, `[sound focusMode.wav]` and `[beep]` are earcons, and `(cut off)` marks speech NVDA cancelled before it finished. `(nothing spoken)` after a key is a finding, not noise.
- `scenario <name>` runs `scripts/sr-scenarios/<name>.ts` and writes `.verify/evidence/<run>/sr/<name>/`: `transcript.md` (read this), `<name>.mp4` (NVDA's real audio, with captions built from NVDA's text, never from transcribing audio), `captions.vtt`, `events.json`, and `index.html` to watch it. Each scenario states why it exists and what each step should say.
- `scripts/nvda/nvda.ini` pins the voice, rate, punctuation level, and say-all-on-load off. Each run copies it into a fresh config dir, so the user's NVDA settings are never read or changed. `scripts/nvda/globalPlugins/odd_verify.py` writes NVDA's speech, focus, keys, and sounds to `events.jsonl`.

While it runs, NVDA speaks aloud and Chrome needs the foreground. `press` refuses to send a key unless the run's Chrome is in front, so keys never land in another window. Tell the user before a run.

Things that look like bugs but aren't ours (all reproduced with DOM focus correct):

- Chrome only sends accessibility events to a screen reader that was running when it launched. `start` relaunches the run's Chrome for that reason.
- NVDA doesn't follow Chrome to the front when the harness raises it, only when focus moves inside the page. `press` and `scenario` refocus the focused element (or a throwaway one) until NVDA reports focus in Chrome.
- A tab with automatic activation is read twice, the first time cut off, even though it is selected before it takes focus. Most likely Chrome sends the selection change after the focus event.
- After a modal closes, NVDA can read the page's first landmark, or "document", around the returned focus.
- Opening a dialog reads its intro, cuts off, and reads it again.

Before blaming NVDA or Chrome for something intermittent, compare the event logs of a passing and a failing run (`events.jsonl` has every key, focus move, and window change), and check that the page wasn't reloaded (`page reload` in the Storybook log). The one flaky step so far was our harness: Vite reloading the page because the scenario wrote into a watched folder.

Turn what NVDA finds into a sharp test where the DOM can show it. For example, the toast announcement ran its title into its description and included the Dismiss button's name, so `e2e/behavior.spec.ts` now asserts the live region's exact text, with a comment quoting what NVDA said. Keep NVDA runs for what only a screen reader can show.

### Story catalog (`bun run shots`)

Run this for a whole-system chrome, palette, or token change, where you need to know every story that moved. It is a catalog and diff, not the use-the-thing proof, so the Definition of done still applies.

`bun run shots <storybook-url> <out.json> <shots-dir>` captures every story in light and dark through Playwright Firefox, recording a screenshot hash, the normalized DOM, and the aria snapshot. `bun scripts/capture-stories.ts --diff <a.json> <b.json>` lists changed, removed, and added captures and exits 1 when any differ.

```sh
# on main, or before the change, with a Storybook up at <url>
bun run shots <url> .verify/shots/before.json .verify/shots/before
# after the change
bun run shots <url> .verify/shots/after.json .verify/shots/after
bun scripts/capture-stories.ts --diff .verify/shots/before.json .verify/shots/after.json
```

A `changed` line names the capture as `<story id>@<mode>` and the fields that differ. Read the PNGs for every changed capture. Expected diffs confirm the reach of the change. Unexpected ones are regressions.

## Helpers

- `e2e/story.ts` has `openStory` and `storyIds` for new Playwright specs.
- `scripts/sr.ts` drives NVDA (`sr.ts help`). It uses `scripts/win.ts` (window focus, keys, and clicks through user32) and `scripts/loopback.ts` (records the speakers through WASAPI loopback). New scenarios go in `scripts/sr-scenarios/`, typed with `Scenario` from `sr.ts`.
- `scripts/ctl.ts` runs with `bun .agents/skills/verify-odd-design/scripts/ctl.ts help`. Each command is described above. It has no npm dependencies and needs only Bun plus a local Chromium-family browser.
