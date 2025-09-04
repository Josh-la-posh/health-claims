import { create } from "zustand";
export type ThemeMode = "light" | "dark" | "system";

type ThemeState = {
  primaryHsl: string;
  mode: ThemeMode;
};

type ThemeActions = {
  setPrimaryHsl: (hsl: string) => void;
  setMode: (mode: ThemeMode) => void;
};

const THEME_KEY = "theme:mode";
const BRAND_KEY = "theme:primaryHsl";

function getSystemPref(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function loadInitial(): ThemeState {
  const storedMode = (localStorage.getItem(THEME_KEY) as ThemeMode) || "system";
  const storedHsl = localStorage.getItem(BRAND_KEY) || "147.38 100% 31.37%";
  return {
    primaryHsl: storedHsl,
    mode: storedMode,
  };
}

export const useThemeStore = create<ThemeState & ThemeActions>((set) => ({
  ...loadInitial(),
  setPrimaryHsl: (primaryHsl) => {
    localStorage.setItem(BRAND_KEY, primaryHsl);
    set({ primaryHsl });
  },
  setMode: (mode) => {
    localStorage.setItem(THEME_KEY, mode);
    set({ mode });
  },
}));

export { getSystemPref };
