import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

/**
 * The access token, and the only place it is read or written.
 *
 * It lives in SecureStore (iOS Keychain / Android Keystore), not AsyncStorage.
 * AsyncStorage is plaintext on disk: on a rooted or backed-up device the bearer
 * token was readable, and with `allowBackup="true"` it was being synced to the
 * user's Google Drive.
 *
 * Everything else about the session (user, role, society) stays in AsyncStorage
 * — it's ordinary profile data, and SecureStore has a 2 KB value limit per key
 * that a serialised user object can exceed.
 */

const TOKEN_KEY = "access_token";

// SecureStore is a native module, so it is unavailable on web and can throw on a
// device with a broken keystore. Falling back to AsyncStorage there keeps the app
// usable rather than making login impossible — the token is no less safe than it
// was before this change.
let secureAvailable: boolean | null = null;

async function canUseSecureStore(): Promise<boolean> {
  if (secureAvailable !== null) return secureAvailable;
  try {
    secureAvailable = await SecureStore.isAvailableAsync();
  } catch {
    secureAvailable = false;
  }
  return secureAvailable;
}

/**
 * Read the token, migrating it out of AsyncStorage on first run after upgrade.
 *
 * Without this, every already-logged-in user would be silently signed out by the
 * update — the token would still be in AsyncStorage while we looked for it in the
 * keychain.
 */
export async function getToken(): Promise<string | null> {
  if (!(await canUseSecureStore())) {
    return AsyncStorage.getItem(TOKEN_KEY);
  }

  try {
    const secure = await SecureStore.getItemAsync(TOKEN_KEY);
    if (secure) return secure;
  } catch {
    // Fall through to the legacy read.
  }

  // One-time migration off the old plaintext location.
  const legacy = await AsyncStorage.getItem(TOKEN_KEY);
  if (!legacy) return null;

  try {
    await SecureStore.setItemAsync(TOKEN_KEY, legacy);
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    // Migration failed — keep the legacy copy rather than stranding the session.
  }
  return legacy;
}

export async function setToken(token: string): Promise<void> {
  if (!(await canUseSecureStore())) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return;
  }
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    // Belt and braces: never leave a copy behind in the plaintext store.
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }
}

/** Clear from both stores — a partial clear would leave a usable session behind. */
export async function clearToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // SecureStore unavailable or key absent; the AsyncStorage removal still runs.
  }
  await AsyncStorage.removeItem(TOKEN_KEY);
}
