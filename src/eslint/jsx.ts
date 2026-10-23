import type { Rule, Scope } from "eslint";
import { checkUsage, type Computed, type Diagnostic, type UsageAttribute, type UsageNode } from "../js/usage/check.ts";
import { WRAPPERS, type Wrapper, type WrapperElement } from "../js/usage/contract.ts";
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

type ElementKind = { kind: "intrinsic"; tag: string } | { kind: "wrapper"; wrapper: Wrapper } | { kind: "component" };

type Spans = Map<UsageAttribute | Computed, Loc>;

type Renders = readonly [UsageNode, ...UsageNode[]];

const wrappers: Readonly<Record<string, Wrapper>> = WRAPPERS;

const domNames: Readonly<Record<string, string | null>> = { className: "class", children: null };

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

function wrapperOf(definition: Scope.Definition): Wrapper | undefined {
  if (definition.type !== "ImportBinding" || definition.node.type !== "ImportSpecifier") return undefined;
  const imported = definition.node.imported;
  const name = imported.type === "Identifier" ? imported.name : String(imported.value);
  const wrapper = Object.hasOwn(wrappers, name) ? wrappers[name] : undefined;
  return wrapper?.source === definition.parent.source.value ? wrapper : undefined;
}

function importedWrapper(name: string, scope: Scope.Scope | null): Wrapper | undefined {
  for (let current = scope; current !== null; current = current.upper) {
    const variable = current.set.get(name);
    if (variable !== undefined) return variable.defs.map(wrapperOf).find((wrapper) => wrapper !== undefined);
  }
  return undefined;
}

function classify(element: JsxElement, context: Rule.RuleContext): ElementKind {
  const name = element.openingElement.name;
  if (name.type !== "JSXIdentifier") return { kind: "component" };
  if (/^[a-z]/.test(name.name)) return { kind: "intrinsic", tag: name.name };
  const scope = context.sourceCode.getScope(element as unknown as Rule.Node);
  const wrapper = importedWrapper(name.name, scope);
  return wrapper === undefined ? { kind: "component" } : { kind: "wrapper", wrapper };
}

function wrapperNames(wrapper: Wrapper): Readonly<Record<string, string | null>> {
  const written = Object.fromEntries(Object.values(wrapper.props).map((name) => [name, null]));
  return { ...domNames, ...written, ...wrapper.props };
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

function withClass(attributes: readonly (UsageAttribute | Computed)[], className: string, spans: Spans): (UsageAttribute | Computed)[] {
  const index = attributes.findIndex((attribute) => "name" in attribute && attribute.name === "class");
  const given = index === -1 ? undefined : attributes[index];
  if (given === undefined || !("name" in given)) return [...attributes, { name: "class", value: className }];
  const value = typeof given.value === "string" ? `${className} ${given.value}` : { computed: [className, ...given.value.computed] };
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
        const usage = oneNode(readElement(child, context).renders);
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

function renderings(element: WrapperElement, attributes: readonly (UsageAttribute | Computed)[], children: UsageNode["children"]): Renders {
  if (typeof element === "string") return [{ tag: element, attributes, children }];
  const chosen = attributes.find((attribute): attribute is UsageAttribute => "name" in attribute && attribute.name === element.attribute);
  const absent: UsageNode = { tag: element.absent, attributes: attributes.filter((attribute) => attribute !== chosen), children };
  if (chosen === undefined) return [absent];
  const present: UsageNode = { tag: element.present, attributes, children };
  return typeof chosen.value === "string" ? [present] : [present, absent];
}

function oneNode(renders: Renders): UsageNode {
  return renders.length === 1 ? renders[0] : { ...renders[0], tag: { computed: [] } };
}

function readElement(element: JsxElement, context: Rule.RuleContext): { renders: Renders; spans: Spans } {
  const spans: Spans = new Map();
  const kind = classify(element, context);
  const children = element.children.length === 0 ? childrenProp(element) : readChildren(element.children, context);
  switch (kind.kind) {
    case "intrinsic":
      return { renders: [{ tag: kind.tag, attributes: readAttributes(element, domNames, spans), children }], spans };
    case "wrapper": {
      const { wrapper } = kind;
      const attributes = withClass(readAttributes(element, wrapperNames(wrapper), spans), wrapper.className, spans);
      return { renders: renderings(wrapper.element, attributes, children), spans };
    }
    case "component":
      return { renders: [{ tag: { computed: [] }, attributes: readAttributes(element, domNames, spans), children }], spans };
  }
}

function same(a: Diagnostic, b: Diagnostic): boolean {
  return a.code === b.code && a.attribute === b.attribute && a.message === b.message;
}

function findings(renders: Renders): Diagnostic[] {
  const [first = [], ...rest] = renders.map((node) => checkUsage(node));
  const agreed = first.filter((diagnostic) => rest.every((run) => run.some((other) => same(diagnostic, other))));
  const unknown = checkUsage(oneNode(renders)).filter((diagnostic) => !agreed.some((other) => same(diagnostic, other)));
  return [...agreed, ...unknown];
}

function reportDiagnostic(context: Rule.RuleContext, diagnostic: Diagnostic, spans: Spans, fallback: Loc): void {
  const loc = (diagnostic.attribute === undefined ? undefined : spans.get(diagnostic.attribute)) ?? fallback;
  context.report({ loc, message: diagnostic.message });
}

export function jsxVisitors(context: Rule.RuleContext, report: HtmlReport): Rule.RuleListener {
  return {
    JSXElement(node: Rule.Node) {
      const element = node as unknown as JsxElement;
      const { renders, spans } = readElement(element, context);
      for (const diagnostic of findings(renders)) {
        if (selected(report, diagnostic.code)) reportDiagnostic(context, diagnostic, spans, element.openingElement.loc);
      }
    },
  };
}
