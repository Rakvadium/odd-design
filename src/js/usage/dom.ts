import { checkUsage, type Diagnostic, type UsageNode } from "./check.ts";

export type UsageMode = "dev" | "test" | "prod";

type Session =
  | { readonly mode: "prod" }
  | { readonly mode: "dev"; readonly observer: MutationObserver }
  | { readonly mode: "test"; readonly observer: MutationObserver; problems: Diagnostic[] };

let session: Session = { mode: "prod" };

export function toUsageNode(element: Element): UsageNode {
  return {
    tag: element.localName,
    attributes: Array.from(element.attributes, ({ name, value }) => ({ name, value })),
    children: Array.from(element.childNodes).flatMap((child): UsageNode["children"] => {
      if (child.nodeType === Node.ELEMENT_NODE) return [toUsageNode(child as Element)];
      if (child.nodeType === Node.TEXT_NODE) return [(child as Text).data];
      return [];
    }),
  };
}

function elementsIn(root: ParentNode): Element[] {
  const descendants = [...root.querySelectorAll("*")];
  return root instanceof Element ? [root, ...descendants] : descendants;
}

function elementsFrom(records: readonly MutationRecord[]): Element[] {
  const elements: Element[] = [];
  for (const record of records) {
    for (const node of record.addedNodes) {
      if (!(node instanceof Element)) continue;
      elements.push(node, ...node.querySelectorAll("*"));
    }
  }
  return elements;
}

function diagnosticsFor(elements: readonly Element[]): Diagnostic[] {
  return [...new Set(elements)].flatMap((element) => checkUsage(toUsageNode(element)));
}

function throwProblems(diagnostics: readonly Diagnostic[]): void {
  if (diagnostics.length === 0) return;
  throw new Error(diagnostics.map((diagnostic) => diagnostic.message).join("\n"));
}

export function checkRoot(root: ParentNode): void {
  throwProblems(diagnosticsFor(elementsIn(root)));
}

function deliver(diagnostics: readonly Diagnostic[]): void {
  switch (session.mode) {
    case "prod":
      return;
    case "dev":
      for (const diagnostic of diagnostics) console.error(diagnostic.message);
      return;
    case "test":
      session.problems.push(...diagnostics);
      return;
    default: {
      const unreachable: never = session;
      return unreachable;
    }
  }
}

function watchDocument(): MutationObserver {
  const observer = new MutationObserver((records) => {
    if (session.mode === "prod" || session.observer !== observer) return;
    deliver(diagnosticsFor(elementsFrom(records)));
  });
  return observer;
}

export function installUsageChecker(mode: UsageMode): void {
  if (session.mode !== "prod") {
    session.observer.takeRecords();
    session.observer.disconnect();
  }
  switch (mode) {
    case "prod":
      session = { mode: "prod" };
      return;
    case "dev":
    case "test": {
      const observer = watchDocument();
      session = mode === "dev" ? { mode: "dev", observer } : { mode: "test", observer, problems: [] };
      observer.observe(document, { childList: true, subtree: true });
      return;
    }
    default: {
      const unreachable: never = mode;
      return unreachable;
    }
  }
}

export function flush(): void {
  if (session.mode === "prod") return;
  deliver(diagnosticsFor(elementsFrom(session.observer.takeRecords())));
  if (session.mode !== "test") return;
  throwProblems(session.problems.splice(0));
}
