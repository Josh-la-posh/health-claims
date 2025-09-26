import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { getNav, type NavNode } from "./navConfig";
import { useAuthStore } from "../../store/auth";

// navItems now supplied dynamically by tenant context (HMO vs Provider)

export function SidebarNav({
  onClose,
  collapsible = false,
}: {
  onClose?: () => void;
  collapsible?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore(s => s.user);
  const isProvider = !!user?.isProvider;
  const navItems = getNav(isProvider);
  const loc = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Initialize open groups respecting defaultOpen and current route
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    navItems.forEach(node => {
      if (node.children) {
        const activeChild = node.children.some(c => c.href && loc.pathname.startsWith(c.href));
        initial[node.label] = activeChild || !!node.defaultOpen;
      }
    });
    setOpenGroups(prev => ({ ...initial, ...prev }));
  }, [loc.pathname, navItems]);

  const toggleGroup = useCallback((label: string) => {
    setOpenGroups(o => {
      const next = { ...o, [label]: !o[label] };
      localStorage.setItem("sidebar:groups", JSON.stringify(next));
      return next;
    });
  }, []);

  // Hydrate saved group state
  useEffect(() => {
    const saved = localStorage.getItem("sidebar:groups");
    if (saved) {
      try { setOpenGroups(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // Restore collapse state
  useEffect(() => {
    const saved = localStorage.getItem("sidebar:collapsed");
    if (saved) setCollapsed(saved === "true");
  }, []);

  const toggleCollapse = () => {
    const newVal = !collapsed;
    setCollapsed(newVal);
    localStorage.setItem("sidebar:collapsed", String(newVal));
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand + Collapse Button */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <span className="text-lg font-bold text-primary truncate">
            Health Claims
          </span>
        )}
        {collapsible && (
          <button
            onClick={toggleCollapse}
            className="p-1 text-muted-foreground hover:text-primary transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {navItems.map((node) => (
          <NavNodeItem
            key={node.label}
            node={node}
            collapsed={collapsed}
            onClose={onClose}
            open={!!openGroups[node.label]}
            toggleGroup={toggleGroup}
          />
        ))}
      </nav>
    </div>
  );
}

interface NavNodeItemProps {
  node: NavNode;
  collapsed: boolean;
  onClose?: () => void;
  open: boolean;
  toggleGroup: (label: string) => void;
}

function NavNodeItem({ node, collapsed, onClose, open, toggleGroup }: NavNodeItemProps) {
  const loc = useLocation();
  const hasChildren = !!node.children?.length;
  const childActive = hasChildren && node.children!.some(c => c.href && loc.pathname === c.href);
  const content = hasChildren ? (
    <button
      type="button"
      onClick={() => toggleGroup(node.label)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md",
        "hover:bg-primary/10 transition-colors",
        childActive ? "text-primary" : "text-muted-foreground",
        collapsed && "justify-center px-2"
      )}
      aria-current={childActive ? 'page' : undefined}
    >
      {node.icon && <node.icon className="h-5 w-5 shrink-0" />}
      {!collapsed && <span className="truncate flex-1 text-left">{node.label}</span>}
      {!collapsed && (open ? <ChevronUp className="h-4 w-4 opacity-70" /> : <ChevronDown className="h-4 w-4 opacity-70" />)}
    </button>
  ) : (
    <NavLink
      to={node.href || '#'}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md",
          "hover:bg-primary/10 transition-colors",
          isActive ? "bg-primary/20 text-primary" : "text-muted-foreground",
          collapsed && "justify-center px-2"
        )
      }
      onClick={onClose}
    >
      {node.icon && <node.icon className="h-5 w-5 shrink-0" />}
      {!collapsed && <span className="truncate">{node.label}</span>}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>{content}</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              className="rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-md"
            >
              {node.label}
              <Tooltip.Arrow className="fill-gray-800" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  }

  return (
    <div>
      {content}
      {hasChildren && open && (
        <div className="ml-4 mt-1 flex flex-col border-l border-border">{/* children */}
          {node.children!.map(child => (
            <NavLink
              key={child.href}
              to={child.href || '#'}
              className={({ isActive }) =>
                cn(
                  "pl-4 pr-3 py-1.5 text-sm rounded-r-md border-l-2",
                  isActive ? "text-primary border-primary bg-primary/5" : "text-muted-foreground border-transparent hover:bg-primary/5"
                )
              }
              onClick={onClose}
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
