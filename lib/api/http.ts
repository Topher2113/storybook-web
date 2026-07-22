// The one fetch path every API call goes through. Owns three concerns:
//
// 1. Base URL: in the browser, all paths are relative and the next.config.ts
//    rewrites proxy them (solving the Express API's missing CORS). On the
//    server (server components), paths resolve to the upstream Render URLs
//    directly — NPC-family paths to the Flask service, the rest to Express —
//    mirroring the rewrite table.
// 2. Cold starts: both upstreams are free-tier Render and can take up to a
//    minute to wake. Every request gets a 90s budget, and GETs retry twice
//    (3s / 8s) on transport-level failures, reporting via onWaking so the UI
//    can explain the wait. Non-GETs never retry.
// 3. Error normalization: the API speaks two error envelopes — bare
//    `{error}` and `{error, code, details}` — plus non-JSON HTML from
//    Render's own 502 page. All become ApiError; 401s become ApiAuthError.

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: { field: string; message: string }[];

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: { field: string; message: string }[],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ApiAuthError extends ApiError {
  constructor(message: string) {
    super(message, 401, "UNAUTHORIZED");
    this.name = "ApiAuthError";
  }
}

const NPC_PATH = /^\/api\/(npcs(\/|$)|scenes\/[^/]+\/npcs(\/|$))/;

function baseUrlFor(path: string): string {
  if (typeof window !== "undefined") return "";
  const story =
    process.env.STORY_API_URL ?? "https://storybook-api-f6bt.onrender.com";
  const npc = process.env.NPC_API_URL ?? story;
  return NPC_PATH.test(path) ? npc : story;
}

export interface ApiFetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
  onWaking?: () => void;
}

const RETRY_DELAYS_MS = [3_000, 8_000];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function normalizeError(status: number, body: unknown): ApiError {
  let message = `Server error: ${status}`;
  let code: string | undefined;
  let details: { field: string; message: string }[] | undefined;
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    if (typeof b.error === "string") message = b.error;
    if (typeof b.code === "string") code = b.code;
    if (Array.isArray(b.details)) {
      details = b.details as { field: string; message: string }[];
    }
  }
  if (status === 401) return new ApiAuthError(message);
  return new ApiError(message, status, code, details);
}

async function doFetch<T>(url: string, opts: ApiFetchOptions): Promise<T> {
  const signals = [AbortSignal.timeout(opts.timeoutMs ?? 90_000)];
  if (opts.signal) signals.push(opts.signal);
  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers: {
      ...(opts.body !== undefined && { "content-type": "application/json" }),
      ...(opts.token && { authorization: `Bearer ${opts.token}` }),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: AbortSignal.any(signals),
  });

  let parsed: unknown = null;
  try {
    parsed = await res.json();
  } catch {
    // Non-JSON body (e.g. Render's HTML 502 page). A retryable transport
    // failure for GETs; otherwise surfaces as a generic ApiError below.
  }
  if (!res.ok) throw normalizeError(res.status, parsed);
  if (parsed === null) {
    throw new ApiError(`Server returned an unreadable response`, res.status);
  }
  return parsed as T;
}

function isRetryable(err: unknown): boolean {
  if (err instanceof ApiError) return err.status === 502 || err.status === 504;
  // Network failure or AbortSignal.timeout (TimeoutError DOMException).
  return true;
}

export async function apiFetch<T>(
  path: string,
  opts: ApiFetchOptions = {},
): Promise<T> {
  const url = `${baseUrlFor(path)}${path}`;
  const method = opts.method ?? "GET";
  if (method !== "GET") return doFetch<T>(url, opts);

  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) {
      opts.onWaking?.();
      await sleep(RETRY_DELAYS_MS[attempt - 1]);
    }
    try {
      return await doFetch<T>(url, opts);
    } catch (err) {
      if (opts.signal?.aborted || !isRetryable(err)) throw err;
      lastError = err;
    }
  }
  throw lastError;
}
