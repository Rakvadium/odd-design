import { readdirSync, readFileSync } from "node:fs";
import { expect, test } from "bun:test";
import { Linter } from "eslint";
import config from "../eslint.config.js";

const linter = new Linter({ configType: "flat" });
const flat = [...config, { ignores: ["!tests/fixtures/**"] }];

type Report = { ruleId: string | null; severity: number; line: number; column: number; message: string };

function lint(filename: string, code = readFileSync(filename, "utf8")): Report[] {
  return linter.verify(code, flat, { filename }).map((message) => ({
    ruleId: message.ruleId,
    severity: message.severity,
    line: message.line,
    column: message.column,
    message: message.message,
  }));
}

function codeOf(message: string): string {
  return message.slice(0, message.indexOf(":"));
}

function lineText(source: string, line: number): string {
  return source.split(/\r?\n/)[line - 1] ?? "";
}

function expectedCodes(html: string): string[] {
  const match = /^<!-- expect: (.+) -->/.exec(html);
  if (match === null || match[1] === undefined) throw new Error("fixture has no expect line");
  return match[1] === "none" ? [] : match[1].split(" ");
}

const places: Record<string, readonly (readonly [string, number, number, string])[]> = {
  "odd-button-001.bad.html": [
    ["ODD-BUTTON-001", 2, 7, "class"],
    ["ODD-BUTTON-001", 3, 6, "class"],
  ],
  "odd-button-002.bad.html": [
    ["ODD-BUTTON-002", 2, 28, "data-variant"],
    ["ODD-BUTTON-002", 3, 28, "data-variant"],
    ["ODD-BUTTON-002", 4, 28, "data-variant"],
    ["ODD-BUTTON-002", 5, 28, "data-variant"],
  ],
  "odd-button-003.bad.html": [
    ["ODD-BUTTON-003", 2, 28, "data-size"],
    ["ODD-BUTTON-003", 3, 28, "data-size"],
    ["ODD-BUTTON-003", 4, 28, "data-size"],
  ],
  "odd-button-004.bad.html": [
    ["ODD-BUTTON-004", 2, 28, "data-icon-only"],
    ["ODD-BUTTON-004", 3, 28, "data-icon-only"],
    ["ODD-BUTTON-004", 4, 28, "data-icon-only"],
  ],
  "odd-button-005.bad.html": [
    ["ODD-BUTTON-005", 2, 28, "aria-disabled"],
    ["ODD-BUTTON-005", 3, 28, "aria-disabled"],
  ],
  "odd-button-006.bad.html": [["ODD-BUTTON-006", 2, 28, "aria-busy"]],
  "odd-button-007.bad.html": [["ODD-BUTTON-007", 2, 28, "disabled"]],
  "odd-button-008.bad.html": [
    ["ODD-BUTTON-008", 2, 1, "<button"],
    ["ODD-BUTTON-008", 3, 1, "<button"],
  ],
  "odd-button-009.bad.html": [["ODD-BUTTON-009", 2, 1, "<a"]],
  "odd-button-010.bad.html": [["ODD-BUTTON-010", 2, 28, "href"]],
  "odd-button-011.bad.html": [["ODD-BUTTON-011", 2, 36, "aria-current"]],
  "odd-button-012.bad.html": [["ODD-BUTTON-012", 2, 28, "aria-current"]],
  "odd-button-013.bad.html": [["ODD-BUTTON-013", 2, 36, "aria-disabled"]],
  "odd-button-014.bad.html": [
    ["ODD-BUTTON-014", 2, 1, "<button"],
    ["ODD-BUTTON-014", 3, 1, "<button"],
  ],
  "odd-button-015.bad.html": [
    ["ODD-BUTTON-015", 2, 28, "data-tone"],
    ["ODD-BUTTON-015", 3, 28, "data-varient"],
  ],
  "odd-field-001.bad.html": [
    ["ODD-FIELD-001", 2, 7, "class"],
    ["ODD-FIELD-001", 3, 6, "class"],
    ["ODD-FIELD-001", 4, 8, "class"],
    ["ODD-FIELD-001", 5, 6, "class"],
    ["ODD-FIELD-001", 6, 7, "class"],
    ["ODD-FIELD-001", 7, 6, "class"],
  ],
  "odd-field-002.bad.html": [
    ["ODD-FIELD-002", 2, 39, "hidden"],
    ["ODD-FIELD-002", 3, 38, "aria-hidden"],
  ],
  "odd-field-003.bad.html": [
    ["ODD-FIELD-003", 2, 37, "aria-disabled"],
    ["ODD-FIELD-003", 3, 43, "aria-disabled"],
    ["ODD-FIELD-003", 4, 40, "aria-disabled"],
  ],
  "odd-choice-001.bad.html": [
    ["ODD-CHOICE-001", 2, 6, "class"],
    ["ODD-CHOICE-001", 3, 7, "class"],
    ["ODD-CHOICE-001", 4, 6, "class"],
  ],
  "odd-choice-002.bad.html": [
    ["ODD-CHOICE-002", 2, 1, "<input"],
    ["ODD-CHOICE-002", 3, 1, "<input"],
    ["ODD-CHOICE-002", 4, 27, "type"],
    ["ODD-CHOICE-002", 5, 43, "role"],
  ],
  "odd-choice-003.bad.html": [
    ["ODD-CHOICE-003", 2, 27, "aria-disabled"],
    ["ODD-CHOICE-003", 3, 57, "aria-disabled"],
    ["ODD-CHOICE-003", 4, 33, "aria-disabled"],
  ],
  "odd-badge-001.bad.html": [
    ["ODD-BADGE-001", 2, 6, "class"],
    ["ODD-BADGE-001", 3, 4, "class"],
  ],
  "odd-badge-002.bad.html": [
    ["ODD-BADGE-002", 2, 25, "data-tone"],
    ["ODD-BADGE-002", 3, 25, "data-tone"],
    ["ODD-BADGE-002", 4, 25, "data-tone"],
  ],
  "odd-badge-003.bad.html": [
    ["ODD-BADGE-003", 2, 25, "data-solid"],
    ["ODD-BADGE-003", 3, 44, "data-solid"],
  ],
  "odd-badge-004.bad.html": [
    ["ODD-BADGE-004", 2, 25, "data-variant"],
    ["ODD-BADGE-004", 3, 25, "data-size"],
    ["ODD-BADGE-004", 4, 25, "data-tnoe"],
  ],
  "odd-alert-001.bad.html": [
    ["ODD-ALERT-001", 2, 7, "class"],
    ["ODD-ALERT-001", 3, 6, "class"],
  ],
  "odd-alert-002.bad.html": [
    ["ODD-ALERT-002", 2, 24, "data-tone"],
    ["ODD-ALERT-002", 3, 24, "data-tone"],
    ["ODD-ALERT-002", 4, 24, "data-tone"],
  ],
  "odd-alert-003.bad.html": [
    ["ODD-ALERT-003", 2, 24, "role"],
    ["ODD-ALERT-003", 3, 24, "role"],
    ["ODD-ALERT-003", 4, 24, "aria-live"],
  ],
  "odd-alert-004.bad.html": [
    ["ODD-ALERT-004", 2, 24, "data-variant"],
    ["ODD-ALERT-004", 3, 24, "data-size"],
    ["ODD-ALERT-004", 4, 24, "data-tnoe"],
  ],
  "odd-alert-005.bad.html": [
    ["ODD-ALERT-005", 2, 28, "data-tone"],
    ["ODD-ALERT-005", 3, 28, "data-variant"],
  ],
  "odd-avatar-001.bad.html": [
    ["ODD-AVATAR-001", 2, 6, "class"],
    ["ODD-AVATAR-001", 3, 7, "class"],
  ],
  "odd-avatar-002.bad.html": [
    ["ODD-AVATAR-002", 2, 26, "data-size"],
    ["ODD-AVATAR-002", 3, 26, "data-size"],
  ],
  "odd-avatar-003.bad.html": [
    ["ODD-AVATAR-003", 2, 26, "role"],
    ["ODD-AVATAR-003", 3, 1, "<div"],
    ["ODD-AVATAR-003", 4, 31, "role"],
  ],
  "odd-avatar-004.bad.html": [
    ["ODD-AVATAR-004", 2, 1, "<span"],
    ["ODD-AVATAR-004", 3, 1, "<span"],
    ["ODD-AVATAR-004", 4, 1, "<div"],
  ],
  "odd-avatar-005.bad.html": [
    ["ODD-AVATAR-005", 2, 26, "data-tone"],
    ["ODD-AVATAR-005", 3, 26, "data-szie"],
  ],
  "odd-avatar-006.bad.html": [["ODD-AVATAR-006", 2, 71, "data-size"]],
  "odd-separator-001.bad.html": [["ODD-SEPARATOR-001", 2, 6, "class"]],
  "odd-separator-002.bad.html": [
    ["ODD-SEPARATOR-002", 2, 27, "aria-orientation"],
    ["ODD-SEPARATOR-002", 3, 27, "data-orientation"],
  ],
  "odd-separator-003.bad.html": [
    ["ODD-SEPARATOR-003", 2, 27, "role"],
    ["ODD-SEPARATOR-003", 3, 27, "aria-hidden"],
  ],
  "odd-separator-004.bad.html": [["ODD-SEPARATOR-004", 2, 27, "data-tone"]],
  "odd-search-001.bad.html": [
    ["ODD-SEARCH-001", 2, 6, "class"],
    ["ODD-SEARCH-001", 3, 10, "class"],
  ],
  "odd-search-002.bad.html": [
    ["ODD-SEARCH-002", 2, 1, "<search"],
    ["ODD-SEARCH-002", 3, 1, "<search"],
    ["ODD-SEARCH-002", 4, 1, "<search"],
    ["ODD-SEARCH-003", 4, 1, "<search"],
    ["ODD-SEARCH-002", 5, 9, "<form"],
    ["ODD-SEARCH-002", 6, 1, "<search"],
    ["ODD-SEARCH-002", 7, 9, "<form"],
  ],
  "odd-search-003.bad.html": [
    ["ODD-SEARCH-003", 2, 1, "<search"],
    ["ODD-SEARCH-003", 3, 1, "<search"],
    ["ODD-SEARCH-003", 4, 9, "<form"],
    ["ODD-SEARCH-003", 5, 1, "<search"],
    ["ODD-SEARCH-003", 6, 9, "<form"],
  ],
  "odd-search-004.bad.html": [["ODD-SEARCH-004", 2, 28, "onsubmit"]],
  "odd-search-005.bad.html": [
    ["ODD-SEARCH-005", 2, 28, "data-tone"],
    ["ODD-SEARCH-005", 3, 34, "data-size"],
  ],
  "odd-slider-001.bad.html": [
    ["ODD-SLIDER-001", 2, 6, "class"],
    ["ODD-SLIDER-001", 3, 9, "class"],
  ],
  "odd-slider-002.bad.html": [
    ["ODD-SLIDER-002", 2, 1, "<input"],
    ["ODD-SLIDER-002", 3, 27, "type"],
  ],
  "odd-slider-003.bad.html": [["ODD-SLIDER-003", 2, 66, "aria-disabled"]],
  "odd-slider-004.bad.html": [
    ["ODD-SLIDER-004", 2, 40, "data-tone"],
    ["ODD-SLIDER-004", 3, 40, "data-size"],
  ],
  "odd-meter-001.bad.html": [
    ["ODD-METER-001", 2, 6, "class"],
    ["ODD-METER-001", 3, 11, "class"],
    ["ODD-METER-001", 4, 6, "class"],
  ],
  "odd-meter-002.bad.html": [
    ["ODD-METER-002", 2, 54, "data-tone"],
    ["ODD-METER-002", 3, 53, "data-tone"],
    ["ODD-METER-002", 4, 54, "data-tone"],
  ],
  "odd-meter-003.bad.html": [
    ["ODD-METER-003", 2, 32, "data-size"],
    ["ODD-METER-003", 3, 38, "data-variant"],
  ],
  "odd-toast-001.bad.html": [
    ["ODD-TOAST-001", 2, 6, "class"],
    ["ODD-TOAST-001", 3, 8, "class"],
  ],
  "odd-toast-002.bad.html": [
    ["ODD-TOAST-002", 2, 1, "<section"],
    ["ODD-TOAST-002", 3, 30, "popover"],
  ],
  "odd-toast-003.bad.html": [["ODD-TOAST-003", 2, 1, "<section"]],
  "odd-toast-004.bad.html": [["ODD-TOAST-004", 2, 74, "data-tone"]],
  "odd-popover-001.bad.html": [
    ["ODD-POPOVER-001", 2, 4, "class"],
    ["ODD-POPOVER-001", 3, 7, "class"],
  ],
  "odd-popover-002.bad.html": [
    ["ODD-POPOVER-002", 2, 1, "<div"],
    ["ODD-POPOVER-002", 3, 33, "popover"],
    ["ODD-POPOVER-002", 4, 33, "popover"],
    ["ODD-POPOVER-002", 5, 1, "<div"],
    ["ODD-POPOVER-002", 6, 30, "popover"],
  ],
  "odd-popover-003.bad.html": [
    ["ODD-POPOVER-003", 2, 41, "role"],
    ["ODD-POPOVER-003", 3, 41, "role"],
    ["ODD-POPOVER-003", 4, 41, "role"],
  ],
  "odd-popover-004.bad.html": [
    ["ODD-POPOVER-004", 2, 1, "<div"],
    ["ODD-POPOVER-004", 3, 1, "<div"],
  ],
  "odd-popover-005.bad.html": [
    ["ODD-POPOVER-005", 2, 41, "aria-labelledby"],
    ["ODD-POPOVER-005", 3, 41, "aria-label"],
  ],
  "odd-popover-006.bad.html": [
    ["ODD-POPOVER-006", 2, 41, "data-tone"],
    ["ODD-POPOVER-006", 3, 41, "data-size"],
  ],
  "odd-dialog-001.bad.html": [
    ["ODD-DIALOG-001", 2, 6, "class"],
    ["ODD-DIALOG-001", 3, 10, "class"],
    ["ODD-DIALOG-001", 4, 4, "class"],
    ["ODD-DIALOG-001", 5, 4, "class"],
  ],
  "odd-dialog-002.bad.html": [
    ["ODD-DIALOG-002", 2, 1, "<dialog"],
    ["ODD-DIALOG-002", 3, 1, "<dialog"],
    ["ODD-DIALOG-002", 4, 1, "<dialog"],
    ["ODD-DIALOG-002", 5, 1, "<dialog"],
    ["ODD-DIALOG-002", 6, 1, "<dialog"],
  ],
  "odd-dialog-003.bad.html": [
    ["ODD-DIALOG-003", 2, 28, "role"],
    ["ODD-DIALOG-003", 3, 28, "role"],
    ["ODD-DIALOG-003", 4, 28, "role"],
  ],
  "odd-dialog-004.bad.html": [
    ["ODD-DIALOG-004", 2, 52, "open"],
    ["ODD-DIALOG-004", 3, 52, "open"],
  ],
  "odd-dialog-005.bad.html": [
    ["ODD-DIALOG-005", 2, 52, "closedby"],
    ["ODD-DIALOG-005", 3, 52, "closedby"],
  ],
  "odd-dialog-006.bad.html": [
    ["ODD-DIALOG-006", 2, 77, "closedby"],
    ["ODD-DIALOG-006", 3, 28, "closedby"],
  ],
  "odd-dialog-007.bad.html": [
    ["ODD-DIALOG-007", 2, 52, "data-tone"],
    ["ODD-DIALOG-007", 3, 52, "data-size"],
  ],
  "odd-dialog-008.bad.html": [
    ["ODD-DIALOG-008", 2, 30, "data-tone"],
    ["ODD-DIALOG-008", 3, 30, "data-size"],
    ["ODD-DIALOG-008", 4, 33, "data-variant"],
  ],
  "odd-sheet-001.bad.html": [
    ["ODD-SHEET-001", 2, 6, "class"],
    ["ODD-SHEET-001", 3, 10, "class"],
    ["ODD-SHEET-001", 4, 9, "class"],
    ["ODD-SHEET-001", 5, 4, "class"],
    ["ODD-SHEET-001", 6, 9, "class"],
  ],
  "odd-sheet-002.bad.html": [
    ["ODD-SHEET-002", 2, 48, "data-side"],
    ["ODD-SHEET-002", 3, 48, "data-side"],
    ["ODD-SHEET-002", 4, 48, "data-side"],
  ],
  "odd-sheet-003.bad.html": [
    ["ODD-SHEET-003", 2, 48, "data-tone"],
    ["ODD-SHEET-003", 3, 48, "data-sid"],
    ["ODD-SHEET-003", 4, 31, "data-variant"],
  ],
  "odd-disclosure-001.bad.html": [
    ["ODD-DISCLOSURE-001", 2, 6, "class"],
    ["ODD-DISCLOSURE-001", 3, 10, "class"],
  ],
  "odd-disclosure-002.bad.html": [
    ["ODD-DISCLOSURE-002", 2, 1, "<details"],
    ["ODD-DISCLOSURE-002", 3, 1, "<details"],
    ["ODD-DISCLOSURE-002", 4, 1, "<details"],
  ],
  "odd-disclosure-003.bad.html": [
    ["ODD-DISCLOSURE-003", 2, 33, "data-tone"],
    ["ODD-DISCLOSURE-003", 3, 33, "data-size"],
  ],
  "odd-tabs-001.bad.html": [["ODD-TABS-001", 2, 10, "class"]],
  "odd-tabs-002.bad.html": [
    ["ODD-TABS-002", 2, 1, "<div"],
    ["ODD-TABS-002", 3, 1, "<div"],
  ],
  "odd-tabs-003.bad.html": [
    ["ODD-TABS-003", 2, 23, "aria-orientation"],
    ["ODD-TABS-003", 3, 23, "data-activation"],
  ],
  "odd-tabs-004.bad.html": [
    ["ODD-TABS-004", 2, 1, "<div"],
    ["ODD-TABS-004", 2, 1, "<div"],
    ["ODD-TABS-004", 3, 199, "<div"],
  ],
  "odd-tabs-005.bad.html": [["ODD-TABS-005", 2, 23, "data-tone"]],
  "odd-card-001.bad.html": [
    ["ODD-CARD-001", 2, 4, "class"],
    ["ODD-CARD-001", 3, 4, "class"],
    ["ODD-CARD-001", 4, 7, "class"],
    ["ODD-CARD-001", 5, 9, "class"],
  ],
  "odd-card-002.bad.html": [["ODD-CARD-002", 2, 27, "data-interactive"]],
  "odd-card-003.bad.html": [
    ["ODD-CARD-003", 2, 27, "data-interactive"],
    ["ODD-CARD-003", 3, 1, "<article"],
    ["ODD-CARD-003", 4, 27, "data-interactive"],
  ],
  "odd-card-004.bad.html": [
    ["ODD-CARD-004", 2, 27, "onclick"],
    ["ODD-CARD-004", 2, 66, "tabindex"],
  ],
  "odd-card-005.bad.html": [["ODD-CARD-005", 2, 71, "<a"]],
  "odd-card-006.bad.html": [
    ["ODD-CARD-006", 2, 27, "data-tone"],
    ["ODD-CARD-006", 3, 27, "data-interactiv"],
  ],
  "odd-card-007.bad.html": [
    ["ODD-CARD-007", 3, 30, "data-size"],
    ["ODD-CARD-007", 3, 90, "data-interactive"],
    ["ODD-CARD-007", 4, 32, "data-tone"],
  ],
  "odd-skeleton-001.bad.html": [["ODD-SKELETON-001", 2, 7, "class"]],
  "odd-skeleton-002.bad.html": [
    ["ODD-SKELETON-002", 2, 46, "data-shape"],
    ["ODD-SKELETON-002", 3, 46, "data-shape"],
  ],
  "odd-skeleton-003.bad.html": [
    ["ODD-SKELETON-003", 2, 1, "<div"],
    ["ODD-SKELETON-003", 3, 27, "aria-hidden"],
    ["ODD-SKELETON-003", 4, 27, "aria-hidden"],
  ],
  "odd-skeleton-004.bad.html": [
    ["ODD-SKELETON-004", 2, 1, "<div"],
    ["ODD-SKELETON-004", 3, 46, "aria-busy"],
    ["ODD-SKELETON-004", 4, 1, "<div"],
    ["ODD-SKELETON-004", 4, 46, "role"],
    ["ODD-SKELETON-004", 5, 46, "aria-label"],
    ["ODD-SKELETON-004", 6, 46, "aria-labelledby"],
  ],
  "odd-skeleton-005.bad.html": [
    ["ODD-SKELETON-005", 2, 66, "data-size"],
    ["ODD-SKELETON-005", 3, 46, "data-shap"],
  ],
  "odd-menu-001.bad.html": [
    ["ODD-MENU-001", 2, 4, "class"],
    ["ODD-MENU-001", 3, 81, "class"],
    ["ODD-MENU-001", 4, 79, "class"],
  ],
  "odd-menu-002.bad.html": [
    ["ODD-MENU-002", 2, 1, "<div"],
    ["ODD-MENU-002", 3, 38, "role"],
  ],
  "odd-menu-003.bad.html": [
    ["ODD-MENU-003", 2, 1, "<div"],
    ["ODD-MENU-003", 3, 1, "<div"],
  ],
  "odd-menu-004.bad.html": [
    ["ODD-MENU-004", 2, 76, "data-tone"],
    ["ODD-MENU-004", 3, 49, "data-size"],
  ],
  "odd-menu-005.bad.html": [
    ["ODD-MENU-005", 3, 3, "<button"],
    ["ODD-MENU-005", 4, 33, "role"],
  ],
  "odd-menu-006.bad.html": [
    ["ODD-MENU-006", 3, 49, "data-tone"],
    ["ODD-MENU-006", 4, 49, "data-tone"],
  ],
  "odd-menu-007.bad.html": [
    ["ODD-MENU-007", 3, 49, "disabled"],
  ],
  "odd-table-001.bad.html": [
    ["ODD-TABLE-001", 2, 7, "class"],
    ["ODD-TABLE-001", 3, 6, "class"],
    ["ODD-TABLE-001", 4, 41, "class"],
    ["ODD-TABLE-001", 5, 38, "class"],
  ],
  "odd-table-002.bad.html": [
    ["ODD-TABLE-002", 2, 29, "tabindex"],
    ["ODD-TABLE-002", 3, 29, "aria-labelledby"],
    ["ODD-TABLE-002", 4, 42, "role"],
  ],
  "odd-table-003.bad.html": [
    ["ODD-TABLE-003", 2, 1, "<div"],
    ["ODD-TABLE-003", 3, 1, "<div"],
  ],
  "odd-table-004.bad.html": [
    ["ODD-TABLE-004", 2, 29, "data-numeric"],
    ["ODD-TABLE-004", 3, 26, "data-numeric"],
    ["ODD-TABLE-004", 4, 26, "data-tone"],
    ["ODD-TABLE-004", 5, 66, "data-numeric"],
  ],
  "odd-table-005.bad.html": [
    ["ODD-TABLE-005", 2, 66, "aria-sort"],
  ],
  "odd-table-006.bad.html": [
    ["ODD-TABLE-006", 2, 1, "<table"],
    ["ODD-TABLE-006", 3, 1, "<table"],
  ],
  "odd-scope-001.bad.html": [
    ["ODD-SCOPE-001", 2, 1, "<div"],
    ["ODD-SCOPE-001", 3, 1, "<section"],
    ["ODD-SCOPE-001", 3, 1, "<section"],
  ],
  "odd-skip-001.bad.html": [
    ["ODD-SKIP-001", 2, 9, "class"],
    ["ODD-SKIP-001", 3, 1, "<a"],
    ["ODD-SKIP-001", 4, 26, "href"],
    ["ODD-SKIP-001", 5, 26, "href"],
  ],
  "odd-grid-001.bad.html": [
    ["ODD-GRID-001", 2, 1, "<div"],
    ["ODD-GRID-001", 2, 1, "<div"],
    ["ODD-GRID-001", 2, 1, "<div"],
  ],
  "odd-shell-001.bad.html": [
    ["ODD-SHELL-001", 3, 8, "class"],
    ["ODD-SHELL-001", 4, 8, "class"],
  ],
  "odd-typography-001.bad.html": [
    ["ODD-TYPOGRAPHY-001", 2, 6, "class"],
    ["ODD-TYPOGRAPHY-001", 3, 4, "class"],
  ],
  "odd-typography-002.bad.html": [
    ["ODD-TYPOGRAPHY-002", 2, 25, "data-size"],
    ["ODD-TYPOGRAPHY-002", 3, 25, "data-size"],
    ["ODD-TYPOGRAPHY-002", 4, 25, "data-size"],
  ],
  "odd-typography-003.bad.html": [
    ["ODD-TYPOGRAPHY-003", 2, 24, "data-tone"],
    ["ODD-TYPOGRAPHY-003", 3, 24, "data-tone"],
  ],
  "odd-class-001.bad.html": [
    ["ODD-CLASS-001", 2, 6, "class"],
    ["ODD-CLASS-001", 3, 4, "class"],
  ],
};

