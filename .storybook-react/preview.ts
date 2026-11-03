import type { Preview } from "@storybook/react-vite";
import html, { appearance } from "../.storybook/preview.ts";
import { sceneOf } from "../stories/story.ts";

const preview: Preview = {
  ...(html as Preview),
  decorators: [appearance as NonNullable<Preview["decorators"]>[number]],
  render: (args, { parameters }) => sceneOf(parameters)(args),
};

export default preview;
