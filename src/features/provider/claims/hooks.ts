import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClaims, fetchClaimById, createSingleClaim, uploadBatchClaim } from './api';
import type { CreateSingleClaimRequest, CreateBatchClaimParams, ClaimItem } from './types';

const KEYS = {
  list: (p: { providerId: string; hmoId: string; startDate?: string; endDate?: string; claimStatus?: string }) => ['claims', 'list', p] as const,
  detail: (id: string) => ['claims', 'detail', id] as const,
};

export function useClaims(params: { providerId: string; hmoId: string; startDate?: string; endDate?: string; claimStatus?: string }) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => fetchClaims({ ...params }),
    select: (r) => r.data,
  });
}

export function useClaim(id?: string) {
  return useQuery({
    queryKey: KEYS.detail(id || ''),
    queryFn: () => fetchClaimById(id!),
    enabled: !!id,
    select: (r) => r.data,
  });
}

export function useCreateSingleClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSingleClaimRequest) => createSingleClaim(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claims', 'list'] });
    }
  });
}

export function useUploadBatchClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateBatchClaimParams) => uploadBatchClaim(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['claims', 'list'] });
    }
  });
}

export function aggregateTotalAmount(items: ClaimItem[]): number {
  return items.reduce((sum, i) => sum + (i.amount || 0), 0);
}
