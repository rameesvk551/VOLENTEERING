import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { motion } from 'framer-motion';
import { BookOpenCheck, RefreshCcw, Sparkles } from 'lucide-react';
import { useInfiniteDiscoveryFeed } from '../../hooks/useInfiniteDiscoveryFeed';
import type { BlogFeedItem, DiscoveryFilters } from '../../types/discovery';
import { BlogCard } from './BlogCard';
import { SkeletonList } from './SkeletonList';

interface VirtualizedBlogFeedProps {
  query: string;
  filters?: DiscoveryFilters;
}

const MemoBlogCard = React.memo(BlogCard);

export const VirtualizedBlogFeed: React.FC<VirtualizedBlogFeedProps> = ({ query, filters }) => {
  const {
    items,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isEmpty,
    status
  } = useInfiniteDiscoveryFeed<BlogFeedItem>({
    query,
    type: 'blogs',
    filters,
    enabled: Boolean(query),
    pageSize: 12
  });

  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  const scrollerRef = useRef<HTMLElement | Window | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [headerShadow, setHeaderShadow] = useState(false);
  const [refreshHint, setRefreshHint] = useState(false);

  useEffect(() => {
    if (!virtuosoRef.current) return;
    virtuosoRef.current.scrollToIndex({ index: 0, behavior: 'smooth' });
  }, [query]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const scroller = scrollerRef.current instanceof HTMLElement ? scrollerRef.current : window;

    const handleScroll = () => {
      if (scroller instanceof HTMLElement) {
        setHeaderShadow(scroller.scrollTop > 10);
      } else {
        setHeaderShadow((window.scrollY || document.documentElement.scrollTop) > 10);
      }
    };

    scroller.addEventListener('scroll', handleScroll, { passive: true } as AddEventListenerOptions);
    return () => scroller.removeEventListener('scroll', handleScroll);
  }, []);

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
        threshold: 0.15,
        rootMargin: '520px 0px 0px 0px'
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleRefresh = useCallback(async () => {
    if (refreshHint) return;
    try {
      setRefreshHint(true);
      await refetch();
    } finally {
      setTimeout(() => setRefreshHint(false), 500);
    }
  }, [refetch, refreshHint]);

  const header = (
    <motion.div
      initial={false}
      animate={{ boxShadow: headerShadow ? '0 4px 12px rgba(15,23,42,0.08)' : '0 0 0 rgba(0,0,0,0)' }}
      className={`sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-gray-200 bg-white/85 px-4 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70 ${
        (isRefetching || refreshHint) ? 'animate-bounce-subtle' : ''
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
        <BookOpenCheck className="h-5 w-5 text-indigo-500" aria-hidden="true" />
        Insider travel stories
      </div>
      <button
        type="button"
        onClick={handleRefresh}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-500 transition hover:border-gray-300 hover:text-gray-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
      >
        <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
        Refresh
      </button>
    </motion.div>
  );

  if (status === 'pending') {
    return <SkeletonList variant="list" count={6} className="w-full" />;
  }

  if (!query || (isEmpty && !isRefetching)) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-white/60 p-8 text-center dark:border-gray-700 dark:bg-gray-900/60">
        <BookOpenCheck className="h-12 w-12 text-indigo-400" aria-hidden="true" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Start exploring to unlock curated travel stories and tips for your journey.
        </p>
      </div>
    );
  }

  const blogItems = useMemo(() => items, [items]);

  return (
    <div className="relative">
      <Virtuoso
        ref={virtuosoRef}
        style={{ minHeight: '70vh' }}
        data={blogItems}
        scrollerRef={(ref) => {
          scrollerRef.current = ref ?? (typeof window !== 'undefined' ? window : null);
        }}
        useWindowScroll
        components={{
          Header: () => header,
          Footer: () => (
            <div className="flex flex-col items-center gap-4 px-4 pb-6 pt-4">
              <div ref={sentinelRef} className="h-2 w-full" aria-hidden="true" />
              {isFetchingNextPage && <SkeletonList variant="list" count={3} className="w-full" />}
              {!hasNextPage && blogItems.length > 0 && (
                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300">
                  <Sparkles className="h-4 w-4 text-amber-400" aria-hidden="true" />
                  <span>End of stories — check back soon</span>
                </div>
              )}
            </div>
          )
        }}
        itemContent={(index, blog) => (
          <motion.div
            key={blog.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.01 }}
            className="px-3 py-2"
          >
            <MemoBlogCard
              title={blog.title}
              description={blog.description}
              imageUrl={blog.imageUrl}
              href={blog.href}
            />
          </motion.div>
        )}
        startReached={handleRefresh}
      />
    </div>
  );
};
