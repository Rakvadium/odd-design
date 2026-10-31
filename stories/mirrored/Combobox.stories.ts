import { mirrored, type Node, type Scene } from "../mirror.ts";

type Args = {
  label: string;
  filter: "auto" | "manual";
  disabled: boolean;
  invalid: boolean;
  disabledOption: boolean;
};

const meta = {
  title: "Components/Combobox",
  args: { label: "City", filter: "auto", disabled: false, invalid: false, disabledOption: true },
  argTypes: {
    filter: { control: "inline-radio", options: ["auto", "manual"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "`Combobox` from `odd-design/react` renders `div.odd-combobox` and runs `enhanceCombobox` on it. Inside it go Field's `Input` with `role=\"combobox\"`, `aria-controls`, and `aria-autocomplete=\"list\"`, and a `ComboboxList` with `popover=\"manual\"` and `role=\"listbox\"` that holds each `ComboboxOption`. Typing filters by prefix and opens the list. The arrows move between options and skip disabled ones, Enter or a click chooses, and Escape closes. Focus stays in the input. Set `data-filter=\"manual\"` on the list when your code filters, and render the results as options.",
      },
    },
  },
};

export default meta;

const CITIES = ["Amsterdam", "Athens", "Atlantis", "Berlin", "Bogotá", "Cairo"];

const option = (text: string, props: Partial<Node<"ComboboxOption">["props"]> = {}): Node<"ComboboxOption"> => ({
  of: "ComboboxOption",
  props: { role: "option", ...props },
  children: [text],
});

type Box = {
  id: string;
  label: string;
  options: readonly Node<"ComboboxOption">[];
  input?: Partial<Node<"Input">["props"]>;
  list?: Partial<Node<"ComboboxList">["props"]>;
  error?: string;
};

const field = ({ id, label, options, input = {}, list = {}, error }: Box): Node<"Field"> => ({
  of: "Field",
  children: [
    { of: "Label", props: { htmlFor: id, id: `${id}-label` }, children: [label] },
    {
      of: "Combobox",
      children: [
        {
          of: "Input",
          props: {
            id,
            role: "combobox",
            "aria-controls": `${id}-list`,
            "aria-expanded": "false",
            "aria-autocomplete": "list",
            ...(error === undefined ? {} : { "aria-invalid": "true", "aria-describedby": `${id}-error` }),
            ...input,
          },
        },
        { of: "ComboboxList", props: { id: `${id}-list`, popover: "manual", role: "listbox", "aria-labelledby": `${id}-label`, ...list }, children: options },
      ],
    },
    ...(error === undefined ? [] : [{ of: "FieldError", props: { id: `${id}-error` }, children: [error] } satisfies Node<"FieldError">]),
  ],
});

const parts = (id: string): Node<"Field"> =>
  field({ id, label: "City", options: [option("Amsterdam"), option("Atlantis", { "aria-disabled": "true" }), option("Berlin")] });

export const Playground = mirrored<Args>({
  scene: ({ label, filter, disabled, invalid, disabledOption }) => ({
    of: "div",
    props: { style: { maxInlineSize: "20rem" } },
    children: [
      field({
        id: "playground-city",
        label,
        options: CITIES.map((city) => option(city, disabledOption && city === "Atlantis" ? { "aria-disabled": "true" } : {})),
        input: { disabled },
        list: { "data-filter": filter === "auto" ? undefined : filter },
        ...(invalid ? { error: "Pick a city from the list." } : {}),
      }),
    ],
  }),
  aria: `
- text: City
- combobox "City"`,
});

export const Parts = mirrored<Args>({
  scene: () => ({ of: "div", props: { style: { maxInlineSize: "20rem" } }, children: [parts("parts-city")] }),
  aria: `
- text: City
- combobox "City"`,
});

const filled = (value: string) => CITIES.map((city) => option(city, city.startsWith(value) ? {} : { hidden: true }));

