// HTTP helpers for the API route handlers: one error format (RFC 9457 problem details), request IDs,
// structured logs, body-size limits and a simple rate limiter.
import { randomUUID } from "node:crypto";
import type { z } from "zod";

/** What every handler receives besides the request: route params from Next.js, plus a request ID. */
export type RouteContext = { params?: Promise<Record<string, string | string[]>>; requestId: string };
export type Handler = (req: Request, ctx: RouteContext) => Promise<Response>;

/** An error the client should see: becomes a problem-details response with this status and code. */
export class HttpError extends Error {
  status: number;
  code: string;
  title: string;
  detail: string;
  extra: Record<string, unknown>;
  constructor(status: number, code: string, title: string, detail = "", extra: Record<string, unknown> = {}) {
    super(title);
    this.status = status;
    this.code = code;
    this.title = title;
    this.detail = detail;
    this.extra = extra;
  }
}

// JSON log line. Never pass emails, tokens or request bodies here: use user IDs.
export function log(level: "info" | "warn" | "error", msg: string, fields: Record<string, unknown> = {}): void {
  const line = JSON.stringify({ level, msg, time: new Date().toISOString(), ...fields });
  if (level === "error") console.error(line);
  else console.log(line);
}

export function json(data: unknown, { status = 200, headers = {}, requestId }: { status?: number; headers?: Record<string, string>; requestId?: string } = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...(requestId ? { "x-request-id": requestId } : {}), ...headers },
  });
}

export function problem(status: number, code: string, title: string, detail: string, requestId: string, extra: Record<string, unknown> = {}): Response {
  return new Response(JSON.stringify({ type: `about:blank#${code}`, title, status, detail, code, requestId, ...extra }), {
    status,
    headers: { "content-type": "application/problem+json", "cache-control": "no-store", "x-request-id": requestId },
  });
}

// Wraps a route handler: adds a request ID, maps HttpError to a problem response, and logs anything
// unexpected without leaking internals to the client.
export function route(name: string, handler: Handler) {
  return async (req: Request, ctx: { params?: RouteContext["params"] } = {}): Promise<Response> => {
    const requestId = randomUUID();
    const started = Date.now();
    try {
      const res = await handler(req, { ...ctx, requestId });
      res.headers.set("x-request-id", requestId);
      log("info", "request", { route: name, status: res.status, ms: Date.now() - started, requestId });
      return res;
    } catch (err) {
      if (err instanceof HttpError) {
        log(err.status >= 500 ? "error" : "info", "request", { route: name, status: err.status, code: err.code, ms: Date.now() - started, requestId });
        return problem(err.status, err.code, err.title, err.detail, requestId, err.extra);
      }
      const message = err instanceof Error ? err.message : String(err);
      log("error", "unhandled error", { route: name, requestId, error: message.slice(0, 300) });
      return problem(500, "server-error", "Something went wrong on our side", "Try again in a minute. If it keeps happening, include the request ID when you report it.", requestId);
    }
  };
}

// Reads a small JSON body, rejecting anything over `maxBytes` or not valid JSON.
export async function readJson(req: Request, maxBytes = 4096): Promise<unknown> {
  const length = Number(req.headers.get("content-length") || 0);
  if (length > maxBytes) throw new HttpError(413, "too-large", "Request body is too large");
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, "too-large", "Request body is too large");
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new HttpError(400, "bad-json", "Request body isn't valid JSON");
  }
}

// Turns a Zod result into a 400 that lists the bad fields.
export function parseOr400<S extends z.ZodType>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  const fields = result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
  throw new HttpError(400, "invalid-input", "Some fields aren't valid", fields.map((f) => `${f.field}: ${f.message}`).join("; "), { fields });
}

export function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
}

// Fixed-window rate limiter kept in this server instance's memory. On Vercel each instance has its own
// window, so this is a first line of defense; account quotas live in Firestore and are exact.
const windows = new Map<string, { start: number; count: number }>();
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): void {
  const entry = windows.get(key);
  if (!entry || now - entry.start >= windowMs) {
    windows.set(key, { start: now, count: 1 });
    if (windows.size > 10000) windows.clear();
    return;
  }
  entry.count += 1;
  if (entry.count > limit) {
    const retry = Math.ceil((entry.start + windowMs - now) / 1000);
    throw new HttpError(429, "rate-limited", "Too many requests", `Try again in ${retry} seconds.`, { retryAfter: retry });
  }
}
