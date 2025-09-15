import { useThemeStore } from "../../store/theme";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "../../components/ui/button";

export function ThemeToggle() {
  const { mode, setMode } = useThemeStore();

  return (
    <div className="inline-flex gap-1">
      <Button variant={mode === "light" ? "primary" : "secondary"} size="sm" onClick={() => setMode("light")} leftIcon={<Sun size={14} />}>Light</Button>
      <Button variant={mode === "dark" ? "primary" : "secondary"} size="sm" onClick={() => setMode("dark")} leftIcon={<Moon size={14} />}>Dark</Button>
      <Button variant={mode === "system" ? "primary" : "secondary"} size="sm" onClick={() => setMode("system")} leftIcon={<Monitor size={14} />}>System</Button>
    </div>
  );
}