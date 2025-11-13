import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VirtuosoGrid, VirtuosoGridHandle } from 'react-virtuoso';
import { motion } from 'framer-motion';
import { Compass, Filter, MapPin, Mountain, Sparkles } from 'lucide-react';
import { useInfiniteDiscoveryFeed } from '../../hooks/useInfiniteDiscoveryFeed';
import type { DiscoveryEntity, DiscoveryFilters } from '../../types/discovery';
import { ResultCard } from './ResultCard';
import { SkeletonList } from './SkeletonList';

interface VirtualizedAttractionFeedProps {
  query: string;
  onSelect?: (result: DiscoveryEntity) => void;
  filters?: DiscoveryFilters;
}

const filterTabs = [
  { id: 'all', label: 'All experiences' },
  { id: 'popular', label: 'Top rated' },
  { id: 'outdoors', label: 'Outdoors' },
  { id: 'culture', label: 'Culture & heritage' },
  { id: 'family', label: 'Family friendly' }
] as const;

type FilterTab = (typeof filterTabs)[number]['id'];

const filterPredicate: Record<FilterTab, (entity: DiscoveryEntity) => boolean> = {
  all: () => true,
  popular: (entity) => (entity.metadata.popularity ?? 0) >= 4,
  outdoors: (entity) => entity.metadata.tags?.some((tag) => /park|nature|outdoor/i.test(tag)) ?? false,
  culture: (entity) => entity.metadata.tags?.some((tag) => /museum|cultural|historic/i.test(tag)) ?? false,
  family: (entity) => entity.metadata.tags?.some((tag) => /family|kids|zoo/i.test(tag)) ?? false
};

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
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [showHeaderShadow, setShowHeaderShadow] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!virtuosoRef.current) return;
    virtuosoRef.current.scrollToIndex({ index: 0, behavior: 'smooth' });
  }, [query]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const onScroll = () => {
      if (scroller instanceof HTMLElement) {
        setShowHeaderShadow(scroller.scrollTop > 12);
      } else {
        setShowHeaderShadow((window.scrollY || document.documentElement.scrollTop) > 12);
      }
    };

  scroller.addEventListener('scroll', onScroll, { passive: true } as AddEventListenerOptions);
    return () => scroller.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const scroller = scrollerRef.current;
    if (!sentinel || !scroller) return;

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

  const filteredItems = useMemo(() => {
    const predicate = filterPredicate[activeFilter];
    return items.filter(predicate);
  }, [items, activeFilter]);

  const header = (
    <motion.div
      initial={false}
      animate={{
        boxShadow: showHeaderShadow ? '0 6px 16px rgba(15, 23, 42, 0.08)' : '0 0 0 rgba(0,0,0,0)'
      }}
      transition={{ duration: 0.2 }}
      className={`sticky top-0 z-30 flex flex-col gap-4 border-b border-gray-100 bg-white/85 px-2 pb-4 pt-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/85 ${
        isRefreshing || isRefetching ? 'animate-bounce-subtle' : ''
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          <Filter className="h-4 w-4" /> Filters
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Compass className="h-4 w-4 text-indigo-500" aria-hidden="true" />
          <span>{filteredItems.length} curated ideas</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 px-2">
        {filterTabs.map((tab) => {
          const isActive = tab.id === activeFilter;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? 'border-indigo-500/70 bg-indigo-500/10 text-indigo-600 dark:border-indigo-400/70 dark:text-indigo-300'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
              }`}
              aria-pressed={isActive}
            >
              {tab.id === 'popular' && <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />}
              {tab.id === 'outdoors' && <Mountain className="h-3.5 w-3.5" aria-hidden="true" />}
              {tab.id === 'family' && <MapPin className="h-3.5 w-3.5" aria-hidden="true" />}
              {tab.label}
            </button>
          );
        })}
      </div>
    </motion.div>
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
            Try adjusting your filters or explore nearby destinations to unlock more ideas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
        >
          Reset filters
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <VirtuosoGrid
        ref={virtuosoRef}
        style={{ height: '100%', minHeight: '70vh' }}
        scrollerRef={(ref) => {
          scrollerRef.current = ref ?? null;
        }}
        data={filteredItems}
        overscan={400}
        useWindowScroll={false}
        components={{
          Header: () => header,
          Footer: () => (
            <div className="flex flex-col items-center gap-4 px-4 pb-10 pt-6">
              <div ref={sentinelRef} className="h-2 w-full" aria-hidden="true" />
              {isFetchingNextPage && (
                <SkeletonList variant="grid" count={3} className="w-full" />
              )}
              {!hasNextPage && filteredItems.length > 0 && (
                <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300">
                  <Sparkles className="h-4 w-4 text-amber-400" aria-hidden="true" />
                  <span>End of list — more journeys coming soon</span>
                </div>
              )}
            </div>
          )
        }}
        itemClassName="px-2 py-3"
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
