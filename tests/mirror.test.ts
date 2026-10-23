import { expect, test } from "bun:test";
import { icons } from "../stories/icons.ts";
import { mirrorOf, toHtml, type PropsOf, type Scene } from "../stories/mirror.ts";

function button(props?: PropsOf<"Button">, children?: readonly (string | { readonly icon: keyof typeof icons })[]): Scene {
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
  expect(toHtml(button({ variant: "danger" }, [{ icon: "trash" }, "Delete"]))).toBe(
    '<button class="odd-button" data-variant="danger">' + icons.trash + " Delete</button>",
  );
});

test("wraps a row in odd-row and separates the children with newlines", () => {
  const scene: Scene = {
    layout: "row",
    children: [button(undefined, ["A"]), button(undefined, ["B"])],
  };
  expect(toHtml(scene)).toBe(
    '<div class="odd-row"><button class="odd-button">A</button>\n<button class="odd-button">B</button></div>',
  );
});

test("uses odd-stack for a stack instead of hard-coding odd-row", () => {
  const scene: Scene = { layout: "stack", children: [button(undefined, ["A"])] };
  expect(toHtml(scene)).toBe('<div class="odd-stack"><button class="odd-button">A</button></div>');
});

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
