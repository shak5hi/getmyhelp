import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiGet } from "./api/client";

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

const CACHE_KEY = "enabled_modules";

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

  const apply = useCallback(async (m: ModuleMap) => {
    setModules(m);
    setReady(true);
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(m));
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        // Not logged in — nothing to resolve. Mark ready so the (unauthed) UI
        // doesn't stay optimistic forever.
        setReady(true);
        return;
      }
      const role = await AsyncStorage.getItem("user_role");
      const path = role === "guard" ? "/guard/features" : "/customer/features";
      const res: any = await apiGet(path);
      const m: ModuleMap | null =
        res?.enabledModules ?? res?.data?.enabledModules ?? null;
      if (m && typeof m === "object") {
        await apply(m);
      } else {
        setReady(true);
      }
    } catch {
      // Keep whatever (cached) modules we have; just stop being optimistic.
      setReady(true);
    }
  }, [apply]);

  useEffect(() => {
    (async () => {
      // Cache-first hydration for instant first paint.
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          setModules(JSON.parse(cached));
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
