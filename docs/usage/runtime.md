# Set up the runtime checker

Install the checker so a bad button prints in development and fails the test that created it. Production does not report it. `checkRoot`, `installUsageChecker`, and `flush` live in `src/js/usage/dom.ts`. `registerUsageChecks` lives in `src/js/usage/test-setup.ts`. Consumers import those modules as `odd-design/usage` and `odd-design/usage/test-setup`. Codes and fixes are in [Button usage rules](button.md) and [General usage rules](general.md).

## Log added elements in development

Call `installUsageChecker` with `"dev"` before the page adds buttons.

```ts
import { installUsageChecker } from "odd-design/usage";

installUsageChecker("dev");
```

The checker watches `document` for added elements. When an element is added, the checker checks that element and every element inside it, then writes each problem to `console.error`. It reads the attributes at that moment. The message starts with the code, such as `ODD-BUTTON-007`, and it includes the fix. `createToaster().show()` adds the action button and the dismiss button inside the toast, so both buttons are part of the added element.

Dev mode does not watch attribute changes. A `disabled` attribute set after the added-element report does not produce another log. `flush` reports added elements the observer has not reported yet, using the attributes at the time of the call, and `flush` does not throw.

To check the tree that is already rendered, call `checkRoot`. It throws an `Error` whose message is one problem per line. That call sees the current attributes, including a `disabled` attribute set after the button was added. Dev mode does not change that throw.

```ts
import { checkRoot } from "odd-design/usage";

checkRoot(document);
```

## Fail the test that rendered a bad button

Importing the setup module does nothing. Call `registerUsageChecks` once, and pass that runner's `afterEach`.

For Bun, put the call in a file on `[test] preload`. Pass `afterEach` from `bun:test`.

```ts
import { afterEach } from "bun:test";
import { registerUsageChecks } from "odd-design/usage/test-setup";

registerUsageChecks(afterEach);
```

```toml
[test]
preload = ["./tests/setup/usage.ts"]
```

For Vitest, put the same call in a file on `setupFiles`. Pass `afterEach` from `vitest`.

```ts
import { afterEach } from "vitest";
import { registerUsageChecks } from "odd-design/usage/test-setup";

registerUsageChecks(afterEach);
```

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./tests/setup/usage.ts"],
  },
});
```

Do not also call `registerUsageChecks` from each test file. A second call registers a second hook.

`registerUsageChecks` calls `installUsageChecker` with `"test"`. The hook calls `flush`, then `checkRoot(document)`.

`flush` throws the problems for elements the observer saw added, using the attributes from that report. `checkRoot` throws the problems for elements still in the document, using the attributes at the time of the call. The observer does not see a `disabled` attribute set after it has already reported the button, so only `checkRoot` reports `ODD-BUTTON-007` for that change.

If the hook throws, it empties `document.body` and then throws the same error. The next test starts with an empty body. If the hook does not throw, the body stays as the test left it.

Call `flush` when the test should fail at a chosen line. In test mode, `flush` throws the problems the observer collected.

```ts
import { flush } from "odd-design/usage";

flush();
```

## Turn the checker off for production

Call `installUsageChecker` with `"prod"`, or do not install the checker.

```ts
import { installUsageChecker } from "odd-design/usage";

installUsageChecker("prod");
```

Prod mode does not watch the document and does not write problems. `flush` returns without throwing. `checkRoot` still throws when you call it.
