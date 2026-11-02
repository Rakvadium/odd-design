"use client";

import { type ComponentPropsWithRef, type ReactElement, type ReactNode } from "react";
import { FieldFrame, useField, type FieldOwned, type Labeled } from "./frame.ts";
import { cx, useOddId, type Passthrough, type Root } from "./own.ts";


type TextType = "text" | "email" | "password" | "search" | "tel" | "url" | "number" | "date" | "time" | "datetime-local" | "month" | "week";

export type InputProps = Labeled &
  Passthrough<"input", FieldOwned, "id" | "type"> & {
    readonly type?: TextType;
  };

export function Input({ label, hideLabel, hint, error, id, className, ...rest }: InputProps): ReactElement {
  const field = { label, hideLabel, hint, error, id, className };
  const { ids, wiring } = useField({ ...field, "aria-describedby": rest["aria-describedby"] });
  return (
    <FieldFrame field={field} ids={ids}>
      <input {...(rest as ComponentPropsWithRef<"input">)} {...wiring} className="odd-input" />
    </FieldFrame>
  );
}

export type TextareaProps = Labeled & Passthrough<"textarea", FieldOwned, "id">;

export function Textarea({ label, hideLabel, hint, error, id, className, ...rest }: TextareaProps): ReactElement {
  const field = { label, hideLabel, hint, error, id, className };
  const { ids, wiring } = useField({ ...field, "aria-describedby": rest["aria-describedby"] });
  return (
    <FieldFrame field={field} ids={ids}>
      <textarea {...(rest as ComponentPropsWithRef<"textarea">)} {...wiring} className="odd-textarea" />
    </FieldFrame>
  );
}

export type SelectProps = Labeled &
  Passthrough<"select", FieldOwned, "id"> & {
    /** Native option elements. */
    readonly children: ReactNode;
  };

export function Select({ label, hideLabel, hint, error, id, className, children, ...rest }: SelectProps): ReactElement {
  const field = { label, hideLabel, hint, error, id, className };
  const { ids, wiring } = useField({ ...field, "aria-describedby": rest["aria-describedby"] });
  return (
    <FieldFrame field={field} ids={ids}>
      <select {...(rest as ComponentPropsWithRef<"select">)} {...wiring} className="odd-select">
        {children}
      </select>
    </FieldFrame>
  );
}

type ChoiceOwned = "type" | "aria-disabled";

export type CheckboxProps = Root &
  Passthrough<"input", ChoiceOwned> & {
    readonly label: ReactNode;
  };

/** label.odd-choice around a native checkbox. */
export function Checkbox({ label, className, ...rest }: CheckboxProps): ReactElement {
  return (
    <label className={cx("odd-choice", className)}>
      <input {...(rest as ComponentPropsWithRef<"input">)} type="checkbox" />
      {label}
    </label>
  );
}

export type SwitchProps = CheckboxProps;

/** label.odd-choice around a checkbox with the switch role. */
export function Switch({ label, className, ...rest }: SwitchProps): ReactElement {
  return (
    <label className={cx("odd-choice", className)}>
      <input {...(rest as ComponentPropsWithRef<"input">)} type="checkbox" role="switch" className="odd-switch" />
      {label}
    </label>
  );
}

export type ChoiceOption<V extends string> = { readonly value: V; readonly label: string; readonly disabled?: boolean };

type GroupProps<V extends string> = Root & {
  /** The legend, which names the group. */
  readonly label: string;
  readonly options: readonly [ChoiceOption<V>, ...ChoiceOption<V>[]];
  /** The radios' shared name. Generated when absent, so two groups never share one by accident. */
  readonly name?: string;
  readonly defaultValue?: NoInfer<V>;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly onValueChange?: (value: V) => void;
};

export type RadioGroupProps<V extends string> = GroupProps<V>;
export type SegmentedProps<V extends string> = GroupProps<V>;

function radios<V extends string>({ options, name, defaultValue, required, onValueChange }: GroupProps<V>, group: string, className?: string): ReactNode {
  return options.map((option) => (
    <label key={option.value} className={className}>
      <input
        type="radio"
        name={name ?? group}
        value={option.value}
        defaultChecked={option.value === defaultValue}
        disabled={option.disabled}
        required={required}
        onChange={onValueChange && (() => onValueChange(option.value))}
      />
      {option.label}
    </label>
  ));
}

/** fieldset > legend.odd-label + one label.odd-choice per option, stacked. */
export function RadioGroup<const V extends string>(props: RadioGroupProps<V>): ReactElement {
  const group = useOddId(props.name);
  return (
    <fieldset className={cx("odd-stack", props.className)} disabled={props.disabled}>
      <legend className="odd-label">{props.label}</legend>
      {radios(props, group, "odd-choice")}
    </fieldset>
  );
}

/** fieldset.odd-segmented > legend + one label per option, drawn as one control. */
export function Segmented<const V extends string>(props: SegmentedProps<V>): ReactElement {
  const group = useOddId(props.name);
  return (
    <fieldset className={cx("odd-segmented", props.className)} disabled={props.disabled}>
      <legend>{props.label}</legend>
      {radios(props, group)}
    </fieldset>
  );
}
