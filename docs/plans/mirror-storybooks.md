# Mirror the Storybooks plan

Readers get one Storybook whose sidebar has an **HTML** section and a **React** section. Every component that has a React wrapper appears in both. Today that is only `Button`. One story file defines each mirrored story once, as data, and both Storybooks render it. The Firefox sweep opens every pair and fails when the two sides differ in pixels or in the accessibility tree. Stories for components without a wrapper stay HTML-only and keep their ids and markup.

The work ships as one PR on `mirror/storybooks`, built as eight commits. Each commit ends in a check. Nothing merges or deploys.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when its evidence exists. The evidence can be a file, a log line, a screenshot, a test run, or a SHA. The body is a how-to. The appendices explain and record.

The run follows `odd-mode/playbooks/feature.md` and `odd-mode/playbooks/visual-parity.md`. The Button stories in the HTML Storybook on `main` are the visual-parity baseline. A delegate on the `feature, refactoring` model (`cursor grok-4.7`) writes every commit. A reviewer on the `judgment and prose` model (`claudeAgent claude-opus-5-5`) reviews the diff, so builder and reviewer run on different providers. The lead plans, reviews, verifies, and records the browser session.

## Decide these before the build starts

The build waits for your answers. Each item has a default, and the build uses it unless you say otherwise.

1. **"Every component" means every component with a React wrapper.** Today that is `Button`. The other 32 stories have no React twin and stay HTML-only until a wrapper exists. The default is yes. Writing wrappers for the other components is outside this plan.
2. **Add one story, `Components/Button / Link`, to both Storybooks.** No story renders `Button` as a link today. Storybook URL args reject `/` and `#`, so the Playground can't carry an `href` either. The agent session needs a link to use. The 36 existing stories stay the same, and the baseline diff proves it. The default is to add it. If you say no, the session has no link step.
3. **The composed Storybook has no chrome, palette, or mode toolbar.** Storybook does not forward toolbar globals into composed Storybooks. Opus's lab confirmed this (E6), and an addon that forwarded them failed (E7). Each section's own toolbar still works when you open that Storybook on its own. The default is to accept it. The alternative is a follow-up spike.
4. **Attach the video by pushing it to an orphan branch.** GitHub has no API for PR attachments. The default is to push `evidence/mirror-storybooks`, an orphan branch that holds only the video and its transcript, and link both from the PR body. That push needs your OK. The alternative is that you drag the file from `.verify/evidence/` into the PR yourself.
5. **Make `odd-design/react` a barrel now.** Add `src/react/index.ts`, which re-exports `Button`, and point the `./react` export at `dist/react/index.js`. Without it, the second component also has to move the package entry. With it, a new component adds one `export` line beside its wrapper. Consumers keep `import { Button } from "odd-design/react"`. The default is to do it in commit 4.

## Arm the run

- [ ] Get the operator's go and answers to the five decisions. The evidence is the operator's reply in this thread.
- [ ] Run `bun install` in `C:\wt\odd-design\mirror-storybooks`. The worktree has no `node_modules`. The evidence is `bun run check` passes on the unchanged branch.
- [ ] Brief one builder on `cursor grok-4.7` with this file, `.verify/plan/how.md`, `.verify/plan/why.md`, and the sketches in `.verify/plan/candidate-opus/`. The brief carries the done marker that odd-mode's Subagents section requires. The evidence is the `delegate_task` taskId.

## Capture the baseline (commit 1, no source change)

Visual parity needs the baseline before anything moves. It is the spec, and nobody edits it.

- [ ] Build `main`'s HTML Storybook from a temporary worktree into `.verify/mirror/main/`.
- [ ] Add `scripts/capture-stories.ts`. For every story id in a built Storybook's `index.json`, it opens the story in Playwright Firefox in light and dark mode. It records the id, the title, the name, the normalized DOM of `#storybook-root` (sorted attributes, collapsed whitespace), the `ariaSnapshot`, and the SHA-256 of the root screenshot. `--diff <a.json> <b.json>` prints every story that differs and exits 1 on any difference.
- [ ] Capture `main`. The evidence is `.verify/mirror/main.json` with 72 captures, 36 stories in two modes.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check.

