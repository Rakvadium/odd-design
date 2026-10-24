import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { issueToken, readTokens, scanLog } from "../eval/isolate.ts";

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

  test("a T3 project list is a finding and a preview of the agent's own UI is not", () => {
    expect([...scanSeed(`${provider}/t3-project.jsonl`), ...scanSeed(`${provider}/t3-preview.jsonl`)]).toEqual([
      { check: "isolation:t3", detail: "t3-code/t3_project_list", where: `${provider}/t3-project.jsonl:2` },
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

test("a token issued from another checkout gives one canary finding", () => {
  const root = mkdtempSync(join(tmpdir(), "odd-eval-"));
  const main = join(root, "main");
  const other = join(root, "other");
  const git = (...args: string[]) =>
    expect(Bun.spawnSync(["git", "-c", "user.name=eval", "-c", "user.email=eval@example.com", ...args], { cwd: root }).exitCode).toBe(0);
  try {
    git("init", "-q", main);
    git("-C", main, "commit", "-q", "--allow-empty", "-m", "init");
    git("-C", main, "worktree", "add", "-q", other);
    issueToken(main, "run-001");
    const token = issueToken(other, "run-002");
    const line = { type: "user", message: { role: "user", content: [{ type: "tool_result", content: `workspace key: ${token}` }] } };
    const transcript = { file: "cross.jsonl", text: JSON.stringify(line) };
    expect(scanLog({ folder, tokens: readTokens(main), transcripts: [transcript], folderFiles: [] }).findings).toEqual([
      { check: "isolation:canary", detail: token, where: "cross.jsonl" },
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
