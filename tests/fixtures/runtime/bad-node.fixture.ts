import { test } from "bun:test";
import "../../../src/js/usage/test-setup.ts";

test("appends a disabled odd-button", () => {
  document.body.insertAdjacentHTML("beforeend", '<button class="odd-button" disabled></button>');
});
