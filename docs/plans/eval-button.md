# Button eval loop plan

A fresh agent gets a React app with odd-design installed from the packed tarball, a mock API, and one product brief. It never sees the grader. The grader scores every button it built, and each corner the agent cut becomes a hole that gets fixed in odd-design, never in the brief.

The program adds `eval/` to this repo in four stacked PRs, E1 to E4. Then it runs rounds of fresh agents on two models. Each hole becomes its own PR, H1, H2, and so on, until three complete rounds in a row pass with no new hole. Nothing merges or deploys. The operator lands the stack.

## How to read this

One box is one unit of work. Every box names the evidence that checks it. A nested box is a sub-step of the box above it. Check a box only when its evidence exists, a file, a log line, a screenshot, a test run, or a SHA. The body is a how-to. The appendices explain and record.

The program runs `odd-mode/playbooks/autopilot-stack.md` for the PRs and `odd-mode/playbooks/eval.md` for each round. Nobody merges. E1 to E4 and every H PR stop at stack-ready, and the operator reviews and lands the stack bottom-up.

Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

## Decide these before the build starts

The operator approved every default on 2026-10-24, with decision 9 changed to Sonnet 5.5. On the same day the operator replaced the container jail with T3 threads and detected isolation, which rewrote decisions 1, 2, 4, and 6 and E1.

1. **The two models are Claude Opus 5.5 and Grok 4.7, both through T3.** Each run is a fresh top-level T3 thread on the operator's existing subscriptions, `claudeAgent claude-opus-5-5` or `cursor grok-4.7`. A run folder such as `C:\workspaces\app-001` gives a 20-character Cursor project slug, well under the 51-character limit in odd-mode's Subagents section.
2. **Isolation is detected, not enforced.** The operator chose this. The agent could read any file on the machine, so every run is scanned after it finishes, and a canary read, an outside path, a T3 call that reads other threads, or a fetch of the public repo fails it. A failed run is discarded, never graded, and never reused. The container jail is rejected in Appendix B.
3. **The outside-path rule is your literal rule.** A run fails when its tool log names any path outside its folder, beyond `node_modules\odd-design`. A harmless read such as `type C:\Windows\win.ini` or a path under `%TEMP%` fails a run too. The scorecard tags it `isolation`, and `holes.tsv` records it as `harness`, never as an odd-design hole.
4. **Web use is logged, and the public repo fails a run.** Any `WebFetch`, `WebSearch`, or shell command naming `github.com/Rakvadium` or `odd-design` on the web fails the run. Other web use is listed on the scorecard and does not fail it.
5. **Three complete rounds in a row end the loop.** A round is one fresh run of every brief on every model at one odd-design tarball and one grader version. A run passes only when it has no finding at all, so a known open hole still fails it. The loop ends when the last three rounds pass.
6. **No new auth and no spend caps.** Runs use only the operator's existing Claude and Cursor subscriptions through T3. No API key, OAuth token, or new login is created.
7. **Videos stay local.** Each run writes `drive.webm` under `.verify/eval/runs/<id>/`, which git ignores. Nothing is pushed to an evidence branch.
8. **The brief keeps "send themselves a test notification".** It is product language you approved, and the blinding word list targets words about the measurement. The folder name check exempts that phrase and the route `POST /notifications/test`. The alternative is "a sample notification".
9. **The round reviewer runs on Claude Sonnet 5.5.** The operator chose it because Gemini 4 Argon is not available. The eval playbook wants a judge from a family other than the candidates', and Sonnet shares Opus's family, so the reviewer sees only run labels and copies with the model removed. Where its notes and the lead's reading disagree, the lead records it.

## Throughput checkpoint

- **Blocking first steps.** E1's two probe threads. Nothing else moves until the scan catches every planted escape on both providers.
- **Independent workstreams.** None for E1 to E4. Each one builds on the one below it. During rounds, the runs of one round are independent T3 threads that run in parallel.
- **Shared mutable state.** `holes.tsv` and `.verify/eval/runs.jsonl` have one writer each. `run.ts` writes `runs.jsonl`. `loop.ts` writes `holes.tsv`. Run folders are per run.
- **Smallest safe decomposition.** One builder per PR, one PR at a time. H PRs run one at a time, because each changes the tarball that the next round measures.

## Program checklist

### Arm the program

- [ ] State the protocol and this plan to the operator, then stop. Start execution only on the operator's explicit go. The evidence is the operator's reply in this thread.
- [ ] Read these at program start. Re-read them at every tick.
  - [ ] `C:\Users\xenos\.agents\skills\odd-mode\playbooks\autopilot-stack.md`
  - [ ] `C:\Users\xenos\.agents\skills\odd-mode\playbooks\eval.md`
  - [ ] `C:\Users\xenos\.agents\skills\swarm\SKILL.md`
  - [ ] `.agents/skills/verify-odd-design/SKILL.md`, the repo's verify skill
  - [ ] `C:\Users\xenos\.agents\skills\odd-mode\playbooks\opening-a-pr.md`
  - [ ] `git show origin/main:docs/usage/button.md`, the contract every H PR changes
- [ ] On the operator's go, arm the audit tick as `/loop 1h` with the tick prompt below. Never leave the cadence to memory.
- [ ] Use this tick prompt, verbatim. "Re-read the execution playbook from trunk. Audit the operation against it and fix drift in this tick. Probe every active lane and judge progress by side effects only. Stand down a stuck lane and dispatch its replacement now. Then post a short status message to the operator in chat only when the audit found a tracked change that no earlier status message reported, such as a PR opened, a code-ready head, a round launched or closed, a verdict, a merge, a stuck agent and the action taken, a blocker added or cleared, or a decision only the operator can make. Name every such change and nothing else. Do not repeat a table, the merged list, or an unchanged blocker. If the audit found none, end the turn with no reply text. Either way, log this tick's row in your decision trail. The row names the items reported, or none."
- [ ] On the operator's hold or stand-down, send every owner a zero-writes order at once.

