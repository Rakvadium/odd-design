# React Toast plan

`odd-design/react` gains one part, `Toaster`. It renders `section.odd-toaster` with `popover="manual"` and an `aria-label`, and runs `enhanceToaster` on itself, as `Tabs` runs `enhanceTabs`. One function, `toast(options)` from `odd-design/enhance`, shows a toast on the page's wired toaster from any code. `createToaster` is replaced by that pair, so HTML pages write the same `section` and `enhance()` wires it. Four codes, ODD-TOAST-001 to 004, cover the region mistakes a caller can write. TypeScript, ESLint, and the runtime checker report them from the same `USAGE` rules. The Toast story moves into the mirror and keeps its id, `components-interactive--toast`, so the React Storybook shows it built from `Button` and `Toaster`.

The work ships as one PR on `feat/react-toast`, based on `0257d8d` (Slider and Meter, PR #33). It is built as four commits after this plan, and each commit ends in a check. Nothing merges or deploys.

Caleb granted overnight autonomy for this run. The build starts after this plan is committed and uses the default in each decision below. The run stops when the PR is open and its checks report.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

The run follows `odd-mode/playbooks/feature.md`. One builder on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high) writes every commit. A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, and verifies.

The design came from two architect runners and a cross-judge. The Opus runner proposed one self-wiring `Toaster` part over a written region, a page-wide `toast()`, and a stand-in region for modals. The Grok runner kept `createToaster` as the owner, mounted it from a `Toaster` component with `useToaster`, and added five element parts with five codes. The `cursor grok-4.7` judge picked the Opus design as the base, 25 to 18, and named one graft from the Grok design that this plan takes. The records are local scratch in the gitignored `.verify/toast/` folder of this worktree (Appendix C).

## Usage

```html
<section class="odd-toaster" popover="manual" aria-label="Notifications"></section>
<script type="module">
  import { enhance, toast } from "odd-design/enhance";
  enhance();
  save.addEventListener("click", () => toast({ title: "Deck saved", tone: "success" }));
</script>
```

```tsx
import { Button, Toaster } from "odd-design/react";
import { toast } from "odd-design/enhance";

<body>
  {children}
  <Toaster popover="manual" aria-label="Notifications" />
</body>;

<Button onClick={() => toast({ title: "Deck saved", description: "Midnight Control, version 15.", tone: "success" })}>Save</Button>;
```

`toast()` takes today's `ToastOptions` and returns `{ dismiss }`. It shows the toast on the newest wired region still in the document, and throws when there is none. HTML and React callers run the same code, so both get the one-sentence live line, the pause on hover and focus, the cap of three, the focus handoff, and the modal rehome.

| Part | Element | Props from the contract |
| --- | --- | --- |
| `Toaster` | `section.odd-toaster` | `popover: "manual"` and `aria-label: string` are required. A system `data-*`, such as `data-tone`, is typed as the 004 message. `children?: never`, because `enhanceToaster` builds the list and the live region inside |
| (no part) | `li.odd-toast` and its body, title, description, and buttons | Built by `toast()`. No caller writes them |

`toast.tsx` starts with `"use client"`. It is the third client file after `button.tsx` and `tabs.tsx`.

## Contract

Each failure below was measured in Firefox and WebKit on the baseline build (`.verify/toast/candidate-opus/probes/region.out.json`).

| Code | Group, kind | Fails when | What breaks | TypeScript |
| --- | --- | --- | --- | --- |
| `ODD-TOAST-001` | `toaster`, `element` on `section` | `odd-toaster` is on another tag | A `div` with `aria-label` is no landmark. An `aside` becomes `complementary`, the wrong landmark. The rule also makes the group live | Not a type error. The part renders the tag |
| `ODD-TOAST-002` | `toaster`, `required-attribute popover` and `enum popover ["manual"]` | `popover` is missing, or is `""`, `auto`, or `hint` | With none, `showPopover()` throws `NotSupportedError`. With `""`, `auto`, or `hint`, any outside click closes the region and every toast in it, and so does opening a menu | Yes. `Pinned` makes `popover: "manual"` required |
| `ODD-TOAST-003` | `toaster`, `required-attribute aria-label` | The region has no `aria-label` | The section is no landmark, so a screen reader cannot jump to "Notifications" | Yes. `Pinned` makes `aria-label` required |
| `ODD-TOAST-004` | `toaster`, `system-data` | A system `data-*` is on the region | `data-tone="success"` on the region leaves each toast's dot muted. `toast.css` reads tone on `.odd-toast` only | Yes, from `ForeignData` |

