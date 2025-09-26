import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchHmos,
  fetchHmo,
  createHmo,
  updateHmo,
  activateHmo,
  deactivateHmo,
  type CreateHmoPayload,
  type UpdateHmoPayload,
  type HmoEntity
} from './hmoManagementApi';

const HMO_LIST_KEY = 'hmos';

export function useHmos(page: number, pageSize: number){
  return useQuery({
    queryKey: [HMO_LIST_KEY, page, pageSize],
    queryFn: async () => {
      const res = await fetchHmos(page, pageSize);
      return res;
    }
  });
}

export function useHmo(id: string | undefined){
  return useQuery({
    queryKey: ['hmo', id],
    enabled: !!id,
    queryFn: async () => {
      if(!id) throw new Error('Missing id');
      return fetchHmo(id);
    }
  });
}

export function useCreateHmo(page: number, pageSize: number){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHmoPayload) => createHmo(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [HMO_LIST_KEY] });
      qc.invalidateQueries({ queryKey: [HMO_LIST_KEY, page, pageSize] });
    }
  });
}

export function useUpdateHmo(page: number, pageSize: number){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateHmoPayload) => updateHmo(payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: [HMO_LIST_KEY] });
      qc.invalidateQueries({ queryKey: [HMO_LIST_KEY, page, pageSize] });
      if(res?.data?.id){
        qc.invalidateQueries({ queryKey: ['hmo', res.data.id] });
      }
    }
  });
}

export function useActivateHmo(page: number, pageSize: number){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activateHmo(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: [HMO_LIST_KEY] });
      qc.invalidateQueries({ queryKey: [HMO_LIST_KEY, page, pageSize] });
      if(res?.data?.id){
        qc.invalidateQueries({ queryKey: ['hmo', res.data.id] });
      }
    }
  });
}

export function useDeactivateHmo(page: number, pageSize: number){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateHmo(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: [HMO_LIST_KEY] });
      qc.invalidateQueries({ queryKey: [HMO_LIST_KEY, page, pageSize] });
      if(res?.data?.id){
        qc.invalidateQueries({ queryKey: ['hmo', res.data.id] });
      }
    }
  });
}

// Utility for composing table rows if needed later
export type { HmoEntity };