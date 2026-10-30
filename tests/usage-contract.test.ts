import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { CLASS_REGISTRY, USAGE, VOCABULARY, WRAPPERS, type UsageRule, type Wrapper } from "../src/js/usage/contract.ts";
import { MESSAGES, USAGE_CODES, message, type UsageCode } from "../src/js/usage/format.ts";
import { read } from "./css.ts";

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

const wrappers: readonly Wrapper[] = Object.values(WRAPPERS);
const mapping = wrappers.filter((wrapper) => Object.keys(wrapper.props).length > 0);

function rulesOf(className: string): readonly UsageRule[] {
  const rules: readonly (readonly UsageRule[])[] = Object.values(USAGE);
  return rules.find((group) => group.some((rule) => rule.kind === "element" && rule.className === className)) ?? [];
}

const SHARED_STYLESHEET: Readonly<Record<string, string>> = { "odd-progress": "meter", "odd-menu-item": "menu" };

function stylesheet(wrapper: Wrapper): string {
  return SHARED_STYLESHEET[wrapper.className] ?? wrapper.className.replace(/^odd-/, "");
}

test("MESSAGES has one message per code, in order", () => {
  expect(Object.keys(MESSAGES)).toEqual([...USAGE_CODES]);
});

test("each wrapper's enum data prop takes exactly the values its stylesheet styles", () => {
  const compared = mapping.flatMap((wrapper) => {
    const css = read(`components/${stylesheet(wrapper)}.css`);
    return Object.values(wrapper.props).flatMap((attribute) =>
      rulesOf(wrapper.className).flatMap((rule) =>
        rule.kind === "enum" && rule.attribute === attribute ? [[attribute, [...rule.values].sort(), quotedAttr(css, attribute)]] : [],
      ),
    );
  });
  expect(compared.map(([attribute]) => attribute)).toEqual(["data-variant", "data-size", "data-tone", "data-tone", "data-size", "data-shape", "data-tone", "data-tone", "data-side", "data-tone"]);
  for (const [attribute, values, styled] of compared) expect([attribute, styled]).toEqual([attribute, values]);
  expect(read("components/button.css").includes(":disabled")).toBe(true);
});

test("registry matches every odd- class in src/css", () => {
  const root = fileURLToPath(new URL("../src/css/", import.meta.url));
  const found = [...new Set(cssFiles(root).flatMap((file) => oddClasses(readFileSync(file, "utf8"))))].sort();
  expect(found).toEqual([...CLASS_REGISTRY].sort());
});

test("messages include the code, Fix:, a docs heading in the named file, and no double quote", () => {
  const quoted = USAGE_CODES.filter((code) => message(code).includes('"'));
  const missingFix = USAGE_CODES.filter((code) => !message(code).includes("Fix:"));
  const missingDocs = USAGE_CODES.flatMap((code) => {
    const text = message(code);
    const match = /docs\/usage\/([a-z]+\.md)#([a-z0-9-]+)/.exec(text);
    if (match === null) return [code];
    const file = match[1]!;
    const anchor = match[2]!;
    const markdown = readFileSync(new URL(`../docs/usage/${file}`, import.meta.url), "utf8");
    const hasHeading = markdown.split(/\r?\n/).includes(`## ${code}`);
    if (!hasHeading || anchor !== code.toLowerCase()) return [`${code} ${file}#${anchor}`];
    return [];
  });
  const missingCode = USAGE_CODES.filter((code) => !message(code).startsWith(`${code}:`));
  expect(quoted).toEqual([]);
  expect(missingFix).toEqual([]);
  expect(missingDocs).toEqual([]);
  expect(missingCode).toEqual([]);

  const rules: readonly UsageRule[] = Object.values(USAGE).flat();
  const absent: string[] = [];
  for (const rule of rules) {
    const text = MESSAGES[rule.code];
    if (rule.kind === "element") {
      const listed = (/Allowed values: (.*?)\. Fix:/.exec(text)?.[1] ?? "").split(", ");
      for (const element of rule.elements) {
        if (!listed.includes(element) && !listed.includes(`${rule.className} on ${element}`)) absent.push(`${rule.code} ${rule.className} ${element}`);
      }
    }
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
    if (rule.kind === "required-child") {
      const child = "child" in rule ? rule.child : "role" in rule ? `role=${rule.role}` : rule.className;
      for (const token of rule.attribute === undefined ? [child] : [child, `${rule.attribute}=${rule.value}`]) {
        if (!text.includes(token)) absent.push(`${rule.code} ${token}`);
      }
    }
    if (rule.kind === "role-descendant") {
      for (const token of [`role=${rule.role}`, ...rule.elements, rule.attribute]) {
        if (!text.includes(token)) absent.push(`${rule.code} ${token}`);
      }
    }
    if (rule.kind === "name-requires") {
      for (const token of [rule.attribute, ...rule.names]) {
        if (!text.includes(token)) absent.push(`${rule.code} ${token}`);
      }
    }
    if (rule.kind === "forbidden-value") {
      for (const token of [`${rule.attribute}=${rule.value}`, `${rule.when.attribute}=${rule.when.value}`]) {
        if (!text.includes(token)) absent.push(`${rule.code} ${token}`);
      }
    }
    if (rule.kind === "accessible-name") {
      for (const token of rule.names) {
        if (!text.includes(token)) absent.push(`${rule.code} ${token}`);
      }
    }
  }
  expect(absent).toEqual([]);

  const dataCodes = [...new Set([...rules.map((rule) => rule.code), "ODD-STATIC-003"])];
  expect(dataCodes.sort()).toEqual([...USAGE_CODES].sort());
});

const BASE_FAMILIES: Readonly<Record<string, string>> = { grid: "base.css" };

test("vocabulary matches the data attributes in each component stylesheet and each base family", () => {
  const dir = fileURLToPath(new URL("../src/css/components/", import.meta.url));
  const files = readdirSync(dir).filter((name) => name.endsWith(".css")).sort();
  const components = Object.keys(VOCABULARY).sort();
  expect(components).toEqual([...files.map((name) => name.replace(/\.css$/, "")), ...Object.keys(BASE_FAMILIES)].sort());
  for (const component of components) {
    const listed = [...VOCABULARY[component as keyof typeof VOCABULARY]].sort().join(" ");
    const found = dataAttributes(read(BASE_FAMILIES[component] ?? `components/${component}.css`)).join(" ");
    expect([component, listed]).toEqual([component, found]);
  }
  const vocabulary: Record<string, readonly string[]> = VOCABULARY;
  const unstyled = mapping.flatMap((wrapper) =>
    Object.values(wrapper.props).filter((attribute) => !(vocabulary[stylesheet(wrapper)] ?? []).includes(attribute)),
  );
  expect(unstyled).toEqual([]);
});

test("a system-data message names every attribute its class's wrapper maps", () => {
  const unnamed = mapping.flatMap((wrapper) =>
    rulesOf(wrapper.className).flatMap((rule) =>
      rule.kind === "system-data" ? Object.values(wrapper.props).filter((attribute) => !MESSAGES[rule.code].includes(attribute)) : [],
    ),
  );
  expect(unnamed).toEqual([]);
});

test("a found value loses its double quotes before it enters the message", () => {
  expect(message("ODD-CLASS-001", { found: 'odd-"button"' })).toBe(
    "ODD-CLASS-001: this class is not in the registry. Allowed values: the registered odd- classes. Fix: use a registered class, or remove the class. docs/usage/general.md#odd-class-001 Found odd-button.",
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
