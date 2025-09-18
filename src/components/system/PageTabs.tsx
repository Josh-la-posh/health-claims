import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import { Select } from "../ui/select";

interface Tab {
  to: string;
  label: string;
}

interface PageTabsProps {
  tabs: Tab[];
  className?: string;
}

export function PageTabs({ tabs, className }: PageTabsProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath =
    tabs.find((t) => location.pathname.includes(t.to))?.to ?? tabs[0].to;

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop tabs */}
      <nav className="hidden sm:flex border-b border-border gap-6">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                "py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground hover:border-muted"
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      {/* Mobile dropdown with Radix Select */}
      <div className="sm:hidden">
        <Select
            options={tabs.map(tab => ({ value: tab.to, label: tab.label }))}
            value={currentPath}
            onChange={(val) => navigate(val.toString())}
        />
        </div>
    </div>
  );
}
