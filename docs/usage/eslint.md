# Check HTML with ESLint

Add the plugin so ESLint reports a bad button, field, or choice in an HTML file or a template. Codes and fixes are in [Button usage rules](button.md), [Field usage rules](field.md), [Choice usage rules](choice.md), and [General usage rules](general.md).

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

## Check JSX

The plugin also checks JSX. Add your `.jsx` and `.tsx` files to the plugin's `files` list. Your JS parser has to read JSX, as `@typescript-eslint/parser` does, or `@babel/eslint-parser` with its `jsx` plugin.

```js
{
  files: ["**/*.{jsx,tsx}"],
  plugins: { odd },
  rules: {
    "odd/usage": "error",
    "odd/disable-reason": "error",
  },
}
```

In JSX, `odd/usage` reports each `odd-` class in a `className` or `class`, on any element, as `ODD-REACT-003`. An `odd-` class is markup that a component from `odd-design/react` renders, with the roles, ids, and wiring it owns, so the message names that component. `<button className="odd-button">` reports `ODD-REACT-003` and says to render `Button`. A router link with `className="odd-link"` says to render `TextLink`. A class that no component renders yet says so, and a toast class says to call `toast()` from `odd-design/enhance`. A class that is not in the registry reports `ODD-CLASS-001`.

The plugin reads every string inside the value: a string, a template literal, and the strings inside a call such as `cx("odd-card", active && "is-active")` or `clsx({ "odd-hint": shown })`. A value with no string, such as `className={styles.card}`, reports nothing.

ESLint does not check the props of a component from `odd-design/react`. TypeScript checks them, and the [runtime checker](runtime.md) checks the markup they render. `odd/usage-incomplete` has no JSX findings.

## Write a literal attribute value

A `${...}` attribute value is not static. `odd/usage-incomplete` warns `ODD-STATIC-001` on that attribute. The plugin still checks the other attributes on the same element.

Write the value as a literal when you can. Leave the warning when the value has to stay computed.

## Write a reason on a disable

Put the reason after `--`.

```ts
// eslint-disable-next-line odd/usage -- the markup is third-party
```

`odd/disable-reason` reports `ODD-STATIC-003` when the reason is missing. With a reason, that rule reports nothing.
