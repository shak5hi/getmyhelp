import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Local user preferences that actually persist (previously these were
 * component-local React state that reset on unmount). Stored in AsyncStorage so
 * a choice survives app restarts. Language lives in LanguageContext; theme in
 * ThemeContext — this covers the remaining toggles.
 */

const PUSH_KEY = "pref_push_enabled";

// Default ON — matches the prior default and the app's notification-first UX.
export const getPushEnabled = async (): Promise<boolean> => {
  const v = await AsyncStorage.getItem(PUSH_KEY);
  return v !== "false";
};

export const setPushEnabled = (enabled: boolean): Promise<void> =>
  AsyncStorage.setItem(PUSH_KEY, enabled ? "true" : "false");
