import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Forms",
  parameters: {
    docs: {
      description: {
        component:
          "`Slider` from `odd-design/react` renders `input.odd-slider` and takes `type=\"range\"`. Arrow keys, Page Up/Down, and Home/End work with no JS. The filled track follows the thumb through a scroll-driven animation where supported. The `<output>` beside the first slider follows it through one `input` handler.",
      },
    },
  },
};

export default meta;

export const Slider = {
  ...mirrored({
    scene: () => ({
      of: "div",
      props: { className: "odd-stack", style: { "--gap": "var(--space-5)", maxInlineSize: "26rem" } },
      children: [
        {
          of: "Field",
          children: [
            {
              of: "div",
              props: { className: "odd-row", style: { justifyContent: "space-between" } },
              children: [
                { of: "Label", props: { htmlFor: "copies" }, children: ["Copies per card"] },
                { of: "output", props: { className: "odd-stat-value", id: "copies-value", htmlFor: "copies" }, children: ["3 of 4"] },
              ],
            },
            { of: "Slider", props: { type: "range", id: "copies", min: 1, max: 4, defaultValue: 3, "aria-describedby": "copies-hint" } },
            { of: "Hint", props: { id: "copies-hint" }, children: ["Most formats allow up to 4."] },
          ],
        },
        {
          of: "Field",
          children: [
            { of: "Label", props: { htmlFor: "card-size" }, children: ["Card size"] },
            { of: "Slider", props: { type: "range", id: "card-size", min: 0, max: 100, defaultValue: 65 } },
          ],
        },
        {
          of: "Field",
          children: [
            { of: "Label", props: { htmlFor: "locked" }, children: ["Hand size (locked by format)"] },
            { of: "Slider", props: { type: "range", id: "locked", min: 5, max: 9, defaultValue: 7, disabled: true } },
          ],
        },
      ],
    }),
    aria: `
- text: Copies per card
- status: 3 of 4
- slider "Copies per card": "3"
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
    slider.oninput = () => {
      readout.value = `${slider.value} of ${slider.max}`;
    };
  },
};
