import { Code, Grid, GridItem, Pre, Stack } from "odd-design/react";
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
          "`Code` from `odd-design/react` renders `code.odd-code`, a short piece of code inside a sentence. `Pre` renders `pre.odd-pre`, a block of code, with its text in a bare `code`. `output` leaves the `code` out, for command output. Long lines in a block wrap instead of scrolling, so the block never needs a tab stop.",
      },
    },
  },
};

export default meta;

const LONG_LINE = 'import { Breadcrumb, Button, Card, Code, Combobox, Pre, Spinner, TextLink } from "odd-design/react";';

export const Playground = mirrored<Args>({
  scene: ({ kind, text }) =>
    kind === "block" ? (
      <Pre>{text}</Pre>
    ) : (
      <p>
        Set <Code>{text}</Code> on the scope.
      </p>
    ),
  aria: `
- paragraph:
  - text: Set
  - code: "--primary"
  - text: on the scope.`,
});

export const Parts = mirrored<Args>({
  scene: () => (
    <Stack>
      <p>
        Set <Code>--primary</Code> on the scope, then read it with <Code>var(--primary)</Code>.
      </p>
      <Pre>{'import { Button } from "odd-design/react";\n\nexport const Save = () => <Button variant="primary">Save</Button>;'}</Pre>
      <Pre output>{"$ bun run check\n850 pass\n0 fail"}</Pre>
    </Stack>
  ),
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
  scene: () => (
    <Grid>
      <GridItem span={3}>
        <Pre>{LONG_LINE}</Pre>
      </GridItem>
    </Grid>
  ),
  aria: `- code: "import { Breadcrumb, Button, Card, Code, Combobox, Pre, Spinner, TextLink } from \\"odd-design/react\\";"`,
});
