import { readFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { JSXOpeningElement } from "@babel/types";
import babelParser from "@babel/eslint-parser";
import { Linter, type ESLint, type Rule } from "eslint";

type Site = { file: string; line: number };
type ButtonSite = Site & { busy: boolean; blocked: boolean };
type Evidence = {
  tsc: { exit: number; output: string };
  usage: (Site & { message: string })[];
  computed: number;
  raw: Site[];
  buttons: ButtonSite[];
};
type Row = { id: "compiles" | "rules" | "raw-buttons" | "pending" | "busy-blocks"; pass: boolean; lines: string[] };

const parserOptions = {
  requireConfigFile: false,
  babelOptions: {
    babelrc: false,
    configFile: false,
    parserOpts: { plugins: ["typescript", "jsx"] },
  },
};

function rel(app: string, file: string): string {
  return relative(app, file).replaceAll("\\", "/");
}

function buttonRule(app: string, raw: Site[], buttons: ButtonSite[]): Rule.RuleModule {
  return {
    create(context) {
      const imported = new Set<string>();
      return {
        ImportDeclaration(node) {
          if (node.source.value !== "odd-design/react") return;
          for (const specifier of node.specifiers) {
            if (
              specifier.type === "ImportSpecifier" &&
              specifier.imported.type === "Identifier" &&
              specifier.imported.name === "Button"
            ) imported.add(specifier.local.name);
          }
        },
        JSXOpeningElement(node: Rule.Node) {
          const opening = node as unknown as JSXOpeningElement;
          const tag = opening.name.type === "JSXIdentifier" ? opening.name.name : "";
          let odd = false;
          let roleButton = false;
          let busy = false;
          let blocked = false;
          for (const attribute of opening.attributes) {
            if (attribute.type !== "JSXAttribute" || attribute.name.type !== "JSXIdentifier") continue;
            const name = attribute.name.name;
            const text = context.sourceCode.getText(attribute as unknown as Rule.Node);
            if ((name === "class" || name === "className") && /\bodd-button\b/.test(text)) odd = true;
            if (name === "role" && /^role=["'{`\s]*button\b/.test(text)) roleButton = true;
            if (name === "aria-busy") busy = true;
            if (name === "aria-disabled") blocked = true;
          }
          const site = { file: rel(app, context.filename), line: opening.loc?.start.line ?? 1 };
          if ((tag === "button" || roleButton) && !odd) raw.push(site);
          if (imported.has(tag)) buttons.push({ ...site, busy, blocked });
        },
      };
    },
  };
}

export async function lintApp(app: string, plugin: ESLint.Plugin): Promise<Omit<Evidence, "tsc">> {
  const root = resolve(app);
  const raw: Site[] = [];
  const buttons: ButtonSite[] = [];
  const linter = new Linter({ configType: "flat", cwd: root });
  const config: Linter.Config = {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { parser: babelParser, parserOptions },
    plugins: {
      odd: plugin,
      grade: { rules: { buttons: buttonRule(root, raw, buttons) } },
    },
    rules: {
      "odd/usage": "error",
      "odd/usage-incomplete": "warn",
      "grade/buttons": "error",
    },
    linterOptions: { noInlineConfig: true },
  };
  const usage: Evidence["usage"] = [];
  let computed = 0;
  for (const file of new Bun.Glob("src/**/*.{ts,tsx}").scanSync({ cwd: root })) {
    const path = join(root, file);
    for (const message of linter.verify(readFileSync(path, "utf8"), config, path)) {
      if (message.ruleId === "odd/usage" || message.fatal === true) {
        usage.push({ file: rel(root, path), line: message.line, message: message.message });
      } else if (message.ruleId === "odd/usage-incomplete") computed += 1;
    }
  }
  return { usage, computed, raw, buttons };
}

export function grade(evidence: Evidence): Row[] {
  const compileLines = evidence.tsc.output.trim().split(/\r?\n/).filter((line) => line !== "").slice(0, 3);
  const usageLines = evidence.usage.map((item) => `${item.file}:${item.line} ${item.message}`);
  const rawLines = evidence.raw.map((item) => `${item.file}:${item.line}`);
  const unblocked = evidence.buttons.filter((button) => button.busy && !button.blocked);
  return [
    { id: "compiles", pass: evidence.tsc.exit === 0, lines: compileLines },
    { id: "rules", pass: evidence.usage.length === 0, lines: usageLines },
    { id: "raw-buttons", pass: evidence.raw.length === 0, lines: rawLines },
    { id: "pending", pass: evidence.buttons.some((button) => button.busy), lines: ["no button sets aria-busy"] },
    { id: "busy-blocks", pass: unblocked.length === 0, lines: unblocked.map((site) => `${site.file}:${site.line}`) },
  ];
}

function format(app: string, evidence: Evidence): string {
  const rows = grade(evidence);
  const passed = rows.filter((row) => row.pass).length;
  const verdict = passed === rows.length ? "PASS" : "FAIL";
  const lines = [`${basename(app)}  ${verdict}  ${passed}/${rows.length}`];
  for (const row of rows) {
    lines.push(`${row.pass ? "PASS" : "FAIL"}  ${row.id}`);
    if (!row.pass) for (const line of row.lines) lines.push(`  ${line}`);
  }
  if (evidence.computed > 0) lines.push(`note: ${evidence.computed} ODD-STATIC-001 warning`);
  return lines.join("\n");
}

async function main(): Promise<void> {
  const app = process.argv[2];
  if (app === undefined || app === "") throw new Error("usage: bun eval/grade.ts <app>");
  const { default: plugin } = (await import(
    pathToFileURL(join(app, "node_modules/odd-design/dist/eslint/plugin.js")).href,
  )) as { default: ESLint.Plugin };
  const result = Bun.spawnSync({
    cmd: [process.execPath, "x", "tsc", "-p", "tsconfig.json", "--noEmit", "--pretty", "false"],
    cwd: app,
    stdout: "pipe",
    stderr: "pipe",
  });
  const evidence = {
    tsc: { exit: result.exitCode ?? 1, output: `${result.stdout}${result.stderr}` },
    ...(await lintApp(app, plugin)),
  };
  console.log(format(app, evidence));
  if (grade(evidence).some((row) => !row.pass)) process.exitCode = 1;
}

if (import.meta.main) await main();
