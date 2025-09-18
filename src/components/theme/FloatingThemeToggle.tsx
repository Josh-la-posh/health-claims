import { ThemeToggle } from "./ThemeToggle";

export function FloatingThemeToggle() {
  return (
    <div className="fixed bottom-4 right-4 z-50 block lg:hidden">
      <ThemeToggle />
    </div>
  );
}
