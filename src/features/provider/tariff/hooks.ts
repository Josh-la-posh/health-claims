import { useQuery } from '@tanstack/react-query';
import { listTariffs } from './api';

export function useTariffs(providerId: string | null, hmoId: string | null, pageNumber: number, pageSize: number) {
  return useQuery({
    queryKey: ['tariffs', providerId, hmoId, pageNumber, pageSize],
    queryFn: () => {
      if(!providerId || !hmoId) throw new Error('Missing provider or HMO context');
      return listTariffs(providerId, hmoId, pageNumber, pageSize);
    },
    enabled: !!providerId && !!hmoId,
    staleTime: 60_000,
  });
}
