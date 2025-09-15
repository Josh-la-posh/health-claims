import BrandBootstrapper from "../../features/brand/BrandBootstapper";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <BrandBootstrapper />
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-border bg-card">
          {/* SidebarNav (logo, nav items, collapse button) */}
        </aside>
        <main className="flex min-h-screen flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-2">
            {/* Breadcrumbs, Search, ThemeToggle, UserMenu */}
          </header>
          <div className="flex-1 p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
