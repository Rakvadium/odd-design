// Tiny CSS reader for the contract test. Only understands what our token files use:
// flat `selector { --name: value; }` blocks, var() references, light-dark(), and color-mix(in oklch | oklab).
import { readFileSync } from "node:fs";
import { converter, formatCss, interpolate, parse } from "culori";

export type Decls = Map<string, string>;

export function read(path: string) {
  return readFileSync(new URL(`../src/css/${path}`, import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Declarations from every top-level block whose selector list contains `selector`. */
export function block(css: string, selector: string): Decls {
  const decls: Decls = new Map();
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!topLevel(m[1]!).some((s) => s === selector)) continue;
    for (const d of m[2]!.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) decls.set(d[1]!, d[2]!.trim());
  }
  return decls;
}

/** Splits on commas that aren't inside parentheses. */
function topLevel(list: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i] === "(") depth++;
    else if (list[i] === ")") depth--;
    else if (list[i] === "," && depth === 0) {
      parts.push(list.slice(start, i).trim());
      start = i + 1;
    }
  }
  return [...parts, list.slice(start).trim()];
}

function pair(args: string, fn: string) {
  const parts = topLevel(args);
  if (parts.length !== 2) throw new Error(`${fn}() needs two arguments: ${args}`);
  return parts as [string, string];
}

/** Resolves a token to a literal color for one mode. */
export function resolve(decls: Decls, name: string, mode: "light" | "dark", seen = new Set<string>()): string {
  if (seen.has(name)) throw new Error(`cycle at --${name}`);
  const value = decls.get(name);
  if (value === undefined) throw new Error(`--${name} is not defined`);
  return evaluate(decls, value, mode, new Set(seen).add(name));
}

export function evaluate(decls: Decls, value: string, mode: "light" | "dark", seen = new Set<string>()): string {
  const ref = value.match(/^var\(--([\w-]+)\)$/);
  if (ref) return resolve(decls, ref[1]!, mode, seen);
  const ld = value.match(/^light-dark\(([\s\S]*)\)$/);
  if (ld) return evaluate(decls, pair(ld[1]!, "light-dark")[mode === "light" ? 0 : 1], mode, seen);
  const mix = value.match(/^color-mix\(in (oklch|oklab),\s*([\s\S]*)\)$/);
  if (mix) {
    // Only the form foundations.css uses: color-mix(in <space>, A P%, B) is P% of A and the rest B.
    const space = mix[1] as "oklch" | "oklab";
    const [first, b] = pair(mix[2]!, "color-mix");
    const weighted = first.match(/^([\s\S]+?)\s+([\d.]+)%$/);
    if (!weighted) throw new Error(`color-mix() needs a percentage on its first color: ${value}`);
    const a = evaluate(decls, weighted[1]!, mode, seen);
    const mixed = interpolate([evaluate(decls, b, mode, seen), a], space)(Number(weighted[2]) / 100);
    return formatCss(mixed);
  }
  return value;
}

const toRgb = converter("rgb");

/** The full text of each `fn(...)` call in a value, matching nested parentheses. */
function calls(value: string, fn: string): string[] {
  const out: string[] = [];
  for (let i = value.indexOf(`${fn}(`); i !== -1; i = value.indexOf(`${fn}(`, i + 1)) {
    let depth = 0;
    for (let j = i + fn.length; j < value.length; j++) {
      if (value[j] === "(") depth++;
      else if (value[j] === ")" && --depth === 0) {
        out.push(value.slice(i, j + 1));
        i = j;
        break;
      }
    }
  }
  return out;
}

/** Composites translucent colors over an opaque one in sRGB, as browsers paint layers. */
function over(base: string, layers: { color: string; alpha: number }[]): string {
  let out = toRgb(parse(base)!)!;
  for (const { color, alpha } of layers) {
    const top = toRgb(parse(color)!)!;
    out = { mode: "rgb", r: top.r * alpha + out.r * (1 - alpha), g: top.g * alpha + out.g * (1 - alpha), b: top.b * alpha + out.b * (1 - alpha) };
  }
  return formatCss(out);
}

/**
 * The layers of a --page-background value, as written: its solid color expressions, and its
 * translucent washes (a color and a percentage, top layer first). Understands the forms our chromes
 * use: var() stops, color-mix() stops, and color-mix(..., transparent) washes. Anything else throws.
 */
export function pageBackgroundLayers(value: string) {
  const mixes = calls(value, "color-mix");
  const isWash = (m: string) => /,\s*transparent\s*\)$/.test(m);
  const washes = mixes.filter(isWash).map((m) => {
    const w = m.match(/^color-mix\(in (?:oklch|oklab),\s*([\s\S]+?)\s+([\d.]+)%,\s*transparent\s*\)$/);
    if (!w) throw new Error(`unsupported wash: ${m}`);
    return { color: w[1]!, percent: Number(w[2]) };
  });
  let rest = value;
  for (const m of mixes) rest = rest.replace(m, " ");
  const solids = [...mixes.filter((m) => !isWash(m)), ...[...rest.matchAll(/var\(--[\w-]+\)/g)].map((m) => m[0])];
  const unknown = rest.replace(/var\(--[\w-]+\)/g, "").match(/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i);
  if (unknown) throw new Error(`unsupported color in --page-background: ${unknown[0]}`);
  if (solids.length === 0) throw new Error("--page-background has no solid color");
  return { solids, washes };
}

/**
 * Every background that text on a chrome's --page-background can sit on, as opaque colors: each
 * solid color in the stack, alone and under every combination of its washes at full strength.
 * Full strength is a wash's worst point; anywhere it fades, the result lies between the solid
 * color alone and the full wash.
 */
export function pageBackgrounds(decls: Decls, mode: "light" | "dark"): string[] {
  const value = decls.get("page-background");
  if (value === undefined) throw new Error("--page-background is not defined");
  const layers = pageBackgroundLayers(value);
  const washes = layers.washes.map((w) => ({ color: evaluate(decls, w.color, mode), alpha: w.percent / 100 }));
  const subsets = washes.reduce<(typeof washes)[]>((acc, w) => [...acc, ...acc.map((s) => [...s, w])], [[]]);
  // CSS lists background layers top first, so paint them bottom up.
  return layers.solids.flatMap((solid) => subsets.map((s) => over(evaluate(decls, solid, mode), [...s].reverse())));
}
