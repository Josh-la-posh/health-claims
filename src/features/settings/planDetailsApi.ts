import { api } from '../../lib/axios';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../lib/queryClient';
import type { PlanDetailPayload } from '../../types/enrollee';

export interface PlanDetailRecord {
  planTypeId: string;
  memberTypeId: string;
  amount: number;
  discount: number;
  referralNumber?: string;
  benefits?: string;
  billingFrequency: string;
  id: string;
  isActive: boolean;
  planType?: { name: string; description?: string };
  memberType?: { name: string; description?: string };
  createdDate: string;
}

interface PlanDetailsListEnvelope { data: PlanDetailRecord[]; message?: string; isSuccess: boolean; }
interface PlanDetailEnvelope { data: PlanDetailRecord; message?: string; isSuccess: boolean; }

export function fetchPlanDetails(){
  return api.get<PlanDetailsListEnvelope>('/settings/plan-details').then(r => r.data);
}
export function createPlanDetailApi(payload: PlanDetailPayload){
  return api.post<PlanDetailEnvelope>('/settings/plan-detail', payload).then(r => r.data);
}
export function updatePlanDetailApi(id: string, payload: PlanDetailPayload & { id: string }){
  return api.put<PlanDetailEnvelope>(`/settings/plan-detail/${id}`, payload).then(r => r.data);
}
export function activatePlanDetail(id: string){
  return api.put<PlanDetailEnvelope>(`/settings/plan-detail/${id}/activate`, {}).then(r => r.data);
}
export function deactivatePlanDetail(id: string){
  return api.put<PlanDetailEnvelope>(`/settings/plan-detail/${id}/deactivate`, {}).then(r => r.data);
}

export function usePlanDetails(){
  return useQuery({ queryKey: ['plan-details'], queryFn: async ()=> (await fetchPlanDetails()).data });
}
export function useCreatePlanDetail(){
  return useMutation({ mutationFn: createPlanDetailApi, onSuccess: ()=> { queryClient.invalidateQueries({ queryKey:['plan-details'] }); } });
}
export function useUpdatePlanDetail(){
  return useMutation({ mutationFn: (payload: PlanDetailPayload & { id: string })=> updatePlanDetailApi(payload.id, payload), onSuccess: ()=> { queryClient.invalidateQueries({ queryKey:['plan-details'] }); } });
}
export function useActivatePlanDetail(){
  return useMutation({ mutationFn: (id: string)=> activatePlanDetail(id), onSuccess: ()=> { queryClient.invalidateQueries({ queryKey:['plan-details'] }); } });
}
export function useDeactivatePlanDetail(){
  return useMutation({ mutationFn: (id: string)=> deactivatePlanDetail(id), onSuccess: ()=> { queryClient.invalidateQueries({ queryKey:['plan-details'] }); } });
}
