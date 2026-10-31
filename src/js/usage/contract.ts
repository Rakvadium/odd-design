import type { UsageCode } from "./format.ts";

type ChildValue = { attribute?: never; value?: never } | { attribute: string; value: string };

export type UsageRule =
  | { kind: "element"; code: UsageCode; className: string; elements: readonly string[] }
  | { kind: "class"; code: UsageCode; className: string }
  | { kind: "enum"; code: UsageCode; attribute: string; values: readonly string[]; omit: readonly string[] }
  | { kind: "boolean-attribute"; code: UsageCode; attribute: string; values: readonly string[] }
  | { kind: "aria-boolean"; code: UsageCode; attribute: string; values: readonly string[] }
  | { kind: "forbidden-attribute"; code: UsageCode; attribute: string }
  | { kind: "required-attribute"; code: UsageCode; element?: string; attribute: string }
  | { kind: "fragment-link"; code: UsageCode; attribute: string }
  | { kind: "forbidden-on-element"; code: UsageCode; element: string; attribute: string }
  | { kind: "forbidden-value"; code: UsageCode; attribute: string; value: string; when: { readonly attribute: string; readonly value: string } }
  | { kind: "enum-on-element"; code: UsageCode; element: string; attribute: string }
  | { kind: "accessible-name"; code: UsageCode; attribute: string; names: readonly string[] }
  | { kind: "accessible-name"; code: UsageCode; element: string; names: readonly string[] }
  | { kind: "name-requires"; code: UsageCode; attribute: string; names: readonly string[] }
  | { kind: "icon-only-text"; code: UsageCode; attribute: string; ignore: string }
  | { kind: "system-data"; code: UsageCode; allow?: readonly string[] }
  | { kind: "stretched-link"; code: UsageCode; attribute: string; className: string; controls: readonly string[] }
  | ({ kind: "required-child"; code: UsageCode; element: string; child: string } & ChildValue)
  | ({ kind: "required-child"; code: UsageCode; element: string; role: string } & ChildValue)
  | ({ kind: "required-child"; code: UsageCode; element: string; className: string } & ChildValue)
  | { kind: "role-descendant"; code: UsageCode; role: string; elements: readonly string[]; attribute: string }
  | { kind: "child-value"; code: UsageCode; attribute: string; values: readonly string[] }
  | { kind: "descendant-name"; code: UsageCode; attribute: string; names: readonly string[] }
  | { kind: "unknown-class"; code: UsageCode }
  | { kind: "computed-value"; code: UsageCode }
  | { kind: "untagged-template"; code: UsageCode };

export type RuleKind = UsageRule["kind"];

const modal = [
  { kind: "accessible-name", code: "ODD-DIALOG-002", element: "dialog", names: ["aria-label", "aria-labelledby"] },
  { kind: "enum", code: "ODD-DIALOG-003", attribute: "role", values: ["alertdialog"], omit: ["dialog"] },
  { kind: "forbidden-attribute", code: "ODD-DIALOG-004", attribute: "open" },
  { kind: "enum", code: "ODD-DIALOG-005", attribute: "closedby", values: ["any", "closerequest"], omit: [] },
  { kind: "forbidden-value", code: "ODD-DIALOG-006", attribute: "closedby", value: "any", when: { attribute: "role", value: "alertdialog" } },
] as const satisfies readonly UsageRule[];

