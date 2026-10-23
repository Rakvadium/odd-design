import { STORYBOOKS } from "../stories/catalog.ts";

const [out = "storybook-static"] = process.argv.slice(2);

function build(configDir: string, outDir: string): void {
  const result = Bun.spawnSync([
    process.execPath,
    "x",
    "storybook",
    "build",
    "--quiet",
    "--disable-telemetry",
    "-c",
    configDir,
    "-o",
    outDir,
  ]);
  if (result.exitCode === 0) return;
  process.stderr.write(`storybook build -c ${configDir} -o ${outDir} failed\n`);
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exit(result.exitCode ?? 1);
}

// The composer goes first. A later build empties its own output directory, which would delete html/ and react/.
build(".storybook-composed", out);
for (const [key, { configDir }] of Object.entries(STORYBOOKS)) build(configDir, `${out}/${key}`);
