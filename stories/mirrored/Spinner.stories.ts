import { mirrored, type Node } from "../mirror.ts";

type Args = {
  label: string;
  size: "sm" | "md" | "xl";
};

const meta = {
  title: "Components/Spinner",
  args: { label: "Loading projects…", size: "md" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "xl"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "`Spinner` from `odd-design/react` renders `span.odd-spinner`, a turning ring that is decoration. It takes `aria-hidden=\"true\"` and no children. The region that is loading has `aria-busy=\"true\"` and says what is loading, beside the ring or in an `odd-visually-hidden` span. The ring is 1em across in the text color, so the font size where it sits sizes it. Under reduced motion it turns slower instead of stopping. A Button that is working takes `aria-busy=\"true\"` and draws its own ring.",
      },
    },
  },
};

export default meta;

const spinner = (): Node<"Spinner"> => ({ of: "Spinner", props: { "aria-hidden": "true" } });

export const Playground = mirrored<Args>({
  scene: ({ label, size }) => ({
    of: "div",
    props: { className: "odd-row", "aria-busy": "true", style: { fontSize: `var(--text-${size})` } },
    children: [spinner(), ` ${label}`],
  }),
  aria: `- text: Loading projects…`,
});

export const Parts = mirrored<Args>({
  scene: () => ({
    of: "div",
    props: { className: "odd-stack" },
    children: [
      { of: "div", props: { className: "odd-row", "aria-busy": "true" }, children: [spinner(), " Loading projects…"] },
      {
        of: "div",
        props: { className: "odd-row", "aria-busy": "true" },
        children: [spinner(), { of: "span", props: { className: "odd-visually-hidden" }, children: ["Loading reports…"] }],
      },
      ...(["sm", "md", "xl"] as const).map(
        (size): Node<"p"> => ({ of: "p", props: { "aria-busy": "true", style: { fontSize: `var(--text-${size})` } }, children: [spinner(), " Syncing"] }),
      ),
    ],
  }),
  aria: `
- text: Loading projects… Loading reports…
- paragraph: Syncing
- paragraph: Syncing
- paragraph: Syncing`,
});

export const States = mirrored<Args>({
  scene: () => ({
    of: "div",
    props: { className: "odd-row" },
    children: [
      { of: "div", props: { className: "odd-row", "aria-busy": "true" }, children: [spinner(), " Loading projects…"] },
      { of: "div", props: { className: "odd-row" }, children: ["3 projects"] },
      { of: "Button", props: { variant: "primary", "aria-busy": "true" }, children: ["Saving…"] },
    ],
  }),
  aria: `
- text: Loading projects… 3 projects
- button "Saving…"`,
});
