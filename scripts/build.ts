import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { FIRST_PAINT_SCRIPT } from "../src/js/appearance.ts";

const root = join(import.meta.dir, "..");
const css = join(root, "src/css");
const dist = join(root, "dist");

rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, "files"), { recursive: true });

// Plain text inlining on purpose: CSS bundlers lower light-dark() and drop
// newer pseudo-elements like ::picker, which changes behavior.
function inlineLayers(entry: string) {
  return readFileSync(entry, "utf8").replace(/^@import\b.*$/gm, (line) => {
    const m = line.match(/^@import "(\.\/[\w/-]+\.css)" layer\(([\w-]+)\);$/);
    if (!m) throw new Error(`Unsupported @import in ${entry}: ${line}`);
    const partial = readFileSync(join(dirname(entry), m[1]!), "utf8");
    if (/@import\b|url\((?!["']?data:)/.test(partial)) throw new Error(`${m[1]} has an @import or url(), which inlining would break`);
    return `@layer ${m[2]} {\n${partial.trimEnd()}\n}`;
  });
}

function bundleFonts(entry: string) {
  const packages = [...readFileSync(entry, "utf8").matchAll(/^@import "([^"]+)";$/gm)].map((m) => m[1]!);
  if (packages.length === 0) throw new Error(`No font packages found in ${entry}`);
  const copied = new Set<string>();
  const out = packages.map((pkg) => {
    const index = Bun.resolveSync(pkg, root);
    const text = readFileSync(index, "utf8");
    for (const [, file] of text.matchAll(/url\(\.\/files\/([^)]+)\)/g)) {
      if (copied.has(file!)) throw new Error(`Font file ${file} exists in more than one package`);
      copied.add(file!);
      copyFileSync(join(dirname(index), "files", file!), join(dist, "files", file!));
    }
    return `/* ${pkg} */\n${text.trim()}\n`;
  });
  return out.join("\n");
}

async function bundleAppearance() {
  const result = await Bun.build({
    entrypoints: [join(root, "src/js/appearance.ts")],
    outdir: dist,
    format: "esm",
    target: "browser",
    minify: false,
  });
  if (!result.success) throw new AggregateError(result.logs, "Bun.build failed for appearance.ts");
}

function emitDeclarations() {
  const out = mkdtempSync(join(tmpdir(), "odd-design-dts-"));
  try {
    const tsc = Bun.spawnSync(
      [
        process.execPath, "run", "tsc", "--ignoreConfig", "src/js/appearance.ts",
        "--declaration", "--emitDeclarationOnly", "--outDir", out,
        "--allowImportingTsExtensions", "--rewriteRelativeImportExtensions",
        "--target", "es2023", "--module", "esnext", "--moduleResolution", "bundler",
        "--lib", "es2023,dom", "--skipLibCheck",
      ],
      { cwd: root, stdout: "pipe", stderr: "pipe" },
    );
    if (tsc.exitCode !== 0) throw new Error(`tsc failed:\n${tsc.stdout}${tsc.stderr}`);
    for (const file of readdirSync(out)) {
      // tsc keeps `./contract.ts` in declarations; consumers resolve `./contract.js` to contract.d.ts.
      const text = readFileSync(join(out, file), "utf8").replace(/(from "\.\/[\w-]+)\.ts"/g, '$1.js"');
      writeFileSync(join(dist, file), text);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

// bun installs a `file:` folder dependency by linking every file in it and installing its
// devDependencies, so pointing a consumer at the repo root drags in Storybook and recurses
// into examples/. dist/package.json makes dist itself a clean folder dependency.
function distManifest() {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const strip = (value: unknown): unknown =>
    typeof value === "string"
      ? value.replace(/^\.\/dist\//, "./")
      : Object.fromEntries(Object.entries(value as object).map(([k, v]) => [k, strip(v)]));
  const { name, version, private: isPrivate, type, description, exports } = pkg;
  return `${JSON.stringify({ name, version, private: isPrivate, type, description, exports: strip(exports) }, null, 2)}\n`;
}

writeFileSync(join(dist, "package.json"), distManifest());
writeFileSync(join(dist, "odd-design.css"), inlineLayers(join(css, "index.css")));
writeFileSync(join(dist, "fonts.css"), bundleFonts(join(css, "fonts.css")));
// TypeScript 6+ rejects side-effect imports it can't resolve, so the CSS exports need a types entry.
writeFileSync(join(dist, "css.d.ts"), "export {};\n");
writeFileSync(join(dist, "first-paint.js"), `${FIRST_PAINT_SCRIPT}\n`);
await bundleAppearance();
emitDeclarations();

