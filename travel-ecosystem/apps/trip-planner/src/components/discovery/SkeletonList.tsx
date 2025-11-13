import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface SkeletonListProps {
  variant: 'grid' | 'list';
  count?: number;
  className?: string;
}

const shimmerCardStyles =
  'relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 skeleton-shimmer border border-gray-200/60 dark:border-gray-700/60';

export const SkeletonList: React.FC<SkeletonListProps> = ({ variant, count = 6, className = '' }) => {
  const wrapperClass =
    variant === 'grid'
      ? `grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 ${className}`
      : `flex flex-col gap-4 ${className}`;

  const placeholders = Array.from({ length: count });

  return (
    <AnimatePresence>
      <motion.div
        key="skeleton-holder"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className={wrapperClass.trim()}
      >
        {placeholders.map((_, index) => (
          <motion.div
            key={`skeleton-${index}`}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.04 }}
            className={`${shimmerCardStyles} ${variant === 'list' ? 'h-28' : 'h-[260px]'}`}
          >
            {variant === 'grid' ? (
              <div className="flex flex-col h-full">
                <div className="h-40 w-full bg-gray-200/60 dark:bg-gray-700/60" />
                <div className="flex flex-col gap-3 p-4">
                  <div className="h-5 w-3/4 rounded bg-gray-200/70 dark:bg-gray-700/70" />
                  <div className="h-4 w-full rounded bg-gray-200/60 dark:bg-gray-700/60" />
                  <div className="h-4 w-5/6 rounded bg-gray-200/60 dark:bg-gray-700/60" />
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="h-6 w-20 rounded bg-gray-200/70 dark:bg-gray-700/70" />
                    <div className="h-6 w-14 rounded bg-gray-200/70 dark:bg-gray-700/70" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full gap-4 p-4">
                <div className="h-full w-28 rounded-xl bg-gray-200/60 dark:bg-gray-700/60" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200/70 dark:bg-gray-700/70" />
                  <div className="h-4 w-full rounded bg-gray-200/60 dark:bg-gray-700/60" />
                  <div className="h-4 w-5/6 rounded bg-gray-200/60 dark:bg-gray-700/60" />
                  <div className="mt-auto h-4 w-24 rounded bg-gray-200/70 dark:bg-gray-700/70" />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
