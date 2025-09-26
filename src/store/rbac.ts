import { create } from "zustand";
import { derivePermissions } from "./permissions";
import type { Permission } from "./permissions";

type RBACState = { permissions: Permission[] };
type RBACActions = { setPermissions: (perms: Permission[]) => void; clear: () => void };

export const useRbac = create<RBACState & RBACActions>((set) => ({
  permissions: [],
  setPermissions: (perms) => set({ permissions: perms }),
  clear: () => set({ permissions: [] }),
}));

export function useCan() {
  const perms = useRbac(s => s.permissions);
  return (p: Permission) => perms.includes(p);
}

// Helper to initialize permissions on session creation
export function initPermissionsFromRole(role?: string | null) {
  const derived = derivePermissions(role || null);
  useRbac.getState().setPermissions(derived);
}