### Commit 2. Model a mirrored story and render it as HTML

- [ ] Create `stories/mirror.ts`. It holds the data shape and `toHtml`.
  - `Mirror<Args> = { scene(args): Scene; aria: string }`. The export name is the story name, `scene` gives the props, and `aria` is the expected result.
  - `Scene = Element | Layout`. `Element` is a union over `of`, so `props` is typed as that component's real props. `{ disabled: true }` and `{ variant: "default" }` are `tsc` errors that print the `ODD-BUTTON-*` message.
  - `toHtml(scene)` builds markup from `WRAPPERS` in `src/js/usage/contract.ts`. The prop-to-attribute mapping stays in one place, and `toHtml` holds no Button-specific code.
  - React is a type-only import here, so the HTML Storybook loads no React through this file.
- [ ] Create `tests/mirror.test.ts`. Write one case per `toHtml` rule (undefined, false, true, string, `href` picks `a`, icons, rows), and give each case the mutation it catches.
- [ ] Check. Run `bun run check`.

### Commit 3. Define Button's stories once, as data

- [ ] Move `stories/Button.stories.ts` to `stories/mirrored/Button.stories.ts` with `git mv`. Keep the title, the export names, `args`, and `argTypes` byte for byte, so the ids and `enumControl` stay unchanged.
- [ ] Rewrite each story as `mirrored({ scene, aria })`. The Playground's `scene(args)` is the old template's logic. An omit token becomes `undefined`, and `disabled` and `busy` become `aria-disabled` and `aria-busy`.
- [ ] Add a project-level `render` to `.storybook/preview.ts` that calls `toHtml(mirrorOf(parameters).scene(args))`. Storybook uses a project render only when neither the story nor its meta has one, so the other 32 stories keep their own render.
- [ ] Check. Build the branch's HTML Storybook, capture it, and run `--diff` against `.verify/mirror/main.json`. Pass means 0 differences across 72 captures.

### Commit 4. Add the React Storybook

- [ ] Run `bun add -d @storybook/react-vite@10.6.2`.
- [ ] Create `src/react/index.ts` with `export * from "./button.tsx";` (decision 5). Add it to `entries` in `scripts/build.ts`, and point `package.json` `"./react"` at `dist/react/index.{js,d.ts}`. `scripts/consumer-smoke.ts` keeps its `"use client"` check on `dist/react/button.js`.
- [ ] Add `"paths": { "odd-design/react": ["./src/react/index.ts"] }` to `tsconfig.json`. `tsc`, `bun test`, and the React Storybook's Vite alias all read this one entry. Stories import the published specifier without building `dist/` first.
- [ ] Create `stories/mirror-react.ts`. `toReact(scene)` renders the real `Button` from `odd-design/react`. Its `components` map is checked with `satisfies` against `WRAPPERS`, so a wrapper with no package export fails `tsc`.
- [ ] Create `.storybook-react/main.ts` and `.storybook-react/preview.ts`. The React config takes its addons and `viteFinal` from `.storybook/main.ts`. The preview is `{ ...htmlPreview, render: reactRender }`, so CSS, fonts, fallbacks, globals, the appearance decorator, and a11y settings are written once.
- [ ] Add the script `"storybook:react": "storybook dev -c .storybook-react -p 6007 --no-open"`.
- [ ] Check. `bunx storybook build -c .storybook-react -o .verify/react` succeeds, and its `index.json` lists exactly the five Button ids. `bun run build` and `bun scripts/consumer-smoke.ts` pass.

### Commit 5. Derive every story list from the files

