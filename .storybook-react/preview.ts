import type { Preview } from "@storybook/react-vite";
import html from "../.storybook/preview.ts";
import { mirrorOf } from "../stories/mirror.ts";
import { toReact } from "../stories/mirror-react.ts";

const preview: Preview = {
  ...(html as Preview),
  render: (args, { parameters }) => toReact(mirrorOf(parameters).scene(args)),
};

export default preview;
