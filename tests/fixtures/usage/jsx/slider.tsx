// expect: ODD-STATIC-001 ODD-SLIDER-001 ODD-SLIDER-002 ODD-SLIDER-002 ODD-SLIDER-003 ODD-SLIDER-004
import { Slider } from "odd-design/react";
declare const copies: number;
declare function setCopies(value: number): void;
declare const kind: "range";
export const view = (
  <>
    <Slider type="range" id="copies" min={1} max={4} value={copies} onChange={(event) => setCopies(event.currentTarget.valueAsNumber)} />
    <input className="odd-slider" type="range" aria-label="Card size" />
    <Slider type={kind} aria-label="Card size" />
    <div className="odd-slider" role="slider" aria-label="Card size" aria-valuenow={65} />
    <input className="odd-slider" aria-label="Card size" />
    <Slider type="number" aria-label="Card size" />
    <Slider type="range" aria-label="Hand size" aria-disabled="true" />
    <Slider type="range" aria-label="Card size" data-tone="info" />
  </>
);
