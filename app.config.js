// Extends the static config in app.json.
// On EAS Build the Firebase config files are injected via secret "file" env vars
// (they're gitignored and never uploaded with the project). Locally we fall back
// to the files on disk so `expo run`/prebuild keep working.
module.exports = ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_INFO_PLIST ?? config.ios?.googleServicesFile,
  },
  android: {
    ...config.android,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? config.android?.googleServicesFile,
  },
});
