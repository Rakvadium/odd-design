import { afterEach, expect, test } from "bun:test";
import { enhanceStepper } from "../src/js/stepper.ts";

const markup = (inputAttributes: string) => /* html */ `<div class="odd-stepper" role="group" aria-label="Base">
  <button class="odd-button" type="button" data-step="-10">−10</button>
  <button class="odd-button" type="button" data-step="-1">−1</button>
  <input class="odd-input" type="number" ${inputAttributes}>
  <button class="odd-button" type="button" data-step="1">+1</button>
  <button class="odd-button" type="button" data-step="10">+10</button>
</div>`;

function mount(inputAttributes: string) {
  document.body.innerHTML = markup(inputAttributes);
  const root = document.querySelector<HTMLElement>(".odd-stepper")!;
  const input = root.querySelector("input")!;
  const button = (step: string) => root.querySelector<HTMLButtonElement>(`[data-step="${step}"]`)!;
  const events: string[] = [];
  root.addEventListener("input", () => events.push(`input ${input.value}`));
  root.addEventListener("change", () => events.push(`change ${input.value}`));
  const cleanup = enhanceStepper(root);
  const offButtons = () => [...root.querySelectorAll("button")].filter((b) => b.getAttribute("aria-disabled") === "true").map((b) => b.dataset.step);
  return { root, input, button, events, cleanup, offButtons };
}

afterEach(() => {
  document.body.innerHTML = "";
});

// happy-dom's stepUp ignores the step attribute, so fractional steps are checked in e2e/behavior.spec.ts.
test("a keyboard click steps by the button's count and fires input then change", () => {
  const { button, events } = mount('min="-90" max="90" value="0"');
  button("10").click();
  button("-1").click();
  expect(events).toEqual(["input 10", "change 10", "input 9", "change 9"]);
});

test("steps clamp at the limits and the buttons toward a limit are marked", () => {
  const { button, events, offButtons } = mount('min="0" max="12" step="1" value="5"');
  expect(offButtons()).toEqual([]);
  button("10").click();
  expect(events).toEqual(["input 12", "change 12"]);
  expect(offButtons()).toEqual(["1", "10"]);
  button("1").click();
  expect(events).toHaveLength(2);
});

test("disabled on the input marks every button and stops stepping", async () => {
  const { input, button, events, offButtons } = mount('min="0" max="10" value="5"');
  input.disabled = true;
  await Promise.resolve();
  expect(offButtons()).toEqual(["-10", "-1", "1", "10"]);
  button("1").click();
  expect(events).toEqual([]);
});

test("a held pointer press repeats, then fires one change on release", async () => {
  const { root, button, events } = mount('min="0" max="100" value="0"');
  const plus = button("1");
  plus.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, pointerId: 1 }));
  await Bun.sleep(650);
  root.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1 }));
  plus.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
  const inputs = events.filter((event) => event.startsWith("input"));
  expect(inputs.length).toBeGreaterThanOrEqual(3);
  expect(inputs.slice(0, 3)).toEqual(["input 1", "input 2", "input 3"]);
  expect(events.at(-1)).toBe(`change ${inputs.length}`);
  expect(events.filter((event) => event.startsWith("change"))).toHaveLength(1);
});

test("cleanup stops the stepper", () => {
  const { button, events, cleanup } = mount('value="0"');
  cleanup();
  button("1").click();
  expect(events).toEqual([]);
});
