import { readdirSync, readFileSync } from "node:fs";
import { expect, test } from "bun:test";
import { Linter } from "eslint";
import config from "../eslint.config.js";

const linter = new Linter({ configType: "flat" });
const flat = [...config, { ignores: ["!tests/fixtures/**"] }];

type Report = { ruleId: string | null; severity: number; line: number; column: number; message: string };

function lint(filename: string, code = readFileSync(filename, "utf8")): Report[] {
  return linter.verify(code, flat, { filename }).map((message) => ({
    ruleId: message.ruleId,
    severity: message.severity,
    line: message.line,
    column: message.column,
    message: message.message,
  }));
}

function codeOf(message: string): string {
  return message.slice(0, message.indexOf(":"));
}

function lineText(source: string, line: number): string {
  return source.split(/\r?\n/)[line - 1] ?? "";
}

function expectedCodes(html: string): string[] {
  const match = /^<!-- expect: (.+) -->/.exec(html);
  if (match === null || match[1] === undefined) throw new Error("fixture has no expect line");
  return match[1] === "none" ? [] : match[1].split(" ");
}

const places: Record<string, readonly (readonly [string, number, number, string])[]> = {
  "odd-button-001.bad.html": [
    ["ODD-BUTTON-001", 2, 7, "class"],
    ["ODD-BUTTON-001", 3, 6, "class"],
  ],
  "odd-button-002.bad.html": [
    ["ODD-BUTTON-002", 2, 28, "data-variant"],
    ["ODD-BUTTON-002", 3, 28, "data-variant"],
    ["ODD-BUTTON-002", 4, 28, "data-variant"],
    ["ODD-BUTTON-002", 5, 28, "data-variant"],
  ],
  "odd-button-003.bad.html": [
    ["ODD-BUTTON-003", 2, 28, "data-size"],
    ["ODD-BUTTON-003", 3, 28, "data-size"],
    ["ODD-BUTTON-003", 4, 28, "data-size"],
  ],
  "odd-button-004.bad.html": [
    ["ODD-BUTTON-004", 2, 28, "data-icon-only"],
    ["ODD-BUTTON-004", 3, 28, "data-icon-only"],
    ["ODD-BUTTON-004", 4, 28, "data-icon-only"],
  ],
  "odd-button-005.bad.html": [
    ["ODD-BUTTON-005", 2, 28, "aria-disabled"],
    ["ODD-BUTTON-005", 3, 28, "aria-disabled"],
  ],
  "odd-button-006.bad.html": [["ODD-BUTTON-006", 2, 28, "aria-busy"]],
  "odd-button-007.bad.html": [["ODD-BUTTON-007", 2, 28, "disabled"]],
  "odd-button-008.bad.html": [
    ["ODD-BUTTON-008", 2, 1, "<button"],
    ["ODD-BUTTON-008", 3, 1, "<button"],
  ],
  "odd-button-009.bad.html": [["ODD-BUTTON-009", 2, 1, "<a"]],
  "odd-button-010.bad.html": [["ODD-BUTTON-010", 2, 28, "href"]],
  "odd-button-011.bad.html": [["ODD-BUTTON-011", 2, 36, "aria-current"]],
  "odd-button-012.bad.html": [["ODD-BUTTON-012", 2, 28, "aria-current"]],
  "odd-button-013.bad.html": [["ODD-BUTTON-013", 2, 36, "aria-disabled"]],
  "odd-button-014.bad.html": [
    ["ODD-BUTTON-014", 2, 1, "<button"],
    ["ODD-BUTTON-014", 3, 1, "<button"],
  ],
  "odd-button-015.bad.html": [
    ["ODD-BUTTON-015", 2, 28, "data-tone"],
    ["ODD-BUTTON-015", 3, 28, "data-varient"],
  ],
  "odd-class-001.bad.html": [
    ["ODD-CLASS-001", 2, 6, "class"],
    ["ODD-CLASS-001", 3, 4, "class"],
  ],
};

test("html fixtures report each expected code on its attribute", () => {
  const names = readdirSync("tests/fixtures/usage").filter((name) => name.endsWith(".html")).sort();
  for (const name of names) {
    const source = readFileSync(`tests/fixtures/usage/${name}`, "utf8");
    const messages = lint(`tests/fixtures/usage/${name}`, source);
    expect(messages.map((message) => codeOf(message.message)), name).toEqual(expectedCodes(source));
    const located = places[name];
    if (located === undefined) {
      expect(messages, name).toEqual([]);
      continue;
    }
    expect(
      messages.map((message) => [codeOf(message.message), message.line, message.column, message.ruleId, message.severity]),
      name,
    ).toEqual(located.map(([code, line, column]) => [code, line, column, "odd/usage", 2]));
    for (const [index, message] of messages.entries()) {
      const at = located[index]?.[3];
      expect(lineText(source, message.line).slice(message.column - 1).startsWith(at ?? ""), `${name} ${message.line}`).toBe(true);
    }
  }
});

