# Check HTML with ESLint

Add the plugin so ESLint reports a bad button in an HTML file or a template. Codes and fixes are in [Button usage rules](button.md) and [General usage rules](general.md).

## Add the plugin

Install `@html-eslint/parser` at `0.67.0`. The plugin entry is `odd-design/eslint`.

```js
import htmlParser from "@html-eslint/parser";
import odd from "odd-design/eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.html"],
    languageOptions: {
      parser: htmlParser,
    },
  },
  {
    files: ["**/*.{html,js,ts}"],
    plugins: { odd },
    rules: {
      "odd/usage": "error",
      "odd/usage-incomplete": "warn",
      "odd/disable-reason": "error",
    },
  },
]);
```

`odd/usage` reports a contract mistake. `odd/usage-incomplete` warns when a value is not static. `odd/disable-reason` reports a disable comment that names an `odd/` rule and gives no reason.

The HTML parser covers `.html` files. Your JS parser covers a template in a `.js` or `.ts` file. Both need to be in the `files` list above.

## Mark a template

The plugin checks a template tagged `html`, and a template with `/* html */` before the opening backtick. Put the comment on the template, with no comment between it and the backtick.

```ts
const save = /* html */ `<button class="odd-button">Save</button>`;
```

```ts
const save = html`<button class="odd-button">Save</button>`;
```

A bare template is not checked. If it contains an `odd-` class, `odd/usage` reports `ODD-STATIC-002` on the opening backtick. Tag it `html`, or add the comment.

## Write a literal attribute value

A `${...}` attribute value is not static. `odd/usage-incomplete` warns `ODD-STATIC-001` on that attribute. The plugin still checks the other attributes on the same element.

Write the value as a literal when you can. Leave the warning when the value has to stay computed.

## Write a reason on a disable

Put the reason after `--`.

```ts
// eslint-disable-next-line odd/usage -- the markup is third-party
```

`odd/disable-reason` reports `ODD-STATIC-003` when the reason is missing. With a reason, that rule reports nothing.
