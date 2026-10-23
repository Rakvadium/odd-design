import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ATTRIBUTES, CLASS_REGISTRY, COMMENT_RULES, USAGE, VOCABULARY } from "../src/js/usage/contract.ts";
import { MESSAGES, USAGE_CODES, message, type UsageCode } from "../src/js/usage/format.ts";
import { read } from "./css.ts";

const codes = readFileSync(new URL("./usage-codes.txt", import.meta.url), "utf8").replace(/\r/g, "").replace(/\n$/, "").split("\n");

function headerLists(cssText: string): string[] {
  return [...cssText.matchAll(/data-(?:variant|size)="([^"]*)"/g)].flatMap((match) => match[1]!.split("|").filter((part) => part.length > 0));
}

function quotedAttr(css: string, name: string): string[] {
  return [...new Set([...css.matchAll(new RegExp(`\\[${name}="([^"]+)"\\]`, "g"))].map((match) => match[1]!))].sort();
}

function dataAttributes(css: string): string[] {
  return [...new Set([...css.matchAll(/\[(data-[a-z0-9-]+)/g)].map((match) => match[1]!))].sort();
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

test("usage-codes.txt matches the contract codes", () => {
  expect(codes).toEqual([...USAGE_CODES]);
  expect(Object.keys(MESSAGES)).toEqual(codes);
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
  const variant = enumRule("data-variant");
  const size = enumRule("data-size");
  expect(headerLists(header).sort()).toEqual([...variant.values, ...size.values].sort());
  expect(header).not.toContain("outline");
});

test("registry matches every odd- class in src/css", () => {
  const root = fileURLToPath(new URL("../src/css/", import.meta.url));
  const found = [...new Set(cssFiles(root).flatMap((file) => oddClasses(readFileSync(file, "utf8"))))].sort();
  expect(found).toEqual([...CLASS_REGISTRY].sort());
});

test("messages include the code, Fix:, a docs heading in the named file, and no double quote", () => {
  const quoted = codes.filter((code) => message(code as UsageCode).includes('"'));
  const missingFix = codes.filter((code) => !message(code as UsageCode).includes("Fix:"));
  const missingDocs = codes.flatMap((code) => {
    const text = message(code as UsageCode);
    const match = /docs\/usage\/([a-z]+\.md)#([a-z0-9-]+)/.exec(text);
    if (match === null) return [code];
    const file = match[1]!;
    const anchor = match[2]!;
    const markdown = readFileSync(new URL(`../docs/usage/${file}`, import.meta.url), "utf8");
    const hasHeading = markdown.split(/\r?\n/).includes(`## ${code}`);
    if (!hasHeading || anchor !== code.toLowerCase()) return [`${code} ${file}#${anchor}`];
    return [];
  });
  const missingCode = codes.filter((code) => !message(code as UsageCode).startsWith(`${code}:`));
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

test("vocabulary matches the data attributes in each component stylesheet", () => {
  const dir = fileURLToPath(new URL("../src/css/components/", import.meta.url));
  const files = readdirSync(dir).filter((name) => name.endsWith(".css")).sort();
  const components = Object.keys(VOCABULARY).sort();
  expect(components).toEqual(files.map((name) => name.replace(/\.css$/, "")));
  for (const component of components) {
    const listed = [...VOCABULARY[component as keyof typeof VOCABULARY]].sort().join(" ");
    const found = dataAttributes(read(`components/${component}.css`)).join(" ");
    expect([component, listed]).toEqual([component, found]);
  }
  const buttonVocabulary: readonly string[] = VOCABULARY.button;
  const missingButton = [...ATTRIBUTES.button].filter((name) => !buttonVocabulary.includes(name));
  expect(missingButton).toEqual([]);
});

test("allowed values in 002, 003, and 015 come from the contract", () => {
  expect(message("ODD-BUTTON-002")).toBe(
    "ODD-BUTTON-002: data-variant has a value this button does not take. Allowed values: primary, secondary, danger, ghost. outline and default mean remove the attribute. Fix: remove data-variant, or set primary, secondary, danger, or ghost. docs/usage/button.md#odd-button-002",
  );
  expect(message("ODD-BUTTON-003")).toBe(
    "ODD-BUTTON-003: data-size has a value this button does not take. Allowed values: sm, lg. md and medium mean remove the attribute. Fix: remove data-size, or set sm or lg. docs/usage/button.md#odd-button-003",
  );
  expect(message("ODD-BUTTON-015")).toBe(
    "ODD-BUTTON-015: this button does not take that data attribute. Allowed values: the button attributes, any app data attribute, the appearance axes, and the headless allowlist. Fix: remove the attribute, or correct its name. Button attributes: data-variant, data-size, data-icon-only. Appearance axes: data-chrome, data-palette, data-mode. Headless allowlist: data-state, data-side, data-disabled, data-orientation, data-highlighted. docs/usage/button.md#odd-button-015",
  );
});

test("a found value loses its double quotes before it enters the message", () => {
  expect(message("ODD-CLASS-001", { found: 'odd-"button"' })).toBe(
    "ODD-CLASS-001: this class is not in the registry. Allowed values: the registered odd- classes. Fix: use a registered class, or remove the class. docs/usage/general.md#odd-class-001 Found odd-button.",
  );
});

test("a hint names the found value and the suggestion", () => {
  expect(message("ODD-BUTTON-002", { found: "primray", suggestion: "primary" })).toBe(
    "ODD-BUTTON-002: data-variant has a value this button does not take. Allowed values: primary, secondary, danger, ghost. outline and default mean remove the attribute. Fix: remove data-variant, or set primary, secondary, danger, or ghost. docs/usage/button.md#odd-button-002 Found primray. Did you mean primary?",
  );
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
