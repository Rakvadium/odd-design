import type { ReactElement } from "react";
import type { BreadcrumbRule } from "../js/usage/contract.ts";
import { part, type Contract, type Named, type Native } from "./part.ts";

interface BreadcrumbContract extends Contract<"Breadcrumb", BreadcrumbRule> {}

interface BreadcrumbBase extends BreadcrumbContract, Native<"Breadcrumb", keyof BreadcrumbContract> {}

export type BreadcrumbProps = BreadcrumbBase & Named<BreadcrumbRule>;

export const Breadcrumb: (props: BreadcrumbProps) => ReactElement = part("Breadcrumb");