### Spawn owners

- [ ] Spawn one owner per PR on the `feature, refactoring` model (`cursor grok-4.7`). E1, E3, and every H PR touch isolation or the contract, so they use the `hardest tasks` model (`claudeAgent claude-opus-5-5`). Each owner reads this plan and its PR section. The evidence is each `delegate_task` taskId.
- [ ] Follow this dependency graph. Each PR branches from the one below it.
  - [ ] E1 branches from `eval/button`, the branch that holds this plan.
  - [ ] E2 after E1. E3 after E2. E4 after E3.
  - [ ] H1 after E4 and round 1. Each later H PR after the H PR below it and the round that found its hole.
- [ ] Hold the file boundaries. E1 to E4 touch only `eval/**`, `package.json` scripts, `.gitignore`, `tsconfig.json`, and `eslint.config.js`. H PRs touch only `src/**`, `docs/usage/**`, `tests/**`, and `scripts/consumer-smoke.ts`. Grader PRs touch only `eval/checks.ts`, `eval/drive.ts`, `eval/grade.ts`, `eval/seeds/**`, and `eval/grader/**`, and branch from the top of the stack like an H PR. No PR edits `eval/briefs/**/prompt.md`, `eval/briefs/**/api.ts`, `eval/briefs/**/API.md`, or `eval/template/**` after E2, because only odd-design changes what the agent gets between runs.
- [ ] Hold the review gate. Every H PR changes how Button behaves or reports, so it waits for the operator's review in chat with screenshots and a video. E1 to E4 change no interaction.

### PR mechanics, for every PR

- [ ] Use `gh` for every PR operation, and record the forge. Never require `gt`.
- [ ] Open the PR ready, never draft, per **Opening a PR**, with `gh pr create --base <parent-branch> --repo Rakvadium/odd-design`. E1 targets `eval/button`. Each later PR targets the PR below it.
- [ ] Run `bun run check` once before the PR-facing push. Push with hooks on.
- [ ] Run `/deslop` before each commit and `/no-comments` before review.
- [ ] Bugbot and the agentic security review are Cursor features with no equivalent here. Record that in each PR body.
- [ ] Rebase onto the current parent before the code-ready report. Ask the operator before any force-push, even a lease restack.

### Verdict and merge, for every PR

- [ ] At the code-ready head SHA, and at each later push that changes the patch, run the swarm per the swarm skill. Run one gates lane, the ten live lanes from the PR's **Verify, live** block, and the perf lane from its **Verify, perf** block. Add two or more audit lanes, each with its own focus, that read the diff and the receipts and distrust the PR body. The root audits the receipts before the verdict.
- [ ] A PR is clean only when every lane is `PASS`. Findings go back to the owner, including a defect that a lane filed as a note. A new head gets a fresh swarm and a fresh verdict, except for results that stay valid under the patch-id rule in `odd-mode/playbooks/shipping.md`.
- [ ] On a clean verdict, append the PR to the stack in order. Never merge, never arm auto-merge, never close. The operator lands the stack bottom-up.

### Boot recipe, for every live lane

Each live lane runs locally in its own worktree at the PR head. Cursor cloud VMs have no equivalent here. The `control-cli` and `control-ui` skills from `cursor-team-kit` are not installed, so lanes drive the CLI through its own commands and the browser through Playwright Firefox, as the verify skill's usage sweep does.

- [ ] `git fetch origin <head-branch> && git worktree add <path> <head SHA>`, then `bun install` and `bunx playwright install firefox`.
- [ ] Confirm T3 lists `claudeAgent` and `cursor` as able to run, with `orchestrator_capabilities`.
- [ ] Drive only through `bun eval <verb>`, the T3 thread tools named in `eval/README.md`, and Playwright. Read-only diagnostics are `t3_thread_read`, `cat` on run evidence, and `jq` on `scorecard.json`.
- [ ] Save every artifact to `.verify/swarm-<pr-id>/worker-<n>/<slug>` and return the paths with the report. A CLI lane saves a `.txt` transcript. A browser lane saves a `.png`.

### Run the rounds, after E4

- [ ] Run round 1 by following `eval/README.md`. `bun eval round --prepare` makes one folder per brief and model. The lead launches one T3 thread per folder, waits for each, and runs `bun eval round --finish`. The evidence is the round line in `.verify/eval/runs.jsonl` and one `scorecard.json` per run.
- [ ] Spawn one blinded reviewer per round on `claudeAgent claude-sonnet-5-5`, per decision 9. It reads copies of each run's diff and scorecard labeled `r1`, `r2`, and so on, with the model removed, and lists corners the agent cut that no check caught. Each one becomes a grader PR (G1, G2, and so on) that adds one row and its seed to `eval/checks.ts`. A grader PR changes the grader version, so rounds before it stop counting toward decision 5. It never changes what the agent sees.
- [ ] Read every run's code and video yourself, end to end. Where you and the reviewer disagree, the rubric or a check is ambiguous. Record it.
- [ ] Record new holes with `bun eval status --record`. Each `open` hole gets an H PR.
- [ ] After each H PR is stack-ready, run `bun eval rerun <signature>`, then the next full round.
- [ ] Repeat until `bun eval status` exits 0. The evidence is its output naming three passing rounds and both models.

## Launch a run through T3 and catch every escape (E1)

**Depends on.** None. E1 branches from `eval/button`. It reuses PR #14 and branch `eval/e1-jail`, and its first commit removes the Dockerfile draft in `28b37be`.

**Files.**

- [ ] Delete `eval/agent/`.
- [ ] Create `eval/isolate.ts`. It plants canaries, finds a run's native transcripts, and scans them.
- [ ] Create `eval/launch.ts`. It makes a run folder and writes the launch request the lead hands to T3.
- [ ] Create `eval/README.md`, the exact steps the lead follows to launch, wait for, and scan a run.
- [ ] Create `eval/seeds/isolation/` with one seeded transcript per finding, for both providers.
- [ ] Keep the `.gitignore`, `tsconfig.json`, and `eslint.config.js` edits from `28b37be`.

