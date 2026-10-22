// Serves a built Storybook for the Playwright suite: `bun e2e/serve.ts <dir> <port>`.
// A static build doesn't reload pages the way the dev server does while it prepares code on first use.
import { join, normalize } from "node:path";

const [dir = "storybook-static", port = "6107"] = process.argv.slice(2);
const root = normalize(dir);

Bun.serve({
  hostname: "127.0.0.1",
  port: Number(port),
  async fetch(req) {
    const path = decodeURIComponent(new URL(req.url).pathname);
    const file = Bun.file(join(root, normalize(path === "/" ? "/index.html" : path)));
    return (await file.exists()) ? new Response(file) : new Response("Not found", { status: 404 });
  },
});
console.log(`serving ${root} on http://127.0.0.1:${port}`);
