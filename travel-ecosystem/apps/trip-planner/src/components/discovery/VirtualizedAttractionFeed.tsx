import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VirtuosoGrid, VirtuosoGridHandle } from 'react-virtuoso';
import { Compass, RefreshCcw } from 'lucide-react';
import { useInfiniteDiscoveryFeed } from '../../hooks/useInfiniteDiscoveryFeed';
import type { DiscoveryEntity, DiscoveryFilters } from '../../types/discovery';
import { ResultCard } from './ResultCard';
import { SkeletonList } from './SkeletonList';

interface VirtualizedAttractionFeedProps {
  query: string;
  onSelect?: (result: DiscoveryEntity) => void;
  filters?: DiscoveryFilters;
}

const MemoResultCard = React.memo(ResultCard);

export const VirtualizedAttractionFeed: React.FC<VirtualizedAttractionFeedProps> = ({
  query,
  filters,
  onSelect
}) => {
  const {
    items,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isFetching,
    isEmpty,
    status
  } = useInfiniteDiscoveryFeed<DiscoveryEntity>({
    query,
    type: 'attractions',
    filters,
    enabled: Boolean(query)
  });

  const virtuosoRef = useRef<VirtuosoGridHandle | null>(null);
  const scrollerRef = useRef<HTMLElement | Window | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!virtuosoRef.current) return;
    virtuosoRef.current.scrollToIndex({ index: 0, behavior: 'smooth' });
  }, [query]);

  useEffect(() => {
  const sentinel = sentinelRef.current;
  const scroller = scrollerRef.current;
  if (!sentinel) return;

  const root = scroller instanceof HTMLElement ? scroller : null;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root,
        threshold: 0.1,
        rootMargin: '640px 0px 0px 0px'
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    try {
      setIsRefreshing(true);
      await refetch();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  }, [isRefreshing, refetch]);

  const filterChips = useMemo(() => {
    if (!filters) {
      return [] as string[];
    }

    const chips: string[] = [];

    if (filters.month) {
      chips.push(`Month: ${capitalize(filters.month)}`);
    }

    if (filters.duration) {
      chips.push(`Duration: ${filters.duration} day${filters.duration > 1 ? 's' : ''}`);
    }

    const interests = filters.interests;
    if (interests && interests.length) {
      chips.push(...interests.map((interest) => `Interest: ${interest}`));
    }

    if (filters.fromCountryCode) {
      chips.push(`From: ${filters.fromCountryCode.toUpperCase()}`);
    }

    return chips;
  }, [filters]);

  const header = (
    <div className="sticky top-0 z-30 border-b border-gray-100 bg-white px-3 py-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {items.length} attractions
          </p>
          {filterChips.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {filterChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">Showing the best matches for your search.</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing || isRefetching}
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300"
        >
          <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  if (status === 'pending') {
    return <SkeletonList variant="grid" count={9} className="w-full" />;
  }

  if (!isFetching && isEmpty) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-gray-200 bg-white/60 p-12 text-center dark:border-gray-700 dark:bg-gray-900/60">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 dark:bg-indigo-900/40">
          <Compass className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">No adventures yet</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Try adjusting your search filters to unlock more ideas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <VirtuosoGrid
        ref={virtuosoRef}
        style={{ minHeight: '70vh' }}
        scrollerRef={(ref) => {
          scrollerRef.current = ref ?? (typeof window !== 'undefined' ? window : null);
        }}
        data={items}
        overscan={400}
        useWindowScroll
        components={{
          Header: () => header,
          Footer: () => (
            <div className="flex flex-col items-center gap-4 px-4 pb-10 pt-6">
              <div ref={sentinelRef} className="h-2 w-full" aria-hidden="true" />
              {isFetchingNextPage && (
                <SkeletonList variant="grid" count={3} className="w-full" />
              )}
              {!hasNextPage && items.length > 0 && (
                <div className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300">
                  End of list — more journeys coming soon
                </div>
              )}
            </div>
          )
        }}
        itemClassName=""
        listClassName="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
        itemContent={(index, entity) => (
          <MemoResultCard
            key={entity.id}
            result={entity}
            index={index}
            onSelect={() => onSelect?.(entity)}
          />
        )}
        startReached={handleRefresh}
      />
    </div>
  );
};

const capitalize = (value: string) => {
  if (!value) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
};