Not added:

- **Codes for `li.odd-toast` and its children.** Only `toast()` writes them. `tests/usage-dom.test.ts` already pins zero diagnostics for the built toast.
- **A code for children inside the region.** After wiring, the region holds the list and the live region, so a runtime rule would fire on correct pages. TypeScript has `children?: never`.
- **A code for two toasters on one page.** No rule reads the document. `toast()` uses the newest.
- **`aria-labelledby` as the name.** The region has no caller child to point at.

## Shape

### Rows

```ts
toaster: [
  { kind: "element", code: "ODD-TOAST-001", className: "odd-toaster", elements: ["section"] },
  { kind: "required-attribute", code: "ODD-TOAST-002", element: "section", attribute: "popover" },
  { kind: "enum", code: "ODD-TOAST-002", attribute: "popover", values: ["manual"], omit: [] },
  { kind: "required-attribute", code: "ODD-TOAST-003", element: "section", attribute: "aria-label" },
  { kind: "system-data", code: "ODD-TOAST-004" },
],

Toaster: { source: "odd-design/react", className: "odd-toaster", props: {}, element: "section" },
```

Every rule kind exists today. `check.ts`, `part.ts`, `mirror.ts`, `mirror-react.ts`, `jsx.ts`, `html.ts`, `dom.ts`, `toast.css`, `CLASS_REGISTRY`, and `VOCABULARY` do not change.

### `src/js/toast.ts`

`createToaster` becomes three pieces.

- `wire(region)`, private, is today's body minus the region it built. It appends the `ol` and the polite live region to the section, opens it, and returns `{ show, stop }`. Every listener takes one `AbortController` signal, so `stop` removes them all, including a pending dialog `close`.
- `enhanceToaster(region)` is hold-counted per region, as `enhanceTabs` is. A module `Map` holds the count and the wiring for each region, in wiring order. The first call wires and each call returns its own release, which runs once. The last release stops the wiring and empties the region. A region whose `popover` is not `manual` returns a no-op and stores nothing.
- `toast(options)` drops regions no longer in the document, then calls `show` on the newest one. With none, it throws an error that names the markup and `<Toaster>`.

`max` becomes the constant 3. Nothing in the repo passes it. `enhance()` maps `.odd-toaster` to `enhanceToaster`.

**The rehome no longer moves the region.** React 19.3 throws on unmount, and on a sibling inserted before a node that JS moved (measured, `.verify/toast/candidate-opus/probes/moved-host.out.txt`). While a modal is open, `rehome` puts a shallow clone of the region, with its `id` removed, inside the modal, opens it, and moves the list and the live region into it. On the modal's `close`, they move back and the clone is removed. Today's 150 ms wait after a move stays. Measured in Firefox and WebKit, a toast button inside the clone takes a real click and the dialog stays open (`region.out.json`, `standIn`).

**The pause follows the toasts (the graft from the Grok review).** The pointer and focus listeners, and the `contains` and `:hover` checks in `onPointerLeave` and `onFocusOut`, read the node that holds the list now, which is the clone while a modal is open. Today they read `region`, which is empty during the stand-in.

### The part

```tsx
"use client";

interface ToasterContract extends Contract<"Toaster", ToasterRule> {
  children?: never;
}

export interface ToasterProps extends ToasterContract, Native<"Toaster", keyof ToasterContract> {}

export function Toaster({ ref, ...props }: ToasterProps): ReactElement {
  const root = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  useLayoutEffect(() => enhanceToaster(root.current!), []);
  return createElement(WRAPPERS.Toaster.element, { ...lower("Toaster", props), ref: root });
}
```

It is `src/react/tabs.tsx` with the names changed. `renderToStaticMarkup` gives `<section popover="manual" aria-label="Notifications" class="odd-toaster"></section>` (measured, `probes/markup.out.txt`).

### The story

