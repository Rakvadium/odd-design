import { act, type ReactElement } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

/** Hydrates the element's server markup and returns every recoverable error and React warning it raised. */
export async function hydrationErrors(element: ReactElement): Promise<string[]> {
  const container = document.createElement("div");
  container.innerHTML = renderToString(element);
  document.body.append(container);
  const errors: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => errors.push(args.map(String).join(" "));
  let root: Root | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, element, { onRecoverableError: (error) => errors.push(String(error)) });
    });
    await act(async () => root?.unmount());
  } finally {
    console.error = original;
    container.remove();
  }
  return errors;
}
