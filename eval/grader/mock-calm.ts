import { openMemory, port, respond } from "../briefs/settings/api.ts";

export function start(): void {
  const memory = openMemory();
  Bun.serve({
    port,
    fetch(request) {
      return respond(memory, request);
    },
  });
}

if (import.meta.main) {
  start();
  console.log(`listening on ${port}`);
}
