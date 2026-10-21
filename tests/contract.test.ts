import { describe, expect, test } from "bun:test";
import { parse, wcagContrast } from "culori";
import { CHROMES, CHROME_TOKENS, CONTRAST_PAIRS, PALETTES, PALETTE_TOKENS, TINT_PAIRS } from "../src/js/contract.ts";
import { block, read, resolve } from "./css.ts";

const foundations = read("foundations.css");
const statusDefaults = block(foundations, ":where(:root, [data-palette])");
const derived = block(foundations, ":where(:root, [data-palette], [data-chrome], [data-mode])");

describe.each(PALETTES)("palette %s", (palette) => {
  const own = block(read(`palettes/${palette}.css`), `[data-palette="${palette}"]`);
  const decls = new Map([...derived, ...statusDefaults, ...own]);

  test("defines every palette token", () => {
    expect(PALETTE_TOKENS.filter((t) => !decls.has(t))).toEqual([]);
  });

  test("defines only palette tokens", () => {
    expect([...own.keys()].filter((t) => !(PALETTE_TOKENS as readonly string[]).includes(t))).toEqual([]);
  });

  const failures = (pairs: ReadonlyArray<readonly [string, string, number]>, mode: "light" | "dark") =>
    pairs.flatMap(([fg, bg, min]) => {
      const ratio = wcagContrast(parse(resolve(decls, fg, mode))!, parse(resolve(decls, bg, mode))!);
      return ratio < min ? [`${fg} on ${bg}: ${ratio.toFixed(2)} < ${min}`] : [];
    });

  for (const mode of ["light", "dark"] as const) {
    test(`meets WCAG 2.2 AA contrast in ${mode}`, () => {
      expect(failures(CONTRAST_PAIRS, mode)).toEqual([]);
    });

    test(`keeps text on soft tints at WCAG 2.2 AA in ${mode}`, () => {
      expect(failures(TINT_PAIRS, mode)).toEqual([]);
    });
  }
});

describe.each(CHROMES)("chrome %s", (chrome) => {
  const decls = block(read(`chromes/${chrome}.css`), `[data-chrome="${chrome}"]`);

  test("defines every chrome token", () => {
    expect(CHROME_TOKENS.filter((t) => !decls.has(t))).toEqual([]);
  });

  test("defines no palette tokens", () => {
    expect([...decls.keys()].filter((t) => (PALETTE_TOKENS as readonly string[]).includes(t))).toEqual([]);
  });

  // Chrome may reference palette colors and use neutral black/white for shadows, but never ship a hue.
  test("contains no chromatic color literals", () => {
    const literals = [...decls.values()].flatMap((v) => [...v.matchAll(/oklch\(\s*[\d.]+%?\s+([\d.]+)/g)]);
    expect(literals.filter((m) => Number(m[1]) !== 0).map((m) => m[0])).toEqual([]);
    expect([...decls.values()].filter((v) => /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i.test(v))).toEqual([]);
  });
});

// Components read tokens; they never ask which chrome or palette is active.
test("components never select on a chrome or palette id", async () => {
  const { readdirSync } = await import("node:fs");
  const dir = new URL("../src/css/components/", import.meta.url);
  const offenders = readdirSync(dir).flatMap((file) =>
    [...read(`components/${file}`).matchAll(/\[data-(chrome|palette)[^\]]*\]/g)].map((m) => `${file}: ${m[0]}`),
  );
  expect(offenders).toEqual([]);
});
