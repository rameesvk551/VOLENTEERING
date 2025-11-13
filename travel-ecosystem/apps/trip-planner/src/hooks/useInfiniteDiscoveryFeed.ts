import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { discoveryService } from '../services/discovery.service';
import type { BlogFeedItem, DiscoveryEntity, DiscoveryFilters } from '../types/discovery';

interface UseInfiniteDiscoveryFeedOptions {
  query: string;
  type: 'attractions' | 'blogs';
  filters?: DiscoveryFilters;
  enabled?: boolean;
  pageSize?: number;
}

export const DEFAULT_PAGE_SIZE = 24;

export const useInfiniteDiscoveryFeed = <T extends DiscoveryEntity | BlogFeedItem>(
  options: UseInfiniteDiscoveryFeedOptions
) => {
  const {
    query,
    type,
    filters,
    enabled = true,
    pageSize = DEFAULT_PAGE_SIZE
  } = options;

  const queryClient = useQueryClient();

  const queryKey = ['discovery-feed', type, query, filters] as const;

  const infiniteQuery = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => {
      const cursor = typeof pageParam === 'string' ? pageParam : null;

      return discoveryService.fetchDiscoveryFeed<T>({
        query,
        type,
        cursor,
        limit: pageSize,
        filters: filters as Record<string, unknown> | undefined
      });
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(query) && enabled,
    staleTime: 30_000,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    throwOnError: true,
    structuralSharing: true
  });

  const items = useMemo(() => {
    if (!infiniteQuery.data?.pages) {
      return [] as T[];
    }

    return infiniteQuery.data.pages.flatMap((page) => page.items as T[]);
  }, [infiniteQuery.data]);

  const nextCursor = useMemo(() => {
    const pages = infiniteQuery.data?.pages;
    if (!pages || pages.length === 0) {
      return null;
    }
    return pages[pages.length - 1]?.nextCursor ?? null;
  }, [infiniteQuery.data]);

  useEffect(() => {
    if (!enabled || !query || !nextCursor) {
      return;
    }

    discoveryService
      .prefetchDiscoveryFeed({
        query,
        cursor: nextCursor,
        type
      })
      .catch(() => {
        /* non-blocking warm-up */
      });
  }, [enabled, query, nextCursor, type]);

  const isEmpty = useMemo(() => items.length === 0, [items.length]);

  const reset = () => {
    queryClient.removeQueries({ queryKey });
  };

  return {
    ...infiniteQuery,
    items,
    isEmpty,
    nextCursor,
    reset
  };
};
