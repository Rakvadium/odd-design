import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { APPEARANCE_AXES, ATTRIBUTES, CLASS_REGISTRY, COMMENT_RULES, HEADLESS_ALLOWLIST, USAGE, VOCABULARY } from "../src/js/usage/contract.ts";
import { MESSAGES, USAGE_CODES, message, type UsageCode } from "../src/js/usage/format.ts";
import { read } from "./css.ts";

const PINNED = [
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
  "ODD-STATIC-001",
  "ODD-STATIC-002",
  "ODD-STATIC-003",
] as const;

const codes = readFileSync(new URL("./usage-codes.txt", import.meta.url), "utf8").replace(/\r/g, "").replace(/\n$/, "").split("\n");

function headerLists(cssText: string): string[] {
  return [...cssText.matchAll(/data-(?:variant|size)="([^"]*)"/g)].flatMap((match) => match[1]!.split("|").filter((part) => part.length > 0));
}

function quotedAttr(css: string, name: string): string[] {
  return [...new Set([...css.matchAll(new RegExp(`\\[${name}="([^"]+)"\\]`, "g"))].map((match) => match[1]!))].sort();
}

function oddClasses(css: string): string[] {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...stripped.matchAll(/\.odd-[a-z0-9-]+/g)].map((match) => match[0]!.slice(1));
}

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return cssFiles(full);
    return entry.name.endsWith(".css") ? [full] : [];
  });
}

function enumRule(attribute: string) {
  const rule = USAGE.button.find((item) => item.kind === "enum" && item.attribute === attribute);
  if (rule === undefined || rule.kind !== "enum") throw new Error(`missing enum rule for ${attribute}`);
  return rule;
}

test("usage-codes.txt pins the 19 appendix codes", () => {
  expect(codes).toEqual([...PINNED]);
  expect(codes).toEqual([...USAGE_CODES]);
  expect(Object.keys(MESSAGES)).toEqual([...PINNED]);
});

test("css sync compares data-variant and data-size with button.css", () => {
  const css = read("components/button.css");
  const variant = enumRule("data-variant");
  const size = enumRule("data-size");
  expect(quotedAttr(css, "data-variant")).toEqual([...variant.values].sort());
  expect(quotedAttr(css, "data-size")).toEqual([...size.values].sort());
  expect(css.includes(":disabled")).toBe(true);
});

test("headerLists reads a header that contains outline", () => {
  const sample = `<button class="odd-button" data-variant="primary|secondary|outline|ghost|danger" data-size="sm|lg">`;
  expect(headerLists(sample)).toEqual(["primary", "secondary", "outline", "ghost", "danger", "sm", "lg"]);

  const raw = readFileSync(new URL("../src/css/components/button.css", import.meta.url), "utf8");
  const header = raw.split(/\r?\n/).slice(0, 5).join("\n");
  expect(headerLists(header)).toEqual(["primary", "secondary", "ghost", "danger", "sm", "lg"]);
  expect(header.includes("outline") ? ["outline"] : []).toEqual([]);
});

test("registry matches every odd- class in src/css", () => {
  const root = fileURLToPath(new URL("../src/css/", import.meta.url));
  const found = [...new Set(cssFiles(root).flatMap((file) => oddClasses(readFileSync(file, "utf8"))))].sort();
  expect(found).toEqual([...CLASS_REGISTRY].sort());
});

test("messages include the code, Fix:, a docs path, and no double quote", () => {
  const quoted = codes.filter((code) => MESSAGES[code as UsageCode].includes('"'));
  const missingFix = codes.filter((code) => !MESSAGES[code as UsageCode].includes("Fix:"));
  const missingDocs = codes.filter((code) => !MESSAGES[code as UsageCode].includes(`docs/usage/`) || !MESSAGES[code as UsageCode].includes(`#${code.toLowerCase()}`));
  const missingCode = codes.filter((code) => !MESSAGES[code as UsageCode].startsWith(`${code}:`));
  expect(quoted).toEqual([]);
  expect(missingFix).toEqual([]);
  expect(missingDocs).toEqual([]);
  expect(missingCode).toEqual([]);

  const absent: string[] = [];
  for (const rule of USAGE.button) {
    const text = MESSAGES[rule.code];
    if (rule.kind === "enum") {
      for (const token of [...rule.values, ...rule.omit]) {
        if (!text.includes(token)) absent.push(`${rule.code} ${token}`);
      }
    }
    if (rule.kind === "boolean-attribute" || rule.kind === "aria-boolean") {
      for (const token of rule.values) {
        if (token !== "" && !text.includes(token)) absent.push(`${rule.code} ${token}`);
      }
    }
    if (rule.kind === "accessible-name") {
      for (const token of rule.names) {
        if (!text.includes(token)) absent.push(`${rule.code} ${token}`);
      }
    }
  }
  expect(absent).toEqual([]);

  const dataCodes = [...USAGE.button.map((rule) => rule.code), ...USAGE.shared.map((rule) => rule.code), ...COMMENT_RULES.map((rule) => rule.code)];
  expect(dataCodes.map((code) => `${code}`).sort()).toEqual([...codes].sort());
});

test("docs/usage has a heading for every pinned code", () => {
  const docsDir = fileURLToPath(new URL("../docs/usage/", import.meta.url));
  const headings = readdirSync(docsDir)
    .filter((name) => name.endsWith(".md"))
    .flatMap((name) => readFileSync(join(docsDir, name), "utf8").split(/\r?\n/))
    .flatMap((line) => {
      const match = /^#{1,6} (ODD-[A-Z]+-\d+)\s*$/.exec(line);
      return match ? [match[1]!] : [];
    });
  expect(codes.filter((code) => !headings.includes(code))).toEqual([]);
});

test("button data attributes, appearance axes, and the headless allowlist are vocabulary", () => {
  const attributes: readonly string[] = VOCABULARY.attributes;
  const missing = [...ATTRIBUTES.button, ...APPEARANCE_AXES, ...HEADLESS_ALLOWLIST].filter((name) => !attributes.includes(name));
  expect(missing).toEqual([]);
});

type LiteralMessage<Code extends UsageCode> = string extends (typeof MESSAGES)[Code] ? never : (typeof MESSAGES)[Code];
const button007: LiteralMessage<"ODD-BUTTON-007"> = message("ODD-BUTTON-007");
const button008: LiteralMessage<"ODD-BUTTON-008"> = message("ODD-BUTTON-008");
const button013: LiteralMessage<"ODD-BUTTON-013"> = message("ODD-BUTTON-013");
const button015: LiteralMessage<"ODD-BUTTON-015"> = message("ODD-BUTTON-015");
void button007;
void button008;
void button013;
void button015;
