import { createElement, type ReactElement } from "react";

/** The magnifier inside Search. It is decoration: the label names the field. */
export const searchIcon: ReactElement = createElement(
  "svg",
  {
    "aria-hidden": "true",
    focusable: "false",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
  createElement("circle", { cx: "11", cy: "11", r: "7" }),
  createElement("path", { d: "m21 21-4.3-4.3" }),
);