test("html fixtures report each expected code on its attribute", () => {
  const names = readdirSync("tests/fixtures/usage").filter((name) => name.endsWith(".html")).sort();
  for (const name of names) {
    const source = readFileSync(`tests/fixtures/usage/${name}`, "utf8");
    const messages = lint(`tests/fixtures/usage/${name}`, source);
    expect(messages.map((message) => codeOf(message.message)), name).toEqual(expectedCodes(source));
    const located = places[name];
    if (located === undefined) {
      expect(messages, name).toEqual([]);
      continue;
    }
    expect(
      messages.map((message) => [codeOf(message.message), message.line, message.column, message.ruleId, message.severity]),
      name,
    ).toEqual(located.map(([code, line, column]) => [code, line, column, "odd/usage", 2]));
    for (const [index, message] of messages.entries()) {
      const at = located[index]?.[3];
      expect(lineText(source, message.line).slice(message.column - 1).startsWith(at ?? ""), `${name} ${message.line}`).toBe(true);
    }
  }
});

test("a marked template reports disabled on the attribute", () => {
  const source = readFileSync("tests/fixtures/usage/templates/marked.ts", "utf8");
  const messages = lint("tests/fixtures/usage/templates/marked.ts", source);
  expect(messages.map((message) => [codeOf(message.message), message.line, message.column, message.ruleId])).toEqual([
    ["ODD-BUTTON-007", 1, 62, "odd/usage"],
  ]);
  expect(lineText(source, 1).slice(61, 69)).toBe("disabled");
});

