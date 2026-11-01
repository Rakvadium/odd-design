# Verify screenshot proof

Make interactive screenshot proof part of how agents finish UI work in odd-design. An agent that changes `src/`, `stories/`, or `.storybook/` drives the changed stories in Storybook, and a script checks the evidence and writes `PROOF.md` before the agent claims the work is done. `bun test` alone does not count.

## Goal

- `AGENTS.md` requires `verify-odd-design` for any change under `src/`, `stories/`, or `.storybook/`. `CLAUDE.md` imports `AGENTS.md`, so it needs no edit.
- The skill's description says it is required. It gains a Definition of done, a Find changed stories step, and a Hand-back section. Firefox, WebKit, NVDA, and the story catalog move under an optional section.
- `ctl.ts` gains `proof`. It writes `.verify/evidence/<run>/PROOF.md` from `transcript.log` and exits 1 when a changed story lacks proof. Its first call lists what the branch must prove, so there is no separate `changed` command.
- The default run name becomes the branch slug in `ctl.ts` and `sr.ts`, so evidence lands in `.verify/evidence/<branch-slug>/`.
- `proof --publish` pushes the cited PNGs to an orphan `proof-assets` branch, rewrites the image links, and stops the run. The agent then posts `PROOF.md` with `gh pr comment --body-file`.
- `package.json` gains `shots`, which runs `scripts/capture-stories.ts`. The skill documents it as an optional catalog and diff for whole-system chrome or palette changes.

## Design

An arena produced two sketches (Claude and Grok runners) and a Grok cross-judge scored them. Both the judge and the lead picked candidate 1 as the base.

### Transcript

`transcript.log` becomes a typed event log with one writer and one reader, both in `proof.ts`. Each line is `[<iso time>] <kind> <json>`. `ctl.ts`'s `transcript()` takes an `Event`, so a command cannot write a line the parser cannot read. A `ROLE` table typed `satisfies Record<Event["kind"], Role>` makes a new kind a type error until someone classifies it.

```ts
type Scheme = "light" | "dark";
type Event =
  | { kind: "up"; storybook: string; head: string }
  | { kind: "down" } | { kind: "restart-chrome"; pid: number }
  | { kind: "axe"; appearance: string; stories: number; violations: number; needsReview: number }
  | { kind: "goto"; story: string; url: string; html: Record<string, string> }
  | { kind: "click" | "hover" | "focus"; target: string; text?: string; tag: string }
  | { kind: "press"; key: string; focus: string } | { kind: "type"; text: string }
  | { kind: "wait"; ms: number } | { kind: "emulate"; features: string[] }
  | { kind: "screenshot"; path: string; full: boolean; scheme: Scheme }
  | { kind: "eval"; js: string; result: unknown } | { kind: "aria"; path: string }
  | { kind: "state"; dialogs: string[]; popovers: string[]; focus: string };
```

Roles: `click`, `hover`, `press`, and `type` are interactions. `focus` (it calls `el.focus()`), `wait`, and `emulate` are neutral. `eval`, `aria`, and `state` are reads. `up`, `down`, `restart-chrome`, and `axe` end a segment.

### Verdict

- Only events after the last `up` count. If HEAD moved since that `up` and the commits between touch `src/`, `stories/`, or `.storybook/`, the proof fails as stale. A line after that `up` that does not parse fails the proof.
- A segment runs from one `goto` to the next `goto` or boundary. Evidence never spans a reload.
- The screenshot event records the scheme the page rendered, measured in the page at capture (`data-mode` when it is `light` or `dark`, otherwise `matchMedia("(prefers-color-scheme: dark)")`). The parser never models `emulate`.
- `screenshot` overwrites its file, so only the last screenshot event for a path counts.
- A segment proves its story in scheme `s` when it has a screenshot of `s` before the first interaction, at least one interaction, a screenshot of `s` after an interaction, and a read after an interaction.
- A required story passes when it is proven in both `light` and `dark`.

### Changed stories

`buildProof` takes `git diff -U0 --no-renames <merge-base with origin/main>` of the working tree, the untracked file list, and the live `/index.json` body.

- A new or untracked story file requires every story in it.
- Story files are split into column-0 top-level statement spans. A changed line inside an `export const <Name>` span requires that story. A changed line in any other span (imports, `meta`, helpers such as `SWATCHES` in `Foundations.stories.ts`) requires every story in the file.
- A touched export, or a changed story file, with no row in the live index fails the proof. Either the story did not load or the server is stale. So does a live index row for an export that a modified story file no longer has.
- A change elsewhere under `src/`, `stories/`, or `.storybook/` maps to no story. When nothing maps, `proof` requires at least one fully proven story the agent picks. Unmapped files are always named in `PROOF.md`.

### Publish

`proof --publish` only runs on a pass, and `cited` is empty on a fail. It writes blobs with `git hash-object -w`, builds the tree in a temporary `GIT_INDEX_FILE` under the run dir, commits with `git commit-tree` (no parent for the first commit), and pushes `<commit>:refs/heads/proof-assets` without force, retrying up to three times on rejection. The ref is a constant. It fetches the tip with `--no-write-fetch-head`, and it fetches and pushes through the origin URL rather than the remote name, so no local ref moves. It refuses unless `git merge-base origin/main <tip>` exits 1, meaning the histories are unrelated. Each cited path, and its real path, must resolve inside the evidence dir. Files go to `<branch-slug>/<short-head>/<path>`, and links pin to the commit as `https://raw.githubusercontent.com/<owner>/<repo>/<commit>/...`. A re-publish of the same bytes makes no commit. After the push it rewrites `PROOF.md` and runs `down`.

A plain `proof` leaves the run up, so the agent can fill gaps without a cold start.

## Files

- `.agents/skills/verify-odd-design/scripts/proof.ts` (new). Pure: `Event`, `Scheme`, `formatEvent`, `branchSlug`, `buildProof`, `ProofInput`, `Proof`. Everything else is private.
- `ctl.ts`. Typed `transcript(event)` at every call site, the scheme measurement, a `state` event, `proof [--publish]`, and `publishAssets`.
- `sr.ts`. The run default uses `branchSlug`.
- `tests/proof.test.ts` (new). Literal transcripts, diffs, and index bodies through `buildProof`.
- `AGENTS.md`, `.agents/skills/verify-odd-design/SKILL.md`, and `package.json`.

## Rejected

- Parsing today's prose transcript. `eval <js> -> <result>` cannot be split reliably, and fifteen call sites would own the format.
- Replaying `emulate` to resolve `mode:system`. `ctl.ts` re-applies emulation on every connect, so only the page knows.
- Failing an unemulated `mode:system` shot. The measured scheme is what the screenshot shows, so it proves that scheme.
- File-level mapping only. A one-story fix in a five-story file would cost five times the evidence.
- `proof` always calling `down`. A failing proof would take the page away while the gap is open.

## Out of scope

- The React Storybook on port 6007. The harness drives the HTML Storybook, which renders the mirrored stories too.
- Gate edits in t3-code-dev-flow, which Dispatch owns.
- Any story or component change.
