import messaging from "@react-native-firebase/messaging";
import { useEffect } from "react";
import { registerForPush, routeFromPushData } from "../src/push";

/**
 * App-wide push wiring. Mounted once under the root navigator so router-based
 * deep-linking has a navigation context.
 *
 * - Re-registers the FCM token on app start (covers a returning logged-in user)
 *   and on the SDK's token-refresh callback.
 * - Foreground messages are intentionally ignored: the same notification also
 *   arrives over the existing notification WebSocket, which updates the in-app
 *   badge/list. De-duping here avoids double-counting.
 * - Tapping a notification (from background or a cold/killed start) routes via
 *   the message's `data` block.
 */
export function usePushNotifications() {
  useEffect(() => {
    registerForPush();

    const unsubscribeRefresh = messaging().onTokenRefresh(() => {
      registerForPush();
    });

    // Foreground delivery — WebSocket already surfaces these in-app.
    const unsubscribeMessage = messaging().onMessage(() => {});

    // App was backgrounded and the user tapped the notification.
    const unsubscribeOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
      routeFromPushData(remoteMessage?.data as Record<string, string> | undefined);
    });

    // App was killed and launched by tapping the notification.
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          routeFromPushData(remoteMessage.data as Record<string, string> | undefined);
        }
      })
      .catch(() => {});

    return () => {
      unsubscribeRefresh();
      unsubscribeMessage();
      unsubscribeOpened();
    };
  }, []);
}
