"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_THEME_ID, THEME_STORAGE_KEY, isThemeId } from "@/lib/themes";

interface ThemeContextValue {
  themeId: string;
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: DEFAULT_THEME_ID,
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState(DEFAULT_THEME_ID);

  // The pre-hydration ThemeScript already stamped the <html> attribute; sync
  // React state to it after mount so the picker shows the right selection.
  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    // One-time sync with the attribute the pre-hydration ThemeScript already
    // stamped — cannot cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (current && isThemeId(current)) setThemeId(current);
  }, []);

  const setTheme = (id: string) => {
    if (!isThemeId(id)) return;
    setThemeId(id);
    document.documentElement.dataset.theme = id;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      // Storage unavailable (private mode) — theme still applies this session.
    }
  };

  return (
    <ThemeContext.Provider value={{ themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
