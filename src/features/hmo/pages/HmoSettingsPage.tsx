import { PageTabs } from '../../../components/system/PageTabs';
import { Outlet, useLocation, Navigate } from 'react-router-dom';

const hmoSettingsTabs = [
  { to: '/hmo/settings/general', label: 'General Settings' },
  { to: '/hmo/settings/enrollee-type', label: 'Enrollee Type' },
  { to: '/hmo/settings/enrollee-class', label: 'Enrollee Class' },
  { to: '/hmo/settings/plan-management', label: 'Plan Management' },
  { to: '/hmo/settings/role-manager', label: 'Role Manager' },
  { to: '/hmo/settings/role-permission', label: 'Role Permission' },
  { to: '/hmo/settings/role-access', label: 'Role Access' },
];

export default function HmoSettingsPage() {
  const { pathname } = useLocation();
  const base = '/hmo/settings';
  const isBase = pathname === base || pathname === base + '/';
  return (
    <div className="min-h-full w-full bg-authBg py-6 md:py-10">
      <div className="mx-auto w-full max-w-7xl bg-bg rounded-xl border border-border shadow-sm p-4 md:p-6 space-y-6">
        <PageTabs tabs={hmoSettingsTabs} />
        {isBase ? <Navigate to={hmoSettingsTabs[0].to} replace /> : <Outlet />}
      </div>
    </div>
  );
}
