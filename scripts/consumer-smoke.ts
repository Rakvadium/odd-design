import { copyFileSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { WRAPPERS } from "../src/js/usage/contract.ts";

const root = join(import.meta.dir, "..");
const fixtures = join(root, "tests/fixtures/consumer");
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { name: string; version: string };
const expectedTarball = join(root, `${manifest.name}-${manifest.version}.tgz`);
const CLIENT_MODULES = ["button.js", "tabs.js", "toast.js"];

const FORBIDDEN =
  "ODD-BUTTON-007: the disabled attribute is forbidden on odd-button. Allowed values: none. Fix: remove disabled and set aria-disabled. docs/usage/button.md#odd-button-007";

const BAD_TYPE =
  `src/App.tsx(4,18): error TS2322: Type 'true' is not assignable to type '"${FORBIDDEN}"'.`;

const BAD_ESLINT = [{ ruleId: "odd/usage", severity: 2, message: FORBIDDEN, line: 1, column: 52 }];

const HOOK_TESTS = [
  "afterEach fails a DOM test that never calls flush",
  "afterEach fails a React test that never calls flush",
];

const REACT_EXPORTS = Object.keys(WRAPPERS).sort().join();

const REQUIRED = [
  "dist/react/index.js",
  "dist/react/index.d.ts",
  "dist/js/usage/dom.js",
  "dist/js/usage/dom.d.ts",
  "dist/js/usage/test-setup.js",
  "dist/js/usage/test-setup.d.ts",
  "dist/js/enhance.js",
  "dist/js/enhance.d.ts",
  "dist/js/appearance.js",
  "dist/js/appearance.d.ts",
  "dist/js/palette.js",
  "dist/js/palette.d.ts",
  "dist/eslint/plugin.js",
  "dist/eslint/plugin.d.ts",
  "docs/recipes/number-stepper.md",
  "docs/recipes/slider-with-number.md",
  "docs/recipes/stat-row.md",
  "docs/usage/alert.md",
  "docs/usage/avatar.md",
  "docs/usage/badge.md",
  "docs/usage/button.md",
  "docs/usage/card.md",
  "docs/usage/choice.md",
  "docs/usage/disclosure.md",
  "docs/usage/eslint.md",
  "docs/usage/field.md",
  "docs/usage/general.md",
  "docs/usage/react.md",
  "docs/usage/runtime.md",
  "docs/usage/separator.md",
  "docs/usage/skeleton.md",
  "docs/usage/tabs.md",
  "docs/usage/search.md",
  "docs/usage/slider.md",
  "docs/usage/meter.md",
  "docs/usage/toast.md",
  "docs/usage/popover.md",
  "docs/usage/dialog.md",
  "docs/usage/sheet.md",
  "docs/usage/menu.md",
  "docs/usage/table.md",
  "docs/usage/base.md",
  "docs/usage/grid.md",
  "docs/usage/shell.md",
  "docs/usage/typography.md",
  "src/css/index.css",
  "src/js/appearance.ts",
  "src/js/enhance.ts",
  "src/js/palette.ts",
];

const ALLOWED = ["dist/", "docs/recipes/", "docs/usage/", "src/css/", "src/js/"];

const PACK_EXCLUDED = ["dist/eslint/html.js", "dist/eslint/jsx.js", "dist/eslint/html.d.ts", "dist/eslint/jsx.d.ts"];

type Diagnostic = { ruleId: string | null; severity: number; message: string; line: number; column: number };

function fail(message: string): never {
  throw new Error(message);
}

function run(cmd: string[], cwd: string): { status: number; output: string } {
  const result = Bun.spawnSync({ cmd, cwd, stdout: "pipe", stderr: "pipe" });
  return { status: result.exitCode ?? 1, output: `${result.stdout.toString()}${result.stderr.toString()}` };
}

function copyTree(from: string, to: string): void {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    const source = join(from, entry.name);
    const target = join(to, entry.name);
    if (entry.isDirectory()) copyTree(source, target);
    else copyFileSync(source, target);
  }
}

function tarballFrom(output: string): string {
  const named = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.endsWith(".tgz"));
  if (named === undefined) fail(`pack did not name a tarball\n${output}`);
  return basename(named);
}

