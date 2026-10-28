import { APPEARANCE_AXES, CLASS_REGISTRY, HEADLESS_ALLOWLIST, USAGE, VOCABULARY, WRAPPERS, type UsageRule, type Wrapper } from "./contract.ts";
import { message, type MessageDetail, type UsageCode } from "./format.ts";

export type Computed = { readonly computed: readonly string[] };

export type UsageAttribute = { readonly name: string; readonly value: string | Computed };

export type UsageNode = {
  readonly tag: string | Computed;
  readonly attributes: readonly (UsageAttribute | Computed)[];
  readonly children: readonly (string | Computed | UsageNode)[];
};

export type Diagnostic = {
  readonly code: UsageCode;
  readonly message: string;
  readonly attribute?: UsageAttribute | Computed;
};

type Component = { readonly className: string; readonly rules: readonly UsageRule[]; readonly attributes: readonly string[] };

type Scope = {
  readonly node: UsageNode;
  readonly tag: string | undefined;
  readonly classAttribute: UsageAttribute | undefined;
  readonly words: readonly string[];
  readonly components: readonly Component[];
};

const { shared, ...byComponent } = USAGE;
const wrappers: readonly Wrapper[] = Object.values(WRAPPERS);
const registry: readonly string[] = CLASS_REGISTRY;
const systemData = new Set<string>(Object.values(VOCABULARY).flat());
const alwaysAllowed = new Set<string>([...APPEARANCE_AXES, ...HEADLESS_ALLOWLIST]);

function ownAttributes(className: string): readonly string[] {
  return wrappers.flatMap((wrapper) => (wrapper.className === className ? Object.values(wrapper.props) : []));
}

const components: readonly Component[] = Object.values(byComponent).flatMap((rules: readonly UsageRule[]) =>
  rules.flatMap((rule) =>
    rule.kind === "element"
      ? [{ className: rule.className, rules: rules.filter((other) => other.kind !== "element" || other === rule), attributes: ownAttributes(rule.className) }]
      : [],
  ),
);

function isComputed(value: string | Computed | UsageAttribute | UsageNode): value is Computed {
  return typeof value !== "string" && "computed" in value;
}

function find(node: UsageNode, name: string): UsageAttribute | undefined {
  return node.attributes.find((attribute): attribute is UsageAttribute => !isComputed(attribute) && attribute.name === name);
}

function hasUnknownAttributes(node: UsageNode): boolean {
  return node.attributes.some(isComputed);
}

function classWords(attribute: UsageAttribute | undefined): readonly string[] {
  if (attribute === undefined) return [];
  if (isComputed(attribute.value)) return attribute.value.computed;
  return attribute.value.split(/\s+/).filter((word) => word !== "");
}

function distance(a: string, b: string): number {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[i]![j] = Math.min(rows[i - 1]![j]! + 1, rows[i]![j - 1]! + 1, rows[i - 1]![j - 1]! + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) rows[i]![j] = Math.min(rows[i]![j]!, rows[i - 2]![j - 2]! + 1);
    }
  }
  return rows[a.length]![b.length]!;
}

function nearest(found: string, candidates: readonly string[]): string | undefined {
  let best: { candidate: string; score: number } | undefined;
  for (const candidate of candidates) {
    const core = candidate.replace(/^(data|odd)-/, "");
    const score = distance(found, candidate);
    if (score > Math.max(1, Math.floor(core.length / 4))) continue;
    if (best === undefined || score < best.score) best = { candidate, score };
  }
  return best?.candidate;
}

function diagnose(code: UsageCode, attribute?: UsageAttribute | Computed, detail?: MessageDetail): Diagnostic {
  return { code, message: detail === undefined ? message(code) : message(code, detail), attribute };
}

function checkValue(code: UsageCode, attribute: UsageAttribute | undefined, values: readonly string[], omit: readonly string[]): Diagnostic[] {
  if (attribute === undefined || isComputed(attribute.value)) return [];
  const value = attribute.value;
  if (values.includes(value)) return [];
  if (omit.includes(value)) return [diagnose(code, attribute, { found: value, suggestion: `to remove ${attribute.name}` })];
  const suggestion = nearest(value, values.filter((candidate) => candidate !== ""));
  return [diagnose(code, attribute, { found: value === "" ? "empty" : value, suggestion })];
}

function hasName(node: UsageNode, name: string): boolean {
  const attribute = find(node, name);
  if (attribute === undefined) return false;
  return isComputed(attribute.value) || attribute.value.trim() !== "";
}

