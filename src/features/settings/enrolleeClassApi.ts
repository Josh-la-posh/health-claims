import { api } from '../../lib/axios';

export type EnrolleeClass = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdDate: string;
};

export type EnrolleeClassListResponse = {
  data: EnrolleeClass[];
  message: string;
  isSuccess: boolean;
};

export type EnrolleeClassSingleResponse = {
  data: EnrolleeClass;
  message: string;
  isSuccess: boolean;
};

export type CreateEnrolleeClassPayload = { name: string; description: string };
export type UpdateEnrolleeClassPayload = { id: string; name: string; description: string };

export async function fetchEnrolleeClasses(){
  const { data } = await api.get<EnrolleeClassListResponse>('/settings/enrollee-class');
  return data;
}

export async function createEnrolleeClass(payload: CreateEnrolleeClassPayload){
  const { data } = await api.post<EnrolleeClassSingleResponse>('/settings/enrollee-class', payload);
  return data;
}

export async function updateEnrolleeClass(payload: UpdateEnrolleeClassPayload){
  const { id, name, description } = payload;
  const { data } = await api.put<EnrolleeClassSingleResponse>(`/settings/enrollee-class/${id}`, { id, name, description });
  return data;
}

export async function activateEnrolleeClass(id: string){
  const { data } = await api.put<EnrolleeClassSingleResponse>(`/settings/enrollee-class/${id}/activate`);
  return data;
}

export async function deactivateEnrolleeClass(id: string){
  const { data } = await api.put<EnrolleeClassSingleResponse>(`/settings/enrollee-class/${id}/deactivate`);
  return data;
}
