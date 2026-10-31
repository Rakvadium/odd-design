# Missing cores queue plan

Agents that build on odd-design invent their own chrome when a core is missing: a styled `span` for a keyboard key, a hand-drawn spinner, a breadcrumb made of buttons. This plan adds the six cores AI UI Pain Scout locked for Tier A, in Scout's batch order, so each of those has a core to reach for instead.

| Batch | Cores | Branch | Base |
| --- | --- | --- | --- |
| 1 | Link, Spinner | `feat/missing-cores-queue` | `main` |
| 2 | Combobox | `feat/missing-cores-combobox` | `main` after batch 1 lands |
| 3 | Breadcrumb, Kbd, Code/Pre | `feat/missing-cores-text` | `main` after batch 2 lands |

This plan rides in the batch 1 PR. Each batch is one PR to `main`. A batch branches from `main` only after the batch before it lands, so no branch is ever rebased or force-pushed.

Out of scope, and parked. Demoting Shell, the Appendix A recipe stylesheet, full Button parity, more audits, a raw-value lint, demoting the glass eyebrow, and the leftover hardcoded font weights. No recipes, Pagination, empty state, sidebar or nav, calendar, command palette, tree, carousel, file dropzone, or OTP input. App-specific assemblies stay out of core. Nothing deploys.

## The bar each core meets

Each core matches the Button, Field, and Choice bar the fitness audit scores against (`docs/audits/core-primitives-fitness.md`).

- **Story depth.** A `Playground` whose controls are the contract's values, pinned the way `tests/stories.test.ts` and `e2e/usage.spec.ts` pin Button's. Then one story per axis the core has (`Variants`, `Sizes`, `States`, or `Parts`) and one assembled story in context. A mirrored core is mirrored in both Storybooks.
- **Usage contract.** A `docs/usage/<family>.md` page with one section per code, the `USAGE` rows, and the messages. Every code names a failure a browser shows, measured in Firefox and WebKit beside a good control.
- **Lint coverage.** A bad and a good HTML fixture per code, an ESLint `places` row per finding, a JSX fixture, type fixtures for each code the props reject, a `pass.tsx` block, and a markup row in `tests/react.test.tsx`. A core with behavior adds StrictMode tests beside `enhance(document)` and an e2e behavior test over both Storybooks.
- **Fitness.** A `FAMILIES` row in `scripts/primitive-fitness.ts`, and a rerun that shows no gap for the family.

## How the queue runs

The run follows `odd-mode/playbooks/autopilot-stack.md`, with two changes the operator made. Each batch is a PR to `main`, not a link in a base-branch chain. The lead merges each PR itself once its verdict is clean and its gates pass.

- **Design.** Two architect arenas ran before this plan, one for the five small cores and one for Combobox. Each had a `claudeAgent claude-opus-5-5` runner and a `cursor grok-4.7` runner, and a cross-judge on the other provider. The picks and grafts are in each core's section below. The records are local scratch in the gitignored `.verify/missing-cores/` folder.
- **Build.** One owner per batch on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every diff, opens the PR, and drives it green. The lead plans, reviews, and verifies.
- **Verify.** At the owner's code-ready head, the lead runs a verification swarm on `cursor grok-4.7`, the other provider from the builder. One lane reruns the gates at that SHA. One lane drives the stories live through `.agents/skills/verify-odd-design/` across chromes, palettes, and modes. Two lanes review the diff, one for contract and consumer parity and one for accessibility and behavior. Nothing merges without a clean verdict.
- **Gates.** The repo has no CI, so the gates at the PR head are the merge gate: `bun run check`, `bun run build`, `bun scripts/consumer-smoke.ts`, and `bun run test:browsers`. A known flake gets a line in the PR body with its evidence. It is never ignored.
- **Merge.** Squash-merge after `git merge-tree` against `main` is clean. The next batch branches from the new `main`.

The four throughput questions have one answer for the whole queue. Every batch appends to the same files (`src/js/usage/contract.ts`, `format.ts`, `src/css/index.css`, `src/react/index.ts`, `props.ts`, and the shared test tables), so batches run one at a time. Within a batch, one owner builds the cores in order, three commits per batch, each ending in `bun run check`.

## Batch 1. Link and Spinner

### Link

`<a class="odd-link" href="/guide">setup guide</a>`, and `aria-current="page"` on the link to the page you are on. In React it is `<TextLink href="/guide">`. A link that looks like a button stays `a.odd-button`, and a card link stays `CardLink`.

