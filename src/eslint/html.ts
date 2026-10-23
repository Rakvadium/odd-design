import { parse } from "@html-eslint/template-parser";
import type { Rule } from "eslint";
// @ts-expect-error html-eslint ships no declaration for the lib path.
import { shouldCheckTaggedTemplateExpression as checkTaggedTemplate, shouldCheckTemplateLiteral as checkTemplateLiteral } from "@html-eslint/eslint-plugin/lib/rules/utils/settings.js";
import { checkUsage, type Computed, type Diagnostic, type UsageAttribute, type UsageNode } from "../js/usage/check.ts";
import { message, type UsageCode } from "../js/usage/format.ts";

const shouldCheckTemplateLiteral: (node: Rule.Node, context: Rule.RuleContext) => boolean = checkTemplateLiteral;
const shouldCheckTaggedTemplateExpression: (node: Rule.Node, context: Rule.RuleContext) => boolean = checkTaggedTemplate;

export type HtmlReport = "usage" | "incomplete";

type Loc = { start: { line: number; column: number }; end: { line: number; column: number } };

type Part = { type?: unknown; value?: unknown };

type Composite = { value?: unknown; parts?: readonly Part[] };

type HtmlAttribute = {
  type: "Attribute";
  loc?: unknown;
  key?: Composite;
  value?: Composite | null;
};

type HtmlTag = {
  type: "Tag";
  name?: unknown;
  loc?: unknown;
  attributes?: readonly unknown[];
  children?: readonly unknown[];
};

type ChildKind = "tag" | "text" | "other";

type TemplateNode = Parameters<typeof parse>[0];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLoc(value: unknown): value is Loc {
  if (!isRecord(value) || !isRecord(value.start) || !isRecord(value.end)) return false;
  return (
    typeof value.start.line === "number" &&
    typeof value.start.column === "number" &&
    typeof value.end.line === "number" &&
    typeof value.end.column === "number"
  );
}

function partText(part: Part): string {
  return typeof part.value === "string" ? part.value : "";
}

function hasTemplate(parts: readonly Part[]): boolean {
  return parts.some((part) => part.type === "Template");
}

function staticText(parts: readonly Part[]): string {
  return parts.filter((part) => part.type === "Part").map(partText).join("");
}

function words(text: string): string[] {
  return text.split(/\s+/).filter((word) => word !== "");
}

function isContractClass(word: string): boolean {
  return word.startsWith("odd-");
}

function attributeName(attribute: HtmlAttribute): string | undefined {
  const parts = attribute.key?.parts ?? [];
  if (attribute.key === undefined || hasTemplate(parts)) return undefined;
  return typeof attribute.key.value === "string" ? attribute.key.value : undefined;
}

function valueText(attribute: HtmlAttribute): string {
  const value = attribute.value;
  if (value == null) return "";
  const parts = value.parts ?? [];
  if (hasTemplate(parts)) return staticText(parts);
  return typeof value.value === "string" ? value.value : "";
}

function isAttribute(value: unknown): value is HtmlAttribute {
  return isRecord(value) && value.type === "Attribute";
}

function isTag(value: unknown): value is HtmlTag {
  return isRecord(value) && value.type === "Tag";
}

function childKind(value: unknown): ChildKind {
  if (!isRecord(value) || typeof value.type !== "string") return "other";
  switch (value.type) {
    case "Tag":
      return "tag";
    case "Text":
      return "text";
    default:
      return "other";
  }
}

function readAttribute(attribute: HtmlAttribute, spans: Map<UsageAttribute | Computed, Loc>): UsageAttribute | Computed {
  const loc = isLoc(attribute.loc) ? attribute.loc : undefined;
  const name = attributeName(attribute);
  if (name === undefined) {
    const computed: Computed = { computed: [] };
    if (loc !== undefined) spans.set(computed, loc);
    return computed;
  }
  const parts = attribute.value?.parts ?? [];
  const value: string | Computed =
    attribute.value == null ? "" : hasTemplate(parts) ? { computed: name === "class" ? words(staticText(parts)) : [] } : valueText(attribute);
  const usage: UsageAttribute = { name, value };
  if (loc !== undefined) spans.set(usage, loc);
  return usage;
}

function readText(value: unknown): UsageNode["children"] {
  if (!isRecord(value)) return [];
  const parts = Array.isArray(value.parts) ? value.parts.filter(isRecord) : [];
  if (!hasTemplate(parts)) return [typeof value.value === "string" ? value.value : ""];
  const literal = staticText(parts);
  const children: (string | Computed | UsageNode)[] = [];
  if (literal !== "") children.push(literal);
  children.push({ computed: [] });
  return children;
}

