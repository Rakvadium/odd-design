import type { Rule } from "eslint";
import { CLASSES, type ExportName } from "../js/usage/contract.ts";
import { message } from "../js/usage/format.ts";

type Loc = { start: { line: number; column: number }; end: { line: number; column: number } };

type JsxAttribute = { type: "JSXAttribute"; name: { type: string; name: unknown }; value: unknown; loc: Loc };

const owners: Readonly<Record<string, { readonly by: readonly ExportName[]; readonly via?: string }>> = CLASSES;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function words(text: string): string[] {
  return text.split(/\s+/).filter((word) => word !== "");
}

/** Every string literal in the value: "a", {"a"}, {`a ${b}`}, {cx("a", on && "b")}, {clsx({ a: on })}. */
function literalWords(node: unknown): string[] {
  if (Array.isArray(node)) return node.flatMap(literalWords);
  if (!isRecord(node)) return [];
  if (node.type === "Literal") return typeof node.value === "string" ? words(node.value) : [];
  if (node.type === "TemplateElement" && isRecord(node.value)) return typeof node.value.cooked === "string" ? words(node.value.cooked) : [];
  return Object.entries(node).flatMap(([key, child]) => (key === "parent" ? [] : literalWords(child)));
}

function either(names: readonly string[]): string {
  return names.length < 3 ? names.join(" or ") : `${names.slice(0, -1).join(", ")}, or ${names.at(-1)}`;
}

function report(className: string): string {
  const owner = owners[className];
  if (owner === undefined) return message("ODD-CLASS-001", { found: className });
  const base = message("ODD-REACT-003", { found: className });
  if (owner.by.length > 0) return `${base} Render ${either(owner.by)} from odd-design/react.`;
  if (owner.via !== undefined) return `${base} Use ${owner.via}.`;
  return `${base} No odd-design/react component renders it yet.`;
}

/**
 * Reports each odd- word in a JSX className or class, on any element. ESLint does not model what a
 * component renders: TypeScript checks its props, and the runtime checker checks its markup.
 */
export function jsxVisitors(context: Rule.RuleContext): Rule.RuleListener {
  return {
    JSXAttribute(node: Rule.Node) {
      const attribute = node as unknown as JsxAttribute;
      if (attribute.name.name !== "className" && attribute.name.name !== "class") return;
      for (const word of literalWords(attribute.value)) {
        if (word.startsWith("odd-")) context.report({ loc: attribute.loc, message: report(word) });
      }
    },
  };
}
