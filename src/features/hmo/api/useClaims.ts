import { useQuery } from '@tanstack/react-query';
import { fetchClaims } from './dashboardApi';
import type { ClaimsQueryParams, ClaimsListResponse } from './dashboardApi';

export function useClaimsList(params: ClaimsQueryParams) {
  return useQuery<ClaimsListResponse>({
    queryKey: ['claims', params],
    queryFn: () => fetchClaims(params),
    placeholderData: (prev) => prev, // retain previous page briefly during fetch
  });
}
