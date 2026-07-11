import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiGet, ENABLED_MODULES_KEY } from "./api/client";

/**
 * Backend-driven feature permission context.
 *
 * The backend is the single source of truth for which modules a society has
 * enabled. This provider loads the resolved {moduleKey: enabled} map once after
 * auth (cache-first for instant paint, then a network refresh) and exposes it
 * to the whole app via `useFeature("visitors")` / `useFeatures()`.
 *
 * Navigation, screens, quick-actions, banners and websockets all read from this
 * instead of hard-coding feature checks — see src/featureRegistry.ts. The real
 * enforcement is server-side (every protected endpoint 403s a disabled module);
 * the client gating is purely UX ("the feature should simply not exist").
 */

export type ModuleMap = Record<string, boolean>;

const CACHE_KEY = ENABLED_MODULES_KEY;

/**
 * Normalise whatever `/features` returns into a {moduleKey: enabled} map.
 *
 * The admin side owns the module catalog, so the payload shape is theirs to
 * change. Rather than couple to one spelling we accept the shapes the endpoint
 * plausibly returns, and return `null` (→ caller keeps the last known map and
 * logs) when it's something we genuinely don't understand.
 *
 *   { enabledModules: { visitors: true, … } }   ← original contract
 *   { modules: { … } } / { features: { … } }    ← common renames
 *   { enabled_modules: [...] }                  ← snake_case
 *   ["visitors", "tickets"]                     ← array of enabled keys
 *   [{ key: "visitors", enabled: true }, …]     ← array of catalog rows
 *
 * Each of the above is also accepted nested under `data`.
 */
export function parseModules(res: any): ModuleMap | null {
  const root = res?.data ?? res;
  const candidate =
    res?.enabledModules ??
    res?.enabled_modules ??
    res?.modules ??
    res?.features ??
    root?.enabledModules ??
    root?.enabled_modules ??
    root?.modules ??
    root?.features ??
    (Array.isArray(root) ? root : null);

  if (!candidate) return null;

  // Array form: either bare keys, or catalog rows carrying their own flag.
  if (Array.isArray(candidate)) {
    const map: ModuleMap = {};
    for (const entry of candidate) {
      if (typeof entry === "string") {
        map[entry] = true;
        continue;
      }
      const key = entry?.key ?? entry?.module_key ?? entry?.moduleKey ?? entry?.name;
      if (typeof key !== "string") continue;
      // A row with no explicit flag is presumed enabled — it was returned at all.
      const flag = entry?.enabled ?? entry?.is_enabled ?? entry?.isEnabled ?? true;
      map[key] = Boolean(flag);
    }
    return Object.keys(map).length ? map : null;
  }

  if (typeof candidate === "object") {
    const map: ModuleMap = {};
    for (const [key, value] of Object.entries(candidate)) {
      map[key] = Boolean(value);
    }
    return Object.keys(map).length ? map : null;
  }

  return null;
}

interface FeatureContextValue {
  modules: ModuleMap;
  ready: boolean;
  refresh: () => Promise<void>;
}

const FeatureContext = createContext<FeatureContextValue>({
  modules: {},
  ready: false,
  refresh: async () => {},
});

export const FeatureProvider = ({ children }: { children: React.ReactNode }) => {
  const [modules, setModules] = useState<ModuleMap>({});
  const [ready, setReady] = useState(false);
  // Whether we hold a module map for the *current* session, as opposed to none
  // at all. Drives the optimistic window in `refresh` — see below.
  const resolved = useRef(false);

  const apply = useCallback(async (m: ModuleMap) => {
    setModules(m);
    resolved.current = true;
    setReady(true);
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(m));
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        // Not logged in — nothing to resolve. Drop any modules from a previous
        // session and mark ready so the (unauthed) UI isn't optimistic forever.
        setModules({});
        resolved.current = false;
        setReady(true);
        return;
      }

      // We hold a token but have never resolved a map for *this* session (e.g.
      // we just logged in). Go optimistic until the answer lands, otherwise
      // `useFeature` reads the empty map and every feature flashes hidden.
      if (!resolved.current) setReady(false);

      const role = await AsyncStorage.getItem("user_role");
      const path = role === "guard" ? "/guard/features" : "/customer/features";
      const res: any = await apiGet(path);

      const m = parseModules(res);
      if (m) {
        if (__DEV__) {
          const on = Object.keys(m).filter((k) => m[k]);
          const off = Object.keys(m).filter((k) => !m[k]);
          console.log(`[Features] ${path}\n  ON : ${on.join(", ") || "(none)"}\n  OFF: ${off.join(", ") || "(none)"}`);
        }
        await apply(m);
      } else {
        console.warn(
          `[FeatureContext] ${path} returned an unrecognised shape; keeping the ` +
            `last known module set. Response:`,
          JSON.stringify(res)?.slice(0, 500)
        );
        setReady(true);
      }
    } catch {
      // Keep whatever (cached) modules we have; just stop being optimistic.
      setReady(true);
    }
  }, [apply]);

  useEffect(() => {
    (async () => {
      // Cache-first hydration for instant first paint. Safe across societies
      // because logout/401 clears CACHE_KEY with the rest of the session, so a
      // cache present here always belongs to the logged-in user's society.
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          setModules(JSON.parse(cached));
          resolved.current = true;
          setReady(true);
        }
      } catch {}
      // Then refresh from the source of truth.
      refresh();
    })();
  }, [refresh]);

  return (
    <FeatureContext.Provider value={{ modules, ready, refresh }}>
      {children}
    </FeatureContext.Provider>
  );
};

/**
 * Whether a module is enabled for the current society.
 *
 * While the map is still loading we return `true` (optimistic) so real features
 * don't flash hidden on a slow network; once resolved, unknown/absent keys are
 * fail-closed to `false`. Security is enforced server-side regardless.
 */
export const useFeature = (key: string): boolean => {
  const { modules, ready } = useContext(FeatureContext);
  if (!ready) return true;
  return modules[key] ?? false;
};

export const useFeatures = (): ModuleMap => useContext(FeatureContext).modules;

/** Imperatively refresh the enabled-module set (e.g. right after login). */
export const useRefreshFeatures = () => useContext(FeatureContext).refresh;
