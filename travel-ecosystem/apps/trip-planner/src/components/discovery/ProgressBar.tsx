import React from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';

interface ProgressBarProps {
  scope?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ scope = 'discovery-feed' }) => {
  const pending = useIsFetching({
    predicate: (query) => {
      const [key] = query.queryKey as unknown[];
      return key === scope;
    }
  });

  return (
    <AnimatePresence>
      {pending > 0 && (
        <motion.div
          key="progress-bar"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-x-0 top-0 z-40 mx-auto flex max-w-5xl justify-center px-3"
          role="status"
          aria-live="polite"
        >
          <motion.div
            className="h-1 w-full overflow-hidden rounded-full bg-gray-200/70 dark:bg-gray-700/60"
          >
            <motion.span
              className="block h-full w-1/2 rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
