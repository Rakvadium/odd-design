"use client";

import { useState, type ComponentPropsWithRef, type ReactElement } from "react";
import { FieldFrame, useField, type FieldOwned, type Labeled } from "./frame.ts";
import type { Passthrough } from "./own.ts";

export type SliderProps = Labeled &
  Passthrough<"input", FieldOwned | "type", "id"> & {
    /** Shows the value in output.odd-stat-value after the slider, and keeps it in step as the thumb moves. */
    readonly showValue?: boolean;
    /** Writes the shown value, such as "3 of 4". */
    readonly formatValue?: (value: number) => string;
  };

/** A range's value before anyone moves it: the browser's midpoint when no value is set. */
function initial(value: unknown, min: unknown, max: unknown): number {
  if (value !== undefined) return Number(value);
  const low = min === undefined ? 0 : Number(min);
  const high = max === undefined ? 100 : Number(max);
  return low + (high - low) / 2;
}

/** input.odd-slider[type=range] in the field frame, with an optional output of its value. */
export function Slider({ label, hideLabel, hint, error, id, className, showValue, formatValue = String, onChange, ...rest }: SliderProps): ReactElement {
  const field = { label, hideLabel, hint, error, id, className };
  const { ids, wiring } = useField({ ...field, "aria-describedby": rest["aria-describedby"] });
  const [moved, setMoved] = useState<number>();
  const shown = rest.value !== undefined ? Number(rest.value) : (moved ?? initial(rest.defaultValue, rest.min, rest.max));
  return (
    <FieldFrame field={field} ids={ids}>
      <input
        {...(rest as ComponentPropsWithRef<"input">)}
        {...wiring}
        type="range"
        className="odd-slider"
        onChange={(event) => {
          setMoved(event.currentTarget.valueAsNumber);
          onChange?.(event);
        }}
      />
      {showValue ? (
        <output className="odd-stat-value" id={`${ids.control}-value`} htmlFor={ids.control}>
          {formatValue(shown)}
        </output>
      ) : null}
    </FieldFrame>
  );
}
