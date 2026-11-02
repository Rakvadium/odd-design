import { Button, Row } from "odd-design/react";
import { mirrored } from "../mirror.ts";
import { icon } from "../mirror-react.ts";

type Args = {
  label: string;
  variant: "default" | "primary" | "secondary" | "ghost" | "danger";
  size: "sm" | "md" | "lg";
  disabled: boolean;
  busy: boolean;
};

const meta = {
  title: "Components/Button",
  args: { label: "Save changes", variant: "primary", size: "md", disabled: false, busy: false },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "primary", "secondary", "ghost", "danger"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "`Button` from `odd-design/react` renders a native `button`, or an `a` when it has `href`. `disabled` writes `aria-disabled=\"true\"` and ignores clicks, so the button stays focusable and a screen reader can still find it. `busy` draws the busy ring and ignores clicks too. An icon-only button takes `label`, which is its name and its tooltip. Pressing it in bubblegum chrome sinks it into its shadow, and in calm chrome it scales down slightly. Each chrome supplies that through `--press-transform` and `--shadow-control-active`.",
      },
    },
  },
};

export default meta;

export const Playground = mirrored<Args>({
  scene: ({ label, variant, size, disabled, busy }) => (
    <Button variant={variant === "default" ? undefined : variant} size={size === "md" ? undefined : size} disabled={disabled} busy={busy}>
      {label}
    </Button>
  ),
  aria: `- button "Save changes"`,
});

export const Variants = mirrored<Args>({
  scene: () => (
    <Row>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button>Default</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">{icon("trash")} Delete</Button>
    </Row>
  ),
  aria: `
- button "Primary"
- button "Secondary"
- button "Default"
- button "Ghost"
- button "Delete"`,
});

export const Sizes = mirrored<Args>({
  scene: () => (
    <Row>
      <Button variant="primary" size="sm">
        Small
      </Button>
      <Button variant="primary">Medium</Button>
      <Button variant="primary" size="lg">
        Large {icon("arrowRight")}
      </Button>
      <Button iconOnly label="Settings">
        {icon("settings")}
      </Button>
      <Button iconOnly variant="primary" label="Add card">
        {icon("plus")}
      </Button>
    </Row>
  ),
  aria: `
- button "Small"
- button "Medium"
- button "Large"
- button "Settings"
- button "Add card"`,
});

export const States = mirrored<Args>({
  scene: () => (
    <Row>
      <Button variant="primary" busy>
        Saving…
      </Button>
      <Button variant="primary" disabled>
        Unavailable
      </Button>
      <Button disabled>Unavailable</Button>
    </Row>
  ),
  aria: `
- button "Saving…"
- button "Unavailable" [disabled]
- button "Unavailable" [disabled]`,
});

export const Link = mirrored<Args>({
  scene: () => (
    <Row>
      <Button href="#docs" variant="secondary">
        Docs
      </Button>
      <Button href="#decks" variant="ghost" current>
        Decks
      </Button>
    </Row>
  ),
  aria: `
- link "Docs":
  - /url: "#docs"
- link "Decks":
  - /url: "#decks"`,
});
