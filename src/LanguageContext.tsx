import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "./i18n";

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState("en");

  useEffect(() => {
    const loadSavedLanguage = async () => {
      const saved = await AsyncStorage.getItem("LANGUAGE");
      const lang = saved || "en";
      i18n.locale = lang;
      setLanguageState(lang);
    };
    loadSavedLanguage();
  }, []);

  const setLanguage = async (lang: string) => {
    i18n.locale = lang;
    setLanguageState(lang);
    await AsyncStorage.setItem("LANGUAGE", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
