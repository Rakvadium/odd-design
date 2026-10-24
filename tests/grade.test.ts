import { expect, test } from "bun:test";
import { grade, lintApp } from "../eval/grade.ts";
import plugin from "../src/eslint/plugin.ts";

const ok = { exit: 0, output: "" };

async function pairs(app: string) {
  return grade({ tsc: ok, ...(await lintApp(app, plugin)) }).map((row) => [row.id, row.pass]);
}

test("grade", async () => {
  expect(await pairs("tests/fixtures/grade/bad")).toEqual([
    ["compiles", true],
    ["rules", false],
    ["raw-buttons", false],
    ["pending", true],
    ["busy-blocks", false],
  ]);
  expect(await pairs("tests/fixtures/grade/clean")).toEqual([
    ["compiles", true],
    ["rules", true],
    ["raw-buttons", true],
    ["pending", true],
    ["busy-blocks", true],
  ]);
  expect(await pairs("eval/template")).toEqual([
    ["compiles", true],
    ["rules", true],
    ["raw-buttons", true],
    ["pending", false],
    ["busy-blocks", true],
  ]);
  expect(grade({ tsc: { exit: 2, output: "src/App.tsx(1,1): error TS2304" }, usage: [], computed: 0, raw: [], buttons: [] }).map((row) => [row.id, row.pass])).toEqual([
    ["compiles", false],
    ["rules", true],
    ["raw-buttons", true],
    ["pending", false],
    ["busy-blocks", true],
  ]);
});
