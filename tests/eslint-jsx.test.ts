import { readdirSync, readFileSync } from "node:fs";
import { expect, test } from "bun:test";
import { Linter } from "eslint";
import config from "../eslint.config.js";

const linter = new Linter({ configType: "flat" });
const flat = [...config, { ignores: ["!tests/fixtures/**"] }];
const folder = "tests/fixtures/usage/jsx";

function codeOf(message: string): string {
  return message.slice(0, message.indexOf(":"));
}

function lineText(source: string, line: number): string {
  return source.split(/\r?\n/)[line - 1] ?? "";
}

function expectedCodes(source: string, pattern: RegExp): string[] {
  const match = pattern.exec(source);
  if (match === null || match[1] === undefined) throw new Error("fixture has no expect line");
  return match[1] === "none" ? [] : match[1].split(" ");
}

const places: Record<string, readonly (readonly [string, number, number, string])[]> = {
  "children-prop.tsx": [
    ["ODD-BUTTON-014", 5, 5, "<Button"],
    ["ODD-BUTTON-014", 6, 5, "<button"],
  ],
  "cn.tsx": [
    ["ODD-STATIC-001", 4, 11, "className={cn("],
    ["ODD-BUTTON-007", 4, 63, "disabled"],
  ],
  "icon-only-false.tsx": [["ODD-BUTTON-004", 3, 34, "data-icon-only={false}"]],
  "link.tsx": [["ODD-STATIC-001", 3, 21, "<Link"]],
  "local-button.tsx": [],
  "odd-button-001.bad.tsx": [
    ["ODD-BUTTON-001", 4, 11, "className"],
    ["ODD-BUTTON-001", 5, 10, "className"],
  ],
  "odd-button-004.bad.tsx": [
    ["ODD-BUTTON-004", 4, 36, 'data-icon-only="false"'],
    ["ODD-BUTTON-004", 5, 36, "data-icon-only={false}"],
    ["ODD-BUTTON-004", 6, 36, 'data-icon-only="false"'],
  ],
  "odd-button-008.bad.tsx": [
    ["ODD-BUTTON-008", 4, 5, "<button"],
    ["ODD-BUTTON-008", 5, 5, "<button"],
  ],
  "odd-button-014.bad.tsx": [
    ["ODD-BUTTON-014", 4, 5, "<button"],
    ["ODD-BUTTON-014", 5, 5, "<button"],
  ],
  "odd-button-015.bad.tsx": [
    ["ODD-BUTTON-015", 4, 36, "data-tone"],
    ["ODD-BUTTON-015", 5, 36, "data-varient"],
  ],
  "radix.tsx": [],
  "raw.bad.tsx": [
    ["ODD-BUTTON-001", 4, 11, "className"],
    ["ODD-BUTTON-002", 5, 36, "data-variant"],
    ["ODD-BUTTON-003", 6, 36, "data-size"],
    ["ODD-BUTTON-004", 7, 36, "data-icon-only"],
    ["ODD-BUTTON-005", 8, 36, "aria-disabled"],
    ["ODD-BUTTON-006", 9, 36, "aria-busy"],
    ["ODD-BUTTON-007", 10, 36, "disabled"],
    ["ODD-BUTTON-008", 11, 5, "<button"],
    ["ODD-BUTTON-009", 12, 5, "<a"],
    ["ODD-BUTTON-010", 13, 36, "href"],
    ["ODD-BUTTON-011", 14, 44, "aria-current"],
    ["ODD-BUTTON-012", 15, 36, "aria-current"],
    ["ODD-BUTTON-013", 16, 44, "aria-disabled"],
    ["ODD-BUTTON-014", 17, 5, "<button"],
    ["ODD-BUTTON-015", 18, 36, "data-tone"],
    ["ODD-CLASS-001", 19, 10, "className"],
  ],
  "wrapper-data.tsx": [["ODD-BUTTON-002", 8, 36, 'data-variant="nope"']],
  "wrapper-href.tsx": [
    ["ODD-STATIC-001", 5, 5, "<Button href={url}"],
    ["ODD-STATIC-001", 6, 5, "<Button href={url}"],
    ["ODD-BUTTON-013", 8, 26, "aria-disabled"],
  ],
  "wrapper.bad.tsx": [
    ["ODD-BUTTON-007", 6, 13, "disabled"],
    ["ODD-BUTTON-007", 7, 16, "disabled"],
    ["ODD-BUTTON-008", 8, 5, "<Button iconOnly>"],
    ["ODD-BUTTON-013", 9, 22, "aria-disabled"],
    ["ODD-BUTTON-002", 10, 13, 'variant="outline"'],
    ["ODD-BUTTON-003", 11, 13, 'size="md"'],
  ],
  "wrapper.good.tsx": [],
};

const fixtures = readdirSync(folder)
  .filter((name) => name.endsWith(".tsx"))
  .sort();

test("every jsx fixture has a case", () => {
  expect(fixtures).toEqual(Object.keys(places).sort());
});

for (const name of fixtures) {
  test(`${name} reports its expected codes at their places`, () => {
    const source = readFileSync(`${folder}/${name}`, "utf8");
    const messages = linter.verify(source, flat, { filename: `${folder}/${name}` });
    const located = places[name] ?? [];
    expect(messages.map((message) => codeOf(message.message))).toEqual(expectedCodes(source, /^\/\/ expect: (.+)/));
    expect(messages.map((message) => [codeOf(message.message), message.line, message.column, message.ruleId, message.severity])).toEqual(
      located.map(([code, line, column]) =>
        code === "ODD-STATIC-001" ? [code, line, column, "odd/usage-incomplete", 1] : [code, line, column, "odd/usage", 2],
      ),
    );
    for (const [index, message] of messages.entries()) {
      expect(lineText(source, message.line).slice(message.column - 1).startsWith(located[index]?.[3] ?? "")).toBe(true);
    }
  });
}

test("each jsx twin reports the codes of its html fixture", () => {
  const twins = fixtures.filter((name) => name.startsWith("odd-"));
  expect(twins).toEqual(["odd-button-001.bad.tsx", "odd-button-004.bad.tsx", "odd-button-008.bad.tsx", "odd-button-014.bad.tsx", "odd-button-015.bad.tsx"]);
  for (const name of twins) {
    const html = readFileSync(`tests/fixtures/usage/${name.replace(".tsx", ".html")}`, "utf8");
    const messages = linter.verify(readFileSync(`${folder}/${name}`, "utf8"), flat, { filename: `${folder}/${name}` });
    expect(messages.map((message) => codeOf(message.message)), name).toEqual(expectedCodes(html, /^<!-- expect: (.+) -->/));
  }
});
