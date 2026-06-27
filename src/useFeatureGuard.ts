import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useFeature } from "./FeatureContext";

/**
 * Route guard for feature-gated screens.
 *
 * Drop `useFeatureGuard("visitors")` at the top of a screen: if the module is
 * disabled for the society, the user is bounced to a safe home route instead of
 * landing on a screen for a feature that "doesn't exist". Belt-and-braces with
 * the backend 403 and the hidden navigation entry.
 *
 * Returns `true` while the feature is enabled (so callers can early-return null
 * for the frame before redirect).
 */
export function useFeatureGuard(module: string, fallback = "/(tabs)/dashboard"): boolean {
  const enabled = useFeature(module);
  const router = useRouter();

  useEffect(() => {
    if (!enabled) router.replace(fallback as any);
  }, [enabled, fallback, router]);

  return enabled;
}