`stories/mirrored/Toast.stories.ts`, with `title: "Components/Interactive"` and the export `Toast`. The scene is today's four trigger buttons and the Settings dialog, with each button a `Button`, and a `Toaster` at the end. `data-toast` rides on `Button` through the known scene excess-prop hole, as `data-activation` did for Tabs.

- The HTML preview queues `enhanceToaster` on each `.odd-toaster` in `canvasElement`, in the microtask that wires tabs. The React side has only the part's own wiring, so a broken part fails the React side.
- A `play` assigns `onclick` on each `[data-toast]` button under `canvasElement`, calling `toast()` with today's three option sets. Both Storybooks run it, as both run the Slider readout. Assigning, not adding, means a rerun converges.

The `aria` literal is today's four buttons plus the wired empty region. An unwired region adds nothing to the tree (measured, `probes/aria.out.json`), so a part that skips `enhanceToaster` fails the React literal only. The wired empty region leaves the root's pixels byte-identical (measured, `emptyPixelsSame`). The commit re-measures the literal.

```
- button "Save deck"
- button "Remove card"
- button "Fail to sync"
- button "Settings…"
- region "Notifications":
  - list
```

## Decisions taken under the autonomy grant

Each item is the default the build uses. Each one can be reversed after review.

1. **One part, `Toaster`.** The other four toast classes are written only by `toast()`. Parts for them would be specimens no caller needs, with codes on markup no caller writes. The judge scored the Grok runner's five parts lowest on interface depth.
2. **`createToaster` is deleted, and its callers move to the written region, `enhanceToaster`, and `toast()`.** Keeping it beside the new pair is two ways to get a toaster and two ways to show a toast. The package is `private` at `0.0.0`, and every caller is in this repo: the Toast story, `tests/usage-dom.test.ts`, the README, `docs/usage/runtime.md`, and the verify recipe. Tabs changed `enhanceTabs` for HTML users in the same way. To reverse it, a builder that writes the default section and calls `enhanceToaster` is about six lines.
3. **`toast()` is page-wide, and the newest connected region wins.** No caller threads a ref or a context, and code outside React can raise toasts. The registry lives in `dist/js/toast.js`, so `odd-design/react` and `odd-design/enhance` share it, as they share the tabs holds.
4. **`toast()` throws with no toaster.** A missing `<Toaster>` fails the first time the code runs. The alternative is a `console.error` that drops the toast.
5. **`toast` stays in `odd-design/enhance` only.** The React barrel stays parts-only, and `tests/react-public-api.test.ts` stays as it is.
6. **The modal rehome uses a stand-in region.** React cannot own a node that JS moves (measured). The stand-in is new to screen readers on each modal open, as the moved region is today. The NVDA `toast-over-modal` scenario checks it before the PR opens.
7. **`max` becomes a fixed 3.** Neither `enhance()` nor a one-element part has a place for the option, and nothing in the repo sets it.
8. **`data-tone="neutral"` stays as written today.** The judge proposed omitting it. No code reads it on a toast, so the change is out of scope. It goes to follow-ups.
9. **Accept a new sidebar order in Interactive.** The mirrored file loads later, so Toast sorts after Tabs. Every earlier port made the same trade.

## Capture the baseline (no source change)

- [x] Build both Storybooks at `0257d8d` with `bun scripts/storybooks.ts .verify/toast/base-sb`, serve the build, and capture the HTML section to `.verify/toast/base.json`. Result: 86 captures.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check.

### Commit 1. Replace `createToaster` with `enhanceToaster` and `toast`

