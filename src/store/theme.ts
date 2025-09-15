import { create } from "zustand";

type Mode = "light" | "dark" | "system";

type ThemeState = {
  mode: Mode;
  primaryHsl: string;
  setMode: (m: Mode) => void;
  setPrimaryHsl: (hsl: string) => void;
  hydrate: () => void;
};

const MODE_KEY = "theme:mode";
const BRAND_KEY = "brand:primaryHsl";

function applyMode(mode: Mode) {
  const root = document.documentElement;
  const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const final = mode === "system" ? (systemDark ? "dark" : "light") : mode;
  root.setAttribute("data-theme", final);

  if (final === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function applyPrimary(hsl: string) {
  document.documentElement.style.setProperty("--primary", hsl);
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "system",
  primaryHsl: "147.38, 100%, 31.37%",
  setMode: (m) => {
    localStorage.setItem(MODE_KEY, m);
    applyMode(m);
    set({ mode: m });
  },
  setPrimaryHsl: (hsl) => {
    localStorage.setItem(BRAND_KEY, hsl);
    applyPrimary(hsl);
    set({ primaryHsl: hsl });
  },
  hydrate: () => {
    const m = (localStorage.getItem(MODE_KEY) as Mode) || "system";
    const p = localStorage.getItem(BRAND_KEY) || "147.38, 100%, 31.37%";
    applyMode(m);
    applyPrimary(p);
    set({ mode: m, primaryHsl: p });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => get().mode === "system" && applyMode("system");
    mq.addEventListener?.("change", listener);
  },
}));
