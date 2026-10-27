# React Alert plan

`odd-design/react` gains `Alert`, which renders `div.odd-alert`, and `AlertTitle`, which renders `p.odd-alert-title`. `tone` sets `data-tone`. Five new codes, ODD-ALERT-001 to 005, cover the Alert mistakes one node can show. TypeScript, ESLint, and the runtime checker report them from the same `USAGE` rules. The Alert story moves into the mirror and keeps its id, `components-feedback--alert`, so the React Storybook shows it built from the real parts.

The work ships as one PR on `feat/react-alert`, based on `2326860` (Badge, PR #24). It is built as three commits after this plan, and each commit ends in a check. Nothing merges or deploys.

Caleb granted overnight autonomy for this run. The build starts after this plan is committed and uses the default in each decision below. The run stops when the PR is open and its checks report.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, and verifies.

The design came from two architect runners and a cross-judge. Both runners built and tested their design in a scratch worktree. The records are local scratch in the gitignored `.verify/plan/` folder of this worktree (Appendix C).

## Usage

```tsx
import { Alert, AlertTitle, type AlertTone } from "odd-design/react";

<Alert tone="warning">
	<WarningIcon aria-hidden="true" />
	<div>
		<AlertTitle>Rotation is coming</AlertTitle>
		<p>Three of your decks lose legality on May 1.</p>
	</div>
</Alert>;

const toneOf: Record<SaveState, AlertTone> = { saved: "success", offline: "danger" };
<div role="status">
	{state && (
		<Alert tone={toneOf[state]}>
			<div>
				<AlertTitle>{titles[state]}</AlertTitle>
			</div>
		</Alert>
	)}
</div>;
```

| Part | Element | Props from the contract |
| --- | --- | --- |
| `Alert` | `div.odd-alert` | `tone?: AlertTone`. `role` and `aria-live` are typed as the `ODD-ALERT-003` message |
| `AlertTitle` | `p.odd-alert-title` | none. A system `data-*` is typed as the `ODD-ALERT-005` message |

`AlertTone` is `"info" | "success" | "warning" | "danger"`. Leaving `tone` out is the neutral tint. The caller writes the icon `svg` and one body `div` as children. Neither part has `"use client"`.

## Contract

Each rule comes from `alert.css`, the Alert stories, or a mistake an agent makes by copying the nearest example.

| Code | Group | Kind | Fails when | Source | TypeScript |
| --- | --- | --- | --- | --- | --- |
| `ODD-ALERT-001` | `alert`, `alertTitle` | `element` | `odd-alert` is not on a `div`, or `odd-alert-title` is not on a `p` | The `alert.css` header and every story. The alert holds a body `div`, which a `p` cannot contain | Not a type error. `part` renders the tag |
| `ODD-ALERT-002` | `alert` | `enum`, omit `neutral` | `data-tone` is not `info`, `success`, `warning`, or `danger`. `neutral` says to remove the attribute | `alert.css:26-29` styles four tones and no `neutral`. An agent copying `Badge` writes `tone="neutral"` | `tone` is `AlertTone`, and the error lists the four values |
| `ODD-ALERT-003` | `alert` | `forbidden-attribute` on `role` and on `aria-live` | the alert has `role` or `aria-live` | `alert.css:6-8`. A static alert needs no role. A later one goes into a `role="status"` or `role="alert"` container that is already on the page | Each attribute is typed as the 003 message |
| `ODD-ALERT-004` | `alert` | `system-data` | the alert has another component's `data-*`, such as `data-variant`, or a near miss such as `data-tnoe` | `VOCABULARY.alert` is `data-tone` only | Each foreign system name is typed as the 004 message |
| `ODD-ALERT-005` | `alertTitle` | `system-data` | the title has a system `data-*`, such as `data-tone` | The tone selectors are `.odd-alert[data-tone]`, not the title | Each system name is typed as the 005 message, which says the tone goes on the alert |

The title has its own group, as `fieldError` does. In one group it would inherit the alert's tone, role, and system-data rules, and the 004 message would call `data-tone` a title attribute.

Not added:

- A rule that the alert holds one `svg` and one body. It needs a new rule kind. Appendix D records the measured layout break.
- A check that the live-region container existed before the alert. No rule reads ancestors or insertion time.
- A heading as a title element. The CSS header and every story use `p`.
- `neutral` as a value. `alert.css` styles no neutral tone, and the CSS-sync test compares `values` with the selectors.

## Shape

`WRAPPERS.Alert` is `{ className: "odd-alert", props: { tone: "data-tone" }, element: "div" }`. `WRAPPERS.AlertTitle` is `{ className: "odd-alert-title", props: {}, element: "p" }`. `src/react/alert.tsx` is the README recipe twice plus one alias.

```tsx
export type AlertTone = Values<AlertRule, "data-tone">;
interface AlertContract extends Contract<"Alert", AlertRule> {}
export interface AlertProps extends AlertContract, Native<"Alert", keyof AlertContract> {}
export const Alert: (props: AlertProps) => ReactElement = part("Alert");
interface AlertTitleContract extends Contract<"AlertTitle", AlertTitleRule> {}
export interface AlertTitleProps extends AlertTitleContract, Native<"AlertTitle", keyof AlertTitleContract> {}
export const AlertTitle: (props: AlertTitleProps) => ReactElement = part("AlertTitle");
```

`part.ts`, `check.ts`, `jsx.ts`, `html.ts`, `mirror.ts`, and `mirror-react.ts` do not change. One shared helper changes. `enumAllowed` in `format.ts` says "means" when a rule has one omit token, so the 002 text reads "neutral means remove the attribute". Button has two omit tokens per rule, so its text is unchanged.

## Decisions taken under the autonomy grant

Each item is the default the build uses. Each one can be reversed after review.

1. **Two parts.** `alert.css` styles two classes. The caller writes the icon and the body `div`, because `part` renders one element and the mirror compares one element per part.
2. **`neutral` is an omit token.** `<Alert tone="neutral">` is a type error, while `<Badge tone="neutral">` is legal. `badge.css` has a neutral selector and `alert.css` does not.
3. **`role` and `aria-live` are forbidden on the alert.** An app that keeps a persistent alert with changing text and `role="status"` needs an `eslint-disable` with a reason.
4. **The title is pinned to `p`.** `README.md` and `tests/fixtures/usage/odd-class-001.good.html` put it on a `div`. Both move to `p`.
5. **No structural rule.** It is a follow-up with a measurement, not a checker change in a port.
6. **Accept a new HTML Storybook sidebar order in Feedback.** Alert moves after Progress, Skeleton, and Log, because the mirrored file loads later. The id does not change. The Badge and Choice ports made the same trade.

## Capture the baseline (no source change)

- [x] Build both Storybooks from `2326860` with `bun scripts/storybooks.ts .verify/alert/base-sb`, serve the build, and capture the HTML section with `bun scripts/capture-stories.ts <url> .verify/alert/base.json .verify/alert/base-shots`. The evidence is `base.json`, with 84 captures.
- [x] Save `bunx tsc -p tests/fixtures/types/fail --noErrorTruncation` to `.verify/plan/fail-before.txt`.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check.

### Commit 1. Add Alert and AlertTitle and check them with ODD-ALERT-001 to 005

- [ ] Add `USAGE.alert`, `USAGE.alertTitle`, `AlertRule`, `AlertTitleRule`, both `WRAPPERS` rows, the five codes in `USAGE_CODES`, and their `MESSAGES`. Make `enumAllowed` say "means" for one omit token.
- [ ] Write `docs/usage/alert.md` with one section per code.
- [ ] Create `src/react/alert.tsx`. Add the barrel export and the `WrapperProps` lines.
- [ ] Add the `odd-alert-001` to `005` bad and good HTML pairs, five `RUNTIME_CODES` lines, and the `places` rows in `tests/eslint-html.test.ts`. Move `odd-alert-title` in `odd-class-001.good.html` onto a `p`.
- [ ] Add `data-tone` for Alert to the CSS-sync list in `tests/usage-contract.test.ts`.
- [ ] Add type fail fixtures for `tone`, `role`, `data-variant` on `Alert`, and `data-tone` on `AlertTitle`, each with its `failures` entry. Add `pass.tsx` lines for the `Record<State, AlertTone>` call site.
- [ ] Add `tests/fixtures/usage/jsx/alert.tsx` and its `places` entry. Add one markup row to `tests/react.test.tsx`.
- [ ] Check. Delete the `aria-live` rule, and the 003 fixture fails. Drop `neutral` from the omit list, and the 002 fixture fails.

### Commit 2. Mirror Alert in the Storybooks

- [ ] Create `stories/mirrored/Alert.stories.ts` with `title: "Components/Feedback"` and the export `Alert`. The scene is the five HTML alerts. The meta component description carries the story text.
- [ ] Delete the `Alert` export from `stories/Feedback.stories.ts`. Add the id to the mirrored-ids pin in `tests/stories.test.ts`.
- [ ] Measure the `aria` literal in the built Firefox Storybook, then paste it.
- [ ] Check. `bunx playwright test e2e/usage.spec.ts --project firefox` passes. Change one label in the `aria` literal and confirm the run fails, then restore it.

### Commit 3. Docs, smoke, and the verify recipe

- [ ] In `docs/usage/react.md`, add "Show a message with an alert" with the icon and body markup, and the type-error rows. Add an Alert section to `docs/usage/eslint.md`. Fix the Alert line in `README.md`.
- [ ] Add `docs/usage/alert.md` to `REQUIRED` in `scripts/consumer-smoke.ts`. The clean app renders an `Alert` with an icon and a body.
- [ ] Add one "React Alert" section to `.agents/skills/verify-odd-design/features/feedback.md`.
- [ ] Add the follow-up in Appendix D to `docs/follow-ups.md`.
- [ ] Check. `bun run check`, `bun run build`, and `bun scripts/consumer-smoke.ts` pass.

## Verify on the real surface

- [ ] Rebuild both Storybooks, capture the HTML section to `after.json`, and run `bun scripts/capture-stories.ts --diff .verify/alert/base.json .verify/alert/after.json`. Pass means `changed` lists at most `components-feedback--alert`, and only in the `dom` field.
- [ ] Run `bun run test:browsers`. Pass means the Firefox and WebKit runs pass and the sweep reports 0 diagnostics.
- [ ] Drive the composed build per the verify-odd-design skill. Open `react_components-feedback--alert` and `components-feedback--alert` in `calm` light, `sorbet` dark, and `holoterminal` dark. Save each screenshot and `ariaSnapshot`, and confirm that the two sides look the same.

## Review and open the PR

- [ ] The `cursor grok-4.7` reviewer reads the diff against this plan. A fresh builder fixes each finding that blocks. Other findings go to `docs/follow-ups.md`.
- [ ] Run `/deslop` and `/no-comments` over the diff.
- [ ] Open the PR ready with `gh pr create --base main --repo Rakvadium/odd-design`. The title is `feat(react): add Alert and mirror it in the Storybooks`.
- [ ] Run `gh pr checks`. The repo has no workflows, so expect "no checks reported". Report the PR as open. Do not merge.

## Throughput checkpoint

- **Blocking first steps.** The committed plan, then the baseline capture. Commit 2 needs commit 1's parts. Commit 3 needs both.
- **Independent workstreams.** None worth splitting. The tests, fixtures, stories, and docs all read the `contract.ts` rows.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The `.verify/plan/` candidates are read-only references.
- **Smallest safe decomposition.** One builder, one commit at a time, each checked before the next. The base candidate's lab is already a full patch, so a split would only add merges.

## Appendix A. Design choices

| Fork | Chosen | Why |
| --- | --- | --- |
| Parts | `Alert` and `AlertTitle` | `alert.css` styles two classes. |
| Groups | `alert` and `alertTitle` | A shared group leaks the alert's rules onto the title. |
| Codes | Five | 001 covers both tags. The title's system data has its own message. |
| `neutral` | Omit token | `alert.css` has no neutral selector. |
| Live region | `role` and `aria-live` forbidden on the alert | That is the part of `alert.css:6-8` one node can show. |
| Structure | Not checked | It needs a new rule kind. |
| `AlertTone` export | Yes | A caller that maps app state to a tone needs the type. It follows `BadgeTone`. |

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| A `one-body` rule kind that counts the alert's element children (Opus runner) | It changes `check.ts`. It is not a type error. It skips text nodes, so it misses `<AlertTitle>` beside bare text. |
| `AlertTitle` with no `USAGE` group (Opus runner) | A `div` title stays legal, and `data-tone` on the title passes. |
| A composite `<Alert icon title>` | `part` and the mirror render one element per part, so `expectSameDom` and the JSX lowering would compare different trees. |
| A live-region part | `alert.css` has no class for it. |

## Appendix C. Evidence and reading list

These files are local scratch under the gitignored `.verify/plan/` folder of this worktree. They are not on the branch.

- `how.md` explains the contract, the wrappers, the checkers, and the mirror, and lists 17 open forks.
- `task.md` and `rubric.md` are the arena's task and scoring rubric.
- `candidate-grok/` is the base. Its lab passed `bun run check` with 436 tests and the Firefox pair sweep with 54 stories and 0 diagnostics.
- `candidate-opus/` is the other design. Its lab passed `bun run check` with 435 tests, the Firefox pair sweep, `bun run build`, and consumer smoke.
- `judge.md` holds the cross-judge's scores and pick. `synthesis.md` records the base, the grafts, and the rejections.
- `decisions.tsv` is the decision trail.

## Appendix D. Risks and follow-ups

- **Flat children break the layout.** `.odd-alert` is a flex row, and every direct child other than `svg` becomes a column. `<AlertTitle>` followed by bare text renders the text beside the title. `.verify/alert/probe/layout.ts` measured it in Firefox: the text starts at x=145 beside a title at x=8, and with a body `div` the text sits below the title. No checker reports it. The docs and the stories show the body `div`.
- **A computed `tone` warns.** `<Alert tone={toneOf[state]}>` raises `ODD-STATIC-001`, the same as Badge. This is the existing cross-part follow-up.
- **A persistent status alert needs a disable.** See decision 3.
