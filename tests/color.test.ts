import { describe, expect, test } from "bun:test";
import { converter, formatCss, interpolate, parse, wcagContrast } from "culori";
import { clampChroma, contrast, formatOklch, inGamut, mixOklab, parseColor, type Oklch } from "../src/js/color.ts";

// src/js/color.ts reimplements just enough color math to keep the runtime dependency-free.
// These tests hold it to culori, which the rest of the test suite trusts.
const toOklch = converter("oklch");

const samples: Oklch[] = [];
for (const l of [0.15, 0.35, 0.55, 0.75, 0.95])
  for (const c of [0, 0.05, 0.12, 0.2])
    for (const h of [0, 40, 95, 150, 210, 265, 320]) samples.push({ l, c, h });

const css = (o: Oklch) => formatCss({ mode: "oklch", ...o });

describe("color math matches culori", () => {
  test("hex parses to the same OKLCH", () => {
    for (const hex of ["#ff0000", "#00a3e0", "#1a1a2e", "#fafafa", "#f5c518", "#7c3aed", "#0f0"]) {
      const ours = parseColor(hex);
      const theirs = toOklch(parse(hex)!);
      expect(ours.l).toBeCloseTo(theirs.l, 4);
      expect(ours.c).toBeCloseTo(theirs.c ?? 0, 4);
      if ((theirs.c ?? 0) > 0.01) expect(ours.h).toBeCloseTo(theirs.h ?? 0, 1);
    }
  });

  // Relative, because the gap grows with the ratio. The two implementations differ slightly in
  // conversion and clipping; 0.2% of 4.5 is 0.009. The generator aims 1% above each minimum to absorb it.
  test("WCAG contrast agrees within 0.2%", () => {
    for (let i = 0; i < samples.length; i++) {
      const a = clampChroma(samples[i]!);
      const b = clampChroma(samples[(i * 7 + 5) % samples.length]!);
      const theirs = wcagContrast(css(a), css(b));
      expect(Math.abs(contrast(a, b) - theirs) / theirs).toBeLessThan(0.002);
    }
  });

  test("clampChroma lands in sRGB without changing lightness or hue", () => {
    for (const s of samples) {
      const out = clampChroma({ ...s, c: 0.37 });
      expect(inGamut(out)).toBe(true);
      expect(out.l).toBe(s.l);
      expect(out.h).toBe(s.h);
    }
  });

  test("mixOklab matches color-mix(in oklab)", () => {
    const a = parseColor("oklch(0.52 0.14 245)");
    const b = parseColor("oklch(0.965 0.007 70)");
    const ours = mixOklab(a, 0.14, b);
    const theirs = toOklch(interpolate([css(b), css(a)], "oklab")(0.14));
    expect(ours.l).toBeCloseTo(theirs.l, 4);
    expect(ours.c).toBeCloseTo(theirs.c ?? 0, 4);
  });

  test("formatOklch round-trips through parseColor", () => {
    const o = { l: 0.6123, c: 0.1456, h: 212.34 };
    expect(parseColor(formatOklch(o))).toEqual(o);
    expect(formatOklch({ l: 0.99, c: 0, h: 120 })).toBe("oklch(0.99 0 0)");
  });
});