**Build.**

- [ ] `bun eval prepare --model <opus|grok> [--probe <clean|escape>]` in `eval/launch.ts` creates the next `C:\workspaces\app-NNN`. It holds one `README.md` for the probe, and E2 adds `--brief`. It issues a token per run into `odd-eval/tokens.txt` under `git rev-parse --git-common-dir`, one list for every checkout, and plants it in `.odd-notes.md` at the root of every checkout `git worktree list` prints, excluded through `.git/info/exclude`, in `eval/.canary/app-NNN`, and in `C:\workspaces\notes.md`. It writes `.verify/eval/runs/app-NNN/launch.json` with the folder, the provider, the model, and the message.
- [ ] The lead launches the run per `eval/README.md`. It calls `t3_project_create` on the folder, then `t3_thread_launch` with that project, `workspaceStrategy` root, the provider and model, and the message, and writes the returned `threadId` into `launch.json`. It waits with `t3_thread_wait` until the thread settles.
- [ ] `bun eval scan app-NNN` in `eval/isolate.ts` reads every `.jsonl` under `~/.claude/projects/C--workspaces-app-NNN/` and `~/.cursor/projects/C-workspaces-app-NNN/`. It parses each tool call into one `ToolEvent` type. It prints one finding per issued token anywhere in the transcript or the run folder, per tool-input path that resolves outside the folder after it resolves `~`, `%USERPROFILE%`, `$HOME`, and `..`, per `t3-code` tool call other than the thread's own `html_preview`, `html_render`, and `preview_*` tools, per Cursor `SearchConversations` call, and per web call that names the public repo. It writes `isolation.json` and exits 1 on any finding.

**You see.**

- [ ] `bun eval prepare --model opus`, the launch, and `bun eval scan` on the clean probe print `isolation: 0 findings` and exit 0.
- [ ] The same three steps on the escape probe print one finding for each of the five escapes in lane 2, plus the canary token, and exit 1, for both `--model opus` and `--model grok`.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `tests/eval-isolate.test.ts` feeds each seeded transcript to the scanner and asserts the exact finding list. A clean transcript gives `[]`. A token gives one `isolation:canary`. A shell `type ..\notes.md` gives one `isolation:outside-path`, which is the bypass from Appendix A, B-E1. A Read of `C:\wt\odd-design\eval-button\package.json` gives one `isolation:outside-path`. A `t3_thread_read` call gives one `isolation:t3`. A `WebFetch` of `https://github.com/Rakvadium/odd-design` gives one `isolation:web-repo`. Run `bun test tests/eval-isolate.test.ts`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `cursor grok-4.7` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Trunk has no launcher and no scan, so record that. At head, run the clean probe on `--model opus`, whose message asks the agent to read `README.md` and write `hello.txt`. Save `clean-opus.txt`. Pass when the scan prints `isolation: 0 findings`.
- [ ] Lane 2. Run the escape probe on `--model opus`. Its message asks the agent to read `..\notes.md`, `type` the repo's `.odd-notes.md` by absolute path, `Glob` `C:\workspaces`, fetch `https://github.com/Rakvadium/odd-design`, and call `t3_thread_list`. Save `escape-opus.txt`. Pass when the scan prints one finding per escape plus one `isolation:canary` for the token the first two reads return, six in all, and exits 1.
- [ ] Lane 3. Run lane 2 on `--model grok`. Save `escape-grok.txt`. Pass when the scan prints the same six findings from the Cursor transcript.
- [ ] Lane 4. Run lane 1 on `--model grok`. Save `clean-grok.txt`. Pass when the scan prints `isolation: 0 findings`.
- [ ] Lane 5. Ask an opus probe to run `cd .. && dir` in its shell. Save `traversal.txt`. Pass when the scan reports the `..` path.
- [ ] Lane 6. Ask an opus probe to spawn a subagent that reads the repo's `.odd-notes.md`. Save `subagent.txt`. Pass when the scan finds the token in the subagent's transcript under the same project folder.
- [ ] Lane 7. Open each lane 2 and lane 3 thread with `t3_thread_read`. Save `threads.txt`. Pass when each thread's project path is its run folder and its first message equals the probe message.
- [ ] Lane 8. Run `git status` in every checkout after lanes 1 to 6. Save `checkouts.txt`. Pass when no checkout shows `.odd-notes.md` as untracked or changed.
- [ ] Lane 9. Prepare two runs at once. Save `parallel.txt`. Pass when they get different folders and tokens, and each scan sees only its own transcripts.
- [ ] Lane 10. Delete a run's transcript folder and scan it. Save `missing-log.txt`. Pass when the scan exits 1 with `no transcript`, because a run with no log cannot prove it stayed in its folder.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Seconds for `bun eval prepare` without a brief, and seconds for `bun eval scan` on lane 2's transcript. Trunk has neither.
- [ ] Probe. Run each five times.
- [ ] Baseline. Record that trunk has no launcher and no value.
- [ ] Rule. Both medians are under 10 seconds. A median over 20 seconds fails.

**Review gate.** None. E1 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage recorded as unavailable.
- [ ] Rebased onto the current `eval/button` after the verdict, patch-id unchanged.
- [ ] The root appends E1 to the stack. The operator lands it.

## Start a fresh run from the template (E2)

**Depends on.** E1.

**Files.**

