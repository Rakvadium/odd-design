import { mirrored } from "../mirror.ts";

const meta = {
  title: "Components/Feedback",
  parameters: {
    docs: {
      description: {
        component:
          "`Alert` from `odd-design/react` renders `div.odd-alert`, and `AlertTitle` renders `p.odd-alert-title`. `tone` sets `data-tone` to `info`, `success`, `warning`, or `danger`. Leaving `tone` out is the neutral tint. Static alerts need no role. For a message that appears later, insert the alert into an existing role=status container, or role=alert for errors. Text is `--foreground` on a soft tint in every tone.",
      },
    },
  },
};

export default meta;

export const Alert = mirrored({
  scene: () => ({
    of: "div",
    props: { className: "odd-stack", style: { maxInlineSize: "40rem" } },
    children: [
      {
        of: "Alert",
        children: [
          { icon: "info" },
          {
            of: "div",
            children: [
              { of: "AlertTitle", children: ["Drafts are private"] },
              { of: "p", children: ["Only you can see a deck until you publish it."] },
            ],
          },
        ],
      },
      {
        of: "Alert",
        props: { tone: "info" },
        children: [
          { icon: "info" },
          {
            of: "div",
            children: [
              { of: "AlertTitle", children: ["New set available"] },
              { of: "p", children: ["“Ember Tide” cards are now in the gallery."] },
            ],
          },
        ],
      },
      {
        of: "Alert",
        props: { tone: "success" },
        children: [
          { icon: "check" },
          {
            of: "div",
            children: [
              { of: "AlertTitle", children: ["Deck published"] },
              { of: "p", children: ["Midnight Control is live on your profile."] },
            ],
          },
        ],
      },
      {
        of: "Alert",
        props: { tone: "warning" },
        children: [
          { icon: "warning" },
          {
            of: "div",
            children: [
              { of: "AlertTitle", children: ["Rotation is coming"] },
              {
                of: "p",
                children: [
                  "Three of your decks lose legality on May 1. ",
                  { of: "a", props: { href: "#" }, children: ["Review them"] },
                  ".",
                ],
              },
            ],
          },
        ],
      },
      {
        of: "Alert",
        props: { tone: "danger" },
        children: [
          { icon: "danger" },
          {
            of: "div",
            children: [
              { of: "AlertTitle", children: ["Couldn’t save"] },
              { of: "p", children: ["You’re offline. Your changes are kept on this device."] },
            ],
          },
        ],
      },
    ],
  }),
  aria: `
- paragraph: Drafts are private
- paragraph: Only you can see a deck until you publish it.
- paragraph: New set available
- paragraph: “Ember Tide” cards are now in the gallery.
- paragraph: Deck published
- paragraph: Midnight Control is live on your profile.
- paragraph: Rotation is coming
- paragraph:
  - text: Three of your decks lose legality on May 1.
  - link "Review them":
    - /url: "#"
  - text: .
- paragraph: Couldn’t save
- paragraph: You’re offline. Your changes are kept on this device.`,
});
