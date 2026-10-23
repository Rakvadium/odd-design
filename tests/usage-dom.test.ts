import { afterEach, expect, test } from "bun:test";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createToaster } from "../src/js/toast.ts";
import { checkRoot, flush, installUsageChecker } from "../src/js/usage/dom.ts";
import { registerUsageChecks } from "../src/js/usage/test-setup.ts";

registerUsageChecks(afterEach);

const fixtureDir = new URL("./fixtures/usage/", import.meta.url);
const fixtures = readdirSync(fixtureDir).filter((name) => name.endsWith(".html")).sort();
const repoRoot = fileURLToPath(new URL("..", import.meta.url));

function expectedCodes(html: string): string[] {
  const match = /^<!-- expect: (.+) -->/.exec(html);
  if (match === null || match[1] === undefined) throw new Error("fixture has no expect line");
  return match[1] === "none" ? [] : match[1].split(" ");
}

function codesIn(root: ParentNode): string[] {
  try {
    checkRoot(root);
    return [];
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    return error.message.split("\n").flatMap((line) => {
      const end = line.indexOf(":");
      return end === -1 ? [] : [line.slice(0, end)];
    });
  }
}

function resetPage(): void {
  installUsageChecker("prod");
  document.body.replaceChildren();
}

for (const name of fixtures) {
  test(name, () => {
    const html = readFileSync(new URL(name, fixtureDir), "utf8");
    const body = new DOMParser().parseFromString(html, "text/html").body;
    expect(codesIn(body)).toEqual(expectedCodes(html));
  });
}

test("dev mode logs the code and flush does not throw", () => {
  const lines: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => {
    lines.push(args.map((arg) => String(arg)).join(" "));
  };
  installUsageChecker("dev");
  try {
    document.body.insertAdjacentHTML("beforeend", '<button class="odd-button" disabled></button>');
    flush();
    expect(lines.join("\n")).toContain("ODD-BUTTON-007");
  } finally {
    console.error = original;
    resetPage();
  }
});

test("test mode throws the code from flush", () => {
  installUsageChecker("test");
  try {
    document.body.insertAdjacentHTML("beforeend", '<button class="odd-button" disabled></button>');
    expect(() => flush()).toThrow("ODD-BUTTON-007");
  } finally {
    resetPage();
  }
});

test("flush reports a disabled button nested in an added div", () => {
  installUsageChecker("test");
  try {
    document.body.insertAdjacentHTML("beforeend", '<div><button class="odd-button" disabled></button></div>');
    expect(() => flush()).toThrow("ODD-BUTTON-007");
  } finally {
    resetPage();
  }
});

test("the hook fails when disabled is set after the button is added", async () => {
  let run: (() => void) | undefined;
  registerUsageChecks((hook) => {
    run = hook;
  });
  document.body.insertAdjacentHTML("beforeend", '<button class="odd-button">Save</button>');
  await Promise.resolve();
  const button = document.querySelector("button");
  if (button === null) throw new Error("missing button");
  button.setAttribute("disabled", "");
  const hook = run;
  if (hook === undefined) throw new Error("hook was not registered");
  try {
    expect(() => hook()).toThrow("ODD-BUTTON-007");
  } finally {
    resetPage();
  }
});

test("dev mode logs one problem after one microtask", async () => {
  const lines: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => {
    lines.push(args.map((arg) => String(arg)).join(" "));
  };
  installUsageChecker("dev");
  try {
    document.body.insertAdjacentHTML("beforeend", '<button class="odd-button" disabled></button>');
    await Promise.resolve();
    expect(lines.filter((line) => line.includes("ODD-BUTTON-007")).length).toBe(1);
  } finally {
    console.error = original;
    resetPage();
  }
});

test("a moved disabled button is reported once", () => {
  installUsageChecker("test");
  try {
    document.body.insertAdjacentHTML("beforeend", '<button class="odd-button" disabled></button><div></div>');
    const button = document.querySelector("button");
    const slot = document.querySelector("div");
    if (button === null || slot === null) throw new Error("missing node");
    slot.append(button);
    let message = "";
    try {
      flush();
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      message = error.message;
    }
    expect(message.split("ODD-BUTTON-007").length - 1).toBe(1);
  } finally {
    resetPage();
  }
});

test("prod mode does not log or throw from flush", () => {
  const lines: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => {
    lines.push(args.map((arg) => String(arg)).join(" "));
  };
  installUsageChecker("prod");
  try {
    document.body.insertAdjacentHTML("beforeend", '<button class="odd-button" disabled></button>');
    flush();
    expect(lines).toEqual([]);
    expect(() => checkRoot(document)).toThrow("ODD-BUTTON-007");
  } finally {
    console.error = original;
    resetPage();
  }
});

test("createToaster().show() with an action reports zero diagnostics", () => {
  installUsageChecker("test");
  const toaster = createToaster();
  try {
    toaster.show({ title: "Deck saved", action: { label: "Undo", onClick() {} } });
    expect(document.querySelectorAll(".odd-toast button")).toHaveLength(2);
    flush();
  } finally {
    toaster.destroy();
    resetPage();
  }
});

async function runBadNode(args: readonly string[]): Promise<{ exit: number; output: string }> {
  const child = Bun.spawn(["bun", "test", ...args], {
    cwd: repoRoot,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exit] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  return { exit, output: `${stdout}${stderr}` };
}

test("a disabled odd-button fails the test that imports the setup", async () => {
  const direct = await runBadNode(["./tests/fixtures/runtime/bad-node.fixture.ts"]);
  expect(direct.exit).not.toBe(0);
  expect(direct.output).toContain("ODD-BUTTON-007");
  expect(direct.output).toContain("appends a disabled odd-button");
});

test("a later test passes after a failed usage check", async () => {
  const dir = mkdtempSync(join(tmpdir(), "odd-usage-"));
  const file = join(dir, "leak.fixture.ts");
  const setup = fileURLToPath(new URL("../src/js/usage/test-setup.ts", import.meta.url)).replaceAll("\\", "/");
  writeFileSync(
    file,
    [
      'import { afterEach, test } from "bun:test";',
      `import { registerUsageChecks } from "${setup}";`,
      "registerUsageChecks(afterEach);",
      'test("first appends a disabled odd-button", () => {',
      "  document.body.insertAdjacentHTML(\"beforeend\", '<button class=\"odd-button\" disabled></button>');",
      "});",
      'test("second does nothing", () => {});',
      "",
    ].join("\n"),
  );
  try {
    const result = await runBadNode([file]);
    expect(result.exit).not.toBe(0);
    expect(result.output).toContain("ODD-BUTTON-007");
    expect(result.output).toContain("(fail) first appends a disabled odd-button");
    expect(result.output).toContain("1 pass");
    expect(result.output).toContain("1 fail");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
