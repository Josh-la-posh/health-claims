import { useThemeStore } from "../../store/theme";
import { useEffect } from "react";

/** Syncs theme tokens (brand color) to CSS vars. */
export default function ThemeProvider() {
  const primaryHsl = useThemeStore(s => s.primaryHsl);
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--primary", primaryHsl);
    r.style.setProperty("--primary-foreground", "0 0% 100%");
  }, [primaryHsl]);
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