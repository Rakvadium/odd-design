# React Card plan

`odd-design/react` gains `Card`, `CardLink`, and `CardFooter`. `Card` renders `article.odd-card` and maps one prop, `interactive`, to `data-interactive`. `CardLink` renders `a.odd-card-link` and needs an `href`. `CardFooter` renders `div.odd-card-footer`. The title stays a class, `odd-card-title`, on the heading the caller picks. Seven codes, ODD-CARD-001 to 007, cover the card mistakes. TypeScript, ESLint, and the runtime checker report them from the same `USAGE` rules. The Card story moves into the mirror and keeps its id, `components-surfaces--card`, so the React Storybook shows it built from the real parts.

The work ships as one PR on `feat/react-card`, based on `25296cb` (Skeleton, PR #28). It is built as three commits after this plan, and each commit ends in a check. Nothing merges or deploys.

Caleb granted overnight autonomy for this run. The build starts after this plan is committed and uses the default in each decision below. The run stops when the PR is open and its checks report.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, and verifies.

The design came from two architect runners and a cross-judge. The Opus runner applied its design to a scratch copy of `25296cb` and measured it in Firefox and WebKit. The Grok runner probed the types and the aria tree. The records are local scratch in the gitignored `.verify/card/` folder of this worktree (Appendix C).

## Usage

```tsx
import { Badge, Card, CardFooter, CardLink } from "odd-design/react";

<Card interactive>
  <p className="odd-eyebrow">Interactive</p>
  <h3 className="odd-card-title">
    <CardLink href={deck.href}>{deck.name}</CardLink>
  </h3>
  <p className="odd-muted">{deck.blurb}</p>
  <CardFooter>
    <Badge tone="warning">Rotating soon</Badge>
  </CardFooter>
</Card>;
```

| Part | Element | Props from the contract |
| --- | --- | --- |
| `Card` | `article.odd-card` | `interactive?: boolean`, mapped to `data-interactive`. A raw `data-interactive` is `never`. `onClick` and `tabIndex` are typed as the 004 message. A foreign system `data-*` is typed as the 006 message. `data-span` stays legal |
| `CardLink` | `a.odd-card-link` | `href: string`, required |
| `CardFooter` | `div.odd-card-footer` | A foreign system `data-*` is typed as the 007 message |
| (no part) | `odd-card-title` on the caller's `h1` to `h6` | none |

Raw markup keeps every tag it uses today. A named panel is `<section class="odd-card" aria-labelledby>`, a plain box is `<div class="odd-card">`, and a card that runs an action holds `<button class="odd-card-link" type="button">`. The element rules check all of them. No part has `"use client"`.

## Contract

Each rule comes from `card.css`, a story, the README row, or a mistake an agent makes by copying the nearest example.

| Code | Group, kind | Fails when | Source | TypeScript |
| --- | --- | --- | --- | --- |
| `ODD-CARD-001` | `element` in `card` (`article`, `section`, `div`), `cardTitle` (`h1` to `h6`), `cardLink` (`a`, `button`), and `cardFooter` (`div`) | A card class is on another tag | The `card.css` header, the README row, and every card in Surfaces, Layout, Showcase, and `shell.css`. `a.odd-card` makes the whole card one control. A title in a `p` drops it from heading navigation | Not a type error. The part renders the tag |
| `ODD-CARD-002` | `card`, `boolean-attribute` on `data-interactive` (`""`, `true`) | `data-interactive="false"` | `card.css` reads presence, so `"false"` still stretches the link. Measured in Firefox and WebKit | `interactive?: boolean`. `lower` drops `false` |
| `ODD-CARD-003` | `card`, new kind `stretched-link` | An interactive card does not hold exactly one `a` or `button`, its `.odd-card-link`. Or a static card holds a `.odd-card-link` | `card.css:24-46`. Each failure was measured with `elementFromPoint` in the built Storybook: a plain `a` does not click the card, a footer button under the stretch cannot be clicked, and a card link in a static card has no focus outline in Firefox | Not a type error. Children are `ReactNode` |
| `ODD-CARD-004` | `card`, `forbidden-attribute` on `onClick`, `onclick`, `tabIndex`, `tabindex` | The card itself is made a control | The `card.css` header says screen readers hear one link, not the card's content. `<Card onClick>` is the MUI `CardActionArea` habit, a guess with no eval | Each name is the 004 message |
| `ODD-CARD-005` | `cardLink`, `required-attribute` `a`/`href` | `a.odd-card-link` has no `href` | An anchor with no `href` takes no focus and has no link role. Button's 009 precedent | `href: string`, hand-written |
| `ODD-CARD-006` | `card`, `system-data` with `allow: ["data-span"]` | The card has a foreign system `data-*`, such as `data-tone`, or a near miss such as `data-interactiv` | Both pass every checker today. `data-span` is grid placement from `shell.css` that Layout writes on cards | Each foreign name except `data-span` is the 006 message |
| `ODD-CARD-007` | `system-data` in `cardTitle`, `cardLink`, and `cardFooter` | A sub-part has a system `data-*`, such as `data-interactive` on the link | `data-interactive` belongs on the card. The `alertTitle` precedent | `CardLink` and `CardFooter` type each name as the 007 message |

Not added:

- A `CardTitle` part. Its only correct tag is the heading level the page needs, which only the caller knows. A `level` prop needs a third `WrapperElement` shape read by `part.ts`, `jsx.ts`, and `mirror.ts`.
- A button branch on `CardLink`. A switch row with a computed `href` hides the link from its parent in ESLint (`jsx.ts` `oneNode`), so 003 could not see `<CardLink href={deck.href}>`, the common call. No story uses a button card.
- A check for a card link outside any card, an `<a>` wrapped around a card, or a skipped heading level. No adapter passes a parent. Appendix D records them.

## Shape

`WRAPPERS` gains three rows.

```ts
Card: { source: "odd-design/react", className: "odd-card", props: { interactive: "data-interactive" }, element: "article" },
CardLink: { source: "odd-design/react", className: "odd-card-link", props: {}, element: "a" },
CardFooter: { source: "odd-design/react", className: "odd-card-footer", props: {}, element: "div" },
```

`src/react/card.tsx` is the README recipe three times. `CardLink` adds one line, because `Pinned` types a required attribute from its enum values, and `href` has none, so it comes out `never`.

```tsx
interface CardLinkContract extends Omit<Contract<"CardLink", CardLinkRule>, "href"> {
  href: string;
}
```

Two shared modules change, by a few lines each.

1. `UsageRule` gains `{ kind: "stretched-link"; code; attribute; className; controls }`, and `check.ts` gains its `apply` case. The case runs only when the card's `data-interactive` value is legal or absent, so `"false"` reports 002 alone. It walks the children both adapters already pass. It stops at a nested `odd-card`, so an inner card's link does not count for the outer one. A computed child makes the subtree unknown. Then a missing link stays silent, and a second control or a card link in a static card still fails, because those are certain.
2. The `system-data` kind gains an optional `allow` list. `systemDataFindings` skips those names, and `ForeignData` in `part.ts` excludes them. No other part sets `allow`, so their types do not change. `data-span` does not join the global allowlist, because Badge must still reject it.

`jsx.ts`, `html.ts`, `dom.ts`, `mirror.ts`, and `mirror-react.ts` do not change.

The Skeleton scene changes `{ of: "article", props: { className: "odd-card", … } }` to `{ of: "Card", … }`, because `NativeClass` rejects the native form once `odd-card` has a wrapper. Its HTML output stays byte-identical. `odd-class-001.good.html` moves `odd-card-title` onto an `h3` and `odd-card-link` onto an `a href`. Layout, Showcase, and `shell.css` stay as they are and must pass. Showcase's dead `--gap` on two cards stays, because that story is not mirrored.

The scene is the HTML Card story built from `Card`, `CardLink`, `CardFooter`, `Badge`, and native `p` and `h3`. The `aria` literal was measured in both built Storybooks in Firefox and WebKit, and the commit re-measures it.

```
- article:
  - paragraph: Static
  - heading "Midnight Control" [level=3]
  - paragraph: A slow, grindy list that wins on card advantage.
  - text: Legal 60 cards
- article:
  - paragraph: Interactive
  - heading "Ember Aggro" [level=3]:
    - link "Ember Aggro":
      - /url: "#"
  - paragraph: The whole card is clickable. Screen readers hear a single link.
  - text: Rotating soon
```

## Decisions taken under the autonomy grant

Each item is the default the build uses. Each one can be reversed after review.

1. **Three parts and one ruled class.** The title has no part, so its heading level follows the page. An agent that writes shadcn's `CardTitle` gets "no exported member" and finds the class in the docs and the story.
2. **Each part renders one tag, and its rule allows the tags existing markup uses.** React panels that need a `section` write the raw tag, which ESLint and the runtime checker still check. The Grok runner's `as` and `level` props lost, because `mirror.ts` and `jsx.ts` do not read that shape and would both need changes.
3. **A new rule kind for the stretched link.** It is the card's one behavior, and each failure it catches was measured. Leaving it to follow-ups would check only `"false"` and wrong tags.
4. **`system-data` with an `allow` list on the card.** Every earlier part has `system-data`. This one keeps `data-span` legal on the card without letting Badge accept it.
5. **One code, 007, for the three sub-parts' foreign data.** They have the same fix and no own `data-*` names, so one message fits all three. The builder splits it only if `format.ts` cannot share the message.
6. **Keep 004 although its mistake is a guess.** It is the only check that stops a card from becoming one big control in React. JSX keeps camelCase names, so the camelCase rows match JSX and the lowercase rows match HTML and the DOM.
7. **Accept a new HTML Storybook sidebar order in Surfaces.** The mirrored file loads later, so Card sorts after Dialog and Disclosure. Every earlier port made the same trade.

## Capture the baseline (no source change)

- [ ] Build both Storybooks from `25296cb` with `bun scripts/storybooks.ts .verify/card/base-sb`, serve the build, and capture the HTML section with `bun scripts/capture-stories.ts <url>/html .verify/card/base.json .verify/card/base-shots`.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check.

### Commit 1. Add Card and check it with ODD-CARD-001 to 007

- [ ] Add the `stretched-link` kind and its `apply` case, and the `allow` field on `system-data` with its skip in `systemDataFindings` and `ForeignData`.
- [ ] Add `USAGE.card`, `cardTitle`, `cardLink`, and `cardFooter`, their `Rule` aliases, the three `WRAPPERS` rows, the seven codes in `USAGE_CODES`, and their `MESSAGES`.
- [ ] Write `docs/usage/card.md` with one section per code.
- [ ] Create `src/react/card.tsx`. Add the barrel export and the `WrapperProps` lines.
- [ ] Add the `odd-card-001` to `007` bad and good HTML pairs, the `RUNTIME_CODES` lines, and the `places` rows in `tests/eslint-html.test.ts`. The 003 good fixture holds a static card with footer buttons and a nested card. Fix `odd-class-001.good.html`.
- [ ] Add type fail fixtures for `onClick` on `Card`, a missing `href` on `CardLink`, and `data-tone` on `Card`, each with its `failures` entry. Add `pass.tsx` lines, including `data-span` on `Card`.
- [ ] Add `tests/fixtures/usage/jsx/card.tsx` and its `places` entry. It covers a computed `href`, an opaque child, the 003 failures, and `onClick`. Add one markup row to `tests/react.test.tsx`.
- [ ] Switch the Skeleton scene's card to `of: "Card"`.
- [ ] Check. Delete each rule row after the `element` rows, and the `allow` entry, one at a time, and each fails a test. Layout and Showcase pass lint and `tests/stories.test.ts`.

### Commit 2. Mirror Card in the Storybooks

- [ ] Create `stories/mirrored/Card.stories.ts` with `title: "Components/Surfaces"` and the export `Card`. The meta component description carries the story text.
- [ ] Remove the `Card` export from `stories/Surfaces.stories.ts`. Add the id to the mirrored-ids pin in `tests/stories.test.ts`.
- [ ] Measure the `aria` literal in the built Firefox Storybook, then paste it.
- [ ] Check. `bunx playwright test e2e/usage.spec.ts --project firefox` passes with 0 diagnostics.

### Commit 3. Docs, smoke, and the verify recipe

- [ ] In `docs/usage/react.md`, add a section on a clickable card, the type-error rows, and Card in the "not type errors" paragraph. Add a Card section to `docs/usage/eslint.md`. Update the README row (`article`, `section`, or `div`) and add the parts to the part list.
- [ ] Add `docs/usage/card.md` to `REQUIRED` in `scripts/consumer-smoke.ts`. The clean app renders a `Card`.
- [ ] Update `.agents/skills/verify-odd-design/features/surfaces.md`, which says Card has no React wrapper.
- [ ] Add the follow-ups in Appendix D to `docs/follow-ups.md`.
- [ ] Check. `bun run check`, `bun run build`, and `bun scripts/consumer-smoke.ts` pass.

## Verify on the real surface

- [ ] Rebuild both Storybooks, capture the HTML section to `after.json`, and run `bun scripts/capture-stories.ts --diff .verify/card/base.json .verify/card/after.json`. Pass means `changed` lists only `components-surfaces--card` and `components-feedback--skeleton`, with no `png` or `aria` change, and nothing else moves.
- [ ] Run `bun run test:browsers`. Pass means the Firefox and WebKit runs pass, the sweep reports 0 diagnostics, and axe reports 0 violations.
- [ ] Drive the composed build per the verify-odd-design skill. Open `react_components-surfaces--card` and `components-surfaces--card` in `calm` light, `holoterminal` dark, and one more palette. Save each screenshot and `ariaSnapshot`. Confirm that the two sides look the same, the tree has one link, "Ember Aggro", and a click on the interactive card's body lands on the link.

## Review and open the PR

- [ ] The `cursor grok-4.7` reviewer reads the diff against this plan. A fresh builder fixes each finding that blocks. Other findings go to `docs/follow-ups.md`.
- [ ] Run `/deslop` and `/no-comments` over the diff.
- [ ] Open the PR ready with `gh pr create --base main --repo Rakvadium/odd-design`. The title is `feat(react): add Card and mirror it in the Storybooks`.
- [ ] Run `gh pr checks`. The repo has no workflows, so expect "no checks reported". Report the PR as open. Do not merge.

## Throughput checkpoint

- **Blocking first steps.** The committed plan, then the baseline capture. Commit 2 needs commit 1's parts. Commit 3 needs both.
- **Independent workstreams.** None worth splitting. The tests, fixtures, stories, and docs all read the `contract.ts` rows.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The `.verify/card/` candidates are read-only references.
- **Smallest safe decomposition.** One builder, one commit at a time, each checked before the next. The base candidate's lab is already a full patch for most of commits 1 and 2, so a split would only add merges.

## Appendix A. Design choices

| Fork | Chosen | Why |
| --- | --- | --- |
| Parts | `Card`, `CardLink`, `CardFooter`, and a ruled `odd-card-title` | The title's tag is the page's heading level |
| Card tag | `article`, rule allows `section` and `div` | The stylesheet header, README, and verify recipe name `article`. Layout and Showcase use the others |
| Link tag | `a` through `part()`, rule allows `button` | A switch row hides a computed `href` from 003 in ESLint |
| Click contract | New `stretched-link` kind | The card's one behavior. Three failures measured |
| Nested card and `"false"` | The walk stops at a nested card and skips an illegal value | Graft from Grok. An inner link must not satisfy the outer card, and `"false"` should print one code |
| Foreign data | `system-data` with `allow: ["data-span"]` on the card, and on each sub-part | Graft from Grok. Catches `data-tone` and `data-interactiv` and keeps grid placement |
| Card as a control | 004 on `onClick` and `tabIndex` in both spellings | One code in TypeScript, JSX, HTML, and the DOM |

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| `as` and `level` props, a third `WrapperElement` shape | `mirror.ts` `tagName` and `jsx.ts` `renderings` need changes, and the prop unions repeat the tag lists |
| `Card` switched on `aria-labelledby` to `section` | Naming a card would silently turn it into a region landmark, and a list of named deck cards would flood the landmark list |
| No new kind, the pairing recorded in follow-ups | The port would check only `"false"` and wrong tags, and none of the measured failures |
| A composite `<Card href title>` | ESLint and `toHtml` read only `WRAPPERS`, so a correct composite fails lint and the Storybooks differ |
| `data-span` in the global allowlist | Badge would accept a grid attribute |
| No `system-data` on the card, as `Field` has none | `data-tone` and `data-interactiv` would stay silent |

## Appendix C. Evidence and reading list

These files are local scratch under the gitignored `.verify/card/` folder of this worktree. They are not on the branch.

- `how.md` explains the contract, the wrappers, the checkers, and the mirror for Card, and lists 11 open forks.
- `task.md` and `rubric.md` are the arena's task and scoring rubric.
- `candidate-opus/` is the base. `sketch/lab.patch` is its full diff. `sketch/measure/` holds the Firefox and WebKit `elementFromPoint` and aria measurements.
- `candidate-grok/` is the other design, with its type and aria probes.
- `judge.md` holds the cross-judge's scores, its pick, and the grafts. It noted that the base's saved check log is the 482-test baseline, not the lab run, so commit 1 re-measures.

## Appendix D. Risks and follow-ups

- **Nothing checks a card link outside any card.** No adapter passes a parent. The static-card half of 003 covers a link inside a card that is not interactive.
- **An `<a>` wrapped around a card and a skipped heading level stay unchecked.** Neither shows on the card node.
- **A spread or a computed child silences part of 003.** The missing-link check stays silent when the subtree is opaque.
- **`Pinned` types a required attribute with no enum as `never`.** `CardLink` works around it with one line. A follow-up could type it as `string` in `part.ts`. This PR fixed it, so `Pinned` now falls back to `string`.
- **The runtime observer watches insertions only.** Toggling `interactive` on a mounted card is not rechecked.
- **004 also bans click delegation on the card.** `onClickCapture` still works.
- **Showcase sets `--gap` on cards that do not read it.**
