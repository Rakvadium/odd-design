# React Button session transcript

An agent drove the composed Storybook in T3's browser (Chromium) and recorded it as `react-button-session.mp4`. The build is the branch's `bun scripts/storybooks.ts .verify/playwright/storybook`, served by `bun e2e/serve.ts .verify/playwright/storybook 6106`. Recording ran from 2026-10-23 22:02:28 UTC to 22:04:57 UTC.

Each step names what the agent did and what it read back from the page.

| Step | Action | Observed |
| --- | --- | --- |
| 1 | Open `/?path=/story/react_components-button--variants` | The sidebar shows About, an HTML section, and a React section. The React section holds Components / Button with Playground, Variants, Sizes, States, and Link. |
| 2 | Hover Primary, Secondary, Default, Ghost, and Delete in the React Variants story | Each button shows its hover state. |
| 3 | Click Primary, then Delete | Both take the press. |
| 4 | Click Primary, press Tab three times, press Enter, press Space, press Tab | Focus ends on `<button type="button" class="odd-button" data-variant="danger">` (Delete). The button matches `:focus-visible` with a `solid 2px` outline. |
| 5 | Open React Sizes. Hover and click Small, Medium, and Large. Hover Settings. Press Tab twice | Heights are 32, 40, and 48 px for `sm`, `md`, and `lg`. Settings and Add card carry `data-icon-only` and are 40 px. Focus ends on Add card, named by its `aria-label`. |
| 6 | Open React States. Click Saving. Press Tab | Focus moves to the first Unavailable button, `<button aria-disabled="true" type="button" class="odd-button" data-variant="primary">`. It has no `disabled` attribute, and its cursor is `not-allowed`. |
| 7 | Press Enter on Unavailable, then click it | A click listener on the document saw the click with `defaultPrevented: true`, so `Button` swallowed it. The story URL did not change. Playwright's own click refuses the element because it treats `aria-disabled="true"` as disabled, so the agent clicked at the button's coordinates. |
| 8 | Open React Playground. In Controls, choose variant secondary, ghost, danger, and default | With `default`, the root is `<button type="button" class="odd-button">Save changes</button>`, with no `data-variant`. |
| 9 | Choose size sm, then lg. Choose variant primary | The root is `<button type="button" class="odd-button" data-size="lg" data-variant="primary">Save changes</button>`. |
| 10 | Turn on disabled, then busy | The root is `<button type="button" class="odd-button" data-size="lg" data-variant="primary" aria-disabled="true" aria-busy="true">Save changes</button>`. The manager URL ends in `args=size:lg;disabled:!true;busy:!true`. |
| 11 | Open React Link. Hover Docs. Click Decks | The links are `<a href="#docs" class="odd-button" data-variant="secondary">` and `<a href="#decks" aria-current="page" class="odd-button" data-variant="ghost">`. The click navigated the tab to `react/iframe.html?...#decks`, because Storybook's preview frame has `<base target="_parent">`. |
| 12 | Press Tab, then Enter | Focus is on the `A` element named Docs. Enter moved the URL to `...#docs`. |
| 13 | Open HTML Variants. Hover and click Primary | The HTML Primary button behaves like its React twin. Screenshot `composed-sidebar.png`. |

The Firefox pair sweep in `e2e/usage.spec.ts` checks the same stories automatically. It printed `[firefox] 42 stories, 0 diagnostics` on the same build.
