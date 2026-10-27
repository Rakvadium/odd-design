/*
 * Range field: markup is described in src/css/components/range-field.css.
 *
 * enhanceRangeField copies the slider's min, max, and step to the number input, then keeps them in
 * sync. Moving the slider writes the number. Typing a valid number moves the slider and fires input
 * on it, and committing one fires change on it. The number input's own input and change events stop
 * at the number input, so a page listens to the slider and hears each change once. A number that
 * is out of range or off step leaves the slider where it is. On commit it gets aria-invalid and an
 * odd-error after the row, named by its aria-describedby, until the number is valid again. An
 * empty number on commit goes back to the slider's value.
 */
export type RangeFieldOptions = {
  /** The error text for a number the slider can't take. */
  message?: (range: { min: string; max: string; step: string }) => string;
};

const defaultMessage = ({ min, max, step }: { min: string; max: string; step: string }) =>
  step === "1" || step === "any" ? `Enter a number from ${min} to ${max}.` : `Enter a number from ${min} to ${max}, in steps of ${step}.`;

let ids = 0;

export function enhanceRangeField(root: HTMLElement, { message = defaultMessage }: RangeFieldOptions = {}): () => void {
  const slider = root.querySelector<HTMLInputElement>('input[type="range"]');
  const number = root.querySelector<HTMLInputElement>('input[type="number"]');
  if (!slider || !number) return () => {};

  // A range input with no min, max, or step uses 0, 100, and 1.
  const range = { min: slider.getAttribute("min") ?? "0", max: slider.getAttribute("max") ?? "100", step: slider.getAttribute("step") ?? "1" };
  number.min = range.min;
  number.max = range.max;
  number.step = range.step;
  number.value = slider.value;

  const errorId = `${number.id || `odd-range-field-${++ids}`}-error`;
  const describedBy = () => (number.getAttribute("aria-describedby") ?? "").split(/\s+/).filter((id) => id !== "" && id !== errorId);

  const clearError = () => {
    document.getElementById(errorId)?.remove();
    number.removeAttribute("aria-invalid");
    const rest = describedBy();
    if (rest.length > 0) number.setAttribute("aria-describedby", rest.join(" "));
    else number.removeAttribute("aria-describedby");
  };

  const showError = () => {
    let error = document.getElementById(errorId);
    if (!error) {
      error = document.createElement("p");
      error.className = "odd-error";
      error.id = errorId;
      root.after(error);
    }
    error.textContent = message(range);
    number.setAttribute("aria-invalid", "true");
    number.setAttribute("aria-describedby", [...describedBy(), errorId].join(" "));
  };

  const fits = () => number.value !== "" && number.validity.valid;

  const onSliderInput = () => {
    // The number already says this value, perhaps as "15." mid-typing; rewriting it would move the caret.
    if (number.valueAsNumber === slider.valueAsNumber) return;
    number.value = slider.value;
    clearError();
  };

  const onNumberInput = (event: Event) => {
    event.stopPropagation();
    if (!fits()) return;
    clearError();
    slider.value = number.value;
    slider.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const onNumberChange = (event: Event) => {
    event.stopPropagation();
    if (number.value === "") {
      number.value = slider.value;
      clearError();
      return;
    }
    if (!fits()) {
      showError();
      return;
    }
    slider.dispatchEvent(new Event("change", { bubbles: true }));
  };

  slider.addEventListener("input", onSliderInput);
  number.addEventListener("input", onNumberInput);
  number.addEventListener("change", onNumberChange);

  return () => {
    slider.removeEventListener("input", onSliderInput);
    number.removeEventListener("input", onNumberInput);
    number.removeEventListener("change", onNumberChange);
  };
}
