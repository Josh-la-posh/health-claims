import { api } from '../../../lib/axios';
import type { ClaimListResponse, ClaimDetailResponse, CreateSingleClaimRequest, CreateBatchClaimParams } from './types';

// Fetch all claims
export async function fetchClaims(params: {
  providerId: string;
  hmoId: string;
  startDate?: string;
  endDate?: string;
  claimStatus?: string;
  isExcel?: boolean;
}): Promise<ClaimListResponse> {
  const res = await api.get('/claims/all-claims', { params });
  return res.data;
}

// Fetch claim detail by id
export async function fetchClaimById(id: string): Promise<ClaimDetailResponse> {
  const res = await api.get('/claims', { params: { id } });
  return res.data;
}

// Create single claim
export async function createSingleClaim(body: CreateSingleClaimRequest) {
  const res = await api.post('/claims/create-and-submit-claims', body);
  return res.data;
}

// Upload batch claim (multipart)
export async function uploadBatchClaim(params: CreateBatchClaimParams) {
  const form = new FormData();
  form.append('ClaimFile', params.file);
  // Query params: HMOId, ClaimDate, ClaimName, ProviderId
  const query = {
    HMOId: params.hmoId,
    ClaimDate: params.claimDate,
    ClaimName: params.claimName,
    ProviderId: params.providerId,
  };
  const res = await api.post('/claims/upload-and-submit-claims', form, {
    params: query,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
