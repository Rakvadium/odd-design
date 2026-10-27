import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Data Display",
  parameters: {
    docs: {
      description: {
        component:
          "`Avatar` from `odd-design/react` renders `span.odd-avatar`, and `AvatarGroup` renders `div.odd-avatar-group`. `size` sets `data-size` to `sm` or `lg`, and leaving it out is the default size. An image avatar's `img` has `alt` text. An initials avatar is `role=\"img\"` with an `aria-label`. A group is `role=\"group\"` with a name. Next to a visible name, hide the avatar so the name isn't read twice. The shape follows the chrome's chip radius.",
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
  scene: () => ({
    of: "div",
    props: { className: "odd-stack", style: { "--gap": "var(--space-5)" } },
    children: [
      {
        of: "div",
        props: { className: "odd-row" },
        children: [
          { of: "Avatar", props: { size: "sm", role: "img", "aria-label": "Ana Rojas" }, children: ["AR"] },
          { of: "Avatar", props: { role: "img", "aria-label": "Ana Rojas" }, children: ["AR"] },
          { of: "Avatar", props: { size: "lg", role: "img", "aria-label": "Ana Rojas" }, children: ["AR"] },
          { of: "Avatar", props: { size: "lg" }, children: [{ of: "img", props: { src: photo("#8a5cf6", "#f472b6"), alt: "Kai Nakamura" } }] },
        ],
      },
      {
        of: "AvatarGroup",
        props: { role: "group", "aria-label": "Collaborators" },
        children: [
          { of: "Avatar", children: [{ of: "img", props: { src: photo("#0ea5e9", "#22c55e"), alt: "Mira Okafor" } }] },
          { of: "Avatar", props: { role: "img", "aria-label": "Ana Rojas" }, children: ["AR"] },
          { of: "Avatar", children: [{ of: "img", props: { src: photo("#f59e0b", "#ef4444"), alt: "Theo Laurent" } }] },
          { of: "Avatar", props: { role: "img", "aria-label": "and 3 more" }, children: ["+3"] },
        ],
      },
      {
        of: "div",
        props: { className: "odd-row", style: { "--gap": "var(--space-3)" } },
        children: [
          { of: "Avatar", props: { "aria-hidden": "true" }, children: ["MO"] },
          {
            of: "div",
            children: [
              { of: "p", props: { style: { fontWeight: "600" } }, children: ["Mira Okafor"] },
              { of: "p", props: { className: "odd-muted", style: { fontSize: "var(--text-sm)" } }, children: ["Edited Midnight Control · 2 hours ago"] },
            ],
          },
        ],
      },
    ],
  }),
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
