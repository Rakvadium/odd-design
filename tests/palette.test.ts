import { describe, expect, test } from "bun:test";
import { parse, wcagContrast } from "culori";
import { formatOklch } from "../src/js/color.ts";
import { CHROMES, CONTRAST_PAIRS, PAGE_PAIRS, PALETTE_TOKENS, TINT_PAIRS } from "../src/js/contract.ts";
import { generatePalette, paletteCss, paletteFailures } from "../src/js/palette.ts";
import { block, pageBackgrounds, read, resolve } from "./css.ts";

// Seeds across the hue wheel, from dark to pale and muted to vivid, including ones that start out
// failing (pale yellow primaries, near-greys). Every generated palette must meet the contract.
const seeds: { primary: string; secondary: string }[] = [];
for (let h = 0; h < 360; h += 30)
  for (const l of [0.3, 0.55, 0.75, 0.92])
    for (const c of [0.02, 0.12, 0.25])
      seeds.push({
        primary: formatOklch({ l, c, h }),
        secondary: formatOklch({ l: 1.05 - l, c: c * 0.8, h: (h + 150) % 360 }),
      });
seeds.push({ primary: "#f5c518", secondary: "#ffffff" }, { primary: "#000000", secondary: "#777777" });

const derived = block(read("foundations.css"), ":where(:root, [data-palette], [data-chrome], [data-mode])");

describe("generatePalette", () => {
  test(`meets the contract for all ${seeds.length} seed pairs`, () => {
    const failures = seeds.flatMap((s) => paletteFailures(generatePalette(s)).map((f) => `${s.primary}: ${f}`));
    expect(failures).toEqual([]);
  });

  // Same check through the CSS it emits and culori, the path the shipped palettes take.
  test("emitted CSS passes the culori contrast check", () => {
    const failures = seeds.flatMap((s) => {
      const css = paletteCss("custom", generatePalette(s));
      const decls = new Map([...derived, ...block(css, '[data-palette="custom"]')]);
      return (["light", "dark"] as const).flatMap((mode) =>
        [...CONTRAST_PAIRS, ...TINT_PAIRS].flatMap(([fg, bg, min]) => {
          const ratio = wcagContrast(parse(resolve(decls, fg, mode))!, parse(resolve(decls, bg, mode))!);
          return ratio < min ? [`${s.primary} ${mode}: ${fg} on ${bg} ${ratio.toFixed(3)}`] : [];
        }),
      );
    });
    expect(failures).toEqual([]);
  });

  // And against every chrome's real --page-background, read from the chrome CSS.
  test("emitted CSS keeps page text at AA on every chrome's page background", () => {
    const chromes = CHROMES.map((c) => block(read(`chromes/${c}.css`), `[data-chrome="${c}"]`));
    const failures = seeds.flatMap((s) => {
      const own = block(paletteCss("custom", generatePalette(s)), '[data-palette="custom"]');
      return chromes.flatMap((chrome, i) => {
        const decls = new Map([...derived, ...own, ...chrome]);
        return (["light", "dark"] as const).flatMap((mode) =>
          pageBackgrounds(decls, mode).flatMap((bg) =>
            PAGE_PAIRS.flatMap(([fg, min]) => {
              const ratio = wcagContrast(parse(resolve(decls, fg, mode))!, parse(bg)!);
              return ratio < min ? [`${s.primary} ${CHROMES[i]} ${mode}: ${fg} ${ratio.toFixed(3)}`] : [];
            }),
          ),
        );
      });
    });
    expect([...new Set(failures)]).toEqual([]);
  });

  test("defines every palette token and nothing else", () => {
    const decls = block(paletteCss("custom", generatePalette(seeds[0]!)), '[data-palette="custom"]');
    expect([...decls.keys()].sort()).toEqual([...PALETTE_TOKENS].sort());
  });

  test("keeps the brand hue on primary", () => {
    const palette = generatePalette({ primary: "oklch(0.55 0.2 300)" });
    expect(palette.light.primary.h).toBeCloseTo(300, 0);
    expect(palette.dark.primary.h).toBeCloseTo(300, 0);
  });
});