- [x] Rewrite `src/js/toast.ts` as `wire`, `enhanceToaster`, and `toast`, with the hold count, the abort signal, the stand-in rehome, and the pause checks on the node that holds the list. Update its header comment. Result: one module `Map` from region to `{ count, show, stop }`, in wiring order, is the only registry. `toast()` stops and drops the disconnected entries, then shows on the last one. Every listener in `wire` takes one `AbortController` signal. `stop` aborts, clears the timers, removes the stand-in, the list, and the live region, and hides the region. Deviation: the pause listeners and the `contains` and `:hover` checks sit on the `ol` itself, not on whichever section holds it. The `ol` moves with the toasts, so it is always inside the node that holds them, and nothing re-attaches on each stand-in. The region is `pointer-events: none`, so the `ol` sees the same enters and leaves the section did.
- [x] Export `enhanceToaster` and `toast` from `src/js/enhance.ts`, drop `createToaster` and `Toaster`, and map `.odd-toaster` in `enhance()`. Result: `enhance()` maps `.odd-toaster` after `.odd-tabs`, and its doc comment lists toasters.
- [x] Move the HTML Toast story in `stories/Interactive.stories.ts` to a written region, wired by `enhanceToaster`, with clicks calling `toast()`. The story stays HTML-only in this commit. Result: the section is the last node of the story markup, and the `mount` callback wires it. The module-level `toaster` is gone, because `toast()` drops a region that left the document.
- [x] Rewrite the `tests/usage-dom.test.ts` toast test to wire a written region and call `toast()` with an action. Add one test that wires one region twice, expects one list and one live region, and expects `toast()` to work after the first release and throw after the last. Result: the second test also calls the first release twice, so a release that ran twice would unwire early. After the last release the region has no children.
- [x] Update the README Behaviors section, the component row, and `docs/usage/runtime.md` for the new pair. Result: the Behaviors example calls `enhance()` and `toast()`, and the component row names the written section and `enhanceToaster`. Deviation: the header comment of `src/css/components/toast.css` named `createToaster()`, so it now names `enhanceToaster()` and `toast()`. No rule changes.
- [x] Check. `bunx playwright test e2e/behavior.spec.ts --project firefox -g toast` passes on the HTML Storybook, with the "parent is BODY" assertion replaced by "the toast is inside `#toast-settings` while the modal is open, and the region holds the list again after Escape". Result: `bun run check` passes 567 tests. Both Firefox toast tests pass. After Escape the test also expects one `.odd-toaster`, so a stand-in left in the dialog fails it (`.verify/toast/build/check-c1.txt`, `behavior-c1.txt`).

### Commit 2. Add Toaster and check it with ODD-TOAST-001 to 004

- [x] Add `USAGE.toaster`, `ToasterRule`, the `Toaster` row, the four codes in `USAGE_CODES`, and their `MESSAGES`. Result: the five planned rows after `meter`, and the row after `Progress`. 001 names the region landmark, 002 the throw and the light dismiss, 003 the missing landmark, and 004 says to pass `tone` to `toast()`.
- [x] Write `docs/usage/toast.md` with one section per code and the HTML and React setup. Result: the written section, `enhance()` and `toast()`, the `Toaster` shell, and one section per code.
- [x] Create `src/react/toast.tsx`. Add the barrel export and the `WrapperProps` line. Result: `src/react/tabs.tsx` with the names changed, plus `children?: never`.
- [x] Add the `odd-toast-001` to `004` bad and good HTML pairs, the `RUNTIME_CODES` lines, and the `places` rows in `tests/eslint-html.test.ts`. The 002 bad page has a missing `popover` and `popover="auto"`. Result: the 001 bad page has a `div` and an `aside`. The bare `div.odd-toaster` in `odd-class-001.good.html` is now the written section, as Slider replaced its bare `div`.
- [x] Add type fail fixtures for a missing `popover`, `popover="auto"`, a missing `aria-label`, `data-tone`, and children, with their `failures` entries. Add a `pass.tsx` line with `ref`, `id`, and `className`. Result: five fixtures, `toaster-popover`, `toaster-popover-auto`, `toaster-aria-label`, `toaster-data-tone`, and `toaster-children`. Only `data-tone` prints a code, ODD-TOAST-004. The others are TypeScript's missing-property, `"manual"`, and `undefined` errors. `pass.tsx` gains `Toasts`.
- [x] Add `tests/fixtures/usage/jsx/toast.tsx` and its `places` entry. Cover each code, a computed `popover` (the `ODD-STATIC-001` warning), and a spread. Result: eleven lines, eight diagnostics at their places. A spread `<Toaster {...props} />` gives the `ODD-STATIC-001` warning and silences 002 and 003, as a spread does on `Disclosure`.
- [x] Add one markup row and one behavior test to `tests/react.test.tsx`. The test mounts `Toaster` under `StrictMode` and calls `enhance(document)`. A `toast()` then leaves one list, one live region, and one toast, with the live text "Deck saved. Midnight Control, version 15.". After the app's cleanup, `toast()` still lands. After unmount, `toast()` throws. Result: the row renders `<section popover="manual" aria-label="Notifications" class="odd-toaster"></section>`, which the runtime checker accepts. The behavior test asserts as planned.
- [x] Check. Delete each new rule row one at a time, and each fails a test. Remove the part's layout effect, and the behavior test fails. Drop the hold count, and the behavior test fails. Result: `bun run check` passes 578 tests. Each of the five row deletions fails the HTML places, the JSX places, and its bad fixture, and the four rows TypeScript reads also fail the type fixtures. Removing the layout effect fails only the behavior test. Dropping the hold count, either as a release that always unwires or as a call that always wires, fails the behavior test and the `usage-dom` hold test (`.verify/toast/build/mutations-c2.txt`, from `build/mutate.ts`).

