import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext } from "./theme-context";

const THEME_STORAGE_KEY = "atelier_theme";

function readInitialTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark") return true;
    if (stored === "light") return false;
  } catch (error) {
    console.error("Unable to read the saved theme:", error);
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(readInitialTheme);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
    } catch (error) {
      console.error("Unable to save the selected theme:", error);
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((current) => !current), []);
  const value = useMemo(() => ({ isDark, toggleTheme }), [isDark, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
