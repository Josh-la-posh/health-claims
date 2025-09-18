// import { useThemeStore } from "../../store/theme";
// import { Moon, Sun, Monitor } from "lucide-react";
// import { Button } from "../../components/ui/button";

// export function ThemeToggle() {
//   const { mode, setMode } = useThemeStore();

//   return (
//     <div className="inline-flex gap-1">
//       <Button variant={mode === "light" ? "primary" : "secondary"} size="sm" onClick={() => setMode("light")} leftIcon={<Sun size={14} />}>Light</Button>
//       <Button variant={mode === "dark" ? "primary" : "secondary"} size="sm" onClick={() => setMode("dark")} leftIcon={<Moon size={14} />}>Dark</Button>
//       <Button variant={mode === "system" ? "primary" : "secondary"} size="sm" onClick={() => setMode("system")} leftIcon={<Monitor size={14} />}>System</Button>
//     </div>
//   );
// }


import { useState, useEffect, useRef, type JSX } from "react";
import { useThemeStore } from "../../store/theme";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "../../utils/cn";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { mode, setMode } = useThemeStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const options: { label: string; value: "light" | "dark" | "system"; icon: JSX.Element }[] = [
    { label: "Light", value: "light", icon: <Sun size={16} /> },
    { label: "Dark", value: "dark", icon: <Moon size={16} /> },
    { label: "System", value: "system", icon: <Monitor size={16} /> },
  ];

  // 👇 Click-away detection
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      {/* Large screen toggle group */}
      <div className="hidden lg:inline-flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setMode(opt.value)}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm transition-colors",
              mode === opt.value
                ? "bg-primary text-white border-primary"
                : "bg-card border-border text-muted-foreground hover:bg-accent"
            )}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Small screen floating toggle */}
      <div className="lg:hidden fixed bottom-20 right-4 z-50" ref={menuRef}>
        <div className="relative">
          {/* Main floating button with ripple/scale */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setOpen((prev) => !prev)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg relative overflow-hidden"
          >
            {mode === "light" ? <Sun size={20} /> : mode === "dark" ? <Moon size={20} /> : <Monitor size={20} />}
          </motion.button>

          {/* Animated expanded menu */}
          <AnimatePresence>
            {open && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute bottom-14 right-0 flex flex-col gap-2 bg-card border border-border rounded-md shadow-md p-2"
              >
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setMode(opt.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded px-2 py-1 text-sm transition-colors",
                      mode === opt.value
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
