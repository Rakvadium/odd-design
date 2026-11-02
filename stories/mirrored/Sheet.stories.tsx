import type { ReactNode } from "react";
import { Button, RadioGroup, Row, Select, Sheet as OddSheet, type SheetSide } from "odd-design/react";
import { mirrored } from "../mirror.ts";
import { icon } from "../mirror-react.ts";
import { opened } from "../opened.ts";

const meta = {
  title: "Components/Overlays",
  parameters: {
    docs: {
      description: {
        component:
          "`Sheet` from `odd-design/react` renders a native `dialog.odd-sheet` and the `trigger` that opens it. Its three rows are `div.odd-sheet-header` with the title and an icon-only Close button, `div.odd-sheet-body` with the children, and `div.odd-sheet-footer` with the `actions`. The trigger gets `command=\"show-modal\"`, so focus is trapped, the page behind is inert, and focus returns on close. It slides in from `side`: `start`, `top`, or `bottom`, and from the end with no `side`. `start` and the end follow the writing direction. Focus starts on the Close button.",
      },
    },
  },
};

export default meta;

function sheet(id: string, trigger: ReactNode, side?: SheetSide) {
  return (
    <OddSheet
      id={id}
      side={side}
      trigger={<Button>{trigger}</Button>}
      title="Filters"
      dismissible
      actions={
        <>
          <Button command="close">Reset</Button>
          <Button variant="primary" command="close">
            Show 12 decks
          </Button>
        </>
      }
    >
      <Select id={`${id}-format`} label="Format">
        <option>Any</option>
        <option>Standard</option>
        <option>Extended</option>
      </Select>
      <RadioGroup
        label="Status"
        name={`${id}-status`}
        defaultValue="legal"
        options={[
          { value: "legal", label: "Legal" },
          { value: "rotating", label: "Rotating" },
          { value: "banned", label: "Banned" },
        ]}
      />
    </OddSheet>
  );
}

export const Sheet = mirrored({
  scene: () => (
    <Row>
      {sheet(
        "sheet-end",
        <>
          {icon("filter")} Filters (end)
        </>,
      )}
      {sheet("sheet-start", "Start", "start")}
      {sheet("sheet-bottom", "Bottom", "bottom")}
    </Row>
  ),
  aria: `
- button "Filters (end)"
- button "Start"
- button "Bottom"`,
});

const panel = (trigger: string) => `
- button "${trigger}"
- dialog "Filters":
  - heading "Filters" [level=2]
  - button "Close"
  - tooltip "Close"
  - text: Format
  - combobox "Format":
    - option "Any" [selected]
    - option "Standard"
    - option "Extended"
  - group "Status":
    - text: Status
    - radio "Legal" [checked]
    - text: Legal
    - radio "Rotating"
    - text: Rotating
    - radio "Banned"
    - text: Banned
  - button "Reset"
  - button "Show 12 decks"`;

function openSheet(id: string, trigger: string, side: SheetSide | undefined, dir?: "rtl") {
  const story = opened(id, {
    scene: () => <Row dir={dir}>{sheet(id, trigger, side)}</Row>,
    aria: panel(trigger),
  });
  return {
    ...story,
    play: async (context: { canvasElement: HTMLElement }) => {
      await story.play(context);
      // The close button takes focus, and whether its tooltip opens on that focus depends on the engine and on
      // the page's last input. Open it here, so every engine and run shows the same sheet.
      const close = context.canvasElement.querySelector<HTMLElement>(`#${id}-close`)!;
      const tip = context.canvasElement.querySelector<HTMLElement>(`#${id}-close-tooltip`)!;
      if (!tip.matches(":popover-open")) tip.showPopover({ source: close } as ShowPopoverOptions);
      await Promise.all(tip.getAnimations().map((animation) => animation.finished));
    },
  };
}

export const SheetEnd = openSheet("sheet-open-end", "End", undefined);
export const SheetStart = openSheet("sheet-open-start", "Start", "start");
export const SheetTop = openSheet("sheet-open-top", "Top", "top");
export const SheetBottom = openSheet("sheet-open-bottom", "Bottom", "bottom");
export const SheetRightToLeft = openSheet("sheet-open-rtl", "End, right to left", undefined, "rtl");
