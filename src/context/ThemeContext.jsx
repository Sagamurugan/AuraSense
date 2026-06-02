/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "aurasense_theme";
const ACCENT_KEY = "aurasense_accent";

const ACCENT_PRESETS = {
  cyan: { from: "#38bdf8", to: "#818cf8" },
  emerald: { from: "#34d399", to: "#22d3ee" },
  violet: { from: "#a78bfa", to: "#f472b6" },
  amber: { from: "#fbbf24", to: "#f97316" },
};

function readTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) || "dark";
  } catch {
    return "dark";
  }
}

function readAccent() {
  try {
    return localStorage.getItem(ACCENT_KEY) || "cyan";
  } catch {
    return "cyan";
  }
}

function writeTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage unavailable
  }
}

function writeAccent(accent) {
  try {
    localStorage.setItem(ACCENT_KEY, accent);
  } catch {
    // localStorage unavailable
  }
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readTheme);
  const [accent, setAccentState] = useState(readAccent);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    root.style.colorScheme = theme;
    writeTheme(theme);
  }, [theme]);

  useEffect(() => {
    const preset = ACCENT_PRESETS[accent] || ACCENT_PRESETS.cyan;
    const root = document.documentElement;
    root.style.setProperty("--accent-from", preset.from);
    root.style.setProperty("--accent-to", preset.to);
    writeAccent(accent);
  }, [accent]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setAccent = useCallback((next) => {
    if (ACCENT_PRESETS[next]) setAccentState(next);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      accent,
      accentPresets: Object.keys(ACCENT_PRESETS),
      setAccent,
      toggleTheme,
      isDark: theme === "dark",
    }),
    [accent, setAccent, theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
