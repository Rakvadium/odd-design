# Data display

Data display components present content: the `.odd-table` inside a focusable, scrollable `.odd-table-wrap`, where checking a row's checkbox tints the row and `.odd-table-sort` buttons show the `aria-sort` state; `.odd-avatar` images and initials (alone or in a `.odd-avatar-group`) whose shape follows the chrome; and `.odd-separator` lines, horizontal or vertical, announced as separators.

## Sub-features

- `table-select`: clicking a row's checkbox checks it and tints that row; unchecked rows stay clear.
- `table-structure`: the wrapper is a named, focusable region; the sorted column shows an arrow and the others a neutral indicator; numeric columns right-align.
- `avatar-names`: image avatars are named by `alt`, initials avatars by `aria-label`, and an avatar next to a visible name is hidden.
- `avatar-shape`: avatars are round in calm and bubblegum and nearly square in holoterminal. Grouped avatars overlap without covering each other's initials.
- `separator`: each `<hr class="odd-separator">` is a `separator` in the tree, and vertical ones sit between inline links.

## How to get to it (user POV)

- In Storybook, open **Components → Data Display**, which has Table, Avatar Fallback, Avatar, and Separator. Avatar and Separator sort last because they load from `stories/mirrored/`.

## Driving it with ctl.ts

Preconditions:

- The baseline from the README.

- **Row selection.** Run `bun $S goto components-data-display--table "mode:light"` and capture `data/table-before.png`. Run `bun $S click 'input[aria-label="Select Tidecaller"]'`. `bun $S eval '[...document.querySelectorAll(".odd-table tbody tr")].map(r => [r.querySelector("th").textContent, r.matches(":has(input:checked)")])'` shows `Ember Aggro` and `Tidecaller` as `true`. Capture `data/table-after.png`: both rows are tinted.
- **Table structure.** Run `bun $S aria data/table.aria.txt`. It shows `region "Your decks, sorted by name"` containing `table "Your decks, sorted by name"`, `button "Deck"`, and `checkbox "Select Ember Aggro" [checked=true]`. Run `bun $S press Tab` once from a fresh `goto`. Focus lands on the `.odd-table-wrap` region first.
- **Avatar names.** Run `bun $S goto components-data-display--avatar` and `bun $S aria data/avatar.aria.txt`. It shows `image "Ana Rojas"`, `image "Kai Nakamura"`, `group "Collaborators"`, and `image "and 3 more"`. The `MO` avatar beside "Mira Okafor" is absent.
- **Avatar shape and group.** Capture `data/avatar-calm.png` with `chrome:calm` and `data/avatar-holo.png` with `chrome:holoterminal`. Read both: the avatars are round, then nearly square. In the group, every avatar's initials are fully visible. `bun $S eval '[...document.querySelectorAll(".odd-avatar-group > .odd-avatar")].map(a => Math.round(a.getBoundingClientRect().left))'` steps evenly (`[16, 48, 80, 112]` in calm).
- **Separator.** Run `bun $S goto components-data-display--separator` and `bun $S aria data/separator.aria.txt`. It lists four `separator` entries, two of them between the links `Edit`, `Duplicate`, and `Export`.

## React Avatar

Build the composed Storybook and serve it, as in the React Field section of `forms.md`. Open `http://127.0.0.1:6106/?path=/story/react_components-data-display--avatar`. The preview is the Avatar story built from `Avatar` and `AvatarGroup`, the same as `components-data-display--avatar`. Table has no React wrapper, so it appears only in the HTML section. The broken-image fallback is HTML-only too, as **Avatar Fallback**, because `avatarFallback` replaces children React rendered.

Run the pair sweep with `bunx playwright test e2e/usage.spec.ts --project firefox`. The Avatar pair matches the `aria` literal in `stories/mirrored/Avatar.stories.ts`, and the two screenshots are byte-identical.

## React Separator

In the same composed Storybook, open `http://127.0.0.1:6106/?path=/story/react_components-data-display--separator`. The preview is the Separator story built from `Separator`, the same as `components-data-display--separator`. The pair sweep matches the `aria` literal in `stories/mirrored/Separator.stories.ts`: four `separator` entries, two of them between the links. Firefox prints no orientation on a separator, so the screenshot pair is what proves the vertical lines.

## Gotchas

- Row tint uses a background transition. Read colors after a moment, or assert on `:has(input:checked)` rather than the exact color.
- The aria snapshot does not print `aria-sort`. Prove sort state with `bun $S eval 'document.querySelector("[aria-sort]").getAttribute("aria-sort")'`, which returns `"ascending"`.
- The table rows link to `#`. Click the checkbox, not the deck name, or you navigate.
