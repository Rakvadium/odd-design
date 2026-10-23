import { expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { checkUsage, type Computed, type UsageAttribute, type UsageNode } from "../src/js/usage/check.ts";
import { toUsageNode } from "../src/js/usage/dom.ts";

const fixtureDir = new URL("./fixtures/usage/", import.meta.url);
const fixtures = readdirSync(fixtureDir).filter((name) => name.endsWith(".html")).sort();

const RUNTIME_CODES = [
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
  "ODD-CLASS-001",
];

function expectedCodes(html: string): string[] {
  const match = /^<!-- expect: (.+) -->/.exec(html);
  if (match === null) throw new Error("fixture has no expect line");
  return match[1] === "none" ? [] : match[1]!.split(" ");
}

function diagnose(html: string) {
  const body = new DOMParser().parseFromString(html, "text/html").body;
  return [...body.querySelectorAll("*")].flatMap((element) => checkUsage(toUsageNode(element)));
}

function fixture(name: string): string {
  return readFileSync(new URL(name, fixtureDir), "utf8");
}

for (const name of fixtures) {
  test(name, () => {
    const html = fixture(name);
    expect(diagnose(html).map((diagnostic): string => diagnostic.code)).toEqual(expectedCodes(html));
  });
}

test("every runtime code has a bad fixture that names it and a good fixture that expects none", () => {
  const byKind = (kind: string) =>
    fixtures.filter((name) => name.endsWith(`.${kind}.html`)).map((name) => name.replace(`.${kind}.html`, "").toUpperCase()).sort();
  expect(byKind("bad")).toEqual([...RUNTIME_CODES].sort());
  expect(byKind("good")).toEqual([...RUNTIME_CODES].sort());
  const unnamed = byKind("bad").filter((code) => !expectedCodes(fixture(`${code.toLowerCase()}.bad.html`)).includes(code));
  const noisy = byKind("good").filter((code) => expectedCodes(fixture(`${code.toLowerCase()}.good.html`)).length > 0);
  expect(unnamed).toEqual([]);
  expect(noisy).toEqual([]);
});

test("data-variant outline says to remove the attribute", () => {
  expect(diagnose(`<button class="odd-button" data-variant="outline">Save</button>`).map((diagnostic) => diagnostic.message)).toEqual([
    "ODD-BUTTON-002: data-variant has a value this button does not take. Allowed values: primary, secondary, danger, ghost. outline and default mean remove the attribute. Fix: remove data-variant, or set primary, secondary, danger, or ghost. docs/usage/button.md#odd-button-002 Found outline. Did you mean to remove data-variant?",
  ]);
});

test("primray suggests primary", () => {
  expect(diagnose(`<button class="odd-button" data-variant="primray">Save</button>`).map((diagnostic) => diagnostic.message)).toEqual([
    "ODD-BUTTON-002: data-variant has a value this button does not take. Allowed values: primary, secondary, danger, ghost. outline and default mean remove the attribute. Fix: remove data-variant, or set primary, secondary, danger, or ghost. docs/usage/button.md#odd-button-002 Found primray. Did you mean primary?",
  ]);
});

test("data-varient suggests data-variant", () => {
  expect(diagnose(`<button class="odd-button" data-varient="primary">Save</button>`).map((diagnostic) => diagnostic.message)).toEqual([
    "ODD-BUTTON-015: this button does not take that data attribute. Allowed values: the button attributes, any app data attribute, the appearance axes, and the headless allowlist. Fix: remove the attribute, or correct its name. Button attributes: data-variant, data-size, data-icon-only. Appearance axes: data-chrome, data-palette, data-mode. Headless allowlist: data-state, data-side, data-disabled, data-orientation, data-highlighted. docs/usage/button.md#odd-button-015 Found data-varient. Did you mean data-variant?",
  ]);
});

function attribute(name: string, value: string | Computed): UsageAttribute {
  return { name, value };
}

function codes(node: UsageNode): string[] {
  return checkUsage(node).map((diagnostic) => diagnostic.code);
}

test("a computed data-variant warns on that attribute instead of failing", () => {
  const variant = attribute("data-variant", { computed: [] });
  const node: UsageNode = { tag: "button", attributes: [attribute("class", "odd-button"), variant], children: ["Save"] };
  expect(checkUsage(node).map((diagnostic) => [diagnostic.code, diagnostic.attribute])).toEqual([["ODD-STATIC-001", variant]]);
});

test("an unknown attribute on an anchor warns and does not claim href is missing", () => {
  const unknown: Computed = { computed: [] };
  const node: UsageNode = { tag: "a", attributes: [attribute("class", "odd-button"), unknown], children: ["Home"] };
  expect(checkUsage(node).map((diagnostic) => [diagnostic.code, diagnostic.attribute])).toEqual([["ODD-STATIC-001", unknown]]);
});

test("a partly computed class still applies the button rules to its literal words", () => {
  const node: UsageNode = {
    tag: "button",
    attributes: [attribute("class", { computed: ["odd-button"] }), attribute("disabled", "")],
    children: ["Save"],
  };
  expect(codes(node)).toEqual(["ODD-STATIC-001", "ODD-BUTTON-007"]);
});

test("a component tag with an odd- class only warns", () => {
  const node: UsageNode = { tag: { computed: [] }, attributes: [attribute("class", "odd-button"), attribute("disabled", "")], children: ["Docs"] };
  expect(codes(node)).toEqual(["ODD-STATIC-001"]);
});

test("a computed class with no odd- word is outside the contract", () => {
  const node: UsageNode = { tag: "button", attributes: [attribute("class", { computed: [] }), attribute("disabled", "")], children: ["Save"] };
  expect(codes(node)).toEqual([]);
});

test("computed children and a computed aria-label do not fail an icon-only button", () => {
  const node: UsageNode = {
    tag: "button",
    attributes: [attribute("class", "odd-button"), attribute("data-icon-only", ""), attribute("aria-label", { computed: [] })],
    children: [{ computed: [] }],
  };
  expect(codes(node)).toEqual([]);
});

test("a computed data-icon-only on a button with text only warns", () => {
  const iconOnly = attribute("data-icon-only", { computed: [] });
  const node: UsageNode = { tag: "button", attributes: [attribute("class", "odd-button"), iconOnly], children: ["Save"] };
  expect(checkUsage(node).map((diagnostic) => [diagnostic.code, diagnostic.attribute])).toEqual([["ODD-STATIC-001", iconOnly]]);
});
