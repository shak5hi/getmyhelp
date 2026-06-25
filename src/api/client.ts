import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";

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

// Keys cleared when a session ends. Kept in one place so login + logout + the
// 401 guard all wipe exactly the same state.
const SESSION_KEYS = [
  "access_token",
  "user",
  "user_role",
  "selected_society_id",
  "selected_tower_id",
  "flat_number",
];

export const getToken = () => AsyncStorage.getItem("access_token");

export const clearSession = async () => {
  await AsyncStorage.multiRemove(SESSION_KEYS);
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
}

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
  const { body, headers: extraHeaders, ...rest } = options;

  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const isPlainObject =
    body != null && !isForm && typeof body === "object";

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isForm ? {} : isPlainObject ? { "Content-Type": "application/json" } : {}),
    ...(extraHeaders as Record<string, string> | undefined),
  };

  const res = await fetch(`${config.apiUrl}${path}`, {
    ...rest,
    headers,
    body: isPlainObject ? JSON.stringify(body) : (body as BodyInit | null | undefined),
  });

  if (res.status === 401) {
    // Only treat as a real session expiry if we actually had a token; a 401 on
    // the unauthenticated login flow shouldn't bounce the user.
    if (token) await handleUnauthorized();
  }

  return parseResponse<T>(res, path);
}

export const apiGet = <T = any>(path: string, options?: ApiRequestOptions) =>
  apiRequest<T>(path, { ...options, method: "GET" });

export const apiPost = <T = any>(path: string, body?: ApiRequestOptions["body"], options?: ApiRequestOptions) =>
  apiRequest<T>(path, { ...options, method: "POST", body });

export const apiDelete = <T = any>(path: string, options?: ApiRequestOptions) =>
  apiRequest<T>(path, { ...options, method: "DELETE" });
