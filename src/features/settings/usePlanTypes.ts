import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../lib/queryClient';
import { toast } from 'sonner';
import { fetchPlanTypes, createPlanType, updatePlanType, activatePlanType, deactivatePlanType, type CreatePlanTypePayload, type UpdatePlanTypePayload, type PlanType } from './planTypesApi';

export function usePlanTypes(pageNumber: number, pageSize: number){
  return useQuery({
    queryKey: ['plan-types', pageNumber, pageSize],
    queryFn: async () => {
      const res = await fetchPlanTypes({ pageNumber, pageSize });
      return res.data as PlanType[];
    }
  });
}

export function useCreatePlanType(){
  return useMutation({
    mutationFn: (payload: CreatePlanTypePayload) => createPlanType(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Plan type created');
      queryClient.invalidateQueries({ queryKey: ['plan-types'] });
    }
  });
}

export function useUpdatePlanType(){
  return useMutation({
    mutationFn: (payload: UpdatePlanTypePayload) => updatePlanType(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Plan type updated');
      queryClient.invalidateQueries({ queryKey: ['plan-types'] });
    }
  });
}

export function useActivatePlanType(){
  return useMutation({
    mutationFn: (id: string) => activatePlanType(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Plan type activated');
      queryClient.invalidateQueries({ queryKey: ['plan-types'] });
    }
  });
}

export function useDeactivatePlanType(){
  return useMutation({
    mutationFn: (id: string) => deactivatePlanType(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Plan type deactivated');
      queryClient.invalidateQueries({ queryKey: ['plan-types'] });
    }
  });
}
