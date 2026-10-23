import { flush } from "odd-design/usage";
import { test } from "vitest";

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
