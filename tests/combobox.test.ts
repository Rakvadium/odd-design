import { afterEach, expect, test } from "bun:test";
import { enhanceCombobox } from "../src/js/combobox.ts";

function mount(listAttributes = "", options = ["Amsterdam", "Atlantis:disabled", "Berlin", "Bogotá", "Cairo"]) {
  const rows = options.map((option) => {
    const [text, disabled] = option.split(":");
    return `<div class="odd-combobox-option" role="option"${disabled ? ' aria-disabled="true"' : ""}>${text}</div>`;
  });
  document.body.innerHTML = /* html */ `
    <form>
      <div class="odd-combobox">
        <input class="odd-input" id="city" role="combobox" aria-controls="city-list" aria-expanded="false" aria-autocomplete="list" aria-label="City">
        <div class="odd-combobox-list" id="city-list" popover="manual" role="listbox" aria-label="Cities" ${listAttributes}>${rows.join("")}</div>
      </div>
    </form>`;
  const root = document.querySelector<HTMLElement>(".odd-combobox")!;
  const input = root.querySelector("input")!;
  const list = root.querySelector<HTMLElement>(".odd-combobox-list")!;
  const key = (name: string, init: KeyboardEventInit = {}) => input.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true, ...init }));
  const type = (value: string) => {
    input.value = value;
    input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
  };
  const active = () => document.getElementById(input.getAttribute("aria-activedescendant") ?? "")?.textContent ?? null;
  const shown = () => [...list.querySelectorAll<HTMLElement>('[role="option"]')].filter((option) => !option.hidden).map((option) => option.textContent);
  return { root, input, list, key, type, active, shown, expanded: () => input.getAttribute("aria-expanded") };
}

const settle = () => new Promise((resolve) => setTimeout(resolve));

let cleanups: (() => void)[] = [];

function enhance(root: HTMLElement): () => void {
  const cleanup = enhanceCombobox(root);
  cleanups.push(cleanup);
  return cleanup;
}

afterEach(() => {
  for (const cleanup of cleanups) cleanup();
  cleanups = [];
  document.body.innerHTML = "";
});

test("typing filters by a case-insensitive prefix and opens with nothing active", () => {
  const { root, type, shown, active, expanded } = mount();
  enhance(root);
  type("b");
  expect([shown(), active(), expanded()]).toEqual([["Berlin", "Bogotá"], null, "true"]);
});

test("the arrows skip a disabled option, wrap, and Enter writes the active option once", () => {
  const { root, input, key, active } = mount();
  enhance(root);
  const writes: string[] = [];
  input.addEventListener("input", (event) => writes.push(`${(event as InputEvent).inputType}:${input.value}`));
  key("ArrowDown");
  key("ArrowDown");
  expect(active()).toBe("Berlin");
  key("ArrowUp");
  key("ArrowUp");
  expect(active()).toBe("Cairo");
  key("ArrowDown");
  key("ArrowDown");
  key("Enter");
  expect([input.value, writes, input.getAttribute("aria-expanded")]).toEqual(["Berlin", ["insertReplacementText:Berlin"], "false"]);
});

test("choosing the text the input already holds dispatches nothing", () => {
  const { root, input, key } = mount();
  enhance(root);
  let events = 0;
  input.addEventListener("input", () => events++);
  input.addEventListener("change", () => events++);
  for (let round = 0; round < 2; round++) {
    key("ArrowDown");
    key("Enter");
  }
  expect([input.value, events]).toEqual(["Amsterdam", 2]);
});

test("an open list with no match shows a disabled No results option the arrows and Enter pass over", () => {
  const { root, list, key, type, active, expanded } = mount();
  enhance(root);
  type("zz");
  const rows = [...list.querySelectorAll('[role="option"]:not([hidden])')].map((option) => [option.textContent, option.getAttribute("aria-disabled")]);
  expect([expanded(), rows]).toEqual(["true", [["No results", "true"]]]);
  key("ArrowDown");
  expect(active()).toBe(null);
  key("Enter");
  expect(expanded()).toBe("false");
  expect(list.textContent).not.toContain("No results");
  type("c");
  expect(list.querySelectorAll('[role="option"]:not([hidden])').length).toBe(1);
});

test("data-filter=manual leaves hidden alone, opens when options land, and closes on an empty result", async () => {
  const { root, list, type, shown, expanded } = mount('data-filter="manual"', []);
  enhance(root);
  type("lov");
  expect(expanded()).toBe("false");
  list.innerHTML = `<div class="odd-combobox-option" role="option">Ada Lovelace</div><div class="odd-combobox-option" role="option">Grace Hopper</div>`;
  await settle();
  expect([expanded(), shown()]).toEqual(["true", ["Ada Lovelace", "Grace Hopper"]]);
  list.replaceChildren();
  await settle();
  expect([expanded(), list.childElementCount]).toEqual(["false", 0]);
});

test("removing the active option clears aria-activedescendant", async () => {
  const { root, input, list, key, active } = mount();
  enhance(root);
  key("ArrowDown");
  expect(active()).toBe("Amsterdam");
  list.firstElementChild!.remove();
  await settle();
  expect([input.hasAttribute("aria-activedescendant"), list.querySelector('[aria-selected="true"]')]).toEqual([false, null]);
});

test("keys during IME composition belong to the IME", () => {
  const { root, input, key, active } = mount();
  enhance(root);
  key("ArrowDown");
  key("Enter", { isComposing: true });
  key("ArrowDown", { isComposing: true });
  expect([input.value, active()]).toEqual(["", "Amsterdam"]);
});

test("Escape stops only when it closes the list, so a dialog around a closed combobox still hears it", () => {
  const { root, key, expanded } = mount();
  enhance(root);
  const heard: string[] = [];
  document.addEventListener("keydown", (event) => heard.push(event.key));
  key("ArrowDown");
  key("Escape");
  expect([expanded(), heard]).toEqual(["false", ["ArrowDown"]]);
  key("Escape");
  expect(heard).toEqual(["ArrowDown", "Escape"]);
});

test("a disabled input stays closed, and a disabled option's click never reaches the app", () => {
  const { root, input, list, key, type, expanded } = mount();
  enhance(root);
  const clicks: string[] = [];
  list.addEventListener("click", (event) => clicks.push((event.target as Element).textContent!));
  list.children[1]!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  list.children[2]!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect([clicks, input.value]).toEqual([["Berlin"], "Berlin"]);
  input.disabled = true;
  type("a");
  key("ArrowDown");
  expect(expanded()).toBe("false");
});

test("a root is wired once however many callers enhance it, and the last cleanup unwires it", () => {
  const { root, key, active, expanded } = mount();
  const first = enhance(root);
  const second = enhance(root);
  key("ArrowDown");
  expect(active()).toBe("Amsterdam");
  first();
  key("ArrowDown");
  expect(active()).toBe("Berlin");
  second();
  expect(expanded()).toBe("false");
  key("ArrowDown");
  expect([expanded(), active()]).toEqual(["false", null]);
});
