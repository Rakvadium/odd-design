import { Button, Menu as OddMenu, MenuCheckboxItem, MenuItem, MenuRadioGroup, MenuRadioItem, MenuSeparator, Muted, Row, Stack } from "odd-design/react";
import { mirrored } from "../mirror.ts";
import { icon } from "../mirror-react.ts";
import { opened } from "../opened.ts";

const meta = {
  title: "Components/Interactive",
  parameters: {
    docs: {
      description: {
        component:
          "`Menu` from `odd-design/react` renders its `trigger`, then `div.odd-menu`, and runs `enhanceMenu` on it. The trigger gets `command=\"toggle-popover\"`, `commandfor`, and `aria-haspopup=\"menu\"`. `MenuItem`, `MenuCheckboxItem`, and `MenuRadioItem` render each `button.odd-menu-item` with its role, and `MenuRadioGroup` names a group of radios with a visible label. The browser opens and closes it. Focus lands on the first item; arrows, Home, End, and typing move; Escape or Tab closes and focus returns. ArrowDown or ArrowUp on the trigger opens it at the first or last item. Checkbox and radio items stay open when toggled, and a disabled item stays reachable but does nothing.",
      },
    },
  },
};

export default meta;

function deckActions(id: string) {
  return (
    <OddMenu id={id} label="Deck actions" trigger={<Button>Deck actions</Button>}>
      <MenuItem shortcut="Control+D">{icon("copy")} Duplicate </MenuItem>
      <MenuItem>{icon("share")} Share link</MenuItem>
      <MenuItem disabled>{icon("layers")} Merge (needs two decks)</MenuItem>
      <MenuSeparator />
      <MenuCheckboxItem defaultChecked>Show prices</MenuCheckboxItem>
      <MenuCheckboxItem>Compact grid</MenuCheckboxItem>
      <MenuSeparator />
      <MenuRadioGroup label="Sort by">
        <MenuRadioItem defaultChecked>Name</MenuRadioItem>
        <MenuRadioItem>Last edited</MenuRadioItem>
        <MenuRadioItem>Card count</MenuRadioItem>
      </MenuRadioGroup>
      <MenuSeparator />
      <MenuItem tone="danger">{icon("trash")} Delete deck</MenuItem>
    </OddMenu>
  );
}

export const Menu = {
  ...mirrored({
    scene: () => (
      <Stack>
        <Row>
          {deckActions("deck-actions")}
          <Button variant="primary" id="after-menu">
            Publish
          </Button>
        </Row>
        <Muted id="menu-log" aria-live="polite">
          {null}
        </Muted>
      </Stack>
    ),
    aria: `
- button "Deck actions"
- button "Publish"
- paragraph`,
  }),
  play: ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const log = canvasElement.querySelector("#menu-log")!;
    canvasElement.querySelector("#deck-actions")!.addEventListener("click", (event) => {
      const chosen = (event.target as Element).closest(".odd-menu-item");
      const label = [...(chosen?.childNodes ?? [])].filter((node) => node.nodeType === globalThis.Node.TEXT_NODE).map((node) => node.textContent).join("");
      if (chosen) log.textContent = `Chose “${label.trim()}”`;
    });
  },
};

export const MenuOpen = opened("open-deck-actions", {
  scene: () => deckActions("open-deck-actions"),
  aria: `
- button "Deck actions"
- menu "Deck actions":
  - menuitem "Duplicate"
  - menuitem "Share link"
  - menuitem "Merge (needs two decks)" [disabled]
  - separator
  - menuitemcheckbox "Show prices" [checked]
  - menuitemcheckbox "Compact grid"
  - separator
  - group "Sort by":
    - menuitemradio "Name" [checked]
    - menuitemradio "Last edited"
    - menuitemradio "Card count"
  - separator
  - menuitem "Delete deck"`,
});
