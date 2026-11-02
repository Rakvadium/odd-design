import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { mirrorOf, type Scene } from "../stories/mirror.ts";
import { toReact } from "../stories/mirror-react.ts";

export const illegal: readonly (() => Scene)[] = [
  // @ts-expect-error an input is void, so it takes no children
  () => ({ of: "Input", props: { id: "name" }, children: ["Name"] }),
  // @ts-expect-error a Label needs htmlFor
  () => ({ of: "Label", children: ["Name"] }),
  // @ts-expect-error an option belongs inside a select
  () => ({ of: "Field", children: [{ of: "option", children: ["Standard"] }] }),
  // @ts-expect-error style is an object, as React takes it
  () => ({ of: "Field", props: { style: "max-inline-size: 26rem" } }),
  // @ts-expect-error a style value is a string, because React would add px to a number
  () => ({ of: "Field", props: { style: { maxInlineSize: 26 } } }),
  // @ts-expect-error value needs an onChange, so a scene sets defaultValue
  () => ({ of: "Input", props: { id: "owner", value: "you" } }),
  // @ts-expect-error checked needs an onChange too, so a scene sets defaultChecked
  () => ({ of: "Input", props: { id: "opt", type: "checkbox", checked: true, disabled: true } }),
  // @ts-expect-error a handler has no HTML form
  () => ({ of: "form", props: { onSubmit: () => undefined } }),
  // @ts-expect-error a wrapper's class goes through the wrapper
  () => ({ of: "div", props: { className: "odd-field" } }),
];

test("mirrorOf throws when parameters.mirror is missing, instead of rendering nothing", () => {
  expect(() => mirrorOf({})).toThrow("story has no parameters.mirror");
});

test("mirrorOf returns the scene, which fails if it drops parameters.mirror", () => {
  const mirror = mirrorOf({
    mirror: { scene: () => ({ of: "Button", children: ["Save"] }), aria: '- button "Save"' },
  });
  expect(renderToStaticMarkup(toReact(mirror.scene({})))).toBe('<button type="button" class="odd-button">Save</button>');
  expect(mirror.aria).toBe('- button "Save"');
});
