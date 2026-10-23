import { afterEach, test } from "bun:test";
import { registerUsageChecks } from "../../../src/js/usage/test-setup.ts";

registerUsageChecks(afterEach);

test("appends a disabled odd-button", () => {
  document.body.insertAdjacentHTML("beforeend", '<button class="odd-button" disabled></button>');
});
