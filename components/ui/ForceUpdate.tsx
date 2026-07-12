import React, { useEffect, useState } from "react";
import { View, StyleSheet, Linking, TouchableOpacity } from "react-native";
import { Text } from "./Text";
import { useTheme } from "../../src/ThemeContext";
import { fonts } from "../../constants/tokens";
import { apiGet } from "../../src/api/client";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "../PrimaryButton";

/**
 * Minimum-supported-version gate.
 *
 * GET /app/version (unauthenticated, env-driven) returns:
 *   required_version  — alias of min_supported_version; the floor we enforce
 *   latest_version    — informational
 *   update_url        — where the block screen sends the user
 *   message           — optional override for the block screen copy
 *
 * This screen is a hard block with no dismiss, so it MUST always offer a way out.
 * An earlier version rendered "Update Required" with no button: raising
 * APP_REQUIRED_VERSION would have stranded every user on that build with no route
 * to the store. The store link is therefore server-supplied (so it can change
 * without a release) with a hardcoded Play fallback if the field is ever absent.
 *
 * Caveat: `Constants.expoConfig.version` is the **JS bundle's** version. With
 * expo-updates in play, an OTA can move it while the native binary stays put — so
 * this gate enforces the JS version. A genuinely broken *native* build still needs
 * a store release; this is not a native kill switch.
 *
 * Fails open: any network/parse failure lets the app run. A version check that can
 * lock people out when it breaks is worse than no version check.
 */

const PLAY_STORE_FALLBACK =
  "https://play.google.com/store/apps/details?id=com.getmyhelp.mobile";

// Simple semver compare (e.g. 1.2.0 > 1.1.0)
const isVersionOlder = (current: string, required: string) => {
  const c = current.split(".").map(Number);
  const r = required.split(".").map(Number);
  for (let i = 0; i < Math.max(c.length, r.length); i++) {
    const cv = c[i] || 0;
    const rv = r[i] || 0;
    if (cv < rv) return true;
    if (cv > rv) return false;
  }
  return false;
};

export function ForceUpdate({ children }: { children: React.ReactNode }) {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [updateUrl, setUpdateUrl] = useState(PLAY_STORE_FALLBACK);
  const [message, setMessage] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await apiGet("/app/version");
        const body = res?.data ?? res;

        const requiredVersion = body?.required_version ?? body?.min_supported_version;
        const currentVersion = Constants.expoConfig?.version ?? "1.0.0";

        if (requiredVersion && isVersionOlder(currentVersion, requiredVersion)) {
          if (body?.update_url) setUpdateUrl(body.update_url);
          if (body?.message) setMessage(body.message);
          setNeedsUpdate(true);
        }
      } catch (err) {
        // Fail open — see the module docstring.
        console.warn("Version check failed:", err);
      }
    };
    checkVersion();
  }, []);

  if (needsUpdate) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <Ionicons name="cloud-download-outline" size={64} color={theme.accent} />
        <Text style={[styles.title, { color: theme.text }]}>Update Required</Text>
        <Text style={[styles.message, { color: theme.textSecondary }]}>
          {message ??
            "A new version of the app is available. Please update to continue using GetMyHelp."}
        </Text>

        {/* The only way out of this screen. Without it, raising the required
            version strands the user with no route to the store. */}
        <PrimaryButton
          title="Update now"
          onPress={() => Linking.openURL(updateUrl).catch(() => {})}
        />

        <TouchableOpacity
          onPress={() => Linking.openURL(PLAY_STORE_FALLBACK).catch(() => {})}
          style={styles.fallbackLink}
        >
          <Text style={[styles.fallbackText, { color: theme.textTertiary }]}>
            Open the Play Store
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  fallbackLink: {
    marginTop: 16,
    padding: 8,
  },
  fallbackText: {
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
