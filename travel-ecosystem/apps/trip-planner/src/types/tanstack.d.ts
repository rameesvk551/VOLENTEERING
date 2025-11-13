declare module '@tanstack/query-sync-storage-persister' {
  interface SyncStoragePersisterOptions {
    storage: Storage;
    key?: string;
    throttleTime?: number;
  }

  export function createSyncStoragePersister(options: SyncStoragePersisterOptions): unknown;
}

declare module '@tanstack/react-query-persist-client' {
  import type { QueryClient, DehydrateOptions, HydrateOptions } from '@tanstack/react-query';

  interface PersistQueryClientOptions {
    queryClient: QueryClient;
    persister: unknown;
    maxAge?: number;
    hydrateOptions?: HydrateOptions;
    dehydrateOptions?: DehydrateOptions;
  }

  export function persistQueryClient(options: PersistQueryClientOptions): Promise<void> | void;
}