test("a tagged template reports disabled on the attribute", () => {
  const source = readFileSync("tests/fixtures/usage/templates/tagged.ts", "utf8");
  const messages = lint("tests/fixtures/usage/templates/tagged.ts", source);
  expect(messages.map((message) => [codeOf(message.message), message.line, message.column, message.ruleId])).toEqual([
    ["ODD-BUTTON-007", 1, 55, "odd/usage"],
  ]);
  expect(lineText(source, 1).slice(54, 62)).toBe("disabled");
});

test("a tagged summary with a computed name does not report a missing summary", () => {
  const source = [
    "export const partName = html`<details class=\"odd-disclosure\"><summary${tag}>Question</summary></details>`;",
    "export const holeName = html`<details class=\"odd-disclosure\"><sum${tag}>Question</sum${tag}></details>`;",
    "export const plainDiv = html`<details class=\"odd-disclosure\"><div>Question</div></details>`;",
  ].join("\n");
  const messages = lint("tests/fixtures/usage/templates/computed-summary.ts", source);
  expect(messages.map((message) => [codeOf(message.message), message.line, message.column, message.ruleId])).toEqual([
    ["ODD-DISCLOSURE-002", 3, 30, "odd/usage"],
  ]);
});

test("a computed class still reports the static disabled attribute", () => {
  const source = readFileSync("tests/fixtures/usage/templates/partial.ts", "utf8");
  const messages = lint("tests/fixtures/usage/templates/partial.ts", source);
  expect(messages.map((message) => [codeOf(message.message), message.line, message.column, message.ruleId, message.severity])).toEqual([
    ["ODD-STATIC-001", 1, 44, "odd/usage-incomplete", 1],
    ["ODD-BUTTON-007", 1, 72, "odd/usage", 2],
  ]);
  expect(lineText(source, 1).slice(43, 48)).toBe("class");
  expect(lineText(source, 1).slice(71, 79)).toBe("disabled");
});

