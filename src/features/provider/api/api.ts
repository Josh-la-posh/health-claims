// Provider API stubs – replace with real implementations
import { api } from '../../../lib/axios';
import type { ApiEnvelope } from '../../../types/auth';

export interface ProviderClaimSummary { id: string; reference: string; amount: number; status: string; }
export interface ProviderEnrolleeSummary { id: string; name: string; plan: string; }
export interface HmoListItem { id: string; name: string; isActive: boolean; code?: string; }

export async function fetchProviderClaims(): Promise<ApiEnvelope<ProviderClaimSummary[]>> {
  const { data } = await api.get('/provider/claims');
  return data;
}

export async function fetchProviderEnrollees(): Promise<ApiEnvelope<ProviderEnrolleeSummary[]>> {
  const { data } = await api.get('/provider/enrollees');
  return data;
}

// List HMOs for provider user to switch context
export async function fetchHmosForSelection(): Promise<ApiEnvelope<HmoListItem[]>> {
  const { data } = await api.get('/hmos');
  return data;
}