The bare `a` in `base.css` keeps the resting look. `link.css` holds one rule. The current page takes `--foreground` and drops the underline, so it differs by two cues, not by color. Moving the whole look into the components layer was measured and rejected, because it repaints `odd-skip-link`'s text from `oklch(0.97…)` to `oklch(0.3…)` on its primary fill.

| Code | Kind | Fires when | What breaks (measured) |
| --- | --- | --- | --- |
| ODD-LINK-001 | `element` `a` | the class is on another tag | A `span.odd-link` is plain text in the tree, and Tab skips it. |
| ODD-LINK-002 | `required-attribute` `href` | no `href` | Not a link and not focusable, yet still painted as one. `href=""` passes, the same residual as every required attribute. |
| ODD-LINK-003 | `forbidden-attribute` `aria-disabled`, `disabled` | either is present | Announced `[disabled]`, yet a click and Enter both navigate. |
| ODD-LINK-004 | `forbidden-attribute` `role` | any role | `role="button"` is announced as a button, and Space does nothing. |
| ODD-LINK-005 | `enum` `aria-current` `page` | another value | `aria-current="true"` keeps the resting look. |
| ODD-LINK-006 | `system-data` | a system `data-*` | `data-variant="ghost"` draws nothing. The message points to `odd-button`. |
| ODD-LINK-007 | `name-requires` `rel` on `target` | `target` without `rel` | A link that opens a new tab says nothing about it. The message asks for `rel="noopener"` and words in the link text that say it opens a new tab. Scout's answer to fork 5. |

`TextLink` is a `part()` on `a`. The export is `TextLink`, not `Link`, so it does not collide with router and framework `Link` exports (Scout, fork 4). The class stays `odd-link`. `Pinned` requires `href`, `Forbidden` types 003 and 004, and `aria-current` is hand-typed, as Separator types `role`. The existing JSX fixture `tests/fixtures/usage/jsx/link.tsx` (a router link) is renamed `router-link.tsx`, so the new `link.tsx` can take its name.

Stories, title `Components/Link`. `Playground` takes `label` and `current: "none" | "page"`, with the options read from `USAGE.link` and swept the way Button's are. `States` shows a resting and a current link. `InText` shows links inside a paragraph.

### Spinner

`<span class="odd-spinner" aria-hidden="true"></span>` inside a region with `aria-busy="true"` and the loading words, visible or in `odd-visually-hidden`. In React it is `<Spinner aria-hidden="true" />`. A working button stays `Button aria-busy="true"`.

The spinner is the moving form of Skeleton's idiom. It is decoration, and the region carries the busy state and the words, as `ODD-SKELETON-004` already requires of a skeleton block. `docs/usage/skeleton.md` calls `role="status"` with hidden text "the spinner pattern" today. That line is reworded, so the docs teach one loading idiom.

`button.css` does not change (Scout, fork 8). `spinner.css` owns its own keyframes, its own 700ms turn, its own 2.4s turn under reduced motion, and its own forced-colors fix, matching Button's busy ring by value. Forced colors paints the transparent gap in `CanvasText`, which closes the circle, so the spinner's gap becomes `Canvas`. Button's busy ring keeps that bug until Button parity work unparks, and `docs/follow-ups.md` records both the bug and the two copies of the ring. The spinner sets `cursor: progress`, as the busy button does.

| Code | Kind | Fires when | What breaks (measured) |
| --- | --- | --- | --- |
| ODD-SPINNER-001 | `element` `span` | the class is on another tag | A `div` inside a `p` closes the paragraph, and the rest of the sentence falls out of it. |
| ODD-SPINNER-002 | `required-attribute` and `enum` `aria-hidden="true"`, `icon-only-text`, `forbidden-attribute` `role`, `aria-label`, `aria-labelledby`, `aria-busy` | not hidden, holds text, or is named, given a role, or marked busy | Text inside the ring turns with it. `role="status"` and `role="img"` put the announcement on the decoration, not on the region that is busy. |
| ODD-SPINNER-003 | `system-data` | a system `data-*` | `data-size="lg"` draws the same 1em ring. The message says to size it with the font size. |

`Spinner` is a `part()` on `span`. `Pinned` requires `aria-hidden="true"`, and `children` is typed as the 002 message.

Stories, title `Components/Spinner`. `Playground` takes `label` and the surrounding `size: "sm" | "md" | "xl"`, since the ring follows the font size. `Parts` shows visible words, hidden words, and three font sizes. `States` shows a loading region, a loaded one, and a busy Button beside them, so both rings sit side by side. `States` joins the reduced-motion rerun in `e2e/usage.spec.ts`.

