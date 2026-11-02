import { afterEach, expect, test } from "bun:test";
import { enhanceRangeField } from "../src/js/range-field.ts";

function mount() {
  document.body.innerHTML = /* html */ `<div class="odd-field">
    <label class="odd-label" id="speed-label" for="speed">Speed</label>
    <div class="odd-row" id="speed-row">
      <input class="odd-slider" type="range" id="speed" min="0" max="200" step="5" value="40">
      <input class="odd-input" type="number" id="speed-number" value="7" aria-labelledby="speed-label speed-unit" aria-describedby="speed-hint">
      <span class="odd-muted" id="speed-unit">mm/s</span>
    </div>
    <p class="odd-hint" id="speed-hint">0 to 200</p>
  </div>`;
  const root = document.getElementById("speed-row")!;
  const slider = root.querySelector<HTMLInputElement>('[type="range"]')!;
  const number = root.querySelector<HTMLInputElement>('[type="number"]')!;
  const events: string[] = [];
  for (const type of ["input", "change"]) {
    document.body.addEventListener(type, (event) => events.push(`${type} ${(event.target as HTMLInputElement).id} ${(event.target as HTMLInputElement).value}`));
  }
  const cleanup = enhanceRangeField(root);
  const type = (value: string) => {
    number.value = value;
    number.dispatchEvent(new Event("input", { bubbles: true }));
  };
  const commit = () => number.dispatchEvent(new Event("change", { bubbles: true }));
  const error = () => document.getElementById("speed-number-error")?.textContent ?? null;
  return { slider, number, events, cleanup, type, commit, error };
}

afterEach(() => {
  document.body.innerHTML = "";
});

test("the number input takes the slider's range and value", () => {
  const { number } = mount();
  expect([number.min, number.max, number.step, number.value]).toEqual(["0", "200", "5", "40"]);
});

test("moving the slider writes the number", () => {
  const { slider, number } = mount();
  slider.value = "120";
  slider.dispatchEvent(new Event("input", { bubbles: true }));
  expect(number.value).toBe("120");
});

test("a typed number moves the slider, and the page hears only the slider", () => {
  const { slider, events, type, commit } = mount();
  type("85");
  commit();
  expect(slider.value).toBe("85");
  expect(events).toEqual(["input speed 85", "change speed 85"]);
});

test("an out-of-range number leaves the slider and shows an error on commit until fixed", () => {
  const { slider, number, events, type, commit, error } = mount();
  type("250");
  expect(error()).toBeNull();
  commit();
  expect(slider.value).toBe("40");
  expect(events).toEqual([]);
  expect(error()).toBe("Enter a number from 0 to 200, in steps of 5.");
  expect(number.getAttribute("aria-invalid")).toBe("true");
  expect(number.getAttribute("aria-describedby")).toBe("speed-hint speed-number-error");
  type("150");
  expect(error()).toBeNull();
  expect(number.hasAttribute("aria-invalid")).toBe(false);
  expect(number.getAttribute("aria-describedby")).toBe("speed-hint");
  expect(slider.value).toBe("150");
});

test("an empty number on commit goes back to the slider's value", () => {
  const { number, type, commit, error } = mount();
  type("");
  commit();
  expect(number.value).toBe("40");
  expect(error()).toBeNull();
});

test("cleanup stops the sync", () => {
  const { slider, cleanup, type } = mount();
  cleanup();
  type("85");
  expect(slider.value).toBe("40");
});
