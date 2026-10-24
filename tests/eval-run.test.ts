import { describe, expect, test, afterAll } from "bun:test";
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const repo = join(import.meta.dir, "..");
const words = ["eval", "test", "judge", "experiment", "rubric", "score", "compare", "benchmark", "candidate", "arena", "grade", "canary"];
const exempt = ["send themselves a test notification", "/notifications/test"];
const skipDirs = new Set(["node_modules", "vendor", ".git"]);
const skipText = new Set(["bun.lock"]);
const needles = ["C:\\wt", "odd-design\\eval"];
const briefApiPath = join(repo, "eval", "briefs", "settings", "api.ts");
const briefDocPath = join(repo, "eval", "briefs", "settings", "API.md");
const briefApi = readFileSync(briefApiPath, "utf8");
const briefDoc = readFileSync(briefDocPath, "utf8");

type Prepared = { runId: string; folder: string; launchPath: string };

function scrub(text: string): string {
  return exempt.reduce((next, phrase) => next.split(phrase).join(" "), text);
}

function wordsIn(text: string): string[] {
  const scrubbed = scrub(text);
  return words.filter((word) => new RegExp(`\\b${word}\\b`, "i").test(scrubbed));
}

function harnessHits(folder: string): string[] {
  const hits: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const found = wordsIn(entry.name);
      if (found.length > 0) hits.push(`${join(dir, entry.name)} name ${found.join(",")}`);
      if (skipDirs.has(entry.name)) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(path);
        continue;
      }
      if (skipText.has(entry.name)) continue;
      const textHits = wordsIn(readFileSync(path, "utf8"));
      if (textHits.length > 0) hits.push(`${path} ${textHits.join(",")}`);
    }
  };
  walk(folder);
  return hits;
}

function fileNames(folder: string): string[] {
  const names: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === "vendor") continue;
      names.push(entry.name);
      if (entry.isDirectory()) walk(join(dir, entry.name));
    }
  };
  walk(folder);
  return names;
}

function repoPathHits(folder: string): string[] {
  const hits: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(path);
        continue;
      }
      const text = readFileSync(path).toString("latin1");
      for (const needle of needles) {
        if (text.includes(needle)) hits.push(`${path} contains ${needle}`);
      }
    }
  };
  walk(folder);
  return hits;
}

function runEval(args: string[]): { status: number; stdout: string; stderr: string } {
  const result = Bun.spawnSync({
    cmd: [process.execPath, "eval", ...args],
    cwd: repo,
    stdout: "pipe",
    stderr: "pipe",
  });
  return { status: result.exitCode ?? 1, stdout: result.stdout.toString(), stderr: result.stderr.toString() };
}

function preparedFrom(stdout: string): Prepared {
  const match = /^prepared (\S+)  (\S+)  (\S+)$/m.exec(stdout);
  if (match === null) throw new Error(stdout);
  return { runId: match[1]!, folder: match[2]!, launchPath: match[3]! };
}

function messageOf(launchPath: string): string {
  const parsed: unknown = JSON.parse(readFileSync(launchPath, "utf8"));
  if (typeof parsed !== "object" || parsed === null || !("message" in parsed) || typeof parsed.message !== "string") {
    throw new Error("launch.json has no message");
  }
  return parsed.message;
}

function launchObject(launchPath: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(readFileSync(launchPath, "utf8"));
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("launch.json is not an object");
  return parsed;
}

function portMark(apiSource: string): string {
  const mark = /^export const port = (\d+);/.exec(apiSource)?.[1];
  if (mark === undefined) throw new Error("api.ts has no port");
  return mark;
}

function prepareSettings(): Prepared {
  const result = runEval(["prepare", "--brief", "settings", "--model", "opus"]);
  if (result.status !== 0) throw new Error(`${result.stdout}\n${result.stderr}`);
  const prepared = preparedFrom(result.stdout);
  const launch = launchObject(prepared.launchPath);
  writeFileSync(prepared.launchPath, `${JSON.stringify({ ...launch, threadId: "thread-under-test" }, null, 2)}\n`);
  writeFileSync(join(prepared.launchPath, "..", "isolation.json"), `${JSON.stringify({ findings: [] })}\n`);
  return prepared;
}

function remove(run: Prepared | undefined): void {
  if (run === undefined) return;
  rmSync(run.folder, { recursive: true, force: true });
  rmSync(join(run.launchPath, ".."), { recursive: true, force: true });
}

test("a clean probe still writes a scratch folder", () => {
  const result = runEval(["prepare", "--model", "opus", "--probe", "clean"]);
  if (result.status !== 0) throw new Error(`${result.stdout}\n${result.stderr}`);
  const run = preparedFrom(result.stdout);
  try {
    const parsed: unknown = JSON.parse(readFileSync(run.launchPath, "utf8"));
    expect(parsed).toMatchObject({ runId: run.runId, folder: run.folder, probe: "clean", threadId: null });
    expect(readFileSync(join(run.folder, "README.md"), "utf8")).toBe(
      "# Scratch\n\nThis folder is a scratch workspace. Keep new files at its top level.\n",
    );
    expect(existsSync(join(run.folder, "vendor"))).toBe(false);
  } finally {
    remove(run);
  }
});