### Both cores

Each core ships a usage page, a fixture pair and `places` rows per code, a JSX fixture, type fixtures, a `pass.tsx` block, markup rows, and a `FAMILIES` row. Each also gets an `e2e/behavior.spec.ts` test over both Storybooks. Link's test pins the current link's color and underline, and Spinner's pins the ring's timing at rest and under reduced motion. Link's tab-order checks run in Firefox only, because this host's WebKit does not tab to links. `Foundations.stories.ts` swaps its prose `<a>` for `odd-link`, since that paragraph is the nearest example an agent copies. Batch 3 swaps its `<code>`.

### Check

`bun run check`, `bun run build`, `bun scripts/consumer-smoke.ts`, and `bun run test:browsers` pass. `bun scripts/primitive-fitness.ts` shows distance 0 for Link and Spinner. The verify skill captures every new story, and the busy Button, under the five chromes in light and dark, with reduced motion and forced colors.

## Batch 2. Combobox

An editable combobox with a list that filters as you type, following the APG's "Editable Combobox With List Autocomplete" with manual selection. `select.odd-select` stays the picker for a closed list, and `odd-search` stays a search landmark.

```html
<div class="odd-field">
  <label class="odd-label" for="city" id="city-label">City</label>
  <div class="odd-combobox">
    <input class="odd-input" id="city" name="city" role="combobox" aria-controls="city-list" aria-expanded="false" aria-autocomplete="list">
    <div class="odd-combobox-list" id="city-list" popover="manual" role="listbox" aria-labelledby="city-label">
      <div class="odd-combobox-option" role="option">Amsterdam</div>
      <div class="odd-combobox-option" role="option" aria-disabled="true">Atlantis</div>
      <div class="odd-combobox-option" role="option">Berlin</div>
    </div>
  </div>
</div>
```

React renders the same elements: `Combobox`, Field's `Input`, `ComboboxList`, and `ComboboxOption`. There is no `options` prop and no `open` prop. The options are children, rendered whenever the app has them.

### Who owns what

| State | Owner | Where it lives |
| --- | --- | --- |
| Which options exist | The app | The list's children. The module reads them on each event and watches them with a `MutationObserver`. |
| The input value | The app | `input.value`. A choice writes the option's text through the native value setter and dispatches `input` (`insertReplacementText`) and `change`, so a controlled React input gets exactly one `onChange` (measured in Firefox, WebKit, and happy-dom). |
| Filtering | The module, or the app with `data-filter="manual"` | `hidden` on each option. The built-in filter matches a prefix, case-insensitively. |
| Open, and the active option | The module's holder | Projected to `aria-expanded`, the popover, `aria-activedescendant`, and `aria-selected`. |

The holder is the record for open and the active option. The React part runs `enhanceCombobox` once, then re-projects the holder's state in a layout effect with no dependency list, as `Table` does. React writes an authored `aria-expanded="false"` again on every controlled render, so the DOM attribute cannot be the record. Under StrictMode and beside `enhance(document)`, the root is wired once, by the refcount pattern of `menu.ts`.

A choice is a `click` on an option. Enter clicks the active option, so one `onClick` covers keyboard and pointer, as in Menu. Async options need no API: render results into the list, and set `data-filter="manual"` when the server filters. Results that arrive while the user wants the list open it, and an empty result closes it.

`roving` is not used, because it moves DOM focus. Here focus stays in the input, so the caret, typing, and IME keep working, and the module walks the shown options itself.

### Keyboard and pointer

ArrowDown and ArrowUp open the list at the first or last option, then move and wrap. Typing filters and opens with nothing active. Enter on an active option chooses it. Enter with nothing active closes the list and lets the form submit. Escape closes the list and keeps the text, and a second Escape reaches a surrounding dialog. Tab closes without choosing. Left, Right, Home, and End belong to the caret and clear the active option. A click on the input opens the list, and a click on an option chooses it without moving focus. Disabled options use `aria-disabled="true"`, ignore clicks, and the arrow keys skip them (Scout, fork 16). Every one of these was measured on a prototype in Firefox and WebKit.

### CSS

`combobox.css` anchors the list under its input at the input's width and flips it above near the viewport bottom. The list joins Menu's surface and motion recipe in `popover.css`. The select's chevron recipe moves to a selector list shared by `.odd-select` and `.odd-combobox::after`, so the gradient is written once. `.odd-combobox-option[hidden]` is `display: none`, so a filtered option leaves the tree whatever its display. The list lives in the top layer, so it escapes `overflow: hidden` on cards and dialogs.