test("a marked template with carriage returns reports the attribute after a computed value", () => {
  const source = [
    "export const view = /* html */ `",
    "<button",
    '  class="odd-button ${name}"',
    "  disabled",
    ">Save</button>`;",
  ].join("\r\n");
  const messages = lint("tests/fixtures/usage/templates/crlf.ts", source);
  expect(messages.map((message) => [codeOf(message.message), message.line, message.column, message.ruleId, message.severity])).toEqual([
    ["ODD-STATIC-001", 3, 3, "odd/usage-incomplete", 1],
    ["ODD-BUTTON-007", 4, 3, "odd/usage", 2],
  ]);
  expect(lineText(source, 3).slice(2, 7)).toBe("class");
  expect(lineText(source, 4).slice(2, 10)).toBe("disabled");
});

test("an unmarked template reports ODD-STATIC-002 and skips the button rules", () => {
  const source = readFileSync("tests/fixtures/usage/templates/bare.ts", "utf8");
  const messages = lint("tests/fixtures/usage/templates/bare.ts", source);
  expect(messages.map((message) => [codeOf(message.message), message.line, message.column, message.ruleId])).toEqual([
    ["ODD-STATIC-002", 1, 21, "odd/usage"],
  ]);
  expect(lineText(source, 1)[20]).toBe("`");
});

