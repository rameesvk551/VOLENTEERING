import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
  title?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry, title }) => {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-200/60 bg-red-50/60 p-8 text-center dark:border-red-900/60 dark:bg-red-900/20"
    >
      <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        <h3 className="text-lg font-semibold">{title ?? 'Something went wrong'}</h3>
      </div>
      <p className="max-w-md text-sm text-red-600/80 dark:text-red-200/80">
        {error.message || 'Unable to load fresh travel ideas right now. Please try again.'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        >
          <RefreshCcw className="h-4 w-4" aria-hidden="true" />
          Retry
        </button>
      )}
    </motion.div>
  );
};