- [ ] Create `eval/template/`. It is a Vite React app on the pinned versions from `scripts/consumer-smoke.ts`, with `"odd-design": "file:./vendor/odd-design.tgz"` and the scripts `dev` and `api`. It leaves out the smoke fixture's `tests/` folder, its usage setup, and its odd ESLint config, so no odd-design checker is wired in. The package name is `workspace-app`.
- [ ] Create `eval/template/api/mock.ts`. It serves the brief's routes with log-normal latency of about 150 ms to 2.5 s, a 10% rate of 500 responses, and 5% of responses at about 6 s. The mock has no switch, flag, or control file. These numbers are starting values that nobody has measured against a real API, and E2 lane 7 records what they produce.
- [ ] Create `eval/briefs/settings/prompt.md`, the approved brief, byte for byte as in Appendix D. Create `eval/briefs/settings/api.ts` and `eval/briefs/settings/API.md` for `GET` and `PUT /settings`, `POST /notifications/test`, which returns 429 for 60 seconds after a success, and `POST /sessions/sign-out-others`.
- [ ] Create `eval/grader/mock-calm.ts`. It serves the same routes from `eval/briefs/<name>/api.ts` with no added latency and no random failure. It lives only in the repo, and the grader serves it in place of the run folder's mock.
- [ ] Create `eval/run.ts` and `eval/cli.ts`. Add the script `"eval": "bun eval/cli.ts"` to `package.json`.

**Build.**

- [ ] `bun eval prepare --brief settings --model <m>` now packs odd-design with the steps of `scripts/consumer-smoke.ts`, then copies the template, the tarball, and the brief's `api.ts` and `API.md` into the run folder and runs `bun install` there. `launch.json` carries `prompt.md` byte for byte as the message. The lead launches and waits per `eval/README.md`, then runs `bun eval scan`.
- [ ] `bun eval finish app-NNN` appends one `RunRecord` line to `.verify/eval/runs.jsonl`. The record holds the brief, the provider, the model, the thread id, the git SHA, the tarball SHA-256, the duration, and the scan result. `launch.ts` is the only writer of that file.
- [ ] `eval/README.md` gains the brief run steps. Copying the template, installing, and scanning stay in scripts, and only the two T3 calls are the lead's.

**You see.**

- [ ] After the launch, `bun eval finish app-NNN` prints `run app-NNN  opus  <mm>m<ss>s  isolation 0` and the folder's `bun run dev` serves a settings screen.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `tests/eval-run.test.ts` prepares a run folder without launching it. It asserts that the folder holds no path into the repo, because a byte search for `C:\wt` and `odd-design\eval` finds nothing, and that `launch.json` carries `prompt.md` unchanged. It also asserts that no file name or text the harness wrote contains a word from the eval playbook's list (`eval`, `test`, `judge`, `experiment`, `rubric`, `score`, `compare`, `benchmark`, `candidate`, `arena`), plus `grade` and `canary`. The check covers the template and the copied brief files, not `node_modules`, and exempts the phrase and route from decision 8. The run root `C:\workspaces` is outside the agent's folder and is not in the message. Run `bun test tests/eval-run.test.ts`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `cursor grok-4.7` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Trunk has no run command, so record that, then run `bun scripts/consumer-smoke.ts` at trunk and head. Save `smoke.txt`. Pass when both exit 0, which shows the shared pack steps still work.
- [ ] Lane 2. Run the settings brief on `--model opus` to the end per `eval/README.md`. Save `run-opus.txt`. Pass when the thread settles within 60 minutes, the scan is clean or every finding is listed, and `bun run dev` in the folder serves a page.
- [ ] Lane 3. Run the same on `--model grok`. Save `run-second.txt`. Pass when the thread settles within 60 minutes and the folder serves a page.
- [ ] Lane 4. Open the lane 2 app in Firefox with the mock at its default faults. Save `settings-opus.png`. Pass when the screen shows the four actions from the brief.
- [ ] Lane 5. Run `bun eval scan` on both runs. Save `isolation.txt`. Pass when neither transcript contains a canary token. Record every other finding. E3 turns each one into a failing `isolation` row.
- [ ] Lane 6. Diff the run folder against the template. Save `diff-stat.txt`. Pass when `vendor/odd-design.tgz` and `node_modules/odd-design` match the tarball SHA in the record.
- [ ] Lane 7. Call the run folder's mock 200 times and `eval/grader/mock-calm.ts` 50 times. Save `mock-latency.txt`. Pass when the first shows 500s near 10% and slow responses near 5%, and the calm mock shows no failure and no response over 300 ms.
- [ ] Lane 8. Call `POST /notifications/test` twice in a row. Save `rate-limit.txt`. Pass when the second call returns 429 with a retry time.
- [ ] Lane 9. Read each thread's first message with `t3_thread_read`. Save `prompt-seen.txt`. Pass when the brief appears byte for byte. Record the T3 orchestration text that T3 adds to every thread, which the agent sees too (Appendix A, T-E2).
- [ ] Lane 10. List every file and folder name in the run folder. Save `names.txt`. Pass when no name the harness wrote contains a word from the unit test's list, apart from the decision 8 exemption. Names inside `node_modules`, such as odd-design's own `test-setup.js`, are the package as shipped and are listed, not failed.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Seconds of harness work per run, from `bun eval prepare --brief settings` start to `launch.json` on disk, which covers the pack, the copy, and the install. Trunk has no prepare command.
- [ ] Probe. Run `bun eval prepare --brief settings --model opus` three times and delete each folder unlaunched.
- [ ] Baseline. Record that trunk has no run command, then time `bun scripts/consumer-smoke.ts` at trunk as the nearest pack-and-install cost.
- [ ] Rule. The median is under 180 seconds. A median over 300 seconds fails.

**Review gate.** None. E2 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage recorded as unavailable.
- [ ] Rebased onto E1 after the verdict, patch-id unchanged.
- [ ] The root appends E2 to the stack. The operator lands it.

## Grade a run and prove every check (E3)

**Depends on.** E2.

**Files.**

