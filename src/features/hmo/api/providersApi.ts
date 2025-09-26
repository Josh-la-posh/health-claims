import { api } from '../../../lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ProviderContact {
  name: string;
  designation: string;
  email: string;
  phoneNumber: string;
}

export interface ProviderRecord {
  hospitalName: string;
  email: string;
  hospitalAdress: string;
  phoneNumber: string;
  bankName: string;
  accountNumber: string;
  bankCode: string;
  accountName: string;
  accountType: string;
  bankVeririfationNumber: string;
  stateLicenseNumber: string;
  licenseExpiryDate: string;
  geoLocation: string;
  contacts: ProviderContact[];
  id: string;
  hmoId: string;
  isActive: boolean;
  createdDate: string;
}

export interface ProvidersListResponse {
  data: ProviderRecord[];
  message: string;
  isSuccess: boolean;
}

export interface ProvidersQueryParams {
  PageNumber: number;
  PageSize: number;
}

export function fetchProviders(params: ProvidersQueryParams){
  return api.get<ProvidersListResponse>('/providers', { params }).then(r => r.data);
}

export function useProviders(params: ProvidersQueryParams){
  return useQuery({
    queryKey: ['providers', params],
    queryFn: () => fetchProviders(params),
    placeholderData: (prev) => prev,
  });
}

// Export providers report (date range optional). Response shape may differ; assume array of rows.
export interface ProviderReportRow {
  hospitalName: string;
  hospitalAdress: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
  licenseExpiryDate: string;
  createdDate: string;
}

export async function fetchProviderReports(params: { startDate?: string; endDate?: string; }) {
  const { data } = await api.get<ProviderReportRow[]>('/reports/providers', { params });
  return data;
}

// Banks resource -----------------------------------------------------------
export interface BankRecord {
  id: number;
  code: string;
  name: string;
}

interface BanksEnvelope {
  data: BankRecord[]
  message: string;
  isSuccess: boolean;
}

export function fetchBanks(){
  return api.get<BanksEnvelope>('/resources/banks').then(r => r.data.data);
}

export function useBanks(){
  return useQuery({ queryKey: ['banks'], queryFn: fetchBanks });
}

// Single provider ---------------------------------------------------------
export interface ProviderEnvelope { data: ProviderRecord; message: string; isSuccess: boolean; }
export async function fetchProvider(id: string){
  const { data } = await api.get<ProviderEnvelope>(`/providers/${id}`);
  return data.data;
}
export function useProvider(id?: string){
  return useQuery({ queryKey: ['provider', id], queryFn: ()=> fetchProvider(id as string), enabled: !!id });
}

// Activate / Deactivate ---------------------------------------------------
interface ProviderActionEnvelope { data: ProviderRecord; message: string; isSuccess: boolean; }
async function activateProvider(id: string){
  const { data } = await api.put<ProviderActionEnvelope>(`/providers/${id}/activate`, {});
  return data;
}
async function deactivateProvider(id: string){
  const { data } = await api.put<ProviderActionEnvelope>(`/providers/${id}/deactivate`, {});
  return data;
}
export function useActivateProvider(){
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string)=> activateProvider(id), onSuccess: (res)=> { qc.setQueryData(['provider', res.data.id], res.data); qc.invalidateQueries({ queryKey:['providers'] }); } });
}
export function useDeactivateProvider(){
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string)=> deactivateProvider(id), onSuccess: (res)=> { qc.setQueryData(['provider', res.data.id], res.data); qc.invalidateQueries({ queryKey:['providers'] }); } });
}

// Create Provider ----------------------------------------------------------
export interface CreateProviderRequest {
  hospitalName: string;
  email: string;
  hospitalAdress: string;
  phoneNumber: string;
  bankName: string;
  accountNumber: string;
  bankCode: string;
  accountName: string;
  accountType: string;
  bankVeririfationNumber: string;
  stateLicenseNumber: string;
  licenseExpiryDate: string;
  geoLocation: string;
  contacts: ProviderContact[];
}

interface CreateProviderResponseEnvelope {
  data: ProviderRecord;
  message: string;
  isSuccess: boolean;
}

export function createProvider(payload: CreateProviderRequest){
  return api.post<CreateProviderResponseEnvelope>('/providers', payload).then(r => r.data);
}

export function useCreateProvider(){
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProvider,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['providers'] });
    }
  });
}