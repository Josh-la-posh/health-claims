import { create } from "zustand";
type RBAC = { permissions: string[] };
export const useRbac = create<RBAC>(() => ({ permissions: [] }));
export function useCan() {
  const perms = useRbac(s => s.permissions);
  return (p: string) => perms.includes(p);
}
