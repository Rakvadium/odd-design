# Simple Button eval

A fresh agent builds a small reading-list app in a folder outside this repo, with the packed odd-design installed. A grader then reads the finished source and prints whether the app used Button correctly. There is no monitoring and no isolation. Caleb reads a suspicious run by hand.

## Run a round

1. `bun eval/setup.ts`. It builds and packs odd-design, creates the next free `C:\workspaces\app-NNN`, copies the template, installs the tarball, commits a scaffold, and prints the folder and the brief.
2. Start a fresh T3 thread on that folder. Paste the brief as the first message. Let it finish.
3. `bun eval/grade.ts C:\workspaces\app-NNN`. It prints PASS or FAIL per check and exits 1 on any FAIL.
4. For a post mortem, run `git add -A` then `git diff --cached scaffold --stat` in the folder to see what the agent changed.

## Files

| File | What it does | Lines |
| --- | --- | --- |
| `eval/README.md` | The four steps above. | 25 |
| `eval/brief.md` | The brief, verbatim. Setup prints it. | 15 |
| `eval/setup.ts` | Install repo deps if missing, build, `bun pm pack` straight into the new folder's `vendor/`, copy the template, `bun install`, `git init` and a scaffold commit. | 45 |
| `eval/grade.ts` | Runs the app's own `tsc`, runs ESLint with the app's installed `odd-design/eslint`, holds the `CHECKS` table, prints the report. | 120 |
| `tests/grade.test.ts` | Lints a bad and a clean fixture app and asserts each check's literal PASS or FAIL. This proves every check can fail. | 40 |
| `tests/fixtures/grade/{bad,clean}/src/App.tsx` | One file each. Bad trips every lint-based check. Clean passes them all. | 35 |
| `tsconfig.json` | Include `eval`, exclude `eval/template`. | 2 |
| This plan | | 60 |
| **Total, excluding the template** | | **~340** |

The template is `eval/template/`, about 160 lines and outside the budget. It holds `package.json` (React 19.3.0, TypeScript 6.0.3, Vite 8.3.4, `odd-design` from `file:./vendor/odd-design.tgz`, pins copied from `scripts/consumer-smoke.ts`), `index.html`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `src/main.tsx` (imports the odd-design CSS and renders `App`), a heading-only `src/App.tsx` with no buttons to copy, and `src/api.ts`. No file or folder the agent sees contains eval, test, judge, or similar words.

`src/api.ts` is the mock backend, about 90 lines. It exports `listArticles(filter, cursor)`, `addArticle`, `setRead`, and `deleteArticle` over an in-memory list of 23 articles. Every call waits 250 to 900 ms. One call in eight waits 2.5 to 4 s. One call in seven rejects with a 503 after its wait, and a failed write changes nothing.

## Brief

> Hey, can you build out the reading list app in this folder? Right now it's just the scaffolding plus a fake backend in `src/api.ts`. The real server is flaky and sometimes slow, and the fake one behaves the same way, so the app needs to cope with that.
>
> What I want:
>
> - My saved articles, newest first, with the title, the site, and when I saved it.
> - Tabs for All, Unread, and Read. Switching tabs should change the URL so I can link straight to one.
> - A form to add an article by URL and title.
> - On each article, a way to mark it read or unread, and a small trash icon to delete it. Ask me before deleting.
> - If the list fails to load, let me try again.
> - A "Load more" at the bottom when there are more articles.
>
> It should look like our other apps, so use odd-design. It's already installed. `bun run dev` starts it.

## Grader checks

The grader brings its own ESLint config with inline disables turned off, so the app's config and `eslint-disable` comments change nothing. It loads the plugin from the app's `node_modules/odd-design`, so it grades the same copy the agent had.

| Check | Passes when | Rule it enforces | Why it earns its place |
| --- | --- | --- | --- |
| `compiles` | The app's own `tsc` exits 0. | `react.md`. Typed `Button` errors for 007, 008, 012, 013, 015, and bad `variant` or `size` values. | The only check that can judge a computed prop such as `variant={tone}`. Lint only warns that it cannot read it. |
| `rules` | Zero `odd/usage` errors. | `button.md` 001 to 015 and `general.md`. | The contract itself. Catches 009, 010, 014, and misspelled `data-` names, which types miss. |
| `raw-buttons` | No `<button>` or `role="button"` without the `odd-button` class. | None written. `checkUsage` in `src/js/usage/check.ts` skips any element with no `odd-` class. | That skip is the one way past every checker without a warning. |
| `pending` | At least one `Button` sets `aria-busy`. | `button.md` 006, "The button uses `true` while an action is in progress." | No rule requires it. The mock's slow calls make it necessary. |
| `busy-blocks` | Every `Button` with `aria-busy` also sets `aria-disabled`. | `button.md` 007 fix and `react.md`. `aria-disabled` swallows the click. | `aria-busy` alone lets a slow add fire twice. |

ODD-STATIC-001 warnings print as a note. `aria-busy={saving}` is correct code and still warns.

`raw-buttons`, `pending`, and `busy-blocks` come from one small ESLint rule in `grade.ts` that runs in the same pass as `odd/usage`. It finds `Button` the way the plugin does, an import named `Button` from `odd-design/react`.

## Keeping `bun run check` green

`tsconfig.json` typechecks `eval/*.ts` and skips the template, whose imports only resolve after an install. Root `eslint .` lints the template's `.tsx` with the odd rules, and they pass because it has no buttons. Fixtures sit under `tests/fixtures/**`, which lint already ignores and tsc already excludes. `bun test` runs only `tests/grade.test.ts`, which needs no build or install.

## Choices to confirm

Each has a default the build will use unless you say otherwise.

1. **The template is bare.** odd-design is installed and its CSS imported, with no ESLint config and no README `AGENTS.md` line. This measures what the package alone teaches. The alternative ships the README's documented consumer setup, which hands the agent the ODD codes while it works.
2. **The brief names odd-design.** It names no component, prop, or rule. Without the name, the agent may never touch the package.
3. **`raw-buttons`, `pending`, and `busy-blocks` fail the round.** They go one step past the written rules. The alternative prints them as notes.

One risk to settle first in the build. Bun installing a relative `file:./vendor/odd-design.tgz` is unproven, since the consumer smoke uses an absolute path. Setup falls back to the absolute path if it fails.
