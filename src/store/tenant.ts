import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TenantSelectionState {
  selectedProviderId: string | null;
  selectedHmoId: string | null;
  setProvider: (id: string | null) => void;
  setHmo: (id: string | null) => void;
  clear: () => void;
}

export const useTenantSelection = create<TenantSelectionState>()(
  persist(
    (set) => ({
      selectedProviderId: null,
      selectedHmoId: null,
      setProvider: (id) => set({ selectedProviderId: id }),
      setHmo: (id) => set({ selectedHmoId: id }),
      clear: () => set({ selectedProviderId: null, selectedHmoId: null }),
    }),
    { name: "tenant-selection" }
  )
);