- [ ] Create `stories/catalog.ts`. `STORYBOOKS` registers the two Storybooks by key, sidebar title, config folder, and story glob. Both `main.ts` files read their globs from it. `catalog()` imports every story file and computes ids with Storybook's own `toId` and `storyNameFromExport`. It returns `{ html, react }` and throws when a mirrored story sits outside `stories/mirrored/`, when one has a `render`, or when two ids collide.
- [ ] Delete `STORY_LABELS` and the `modules` import list from `tests/stories.test.ts`. Delete `STORY_IDS` from `e2e/usage.spec.ts`. Both files read `catalog()`.
- [ ] In `tests/stories.test.ts`, render each mirrored story through `toReact` with `renderToStaticMarkup`, and run `checkRoot` on it. Do the same for each Playground value test.
- [ ] Check. Make three mutations and confirm each one fails. Delete the `checked += 1` line, and the count assertion fails. Move the Button file out of `stories/mirrored/`, and `catalog()` throws. Make `toReact` drop `props`, and `Components/Button / Variants` fails `checkRoot`.

### Commit 6. Compose both Storybooks

- [ ] Create `.storybook-composed/main.ts` with refs `{ html: { title: "HTML", url: "./html" }, react: { title: "React", url: "./react" } }`, built from `STORYBOOKS`. Create `.storybook-composed/About.mdx`, which says what each section shows. The composer needs one local page, because an empty `stories` list fails the build and a glob that matches nothing shows "Your Storybook is empty".
- [ ] Create `scripts/storybooks.ts <out>`. It builds the composer into `<out>/`, then HTML into `<out>/html`, then React into `<out>/react`. The composer builds first, because each build empties its output folder.
- [ ] Change `build-storybook` to `bun scripts/storybooks.ts storybook-static`. Change the Playwright `webServer` command to `bun scripts/storybooks.ts .verify/playwright/storybook`.
- [ ] Give `openStory` and `storyIds` in `e2e/story.ts` a `storybook` parameter that defaults to `"html"`. `axe.spec.ts` and `behavior.spec.ts` do not change.
- [ ] Check. `bun run test:browsers` passes in Firefox and WebKit against `/html/`.

### Commit 7. Sweep both Storybooks and compare each pair

- [ ] In `e2e/usage.spec.ts` (Firefox), assert that each Storybook's live `index.json` equals `catalog()` for that Storybook. Run `checkRoot` on every story in both.
- [ ] For each mirrored story, assert three things. Both `ariaSnapshot`s equal the story's literal `aria`. The two `ariaSnapshot`s equal each other. The two `#storybook-root` screenshots are byte-identical. Run the Playground values on both sides with the same `args=` string.
- [ ] Assert `checked === html.length + react.length`.
- [ ] Add one test that opens the composed root and asserts the sidebar has buttons named `HTML` and `React`.
- [ ] Check. Make one mutation per assertion and confirm each fails.

  | Mutation | Assertion that fails |
  | --- | --- |
  | Change one story's `aria` | Both sides miss the expected tree |
  | Make `toReact` drop icons | Screenshots differ |
  | Make `toHtml` drop `aria-label` | Trees differ, and `checkRoot` reports `ODD-BUTTON-008` |
  | Drop `aria-busy` on one side | Screenshots differ, because `.odd-button[aria-busy="true"]::before` draws a spinner |
  | Point the React ref at a missing folder | The `index.json` equality fails |
  | Rename the React ref's title | The sidebar test fails |

### Commit 8. Add the Link story and the verify recipe

- [ ] Add `Link` to `stories/mirrored/Button.stories.ts` (decision 2). Measure its `aria` in Firefox first, then write that literal value. Do not copy the value from a lab run with different markup.
- [ ] Add a "React Button" section to `.agents/skills/verify-odd-design/features/buttons.md`. It gives the commands to build and serve the composed Storybook, run the pair sweep, and open a React story, so an agent can verify a React change without reading this plan.
- [ ] Check. Run `bun run check`, `bun run build`, `bun scripts/consumer-smoke.ts`, and `bun run test:browsers`. Rerun the baseline diff. Pass means 0 changed stories and one added id, `components-button--link`.