function isSet(scope: Scope, name: string): boolean {
  const attribute = find(scope.node, name);
  if (attribute === undefined || isComputed(attribute.value)) return false;
  const value = attribute.value;
  return scope.components.some((component) =>
    component.rules.some((rule) => (rule.kind === "boolean-attribute" || rule.kind === "enum") && rule.attribute === name && rule.values.includes(value)),
  );
}

function isHidden(node: UsageNode, ignore: string): boolean {
  const attribute = find(node, ignore);
  if (attribute === undefined) return false;
  return isComputed(attribute.value) || attribute.value === "true";
}

function hasVisibleText(children: UsageNode["children"], ignore: string): boolean {
  return children.some((child) => {
    if (typeof child === "string") return child.trim() !== "";
    if (isComputed(child)) return false;
    return !isHidden(child, ignore) && hasVisibleText(child.children, ignore);
  });
}

function hasClass(node: UsageNode, className: string): boolean {
  return classWords(find(node, "class")).includes(className);
}

function descendants(node: UsageNode, stop: readonly string[]): { readonly found: readonly UsageNode[]; readonly unknown: boolean } {
  const found: UsageNode[] = [];
  let unknown = false;
  for (const child of node.children) {
    if (typeof child === "string") continue;
    if (isComputed(child)) {
      unknown = true;
      continue;
    }
    if (isComputed(child.tag)) unknown = true;
    if (stop.some((className) => hasClass(child, className))) continue;
    found.push(child);
    const below = descendants(child, stop);
    found.push(...below.found);
    unknown ||= below.unknown;
  }
  return { found, unknown };
}

function stretchedLinkFindings(rule: Extract<UsageRule, { kind: "stretched-link" }>, scope: Scope): Diagnostic[] {
  const attribute = find(scope.node, rule.attribute);
  if (attribute !== undefined && !isSet(scope, rule.attribute)) return [];
  const { found, unknown } = descendants(scope.node, scope.components.map((component) => component.className));
  const links = found.filter((node) => hasClass(node, rule.className));
  const controls = found.filter((node) => typeof node.tag === "string" && rule.controls.includes(node.tag));
  if (attribute === undefined) {
    return links.length > 0 && !hasUnknownAttributes(scope.node) ? [diagnose(rule.code, undefined, { found: `${rule.className} without ${rule.attribute}` })] : [];
  }
  if (controls.length > 1) return [diagnose(rule.code, attribute, { found: `${controls.length} links or buttons` })];
  if (unknown && controls.every((node) => hasClass(node, rule.className))) return [];
  const sole = controls.length === 1 && links.length === 1 && controls[0] === links[0];
  return sole ? [] : [diagnose(rule.code, attribute, { found: `no ${rule.className}` })];
}

function requiredChildFindings(rule: Extract<UsageRule, { kind: "required-child" }>, { node, tag }: Scope): Diagnostic[] {
  if (tag !== rule.element) return [];
  if (node.children.length === 0 && hasUnknownAttributes(node)) return [];
  const elements = node.children.filter((child) => typeof child !== "string");
  const matches = (child: UsageNode) => ("child" in rule ? child.tag === rule.child : find(child, "role")?.value === rule.role);
  const unknown = (child: UsageNode) => isComputed(child.tag) || ("role" in rule && hasUnknownRole(child));
  if (elements.some((child) => !isComputed(child) && matches(child))) return [];
  if (elements.some((child) => isComputed(child) || unknown(child))) return [];
  return [diagnose(rule.code, undefined, { found: `no ${"child" in rule ? rule.child : rule.role} child` })];
}

function hasUnknownRole(node: UsageNode): boolean {
  const role = find(node, "role");
  return role === undefined ? hasUnknownAttributes(node) : isComputed(role.value);
}

function roleDescendantFindings(rule: Extract<UsageRule, { kind: "role-descendant" }>, scope: Scope): Diagnostic[] {
  const { found } = descendants(scope.node, scope.components.map((component) => component.className));
  return found.flatMap((node) => {
    if (find(node, "role")?.value !== rule.role) return [];
    if (typeof node.tag === "string" && !rule.elements.includes(node.tag)) return [diagnose(rule.code, undefined, { found: `${rule.role} on ${node.tag}` })];
    if (find(node, rule.attribute) === undefined && !hasUnknownAttributes(node)) return [diagnose(rule.code, undefined, { found: `${rule.role} without ${rule.attribute}` })];
    return [];
  });
}

