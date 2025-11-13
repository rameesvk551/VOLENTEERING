import React, { Suspense, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { SkeletonList } from './SkeletonList';
import { ErrorFallback } from './ErrorFallback';
import { BackToTopButton } from './BackToTopButton';
import { SummarySection } from './SummarySection';
import { SimpleErrorBoundary } from './SimpleErrorBoundary.tsx';
import type { DiscoveryEntity, DiscoveryFilters, Summary } from '../../types/discovery';

const VirtualizedAttractionFeed = React.lazy(() =>
  import('./VirtualizedAttractionFeed').then((mod) => ({ default: mod.VirtualizedAttractionFeed }))
);

const VirtualizedBlogFeed = React.lazy(() =>
  import('./VirtualizedBlogFeed').then((mod) => ({ default: mod.VirtualizedBlogFeed }))
);

interface ResultsGridProps {
  query: string;
  summary?: Summary | null;
  filters?: DiscoveryFilters;
  onResultSelect?: (result: DiscoveryEntity) => void;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({
  query,
  summary,
  filters,
  onResultSelect
}) => {
  const queryClient = useQueryClient();

  const stableFilters = useMemo(() => {
    if (!filters) return undefined;
    return JSON.parse(JSON.stringify(filters)) as DiscoveryFilters;
  }, [filters]);

  if (!query) {
    return null;
  }

  const invalidateFeed = (type: 'attractions' | 'blogs') => {
    queryClient.invalidateQueries({ queryKey: ['discovery-feed', type, query, stableFilters] });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="results-grid-container relative mt-6 sm:mt-8"
    >
 
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(260px,1fr)]">
        <SimpleErrorBoundary
          onReset={() => invalidateFeed('attractions')}
          fallback={(error: Error, reset: () => void) => (
            <ErrorFallback
              error={error}
              title="We couldn't load new attractions"
              onRetry={reset}
            />
          )}
        >
          <Suspense
            fallback={
              <div className="rounded-3xl border border-gray-200 bg-white/80 p-6 dark:border-gray-800 dark:bg-gray-900/70">
                <SkeletonList variant="grid" count={9} />
              </div>
            }
          >
            <div className="rounded-3xl border border-gray-100 bg-white/70 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
              <VirtualizedAttractionFeed
                query={query}
                filters={stableFilters}
                onSelect={onResultSelect}
              />
            </div>
          </Suspense>
  </SimpleErrorBoundary>

        <div className="space-y-4">
          <SimpleErrorBoundary
            onReset={() => invalidateFeed('blogs')}
            fallback={(error: Error, reset: () => void) => (
              <ErrorFallback
                error={error}
                title="We couldn't load related stories"
                onRetry={reset}
              />
            )}
          >
            <Suspense
              fallback={
                <div className="rounded-3xl border border-gray-200 bg-white/80 p-4 dark:border-gray-800 dark:bg-gray-900/70">
                  <SkeletonList variant="list" count={4} />
                </div>
              }
            >
              <div className="rounded-3xl border border-gray-100 bg-white/70 p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900/70">
                <VirtualizedBlogFeed query={query} filters={stableFilters} />
              </div>
            </Suspense>
          </SimpleErrorBoundary>
        </div>
      </div>

      <BackToTopButton />
    </motion.section>
  );
};
