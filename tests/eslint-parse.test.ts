import { readFileSync } from "node:fs";
import { expect, test } from "bun:test";
import { Linter, type Rule } from "eslint";
import config from "../eslint.config.js";

const reportDisabled: Rule.RuleModule = {
  create(context) {
    return {
      "JSXAttribute[name.name='disabled']"(node: Rule.Node) {
        context.report({ node, message: "JSX attribute disabled" });
      },
    };
  },
};

test("babel parser reports the disabled attribute on its line", () => {
  const code = readFileSync(new URL("./fixtures/parse.tsx", import.meta.url), "utf8");
  const messages = new Linter({ configType: "flat" }).verify(
    code,
    [
      ...config,
      { ignores: ["!tests/fixtures/**"] },
      {
        files: ["**/*.tsx"],
        plugins: {
          throwaway: {
            rules: {
              "report-disabled": reportDisabled,
            },
          },
        },
        rules: {
          "throwaway/report-disabled": "error",
        },
      },
    ],
    { filename: "tests/fixtures/parse.tsx" },
  );
  expect(messages.map((message) => ({ message: message.message, line: message.line }))).toEqual([
    { message: "JSX attribute disabled", line: 6 },
  ]);
});