function valueReadAttributes(scope: Scope): Set<string> {
  return new Set(
    scope.components.flatMap((component) =>
      component.rules.flatMap((rule) => (rule.kind === "enum" || rule.kind === "boolean-attribute" || rule.kind === "aria-boolean" ? [rule.attribute] : [])),
    ),
  );
}

function computedFindings(scope: Scope): Diagnostic[] {
  const { node, classAttribute } = scope;
  const findings: Diagnostic[] = [];
  if (isComputed(node.tag)) findings.push(diagnose("ODD-STATIC-001"));
  if (classAttribute !== undefined && isComputed(classAttribute.value)) findings.push(diagnose("ODD-STATIC-001", classAttribute, { found: classAttribute.name }));
  if (scope.components.length === 0) return findings;
  const read = valueReadAttributes(scope);
  for (const attribute of node.attributes) {
    if (isComputed(attribute)) findings.push(diagnose("ODD-STATIC-001", attribute));
    else if (read.has(attribute.name) && isComputed(attribute.value)) findings.push(diagnose("ODD-STATIC-001", attribute, { found: attribute.name }));
  }
  return findings;
}

function systemDataFindings(rule: Extract<UsageRule, { kind: "system-data" }>, scope: Scope): Diagnostic[] {
  const own = [...scope.components.flatMap((component) => component.attributes), ...(rule.allow ?? [])];
  return scope.node.attributes.flatMap((attribute) => {
    if (isComputed(attribute) || !attribute.name.startsWith("data-")) return [];
    const name = attribute.name;
    if (own.includes(name) || alwaysAllowed.has(name)) return [];
    if (systemData.has(name)) return [diagnose(rule.code, attribute, { found: name })];
    const suggestion = nearest(name, own);
    return suggestion === undefined ? [] : [diagnose(rule.code, attribute, { found: name, suggestion })];
  });
}

function apply(rule: UsageRule, scope: Scope): Diagnostic[] {
  const { node, tag } = scope;
  switch (rule.kind) {
    case "element":
      return tag !== undefined && !rule.elements.includes(tag) ? [diagnose(rule.code, scope.classAttribute, { found: tag })] : [];
    case "enum":
      return checkValue(rule.code, find(node, rule.attribute), rule.values, rule.omit);
    case "boolean-attribute":
    case "aria-boolean":
      return checkValue(rule.code, find(node, rule.attribute), rule.values, []);
    case "forbidden-attribute": {
      const attribute = find(node, rule.attribute);
      return attribute === undefined ? [] : [diagnose(rule.code, attribute)];
    }
    case "required-attribute":
      return tag === rule.element && find(node, rule.attribute) === undefined && !hasUnknownAttributes(node) ? [diagnose(rule.code)] : [];
    case "forbidden-on-element": {
      const attribute = find(node, rule.attribute);
      return tag === rule.element && attribute !== undefined ? [diagnose(rule.code, attribute)] : [];
    }
    case "enum-on-element": {
      const attribute = find(node, rule.attribute);
      return tag !== undefined && tag !== rule.element && attribute !== undefined ? [diagnose(rule.code, attribute, { found: tag })] : [];
    }
    case "accessible-name":
      return isSet(scope, rule.attribute) && !hasUnknownAttributes(node) && !rule.names.some((name) => hasName(node, name)) ? [diagnose(rule.code)] : [];
    case "icon-only-text":
      return isSet(scope, rule.attribute) && hasVisibleText(node.children, rule.ignore) ? [diagnose(rule.code)] : [];
    case "system-data":
      return systemDataFindings(rule, scope);
    case "stretched-link":
      return stretchedLinkFindings(rule, scope);
    case "required-child":
      return requiredChildFindings(rule, scope);
    case "role-descendant":
      return roleDescendantFindings(rule, scope);
    case "unknown-class":
      return scope.words
        .filter((word) => word.startsWith("odd-") && !registry.includes(word))
        .map((word) => diagnose(rule.code, scope.classAttribute, { found: word, suggestion: nearest(word, registry) }));
    case "computed-value":
      return computedFindings(scope);
    case "untagged-template":
      return [];
  }
}

export function checkUsage(node: UsageNode): Diagnostic[] {
  const classAttribute = find(node, "class");
  const words = classWords(classAttribute);
  if (!words.some((word) => word.startsWith("odd-"))) return [];
  const tag = isComputed(node.tag) ? undefined : node.tag;
  const matched = tag === undefined ? [] : components.filter((component) => words.includes(component.className));
  const scope: Scope = { node, tag, classAttribute, words, components: matched };
  return [...shared, ...matched.flatMap((component) => component.rules)].flatMap((rule) => apply(rule, scope));
}
