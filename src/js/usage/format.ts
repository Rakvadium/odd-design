import { APPEARANCE_AXES, HEADLESS_ALLOWLIST, USAGE, WRAPPERS } from "./contract.ts";

export const USAGE_CODES = [
  "ODD-CLASS-001",
  "ODD-BUTTON-001",
  "ODD-BUTTON-002",
  "ODD-BUTTON-003",
  "ODD-BUTTON-004",
  "ODD-BUTTON-005",
  "ODD-BUTTON-006",
  "ODD-BUTTON-007",
  "ODD-BUTTON-008",
  "ODD-BUTTON-009",
  "ODD-BUTTON-010",
  "ODD-BUTTON-011",
  "ODD-BUTTON-012",
  "ODD-BUTTON-013",
  "ODD-BUTTON-014",
  "ODD-BUTTON-015",
  "ODD-FIELD-001",
  "ODD-FIELD-002",
  "ODD-FIELD-003",
  "ODD-CHOICE-001",
  "ODD-CHOICE-002",
  "ODD-CHOICE-003",
  "ODD-BADGE-001",
  "ODD-BADGE-002",
  "ODD-BADGE-003",
  "ODD-BADGE-004",
  "ODD-ALERT-001",
  "ODD-ALERT-002",
  "ODD-ALERT-003",
  "ODD-ALERT-004",
  "ODD-ALERT-005",
  "ODD-STATIC-001",
  "ODD-STATIC-002",
  "ODD-STATIC-003",
] as const;

export type UsageCode = (typeof USAGE_CODES)[number];

export type MessageDetail = {
  found?: string;
  suggestion?: string;
};

type Join<T extends readonly string[], Sep extends string> = T extends readonly [
  infer Head extends string,
  ...infer Tail extends readonly string[],
]
  ? Tail extends readonly []
    ? Head
    : `${Head}${Sep}${Join<Tail, Sep>}`
  : "";

function comma<const T extends readonly [string, ...string[]]>(items: T): Join<T, ", "> {
  return items.join(", ") as Join<T, ", ">;
}

function and<const T extends readonly [string, ...string[]]>(items: T): Join<T, " and "> {
  return items.join(" and ") as Join<T, " and ">;
}

type EnumAllowed<V extends readonly string[], O extends readonly string[]> =
  `${Join<V, ", ">}. ${Join<O, " and ">} ${O extends readonly [string] ? "means" : "mean"} remove the attribute`;

function enumAllowed<const V extends readonly [string, ...string[]], const O extends readonly [string, ...string[]]>(
  values: V,
  omit: O,
): EnumAllowed<V, O> {
  return `${comma(values)}. ${and(omit)} ${omit.length === 1 ? "means" : "mean"} remove the attribute` as EnumAllowed<V, O>;
}

const variantRule = USAGE.button[1];
const sizeRule = USAGE.button[2];
const variantAllowed = enumAllowed(variantRule.values, variantRule.omit);
const sizeAllowed = enumAllowed(sizeRule.values, sizeRule.omit);
const buttonAttributes = comma([WRAPPERS.Button.props.variant, WRAPPERS.Button.props.size, WRAPPERS.Button.props.iconOnly]);
const toneRule = USAGE.badge[1];
const badgeAttributes = comma([WRAPPERS.Badge.props.tone, WRAPPERS.Badge.props.solid]);
const alertToneRule = USAGE.alert[1];
const alertToneAllowed = enumAllowed(alertToneRule.values, alertToneRule.omit);
const alertAttributes = WRAPPERS.Alert.props.tone;
const appearanceAxes = comma(APPEARANCE_AXES);
const headlessAllowlist = comma(HEADLESS_ALLOWLIST);

function text<
  const Code extends UsageCode,
  const Problem extends string,
  const Allowed extends string,
  const Fix extends string,
  const Docs extends string,
>(
  code: Code,
  problem: Problem,
  allowed: Allowed,
  fix: Fix,
  docs: Docs,
): `${Code}: ${Problem} Allowed values: ${Allowed}. Fix: ${Fix} ${Docs}` {
  return `${code}: ${problem} Allowed values: ${allowed}. Fix: ${fix} ${docs}`;
}

function withoutQuotes(value: string): string {
  return value.replaceAll('"', "");
}