test("a marked template reports disabled on the attribute", () => {
  const source = readFileSync("tests/fixtures/usage/templates/marked.ts", "utf8");
  const messages = lint("tests/fixtures/usage/templates/marked.ts", source);
  expect(messages.map((message) => [codeOf(message.message), message.line, message.column, message.ruleId])).toEqual([
    ["ODD-BUTTON-007", 1, 62, "odd/usage"],
  ]);
  expect(lineText(source, 1).slice(61, 69)).toBe("disabled");
});

test("a tagged template reports disabled on the attribute", () => {
  const source = readFileSync("tests/fixtures/usage/templates/tagged.ts", "utf8");
  const messages = lint("tests/fixtures/usage/templates/tagged.ts", source);
  expect(messages.map((message) => [codeOf(message.message), message.line, message.column, message.ruleId])).toEqual([
    ["ODD-BUTTON-007", 1, 55, "odd/usage"],
  ]);
  expect(lineText(source, 1).slice(54, 62)).toBe("disabled");
});

test("a computed class still reports the static disabled attribute", () => {
  const source = readFileSync("tests/fixtures/usage/templates/partial.ts", "utf8");
  const messages = lint("tests/fixtures/usage/templates/partial.ts", source);
  expect(messages.map((message) => [codeOf(message.message), message.line, message.column, message.ruleId, message.severity])).toEqual([
    ["ODD-STATIC-001", 1, 44, "odd/usage-incomplete", 1],
    ["ODD-BUTTON-007", 1, 72, "odd/usage", 2],
  ]);
  expect(lineText(source, 1).slice(43, 48)).toBe("class");
  expect(lineText(source, 1).slice(71, 79)).toBe("disabled");
});

test("an unmarked template reports ODD-STATIC-002 and skips the button rules", () => {
  const source = readFileSync("tests/fixtures/usage/templates/bare.ts", "utf8");
  const messages = lint("tests/fixtures/usage/templates/bare.ts", source);
  expect(messages.map((message) => [codeOf(message.message), message.line, message.column, message.ruleId])).toEqual([
    ["ODD-STATIC-002", 1, 21, "odd/usage"],
  ]);
  expect(lineText(source, 1)[20]).toBe("`");
});

test("an odd disable without a reason reports ODD-STATIC-003", () => {
  const source = readFileSync("tests/fixtures/usage/templates/disable.ts", "utf8");
  const messages = lint("tests/fixtures/usage/templates/disable.ts", source);
  expect(messages.map((message) => [codeOf(message.message), message.line, message.column, message.ruleId])).toEqual([
    ["ODD-STATIC-003", 1, 1, "odd/disable-reason"],
  ]);
  expect(lineText(source, 1).startsWith("// eslint-disable-next-line odd/usage")).toBe(true);
  expect(source.includes("-- the markup is third-party")).toBe(true);
});

test("a misspelled odd-buton suggests odd-button", () => {
  const source = `<button class="odd-buton">Save</button>\n`;
  const messages = lint("typo.html", source);
  expect(messages.map((message) => [codeOf(message.message), message.line, message.column])).toEqual([["ODD-CLASS-001", 1, 9]]);
  expect(messages[0]?.message.includes("Did you mean odd-button?")).toBe(true);
  expect(lineText(source, 1).slice(8, 13)).toBe("class");
});

test("the Playground reports incomplete only on its computed attributes", () => {
  const files = readdirSync("stories").filter((name) => name.endsWith(".ts")).sort();
  const found = files.flatMap((name) => lint(`stories/${name}`).map((message) => ({ file: name, ...message, code: codeOf(message.message) })));
  expect(found.map((message) => [message.file, message.code, message.line, message.column, message.ruleId, message.severity])).toEqual([
    ["Button.stories.ts", "ODD-STATIC-001", 14, 5, "odd/usage-incomplete", 1],
    ["Button.stories.ts", "ODD-STATIC-001", 15, 5, "odd/usage-incomplete", 1],
    ["Button.stories.ts", "ODD-STATIC-001", 16, 5, "odd/usage-incomplete", 1],
    ["Button.stories.ts", "ODD-STATIC-001", 17, 5, "odd/usage-incomplete", 1],
  ]);
  const source = readFileSync("stories/Button.stories.ts", "utf8");
  for (const line of [14, 15, 16, 17]) expect(lineText(source, line).slice(4, 6)).toBe("${");
});
