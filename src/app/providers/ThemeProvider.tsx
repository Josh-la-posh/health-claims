import { useEffect } from "react";
import { useThemeStore } from "../../store/theme";

export default function ThemeProvider() {
  const hydrate = useThemeStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);
  return null;
}
