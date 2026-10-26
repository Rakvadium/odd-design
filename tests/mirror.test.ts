import { expect, test } from "bun:test";
import { icons } from "../stories/icons.ts";
import { mirrorOf, toHtml, type Node, type Scene } from "../stories/mirror.ts";

function button(props?: Node<"Button">["props"], children?: readonly (string | { readonly icon: keyof typeof icons })[]): Node<"Button"> {
  return { of: "Button", props, children };
}

test("omits an undefined prop instead of writing data-variant=\"undefined\"", () => {
  expect(toHtml(button({ variant: undefined }, ["Save"]))).toBe('<button class="odd-button">Save</button>');
});

test("omits a false prop instead of writing data-icon-only=\"false\"", () => {
  expect(toHtml(button({ iconOnly: false, variant: "primary" }, ["Go"]))).toBe(
    '<button class="odd-button" data-variant="primary">Go</button>',
  );
});

test('writes aria-disabled true as aria-disabled="true" instead of a bare attribute', () => {
  expect(toHtml(button({ "aria-disabled": true }, ["Save"]))).toBe(
    '<button class="odd-button" aria-disabled="true">Save</button>',
  );
});

test('writes aria-pressed false as aria-pressed="false" instead of omitting it', () => {
  expect(toHtml(button({ "aria-pressed": false }, ["Save"]))).toBe(
    '<button class="odd-button" aria-pressed="false">Save</button>',
  );
});

test('writes a true prop as a bare attribute instead of data-icon-only="true"', () => {
  expect(toHtml(button({ iconOnly: true, "aria-label": "Add" }, [{ icon: "plus" }]))).toBe(
    '<button class="odd-button" data-icon-only aria-label="Add">' + icons.plus + "</button>",
  );
});

test("writes a string prop as an attribute value instead of dropping variant", () => {
  expect(toHtml(button({ variant: "primary" }, ["Save"]))).toBe(
    '<button class="odd-button" data-variant="primary">Save</button>',
  );
});

test("uses an anchor when href is set instead of always rendering a button", () => {
  expect(toHtml(button({ href: "#docs", variant: "secondary" }, ["Docs"]))).toBe(
    '<a class="odd-button" data-variant="secondary" href="#docs">Docs</a>',
  );
});

test("inlines the named icon svg instead of the icon's name", () => {
  expect(toHtml(button({ variant: "danger" }, [{ icon: "trash" }, " Delete"]))).toBe(
    '<button class="odd-button" data-variant="danger">' + icons.trash + " Delete</button>",
  );
});

test("renders a native element with its own tag and class, instead of only wrappers", () => {
  const scene: Scene = { of: "form", props: { className: "odd-stack", method: "dialog" }, children: [button(undefined, ["A"])] };
  expect(toHtml(scene)).toBe('<form class="odd-stack" method="dialog"><button class="odd-button">A</button></form>');
});

test("nests a Hint inside a Field instead of dropping it", () => {
  const scene: Scene = { of: "Field", children: [{ of: "Hint", props: { id: "name-hint" }, children: ["Shown"] }] };
  expect(toHtml(scene)).toBe('<div class="odd-field"><p class="odd-hint" id="name-hint">Shown</p></div>');
});

test("writes htmlFor as for instead of an htmlfor attribute", () => {
  expect(toHtml({ of: "Label", props: { htmlFor: "name" }, children: ["Name"] })).toBe('<label class="odd-label" for="name">Name</label>');
});

test('writes required true as a bare attribute instead of required="true", and drops disabled false', () => {
  expect(toHtml({ of: "Input", props: { id: "name", required: true, disabled: false } })).toBe('<input class="odd-input" id="name" required>');
});

test("writes an input as a void tag instead of adding </input>, and throws on children instead of dropping them", () => {
  expect(toHtml({ of: "Input", props: { id: "name" } })).toBe('<input class="odd-input" id="name">');
  const withChildren = { of: "Input", props: { id: "name" }, children: ["Name"] } as unknown as Scene;
  expect(() => toHtml(withChildren)).toThrow("<input> is a void element and cannot have children");
});

test("writes an input's defaultValue as the value attribute instead of a dead defaultvalue", () => {
  expect(toHtml({ of: "Input", props: { id: "owner", defaultValue: "you" } })).toBe('<input class="odd-input" id="owner" value="you">');
});

test("marks the option that matches the select's defaultValue instead of writing defaultvalue on the select", () => {
  const scene: Scene = {
    of: "Select",
    props: { id: "format", defaultValue: "Extended" },
    children: [
      { of: "option", children: ["Standard"] },
      { of: "option", children: ["Extended"] },
    ],
  };
  expect(toHtml(scene)).toBe('<select class="odd-select" id="format"><option>Standard</option><option selected>Extended</option></select>');
});

test("writes a textarea's defaultValue as its content instead of a value attribute", () => {
  expect(toHtml({ of: "Textarea", props: { id: "notes", defaultValue: "a < b" } })).toBe(
    '<textarea class="odd-textarea" id="notes">a &lt; b</textarea>',
  );
});

test("writes a style object as CSS text instead of [object Object]", () => {
  expect(toHtml({ of: "Field", props: { style: { maxInlineSize: "26rem" } } })).toBe('<div class="odd-field" style="max-inline-size:26rem"></div>');
});

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
  // @ts-expect-error a handler has no HTML form
  () => ({ of: "form", props: { onSubmit: () => undefined } }),
  // @ts-expect-error a wrapper's class goes through the wrapper
  () => ({ of: "div", props: { className: "odd-field" } }),
];

test("escapes text so a label cannot close the element", () => {
  expect(toHtml(button(undefined, ['a<b> & "c"']))).toBe('<button class="odd-button">a&lt;b&gt; &amp; &quot;c&quot;</button>');
});

test("appends className instead of replacing odd-button", () => {
  expect(toHtml(button({ className: "extra" }, ["Save"]))).toBe('<button class="odd-button extra">Save</button>');
});

test('does not add type="button", which the HTML stories never had', () => {
  expect(toHtml(button(undefined, ["Save"]))).toBe('<button class="odd-button">Save</button>');
});

test("mirrorOf throws when parameters.mirror is missing, instead of rendering nothing", () => {
  expect(() => mirrorOf({})).toThrow("story has no parameters.mirror");
});

test("mirrorOf returns the scene, which fails if it drops parameters.mirror", () => {
  const mirror = mirrorOf({
    mirror: { scene: () => button(undefined, ["Save"]), aria: '- button "Save"' },
  });
  expect(toHtml(mirror.scene({}))).toBe('<button class="odd-button">Save</button>');
  expect(mirror.aria).toBe('- button "Save"');
});