### Commit 3. Mirror Toast in the Storybooks

- [x] Create `stories/mirrored/Toast.stories.ts` with the scene, the `play`, and the meta description. Remove `Toast`, the `createToaster` import, and the module-level `toaster` from `stories/Interactive.stories.ts`. Result: the planned scene, with the four `Button` triggers, the native Settings dialog, and `Toaster` last. The `play` assigns one of three option sets to each `[data-toast]` button's `onclick`. Commit 1 had already removed `createToaster` and the module-level `toaster`, so this commit removes the story and the `enhanceToaster` and `toast` imports.
- [x] Queue `enhanceToaster` in the HTML preview's mirrored `render`. Pin the id in `tests/stories.test.ts`. Result: the existing microtask wires `.odd-tabs` and then `.odd-toaster` under `canvasElement`. The pin ends with `components-interactive--toast`, and the story passes the HTML-equals-React and `checkRoot` loops.
- [x] Run both toast tests in `e2e/behavior.spec.ts` and the toast block in `e2e/usage.spec.ts` once per Storybook. Result: both behavior tests sit in a loop over `html` and `react`. The usage block opens each side and reads `#storybook-root .odd-toaster`, then `#toast-settings .odd-toaster` once the modal is open.
- [x] Measure the `aria` literal in the built Firefox Storybook, then paste it. Result: both sides give the planned literal, four buttons and `region "Notifications"` with an empty `list` (`.verify/toast/build/aria-c3.txt`).
- [x] Check. `bunx playwright test e2e/usage.spec.ts e2e/behavior.spec.ts --project firefox` passes with 0 diagnostics. With the part's layout effect removed, the React runs fail and the HTML runs pass. Result: `bun run check` passes 580 tests. Firefox passes 26 of 26, with "65 stories, 0 diagnostics" (`.verify/toast/build/browsers-c3-firefox.txt`). With the layout effect removed, both React behavior runs fail at "the toast shows inside the modal" and at the first toast, the usage sweep fails the React literal with the region lines missing, and both HTML runs pass (`browsers-c3-no-effect.txt`).

### Commit 4. Docs, smoke, and the verify recipes

- [x] In `docs/usage/react.md`, add "Show a toast", the type-error rows, ODD-TOAST-001 in the "not type errors" paragraph, and `toast.tsx` in the directive paragraph. Add a Toast section to `docs/usage/eslint.md`. Update the README install sentence and the usage-contract list. Result: "Show a toast" teaches the shell `Toaster`, `toast()` from any code, the throw with no `Toaster`, and the modal behavior. The table gains ODD-TOAST-004, children, the missing `popover` or `aria-label`, and a `popover` other than `manual`. `eslint.md` gains "Toaster from odd-design/react", with the spread warning. The README component row also names `Toaster`.
- [x] Add `toast.js` to `CLIENT_MODULES` and `docs/usage/toast.md` to `REQUIRED` in `scripts/consumer-smoke.ts`. The clean app renders a `Toaster`. Result: the clean app renders `<Toaster popover="manual" aria-label="Notifications" />` last. The built `dist/react/toast.js` starts with `"use client"`.
- [x] Update `.agents/skills/verify-odd-design/features/interactive.md`: the toast recipes on both sides, the new selectors, and the measured sidebar order. Result: the toast recipe waits until `[data-toast=saved]` has an `onclick` function. The modal recipe expects `#toast-settings .odd-toaster > ol` while open, and one `.odd-toaster` in `#storybook-root` holding the `ol` after Escape. A React Toast section points both recipes at the React side. The measured order in `index.json` is Menu, Tabs, Toast in HTML, and Tabs, Toast in React.
- [x] Add the follow-ups in Appendix D to `docs/follow-ups.md`. Result: five lines, from Appendix D. The existing inert-toasts line now says the toasts move, not the region, and the Tabs-only preview line now names the toasters too.
- [x] Check. `bun run check`, `bun run build`, and `bun scripts/consumer-smoke.ts` pass. Result: `bun run check` passes 580 tests, the build exits 0, and the smoke exits 0 with zero for its clean types, ESLint, and Vitest runs (`.verify/toast/build/check-c4.txt`, `build-c4.txt`, `smoke-c4.txt`).

