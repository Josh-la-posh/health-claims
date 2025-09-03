import { Sun, Moon, Monitor } from "lucide-react";
import { useMemo } from "react";
import { useThemeStore } from "../../store/theme";

export default function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const options = useMemo(
    () => ([
      { key: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
      { key: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
      { key: "system", label: "System", icon: <Monitor className="h-4 w-4" /> },
    ] as const),
    []
  );

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
      {options.map((opt) => {
        const active = mode === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => setMode(opt.key)}
            className={
              "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition " +
              (active
                ? "bg-primary text-primary-foreground"
                : "text-muted hover:bg-border/40")
            }
            aria-pressed={active}
          >
            {opt.icon}
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
