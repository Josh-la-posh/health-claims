// src/features/settings/SettingsLayout.tsx
import { Outlet, useLocation } from "react-router-dom";
import SettingsBreadcrumb from "./components/SettingsBreadcrumb";
import { PageTabs } from "../../components/system/PageTabs";
import { useAuthStore } from "../../store/auth";

export default function SettingsLayout() {
  const { user } = useAuthStore();
  const { pathname } = useLocation();

  const groups = [
    {
      label: "Account",
      tabs: [
        { to: "/settings/profile", label: "Profile" },
        { to: "/settings/security", label: "Security" },
      ],
    },
    {
      label: "Organization",
      tabs: [
        { to: "/settings/branding", label: "Branding" },
        { to: "/settings/webhooks", label: "Webhooks" },
        ...(user?.role === "Admin"
          ? [{ to: "/settings/users", label: "Users" }]
          : []),
      ],
    },
    {
      label: "Billing & Compliance",
      tabs: [
        { to: "/settings/billing", label: "Billing" },
        { to: "/settings/audit-logs", label: "Audit Logs" },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-4">
        <SettingsBreadcrumb />

        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <h4 className="text-xs font-semibold uppercase text-muted mb-2">
                {group.label}
              </h4>
              <PageTabs tabs={group.tabs} currentPath={pathname} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