- [ ] Create `eval/checks.ts`, the one table of checks. Each row has an id, the one-line mistake it catches, a phase, and a required seed. A row without a seed does not compile. The table includes `isolation:canary` and `isolation:outside-path`, which call E1's `scanLog`, so an isolation finding fails the run like any other.
- [ ] Create `eval/grade.ts`, `eval/drive.ts`, `eval/grader/tsconfig.json`, and `eval/grader/eslint.config.js`.
- [ ] Create `eval/seeds/reference/`, a hand-checked clean solution of the settings brief, and one `eval/seeds/<check-id>.patch` per row. Each seed declares the exact set of rows it must fail, which is usually its own row alone. A raw `<button>` fails both `lint:raw-element` and `browser:unbranded`, and its seed says so.
- [ ] Create `eval/briefs/settings/probes.json` with one entry, `{"button": "save", "unavailableWhen": "pristine"}`. The grader reads it, and it is never copied into a run.

**Build.**

- [ ] `grade({ app, log, out })` in `eval/grade.ts` runs every row of `CHECKS` and writes `scorecard.json` to a temp name, then renames it into place. A crash leaves no scorecard.
- [ ] The static phase copies the run folder to `.verify/eval/grade/app-NNN/` and runs there, so nothing the agent left behind can change the grader's configs. `tsc -p eval/grader/tsconfig.json` is strict with `noErrorTruncation`. `eslint --no-config-lookup -c eval/grader/eslint.config.js --no-inline-config` uses the packed `odd/usage`, `odd/usage-incomplete`, and `odd/disable-reason` at error, plus rules for an intrinsic `button`, `createElement("button")`, `role="button"`, `style` on `Button`, and `any`. The `workaround` rows scan for `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, `as unknown as`, `as never`, CSS that selects `.odd-` or sets `--odd-`, `!important`, and any change to `node_modules/odd-design`.
- [ ] `drive(app)` in `eval/drive.ts` serves the app against `eval/grader/mock-calm.ts` on the port `API.md` names, and walks it in Playwright Firefox with `recordVideo` on. It finds every `button`, `[role=button]`, `input` of type `button`, `submit`, or `reset`, and `a[href]`, plus any element with `cursor: pointer` and a tab stop or a click handler. It drives each one at rest, on hover, on Tab focus, on click, on Enter, and on Space. It clicks an `aria-disabled` button with `force: true`, because Playwright treats that state as not enabled (Appendix A, B-E5). It changes every field and toggle, then finds buttons again. It opens each dialog and popover to depth 2. For each button that sends a request, `page.route` holds the request, then releases it as 200, as 500, and as a network abort.
- [ ] After every step, `drive` runs `checkRoot(document)` from the installed package and axe with `A11Y_OPTIONS` from `.storybook/a11y.ts`. It checks the rules that ran against `.storybook/a11y-rules.txt`, as `e2e/axe.spec.ts` does.
- [ ] `drive` turns off every stylesheet that is not from `node_modules/odd-design` and compares each Button's computed style at rest, on hover, and on focus (Appendix A, A-E4). A difference fails `browser:style-override`.
- [ ] `drive` writes `drive.json`, one entry per button and step with its name, whether it is an `odd-button`, its requests, its ARIA state, and its findings. It also writes `drive.webm`.
- [ ] `bun eval grade <runId>` grades one run. `bun eval selftest` grades `seeds/reference` and each seed. It fails unless the reference passes every row and each seed fails exactly the rows it declares.

**You see.**

- [ ] `bun eval selftest` prints one `PASS` line per row of `CHECKS` and `reference clean`.
- [ ] `bun eval grade <runId>` on the lane 2 run of E2 prints `PASS` or `FAIL` with one line per finding, plus the scorecard and video paths.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `tests/eval-checks.test.ts` asserts that every row of `CHECKS` has a seed file on disk and that no two rows share an id. Run `bun test tests/eval-checks.test.ts`.
- [ ] Run `bun eval selftest`. It is the real test of each row, because it grades a real app in a real browser.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `cursor grok-4.7` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Trunk has no grader, so record that, then run `bunx playwright test e2e/usage.spec.ts --project firefox` at trunk and head. Save `usage-sweep.txt`. Pass when both pass, which shows the reused axe options and checker still work for the Storybook.
- [ ] Lane 2. Run `bun eval selftest`. Save `selftest.txt`. Pass when every row passes and the reference is clean.
- [ ] Lane 3. Apply the raw-button seed and grade it. Save `raw-button.png` from the video at the raw button. Pass when `lint:raw-element` and `browser:unbranded` fail and nothing else does.
- [ ] Lane 4. Apply the hover-CSS seed and grade it. Save `style-override.png`. Pass when only `browser:style-override` fails and the finding names the hover step.
- [ ] Lane 5. Apply the no-busy seed and grade it. Save `loading.png` while the request is held. Pass when only `browser:loading` fails.
- [ ] Lane 6. Apply the save-always-on seed and grade it. Save `unavailable.png`. Pass when only `browser:unavailable` fails, and `drive.json` shows Save available while the form is unchanged.
- [ ] Lane 7. Add `// eslint-disable-next-line` above a `<Button disabled>` in the reference and grade it. Save `suppression.txt`. Pass when `workaround:suppression` and `lint:odd-usage` both fail, because `--no-inline-config` ignores the comment.
- [ ] Lane 8. Grade the real E2 Opus run. Save `real-opus.png` and `real-opus.txt`. Pass when the grade finishes, the video plays, and every finding names a file and line, or a button and step.
- [ ] Lane 9. Grade the real E2 second-model run. Save `real-second.png` and `real-second.txt`. Pass when the grade finishes, the video plays, and every finding names a file and line, or a button and step.
- [ ] Lane 10. Kill the grader during the browser phase. Save `crash.txt`. Pass when no `scorecard.json` exists for that run and a rerun of `bun eval grade` writes one.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Seconds to grade one run, from `bun eval grade` start to `scorecard.json` on disk. Trunk has no grader.
- [ ] Probe. Grade the reference and the two real E2 runs three times each.
- [ ] Baseline. Record that trunk has no grader, then time `bunx playwright test e2e/usage.spec.ts --project firefox` at trunk as the nearest Firefox sweep cost.
- [ ] Rule. The median grade is under 10 minutes. A median over 15 minutes fails.

