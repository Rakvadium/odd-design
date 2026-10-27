import type { UsageCode } from "./format.ts";

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

export type RuleKind = UsageRule["kind"];

export const USAGE = {
  button: [
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
  ] as const satisfies readonly UsageRule[],
  field: [
    { kind: "element", code: "ODD-FIELD-001", className: "odd-field", elements: ["div"] },
    { kind: "element", code: "ODD-FIELD-001", className: "odd-hint", elements: ["p"] },
  ] as const satisfies readonly UsageRule[],
  fieldControl: [
    { kind: "element", code: "ODD-FIELD-001", className: "odd-input", elements: ["input"] },
    { kind: "element", code: "ODD-FIELD-001", className: "odd-textarea", elements: ["textarea"] },
    { kind: "element", code: "ODD-FIELD-001", className: "odd-select", elements: ["select"] },
    { kind: "forbidden-attribute", code: "ODD-FIELD-003", attribute: "aria-disabled" },
  ] as const satisfies readonly UsageRule[],
  fieldError: [
    { kind: "element", code: "ODD-FIELD-001", className: "odd-error", elements: ["p"] },
    { kind: "forbidden-attribute", code: "ODD-FIELD-002", attribute: "hidden" },
    { kind: "forbidden-attribute", code: "ODD-FIELD-002", attribute: "aria-hidden" },
  ] as const satisfies readonly UsageRule[],
  choice: [
    { kind: "element", code: "ODD-CHOICE-001", className: "odd-choice", elements: ["label"] },
    { kind: "element", code: "ODD-CHOICE-001", className: "odd-segmented", elements: ["fieldset"] },
    { kind: "forbidden-attribute", code: "ODD-CHOICE-003", attribute: "aria-disabled" },
  ] as const satisfies readonly UsageRule[],
  switch: [
    { kind: "element", code: "ODD-CHOICE-001", className: "odd-switch", elements: ["input"] },
    { kind: "required-attribute", code: "ODD-CHOICE-002", element: "input", attribute: "type" },
    { kind: "enum", code: "ODD-CHOICE-002", attribute: "type", values: ["checkbox"], omit: [] },
    { kind: "required-attribute", code: "ODD-CHOICE-002", element: "input", attribute: "role" },
    { kind: "enum", code: "ODD-CHOICE-002", attribute: "role", values: ["switch"], omit: [] },
    { kind: "forbidden-attribute", code: "ODD-CHOICE-003", attribute: "aria-disabled" },
  ] as const satisfies readonly UsageRule[],
  badge: [
    { kind: "element", code: "ODD-BADGE-001", className: "odd-badge", elements: ["span"] },
    { kind: "enum", code: "ODD-BADGE-002", attribute: "data-tone", values: ["neutral", "primary", "success", "warning", "danger", "info"], omit: [] },
    { kind: "boolean-attribute", code: "ODD-BADGE-003", attribute: "data-solid", values: ["", "true"] },
    { kind: "system-data", code: "ODD-BADGE-004" },
  ] as const satisfies readonly UsageRule[],
  alert: [
    { kind: "element", code: "ODD-ALERT-001", className: "odd-alert", elements: ["div"] },
    { kind: "enum", code: "ODD-ALERT-002", attribute: "data-tone", values: ["info", "success", "warning", "danger"], omit: ["neutral"] },
    { kind: "forbidden-attribute", code: "ODD-ALERT-003", attribute: "role" },
    { kind: "forbidden-attribute", code: "ODD-ALERT-003", attribute: "aria-live" },
    { kind: "system-data", code: "ODD-ALERT-004" },
  ] as const satisfies readonly UsageRule[],
  alertTitle: [
    { kind: "element", code: "ODD-ALERT-001", className: "odd-alert-title", elements: ["p"] },
    { kind: "system-data", code: "ODD-ALERT-005" },
  ] as const satisfies readonly UsageRule[],
  avatar: [
    { kind: "element", code: "ODD-AVATAR-001", className: "odd-avatar", elements: ["span"] },
    { kind: "enum", code: "ODD-AVATAR-002", attribute: "data-size", values: ["sm", "lg"], omit: ["md", "medium"] },
    { kind: "enum", code: "ODD-AVATAR-003", attribute: "role", values: ["img"], omit: [] },
    { kind: "accessible-name", code: "ODD-AVATAR-004", attribute: "role", names: ["aria-label", "aria-labelledby"] },
    { kind: "system-data", code: "ODD-AVATAR-005" },
  ] as const satisfies readonly UsageRule[],
  avatarGroup: [
    { kind: "element", code: "ODD-AVATAR-001", className: "odd-avatar-group", elements: ["div"] },
    { kind: "required-attribute", code: "ODD-AVATAR-003", element: "div", attribute: "role" },
    { kind: "enum", code: "ODD-AVATAR-003", attribute: "role", values: ["group"], omit: [] },
    { kind: "accessible-name", code: "ODD-AVATAR-004", attribute: "role", names: ["aria-label", "aria-labelledby"] },
    { kind: "system-data", code: "ODD-AVATAR-006" },
  ] as const satisfies readonly UsageRule[],
  shared: [
    { kind: "unknown-class", code: "ODD-CLASS-001" },
    { kind: "computed-value", code: "ODD-STATIC-001" },
    { kind: "untagged-template", code: "ODD-STATIC-002" },
  ] as const satisfies readonly UsageRule[],
};

