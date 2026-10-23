import { readFileSync } from "node:fs";
import { expect, test } from "bun:test";
import { Linter, type Rule } from "eslint";

const configSpecifier: string = "../eslint.config.js";

function isConfigModule(value: unknown): value is { default: Linter.Config[] } {
  return typeof value === "object" && value !== null && "default" in value && Array.isArray(value.default);
}

const loaded: unknown = await import(configSpecifier);
if (!isConfigModule(loaded)) throw new Error("eslint config did not load");
const config = loaded.default;

type JsxIdentifier = { type: "JSXIdentifier"; name: string };

function jsxIdentifier(value: unknown): value is JsxIdentifier {
  if (typeof value !== "object" || value === null) return false;
  if (!("type" in value) || !("name" in value)) return false;
  return value.type === "JSXIdentifier" && typeof value.name === "string";
}

const reportDisabled: Rule.RuleModule = {
  create(context) {
    return {
      JSXAttribute(node: Rule.Node) {
        const name: unknown = "name" in node ? node.name : undefined;
        if (!jsxIdentifier(name) || name.name !== "disabled") return;
        context.report({ node, message: "JSX attribute disabled" });
      },
    };
  },
};

test("babel parser reports the disabled attribute on its line", () => {
  const code = readFileSync(new URL("./fixtures/parse.tsx", import.meta.url), "utf8");
  const block = config.find((item) => item.languageOptions?.parser);
  if (!block?.languageOptions) throw new Error("eslint config has no parser");
  const messages = new Linter({ configType: "flat" }).verify(
    code,
    [
      {
        files: ["**/*.tsx"],
        languageOptions: block.languageOptions,
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
