import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes cache
            gcTime: 1000 * 60 * 60 * 24, // 24 hours garbage collection (for persistence)
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

// Persist cache to localStorage for offline support
const localStoragePersister = createSyncStoragePersister({
    storage: window.localStorage,
    key: 'bazzar-query-cache',
    throttleTime: 1000,
});

persistQueryClient({
    queryClient,
    persister: localStoragePersister,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours max cache age
    buster: '1.0.0', // bump to invalidate cache on new releases
});
