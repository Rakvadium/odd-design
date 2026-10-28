import type { ReactElement } from "react";
import type { SliderRule } from "../js/usage/contract.ts";
import { part, type Contract, type Native } from "./part.ts";

interface SliderContract extends Contract<"Slider", SliderRule> {}

export interface SliderProps extends SliderContract, Native<"Slider", keyof SliderContract> {}

export const Slider: (props: SliderProps) => ReactElement = part("Slider");
