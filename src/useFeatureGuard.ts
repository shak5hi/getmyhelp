import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useFeature, useFeatures } from "./FeatureContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENABLED_MODULES_KEY } from "./api/client";

/**
 * Route guard for feature-gated screens.
 *
 * Drop `useFeatureGuard("visitors")` at the top of a screen: if the module is
 * disabled for the society, the user is bounced to a safe home route instead of
 * landing on a screen for a feature that "doesn't exist".
 */
export function useFeatureGuard(module: string, fallback = "/(tabs)/dashboard"): boolean {
  const enabled = useFeature(module);
  const router = useRouter();
  const [cacheResolved, setCacheResolved] = useState(false);

  useEffect(() => {
    // Check AsyncStorage directly to avoid flashing the screen before the first
    // network fetch completes if the cache indicates the feature is disabled.
    AsyncStorage.getItem(ENABLED_MODULES_KEY).then((cached) => {
      if (cached) {
        try {
          const modules = JSON.parse(cached);
          if (modules[module] === false) {
            router.replace(fallback as any);
          }
        } catch {}
      }
      setCacheResolved(true);
    });
  }, [module, fallback, router]);

  useEffect(() => {
    if (cacheResolved && !enabled) {
      router.replace(fallback as any);
    }
  }, [enabled, fallback, router, cacheResolved]);

  return enabled;
}
