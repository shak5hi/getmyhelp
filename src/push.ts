import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { router } from "expo-router";
import { PermissionsAndroid, Platform } from "react-native";
import { markNotificationRead } from "./api/communityApi";
import {
  DevicePlatform,
  registerDeviceToken,
  unregisterDeviceToken,
} from "./api/deviceTokenApi";
import { getPushEnabled } from "./preferences";

/**
 * FCM push notifications — client side of PUSH_NOTIFICATIONS_CONTRACT.md.
 *
 * Push is strictly additive and fail-safe: every step is wrapped so a missing
 * Firebase config, denied permission, or failed network call can never break
 * login/logout. In-app notifications (WebSocket + REST) keep working regardless.
 *
 * The last-registered FCM token is cached locally so logout can DELETE exactly
 * the token the backend knows about.
 */

const FCM_TOKEN_KEY = "fcm_token";

const devicePlatform: DevicePlatform = Platform.OS === "ios" ? "ios" : "android";

// Ask the OS for notification permission. Android <13 needs no runtime prompt;
// Android 13+ uses POST_NOTIFICATIONS; iOS goes through the FCM SDK.
async function requestPushPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    if (typeof Platform.Version === "number" && Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }
  const status = await messaging().requestPermission();
  return (
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL
  );
}

/**
 * Obtain the FCM token and register it with the backend. Safe to call on every
 * login, app start, and the SDK's token-refresh callback (POST is idempotent).
 * No-ops when the user is logged out or has push disabled in preferences.
 */
export async function registerForPush(): Promise<void> {
  try {
    const authToken = await AsyncStorage.getItem("access_token");
    if (!authToken) return;
    if (!(await getPushEnabled())) return;

    const granted = await requestPushPermission();
    if (!granted) return;

    const token = await messaging().getToken();
    if (!token) return;

    await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
    await registerDeviceToken(token, devicePlatform);
  } catch {
    // Fail-safe: a misconfigured/denied push never affects the rest of the app.
  }
}

/**
 * Stop pushes to this device: DELETE the backend token and drop the local copy.
 * Call before clearing the session on logout, and when push is toggled off.
 */
export async function unregisterForPush(): Promise<void> {
  try {
    let token = await AsyncStorage.getItem(FCM_TOKEN_KEY);
    if (!token) {
      token = await messaging()
        .getToken()
        .catch(() => null);
    }
    if (token) {
      await unregisterDeviceToken(token).catch(() => {});
    }
    await AsyncStorage.removeItem(FCM_TOKEN_KEY);
    await messaging()
      .deleteToken()
      .catch(() => {});
  } catch {
    // Fail-safe.
  }
}

/**
 * Deep-link from a tapped push using data.link_type + data.link_id, then mark
 * the matching in-app notification read. Mirrors the routing in notifications.tsx.
 */
export function routeFromPushData(data: Record<string, string> | undefined): void {
  if (!data) return;

  const linkType = data.link_type;
  const linkId = data.link_id;

  if (linkType === "announcement" && linkId) {
    router.push(`/community/announcement-detail?id=${linkId}`);
  } else if (linkType === "forum_post" && linkId) {
    router.push(`/community/forum-thread?id=${linkId}`);
  } else if (linkType === "poll") {
    router.push("/(tabs)/community");
  } else {
    router.push("/notifications");
  }

  if (data.notification_id) {
    markNotificationRead(data.notification_id).catch(() => {});
  }
}
