import type { UsageNode } from "./check.ts";

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
