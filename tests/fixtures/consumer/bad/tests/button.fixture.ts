import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { flush } from "odd-design/usage";
import { Button } from "odd-design/react";
import { test } from "vitest";

test("flush from odd-design/usage reports the disabled button", () => {
  const button = document.createElement("button");
  button.className = "odd-button";
  button.setAttribute("disabled", "");
  document.body.append(button);
  try {
    flush();
    throw new Error("flush from odd-design/usage did not report ODD-BUTTON-007");
  } finally {
    document.body.replaceChildren();
  }
});

test("flush from odd-design/usage accepts a named button", () => {
  const button = document.createElement("button");
  button.className = "odd-button";
  button.textContent = "Save";
  document.body.append(button);
  try {
    flush();
  } finally {
    document.body.replaceChildren();
  }
});

test("afterEach fails a DOM test that never calls flush", () => {
  const button = document.createElement("button");
  button.className = "odd-button";
  button.setAttribute("disabled", "");
  document.body.append(button);
});

test("afterEach fails a React test that never calls flush", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  await act(() => {
    root.render(createElement(Button, { disabled: true, children: "Save" }));
  });
});

test("the next test starts with an empty body", () => {
  if (document.body.children.length !== 0) throw new Error(`body has ${document.body.innerHTML}`);
});