## Verify on the real surface

- [ ] Serve the composed build with `bun scripts/storybooks.ts storybook-static`, then `bun e2e/serve.ts storybook-static 6106`.
- [ ] Open `http://127.0.0.1:6106/` and confirm that the sidebar shows About, **HTML**, and **React**. Save `composer.png`.
- [ ] Record the session in T3's browser with `preview_recording_start`. Use the React section only.
  - [ ] Hover, then click, each variant in `Variants`.
  - [ ] Tab through the row and confirm the focus ring. Press Enter and Space on a button.
  - [ ] Use each size in `Sizes`, including both icon-only buttons.
  - [ ] In `States`, Tab to the `aria-disabled` button, confirm it takes focus, and confirm a click does nothing.
  - [ ] In `Playground`, step the Controls panel through every variant, size, disabled, and busy value.
  - [ ] In `Link`, Tab to the link and press Enter. Confirm the iframe URL ends in `#docs`.
- [ ] Stop with `preview_recording_stop`. Write a transcript next to the video with one line per step, saying what the agent did, what it saw, and the `ariaSnapshot`.
- [ ] If T3 recording fails, as it did in Opus's lab (E12), run the same steps from `.verify/mirror/session.ts` in Playwright Firefox with `recordVideo`. Say which recorder made the video.
- [ ] Attach the video per decision 4.

## Review and open the PR

- [ ] Have the Opus reviewer read the diff against this plan and `.verify/plan/candidate-opus/design.md`. Fix every finding in a fresh builder round.
- [ ] Run `/deslop` and `/no-comments` over the diff.
- [ ] Open the PR ready, not draft, with `gh pr create --base main --repo Rakvadium/odd-design`. Title `feat(storybook): mirror Button in HTML and React Storybooks`. Link the PR to this thread.
- [ ] Watch `gh pr checks <pr> --watch --repo Rakvadium/odd-design`. The repo has no workflows, so expect "no checks reported". Report the PR as open with no checks configured. Do not merge.

## Add a second component (worked example)

Badge shows the cost of the next component. Badge is already a story in `stories/Surfaces.stories.ts`.

1. **Its data.** Add `USAGE.badge` and `WRAPPERS.Badge` to `src/js/usage/contract.ts`, with codes in `src/js/usage/format.ts` and `docs/usage/badge.md`. `WRAPPERS.element` takes the form `{ attribute, present, absent }` today. Badge is always a `span`, so that field also needs a fixed-tag form. That is a contract change, and it belongs to the Badge PR.
2. **Its wrapper.** Create `src/react/badge.tsx` and add `export * from "./badge.tsx";` to `src/react/index.ts`.
3. **Its story entries.** Create `stories/mirrored/Badge.stories.ts` with `title: "Components/Surfaces"` and `export const Badge = mirrored({ scene, aria })`. Delete the `Badge` export from `stories/Surfaces.stories.ts`. The id stays `components-surfaces--badge`, because two files may share a title (lab E11).

Nothing else changes. Both `main.ts` globs, `catalog()`, `toHtml`, `toReact`'s type check, `tests/stories.test.ts`, and the Firefox pair sweep pick Badge up from those files.

## Throughput checkpoint

- **Blocking first steps.** `bun install`, then the `main` baseline capture. Nothing moves before the baseline exists.
- **Independent workstreams.** n/a. Commits 2 to 8 share `stories/catalog.ts`, `package.json`, `tsconfig.json`, and the e2e helpers, and each one builds on the one before it.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The baseline JSON is write-once.
- **Smallest safe decomposition.** One builder, one commit at a time, each verified before the next. The lead records the session after commit 8. A split would put two agents on the same five files.

## Appendix A. Evidence behind the design