const autoPopover = [
  { kind: "required-attribute", code: "ODD-POPOVER-002", element: "div", attribute: "popover" },
  { kind: "enum", code: "ODD-POPOVER-002", attribute: "popover", values: ["", "auto"], omit: [] },
] as const satisfies readonly UsageRule[];

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
  separator: [
    { kind: "element", code: "ODD-SEPARATOR-001", className: "odd-separator", elements: ["hr"] },
    { kind: "enum", code: "ODD-SEPARATOR-002", attribute: "aria-orientation", values: ["horizontal", "vertical"], omit: [] },
    { kind: "forbidden-attribute", code: "ODD-SEPARATOR-002", attribute: "data-orientation" },
    { kind: "enum", code: "ODD-SEPARATOR-003", attribute: "role", values: ["separator"], omit: [] },
    { kind: "forbidden-attribute", code: "ODD-SEPARATOR-003", attribute: "aria-hidden" },
    { kind: "system-data", code: "ODD-SEPARATOR-004" },
  ] as const satisfies readonly UsageRule[],
  skeleton: [
    { kind: "element", code: "ODD-SKELETON-001", className: "odd-skeleton", elements: ["div"] },
    { kind: "enum", code: "ODD-SKELETON-002", attribute: "data-shape", values: ["avatar"], omit: ["text", "line", "rect", "rectangular", "rounded"] },
    { kind: "required-attribute", code: "ODD-SKELETON-003", element: "div", attribute: "aria-hidden" },
    { kind: "enum", code: "ODD-SKELETON-003", attribute: "aria-hidden", values: ["true"], omit: [] },
    { kind: "icon-only-text", code: "ODD-SKELETON-004", attribute: "aria-hidden", ignore: "aria-hidden" },
    { kind: "forbidden-attribute", code: "ODD-SKELETON-004", attribute: "aria-busy" },
    { kind: "forbidden-attribute", code: "ODD-SKELETON-004", attribute: "role" },
    { kind: "forbidden-attribute", code: "ODD-SKELETON-004", attribute: "aria-label" },
    { kind: "forbidden-attribute", code: "ODD-SKELETON-004", attribute: "aria-labelledby" },
    { kind: "system-data", code: "ODD-SKELETON-005" },
  ] as const satisfies readonly UsageRule[],
  card: [
    { kind: "element", code: "ODD-CARD-001", className: "odd-card", elements: ["article", "section", "div"] },
    { kind: "boolean-attribute", code: "ODD-CARD-002", attribute: "data-interactive", values: ["", "true"] },
    { kind: "stretched-link", code: "ODD-CARD-003", attribute: "data-interactive", className: "odd-card-link", controls: ["a", "button"] },
    { kind: "forbidden-attribute", code: "ODD-CARD-004", attribute: "onClick" },
    { kind: "forbidden-attribute", code: "ODD-CARD-004", attribute: "onclick" },
    { kind: "forbidden-attribute", code: "ODD-CARD-004", attribute: "tabIndex" },
    { kind: "forbidden-attribute", code: "ODD-CARD-004", attribute: "tabindex" },
    { kind: "system-data", code: "ODD-CARD-006", allow: ["data-span"] },
  ] as const satisfies readonly UsageRule[],
  cardTitle: [
    { kind: "element", code: "ODD-CARD-001", className: "odd-card-title", elements: ["h1", "h2", "h3", "h4", "h5", "h6"] },
    { kind: "system-data", code: "ODD-CARD-007" },
  ] as const satisfies readonly UsageRule[],
  cardLink: [
    { kind: "element", code: "ODD-CARD-001", className: "odd-card-link", elements: ["a", "button"] },
    { kind: "required-attribute", code: "ODD-CARD-005", element: "a", attribute: "href" },
    { kind: "system-data", code: "ODD-CARD-007" },
  ] as const satisfies readonly UsageRule[],
  cardFooter: [
    { kind: "element", code: "ODD-CARD-001", className: "odd-card-footer", elements: ["div"] },
    { kind: "system-data", code: "ODD-CARD-007" },
  ] as const satisfies readonly UsageRule[],
  disclosure: [
    { kind: "element", code: "ODD-DISCLOSURE-001", className: "odd-disclosure", elements: ["details"] },
    { kind: "required-child", code: "ODD-DISCLOSURE-002", element: "details", child: "summary" },
    { kind: "system-data", code: "ODD-DISCLOSURE-003" },
  ] as const satisfies readonly UsageRule[],
  tabs: [
    { kind: "element", code: "ODD-TABS-001", className: "odd-tabs", elements: ["div"] },
    { kind: "required-child", code: "ODD-TABS-002", element: "div", role: "tablist" },
    { kind: "forbidden-attribute", code: "ODD-TABS-003", attribute: "aria-orientation" },
    { kind: "forbidden-attribute", code: "ODD-TABS-003", attribute: "data-activation" },
    { kind: "role-descendant", code: "ODD-TABS-004", role: "tab", elements: ["button"], attribute: "aria-controls" },
    { kind: "system-data", code: "ODD-TABS-005" },
  ] as const satisfies readonly UsageRule[],
  search: [
    { kind: "element", code: "ODD-SEARCH-001", className: "odd-search", elements: ["search", "form"] },
    { kind: "required-child", code: "ODD-SEARCH-002", element: "search", className: "odd-input", attribute: "type", value: "search" },
    { kind: "required-child", code: "ODD-SEARCH-002", element: "form", className: "odd-input", attribute: "type", value: "search" },
    { kind: "required-child", code: "ODD-SEARCH-003", element: "search", child: "svg", attribute: "aria-hidden", value: "true" },
    { kind: "required-child", code: "ODD-SEARCH-003", element: "form", child: "svg", attribute: "aria-hidden", value: "true" },
    { kind: "forbidden-on-element", code: "ODD-SEARCH-004", element: "search", attribute: "onSubmit" },
    { kind: "forbidden-on-element", code: "ODD-SEARCH-004", element: "search", attribute: "onsubmit" },
    { kind: "system-data", code: "ODD-SEARCH-005" },
  ] as const satisfies readonly UsageRule[],
  slider: [
    { kind: "element", code: "ODD-SLIDER-001", className: "odd-slider", elements: ["input"] },
    { kind: "required-attribute", code: "ODD-SLIDER-002", element: "input", attribute: "type" },
    { kind: "enum", code: "ODD-SLIDER-002", attribute: "type", values: ["range"], omit: [] },
    { kind: "forbidden-attribute", code: "ODD-SLIDER-003", attribute: "aria-disabled" },
    { kind: "system-data", code: "ODD-SLIDER-004" },
  ] as const satisfies readonly UsageRule[],
  meter: [
    { kind: "element", code: "ODD-METER-001", className: "odd-meter", elements: ["meter"] },
    { kind: "element", code: "ODD-METER-001", className: "odd-progress", elements: ["progress"] },
    { kind: "enum", code: "ODD-METER-002", attribute: "data-tone", values: ["success", "warning", "danger", "info"], omit: ["primary", "neutral"] },
    { kind: "system-data", code: "ODD-METER-003" },
  ] as const satisfies readonly UsageRule[],
  toaster: [
    { kind: "element", code: "ODD-TOAST-001", className: "odd-toaster", elements: ["section"] },
    { kind: "required-attribute", code: "ODD-TOAST-002", element: "section", attribute: "popover" },
    { kind: "enum", code: "ODD-TOAST-002", attribute: "popover", values: ["manual"], omit: [] },
    { kind: "required-attribute", code: "ODD-TOAST-003", element: "section", attribute: "aria-label" },
    { kind: "system-data", code: "ODD-TOAST-004" },
  ] as const satisfies readonly UsageRule[],
  popover: [
    { kind: "element", code: "ODD-POPOVER-001", className: "odd-popover", elements: ["div"] },
    ...autoPopover,
    { kind: "enum", code: "ODD-POPOVER-003", attribute: "role", values: ["dialog"], omit: [] },
    { kind: "accessible-name", code: "ODD-POPOVER-004", attribute: "role", names: ["aria-label", "aria-labelledby"] },
    { kind: "name-requires", code: "ODD-POPOVER-005", attribute: "role", names: ["aria-label", "aria-labelledby"] },
    { kind: "system-data", code: "ODD-POPOVER-006" },
  ] as const satisfies readonly UsageRule[],
  dialog: [
    { kind: "element", code: "ODD-DIALOG-001", className: "odd-dialog", elements: ["dialog"] },
    ...modal,
    { kind: "system-data", code: "ODD-DIALOG-007" },
  ] as const satisfies readonly UsageRule[],
  dialogPart: [
    { kind: "element", code: "ODD-DIALOG-001", className: "odd-dialog-body", elements: ["div", "form"] },
    { kind: "element", code: "ODD-DIALOG-001", className: "odd-dialog-title", elements: ["h1", "h2", "h3", "h4", "h5", "h6"] },
    { kind: "element", code: "ODD-DIALOG-001", className: "odd-dialog-actions", elements: ["div"] },
    { kind: "system-data", code: "ODD-DIALOG-008" },
  ] as const satisfies readonly UsageRule[],
  sheet: [
    { kind: "element", code: "ODD-SHEET-001", className: "odd-sheet", elements: ["dialog"] },
    ...modal,
    { kind: "enum", code: "ODD-SHEET-002", attribute: "data-side", values: ["start", "top", "bottom"], omit: ["end"] },
    { kind: "system-data", code: "ODD-SHEET-003" },
  ] as const satisfies readonly UsageRule[],
  sheetPart: [
    { kind: "element", code: "ODD-SHEET-001", className: "odd-sheet-header", elements: ["div"] },
    { kind: "element", code: "ODD-SHEET-001", className: "odd-sheet-body", elements: ["div", "form"] },
    { kind: "element", code: "ODD-SHEET-001", className: "odd-sheet-footer", elements: ["div"] },
    { kind: "system-data", code: "ODD-SHEET-003" },
  ] as const satisfies readonly UsageRule[],
  menu: [
    { kind: "element", code: "ODD-MENU-001", className: "odd-menu", elements: ["div"] },
    ...autoPopover,
    { kind: "required-attribute", code: "ODD-MENU-002", element: "div", attribute: "role" },
    { kind: "enum", code: "ODD-MENU-002", attribute: "role", values: ["menu"], omit: [] },
    { kind: "accessible-name", code: "ODD-MENU-003", element: "div", names: ["aria-label", "aria-labelledby"] },
    { kind: "system-data", code: "ODD-MENU-004" },
  ] as const satisfies readonly UsageRule[],
  menuItem: [
    { kind: "element", code: "ODD-MENU-001", className: "odd-menu-item", elements: ["button"] },
    { kind: "required-attribute", code: "ODD-MENU-005", element: "button", attribute: "role" },
    { kind: "enum", code: "ODD-MENU-005", attribute: "role", values: ["menuitem", "menuitemcheckbox", "menuitemradio"], omit: [] },
    { kind: "enum", code: "ODD-MENU-006", attribute: "data-tone", values: ["danger"], omit: [] },
    { kind: "forbidden-attribute", code: "ODD-MENU-007", attribute: "disabled" },
    { kind: "system-data", code: "ODD-MENU-004" },
  ] as const satisfies readonly UsageRule[],
  tableWrap: [
    { kind: "element", code: "ODD-TABLE-001", className: "odd-table-wrap", elements: ["div"] },
    { kind: "enum", code: "ODD-TABLE-002", attribute: "role", values: ["region"], omit: [] },
    { kind: "name-requires", code: "ODD-TABLE-002", attribute: "role", names: ["tabindex", "tabIndex", "aria-label", "aria-labelledby"] },
    { kind: "accessible-name", code: "ODD-TABLE-003", attribute: "role", names: ["aria-label", "aria-labelledby"] },
    { kind: "system-data", code: "ODD-TABLE-004" },
  ] as const satisfies readonly UsageRule[],
  table: [
    { kind: "element", code: "ODD-TABLE-001", className: "odd-table", elements: ["table"] },
    { kind: "system-data", code: "ODD-TABLE-004" },
    { kind: "descendant-name", code: "ODD-TABLE-006", attribute: "data-select-all", names: ["aria-label", "aria-labelledby"] },
  ] as const satisfies readonly UsageRule[],
  tableSort: [
    { kind: "element", code: "ODD-TABLE-001", className: "odd-table-sort", elements: ["button"] },
    { kind: "forbidden-attribute", code: "ODD-TABLE-005", attribute: "aria-sort" },
    { kind: "system-data", code: "ODD-TABLE-004" },
  ] as const satisfies readonly UsageRule[],
  scope: [
    { kind: "class", code: "ODD-SCOPE-001", className: "odd-scope" },
    { kind: "required-attribute", code: "ODD-SCOPE-001", attribute: "data-chrome" },
    { kind: "required-attribute", code: "ODD-SCOPE-001", attribute: "data-palette" },
    { kind: "required-attribute", code: "ODD-SCOPE-001", attribute: "data-mode" },
  ] as const satisfies readonly UsageRule[],
  skipLink: [
    { kind: "element", code: "ODD-SKIP-001", className: "odd-skip-link", elements: ["a"] },
    { kind: "required-attribute", code: "ODD-SKIP-001", element: "a", attribute: "href" },
    { kind: "fragment-link", code: "ODD-SKIP-001", attribute: "href" },
  ] as const satisfies readonly UsageRule[],
  grid: [
    { kind: "class", code: "ODD-GRID-001", className: "odd-grid" },
    { kind: "child-value", code: "ODD-GRID-001", attribute: "data-span", values: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] },
  ] as const satisfies readonly UsageRule[],
  shell: [
    { kind: "element", code: "ODD-SHELL-001", className: "odd-shell-header", elements: ["header"] },
    { kind: "element", code: "ODD-SHELL-001", className: "odd-shell-main", elements: ["main"] },
  ] as const satisfies readonly UsageRule[],
  heading: [
    { kind: "element", code: "ODD-TYPOGRAPHY-001", className: "odd-heading", elements: ["h1", "h2", "h3", "h4", "h5", "h6"] },
    { kind: "enum", code: "ODD-TYPOGRAPHY-002", attribute: "data-size", values: ["xs", "sm", "lg", "xl", "2xl", "hero"], omit: ["md"] },
  ] as const satisfies readonly UsageRule[],
  eyebrow: [
    { kind: "class", code: "ODD-TYPOGRAPHY-003", className: "odd-eyebrow" },
    { kind: "enum", code: "ODD-TYPOGRAPHY-003", attribute: "data-tone", values: ["primary", "foreground"], omit: [] },
  ] as const satisfies readonly UsageRule[],
  link: [
    { kind: "element", code: "ODD-LINK-001", className: "odd-link", elements: ["a"] },
    { kind: "required-attribute", code: "ODD-LINK-002", element: "a", attribute: "href" },
    { kind: "forbidden-attribute", code: "ODD-LINK-003", attribute: "aria-disabled" },
    { kind: "forbidden-attribute", code: "ODD-LINK-003", attribute: "disabled" },
    { kind: "forbidden-attribute", code: "ODD-LINK-004", attribute: "role" },
    { kind: "enum", code: "ODD-LINK-005", attribute: "aria-current", values: ["page"], omit: [] },
    { kind: "system-data", code: "ODD-LINK-006" },
    { kind: "name-requires", code: "ODD-LINK-007", attribute: "rel", names: ["target"] },
  ] as const satisfies readonly UsageRule[],
  spinner: [
    { kind: "element", code: "ODD-SPINNER-001", className: "odd-spinner", elements: ["span"] },
    { kind: "required-attribute", code: "ODD-SPINNER-002", element: "span", attribute: "aria-hidden" },
    { kind: "enum", code: "ODD-SPINNER-002", attribute: "aria-hidden", values: ["true"], omit: [] },
    { kind: "icon-only-text", code: "ODD-SPINNER-002", attribute: "aria-hidden", ignore: "aria-hidden" },
    { kind: "forbidden-attribute", code: "ODD-SPINNER-002", attribute: "role" },
    { kind: "forbidden-attribute", code: "ODD-SPINNER-002", attribute: "aria-label" },
    { kind: "forbidden-attribute", code: "ODD-SPINNER-002", attribute: "aria-labelledby" },
    { kind: "forbidden-attribute", code: "ODD-SPINNER-002", attribute: "aria-busy" },
    { kind: "system-data", code: "ODD-SPINNER-003" },
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
  Separator: { source: "odd-design/react", className: "odd-separator", props: {}, element: "hr" },
  Skeleton: { source: "odd-design/react", className: "odd-skeleton", props: { shape: "data-shape" }, element: "div" },
  Card: { source: "odd-design/react", className: "odd-card", props: { interactive: "data-interactive" }, element: "article" },
  CardLink: { source: "odd-design/react", className: "odd-card-link", props: {}, element: "a" },
  CardFooter: { source: "odd-design/react", className: "odd-card-footer", props: {}, element: "div" },
  Disclosure: { source: "odd-design/react", className: "odd-disclosure", props: {}, element: "details" },
  Tabs: { source: "odd-design/react", className: "odd-tabs", props: {}, element: "div" },
  Search: { source: "odd-design/react", className: "odd-search", props: {}, element: "search" },
  Slider: { source: "odd-design/react", className: "odd-slider", props: {}, element: "input" },
  Meter: { source: "odd-design/react", className: "odd-meter", props: { tone: "data-tone" }, element: "meter" },
  Progress: { source: "odd-design/react", className: "odd-progress", props: { tone: "data-tone" }, element: "progress" },
  Toaster: { source: "odd-design/react", className: "odd-toaster", props: {}, element: "section" },
  Popover: { source: "odd-design/react", className: "odd-popover", props: {}, element: "div" },
  Dialog: { source: "odd-design/react", className: "odd-dialog", props: {}, element: "dialog" },
  DialogActions: { source: "odd-design/react", className: "odd-dialog-actions", props: {}, element: "div" },
  Sheet: { source: "odd-design/react", className: "odd-sheet", props: { side: "data-side" }, element: "dialog" },
  SheetHeader: { source: "odd-design/react", className: "odd-sheet-header", props: {}, element: "div" },
  SheetFooter: { source: "odd-design/react", className: "odd-sheet-footer", props: {}, element: "div" },
  Menu: { source: "odd-design/react", className: "odd-menu", props: {}, element: "div" },
  MenuItem: { source: "odd-design/react", className: "odd-menu-item", props: { tone: "data-tone" }, element: "button" },
  TableWrap: { source: "odd-design/react", className: "odd-table-wrap", props: {}, element: "div" },
  Table: { source: "odd-design/react", className: "odd-table", props: {}, element: "table" },
  TableSort: { source: "odd-design/react", className: "odd-table-sort", props: {}, element: "button" },
  TextLink: { source: "odd-design/react", className: "odd-link", props: {}, element: "a" },
  Spinner: { source: "odd-design/react", className: "odd-spinner", props: {}, element: "span" },
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
  "odd-eyebrow",
  "odd-field",
  "odd-grid",
  "odd-heading",
  "odd-hint",
  "odd-hover-card",
  "odd-input",
  "odd-label",
  "odd-link",
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
  "odd-spinner",
  "odd-stack",
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

export const VOCABULARY = {
  alert: ["data-tone"],
  avatar: ["data-size"],
  badge: ["data-solid", "data-tone"],
  button: ["data-icon-only", "data-size", "data-variant"],
  card: ["data-interactive"],
  choice: [],
  dialog: [],
  disclosure: [],
  field: [],
  grid: ["data-span"],
  link: [],
  log: ["data-tone"],
  menu: ["data-tone"],
  meter: ["data-tone"],
  popover: [],
  search: [],
  separator: [],
  sheet: ["data-side"],
  shell: [],
  skeleton: ["data-shape"],
  slider: [],
  spinner: [],
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
export type SeparatorRule = (typeof USAGE.separator)[number];
export type SkeletonRule = (typeof USAGE.skeleton)[number];
export type CardRule = (typeof USAGE.card)[number];
export type CardLinkRule = (typeof USAGE.cardLink)[number];
export type CardFooterRule = (typeof USAGE.cardFooter)[number];
export type DisclosureRule = (typeof USAGE.disclosure)[number];
export type TabsRule = (typeof USAGE.tabs)[number];
export type SearchRule = (typeof USAGE.search)[number];
export type SliderRule = (typeof USAGE.slider)[number];
export type MeterRule = (typeof USAGE.meter)[number];
export type ToasterRule = (typeof USAGE.toaster)[number];
export type PopoverRule = (typeof USAGE.popover)[number];
export type DialogRule = (typeof USAGE.dialog)[number];
export type DialogPartRule = (typeof USAGE.dialogPart)[number];
export type SheetRule = (typeof USAGE.sheet)[number];
export type SheetPartRule = (typeof USAGE.sheetPart)[number];
export type MenuRule = (typeof USAGE.menu)[number];
export type MenuItemRule = (typeof USAGE.menuItem)[number];
export type TableWrapRule = (typeof USAGE.tableWrap)[number];
export type TableRule = (typeof USAGE.table)[number];
export type TableSortRule = (typeof USAGE.tableSort)[number];
export type LinkRule = (typeof USAGE.link)[number];
export type SpinnerRule = (typeof USAGE.spinner)[number];