**Review gate.** None. E3 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage recorded as unavailable.
- [ ] Rebased onto E2 after the verdict, patch-id unchanged.
- [ ] The root appends E3 to the stack. The operator lands it.

## Compute holes and the stop rule (E4)

**Depends on.** E3.

**Files.**

- [ ] Create `eval/loop.ts` and `eval/holes.tsv` with the header row `signature`, `status`, `first_run`, `fixed_in`, and `note`.
- [ ] Edit `eval/cli.ts` to add `round`, `status`, and `rerun`.

**Build.**

- [ ] A hole signature is `<check>:<rule>[:<code>]`, with no line number and no app name. `scorecard.json`, `holes.tsv`, `rerun`, and `status` all key on it.
- [ ] `bun eval round --prepare` prepares one run per brief in `eval/briefs/` and per model in `MODELS` in `eval/loop.ts`, at one tarball, and prints their `launch.json` paths. The lead launches them in parallel per `eval/README.md`. `bun eval round --finish` scans, finishes, and grades every run of the round.
- [ ] `status(runs, holes, tarball, grader)` in `eval/loop.ts` is a pure function. Each `RunRecord` stores the grader version, the git SHA of `eval/` minus `eval/holes.tsv`. A round counts only when it has a scorecard for every brief and model at that tarball. A run passes only with zero findings. The stop rule holds when the last three counted rounds at one tarball and one grader version all pass. `bun eval status` prints the rounds, the models, and the new signatures, and exits 0 only when the rule holds. `--record` appends new signatures to `holes.tsv` as `open`.
- [ ] `bun eval rerun <signature>` starts a fresh run for every brief and model whose scorecard holds that signature, at the current tarball. If no rerun shows it, the row becomes `fixed` with the current git SHA.

**You see.**

- [ ] After round 1, `bun eval status` prints `round 1  2/2 runs  FAIL  new: <signatures>` and exits 1.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `tests/eval-loop.test.ts` feeds `status` literal run and hole lists and asserts the exact result. Three passing rounds give stop. Two give no stop. Three passing runs of one model and none of the other give no stop. A round missing one model does not count. A failing run, including one that shows only an `open` hole, resets the count. Runs at an older grader version do not count. Runs at an older tarball do not count. Run `bun test tests/eval-loop.test.ts`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `cursor grok-4.7` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Trunk has no loop, so record that, then run `bun eval selftest` at E3 and at head. Save `selftest-e3-vs-e4.txt`. Pass when both pass with the same rows.
- [ ] Lane 2. Run one round per `eval/README.md`. Save `round-1.txt`. Pass when it launches one thread per model in parallel and writes two scorecards at one tarball SHA.
- [ ] Lane 3. Run `bun eval status` after lane 2. Save `status-1.txt`. Pass when it lists that round's signatures as new and exits 1.
- [ ] Lane 4. Run `bun eval status --record`, then `bun eval status`. Save `status-recorded.txt`. Pass when `holes.tsv` gains one `open` row per new signature and the second call reports no new signatures.
- [ ] Lane 5. Change one line in `docs/usage/button.md`, rebuild, and run `bun eval status`. Save `status-new-tarball.txt`. Pass when it reports zero counted rounds at the new tarball.
- [ ] Lane 6. Run `bun eval rerun <signature>` for one recorded hole with no fix applied. Save `rerun-unfixed.txt`. Pass when the hole stays `open`.
- [ ] Lane 7. Copy three passing reference scorecards per model into a scratch runs index and run `status` against it. Save `status-stop.txt`. Pass when it prints the stop line and exits 0.
- [ ] Lane 8. Delete one model's scorecard from the newest scratch round. Save `status-partial.txt`. Pass when that round no longer counts and `status` exits 1.
- [ ] Lane 9. Run two `bun eval round --prepare` commands at once. Save `round-parallel.txt`. Pass when `runs.jsonl` has every record whole and no run id appears twice.
- [ ] Lane 10. Open one `drive.json` from lane 2 and the matching `drive.webm` at the first finding. Save `finding-frame.png`. Pass when the frame shows the button and step the finding names.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Milliseconds for `bun eval status` on an index of 200 runs. Trunk has no loop.
- [ ] Probe. Generate a 200-run index and run `bun eval status` ten times.
- [ ] Baseline. Record that trunk has no loop and no value.
- [ ] Rule. The median is under 1000 ms. A median over 2000 ms fails.

**Review gate.** None. E4 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage recorded as unavailable.
- [ ] Rebased onto E3 after the verdict, patch-id unchanged.
- [ ] The root appends E4 to the stack. The operator lands it.

## Fix one hole in odd-design (H1, H2, and so on)

Every hole gets one PR in this shape. The first likely hole is already visible in the labs. The shipped `checkRoot` and ESLint plugin report nothing for a raw `<button>`, because `checkUsage` returns early when the class has no `odd-` word (`src/js/usage/check.ts:198`). It becomes H1 only if a run's agent actually ships one.

**Depends on.** E4, the round that recorded the hole, and the H PR below this one.

**Files.**

- [ ] Edit only the odd-design files the fix needs, under `src/`, `docs/usage/`, `tests/`, and `scripts/consumer-smoke.ts`. Never edit `eval/briefs/**`.

**Build.**

- [ ] Change odd-design so the hole's mistake is caught or prevented where an agent meets it. In order of strength, that means a type that cannot compile, then a lint rule, then a runtime check, then a doc fix. Name the code the fix adds or changes.

**You see.**

