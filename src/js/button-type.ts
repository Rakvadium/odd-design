export function defaultToButtonType(element: Element): void {
  if (element.localName === "button" && !element.hasAttribute("type")) element.setAttribute("type", "button");
}
