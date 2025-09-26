import { useQuery } from '@tanstack/react-query';
import { fetchProvidersForSelection } from '../features/hmo/api/api';
import { fetchHmosForSelection } from '../features/provider/api/api';
import { useAuthStore } from '../store/auth';
import { useTenantSelection } from '../store/tenant';
import { useEffect } from 'react';

export function useProviderOptions(enabled = true) {
  const isProvider = useAuthStore(s => s.user?.isProvider);
  const { selectedProviderId, setProvider } = useTenantSelection();
  const query = useQuery({
    queryKey: ['provider-selection','providers'],
    queryFn: async () => {
      const res = await fetchProvidersForSelection();
      return res.data;
    },
    enabled: enabled && !isProvider,
    // staleTime: 5 * 60 * 1000,
  });
  useEffect(() => {
    if (!isProvider && query.data && query.data.length > 0) {
      const exists = query.data.some(p => p.id === selectedProviderId);
      if (!selectedProviderId || !exists) {
        setProvider(query.data[0].id);
      }
    }
  }, [query.data, selectedProviderId, setProvider, isProvider]);
  return query;
}

export function useHmoOptions(enabled = true) {
  const isProvider = useAuthStore(s => s.user?.isProvider);
  const { selectedHmoId, setHmo } = useTenantSelection();
  const query = useQuery({
    queryKey: ['provider-selection','hmos'],
    queryFn: async () => {
      const res = await fetchHmosForSelection();
      return res.data;
    },
    enabled: enabled && !!isProvider,
    staleTime: 5 * 60 * 1000,
  });
  useEffect(() => {
    if (isProvider && query.data && query.data.length > 0) {
      const exists = query.data.some(h => h.id === selectedHmoId);
      if (!selectedHmoId || !exists) {
        setHmo(query.data[0].id);
      }
    }
  }, [query.data, selectedHmoId, setHmo, isProvider]);
  return query;
}
