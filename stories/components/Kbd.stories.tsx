import type { ReactNode } from "react";
import { Kbd, Row, Stack } from "odd-design/react";
import { mirrored } from "../story.ts";

type Args = {
  keys: string;
};

const meta = {
  title: "Components/Kbd",
  args: { keys: "Ctrl K" },
  parameters: {
    docs: {
      description: {
        component:
          "`Kbd` from `odd-design/react` renders `kbd.odd-kbd`, a key drawn as a keycap in running text and read with the sentence. Write one `Kbd` per key, side by side, and write the key's name rather than a glyph. The cap follows the font size around it and leaves the line height alone. A shortcut hint at the end of a menu item is `MenuItem`'s `shortcut` instead, which is hidden.",
      },
    },
  },
};

export default meta;

function keysOf(text: string): ReactNode[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((name, index) => (index === 0 ? [<Kbd key={index}>{name}</Kbd>] : [" ", <Kbd key={index}>{name}</Kbd>]));
}

export const Playground = mirrored<Args>({
  scene: ({ keys }) => <p>Press {keysOf(keys)} to search.</p>,
  aria: `- paragraph: Press Ctrl K to search.`,
});

export const Parts = mirrored<Args>({
  scene: () => (
    <Stack>
      <p>Press {keysOf("Ctrl K")} to search.</p>
      <p>
        <Kbd>Esc</Kbd> closes the dialog.
      </p>
      <p>{keysOf("Shift Tab")} moves focus back.</p>
    </Stack>
  ),
  aria: `
- paragraph: Press Ctrl K to search.
- paragraph: Esc closes the dialog.
- paragraph: Shift Tab moves focus back.`,
});

const SHORTCUTS: readonly (readonly [keys: string, action: string])[] = [
  ["Ctrl K", "Search"],
  ["Ctrl S", "Save"],
  ["Esc", "Close the dialog"],
];

export const ShortcutList = mirrored<Args>({
  scene: () => (
    <Stack as="dl">
      {SHORTCUTS.map(([keys, action]) => (
        <Row key={keys}>
          <dt>{keysOf(keys)}</dt>
          <dd>{action}</dd>
        </Row>
      ))}
    </Stack>
  ),
  aria: `
- term: Ctrl K
- definition: Search
- term: Ctrl S
- definition: Save
- term: Esc
- definition: Close the dialog`,
});
