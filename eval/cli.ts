import { parseArgs } from "node:util";
import { scan } from "./isolate.ts";
import { BRIEFS, finish, MODELS, prepare, prepareBrief, PROBES, type BriefName, type ModelName } from "./launch.ts";

const usage = [
  "usage: bun eval prepare --model <opus|grok> [--probe <clean|escape>]",
  "       bun eval prepare --brief settings --model <opus|grok>",
  "       bun eval scan <run-id>",
  "       bun eval finish <run-id>",
].join("\n");

function isModel(value: string | undefined): value is ModelName {
  return value !== undefined && Object.hasOwn(MODELS, value);
}

function isProbe(value: string): value is keyof typeof PROBES {
  return Object.hasOwn(PROBES, value);
}

function isBrief(value: string): value is BriefName {
  return BRIEFS.some((name) => name === value);
}

function fail(): number {
  console.error(usage);
  return 2;
}

function prepareCommand(model: string | undefined, probe: string | undefined, brief: string | undefined): number {
  if (!isModel(model)) return fail();
  if (brief !== undefined && probe !== undefined) return fail();
  if (brief !== undefined) {
    if (!isBrief(brief)) return fail();
    prepareBrief(model, brief);
    return 0;
  }
  const probeName = probe ?? "clean";
  if (!isProbe(probeName)) return fail();
  prepare(model, probeName);
  return 0;
}

function main(argv: string[]): number {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      model: { type: "string" },
      probe: { type: "string" },
      brief: { type: "string" },
    },
  });
  const [verb, runId] = positionals;
  if (verb === "prepare") return prepareCommand(values.model, values.probe, values.brief);
  if (verb === "scan") return runId === undefined ? fail() : scan(runId);
  if (verb === "finish") return runId === undefined ? fail() : finish(runId);
  return fail();
}

if (import.meta.main) process.exit(main(process.argv.slice(2)));
