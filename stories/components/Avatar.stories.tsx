import { Avatar as OddAvatar, AvatarGroup, Muted, Row, Stack } from "odd-design/react";
import { mirrored } from "../story.ts";

const meta = {
  title: "Components/Data Display",
  parameters: {
    docs: {
      description: {
        component:
          "`Avatar` from `odd-design/react` renders `span.odd-avatar` from a `name`. With a `src` it shows an `img` whose `alt` is the name. Without one, or when the image fails to load, it shows initials as `role=\"img\"` named by the name. `initials` overrides the first letters of the name. `size` sets `data-size` to `sm` or `lg`, and leaving it out is the default size. `AvatarGroup` renders `div.odd-avatar-group` as a group named by its `label`. Next to a visible name, `decorative` hides the avatar so the name isn't read twice. The shape follows the chrome's chip radius.",
      },
    },
  },
};

export default meta;

const photo = (a: string, b: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="40" height="40" fill="url(#g)"/><circle cx="20" cy="16" r="7" fill="#fff" fill-opacity=".85"/><ellipse cx="20" cy="36" rx="13" ry="10" fill="#fff" fill-opacity=".85"/></svg>`,
  )}`;

export const Avatar = mirrored({
  scene: () => (
    <Stack>
      <Row>
        <OddAvatar size="sm" name="Ana Rojas" />
        <OddAvatar name="Ana Rojas" />
        <OddAvatar size="lg" name="Ana Rojas" />
        <OddAvatar size="lg" name="Kai Nakamura" src={photo("#8a5cf6", "#f472b6")} />
      </Row>
      <AvatarGroup label="Collaborators">
        <OddAvatar name="Mira Okafor" src={photo("#0ea5e9", "#22c55e")} />
        <OddAvatar name="Ana Rojas" />
        <OddAvatar name="Theo Laurent" src={photo("#f59e0b", "#ef4444")} />
        <OddAvatar name="and 3 more" initials="+3" />
      </AvatarGroup>
      <Row>
        <OddAvatar name="Mira Okafor" decorative />
        <div>
          <p>Mira Okafor</p>
          <Muted>Edited Midnight Control · 2 hours ago</Muted>
        </div>
      </Row>
    </Stack>
  ),
  aria: `
- img "Ana Rojas": AR
- img "Ana Rojas": AR
- img "Ana Rojas": AR
- img "Kai Nakamura"
- group "Collaborators":
  - img "Mira Okafor"
  - img "Ana Rojas": AR
  - img "Theo Laurent"
  - img "and 3 more": "+3"
- paragraph: Mira Okafor
- paragraph: Edited Midnight Control · 2 hours ago`,
});
