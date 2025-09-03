import { useEffect } from "react";
import { useThemeStore, getSystemPref } from "@/store/theme";

/** Applies brand tokens and dark mode class to <html>. */
export default function ThemeProvider() {
  const primaryHsl = useThemeStore((s) => s.primaryHsl);
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const r = document.documentElement;

    // brand colors
    r.style.setProperty("--primary", primaryHsl);
    // Adjust foreground if you compute contrast dynamically; static is fine for now:
    r.style.setProperty("--primary-foreground", "0 0% 100%");

    // mode handler
    function applyMode(m: "light" | "dark") {
      if (m === "dark") r.classList.add("dark");
      else r.classList.remove("dark");
    }

    if (mode === "system") {
      // initial
      applyMode(getSystemPref());

      // listen to system changes
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const cb = (e: MediaQueryListEvent) => applyMode(e.matches ? "dark" : "light");
      mq.addEventListener?.("change", cb);
      return () => mq.removeEventListener?.("change", cb);
    } else {
      applyMode(mode);
    }
  }, [primaryHsl, mode]);

  return null;
}


// function BrandColorPicker() {
//   const { mutateAsync } = useSaveBrandColor();
//   const setHsl = useThemeStore(s => s.setPrimaryHsl);

//   async function apply(h: number, s: number, l: number) {
//     const hsl = `${h} ${s}% ${l}%`;
//     setHsl(hsl);               // updates CSS var immediately
//     await mutateAsync(hsl);    // persists to backend
//   }

//   // UI omitted; call apply(…)
//   return null;
// }