import fs from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import babelParser from "@babel/eslint-parser";
import { ESLint } from "eslint";
import type { Rule, Scope } from "eslint";

type Site = { file: string; line: number };
type ButtonSite = Site & { busy: boolean; blocked: boolean };
type Evidence = { tsc: { exit: number; output: string }; usage: (Site & { message: string })[]; computed: number; raw: Site[]; buttons: ButtonSite[] };
type CheckId = "compiles" | "rules" | "raw-buttons" | "pending" | "busy-blocks";
type Check = { id: CheckId; run(evidence: Evidence): { pass: boolean; detail: string } };
type JsxName = { type: string; name?: string };
type JsxAttribute = { type: string; name?: JsxName; value: unknown };
type Opening = { name: JsxName; attributes: readonly JsxAttribute[]; loc?: { start: { line: number } } };

const parserOptions = { requireConfigFile: false, babelOptions: { babelrc: false, configFile: false, parserOpts: { plugins: ["typescript", "jsx"] } } };

function rel(app: string, file: string): string {
  return relative(app, file).replaceAll("\\", "/");
}

function importedButton(name: string, scope: Scope.Scope | null): boolean {
  for (let current = scope; current !== null; current = current.upper) {
    const variable = current.set.get(name);
    if (variable === undefined) continue;
    return variable.defs.some((definition) => {
      if (definition.type !== "ImportBinding" || definition.node.type !== "ImportSpecifier") return false;
      const imported = definition.node.imported;
      const importedName = imported.type === "Identifier" ? imported.name : String(imported.value);
      return importedName === "Button" && definition.parent.source.value === "odd-design/react";
    });
  }
  return false;
}

function literals(node: unknown): string[] {
  if (Array.isArray(node)) return node.flatMap(literals);
  if (typeof node !== "object" || node === null) return [];
  const record = node as Record<string, unknown>;
  if (record.type === "Literal" && typeof record.value === "string") return [record.value];
  const value = record.type === "TemplateElement" ? record.value : undefined;
  if (typeof value === "object" && value !== null && "cooked" in value && typeof value.cooked === "string") return [value.cooked];
  return Object.entries(record).flatMap(([key, child]) => (key === "parent" ? [] : literals(child)));
}

function buttonRule(app: string, raw: Site[], buttons: ButtonSite[]): Rule.RuleModule {
  return {
    meta: { type: "problem", schema: [] },
    create(context) {
      return {
        JSXOpeningElement(node: Rule.Node) {
          const opening = node as unknown as Opening;
          const site = { file: rel(app, context.filename), line: opening.loc?.start.line ?? 1 };
          const tag = opening.name.type === "JSXIdentifier" ? (opening.name.name ?? "") : "";
          const names = new Set<string>();
          let role = "";
          let oddButton = false;
          for (const attribute of opening.attributes) {
            if (attribute.type !== "JSXAttribute" || attribute.name?.type !== "JSXIdentifier") continue;
            const name = attribute.name.name ?? "";
            names.add(name);
            const words = literals(attribute.value).flatMap((text) => text.split(/\s+/));
            if (name === "role") role = words[0] ?? "";
            if ((name === "class" || name === "className") && words.includes("odd-button")) oddButton = true;
          }
          if ((tag === "button" || role === "button") && !oddButton) raw.push(site);
          if (tag !== "" && importedButton(tag, context.sourceCode.getScope(node))) {
            buttons.push({ ...site, busy: names.has("aria-busy"), blocked: names.has("aria-disabled") });
          }
        },
      };
    },
  };
}

async function lintFiles(eslint: ESLint): Promise<ESLint.LintResult[]> {
  // Bun rejects the AbortSignal ESLint passes to fs.readFile. Read as utf8 instead.
  const readFile = fs.promises.readFile;
  fs.promises.readFile = ((file: Parameters<typeof readFile>[0]) => readFile(file, "utf8")) as unknown as typeof readFile;
  try {
    return await eslint.lintFiles(["src/**/*.{ts,tsx}"]);
  } finally {
    fs.promises.readFile = readFile;
  }
}