const settings = (async (): Promise<Prepared> => prepareSettings())();

afterAll(async () => {
  const run = await settings.catch(() => undefined);
  remove(run);
});

describe("prepare --brief settings", () => {
  test("the folder has the template and no path into the repo", async () => {
    const run = await settings;
    expect(JSON.parse(readFileSync(join(run.folder, "package.json"), "utf8"))).toMatchObject({
      name: "workspace-app",
      dependencies: { "odd-design": "file:./vendor/odd-design.tgz" },
    });
    expect(existsSync(join(run.folder, "api.ts"))).toBe(true);
    expect(existsSync(join(run.folder, "API.md"))).toBe(true);
    expect(existsSync(join(run.folder, "api", "mock.ts"))).toBe(true);
    expect(existsSync(join(run.folder, "vendor", "odd-design.tgz"))).toBe(true);
    expect(existsSync(join(run.folder, "node_modules", "odd-design", "package.json"))).toBe(true);
    expect(fileNames(run.folder)).not.toContain("mock-calm.ts");
    expect(repoPathHits(run.folder)).toEqual([]);
  }, 420_000);

  test("launch.json carries prompt.md unchanged", async () => {
    const run = await settings;
    const prompt = readFileSync(join(repo, "eval", "briefs", "settings", "prompt.md"), "utf8");
    expect(messageOf(run.launchPath)).toBe(prompt);
    expect(prompt.includes("C:\\workspaces")).toBe(false);
    expect(prompt.includes("C:\\wt")).toBe(false);
  }, 420_000);

  test("names and text the harness wrote have no measurement word", async () => {
    const run = await settings;
    expect(harnessHits(run.folder)).toEqual([]);
  }, 420_000);

  test("two settings runs listen on different ports", async () => {
    const first = await settings;
    const second = prepareSettings();
    const index = join(repo, ".verify", "eval", "runs.jsonl");
    try {
      expect(readFileSync(briefApiPath, "utf8")).toBe(briefApi);
      expect(readFileSync(briefDocPath, "utf8")).toBe(briefDoc);
      const mark = portMark(briefApi);
      const runs = [first, second];
      const ports = runs.map((run) => Number(portMark(readFileSync(join(run.folder, "api.ts"), "utf8"))));
      expect(ports[0]).not.toBe(ports[1]);
      for (const [indexInRun, run] of runs.entries()) {
        const port = ports[indexInRun];
        expect(launchObject(run.launchPath).port).toBe(port);
        expect(readFileSync(join(run.folder, "api.ts"), "utf8")).toBe(briefApi.replaceAll(mark, String(port)));
        expect(readFileSync(join(run.folder, "API.md"), "utf8")).toBe(briefDoc.replaceAll(mark, String(port)));
        expect(harnessHits(run.folder)).toEqual([]);
        expect(repoPathHits(run.folder)).toEqual([]);
        const finished = runEval(["finish", run.runId]);
        expect(finished.status).toBe(0);
        const line = readFileSync(index, "utf8")
          .split(/\r?\n/)
          .find((item) => item.includes(`"runId":"${run.runId}"`));
        expect(JSON.parse(line ?? "{}")).toMatchObject({ port });
      }
    } finally {
      remove(second);
      if (existsSync(index)) {
        const kept = readFileSync(index, "utf8")
          .split(/\r?\n/)
          .filter((line) => line !== "" && !line.includes(`"runId":"${first.runId}"`) && !line.includes(`"runId":"${second.runId}"`));
        writeFileSync(index, kept.length === 0 ? "" : `${kept.join("\n")}\n`);
      }
    }
  }, 900_000);

  test("finish keeps one record when it runs twice", async () => {
    const run = await settings;
    const index = join(repo, ".verify", "eval", "runs.jsonl");
    try {
      const first = runEval(["finish", run.runId]);
      const second = runEval(["finish", run.runId]);
      expect(first.status).toBe(0);
      expect(second.status).toBe(0);
      const lines = existsSync(index)
        ? readFileSync(index, "utf8").split(/\r?\n/).filter((line) => line.includes(`"runId":"${run.runId}"`))
        : [];
      expect(lines).toHaveLength(1);
      expect(JSON.parse(lines[0] ?? "")).toMatchObject({ threadId: "thread-under-test", isolation: 0 });
    } finally {
      if (!existsSync(index)) return;
      const kept = readFileSync(index, "utf8").split(/\r?\n/).filter((line) => line !== "" && !line.includes(`"runId":"${run.runId}"`));
      writeFileSync(index, kept.length === 0 ? "" : `${kept.join("\n")}\n`);
    }
  }, 420_000);
});
