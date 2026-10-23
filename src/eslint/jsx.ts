import type { Rule, Scope } from "eslint";
import { checkUsage, type Computed, type Diagnostic, type UsageAttribute, type UsageNode } from "../js/usage/check.ts";
import { selected, type HtmlReport } from "./html.ts";

type Loc = { start: { line: number; column: number }; end: { line: number; column: number } };

type Expression = { type: string; name?: string; value?: unknown; expressions?: readonly unknown[]; quasis?: readonly { value: { cooked: string | null } }[] };

type JsxIdentifier = { type: "JSXIdentifier"; name: string };

type JsxNamespacedName = { type: "JSXNamespacedName"; namespace: JsxIdentifier; name: JsxIdentifier };

type JsxContainer = { type: "JSXExpressionContainer"; expression: Expression };

type AttributeValue = JsxContainer | { type: "Literal"; value: string } | { type: "JSXElement" | "JSXFragment" };

type JsxAttribute =
  | { type: "JSXAttribute"; name: JsxIdentifier | JsxNamespacedName; value: AttributeValue | null; loc: Loc }
  | { type: "JSXSpreadAttribute"; loc: Loc };

type JsxElement = {
  type: "JSXElement";
  openingElement: { name: JsxIdentifier | JsxNamespacedName | { type: "JSXMemberExpression" }; attributes: readonly JsxAttribute[]; loc: Loc };
  children: readonly JsxChild[];
};

type JsxChild =
  | JsxElement
  | JsxContainer
  | { type: "JSXText"; value: string }
  | { type: "JSXFragment"; children: readonly JsxChild[] }
  | { type: "JSXSpreadChild" };

type ElementKind = { kind: "intrinsic"; tag: string } | { kind: "wrapper" } | { kind: "component" };

type Spans = Map<UsageAttribute | Computed, Loc>;

const BUTTON_MODULE = "odd-design/react";

const domNames: Readonly<Record<string, string | null>> = { className: "class", children: null };

