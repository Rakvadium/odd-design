import type { Meta, StoryObj } from "@storybook/html-vite";

const meta = { title: "Components/Data Display" } satisfies Meta;

export default meta;
type Story = StoryObj;

export const AvatarFallback: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "With `data-initials`, `avatarFallback` from `odd-design/enhance` swaps an image that fails to load for its initials and keeps its name. It is for markup a page owns. React throws when a script replaces children it rendered, so the React `Avatar` types `data-initials` as `never`; a React app renders the initials itself when the image fails.",
      },
    },
  },
  render: () => /* html */ `<div class="odd-row">
    <span class="odd-avatar" data-size="lg" data-initials="JP" id="broken-avatar"><img src="/missing-avatar.png" alt="Jo Park"></span>
  </div>`,
};
