# React Avatar plan

`odd-design/react` gains `Avatar`, which renders `span.odd-avatar`, and `AvatarGroup`, which renders `div.odd-avatar-group`. `size` sets `data-size`. Six new codes, ODD-AVATAR-001 to 006, cover the Avatar mistakes one node can show. TypeScript, ESLint, and the runtime checker report them from the same `USAGE` rules. The Avatar story moves into the mirror and keeps its id, `components-data-display--avatar`, so the React Storybook shows it built from the real parts.

The work ships as one PR on `feat/react-avatar`, based on `936bb26` (Alert, PR #25). It is built as three commits after this plan, and each commit ends in a check. Nothing merges or deploys.

Caleb granted overnight autonomy for this run. The build starts after this plan is committed and uses the default in each decision below. The run stops when the PR is open and its checks report.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, and verifies.

The design came from two architect runners and a cross-judge. Both runners built and tested their design in a scratch worktree. The records are local scratch in the gitignored `.verify/plan/` folder of this worktree (Appendix C).

## Usage

```tsx
import { Avatar, AvatarGroup, type AvatarSize } from "odd-design/react";

<Avatar size="lg">
	<img src={kai.photo} alt="Kai Nakamura" />
</Avatar>;
<Avatar role="img" aria-label="Ana Rojas">AR</Avatar>;
<p>
	<Avatar aria-hidden="true">MO</Avatar> Mira Okafor
</p>;

<AvatarGroup role="group" aria-label="Collaborators">
	{people.map((person) => <PersonAvatar key={person.id} person={person} />)}
</AvatarGroup>;

function PersonAvatar({ person }: { person: Person }) {
	const [failed, setFailed] = useState(false);
	if (person.photo === undefined || failed) {
		return <Avatar role="img" aria-label={person.name}>{person.initials}</Avatar>;
	}
	return (
		<Avatar>
			<img src={person.photo} alt={person.name} onError={() => setFailed(true)} />
		</Avatar>
	);
}
```

| Part | Element | Props from the contract |
| --- | --- | --- |
| `Avatar` | `span.odd-avatar` | `size?: AvatarSize`. `role?: "img"`. `role="img"` with no `aria-label` or `aria-labelledby` is typed as the `ODD-AVATAR-004` message. `data-initials` is `never` |
| `AvatarGroup` | `div.odd-avatar-group` | `role: "group"`, required. No name is typed as the `ODD-AVATAR-004` message. A system `data-*` is typed as the `ODD-AVATAR-006` message |

`AvatarSize` is `"sm" | "lg"`. Leaving `size` out is the default size. The caller writes the `img` or the initials as children. Neither part has `"use client"`. The image fallback in React is app code with `onError`, shown in `docs/usage/react.md`.

## Contract

Each rule comes from `avatar.css`, the Avatar story, or a mistake an agent makes by copying the nearest example.

| Code | Group | Kind | Fails when | Source | TypeScript |
| --- | --- | --- | --- | --- | --- |
| `ODD-AVATAR-001` | `avatar`, `avatarGroup` | `element` | `odd-avatar` is not on a `span`, or `odd-avatar-group` is not on a `div` | The `avatar.css` header, the README, and every story. An avatar sits inline beside text | Not a type error. `part` renders the tag |
| `ODD-AVATAR-002` | `avatar` | `enum`, omit `md` and `medium` | `data-size` is not `sm` or `lg` | `avatar.css:32-33` styles two sizes. The default has no attribute. Button's size axis uses the same omit tokens | `size` is `AvatarSize` |
| `ODD-AVATAR-003` | `avatar`, `avatarGroup` | `enum` on `role`, plus `required-attribute` on the group | the avatar has a `role` other than `img`, or the group has no `role` or another one | `avatar.css:3`, `:7` | The avatar's `role` is `"img"`. The group's `role` is a required `"group"` |
| `ODD-AVATAR-004` | `avatar`, `avatarGroup` | `accessible-name` keyed on `role` | a `role="img"` avatar or a `role="group"` group has no non-empty `aria-label` or `aria-labelledby` | `avatar.css:3`, `:7` | The props type becomes the 004 message when the role is set and both names are absent |
| `ODD-AVATAR-005` | `avatar` | `system-data` | the avatar has another component's `data-*`, or a near miss such as `data-szie` | `VOCABULARY.avatar` is `data-size` only | Each foreign system name is typed as the 005 message |
| `ODD-AVATAR-006` | `avatarGroup` | `system-data` | the group has a system `data-*`, such as `data-size` | The size selectors are on `.odd-avatar`, not the group | Each system name is typed as the 006 message, which says size goes on each avatar |

The group has its own group of rules, as `alertTitle` does. In one group it would inherit the avatar's size and role rules.

Not added:

- A rule that bare initials need `role="img"` or `aria-hidden`, or that an `img` child has `alt`. It needs a rule kind that reads children. Appendix D records it.
- A typed `initials` prop. `data-initials` is read by script, not CSS, and `avatarFallback` breaks React (decision 4).
- A React image fallback part. It needs state, `"use client"`, and a post-error tree the static mirror cannot show.

## Shape

`WRAPPERS.Avatar` is `{ className: "odd-avatar", props: { size: "data-size" }, element: "span" }`. `WRAPPERS.AvatarGroup` is `{ className: "odd-avatar-group", props: {}, element: "div" }`. `src/react/avatar.tsx` is the README recipe twice, with a name check derived from the `accessible-name` rule, the way Button's `NamedWhenIconOnly` is.

```tsx
export type AvatarSize = Values<AvatarRule, "data-size">;
interface AvatarContract extends Contract<"Avatar", AvatarRule> {
	role?: Values<AvatarRule, "role">;
	"data-initials"?: never;
}
type NamedWhenRole<P, Rule> = P extends { role: Values<Rule, "role"> } & Unnamed<Rule> ? Message<"ODD-AVATAR-004"> : P;
export const Avatar: <const P extends AvatarProps>(props: NamedWhenRole<P, AvatarRule> & AvatarProps) => ReactElement = part("Avatar");
export const AvatarGroup: <const P extends AvatarGroupProps>(props: NamedWhenRole<P, AvatarGroupRule> & AvatarGroupProps) => ReactElement = part("AvatarGroup");
```

`part.ts`, `jsx.ts`, `html.ts`, `dom.ts`, `mirror.ts`, and `mirror-react.ts` do not change. One line in `check.ts` changes. `isSet` also accepts an `enum` rule's values, so `accessible-name` keyed on `role` fires when the role holds a value the contract accepts. No existing `accessible-name` or `icon-only-text` rule keys on an attribute with an `enum`, so no other part's result changes.

## Decisions taken under the autonomy grant

Each item is the default the build uses. Each one can be reversed after review.

1. **Two parts.** `avatar.css` styles two classes. The caller writes the `img` or the initials, because `part` renders one element and the mirror compares one element per part.
2. **A one-line `isSet` change instead of a new rule kind.** The name rule runs in all three checkers and reuses `accessible-name`. A `boolean-attribute` rule on `role` would need no engine change but would call a role a boolean flag.
3. **Bare initials stay unchecked.** The Grok runner built a `presented-name` kind that reads the `img` child and its `alt`, and the cross-judge recommended it. It is the smaller-and-safer default to defer it, as the Alert port deferred its structure rule. It is a follow-up with the evidence.
4. **`data-initials` is `never` on `Avatar`.** `avatarFallback` replaces an avatar's children. On its next render of them React throws `NotFoundError` from `removeChild` and unmounts the root (measured in happy-dom). `avatarFallback` stays for markup a page owns.
5. **The broken image moves to a new HTML-only story.** `AvatarFallback` (`components-data-display--avatar-fallback`) keeps the `#broken-avatar` demo and its behavior test. The mirrored Avatar story keeps every other avatar. The id `components-data-display--avatar` does not change.
6. **`role="group"` is a required prop.** Switch requires `role="switch"` the same way. A row cannot pin an attribute it renders itself without a `part.ts` change.
7. **Accept a new HTML Storybook sidebar order in Data Display.** The mirrored file loads later, so Avatar sorts after Separator. The Badge, Choice, and Alert ports made the same trade.

## Capture the baseline (no source change)

- [x] Build both Storybooks from `936bb26` with `bun scripts/storybooks.ts .verify/avatar/base-sb`, serve the build, and capture the HTML section with `bun scripts/capture-stories.ts <url>/html .verify/avatar/base.json .verify/avatar/base-shots`. The evidence is `base.json`, with 84 captures.
- [x] Save `bunx tsc -p tests/fixtures/types/fail --noErrorTruncation` to `.verify/plan/fail-before.txt`.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check.

### Commit 1. Add Avatar and AvatarGroup and check them with ODD-AVATAR-001 to 006

- [ ] Add `USAGE.avatar`, `USAGE.avatarGroup`, `AvatarRule`, `AvatarGroupRule`, both `WRAPPERS` rows, the six codes in `USAGE_CODES`, and their `MESSAGES`. Widen `isSet` to `enum` rules.
- [ ] Write `docs/usage/avatar.md` with one section per code.
- [ ] Create `src/react/avatar.tsx`. Add the barrel export and the `WrapperProps` lines.
- [ ] Add the `odd-avatar-001` to `006` bad and good HTML pairs, six `RUNTIME_CODES` lines, and the `places` rows in `tests/eslint-html.test.ts`. Move `odd-avatar` in `odd-class-001.good.html` onto a `span`.
- [ ] Add a pinned full-message test for `data-size="md"` in `tests/usage-check.test.ts`, as Alert pins its 002 text.
- [ ] Add `data-size` for Avatar to the CSS-sync list in `tests/usage-contract.test.ts`.
- [ ] Add type fail fixtures for `size`, `role`, an unnamed `role="img"` avatar, an unnamed group, a group with no `role`, `data-tone` on `Avatar`, `data-size` on `AvatarGroup`, and `data-initials`, each with its `failures` entry. Add `pass.tsx` lines for the `PersonAvatar` and group call sites.
- [ ] Add `tests/fixtures/usage/jsx/avatar.tsx` and its `places` entry. Add one markup row to `tests/react.test.tsx`.
- [ ] Check. Revert the `isSet` line, and the 004 fixtures fail. Delete the group's `required-attribute` rule, and the group-role type fixture and the 003 fixture fail. Drop `medium` from the omit list, and the pinned message test fails.

### Commit 2. Mirror Avatar in the Storybooks

- [ ] Create `stories/mirrored/Avatar.stories.ts` with `title: "Components/Data Display"` and the export `Avatar`. The scene is the HTML story minus the broken image. The `photo` helper moves with it. The meta component description carries the story text.
- [ ] Replace the `Avatar` export in `stories/DataDisplay.stories.ts` with an HTML-only `AvatarFallback` story that holds `#broken-avatar`. Point `e2e/behavior.spec.ts` at it. Add the Avatar id to the mirrored-ids pin in `tests/stories.test.ts`.
- [ ] Measure the `aria` literal in the built Firefox Storybook, then paste it.
- [ ] Check. `bunx playwright test e2e/usage.spec.ts --project firefox` passes. Change one label in the `aria` literal and confirm the run fails, then restore it. `bunx playwright test e2e/behavior.spec.ts -g "broken avatar"` passes in Firefox and WebKit.

### Commit 3. Docs, smoke, and the verify recipe

- [ ] In `docs/usage/react.md`, add "Show a person with an avatar" with the image, initials, hidden, group, and `onError` fallback markup, and the type-error rows. Add an Avatar section to `docs/usage/eslint.md`. Fix the Avatar lines in `README.md`.
- [ ] Add `docs/usage/avatar.md` to `REQUIRED` in `scripts/consumer-smoke.ts`. The clean app renders an `AvatarGroup` with a named `Avatar`.
- [ ] Update `.agents/skills/verify-odd-design/features/data-display.md` and `interactive.md` for the React Avatar and the new fallback story id.
- [ ] Add the follow-ups in Appendix D to `docs/follow-ups.md`.
- [ ] Check. `bun run check`, `bun run build`, and `bun scripts/consumer-smoke.ts` pass.

## Verify on the real surface

- [ ] Rebuild both Storybooks, capture the HTML section to `after.json`, and run `bun scripts/capture-stories.ts --diff .verify/avatar/base.json .verify/avatar/after.json`. Pass means `changed` lists only `components-data-display--avatar`, `added` lists only `components-data-display--avatar-fallback`, and nothing else moves.
- [ ] Run `bun run test:browsers`. Pass means the Firefox and WebKit runs pass and the sweep reports 0 diagnostics.
- [ ] Drive the composed build per the verify-odd-design skill. Open `react_components-data-display--avatar` and `components-data-display--avatar` in `calm` light, `holoterminal` dark, and one more palette. Save each screenshot and `ariaSnapshot`, and confirm that the two sides look the same. Remeasure the group's left positions.

## Review and open the PR

- [ ] The `cursor grok-4.7` reviewer reads the diff against this plan. A fresh builder fixes each finding that blocks. Other findings go to `docs/follow-ups.md`.
- [ ] Run `/deslop` and `/no-comments` over the diff.
- [ ] Open the PR ready with `gh pr create --base main --repo Rakvadium/odd-design`. The title is `feat(react): add Avatar and mirror it in the Storybooks`.
- [ ] Run `gh pr checks`. The repo has no workflows, so expect "no checks reported". Report the PR as open. Do not merge.

## Throughput checkpoint

- **Blocking first steps.** The committed plan, then the baseline capture. Commit 2 needs commit 1's parts. Commit 3 needs both.
- **Independent workstreams.** None worth splitting. The tests, fixtures, stories, and docs all read the `contract.ts` rows.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The `.verify/plan/` candidates are read-only references.
- **Smallest safe decomposition.** One builder, one commit at a time, each checked before the next. The base candidate's lab is already a full patch, so a split would only add merges.

## Appendix A. Design choices

| Fork | Chosen | Why |
| --- | --- | --- |
| Parts | `Avatar` and `AvatarGroup` | `avatar.css` styles two classes. |
| Groups | `avatar` and `avatarGroup` | A shared group leaks size and role rules onto the group. |
| Codes | Six, with 001, 003, and 004 shared by both classes | One code per mistake, as `ODD-ALERT-001` is shared. |
| Size | `sm`, `lg`, omit `md` and `medium` | `avatar.css` has two size selectors, and Button's size axis matches. |
| Name | `accessible-name` on `role`, with a one-line `isSet` change | It runs in all three checkers with no new kind. |
| `data-initials` | `never` on `Avatar` | `avatarFallback` crashes React's next render. |
| Mirror | Every avatar but the broken image | The fallback mutates DOM, so its post-error state is not a stable pair. |
| `AvatarSize` export | Yes | A caller that maps density to a size needs the type. It follows `BadgeTone` and `AlertTone`. |

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| A `presented-name` rule kind that reads the `img` child, `aria-hidden`, and the role (Grok runner) | It adds a child-reading kind to `check.ts`, it is not a type error, and the Alert port deferred the same shape of rule. |
| `"data-initials"?: string` with `avatarFallback` in React apps (Grok runner) | React throws on its next render of the replaced children. |
| A `GroupName` union for the group name (Grok runner) | It repeats the rule's name list and makes both names a type error while the runtime accepts them. |
| A `boolean-attribute` rule on `role` | It needs no engine change but names a role a boolean flag, and the group would report a wrong role twice. |
| A composite `<Avatar src alt initials>` | `part` and the mirror render one element per part, and the JSX lowering could not see the rendered children. |

## Appendix C. Evidence and reading list

These files are local scratch under the gitignored `.verify/plan/` folder of this worktree. They are not on the branch.

- `how.md` explains the contract, the wrappers, the checkers, and the mirror, and lists 21 open forks.
- `task.md` and `rubric.md` are the arena's task and scoring rubric.
- `candidate-opus/` is the base. Its lab passed `bun run check` with 453 tests, the Firefox pair sweep 3 of 3 with 56 stories and 0 diagnostics, the broken-avatar behavior test in Firefox and WebKit, `bun run build`, and consumer smoke.
- `candidate-grok/` is the other design. Its lab passed `bun run check` with 458 tests and the Firefox pair sweep.
- `judge.md` holds the cross-judge's scores and pick. `synthesis.md` records the base, the grafts, and the rejections.
- `decisions.tsv` is the decision trail.

## Appendix D. Risks and follow-ups

- **Bare initials pass every checker.** `<Avatar>AR</Avatar>` is read as the letters A R with no name. An `img` with no `alt` is not checked either. Both need a rule kind that reads children. axe reports the missing `alt`.
- **React has no image fallback part.** A React app writes its own `onError` fallback. The React crash after `avatarFallback` was measured in happy-dom. That browsers throw the same error is inferred from the DOM standard.
- **A computed `size` warns.** `<Avatar size={sizeOf[density]}>` raises `ODD-STATIC-001`, the same as Badge and Alert. This is the existing cross-part follow-up.
