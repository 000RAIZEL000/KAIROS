import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark";

// Paleta de colores para cada tema
const lightColors = {
  // Fondos
  background: "#f0fdf4",
  surface: "#ffffff",
  headerGradientStart: "#022c22",
  headerGradientEnd: "#064e3b",
  // Textos
  text: "#064e3b",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  textOnHeader: "#f8fafc",
  textOnHeaderSoft: "#a7f3d0",
  // Acentos
  accent: "#34d399",
  accentDark: "#059669",
  accentBg: "#ecfdf5",
  accentBorder: "#a7f3d0",
  accentSoft: "rgba(52, 211, 153, 0.2)",
  // Cards
  card: "#ffffff",
  cardBorder: "#d1fae5",
  cardFooterBg: "#f0fdf4",
  cardFooterBorder: "#ecfdf5",
  // Inputs (Auth screens)
  inputBg: "rgba(2, 44, 34, 0.6)",
  inputBorder: "rgba(255, 255, 255, 0.05)",
  glassCard: "rgba(255, 255, 255, 0.05)",
  glassCardBorder: "rgba(255, 255, 255, 0.1)",
  // Auth background
  authBg: "#022c22",
  // Misc
  danger: "#ef4444",
  fabBg: "#34d399",
  fabText: "#022c22",
  statusBarStyle: "dark-content" as const,
  // Badge
  badgeBg: "rgba(52, 211, 153, 0.2)",
  badgeText: "#34d399",
  // Splash screen
  splashBg: "#022c22",
  splashBall: "#ffffff",
  splashBarBg: "rgba(255, 255, 255, 0.3)",
  splashBarFill: "#ffffff",
};

const darkColors = {
  // Fondos
  background: "#022c22", // Verde muy oscuro
  surface: "#064e3b",    // Verde esmeralda profundo
  headerGradientStart: "#022c22",
  headerGradientEnd: "#064e3b",
  // Textos
  text: "#f8fafc",
  textSecondary: "#a7f3d0",
  textMuted: "#34d399",
  textOnHeader: "#f8fafc",
  textOnHeaderSoft: "#a7f3d0",
  // Acentos
  accent: "#34d399",
  accentDark: "#10b981",
  accentBg: "rgba(52, 211, 153, 0.1)",
  accentBorder: "rgba(52, 211, 153, 0.3)",
  accentSoft: "rgba(52, 211, 153, 0.15)",
  // Cards
  card: "#064e3b",
  cardBorder: "rgba(52, 211, 153, 0.2)",
  cardFooterBg: "#022c22",
  cardFooterBorder: "rgba(52, 211, 153, 0.1)",
  // Inputs (Auth screens)
  inputBg: "rgba(0, 0, 0, 0.3)",
  inputBorder: "rgba(52, 211, 153, 0.3)",
  glassCard: "rgba(6, 78, 59, 0.8)",
  glassCardBorder: "rgba(52, 211, 153, 0.2)",
  // Auth background
  authBg: "#022c22",
  // Misc
  danger: "#ef4444",
  fabBg: "#34d399",
  fabText: "#022c22",
  statusBarStyle: "light-content" as const,
  // Badge
  badgeBg: "rgba(52, 211, 153, 0.2)",
  badgeText: "#34d399",
  // Splash screen
  splashBg: "#022c22",
  splashBall: "#34d399",
  splashBarBg: "rgba(52, 211, 153, 0.2)",
  splashBarFill: "#34d399",
};

export type ThemeColors = typeof lightColors;

type ThemeContextType = {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = "kairos_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved === "light" || saved === "dark") {
          setThemeState(saved);
        }
      } catch (e) {
        console.log("Error loading theme:", e);
      }
    };
    loadTheme();
  }, []);

  const colors = theme === "dark" ? darkColors : lightColors;

  const toggleTheme = async () => {
    const next = theme === "light" ? "dark" : "light";
    setThemeState(next);
    await AsyncStorage.setItem(THEME_KEY, next);
  };

  const setTheme = async (mode: ThemeMode) => {
    setThemeState(mode);
    await AsyncStorage.setItem(THEME_KEY, mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme debe usarse dentro de ThemeProvider");
  }
  return context;
}
