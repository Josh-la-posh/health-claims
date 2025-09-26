// Basic RBAC scaffolding. Expand as backend enumerates permissions.

export const Roles = {
  SUPERADMIN: "SUPERADMIN",
  PROVIDERADMIN: "PROVIDERADMIN",
  HMOADMIN: "HMOADMIN",
} as const;

export type Role = typeof Roles[keyof typeof Roles];

// Permission keys (string unions help with autocomplete)
export const Permissions = {
  VIEW_HMO_DASHBOARD: "view:hmo.dashboard",
  VIEW_PROVIDER_DASHBOARD: "view:provider.dashboard",
  MANAGE_CLAIMS: "manage:claims",
  MANAGE_ENROLLEES: "manage:enrollees",
  VIEW_REPORTS: "view:reports",
  MANAGE_TARIFF: "manage:tariff",
  MANAGE_PAYMENT: "manage:payment",
  VIEW_PROVIDERS: "view:providers",
} as const;

export type Permission = typeof Permissions[keyof typeof Permissions];

// Map roles to granted permissions (coarse defaults; refine later)
export const rolePermissions: Record<Role, Permission[]> = {
  SUPERADMIN: [
    Permissions.VIEW_HMO_DASHBOARD,
    Permissions.VIEW_PROVIDER_DASHBOARD,
    Permissions.MANAGE_CLAIMS,
    Permissions.MANAGE_ENROLLEES,
    Permissions.VIEW_REPORTS,
    Permissions.MANAGE_TARIFF,
    Permissions.MANAGE_PAYMENT,
    Permissions.VIEW_PROVIDERS,
  ],
  PROVIDERADMIN: [
    Permissions.VIEW_PROVIDER_DASHBOARD,
    Permissions.MANAGE_CLAIMS,
    Permissions.MANAGE_ENROLLEES,
    Permissions.MANAGE_TARIFF,
  ],
  HMOADMIN: [
    Permissions.VIEW_HMO_DASHBOARD,
    Permissions.VIEW_REPORTS,
    Permissions.MANAGE_PAYMENT,
    Permissions.VIEW_PROVIDERS,
    Permissions.MANAGE_ENROLLEES,
  ],
};

export function derivePermissions(role?: string | null): Permission[] {
  if (!role) return [];
  const key = role.toUpperCase() as Role;
  return rolePermissions[key] || [];
}
