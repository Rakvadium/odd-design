// expect: ODD-STATIC-001 ODD-COMBOBOX-001 ODD-COMBOBOX-004 ODD-COMBOBOX-005 ODD-COMBOBOX-006 ODD-COMBOBOX-007 ODD-COMBOBOX-011 ODD-COMBOBOX-009 ODD-COMBOBOX-010 ODD-STATIC-001
import { Combobox, ComboboxList, ComboboxOption, Input, type ComboboxListProps, type ComboboxOptionProps } from "odd-design/react";
declare const props: ComboboxOptionProps;
declare const filter: ComboboxListProps["data-filter"];
export const view = (
  <>
    <Combobox><Input id="a" role="combobox" aria-controls="a-list" aria-expanded="false" aria-autocomplete="list" aria-label="City" /><ComboboxList id="a-list" popover="manual" role="listbox" aria-label="Cities"><ComboboxOption role="option">Amsterdam</ComboboxOption><ComboboxOption role="option" aria-disabled="true">Atlantis</ComboboxOption></ComboboxList></Combobox>
    <ComboboxOption {...props} />
    <section className="odd-combobox"><Input id="b" role="combobox" aria-controls="b-list" aria-autocomplete="list" aria-label="City" /><ComboboxList id="b-list" popover="manual" role="listbox" aria-label="Cities" /></section>
    <ComboboxList id="c" popover="auto" role="listbox" aria-label="Cities" />
    <ComboboxList id="d" popover="manual" role="menu" aria-label="Cities" />
    <ComboboxList id="e" popover="manual" role="listbox" />
    <ComboboxList id="f" popover="manual" role="listbox" aria-label="Cities" data-filter="auto" />
    <Combobox role="combobox"><Input id="g" role="combobox" aria-controls="g-list" aria-autocomplete="list" aria-label="City" /><ComboboxList id="g-list" popover="manual" role="listbox" aria-label="Cities" /></Combobox>
    <ComboboxOption role="option" disabled>Atlantis</ComboboxOption>
    <ComboboxOption role="option" aria-selected="true">Amsterdam</ComboboxOption>
    <ComboboxList id="h" popover="manual" role="listbox" aria-label="Cities" data-filter={filter} />
  </>
);
