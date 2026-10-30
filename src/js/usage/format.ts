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
  "ODD-AVATAR-001",
  "ODD-AVATAR-002",
  "ODD-AVATAR-003",
  "ODD-AVATAR-004",
  "ODD-AVATAR-005",
  "ODD-AVATAR-006",
  "ODD-SEPARATOR-001",
  "ODD-SEPARATOR-002",
  "ODD-SEPARATOR-003",
  "ODD-SEPARATOR-004",
  "ODD-SKELETON-001",
  "ODD-SKELETON-002",
  "ODD-SKELETON-003",
  "ODD-SKELETON-004",
  "ODD-SKELETON-005",
  "ODD-CARD-001",
  "ODD-CARD-002",
  "ODD-CARD-003",
  "ODD-CARD-004",
  "ODD-CARD-005",
  "ODD-CARD-006",
  "ODD-CARD-007",
  "ODD-DISCLOSURE-001",
  "ODD-DISCLOSURE-002",
  "ODD-DISCLOSURE-003",
  "ODD-TABS-001",
  "ODD-TABS-002",
  "ODD-TABS-003",
  "ODD-TABS-004",
  "ODD-TABS-005",
  "ODD-SEARCH-001",
  "ODD-SEARCH-002",
  "ODD-SEARCH-003",
  "ODD-SEARCH-004",
  "ODD-SEARCH-005",
  "ODD-SLIDER-001",
  "ODD-SLIDER-002",
  "ODD-SLIDER-003",
  "ODD-SLIDER-004",
  "ODD-METER-001",
  "ODD-METER-002",
  "ODD-METER-003",
  "ODD-TOAST-001",
  "ODD-TOAST-002",
  "ODD-TOAST-003",
  "ODD-TOAST-004",
  "ODD-POPOVER-001",
  "ODD-POPOVER-002",
  "ODD-POPOVER-003",
  "ODD-POPOVER-004",
  "ODD-POPOVER-005",
  "ODD-POPOVER-006",
  "ODD-DIALOG-001",
  "ODD-DIALOG-002",
  "ODD-DIALOG-003",
  "ODD-DIALOG-004",
  "ODD-DIALOG-005",
  "ODD-DIALOG-006",
  "ODD-DIALOG-007",
  "ODD-DIALOG-008",
  "ODD-SHEET-001",
  "ODD-SHEET-002",
  "ODD-SHEET-003",
  "ODD-MENU-001",
  "ODD-MENU-002",
  "ODD-MENU-003",
  "ODD-MENU-004",
  "ODD-MENU-005",
  "ODD-MENU-006",
  "ODD-MENU-007",
  "ODD-TABLE-001",
  "ODD-TABLE-002",
  "ODD-TABLE-003",
  "ODD-TABLE-004",
  "ODD-TABLE-005",
  "ODD-TABLE-006",
  "ODD-SCOPE-001",
  "ODD-SKIP-001",
  "ODD-GRID-001",
  "ODD-SHELL-001",
  "ODD-TYPOGRAPHY-001",
  "ODD-TYPOGRAPHY-002",
  "ODD-TYPOGRAPHY-003",
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
const avatarSizeRule = USAGE.avatar[1];
const avatarSizeAllowed = enumAllowed(avatarSizeRule.values, avatarSizeRule.omit);
const avatarAttributes = WRAPPERS.Avatar.props.size;
const shapeRule = USAGE.skeleton[1];
const shapeAllowed = enumAllowed(shapeRule.values, shapeRule.omit);
const skeletonAttributes = WRAPPERS.Skeleton.props.shape;
const cardAttributes = WRAPPERS.Card.props.interactive;
const meterToneRule = USAGE.meter[2];
const meterToneAllowed = enumAllowed(meterToneRule.values, meterToneRule.omit);
const meterAttributes = WRAPPERS.Meter.props.tone;
const dialogRoleRule = USAGE.dialog[2] satisfies { kind: "enum"; attribute: "role" };
const dialogRoleAllowed = enumAllowed(dialogRoleRule.values, dialogRoleRule.omit);
const sideRule = USAGE.sheet[6] satisfies { kind: "enum"; attribute: "data-side" };
const sideAllowed = enumAllowed(sideRule.values, sideRule.omit);
const sheetAttributes = WRAPPERS.Sheet.props.side;
const menuToneRule = USAGE.menuItem[3] satisfies { kind: "enum"; attribute: "data-tone" };
const menuItemRoles = comma((USAGE.menuItem[2] satisfies { kind: "enum"; attribute: "role" }).values);
const menuAttributes = WRAPPERS.MenuItem.props.tone;
const headingSizeRule = USAGE.heading[1];
const headingSizeAllowed = enumAllowed(headingSizeRule.values, headingSizeRule.omit);
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
  "ODD-AVATAR-001": text(
    "ODD-AVATAR-001",
    "this avatar class is on the wrong element.",
    "odd-avatar on span, odd-avatar-group on div",
    "move the class onto its element. An avatar sits inline beside text, where a div is not allowed.",
    "docs/usage/avatar.md#odd-avatar-001",
  ),
  "ODD-AVATAR-002": text(
    avatarSizeRule.code,
    "data-size has a value this avatar does not take.",
    avatarSizeAllowed,
    "set sm or lg, or remove data-size for the default size.",
    "docs/usage/avatar.md#odd-avatar-002",
  ),
  "ODD-AVATAR-003": text(
    "ODD-AVATAR-003",
    "this avatar has the wrong role. An initials avatar is an image, and a group of avatars is a group.",
    "img on odd-avatar, group on odd-avatar-group, which requires it",
    "set role=img on an initials avatar and leave it off an image avatar. Set role=group on odd-avatar-group. To hide an avatar, use aria-hidden=true, not a role.",
    "docs/usage/avatar.md#odd-avatar-003",
  ),
  "ODD-AVATAR-004": text(
    "ODD-AVATAR-004",
    "an avatar with role=img, or an avatar group, has no accessible name.",
    "aria-label, aria-labelledby",
    "add aria-label with the person's name, or aria-labelledby that points at it. Name a group for the set, such as Collaborators.",
    "docs/usage/avatar.md#odd-avatar-004",
  ),
  "ODD-AVATAR-005": text(
    "ODD-AVATAR-005",
    "this avatar does not take that data attribute.",
    "the avatar attribute, any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute, or correct its name. Avatar attributes: ${avatarAttributes}. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/avatar.md#odd-avatar-005",
  ),
  "ODD-AVATAR-006": text(
    "ODD-AVATAR-006",
    "odd-avatar-group does not take that data attribute.",
    "any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute. data-size belongs on each avatar. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/avatar.md#odd-avatar-006",
  ),
  "ODD-SEPARATOR-001": text(
    "ODD-SEPARATOR-001",
    "odd-separator is on the wrong element.",
    "hr",
    "move the class onto an hr. An hr is announced as a separator with no role.",
    "docs/usage/separator.md#odd-separator-001",
  ),
  "ODD-SEPARATOR-002": text(
    "ODD-SEPARATOR-002",
    "this separator sets its orientation in a way separator.css does not read.",
    "aria-orientation=horizontal or aria-orientation=vertical, and no data-orientation",
    "set aria-orientation=vertical for a vertical line, or remove aria-orientation for a horizontal line. data-orientation does not turn the line, so remove it.",
    "docs/usage/separator.md#odd-separator-002",
  ),
  "ODD-SEPARATOR-003": text(
    "ODD-SEPARATOR-003",
    "this separator has a role other than separator, or has aria-hidden.",
    "no role or role=separator, and no aria-hidden",
    "remove role and aria-hidden. For a line that means nothing, draw a border on the container instead of an element.",
    "docs/usage/separator.md#odd-separator-003",
  ),
  "ODD-SEPARATOR-004": text(
    "ODD-SEPARATOR-004",
    "odd-separator does not take that data attribute.",
    "any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute. A separator takes aria-orientation and no system data attribute. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}, except data-orientation, which is ODD-SEPARATOR-002.`,
    "docs/usage/separator.md#odd-separator-004",
  ),
  "ODD-SKELETON-001": text(
    "ODD-SKELETON-001",
    "odd-skeleton is on the wrong element.",
    "div",
    "move the class onto a div. For a button that is working, set aria-busy on the button instead of drawing a skeleton inside it.",
    "docs/usage/skeleton.md#odd-skeleton-001",
  ),
  "ODD-SKELETON-002": text(
    shapeRule.code,
    "data-shape has a value skeleton.css does not draw.",
    shapeAllowed,
    "remove data-shape for a line or a block and size it with inline-size and block-size, or set avatar for a block that matches a default avatar and takes the chrome's chip radius. A circle or circular block is avatar.",
    "docs/usage/skeleton.md#odd-skeleton-002",
  ),
  "ODD-SKELETON-003": text(
    "ODD-SKELETON-003",
    "a skeleton block needs aria-hidden=true. A bare aria-hidden is empty, and an empty value does not hide the block.",
    "true",
    "set aria-hidden=true on every odd-skeleton, even inside a hidden card.",
    "docs/usage/skeleton.md#odd-skeleton-003",
  ),
  "ODD-SKELETON-004": text(
    "ODD-SKELETON-004",
    "a skeleton block carries loading text, aria-busy, a role, or a name. aria-hidden hides all of them, so nothing says the region is loading.",
    "an empty block with no aria-busy, role, aria-label, or aria-labelledby",
    "empty the block and remove aria-busy, role, aria-label, and aria-labelledby. Set aria-busy=true on the region that is filling in, and put the loading text in an odd-visually-hidden span inside that region.",
    "docs/usage/skeleton.md#odd-skeleton-004",
  ),
  "ODD-SKELETON-005": text(
    "ODD-SKELETON-005",
    "odd-skeleton does not take that data attribute.",
    "the skeleton attribute, any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute, or correct its name. Skeleton attributes: ${skeletonAttributes}. skeleton.css draws one avatar size, so data-size does nothing. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/skeleton.md#odd-skeleton-005",
  ),
  "ODD-CARD-001": text(
    "ODD-CARD-001",
    "this card class is on the wrong element.",
    "odd-card on article, section, div, odd-card-title on h1, h2, h3, h4, h5, h6, odd-card-link on a, button, odd-card-footer on div",
    "move the class onto its element. The title is a heading at the level the page outline needs. The card link is a real link or button, never the card itself.",
    "docs/usage/card.md#odd-card-001",
  ),
  "ODD-CARD-002": text(
    "ODD-CARD-002",
    "data-interactive must be empty or true. card.css reads only its presence, so data-interactive=false is interactive too.",
    "empty, true",
    "remove data-interactive for a static card, or set it empty or true for a clickable one.",
    "docs/usage/card.md#odd-card-002",
  ),
  "ODD-CARD-003": text(
    "ODD-CARD-003",
    "data-interactive and odd-card-link come as a pair. The link stretches over the card only when the card is interactive, and it then covers every other link or button in the card.",
    "an interactive card with exactly one link or button, its odd-card-link, or a static card with no odd-card-link",
    "for a clickable card, give the card data-interactive, put one a.odd-card-link with an href inside its title, and move other links and buttons out of the card. For a static card, remove odd-card-link.",
    "docs/usage/card.md#odd-card-003",
  ),
  "ODD-CARD-004": text(
    "ODD-CARD-004",
    "the card itself is not a control. A click handler on the card does nothing from the keyboard, and a focusable card reads its whole content as one name.",
    "no onClick, onclick, tabIndex, or tabindex on the card",
    "remove the handler and tabindex. Give the card data-interactive and put an a.odd-card-link with an href inside its title, so the whole card clicks through one link.",
    "docs/usage/card.md#odd-card-004",
  ),
  "ODD-CARD-005": text(
    "ODD-CARD-005",
    "an anchor with odd-card-link needs an href. Without one it takes no focus and has no link role, so the card does not work from the keyboard.",
    "an href",
    "add the href. For an action that is not navigation, use a button with odd-card-link.",
    "docs/usage/card.md#odd-card-005",
  ),
  "ODD-CARD-006": text(
    "ODD-CARD-006",
    "this card does not take that data attribute.",
    "the card attribute, data-span, any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute, or correct its name. Card attributes: ${cardAttributes}. data-span places the card in an odd-grid. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/card.md#odd-card-006",
  ),
  "ODD-CARD-007": text(
    "ODD-CARD-007",
    "odd-card-title, odd-card-link, and odd-card-footer do not take that data attribute.",
    "any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute. data-interactive and data-span belong on the card. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/card.md#odd-card-007",
  ),
  "ODD-DISCLOSURE-001": text(
    "ODD-DISCLOSURE-001",
    "odd-disclosure is on the wrong element. Only details toggles by itself, keeps an open state, groups by name, and animates its content.",
    "details",
    "put odd-disclosure on a details element, with a summary child for the question and one element after it for the answer.",
    "docs/usage/disclosure.md#odd-disclosure-001",
  ),
  "ODD-DISCLOSURE-002": text(
    "ODD-DISCLOSURE-002",
    "this disclosure has no summary as a direct child. The browser then draws its own Details label, and the question moves into the hidden answer. A summary inside a wrapper element does not count, and a div or button is not a toggle.",
    "a summary element directly inside the details",
    "make the question a summary that is a direct child of the details, and put the answer in one element after it, such as a div.",
    "docs/usage/disclosure.md#odd-disclosure-002",
  ),
  "ODD-DISCLOSURE-003": text(
    "ODD-DISCLOSURE-003",
    "this disclosure does not take that data attribute.",
    "any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute. The disclosure reads no data attributes. open opens it, and a shared name makes a group exclusive. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/disclosure.md#odd-disclosure-003",
  ),
  "ODD-TABS-001": text(
    "ODD-TABS-001",
    "odd-tabs is on the wrong element. The tab set is a plain container, and the tablist, tabs, and panels inside it carry the roles.",
    "div",
    "put odd-tabs on a div that holds the tablist and the panels.",
    "docs/usage/tabs.md#odd-tabs-001",
  ),
  "ODD-TABS-002": text(
    "ODD-TABS-002",
    "this tab set has no tablist as a direct child. tabs.css styles only a direct child with role=tablist, so a wrapped list loses its segmented track and a vertical list does not form a column.",
    "an element with role=tablist directly inside odd-tabs",
    "make the element with role=tablist a direct child of odd-tabs, and put the panels after it.",
    "docs/usage/tabs.md#odd-tabs-002",
  ),
  "ODD-TABS-003": text(
    "ODD-TABS-003",
    "aria-orientation and data-activation belong on the tablist. enhanceTabs and tabs.css read them there, so on odd-tabs they do nothing.",
    "no aria-orientation or data-activation on odd-tabs",
    "move aria-orientation=vertical or data-activation=manual onto the element with role=tablist.",
    "docs/usage/tabs.md#odd-tabs-003",
  ),
  "ODD-TABS-004": text(
    "ODD-TABS-004",
    "a tab is not a button with aria-controls. enhanceTabs shows the panel that aria-controls names. Without it, choosing a tab shows and hides no panel, so the panels keep whatever hidden they started with. A tab that is not a button does not choose on Enter or Space in manual mode.",
    "a button with role=tab and aria-controls naming its panel id",
    "make each tab a button with role=tab, give it aria-controls with its panel id, and give the panel role=tabpanel, that id, and aria-labelledby with the tab id.",
    "docs/usage/tabs.md#odd-tabs-004",
  ),
  "ODD-TABS-005": text(
    "ODD-TABS-005",
    "this tab set does not take that data attribute.",
    "any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute. The tab set reads no data attributes. data-activation=manual goes on the tablist. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/tabs.md#odd-tabs-005",
  ),
  "ODD-SEARCH-001": text(
    "ODD-SEARCH-001",
    "odd-search is on the wrong element. Only search, or a form inside search, makes the search landmark.",
    "search, form",
    "put odd-search on a search element, or on a form directly inside a search. In React, use Search, and put a form around it to submit.",
    "docs/usage/search.md#odd-search-001",
  ),
  "ODD-SEARCH-002": text(
    "ODD-SEARCH-002",
    "this search has no direct child with odd-input and type=search. search.css pads only a direct .odd-input, so a wrapped input runs under the icon, and an input of another type is a textbox with no restyled clear button.",
    "an input with odd-input and type=search directly inside odd-search",
    "make the input an Input with type=search, or an input with odd-input and type=search, directly inside odd-search. Do not put a form between them. To submit, put the form around the search.",
    "docs/usage/search.md#odd-search-002",
  ),
  "ODD-SEARCH-003": text(
    "ODD-SEARCH-003",
    "this search has no direct svg child with aria-hidden=true. The input keeps room for the icon, so a missing icon leaves a gap, a wrapped one is drawn unplaced and unsized, and one without aria-hidden=true is read out as an image.",
    "an svg with aria-hidden=true directly inside odd-search",
    "put the magnifier svg, with aria-hidden=true, directly inside odd-search before the input. Do not wrap it in a span or a button.",
    "docs/usage/search.md#odd-search-003",
  ),
  "ODD-SEARCH-004": text(
    "ODD-SEARCH-004",
    "a search element holds no form, so onSubmit and onsubmit on it never run, and Enter does nothing.",
    "no onSubmit or onsubmit on the search",
    "to submit, put a form around the search and put onSubmit on the form. To filter as the user types, use onChange on the input.",
    "docs/usage/search.md#odd-search-004",
  ),
  "ODD-SEARCH-005": text(
    "ODD-SEARCH-005",
    "this search does not take that data attribute.",
    "any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute. The search reads no data attributes. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/search.md#odd-search-005",
  ),
  "ODD-SLIDER-001": text(
    "ODD-SLIDER-001",
    "odd-slider is on the wrong element. Only an input has the slider role, the arrow keys, and a value, and the thumb and rail styles match only a range input.",
    "input",
    "put odd-slider on an input with type=range. In React, use Slider.",
    "docs/usage/slider.md#odd-slider-001",
  ),
  "ODD-SLIDER-002": text(
    "ODD-SLIDER-002",
    "odd-slider needs type range. Without the type it is a text box with slider sizing, and another type gets no thumb or rail.",
    "type range",
    "set type to range.",
    "docs/usage/slider.md#odd-slider-002",
  ),
  "ODD-SLIDER-003": text(
    "ODD-SLIDER-003",
    "aria-disabled is forbidden on odd-slider. The thumb still moves with the keys and the pointer, and slider.css styles only the native disabled state.",
    "none",
    "remove aria-disabled and set disabled.",
    "docs/usage/slider.md#odd-slider-003",
  ),
  "ODD-SLIDER-004": text(
    "ODD-SLIDER-004",
    "this slider does not take that data attribute.",
    "any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute. The slider reads no data attributes. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/slider.md#odd-slider-004",
  ),
  "ODD-METER-001": text(
    "ODD-METER-001",
    "this bar class is on the wrong element. A div has no value or role, and the progress bar styles do not match odd-meter, so the browser bar shows through.",
    "odd-meter on meter, odd-progress on progress",
    "move the class onto its element. In React, use Meter or Progress.",
    "docs/usage/meter.md#odd-meter-001",
  ),
  "ODD-METER-002": text(
    meterToneRule.code,
    "data-tone has a value this bar does not take. meter.css colors four tones, and any other value draws the default bar.",
    meterToneAllowed,
    "set one of the allowed tones, or remove data-tone for the default bar.",
    "docs/usage/meter.md#odd-meter-002",
  ),
  "ODD-METER-003": text(
    "ODD-METER-003",
    "this bar does not take that data attribute.",
    "the bar attribute, any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute, or correct its name. Bar attributes: ${meterAttributes}. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/meter.md#odd-meter-003",
  ),
  "ODD-TOAST-001": text(
    "ODD-TOAST-001",
    "odd-toaster is on the wrong element. Only a section with a name is a region landmark. A div is no landmark, and an aside is a complementary one.",
    "section",
    "put odd-toaster on a section with popover=manual and aria-label. In React, use Toaster.",
    "docs/usage/toast.md#odd-toast-001",
  ),
  "ODD-TOAST-002": text(
    "ODD-TOAST-002",
    "odd-toaster needs popover manual. An auto or hint popover closes on any click outside or when a menu opens, so enhanceToaster wires only a manual one. It leaves any other region unwired, so toast() throws that it found no toaster, or shows on another region.",
    "popover manual",
    "set popover to manual.",
    "docs/usage/toast.md#odd-toast-002",
  ),
  "ODD-TOAST-003": text(
    "ODD-TOAST-003",
    "odd-toaster has no aria-label. A section with no name is no landmark, so a screen reader cannot jump to the notifications.",
    "an aria-label",
    "set aria-label, such as Notifications.",
    "docs/usage/toast.md#odd-toast-003",
  ),
  "ODD-TOAST-004": text(
    "ODD-TOAST-004",
    "this toaster does not take that data attribute.",
    "any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute. The toaster reads no data attributes, and toast.css reads data-tone on each toast, so pass tone to toast(). Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/toast.md#odd-toast-004",
  ),
  "ODD-POPOVER-001": text(
    "ODD-POPOVER-001",
    "odd-popover is on the wrong element. A p ends before its first block child, so the controls render in the page while the popover is closed. A section with a name becomes a region.",
    "div",
    "put odd-popover on a div with popover. In React, use Popover.",
    "docs/usage/popover.md#odd-popover-001",
  ),
  "ODD-POPOVER-002": text(
    "ODD-POPOVER-002",
    "odd-popover and odd-menu need popover with no value or popover auto. With no popover the box stays in the page, invisible, while a popover's controls still take focus and are read out, a closed menu and its first items stay in the accessibility tree, and its trigger does nothing. A manual popover ignores Escape and a click outside, and so does an unknown token such as yes, which acts as manual. A hint popover closes when an auto popover or another hint opens, and a manual popover leaves it open. That suits odd-tooltip and odd-hover-card, not a popover or a menu.",
    "popover with no value, or auto",
    "write popover with no value in HTML, or popover=auto in React.",
    "docs/usage/popover.md#odd-popover-002",
  ),
  "ODD-POPOVER-003": text(
    "ODD-POPOVER-003",
    "role on odd-popover is dialog or nothing. A menu role without enhanceMenu has no arrow keys, a tooltip belongs on odd-tooltip, and alertdialog claims a modal alert.",
    "dialog, or no role on a popover that only shows text",
    "set role=dialog on a popover that holds controls. For a menu, use odd-menu with enhanceMenu. For a tooltip, use odd-tooltip.",
    "docs/usage/popover.md#odd-popover-003",
  ),
  "ODD-POPOVER-004": text(
    "ODD-POPOVER-004",
    "this popover has role=dialog and no name, so a screen reader announces only dialog.",
    "aria-label or aria-labelledby",
    "point aria-labelledby at the popover title, or set aria-label.",
    "docs/usage/popover.md#odd-popover-004",
  ),
  "ODD-POPOVER-005": text(
    "ODD-POPOVER-005",
    "this popover has aria-label or aria-labelledby and no role. A generic div drops the name, so the open popover is read as its content with no container and no name.",
    "role=dialog with the name, or no name",
    "add role=dialog, or remove the name on a popover that only shows text.",
    "docs/usage/popover.md#odd-popover-005",
  ),
  "ODD-POPOVER-006": text(
    "ODD-POPOVER-006",
    "this popover does not take that data attribute.",
    "any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute. popover.css reads no data attributes, so data-tone and data-size change nothing. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/popover.md#odd-popover-006",
  ),
  "ODD-DIALOG-001": text(
    "ODD-DIALOG-001",
    "this dialog class is on the wrong element. odd-dialog on a div is never hidden. It sits in the page at opacity 0 and its buttons still take focus. In HTML a p ends before a heading, so a title inside p.odd-dialog-body is parsed outside the body. React leaves it inside the p, where a heading is not allowed. A title that is not a heading drops out of heading navigation.",
    "odd-dialog on dialog, odd-dialog-body on div, form, odd-dialog-title on h1, h2, h3, h4, h5, h6, odd-dialog-actions on div",
    "put odd-dialog on a dialog element, the body class on a div or a form, and the title class on a heading. In React, use Dialog and DialogActions.",
    "docs/usage/dialog.md#odd-dialog-001",
  ),
  "ODD-DIALOG-002": text(
    "ODD-DIALOG-002",
    "this dialog has no name, so a screen reader announces only dialog when it opens. A heading inside does not name it.",
    "aria-labelledby or aria-label",
    "give the odd-dialog-title an id and point aria-labelledby at it, or set aria-label.",
    "docs/usage/dialog.md#odd-dialog-002",
  ),
  "ODD-DIALOG-003": text(
    "ODD-DIALOG-003",
    "role on odd-dialog or odd-sheet is alertdialog or nothing. A dialog element is already a dialog, and another role announces it as something else.",
    dialogRoleAllowed,
    "remove role, or set role=alertdialog for a decision the user must make.",
    "docs/usage/dialog.md#odd-dialog-003",
  ),
  "ODD-DIALOG-004": text(
    "ODD-DIALOG-004",
    "odd-dialog and odd-sheet take no open attribute. open shows the dialog without showModal, so the page behind it stays live and Escape does nothing. In React, open never calls showModal and goes stale once the browser closes the dialog.",
    "no open attribute",
    "open it from a button with commandfor and command=show-modal, or call showModal() on a ref. Read the close from onClose.",
    "docs/usage/dialog.md#odd-dialog-004",
  ),
  "ODD-DIALOG-005": text(
    "ODD-DIALOG-005",
    "closedby on odd-dialog or odd-sheet is any, closerequest, or nothing. closedby=none stops Escape from closing the dialog, so only a button can close it.",
    "any, closerequest, or no closedby",
    "remove closedby so Escape and the buttons close the dialog, or write closedby=any so a click outside also closes it.",
    "docs/usage/dialog.md#odd-dialog-005",
  ),
  "ODD-DIALOG-006": text(
    "ODD-DIALOG-006",
    "this dialog has closedby=any with role=alertdialog, so a stray click outside dismisses the decision.",
    "closerequest or no closedby with role=alertdialog",
    "remove closedby so only Escape and the buttons close the alert dialog.",
    "docs/usage/dialog.md#odd-dialog-006",
  ),
  "ODD-DIALOG-007": text(
    "ODD-DIALOG-007",
    "this dialog does not take that data attribute.",
    "any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute. dialog.css reads no data attributes, so data-tone and data-size change nothing. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/dialog.md#odd-dialog-007",
  ),
  "ODD-DIALOG-008": text(
    "ODD-DIALOG-008",
    "odd-dialog-body, odd-dialog-title, and odd-dialog-actions do not take that data attribute.",
    "any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute. dialog.css reads no data attributes. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/dialog.md#odd-dialog-008",
  ),
  "ODD-SHEET-001": text(
    "ODD-SHEET-001",
    "this sheet class is on the wrong element. odd-sheet on a div or a section is never hidden. It sits just past the edge of the page, its buttons take focus off screen, and a screen reader reads its content as part of the page. A header or a footer inside the sheet is read as a banner or contentinfo landmark. In HTML a p ends before its first block child, so the controls in p.odd-sheet-body fall out of the scrolling body.",
    "odd-sheet on dialog, odd-sheet-header on div, odd-sheet-body on div, form, odd-sheet-footer on div",
    "put odd-sheet on a dialog element, the header and footer classes on a div, and the body class on a div or a form. In React, use Sheet, SheetHeader, and SheetFooter.",
    "docs/usage/sheet.md#odd-sheet-001",
  ),
  "ODD-SHEET-002": text(
    sideRule.code,
    "data-side has a value this sheet does not take. sheet.css styles start, top, and bottom, and any other value slides the sheet in from the end edge.",
    sideAllowed,
    "set start, top, or bottom, or remove data-side for the end edge. start and end follow the writing direction.",
    "docs/usage/sheet.md#odd-sheet-002",
  ),
  "ODD-SHEET-003": text(
    "ODD-SHEET-003",
    "this sheet or sheet section does not take that data attribute.",
    "the sheet attribute, any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute, or correct its name. sheet.css reads ${sheetAttributes} on odd-sheet and no data attribute on the header, body, or footer. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/sheet.md#odd-sheet-003",
  ),
  "ODD-MENU-001": text(
    "ODD-MENU-001",
    "this menu class is on the wrong element. A p ends before its first block child, so the items after a separator or a group render in the page while the menu is closed. Enter and Space click only a button, so a div item does nothing when chosen from the keyboard, and an a item with href ignores Space and is underlined.",
    "odd-menu on div, odd-menu-item on button",
    "put odd-menu on a div with popover and role=menu, and odd-menu-item on a button. In React, use Menu and MenuItem.",
    "docs/usage/menu.md#odd-menu-001",
  ),
  "ODD-MENU-002": text(
    "ODD-MENU-002",
    "odd-menu needs role=menu. enhance() wires only .odd-menu[role=menu], so without it the trigger opens the menu with focus left on the trigger, and ArrowDown and the arrow keys inside do nothing.",
    "role=menu",
    "set role=menu. For a popover that holds controls, use odd-popover with role=dialog.",
    "docs/usage/menu.md#odd-menu-002",
  ),
  "ODD-MENU-003": text(
    "ODD-MENU-003",
    "this menu has no name, so a screen reader announces only menu when it opens.",
    "aria-label or aria-labelledby",
    "point aria-labelledby at the trigger, or set aria-label.",
    "docs/usage/menu.md#odd-menu-003",
  ),
  "ODD-MENU-004": text(
    "ODD-MENU-004",
    "this menu or menu item does not take that data attribute.",
    "the menu item attribute, any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute, or correct its name. menu.css reads ${menuAttributes} on odd-menu-item and no data attribute on odd-menu, so data-tone on the menu changes nothing. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/menu.md#odd-menu-004",
  ),
  "ODD-MENU-005": text(
    "ODD-MENU-005",
    "odd-menu-item needs a menu item role. enhanceMenu and the arrow keys reach only menuitem, menuitemcheckbox, and menuitemradio, so an item with no role or another role is skipped and stays in the Tab order.",
    menuItemRoles,
    "set role=menuitem for an action, menuitemcheckbox for a toggle, or menuitemradio for one choice in a group.",
    "docs/usage/menu.md#odd-menu-005",
  ),
  "ODD-MENU-006": text(
    menuToneRule.code,
    "data-tone on odd-menu-item is danger or nothing. menu.css styles only danger, so any other tone looks like a plain item.",
    comma(menuToneRule.values),
    "set data-tone=danger for a destructive item, or remove it. In React, pass tone=danger.",
    "docs/usage/menu.md#odd-menu-006",
  ),
  "ODD-MENU-007": text(
    "ODD-MENU-007",
    "odd-menu-item takes no disabled attribute. The arrow keys skip a disabled button, so a keyboard user never reaches the item.",
    "aria-disabled=true",
    "replace disabled with aria-disabled=true. The item stays reachable, and enhanceMenu stops its click.",
    "docs/usage/menu.md#odd-menu-007",
  ),
  "ODD-TABLE-001": text(
    "ODD-TABLE-001",
    "this table class is on the wrong element. A span.odd-table-wrap does not scroll, so a wide table runs off the page. A p.odd-table-wrap ends before the table, so the table falls out of the border and the scroll. odd-table on anything but the table leaves the table at its content width. A span sort control is not in the Tab order, and an a sort control is underlined and skipped by Tab in Safari.",
    "odd-table-wrap on div, odd-table on table, odd-table-sort on button",
    "put odd-table-wrap on the div around the table, odd-table on the table itself, and odd-table-sort on a button in the column header. In React, use TableWrap, Table, and TableSort.",
    "docs/usage/table.md#odd-table-001",
  ),
  "ODD-TABLE-002": text(
    "ODD-TABLE-002",
    "this table wrap has tabindex, aria-label, or aria-labelledby but no role=region. A screen reader drops the name of a plain div, so focus lands on the scroll area and nothing names it. In React, tabIndex counts the same.",
    "role=region",
    "set role=region beside tabindex=0 and aria-labelledby, or drop tabindex and the name if the table can never overflow.",
    "docs/usage/table.md#odd-table-002",
  ),
  "ODD-TABLE-003": text(
    "ODD-TABLE-003",
    "this table wrap is a region with no name, so a screen reader announces only region when focus enters it.",
    "aria-labelledby or aria-label",
    "give the caption an id and point aria-labelledby at it, or set aria-label.",
    "docs/usage/table.md#odd-table-003",
  ),
  "ODD-TABLE-004": text(
    "ODD-TABLE-004",
    "this table wrap, table, or sort button does not take that data attribute.",
    "any app data attribute, the appearance axes, and the headless allowlist",
    `remove the attribute. table.css reads data-numeric on a th and its td cells, so on the wrap or the table it does nothing. On a sort button the column header stays start-aligned and the arrow stays after the label, so put data-numeric on the th around it. Appearance axes: ${appearanceAxes}. Headless allowlist: ${headlessAllowlist}.`,
    "docs/usage/table.md#odd-table-004",
  ),
  "ODD-TABLE-005": text(
    "ODD-TABLE-005",
    "odd-table-sort takes no aria-sort. table.css reads aria-sort on the th around the button, so on the button the arrow stays the neutral up-down mark.",
    "aria-sort on the th around the button",
    "move aria-sort to the th that holds the button, on the sorted column only.",
    "docs/usage/table.md#odd-table-005",
  ),
  "ODD-TABLE-006": text(
    "ODD-TABLE-006",
    "a data-select-all box in this table has no aria-label or aria-labelledby. A screen reader announces only checkbox, so nothing says the box selects every row.",
    "aria-label or aria-labelledby on the data-select-all box",
    "set aria-label on the header box, such as Select all decks, or point aria-labelledby at text that says what it selects.",
    "docs/usage/table.md#odd-table-006",
  ),
  "ODD-SCOPE-001": text(
    "ODD-SCOPE-001",
    "odd-scope needs all three of data-chrome, data-palette, and data-mode. A chrome token that reads a palette color resolves on the element that sets it, so a scope that leaves out an axis paints with a mix of its own colors and the outer page's.",
    `${appearanceAxes}, all on the odd-scope element`,
    "set the missing attributes on the odd-scope element. Copy the outer value to keep an axis the same.",
    "docs/usage/base.md#odd-scope-001",
  ),
  "ODD-SKIP-001": text(
    "ODD-SKIP-001",
    "odd-skip-link is not on an anchor whose href points at an id on this page. A button, a missing href, or a link to another page does not move focus past the navigation.",
    "odd-skip-link on a, with href=#id",
    "put odd-skip-link on an a whose href is # and the id of the main content, such as #main, and give that element the id.",
    "docs/usage/base.md#odd-skip-001",
  ),
  "ODD-GRID-001": text(
    "ODD-GRID-001",
    "a child of odd-grid has a data-span outside 1 to 12. The grid reads only those values, so the child spans the full row.",
    "1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12",
    "set data-span to a whole number from 1 to 12, or remove data-span for a child that spans the full row.",
    "docs/usage/grid.md#odd-grid-001",
  ),
  "ODD-SHELL-001": text(
    "ODD-SHELL-001",
    "a shell part is on the wrong element. A div.odd-shell-header is not a banner landmark and a div.odd-shell-main is not a main landmark, so landmark navigation skips both.",
    "odd-shell-header on header, odd-shell-main on main",
    "put odd-shell-header on a header and odd-shell-main on a main.",
    "docs/usage/shell.md#odd-shell-001",
  ),
  "ODD-TYPOGRAPHY-001": text(
    "ODD-TYPOGRAPHY-001",
    "odd-heading is not on a heading element. The text looks like a title, but heading navigation and the outline skip it.",
    "h1, h2, h3, h4, h5, h6",
    "move odd-heading onto the heading level the outline needs, and set the look with data-size.",
    "docs/usage/typography.md#odd-typography-001",
  ),
  "ODD-TYPOGRAPHY-002": text(
    headingSizeRule.code,
    "data-size has a value this heading does not take, so it renders at the md size.",
    headingSizeAllowed,
    "set xs, sm, lg, xl, 2xl, or hero, or remove data-size for the md size.",
    "docs/usage/typography.md#odd-typography-002",
  ),
  "ODD-TYPOGRAPHY-003": text(
    "ODD-TYPOGRAPHY-003",
    "data-tone has a value this eyebrow does not take, so it stays muted.",
    "primary, foreground",
    "set primary or foreground, or remove data-tone for the muted eyebrow.",
    "docs/usage/typography.md#odd-typography-003",
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