Both architect runners built Storybook 10.6.2 labs. Their records are in the local, gitignored files `.verify/plan/candidate-opus/design.md` and `.verify/plan/candidate-grok/design.md`. These results carry the design.

- A composer with relative refs `./html` and `./react`, served as static files, shows sidebar sections `HTML` and `React`. With no local stories it also shows "Oh no! Your Storybook is empty." One local page removes that message.
- Built with the same titles, both Storybooks produce the same story ids. The pair key is the id.
- In Firefox, the five Button pairs gave equal `ariaSnapshot`s and byte-identical screenshots. The DOMs differ, because React adds `type="button"` and orders attributes differently. That lab loaded no fonts, so commit 7 is the first run with the real fonts.
- `ariaSnapshot` omits `aria-busy`, `data-variant`, and `data-size`. The screenshot comparison covers them, since each one changes pixels.
- `toHtml` produced the same normalized DOM as today's templates for all four Button stories and for all 36 Playground argument sets (Opus lab E9). The cross-judge reran this check and got the same result.
- Toolbar globals do not reach composed refs (E6). A forwarding addon failed (E7).
- T3's browser recording timed out inside a child thread (E12).

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| One data module plus a thin CSF file for each framework | Every story name appears in three places, which is a hand-synced list. |
| A generator that writes both CSF files from the data (the Grok candidate) | It adds a writer script, generated files, and a drift test. It also keeps the 36-name pins and runs `bun run build` inside `check`. |
| HTML Storybook as the host, React as a ref | Local stories get no section heading. Labeling them means retitling all 36, which changes every id. |
| Render the HTML side with React's `renderToStaticMarkup` | The framework-free Storybook would depend on React, and every HTML button would gain `type="button"`. |
| A neutral story vocabulary with one adapter per framework | The React props are already typed from `USAGE`, and `toHtml` reads `WRAPPERS`. A third vocabulary adds an adapter and no safety. |
| Compare normalized DOM attribute maps instead of pixels | The cross-judge proposed this because the pixel lab had no fonts. Pixels already catch every attribute that matters, and both previews load the same fonts. If byte equality flakes, add a pixel tolerance and keep the check. |

## Appendix C. Risks

- **Byte-equal screenshots may flake with real fonts.** Both previews share one font setup, and `openStory` waits for `document.fonts.ready`. Commit 7 measures it. On a flake, compare with a small pixel tolerance rather than dropping the check.
- **ESLint does not check the mirrored data.** `toReact` calls `createElement`, and `odd/usage` reads only JSX and HTML templates. `tsc` checks the props against the contract types, and `checkRoot` checks both rendered DOMs. The four `ODD-STATIC-001` warnings from the Playground template go away.
- **`toHtml` and `ODD-STATIC-002`.** `stories/**/*.ts` runs `odd/usage`. `toHtml` must not put a literal `odd-*` class in an untagged template literal. It builds strings with joins. `bun run lint` in commit 2 checks this.
- **Sidebar order.** Moving a story into its own file can change its position within its group, but not its id.
- **The verify harness `ctl.ts` still drives only the HTML dev server.** Commit 8's recipe covers React through the built Storybook. Teaching `ctl.ts` a second config is a follow-up.
- **axe runs only on the HTML Storybook.** Equal pixels and equal accessibility trees make an axe run on the React twin redundant for now. Add it when a wrapper can differ from its HTML in ways neither check sees.

## Appendix D. Reading list

These files are local scratch under the gitignored `.verify/` folder in this worktree. They are not on the branch.

- `.verify/plan/how.md` explains how the Storybook, the stories, the sweeps, and the React Button fit together.
- `.verify/plan/why.md` traces why the stories and pins have their shape, and ends with a Preserve, Change, Avoid, and Risk list.
- `.verify/plan/candidate-opus/` holds the base design and its sketches. `.verify/plan/candidate-grok/` holds the other candidate and its labs.
- `.verify/plan/rubric.md` is the rubric the cross-judge scored against.
