// Tiny CSS reader for the contract test. Only understands what our token files use:
// flat `selector { --name: value; }` blocks, var() references, light-dark(), and color-mix(in oklch | oklab).
import { readFileSync } from "node:fs";
import { formatCss, interpolate } from "culori";

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

function evaluate(decls: Decls, value: string, mode: "light" | "dark", seen: Set<string>): string {
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
