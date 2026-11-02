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

function expectedCodes(source: string): string[] {
  const match = /^\/\/ expect: (.+)/.exec(source);
  if (match === null || match[1] === undefined) throw new Error("fixture has no expect line");
  return match[1] === "none" ? [] : match[1].split(" ");
}

function lint(name: string, filename = `${folder}/${name}`): Linter.LintMessage[] {
  return linter.verify(readFileSync(`${folder}/${name}`, "utf8"), flat, { filename });
}

const REACT_003 =
  "ODD-REACT-003: an odd- class in JSX hand-writes markup that odd-design/react renders, without the roles, ids, and wiring the component owns. Allowed values: odd-design/react components. Fix: remove the class, and render the component this message names. docs/usage/react.md#odd-react-003";

const places: Record<string, readonly (readonly [string, number, number, string])[]> = {
  "class-expressions.tsx": [
    ["ODD-REACT-003", 5, 11, "className={`odd-badge"],
    ["ODD-REACT-003", 6, 14, "className={clsx("],
    ["ODD-REACT-003", 7, 8, "className={clsx({"],
    ["ODD-REACT-003", 8, 10, 'class="odd-kbd"'],
    ["ODD-REACT-003", 9, 9, 'className={"odd-separator"}'],
  ],
  "odd-react-003.bad.tsx": [["ODD-REACT-003", 2, 43, 'className="odd-button"']],
  "odd-react-003.good.tsx": [],
  "plain.tsx": [],
  "third-party.tsx": [["ODD-REACT-003", 3, 27, 'className="odd-link"']],
  "unowned.tsx": [
    ["ODD-REACT-003", 4, 10, 'className="odd-stack"'],
    ["ODD-REACT-003", 5, 9, 'className="odd-toast"'],
    ["ODD-CLASS-001", 6, 10, 'className="odd-stak"'],
  ],
};

const fixtures = readdirSync(folder)
  .filter((name) => name.endsWith(".tsx"))
  .sort();

test("every fixture has its places", () => {
  expect(fixtures).toEqual(Object.keys(places).sort());
});

for (const name of fixtures) {
  test(`${name} reports its expected codes at their places`, () => {
    const source = readFileSync(`${folder}/${name}`, "utf8");
    const messages = lint(name);
    const located = places[name] ?? [];
    expect(messages.map((message) => codeOf(message.message))).toEqual(expectedCodes(source));
    expect(messages.map((message) => [codeOf(message.message), message.line, message.column, message.ruleId, message.severity])).toEqual(
      located.map(([code, line, column]) => [code, line, column, "odd/usage", 2]),
    );
    for (const [index, message] of messages.entries()) {
      expect(lineText(source, message.line).slice(message.column - 1).startsWith(located[index]?.[3] ?? "")).toBe(true);
    }
  });
}

test("odd-button on a button names Button as the fix", () => {
  expect(lint("odd-react-003.bad.tsx").map((message) => message.message)).toEqual([`${REACT_003} Found odd-button. Render Button from odd-design/react.`]);
});

test("odd-link on a router link names TextLink as the fix", () => {
  expect(lint("third-party.tsx").map((message) => message.message)).toEqual([`${REACT_003} Found odd-link. Render TextLink from odd-design/react.`]);
});

test("a class no export renders says so, a toast class names toast(), and an unknown class is ODD-CLASS-001", () => {
  expect(lint("unowned.tsx").map((message) => message.message)).toEqual([
    `${REACT_003} Found odd-stack. No odd-design/react component renders it yet.`,
    `${REACT_003} Found odd-toast. Use toast() from odd-design/enhance.`,
    "ODD-CLASS-001: this class is not in the registry. Allowed values: the registered odd- classes. Fix: use a registered class, or remove the class. docs/usage/general.md#odd-class-001 Found odd-stak.",
  ]);
});

test("the components under src/react write odd- classes without a finding", () => {
  expect(lint("odd-react-003.bad.tsx", "src/react/button.tsx")).toEqual([]);
});

test("odd/usage-incomplete has no JSX findings", () => {
  const source = readFileSync(`${folder}/class-expressions.tsx`, "utf8");
  const incomplete = flat.map((entry) => ("rules" in entry && entry.rules !== undefined && "odd/usage" in entry.rules ? { ...entry, rules: { "odd/usage-incomplete": "warn" as const } } : entry));
  expect(linter.verify(source, incomplete, { filename: `${folder}/class-expressions.tsx` })).toEqual([]);
});
