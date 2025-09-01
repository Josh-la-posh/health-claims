import { create } from "zustand";

/** Store primary color as H S L triple (no commas) e.g. "222 89% 56%" */
type ThemeState = { primaryHsl: string };
type ThemeActions = { setPrimaryHsl: (hsl: string) => void };

export const useThemeStore = create<ThemeState & ThemeActions>((set) => ({
  primaryHsl: "147.38, 100%, 31.37%",
  setPrimaryHsl: (hsl) => set({ primaryHsl: hsl }),
}));
