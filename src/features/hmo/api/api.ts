// HMO API stubs – replace with real implementations
import { api } from '../../../lib/axios';
import type { ApiEnvelope } from '../../../types/auth';

export interface HmoEnrolleeSummary { id: string; name: string; status: string; }
export interface HmoProviderSummary { id: string; name: string; active: boolean; }
export interface ProviderListItem { id: string; hospitalName: string; isActive: boolean; }

export async function fetchHmoEnrollees(): Promise<ApiEnvelope<HmoEnrolleeSummary[]>> {
  const { data } = await api.get('/hmo/enrollees');
  return data;
}

export async function fetchHmoProviders(): Promise<ApiEnvelope<HmoProviderSummary[]>> {
  const { data } = await api.get('/hmo/providers');
  return data;
}

// Raw providers list for dropdown (HMO selecting provider context)
export async function fetchProvidersForSelection(): Promise<ApiEnvelope<ProviderListItem[]>> {
  const { data } = await api.get('/providers');
  return data;
}
