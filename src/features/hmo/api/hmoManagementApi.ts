import { api } from '../../../lib/axios';

// Core HMO entity as returned by management endpoints
export interface HmoEntity {
  id: string;
  name: string;
  code: string;
  adminFirstName: string;
  adminLastName: string;
  adminPhoneNumber: string;
  adminEmail: string;
  postalAddress: string;
  addressLine1: string;
  addressLine2: string;
  createdDate: string;
  organisationType: 'Individual' | 'Corporate' | string; // backend may expand
  isActive: boolean;
}

export interface PagedHmoResponse {
  data: HmoEntity[];
  message: string;
  isSuccess: boolean;
}

export interface SingleHmoResponse {
  data: HmoEntity;
  message: string;
  isSuccess: boolean;
}

export interface CreateHmoPayload {
  adminFirstName: string;
  adminLastName: string;
  name: string;
  code: string;
  adminPhoneNumber: string;
  adminEmail: string;
  postalAddress: string;
  addressLine1: string;
  addressLine2: string;
}

export interface UpdateHmoPayload extends CreateHmoPayload {
  id: string;
  isActive: boolean;
  paymentGateWayId?: string;
  testApiKey?: string;
  useLiveKey?: boolean;
  liveApiKey?: string;
  organisationType: string; // keep flexible
}

export async function fetchHmos(page: number, pageSize: number){
  const params = new URLSearchParams();
  params.set('PageNumber', String(page));
  params.set('PageSize', String(pageSize));
  const { data } = await api.get<PagedHmoResponse>(`/hmos?${params.toString()}`);
  return data;
}

export async function fetchHmo(id: string){
  const { data } = await api.get<SingleHmoResponse>(`/hmos/${id}`);
  return data;
}

export async function createHmo(payload: CreateHmoPayload){
  const { data } = await api.post<SingleHmoResponse>('/hmos', payload);
  return data;
}

export async function updateHmo(payload: UpdateHmoPayload){
  const { id, ...rest } = payload;
  const { data } = await api.put<SingleHmoResponse>(`/hmos/${id}`, { id, ...rest });
  return data;
}

export async function activateHmo(id: string){
  const { data } = await api.put<SingleHmoResponse>(`/hmos/${id}/activate`, {});
  return data;
}

export async function deactivateHmo(id: string){
  // NOTE: backend spelled 'deativate' per spec; keep until confirmed
  const { data } = await api.put<SingleHmoResponse>(`/hmos/${id}/deativate`, {});
  return data;
}

// Future: deleteHmo, attachPaymentGateway, rotateKeys, etc.