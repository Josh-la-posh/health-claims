import { QueryClient, Query } from '@tanstack/react-query';
import { persistQueryClient, type PersistedClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Key prefix kept versioned for potential future migrations
const STORAGE_KEY = 'rq-cache-v1';

export function setupQueryPersistence(queryClient: QueryClient){
  if (typeof window === 'undefined') return; // SSR safeguard

  const persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: STORAGE_KEY,
    serialize: (client: PersistedClient) => {
      return JSON.stringify(client);
    },
    deserialize: (cached: string) => {
      try {
        return JSON.parse(cached) as PersistedClient;
      } catch {
        return undefined as unknown as PersistedClient;
      }
    }
  });

  persistQueryClient({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
    dehydrateOptions: {
      shouldDehydrateQuery: (q: Query) => {
        if(q.state.status !== 'success') return false;
        const key0 = q.queryKey[0];
        // Persist core management datasets to avoid refetch unless mutated
        const PERSIST_KEYS = [
          'hmos','hmo',
          'enrollee-types','enrollee-classes',
          'plan-types',
          'roles','role-permissions',
          'users', // role access/users listing if present
        ];
        return PERSIST_KEYS.includes(key0 as string);
      }
    }
  });
}
