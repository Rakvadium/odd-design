import { existsSync, readFileSync } from "node:fs";
import { dirname, normalize, resolve } from "node:path";

const exportKeyword =
  /export\s+(?:declare\s+)?(?:default\s+)?(?:async\s+)?(?:abstract\s+)?(?:type|interface|class|enum|function|const|let|var|namespace)\s+([A-Za-z_$][\w$]*)/g;
const exportBrace = /export\s+(?:type\s+)?\{([^}]+)\}/g;
const exportStarAs = /export\s*\*\s*as\s+([A-Za-z_$][\w$]*)\s*from\s*["'][^"']+["']/g;
const exportStar = /export\s*\*\s*from\s*["']([^"']+)["']/g;
const relativeFrom = /from\s*["'](\.[^"']+)["']/g;
const importCall = /import\s*\(\s*["'](\.[^"']+)["']\s*\)/g;

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'])\/\/.*$/gm, "$1");
}

function specifierName(part: string): string | undefined {
  const trimmed = part.trim().replace(/^type\s+/, "");
  const alias = /^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/.exec(trimmed);
  if (alias?.[2] !== undefined) return alias[2];
  const name = /^([A-Za-z_$][\w$]*)$/.exec(trimmed);
  return name?.[1];
}

function localNames(source: string): string[] {
  const text = stripComments(source);
  const names: string[] = [];
  for (const match of text.matchAll(exportKeyword)) {
    const name = match[1];
    if (name !== undefined) names.push(name);
  }
  for (const match of text.matchAll(exportBrace)) {
    for (const part of (match[1] ?? "").split(",")) {
      const name = specifierName(part);
      if (name !== undefined) names.push(name);
    }
  }
  for (const match of text.matchAll(exportStarAs)) {
    const name = match[1];
    if (name !== undefined) names.push(name);
  }
  return names;
}

function readDeclaration(file: string): string {
  if (!existsSync(file)) throw new Error(`missing declaration ${file}`);
  return readFileSync(file, "utf8");
}

function declarationPath(fromFile: string, specifier: string): string {
  const target = resolve(dirname(fromFile), specifier);
  return target.replace(/\.(tsx|ts|jsx|js|mts|cts)$/, ".d.ts");
}

export function exportedNames(entryDts: string): string[] {
  const names = new Set<string>();
  const seen = new Set<string>();
  function visit(file: string): void {
    const key = normalize(file);
    if (seen.has(key)) return;
    seen.add(key);
    const source = readDeclaration(file);
    for (const name of localNames(source)) names.add(name);
    for (const match of stripComments(source).matchAll(exportStar)) {
      const spec = match[1];
      if (spec === undefined) continue;
      if (!spec.startsWith(".")) throw new Error(`non-relative export * from "${spec}" in ${file}`);
      visit(declarationPath(file, spec));
    }
  }
  visit(entryDts);
  return [...names].sort();
}

export function reachableDeclarations(entryDts: string): string[] {
  const files: string[] = [];
  const seen = new Set<string>();
  function visit(file: string): void {
    const key = normalize(file);
    if (seen.has(key)) return;
    seen.add(key);
    const source = stripComments(readDeclaration(file));
    files.push(file);
    const specs = [...source.matchAll(relativeFrom), ...source.matchAll(importCall)];
    for (const match of specs) {
      const spec = match[1];
      if (spec === undefined) continue;
      visit(declarationPath(file, spec));
    }
  }
  visit(entryDts);
  return files;
}