function readTag(tag: HtmlTag): { usage: UsageNode; spans: Map<UsageAttribute | Computed, Loc> } {
  const spans = new Map<UsageAttribute | Computed, Loc>();
  const attributes = (tag.attributes ?? []).flatMap((attribute) => (isAttribute(attribute) ? [readAttribute(attribute, spans)] : []));
  const children = (tag.children ?? []).flatMap(readChild);
  const name = typeof tag.name === "string" && !tag.name.includes("${") ? tag.name : ({ computed: [] } satisfies Computed);
  return { usage: { tag: name, attributes, children }, spans };
}

function readChild(child: unknown): UsageNode["children"] {
  const kind = childKind(child);
  switch (kind) {
    case "tag":
      return isTag(child) ? [readTag(child).usage] : [];
    case "text":
      return readText(child);
    case "other":
      return [];
    default: {
      const unreachable: never = kind;
      return unreachable;
    }
  }
}

function tagHasContractClass(tag: HtmlTag): boolean {
  return (tag.attributes ?? []).some((attribute) => {
    if (!isAttribute(attribute) || attributeName(attribute) !== "class") return false;
    return words(valueText(attribute)).some(isContractClass);
  });
}

function containsContractClass(node: unknown): boolean {
  if (!isRecord(node)) return false;
  if (isTag(node) && tagHasContractClass(node)) return true;
  return Array.isArray(node.children) && node.children.some(containsContractClass);
}

function templateNode(node: Rule.Node): TemplateNode | undefined {
  if (node.type !== "TemplateLiteral") return undefined;
  return node as unknown as TemplateNode;
}

function stripCarriage(text: string): { text: string; adjust: (index: number) => number } {
  const map = new Array<number>(text.length + 1);
  let removed = 0;
  let stripped = "";
  for (let index = 0; index < text.length; index++) {
    map[index] = index - removed;
    const char = text[index];
    if (char === "\r") removed += 1;
    else stripped += char;
  }
  map[text.length] = text.length - removed;
  return { text: stripped, adjust: (index) => map[index] ?? index };
}

function parseLiteral(node: Rule.Node, context: Rule.RuleContext): { ast: unknown } | undefined {
  const template = templateNode(node);
  if (template === undefined) return undefined;
  const text = context.sourceCode.text;
  if (!text.includes("\r") || node.range == null) return parse(template, context.sourceCode);
  const { text: stripped, adjust } = stripCarriage(text);
  const quasis = template.quasis.map((quasi) => ({
    ...quasi,
    range: quasi.range == null ? quasi.range : ([adjust(quasi.range[0]), adjust(quasi.range[1])] as const),
  }));
  const adjusted = {
    ...template,
    range: [adjust(node.range[0]), adjust(node.range[1])] as const,
    quasis,
  };
  return parse(adjusted as unknown as TemplateNode, { text: stripped } as Rule.RuleContext["sourceCode"]);
}

function parserSees(node: Rule.Node, context: Rule.RuleContext): boolean {
  if (shouldCheckTemplateLiteral(node, context)) return true;
  const parent = (node as { parent?: Rule.Node }).parent;
  return parent?.type === "TaggedTemplateExpression" && shouldCheckTaggedTemplateExpression(parent, context);
}

export function selected(report: HtmlReport, code: UsageCode): boolean {
  switch (report) {
    case "usage":
      return code !== "ODD-STATIC-001";
    case "incomplete":
      return code === "ODD-STATIC-001";
    default: {
      const unreachable: never = report;
      return unreachable;
    }
  }
}

function reportDiagnostic(context: Rule.RuleContext, diagnostic: Diagnostic, spans: ReadonlyMap<UsageAttribute | Computed, Loc>, fallback: unknown): void {
  const loc = diagnostic.attribute === undefined ? (isLoc(fallback) ? fallback : undefined) : spans.get(diagnostic.attribute);
  if (loc === undefined) return;
  context.report({ loc, message: diagnostic.message });
}

function reportTag(tag: HtmlTag, context: Rule.RuleContext, report: HtmlReport): void {
  const read = readTag(tag);
  for (const diagnostic of checkUsage(read.usage)) {
    if (!selected(report, diagnostic.code)) continue;
    reportDiagnostic(context, diagnostic, read.spans, tag.loc);
  }
}

function checkTree(node: unknown, context: Rule.RuleContext, report: HtmlReport): void {
  if (isTag(node)) reportTag(node, context, report);
  if (!isRecord(node) || !Array.isArray(node.children)) return;
  for (const child of node.children) checkTree(child, context, report);
}

export function htmlVisitors(context: Rule.RuleContext, report: HtmlReport): Rule.RuleListener {
  return {
    Tag(node: Rule.Node) {
      if (isTag(node)) reportTag(node, context, report);
    },
    TemplateLiteral(node: Rule.Node) {
      const parsed = parseLiteral(node, context);
      if (parsed === undefined) return;
      if (parserSees(node, context)) {
        checkTree(parsed.ast, context, report);
        return;
      }
      if (report !== "usage" || node.loc == null || !containsContractClass(parsed.ast)) return;
      context.report({ loc: node.loc, message: message("ODD-STATIC-002") });
    },
  };
}
