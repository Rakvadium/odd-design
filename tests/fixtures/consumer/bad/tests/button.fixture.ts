import { flush } from "odd-design/usage";
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
