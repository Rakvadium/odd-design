// The little color math the palette generator needs, with no dependencies: OKLCH <-> sRGB,
// gamut clamping, an OKLab mix that matches CSS color-mix(in oklab), and WCAG 2 contrast.
// tests/color.test.ts checks every function against culori.

export type Oklch = { l: number; c: number; h: number };

type Rgb = [number, number, number];

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

function oklabToLinear(L: number, a: number, b: number): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function linearToOklab([r, g, b]: Rgb): Rgb {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const toLab = ({ l, c, h }: Oklch): Rgb => [l, c * Math.cos((h * Math.PI) / 180), c * Math.sin((h * Math.PI) / 180)];

function fromLab([l, a, b]: Rgb): Oklch {
  const c = Math.hypot(a, b);
  const h = c < 1e-6 ? 0 : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
  return { l, c, h };
}

const linearRgb = (color: Oklch) => oklabToLinear(...toLab(color));

export const inGamut = (color: Oklch, eps = 1e-4) => linearRgb(color).every((v) => v >= -eps && v <= 1 + eps);

/** Lowers chroma (keeping lightness and hue) until the color fits in sRGB. */
export function clampChroma(color: Oklch): Oklch {
  const l = Math.min(1, Math.max(0, color.l));
  if (inGamut({ ...color, l })) return { ...color, l };
  let lo = 0;
  let hi = color.c;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut({ l, c: mid, h: color.h })) lo = mid;
    else hi = mid;
  }
  return { l, c: lo, h: color.h };
}

/** WCAG 2 relative luminance of the color as a browser paints it (out-of-gamut channels clipped). */
export function luminance(color: Oklch): number {
  const [r, g, b] = linearRgb(color).map((v) => Math.min(1, Math.max(0, v))) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: Oklch, b: Oklch): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** CSS color-mix(in oklab, a amount, b): `amount` of a, the rest b. */
export function mixOklab(a: Oklch, amount: number, b: Oklch): Oklch {
  const [la, aa, ba] = toLab(a);
  const [lb, ab, bb] = toLab(b);
  return fromLab([la * amount + lb * (1 - amount), aa * amount + ab * (1 - amount), ba * amount + bb * (1 - amount)]);
}

/** Parses #rgb, #rrggbb, or oklch(L C H) with L as a number or percentage. */
export function parseColor(input: string): Oklch {
  const text = input.trim().toLowerCase();
  const hex = text.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex) {
    const digits = hex[1]!.length === 3 ? [...hex[1]!].map((d) => d + d) : hex[1]!.match(/../g)!;
    const rgb = digits.map((d) => toLinear(parseInt(d, 16) / 255)) as Rgb;
    return fromLab(linearToOklab(rgb));
  }
  const ok = text.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*\)$/);
  if (ok) return { l: Number(ok[1]) / (ok[2] ? 100 : 1), c: Number(ok[3]), h: Number(ok[4]) };
  throw new Error(`Unsupported color: ${input}`);
}

export const formatOklch = ({ l, c, h }: Oklch) =>
  c < 0.0005 ? `oklch(${+l.toFixed(4)} 0 0)` : `oklch(${+l.toFixed(4)} ${+c.toFixed(4)} ${+h.toFixed(2)})`;
