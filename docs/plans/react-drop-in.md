# React drop-in plan

Today a React app that uses `odd-design/react` still assembles each widget by hand. `Tabs` needs a hand-written tablist, tab buttons, panels, and `aria-controls` pairs. `Dialog` needs a title heading with an id and an `aria-labelledby` that points at it. A field needs `htmlFor`, `id`, and `aria-describedby` wired across four parts. Tooltip, HoverCard, and Log have no React export, so an app writes their `odd-*` classes itself. Scout and Caleb set the new direction on 2026-11-01. `odd-design/react` becomes a components-first library that owns tags, `role`, ids, ARIA, and wiring. HTML and CSS stay the compile target, not the public API.

This plan covers three things:

1. The React ports that block drop-in. These are Tooltip, HoverCard, Log, and the Table and keeper story holes.
2. Drop-in use of every shipped core family through `odd-design/react`, with no `odd-*` class written by the consumer.
3. What is in this PR, what is a follow-up, and what is out.

The work ships as one PR from `feat/react-drop-in` to `main`. The branch was fast-forwarded to `956e94e` (PR #50), because it had no commits of its own and was 10 commits behind. Nothing is built until Caleb approves this plan. Nothing merges, deploys, or publishes to npm.

## How to read this

One box is one unit of work. Each box names the evidence that checks it. Check a box only when that evidence exists.

"Owns" means the component writes the attribute or element. "Consumer" means the app that imports `odd-design/react`. "Keeper" means a family that `docs/audits/core-primitives-fitness.md` gave `keep-as-core-primitive`, and "keeper story holes" means that audit's section 5 items that are still open.

The run follows `odd-mode/playbooks/feature.md`. The builder runs on the `feature, refactoring` model (`claudeAgent claude-opus-5-5`, effort high). A reviewer on the `cross-provider reviewer` model (`cursor grok-4.7`) reviews the diff, so the builder and the reviewer run on different providers. The lead plans, reviews, and verifies.

## What changes for a consumer

Today, a dialog with a field:

```tsx
<Button command="show-modal" commandfor="rename">Rename</Button>
<Dialog id="rename" aria-labelledby="rename-title" closedby="any">
  <form className="odd-dialog-body" id="rename-form">
    <h2 className="odd-dialog-title" id="rename-title">Rename deck</h2>
    <Field>
      <Label htmlFor="rename-name">Name</Label>
      <Input id="rename-name" name="name" aria-describedby="rename-hint" />
      <Hint id="rename-hint">Shown on your profile.</Hint>
    </Field>
  </form>
  <DialogActions>
    <Button command="close" commandfor="rename">Cancel</Button>
    <Button type="submit" form="rename-form" variant="primary">Save</Button>
  </DialogActions>
</Dialog>
```

After this PR:

```tsx
<Dialog trigger={<Button>Rename</Button>} title="Rename deck" dismissible onSubmit={rename}
  actions={<><Button command="close">Cancel</Button><Button type="submit" variant="primary">Save</Button></>}>
  <Input label="Name" name="name" hint="Shown on your profile." />
</Dialog>
```

The consumer passes intent, such as a label, a value, a tone, or a handler. The component writes the markup. Writing an `odd-*` class in JSX is a lint error that names the component to use (`ODD-REACT-003`). Passing `role`, or an attribute the component owns, is a compile error whose text names the prop to use (`ODD-REACT-001`). Passing a system `data-*` attribute is `ODD-REACT-002`. `className` and `style` go to the outermost element. `ref` goes to the focusable element.

## Design

The design came from an architect arena. Two runners designed it independently, `claudeAgent claude-opus-5-5` and `cursor grok-4.7`, against the same grounding. A `cursor grok-4.7` cross-judge scored both against a six-point rubric. The lead and the judge both picked the Opus design as the base. Both runners reached the same core on their own. `USAGE` checks only rendered DOM. `WRAPPERS` and `toHtml` go away. ESLint flags `odd-*` classes in JSX. Components own their ids. State ownership does not move. The old one-element exports are deleted in the same PR. [Design record](#design-record) lists the grafts and what was rejected. The scratch records are in `%TEMP%\odd-dropin\` (grounding, `why`, both candidates, the rubric, the judgment).

### Why the old shape goes

Every React plan from Field to Combobox kept the consumer writing `role`, ids, ARIA, and child structure. Five readers rebuild each export from its flat `WRAPPERS` row: the prop types, `lower`, ESLint `jsx.ts`, `toHtml`, and `toReact`. ESLint and `toHtml` never run a component, so a component could not write anything its row did not describe (`react-choice.md:186`, `react-skeleton.md:76`, `react-tabs.md:221`). That trade made sense while HTML and React were equal peers rendered by separate code. With React as the public API and HTML as its output, the premise is gone. The forces that still hold are kept:

- The browser owns `open`, the top layer, Escape, and focus return. The vanilla enhancers own tab selection, `aria-checked`, the select-all header, and combobox state. The plans measured bugs when React wrote this state too (`react-tabs.md:144`, `react-disclosure.md:68`).
- Server markup carries every semantic. No attribute that matters before hydration is added in an effect.
- `USAGE` stays the one contract on rendered DOM, with its codes and `MESSAGES`. Raw HTML authors keep every rule.
- Typed props whose error text is the fix.
- The existing CSS classes are the target. This PR adds no class.

### The ownership rule

A component owns every attribute that the correctness of its markup depends on.

- `role` never passes through. It is typed `Message<"ODD-REACT-001">` on every component.
- Each attribute a component writes is in its `Owned` key set and typed `Message<"ODD-REACT-001">`. At runtime the component spreads the rest first and writes its owned attributes last.
- ARIA the component does not own passes through, for example `aria-expanded` on a `Button` used as a custom toggle. Id-reference lists the component also writes, such as `aria-describedby`, are merged.
- System `data-*` (every `VOCABULARY` token outside the headless and appearance allowlists) is `Message<"ODD-REACT-002">`. Other `data-*`, such as `data-testid`, passes through.
- `disabled` means the right mechanism for the element. Form controls get native `disabled`. `Button`, `MenuItem`, and `ComboboxOption` get `aria-disabled="true"` and a swallowed click.
- A blank `label`, `title`, or `caption` throws the family's existing accessible-name code in development and test builds, because a `string` type cannot exclude `""`. Production renders it, as `installUsageChecker` reports nothing in production.

This replaces `Contract`, `Pinned`, `Named`, `RoleWithName`, `Exclusive`, `Forbidden`, `RawData`, `ForeignData`, `Native`, `lower`, `part`, and `elementTag`. What remains is `src/react/own.ts`, about 60 lines: `Message`, `Values`, `Owned`, `Passthrough`, `cx`, `useOddId`, `idsOf`, `mergeIds`, `rejectBlank`, `useEnhancer`, and `useFallback`.

### Data structures

`USAGE` keeps its meaning, a contract on rendered DOM. No rule is deleted, scoped, or relaxed. The old conflict came from linting the consumer's JSX as if it were DOM. Once ESLint stops doing that, `Switch` writes `role="switch"`, the DOM satisfies `ODD-CHOICE-002`, and nobody asks the consumer for it. Three groups are added for classes that get their first wrapper: `tooltip` (ODD-TOOLTIP-001), `hoverCard` (ODD-HOVER-CARD-001), and `log` (ODD-LOG-001 to 004).

`CLASSES` replaces both `WRAPPERS` and `CLASS_REGISTRY`. It is keyed by class, for example `"odd-tooltip": { by: ["Button", "TextLink"], via: "the label or tooltip prop" }`. The registry becomes `Object.keys(CLASSES)`, so two lists become one. Three readers use it. `check.ts` reads the derived registry for `unknown-class`. ESLint reads `by` and `via` for the `ODD-REACT-003` message. `tests/components.test.tsx` renders every export's fixtures and fails when the set of `odd-*` classes in the output differs from `CLASSES`. That test is the build failure for the one list that cannot be derived, because ESLint must not run React.

The own `data-*` attributes of a class come from its `enum` and `boolean-attribute` rules, through `ownAttributes(className)` in `check.ts`, instead of `WRAPPERS[…].props`.

Ids come from `useOddId(id?)`, which is `id ?? useId()` with `useId` called every render. Each child id is `${base}-${part}` from `idsOf`. Item ids use the item's index, never its value. React keeps `useId` stable between server and client, and the hydration test holds it to that. Tests assert id relationships, such as `aria-controls` equal to the panel id, and never `useId` spelling. Any selector built from a generated id uses `CSS.escape`, as `enhanceMenu` already does (`src/js/menu.ts:56`).

Three private contexts carry wiring:

- `TriggerContext` carries `commandfor`, `command`, `aria-haspopup`, or `interestfor`. An overlay wraps its `trigger` in it. `Button` and `HoverCardLink` read it, then reset it to `null` for their own subtree.
- `OverlayContext` holds the enclosing overlay's id, its close command, and its body form id. A `Button` with `command="close"` and no `commandfor`, or with `type="submit"` and no `form`, fills them in.
- `LinkContext` holds the router link component from `OddProvider`. `Button` with `href`, `TextLink`, `HoverCardLink`, `Card` with `href`, `Breadcrumb`, and `SkipLink` render through it. That gives routers one place to plug in, with no per-call `as` or `asChild`.

### The checkers

| Check | Today | After this PR |
| --- | --- | --- |
| TypeScript props | `Contract<N, Rule>` from the `WRAPPERS` row plus `USAGE`. `Pinned` demands owned attributes from the caller. | Props are written per component. Value unions still come from `USAGE` (`Values<ButtonRule, "data-variant">`). Required structure is a required prop (`label`, `title`, `caption`, `tabs`). Owned keys and `role` are `ODD-REACT-001`. System `data-*` is `ODD-REACT-002`. |
| ESLint `odd/usage` on JSX | `jsx.ts` rebuilds wrapper DOM from `WRAPPERS` and runs every `USAGE` rule on the consumer's JSX. | The wrapper model is deleted. Every `odd-*` word in a JSX `className` (a literal, a template, or inside `cx(…)` or `clsx(…)`) reports `ODD-REACT-003` with the owning export from `CLASSES`. `src/react/**` is exempt. |
| ESLint on HTML | `USAGE` | Unchanged. |
| Runtime `checkRoot` and `installUsageChecker` | `USAGE` on live DOM | Unchanged. It becomes the main net for component output in a consumer's dev and test runs. |
| Proof that components emit valid DOM | The `tests/react.test.tsx` markup table | New `tests/components.test.tsx`. `FIXTURES` is typed over every export, so a new export without fixtures fails to compile. Each fixture is rendered with `renderToStaticMarkup`. The test runs `checkRoot`, checks the class set against `CLASSES`, and checks that every id reference resolves inside the fixture (`for`, `aria-labelledby`, `aria-describedby`, `aria-controls`, `commandfor`, `interestfor`, `form`). The last check proves the ownership claim directly. |
| Story parity | `toHtml(scene)` and `renderToStaticMarkup(toReact(scene))` must match, minus `type="button"`. | `toHtml` is deleted. A story is one React element. The HTML Storybook shows its static markup and runs one vanilla `enhance(canvasElement)`, so the canvas is the compile target with no React at runtime. Three checks replace DOM equality: `checkRoot` on every story's static markup, a hydration test (`renderToString`, then `hydrateRoot`, failing on any recoverable error), and the existing e2e pair sweep of aria snapshots and pixels in both Storybooks. The pair sweep now proves that the vanilla enhancers on compiled HTML behave like the React components. |

ESLint no longer checks props on odd-design components. TypeScript checks them, and `checkRoot` checks what they render. A plain-JavaScript consumer loses lint coverage of component props. That is acceptable for a React-primary package with typed props.

### Shape rules

These rules decide every component's public shape, so the next contributor does not invent a new pattern.

1. Required structure is a required prop. If the markup is invalid without a name, a title, or a caption, TypeScript demands it.
2. Use an items array when an item renders in two places or the component derives a cross-reference. Examples are Tabs (tab plus panel), Segmented and RadioGroup (a shared `name`), Breadcrumb (the last item is current), and Table (a header cell and a body cell per column). A cross-reference that TypeScript checks goes in a plain string list beside the items, such as Table's `sortable`.
3. Use children when items render once, in order, with no cross-reference. Examples are `MenuItem`, `ComboboxOption`, `LogLine`, `Avatar` in `AvatarGroup`, and `<option>` in `Select`.
4. An overlay whose opener is a standalone control takes `trigger: ReactElement`. The overlay renders the trigger inside `TriggerContext`, then its panel right after it.
5. An overlay whose opener sits in running text wraps the block that contains it (HoverCard). The panel renders after the block, never inside the `p`, because a `div` inside a `p` closes the paragraph in the HTML parser and breaks hydration.
6. A text-only hint belongs to its invoker. Interest invokers are `button` and `a` only, so the tooltip is a prop on `Button` and `TextLink`, never a wrapper around an arbitrary child.
7. The remote opener stays platform vocabulary. When the opener and the target live in different subtrees, such as a `MenuItem` that opens a `Dialog`, the consumer gives the target an `id` and the opener `command` and `commandfor`. This is the one id a consumer writes. It names which dialog, so it is intent, not wiring.

### State ownership

Components render the initial state from `default*` props: `aria-selected` and `hidden` from `Tabs.defaultValue`, `open` from `Disclosure.defaultOpen`, `checked` from `defaultChecked`. The same enhancers own the state after mount: `enhanceTabs`, `enhanceMenu`, `enhanceSelectAll`, `enhanceCombobox`, `enhanceToaster`, and `enhanceLog`. There is no controlled `open` and no controlled `value`. Notifications become props where React 19 cannot bind the custom event, so `Tabs.onValueChange` listens for `odd-tab-change` on the ref.

React writes an authored attribute again on a controlled render, so the DOM attribute cannot be the record. `missing-cores-queue.md:113` measured this for Combobox. Every component that authors an attribute its enhancer owns uses `useEnhancer(ref, enhance)`. That helper is Combobox's two-effect pattern, made shared. One layout effect with `[]` subscribes and holds the refcount. A second layout effect with no dependency list calls the enhancer again, which writes the holder's state back onto what React rendered. The second effect's cleanup never releases the subscriber's hold. `enhanceTabs` and `enhanceMenu` today only bump a refcount on a second call (`src/js/tabs.ts:26-37`). Each one gains Combobox's "a second live call projects holder state and does not reset it" behavior in the same commit as its component.

Two places differ on purpose:

- Table selection is consumer-controlled (`selected` plus `onChange`). `enhanceSelectAll` still owns the header and still changes rows only by `row.click()`, so each row's `onChange` fires once (`react-table.md:150`).
- Avatar's image fallback is React state. `onError` swaps to initials, and `Avatar` never writes `data-initials`, so a page-level `avatarFallback()` cannot destroy React's `img`. The vanilla `AvatarFallback` story stays HTML-only.

Scripts never replace DOM that React owns:

- `Log` sets `data-owner="react"`, and `appendLogLine` throws on a log with that attribute. A React app keeps lines in state and trims them itself.
- `Combobox` renders its "No results" option in server markup with the id `${listId}-empty`. `enhanceCombobox` stops creating that node and only toggles its `hidden`.

### Platform fallbacks install themselves

`interestForFallback` and `closedByFallback` run today only if the app calls `enhance()` (`src/js/enhance.ts:119-120`), and no file under `src/react/` calls either. A React app that never calls `enhance()` gets no tooltip or hover card in Firefox or WebKit, and no backdrop dismiss where `closedby` is missing. `src/js/fallbacks.ts` gains a per-root refcount, so each call after the first adds no listeners. `useFallback(fallback)` calls it from an effect. `Button` and `TextLink` call it when they render a tooltip, `HoverCard` always calls it, and `Dialog` and `Sheet` call it when `dismissible`. A page-level `enhance()` shares the same installation.

### Server and client

`"use client"` goes on any module with a handler, an effect, state, or a context. That covers Button, the field controls, the overlays, Tabs, Menu, Table, Combobox, Log, Avatar, Toaster, and OddProvider. Badge, Kbd, Code, Pre, Heading, Eyebrow, Muted, Stack, Row, Grid, GridItem, VisuallyHidden, Separator, Skeleton, Spinner, StatValue, Meter, Progress, Alert, Card, Breadcrumb, Scope, and Shell stay server-safe. Card and Breadcrumb links go through a client `Anchor` leaf that reads `LinkContext`. Nothing uses a portal. `scripts/consumer-smoke.ts` derives `CLIENT_MODULES` by scanning `dist/react` for the directive, which also closes today's gap where `menu.js` and `table.js` are not checked.

## Every family in this PR

| Family | Public React API | What it owns | What the consumer writes |
| --- | --- | --- | --- |
| Button | `<Button variant size iconOnly label tooltip busy disabled current href newTab type command commandfor>` | `odd-button`, `data-*`, `type="button"`, `aria-disabled` and the click swallow, `aria-busy`, `aria-current`, `target` and `rel` with hidden "opens in a new tab" text, the icon-only name (`aria-labelledby` to its own tooltip), `aria-describedby` to a `tooltip`, `interestfor`, trigger wiring from context, close `commandfor` and submit `form` from context, the router anchor | Content, `label` (required when `iconOnly`), handlers, and `command` with `commandfor` only for a remote target |
| Tooltip | No export. `label` on an icon-only `Button`, or `tooltip` on `Button` and `TextLink` | `span.odd-tooltip[id][popover=hint][role=tooltip]`, the reference, `interestfor`, the fallback | The text |
| TextLink | `<TextLink href current newTab tooltip>` | `a.odd-link` through the router, `aria-current`, `target` and `rel`, the tooltip as on `Button` | `href`, the text |
| HoverCard | `<HoverCard preview={…}>` around a block that holds `<HoverCardLink href>` | `div.odd-hover-card[id][popover=hint]` after the block, `interestfor` on each `HoverCardLink` (an `a.odd-link`), the fallback | The block, the preview content, the `href` |
| Log | `<Log label live="polite" or "off">` with `<LogLine tone time>` children | `div.odd-log[role=log][aria-label][tabindex=0][aria-live][data-owner=react]`, `enhanceLog` scroll pinning, `div.odd-log-line[data-tone]`, `<time dateTime>` with `suppressHydrationWarning` | Lines as state, trimmed by the app, and text that says the level |
| Field controls | `Input`, `Textarea`, `Select`, `Slider`, and `Combobox` take `label hint error hideLabel` | `div.odd-field`, `label.odd-label[for]` or a visually hidden label, the control `id`, `aria-describedby` (hint and error, merged), `aria-invalid`, `p.odd-hint`, and `p.odd-error` while `error` is set | The label text, hint, error message, native control props |
| Choices | `<Checkbox label>`, `<Switch label>`, `<RadioGroup label name options defaultValue>`, `<Segmented label name options defaultValue>` | `label.odd-choice`, `type`, `role="switch"`, `fieldset` and `legend`, the shared `name` (generated if absent), one label per option | Labels, options, value handlers |
| Search | `<Search label onSubmit?>` plus input props | `search.odd-search`, or `search > form.odd-search` with `onSubmit`, the hidden label, the package's own `svg[aria-hidden]`, `input.odd-input[type=search]` | Label text, handlers |
| Tabs | `<Tabs label tabs={[{ value, label, content, disabled }]} defaultValue activation orientation onValueChange>` | `div.odd-tabs`, the tablist (`role`, name, `aria-orientation`, `data-activation`), each tab (`role`, `id`, `aria-controls`, `aria-selected`, `tabIndex`, `type`), each panel (`role`, `id`, `aria-labelledby`, `hidden`), `enhanceTabs` | Labels, content, values |
| Dialog, AlertDialog | `<Dialog trigger? id? title description? actions? dismissible onSubmit? headingLevel>`, `<AlertDialog>` with a required `description` and no `dismissible` | `dialog.odd-dialog#id`, `aria-labelledby` to `h2.odd-dialog-title`, `aria-describedby`, `role="alertdialog"`, `closedby="any"`, `div.odd-dialog-body` (a `form` with `onSubmit`), `div.odd-dialog-actions`, the trigger's `command="show-modal"` and `commandfor`, the fallback | Title, body, actions |
| Sheet | `<Sheet side closeLabel>` plus the Dialog props | As Dialog, plus `data-side`, `div.odd-sheet-header` with the title and an icon-only close `Button`, the body, `div.odd-sheet-footer` | As Dialog |
| Popover | `<Popover trigger title?>` | `div.odd-popover#id[popover=auto]`, and with `title`, `role="dialog"` and `aria-labelledby` to a `p.odd-eyebrow` title, the trigger's `toggle-popover` | Trigger, title, content |
| Menu | `<Menu trigger label>` with `MenuItem tone shortcut disabled`, `MenuCheckboxItem defaultChecked`, `MenuRadioGroup label` and `MenuRadioItem`, `MenuSeparator`, `MenuGroup label` | `div.odd-menu#id[popover][role=menu]` and its name, the trigger's `aria-haspopup="menu"` and `toggle-popover`, item roles, `type`, `aria-disabled`, initial `aria-checked`, `kbd.odd-menu-shortcut[aria-hidden]` with `aria-keyshortcuts`, `p.odd-menu-label`, a named `role="group"`, `enhanceMenu` | Labels, handlers, shortcut text |
| Card | `<Card as title eyebrow description href footer headingLevel>` | `article`, `section`, or `div.odd-card`, `h{n}.odd-card-title`, `p.odd-eyebrow`, `p.odd-muted`, and with `href`, `data-interactive` and exactly one `a.odd-card-link` around the title, `div.odd-card-footer` | Content |
| Heading, Eyebrow, Muted | `<Heading level size>`, `<Eyebrow tone as>`, `<Muted as>` | `h{level}.odd-heading[data-size]`, `.odd-eyebrow[data-tone]`, `.odd-muted` | Text and level |
| Alert | `<Alert tone title icon>` | `div.odd-alert[data-tone]`, the icon slot with `aria-hidden`, the body with `p.odd-alert-title` | Text, the icon element, and the live region around it (`ODD-ALERT-003` keeps that the app's job) |
| Avatar, AvatarGroup | `<Avatar name src initials size decorative>`, `<AvatarGroup label>` | `span.odd-avatar`, `img alt`, the React fallback to initials with `role="img"` and a name, `aria-hidden` when decorative, the group's `role="group"` and name | Name and image |
| Badge, Kbd, Code, Pre | Same props as today | Class and `data-*`. `Pre` wraps its text in a `code` element | Text |
| Separator | `<Separator orientation>` | `hr.odd-separator`, `aria-orientation` | Placement in a `Row` when vertical |
| Skeleton | `<Skeleton shape>` | `div.odd-skeleton[aria-hidden=true]`, `data-shape` | `aria-busy` on the app's own container |
| Spinner | `<Spinner label?>` | `span.odd-spinner[aria-hidden=true]` and the words in `span.odd-visually-hidden` | `aria-busy` on the app's region |
| Meter, Progress, StatValue | `<Meter label tone>`, `<Progress label value?>`, `<StatValue>` | Class, `data-tone`, the name, `span.odd-stat-value` | Values. The stat row stays a recipe. |
| Breadcrumb | `<Breadcrumb label? items={[{ label, href? }]}>` | `nav.odd-breadcrumb` with a default "Breadcrumb" name, `ol > li`, router links, `aria-current="page"` on the last item | Items |
| Disclosure | `<Disclosure summary name defaultOpen onToggle>` | `details.odd-disclosure`, `summary`, the answer `div` | Summary and answer |
| Combobox | `<Combobox label hint error filter="manual">` with `<ComboboxOption disabled>` children | The field frame, `div.odd-combobox`, the input's `role`, `aria-controls`, `aria-autocomplete`, and `aria-expanded`, `div.odd-combobox-list[popover=manual][role=listbox]` and its name, option roles, the "No results" option, `enhanceCombobox` | Options, handlers, value |
| Table | `<Table caption hideCaption columns rows rowKey sortable sort onSortChange selection scrollable>`. Column `footer` cells render `tfoot`. | The caption and its id, the named scroll region, `th scope`, one `aria-sort`, a sort button as the `th`'s only child, `data-numeric` on header and cells, the select-all box, a named checkbox per row, disabled rows | Columns, rows, cell renderers, sort and selection state, and the sort itself |
| Toaster | `<Toaster label>` | `section.odd-toaster[popover=manual]` and its name, `enhanceToaster` | Calls to `toast()` from `odd-design/enhance` |
| Layout | `<Stack gap as>`, `<Row gap as>`, `<Grid gap>`, `<GridItem span>`, `<VisuallyHidden>`, `<SkipLink href>` (typed `` `#${string}` ``), `<Scope chrome palette mode>` (all three required) | Class, `--gap`, `data-span`, the scope attributes | Children and the target |
| Shell | `<Shell title status actions>` | `div.odd-shell > header.odd-shell-header > h1.odd-heading + div.odd-shell-status[role=status] + div.odd-shell-actions`, `main.odd-shell-main.odd-grid` | Content. This wraps today's classes and does not demote Shell. |
| OddProvider | `<OddProvider link={RouterLink}>` | `LinkContext` | The router link component |

No React component in this PR:

- Stepper and range field are recipes with no class (PR #43). `enhanceStepper` and `enhanceRangeField` stay vanilla. A React wrapper would fight a controlled `value`, and recipes are later work.
- The stat row is a recipe (PR #43). `StatValue` covers `odd-stat-value`.
- The e-stop left core for the robot-arm app (PR #44).

### Exports kept, deleted, and new

An export survives only if a consumer places that element on its own. The building blocks under composites become module-private. Every caller in the repo (stories, tests, docs, eval) moves in the commit that changes the family. The package is `private` at `0.0.0`, so nothing outside the repo needs to migrate.

- Kept and reshaped: Button, Input, Textarea, Select, Switch, Segmented, Badge, Alert, Avatar, AvatarGroup, Separator, Skeleton, Card, Disclosure, Tabs, Search, Slider, Meter, Progress, Toaster, Popover, Dialog, Sheet, Menu, MenuItem, Table, TextLink, Spinner, Combobox, ComboboxOption, Breadcrumb, Kbd, Code, Pre.
- Deleted and made internal: Field, Label, Hint, FieldError, Choice, AlertTitle, CardLink, CardFooter, DialogActions, SheetHeader, SheetFooter, TableWrap, TableSort, ComboboxList.
- New: AlertDialog, Checkbox, RadioGroup, HoverCard, HoverCardLink, Log, LogLine, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuGroup, Heading, Eyebrow, Muted, Stack, Row, Grid, GridItem, VisuallyHidden, SkipLink, Scope, Shell, StatValue, OddProvider.

`toast` stays on `odd-design/enhance` only, so it has one import path.

## The ports that block drop-in

### Tooltip

`popover.css:12-22` is the contract. An icon-only button is named by its tooltip through `aria-labelledby`. A labeled control points `aria-describedby` at its tooltip. The tooltip is `popover="hint"` with `role="tooltip"`, opened by `interestfor`.

- `<Button iconOnly label="Duplicate deck">` renders the label as the button's name and as its tooltip. The type keeps the name requirement, because `label` is required when `iconOnly` is set.
- `<Button tooltip="Anyone with the link can view it">Publish</Button>` and `<TextLink tooltip="…">` render a described-by tooltip.
- The tooltip renders as a `span.odd-tooltip` beside the invoker, because a `span` is valid wherever a button or link is, including inside a `p`. `ODD-TOOLTIP-001` checks `popover="hint"` and `role="tooltip"`, not the tag. The e2e pair sweep compares its pixels against the HTML contract's `div`.
- No tooltip on an `input` or other non-invoker. The platform opens interest popovers only from `button` and `a`.
- `ODD-TOOLTIP-001` joins `USAGE`, with `docs/usage/tooltip.md`, a good and bad HTML fixture, and `places` rows.
- `components-overlays--tooltip` becomes a mirrored story with the same id, plus an `Open` story whose `play` hovers and pins the tooltip in the aria snapshot.

### HoverCard

- `<HoverCard preview={<DeckPreview />}><p>Last week's winner was <HoverCardLink href="/decks/42">Ember Aggro</HoverCardLink>.</p></HoverCard>`.
- The panel renders after the wrapped block as `div.odd-hover-card[popover=hint]` with no role, per the CSS contract. Every bit of its content must also be on the linked page (`popover.css:19-22`).
- `ODD-HOVER-CARD-001` joins `USAGE`, with `docs/usage/hover-card.md` and fixtures.
- `components-overlays--hover-card` becomes a mirrored story with a hover `play`. `stories/Overlays.stories.ts` is deleted once both of its stories move.

### Log

- `<Log label="Sync log">{events.map((e) => <LogLine key={e.id} tone={e.tone} time={e.at}>{e.text}</LogLine>)}</Log>`.
- `enhanceLog` keeps the newest line in view until the reader scrolls up. It gains a refcount, so a page-level `enhance()` beside `Log` adds no second `MutationObserver`.
- `appendLogLine` throws on a log with `data-owner="react"`.
- `ODD-LOG-001` to `004` join `USAGE` as the audit wrote them (no `role="log"`, no `tabindex="0"`, no name, a line tone outside the four).
- `components-feedback--log` becomes a mirrored story with the same id, plus a Variants story (each tone, a line without a time) and a `play` that adds lines. The sample text is neutral deck-app text. The robot-arm words in the `log.css` and `log.ts` comments stay, because rewording them is Appendix A.

## Table and keeper story holes

The Done-when names the Table holes and the keeper holes that block drop-in. A hole blocks drop-in when a React consumer cannot see or test the family without it, or when a new wrapper needs its first story or code.

| Hole | Disposition |
| --- | --- |
| Table has no `Playground` | In. Controls for the Cards column's `numeric`, `sortColumn`, `sortDirection` (read from an exported `SORT_DIRECTIONS` tuple), `selectable`, `scrollable`, and `hideCaption`. Swept in `e2e/usage.spec.ts` like Button's and Link's. |
| Table has no disabled row checkbox | In. `TableStates` gains a row where `selection.disabled(row)` is true. The aria snapshot pins `checkbox "Select Archive" [disabled]`, and select-all skips it. |
| No table without select-all beside one with it | In, in `TableStates`. |
| No empty `tbody` | In, as a zero-row table in `TableParts`. It pins an unchecked select-all header and no enhancer error. No empty-state UI, which stays parked. |
| Region named with `aria-label` | Closed by construction. `Table` names its region by its own caption. The raw-HTML case stays covered by the ODD-TABLE-003 fixtures. |
| `aria-sort="other"` | Out by construction. `SortDirection` is `ascending` or `descending`, and `table.css` paints no separate `other`. |
| Sort button not a direct child of `th` (`follow-ups.md:155`), two concrete `aria-sort` columns (`:156`), select-all outside `thead` (`:157`) | Closed by construction. Unit tests in `tests/react.test.tsx` pin each one. |
| Late rows and a remounted header (`:158-160`) | Closed. Rows come from `rows`, so a change commits `Table`, and the every-commit `enhanceSelectAll` resyncs. A unit test adds a row and expects a `mixed` header. |
| Select-all resync cost (`:161`) | Follow-up measurement. |
| A blank region name compiles (`:162`) | Closed in development and test by `rejectBlank` on `caption`. |
| Tooltip and HoverCard mirrors, ODD-TOOLTIP-001, ODD-HOVER-CARD-001, Tooltip and HoverCard opened in `play` | In. See [Tooltip](#tooltip) and [HoverCard](#hovercard). |
| Log Variants, Log mirror, ODD-LOG-001 to 004 | In. See [Log](#log). |
| Dialog and AlertDialog opened in `play` | In. A closed dialog's aria snapshot shows nothing of the title and body it now owns, so the pair sweep needs the open state to compare them. The Popover opened in `play` lands in the same commit. |
| Base utilities, Grid, Shell, and Typography stories are HTML-only | In. Each story gains a React twin with its id kept, because each family gains a wrapper. |
| Avatar fallback mirror | Out. React's `onError` fallback and the vanilla `avatarFallback` render through different mechanisms, so a pair comparison has nothing to compare. The vanilla story stays HTML-only. |
| Playgrounds for every other keeper, Badge Variants, Field Parts and States, `:user-invalid`, the Alert status story, Card Parts and States, Choice Parts, Disclosure States, Separator Variants, Slider `dir="rtl"`, Avatar sizes, the Search form story, the skip-link focus `play`, and the toast forced-colors check | Follow-up. This is the visual and real-states work the operator scheduled later. Each family still gets component fixtures in this PR, so `checkRoot` runs on its output. |
| ODD-MENU-008, ODD-MENU-009, ODD-FIELD-004 | Follow-up. The components satisfy all three by construction, so they guard only hand-written HTML. |
| ODD-STEPPER-001, ODD-RANGE-FIELD-001 | Out. Recipes have no class to find (`core-hygiene-queue.md:45`). |

## In this PR, follow-ups, and out

In this PR:

- The checker and Storybook changes in [The checkers](#the-checkers).
- Every family in [Every family in this PR](#every-family-in-this-pr), with the old exports deleted.
- Tooltip, HoverCard, and Log, with their codes, docs, and stories.
- The Table and keeper holes marked In above.
- `docs/usage/react.md` rewritten section by section as each family moves. Each `docs/usage/<family>.md` page gains the React call at its top and labels its HTML as the compiled output, so an agent that opens the HTML page finds the component first.
- `docs/follow-ups.md` items this PR closes are deleted, and new gaps are added.
- One line in each superseded plan's decision (`react-uniformity.md`, `react-choice.md:85,171,186`, `react-skeleton.md:76`, `react-card.md:105`, `react-tabs.md:221`, `react-popover.md:124`, `react-dialog.md:143-146`, `react-menu.md:68-70`, `mirror-storybooks.md:164`) points at this plan. The state-ownership decisions in those plans stay.

Follow-ups, each its own PR after this one, in this order:

1. Consumer docs. A README React quickstart, `docs/usage/react.md` as a drop-in guide, and a type-error guide.
2. Visual and real-states stories for the keepers, as listed in the table above, plus the Appendix A story-depth allowlist test.
3. HTML-author coverage. ODD-MENU-008, ODD-MENU-009, ODD-FIELD-004, and a `USAGE` id-reference rule for raw HTML (`for`, `aria-controls`, and `commandfor` resolve).
4. Module strings. The combobox "No results" text and the English defaults (`closeLabel`, "Breadcrumb", "opens in a new tab") from props or a provider.
5. Eval. The brief targets the drop-in API, and `eval/grade.ts` counts `ODD-REACT-003` and checks that tabs and dialogs come from components.
6. A `scripts/primitive-fitness.ts` rerun against `CLASSES`.
7. Measurements. Select-all resync cost, and `useId` inside a Next.js server component tree.
8. Recipes in React (number stepper, slider with number, stat row).
9. npm publish readiness. Versioning and an RSC-aware `exports` map. The publish waits for Caleb.

Out of scope:

- Expanding recipes, and the Appendix A recipe stylesheet.
- Demoting Shell. `Shell` wraps today's classes unchanged.
- The rest of Appendix A, including the robot-arm text in `log.css` and `log.ts` and the `avatar.css` comment.
- Full Button parity, including the shared busy ring and the forced-colors gap. This PR reshapes Button's props and leaves its CSS alone.
- The raw-value lint, demoting the glass eyebrow, and the leftover hardcoded font weights.
- Nexarm and the e-stop.
- Web components.
- npm publish and deploys.
- New families (Pagination, empty state, sidebar, nav, calendar, command palette, tree, carousel, file dropzone, OTP input) and app-specific assemblies.
- Controlled `open` on overlays and controlled `value` on Tabs. This is declined, not deferred. The browser and the enhancers stay the one writer.
- Deleting `USAGE`, `html.ts`, or the HTML Storybook. Foundations, Showcase, the recipes, and the vanilla `AvatarFallback` story stay HTML strings.

## Design record

The base is the Opus design. The judge scored it 23 of 30 against 18 of 30. The judge's reason was that a maintainer adds a family by following the seven shape rules and the one ownership rule, and `CLASSES` and `FIXTURES` fail the build if the new export is unwired. The Grok design made each overlay a kit of slots (`Dialog.Trigger`, `Dialog.Actions`, `Tab`, `Menu.Item`). That leaves the widget's anatomy to the caller and needs two slot protocols, child parsing and `cloneElement`.

Grafts from the Grok design:

1. Re-project on every commit, and teach `enhanceTabs` and `enhanceMenu` to project. The Opus sketch froze the initial state and subscribed once, but React rewrites authored ARIA on controlled renders.
2. A described-by tooltip on links. The Opus design put tooltips on `Button` only, but `popover.css` allows `interestfor` on `a`. The graft keeps the tooltip as a prop on the invoker rather than the Grok `<Tooltip>` wrapper, which accepted any child.
3. React owns the combobox "No results" node. The Opus design left the module creating it inside a React-owned list.
4. `appendLogLine` fails closed on a React log, and blank names throw at the component boundary.

Must-fixes from the judge, taken:

- Fallbacks install from the components that need them, refcounted per root. The Opus design said so, but its sketch left `closedByFallback` page-level.
- `enhanceLog` gets a refcount in the Log commit, not a follow-up. Two observers are not one owner.
- Snapshots never pin `useId` spelling. They assert id relationships.
- Each family's HTML usage page gains its React call in the family commit, so the old markup does not read as a second way to build the widget.

Overruled:

- The judge asked for a stack of PRs. This plan keeps one PR, because the operator's autonomy grant says to open a PR and stop for merge OK. The commit order gives the review stop points. [Open decisions](#open-decisions) offers the stack.
- The judge asked to drop the Table Playground as visual work. The Done-when names the Table story holes, and the audit's Table item opens with the Playground, so it stays.

Rejected from the Grok design:

- `SURFACES` as a second prop table beside hand-written prop types. Two lists describe the same props, and nothing fails the build when they disagree.
- `toHtml` defined as `renderToStaticMarkup(scene())`. A parity test between the string and the same render cannot fail.
- `Shell` with no `odd-grid` on `main`. `shell.css` documents `main.odd-shell-main.odd-grid`.
- Controlled `open` on `Disclosure`. The repo measured that second writer going stale.

## Throughput checkpoint

- **Blocking first steps.** Caleb approves this plan. Then the baseline captures run before any source change. Commits 2 to 5 change the readers (the Storybooks, the contract, ESLint, and `own.ts` with the fixture test) and must land before any component writes markup that its row does not describe. Otherwise the first composite fails lint and breaks parity.
- **Independent workstreams.** After commit 5, each family commit touches its own `src/react/*.tsx`, its stories, and its usage page. Tooltip, HoverCard, and Log are separable from the Table work, and both are separable from the layout families.
- **Shared mutable state.** Every family commit also writes `src/react/index.ts`, `CLASSES` in `contract.ts`, `FIXTURES` in `tests/components.test.tsx`, `docs/usage/react.md`, `tests/react.test.tsx`, and the e2e pixel baselines. Splitting `FIXTURES` into one file per family would remove one of these, but the barrel, `CLASSES`, and the baselines cannot split.
- **Smallest safe decomposition.** One builder, serial, in commit order. Parallel builders would merge-conflict on the six shared files above in every commit, and each family commit re-baselines pixels that the next family's sweep reads. A fresh builder takes over at each phase boundary (after commit 5, after commit 11, after commit 16), with this plan, the prior builder's report, and the branch as its brief.

## Capture the baseline (no source change)

- [x] Build both Storybooks at `956e94e` with `bun scripts/storybooks.ts .verify/drop-in/base-sb`, serve the build, and capture each side with `bun scripts/capture-stories.ts` to `.verify/drop-in/base.json` and `base-react.json`. Result: the builder built both Storybooks at `1938607`, whose source equals `956e94e` (the commit between them adds only this plan), then served the build and captured each section in Firefox (`.verify/drop-in/base-head.txt`, `base-capture-html.log`, `base-capture-react.log`). The HTML section gave 164 captures, 82 stories in light and dark (`base.json`), and the React section gave 122, 61 stories in light and dark (`base-react.json`). The screenshots are in `.verify/drop-in/base-shots/`.
- [x] Run `bun run check`, `bun run build`, `bun scripts/consumer-smoke.ts`, and `bun run test:browsers` at `956e94e`. Record the pass counts and any known flake in `.verify/drop-in/base-gates.txt`. Result: `bun run check` passes 886 tests, `bun run build` exits 0, and the consumer smoke prints zero findings for its ESLint and Vitest runs (`base-check.log`, `base-build.log`, `base-smoke.log`). `bun run test:browsers` gives 137 passed, 5 skipped, and 0 failed (`base-browsers.log`). The five skips are by design. Three are the usage tests on WebKit, and two are the WebKit link-Tab tests. The usage sweep reads 143 stories with 0 diagnostics. The axe sweep covers only the HTML Storybook today, with 98 runs per engine and mode, 63 rules, 0 violations, and 0 overlays that did not open. No flake showed in this run. `base-gates.txt` holds the summary.

## Build

Each commit ends with `bun run check`. The boxes under a commit name its extra check. Commits that change behavior also run the named e2e tests in both Storybooks.

### Commit 1. `docs(plans): plan the React drop-in`

- [x] This file. The check is `bun run check`.

### Commit 2. `refactor(storybook): render both Storybooks from React`

Files: `.storybook/preview.ts` (render `renderToStaticMarkup(element)`, then one `enhance(canvasElement)` whose cleanup runs on the next render, replacing the five-enhancer list), `.storybook/main.ts`, `.storybook-react/preview.ts`, `stories/mirror.ts` (delete `toHtml` and its helpers), `src/react/props.ts` (deleted), `stories/catalog.ts` (`.tsx` stories, `renderHtml` through `renderToStaticMarkup`), `tests/stories.test.ts` (delete `expectSameDom` and the `type="button"` strip; add `checkRoot` over every story's static markup and the hydration test; the id pin becomes equality), `tests/mirror.test.ts`.

- [x] `bun test tests/stories.test.ts` passes with all 61 mirrored stories clean and hydrating. Result: 180 tests pass with 0 failures (`.verify/drop-in/build/c2-stories-test.log`, `c2-stories-junit.xml`). Each of the 82 HTML entries, including the 61 mirrored ones, runs `checkRoot` on its `renderToStaticMarkup` output. Each of the 61 mirrored stories has a `hydrates` test. It hydrates the `renderToString` output and expects no recoverable error and no React `console.error`. That second condition replaces the warning check that the deleted `expectSameDom` carried. The catalog pin now equals the sorted React id list. It gains the four Button ids the old `arrayContaining` pin missed (`link`, `sizes`, `states`, `variants`). A mutant that turned the Badge story's outer `div` into a `p` failed `Badge hydrates` with React's hydration-mismatch error for a `div` inside a `p` (`c2-hydration-proof.log`), and the story was then restored. `bun run check` passes 805 tests (`c2-check.log`). That is 886, less the 61 `html matches react` tests, the 61 duplicate React `checkRoot` tests, and 20 `toHtml` tests in `tests/mirror.test.ts`, plus the 61 hydration tests. Deviation: the separate React `checkRoot` loop is gone, because the HTML loop now checks the same static markup. Deviation: `.storybook/main.ts` now carries the `odd-design/react` Vite alias, and `.storybook-react/main.ts` reuses its `viteFinal`, because the HTML Storybook now imports the package. Deviation: a mirror's `scene` may return a React element, so a family commit can write its stories as TSX before commit 17. A throwaway `stories/mirrored/Proof.stories.tsx` with a JSX scene built in the HTML Storybook and rendered `<span class="odd-badge" data-tone="success">Legal</span>` in Firefox (`c2-tsx-proof-build.log`, `c2-tsx-proof.log`). That file was then deleted. Deviation: `tests/react-public-api.test.ts` drops its `WrapperProps` leak check with `src/react/props.ts`, and the README step that named `props.ts` goes too.
- [x] `bun run test:browsers -g "usage and mirror"` shows equal aria trees and pixels in both Storybooks. Result: the test passes in Firefox with 143 stories and 0 diagnostics (`.verify/drop-in/build/c2-usage-mirror.log`). A capture of this tree diffed against the baseline shows 46 HTML changes, which are 23 stories in two modes. All 46 are `dom` only, and each one disappears when ` type="button"` is removed (`c2-html-diff.txt`). No aria tree or screenshot changed in either section, and the React section has 0 changes (`c2-react-diff.txt`). The full `bun run test:browsers` gives 140 passed, 5 skipped, and 1 failed (`c2-browsers.log`). The failure is the Firefox hover-card test timing out under full-suite load, the flake `docs/follow-ups.md` records. It passed 10 of 10 alone, 5 times in each engine (`c2-hovercard-rerun.log`). The axe sweep now opens both Storybooks with the same `A11Y_TAGS`, `A11Y_OPTIONS`, and opener walk. The HTML side gives 98 runs per engine and mode, and the React side gives 71. Both sides show 63 rules, 0 violations, and 0 overlays that did not open, in Firefox and WebKit, light and dark. Deviation: the HTML preview keeps its page-wide `interestForFallback`, `closedByFallback`, and `avatarFallback` calls, because the HTML-only stories and the React Storybook still rely on them. A mirrored HTML story therefore gets each fallback twice, once on the document and once on the canvas from `enhance(canvasElement)`. Each one is idempotent, and the sweep above passes with both.
- Risk. `@storybook/html-vite` has to bundle `react-dom/server` and TSX. This commit proves it before any family moves. The HTML side now carries `type="button"`, which changes no aria tree or pixel.

### Commit 3. `refactor(usage): one class list and three React codes`

Files: `src/js/usage/contract.ts` (`CLASSES`, with `CLASS_REGISTRY` as `Object.keys(CLASSES)`), `src/js/usage/check.ts` (`ownAttributes` derived from `enum` and `boolean-attribute` rules), `src/js/usage/format.ts` (`ODD-REACT-001` to `003`), `docs/usage/react.md` (their anchors), `tests/usage-contract.test.ts` (a temporary guard that the derived own attributes equal the `WRAPPERS`-derived ones for every class).

- [x] `bun test tests/usage-contract.test.ts tests/usage-check.test.ts` passes. Result: 316 tests pass with 0 failures (`.verify/drop-in/build/c3-usage-tests.log`), and `bun run check` passes 807 tests (`c3-check.log`). `CLASSES` in `contract.ts` has 77 rows, one per class in the old registry, and `CLASS_REGISTRY` is `Object.keys(CLASSES)`. Each row's `by` names the exports that render the class today, from their `WRAPPERS` rows. 29 classes have no rendering export yet and an empty `by`. The four toast classes carry `via: "toast() from odd-design/enhance"`. `ExportName` is a hand-written union of the 48 rendering exports, because `contract.ts` cannot import React. `check.ts` exports `ownAttributes(className)`, the `data-` attributes of the `enum` and `boolean-attribute` rules in the group that places the class, and no longer reads `WRAPPERS`. `format.ts` adds `ODD-REACT-001` to `003`, and `react.md` adds a section for each. The messages test now lists them with `ODD-STATIC-003` as codes no `USAGE` rule emits. A mutant that put the `WRAPPERS` reader back in `ownAttributes` failed both new tests (`c3-mutant-wrappers.log`). Deviation: the guard pins the differences rather than equality. The derived set and the `WRAPPERS` rows agree on 74 classes. They differ on three, where the derived set is the complete one: `odd-combobox-list` gains `data-filter` (its `ODD-COMBOBOX-007` enum), `odd-eyebrow` gains `data-tone`, and `odd-heading` gains `data-size`. The heading and eyebrow groups have no `system-data` rule, so their difference changes no diagnostic. The list's difference adds one diagnostic. A misspelled `data-filtr` now gets "Did you mean data-filter?" on `ODD-COMBOBOX-012`, and a new `usage-check` test pins that message. Deviation: the type check that holds `ExportName` equal to the barrel lands with `FIXTURES` in commit 5, so the doc comment makes no claim about it until then.
- Risk. A class whose own attributes do not come from an enum. The guard names it, and the fix is an explicit `own` list on that group.

### Commit 4. `refactor(eslint): steer odd classes in JSX to components`

Files: `src/eslint/jsx.ts` (the `className` scanner that reports `ODD-REACT-003`), `src/eslint/plugin.ts` (the JSX path of `odd/usage-incomplete` goes), `eslint.config.js` (`src/react/**` exempt), `tests/eslint-jsx.test.ts`, `tests/fixtures/usage/jsx/*`, `docs/usage/eslint.md`, and `tests/grade.test.ts` fixtures if they relied on JSX findings.

- [x] `bun test tests/eslint-jsx.test.ts tests/grade.test.ts` and `bun run lint` pass. Result: 13 tests pass across the two files, and `bun run lint` exits 0 (`.verify/drop-in/build/c4-box1-tests.log`, `c4-lint.log`). `bun run check` passes 778 tests, which is 807 less the 41 old JSX fixture tests plus 12 new ones (`c4-check.log`). `jsx.ts` is now one `JSXAttribute` visitor. It reads every string literal in a `className` or `class` value, on any element, and reports each `odd-` word. A class in `CLASSES` reports `ODD-REACT-003`, followed by "Render X from odd-design/react." when `by` names exports, "Use toast() from odd-design/enhance." for a toast class, or "No odd-design/react component renders it yet." for a class with no owner. A word outside `CLASSES` reports `ODD-CLASS-001`. `plugin.ts` gives the JSX visitor to `odd/usage` only, so `odd/usage-incomplete` has no JSX path. `eslint.config.js` exempts `src/react/**` and `tests/react.test.tsx` by path, with no file-level disable. The six new fixtures cover a raw class and a component, every value shape (a string, a braced string, a template, `clsx` with a condition, and an object key), a router link, an unowned class, a toast class, an unknown class, and plain classes that must stay silent. The new tests also pin the exemption under `src/react/` and the silent `odd/usage-incomplete`. Against the old `jsx.ts` and `plugin.ts`, 8 of the 12 tests fail. The 4 that pass are the silent cases and the fixture list (`c4-mutant-old-jsx.log`). Without the config exemption, the `src/react` test fails (`c4-mutant-no-exempt.log`). The bad grade fixture swaps `<Button disabled>` for `<span className="odd-badge">`, so its `rules` row still fails, now on `ODD-REACT-003`. `<Button disabled>` is TypeScript's finding now, and the grade test mocks `tsc`. Deviation: the consumer smoke changes too, because its clean app linted a raw `odd-button` that now reports. Its bad `raw-button.tsx` is a typed raw `odd-button` that expects one `ODD-REACT-003` at column 43. Its clean one is a plain `button`. `bun run build` and `bun scripts/consumer-smoke.ts` both exit 0 (`c4-smoke.log`). Deviation: the sentences in `react.md`, `search.md`, `breadcrumb.md`, and `link.md` that said ESLint reads component JSX now name only the runtime checker, because they turned false in this commit. The API advice in those sections stays for each family commit. `eslint.md` replaces its wrapper tables with one "Check JSX" section that describes `ODD-REACT-003`.
- [x] A fixture with `className="odd-button"` on a `button` gives one `ODD-REACT-003` that names `Button`. A fixture with `<Button>` gives none. Result: `odd-react-003.bad.tsx` gives one `odd/usage` error at line 2, column 43, on `className="odd-button"`. Its message ends "Found odd-button. Render Button from odd-design/react." `odd-react-003.good.tsx` imports `Button` and gives none. Both are pinned in `tests/eslint-jsx.test.ts` (`c4-box1-tests.log`).
- Risk. Repo TSX that writes odd classes on purpose. The config scopes it by path, with no file-level disables.

### Commit 5. `feat(react): add own.ts, the contexts, and the component fixture test`

Files: `src/react/own.ts` and `src/react/context.tsx` (new), `OddProvider` in the barrel, `src/js/fallbacks.ts` (per-root refcount), `tests/components.test.tsx` (new, with `FIXTURES` over every current export and its five checks), `tests/react.test.tsx` (the markup table moves into `FIXTURES`, and the behavior pins stay).

- [x] `bun test tests/components.test.tsx` passes for every current export, including id resolution on today's hand-wired fixtures. Result: 105 tests pass with 0 failures (`.verify/drop-in/build/c5-components.log`, `c5-components-junit.xml`). `FIXTURES` is typed `{ readonly [K in ExportName]: readonly [Fixture, ...Fixture[]] }`, so each of the 48 rendering exports needs at least one fixture to compile. A type assertion holds `ExportName` equal to the barrel's value exports minus `OddProvider`. With `OddProvider` left out of that list, `tsc` fails (`c5-type-mutant.log`). The 55 fixtures each get one test. It pins the static markup when the fixture carries one and runs `checkRoot`. It checks that every `odd-` class in the output belongs to the export, to an export the fixture `uses`, or to its `writes` list, and that every `for`, `aria-labelledby`, `aria-describedby`, `aria-controls`, `commandfor`, `interestfor`, and `form` token names an element inside the fixture. Last, it hydrates the `renderToString` output with no recoverable error and no React warning. Each export also gets a test that its fixtures render every class `CLASSES` gives it. Two global tests check that `writes` names only classes with an empty `by`, and that no fixture's static markup has a `style` attribute (gate 3). The 36 rows of the old markup table move in with their pins. 34 are unchanged. The Button invoker row gains its tooltip and dialog targets so its `commandfor` and `interestfor` resolve. The Skeleton row drops its inline `style`. 19 small fixtures are new, so each part the old table only nested (Label, Hint, FieldError, AlertTitle, CardLink, CardFooter, and the rest) is a subject once. Each check failed against its own mutant (`c5-mutants-components.log`). An inline `style` on Skeleton failed the style test, and an `interestfor` naming no element failed id resolution. Dropping `writes: ["odd-card-title"]` failed the class check. Adding `Button` to `odd-badge`'s `by` failed Button's coverage test, and a fixture that writes `odd-button` failed the `writes` test. A `pre` inside a `p` failed hydration. `bun run check` passes 849 tests (`c5-check.log`). `bun run build` and the consumer smoke exit 0, and `dist/react/context.js` and `provider.js` start with `"use client"` (`c5-smoke.log`). The full `bun run test:browsers` gives 141 passed, 5 skipped, and 0 failed (`c5-browsers.log`). The usage sweep reads 143 stories with 0 diagnostics. The axe sweep gives 98 runs per engine and mode on the HTML side and 71 on the React side, with 0 violations and 0 unopened overlays. Deviation: the plan's `src/react/context.tsx` is two files. `context.ts` holds the private `TriggerContext`, `OverlayContext`, `LinkContext`, and `Anchor` under `"use client"`. `provider.tsx` holds `OddProvider`, written in JSX, so the HTML Storybook now bundles JSX on every build. They are split because `tests/react-public-api.test.ts` holds every `.tsx` export equal to the barrel. Deviation: under gate 3, `own.ts` has no `style` prop. `Root` is `{ className?: string }`, and `Passthrough` omits `style`. Deviation: `own.ts` declares `process` locally for `rejectBlank`'s `NODE_ENV` read, because the declaration emit runs with no Node types. Deviation: `useFallback`, `rejectBlank`, `idsOf`, `mergeIds`, `cx`, `useOddId`, `TriggerContext`, and `OverlayContext` ship with the plan's shapes but no caller until the family commits, and `rejectBlank` has no test until its first caller. Deviation: `part.ts` now re-exports `Message` and `Values` from `own.ts`, so each type exists once. Deviation: the consumer smoke reads its export list from the barrel, which commit 17 planned, because `OddProvider` has no `WRAPPERS` row. Deviation: the lint exemption moves from `tests/react.test.tsx`, which no longer writes `odd-` classes in JSX, to `tests/components.test.tsx`. The hydration helper is shared from `tests/hydrate.ts`.
- [x] A unit test calls `interestForFallback` twice on one root and once through `enhance()`, then counts one set of document listeners. Result: `platform fallbacks` in `tests/react.test.tsx` wraps `document.addEventListener` and `removeEventListener`. It calls `interestForFallback()` twice, `closedByFallback()` once, and `enhance(document)` once. It counts one each of `pointerover`, `pointerout`, `focusin`, `focusout`, and `keydown`, and one `click`. It releases three of the holds and counts no interest listener removed, then releases the last and counts all five removed (`.verify/drop-in/build/c5-units.log`). `fallbacks.ts` wraps both fallbacks in one `perRoot` holder, a `WeakMap` from root to a count and a stop function, and the first caller on a root sets the delays. The `fallbacks.ts` from before this commit failed the test (`c5-mutants-units.log`). The README notes the refcount.
- [x] A unit test mounts a fake enhancer through `useEnhancer` under StrictMode, re-renders, and reads the holder's value on the node rather than the value React rendered. Result: `useEnhancer` in `tests/react.test.tsx` renders `<div data-value={value}>` through a refcounted fake enhancer under `StrictMode`. It sets the holder to `picked` as a user choice would, then re-renders with `value="second"`. It reads `data-value="picked"` and one live subscription, and 0 after unmount (`.verify/drop-in/build/c5-units.log`). `useEnhancer` is two layout effects. The `[]` effect holds the enhancer, and the every-commit effect calls it and releases its own call at once, so the first effect is the one owner of the refcount. Removing the every-commit effect failed the test with `second` on the node. Making that effect keep its hold failed it with a live subscription left after unmount (`c5-mutants-units.log`).

### Commit 6. `feat(react): Button owns its name, tooltip, busy, and trigger wiring`

Files: `src/react/button.tsx`, `USAGE.tooltip` (ODD-TOOLTIP-001), `docs/usage/tooltip.md`, HTML fixtures and `places` rows, `stories/mirrored/Button.stories.tsx`, `stories/mirrored/Tooltip.stories.tsx` (replacing the `Overlays.stories.ts` Tooltip export with the same id, plus `Open`), every scene that passed `aria-*` to `Button`, type fixtures (`button-aria-label`, `button-icon-only-unnamed`, `button-label-visible-text`, `button-current-not-link`), the `react.md` Button section, and `button.md`.

- [ ] `bun test tests/components.test.tsx` shows tooltip references resolving and ODD-TOOLTIP-001 clean.
- [ ] `bun run test:browsers -g "tooltip"` passes in both Storybooks, including Firefox and WebKit through the self-installed fallback with no `enhance()` call on the React side.
- Risk. The widest caller churn. Icon-only buttons gain a tooltip, which changes Menu and Sheet pixels on purpose. Re-baseline those pixels in this commit only.

### Commit 7. `feat(react): field controls and choices own their pairing`

Files: `src/react/field.tsx` (private `FieldFrame`, plus `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `RadioGroup`, `Segmented`), `src/react/choice.tsx` folded in, `Field`, `Label`, `Hint`, `FieldError`, and `Choice` deleted from the barrel, `CLASSES.by` updated, `choice.css` (`fieldset:has(> .odd-choice)` reset, see [Open decisions](#open-decisions)), Field and Choice stories as TSX, type fixtures (`input-unnamed`, `input-owned-aria`), `react.md`, `field.md`, `choice.md`.

- [ ] `bun test tests/components.test.tsx` shows `for` to `id` and `aria-describedby` to hint and error ids resolving.
- [ ] `bun run test:browsers -g "hover darkens an enabled input"` and the forms pairs in the usage sweep pass.

### Commit 8. `feat(react): Search, Slider, and Combobox on the field frame`

Files: `src/react/search.tsx`, `slider.tsx` (`showValue` renders `output.odd-stat-value`), `combobox.tsx` (`ComboboxList` deleted, the "No results" option rendered), `src/js/combobox.ts` (stops creating the empty node and toggles its `hidden`), `src/react/icons.ts`, stories as TSX, the Combobox block in `tests/react.test.tsx`, `tests/combobox.test.ts`, `react.md`, the three usage pages.

- [ ] `bun test tests/react.test.tsx tests/combobox.test.ts` passes. The enhancer test that appended a node now expects `hidden` toggled on `${listId}-empty` and no `append`.
- [ ] The six Combobox e2e tests and the slider test pass in both Storybooks.
- Risk. The enhancer change and the component change land together. Either one alone brings back the `NotFoundError` class of bug.

### Commit 9. `feat(react): Dialog, AlertDialog, Sheet, and Popover own their titles and triggers`

Files: `src/react/dialog.tsx`, `sheet.tsx`, `popover.tsx`, `DialogActions`, `SheetHeader`, and `SheetFooter` deleted, `useFallback(closedByFallback)` when `dismissible`, stories as TSX with opened-in-`play` variants for Dialog, AlertDialog, and Popover, type fixtures (`alert-dialog-dismissible`, `alert-dialog-no-description`, `dialog-no-title`, `popover-role`), `react.md`, the three usage pages.

- [ ] `bun test tests/components.test.tsx` shows the trigger's `commandfor` to the dialog id, `aria-labelledby` to the title, and the submit button's `form` to the body form, all resolving.
- [ ] The e2e tests `a dialog with closedby=any…`, `an alert dialog ignores backdrop clicks…`, `sheets fill the edge…`, and `a popover anchors under its invoker…` pass in both Storybooks.
- Risk. A dialog rendered after its trigger must not land inside a `p`. The hydration test catches it.

### Commit 10. `feat(react): Menu owns its roles, items, and trigger`

Files: `src/react/menu.tsx` (`Menu` with `trigger` and `label`, and the item, checkbox, radio, separator, and group parts), `src/js/menu.ts` (a second live call projects holder state), stories as TSX, the Menu block in `tests/react.test.tsx` (including one menu with a generated id run through `enhanceMenu`), `react.md`, `menu.md`.

- [ ] A unit test checks a checkbox item, re-renders the parent, and reads `aria-checked="true"`.
- [ ] The e2e tests `the menu opens on ArrowDown…` and `ArrowDown opens the menu after the HTML story renders it again` pass in both Storybooks.

### Commit 11. `feat(react): add HoverCard, and TextLink gains router links and tooltips`

Files: `src/react/hover-card.tsx`, `text-link.tsx`, `USAGE.hoverCard` (ODD-HOVER-CARD-001), `docs/usage/hover-card.md`, fixtures and `places` rows, `stories/mirrored/HoverCard.stories.tsx` (same id, hover `play`), `stories/Overlays.stories.ts` deleted, Link stories as TSX, an `OddProvider` unit test with a fake router link, `react.md`, `link.md`.

- [ ] The e2e test `a hover card opens under its link and stays open while the pointer is inside it` passes in both Storybooks.
- [ ] The `OddProvider` test sees `TextLink`, `Button href`, `Card href`, and `Breadcrumb` render through the fake router link.
- [ ] The hydration test passes with no `div` inside a `p`.
- Risk. The known Firefox hover-card flake (`follow-ups.md`). If it recurs, the PR body gets its evidence line.

### Commit 12. `feat(react): Tabs and Disclosure own their structure`

Files: `src/react/tabs.tsx` (the `tabs` items array, `defaultValue`, `onValueChange`, `useEnhancer`), `src/js/tabs.ts` (a second live call projects holder state), `src/react/disclosure.tsx` (`summary`, `defaultOpen`), stories as TSX, the Tabs block in `tests/react.test.tsx`, a type fixture (`tabs-default-value-unknown`), `react.md`, `tabs.md`, `disclosure.md`.

- [ ] A unit test clicks the second tab, re-renders the parent, and reads `aria-selected="true"` on the second tab with only its panel shown.
- [ ] The e2e test `tabs follow the arrow keys, and manual tabs wait for Enter` passes in both Storybooks.
- Risk. A static initial `tabIndex` that disagrees with `enhanceTabs`' roving start. The e2e Tab-order step is the check.

### Commit 13. `feat(react): Table owns its structure, and its story holes close`

Files: `src/react/table.tsx`, `TableWrap` and `TableSort` deleted, `stories/mirrored/Table.stories.tsx` (Playground, plus the `TableParts` and `TableStates` additions in [Table and keeper story holes](#table-and-keeper-story-holes)), the Table block in `tests/react.test.tsx`, `e2e/usage.spec.ts` (the Table Playground sweep), `react.md`, `table.md`.

- [ ] Unit tests pin the sort button as the `th`'s only child, one `aria-sort`, select-all inside `thead`, a `mixed` header after a row is added, a disabled row skipped by select-all, and `caption=""` throwing ODD-TABLE-003.
- [ ] The e2e test `select-all checks every row, shows mixed, and clears` and the Table Playground sweep pass in both Storybooks.

### Commit 14. `feat(react): add Log`

Files: `src/react/log.tsx`, `src/js/log.ts` (`enhanceLog` refcount, and `appendLogLine` throws on `data-owner="react"`), `USAGE.log` and `USAGE.logLine` (ODD-LOG-001 to 004), `docs/usage/log.md`, fixtures and `places` rows, `stories/mirrored/Log.stories.tsx` (same id, Variants, adding lines in `play`), the `Feedback.stories.ts` Log export moved, the Log block in `tests/react.test.tsx`, `react.md`.

- [ ] Unit tests show `Log` wired once beside `enhance(document)` under StrictMode, the newest line pinned after a `lines` update, and `appendLogLine` throwing on a React log.
- [ ] The e2e test `the log follows new lines until the reader scrolls up` passes in both Storybooks.
- [ ] The hydration test passes with a `Date` time, where `suppressHydrationWarning` is the only exception.

### Commit 15. `feat(react): display components own their names`

Files: `badge.tsx`, `alert.tsx` (`AlertTitle` deleted), `avatar.tsx` (`name`, `initials`, `decorative`, the React fallback), `separator.tsx`, `skeleton.tsx`, `spinner.tsx` (`label`), `meter.tsx` (`label`, `StatValue`), `breadcrumb.tsx` (`items`), `kbd.tsx`, `code.tsx`, `toast.tsx` (`label`), stories as TSX, the Avatar block in `tests/react.test.tsx`, `react.md`, the usage pages.

- [ ] A unit test fires `error` on the Avatar `img` and reads initials with `role="img"` and a name.
- [ ] The breadcrumb, keycap, code-wrap, spinner-timing, progress and meter, and reduced-motion e2e tests pass in both Storybooks.

### Commit 16. `feat(react): Card, typography, layout, Scope, and Shell`

Files: `card.tsx` (`CardLink` and `CardFooter` deleted), `layout.tsx` (new), the HTML-only Typography, Grid, Shell, and Base utilities stories as mirrored TSX with their ids kept, the App Shell story onto `Shell`, `react.md`, the usage pages.

- [ ] The e2e test `the app grid narrows panels to half, then to one column, by its own width` passes in both Storybooks.
- [ ] `bun test tests/stories.test.ts` lists the new mirrored ids.

### Commit 17. `refactor(react): delete WRAPPERS and the scene vocabulary`

Files: `WRAPPERS`, `Wrapper`, and `WrapperElement` out of `contract.ts`, `src/react/part.ts` deleted, the scene vocabulary, `toReact`, and `mirrorOf` out of `stories/mirror.ts` and `stories/mirror-react.ts` (replaced by `stories/story.ts`), `stories/catalog.ts`, `git mv stories/mirrored stories/components` with the `STORYBOOKS` globs updated, the commit 3 guard removed, `scripts/consumer-smoke.ts` (`REACT_EXPORTS` from the barrel and `CLIENT_MODULES` from scanning `dist/react`), `scripts/primitive-fitness.ts` (reads `CLASSES`), `docs/follow-ups.md`, the superseded-decision lines in the older plans.

- [ ] `rg WRAPPERS src stories tests scripts` prints nothing.
- [ ] `bun run check`, `bun run build`, `bun scripts/consumer-smoke.ts`, and `bun run test:browsers` pass.

## Verify on the real surface

- [ ] Rebuild both Storybooks, capture to `after.json` and `after-react.json`, and diff each against its baseline. Pass means every change is explained. Expected changes are `type="button"` on HTML buttons, the tooltip spans and pixels on icon-only buttons, new ids and ARIA where components now own wiring, the new and moved story ids, and the Table, Log, Tooltip, HoverCard, and opened-dialog stories.
- [ ] Run `bun run test:browsers`. Pass means Firefox and WebKit pass with 0 diagnostics and 0 axe violations.
- [ ] Drive both Storybooks with the verify-odd-design skill. In the React Storybook, read the accessibility tree for Tabs, Dialog opened, Menu opened, Tooltip open, HoverCard open, Log, and Table, and confirm every name and relationship. Confirm in Firefox that a tooltip opens on hover and focus with no `enhance()` call in React. Sweep `calm`, `glass`, and `expressive` in light and dark on Table and Dialog.
- [ ] Run `sr.ts` with the tabs and menu scenarios against the React Storybook, and compare NVDA's speech with the baseline transcripts.

## Review and open the PR

- [ ] The `cursor grok-4.7` reviewer reads the diff against this plan. A fresh builder fixes each blocking finding. Other findings go to `docs/follow-ups.md`.
- [ ] Run `/deslop` and `/no-comments` over the diff.
- [ ] Open the PR ready with `gh pr create --base main --repo Rakvadium/odd-design`. The body lists the review stop points (after commit 5, after each family commit, and commit 17) and the gate results.
- [ ] Stop for Caleb's merge OK. Do not merge.

## Risks

- PR size. The diff touches every file under `src/react`, every mirrored story, `jsx.ts`, `contract.ts`, and both Storybook previews. Each commit is green on its own, and review can stop after any family commit.
- `useId` characters (`«r0»` in React 19) inside selectors. Every selector built from a generated id uses `CSS.escape`, and commit 10 runs a generated-id menu through `enhanceMenu`.
- `@storybook/html-vite` bundling `react-dom/server`. Commit 2 proves it before anything else moves.
- Enhancer re-entry. If `enhanceTabs` or `enhanceMenu` resets state on a second call, its family commit fixes the enhancer before its test can pass.
- The HTML Storybook now depends on React at render time, which reverses `mirror-storybooks.md:164`. The canvas still runs no React, so the e2e pair sweep still proves the compiled HTML and vanilla JS work alone.
- `Log` times differ between server and client time zones. `suppressHydrationWarning` on `time` is React's documented answer, and the hydration test allows only that.
- English defaults (`closeLabel="Close"`, "Breadcrumb", "opens in a new tab") ship as props with English values. Localizing them is follow-up 4.
- A consumer's `className` moves to the outermost element, which differs from today on some families. The package is unpublished, so the only callers are in this repo, and `tsc` plus the story sweep cover them.

## Open decisions

Each has a default the build uses unless Caleb says otherwise.

1. **Delivery.** The default is one PR with review stop points, as the autonomy grant says. You could ask instead for a stack of PRs: readers (commits 2 to 5), then one PR per family, then the deletion. Each layer would land on `main` in order. Each layer leaves every family with exactly one API, so `main` is coherent between layers. The cost is a merge OK per layer and a restack after each squash merge.
2. **Icon-only buttons always show their name as a tooltip.** The default is yes. Sighted mouse users get the name, and the type keeps `label` required. You could ask instead for a `tooltip={false}` escape, which renders the name as `aria-label` with no tooltip. That adds a second naming path.
3. **`ODD-REACT-003` is an error for every `odd-*` class in JSX**, including layout utilities like `odd-stack`, because `Stack` and `Row` now exist. You could ask instead for a warning on layout utilities, for apps moving off raw markup.
4. **`RadioGroup` adds a `fieldset:has(> .odd-choice)` reset to `choice.css`.** Today's story inlines `border: 0; padding: 0; margin: 0`. The reset adds no class. You could ask instead to ship `Checkbox` alone and move `RadioGroup` to a follow-up with no CSS change.
5. **Hand-written HTML stays supported.** `USAGE`, `html.ts`, and every rule stay, and each HTML usage page is relabeled as the compiled output of a component. You could decide instead that HTML is only a compile target. A later PR would then stop documenting hand-written markup.
6. **`OddProvider` ships in this PR**, so `TextLink`, `Card href`, and `Breadcrumb` render through a Next.js or React Router link. Without it, those links do a full page load, and a consumer cannot swap the anchor because the component owns it. You could ask instead to defer router links to a follow-up.
