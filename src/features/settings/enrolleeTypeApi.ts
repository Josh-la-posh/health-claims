import { api } from '../../lib/axios';

export type EnrolleeType = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdDate: string;
};

export type EnrolleeTypeListResponse = {
  data: EnrolleeType[];
  message: string;
  isSuccess: boolean;
};

export type EnrolleeTypeSingleResponse = {
  data: EnrolleeType;
  message: string;
  isSuccess: boolean;
};

export type CreateEnrolleeTypePayload = {
  name: string;
  description: string;
};

export async function createEnrolleeType(payload: CreateEnrolleeTypePayload){
  const { data } = await api.post<EnrolleeTypeSingleResponse>('/settings/enrollee-type', payload);
  return data;
}

export async function fetchEnrolleeTypes(){
  const { data } = await api.get<EnrolleeTypeListResponse>('/settings/enrollee-type');
  return data;
}

export async function activateEnrolleeType(id: string){
  const { data } = await api.put<EnrolleeTypeSingleResponse>(`/settings/enrollee-type/${id}/activate`);
  return data;
}

export async function deactivateEnrolleeType(id: string){
  const { data } = await api.put<EnrolleeTypeSingleResponse>(`/settings/enrollee-type/${id}/deactivate`);
  return data;
}

export type UpdateEnrolleeTypePayload = { id: string; name: string; description: string };

export async function updateEnrolleeType(payload: UpdateEnrolleeTypePayload){
  const { id, name, description } = payload;
  const { data } = await api.put<EnrolleeTypeSingleResponse>(`/settings/enrollee-type/${id}`, { id, name, description });
  return data;
}