### Contract

The input stays under Field's rules (ODD-FIELD-001 and 003). Three groups keep attribute rules from leaking: the root, the list, and the option. Every kind exists today.

| Code | Kind | Fires when | What breaks (measured) |
| --- | --- | --- | --- |
| ODD-COMBOBOX-001 | `element` `div` on all three | a part on another tag | A `button` option inside a form submits it on click. |
| ODD-COMBOBOX-002 | `required-child` input with `role="combobox"`, and the list | the root lacks either as a direct child | A list outside the root never opens, and CSS cannot anchor it. |
| ODD-COMBOBOX-003 | `role-descendant` | the combobox role is on a non-input, or the input lacks `aria-controls` or `aria-autocomplete="list"` | Without `aria-controls`, ArrowDown opens nothing, and axe says nothing. |
| ODD-COMBOBOX-004 | `required-attribute` and `enum` `popover="manual"` | no popover, or `auto` or `hint` | No popover shows the list in the page flow. `auto` closes it when the input is pressed. |
| ODD-COMBOBOX-005 | `required-attribute` and `enum` `role="listbox"` | no role, or `menu` | axe `aria-required-children` and `aria-required-parent`. |
| ODD-COMBOBOX-006 | `accessible-name` on the list | an unnamed list | The tree reads an unnamed `listbox`, and axe is silent. |
| ODD-COMBOBOX-007 | `enum` `data-filter` `manual`, omit `auto`, and `forbidden-attribute` on the root | a wrong value, or the attribute on the root | On the root it is ignored, and the prefix filter hides the server's matches. |
| ODD-COMBOBOX-008 | `required-attribute` and `enum` `role="option"` | an option without the role | The module finds no options, and the list never opens. |
| ODD-COMBOBOX-009 | `forbidden-attribute` `disabled`, `aria-boolean` `aria-disabled` | `disabled` on an option | A `div` ignores `disabled`. The option can still be chosen and is not announced as unavailable. |
| ODD-COMBOBOX-010 | `forbidden-attribute` `aria-selected` | an authored `aria-selected` | The module owns it and erases it when the list opens, so React's prop and the DOM disagree. |
| ODD-COMBOBOX-011 | `forbidden-attribute` `role` on the root | the ARIA 1.0 wrapper pattern | The tree reads an unnamed combobox around the real one. |
| ODD-COMBOBOX-012 | `system-data` on all three | a system `data-*` | Draws nothing. |

`aria-autocomplete="list"` joins 003's input check, so the markup and the module name one mode. `Combobox` is hand-written and `"use client"`. `ComboboxList` and `ComboboxOption` are `part()`s, with `popover`, `role`, and a name pinned by the contract types.

### Stories and tests

Title `Components/Combobox`. `Playground` takes `label`, `filter: "auto" | "manual"` (from the contract, with `auto` as the omit token), `disabled`, `invalid`, and a disabled option, swept like Button's. `Parts` shows a closed combobox. `States` shows empty, filled, invalid with `odd-error`, and disabled. `Open` opens the list in a `play` function, as Menu's `MenuOpen` does, so the snapshot pins `option "Amsterdam" [selected]`. `Async` loads results after a delay inside a Dialog.

`tests/combobox.test.ts` covers the filter, manual mode, appended options, a removed active option, Enter during IME composition, and refcounting. `tests/react.test.tsx` covers StrictMode beside `enhance(document)`, a controlled `onChange` that fires once, and unmount. `e2e/behavior.spec.ts` loops over both Storybooks in Firefox and WebKit: arrows and Enter, typing and Escape, the pointer, async results and a dialog's Escape, anchoring and flipping, Home on the caret, a disabled input that stays closed, and a repeated choice that dispatches nothing.

`aria-selected` cannot render in a static story, because authors may not write it. `scripts/primitive-fitness.ts` gets a one-line change. An attribute that the family's `forbidden-attribute` rules name counts as forbidden, not unrendered. That also clears the same artifact on Field's `[aria-disabled="true"]`.

### Check

The batch 1 gates, with distance 0 for Combobox. The e2e behavior tests pass in Firefox and WebKit on both Storybooks.

## Batch 3. Breadcrumb, Kbd, and Code/Pre

### Breadcrumb

