import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";
import { clearToken, getToken } from "./tokenStore";

/**
 * Central API client.
 *
 * One place that: injects the bearer token, sets JSON headers (unless the body
 * is FormData), parses responses gracefully (a non-JSON 500 page becomes a
 * consistent empty shape instead of a thrown SyntaxError), and — critically —
 * intercepts HTTP 401 to drive a single app-wide "session expired" flow so an
 * expired token no longer silently yields blank screens.
 *
 * Behaviour note: by design this does NOT throw on ordinary non-2xx responses.
 * Screens across the app read the parsed body defensively (probing
 * `data.items ?? data.results ?? …`), so the client preserves that contract and
 * returns the parsed body. Use `res`-level checks in callers that need status.
 */

// Cached {moduleKey: enabled} map (see FeatureContext). Declared here so it can
// join SESSION_KEYS without FeatureContext ↔ client forming an import cycle.
export const ENABLED_MODULES_KEY = "enabled_modules";

// Keys cleared when a session ends. Kept in one place so login + logout + the
// 401 guard all wipe exactly the same state.
//
// The access token is NOT here — it lives in SecureStore (see tokenStore) and is
// cleared separately by clearSession below.
//
// ENABLED_MODULES_KEY *must* be in here: the module set is per-society, so a
// stale cache would otherwise let the next resident to log in on this device
// see the previous society's features until the network refresh lands.
const SESSION_KEYS = [
  "user",
  "user_role",
  "selected_society_id",
  "selected_tower_id",
  "flat_number",
  ENABLED_MODULES_KEY,
];

// Re-exported so callers have one import for the token, and so no screen is
// tempted to reach into storage directly (which is how the token ended up read
// from AsyncStorage in 22 different files).
export { getToken, setToken } from "./tokenStore";

export const clearSession = async () => {
  await Promise.all([clearToken(), AsyncStorage.multiRemove(SESSION_KEYS)]);
};

// ── 401 / session-expiry plumbing ───────────────────────────────────────────
// API modules are plain functions and can't navigate; the app root registers a
// handler (e.g. redirect to /phone). We debounce so a burst of parallel 401s
// from several in-flight requests only triggers one logout + redirect.
type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;
let handlingUnauthorized = false;

export const setUnauthorizedHandler = (fn: UnauthorizedHandler | null) => {
  unauthorizedHandler = fn;
};

const handleUnauthorized = async () => {
  if (handlingUnauthorized) return;
  handlingUnauthorized = true;
  try {
    await clearSession();
    unauthorizedHandler?.();
  } finally {
    // Re-arm shortly after so a later genuine expiry is handled again, but the
    // current burst collapses into one redirect.
    setTimeout(() => {
      handlingUnauthorized = false;
    }, 2000);
  }
};

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

const parseResponse = async <T>(res: Response, label: string): Promise<T> => {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    console.log(`[${label}] HTTP ${res.status} non-JSON response:`, text.slice(0, 300));
    return {
      message: null,
      detail: `Server error (${res.status}). Please try again later.`,
      data: { items: [] },
    } as T;
  }
};

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | object | null;
  /** Per-request override of the default network timeout, in ms. */
  timeoutMs?: number;
}

// A request that never reached the server: no connection, DNS failure, or the
// timeout below firing. Distinct from an HTTP error — the server said nothing at
// all — so screens can show "you're offline / try again" rather than a generic
// failure. `apiRequest` still resolves to the benign empty shape for backward
// compatibility; callers that want to react to offline can catch this instead.
export class NetworkError extends Error {
  isTimeout: boolean;
  constructor(message: string, isTimeout = false) {
    super(message);
    this.name = "NetworkError";
    this.isTimeout = isTimeout;
  }
}

// A stalled request on a flaky mobile connection otherwise hangs forever on a
// spinner. 20s is generous enough for a cold backend and a slow uplink (the
// literal use case: a resident on 2 bars in a basement lobby) without trapping
// the user indefinitely.
const DEFAULT_TIMEOUT_MS = 20000;

/**
 * Make an authenticated request. `path` is relative to the API root
 * (e.g. "/customer/providers/today"). Plain objects passed as `body` are
 * JSON-stringified; FormData is sent as-is so the runtime sets the boundary.
 */
export async function apiRequest<T = any>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const token = await getToken();
  const { body, headers: extraHeaders, timeoutMs, ...rest } = options;

  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const isPlainObject =
    body != null && !isForm && typeof body === "object";

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isForm ? {} : isPlainObject ? { "Content-Type": "application/json" } : {}),
    ...(extraHeaders as Record<string, string> | undefined),
  };

  // Abort the request if it outlives the timeout, so a dead connection surfaces
  // as a NetworkError instead of an unresolved promise.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs ?? DEFAULT_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${config.apiUrl}${path}`, {
      ...rest,
      headers,
      body: isPlainObject ? JSON.stringify(body) : (body as BodyInit | null | undefined),
      signal: controller.signal,
    });
  } catch (err: any) {
    // AbortError => our timeout fired; anything else => no connection reached.
    if (err?.name === "AbortError") {
      throw new NetworkError(`Request timed out: ${path}`, true);
    }
    throw new NetworkError(`Network request failed: ${path}`);
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 401) {
    // Only treat as a real session expiry if we actually had a token; a 401 on
    // the unauthenticated login flow shouldn't bounce the user.
    if (token) await handleUnauthorized();
  }

  const parsed = await parseResponse<any>(res, path);

  // Feature-permission guard: a disabled module 403s. Treat it as "feature off"
  // (NOT a session/auth failure) so a stale client cache can never crash a
  // screen — return a benign empty shape that screens read defensively. The
  // FeatureProvider refreshes the enabled-set separately to hide the surface.
  if (res.status === 403) {
    const detail = String(parsed?.detail ?? "").toLowerCase();
    if (detail.includes("not enabled")) {
      return { message: null, detail: parsed?.detail, featureDisabled: true, data: { items: [] } } as T;
    }
  }

  return parsed as T;
}

export const apiGet = <T = any>(path: string, options?: ApiRequestOptions) =>
  apiRequest<T>(path, { ...options, method: "GET" });

export const apiPost = <T = any>(path: string, body?: ApiRequestOptions["body"], options?: ApiRequestOptions) =>
  apiRequest<T>(path, { ...options, method: "POST", body });

export const apiDelete = <T = any>(path: string, options?: ApiRequestOptions) =>
  apiRequest<T>(path, { ...options, method: "DELETE" });
