import { clampChroma, contrast, formatOklch, luminance, mixOklab, parseColor, type Oklch } from "./color.ts";
import {
  CONTRAST_PAIRS,
  PALETTE_TOKENS,
  STATUS_DEFAULTS,
  TINT_PAIRS,
  TINT_PERCENT,
  TINT_SOURCE,
  type PaletteToken,
  type TintToken,
} from "./contract.ts";

/*
 * Custom palettes from one or two brand colors, held to the same contract as the shipped palettes.
 *
 *   const palette = generatePalette({ primary: "#7c3aed", secondary: "#f472b6" });
 *   const remove = applyPalette(palette);        // defines [data-palette="custom"]
 *   document.documentElement.dataset.palette = "custom";
 *
 * generatePalette lays out every color role for light and dark from the seeds, then repairPalette
 * moves the lightness of any role that fails a CONTRAST_PAIRS or TINT_PAIRS check until all pass.
 * Hue and chroma stay put, so the brand still reads; only lightness shifts, and only as far as needed.
 */

export type PaletteMode = "light" | "dark";
export type PaletteColors = Record<PaletteToken, Oklch>;
export type Palette = Record<PaletteMode, PaletteColors>;

export type Seeds = { primary: string; secondary?: string; accent?: string };

/** Aim a little above each minimum, so rounding in another contrast implementation can't flip a pass. */
const MARGIN = 1.01;
const STEP = 0.005;
const MAX_STEPS = 600;

/** Each fill and the ink that sits on it. */
const INKS: Partial<Record<PaletteToken, PaletteToken>> = {
  primary: "primary-foreground",
  secondary: "secondary-foreground",
  accent: "accent-foreground",
  danger: "danger-foreground",
  success: "success-foreground",
  warning: "warning-foreground",
  info: "info-foreground",
};

/**
 * Fills that are also text on the page (links, error text). Their ink takes the page's own polarity,
 * so the one fix that helps both pairs, moving the fill away from the page, is always available.
 */
const PAGE_TEXT_FILLS = new Set<PaletteToken>(["primary", "danger"]);

const pairs: ReadonlyArray<readonly [PaletteToken, PaletteToken | TintToken, number]> = [...CONTRAST_PAIRS, ...TINT_PAIRS];

const tintOf = (colors: PaletteColors, token: TintToken) =>
  mixOklab(colors[TINT_SOURCE[token.slice(5) as keyof typeof TINT_SOURCE]], TINT_PERCENT / 100, colors.background);

const colorOf = (colors: PaletteColors, token: PaletteToken | TintToken) =>
  token.startsWith("tint-") ? tintOf(colors, token as TintToken) : colors[token as PaletteToken];

const isLightSurface = (color: Oklch) => luminance(color) > 0.18;

const shift = (color: Oklch, darker: boolean): Oklch =>
  clampChroma({ ...color, l: Math.min(1, Math.max(0, color.l + (darker ? -STEP : STEP))) });

const inkFor = (fill: Oklch, light: boolean): Oklch =>
  light ? { l: 0.985, c: Math.min(fill.c * 0.1, 0.012), h: fill.h } : { l: 0.17, c: Math.min(fill.c * 0.25, 0.03), h: fill.h };

/** Every pair below its minimum, as readable strings. Empty means the palette meets the contract. */
export function paletteFailures(palette: Palette): string[] {
  return (["light", "dark"] as const).flatMap((mode) =>
    pairs.flatMap(([fg, bg, min]) => {
      const ratio = contrast(colorOf(palette[mode], fg), colorOf(palette[mode], bg));
      return ratio < min ? [`${mode}: ${fg} on ${bg} is ${ratio.toFixed(2)}, needs ${min}`] : [];
    }),
  );
}

