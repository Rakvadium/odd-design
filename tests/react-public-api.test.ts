import { expect, test } from "bun:test";
import { readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { emitDeclarations } from "../scripts/build.ts";
import { exportedNames, reachableDeclarations } from "./react-public-api.ts";

const repo = fileURLToPath(new URL("..", import.meta.url));
const outDir = join(repo, ".verify", "react-public-api");

const barrelRegression =
  "odd-design/react's names must equal the names exported by src/react/*.tsx. A difference means the barrel added a non-component export such as WrapperProps, or dropped a component export.";

const leakRegression =
  "a declaration reachable from odd-design/react mentions WrapperProps, or a component declaration was not reached. src/react/props.ts is story metadata and must stay out of the published types.";

function publishedReactTypes(emitDir: string): string {
  const manifest = JSON.parse(readFileSync(join(repo, "package.json"), "utf8")) as { exports?: unknown };
  if (typeof manifest.exports !== "object" || manifest.exports === null) throw new Error("package.json has no exports");
  const keys = Object.keys(manifest.exports).filter((key) => key.startsWith("./react"));
  expect(keys).toEqual(["./react"]);
  const spec = (manifest.exports as Record<string, unknown>)["./react"];
  if (typeof spec !== "object" || spec === null || !("types" in spec) || typeof spec.types !== "string") {
    throw new Error("./react export has no types path");
  }
  const distPrefix = "./dist/";
  if (!spec.types.startsWith(distPrefix)) throw new Error(`./react types path is not under dist: ${spec.types}`);
  return join(emitDir, spec.types.slice(distPrefix.length));
}

function emitReactDeclarations(): void {
  rmSync(outDir, { recursive: true, force: true });
  const reactDir = join(repo, "src", "react");
  const components = readdirSync(reactDir)
    .filter((name) => name.endsWith(".tsx"))
    .sort()
    .map((name) => `src/react/${name}`);
  emitDeclarations(outDir, ["src/react/index.ts", ...components]);
}

test(
  "the published react entry exports only the component modules",
  () => {
    const entry = publishedReactTypes(outDir);
    emitReactDeclarations();
    const reactOut = dirname(entry);
    const componentDts = readdirSync(join(repo, "src", "react"))
      .filter((name) => name.endsWith(".tsx"))
      .sort()
      .map((name) => join(reactOut, name.replace(/\.tsx$/, ".d.ts")));
    const entryNames = exportedNames(entry);
    const componentNames = [...new Set(componentDts.flatMap((file) => exportedNames(file)))].sort();
    if (componentNames.length === 0) {
      throw new Error("src/react/*.tsx emitted no exports, so an equal pair of empty lists would pass");
    }
    expect({ regression: barrelRegression, names: entryNames }).toEqual({
      regression: barrelRegression,
      names: componentNames,
    });

    const reachable = reachableDeclarations(entry);
    const unread = componentDts.filter((file) => !reachable.includes(file));
    const leaked = reachable.filter((file) => readFileSync(file, "utf8").includes("WrapperProps"));
    expect({ regression: leakRegression, leaked, unread }).toEqual({
      regression: leakRegression,
      leaked: [],
      unread: [],
    });
  },
  { timeout: 60_000 },
);
