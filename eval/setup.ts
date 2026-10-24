import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const repo = join(import.meta.dir, "..");
const parent = process.argv[2] ?? "C:/workspaces";

function run(cmd: string[], cwd: string): string {
  const result = Bun.spawnSync({ cmd, cwd, stdout: "pipe", stderr: "pipe" });
  const output = `${result.stdout}${result.stderr}`;
  if ((result.exitCode ?? 1) !== 0) throw new Error(output);
  return output;
}

function nextApp(root: string): string {
  for (let number = 1; number < 1000; number += 1) {
    const folder = join(root, `app-${String(number).padStart(3, "0")}`);
    if (!existsSync(folder)) return folder;
  }
  throw new Error(`no free app folder under ${root}`);
}

function install(folder: string): void {
  try {
    run([process.execPath, "install"], folder);
  } catch (error) {
    const file = join(folder, "package.json");
    const manifest = JSON.parse(readFileSync(file, "utf8")) as { dependencies: { "odd-design": string } };
    const tarball = join(folder, "vendor/odd-design.tgz").replaceAll("\\", "/");
    manifest.dependencies["odd-design"] = `file:${tarball}`;
    writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
    console.error(error instanceof Error ? error.message : error);
    run([process.execPath, "install"], folder);
  }
}
if (!existsSync(parent)) throw new Error(`missing parent folder ${parent}`);
if (!existsSync(join(repo, "node_modules"))) run([process.execPath, "install"], repo);
run([process.execPath, "run", "build"], repo);
const app = nextApp(parent);
cpSync(join(repo, "eval/template"), app, { recursive: true });
const vendor = join(app, "vendor");
mkdirSync(vendor);
run([process.execPath, "pm", "pack", "--destination", vendor], repo);
const packed = readdirSync(vendor).find((name) => name.endsWith(".tgz"));
if (packed !== undefined && packed !== "odd-design.tgz") renameSync(join(vendor, packed), join(vendor, "odd-design.tgz"));
install(app);
run(["git", "init"], app);
run(["git", "add", "-A"], app);
run(["git", "commit", "-m", "Initial scaffold"], app);
run(["git", "tag", "scaffold"], app);
process.stdout.write(`${app}\n${readFileSync(join(repo, "eval/brief.md"), "utf8")}`);
