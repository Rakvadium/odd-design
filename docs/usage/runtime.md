# Set up the runtime checker

Install the checker so a bad button prints in development and fails the test that created it. Production does not report it. The functions live in `src/js/usage/dom.ts`. The test hook lives in `src/js/usage/test-setup.ts`. The imports below are written from a file in `tests/`.

Codes and fixes are in [Button usage rules](button.md) and [General usage rules](general.md).

## Log problems in development

Call `installUsageChecker` with `"dev"` before the page adds buttons.

```ts
import { installUsageChecker } from "../src/js/usage/dom.ts";

installUsageChecker("dev");
```

The checker watches `document`. When code adds an element, each problem is written to `console.error`. The message starts with the code, such as `ODD-BUTTON-007`, and it includes the fix. The check covers buttons added later. `createToaster().show()` adds the action button and the dismiss button after the toaster exists.

To check a tree that is already rendered, call `checkRoot`. It throws an `Error`. The message is one problem per line. Dev mode does not change that throw.

```ts
import { checkRoot } from "../src/js/usage/dom.ts";

checkRoot(document);
```

## Fail the test that rendered a bad button

Import the setup file from the test.

```ts
import "../src/js/usage/test-setup.ts";
```

The setup calls `installUsageChecker` with `"test"`. After each test it reads the observer records and calls `checkRoot(document)`. A bad button fails that test. The error names the code.

Call `flush` when the test should fail at a chosen line. In test mode, `flush` throws the problems the observer collected.

```ts
import { flush } from "../src/js/usage/dom.ts";

flush();
```

## Turn the checker off for production

Call `installUsageChecker` with `"prod"`, or do not install the checker.

```ts
import { installUsageChecker } from "../src/js/usage/dom.ts";

installUsageChecker("prod");
```

Prod mode does not watch the document. `flush` returns without throwing and writes nothing. `checkRoot` still throws when you call it.
