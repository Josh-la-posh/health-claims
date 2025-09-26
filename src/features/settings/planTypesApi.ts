import { api } from '../../lib/axios';

export type PlanType = {
  id: string;
  name: string;
  description: string;
  hmoId: string;
  isActive: boolean;
  createdDate: string;
};

export type PlanTypeListResponse = {
  data: PlanType[];
  message: string;
  isSuccess: boolean;
};

export type PlanTypeSingleResponse = {
  data: PlanType;
  message: string;
  isSuccess: boolean;
};

export type CreatePlanTypePayload = { name: string; description: string };
export type UpdatePlanTypePayload = { id: string; name: string; description: string };

export async function fetchPlanTypes(params: { pageNumber?: number; pageSize?: number } = {}){
  const search = new URLSearchParams();
  if(params.pageNumber !== undefined) search.set('PageNumber', String(params.pageNumber));
  if(params.pageSize !== undefined) search.set('PageSize', String(params.pageSize));
  const qs = search.toString();
  const { data } = await api.get<PlanTypeListResponse>(`/settings/plan-types${qs ? `?${qs}` : ''}`);
  return data;
}

export async function createPlanType(payload: CreatePlanTypePayload){
  const { data } = await api.post<PlanTypeSingleResponse>('/settings/plan-types', payload);
  return data;
}

export async function updatePlanType(payload: UpdatePlanTypePayload){
  const { id, name, description } = payload;
  const { data } = await api.put<PlanTypeSingleResponse>(`/settings/plan-types/${id}`, { id, name, description });
  return data;
}

export async function activatePlanType(id: string){
  const { data } = await api.put<PlanTypeSingleResponse>(`/settings/plan-types/${id}/activate`);
  return data;
}

export async function deactivatePlanType(id: string){
  const { data } = await api.put<PlanTypeSingleResponse>(`/settings/plan-types/${id}/deactivate`);
  return data;
}
