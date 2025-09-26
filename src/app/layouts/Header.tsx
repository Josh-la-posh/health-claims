import { useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Menu } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { useAuthStore } from "../../store/auth";
import { useTenantSelection } from "../../store/tenant";
import { useProviderOptions, useHmoOptions } from "../../hooks/useTenantSelectionData";
import { DropdownSelect } from "../../components/ui/dropdown-select";

const staticRouteTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/merchants": "Merchants",
  "/transactions": "Transactions",
  "/settings": "Settings",
};

function deriveTitle(pathname: string): string {
  // Direct match first
  if (staticRouteTitles[pathname]) return staticRouteTitles[pathname];

  // Normalize (strip query/hash)
  const path = pathname.split('?')[0].split('#')[0];
  const segments = path.split('/').filter(Boolean); // removes empty
  if (!segments.length) return 'PelPay';

  // Enrollee related grouping: any /hmo/enrollees/*
  if (segments[0] === 'hmo' && segments[1] === 'enrollees') {
    if (segments.includes('register')) return 'Enrollee Registration';
    // Could be list or detail or nested step
    if (segments.length === 2) return 'Enrollees';
    return 'Enrollee';
  }

  // Providers grouping
  if (segments[0] === 'hmo' && segments[1] === 'providers') {
    if (segments.includes('register')) return 'Provider Registration';
    if (segments.length === 2) return 'Providers';
    return 'Provider';
  }

  // Settings subsections (e.g., /hmo/settings/plan-management)
  if (segments[0] === 'hmo' && segments[1] === 'settings') {
    if (segments.length === 2) return 'Settings';
    const last = segments[segments.length - 1];
    return humanize(last) + ' Settings';
  }

  // HMO management area
  if (segments[0] === 'hmo' && segments[1] === 'management') {
    return 'HMO Management';
  }

  // Provider app root pages
  if (segments[0] === 'provider') {
    if (segments[1] === 'dashboard') return 'Dashboard';
    if (segments[1] === 'claims') return segments.length > 2 ? 'Claim Detail' : 'Claims';
    if (segments[1] === 'enrollees') return 'Enrollees';
    if (segments[1] === 'tariff') return 'Tariff';
    if (segments[1] === 'settings') return 'Settings';
  }

  // Fallback: humanize last non-empty segment
  const last = segments[segments.length - 1];
  return humanize(last);
}

function humanize(slug: string): string {
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { pathname } = useLocation();
  const title = deriveTitle(pathname);
  const user = useAuthStore(s => s.user);
  const isProvider = !!user?.isProvider;
  const { selectedProviderId, selectedHmoId, setProvider, setHmo } = useTenantSelection();
  const providersQuery = useProviderOptions();
  const hmosQuery = useHmoOptions();

  const providerOptions = (providersQuery.data || []).map(p => ({ label: p.hospitalName, value: p.id }));
  const hmoOptions = (hmosQuery.data || []).map(h => ({ label: h.name, value: h.id }));

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="md"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-base lg:text-lg font-semibold">{title}</h1>
        </div>

      <div className="flex items-center gap-3">
        {/* Future: notifications */}
        {(!isProvider) && (
          <div className="w-48">
            <DropdownSelect
              placeholder="Select Provider"
              value={selectedProviderId || undefined}
              onChange={(v) => setProvider((v as string) || null)}
              options={providerOptions}
              searchable
            />
          </div>
        )}
        {(isProvider) && (
          <div className="w-48">
            <DropdownSelect
              placeholder="Select HMO"
              value={selectedHmoId || undefined}
              onChange={(v) => setHmo((v as string) || null)}
              options={hmoOptions}
              searchable
            />
          </div>
        )}
          <UserMenu />
        </div>
    </header>
  );
}
