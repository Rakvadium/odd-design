import { readdirSync, readFileSync } from "node:fs";
import { expect, test } from "bun:test";
import { Linter } from "eslint";
import config from "../eslint.config.js";

const linter = new Linter({ configType: "flat" });
const flat = [...config, { ignores: ["!tests/fixtures/**"] }];
const folder = "tests/fixtures/usage/jsx";

function codeOf(message: string): string {
  return message.slice(0, message.indexOf(":"));
}

function lineText(source: string, line: number): string {
  return source.split(/\r?\n/)[line - 1] ?? "";
}

function expectedCodes(source: string, pattern: RegExp): string[] {
  const match = pattern.exec(source);
  if (match === null || match[1] === undefined) throw new Error("fixture has no expect line");
  return match[1] === "none" ? [] : match[1].split(" ");
}

const places: Record<string, readonly (readonly [string, number, number, string])[]> = {
  "alert.tsx": [
    ["ODD-ALERT-002", 8, 12, 'tone="neutral"'],
    ["ODD-ALERT-003", 9, 12, 'role="status"'],
    ["ODD-ALERT-003", 10, 12, 'aria-live="polite"'],
    ["ODD-ALERT-004", 11, 12, "data-variant"],
    ["ODD-ALERT-005", 12, 17, "data-tone"],
    ["ODD-ALERT-001", 13, 11, "className"],
  ],
  "avatar.tsx": [
    ["ODD-AVATAR-002", 8, 13, 'size="md"'],
    ["ODD-AVATAR-003", 9, 13, 'role="presentation"'],
    ["ODD-AVATAR-004", 10, 5, '<Avatar role="img">'],
    ["ODD-AVATAR-005", 11, 13, "data-tone"],
    ["ODD-AVATAR-006", 12, 49, "data-size"],
    ["ODD-AVATAR-004", 13, 5, "<AvatarGroup"],
    ["ODD-AVATAR-001", 14, 10, "className"],
  ],
  "badge.tsx": [
    ["ODD-BADGE-002", 7, 12, 'tone="sucess"'],
    ["ODD-BADGE-004", 8, 12, "data-variant"],
    ["ODD-BADGE-003", 9, 33, "data-solid={false}"],
    ["ODD-BADGE-001", 10, 10, "className"],
  ],
  "card.tsx": [
    ["ODD-CARD-003", 14, 11, "interactive"],
    ["ODD-CARD-003", 15, 5, "<Card>"],
    ["ODD-CARD-003", 16, 11, "interactive"],
    ["ODD-CARD-004", 17, 11, "onClick={open}"],
    ["ODD-CARD-004", 17, 26, "tabIndex={0}"],
    ["ODD-CARD-001", 18, 14, "className"],
    ["ODD-CARD-003", 19, 11, "interactive"],
    ["ODD-STATIC-001", 20, 11, "{...props}"],
  ],
  "disclosure.tsx": [
    ["ODD-DISCLOSURE-002", 15, 5, "<Disclosure>"],
    ["ODD-DISCLOSURE-002", 16, 5, "<Disclosure>"],
    ["ODD-DISCLOSURE-001", 17, 10, "className"],
    ["ODD-DISCLOSURE-003", 18, 17, 'data-tone="info"'],
    ["ODD-STATIC-001", 19, 17, "{...props}"],
    ["ODD-STATIC-001", 20, 41, "{...props}"],
    ["ODD-DISCLOSURE-002", 21, 5, "<Disclosure {...props}>"],
    ["ODD-STATIC-001", 21, 17, "{...props}"],
  ],
  "tabs.tsx": [
    ["ODD-TABS-002", 16, 5, "<Tabs>"],
    ["ODD-TABS-003", 17, 11, "aria-orientation"],
    ["ODD-TABS-003", 17, 39, "data-activation"],
    ["ODD-TABS-004", 18, 5, "<Tabs>"],
    ["ODD-TABS-004", 18, 5, "<Tabs>"],
    ["ODD-TABS-001", 19, 14, "className"],
    ["ODD-TABS-005", 20, 11, 'data-tone="info"'],
    ["ODD-TABS-004", 21, 219, "<Tabs>"],
    ["ODD-TABS-004", 22, 5, "<Tabs>"],
  ],
  "search.tsx": [
    ["ODD-SEARCH-002", 20, 5, "<Search>"],
    ["ODD-SEARCH-002", 21, 5, "<Search>"],
    ["ODD-SEARCH-002", 22, 5, "<Search>"],
    ["ODD-STATIC-001", 22, 46, "className={cn("],
    ["ODD-SEARCH-002", 23, 5, "<Search>"],
    ["ODD-SEARCH-002", 24, 5, "<Search>"],
    ["ODD-SEARCH-003", 24, 5, "<Search>"],
    ["ODD-SEARCH-003", 25, 5, "<Search>"],
    ["ODD-SEARCH-003", 26, 5, "<Search>"],
    ["ODD-SEARCH-003", 27, 5, "<Search>"],
    ["ODD-SEARCH-001", 28, 10, "className"],
    ["ODD-SEARCH-004", 29, 13, "onSubmit"],
    ["ODD-SEARCH-005", 30, 13, 'data-tone="info"'],
  ],
  "slider.tsx": [
    ["ODD-STATIC-001", 10, 13, "type={kind}"],
    ["ODD-SLIDER-001", 11, 10, "className"],
    ["ODD-SLIDER-002", 12, 5, "<input"],
    ["ODD-SLIDER-002", 13, 13, 'type="number"'],
    ["ODD-SLIDER-003", 14, 49, 'aria-disabled="true"'],
    ["ODD-SLIDER-004", 15, 49, 'data-tone="info"'],
  ],
  "toast.tsx": [
    ["ODD-STATIC-001", 9, 14, "{...props}"],
    ["ODD-STATIC-001", 10, 14, "popover={mode}"],
    ["ODD-TOAST-001", 11, 10, 'className="odd-toaster"'],
    ["ODD-TOAST-001", 12, 12, 'className="odd-toaster"'],
    ["ODD-TOAST-002", 13, 5, "<section"],
    ["ODD-TOAST-002", 14, 14, 'popover="auto"'],
    ["ODD-TOAST-003", 15, 5, "<Toaster"],
    ["ODD-TOAST-004", 16, 58, 'data-tone="success"'],
  ],
  "popover.tsx": [
    ["ODD-STATIC-001", 9, 14, "{...props}"],
    ["ODD-STATIC-001", 10, 21, "popover={kind}"],
    ["ODD-POPOVER-001", 11, 11, "className"],
    ["ODD-POPOVER-002", 12, 5, "<div"],
    ["ODD-POPOVER-002", 13, 21, 'popover="manual"'],
    ["ODD-POPOVER-002", 14, 21, 'popover="hint"'],
    ["ODD-POPOVER-003", 15, 36, 'role="menu"'],
    ["ODD-POPOVER-005", 16, 36, 'aria-labelledby="i-title"'],
    ["ODD-POPOVER-004", 17, 5, "<Popover"],
    ["ODD-POPOVER-006", 18, 36, 'data-tone="info"'],
    ["ODD-STATIC-001", 19, 40, "{...props}"],
  ],
  "dialog.tsx": [
    ["ODD-STATIC-001", 9, 13, "{...props}"],
    ["ODD-DIALOG-001", 10, 10, "className"],
    ["ODD-DIALOG-002", 11, 5, "<Dialog"],
    ["ODD-DIALOG-002", 12, 5, "<Dialog"],
    ["ODD-DIALOG-003", 13, 13, 'role="dialog"'],
    ["ODD-DIALOG-003", 14, 13, 'role="region"'],
    ["ODD-DIALOG-004", 15, 37, "open"],
    ["ODD-DIALOG-005", 16, 37, 'closedby="none"'],
    ["ODD-DIALOG-006", 17, 62, 'closedby="any"'],
    ["ODD-DIALOG-007", 18, 37, 'data-tone="danger"'],
    ["ODD-DIALOG-008", 19, 38, 'data-tone="danger"'],
    ["ODD-DIALOG-008", 20, 20, 'data-variant="danger"'],
    ["ODD-STATIC-001", 21, 37, "{...props}"],
  ],
  "sheet.tsx": [
    ["ODD-SHEET-001", 8, 10, "className"],
    ["ODD-SHEET-001", 9, 13, "className"],
    ["ODD-DIALOG-002", 10, 5, "<Sheet"],
    ["ODD-DIALOG-004", 11, 33, "open"],
    ["ODD-DIALOG-006", 12, 61, 'closedby="any"'],
    ["ODD-SHEET-002", 13, 33, 'side="end"'],
    ["ODD-SHEET-002", 14, 56, 'data-side="left"'],
    ["ODD-SHEET-003", 15, 33, 'data-tone="danger"'],
    ["ODD-SHEET-003", 16, 18, 'data-variant="primary"'],
    ["ODD-STATIC-001", 17, 33, "side={side}"],
    ["ODD-STATIC-001", 18, 12, "{...props}"],
  ],
  "meter.tsx": [
    ["ODD-METER-001", 10, 10, "className"],
    ["ODD-METER-001", 11, 15, "className"],
    ["ODD-METER-001", 12, 10, "className"],
    ["ODD-METER-002", 13, 12, 'tone="primary"'],
    ["ODD-METER-002", 14, 40, 'data-tone="neutral"'],
    ["ODD-STATIC-001", 15, 12, "tone={typeTone}"],
    ["ODD-METER-003", 16, 15, 'data-size="sm"'],
  ],
  "children-prop.tsx": [
    ["ODD-BUTTON-014", 5, 5, "<Button"],
    ["ODD-BUTTON-014", 6, 5, "<button"],
  ],
  "cn.tsx": [
    ["ODD-STATIC-001", 4, 11, "className={cn("],
    ["ODD-BUTTON-007", 4, 63, "disabled"],
  ],
  "choice.tsx": [
    ["ODD-CHOICE-002", 8, 13, 'type="radio"'],
    ["ODD-CHOICE-003", 9, 13, 'aria-disabled="true"'],
    ["ODD-CHOICE-003", 10, 43, 'aria-disabled="true"'],
    ["ODD-CHOICE-003", 11, 16, 'aria-disabled="true"'],
  ],
  "field.tsx": [
    ["ODD-FIELD-001", 5, 12, 'className="odd-input"'],
    ["ODD-FIELD-001", 6, 14, 'className="odd-input"'],
    ["ODD-FIELD-001", 8, 13, 'className="odd-input"'],
    ["ODD-FIELD-001", 11, 15, 'className="odd-input"'],
    ["ODD-FIELD-001", 12, 13, 'className="odd-input"'],
    ["ODD-FIELD-003", 13, 23, 'aria-disabled="true"'],
    ["ODD-FIELD-002", 14, 33, "hidden"],
  ],
  "link.tsx": [["ODD-STATIC-001", 3, 21, "<Link"]],
  "local-button.tsx": [],
  "odd-button-004.bad.tsx": [
    ["ODD-BUTTON-004", 4, 36, 'data-icon-only="false"'],
    ["ODD-BUTTON-004", 5, 36, "data-icon-only={false}"],
    ["ODD-BUTTON-004", 6, 36, 'data-icon-only="false"'],
  ],
  "odd-button-014.bad.tsx": [
    ["ODD-BUTTON-014", 4, 5, "<button"],
    ["ODD-BUTTON-014", 5, 5, "<button"],
  ],
  "radix.tsx": [],
  "raw.bad.tsx": [
    ["ODD-BUTTON-001", 4, 11, "className"],
    ["ODD-BUTTON-002", 5, 36, "data-variant"],
    ["ODD-BUTTON-003", 6, 36, "data-size"],
    ["ODD-BUTTON-004", 7, 36, "data-icon-only"],
    ["ODD-BUTTON-005", 8, 36, "aria-disabled"],
    ["ODD-BUTTON-006", 9, 36, "aria-busy"],
    ["ODD-BUTTON-007", 10, 36, "disabled"],
    ["ODD-BUTTON-008", 11, 5, "<button"],
    ["ODD-BUTTON-009", 12, 5, "<a"],
    ["ODD-BUTTON-010", 13, 36, "href"],
    ["ODD-BUTTON-011", 14, 44, "aria-current"],
    ["ODD-BUTTON-012", 15, 36, "aria-current"],
    ["ODD-BUTTON-013", 16, 44, "aria-disabled"],
    ["ODD-BUTTON-014", 17, 5, "<button"],
    ["ODD-BUTTON-015", 18, 36, "data-tone"],
    ["ODD-CLASS-001", 19, 10, "className"],
  ],
  "wrapper-data.tsx": [["ODD-BUTTON-002", 8, 36, 'data-variant="nope"']],
  "wrapper-href.tsx": [
    ["ODD-STATIC-001", 5, 5, "<Button href={url}"],
    ["ODD-STATIC-001", 6, 5, "<Button href={url}"],
    ["ODD-BUTTON-013", 8, 26, "aria-disabled"],
    ["ODD-STATIC-001", 9, 5, "<Button href={url}"],
    ["ODD-BUTTON-002", 9, 24, 'variant="outline"'],
    ["ODD-BUTTON-007", 9, 42, "disabled"],
    ["ODD-BUTTON-008", 10, 5, "<Button href={url} iconOnly>"],
    ["ODD-STATIC-001", 10, 5, "<Button href={url} iconOnly>"],
  ],
  "wrapper.bad.tsx": [
    ["ODD-BUTTON-007", 6, 13, "disabled"],
    ["ODD-BUTTON-007", 7, 16, "disabled"],
    ["ODD-BUTTON-008", 8, 5, "<Button iconOnly>"],
    ["ODD-BUTTON-013", 9, 22, "aria-disabled"],
    ["ODD-BUTTON-002", 10, 13, 'variant="outline"'],
    ["ODD-BUTTON-003", 11, 13, 'size="md"'],
  ],
  "separator.tsx": [
    ["ODD-SEPARATOR-002", 6, 16, 'aria-orientation="verticle"'],
    ["ODD-SEPARATOR-003", 7, 16, 'role="none"'],
    ["ODD-SEPARATOR-003", 8, 16, 'aria-hidden="true"'],
    ["ODD-SEPARATOR-004", 9, 16, "data-tone"],
    ["ODD-SEPARATOR-001", 10, 10, "className"],
  ],
  "skeleton.tsx": [
    ["ODD-SKELETON-002", 6, 34, 'shape="circle"'],
    ["ODD-SKELETON-003", 7, 5, "<Skeleton />"],
    ["ODD-SKELETON-003", 8, 15, "aria-hidden"],
    ["ODD-SKELETON-004", 9, 5, '<Skeleton aria-hidden="true">'],
    ["ODD-SKELETON-004", 10, 34, 'aria-busy="true"'],
    ["ODD-SKELETON-005", 11, 34, "data-size"],
    ["ODD-SKELETON-001", 12, 11, "className"],
  ],
  "wrapper.good.tsx": [],
};

const fixtures = readdirSync(folder)
  .filter((name) => name.endsWith(".tsx"))
  .sort();

for (const name of fixtures) {
  test(`${name} reports its expected codes at their places`, () => {
    const source = readFileSync(`${folder}/${name}`, "utf8");
    const messages = linter.verify(source, flat, { filename: `${folder}/${name}` });
    const located = places[name] ?? [];
    expect(messages.map((message) => codeOf(message.message))).toEqual(expectedCodes(source, /^\/\/ expect: (.+)/));
    expect(messages.map((message) => [codeOf(message.message), message.line, message.column, message.ruleId, message.severity])).toEqual(
      located.map(([code, line, column]) =>
        code === "ODD-STATIC-001" ? [code, line, column, "odd/usage-incomplete", 1] : [code, line, column, "odd/usage", 2],
      ),
    );
    for (const [index, message] of messages.entries()) {
      expect(lineText(source, message.line).slice(message.column - 1).startsWith(located[index]?.[3] ?? "")).toBe(true);
    }
  });
}