## Verify on the real surface

- [x] Rebuild both Storybooks, capture to `after.json`, and diff against `base.json`. Pass means `changed` lists only the Toast story, with no `png` change. Result: built at `2699e10`. 86 captures. The diff reports 2 changed (Toast light and dark, `dom` and `aria`), 0 removed, 0 added, and no `png` change (`.verify/toast/capture-diff.txt`).
- [x] Run `bun run test:browsers`. Pass means Firefox and WebKit pass, 0 diagnostics, and 0 axe violations. Result: 54 passed, 2 skipped. "65 stories, 0 diagnostics". 0 axe violations in 58 runs per engine and mode, in Firefox and WebKit (`.verify/toast/browsers-tip.txt`).
- [x] Drive the composed build per the verify-odd-design skill. Open both sides of the Toast story in `calm` light, `holoterminal` dark, and one more palette. Confirm matching screenshots and aria before a click, that each trigger shows its toast, that Save inside Settings shows a clickable toast over the modal, and that the toasts come home after Escape, on both sides. Result: `.verify/toast/chrome/chrome-pair.ts` drove the built composed Storybook in Chrome in `calm` light, `holoterminal` dark, and `bubblegum` `sorbet` dark. All 42 checks pass on both sides. Before a click, the root screenshots are byte-identical and the aria equals the literal. The three triggers give three toasts, one Undo, three Dismiss buttons, and the three live sentences. Undo shows "Card restored". Save inside Settings puts a toast inside `#toast-settings` whose Dismiss takes a real click while the dialog stays open. After Escape, one `.odd-toaster` holds the list and the remaining toasts. A toast hovered for 7 s stays, on the page and over the modal, and leaves about 6 s after the pointer moves away. The composed manager lists `react_components-interactive--toast`.
- [ ] Run the NVDA `toast-over-modal` scenario with `sr.ts`. Pass means NVDA speaks the toast on the page and over the open modal. Blocked: the headed Chrome page reported `visibilityState` hidden even as the foreground window, so `requestAnimationFrame` never fired and `ctl.ts goto` never returned. The desktop was likely locked overnight. NVDA started and was stopped. Nothing was spoken, so the stand-in is not yet checked by ear (`.verify/evidence/toastsr/`).

## Review and open the PR

- [x] The `cursor grok-4.7` reviewer reads the diff against this plan. A fresh builder fixes each finding that blocks. Other findings go to `docs/follow-ups.md`. Result: the reviewer probed `toast.ts` in Firefox, WebKit, and Chromium and found no behavior defect, including nested modals, a modal that closes during the 150 ms wait, and `stop()` under a stand-in. It found two blocking false claims in the text. The ODD-TOAST-002 message said `enhanceToaster` throws with no `popover`, and the README and `react.md` said an open modal shows toasts already on screen. A fresh builder fixed both. The empty home region beside the stand-in, and `bun test` not seeing the rehome or the pause, went to `docs/follow-ups.md`.
- [x] Run `/deslop` and `/no-comments` over the diff. Result: Comment Sicko deleted four comments, including the `toast.ts` module header and the NVDA history above the announcement test. Its two MUST KILL flags were rejected. A `newestToaster()` helper for the `Map` order would have one caller, and renaming the list does not carry the reason the listeners sit on it. For `/deslop`, the lead read the diff and found nothing to remove.
- [x] Open the PR ready with `gh pr create --base main --repo Rakvadium/odd-design`. The title is `feat(react): add Toaster and mirror Toast in the Storybooks`. Result: opened ready as #34.
- [x] Run `gh pr checks`. The repo has no workflows, so expect "no checks reported". Report the PR as open. Do not merge. Result: the repo has no workflows, so gh pr checks reports no checks. The PR is open and not merged.

