import type { ReactElement } from "react";
import type { BadgeRule } from "../js/usage/contract.ts";
import { part, type Contract, type Native, type Values } from "./part.ts";

export type BadgeTone = Values<BadgeRule, "data-tone">;

interface BadgeContract extends Contract<"Badge", BadgeRule> {}

export interface BadgeProps extends BadgeContract, Native<"Badge", keyof BadgeContract> {}

export const Badge: (props: BadgeProps) => ReactElement = part("Badge");
