import messaging from "@react-native-firebase/messaging";

/**
 * Background/killed-state FCM handler. Must be registered at module load time
 * (outside any React component), so this file is imported for its side effect
 * from the app root.
 *
 * Every push from the backend carries a `notification` block, so the OS renders
 * the banner automatically when the app is backgrounded/closed — there is
 * nothing to do here. Registering the handler keeps RNFirebase from warning and
 * leaves a hook for future data-only messages.
 */
messaging().setBackgroundMessageHandler(async () => {
  // No-op: OS renders the notification block; tap routing happens on open via
  // onNotificationOpenedApp / getInitialNotification (see usePushNotifications).
});