function packedPaths(file: string): string[] {
  const listed = run(["tar", "-tf", basename(file)], dirname(file));
  if (listed.status !== 0) fail(listed.output);
  return listed.output
    .split(/\r?\n/)
    .map((line) => line.replaceAll("\\", "/").replace(/^package\//, ""))
    .filter((line) => line !== "" && !line.endsWith("/"));
}

function assertPack(paths: string[]): void {
  console.log("pack:");
  for (const path of paths) console.log(path);
  for (const path of REQUIRED) {
    if (!paths.includes(path)) fail(`pack is missing ${path}`);
  }
  for (const path of paths) {
    if (PACK_EXCLUDED.includes(path)) fail(`pack has ${path}`);
    if (path === "package.json" || path === "README.md") continue;
    if (!ALLOWED.some((prefix) => path.startsWith(prefix))) fail(`pack has ${path} outside the files allowlist`);
    if (path.startsWith("dist/") && path.endsWith(".ts") && !path.endsWith(".d.ts")) fail(`pack has TypeScript in dist: ${path}`);
  }
}

function assertOneState(): void {
  const setup = readFileSync(join(root, "dist/js/usage/test-setup.js"), "utf8");
  if (!setup.includes('from "./dom.js"')) fail("test-setup.js does not import ./dom.js");
  const flushFiles: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith(".js") && readFileSync(path, "utf8").includes("function flush")) flushFiles.push(path);
    }
  };
  walk(join(root, "dist"));
  console.log(`flush copies: ${flushFiles.length}`);
  if (flushFiles.length !== 1 || !flushFiles[0]?.endsWith("dom.js")) fail(`flush lives in ${flushFiles.join(", ")}`);
}

function writePackage(app: string, tarball: string): void {
  const packageManifest = {
    name: "odd-consumer",
    private: true,
    type: "module",
    dependencies: {
      "odd-design": `file:${tarball.replaceAll("\\", "/")}`,
      react: "19.3.0",
      "react-dom": "19.3.0",
    },
    devDependencies: {
      "@html-eslint/parser": "0.67.0",
      "@types/react": "19.3.0",
      "@types/react-dom": "19.3.0",
      "@vitejs/plugin-react": "6.1.2",
      eslint: "10.13.0",
      "happy-dom": "21.0.4",
      typescript: "6.0.3",
      "typescript-eslint": "8.72.0",
      vite: "8.3.4",
      vitest: "5.0.5",
    },
  };
  writeFileSync(join(app, "package.json"), JSON.stringify(packageManifest, null, 2));
}

function installVariant(app: string, name: string): void {
  rmSync(join(app, "src"), { recursive: true, force: true });
  rmSync(join(app, "tests"), { recursive: true, force: true });
  copyTree(join(fixtures, "shared/src"), join(app, "src"));
  copyTree(join(fixtures, "shared/tests"), join(app, "tests"));
  copyTree(join(fixtures, name), app);
}

function eslintDiagnostics(output: string): Diagnostic[] {
  const start = output.indexOf("[");
  const end = output.lastIndexOf("]");
  if (start === -1 || end === -1) fail(`eslint did not print JSON\n${output}`);
  const parsed: unknown = JSON.parse(output.slice(start, end + 1));
  if (!Array.isArray(parsed)) fail("eslint JSON is not a list");
  return parsed.flatMap((file: { messages?: Diagnostic[] }) => file.messages ?? []);
}

function sameDiagnostics(actual: Diagnostic[], expected: Diagnostic[]): boolean {
  if (actual.length !== expected.length) return false;
  return actual.every((item, index) => {
    const want = expected[index];
    return (
      want !== undefined &&
      item.ruleId === want.ruleId &&
      item.severity === want.severity &&
      item.message === want.message &&
      item.line === want.line &&
      item.column === want.column
    );
  });
}

function checkTypes(app: string, name: string, expected: string): void {
  const result = run([process.execPath, "x", "tsc", "-p", "tsconfig.json", "--pretty", "false", "--noErrorTruncation"], app);
  const output = result.output.replaceAll("\r\n", "\n").replaceAll("\\", "/").trim();
  console.log(`${name} types:`);
  console.log(output === "" ? "zero" : output);
  if (name === "bad" && result.status === 0) fail("tsc exited 0 for the bad app");
  if (name === "clean" && result.status !== 0) fail(`tsc exited ${result.status} for the clean app\n${output}`);
  if (output !== expected) fail(`${name} types\n${output}`);
}

function checkEslint(app: string, name: string, expected: Diagnostic[]): void {
  const result = run([process.execPath, "x", "eslint", "src/raw-button.tsx", "-f", "json"], app);
  const actual = eslintDiagnostics(result.output).map((item) => ({
    ruleId: item.ruleId,
    severity: item.severity,
    message: item.message,
    line: item.line,
    column: item.column,
  }));
  console.log(`${name} eslint:`);
  console.log(actual.length === 0 ? "zero" : JSON.stringify(actual));
  if (name === "bad" && result.status === 0) fail("eslint exited 0 for the bad app");
  if (name === "clean" && result.status !== 0) fail(`eslint exited ${result.status} for the clean app\n${result.output}`);
  if (!sameDiagnostics(actual, expected)) fail(`${name} eslint\n${JSON.stringify(actual)}`);
}

