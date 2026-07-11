import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import notifee, { AndroidImportance } from "@notifee/react-native";
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

/**
 * Android notification channel.
 *
 * Must match the id in plugins/withDefaultNotificationChannel.js, which points
 * FCM's `default_notification_channel_id` here. Without both halves a push with
 * no `android_channel_id` in its payload — which is all of ours — lands on an
 * auto-created channel at DEFAULT importance: silent, no heads-up banner.
 *
 * Importance is set once, at creation. Android will not let an app raise it
 * later, and the user can lower it — which is correct, and their call to make.
 */
const CHANNEL_ID = "getmyhelp_alerts";

async function ensureChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  try {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: "Alerts",
      description: "Visitors at the gate, maid updates and society announcements.",
      importance: AndroidImportance.HIGH,
      sound: "default",
      vibration: true,
    });
  } catch {
    // Fail-safe: no channel just means quieter notifications, never a crash.
  }
}

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

    // /customer/device-tokens is customer-only — there's no admin/guard device
    // token router on the backend yet, so registering a guard would just 4xx.
    const role = await AsyncStorage.getItem("user_role");
    if (role === "guard") return;

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
 * Wire up the FCM listeners for the app's lifetime. Call once from the root
 * layout; returns an unsubscribe.
 *
 * Deliberately absent: a foreground message handler. The backend pushes through
 * the same funnel that already broadcasts over the WebSocket, so a connected app
 * would show the same notification twice. react-native-firebase does not display
 * notifications while the app is foregrounded, so doing nothing here *is* the
 * suppression — the WebSocket owns the foreground, FCM owns background/killed.
 */
export function initPushListeners(): () => void {
  // The channel must exist before the first push lands, or Android files that
  // one on a default-importance fallback and it arrives silently.
  ensureChannel();

  // FCM rotates tokens; a stale one silently stops delivering. The POST is
  // idempotent, so re-registering just bumps last_seen_at server-side.
  const unsubscribeRefresh = messaging().onTokenRefresh(async (token) => {
    try {
      const authToken = await AsyncStorage.getItem("access_token");
      if (!authToken) return;
      const role = await AsyncStorage.getItem("user_role");
      if (role === "guard") return;
      if (!(await getPushEnabled())) return;

      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      await registerDeviceToken(token, devicePlatform);
    } catch {
      // Fail-safe.
    }
  });

  // Tapped while the app was backgrounded.
  const unsubscribeOpened = messaging().onNotificationOpenedApp((message) => {
    routeFromPushData(message?.data as Record<string, string> | undefined);
  });

  // Tapped while the app was killed — the notification that launched us.
  messaging()
    .getInitialNotification()
    .then((message) => {
      if (message) {
        routeFromPushData(message.data as Record<string, string> | undefined);
      }
    })
    .catch(() => {});

  return () => {
    unsubscribeRefresh();
    unsubscribeOpened();
  };
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
  } else if (linkType === "visitor" && linkId) {
    // Someone is physically at the gate — the most time-critical push we send.
    // It must land on the approval screen, not the notifications list.
    router.push(`/visitor/resident-detail?id=${linkId}`);
  } else if (linkType === "poll") {
    router.push("/(tabs)/community");
  } else if (linkType === "subscription") {
    router.push("/(tabs)/subscriptions");
  } else if (linkType === "provider") {
    // Covers provider_assigned and provider_reassigned — both carry
    // link_type "provider". No provider-detail screen exists, so we land on the
    // dashboard, where TodaysHelp shows who is actually coming today.
    router.push("/(tabs)/dashboard");
  } else {
    router.push("/notifications");
  }

  if (data.notification_id) {
    markNotificationRead(data.notification_id).catch(() => {});
  }
}