test("an odd disable without a reason reports ODD-STATIC-003", () => {
  const source = readFileSync("tests/fixtures/usage/templates/disable.ts", "utf8");
  const messages = lint("tests/fixtures/usage/templates/disable.ts", source);
  expect(messages.map((message) => [codeOf(message.message), message.line, message.column, message.ruleId])).toEqual([
    ["ODD-STATIC-003", 1, 1, "odd/disable-reason"],
  ]);
  expect(lineText(source, 1).startsWith("// eslint-disable-next-line odd/usage")).toBe(true);
  expect(source.includes("-- the markup is third-party")).toBe(true);
});

test("a misspelled odd-buton suggests odd-button", () => {
  const source = `<button class="odd-buton">Save</button>\n`;
  const messages = lint("typo.html", source);
  expect(messages.map((message) => [codeOf(message.message), message.line, message.column])).toEqual([["ODD-CLASS-001", 1, 9]]);
  expect(messages[0]?.message.includes("Did you mean odd-button?")).toBe(true);
  expect(lineText(source, 1).slice(8, 13)).toBe("class");
});

function storySources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return storySources(path);
    return entry.name.endsWith(".ts") ? [path] : [];
  });
}

test("stories have no odd/usage findings, so a new warning fails here", () => {
  const files = storySources("stories");
  expect(files).toContain("stories/mirrored/Button.stories.ts");
  const found = files.flatMap((file) =>
    lint(file).map((message) => [file, codeOf(message.message), message.line, message.column, message.ruleId, message.severity]),
  );
  expect(found).toEqual([]);
});

test("a stories template reports ODD-BUTTON-007 for a raw disabled button", () => {
  const source = 'export const bad = /* html */ `<button class="odd-button" disabled>Save</button>`;\n';
  const messages = lint("stories/bad.stories.ts", source);
  expect(messages.map((message) => codeOf(message.message))).toEqual(["ODD-BUTTON-007"]);
});