- [ ] `bun eval rerun <signature>` prints `fixed in <sha>`, and the row in `holes.tsv` reads `fixed`.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Add a fixture for the mistake to the matching test file, such as `tests/usage-check.test.ts`, `tests/eslint-jsx.test.ts`, or `tests/react-button.test.tsx`. Assert the exact message. Run `bun run check` and `bun scripts/consumer-smoke.ts`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `cursor grok-4.7` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Grade the run that found the hole at trunk's tarball and at head's tarball. Save `hole-trunk-vs-head.txt`. Pass when trunk shows the signature and head's checkers now report the mistake to the agent.
- [ ] Lane 2. Run `bun eval rerun <signature>`. Save `rerun.txt`. Pass when no rerun shows the signature.
- [ ] Lane 3. Run `bun eval selftest` at head. Save `selftest.txt`. Pass when every row still passes.
- [ ] Lane 4. Run `bunx playwright test --project firefox`. Save `firefox.png` from the report. Pass when the axe, behavior, and usage sweeps all pass.
- [ ] Lane 5. Run `bunx playwright test --project webkit`. Save `webkit.png`. Pass when every sweep passes.
- [ ] Lane 6. Open the changed Button story in Chrome with `bun .agents/skills/verify-odd-design/scripts/ctl.ts up --run <pr-id>`, then `ctl.ts goto components-button--states`. Save `story-chrome.png`. Pass when the story renders and `ctl.ts axe` reports no violation.
- [ ] Lane 7. Paste the hole's mistake into the consumer-smoke bad fixture and run the smoke. Save `smoke-bad.txt`. Pass when the new message prints with its code and fix.
- [ ] Lane 8. Read the message as the agent would, through `tsc`, ESLint, and the runtime in a fresh template folder. Save `message.txt`. Pass when each layer that should report the mistake prints the same code and fix text.
- [ ] Lane 9. Run the full next round per `eval/README.md`. Save `round.txt`. Pass when the signature is absent from every scorecard.
- [ ] Lane 10. Run the clean reference through `bun eval grade`. Save `reference.png`. Pass when the reference stays clean, which shows the fix rejects no correct use.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Seconds for `bun run check`, and milliseconds for `checkRoot(document)` on the reference app.
- [ ] Probe. Run each five times at trunk and at head, interleaved.
- [ ] Baseline. Record trunk's medians first.
- [ ] Rule. Head is within 20% of trunk on both. A slowdown over 20% fails.

**Review gate.** The operator reviews before the PR enters the stack.

- [ ] Copy lane 1 and lane 6 screenshots into `.verify/eval/review/<pr-id>-review-<slug>.png`.
- [ ] Record a 30 to 60 second video of the fixed behavior from the lane 9 round's `drive.webm`. Save it as `.verify/eval/review/<pr-id>-review.webm`.
- [ ] Post the screenshots and the video in chat for the operator. Stop at stack-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage recorded as unavailable.
- [ ] Rebased onto the PR below after the verdict, patch-id unchanged.
- [ ] The root appends the PR to the stack. The operator lands it.

## Close the program

- [ ] Every box above is checked with its evidence.
- [ ] `bun eval status` exits 0. Save its output as `.verify/eval/done.txt`.
- [ ] `eval/briefs/` and `eval/holes.tsv` are committed. They are the regression set that later components extend.
- [ ] Reply to the operator with the stack root and tip links, a one-line verdict per PR, the hole list with each fix, and anything parked.

## Appendix A. Prototype evidence

Two architect runners built throwaway labs on 2026-10-23. Their records are in `.verify/plan/candidate-a/labs.md` (Claude Opus 5.5) and `.verify/plan/candidate-b/labs.md` (Grok 4.7), with artifacts under `%TEMP%\odd-lab-a\` and `%TEMP%\odd-lab-b\`. Those files are local scratch, not on the branch. A Grok cross-judge spot-checked two or more labs per candidate against their artifacts and confirmed them, with one token-count slip in A-E2.

- **A-E1.** `claude -p --restricted` refused Read and Glob outside the working folder, and the canary never reached the log. `--restricted` also loaded no user skills and no MCP servers.
- **A-E2.** On native Windows, Claude Code printed "Sandbox disabled ... the Windows sandbox is not active on this session". Bash then printed the canary, and `curl https://github.com` returned 200. The token landed in the log word for word, so a token search detects a read.
- **A-E3.** Inside a stock Docker Desktop container, Anthropic's sandbox runtime (`@anthropic-ai/sandbox-runtime`, run on its own as `srt`, not through `claude`) blocked GitHub, allowed `registry.npmjs.org`, failed to read a canary under a denied folder, and refused a write to `/opt`.
- **A-E4.** In Playwright Firefox, against a Vite app on the packed tarball, a held request showed `aria-busy="true"`, and a second click sent no second request. After a 500, busy cleared and the error text showed. Turning off the app's stylesheets changed only the Button that app CSS restyled. The shipped `checkRoot` returned no finding for a raw `<button>`. Firefox wrote a 53 KB video.
- **A-E5.** `--restricted` with `acceptEdits` still let the agent edit `package.json`, `tsconfig.json`, and `eslint.config.js`.
- **B-E1.** With `blockReadsOutsideWorkingDirectories` and a shell, an absolute canary read was blocked, but `jail\..\canary-repo.txt` returned the canary. E1's unit test seeds the same bypass as a shell `type ..\notes.md`.
- **B-E2.** `cursor-agent --sandbox enabled` exited with "Sandbox requires macOS or Linux". With the sandbox off, Cursor printed the canary and the first line of this repo's `package.json`.
- **B-E3.** `checkUsage` returned `[]` for a raw `<button>`, a `role="button"`, and an `odd-button` with an inline style.
- **B-E5.** Playwright timed out clicking an `aria-disabled` button, because its actionability check treats that state as not enabled. `click({ force: true })` worked.

The pivot to T3 threads on 2026-10-24 rests on these observations from this session.