function repairMode(input: PaletteColors): PaletteColors {
  const colors = { ...input };
  const lightPage = isLightSurface(colors.background);
  for (let step = 0; step < MAX_STEPS; step++) {
    const failing = pairs.find(([fg, bg, min]) => contrast(colorOf(colors, fg), colorOf(colors, bg)) < min * MARGIN);
    if (!failing) break;
    const [fg, bg] = failing;

    if (INKS[bg as PaletteToken] === fg) {
      // Ink on a fill: use the better ink; if that still fails, move the fill away from the ink.
      const fill = colors[bg as PaletteToken];
      const lightInk = PAGE_TEXT_FILLS.has(bg as PaletteToken)
        ? lightPage
        : contrast(inkFor(fill, true), fill) >= contrast(inkFor(fill, false), fill);
      const ink = inkFor(fill, lightInk);
      if (contrast(ink, fill) > contrast(colors[fg], fill) + 0.01) colors[fg] = ink;
      else colors[bg as PaletteToken] = shift(fill, lightInk);
    } else {
      // Text or a border on a page surface or tint: move it away from that surface.
      const before = colors[fg];
      colors[fg] = shift(before, isLightSurface(colorOf(colors, bg)));
      if (colors[fg].l === before.l) break;
    }
  }
  return colors;
}

/** Moves the lightness of failing roles until the palette meets the contract. Passing roles don't move. */
export function repairPalette(palette: Palette): Palette {
  return { light: repairMode(palette.light), dark: repairMode(palette.dark) };
}

const status = (mode: PaletteMode) =>
  Object.fromEntries(Object.entries(STATUS_DEFAULTS).map(([t, v]) => [t, parseColor(v![mode === "light" ? 0 : 1])]));

function layout(p: Oklch, s: Oklch, a: Oklch, mode: PaletteMode): PaletteColors {
  const h = p.h;
  const tone = (l: number, c: number) => clampChroma({ l, c: Math.min(c, p.c), h });
  const lift = (color: Oklch, min: number) => clampChroma({ ...color, l: Math.max(color.l, min) });
  const light = mode === "light";
  const foreground = light ? tone(0.2, 0.035) : tone(0.95, 0.015);
  const primary = light ? clampChroma(p) : lift(p, 0.72);
  const colors = {
    ...status(mode),
    background: light ? tone(0.975, 0.01) : tone(0.17, 0.015),
    foreground,
    surface: light ? tone(0.995, 0.005) : tone(0.21, 0.018),
    "surface-foreground": foreground,
    overlay: light ? { l: 1, c: 0, h } : tone(0.235, 0.02),
    "overlay-foreground": foreground,
    muted: light ? tone(0.94, 0.018) : tone(0.27, 0.022),
    "muted-foreground": light ? tone(0.47, 0.03) : tone(0.77, 0.03),
    border: light ? tone(0.88, 0.02) : tone(0.33, 0.025),
    "control-border": light ? tone(0.6, 0.03) : tone(0.58, 0.03),
    ring: primary,
    primary,
    secondary: light ? clampChroma(s) : lift(s, 0.68),
    accent: light ? clampChroma(a) : lift(a, 0.7),
  } as Partial<PaletteColors>;
  for (const [fill, ink] of Object.entries(INKS)) {
    colors[ink!] ??= inkFor(colors[fill as PaletteToken]!, isLightSurface(colors[fill as PaletteToken]!) === false);
  }
  return colors as PaletteColors;
}

/** A full palette, light and dark, from brand colors (#hex or oklch()). Secondary and accent are optional. */
export function generatePalette({ primary, secondary, accent }: Seeds): Palette {
  const p = parseColor(primary);
  const s = secondary ? parseColor(secondary) : { ...p, h: (p.h + 300) % 360 };
  const a = accent ? parseColor(accent) : { ...p, h: (p.h + 40) % 360 };
  return repairPalette({ light: layout(p, s, a, "light"), dark: layout(p, s, a, "dark") });
}

/** The palette as a CSS rule, one light-dark() per role, like the files in src/css/palettes/. */
export function paletteCss(name: string, palette: Palette, tokens: readonly PaletteToken[] = PALETTE_TOKENS): string {
  const lines = tokens.map((t) => `  --${t}: light-dark(${formatOklch(palette.light[t])}, ${formatOklch(palette.dark[t])});`);
  return `[data-palette="${name}"] {\n${lines.join("\n")}\n}`;
}

/**
 * Defines [data-palette="<name>"] on the page, inside the palette cascade layer so OS preferences
 * still win. Calling it again with the same name replaces the palette. Returns a function that removes it.
 */
export function applyPalette(palette: Palette, name = "custom", doc: Document = document): () => void {
  const id = `ds-palette-${name}`;
  const style = doc.getElementById(id) ?? doc.head.appendChild(Object.assign(doc.createElement("style"), { id }));
  style.textContent = `@layer palette {\n${paletteCss(name, palette)}\n}`;
  return () => style.remove();
}
