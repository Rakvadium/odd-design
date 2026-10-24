import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { scanLog } from "../eval/isolate.ts";

const seeds = join(import.meta.dir, "..", "eval", "seeds", "isolation");
const folder = "C:\\eval-runs\\run-001";
const tokens = ["kfeedface0000000000000001", "kfeedface0000000000000002"];

function scanSeed(file: string) {
  const transcript = { file, text: readFileSync(join(seeds, file), "utf8") };
  return scanLog({ folder, tokens, transcripts: [transcript], folderFiles: [] }).findings;
}

describe.each(["claude", "cursor"])("%s transcript", (provider) => {
  const shell = provider === "claude" ? "Bash" : "Shell";

  test("a clean run gives no finding", () => {
    expect(scanSeed(`${provider}/clean.jsonl`)).toEqual([]);
  });

  test("a token gives one canary finding", () => {
    expect(scanSeed(`${provider}/canary.jsonl`)).toEqual([
      { check: "isolation:canary", detail: "kfeedface0000000000000001", where: `${provider}/canary.jsonl` },
    ]);
  });

  test("a relative shell read of the parent folder is outside", () => {
    expect(scanSeed(`${provider}/outside-shell.jsonl`)).toEqual([
      {
        check: "isolation:outside-path",
        detail: `${shell} ..\\notes.md -> C:\\eval-runs\\notes.md`,
        where: `${provider}/outside-shell.jsonl:2`,
      },
    ]);
  });

  test("a read of the repo is outside", () => {
    expect(scanSeed(`${provider}/outside-read.jsonl`)).toEqual([
      {
        check: "isolation:outside-path",
        detail: "Read C:\\wt\\odd-design\\eval-button\\package.json -> C:\\wt\\odd-design\\eval-button\\package.json",
        where: `${provider}/outside-read.jsonl:2`,
      },
    ]);
  });

  test("a T3 thread read is a cross-thread finding", () => {
    expect(scanSeed(`${provider}/t3.jsonl`)).toEqual([
      { check: "isolation:t3", detail: "t3-code/t3_thread_read", where: `${provider}/t3.jsonl:2` },
    ]);
  });

  test("a fetch of the public repo is a web finding", () => {
    expect(scanSeed(`${provider}/web-repo.jsonl`)).toEqual([
      { check: "isolation:web-repo", detail: "WebFetch https://github.com/Rakvadium/odd-design", where: `${provider}/web-repo.jsonl:2` },
    ]);
  });
});

test("a run with no transcript cannot pass", () => {
  expect(scanLog({ folder, tokens, transcripts: [], folderFiles: [] }).findings).toEqual([
    { check: "isolation:no-transcript", detail: "no transcript", where: folder },
  ]);
});
