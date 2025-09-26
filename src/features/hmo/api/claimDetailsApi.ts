import { api } from '../../../lib/axios';
import type { ClaimRecord } from './dashboardApi';
import { useQuery } from '@tanstack/react-query';

export interface ClaimDetailsResponse {
  data: ClaimRecord | null;
  message: string;
  isSuccess: boolean;
}

export function fetchClaimDetails(id: string){
  return api.get<ClaimDetailsResponse>(`/claims/${id}`).then(r => r.data);
}

export function useClaimDetails(id?: string){
  return useQuery({
    queryKey: ['claim-details', id],
    queryFn: () => {
      if(!id) return Promise.resolve({ data: null, message: 'No id', isSuccess: false });
      return fetchClaimDetails(id);
    },
    enabled: !!id,
  });
}
