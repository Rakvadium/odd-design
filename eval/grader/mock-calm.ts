import { openMemory, respond } from "../briefs/settings/api.ts";

export function start(port: number): void {
  const memory = openMemory();
  Bun.serve({
    port,
    fetch(request) {
      return respond(memory, request);
    },
  });
}

if (import.meta.main) {
  const port = Number(process.argv[2]);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("usage: bun eval/grader/mock-calm.ts <port>");
    process.exit(2);
  }
  start(port);
  console.log(`listening on ${port}`);
}
