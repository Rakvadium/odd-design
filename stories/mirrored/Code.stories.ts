import { mirrored } from "../mirror.ts";

type Args = {
  kind: "inline" | "block";
  text: string;
};

const meta = {
  title: "Components/Code",
  args: { kind: "inline", text: "--primary" },
  argTypes: {
    kind: { control: "inline-radio", options: ["inline", "block"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "`Code` from `odd-design/react` renders `code.odd-code`, a short piece of code inside a sentence. `Pre` renders `pre.odd-pre`, a block of code with a bare `code` inside it. Leave the inner `code` out for command output. Long lines in a block wrap instead of scrolling, so the block never needs a tab stop.",
      },
    },
  },
};

export default meta;

const LONG_LINE = 'import { Breadcrumb, Button, Card, Code, Combobox, Pre, Spinner, TextLink } from "odd-design/react";';

export const Playground = mirrored<Args>({
  scene: ({ kind, text }) =>
    kind === "block"
      ? { of: "Pre", children: [{ of: "code", children: [text] }] }
      : { of: "p", children: ["Set ", { of: "Code", children: [text] }, " on the scope."] },
  aria: `
- paragraph:
  - text: Set
  - code: "--primary"
  - text: on the scope.`,
});

export const Parts = mirrored<Args>({
  scene: () => ({
    of: "div",
    props: { className: "odd-stack" },
    children: [
      { of: "p", children: ["Set ", { of: "Code", children: ["--primary"] }, " on the scope, then read it with ", { of: "Code", children: ["var(--primary)"] }, "."] },
      { of: "Pre", children: [{ of: "code", children: ['import { Button } from "odd-design/react";\n\nexport const Save = () => <Button variant="primary">Save</Button>;'] }] },
      { of: "Pre", children: ["$ bun run check\n850 pass\n0 fail"] },
    ],
  }),
  aria: `
- paragraph:
  - text: Set
  - code: "--primary"
  - text: on the scope, then read it with
  - code: var(--primary)
  - text: .
- code: "import { Button } from \\"odd-design/react\\"; export const Save = () => <Button variant=\\"primary\\">Save</Button>;"
- text: $ bun run check 850 pass 0 fail`,
});

export const LongLines = mirrored<Args>({
  scene: () => ({
    of: "div",
    props: { style: { maxInlineSize: "20rem" } },
    children: [{ of: "Pre", children: [{ of: "code", children: [LONG_LINE] }] }],
  }),
  aria: `- code: "import { Breadcrumb, Button, Card, Code, Combobox, Pre, Spinner, TextLink } from \\"odd-design/react\\";"`,
});
