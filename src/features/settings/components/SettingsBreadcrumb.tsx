import { Link, useLocation } from "react-router-dom";

const routeToGroup: Record<string, string> = {
  profile: "Account",
  security: "Account",
  branding: "Organization",
  webhooks: "Organization",
  users: "Organization",
  billing: "Billing & Compliance",
  "audit-logs": "Billing & Compliance",
};

const labelMap: Record<string, string> = {
  profile: "Profile",
  security: "Security",
  branding: "Branding",
  webhooks: "Webhooks",
  users: "Users",
  billing: "Billing",
  "audit-logs": "Audit Logs",
};

const groupToRoute: Record<string, string> = {
  Account: "/settings/profile",
  Organization: "/settings/branding",
  "Billing & Compliance": "/settings/billing",
};

export default function SettingsBreadcrumb() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean); // ["settings", "users"]

  if (parts[0] !== "settings") return null;

  const section = parts[1]; // e.g. "users"
  const group = routeToGroup[section];
  const label = labelMap[section] ?? section;

  return (
    <nav className="text-sm text-muted mb-4">
      {/* Always link back to Settings root */}
      <Link to="/settings" className="hover:underline">
        Settings
      </Link>

      {group && (
        <>
          {" / "}
          <Link to={groupToRoute[group]} className="hover:underline">
            {group}
          </Link>
        </>
      )}

      {section && (
        <>
          {" / "}
          <span className="text-foreground font-medium">{label}</span>
        </>
      )}
    </nav>
  );
}
