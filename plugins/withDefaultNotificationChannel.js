const { withAndroidManifest } = require("expo/config-plugins");

/**
 * Point FCM at our own notification channel.
 *
 * Creating a high-importance channel in JS (see src/push.ts) is only half the
 * job: a push whose payload carries no `android_channel_id` is posted to a
 * channel FCM auto-creates, at *default* importance — so it lands silently in
 * the tray with no heads-up banner and no sound.
 *
 * This manifest entry names the channel FCM should fall back to, so every push
 * lands on our HIGH-importance one without the backend having to send
 * `android_channel_id` on every message.
 *
 * The id must match CHANNEL_ID in src/push.ts.
 */
const CHANNEL_ID = "getmyhelp_alerts";

module.exports = function withDefaultNotificationChannel(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const app = manifest.application?.[0];
    if (!app) return cfg;

    // react-native-firebase/messaging declares this same meta-data key with an
    // empty value, so the merger refuses ours as a conflict. tools:replace tells
    // it we mean to win — which needs the tools namespace on <manifest>.
    manifest.$ = manifest.$ || {};
    if (!manifest.$["xmlns:tools"]) {
      manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";
    }

    app["meta-data"] = app["meta-data"] || [];

    const NAME = "com.google.firebase.messaging.default_notification_channel_id";
    const attrs = {
      "android:name": NAME,
      "android:value": CHANNEL_ID,
      "tools:replace": "android:value",
    };

    const existing = app["meta-data"].find((m) => m.$?.["android:name"] === NAME);

    if (existing) {
      existing.$ = { ...existing.$, ...attrs };
    } else {
      app["meta-data"].push({ $: attrs });
    }

    return cfg;
  });
};
