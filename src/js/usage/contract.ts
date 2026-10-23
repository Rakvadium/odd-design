import type { UsageCode } from "./format.ts";

export const RULE_KINDS = [
  "element",
  "enum",
  "boolean-attribute",
  "aria-boolean",
  "forbidden-attribute",
  "required-attribute",
  "forbidden-on-element",
  "enum-on-element",
  "accessible-name",
  "icon-only-text",
  "system-data",
  "unknown-class",
  "computed-value",
  "untagged-template",
] as const;

export type RuleKind = (typeof RULE_KINDS)[number];

export type UsageRule =
  | { kind: "element"; code: UsageCode; className: string; elements: readonly string[] }
  | { kind: "enum"; code: UsageCode; attribute: string; values: readonly string[]; omit: readonly string[] }
  | { kind: "boolean-attribute"; code: UsageCode; attribute: string; values: readonly string[] }
  | { kind: "aria-boolean"; code: UsageCode; attribute: string; values: readonly string[] }
  | { kind: "forbidden-attribute"; code: UsageCode; attribute: string }
  | { kind: "required-attribute"; code: UsageCode; element: string; attribute: string }
  | { kind: "forbidden-on-element"; code: UsageCode; element: string; attribute: string }
  | { kind: "enum-on-element"; code: UsageCode; element: string; attribute: string }
  | { kind: "accessible-name"; code: UsageCode; attribute: string; names: readonly string[] }
  | { kind: "icon-only-text"; code: UsageCode; attribute: string; ignore: string }
  | { kind: "system-data"; code: UsageCode }
  | { kind: "unknown-class"; code: UsageCode }
  | { kind: "computed-value"; code: UsageCode }
  | { kind: "untagged-template"; code: UsageCode };

function rules<const T extends readonly UsageRule[]>(items: T): T {
  return items;
}

type AssertNever<T extends never> = T;
type _KindGap = AssertNever<Exclude<UsageRule["kind"], RuleKind> | Exclude<RuleKind, UsageRule["kind"]>>;

export const USAGE = {
  button: rules([
    { kind: "element", code: "ODD-BUTTON-001", className: "odd-button", elements: ["button", "a"] },
    { kind: "enum", code: "ODD-BUTTON-002", attribute: "data-variant", values: ["primary", "secondary", "danger", "ghost"], omit: ["outline", "default"] },
    { kind: "enum", code: "ODD-BUTTON-003", attribute: "data-size", values: ["sm", "lg"], omit: ["md", "medium"] },
    { kind: "boolean-attribute", code: "ODD-BUTTON-004", attribute: "data-icon-only", values: ["", "true"] },
    { kind: "aria-boolean", code: "ODD-BUTTON-005", attribute: "aria-disabled", values: ["true", "false"] },
    { kind: "aria-boolean", code: "ODD-BUTTON-006", attribute: "aria-busy", values: ["true", "false"] },
    { kind: "forbidden-attribute", code: "ODD-BUTTON-007", attribute: "disabled" },
    { kind: "accessible-name", code: "ODD-BUTTON-008", attribute: "data-icon-only", names: ["aria-label", "aria-labelledby"] },
    { kind: "required-attribute", code: "ODD-BUTTON-009", element: "a", attribute: "href" },
    { kind: "forbidden-on-element", code: "ODD-BUTTON-010", element: "button", attribute: "href" },
    { kind: "enum", code: "ODD-BUTTON-011", attribute: "aria-current", values: ["page"], omit: [] },
    { kind: "enum-on-element", code: "ODD-BUTTON-012", element: "a", attribute: "aria-current" },
    { kind: "forbidden-on-element", code: "ODD-BUTTON-013", element: "a", attribute: "aria-disabled" },
    { kind: "icon-only-text", code: "ODD-BUTTON-014", attribute: "data-icon-only", ignore: "aria-hidden" },
    { kind: "system-data", code: "ODD-BUTTON-015" },
  ]),
  shared: rules([
    { kind: "unknown-class", code: "ODD-CLASS-001" },
    { kind: "computed-value", code: "ODD-STATIC-001" },
    { kind: "untagged-template", code: "ODD-STATIC-002" },
  ]),
} as const;

export const COMMENT_RULES = [{ code: "ODD-STATIC-003" }] as const satisfies readonly { code: UsageCode }[];

export const CLASS_REGISTRY = [
  "odd-alert",
  "odd-alert-title",
  "odd-avatar",
  "odd-avatar-group",
  "odd-badge",
  "odd-button",
  "odd-card",
  "odd-card-footer",
  "odd-card-link",
  "odd-card-title",
  "odd-choice",
  "odd-dialog",
  "odd-dialog-actions",
  "odd-dialog-body",
  "odd-dialog-title",
  "odd-disclosure",
  "odd-error",
  "odd-eyebrow",
  "odd-field",
  "odd-heading",
  "odd-hint",
  "odd-hover-card",
  "odd-input",
  "odd-label",
  "odd-menu",
  "odd-menu-item",
  "odd-menu-label",
  "odd-menu-shortcut",
  "odd-meter",
  "odd-muted",
  "odd-popover",
  "odd-progress",
  "odd-row",
  "odd-scope",
  "odd-search",
  "odd-segmented",
  "odd-select",
  "odd-separator",
  "odd-sheet",
  "odd-sheet-body",
  "odd-sheet-footer",
  "odd-sheet-header",
  "odd-skeleton",
  "odd-skip-link",
  "odd-slider",
  "odd-stack",
  "odd-stat",
  "odd-stat-value",
  "odd-switch",
  "odd-table",
  "odd-table-sort",
  "odd-table-wrap",
  "odd-tabs",
  "odd-textarea",
  "odd-toast",
  "odd-toast-body",
  "odd-toast-description",
  "odd-toast-title",
  "odd-toaster",
  "odd-tooltip",
  "odd-visually-hidden",
] as const;

export const ATTRIBUTES = {
  button: ["data-variant", "data-size", "data-icon-only"],
} as const;

export const VOCABULARY = {
  attributes: [
    "data-activation",
    "data-chrome",
    "data-disabled",
    "data-highlighted",
    "data-icon-only",
    "data-initials",
    "data-interactive",
    "data-mode",
    "data-numeric",
    "data-orientation",
    "data-palette",
    "data-select-all",
    "data-shape",
    "data-side",
    "data-size",
    "data-solid",
    "data-state",
    "data-tone",
    "data-variant",
  ],
  values: [
    "2xl",
    "avatar",
    "bottom",
    "closing",
    "danger",
    "default",
    "end",
    "false",
    "foreground",
    "ghost",
    "hero",
    "info",
    "lg",
    "manual",
    "md",
    "medium",
    "neutral",
    "outline",
    "page",
    "primary",
    "secondary",
    "sm",
    "start",
    "success",
    "top",
    "true",
    "warning",
    "xl",
    "xs",
  ],
} as const;

export const HEADLESS_ALLOWLIST = ["data-state", "data-side", "data-disabled", "data-orientation", "data-highlighted"] as const;

export const APPEARANCE_AXES = ["data-chrome", "data-palette", "data-mode"] as const;

export type ButtonRule = (typeof USAGE.button)[number];
export type SharedRule = (typeof USAGE.shared)[number];
