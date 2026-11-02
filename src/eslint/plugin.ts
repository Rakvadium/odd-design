import type { Rule } from "eslint";
import { message } from "../js/usage/format.ts";
import { htmlVisitors, type HtmlReport } from "./html.ts";
import { jsxVisitors } from "./jsx.ts";

const disablePattern = /^\s*eslint-disable(?:-next-line|-line)?\b([\s\S]*)$/;

function missingOddReason(value: string): boolean {
  const match = disablePattern.exec(value);
  if (match === null) return false;
  const rest = match[1] ?? "";
  const mark = rest.indexOf("--");
  const rules = (mark === -1 ? rest : rest.slice(0, mark)).split(/[\s,]+/).filter((rule) => rule !== "");
  const reason = mark === -1 ? "" : rest.slice(mark + 2).trim();
  return reason === "" && rules.some((rule) => rule.startsWith("odd/"));
}

function usageRule(report: HtmlReport): Rule.RuleModule {
  const description = descriptionFor(report);
  return {
    meta: {
      type: "problem",
      docs: { description },
      schema: [],
    },
    create(context) {
      return report === "usage" ? { ...htmlVisitors(context, report), ...jsxVisitors(context) } : htmlVisitors(context, report);
    },
  };
}

function descriptionFor(report: HtmlReport): string {
  switch (report) {
    case "usage":
      return "Report odd markup that breaks the usage contract.";
    case "incomplete":
      return "Warn when a value is not static, so the usage contract cannot read it.";
    default: {
      const unreachable: never = report;
      return unreachable;
    }
  }
}

const disableReason: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: "Require a written reason on an odd disable comment." },
    schema: [],
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (!missingOddReason(comment.value) || comment.loc == null) continue;
          context.report({ loc: comment.loc, message: message("ODD-STATIC-003") });
        }
      },
    };
  },
};

const plugin = {
  meta: {
    name: "odd",
    version: "0.0.0",
  },
  rules: {
    usage: usageRule("usage"),
    "usage-incomplete": usageRule("incomplete"),
    "disable-reason": disableReason,
  },
};

export default plugin;
