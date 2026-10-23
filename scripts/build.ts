import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const dist = join(root, "dist");
const entries = [
  "src/react/button.tsx",
  "src/js/usage/dom.ts",
  "src/js/usage/test-setup.ts",
  "src/eslint/plugin.ts",
];

const config = {
  compilerOptions: {
    target: "ES2023",
    module: "NodeNext",
    moduleResolution: "NodeNext",
    lib: ["ES2023", "DOM", "DOM.Iterable"],
    jsx: "react-jsx",
    strict: true,
    skipLibCheck: true,
    declaration: true,
    outDir: dist,
    rootDir: join(root, "src"),
    rewriteRelativeImportExtensions: true,
    allowImportingTsExtensions: true,
    verbatimModuleSyntax: true,
  },
  files: entries.map((entry) => join(root, entry)),
};

const configPath = join(tmpdir(), "odd-design-p10-tsconfig.json");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
writeFileSync(configPath, JSON.stringify(config));

const tsc = Bun.spawnSync({
  cmd: [process.execPath, "x", "tsc", "-p", configPath],
  cwd: root,
  stdout: "pipe",
  stderr: "pipe",
});
if (tsc.exitCode !== 0) {
  process.stderr.write(tsc.stdout);
  process.stderr.write(tsc.stderr);
  process.exit(tsc.exitCode ?? 1);
}

const bundled = Bun.spawnSync({
  cmd: [
    process.execPath,
    "build",
    join(root, "src/eslint/plugin.ts"),
    "--outfile",
    join(dist, "eslint/plugin.js"),
    "--target",
    "node",
    "--format",
    "esm",
    "--external",
    "eslint",
  ],
  cwd: root,
  stdout: "pipe",
  stderr: "pipe",
});
if (bundled.exitCode !== 0) {
  process.stderr.write(bundled.stdout);
  process.stderr.write(bundled.stderr);
  process.exit(bundled.exitCode ?? 1);
}

rmSync(join(dist, "eslint/html.js"), { force: true });
rmSync(join(dist, "eslint/jsx.js"), { force: true });
rewriteDeclarations(dist);

function rewriteDeclarations(dir: string): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      rewriteDeclarations(path);
      continue;
    }
    if (!entry.name.endsWith(".d.ts")) continue;
    const source = readFileSync(path, "utf8");
    const rewritten = source.replaceAll(/from "(\.[^"]+)\.tsx?"/g, 'from "$1.js"');
    if (rewritten !== source) writeFileSync(path, rewritten);
  }
}