export type WrapperElement = string | { readonly attribute: string; readonly present: string; readonly absent: string };

export type Wrapper = {
  readonly source: string;
  readonly className: string;
  readonly props: Readonly<Record<string, string>>;
  readonly element: WrapperElement;
};

export const WRAPPERS = {
  Button: {
    source: "odd-design/react",
    className: "odd-button",
    props: { variant: "data-variant", size: "data-size", iconOnly: "data-icon-only" },
    element: { attribute: "href", present: "a", absent: "button" },
  },
  Field: { source: "odd-design/react", className: "odd-field", props: {}, element: "div" },
  Label: { source: "odd-design/react", className: "odd-label", props: {}, element: "label" },
  Input: { source: "odd-design/react", className: "odd-input", props: {}, element: "input" },
  Textarea: { source: "odd-design/react", className: "odd-textarea", props: {}, element: "textarea" },
  Select: { source: "odd-design/react", className: "odd-select", props: {}, element: "select" },
  Hint: { source: "odd-design/react", className: "odd-hint", props: {}, element: "p" },
  FieldError: { source: "odd-design/react", className: "odd-error", props: {}, element: "p" },
  Choice: { source: "odd-design/react", className: "odd-choice", props: {}, element: "label" },
  Switch: { source: "odd-design/react", className: "odd-switch", props: {}, element: "input" },
  Segmented: { source: "odd-design/react", className: "odd-segmented", props: {}, element: "fieldset" },
  Badge: { source: "odd-design/react", className: "odd-badge", props: { tone: "data-tone", solid: "data-solid" }, element: "span" },
  Alert: { source: "odd-design/react", className: "odd-alert", props: { tone: "data-tone" }, element: "div" },
  AlertTitle: { source: "odd-design/react", className: "odd-alert-title", props: {}, element: "p" },
  Avatar: { source: "odd-design/react", className: "odd-avatar", props: { size: "data-size" }, element: "span" },
  AvatarGroup: { source: "odd-design/react", className: "odd-avatar-group", props: {}, element: "div" },
} as const satisfies Record<string, Wrapper>;

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
  "odd-estop",
  "odd-eyebrow",
  "odd-field",
  "odd-grid",
  "odd-heading",
  "odd-hint",
  "odd-hover-card",
  "odd-input",
  "odd-label",
  "odd-log",
  "odd-log-line",
  "odd-menu",
  "odd-menu-item",
  "odd-menu-label",
  "odd-menu-shortcut",
  "odd-meter",
  "odd-muted",
  "odd-popover",
  "odd-progress",
  "odd-range-field",
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
  "odd-shell",
  "odd-shell-actions",
  "odd-shell-header",
  "odd-shell-main",
  "odd-shell-status",
  "odd-skeleton",
  "odd-skip-link",
  "odd-slider",
  "odd-stack",
  "odd-stat",
  "odd-stat-value",
  "odd-stepper",
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

export const VOCABULARY = {
  alert: ["data-tone"],
  avatar: ["data-size"],
  badge: ["data-solid", "data-tone"],
  button: ["data-icon-only", "data-size", "data-variant"],
  card: ["data-interactive"],
  choice: [],
  dialog: [],
  disclosure: [],
  estop: [],
  field: [],
  log: ["data-tone"],
  menu: ["data-tone"],
  meter: ["data-tone"],
  popover: [],
  "range-field": [],
  search: [],
  separator: [],
  sheet: ["data-side"],
  shell: ["data-span"],
  skeleton: ["data-shape"],
  slider: [],
  stepper: [],
  table: ["data-numeric"],
  tabs: [],
  toast: ["data-state", "data-tone"],
  typography: ["data-size", "data-tone"],
} as const satisfies Record<string, readonly string[]>;

export const HEADLESS_ALLOWLIST = ["data-state", "data-side", "data-disabled", "data-orientation", "data-highlighted"] as const;

export const APPEARANCE_AXES = ["data-chrome", "data-palette", "data-mode"] as const;

export type ButtonRule = (typeof USAGE.button)[number];
export type FieldControlRule = (typeof USAGE.fieldControl)[number];
export type FieldErrorRule = (typeof USAGE.fieldError)[number];
export type ChoiceRule = (typeof USAGE.choice)[number];
export type SwitchRule = (typeof USAGE.switch)[number];
export type BadgeRule = (typeof USAGE.badge)[number];
export type AlertRule = (typeof USAGE.alert)[number];
export type AlertTitleRule = (typeof USAGE.alertTitle)[number];
export type AvatarRule = (typeof USAGE.avatar)[number];
export type AvatarGroupRule = (typeof USAGE.avatarGroup)[number];
