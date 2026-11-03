import { Grid, GridItem, Slider as SliderField, Stack } from "odd-design/react";
import { mirrored } from "../story.ts";

const meta = {
  title: "Components/Forms",
  parameters: {
    docs: {
      description: {
        component:
          "`Slider` from `odd-design/react` renders a whole field around `input.odd-slider[type=range]`. Arrow keys, Page Up and Down, and Home and End work with no JS. The filled track follows the thumb through a scroll-driven animation where supported. `showValue` renders `output.odd-stat-value` after the slider, and `formatValue` writes it, as in the first slider.",
      },
    },
  },
};

export default meta;

export const Slider = {
  ...mirrored({
    scene: () => (
      <Grid>
        <GridItem span={4}>
          <Stack>
            <SliderField id="copies" label="Copies per card" min={1} max={4} defaultValue={3} hint="Most formats allow up to 4." showValue formatValue={(value) => `${value} of 4`} />
            <SliderField id="card-size" label="Card size" min={0} max={100} defaultValue={65} />
            <SliderField id="locked" label="Hand size (locked by format)" min={5} max={9} defaultValue={7} disabled />
          </Stack>
        </GridItem>
      </Grid>
    ),
    aria: `
- text: Copies per card
- slider "Copies per card": "3"
- status: 3 of 4
- paragraph: Most formats allow up to 4.
- text: Card size
- slider "Card size": "65"
- text: Hand size (locked by format)
- slider "Hand size (locked by format)" [disabled]: "7"`,
  }),
  play: ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const slider = canvasElement.querySelector<HTMLInputElement>("#copies");
    const readout = canvasElement.querySelector<HTMLOutputElement>("#copies-value");
    if (slider === null || readout === null) throw new Error("the Slider story lost #copies or #copies-value");
    // The compiled HTML runs no React, so the page keeps the readout in step. Under React, Slider has already
    // written it by the next task, and writing it again here would replace the text node React holds.
    slider.addEventListener("input", () =>
      setTimeout(() => {
        const text = `${slider.value} of ${slider.max}`;
        if (readout.value !== text) readout.value = text;
      }),
    );
  },
};
