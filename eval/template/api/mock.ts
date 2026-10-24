import { openMemory, port, respond, send } from "../api.ts";

const FAIL_RATE = 0.1;
const SLOW_RATE = 0.05;
const SLOW_MS = 6_000;
const MEDIAN_MS = 600;
const SPREAD = 0.55;

function gaussian(): number {
  const left = Math.random() || Number.EPSILON;
  const right = Math.random();
  return Math.sqrt(-2 * Math.log(left)) * Math.cos(2 * Math.PI * right);
}

function delayMs(): number {
  if (Math.random() < SLOW_RATE) return SLOW_MS;
  return Math.max(0, Math.round(Math.exp(Math.log(MEDIAN_MS) + SPREAD * gaussian())));
}

const memory = openMemory();

if (import.meta.main) {
  Bun.serve({
    port,
    async fetch(request) {
      if (request.method === "OPTIONS") return respond(memory, request);
      await new Promise((done) => setTimeout(done, delayMs()));
      if (Math.random() < FAIL_RATE) return send({ error: "The server failed. Try again." }, 500);
      return respond(memory, request);
    },
  });
  console.log(`listening on ${port}`);
}
