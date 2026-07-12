import Constants from 'expo-constants';

// LOCAL DEV BUILD: pointed at the dev machine's LAN IP so a physical device on
// the same Wi-Fi reaches the local FastAPI backend (run it with --host 0.0.0.0).
// NOTE: machine-specific — revert before producing a production build.
// Uses adb reverse (tcp:8000 -> host tcp:8000) so the phone reaches the PC
// backend via localhost, independent of the PC's Wi-Fi IP / firewall / router.
// Requires: adb connected + `adb reverse tcp:8000 tcp:8000`.
// Use 127.0.0.1 (NOT localhost): on Android localhost can resolve to IPv6 ::1,
// which adb reverse does not forward. 127.0.0.1 forces IPv4 to match the tunnel.
const LOCAL_DEV = {
  apiUrl: "http://127.0.0.1:8000",
  fileBaseUrl: "http://127.0.0.1:8000",
};

// The deployed backend. Files are served from the admin domain over HTTPS.
const REMOTE = {
  apiUrl: "https://api.getmyhelp.in",
  fileBaseUrl: "https://admin.getmyhelp.in",
};

const ENV = {
  dev: LOCAL_DEV,
  staging: REMOTE,
  prod: REMOTE,
};

// Skip Firebase app verification (reCAPTCHA / Play Integrity) so Firebase "test
// phone numbers" work on locally-signed builds whose SHA isn't registered in the
// Firebase project.
//
// Bound to __DEV__ rather than a hand-flipped boolean: this bypasses a real
// anti-abuse control, and "remember to set it back to false before release" is
// not a safety mechanism. Release bundles get `false` for free.
export const DISABLE_APP_VERIFICATION = __DEV__;

const getEnvVars = () => {
  if (Constants.expoConfig?.extra?.environment === 'staging') return ENV.staging;
  return ENV.prod;
};

const config = getEnvVars();

// Resolve a media path returned by the API into an absolute URL.
// Root-relative paths ("/documents/...") are prefixed with the file host;
// absolute URLs (http/https) are passed through unchanged.
export const mediaUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${config.fileBaseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default config;