```html
<nav class="odd-breadcrumb" aria-label="Breadcrumb">
  <ol>
    <li><a class="odd-link" href="/">Home</a></li>
    <li><a class="odd-link" href="/projects">Projects</a></li>
    <li><a class="odd-link" href="/projects/roadmap" aria-current="page">Roadmap</a></li>
  </ol>
</nav>
```

One class. The `ol` and `li` need none. Each crumb is a Link, and the current crumb takes Link's current look. A level with no page of its own is plain text in its `li`. CSS draws the slashes with `content: "/" / ""`, so neither engine's tree reads them, and a long trail wraps.

| Code | Kind | Fires when | What breaks (measured) |
| --- | --- | --- | --- |
| ODD-BREADCRUMB-001 | `element` `nav` | the class is on another tag | No landmark. The tree starts at `list` instead of `navigation "Breadcrumb"`. |
| ODD-BREADCRUMB-002 | `accessible-name` | the nav has no name | A bare `navigation` beside the page's primary nav, with no way to tell them apart. |
| ODD-BREADCRUMB-003 | `required-child` `ol` | no direct `ol` | A `ul` keeps its bullets and loses the slashes, in both engines. |
| ODD-BREADCRUMB-004 | `system-data` | a system `data-*` | Draws nothing. |

`Breadcrumb` is a `part()` on `nav`, with `Named` requiring a name, as Menu does. ODD-BREADCRUMB-003 is ESLint and runtime only.

Stories, title `Components/Breadcrumb`. `Playground` takes `label` and `levels` from 1 to 5. `Parts` shows a three-level trail, a trail with a plain-text level, and a single crumb. `Wrapping` shows five levels in a narrow box. A story assertion checks that each trail's last crumb is its only `aria-current="page"` link, because no rule kind looks that deep.

### Kbd

`<kbd class="odd-kbd">Ctrl</kbd> <kbd class="odd-kbd">K</kbd>`, one per key, with key names rather than glyphs. In React it is `<Kbd>Ctrl</Kbd>`. A menu item's shortcut hint stays `kbd.odd-menu-shortcut`, hidden, with `aria-keyshortcuts` on the item. `menu.css` does not change.

The cap reads the chrome's edge, border width, and radius, capped at `--space-1` so glass's pill radius does not make a capsule. It uses `--font-mono` at 0.8em with `line-height: 1.3`, which keeps a line with keycaps as tall as one without (24.80px against 24.80px in Firefox).

| Code | Kind | Fires when | What breaks (measured) |
| --- | --- | --- | --- |
| ODD-KBD-001 | `element` `kbd` | the class is on another tag | Nothing audible. It places the class, as every family's 001 does, and keeps the HTML meaning that reader modes use. |
| ODD-KBD-002 | `forbidden-attribute` `aria-hidden` | any `aria-hidden` | The keys vanish from the sentence ("Press to search."). This is the likely copy from `odd-menu-shortcut`, and the message points that use there. |
| ODD-KBD-003 | `system-data` | a system `data-*` | `data-size="sm"` computes the same font size. |

`Kbd` is a `part()` on `kbd`.

Stories, title `Components/Kbd`. `Playground` takes `keys` as text. `Parts` shows keys in three sentences. `ShortcutList` shows a `dl` of shortcuts and actions.

### Code/Pre

`<code class="odd-code">--primary</code>` inside a sentence, and `<pre class="odd-pre"><code>…</code></pre>` for a block. Inside a pre, the `code` stays bare. In React they are `<Code>` and `<Pre>`. The family is CODE, in its own `code.css`, so it does not share Typography's vocabulary.

The block matches `odd-log`'s surface (`--background`, `--edge-control`, mono at `--text-sm`, line-height 1.45). Long lines wrap instead of scrolling. A scrolling `pre` fails axe's `scrollable-region-focusable` in both engines, and WebKit leaves it out of the tab order, so a keyboard user could not scroll it. The inline chip gets a border as well as its `--muted` fill, because forced colors drops the fill and the chip would lose its shape. A code element inside a pre loses the chip.

| Code | Kind | Fires when | What breaks (measured) |
| --- | --- | --- | --- |
| ODD-CODE-001 | `element` `code` for `odd-code`, `pre` for `odd-pre` | either class is on another tag | A `span.odd-code` loses the `code` role. A `div.odd-pre` keeps the look but loses the pre meaning. |
| ODD-CODE-002 | `system-data` | a system `data-*` | `data-size` draws nothing. App attributes such as `data-language` pass. |

`Code` and `Pre` are `part()`s.