export const States = mirrored<Args>({
  scene: () => ({
    of: "div",
    props: { className: "odd-stack", style: { maxInlineSize: "20rem" } },
    children: [
      field({
        id: "states-empty",
        label: "Empty",
        options: CITIES.map((city) => option(city, city === "Atlantis" ? { "aria-disabled": "true" } : {})),
        input: { placeholder: "Search cities" },
      }),
      field({ id: "states-filled", label: "Filled", options: filled("Berlin"), input: { defaultValue: "Berlin" } }),
      field({ id: "states-invalid", label: "Invalid", options: filled("Atlantis"), input: { defaultValue: "Atlantis" }, error: "Pick a city from the list." }),
      field({ id: "states-disabled", label: "Disabled", options: filled("Cairo"), input: { defaultValue: "Cairo", disabled: true } }),
    ],
  }),
  aria: `
- text: Empty
- combobox "Empty"
- text: Filled
- combobox "Filled": Berlin
- text: Invalid
- combobox "Invalid" [invalid]: Atlantis
- paragraph: Pick a city from the list.
- text: Disabled
- combobox "Disabled" [disabled]: Cairo`,
});

export const Open = {
  ...mirrored<Args>({
    scene: () => ({ of: "div", props: { style: { maxInlineSize: "20rem", minBlockSize: "16rem" } }, children: [parts("open-city")] }),
    aria: `
- text: City
- combobox "City" [expanded]
- listbox "City":
  - option "Amsterdam" [selected]
  - option "Atlantis" [disabled]
  - option "Berlin"`,
  }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>("#open-city")!;
    const list = canvasElement.querySelector<HTMLElement>("#open-city-list")!;
    await new Promise((resolve) => setTimeout(resolve));
    input.focus();
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    await Promise.all(list.getAnimations().map((animation) => animation.finished));
  },
};

const PEOPLE = ["Ada Lovelace", "Alan Turing", "Grace Hopper", "Katherine Johnson", "Margaret Hamilton"];

const assign: Scene = {
  of: "div",
  children: [
    { of: "Button", props: { commandfor: "assign-dialog", command: "show-modal" }, children: ["Assign"] },
    {
      of: "Dialog",
      props: { id: "assign-dialog", "aria-labelledby": "assign-title", closedby: "any" },
      children: [
        {
          of: "div",
          props: { className: "odd-dialog-body" },
          children: [
            { of: "h2", props: { className: "odd-dialog-title", id: "assign-title" }, children: ["Assign the review"] },
            field({ id: "assignee", label: "Assignee", options: [], list: { "data-filter": "manual" } }),
            { of: "p", props: { className: "odd-muted", id: "assign-log", "aria-live": "polite" } },
            {
              of: "DialogActions",
              children: [{ of: "Button", props: { commandfor: "assign-dialog", command: "close" }, children: ["Close"] }],
            },
          ],
        },
      ],
    },
  ],
};

export const Async = {
  ...mirrored<Args>({
    scene: () => assign,
    aria: `
- button "Assign"`,
  }),
  play: ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>("#assignee")!;
    const list = canvasElement.querySelector<HTMLElement>("#assignee-list")!;
    const log = canvasElement.querySelector("#assign-log")!;
    let latest = 0;
    input.addEventListener("input", (event) => {
      if ((event as InputEvent).inputType === "insertReplacementText") return;
      const query = input.value.trim().toLowerCase();
      const mine = ++latest;
      setTimeout(() => {
        if (mine !== latest) return;
        const found = query === "" ? [] : PEOPLE.filter((person) => person.toLowerCase().includes(query));
        const row = (text: string, disabled: boolean) => {
          const element = document.createElement("div");
          element.className = "odd-combobox-option";
          element.setAttribute("role", "option");
          if (disabled) element.setAttribute("aria-disabled", "true");
          element.textContent = text;
          return element;
        };
        list.replaceChildren(...(query !== "" && found.length === 0 ? [row("No results", true)] : found.map((person) => row(person, false))));
      }, 150);
    });
    list.addEventListener("click", (event) => {
      const chosen = (event.target as Element).closest(".odd-combobox-option");
      if (chosen) log.textContent = `Assigned to ${chosen.textContent}`;
    });
  },
};
