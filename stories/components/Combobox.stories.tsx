import type { ReactNode } from "react";
import { Button, Combobox, ComboboxOption, Dialog, Grid, GridItem, Muted, Stack } from "odd-design/react";
import { mirrored } from "../story.ts";

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
          "`Combobox` from `odd-design/react` renders a whole field: the label, `div.odd-combobox` with the input and its listbox, and a hint or error. Pass each `ComboboxOption` as a child. The component writes the input's role, `aria-controls`, and `aria-autocomplete`, names the list by the label, and renders a hidden No results option. `enhanceCombobox` runs on it, so typing filters by prefix and opens the list, the arrows move between options and skip disabled ones, Enter or a click chooses, and Escape closes. Focus stays in the input. Pass `filter=\"manual\"` when your code filters, and render the results as options.",
      },
    },
  },
};

export default meta;

const CITIES = ["Amsterdam", "Athens", "Atlantis", "Berlin", "Bogotá", "Cairo"];

function column(field: ReactNode) {
  return (
    <Grid>
      <GridItem span={4}>{field}</GridItem>
    </Grid>
  );
}

function parts(id: string) {
  return (
    <Combobox id={id} label="City">
      <ComboboxOption>Amsterdam</ComboboxOption>
      <ComboboxOption disabled>Atlantis</ComboboxOption>
      <ComboboxOption>Berlin</ComboboxOption>
    </Combobox>
  );
}

export const Playground = mirrored<Args>({
  scene: ({ label, filter, disabled, invalid, disabledOption }) =>
    column(
      <Combobox
        id="playground-city"
        label={label}
        filter={filter === "auto" ? undefined : filter}
        disabled={disabled}
        error={invalid ? "Pick a city from the list." : undefined}
      >
        {CITIES.map((city) => (
          <ComboboxOption key={city} disabled={disabledOption && city === "Atlantis"}>
            {city}
          </ComboboxOption>
        ))}
      </Combobox>,
    ),
  aria: `
- text: City
- combobox "City"`,
});

export const Parts = mirrored<Args>({
  scene: () => column(parts("parts-city")),
  aria: `
- text: City
- combobox "City"`,
});

function filled(value: string) {
  return CITIES.map((city) => (
    <ComboboxOption key={city} hidden={!city.startsWith(value)}>
      {city}
    </ComboboxOption>
  ));
}

export const States = mirrored<Args>({
  scene: () =>
    column(
      <Stack>
        <Combobox id="states-empty" label="Empty" placeholder="Search cities">
          {CITIES.map((city) => (
            <ComboboxOption key={city} disabled={city === "Atlantis"}>
              {city}
            </ComboboxOption>
          ))}
        </Combobox>
        <Combobox id="states-filled" label="Filled" defaultValue="Berlin">
          {filled("Berlin")}
        </Combobox>
        <Combobox id="states-invalid" label="Invalid" defaultValue="Atlantis" error="Pick a city from the list.">
          {filled("Atlantis")}
        </Combobox>
        <Combobox id="states-disabled" label="Disabled" defaultValue="Cairo" disabled>
          {filled("Cairo")}
        </Combobox>
      </Stack>,
    ),
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
    scene: () => column(parts("open-city")),
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
    input.focus();
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }));
    await Promise.all(list.getAnimations().map((animation) => animation.finished));
  },
};

const PEOPLE = ["Ada Lovelace", "Alan Turing", "Grace Hopper", "Katherine Johnson", "Margaret Hamilton"];

function assign() {
  return (
    <Dialog
      id="assign-dialog"
      trigger={<Button>Assign</Button>}
      title="Assign the review"
      dismissible
      actions={<Button command="close">Close</Button>}
    >
      <Combobox id="assignee" label="Assignee" filter="manual" />
      <Muted id="assign-log" aria-live="polite">
        {null}
      </Muted>
    </Dialog>
  );
}

export const Async = {
  ...mirrored<Args>({
    scene: assign,
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