function failureBody(output: string, name: string): string {
  const lines = output.split(/\r?\n/);
  const header = `FAIL  tests/button.fixture.ts > ${name}`;
  const index = lines.findIndex((line) => line.trim() === header);
  if (index === -1) fail(`Vitest did not fail ${name}\n${output}`);
  let cursor = index + 1;
  while (cursor < lines.length && (lines[cursor] ?? "").trim().startsWith("FAIL  tests/button.fixture.ts > ")) cursor += 1;
  const body: string[] = [];
  while (cursor < lines.length && !(lines[cursor] ?? "").includes("⎯⎯⎯")) {
    body.push(lines[cursor] ?? "");
    cursor += 1;
  }
  return body.join("\n");
}

function assertHookFailure(output: string, name: string): void {
  const body = failureBody(output, name);
  const domAt = body.indexOf("dist/js/usage/dom.js");
  const setupAt = body.indexOf("dist/js/usage/test-setup.js");
  if (!body.includes(FORBIDDEN) || domAt === -1 || setupAt === -1 || domAt > setupAt) {
    fail(`${name} did not fail through test-setup.js into dom.js\n${body}`);
  }
}

function checkVitest(app: string, name: string): void {
  const result = run([process.execPath, "x", "vitest", "run"], app);
  console.log(`${name} vitest:`);
  if (name === "clean") {
    console.log(result.status === 0 && !result.output.includes("ODD-") ? "zero" : result.output);
    if (result.status !== 0) fail(`Vitest exited ${result.status} for the clean app\n${result.output}`);
    if (result.output.includes("ODD-")) fail(`clean vitest reported a code\n${result.output}`);
    return;
  }
  console.log(result.output);
  if (result.status === 0) fail("Vitest exited 0");
  if (!result.output.includes(FORBIDDEN)) fail(`Vitest missed ${FORBIDDEN}\n${result.output}`);
  if (result.output.includes("did not report ODD-BUTTON-007")) fail(`flush missed the setup state\n${result.output}`);
  if (!result.output.includes("flush from odd-design/usage reports the disabled button")) {
    fail(`Vitest did not fail the flush test\n${result.output}`);
  }
  for (const testName of HOOK_TESTS) assertHookFailure(result.output, testName);
  if (result.output.includes("FAIL  tests/button.fixture.ts > the next test starts with an empty body")) {
    fail(`the next test did not start with an empty body\n${result.output}`);
  }
}

let tarball = expectedTarball;
let app: string | undefined;
try {
  for (const name of CLIENT_MODULES) {
    const first = readFileSync(join(root, "dist/react", name), "utf8").split(/\r?\n/, 1)[0] ?? "";
    if (first !== '"use client";') fail(`${name} first line is ${JSON.stringify(first)}`);
    console.log(`${name}: "use client"`);
  }
  assertOneState();

  rmSync(tarball, { force: true });
  const packed = run([process.execPath, "pm", "pack"], root);
  if (packed.status !== 0) fail(packed.output);
  tarball = join(root, tarballFrom(packed.output));
  const paths = packedPaths(tarball);
  assertPack(paths);

  app = mkdtempSync(join(tmpdir(), "odd-p10-consumer-"));
  copyTree(join(fixtures, "shared"), app);
  writePackage(app, tarball);
  const installed = run([process.execPath, "install"], app);
  if (installed.status !== 0) fail(installed.output);

  const rules = run(["node", "-e", "import('odd-design/eslint').then(m => console.log(Object.keys(m.default.rules)))"], app);
  console.log("eslint rules:");
  console.log(rules.output.trim());
  if (rules.status !== 0) fail(rules.output);
  if (rules.output.trim() !== "[ 'usage', 'usage-incomplete', 'disable-reason' ]") fail(rules.output);

  const parts = run(["node", "-e", "import('odd-design/react').then(m => console.log(Object.keys(m).sort().join()))"], app);
  console.log("react exports:");
  console.log(parts.output.trim());
  if (parts.status !== 0) fail(parts.output);
  if (parts.output.trim() !== REACT_EXPORTS) fail(parts.output);

  installVariant(app, "bad");
  checkTypes(app, "bad", BAD_TYPE);
  checkEslint(app, "bad", BAD_ESLINT);
  checkVitest(app, "bad");

  installVariant(app, "clean");
  checkTypes(app, "clean", "");
  checkEslint(app, "clean", []);
  checkVitest(app, "clean");
} finally {
  rmSync(tarball, { force: true });
  rmSync(expectedTarball, { force: true });
  if (app !== undefined) rmSync(app, { recursive: true, force: true });
}