Stories, title `Components/Code`. `Playground` takes `kind: "inline" | "block"` and the text. `Parts` shows inline code, a block with `code` inside, and plain command output. `LongLines` shows one 100-character line wrapping in a narrow box. `Foundations.stories.ts` swaps its prose `<code>` for `odd-code`.

### All three cores

Each ships the same set as batch 1. The e2e tests pin the slash the tree does not read, the keycap that leaves the line height alone, and the long line that wraps without a scroller.

### Check

The batch 1 gates, with distance 0 for Breadcrumb, Kbd, and Code.

## Forks for Scout

Scout answered every fork on 2026-10-31. Forks 4, 5, 8, 16, and 20 take Scout's answer below. Every other fork keeps its default. Batch 1 builds its three answers into its open PR. Batch 2 builds forks 16 and 20 from the start.

- Fork 4. The Link part is exported as `TextLink`.
- Fork 5. `target` requires `rel` (ODD-LINK-007), and the docs ask for a visible new-tab cue in the link text.
- Fork 8. `button.css` stays as it is until Button parity unparks. The spinner keeps its own copy of the ring.
- Fork 16. The arrow keys skip disabled options.
- Fork 20. An open list with no matching option shows a "No results" row. There is no result-count live region and no Spinner. Batch 2 measures how the row is exposed, since a listbox may only hold options and groups.

| # | Core | Fork | Default (built) | Alternatives |
| --- | --- | --- | --- | --- |
| 1 | Link | How the current page looks | Text color, no underline | Semibold with the underline kept. Button's weight, tint, and underline. |
| 2 | Link | Visual variants | None, one look | Subtle (no underline), muted, or an external-link icon. A link without an underline in text makes axe's `link-in-text-block` ask for review. |
| 3 | Link | Router links | Plain `a` only. A router `Link` with `className="odd-link"` warns `ODD-STATIC-001` | An `asChild` or `component` prop on `Link` |
| 4 | Link | Export name | `Link`, by the class-minus-`odd-` rule | `TextLink`, since `next/link` and router packages also export `Link` |
| 5 | Link | `target="_blank"` | No rule | Require `rel`, or require a visible "opens in a new tab" cue |
| 6 | Spinner | Who announces loading | The region, with `aria-busy` and words. The spinner is hidden | `role="status"` and a name on the spinner. An NVDA run through `sr.ts` would show whether a status inserted with its text is spoken |
| 7 | Spinner | Size and tone | 1em in the text color | `data-size="sm|lg"` or a primary tone |
| 8 | Spinner | Button's busy ring | Shares the keyframes, the timing token, and the forced-colors fix | Leave `button.css` alone and fix its forced-colors gap later, as Button parity work |
| 9 | Breadcrumb | A level with no page | Plain text in its `li` | Every crumb must be a Link |
| 10 | Breadcrumb | Separator | `/` | `›`, or a chevron icon |
| 11 | Breadcrumb | Long trails | Wrap | Collapse the middle into a Menu |
| 12 | Kbd | Key combinations | One `kbd` per key, side by side | Nested `<kbd><kbd>Ctrl</kbd>+<kbd>K</kbd></kbd>`, or glyphs such as ⌘ with labels |
| 13 | Code/Pre | Long lines | Wrap | Scroll, with an optional region: `role="region"` only when set, a region needs a name, `tabindex` alone stays legal |
| 14 | Code/Pre | Extras | None | A copy button, a language label, or syntax colors |
| 15 | Combobox | How the filter matches | Prefix, case-insensitive, as in the APG example | Substring ("york" finds "New York"), or ignore diacritics |
| 16 | Combobox | Disabled options and the arrows | Stay in the arrow order, as Menu's do | The arrows skip them |
| 17 | Combobox | Left, Right, Home, End while open | Move the caret and clear the active option | Move the caret and keep the active option |
| 18 | Combobox | Pointer open | A click on the input opens the list | A separate toggle button (a fourth part), or no pointer open |
| 19 | Combobox | Free text | Any text is a valid value | Restrict the value to an option |
| 20 | Combobox | Feedback | None. A screen-reader user hears nothing when a search finds no match | A result-count live region, a "No results" row, or a Spinner while loading |
| 21 | Combobox | Search with suggestions | Wrap `.odd-combobox` in a plain `<search>`, since ODD-SEARCH-002 needs a direct search input | Let `odd-search` accept a combobox child |
| 22 | Combobox | `aria-selected` in stories | Authors may not write it. The fitness script learns that a forbidden attribute is not an unrendered axis | Allow an authored `aria-selected` as a starting value, which gives the attribute two writers |
