import type { Preview } from "@storybook/react-vite";
import html, { appearance } from "../.storybook/preview.ts";
import { mirrorOf } from "../stories/mirror.ts";
import { toReact } from "../stories/mirror-react.ts";

const preview: Preview = {
  ...(html as Preview),
  decorators: [appearance as NonNullable<Preview["decorators"]>[number]],
  render: (args, { parameters }) => toReact(mirrorOf(parameters).scene(args)),
};

export default preview;
