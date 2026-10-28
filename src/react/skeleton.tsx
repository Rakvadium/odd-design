import type { ReactElement } from "react";
import type { SkeletonRule } from "../js/usage/contract.ts";
import { part, type Contract, type Message, type Native } from "./part.ts";

interface SkeletonContract extends Contract<"Skeleton", SkeletonRule> {
  /** A skeleton block is hidden, so text inside it is never read. Put the loading words on the region. */
  children?: Message<"ODD-SKELETON-004">;
}

export interface SkeletonProps extends SkeletonContract, Native<"Skeleton", keyof SkeletonContract> {}

export const Skeleton: (props: SkeletonProps) => ReactElement = part("Skeleton");