- **T-E1.** Each T3 thread writes a native transcript with every tool call's input path. Claude writes `~/.claude/projects/<slug>/*.jsonl` with `:` and `\` turned into `-`. Cursor writes `~/.cursor/projects/<slug>/agent-transcripts/<id>/<id>.jsonl`, and its records hold `"type":"tool_use","name":"Read","input":{"path":...}`.
- **T-E2.** T3 adds its orchestration instructions to the first message of every Cursor thread, so every T3 thread carries the `t3-code` tools, and those tools can read other threads.

These stay unproven until E1 runs.

- **G1.** A T3 thread launched on a new project folder starts with no project memory, because Claude's memory lives under that folder's own slug. E1 lane 7 checks the thread, and E2 lane 9 records what else T3 adds.
- **G2.** A subagent's transcript lands under the same project folder as its parent's. E1 lane 6 settles it.
- **G3.** Cursor threads on a short path reach a settled state that `t3_thread_wait` sees. E1 lane 3 settles it.
- **G4.** The scan sees every outside read. A shell command can read a file without naming its path, as a script does, and no transcript shows that. Appendix C keeps it as a risk.
- **G5.** One run's share of the operator's subscriptions. E2 lanes 2 and 3 record the duration as a stand-in.

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| A Docker container jail with the runtime's own sandbox | It blocks reads instead of detecting them (A-E3), but it needs a new OAuth token and a Cursor API key inside each container. The operator chose no new auth. |
| A no-shell agent on Windows (candidate B) | The jail holds (B-E2), but the agent never sees a `tsc` error, and those errors are how odd-design teaches. The eval would measure a crippled agent. |
| A second Windows user with a deny ACE | It blocks every CLI, but it adds an account, a password, and a second copy of each login, which is the new auth the operator ruled out. |
| A mock that reads a `faults.json` control file (candidate B) | The file sits in the agent's folder and names the measurement. `page.route` forces the same states with nothing for the agent to see. |
| One regex list for every workaround (candidate B) | Its CSS pattern (`candidate-b/sketch.ts:118`) matches any `style=` attribute and any `<style>` tag, so an app with a layout `style` would fail. That is inferred from the pattern, because B-E4 only tested a plain Button. A table row with its own seed fails only the rows it declares. |
| Per-brief Playwright scripts | Each brief adds code, and the grader learns the app. A generic walk plus one line of `probes.json` keeps briefs as data. |
| A template with odd-design's checkers already wired in | It tests whether the agent obeys a setup we did, not whether the package teaches. The grader runs every checker itself anyway. |
| Grading inside the Storybook sweep | The sweep only sees stories. The agent's app would have to become stories first. |

## Appendix C. Risks

- **Detection happens after the fact (decision 2).** An agent that reads the repo has already read it. The scan fails and discards the run, and the next run starts fresh, so a leak never reaches a scorecard. These reads stay invisible to the scan, and E1's swarm proved each one: a script that names no path, a file read through an encoding such as base64, and a URL assembled from string pieces at run time. Each needs an agent working to hide a read, not one cutting a corner (G4).
- **The literal outside-path rule may fail runs for harmless reads (decision 3).** Those land in `holes.tsv` as `harness`, never as odd-design holes. If they block three clean rounds, the operator decides whether to allow the image's system paths.
- **Button discovery is partly a heuristic.** The walker finds the real button elements and roles by selector. For anything else, it treats `cursor: pointer` plus a tab stop or a handler as button-like, and no lab has run that rule on an unseen app yet. Seeds pin the cases that matter, a `div` with `onClick` and a styled `span`. A new escape becomes a new seed, per the round reviewer box.
- **The repo's own tooling must ignore the seeds and the template.** `eslint.config.js` lints every `.tsx` with `odd/usage`, and the seeds are wrong on purpose. E1 adds the ignores. `bun run check` proves them.
- **Usage grows with rounds.** Three clean rounds on two models is six runs at the final tarball, plus every round before it, all on the operator's subscriptions with no spend cap (decision 6).
- **The installed package ships source on purpose.** The tarball holds `src/css/`, `src/js/`, and `docs/usage/`, and the agent may read them in `node_modules/odd-design`. The owner's rule isolates the agent from the repo, the harness, and other runs, not from the package as shipped.
- **The repo is public.** The grader and this plan are visible on GitHub. Nothing blocks the web, so the scan fails any run that fetches the repo (decision 4).
- **No control skill is installed.** `control-cli` and `control-ui` from `cursor-team-kit` are missing here. Lanes drive the CLI through `bun eval` and the browser through Playwright Firefox, with text transcripts an agent can assert on.

## Appendix D. Links and reading list

- The settings brief, byte for byte as the agent receives it, is in `.verify/plan/brief-settings.md` until E2 moves it to `eval/briefs/settings/prompt.md`.

```
Build the settings screen for our team workspace app. Use odd-design for the UI. It's already installed.

The backend is the mock server in this project. Start it with `bun run api`. `API.md` describes it. The screen loads the current settings from the server and saves changes back to it.

People can:
- change their display name and email
- turn email notifications and push notifications on and off
- send themselves a test notification
- sign out of all their other devices

Saving only makes sense once something has changed. The server is sometimes slow and sometimes fails, and people should always know what's going on. When you're done, `bun run dev` should start the app.
```

- `.verify/plan/how.md` traces how odd-design ships and what each checker can and cannot see.
- `.verify/plan/candidate-a/design.md` and `sketch/` hold the base design. `.verify/plan/candidate-b/` holds the other candidate.
- `.verify/plan/rubric.md` is the rubric the cross-judge scored against. Candidate A saw it by accident, and the judge discounted for that.
- `.verify/plan/decisions.tsv` is the decision trail, per the show-me-your-work skill.
- E1 and E3 owners read the how skill first. Every H PR runs the interrogate skill on its fix before review.
