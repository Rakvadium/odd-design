// The token contract: what every palette and every chrome must define.
// CSS, stories, and tests all read from here, so adding a token here makes the
// contract test fail until every palette or chrome supplies it.

export const PALETTES = ["default", "aurora", "sorbet", "calm-storm", "cyberpunk", "cotton-candy", "caffeine", "singularity"] as const;
export const CHROMES = ["calm", "glass", "bubblegum", "expressive", "darkmatter"] as const;
export const MODES = ["system", "light", "dark"] as const;

export type Palette = (typeof PALETTES)[number];
export type Chrome = (typeof CHROMES)[number];
export type Mode = (typeof MODES)[number];

/** Color roles. Palettes own these and nothing else. */
export const PALETTE_TOKENS = [
  "background",
  "foreground",
  "surface",
  "surface-foreground",
  "overlay",
  "overlay-foreground",
  "muted",
  "muted-foreground",
  "border",
  "control-border",
  "ring",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "accent",
  "accent-foreground",
  "danger",
  "danger-foreground",
  "success",
  "success-foreground",
  "warning",
  "warning-foreground",
  "info",
  "info-foreground",
] as const;

/** Feel roles. Chromes own these and must not set palette hues. */
export const CHROME_TOKENS = [
  // Type
  "font-body",
  "font-heading",
  "font-label",
  "heading-weight",
  "heading-case",
  "heading-tracking",
  "label-case",
  "label-tracking",
  // Shape
  "radius-control",
  "radius-surface",
  "radius-overlay",
  "radius-chip",
  "border-width",
  "edge-surface",
  "edge-control",
  "edge-control-filled",
  "surface-alpha",
  // Density
  "density",
  // Elevation
  "shadow-control",
  "shadow-control-hover",
  "shadow-control-active",
  "shadow-surface",
  "shadow-surface-hover",
  "shadow-overlay",
  "press-transform",
  // Focus
  "focus-color",
  "focus-width",
  "focus-offset",
  "focus-glow",
  // Motion
  "ease",
  // FX
  "fx-glow",
  "fx-backdrop",
  "page-background",
] as const;

export type PaletteToken = (typeof PALETTE_TOKENS)[number];

/** Status colors every palette inherits from foundations.css unless it overrides them: [light, dark]. */
export const STATUS_DEFAULTS: Partial<Record<PaletteToken, [light: string, dark: string]>> = {
  danger: ["oklch(0.53 0.2 27)", "oklch(0.72 0.17 25)"],
  "danger-foreground": ["oklch(0.99 0 0)", "oklch(0.17 0.03 25)"],
  success: ["oklch(0.52 0.13 150)", "oklch(0.76 0.15 150)"],
  "success-foreground": ["oklch(0.99 0 0)", "oklch(0.18 0.04 150)"],
  warning: ["oklch(0.8 0.15 80)", "oklch(0.82 0.15 80)"],
  "warning-foreground": ["oklch(0.24 0.05 65)", "oklch(0.2 0.04 65)"],
  info: ["oklch(0.52 0.14 245)", "oklch(0.76 0.12 240)"],
  "info-foreground": ["oklch(0.99 0 0)", "oklch(0.18 0.03 240)"],
};

/**
 * WCAG 2.2 AA pairs every palette must pass in light and dark.
 * 4.5 = text (1.4.3). 3 = UI boundaries and focus indicators (1.4.11).
 */
export const CONTRAST_PAIRS: ReadonlyArray<[fg: PaletteToken, bg: PaletteToken, min: number]> = [
  ["foreground", "background", 4.5],
  ["surface-foreground", "surface", 4.5],
  ["overlay-foreground", "overlay", 4.5],
  ["muted-foreground", "background", 4.5],
  ["muted-foreground", "surface", 4.5],
  ["muted-foreground", "muted", 4.5],
  ["muted-foreground", "overlay", 4.5],
  ["foreground", "muted", 4.5],
  ["primary-foreground", "primary", 4.5],
  ["secondary-foreground", "secondary", 4.5],
  ["accent-foreground", "accent", 4.5],
  ["danger-foreground", "danger", 4.5],
  ["success-foreground", "success", 4.5],
  ["warning-foreground", "warning", 4.5],
  ["info-foreground", "info", 4.5],
  // Links and error text sit directly on page surfaces.
  ["primary", "background", 4.5],
  ["primary", "surface", 4.5],
  ["danger", "background", 4.5],
  ["danger", "surface", 4.5],
  // Destructive menu items put danger text on the overlay surface.
  ["danger", "overlay", 4.5],
  // Input borders and focus rings are non-text UI.
  ["control-border", "background", 3],
  ["control-border", "surface", 3],
  ["ring", "background", 3],
  ["ring", "surface", 3],
];

/**
 * What sits directly on a chrome's --page-background: body and muted text, links, error text,
 * and input borders and focus rings. Tested against the page background's worst points.
 */
export const PAGE_PAIRS: ReadonlyArray<[fg: PaletteToken, min: number]> = [
  ["foreground", 4.5],
  ["muted-foreground", 4.5],
  ["primary", 4.5],
  ["danger", 4.5],
  ["control-border", 3],
  ["ring", 3],
];

/** A solid color in a page background: a palette color, or two mixed in oklab. */
export type PageSolid = PaletteToken | { mix: PaletteToken; percent: number; into: PaletteToken };

/**
 * What each chrome paints behind the page, as the palette generator needs it: the solid colors in
 * the stack, and the translucent washes over them (top layer first, as CSS lists them). Text can sit
 * on any solid under any combination of washes at full strength, so PAGE_PAIRS must pass on all of
 * them. The contract test checks each chrome's --page-background matches this.
 */
export const PAGE_BACKGROUNDS: Record<Chrome, { solids: PageSolid[]; washes: { token: PaletteToken; percent: number }[] }> = {
  calm: { solids: ["muted", "background"], washes: [] },
  glass: {
    solids: ["background"],
    washes: [
      { token: "primary", percent: 12 },
      { token: "secondary", percent: 11 },
      { token: "accent", percent: 8 },
    ],
  },
  bubblegum: { solids: ["background"], washes: [{ token: "foreground", percent: 14 }] },
  expressive: {
    solids: ["background", { mix: "muted", percent: 20, into: "background" }],
    washes: [
      { token: "primary", percent: 12 },
      { token: "secondary", percent: 10 },
    ],
  },
  darkmatter: { solids: ["background"], washes: [] },
};

/** Soft tints, derived in foundations.css by washing a tone into --background. */
export const TINTS = ["neutral", "primary", "success", "warning", "danger", "info"] as const;

/** Which color each tint washes in, and how much (color-mix in oklab). The contract test checks foundations.css matches. */
export const TINT_SOURCE: Record<(typeof TINTS)[number], PaletteToken> = {
  neutral: "muted-foreground",
  primary: "primary",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
};
export const TINT_PERCENT = 14;

export type TintToken = `tint-${(typeof TINTS)[number]}`;

/**
 * Text on soft tints (badges, alerts, selected rows, avatar initials) is always --foreground,
 * held to the same 4.5:1 as other text. Tone-colored text on a tint is not guaranteed, so don't.
 */
export const TINT_PAIRS: ReadonlyArray<[fg: PaletteToken, bg: TintToken, min: number]> = TINTS.map((t) => [
  "foreground",
  `tint-${t}`,
  4.5,
]);