export async function lintApp(app: string, plugin: unknown): Promise<Omit<Evidence, "tsc">> {
  if (typeof plugin !== "object" || plugin === null || !("rules" in plugin)) throw new Error("odd-design eslint plugin is missing rules");
  const root = resolve(app);
  const raw: Site[] = [];
  const buttons: ButtonSite[] = [];
  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: true,
    overrideConfig: [{
      files: ["**/*.{ts,tsx}"],
      languageOptions: { parser: babelParser, parserOptions },
      plugins: { odd: plugin as ESLint.Plugin, grade: { rules: { buttons: buttonRule(root, raw, buttons) } } },
      rules: { "odd/usage": "error", "odd/usage-incomplete": "warn", "grade/buttons": "error" },
      linterOptions: { noInlineConfig: true },
    }],
  });
  const usage: Evidence["usage"] = [];
  let computed = 0;
  for (const result of await lintFiles(eslint)) {
    const file = rel(root, result.filePath);
    for (const message of result.messages) {
      if (message.ruleId === "odd/usage" || message.fatal === true) usage.push({ file, line: message.line, message: message.message });
      else if (message.ruleId === "odd/usage-incomplete") computed += 1;
    }
  }
  return { usage, computed, raw, buttons };
}

function tally(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function outcome(ok: boolean, detail: string): { pass: boolean; detail: string } {
  return { pass: ok, detail: ok ? "" : detail };
}

function place(lines: string[]): string {
  return lines.map((line) => `\n                  ${line}`).join("");
}

export const CHECKS: readonly Check[] = [
  {
    id: "compiles",
    run: (evidence) => {
      const body = evidence.tsc.output.trim().split(/\r?\n/).filter((line) => line !== "").slice(0, 3);
      return outcome(evidence.tsc.exit === 0, `${body[0] ?? `exit ${evidence.tsc.exit}`}${place(body.slice(1))}`);
    },
  },
  { id: "rules", run: (evidence) => outcome(evidence.usage.length === 0, tally(evidence.usage.length, "odd/usage error") + place(evidence.usage.map((item) => `${item.file}:${item.line} ${item.message}`))) },
  { id: "raw-buttons", run: (evidence) => outcome(evidence.raw.length === 0, tally(evidence.raw.length, "raw button") + place(evidence.raw.map((item) => `${item.file}:${item.line}`))) },
  { id: "pending", run: (evidence) => outcome(evidence.buttons.some((button) => button.busy), "no button sets aria-busy") },
  {
    id: "busy-blocks",
    run: (evidence) => {
      const open = evidence.buttons.filter((button) => button.busy && !button.blocked);
      const noun = open.length === 1 ? "button stays" : "buttons stay";
      return outcome(open.length === 0, `${open.length} busy ${noun} clickable${place(open.map((button) => `${button.file}:${button.line}`))}`);
    },
  },
];

export function grade(evidence: Evidence): { id: string; pass: boolean; detail: string }[] {
  return CHECKS.map((check) => ({ id: check.id, ...check.run(evidence) }));
}

function format(app: string, evidence: Evidence): string {
  const rows = grade(evidence);
  const passed = rows.filter((row) => row.pass).length;
  const lines = [`${basename(app)}  ${passed === rows.length ? "PASS" : "FAIL"}  ${passed}/${rows.length}`];
  for (const row of rows) {
    const status = row.pass ? "PASS" : "FAIL";
    const [first = "", ...rest] = row.detail === "" ? [""] : row.detail.split("\n");
    lines.push(first === "" ? `${status}  ${row.id}` : `${status}  ${row.id.padEnd(12)}${first}`);
    for (const extra of rest) lines.push(extra);
  }
  if (evidence.computed > 0) lines.push(`note: ${tally(evidence.computed, "ODD-STATIC-001 warning")}`);
  return lines.join("\n");
}

function spawn(cmd: string[], cwd: string): { exit: number; output: string } {
  const result = Bun.spawnSync({ cmd, cwd, stdout: "pipe", stderr: "pipe" });
  return { exit: result.exitCode ?? 1, output: `${result.stdout}${result.stderr}` };
}

async function main(): Promise<void> {
  const app = process.argv[2];
  if (app === undefined || app === "") throw new Error("usage: bun eval/grade.ts <app>");
  const loaded: unknown = await import(pathToFileURL(join(app, "node_modules/odd-design/dist/eslint/plugin.js")).href);
  if (typeof loaded !== "object" || loaded === null || !("default" in loaded)) throw new Error("odd-design eslint plugin has no default export");
  const tsc = spawn([process.execPath, "x", "tsc", "-p", "tsconfig.json", "--noEmit", "--pretty", "false"], app);
  const evidence = { tsc, ...(await lintApp(app, loaded.default)) };
  console.log(format(app, evidence));
  if (grade(evidence).some((row) => !row.pass)) process.exitCode = 1;
}

if (import.meta.main) await main();