const wrapperNames: Readonly<Record<string, string | null>> = {
  ...domNames,
  variant: "data-variant",
  size: "data-size",
  iconOnly: "data-icon-only",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function words(text: string): string[] {
  return text.split(/\s+/).filter((word) => word !== "");
}

function literalWords(node: unknown): string[] {
  if (Array.isArray(node)) return node.flatMap(literalWords);
  if (!isRecord(node)) return [];
  if (node.type === "Literal") return typeof node.value === "string" ? words(node.value) : [];
  if (node.type === "TemplateElement" && isRecord(node.value)) return typeof node.value.cooked === "string" ? words(node.value.cooked) : [];
  return Object.entries(node).flatMap(([key, child]) => (key === "parent" ? [] : literalWords(child)));
}

function importedName(definition: Scope.Definition): string | undefined {
  if (definition.type !== "ImportBinding" || definition.node.type !== "ImportSpecifier") return undefined;
  if (definition.parent.source.value !== BUTTON_MODULE) return undefined;
  const imported = definition.node.imported;
  return imported.type === "Identifier" ? imported.name : String(imported.value);
}

function isButtonImport(name: string, scope: Scope.Scope | null): boolean {
  for (let current = scope; current !== null; current = current.upper) {
    const variable = current.set.get(name);
    if (variable !== undefined) return variable.defs.some((definition) => importedName(definition) === "Button");
  }
  return false;
}

function classify(element: JsxElement, context: Rule.RuleContext): ElementKind {
  const name = element.openingElement.name;
  if (name.type !== "JSXIdentifier") return { kind: "component" };
  if (/^[a-z]/.test(name.name)) return { kind: "intrinsic", tag: name.name };
  const scope = context.sourceCode.getScope(element as unknown as Rule.Node);
  return isButtonImport(name.name, scope) ? { kind: "wrapper" } : { kind: "component" };
}

function attributeName(name: JsxIdentifier | JsxNamespacedName): string {
  return name.type === "JSXIdentifier" ? name.name : `${name.namespace.name}:${name.name.name}`;
}

function booleanValue(name: string, value: boolean): string | undefined {
  if (name.startsWith("data-") || name.startsWith("aria-")) return String(value);
  return value ? "" : undefined;
}

function staticValue(name: string, expression: Expression): string | Computed | undefined {
  switch (expression.type) {
    case "Literal": {
      const value = expression.value;
      if (typeof value === "string" || typeof value === "number") return String(value);
      if (typeof value === "boolean") return booleanValue(name, value);
      return value === null ? undefined : { computed: [] };
    }
    case "Identifier":
      return expression.name === "undefined" ? undefined : { computed: [] };
    case "TemplateLiteral": {
      const cooked = expression.quasis?.[0]?.value.cooked;
      return expression.expressions?.length === 0 && typeof cooked === "string" ? cooked : { computed: [] };
    }
    default:
      return { computed: [] };
  }
}

function readValue(source: string, value: AttributeValue | null, isClass: boolean): string | Computed | undefined {
  if (value === null) return "";
  switch (value.type) {
    case "Literal":
      return value.value;
    case "JSXExpressionContainer": {
      const read = staticValue(source, value.expression);
      return isClass && typeof read === "object" ? { computed: literalWords(value.expression) } : read;
    }
    default:
      return { computed: [] };
  }
}

function readAttributes(element: JsxElement, names: Readonly<Record<string, string | null>>, spans: Spans): (UsageAttribute | Computed)[] {
  return element.openingElement.attributes.flatMap((attribute): (UsageAttribute | Computed)[] => {
    if (attribute.type === "JSXSpreadAttribute") {
      const spread: Computed = { computed: [] };
      spans.set(spread, attribute.loc);
      return [spread];
    }
    const source = attributeName(attribute.name);
    const name = Object.hasOwn(names, source) ? names[source] : source;
    if (name === null) return [];
    const value = readValue(source, attribute.value, name === "class");
    if (value === undefined) return [];
    const usage: UsageAttribute = { name, value };
    spans.set(usage, attribute.loc);
    return [usage];
  });
}

function withButtonClass(attributes: readonly (UsageAttribute | Computed)[], spans: Spans): (UsageAttribute | Computed)[] {
  const index = attributes.findIndex((attribute) => "name" in attribute && attribute.name === "class");
  const given = index === -1 ? undefined : attributes[index];
  if (given === undefined || !("name" in given)) return [...attributes, { name: "class", value: "odd-button" }];
  const value = typeof given.value === "string" ? `odd-button ${given.value}` : { computed: ["odd-button", ...given.value.computed] };
  const merged: UsageAttribute = { name: "class", value };
  const loc = spans.get(given);
  if (loc !== undefined) spans.set(merged, loc);
  return attributes.with(index, merged);
}

function readChildren(children: readonly JsxChild[], context: Rule.RuleContext): UsageNode["children"] {
  return children.flatMap((child): UsageNode["children"] => {
    switch (child.type) {
      case "JSXText":
        return [child.value];
      case "JSXFragment":
        return readChildren(child.children, context);
      case "JSXElement": {
        const { usage } = readElement(child, context);
        return typeof usage.tag === "string" ? [usage] : [{ computed: [] }];
      }
      case "JSXExpressionContainer": {
        if (child.expression.type === "JSXEmptyExpression") return [];
        const value = staticValue("", child.expression);
        return value === undefined || value === "" ? [] : [value];
      }
      case "JSXSpreadChild":
        return [{ computed: [] }];
    }
  });
}

function childrenProp(element: JsxElement): UsageNode["children"] {
  for (const attribute of element.openingElement.attributes) {
    if (attribute.type !== "JSXAttribute" || attributeName(attribute.name) !== "children") continue;
    const value = readValue("children", attribute.value, false);
    return value === undefined || value === "" ? [] : [value];
  }
  return [];
}

function wrapperTag(attributes: readonly (UsageAttribute | Computed)[]): string | Computed {
  const href = attributes.find((attribute): attribute is UsageAttribute => "name" in attribute && attribute.name === "href");
  if (href === undefined) return "button";
  return typeof href.value === "string" ? "a" : { computed: [] };
}

function readElement(element: JsxElement, context: Rule.RuleContext): { usage: UsageNode; spans: Spans } {
  const spans: Spans = new Map();
  const kind = classify(element, context);
  const children = element.children.length === 0 ? childrenProp(element) : readChildren(element.children, context);
  switch (kind.kind) {
    case "intrinsic":
      return { usage: { tag: kind.tag, attributes: readAttributes(element, domNames, spans), children }, spans };
    case "wrapper": {
      const attributes = withButtonClass(readAttributes(element, wrapperNames, spans), spans);
      return { usage: { tag: wrapperTag(attributes), attributes, children }, spans };
    }
    case "component":
      return { usage: { tag: { computed: [] }, attributes: readAttributes(element, domNames, spans), children }, spans };
  }
}

function reportDiagnostic(context: Rule.RuleContext, diagnostic: Diagnostic, spans: Spans, fallback: Loc): void {
  const loc = (diagnostic.attribute === undefined ? undefined : spans.get(diagnostic.attribute)) ?? fallback;
  context.report({ loc, message: diagnostic.message });
}

export function jsxVisitors(context: Rule.RuleContext, report: HtmlReport): Rule.RuleListener {
  return {
    JSXElement(node: Rule.Node) {
      const element = node as unknown as JsxElement;
      const { usage, spans } = readElement(element, context);
      for (const diagnostic of checkUsage(usage)) {
        if (selected(report, diagnostic.code)) reportDiagnostic(context, diagnostic, spans, element.openingElement.loc);
      }
    },
  };
}
