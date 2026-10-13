import "odd-design/fonts.css";
import "odd-design";
import "./settings.css";
import {
  applyAppearance,
  CHROMES,
  loadAppearance,
  MODES,
  PALETTES,
  saveAppearance,
  type Appearance,
} from "odd-design/appearance";

const AXES = [
  { axis: "chrome", label: "Chrome", values: CHROMES },
  { axis: "palette", label: "Palette", values: PALETTES },
  { axis: "mode", label: "Mode", values: MODES },
] as const satisfies ReadonlyArray<{ axis: keyof Appearance; label: string; values: readonly string[] }>;

function renderAppearanceControls(container: HTMLElement) {
  let appearance = loadAppearance();
  container.innerHTML = AXES.map(
    ({ axis, label, values }) => `
      <div class="ds-stack" style="--gap: var(--space-2)">
        <span class="ds-label" aria-hidden="true">${label}</span>
        <fieldset class="ds-segmented" data-axis="${axis}">
          <legend>${label}</legend>
          ${values.map((v) => `<label><input type="radio" name="${axis}" value="${v}" ${v === appearance[axis] ? "checked" : ""}> ${v}</label>`).join("")}
        </fieldset>
      </div>`,
  ).join("");

  container.addEventListener("change", (event) => {
    const input = event.target as HTMLInputElement;
    const axis = input.closest<HTMLElement>("[data-axis]")?.dataset.axis as keyof Appearance | undefined;
    if (!axis) return;
    appearance = { ...appearance, [axis]: input.value };
    applyAppearance(appearance);
    saveAppearance(appearance);
  });
}

// field.css asks for the error element to exist only while the field is invalid,
// since a hidden node referenced by aria-describedby is still announced.
function validateEmail(input: HTMLInputElement) {
  const errorId = `${input.id}-error`;
  document.getElementById(errorId)?.remove();
  const describedBy = (input.getAttribute("aria-describedby") ?? "").split(" ").filter((id) => id && id !== errorId);
  if (input.validity.valid) {
    input.removeAttribute("aria-invalid");
  } else {
    const error = document.createElement("p");
    error.className = "ds-error";
    error.id = errorId;
    error.textContent = input.validity.valueMissing ? "Enter your email address." : "Enter an email address like name@example.com.";
    input.after(error);
    input.setAttribute("aria-invalid", "true");
    describedBy.push(errorId);
  }
  input.setAttribute("aria-describedby", describedBy.join(" "));
  return input.validity.valid;
}

function wireProfileForm(form: HTMLFormElement) {
  const email = form.querySelector<HTMLInputElement>("#email")!;
  const status = form.querySelector<HTMLElement>("#profile-status")!;
  email.addEventListener("change", () => validateEmail(email));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateEmail(email) || !form.checkValidity()) {
      status.textContent = "Fix the highlighted fields to save.";
      return;
    }
    status.textContent = "Profile saved.";
  });
  form.addEventListener("reset", () => {
    status.textContent = "";
    setTimeout(() => validateEmail(email));
  });
}

renderAppearanceControls(document.querySelector<HTMLElement>("#appearance-controls")!);
wireProfileForm(document.querySelector<HTMLFormElement>("#profile-form")!);
