---
name: verify-odd-design
description: Launch and drive the odd-design design system's Storybook (the only UI surface) in an isolated headless Chrome to prove a CSS/token/component change works across chromes, palettes, and modes, and capture screenshots, accessibility-tree snapshots, and a transcript as evidence. Use after changing anything in src/css, src/js, stories, or .storybook, or when asked to verify, screenshot, or check a component, chrome, palette, or appearance behavior in the real rendered UI rather than only in `bun test`.
---

# Verify odd-design

odd-design is a framework-free CSS design system. Users touch it in two places:

- **Storybook** (primary): stories under `stories/` render real `.ds-*` markup. The `Chrome`, `Palette`, and `Mode` toolbar globals set `html[data-chrome|data-palette|data-mode]`.
- **`bun test`** (secondary, no UI): enforces the token contract and WCAG contrast. Run it alongside any visual proof. It is not a replacement for one.

The harness is `scripts/ctl.ts`, a zero-dependency Bun script. It starts Storybook on a free port and a headless Chrome/Edge with its own profile, then drives that Chrome over CDP. Each command connects, does one thing, appends a line to the transcript, and exits. Browser state (open dialogs, focus, typed values) persists between commands until the next `goto`.

Every command below runs from the repo root:

```sh
S=.agents/skills/verify-odd-design/scripts/ctl.ts   # then: bun $S <command> [--run NAME]
bun $S help
```

`--run NAME` (or `VERIFY_RUN=NAME`) selects an isolated run. The default name is `default`. Different run names get different ports, browser profiles, and evidence dirs, so parallel agents can each use their own name. Never drive a run you did not start, and never drive the user's own `bun run storybook` on port 6006.

## Launch

Prerequisites: `bun install` has run, and Chrome or Edge is installed. If neither is at a standard path, set `CHROME_PATH`.

```sh
bun $S up --run myrun
```

The command blocks until both processes are ready and prints `READY run="myrun" storybook=http://127.0.0.1:<port> evidence=...`. Ready means Chrome's CDP answers and Storybook's `/index.json` lists `showcase--sample-app`. A cold start takes about 5-10 s. On failure it prints the tail of the Storybook log.

Storybook runs in dev mode with HMR. Edits to `src/` or `stories/` show up live, but re-run `goto` to re-render. Edits to `.storybook/main.ts` need `down` and then `up`.

## Doctor

```sh
bun $S doctor --run myrun
```

This check is read-only. It verifies that the Storybook process is alive, that the port's listener is in that process tree, that the index serves the expected story, that the Chrome process is alive, and that CDP answers. It also reports whether HEAD still matches launch and flags uncommitted `src/stories` changes. It exits 1 on any `FAIL`. Run it first whenever something looks off. If it fails, run `down` and then `up`. Do not patch around it.

## Drive

Stories render in isolation at `iframe.html?id=<storyId>`, which skips the manager chrome. Story IDs:

| Area | IDs |
| --- | --- |
| Showcase | `showcase--sample-app`, `showcase--matrix` |
| Foundations | `foundations--contrast`, `foundations--palette`, `foundations--type`, `foundations--headings` |
| Button | `components-button--playground` (args), `--variants`, `--sizes`, `--states` |
| Forms | `components-forms--text-fields`, `--select`, `--choices`, `--switch`, `--segmented`, `--slider`, `--search` |
| Surfaces | `components-surfaces--card`, `--badge`, `--dialog`, `--disclosure` |
| Feedback | `components-feedback--alert`, `--progress`, `--skeleton` |
| Data Display | `components-data-display--table`, `--avatar`, `--separator` |
| Docs | `introduction--docs` (MDX; `goto` targets stories, so open docs via the manager URL if needed) |

The current list is always at `curl -s http://127.0.0.1:<port>/index.json`.

