# Navigation

Text links are `a.odd-link` with an `href`. A resting link looks like every bare `a`: the primary color with an underline. The link with `aria-current="page"` takes the text color and drops its underline, so it differs from the other links by two cues, not by color alone. In forced colors both links take `LinkText`, and only the current link loses its underline. A breadcrumb is a named `nav.odd-breadcrumb` around an `ol` of those links, with a slash between crumbs that the accessibility tree does not read.

## Sub-features

- `link-current`: in `components-link--states`, "Settings" keeps the primary color and its underline, and "Roadmap" (`aria-current="page"`) takes `--foreground` and no underline, in every chrome, palette, and mode.
- `link-in-text`: in `components-link--in-text`, both links sit inside one paragraph, and Tab reaches "setup guide" and then "Settings".
- `link-playground`: in `components-link--playground`, the `current` arg is `none` or `page`, and `page` sets `aria-current="page"`.
- `link-forced-colors`: under `forced-colors=active`, the resting link keeps its underline and the current link has none.
- `breadcrumb-slashes`: in `components-breadcrumb--parts`, a `/` sits between crumbs, and the tree reads `navigation "Breadcrumb"` with links and no slash. The second trail reads `listitem: Archived` for its plain level.
- `breadcrumb-current`: the last crumb of each trail takes the text color and no underline, and the crumbs before it keep the link look.
- `breadcrumb-wrapping`: in `components-breadcrumb--wrapping`, five levels in a 16rem box wrap onto more lines, and each slash stays beside its crumb.
- `breadcrumb-playground`: in `components-breadcrumb--playground`, `levels` from 1 to 5 sets the number of crumbs, and the last is always current.

## How to get to it (user POV)

- In Storybook, open **Components → Link**, which has Playground, States, and In Text. The React section of the composed Storybook has the same three, built from `TextLink`.
- In Storybook, open **Components → Breadcrumb**, which has Playground, Parts, and Wrapping. The React section builds them from `Breadcrumb` and `TextLink`.

## Driving it with ctl.ts

Preconditions:

- The baseline from the README.

- **Current look.** Run `bun $S goto components-link--states "mode:light"` and capture `navigation/link-states-light.png`. Then run `bun $S eval '[...document.querySelectorAll(".odd-link")].map(a => [a.textContent, getComputedStyle(a).textDecorationLine])'`, which returns `[["Settings","underline"],["Roadmap","none"]]`. Repeat with `mode:dark` and with each chrome.
- **Accessibility tree.** Run `bun $S aria navigation/link-states.aria.txt`. It shows `link "Settings"` and `link "Roadmap"`, each with its `/url`.
- **Tab order.** Run `bun $S goto components-link--in-text`, then `bun $S press Tab` twice, reading `bun $S state` after each. Focus moves to "setup guide" and then to "Settings".
- **Playground.** Run `bun $S goto components-link--playground "" "current:page"` and `bun $S eval 'document.querySelector(".odd-link").getAttribute("aria-current")'`, which returns `"page"`.
- **Forced colors.** Run `bun $S emulate forced-colors=active`, then `bun $S goto components-link--states`, and capture `navigation/link-forced.png`. "Settings" is underlined and "Roadmap" is not. Clear with `bun $S emulate`.
- **Breadcrumb.** Run `bun $S goto components-breadcrumb--parts "mode:light"`, capture `navigation/breadcrumb-parts-light.png`, and run `bun $S aria navigation/breadcrumb-parts.aria.txt`. It shows three `navigation` landmarks, "Breadcrumb", "Settings breadcrumb", and "Home breadcrumb", with no `/` outside the `/url` lines. `bun $S eval '[...document.querySelectorAll(".odd-breadcrumb li")].slice(0, 3).map(li => getComputedStyle(li, "::before").content)'` returns `["none","\"/\" / \"\"","\"/\" / \"\""]`. On `components-breadcrumb--wrapping`, capture `navigation/breadcrumb-wrapping-light.png`. The trail takes more than one line.

## Gotchas

- An engine without alt text in `content` drops the whole `content: "/" / ""` declaration and draws no slashes. The crumbs still read in order.
- `list-style: none` on the `ol` may make VoiceOver drop the list. Playwright's snapshot computes roles itself, so it cannot show that.
- WebKit on this host does not move Tab to links, so `e2e/behavior.spec.ts` checks tab order in Firefox only.
- The bare `a` in `base.css` draws the resting look, so a story without `odd-link` looks the same at rest. Only the current-page look needs the class.
