"use client";

// Calls the site's own API (backend/), adding the signed-in user's token when asked, and turns
// error responses into ApiError with a message people can act on.
import { getIdToken } from "@/frontend/account/auth";

export class ApiError extends Error {
  constructor(status, code, title, detail = "", extra = {}) {
    super(title);
    Object.assign(this, { status, code, title, detail, extra });
  }
}

function withTimeout(signal, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException("Timed out", "TimeoutError")), ms);
  signal?.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
  return { signal: controller.signal, done: () => clearTimeout(timer) };
}

export async function api(path, { method = "GET", body, auth = false, signal, timeout = 20000 } = {}) {
  const headers = { accept: "application/json" };
  if (body !== undefined) headers["content-type"] = "application/json";
  if (auth) {
    const token = await getIdToken();
    if (!token) throw new ApiError(401, "sign-in-required", "Sign in to use this", "Create a free account or sign in, then try again.");
    headers.authorization = `Bearer ${token}`;
  }
  const t = withTimeout(signal, timeout);
  let res;
  try {
    res = await fetch(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: t.signal });
  } catch (err) {
    if (signal?.aborted) throw new ApiError(0, "cancelled", "Cancelled");
    if (err?.name === "TimeoutError" || t.signal.reason?.name === "TimeoutError") {
      throw new ApiError(0, "timeout", "The server took too long to answer", "Try again in a minute.");
    }
    throw new ApiError(0, "network", "Can't reach the server", "Check your connection and try again.");
  } finally {
    t.done();
  }
  if (res.status === 204) return null;
  const type = res.headers.get("content-type") || "";
  if (!res.ok) {
    // Only our own API answers in problem-details form (it always carries a requestId); other JSON errors,
    // like the offline server's 404, fall through to the generic handling below.
    const p = type.includes("json") ? await res.json().catch(() => ({})) : {};
    if (p.requestId) throw new ApiError(res.status, p.code || "error", p.title || "Something went wrong", p.detail || "", p);
    // The offline (static) build has no server code, so API paths come back as plain 404 pages.
    if (res.status === 404) throw new ApiError(404, "offline", "This needs the online version of the site", "Accounts and plant research run on the server, which the offline copy doesn't include.");
    throw new ApiError(res.status, "error", "Something went wrong", "Try again in a minute.");
  }
  return res.json();
}
