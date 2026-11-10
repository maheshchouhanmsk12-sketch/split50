"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeMode } from "@/types";
import { loadThemePreference, saveThemePreference } from "@/lib/storage";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = loadThemePreference();
    setThemeState(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const computeResolved = (mode: ThemeMode): "light" | "dark" => {
      if (mode === "dark") return "dark";
      if (mode === "light") return "light";
      return mediaQuery.matches ? "dark" : "light";
    };

    const effective = computeResolved(theme);
    setResolvedTheme(effective);

    const root = document.documentElement;
    if (effective === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    const handler = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        const next = e.matches ? "dark" : "light";
        setResolvedTheme(next);
        if (next === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme, mounted]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    saveThemePreference(mode);
  };

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

