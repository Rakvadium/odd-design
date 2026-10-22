import { clampChroma, compositeOver, contrast, formatOklch, luminance, mixOklab, parseColor, type Oklch } from "./color.ts";
import {
  CONTRAST_PAIRS,
  PAGE_BACKGROUNDS,
  PAGE_PAIRS,
  PALETTE_TOKENS,
  STATUS_DEFAULTS,
  TINT_PAIRS,
  TINT_PERCENT,
  TINT_SOURCE,
  type PageSolid,
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
 * moves the lightness of any role that fails a check until all pass: the CONTRAST_PAIRS and
 * TINT_PAIRS, and PAGE_PAIRS on every chrome's page background (PAGE_BACKGROUNDS) at its worst points.
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

const tintOf = (colors: PaletteColors, token: TintToken) =>
  mixOklab(colors[TINT_SOURCE[token.slice(5) as keyof typeof TINT_SOURCE]], TINT_PERCENT / 100, colors.background);

const colorOf = (colors: PaletteColors, token: PaletteToken | TintToken) =>
  token.startsWith("tint-") ? tintOf(colors, token as TintToken) : colors[token as PaletteToken];

/** One contrast requirement: `fg` on whatever `bg` computes from the palette, at least `min`. */
type Check = { fg: PaletteToken; on: string; bg: (colors: PaletteColors) => Oklch; min: number; fill?: PaletteToken };

const solidOf = (colors: PaletteColors, solid: PageSolid) =>
  typeof solid === "string" ? colors[solid] : mixOklab(colors[solid.mix], solid.percent / 100, colors[solid.into]);

/** Each chrome's page background at its worst points: every solid under every combination of its washes. */
const pageChecks: Check[] = Object.entries(PAGE_BACKGROUNDS).flatMap(([chrome, { solids, washes }]) => {
  const subsets = washes.reduce<(typeof washes)[]>((acc, w) => [...acc, ...acc.map((s) => [...s, w])], [[]]);
  return solids.flatMap((solid) =>
    subsets.flatMap((subset) =>
      PAGE_PAIRS.map(([fg, min]) => ({
        fg,
        on: `the ${chrome} page background`,
        min,
        // CSS lists layers top first, so paint them bottom up.
        bg: (colors: PaletteColors) =>
          [...subset].reverse().reduce((under, w) => compositeOver(colors[w.token], w.percent / 100, under), solidOf(colors, solid)),
      })),
    ),
  );
});

const checks: Check[] = [
  ...[...CONTRAST_PAIRS, ...TINT_PAIRS].map(([fg, bg, min]) => ({
    fg,
    on: bg,
    min,
    bg: (colors: PaletteColors) => colorOf(colors, bg),
    fill: INKS[bg as PaletteToken] === fg ? (bg as PaletteToken) : undefined,
  })),
  ...pageChecks,
];

const isLightSurface = (color: Oklch) => luminance(color) > 0.18;

const shift = (color: Oklch, darker: boolean): Oklch =>
  clampChroma({ ...color, l: Math.min(1, Math.max(0, color.l + (darker ? -STEP : STEP))) });

const inkFor = (fill: Oklch, light: boolean): Oklch =>
  light ? { l: 0.985, c: Math.min(fill.c * 0.1, 0.012), h: fill.h } : { l: 0.17, c: Math.min(fill.c * 0.25, 0.03), h: fill.h };

/** Every requirement the palette misses, as readable strings. Empty means the palette meets the contract. */
export function paletteFailures(palette: Palette): string[] {
  return (["light", "dark"] as const).flatMap((mode) => [
    ...new Set(
      checks.flatMap((c) => {
        const ratio = contrast(palette[mode][c.fg], c.bg(palette[mode]));
        return ratio < c.min ? [`${mode}: ${c.fg} on ${c.on} is ${ratio.toFixed(2)}, needs ${c.min}`] : [];
      }),
    ),
  ]);
}

function repairMode(input: PaletteColors): PaletteColors {
  const colors = { ...input };
  const lightPage = isLightSurface(colors.background);
  for (let step = 0; step < MAX_STEPS; step++) {
    const failing = checks.find((c) => contrast(colors[c.fg], c.bg(colors)) < c.min * MARGIN);
    if (!failing) break;
    const { fg, fill } = failing;

    if (fill) {
      // Ink on a fill: use the better ink; if that still fails, move the fill away from the ink.
      const color = colors[fill];
      const lightInk = PAGE_TEXT_FILLS.has(fill) ? lightPage : contrast(inkFor(color, true), color) >= contrast(inkFor(color, false), color);
      const ink = inkFor(color, lightInk);
      if (contrast(ink, color) > contrast(colors[fg], color) + 0.01) colors[fg] = ink;
      else colors[fill] = shift(color, lightInk);
    } else {
      // Text or a border on a surface, tint, or page background: move it away from that background.
      const before = colors[fg];
      colors[fg] = shift(before, isLightSurface(failing.bg(colors)));
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
  const id = `odd-palette-${name}`;
  const style = doc.getElementById(id) ?? doc.head.appendChild(Object.assign(doc.createElement("style"), { id }));
  style.textContent = `@layer palette {\n${paletteCss(name, palette)}\n}`;
  return () => style.remove();
}
