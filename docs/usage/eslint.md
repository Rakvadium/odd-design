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

## Check JSX

The plugin also checks JSX. Add your `.jsx` and `.tsx` files to the plugin's `files` list. Your JS parser has to read JSX, as `@typescript-eslint/parser` does, or `@babel/eslint-parser` with its `jsx` plugin.

```js
{
  files: ["**/*.{jsx,tsx}"],
  plugins: { odd },
  rules: {
    "odd/usage": "error",
    "odd/usage-incomplete": "warn",
    "odd/disable-reason": "error",
  },
}
```

The plugin checks a lowercase element, such as `<button>`, like the same element in HTML. It reads `className` as `class`. It reads each value the way React renders it.

- A string, a number, and a template literal with no `${...}` are literal values.
- On a `data-` or `aria-` attribute, `{true}` and `{false}` are the strings `true` and `false`. So `data-icon-only={false}` reports `ODD-BUTTON-004`.
- On any other attribute, `{true}` sets the attribute and `{false}` leaves it out.
- `{null}` and `{undefined}` leave the attribute out.
- Any other expression is not static, and neither is a `{...props}` spread. On an `odd-button` element, `odd/usage-incomplete` warns `ODD-STATIC-001` on a spread, and on a computed value that a button rule reads, such as `data-variant={tone}`.
- A computed `className` keeps the string literals inside it. `className={cn("odd-button", active && "is-active")}` still runs the button rules, and warns `ODD-STATIC-001` on `className`.

### The Button from odd-design/react

The plugin checks `<Button>` as the element it renders when `Button` is imported from `odd-design/react`. An alias, such as `import { Button as OddButton } from "odd-design/react"`, counts too. A `Button` that you declare yourself is not checked.

Every imported `Button` gets the class `odd-button`, plus the words in its `className`. The table shows how its other props map to the element.

| Button prop | What the element gets |
| --- | --- |
| `href` | The element is an `a`. Without `href`, or with `href={undefined}`, it is a `button`. A computed `href`, such as `href={url}`, can render either. On that element, `odd/usage-incomplete` warns `ODD-STATIC-001` and the plugin runs no button rules. |
| `variant` | `data-variant` |
| `size` | `data-size` |
| `iconOnly` | `data-icon-only`. `iconOnly={false}` leaves it out. |
| Any other prop | The attribute with the same name. |

So `<Button disabled>` reports `ODD-BUTTON-007`, and `<Button href="#" aria-disabled="true">` reports `ODD-BUTTON-013`.

### Other components

The plugin cannot see what another component renders. A component with an `odd-` class, such as `<Link className="odd-button">`, gets one `ODD-STATIC-001` warning on the element and no button rules. An `odd-` class that is not in the registry still reports `ODD-CLASS-001`. `<UI.Button>`, with `UI` a namespace import, counts as another component.

## Write a literal attribute value

A `${...}` attribute value is not static. `odd/usage-incomplete` warns `ODD-STATIC-001` on that attribute. The plugin still checks the other attributes on the same element.

Write the value as a literal when you can. Leave the warning when the value has to stay computed.

## Write a reason on a disable

Put the reason after `--`.

```ts
// eslint-disable-next-line odd/usage -- the markup is third-party
```

`odd/disable-reason` reports `ODD-STATIC-003` when the reason is missing. With a reason, that rule reports nothing.
