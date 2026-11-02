import { Button, Row, Separator, Stack } from "odd-design/react";
import { mirrored } from "../mirror.ts";
import { icon } from "../mirror-react.ts";

const meta = {
  title: "Components/Overlays",
  parameters: {
    docs: {
      description: {
        component:
          "A tooltip opens on hover or keyboard focus through `interestfor`, with the browser's show and hide delays. An icon-only `Button` takes `label`, which renders as its tooltip and names the button through `aria-labelledby`, so the name holds where tooltips can't show. `tooltip` on a button with visible text renders a tooltip that `aria-describedby` points at. `Button` installs the interest fallback itself where the browser lacks `interestfor`.",
      },
    },
  },
};

export default meta;

function toolbar() {
  return (
    <Stack>
      <p>Hover or focus a button to see its tooltip.</p>
      <Row>
        <Button variant="ghost" iconOnly label="Duplicate deck" id="duplicate">
          {icon("copy")}
        </Button>
        <Button variant="ghost" iconOnly label="Share link" id="share">
          {icon("share")}
        </Button>
        <Button variant="ghost" iconOnly label="Delete deck" id="delete">
          {icon("trash")}
        </Button>
        <Separator aria-orientation="vertical" />
        <Button variant="primary" tooltip="Anyone with the link can view it" id="publish">
          Publish
        </Button>
      </Row>
    </Stack>
  );
}

export const Tooltip = mirrored({
  scene: toolbar,
  aria: `
- paragraph: Hover or focus a button to see its tooltip.
- button "Duplicate deck"
- button "Share link"
- button "Delete deck"
- separator
- button "Publish"`,
});

export const TooltipOpen = {
  ...mirrored({
    scene: toolbar,
    aria: `
- paragraph: Hover or focus a button to see its tooltip.
- button "Duplicate deck"
- button "Share link"
- button "Delete deck"
- tooltip "Delete deck"
- separator
- button "Publish"`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const button = canvasElement.querySelector<HTMLElement>("#delete")!;
    const tip = canvasElement.querySelector<HTMLElement>("#delete-tooltip")!;
    tip.showPopover({ source: button } as ShowPopoverOptions);
    await Promise.all(tip.getAnimations().map((animation) => animation.finished));
  },
};
