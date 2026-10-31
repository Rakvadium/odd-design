import { mirrored, type Node } from "../mirror.ts";

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
          "`Kbd` from `odd-design/react` renders `kbd.odd-kbd`, a key drawn as a keycap in running text and read with the sentence. Write one `Kbd` per key, side by side, and write the key's name rather than a glyph. The cap follows the font size around it and leaves the line height alone. A shortcut hint at the end of a menu item is `kbd.odd-menu-shortcut` instead, which is hidden.",
      },
    },
  },
};

export default meta;

const key = (name: string): Node<"Kbd"> => ({ of: "Kbd", children: [name] });

function keysOf(text: string): (string | Node<"Kbd">)[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((name, index) => (index === 0 ? [key(name)] : [" ", key(name)]));
}

export const Playground = mirrored<Args>({
  scene: ({ keys }) => ({ of: "p", children: ["Press ", ...keysOf(keys), " to search."] }),
  aria: `- paragraph: Press Ctrl K to search.`,
});

export const Parts = mirrored<Args>({
  scene: () => ({
    of: "div",
    props: { className: "odd-stack" },
    children: [
      { of: "p", children: ["Press ", ...keysOf("Ctrl K"), " to search."] },
      { of: "p", children: [key("Esc"), " closes the dialog."] },
      { of: "p", children: [...keysOf("Shift Tab"), " moves focus back."] },
    ],
  }),
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
  scene: () => ({
    of: "dl",
    props: { className: "odd-stack" },
    children: SHORTCUTS.map(
      ([keys, action]): Node<"div"> => ({
        of: "div",
        props: { className: "odd-row" },
        children: [
          { of: "dt", children: keysOf(keys) },
          { of: "dd", children: [action] },
        ],
      }),
    ),
  }),
  aria: `
- term: Ctrl K
- definition: Search
- term: Ctrl S
- definition: Save
- term: Esc
- definition: Close the dialog`,
});