export const MESSAGES = {
  "ODD-CLASS-001": text(
    "ODD-CLASS-001",
    "this class is not in the registry.",
    "the registered odd- classes",
    "use a registered class, or remove the class.",
    "docs/usage/general.md#odd-class-001",
  ),
  "ODD-BUTTON-001": text(
    "ODD-BUTTON-001",
    "odd-button belongs on a button or an anchor.",
    "button, a",
    "move odd-button onto a button or an a element.",
    "docs/usage/button.md#odd-button-001",
  ),
  "ODD-BUTTON-002": text(
    variantRule.code,
    "data-variant has a value this button does not take.",
    variantAllowed,
    "remove data-variant, or set primary, secondary, danger, or ghost.",
    "docs/usage/button.md#odd-button-002",
  ),
  "ODD-BUTTON-003": text(
    sizeRule.code,
    "data-size has a value this button does not take.",
    sizeAllowed,
    "remove data-size, or set sm or lg.",
    "docs/usage/button.md#odd-button-003",
  ),
  "ODD-BUTTON-004": text(
    "ODD-BUTTON-004",
    "data-icon-only must be empty or true.",
    "empty, true",
    "remove the value, or set true.",
    "docs/usage/button.md#odd-button-004",
  ),
  "ODD-BUTTON-005": text(
    "ODD-BUTTON-005",
    "aria-disabled must be true or false.",
    "true, false",
    "set aria-disabled to true or false, or remove it.",
    "docs/usage/button.md#odd-button-005",
  ),
  "ODD-BUTTON-006": text(
    "ODD-BUTTON-006",
    "aria-busy must be true or false.",
    "true, false",
    "set aria-busy to true or false, or remove it.",
    "docs/usage/button.md#odd-button-006",
  ),
  "ODD-BUTTON-007": text(
    "ODD-BUTTON-007",
    "the disabled attribute is forbidden on odd-button.",
    "none",
    "remove disabled and set aria-disabled.",
    "docs/usage/button.md#odd-button-007",
  ),
  "ODD-BUTTON-008": text(
    "ODD-BUTTON-008",
    "an icon-only button needs an accessible name.",
    "aria-label, aria-labelledby",
    "add aria-label or aria-labelledby.",
    "docs/usage/button.md#odd-button-008",
  ),
  "ODD-BUTTON-009": text(
    "ODD-BUTTON-009",
    "an anchor with odd-button needs an href.",
    "an href",
    "add an href.",
    "docs/usage/button.md#odd-button-009",
  ),
  "ODD-BUTTON-010": text(
    "ODD-BUTTON-010",
    "a button must not have an href.",
    "none",
    "remove href, or use an anchor.",
    "docs/usage/button.md#odd-button-010",
  ),
  "ODD-BUTTON-011": text(
    "ODD-BUTTON-011",
    "aria-current must be page.",
    "page",
    "set aria-current to page, or remove it.",
    "docs/usage/button.md#odd-button-011",
  ),
  "ODD-BUTTON-012": text(
    "ODD-BUTTON-012",
    "aria-current is allowed only on an anchor.",
    "an a element",
    "move aria-current onto an a element, or remove it.",
    "docs/usage/button.md#odd-button-012",
  ),
  "ODD-BUTTON-013": text(
    "ODD-BUTTON-013",
    "aria-disabled is not allowed on a link.",
    "none",
    "remove aria-disabled and keep the href. Render a button when the control should not navigate. Render plain text without odd-button when the control should not look like a button.",
    "docs/usage/button.md#odd-button-013",
  ),
  "ODD-BUTTON-014": text(
    "ODD-BUTTON-014",
    "an icon-only button must not contain visible text. Children with aria-hidden do not count.",
    "no visible text",
    "remove the visible text, or remove data-icon-only.",
    "docs/usage/button.md#odd-button-014",
  ),
  "ODD-BUTTON-015": text(
    "ODD-BUTTON-015",
    "this button does not take that data attribute.",
    "the button attributes, any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute, or correct its name. Button attributes: ${buttonAttributes}. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/button.md#odd-button-015",
  ),
  "ODD-FIELD-001": text(
    "ODD-FIELD-001",
    "this field class is on the wrong element.",
    "odd-field on div, odd-input on input, odd-textarea on textarea, odd-select on select, odd-hint on p, odd-error on p",
    "move the class onto its element.",
    "docs/usage/field.md#odd-field-001",
  ),
  "ODD-FIELD-002": text(
    "ODD-FIELD-002",
    "hidden and aria-hidden are forbidden on odd-error. A hidden error that aria-describedby references is still announced.",
    "none",
    "render odd-error only while the field is invalid, and remove hidden and aria-hidden.",
    "docs/usage/field.md#odd-field-002",
  ),
  "ODD-FIELD-003": text(
    "ODD-FIELD-003",
    "aria-disabled is forbidden on a field control. The control stays editable and does not look disabled.",
    "none",
    "remove aria-disabled and set disabled.",
    "docs/usage/field.md#odd-field-003",
  ),
  "ODD-CHOICE-001": text(
    "ODD-CHOICE-001",
    "this choice class is on the wrong element.",
    "odd-choice on label, odd-switch on input, odd-segmented on fieldset",
    "move the class onto its element.",
    "docs/usage/choice.md#odd-choice-001",
  ),
  "ODD-CHOICE-002": text(
    "ODD-CHOICE-002",
    "odd-switch needs type checkbox and role switch. Without the type it is a text box, and without the role a screen reader announces a checkbox.",
    "type checkbox, role switch",
    "set type to checkbox and role to switch.",
    "docs/usage/choice.md#odd-choice-002",
  ),
  "ODD-CHOICE-003": text(
    "ODD-CHOICE-003",
    "aria-disabled is forbidden on odd-choice, odd-switch, and odd-segmented. The input still toggles and does not look disabled.",
    "none",
    "remove aria-disabled and use the native disabled attribute on the input, or on the fieldset of a segmented control.",
    "docs/usage/choice.md#odd-choice-003",
  ),
  "ODD-BADGE-001": text(
    "ODD-BADGE-001",
    "odd-badge belongs on a span. A badge sits in a sentence, a heading, or a button, where a div is not allowed.",
    "span",
    "move odd-badge onto a span element.",
    "docs/usage/badge.md#odd-badge-001",
  ),
  "ODD-BADGE-002": text(
    toneRule.code,
    "data-tone has a value this badge does not take.",
    comma(toneRule.values),
    "set one of the allowed tones, or remove data-tone for a neutral badge.",
    "docs/usage/badge.md#odd-badge-002",
  ),
  "ODD-BADGE-003": text(
    "ODD-BADGE-003",
    "data-solid must be empty or true. Any value turns the badge solid, so data-solid=false is solid too.",
    "empty, true",
    "remove data-solid for a soft badge, or set it empty or true for a solid one.",
    "docs/usage/badge.md#odd-badge-003",
  ),
  "ODD-BADGE-004": text(
    "ODD-BADGE-004",
    "this badge does not take that data attribute.",
    "the badge attributes, any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute, or correct its name. Badge attributes: ${badgeAttributes}. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/badge.md#odd-badge-004",
  ),
  "ODD-ALERT-001": text(
    "ODD-ALERT-001",
    "this alert class is on the wrong element.",
    "odd-alert on div, odd-alert-title on p",
    "move the class onto its element.",
    "docs/usage/alert.md#odd-alert-001",
  ),
  "ODD-ALERT-002": text(
    alertToneRule.code,
    "data-tone has a value this alert does not take.",
    alertToneAllowed,
    "set one of the allowed tones, or remove data-tone for a neutral alert.",
    "docs/usage/alert.md#odd-alert-002",
  ),
  "ODD-ALERT-003": text(
    "ODD-ALERT-003",
    "role and aria-live are forbidden on odd-alert. Screen readers announce a live region that was already on the page, not one that arrives with the alert.",
    "none",
    "remove role and aria-live. For a message that appears later, put role=status or role=alert on an empty container that is already on the page, and insert the alert into it.",
    "docs/usage/alert.md#odd-alert-003",
  ),
  "ODD-ALERT-004": text(
    "ODD-ALERT-004",
    "this alert does not take that data attribute.",
    "the alert attribute, any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute, or correct its name. Alert attributes: ${alertAttributes}. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/alert.md#odd-alert-004",
  ),
  "ODD-ALERT-005": text(
    "ODD-ALERT-005",
    "odd-alert-title does not take that data attribute.",
    "any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute. data-tone belongs on the alert. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/alert.md#odd-alert-005",
  ),
  "ODD-STATIC-001": text(
    "ODD-STATIC-001",
    "a class or attribute value is not a literal, or a PascalCase component has an odd- class.",
    "literal text",
    "write a literal value so the checker can read it.",
    "docs/usage/general.md#odd-static-001",
  ),
  "ODD-STATIC-002": text(
    "ODD-STATIC-002",
    "a template that contains a contract class is not marked for HTML parsing.",
    "an html tag or the html comment marker",
    "tag the template html, or mark it with the html comment.",
    "docs/usage/general.md#odd-static-002",
  ),
  "ODD-STATIC-003": text(
    "ODD-STATIC-003",
    "an odd disable comment has no written reason.",
    "a written reason",
    "add a reason after the disable comment.",
    "docs/usage/general.md#odd-static-003",
  ),
} as const satisfies Record<UsageCode, string>;

export function message<Code extends UsageCode>(code: Code): (typeof MESSAGES)[Code];
export function message<Code extends UsageCode>(code: Code, detail: MessageDetail): string;
export function message<Code extends UsageCode>(code: Code, detail?: MessageDetail): (typeof MESSAGES)[Code] | string {
  const base = MESSAGES[code];
  if (detail === undefined) return base;
  const found = detail.found === undefined ? "" : withoutQuotes(detail.found);
  const suggestion = detail.suggestion === undefined ? "" : withoutQuotes(detail.suggestion);
  if (found === "" && suggestion === "") return base;
  const foundText = found === "" ? "" : ` Found ${found}.`;
  const suggestionText = suggestion === "" ? "" : ` Did you mean ${suggestion}?`;
  return `${base}${foundText}${suggestionText}`;
}
