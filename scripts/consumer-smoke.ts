import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const fixtures = join(root, "tests/fixtures/consumer");
const tarball = join(root, "odd-design-0.0.0.tgz");
const app = join(tmpdir(), "odd-p10-consumer");
const reactEntry = join(root, "dist/react/button.js");

const FORBIDDEN =
  "ODD-BUTTON-007: the disabled attribute is forbidden on odd-button. Allowed values: none. Fix: remove disabled and set aria-disabled. docs/usage/button.md#odd-button-007";

const BAD_TYPE =
  `src/App.tsx(4,18): error TS2322: Type 'true' is not assignable to type '"${FORBIDDEN}"'.`;

const BAD_ESLINT = [{ ruleId: "odd/usage", severity: 2, message: FORBIDDEN, line: 1, column: 52 }];

const REQUIRED = [
  "dist/react/button.js",
  "dist/react/button.d.ts",
  "dist/js/usage/dom.js",
  "dist/js/usage/dom.d.ts",
  "dist/js/usage/test-setup.js",
  "dist/js/usage/test-setup.d.ts",
  "dist/eslint/plugin.js",
  "dist/eslint/plugin.d.ts",
  "docs/usage/button.md",
  "docs/usage/eslint.md",
  "docs/usage/general.md",
  "docs/usage/react.md",
  "docs/usage/runtime.md",
  "src/css/index.css",
  "src/js/appearance.ts",
  "src/js/enhance.ts",
  "src/js/palette.ts",
];

const ALLOWED = ["dist/", "docs/usage/", "src/css/", "src/js/"];

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

function packedPaths(): string[] {
  const listed = run(["tar", "-tf", tarball], root);
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

function writePackage(): void {
  const manifest = {
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
  writeFileSync(join(app, "package.json"), JSON.stringify(manifest, null, 2));
}

function installVariant(name: string): void {
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

function checkTypes(name: string, expected: string): void {
  const result = run([process.execPath, "x", "tsc", "-p", "tsconfig.json", "--pretty", "false", "--noErrorTruncation"], app);
  const output = result.output.replaceAll("\r\n", "\n").replaceAll("\\", "/").trim();
  console.log(`${name} types:`);
  console.log(output === "" ? "zero" : output);
  if (name === "bad" && result.status === 0) fail("tsc exited 0 for the bad app");
  if (name === "clean" && result.status !== 0) fail(`tsc exited ${result.status} for the clean app\n${output}`);
  if (output !== expected) fail(`${name} types\n${output}`);
}

function checkEslint(name: string, expected: Diagnostic[]): void {
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

function checkVitest(name: string): void {
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
}

const reactFirst = readFileSync(reactEntry, "utf8").split(/\r?\n/, 1)[0] ?? "";
if (reactFirst !== '"use client";') fail(`React entry first line is ${JSON.stringify(reactFirst)}`);
console.log('react entry: "use client"');
assertOneState();

rmSync(tarball, { force: true });
const packed = run([process.execPath, "pm", "pack"], root);
if (packed.status !== 0) fail(packed.output);
const paths = packedPaths();
assertPack(paths);

rmSync(app, { recursive: true, force: true });
mkdirSync(app, { recursive: true });
copyTree(join(fixtures, "shared"), app);
writePackage();
const installed = run([process.execPath, "install"], app);
if (installed.status !== 0) fail(installed.output);

const rules = run(["node", "-e", "import('odd-design/eslint').then(m => console.log(Object.keys(m.default.rules)))"], app);
console.log("eslint rules:");
console.log(rules.output.trim());
if (rules.status !== 0) fail(rules.output);
if (rules.output.trim() !== "[ 'usage', 'usage-incomplete', 'disable-reason' ]") fail(rules.output);

installVariant("bad");
checkTypes("bad", BAD_TYPE);
checkEslint("bad", BAD_ESLINT);
checkVitest("bad");

installVariant("clean");
checkTypes("clean", "");
checkEslint("clean", []);
checkVitest("clean");

rmSync(tarball, { force: true });
rmSync(app, { recursive: true, force: true });