```sh
bun $S goto showcase--sample-app "chrome:glass;palette:aurora;mode:dark"   # globals = the toolbar
bun $S goto components-button--playground "" "variant:danger;size:lg;label:Delete+deck"   # args = Controls panel
bun $S state                                  # html data-*, every .ds-scope's data-*, open dialogs, focused element
bun $S click 'button[commandfor="appearance"]'            # real mouse events at the element's center
bun $S click '.ds-button' --text 'Done'                    # filter by visible text
bun $S focus '#name' ; bun $S type 'x' ; bun $S press Backspace ; bun $S press Tab
bun $S press Escape                          # also Enter Space Tab Backspace Arrow{Left,Right,Up,Down}
bun $S emulate prefers-color-scheme=dark prefers-reduced-motion=reduce prefers-contrast=more forced-colors=active
bun $S emulate                               # no args clears; each call replaces the previous set; persists until cleared or down
bun $S eval 'getComputedStyle(document.querySelector(".ds-button")).borderRadius'   # read-only assertions
```

Rules for driving:

- Valid globals are `chrome` ∈ `calm glass bubblegum holoterminal`, `palette` ∈ `default aurora sorbet`, and `mode` ∈ `system light dark`. The toolbar defaults are `calm`, `default`, and `system`.
- Prefer stable handles: ids and `commandfor`/`command` attributes in the stories, `input[name=…][value=…]`, `[role=switch]`, `aria-*`, and `.ds-*` classes. Do not use coordinates or nth-child.
- Change state with `click`, `press`, and `type`, which send real input events. Use `eval` only to read state, never to set it. Setting `.value`, calling `.showModal()`, or toggling attributes bypasses exactly what you are trying to prove: `:user-invalid`, invoker commands, `closedby`, and the native radio behavior.
- `mode:system` follows the browser's `prefers-color-scheme`, so pair it with `emulate`. `emulate` lasts until it is cleared or the run goes `down`.
- Real feature recipes are in [`features/`](features/README.md). Read the matching file before driving.

## Evidence

Evidence goes to `.verify/evidence/<run>/`, which is gitignored and survives `down`:

- `transcript.log` is automatic. It holds every `goto` (with the resolved `html data-*`), click target, key and resulting focus, eval and its result, and screenshot path.
- `bun $S screenshot <name>.png [--full]` takes a viewport screenshot (1280×900), or the full page with `--full`. Subdirectory names like `dialog/open.png` are fine.
- `bun $S aria <name>.txt` saves the accessibility tree (roles, names, values, and checked/expanded/focused/modal/invalid/disabled/busy) and prints it.
- `storybook.log` is copied in at `down`.

Proof standards:

- Drive the user path: open a story with the globals a user would pick, then click, type, and press like a user. Capture the before state, the action, and the after state. A single final screenshot is not proof.
- Back each visible claim with a read-only assertion. For example, `state` shows the `.ds-scope` data changed, `eval` shows `dialog.open` or the computed style, and `aria` shows `checked`/`modal`/`focused`.
- For appearance changes, prove every axis that the change touches. A chrome change needs at least one light and one dark capture, or `showcase--matrix`. A palette change needs `foundations--contrast` plus `bun test`.
- Read every screenshot you cite. Name the run ID, story ID, and globals with each artifact.
- There are no mocks and no backend. If something cannot be driven (for example, the a11y addon panel lives in the manager UI, not the iframe), say so rather than substituting a different path.

## Cleanup

```sh
bun $S down --run myrun
```

This kills only the Storybook and Chrome PIDs recorded at `up`, including their process trees (`taskkill /T` on Windows). It never kills by process name. It deletes `.verify/runs/<run>/` (the state, Chrome profile, and live log) and keeps `.verify/evidence/<run>/`. Run it after every attempt, including failed ones. If `up` died halfway, `down` still cleans whatever `state.json` recorded. Delete old evidence dirs by hand only when the user no longer needs them.

## Helpers

- `scripts/ctl.ts` runs with `bun .agents/skills/verify-odd-design/scripts/ctl.ts help`. Each command is described above. It has no npm dependencies and needs only Bun plus a local Chromium-family browser.
