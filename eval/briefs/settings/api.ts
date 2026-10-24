export const port = 8787;

const NOTIFY_BLOCK_MS = 60_000;

export type Settings = {
  displayName: string;
  email: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
};

export type Memory = {
  settings: Settings;
  notificationBlockedUntil: number;
};

export type Reply =
  | { status: 200; body: Settings | { ok: true } }
  | { status: 400; body: { error: string } }
  | { status: 429; body: { retryAfterSeconds: number } };

export function openMemory(): Memory {
  return {
    settings: {
      displayName: "Ada Lovelace",
      email: "ada@example.com",
      emailNotifications: true,
      pushNotifications: false,
    },
    notificationBlockedUntil: 0,
  };
}

export function headers(retryAfterSeconds?: number): Headers {
  const head = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  if (retryAfterSeconds !== undefined) head.set("Retry-After", String(retryAfterSeconds));
  return head;
}

export function send(body: unknown, status: number, retryAfterSeconds?: number): Response {
  const head = headers(retryAfterSeconds);
  head.set("Content-Type", "application/json");
  return new Response(JSON.stringify(body), { status, headers: head });
}

function isSettings(value: unknown): value is Settings {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.displayName === "string" &&
    typeof record.email === "string" &&
    typeof record.emailNotifications === "boolean" &&
    typeof record.pushNotifications === "boolean"
  );
}

type Route = "read" | "save" | "notify" | "sign-out" | "other";

function routeOf(method: string, path: string): Route {
  if (method === "GET" && path === "/settings") return "read";
  if (method === "PUT" && path === "/settings") return "save";
  if (method === "POST" && path === "/notifications/test") return "notify";
  if (method === "POST" && path === "/sessions/sign-out-others") return "sign-out";
  return "other";
}

export function reply(memory: Memory, method: string, path: string, body: unknown, now: number): Reply {
  const route = routeOf(method, path);
  switch (route) {
    case "read":
      return { status: 200, body: memory.settings };
    case "save": {
      if (!isSettings(body)) {
        return { status: 400, body: { error: "Send a display name, an email, and both notification switches." } };
      }
      memory.settings = {
        displayName: body.displayName,
        email: body.email,
        emailNotifications: body.emailNotifications,
        pushNotifications: body.pushNotifications,
      };
      return { status: 200, body: memory.settings };
    }
    case "notify": {
      if (now < memory.notificationBlockedUntil) {
        const retryAfterSeconds = Math.ceil((memory.notificationBlockedUntil - now) / 1000);
        return { status: 429, body: { retryAfterSeconds } };
      }
      memory.notificationBlockedUntil = now + NOTIFY_BLOCK_MS;
      return { status: 200, body: { ok: true } };
    }
    case "sign-out":
      return { status: 200, body: { ok: true } };
    case "other":
      return { status: 400, body: { error: "No such route." } };
    default: {
      const unreachable: never = route;
      throw new Error(unreachable);
    }
  }
}

export function readBody(text: string): { ok: true; value: unknown } | { ok: false } {
  if (text === "") return { ok: true, value: null };
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}

export async function respond(memory: Memory, request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: headers() });
  const url = new URL(request.url);
  const hasBody = request.method === "PUT" || request.method === "POST";
  const parsed = readBody(hasBody ? await request.text() : "");
  if (!parsed.ok) return send({ error: "The body is not JSON." }, 400);
  const result = reply(memory, request.method, url.pathname, parsed.value, Date.now());
  const retryAfterSeconds = result.status === 429 ? result.body.retryAfterSeconds : undefined;
  return send(result.body, result.status, retryAfterSeconds);
}
