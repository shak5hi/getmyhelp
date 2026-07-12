/**
 * Babel config.
 *
 * The only reason this file exists is `transform-remove-console`. The app has 70+
 * console statements — request bodies, backend responses, error objects — and
 * without this they all ship to production, where they cost performance and leak
 * data into logcat. Anyone with `adb` can read them off a user's device.
 *
 * `error` and `warn` are kept: they carry no request payloads and are what a
 * crash reporter (Sentry/Crashlytics) hooks into for breadcrumbs.
 */
module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    env: {
      production: {
        plugins: [
          ["transform-remove-console", { exclude: ["error", "warn"] }],
        ],
      },
    },
  };
};
