import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Theme, lightTheme, darkTheme } from "../constants/themes";

export type ThemeMode = "system" | "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
};

const STORAGE_KEY = "theme_mode";
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme(); // "light" | "dark" | null
  const [mode, setModeState] = useState<ThemeMode>("light");

  // Hydrate persisted preference.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === "light" || v === "dark" || v === "system") setModeState(v);
    });
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  }, []);

  const resolved: "light" | "dark" =
    mode === "system" ? (systemScheme === "light" ? "light" : "dark") : mode;
  const theme = resolved === "light" ? lightTheme : darkTheme;

  const toggle = useCallback(() => {
    setMode(theme.mode === "dark" ? "light" : "dark");
  }, [theme.mode, setMode]);

  const value = useMemo(
    () => ({ theme, mode, setMode, toggle }),
    [theme, mode, setMode, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Safe fallback so a component rendered outside the provider never crashes.
    return { theme: darkTheme, mode: "dark", setMode: () => {}, toggle: () => {} };
  }
  return ctx;
}
