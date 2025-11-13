import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 1000 * 60 * 30,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  }
});

export const persister = typeof window !== 'undefined'
  ? createSyncStoragePersister({ storage: window.localStorage })
  : undefined;

let persistenceInitialized = false;

export const ensureQueryClientPersistence = () => {
  if (persistenceInitialized || !persister) {
    return;
  }

  persistenceInitialized = true;

  void persistQueryClient({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 6,
    hydrateOptions: {
      defaultOptions: {
        queries: {
          structuralSharing: true
        }
      }
    }
  });
};