## Throughput checkpoint

- **Blocking first steps.** The committed plan and the baseline capture. Commit 2 needs commit 1's `enhanceToaster`. Commit 3 needs both. Commit 4 needs all three.
- **Independent workstreams.** None worth splitting. The JS, the rows, the story, and the docs all read `toast.ts` and `contract.ts` and share the test tables and the README.
- **Shared mutable state.** One builder owns the branch, so no two agents write the same file. The `.verify/toast/` candidates are read-only references.
- **Smallest safe decomposition.** One builder, one commit at a time, each checked before the next. The shared files would turn a split into merges.

## Appendix A. Design choices

| Fork | Chosen | Why |
| --- | --- | --- |
| Parts | `Toaster` only | The other classes are written only by `toast()` |
| Behavior owner | `src/js/toast.ts`, through `enhanceToaster` | One writer for timers, pause, cap, focus, announcement, and rehome |
| Showing a toast | Page-wide `toast()` | No provider, ref, or context, and non-React code can call it |
| `createToaster` | Deleted, callers migrated | One way to get a toaster |
| Double wiring | Hold-counted `enhanceToaster` | StrictMode and an app's `enhance()` wire once |
| Modal rehome | Stand-in region in the modal | React cannot own a moved node (measured) |
| Pause checks | Follow the node that holds the list | The home region is empty during the stand-in |
| HTML story wiring | Preview microtask for the region, `play` for the triggers | A broken part fails only the React side |
| `"use client"` | Yes | Hooks |

## Appendix B. Alternatives rejected

| Alternative | Why it lost |
| --- | --- |
| Five element parts and five codes (Grok runner) | Specimen parts no caller needs, with codes on markup only `toast()` writes |
| `Toaster` plus `useToaster` around `createToaster` (Grok runner) | No `WRAPPERS` row for the live API, a story-only `toasterOf` export, and a React story that a broken element part does not fail |
| A React-owned `Toaster` that `rehome` still moves | Throws on unmount and on an earlier sibling (measured) |
| A React-owned list with a portal | A second queue, and `renderToStaticMarkup` throws on a portal (measured) |
| `<Toaster ref>` that hands back `{ show }` | Every app writes the same context, and code outside React cannot reach it |
| Keep `createToaster` beside the new pair | Two ways to do one task |
| Omit `data-tone="neutral"` (judge graft) | Correct, but no code reads it. Out of scope |

## Appendix C. Evidence and reading list

These files are local scratch under the gitignored `.verify/toast/` folder of this worktree. They are not on the branch.

- `how.md` explains the contract, the parts, the checkers, the mirror, and Toast today, and lists eleven forks.
- `task.md` and `rubric.md` are the arena's task and scoring rubric.
- `candidate-opus/design.md` is the base, with its probes in `candidate-opus/probes/`.
- `candidate-grok/design.md` is the other design, with its probes beside it.
- `judge.md` holds the cross-judge's scores, the claims it found wrong, its pick, and the grafts.

## Appendix D. Risks and follow-ups

- **`createToaster` is gone.** An outside HTML caller, if one exists, must write the section and call `enhanceToaster`.
- **The stand-in is new to screen readers on each modal open.** It still needs the NVDA `toast-over-modal` scenario. The run before the PR did not finish because the desktop left the headed page hidden overnight, so `ctl.ts goto` never returned. VoiceOver is unchecked.
- **Changing `aria-label` on a mounted `Toaster` while a modal is open** leaves the stand-in with the old name until the next rehome.
- **Toasts already showing when a modal opens still go inert** until the next `toast()`. This is the existing follow-up, unchanged.
- **`data-tone="neutral"` is written but styles nothing.** Omitting it matches the CSS.
- **Docs pages run no `play`,** so the triggers there do nothing.
